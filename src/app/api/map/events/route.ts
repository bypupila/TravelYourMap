import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUserIdFromRequest } from "@/lib/current-user";
import { isDemoChannelId } from "@/lib/demo-data";
import { MAP_EVENT_TYPES } from "@/lib/map-event-types";
import {
  isActiveSponsorForPublicChannel,
  isUuid,
  isPublicMapPath,
  recordMapEventFromRequest,
  resolvePathFromRequest,
} from "@/lib/map-events";
import { enforceRequestRateLimit } from "@/lib/request-rate-limit";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  channelId: z.string().trim().min(1),
  eventType: z.enum(MAP_EVENT_TYPES),
  viewerMode: z.enum(["viewer", "creator", "demo"]).optional().nullable(),
  path: z.string().trim().max(240).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable(),
  countryCode: z.string().trim().length(2).optional().nullable(),
  youtubeVideoId: z.string().trim().max(64).optional().nullable(),
  sponsorId: z.string().uuid().optional().nullable(),
  pollId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

const AUTHORITATIVE_ENDPOINT_EVENTS = new Set(["sponsor_click", "inquiry_submit", "poll_vote"]);
const VIDEO_EVENTS = new Set([
  "video_panel_open",
  "youtube_external_open",
  "video_saved_added",
  "video_saved_removed",
  "video_favorite_added",
  "video_favorite_removed",
  "video_watch_later_added",
  "video_watch_later_removed",
  "video_watch_time_logged",
]);
const AUTHENTICATED_EVENTS = new Set([
  "video_saved_added",
  "video_saved_removed",
  "video_favorite_added",
  "video_favorite_removed",
  "video_watch_later_added",
  "video_watch_later_removed",
  "video_watch_time_logged",
]);

export async function POST(request: Request) {
  try {
    const rateLimit = await enforceRequestRateLimit({
      request,
      scope: "api:map-events",
      windowMinutes: 1,
      maxAttempts: 180,
      failClosed: true,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: true, skipped: "rate_limited" });
    }

    const payload = payloadSchema.parse(await request.json());
    const path = resolvePathFromRequest(request);

    if (isDemoChannelId(payload.channelId) || payload.viewerMode === "demo") {
      return NextResponse.json({ ok: true, skipped: "demo" });
    }

    if (!isUuid(payload.channelId)) {
      return NextResponse.json({ ok: true, skipped: "non_uuid_channel" });
    }

    if (!isPublicMapPath(path)) {
      return NextResponse.json({ ok: true, skipped: "not_public_map" });
    }

    const [channelRows, sessionUserId] = await Promise.all([
      sql<Array<{ user_id: string }>>`
        select user_id
        from public.channels
        where id = ${payload.channelId}
          and is_public = true
          and ownership_status = 'verified'
        limit 1
      `,
      getValidSessionUserIdFromRequest(request),
    ]);
    const channel = channelRows[0] || null;
    if (!channel) {
      return NextResponse.json({ ok: true, skipped: "channel_not_public" });
    }

    if (channel.user_id === sessionUserId) {
      return NextResponse.json({ ok: true, skipped: "owner_self_view" });
    }

    if (AUTHORITATIVE_ENDPOINT_EVENTS.has(payload.eventType)) {
      return NextResponse.json({ ok: true, skipped: "authoritative_endpoint_required" });
    }

    if (AUTHENTICATED_EVENTS.has(payload.eventType) && !sessionUserId) {
      return NextResponse.json({ error: "Authentication required for this event." }, { status: 401 });
    }

    if (VIDEO_EVENTS.has(payload.eventType)) {
      const videoId = String(payload.youtubeVideoId || "").trim();
      if (!videoId) return NextResponse.json({ error: "youtubeVideoId is required." }, { status: 400 });
      const videoRows = await sql<Array<{ made_for_kids: boolean | null }>>`
        select made_for_kids
        from public.videos
        where channel_id = ${payload.channelId}
          and youtube_video_id = ${videoId}
        limit 1
      `;
      if (!videoRows[0]) return NextResponse.json({ error: "Video not found for channel." }, { status: 400 });
      if (videoRows[0].made_for_kids === true) {
        return NextResponse.json({ ok: true, skipped: "made_for_kids" });
      }
    }

    if (payload.eventType === "sponsor_impression") {
      if (!payload.sponsorId || !(await isActiveSponsorForPublicChannel(payload.sponsorId, payload.channelId))) {
        return NextResponse.json({ error: "Sponsor not active for channel." }, { status: 400 });
      }
    }

    const metadata = normalizeEventMetadata(payload.eventType, payload.metadata);

    const id = await recordMapEventFromRequest(request, {
      channelId: payload.channelId,
      eventType: payload.eventType,
      viewerMode: "viewer",
      path,
      countryCode: payload.countryCode,
      youtubeVideoId: payload.youtubeVideoId,
      sponsorId: payload.sponsorId,
      pollId: null,
      metadata,
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[api/map/events]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event payload", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not record map event" }, { status: 500 });
  }
}

function normalizeEventMetadata(eventType: (typeof MAP_EVENT_TYPES)[number], metadata: Record<string, unknown> | null | undefined) {
  if (eventType !== "video_watch_time_logged") return metadata;

  const rawWatchSeconds = Number(metadata?.watch_seconds);
  if (!Number.isFinite(rawWatchSeconds) || rawWatchSeconds <= 0) return {};

  return {
    watch_seconds: Math.min(21_600, Math.round(rawWatchSeconds)),
    event_reason: String(metadata?.event_reason || "").slice(0, 40),
  };
}
