alter table public.sponsor_bulk_assign_jobs
  add column if not exists lease_id uuid,
  add column if not exists lease_expires_at timestamptz;

create index if not exists sponsor_bulk_assign_jobs_lease_expiry_idx
  on public.sponsor_bulk_assign_jobs (status, lease_expires_at)
  where status = 'running';

update public.sponsor_bulk_assign_jobs
set lease_expires_at = coalesce(lease_expires_at, updated_at, now())
where status = 'running'
  and lease_expires_at is null;
