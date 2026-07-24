create table if not exists public.security_request_rate_limit_buckets (
  scope text not null,
  actor_hash text not null,
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  primary key (scope, actor_hash)
);

create index if not exists security_request_rate_limit_buckets_last_attempt_idx
  on public.security_request_rate_limit_buckets (last_attempt_at);

