import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/lib/auth-session";
import { isValidUsername, normalizeUsername } from "@/lib/auth-identifiers";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

const CANONICAL_HOST = "travelyourmap.bypupila.com";
const LEGACY_HOST_BASENAME = ["you", "map.bypupila.com"].join("");
const LEGACY_HOSTS = new Set([
  LEGACY_HOST_BASENAME,
  `www.${LEGACY_HOST_BASENAME}`,
]);
const VANITY_HOSTS = new Set([
  CANONICAL_HOST,
  "www.travelyourmap.bypupila.com",
  configuredAppHost(),
]);
const LOCAL_ONLY_ROUTES = new Set([
  "/map-proposal",
  "/map-proposal-v1",
  "/map-proposal-2",
  "/demo-diseno",
  "/country-card-proposals",
]);

function configuredAppHost() {
  const raw = String(process.env.NEXT_PUBLIC_APP_URL || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export async function proxy(request: NextRequest) {
  const host = String(request.headers.get("host") || "").split(":")[0].toLowerCase();
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const firstSegment = normalizeUsername(pathSegments[0] || "");

  if (LEGACY_HOSTS.has(host)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = CANONICAL_HOST;
    redirectUrl.protocol = "https";
    return withLocaleCookie(NextResponse.redirect(redirectUrl, 308), request);
  }

  if (process.env.NODE_ENV === "production" && LOCAL_ONLY_ROUTES.has(pathname)) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/404";
    notFoundUrl.search = "";
    return withLocaleCookie(NextResponse.rewrite(notFoundUrl), request);
  }

  if (VANITY_HOSTS.has(host) && pathSegments.length === 1 && isValidUsername(firstSegment)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/u/${encodeURIComponent(firstSegment)}`;
    return withLocaleCookie(NextResponse.rewrite(rewriteUrl), request);
  }

  const isDemoMode = request.nextUrl.searchParams.get("demo") === "1";
  if (isDemoMode) return withLocaleCookie(NextResponse.next(), request);

  const hasSession = SESSION_COOKIE_NAMES.some((cookieName) => Boolean(request.cookies.get(cookieName)?.value));
  if (pathname.startsWith("/dashboard") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return withLocaleCookie(NextResponse.redirect(url), request);
  }

  return withLocaleCookie(NextResponse.next(), request);
}

function withLocaleCookie(response: NextResponse, request: NextRequest) {
  if (request.nextUrl.searchParams.has("lang")) {
    response.cookies.set(LOCALE_COOKIE_NAME, normalizeLocale(request.nextUrl.searchParams.get("lang")), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
