import { normalizeUsername } from "@/lib/auth-identifiers";
import { columnExists, tableExists } from "@/lib/db-schema";
import { DEMO_CHANNEL, DEMO_CHANNEL_ID, DEMO_USERNAME, DEMO_VIDEO_LOCATIONS, isDemoUsername } from "@/lib/demo-data";
import { buildPublicMapUrl } from "@/lib/map-urls";
import { normalizeCountryCode } from "@/lib/map-polls";
import { sql } from "@/lib/neon";
import { getSponsorEntitlementForUser } from "@/lib/subscription-entitlements";

export interface MediaKitSettings {
  public_enabled: boolean;
  headline: string | null;
  bio: string | null;
  audience_note: string | null;
  partnership_email: string | null;
  rate_card_url: string | null;
  preferred_cta_label: string | null;
  featured_country_codes: string[];
}

export interface MediaKitCountry {
  country_code: string;
  country_name: string;
  videos_count: number;
  youtube_views: number;
  map_events: number;
}

export interface MediaKitSponsor {
  id: string;
  brand_name: string;
  logo_url: string | null;
  category_name: string | null;
}

export interface MediaKitPayload {
  channel: {
    id: string;
    user_id: string;
    username: string;
    channel_name: string;
    channel_handle: string | null;
    canonicalHandle: string;
    thumbnail_url: string | null;
    subscriber_count: number | null;
    description: string | null;
    mapIsPublic: boolean;
  };
  settings: MediaKitSettings;
  urls: {
    mediaKitUrl: string;
    mapUrl: string;
  };
  summary: {
    videos: number;
    countries: number;
    cities: number;
    youtube_views: number;
    youtube_likes: number;
    map_events_30d: number;
    sponsor_clicks_30d: number;
    inquiries_30d: number;
    active_sponsors: number;
  };
  topCountries: MediaKitCountry[];
  activeSponsors: MediaKitSponsor[];
  sponsorFeaturesEnabled: boolean;
}

interface MediaKitChannelRow {
  id: string;
  user_id: string;
  username: string;
  channel_name: string;
  channel_handle: string | null;
  thumbnail_url: string | null;
  subscriber_count: number | string | null;
  description: string | null;
  is_public: boolean;
  ownership_status: string | null;
}

type SaveMediaKitSettingsInput = {
  channelId: string;
  public_enabled: boolean;
  headline?: string | null;
  bio?: string | null;
  audience_note?: string | null;
  partnership_email?: string | null;
  rate_card_url?: string | null;
  preferred_cta_label?: string | null;
  featured_country_codes?: string[];
};

const DEFAULT_CTA = "Solicitar partnership";

async function mediaKitSettingsTableExists() {
  return tableExists("public", "media_kit_settings");
}

export async function loadCreatorMediaKit(channelId: string) {
  const channel = await loadChannelById(channelId);
  if (!channel) return null;
  return buildMediaKitPayload(channel);
}

export async function loadPublicMediaKit(identifier: string) {
  const channel = await resolvePublicMediaKitChannel(identifier);
  if (!channel) return null;
  const payload = await buildMediaKitPayload(channel);
  if (!payload.settings.public_enabled) return null;
  return payload;
}

export async function saveMediaKitSettings(input: SaveMediaKitSettingsInput) {
  if (!(await mediaKitSettingsTableExists())) {
    throw new Error("La tabla media_kit_settings no existe. Ejecuta las migraciones antes de editar el media kit.");
  }

  const countryCodes = Array.from(
    new Set((input.featured_country_codes || []).map((code) => normalizeCountryCode(code)).filter(Boolean))
  ).slice(0, 12);

  const rows = await sql<Array<{ channel_id: string }>>`
    insert into public.media_kit_settings (
      channel_id,
      public_enabled,
      headline,
      bio,
      audience_note,
      partnership_email,
      rate_card_url,
      preferred_cta_label,
      featured_country_codes
    )
    values (
      ${input.channelId},
      ${input.public_enabled},
      ${cleanText(input.headline)},
      ${cleanText(input.bio)},
      ${cleanText(input.audience_note)},
      ${cleanText(input.partnership_email)},
      ${cleanText(input.rate_card_url)},
      ${cleanText(input.preferred_cta_label)},
      ${countryCodes}
    )
    on conflict (channel_id)
    do update set
      public_enabled = excluded.public_enabled,
      headline = excluded.headline,
      bio = excluded.bio,
      audience_note = excluded.audience_note,
      partnership_email = excluded.partnership_email,
      rate_card_url = excluded.rate_card_url,
      preferred_cta_label = excluded.preferred_cta_label,
      featured_country_codes = excluded.featured_country_codes,
      updated_at = now()
    returning channel_id::text as channel_id
  `;

  return Boolean(rows[0]?.channel_id);
}

async function resolvePublicMediaKitChannel(identifier: string) {
  const normalized = normalizeUsername(identifier);
  if (!normalized) return null;

  if (isDemoUsername(normalized)) {
    return normalizeChannelRow({
      id: DEMO_CHANNEL_ID,
      user_id: DEMO_CHANNEL.user_id,
      username: DEMO_USERNAME,
      channel_name: DEMO_CHANNEL.channel_name,
      channel_handle: DEMO_CHANNEL.channel_handle || null,
      thumbnail_url: DEMO_CHANNEL.thumbnail_url || null,
      subscriber_count: DEMO_CHANNEL.subscriber_count || null,
      description: null,
      is_public: true,
      ownership_status: "verified",
    });
  }

  const rows = await sql<MediaKitChannelRow[]>`
    select
      c.id::text as id,
      c.user_id::text as user_id,
      u.username,
      c.channel_name,
      c.channel_handle,
      c.thumbnail_url,
      c.subscriber_count,
      c.description,
      c.is_public,
      c.ownership_status
    from public.channels c
    inner join public.users u on u.id = c.user_id
    inner join public.media_kit_settings m on m.channel_id = c.id
      and m.public_enabled = true
    where (
        u.username = ${normalized}
        or ltrim(lower(coalesce(c.channel_handle, '')), '@') = ${normalized}
      )
    limit 1
  `;
  return rows[0] ? normalizeChannelRow(rows[0]) : null;
}

async function loadChannelById(channelId: string) {
  const rows = await sql<MediaKitChannelRow[]>`
    select
      c.id::text as id,
      c.user_id::text as user_id,
      u.username,
      c.channel_name,
      c.channel_handle,
      c.thumbnail_url,
      c.subscriber_count,
      c.description,
      c.is_public,
      c.ownership_status
    from public.channels c
    inner join public.users u on u.id = c.user_id
    where c.id = ${channelId}
    limit 1
  `;
  return rows[0] ? normalizeChannelRow(rows[0]) : null;
}

async function buildMediaKitPayload(channel: MediaKitPayload["channel"]): Promise<MediaKitPayload> {
  if (channel.id === DEMO_CHANNEL_ID) {
    return buildDemoMediaKitPayload(channel);
  }

  const [settings, summaryRows, countryRows, sponsorEntitlement] = await Promise.all([
    loadMediaKitSettings(channel),
    loadSummaryRows(channel.id),
    loadTopCountries(channel.id),
    getSponsorEntitlementForUser(channel.user_id),
  ]);
  const sponsorRows = sponsorEntitlement.allowed ? await loadActiveSponsors(channel.user_id) : [];

  const summary = summaryRows[0] || {
    videos: 0,
    countries: 0,
    cities: 0,
    youtube_views: 0,
    youtube_likes: 0,
    map_events_30d: 0,
    sponsor_clicks_30d: 0,
    inquiries_30d: 0,
  };

  const preferredCountries = settings.featured_country_codes.length
    ? countryRows
        .slice()
        .sort((a, b) => {
          const ai = settings.featured_country_codes.indexOf(a.country_code);
          const bi = settings.featured_country_codes.indexOf(b.country_code);
          if (ai === -1 && bi === -1) return b.youtube_views - a.youtube_views;
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        })
    : countryRows;

  return {
    channel,
    settings,
    urls: {
      mediaKitUrl: `/u/${encodeURIComponent(channel.canonicalHandle)}/media-kit`,
      mapUrl: `/u/${encodeURIComponent(channel.canonicalHandle)}`,
    },
    summary: {
      videos: Number(summary.videos || 0),
      countries: Number(summary.countries || 0),
      cities: Number(summary.cities || 0),
      youtube_views: Number(summary.youtube_views || 0),
      youtube_likes: Number(summary.youtube_likes || 0),
      map_events_30d: Number(summary.map_events_30d || 0),
      sponsor_clicks_30d: sponsorEntitlement.allowed ? Number(summary.sponsor_clicks_30d || 0) : 0,
      inquiries_30d: sponsorEntitlement.allowed ? Number(summary.inquiries_30d || 0) : 0,
      active_sponsors: sponsorRows.length,
    },
    topCountries: preferredCountries.slice(0, 8),
    activeSponsors: sponsorRows.slice(0, 12),
    sponsorFeaturesEnabled: sponsorEntitlement.allowed,
  };
}

function buildDemoMediaKitPayload(channel: MediaKitPayload["channel"]): MediaKitPayload {
  const countries = new Map<string, MediaKitCountry>();
  for (const video of DEMO_VIDEO_LOCATIONS) {
    const code = String(video.country_code || "").toUpperCase();
    if (!code) continue;
    const current = countries.get(code) || {
      country_code: code,
      country_name: video.country_name || code,
      videos_count: 0,
      youtube_views: 0,
      map_events: 0,
    };
    current.videos_count += 1;
    current.youtube_views += Number(video.view_count || 0);
    countries.set(code, current);
  }

  const topCountries = Array.from(countries.values()).sort(
    (left, right) => right.youtube_views - left.youtube_views || right.videos_count - left.videos_count
  );
  const settings = buildDefaultSettings(channel);
  const activeSponsors: MediaKitSponsor[] = [
    { id: "demo-booking", brand_name: "Booking.com", logo_url: "/brands/booking.svg", category_name: "Alojamiento" },
    { id: "demo-getyourguide", brand_name: "GetYourGuide", logo_url: "/brands/getyourguide.svg", category_name: "Experiencias" },
    { id: "demo-iati", brand_name: "IATI Seguros", logo_url: "/brands/iati.svg", category_name: "Seguros de viaje" },
  ];

  return {
    channel,
    settings,
    urls: {
      mediaKitUrl: `/u/${encodeURIComponent(channel.canonicalHandle)}/media-kit`,
      mapUrl: `/u/${encodeURIComponent(channel.canonicalHandle)}`,
    },
    summary: {
      videos: DEMO_VIDEO_LOCATIONS.length,
      countries: countries.size,
      cities: new Set(DEMO_VIDEO_LOCATIONS.map((video) => String(video.city || "").trim()).filter(Boolean)).size,
      youtube_views: DEMO_VIDEO_LOCATIONS.reduce((sum, video) => sum + Number(video.view_count || 0), 0),
      youtube_likes: DEMO_VIDEO_LOCATIONS.reduce((sum, video) => sum + Number(video.like_count || 0), 0),
      map_events_30d: 0,
      sponsor_clicks_30d: 0,
      inquiries_30d: 0,
      active_sponsors: activeSponsors.length,
    },
    topCountries: topCountries.slice(0, 8),
    activeSponsors,
    sponsorFeaturesEnabled: true,
  };
}

async function loadMediaKitSettings(channel: MediaKitPayload["channel"]): Promise<MediaKitSettings> {
  const fallback = buildDefaultSettings(channel);
  if (!(await mediaKitSettingsTableExists())) return fallback;

  const rows = await sql<Array<MediaKitSettings>>`
    select
      public_enabled,
      headline,
      bio,
      audience_note,
      partnership_email,
      rate_card_url,
      preferred_cta_label,
      featured_country_codes
    from public.media_kit_settings
    where channel_id = ${channel.id}
    limit 1
  `;
  const row = rows[0] || null;
  if (!row) return fallback;
  return {
    public_enabled: row.public_enabled !== false,
    headline: row.headline || fallback.headline,
    bio: row.bio || fallback.bio,
    audience_note: row.audience_note || fallback.audience_note,
    partnership_email: row.partnership_email || null,
    rate_card_url: row.rate_card_url || null,
    preferred_cta_label: row.preferred_cta_label || fallback.preferred_cta_label,
    featured_country_codes: Array.isArray(row.featured_country_codes) ? row.featured_country_codes.map(normalizeCountryCode).filter(Boolean) : [],
  };
}

function buildDefaultSettings(channel: MediaKitPayload["channel"]): MediaKitSettings {
  return {
    public_enabled: true,
    headline: `${channel.channel_name}: viajes, destinos y audiencias listas para conectar con marcas`,
    bio:
      channel.description ||
      `Media kit interactivo de ${channel.channel_name}, creado desde su mapa de viajes, videos geolocalizados, sponsors activos y senales first-party de TravelYourMap.`,
    audience_note: "Audiencia interesada en destinos, rutas, experiencias, alojamiento, movilidad, seguros y productos para viajar mejor.",
    partnership_email: null,
    rate_card_url: null,
    preferred_cta_label: DEFAULT_CTA,
    featured_country_codes: [],
  };
}

async function loadSummaryRows(channelId: string) {
  return sql<Array<{
    videos: number | string;
    countries: number | string;
    cities: number | string;
    youtube_views: number | string;
    youtube_likes: number | string;
    map_events_30d: number | string;
    sponsor_clicks_30d: number | string;
    inquiries_30d: number | string;
  }>>`
    select
      (select count(*)::int from public.videos where channel_id = ${channelId} and coalesce(is_travel, true) = true and coalesce(is_short, false) = false) as videos,
      (select count(distinct country_code)::int from public.video_locations where channel_id = ${channelId}) as countries,
      (select count(distinct nullif(city, ''))::int from public.video_locations where channel_id = ${channelId}) as cities,
      (select coalesce(sum(view_count), 0)::bigint from public.videos where channel_id = ${channelId} and coalesce(is_travel, true) = true and coalesce(is_short, false) = false) as youtube_views,
      (select coalesce(sum(like_count), 0)::bigint from public.videos where channel_id = ${channelId} and coalesce(is_travel, true) = true and coalesce(is_short, false) = false) as youtube_likes,
      (select count(*)::int from public.map_events where channel_id = ${channelId} and created_at >= now() - interval '30 days') as map_events_30d,
      (select count(*)::int from public.sponsor_clicks where channel_id = ${channelId} and clicked_at >= now() - interval '30 days') as sponsor_clicks_30d,
      (select count(*)::int from public.sponsor_inquiries where channel_id = ${channelId} and created_at >= now() - interval '30 days') as inquiries_30d
  `;
}

async function loadTopCountries(channelId: string): Promise<MediaKitCountry[]> {
  const rows = await sql<Array<{
    country_code: string;
    country_name: string | null;
    videos_count: number | string;
    youtube_views: number | string;
    map_events: number | string;
  }>>`
    select
      upper(vl.country_code) as country_code,
      coalesce(max(vl.country_name), upper(vl.country_code)) as country_name,
      count(distinct v.id)::int as videos_count,
      coalesce(sum(v.view_count), 0)::bigint as youtube_views,
      coalesce(max(events.events), 0)::int as map_events
    from public.video_locations vl
    inner join public.videos v on v.id = vl.video_id
    left join (
      select country_code, count(*)::int as events
      from public.map_events
      where channel_id = ${channelId}
      group by country_code
    ) events on upper(events.country_code) = upper(vl.country_code)
    where vl.channel_id = ${channelId}
      and vl.is_primary = true
      and coalesce(v.is_travel, true) = true
      and coalesce(v.is_short, false) = false
    group by upper(vl.country_code)
    order by coalesce(sum(v.view_count), 0) desc, count(distinct v.id) desc
    limit 20
  `;
  return rows.map((row) => ({
    country_code: normalizeCountryCode(row.country_code),
    country_name: row.country_name || row.country_code,
    videos_count: Number(row.videos_count || 0),
    youtube_views: Number(row.youtube_views || 0),
    map_events: Number(row.map_events || 0),
  }));
}

async function loadActiveSponsors(userId: string): Promise<MediaKitSponsor[]> {
  const [hasSponsorCategories, hasSponsorCategoryId] = await Promise.all([
    tableExists("public", "sponsor_categories"),
    columnExists("public", "sponsors", "category_id"),
  ]);
  const canJoinCategories = hasSponsorCategories && hasSponsorCategoryId;
  const rows = await sql.query<Array<{
    id: string;
    brand_name: string;
    logo_url: string | null;
    category_name: string | null;
  }>>(
    `
      select
        s.id::text as id,
        s.brand_name,
        s.logo_url,
        ${canJoinCategories ? "sc.name" : "null::text"} as category_name
      from public.sponsors s
      ${canJoinCategories ? "left join public.sponsor_categories sc on sc.id = s.category_id" : ""}
      where s.user_id = $1
        and s.active = true
      order by s.created_at desc
      limit 24
    `,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    brand_name: row.brand_name,
    logo_url: row.logo_url,
    category_name: row.category_name,
  }));
}

function normalizeChannelRow(row: MediaKitChannelRow): MediaKitPayload["channel"] {
  const canonicalHandle = String(row.channel_handle || row.username || "").replace(/^@+/, "") || row.id;
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    channel_name: row.channel_name,
    channel_handle: row.channel_handle,
    canonicalHandle,
    thumbnail_url: row.thumbnail_url,
    subscriber_count: row.subscriber_count === null ? null : Number(row.subscriber_count),
    description: row.description,
    mapIsPublic: row.is_public === true && row.ownership_status === "verified",
  };
}

function cleanText(value: string | null | undefined) {
  const text = String(value || "").trim();
  return text ? text : null;
}

export function buildAbsoluteMediaKitUrl(origin: string, mediaKitUrl: string) {
  return `${origin.replace(/\/$/, "")}${mediaKitUrl.startsWith("/") ? mediaKitUrl : `/${mediaKitUrl}`}`;
}

export function buildMediaKitMapUrl(channelId: string) {
  return buildPublicMapUrl(channelId);
}
