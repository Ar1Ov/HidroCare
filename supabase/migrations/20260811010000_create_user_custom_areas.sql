create table if not exists public.user_custom_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area_key text not null,
  label text not null,
  color_index smallint not null check (color_index between 0 and 4),
  created_at timestamptz not null default now(),
  unique (user_id, area_key),
  unique (user_id, color_index),
  constraint user_custom_areas_key check (area_key ~ '^custom:[a-z0-9][a-z0-9 ''-]{0,39}$'),
  constraint user_custom_areas_label check (char_length(label) between 1 and 40)
);

alter table public.user_custom_areas enable row level security;

drop policy if exists "Users manage their custom areas" on public.user_custom_areas;
create policy "Users manage their custom areas"
on public.user_custom_areas
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists user_custom_areas_user_idx
on public.user_custom_areas (user_id, color_index);
