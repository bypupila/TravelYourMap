alter table public.sponsor_report_schedules
  add column if not exists lease_id uuid,
  add column if not exists lease_expires_at timestamptz;

create index if not exists sponsor_report_schedules_lease_expiry_idx
  on public.sponsor_report_schedules (lease_expires_at)
  where lease_id is not null;

update public.sponsor_report_schedules
set lease_expires_at = coalesce(lease_expires_at, updated_at, now())
where lease_id is not null
  and lease_expires_at is null;

with ranked as (
  select id,
         row_number() over (partition by channel_id, sponsor_id order by created_at desc, id desc) as position
  from public.sponsor_report_schedules
  where active = true
)
update public.sponsor_report_schedules schedules
set active = false,
    paused_at = coalesce(paused_at, now()),
    updated_at = now()
from ranked
where schedules.id = ranked.id
  and ranked.position > 1;

create unique index if not exists sponsor_report_schedules_one_active_per_sponsor_idx
  on public.sponsor_report_schedules (channel_id, sponsor_id)
  where active = true;
