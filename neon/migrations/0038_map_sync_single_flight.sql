with ranked as (
  select id,
         row_number() over (partition by channel_id order by updated_at desc, created_at desc) as position
  from public.map_sync_runs
  where status = 'running'
)
update public.map_sync_runs runs
set status = 'failed',
    error_message = coalesce(error_message, 'Superseded while enabling single-flight sync protection.'),
    finished_at = coalesce(finished_at, now()),
    updated_at = now()
from ranked
where runs.id = ranked.id
  and ranked.position > 1;

create unique index if not exists map_sync_runs_one_running_per_channel_idx
  on public.map_sync_runs (channel_id)
  where status = 'running';
