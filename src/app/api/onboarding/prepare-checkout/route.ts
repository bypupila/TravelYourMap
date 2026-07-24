import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { sql } from "@/lib/neon";
import { PLAN_DEFINITIONS, resolveCanonicalPlanSlug } from "@/lib/plans";
import { enforceRequestRateLimit } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  selectedPlan: z.string().trim().min(2),
  channelUrl: z.string().trim().min(3).max(500).optional().nullable(),
  youtubeChannelId: z.string().trim().min(8).max(128).optional().nullable(),
  acceptTerms: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (sessionUser.role !== "creator") {
      return NextResponse.json({ error: "Este flujo solo está disponible para creadores." }, { status: 403 });
    }

    const rateLimit = await enforceRequestRateLimit({
      request,
      scope: `api:onboarding-prepare-checkout:${sessionUser.id}`,
      windowMinutes: 15,
      maxAttempts: 10,
      failClosed: true,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Reintenta en unos minutos." },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds ? { "Retry-After": String(rateLimit.retryAfterSeconds) } : undefined,
        }
      );
    }

    const payload = payloadSchema.parse(await request.json());
    const selectedPlan = resolveCanonicalPlanSlug(payload.selectedPlan);
    const plan = selectedPlan
      ? PLAN_DEFINITIONS.find((candidate) => candidate.slug === selectedPlan && candidate.available && candidate.checkoutSlug)
      : null;
    if (!plan) {
      return NextResponse.json({ error: "El plan seleccionado no está disponible." }, { status: 400 });
    }

    const channelReference = String(payload.youtubeChannelId || payload.channelUrl || "").trim();
    if (!channelReference) {
      return NextResponse.json({ error: "Revisa el canal de YouTube e inténtalo de nuevo." }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    await sql.transaction((txn) => [
      txn`
        update public.users
        set display_name = ${payload.displayName}, updated_at = ${nowIso}
        where id = ${sessionUser.id}
          and role = 'creator'
      `,
      txn`
        insert into public.onboarding_state (
          user_id,
          current_step,
          completed_steps,
          selected_plan,
          youtube_channel_id,
          accepted_terms_at,
          is_complete,
          demo_mode,
          last_seen_at,
          updated_at
        )
        values (
          ${sessionUser.id},
          'plan',
          array['welcome', 'youtube']::text[],
          ${selectedPlan},
          ${channelReference},
          ${nowIso},
          false,
          false,
          ${nowIso},
          ${nowIso}
        )
        on conflict (user_id)
        do update set
          current_step = case
            when onboarding_state.is_complete then onboarding_state.current_step
            else excluded.current_step
          end,
          completed_steps = case
            when onboarding_state.is_complete then onboarding_state.completed_steps
            else excluded.completed_steps
          end,
          selected_plan = excluded.selected_plan,
          youtube_channel_id = excluded.youtube_channel_id,
          accepted_terms_at = coalesce(onboarding_state.accepted_terms_at, excluded.accepted_terms_at),
          is_complete = onboarding_state.is_complete,
          demo_mode = false,
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
      `,
    ]);

    return NextResponse.json({ ok: true, selected_plan: selectedPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Revisa los datos del onboarding." }, { status: 400 });
    }
    console.error("[api/onboarding/prepare-checkout]", error);
    return NextResponse.json({ error: "No se pudo preparar el checkout." }, { status: 500 });
  }
}
