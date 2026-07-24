import { NextResponse } from "next/server";
import { z } from "zod";
import { getChannelAccessForUser, getValidSessionUserFromRequest } from "@/lib/current-user";
import { secondCheckManualQueue } from "@/lib/map-sync";
import { enforceActorRateLimit } from "@/lib/request-rate-limit";
import { getActiveSubscriptionForUser } from "@/lib/subscription-entitlements";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  channelId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const payload = payloadSchema.parse(await request.json());
    const sessionUser = await getValidSessionUserFromRequest(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getChannelAccessForUser(payload.channelId, sessionUser.id);
    if (!access.canManage) {
      return NextResponse.json({ error: "Channel not found for this user" }, { status: 404 });
    }
    if (sessionUser.role !== "superadmin" && !(await getActiveSubscriptionForUser(access.ownerUserId || sessionUser.id))) {
      return NextResponse.json({ error: "Se requiere una suscripción activa para reprocesar ubicaciones." }, { status: 402 });
    }
    const quota = await enforceActorRateLimit({
      scope: "creator:map-second-check",
      actorKey: `${sessionUser.id}:${payload.channelId}`,
      windowMinutes: 60,
      maxAttempts: 2,
      failClosed: process.env.NODE_ENV === "production",
    });
    if (!quota.allowed) {
      return NextResponse.json({ error: "Demasiados reprocesamientos. Reintenta más tarde." }, { status: 429 });
    }

    const result = await secondCheckManualQueue({
      channelId: payload.channelId,
    });

    return NextResponse.json({
      runId: result.runId,
      summary: {
        videos_scanned: result.videos_scanned,
        videos_extracted: result.videos_extracted,
        videos_verified_auto: result.videos_verified_auto,
        videos_needs_manual: result.videos_needs_manual,
        videos_verified_manual: result.videos_verified_manual,
        excluded_shorts: result.excluded_shorts,
        excluded_non_travel: result.excluded_non_travel,
      },
      manualQueue: result.manualQueue,
    });
  } catch (error) {
    console.error("[api/map/second-check]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Second check failed" },
      { status: 400 }
    );
  }
}
