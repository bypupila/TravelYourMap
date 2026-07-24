import { tableExists } from "@/lib/db-schema";
import { sql } from "@/lib/neon";

export const LOGIN_WINDOW_MINUTES = 15;
export const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 10;

interface LoginRateBucketRow {
  scope: string;
  actor_hash: string;
  attempts: number;
  window_started_at: string;
}

interface LoginRateActor {
  scope: "identifier" | "ip";
  actorHash: string;
}

export interface LoginRateReservation {
  limited: boolean;
  buckets: LoginRateBucketRow[];
}

export class LoginRateLimitUnavailableError extends Error {
  constructor() {
    super("Login rate-limit storage is unavailable.");
    this.name = "LoginRateLimitUnavailableError";
  }
}

export async function reserveLoginAttempt(identifierHash: string, ipHash: string | null) {
  if (!(await tableExists("public", "auth_login_rate_buckets"))) {
    throw new LoginRateLimitUnavailableError();
  }

  const actors: LoginRateActor[] = [
    { scope: "identifier", actorHash: identifierHash },
    ...(ipHash ? [{ scope: "ip" as const, actorHash: ipHash }] : []),
  ];
  const results = await sql.transaction((txn) =>
    actors.map((actor) => txn`
      insert into public.auth_login_rate_buckets (
        scope,
        actor_hash,
        attempts,
        window_started_at,
        last_attempt_at
      )
      values (${actor.scope}, ${actor.actorHash}, 1, now(), now())
      on conflict (scope, actor_hash)
      do update set
        attempts = case
          when auth_login_rate_buckets.window_started_at <= now() - ${`${LOGIN_WINDOW_MINUTES} minutes`}::interval then 1
          else auth_login_rate_buckets.attempts + 1
        end,
        window_started_at = case
          when auth_login_rate_buckets.window_started_at <= now() - ${`${LOGIN_WINDOW_MINUTES} minutes`}::interval then now()
          else auth_login_rate_buckets.window_started_at
        end,
        last_attempt_at = now()
      returning scope, actor_hash, attempts, window_started_at
    `)
  );
  const buckets = results.flatMap((rows) => rows as LoginRateBucketRow[]);

  if (buckets.length !== actors.length) {
    throw new LoginRateLimitUnavailableError();
  }

  return {
    limited: buckets.some((bucket) => Number(bucket.attempts) > MAX_LOGIN_ATTEMPTS_PER_WINDOW),
    buckets,
  } satisfies LoginRateReservation;
}

export async function releaseSuccessfulLoginReservation(reservation: LoginRateReservation) {
  if (!reservation.buckets.length) return;

  await sql.transaction((txn) =>
    reservation.buckets.map((bucket) => txn`
      update public.auth_login_rate_buckets
      set attempts = greatest(attempts - 1, 0)
      where scope = ${bucket.scope}
        and actor_hash = ${bucket.actor_hash}
        and window_started_at = ${bucket.window_started_at}
    `)
  );
}
