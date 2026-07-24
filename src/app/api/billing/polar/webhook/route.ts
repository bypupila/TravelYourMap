import { NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { reportOperationalError } from "@/lib/observability";
import { sql } from "@/lib/neon";
import { getPostHogClient } from "@/lib/posthog-server";
import { getPolarServer } from "@/lib/polar";

export const runtime = "nodejs";

interface PolarSubscriptionWebhookData {
  id: string;
  status: string;
  modified_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  customer_id?: string | null;
  product_id?: string | null;
  customer?: {
    id?: string;
    external_id?: string | null;
    email?: string | null;
  } | null;
  product?: {
    id?: string;
  } | null;
  metadata?: Record<string, unknown> | null;
}

const POLAR_SUBSCRIPTION_STATUSES = new Set([
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

function resolveWebhookSecret() {
  let rawSecret = String(process.env.POLAR_WEBHOOK_SECRET || "").trim();
  if (
    (rawSecret.startsWith('"') && rawSecret.endsWith('"')) ||
    (rawSecret.startsWith("'") && rawSecret.endsWith("'"))
  ) {
    rawSecret = rawSecret.slice(1, -1).trim();
  }
  if (!rawSecret) return "";
  if (rawSecret.startsWith("polar_whs_")) {
    return `whsec_${rawSecret.slice("polar_whs_".length)}`;
  }
  return rawSecret;
}

async function resolvePlanIdByProductId(productId: string | null | undefined) {
  if (!productId) return null;
  const rows = await sql<Array<{ id: string; polar_product_id: string }>>`
    select id, polar_product_id
    from public.subscription_plans
    where polar_product_id = ${productId}
      and is_active = true
    limit 1
  `;
  return rows[0] || null;
}

async function resolveUserId(payload: PolarSubscriptionWebhookData) {
  const externalUserId =
    (typeof payload.customer?.external_id === "string" && payload.customer.external_id) ||
    (typeof payload.metadata?.user_id === "string" && payload.metadata.user_id) ||
    null;
  if (!externalUserId) return null;
  const rows = await sql<Array<{ id: string }>>`
    select id
    from public.users
    where id::text = ${externalUserId}
    limit 1
  `;
  return rows[0]?.id || null;
}

function resolvePolarTimestamp(payload: PolarSubscriptionWebhookData, eventTimestamp: string) {
  const candidate = String(payload.modified_at || eventTimestamp || "").trim();
  const timestamp = new Date(candidate);
  if (!candidate || !Number.isFinite(timestamp.getTime())) return null;
  return timestamp.toISOString();
}

async function upsertSubscription(input: {
  payload: PolarSubscriptionWebhookData;
  webhookId: string;
  eventType: string;
  eventTimestamp: string;
}) {
  const { payload } = input;
  const status = String(payload.status || "").trim();
  if (!POLAR_SUBSCRIPTION_STATUSES.has(status)) {
    console.warn("[polar webhook] ignored unknown subscription status", { subscriptionId: payload.id, status });
    return { applied: false, reason: "unknown_status" } as const;
  }

  const userId = await resolveUserId(payload);
  if (!userId) {
    console.warn("[polar webhook] missing user id", payload.id);
    return { applied: false, reason: "unknown_user" } as const;
  }

  const productId = payload.product?.id || payload.product_id || null;
  const plan = await resolvePlanIdByProductId(productId);
  if (!plan) {
    console.warn("[polar webhook] ignored product outside the active TravelYourMap catalog", {
      subscriptionId: payload.id,
      productId,
    });
    return { applied: false, reason: "unknown_product" } as const;
  }

  const polarModifiedAt = resolvePolarTimestamp(payload, input.eventTimestamp);
  if (!polarModifiedAt) {
    console.warn("[polar webhook] ignored event without a valid modification timestamp", payload.id);
    return { applied: false, reason: "invalid_timestamp" } as const;
  }

  const polarServer = getPolarServer();
  const metadata = {
    ...(payload.metadata || {}),
    travel_polar_server: polarServer,
    travel_product_id: productId,
  };
  const rows = await sql<Array<{ id: string }>>`
    with accepted_event as (
      insert into public.polar_webhook_events (
        webhook_id,
        event_type,
        polar_object_id,
        polar_modified_at,
        polar_server
      )
      values (
        ${input.webhookId},
        ${input.eventType},
        ${payload.id},
        ${polarModifiedAt},
        ${polarServer}
      )
      on conflict (webhook_id) do nothing
      returning webhook_id
    )
    insert into public.subscriptions (
      user_id,
      plan_id,
      polar_subscription_id,
      polar_customer_id,
      polar_product_id,
      polar_modified_at,
      polar_server,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      metadata,
      updated_at
    )
    select
      ${userId},
      ${plan.id},
      ${payload.id},
      ${payload.customer?.id || payload.customer_id || ""},
      ${productId},
      ${polarModifiedAt},
      ${polarServer},
      ${status},
      ${payload.current_period_start || null},
      ${payload.current_period_end || null},
      ${Boolean(payload.cancel_at_period_end)},
      ${JSON.stringify(metadata)}::jsonb,
      ${new Date().toISOString()}
    from accepted_event
    on conflict (polar_subscription_id)
    do update set
      plan_id = excluded.plan_id,
      polar_customer_id = excluded.polar_customer_id,
      polar_product_id = excluded.polar_product_id,
      polar_modified_at = excluded.polar_modified_at,
      polar_server = excluded.polar_server,
      status = excluded.status,
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      metadata = excluded.metadata,
      updated_at = excluded.updated_at
    where public.subscriptions.user_id = excluded.user_id
      and public.subscriptions.polar_server = excluded.polar_server
      and (
        public.subscriptions.polar_modified_at is null
        or excluded.polar_modified_at >= public.subscriptions.polar_modified_at
      )
    returning id::text as id
  `;

  if (!rows[0]?.id) {
    return { applied: false, reason: "duplicate_stale_or_mismatched" } as const;
  }

  if (status === "active" || status === "trialing") {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "subscription_activated",
      properties: {
        subscription_id: payload.id,
        status,
        plan_id: plan.id,
        polar_product_id: productId,
        current_period_end: payload.current_period_end || null,
      },
    });
  }
  return { applied: true, reason: "applied" } as const;
}

export async function POST(request: Request) {
  const body = await request.text();

  try {
    const webhookSecret = resolveWebhookSecret();
    if (!webhookSecret) {
      return NextResponse.json({ error: "Polar webhook is not configured" }, { status: 503 });
    }
    const webhookId = String(request.headers.get("webhook-id") || "").trim();
    if (!webhookId) {
      return NextResponse.json({ error: "Missing Polar webhook id" }, { status: 400 });
    }
    const webhook = new Webhook(webhookSecret);
    const event = webhook.verify(body, {
      "webhook-id": request.headers.get("webhook-id") || "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
      "webhook-signature": request.headers.get("webhook-signature") || "",
    }) as {
      type: string;
      timestamp: string;
      data: PolarSubscriptionWebhookData;
    };

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.canceled":
      case "subscription.revoked":
      case "subscription.uncanceled":
      case "subscription.past_due": {
        await upsertSubscription({
          payload: event.data,
          webhookId,
          eventType: event.type,
          eventTimestamp: event.timestamp,
        });
        break;
      }
      case "checkout.created":
      case "checkout.updated":
      case "order.created":
      case "order.paid":
      default:
        break;
    }

    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid Polar webhook signature" }, { status: 403 });
    }

    reportOperationalError(error, { area: "billing", operation: "polar_webhook" });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
