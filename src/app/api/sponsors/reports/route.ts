import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCreatorActivity, requireCreatorChannelAccess } from "@/lib/creator-admin-actions";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { isDemoChannelId } from "@/lib/demo-data";
import { getTrustedAppOrigin } from "@/lib/map-urls";
import { enforceActorRateLimit } from "@/lib/request-rate-limit";
import { requireSponsorEntitlement } from "@/lib/sponsor-entitlement";
import {
  buildSponsorReportPublicUrl,
  createSponsorReportLink,
  listSponsorReportLinks,
  sponsorBelongsToChannel,
} from "@/lib/sponsor-reports";

export const dynamic = "force-dynamic";

const createReportSchema = z.object({
  channelId: z.string().uuid(),
  sponsorId: z.string().uuid(),
  periodDays: z.number().int().min(7).max(365).default(30),
});

export async function GET(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId") || "";
    if (!z.string().uuid().safeParse(channelId).success) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const access = await requireCreatorChannelAccess(channelId, sessionUser.id);
    if (!access?.ownerUserId) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });
    const entitlementDenial = await requireSponsorEntitlement(access.ownerUserId);
    if (entitlementDenial) return entitlementDenial;

    const reports = await listSponsorReportLinks(channelId);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("[api/sponsors/reports GET]", error);
    return NextResponse.json({ error: "Could not load sponsor reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = createReportSchema.parse(await request.json());
    if (isDemoChannelId(payload.channelId)) {
      return NextResponse.json({ error: "Modo demo: esta operación no persiste cambios." }, { status: 400 });
    }

    const access = await requireCreatorChannelAccess(payload.channelId, sessionUser.id);
    if (!access?.ownerUserId) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });
    const entitlementDenial = await requireSponsorEntitlement(access.ownerUserId);
    if (entitlementDenial) return entitlementDenial;
    if (!(await sponsorBelongsToChannel(payload.channelId, payload.sponsorId))) {
      return NextResponse.json({ error: "Sponsor not found for this channel" }, { status: 404 });
    }
    const quota = await enforceActorRateLimit({
      scope: "creator:sponsor-report-create",
      actorKey: `${sessionUser.id}:${payload.channelId}`,
      windowMinutes: 60,
      maxAttempts: 20,
      failClosed: process.env.NODE_ENV === "production",
    });
    if (!quota.allowed) {
      return NextResponse.json({ error: "Demasiados reportes creados. Reintenta más tarde." }, { status: 429 });
    }

    const created = await createSponsorReportLink({
      channelId: payload.channelId,
      sponsorId: payload.sponsorId,
      createdByUserId: sessionUser.id,
      periodDays: payload.periodDays,
    });
    const origin = getTrustedAppOrigin();
    const reports = await listSponsorReportLinks(payload.channelId);
    const report = reports.find((entry) => entry.id === created.id) || null;
    const publicUrl = buildSponsorReportPublicUrl(origin, created.token);

    await recordCreatorActivity({
      channelId: payload.channelId,
      actorUserId: sessionUser.id,
      eventType: "sponsor_report_created",
      entityType: "sponsor",
      entityId: payload.sponsorId,
      description: `${sessionUser.username} creo un reporte privado de sponsor`,
      metadata: { report_id: created.id, period_days: created.period_days },
    });

    return NextResponse.json({
      ok: true,
      report: report ? { ...report, public_url: publicUrl } : null,
      public_url: publicUrl,
    });
  } catch (error) {
    console.error("[api/sponsors/reports POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid sponsor report payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create sponsor report" },
      { status: 400 }
    );
  }
}
