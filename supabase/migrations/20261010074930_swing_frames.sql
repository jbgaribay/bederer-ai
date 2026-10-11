-- Store each signed-in swing's 6 reference frames in a private bucket, one folder per user:
--   swing-frames/{user_id}/{swing_id}/frame-{1..6}.jpg
alter table public.swings add column frame_paths text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('swing-frames', 'swing-frames', false, 5242880, array['image/jpeg']);

-- Users can only touch files under their own user-id folder. No update policy: frames are
-- written once and never replaced.
create policy "Users can view their own swing frames"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'swing-frames'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own swing frames"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'swing-frames'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own swing frames"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'swing-frames'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
