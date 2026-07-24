alter table public.channels
  add column if not exists ownership_status text not null default 'pending',
  add column if not exists ownership_verified_at timestamptz,
  add column if not exists ownership_verified_by uuid references public.users(id) on delete set null,
  add column if not exists ownership_verification_method text,
  add column if not exists ownership_verification_note text;

alter table public.channels
  drop constraint if exists channels_ownership_status_check;

alter table public.channels
  add constraint channels_ownership_status_check
  check (ownership_status in ('pending', 'verified', 'revoked'));

alter table public.channels
  alter column is_public set default false;

alter table public.channels
  drop constraint if exists channels_youtube_channel_id_key;

drop index if exists public.channels_youtube_channel_id_key;

create index if not exists channels_youtube_channel_id_idx
  on public.channels (youtube_channel_id)
  where youtube_channel_id is not null;

create unique index if not exists channels_verified_youtube_channel_id_key
  on public.channels (youtube_channel_id)
  where youtube_channel_id is not null and ownership_status = 'verified';

create table if not exists public.channel_ownership_audit (
  id bigserial primary key,
  channel_id uuid not null references public.channels(id) on delete cascade,
  youtube_channel_id text,
  previous_status text not null,
  new_status text not null,
  verification_method text,
  verification_note text,
  changed_by_user_id uuid not null references public.users(id),
  changed_by_username text not null,
  created_at timestamptz not null default now()
);

create index if not exists channel_ownership_audit_channel_created_idx
  on public.channel_ownership_audit (channel_id, created_at desc);

update public.channels
set is_public = false
where ownership_status <> 'verified';

