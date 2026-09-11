-- Tenant-scoped Supabase Storage policy.
-- Path convention: <tenant-uuid>/<folder>/<filename>

create or replace function public.try_uuid(p_value text)
returns uuid
language plpgsql
immutable
security invoker
set search_path = public
as $$
begin
  return p_value::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
  ('tenant-media-public','tenant-media-public',true,26214400,array[
    'image/jpeg','image/png','image/webp','image/avif','image/svg+xml',
    'video/mp4','video/webm','application/pdf'
  ]),
  ('tenant-media-private','tenant-media-private',false,26214400,array[
    'image/jpeg','image/png','image/webp','image/avif',
    'video/mp4','video/webm','application/pdf'
  ])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- Public bucket read.
drop policy if exists tenant_media_public_read on storage.objects;
create policy tenant_media_public_read
on storage.objects for select
using (bucket_id='tenant-media-public');

-- Private bucket read requires tenant membership.
drop policy if exists tenant_media_private_member_read on storage.objects;
create policy tenant_media_private_member_read
on storage.objects for select to authenticated
using (
  bucket_id='tenant-media-private'
  and public.is_tenant_member(public.try_uuid((storage.foldername(name))[1]))
);

-- Uploads require media.write and the first folder must be a valid tenant UUID.
drop policy if exists tenant_media_public_write on storage.objects;
create policy tenant_media_public_write
on storage.objects for insert to authenticated
with check (
  bucket_id='tenant-media-public'
  and public.try_uuid((storage.foldername(name))[1]) is not null
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);

drop policy if exists tenant_media_private_write on storage.objects;
create policy tenant_media_private_write
on storage.objects for insert to authenticated
with check (
  bucket_id='tenant-media-private'
  and public.try_uuid((storage.foldername(name))[1]) is not null
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);

-- Update/delete require media.write for the owning tenant.
drop policy if exists tenant_media_public_update on storage.objects;
create policy tenant_media_public_update
on storage.objects for update to authenticated
using (
  bucket_id='tenant-media-public'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
)
with check (
  bucket_id='tenant-media-public'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);

drop policy if exists tenant_media_private_update on storage.objects;
create policy tenant_media_private_update
on storage.objects for update to authenticated
using (
  bucket_id='tenant-media-private'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
)
with check (
  bucket_id='tenant-media-private'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);

drop policy if exists tenant_media_public_delete on storage.objects;
create policy tenant_media_public_delete
on storage.objects for delete to authenticated
using (
  bucket_id='tenant-media-public'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);

drop policy if exists tenant_media_private_delete on storage.objects;
create policy tenant_media_private_delete
on storage.objects for delete to authenticated
using (
  bucket_id='tenant-media-private'
  and public.has_tenant_permission(public.try_uuid((storage.foldername(name))[1]),'media.write')
);
