-- 기존 academy_data는 삭제하거나 변경하지 않습니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academy-originals', 'academy-originals', false, 10485760, array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public = false;
-- 아래 정책은 최초 1회 실행합니다. 이미 동일한 이름이 있으면 중복 생성하지 마세요.
create policy "academy originals read own" on storage.objects for select to authenticated
using (bucket_id = 'academy-originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "academy originals insert own" on storage.objects for insert to authenticated
with check (bucket_id = 'academy-originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "academy originals update own" on storage.objects for update to authenticated
using (bucket_id = 'academy-originals' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'academy-originals' and (storage.foldername(name))[1] = (select auth.uid())::text);
