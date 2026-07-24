/**
 * Root path segments owned by the application and therefore unavailable as
 * public creator usernames. Keep this list shared by registration, vanity
 * routing, and analytics so each layer makes the same decision.
 */
export const RESERVED_ROOT_SEGMENTS: ReadonlySet<string> = new Set([
  "",
  "404",
  "_next",
  "admin",
  "api",
  "auth",
  "brand-portal",
  "country-card-proposals",
  "creator-panel",
  "dashboard",
  "demo-diseno",
  "explore",
  "favicon.ico",
  "fullscreen-validation",
  "map",
  "map-admin-proposal",
  "map-proposal",
  "map-proposal-2",
  "map-proposal-v1",
  "monitoring",
  "onboarding",
  "pricing",
  "privacy",
  "robots.txt",
  "sentry-example-page",
  "sitemap.xml",
  "sponsor-report",
  "status",
  "terms",
  "u",
]);

export function isReservedRootSegment(value: string | null | undefined) {
  return RESERVED_ROOT_SEGMENTS.has(String(value || "").trim().toLowerCase());
}
