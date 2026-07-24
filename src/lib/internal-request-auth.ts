import { timingSafeEqual } from "crypto";

function normalizeToken(value: string | null | undefined) {
  return String(value || "").trim();
}

function tokensMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function readBearerToken(request: Request) {
  return normalizeToken(String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
}

export function hasInternalRequestAccess(input: {
  request: Request;
  configuredTokens: Array<string | null | undefined>;
  tokenHeaderNames?: string[];
}) {
  const configuredTokens = Array.from(new Set(input.configuredTokens.map(normalizeToken).filter(Boolean)));
  if (configuredTokens.length === 0) return false;

  const providedTokens = [
    readBearerToken(input.request),
    ...(input.tokenHeaderNames || []).map((headerName) => normalizeToken(input.request.headers.get(headerName))),
  ].filter(Boolean);

  return configuredTokens.some((configuredToken) =>
    providedTokens.some((providedToken) => tokensMatch(configuredToken, providedToken))
  );
}
