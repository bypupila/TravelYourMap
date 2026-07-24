alter table public.channel_import_runs
  add column if not exists lease_id uuid,
  add column if not exists lease_expires_at timestamptz;

create index if not exists channel_import_runs_lease_expiry_idx
  on public.channel_import_runs (status, lease_expires_at)
  where status = 'running';

update public.channel_import_runs
set lease_expires_at = coalesce(lease_expires_at, updated_at, now())
where status = 'running'
  and lease_expires_at is null;

