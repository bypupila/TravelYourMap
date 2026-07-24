import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCreatorActivity, requireCreatorChannelAccess } from "@/lib/creator-admin-actions";
import { getValidSessionUserFromRequest } from "@/lib/current-user";
import { getTrustedAppOrigin } from "@/lib/map-urls";
import { enforceActorRateLimit } from "@/lib/request-rate-limit";
import { requireSponsorEntitlement } from "@/lib/sponsor-entitlement";
import {
  SPONSOR_REPORT_CADENCES,
  listSponsorReportSchedules,
  runSponsorReportSchedule,
  setSponsorReportScheduleActive,
  sponsorReportScheduleBelongsToChannel,
  updateSponsorReportSchedule,
} from "@/lib/sponsor-reports";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    channelId: z.string().uuid(),
    cadence: z.enum(SPONSOR_REPORT_CADENCES).optional(),
    periodDays: z.number().int().min(7).max(365).optional(),
    recipientEmail: z.string().trim().email().max(180).optional(),
    nextRunAt: z.string().datetime().optional().or(z.string().date()).nullable(),
  }),
  z.object({
    action: z.literal("pause"),
    channelId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("resume"),
    channelId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("run_now"),
    channelId: z.string().uuid(),
  }),
]);

export async function PATCH(request: Request, context: { params: Promise<{ scheduleId: string }> }) {
  try {
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { scheduleId } = await context.params;
    if (!z.string().uuid().safeParse(scheduleId).success) {
      return NextResponse.json({ error: "scheduleId is invalid" }, { status: 400 });
    }

    const payload = actionSchema.parse(await request.json());
    const access = await requireCreatorChannelAccess(payload.channelId, sessionUser.id);
    if (!access?.ownerUserId) return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });
    const entitlementDenial = await requireSponsorEntitlement(access.ownerUserId);
    if (entitlementDenial) return entitlementDenial;
    if (!(await sponsorReportScheduleBelongsToChannel(payload.channelId, scheduleId))) {
      return NextResponse.json({ error: "Sponsor report schedule not found" }, { status: 404 });
    }

    let result: unknown = null;
    if (payload.action === "update") {
      const ok = await updateSponsorReportSchedule({
        channelId: payload.channelId,
        scheduleId,
        cadence: payload.cadence,
        periodDays: payload.periodDays,
        recipientEmail: payload.recipientEmail,
        nextRunAt: payload.nextRunAt,
      });
      if (!ok) return NextResponse.json({ error: "Sponsor report schedule not found" }, { status: 404 });
    }

    if (payload.action === "pause" || payload.action === "resume") {
      const ok = await setSponsorReportScheduleActive({
        channelId: payload.channelId,
        scheduleId,
        active: payload.action === "resume",
      });
      if (!ok) return NextResponse.json({ error: "Sponsor report schedule not found" }, { status: 404 });
    }

    if (payload.action === "run_now") {
      const quota = await enforceActorRateLimit({
        scope: "creator:sponsor-report-run-now",
        actorKey: `${sessionUser.id}:${payload.channelId}`,
        windowMinutes: 60,
        maxAttempts: 5,
        failClosed: process.env.NODE_ENV === "production",
      });
      if (!quota.allowed) {
        return NextResponse.json({ error: "Demasiados envíos manuales. Reintenta más tarde." }, { status: 429 });
      }
      result = await runSponsorReportSchedule({
        channelId: payload.channelId,
        scheduleId,
        origin: getTrustedAppOrigin(),
      });
      if (!result) return NextResponse.json({ error: "Sponsor report schedule not found" }, { status: 404 });
    }

    await recordCreatorActivity({
      channelId: payload.channelId,
      actorUserId: sessionUser.id,
      eventType: `sponsor_report_schedule_${payload.action}`,
      entityType: "sponsor",
      entityId: scheduleId,
      description: `${sessionUser.username} actualizo una programacion de reporte`,
      metadata: { action: payload.action },
    });

    const schedules = await listSponsorReportSchedules(payload.channelId);
    return NextResponse.json({ ok: true, result, schedules });
  } catch (error) {
    console.error("[api/sponsors/reports/schedules/[scheduleId] PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid sponsor report schedule action", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update sponsor report schedule" },
      { status: 400 }
    );
  }
}
