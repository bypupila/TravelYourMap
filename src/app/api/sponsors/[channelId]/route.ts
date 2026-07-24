import { NextResponse } from "next/server";
import { getValidSessionUserFromRequest, userIsSuperAdmin } from "@/lib/current-user";
import { getDemoSponsorByCountry, isDemoChannelId } from "@/lib/demo-data";
import { sql } from "@/lib/neon";
import { getSponsorEntitlementForUser } from "@/lib/subscription-entitlements";

interface GeoRule {
  country_code: string | null;
  priority: number | null;
}

interface SponsorRow {
  id: string;
  brand_name: string;
  logo_url: string | null;
  description: string | null;
  discount_code: string | null;
  affiliate_url: string | null;
  sponsor_geo_rules: GeoRule[] | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const countryCode = new URL(request.url).searchParams.get("country")?.toUpperCase() || null;

  try {
    if (isDemoChannelId(channelId)) {
      return NextResponse.json({ sponsor: getDemoSponsorByCountry(countryCode) });
    }

    const channels = await sql<Array<{ id: string; user_id: string; is_public: boolean; ownership_status: string }>>`
      select id, user_id, is_public, ownership_status
      from public.channels
      where id = ${channelId}
      limit 1
    `;
    const channel = channels[0] || null;
    if (!channel) {
      return NextResponse.json({ sponsor: null });
    }
    const sponsorEntitlement = await getSponsorEntitlementForUser(channel.user_id);
    if (!sponsorEntitlement.allowed) {
      return NextResponse.json({ sponsor: null });
    }
    if (!channel.is_public || channel.ownership_status !== "verified") {
      const sessionUser = await getValidSessionUserFromRequest(request);
      const canInspectPrivateChannel = Boolean(
        sessionUser &&
          (userIsSuperAdmin(sessionUser.role) ||
            (sessionUser.role === "creator" && sessionUser.id === channel.user_id))
      );
      if (!canInspectPrivateChannel) return NextResponse.json({ sponsor: null }, { status: 404 });
    }

    const data = await sql<SponsorRow[]>`
      select
        s.id,
        s.brand_name,
        s.logo_url,
        s.description,
        s.discount_code,
        s.affiliate_url,
        coalesce(
          jsonb_agg(
            jsonb_build_object(
              'country_code', sgr.country_code,
              'priority', sgr.priority
            )
          ) filter (where sgr.id is not null),
          '[]'::jsonb
        ) as sponsor_geo_rules
      from public.sponsors s
      left join public.sponsor_geo_rules sgr on sgr.sponsor_id = s.id
      where s.user_id = ${channel.user_id}
        and s.active = true
        and (s.start_date is null or s.start_date <= now())
        and (s.end_date is null or s.end_date > now())
      group by s.id
      limit 50
    `;

    if (!data?.length) {
      return NextResponse.json({ sponsor: null });
    }

    const scored = data
      .map((sponsor) => {
        const rules = Array.isArray(sponsor.sponsor_geo_rules) ? sponsor.sponsor_geo_rules : [];
        const exact = rules
          .filter((rule) => rule.country_code && rule.country_code === countryCode)
          .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0];

        const global = rules
          .filter((rule) => rule.country_code === null)
          .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0];

        const score = exact ? 200 + Number(exact.priority || 0) : global ? 100 + Number(global.priority || 0) : -1;

        return { sponsor, score };
      })
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ sponsor: scored[0]?.sponsor || null });
  } catch (error) {
    console.error("[api/sponsors/[channelId]]", error);
    return NextResponse.json({ sponsor: null });
  }
}
