import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/lib/auth-session";
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
]);
const RESERVED_PATHS = new Set(["", "admin", "auth", "dashboard", "creator-panel", "onboarding", "pricing", "explore", "map", "api", "u", "_next", "monitoring"]);
const LOCAL_ONLY_ROUTES = new Set([
  "/map-proposal",
  "/map-proposal-v1",
  "/map-proposal-2",
  "/map-admin-proposal",
  "/demo-diseno",
  "/country-card-proposals",
]);

export async function proxy(request: NextRequest) {
  const host = String(request.headers.get("host") || "").split(":")[0].toLowerCase();
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.replace(/^\//, "").split("/")[0] || "";

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

  if (VANITY_HOSTS.has(host) && !RESERVED_PATHS.has(firstSegment) && !pathname.startsWith("/favicon")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/u/${firstSegment}`;
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
  matcher: ["/dashboard/:path*", "/((?!.*\\..*).*)"],
};
