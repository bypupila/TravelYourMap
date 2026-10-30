export const CLARITY_CONSENT_KEY = "travel_clarity_consent_v1";
export const CLARITY_CONSENT_EVENT = "travel:clarity-consent";

// Allowlist of public pages. Authenticated, creator, sponsor, billing, admin and
// private capability routes are never listed, so Clarity cannot load there.
const CLARITY_ALLOWED_PATHS = new Set(["/", "/explore", "/pricing", "/privacy", "/terms"]);

export function isClarityAllowedPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return CLARITY_ALLOWED_PATHS.has(normalized);
}

export function isClarityConfigured() {
  const enabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_CLARITY_IN_DEV === "1";
  return Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) && enabled;
}

export function readClarityConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CLARITY_CONSENT_KEY);
    return value === "accepted" ? true : value === "declined" ? false : null;
  } catch {
    return null;
  }
}

export function saveClarityConsent(accepted: boolean) {
  try {
    window.localStorage.setItem(CLARITY_CONSENT_KEY, accepted ? "accepted" : "declined");
  } catch {
    // Storage can be unavailable; the choice still applies to this page load.
  }
  window.dispatchEvent(new CustomEvent(CLARITY_CONSENT_EVENT, { detail: { accepted } }));
}
