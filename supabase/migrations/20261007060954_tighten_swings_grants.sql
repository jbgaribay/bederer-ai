-- Default privileges granted every table privilege to anon/authenticated.
-- Guests never touch swings directly, and signed-in users only need select/insert/delete.
revoke all on public.swings from anon;
revoke all on public.swings from authenticated;
grant select, insert, delete on public.swings to authenticated;

-- rls_auto_enable() backs the ensure_rls event trigger; it is not meant to be called over the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
