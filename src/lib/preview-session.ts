import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { ChannelAnalytics } from "@/lib/analytics";
import type { TravelChannel, TravelVideoLocation } from "@/lib/types";

export interface PreviewSessionData {
  id: string;
  created_at: string;
  channel: TravelChannel;
  videoLocations: TravelVideoLocation[];
  analytics: ChannelAnalytics;
  importedVideos: number;
  mappedVideos: number;
  skippedVideos: number;
}

const PREVIEW_DIR = path.join(tmpdir(), "travelyourmap-preview-sessions");
const PREVIEW_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PREVIEW_BYTES = 10 * 1024 * 1024;
const MAX_PREVIEW_AGE_MS = 24 * 60 * 60 * 1000;
const previewSessionSchema: z.ZodType<PreviewSessionData> = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  channel: z.object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    channel_name: z.string().min(1).max(240),
    channel_handle: z.string().max(240).optional().nullable(),
    thumbnail_url: z.string().max(2_000).optional().nullable(),
    subscriber_count: z.number().optional().nullable(),
    last_synced_at: z.string().optional().nullable(),
  }).passthrough(),
  videoLocations: z.array(z.object({
    youtube_video_id: z.string().min(1).max(128),
    title: z.string().min(1).max(1_000),
    country_code: z.string().length(2),
    lat: z.number().finite(),
    lng: z.number().finite(),
  }).passthrough()).max(5_000),
  analytics: z.object({
    top_countries: z.array(z.object({
      country_name: z.string().max(240),
      video_count: z.number().int().nonnegative(),
    })).max(250),
    videos_by_month: z.array(z.object({
      month: z.string().max(32),
      count: z.number().int().nonnegative(),
    })).max(1_200),
    unlocated_videos: z.array(z.object({
      id: z.string().max(200),
      title: z.string().max(1_000),
      view_count: z.number().nonnegative(),
    })).max(5_000),
    total_countries: z.number().int().nonnegative(),
    total_mapped_videos: z.number().int().nonnegative(),
    total_views: z.number().nonnegative(),
    monthly_visitors: z.number().nonnegative(),
  }),
  importedVideos: z.number().int().nonnegative(),
  mappedVideos: z.number().int().nonnegative(),
  skippedVideos: z.number().int().nonnegative(),
});

export async function createPreviewSession(
  input: Omit<PreviewSessionData, "id" | "created_at">
): Promise<PreviewSessionData> {
  const session: PreviewSessionData = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...input,
  };

  await mkdir(PREVIEW_DIR, { recursive: true });
  await writeFile(path.join(PREVIEW_DIR, `${session.id}.json`), JSON.stringify(session), "utf8");

  return session;
}

export async function readPreviewSession(id: string): Promise<PreviewSessionData | null> {
  const normalizedId = String(id || "").trim().toLowerCase();
  if (!PREVIEW_ID_PATTERN.test(normalizedId)) return null;

  try {
    const filePath = path.resolve(PREVIEW_DIR, `${normalizedId}.json`);
    const previewRoot = `${path.resolve(PREVIEW_DIR)}${path.sep}`;
    if (!filePath.startsWith(previewRoot)) return null;

    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size > MAX_PREVIEW_BYTES) return null;
    const parsed = previewSessionSchema.safeParse(JSON.parse(await readFile(filePath, "utf8")));
    if (!parsed.success || parsed.data.id.toLowerCase() !== normalizedId) return null;
    const createdAtMs = new Date(parsed.data.created_at).getTime();
    if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > MAX_PREVIEW_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
