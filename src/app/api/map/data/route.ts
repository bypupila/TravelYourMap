import { NextResponse } from "next/server";
import { getValidSessionUserFromRequest, userIsSuperAdmin } from "@/lib/current-user";
import { loadMapDataByChannelId } from "@/lib/map-data";
import { toPublicVideoLocations } from "@/lib/public-map-sanitization";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const channelId = String(url.searchParams.get("channelId") || "").trim();
    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const sessionUser = await getValidSessionUserFromRequest(request);
    let canViewInternalQueue = false;

    if (UUID_PATTERN.test(channelId)) {
      const channelRows = await sql<Array<{ user_id: string; is_public: boolean; ownership_status: string }>>`
        select user_id, is_public, ownership_status
        from public.channels
        where id = ${channelId}
        limit 1
      `;
      const channel = channelRows[0] || null;
      if (!channel) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      }
      canViewInternalQueue = Boolean(
        sessionUser &&
          (userIsSuperAdmin(sessionUser.role) ||
            (sessionUser.role === "creator" && channel.user_id === sessionUser.id))
      );
      if ((!channel.is_public || channel.ownership_status !== "verified") && !canViewInternalQueue) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      }
    }

    const payload = await loadMapDataByChannelId(channelId);
    if (!payload) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (canViewInternalQueue) {
      return NextResponse.json(payload);
    }

    return NextResponse.json({
      ...payload,
      videoLocations: toPublicVideoLocations(payload.videoLocations),
      manualQueue: [],
      summary: {
        ...payload.summary,
        total_videos: payload.videoLocations.length,
        needs_manual: 0,
      },
    });
  } catch (error) {
    console.error("[api/map/data]", error);
    return NextResponse.json({ error: "Map data unavailable" }, { status: 500 });
  }
}
