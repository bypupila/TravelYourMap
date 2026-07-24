import { sql } from "@/lib/neon";
import { planIncludesSponsors } from "@/lib/plans";

export interface ActiveSubscription {
  status: "active" | "trialing";
  current_period_end: string | null;
  plan_slug: string | null;
  plan_name: string | null;
}

export async function getActiveSubscriptionForUser(userId: string): Promise<ActiveSubscription | null> {
  const rows = await sql<ActiveSubscription[]>`
    select
      s.status::text as status,
      s.current_period_end,
      p.slug as plan_slug,
      p.name as plan_name
    from public.subscriptions s
    left join public.subscription_plans p on p.id = s.plan_id
    where s.user_id = ${userId}
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
    order by s.updated_at desc
    limit 1
  `;

  return rows[0] || null;
}

export const SPONSOR_UPGRADE_REQUIRED = {
  error: "Creator Pro is required to use Sponsors.",
  code: "sponsor_plan_upgrade_required",
  required_plan: "creator_pro",
} as const;

export async function getSponsorEntitlementForUser(userId: string) {
  const subscription = await getActiveSubscriptionForUser(userId);
  return {
    allowed: Boolean(subscription && planIncludesSponsors(subscription.plan_slug || subscription.plan_name)),
    subscription,
  };
}
