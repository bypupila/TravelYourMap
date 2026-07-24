import { createHash } from "crypto";
import { tableExists } from "@/lib/db-schema";
import { sql } from "@/lib/neon";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function readClientIp(request: Request) {
  const forwardedFor = String(request.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    ?.trim();
  if (forwardedFor) return forwardedFor;
  return String(request.headers.get("x-real-ip") || "").trim();
}

function readUserAgent(request: Request) {
  return String(request.headers.get("user-agent") || "").trim();
}

function resolveActorHash(request: Request) {
  const ip = readClientIp(request);
  if (ip) return hashValue(`ip:${ip}`);

  const userAgent = readUserAgent(request);
  if (userAgent) return hashValue(`ua:${userAgent}`);

  return null;
}

export async function enforceRequestRateLimit(params: {
  request: Request;
  scope: string;
  windowMinutes: number;
  maxAttempts: number;
  failClosed?: boolean;
}) {
  const { request, scope, windowMinutes, maxAttempts, failClosed = false } = params;
  const actorHash = resolveActorHash(request);
  if (!actorHash) {
    return failClosed
      ? { allowed: false as const, retryAfterSeconds: 60 }
      : { allowed: true as const, retryAfterSeconds: null as number | null };
  }

  return reserveRateLimitBucket({
    scope,
    actorHash,
    windowMinutes,
    maxAttempts,
    failClosed,
  });
}

export async function enforceActorRateLimit(params: {
  scope: string;
  actorKey: string;
  windowMinutes: number;
  maxAttempts: number;
  failClosed?: boolean;
}) {
  const actorKey = String(params.actorKey || "").trim();
  if (!actorKey) {
    return params.failClosed
      ? { allowed: false as const, retryAfterSeconds: 60 }
      : { allowed: true as const, retryAfterSeconds: null as number | null };
  }
  return reserveRateLimitBucket({
    scope: params.scope,
    actorHash: hashValue(`actor:${actorKey}`),
    windowMinutes: params.windowMinutes,
    maxAttempts: params.maxAttempts,
    failClosed: params.failClosed,
  });
}

async function reserveRateLimitBucket(params: {
  scope: string;
  actorHash: string;
  windowMinutes: number;
  maxAttempts: number;
  failClosed?: boolean;
}) {
  const {
    scope,
    actorHash,
    windowMinutes,
    maxAttempts,
    failClosed = false,
  } = params;
  try {
    if (!(await tableExists("public", "security_request_rate_limit_buckets"))) {
      return failClosed
        ? { allowed: false as const, retryAfterSeconds: 60 }
        : { allowed: true as const, retryAfterSeconds: null as number | null };
    }
    const rows = await sql<Array<{ attempts: number }>>`
      insert into public.security_request_rate_limit_buckets (
        scope,
        actor_hash,
        attempts,
        window_started_at,
        last_attempt_at
      )
      values (${scope}, ${actorHash}, 1, now(), now())
      on conflict (scope, actor_hash)
      do update set
        attempts = case
          when security_request_rate_limit_buckets.window_started_at <= now() - ${`${windowMinutes} minutes`}::interval then 1
          else security_request_rate_limit_buckets.attempts + 1
        end,
        window_started_at = case
          when security_request_rate_limit_buckets.window_started_at <= now() - ${`${windowMinutes} minutes`}::interval then now()
          else security_request_rate_limit_buckets.window_started_at
        end,
        last_attempt_at = now()
      returning attempts
    `;
    const attempts = rows[0]?.attempts || 0;
    if (attempts > maxAttempts) {
      return {
        allowed: false as const,
        retryAfterSeconds: Math.max(60, Math.ceil((windowMinutes * 60) / Math.max(1, maxAttempts))),
      };
    }

    return { allowed: true as const, retryAfterSeconds: null as number | null };
  } catch (error) {
    console.error("[request-rate-limit] failed", { scope, failClosed, error });
    return failClosed
      ? { allowed: false as const, retryAfterSeconds: 60 }
      : { allowed: true as const, retryAfterSeconds: null as number | null };
  }
}
