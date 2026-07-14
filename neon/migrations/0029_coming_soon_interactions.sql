create table if not exists public.coming_soon_interactions (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null,
  feature_label text not null,
  surface_id text not null,
  surface_label text not null,
  path text,
  user_id uuid references public.users(id) on delete set null,
  anonymous_visitor_hash text,
  created_at timestamptz not null default now(),
  constraint coming_soon_interactions_actor_check check (
    user_id is not null or anonymous_visitor_hash is not null
  )
);

create index if not exists coming_soon_interactions_created_at_idx
  on public.coming_soon_interactions (created_at desc);

create index if not exists coming_soon_interactions_feature_created_at_idx
  on public.coming_soon_interactions (feature_id, created_at desc);

create index if not exists coming_soon_interactions_surface_created_at_idx
  on public.coming_soon_interactions (surface_id, created_at desc);
