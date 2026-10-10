-- Player profiles: one row per auth user, created by a trigger at sign-up.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 50),
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  utr numeric(4, 2) check (utr between 1 and 16.5),
  usta_level numeric(2, 1) check (usta_level between 1.5 and 7.0 and usta_level * 2 = trunc(usta_level * 2)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users read and edit only their own profile; rows are created by the trigger and removed by the cascade.
-- Revoke the project's default all-privileges grants first.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, username, utr, usta_level) on public.profiles to authenticated;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep updated_at current
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Create the profile from the sign-up form's metadata
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, username, utr, usta_level)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), 'Player'),
    coalesce(nullif(lower(trim(new.raw_user_meta_data ->> 'username')), ''), 'user_' || left(new.id::text, 8)),
    nullif(new.raw_user_meta_data ->> 'utr', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'usta_level', '')::numeric
  );
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public;
revoke execute on function private.handle_new_user() from public;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Lets the sign-up form check a username before submitting (reveals only whether it exists)
create function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.profiles where username = lower(trim(name)));
$$;

revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- Profiles for accounts created before this migration
insert into public.profiles (id, first_name, username)
select id, 'Player', 'user_' || left(id::text, 8)
from auth.users
on conflict (id) do nothing;
