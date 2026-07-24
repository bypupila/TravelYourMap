import type { TravelVideoLocation } from "@/lib/types";

/**
 * Explicit allowlist for data that a public map needs to render. Automated
 * classification evidence, manual-review notes, raw geo hints, and detected
 * sponsor candidates stay in creator-only payloads.
 */
export function toPublicVideoLocation(video: TravelVideoLocation): TravelVideoLocation {
  return {
    id: video.id,
    youtube_video_id: video.youtube_video_id,
    video_url: video.video_url,
    title: video.title,
    description: video.description,
    thumbnail_url: video.thumbnail_url,
    published_at: video.published_at,
    view_count: video.view_count,
    like_count: video.like_count,
    comment_count: video.comment_count,
    duration_seconds: video.duration_seconds,
    made_for_kids: video.made_for_kids,
    travel_type: video.travel_type,
    location_status: video.location_status,
    country_code: video.country_code,
    country_name: video.country_name,
    location_label: video.location_label,
    lat: video.lat,
    lng: video.lng,
    confidence_score: video.confidence_score,
    sponsor_card_style: video.sponsor_card_style,
  };
}

export function toPublicVideoLocations(videos: TravelVideoLocation[]) {
  return videos.map(toPublicVideoLocation);
}
