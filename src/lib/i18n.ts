export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE_NAME = "travelyourmap_locale";

export function normalizeLocale(value: unknown): Locale {
  return String(value || "").toLowerCase() === "en" ? "en" : DEFAULT_LOCALE;
}

export function buildLocalizedHref(href: string, locale: Locale) {
  if (!href.startsWith("/")) return href;

  const [pathAndQuery, hash = ""] = href.split("#", 2);
  const [pathname, query = ""] = pathAndQuery.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("lang", locale);
  const serializedQuery = params.toString();
  return `${pathname}${serializedQuery ? `?${serializedQuery}` : ""}${hash ? `#${hash}` : ""}`;
}

export function getLocaleFromSearchParams(searchParams: URLSearchParams | Record<string, unknown>) {
  if (searchParams instanceof URLSearchParams) return normalizeLocale(searchParams.get("lang"));
  return normalizeLocale(searchParams.lang);
}
