import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCreatorActivity, requireCreatorChannelAccess } from "@/lib/creator-admin-actions";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { isDemoChannelId } from "@/lib/demo-data";
import { enforceActorRateLimit } from "@/lib/request-rate-limit";
import { requireSponsorEntitlement } from "@/lib/sponsor-entitlement";
import {
  SPONSOR_REPORT_CADENCES,
  createSponsorReportSchedule,
  listSponsorReportSchedules,
  sponsorBelongsToChannel,
} from "@/lib/sponsor-reports";

export const dynamic = "force-dynamic";

const createScheduleSchema = z.object({
  channelId: z.string().uuid(),
  sponsorId: z.string().uuid(),
  cadence: z.enum(SPONSOR_REPORT_CADENCES).default("monthly"),
  periodDays: z.number().int().min(7).max(365).default(30),
  recipientEmail: z.string().trim().email().max(180),
  nextRunAt: z.string().datetime().optional().or(z.string().date()).nullable(),
});

export async function GET(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const channelId = new URL(request.url).searchParams.get("channelId") || "";
    if (!z.string().uuid().safeParse(channelId).success) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const access = await requireCreatorChannelAccess(channelId, sessionUser.id);
    if (!access?.ownerUserId) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });
    const entitlementDenial = await requireSponsorEntitlement(access.ownerUserId);
    if (entitlementDenial) return entitlementDenial;

    const schedules = await listSponsorReportSchedules(channelId);
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("[api/sponsors/reports/schedules GET]", error);
    return NextResponse.json({ error: "Could not load sponsor report schedules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = createScheduleSchema.parse(await request.json());
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
      scope: "creator:sponsor-report-schedule-create",
      actorKey: `${sessionUser.id}:${payload.channelId}`,
      windowMinutes: 24 * 60,
      maxAttempts: 20,
      failClosed: process.env.NODE_ENV === "production",
    });
    if (!quota.allowed) {
      return NextResponse.json({ error: "Demasiadas programaciones creadas. Reintenta más tarde." }, { status: 429 });
    }

    const scheduleId = await createSponsorReportSchedule({
      channelId: payload.channelId,
      sponsorId: payload.sponsorId,
      createdByUserId: sessionUser.id,
      cadence: payload.cadence,
      periodDays: payload.periodDays,
      recipientEmail: payload.recipientEmail,
      nextRunAt: payload.nextRunAt,
    });
    if (!scheduleId) return NextResponse.json({ error: "Could not create sponsor report schedule" }, { status: 400 });

    await recordCreatorActivity({
      channelId: payload.channelId,
      actorUserId: sessionUser.id,
      eventType: "sponsor_report_schedule_created",
      entityType: "sponsor",
      entityId: payload.sponsorId,
      description: `${sessionUser.username} programo reportes de sponsor`,
      metadata: { schedule_id: scheduleId, cadence: payload.cadence, period_days: payload.periodDays },
    });

    const schedules = await listSponsorReportSchedules(payload.channelId);
    return NextResponse.json({ ok: true, schedules });
  } catch (error) {
    console.error("[api/sponsors/reports/schedules POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid sponsor report schedule payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create sponsor report schedule" },
      { status: 400 }
    );
  }
}
