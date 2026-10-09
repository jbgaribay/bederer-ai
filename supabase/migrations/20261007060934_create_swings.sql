-- Saved swing analyses for signed-in users.
create table public.swings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  shot_type text not null,
  overall_score numeric(3, 1) not null,
  categories jsonb not null,
  top_priority text not null,
  drill_recommendation text not null
);

create index swings_user_id_created_at_idx on public.swings (user_id, created_at desc);

alter table public.swings enable row level security;

grant select, insert, delete on public.swings to authenticated;

create policy "Users can view their own swings"
  on public.swings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own swings"
  on public.swings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own swings"
  on public.swings for delete
  to authenticated
  using ((select auth.uid()) = user_id);
