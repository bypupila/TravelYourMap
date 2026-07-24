alter type public.subscription_status add value if not exists 'unpaid';

alter table public.subscriptions
  add column if not exists polar_product_id text,
  add column if not exists polar_modified_at timestamptz,
  add column if not exists polar_server text not null default 'production';

update public.subscriptions s
set polar_product_id = p.polar_product_id
from public.subscription_plans p
where s.plan_id = p.id
  and s.polar_product_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_polar_server_check'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_polar_server_check
      check (polar_server in ('production', 'sandbox'));
  end if;
end $$;

create table if not exists public.polar_webhook_events (
  webhook_id text primary key,
  event_type text not null,
  polar_object_id text,
  polar_modified_at timestamptz,
  polar_server text not null,
  received_at timestamptz not null default now(),
  constraint polar_webhook_events_server_check check (polar_server in ('production', 'sandbox'))
);

create index if not exists polar_webhook_events_received_at_idx
  on public.polar_webhook_events (received_at desc);

create index if not exists subscriptions_polar_product_id_idx
  on public.subscriptions (polar_product_id);
