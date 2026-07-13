export type ViewerAuthIntent = "viewer" | "creator";
export type ViewerRegistrationSource = "platform" | "creator_map";

export interface ViewerAuthAttribution {
  authIntent: ViewerAuthIntent;
  registrationSource: ViewerRegistrationSource;
  registrationChannelId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  safeNext: string;
}

function readParams(input?: string | URLSearchParams | null) {
  if (input instanceof URLSearchParams) return input;
  return new URLSearchParams(String(input || ""));
}

export function readViewerAuthAttribution(input?: string | URLSearchParams | null): ViewerAuthAttribution {
  const params = readParams(input);
  const channelId = String(params.get("channelId") || "").trim();
  const next = String(params.get("next") || "");
  return {
    authIntent: params.get("intent") === "viewer" ? "viewer" : "creator",
    registrationSource: channelId ? "creator_map" : "platform",
    registrationChannelId: channelId || null,
    utmSource: String(params.get("utm_source") || "").trim() || null,
    utmMedium: String(params.get("utm_medium") || "").trim() || null,
    utmCampaign: String(params.get("utm_campaign") || "").trim() || null,
    safeNext: next.startsWith("/") ? next : "",
  };
}

export function readViewerAuthAttributionFromLocation(fallback?: string | URLSearchParams | null) {
  if (typeof window === "undefined") return readViewerAuthAttribution(fallback);
  return readViewerAuthAttribution(window.location.search);
}

function buildAuthQuery(attribution: ViewerAuthAttribution, intent: ViewerAuthIntent) {
  const params = new URLSearchParams();
  if (intent === "viewer") params.set("intent", "viewer");
  if (attribution.registrationChannelId) params.set("channelId", attribution.registrationChannelId);
  if (attribution.safeNext) params.set("next", attribution.safeNext);
  if (attribution.utmSource) params.set("utm_source", attribution.utmSource);
  if (attribution.utmMedium) params.set("utm_medium", attribution.utmMedium);
  if (attribution.utmCampaign) params.set("utm_campaign", attribution.utmCampaign);
  return params.toString();
}

export function buildAuthHref(attribution: ViewerAuthAttribution, intent: ViewerAuthIntent) {
  const query = buildAuthQuery(attribution, intent);
  return `/auth${query ? `?${query}` : ""}`;
}

export function buildViewerRegisterHref(attribution: ViewerAuthAttribution) {
  const query = buildAuthQuery(attribution, "viewer");
  return `/auth/viewer-register${query ? `?${query}` : ""}`;
}
