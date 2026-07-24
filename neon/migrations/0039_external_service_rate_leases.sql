create table if not exists public.external_service_rate_leases (
  scope text primary key,
  next_allowed_at timestamptz not null,
  updated_at timestamptz not null default now()
);
