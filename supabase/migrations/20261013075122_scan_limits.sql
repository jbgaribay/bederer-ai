-- Daily scan limits. Every scan attempt is logged in a private table that users can't read or
-- change, so deleting swings doesn't give scans back.
create table private.scan_usage (
  id bigint generated always as identity primary key,
  subject text not null, -- 'user:<uuid>' or 'ip:<sha256 of the IP>'
  created_at timestamptz not null default now()
);

create index scan_usage_subject_created_at_idx on private.scan_usage (subject, created_at desc);

-- No direct access for API roles; only claim_scan() below touches this table
revoke all on private.scan_usage from public, anon, authenticated;

-- Called by the analyze route before each scan. Signed-in callers are counted by their user id
-- (the ip_hash argument is ignored); guests by the hashed IP the server passes in. Returns true
-- and records the scan if the caller is under max_per_day for the last 24 hours.
-- Calling this directly can only add usage, never remove it, so it can't be used to get around
-- the limit.
create function public.claim_scan(ip_hash text, max_per_day integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  scan_subject text;
  used integer;
begin
  if (select auth.uid()) is not null then
    scan_subject := 'user:' || (select auth.uid())::text;
  elsif ip_hash ~ '^[0-9a-f]{64}$' then
    scan_subject := 'ip:' || ip_hash;
  else
    return false;
  end if;

  -- One claim at a time per subject, so parallel requests can't race past the limit
  perform pg_advisory_xact_lock(hashtext(scan_subject));

  select count(*) into used
  from private.scan_usage
  where subject = scan_subject and created_at > now() - interval '24 hours';

  if used >= max_per_day then
    return false;
  end if;

  insert into private.scan_usage (subject) values (scan_subject);
  return true;
end;
$$;

revoke execute on function public.claim_scan(text, integer) from public;
grant execute on function public.claim_scan(text, integer) to anon, authenticated;
