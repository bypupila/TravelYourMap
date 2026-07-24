import type { AdminUserEntry } from "@/components/admin/admin-users-panel";
import type { UserRoleAuditRow } from "@/lib/admin-role-audit";
import type { CreatorAdminCountry, CreatorAdminPayload, CreatorAdminVideo } from "@/lib/creator-admin-data";
import { DEMO_CHANNEL, DEMO_CHANNEL_ID, DEMO_USERNAME, DEMO_USER, DEMO_VIDEO_LOCATIONS } from "@/lib/demo-data";
import type { SponsorReportData, SponsorReportVideoMetric } from "@/lib/sponsor-reports";

export const RESPONSIVE_QA_KEY = "responsive";

export function isResponsiveQaFixture(value?: string | null) {
  return process.env.NODE_ENV !== "production" && value === RESPONSIVE_QA_KEY;
}

export function buildResponsiveQaCreatorPayload(baseUrl = "http://localhost:3000"): CreatorAdminPayload {
  const videos: CreatorAdminVideo[] = DEMO_VIDEO_LOCATIONS.slice(0, 14).map((video, index) => ({
    id: `qa-video-${index + 1}`,
    youtube_video_id: video.youtube_video_id,
    youtube_url: `https://www.youtube.com/watch?v=${video.youtube_video_id}`,
    title: video.title,
    thumbnail_url: video.thumbnail_url || null,
    published_at: video.published_at || null,
    view_count: Number(video.view_count || 0),
    like_count: Number(video.like_count || 0),
    comment_count: Number(video.comment_count || 0),
    raw_location_status: index % 5 === 0 ? "needs_manual" : "mapped",
    ui_status: index % 5 === 0 ? "pending" : index % 3 === 0 ? "manual" : "auto",
    verification_source: index % 3 === 0 ? "manual" : "youtube",
    visible_on_map: index % 7 !== 0,
    featured: index === 1,
    internal_notes: index === 0 ? "Revisar el nombre largo del destino antes de publicar." : null,
    location_id: `qa-location-${index + 1}`,
    country_code: video.country_code || null,
    country_name: video.country_name || null,
    city: video.city || null,
    region: video.region || null,
    lat: Number(video.lat || 0),
    lng: Number(video.lng || 0),
    label_public: video.location_label || null,
    location_internal_notes: null,
    sponsor_ids: [],
    sponsor_names: [],
    sponsor_detection_status: "no_disponible",
    sponsor_detectado_texto: null,
    sponsor_detectado_confianza: null,
    sponsor_detectado_fuente: null,
    sponsor_card_style: null,
    updated_at: "2026-07-10T12:00:00.000Z",
  }));

  const countriesByCode = new Map<string, CreatorAdminCountry>();
  for (const video of videos) {
    const code = String(video.country_code || "").toUpperCase();
    if (!code) continue;
    const current = countriesByCode.get(code);
    const city = String(video.city || "").trim();
    if (current) {
      current.videos_count += 1;
      current.visible_videos_count += video.visible_on_map ? 1 : 0;
      current.total_views += Number(video.view_count || 0);
      current.total_likes += Number(video.like_count || 0);
      if (city && !current.top_cities.includes(city)) current.top_cities.push(city);
      current.cities_count = current.top_cities.length;
      continue;
    }
    countriesByCode.set(code, {
      country_code: code,
      country_name: video.country_name || code,
      videos_count: 1,
      visible_videos_count: video.visible_on_map ? 1 : 0,
      cities_count: city ? 1 : 0,
      top_cities: city ? [city] : [],
      total_views: Number(video.view_count || 0),
      total_likes: Number(video.like_count || 0),
      sponsor_ids: [],
      sponsor_names: [],
      has_sponsor: false,
    });
  }

  const countries = Array.from(countriesByCode.values());
  return {
    channel: { ...DEMO_CHANNEL, canonicalHandle: DEMO_USERNAME },
    mapUrl: `${baseUrl.replace(/\/$/, "")}/u/${DEMO_USERNAME}`,
    videos,
    countries,
    sponsors: [],
    polls: [],
    activity: [
      {
        id: "qa-activity-1",
        event_type: "responsive_qa",
        entity_type: "video",
        entity_id: videos[0]?.id || null,
        description: "Fixture local listo para validar textos largos, estados vacios y acciones del panel.",
        severity: "info",
        created_at: "2026-07-10T12:00:00.000Z",
      },
    ],
    alerts: [
      {
        id: "qa-alert-1",
        severity: "warning",
        title: "Videos pendientes de revision",
        description: "Hay destinos que necesitan confirmacion manual antes de publicarse.",
        href: "/creator-panel?qa=responsive&tab=videos&status=pending",
      },
    ],
    audience: {
      top_countries: countries.slice(0, 4).map((country, index) => ({ country_code: country.country_code, events: 184 - index * 27 })),
      top_videos: videos.slice(0, 4).map((video, index) => ({ youtube_video_id: video.youtube_video_id, title: video.title, events: 96 - index * 13 })),
      sponsor_clicks: [],
      poll_votes: 37,
    },
    syncStatus: { last_run_at: "2026-07-10T12:00:00.000Z", last_status: "completed", last_error: null },
    quickAction: { severity: "warning", label: "Revision pendiente", cta: "Revisar videos", href: "/creator-panel?qa=responsive&tab=videos&status=pending" },
    summary: {
      videos_mapped: videos.filter((video) => video.ui_status !== "pending").length,
      videos_hidden: videos.filter((video) => !video.visible_on_map).length,
      countries_covered: countries.length,
      cities_covered: countries.reduce((total, country) => total + country.cities_count, 0),
      pending_review: videos.filter((video) => video.ui_status === "pending").length,
      active_vote_count: 0,
    },
    businessReadiness: {
      ready: false,
      ready_count: 2,
      total_count: 3,
      missing_required_count: 1,
      checks: [
        { key: "map", label: "Mapa publico", status: "ready", detail: "Mapa demo disponible.", required: true },
        { key: "contact", label: "Contacto comercial", status: "ready", detail: DEMO_USER.email, required: true },
        { key: "sponsors", label: "Sponsors", status: "missing", detail: "Agrega el primer sponsor para habilitar reportes.", required: false },
      ],
    },
    entitlements: {
      sponsors: true,
      currentPlan: "creator_pro",
    },
  };
}

export function buildResponsiveQaAdminData(): {
  users: AdminUserEntry[];
  audit: UserRoleAuditRow[];
} {
  const users: AdminUserEntry[] = [
    { id: DEMO_USER.id, email: DEMO_USER.email, username: DEMO_USERNAME, display_name: DEMO_USER.displayName, role: "creator", updated_at: "2026-07-10T12:00:00.000Z" },
    { id: "00000000-0000-4000-8000-000000000002", email: "viewer.qa@travelyourmap.local", username: "viewer-qa-responsive", display_name: "Viajera de prueba con nombre extenso", role: "viewer", updated_at: "2026-07-09T15:30:00.000Z" },
    { id: "00000000-0000-4000-8000-000000000003", email: "admin.qa@travelyourmap.local", username: "admin-qa", display_name: "Operaciones TravelYourMap", role: "superadmin", updated_at: "2026-07-08T09:20:00.000Z" },
  ];
  return {
    users,
    audit: [
      {
        id: 1,
        target_user_id: users[0].id,
        target_user_email: users[0].email,
        target_user_username: users[0].username,
        target_display_name: users[0].display_name,
        previous_role: "viewer",
        new_role: "creator",
        changed_by_user_id: users[2].id,
        changed_by_username: users[2].username,
        changed_by_display_name: users[2].display_name,
        created_at: "2026-07-10T12:00:00.000Z",
      },
    ],
  };
}

export function buildResponsiveQaSponsorReport(): SponsorReportData {
  const videoMetrics: SponsorReportVideoMetric[] = DEMO_VIDEO_LOCATIONS.slice(0, 4).map((video, index) => ({
    id: `qa-report-video-${index + 1}`,
    youtube_video_id: video.youtube_video_id,
    title: video.title,
    thumbnail_url: video.thumbnail_url || null,
    country_name: video.country_name || null,
    travel_map_opens: 83 - index * 11,
    youtube_views: Number(video.view_count || 0),
    youtube_likes: Number(video.like_count || 0),
    youtube_comments: Number(video.comment_count || 0),
  }));
  const daily = Array.from({ length: 30 }, (_, index) => ({
    day: `2026-06-${String(index + 1).padStart(2, "0")}`,
    impressions: 90 + ((index * 17) % 73),
    clicks: 8 + ((index * 7) % 19),
  }));
  const topCountries = [
    { country_code: "PT", country_name: "Portugal", impressions: 684, clicks: 91 },
    { country_code: "TH", country_name: "Tailandia", impressions: 531, clicks: 72 },
    { country_code: "CH", country_name: "Suiza", impressions: 447, clicks: 58 },
  ];
  return {
    link: { id: "qa-report", channel_id: DEMO_CHANNEL_ID, sponsor_id: "qa-sponsor", sponsor_name: "IATI Seguros", active: true, period_days: 30, view_count: 7, last_viewed_at: null, revoked_at: null, expires_at: null, created_at: "2026-06-01T12:00:00.000Z", public_url: "/sponsor-report/responsive-qa" },
    period: { days: 30, since: "2026-06-01T00:00:00.000Z", until: "2026-06-30T23:59:59.000Z" },
    platform: { name: "TravelYourMap", logo_url: "/icon.svg" },
    creator: { channel_id: DEMO_CHANNEL_ID, name: DEMO_CHANNEL.channel_name, handle: DEMO_USERNAME, logo_url: null, subscriber_count: DEMO_CHANNEL.subscriber_count || null, map_url: `/u/${DEMO_USERNAME}` },
    sponsor: { id: "qa-sponsor", brand_name: "IATI Seguros", logo_url: "/brands/iati.svg", website_url: "https://www.iatiseguros.com", affiliate_url: null, discount_code: "PUPILAVIAJA", description: "Seguro para viajes internacionales.", active: true, scope: "global", scope_label: "Todo el mapa", country_codes: [], video_count: videoMetrics.length },
    travel_map: { impressions: 3487, clicks: 421, unique_clickers: 308, ctr: 0.1207, video_opens: 276, saved: 84, favorites: 51, watch_later: 37, watch_time_seconds: 12844, top_country: topCountries[0], top_video: videoMetrics[0], daily, top_countries: topCountries, top_videos: videoMetrics },
    youtube: { top_video: videoMetrics[0], total_views_in_scope: videoMetrics.reduce((sum, video) => sum + video.youtube_views, 0), total_likes_in_scope: videoMetrics.reduce((sum, video) => sum + video.youtube_likes, 0), total_comments_in_scope: videoMetrics.reduce((sum, video) => sum + video.youtube_comments, 0) },
  };
}
