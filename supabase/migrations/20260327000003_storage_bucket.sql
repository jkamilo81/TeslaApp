-- Storage bucket and RLS policies for pet documents
-- Bucket: pet-documents (private)
-- Path format: {pet_id}/{tipo_registro}/{registro_id}/{nombre_archivo}
-- Accepted MIME types: image/jpeg, image/png, application/pdf
-- Max file size: 10 MB (10485760 bytes)

-- ============================================================
-- CREATE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-documents',
  'pet-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
);

-- ============================================================
-- RLS POLICIES FOR storage.objects
-- Only authenticated users who own the pet (first path segment) can read/write
-- ============================================================

-- SELECT: Users can view files for their own pets
create policy "Users can view files for their pets"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where user_id = auth.uid()
    )
  );

-- INSERT: Users can upload files for their own pets
create policy "Users can upload files for their pets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where user_id = auth.uid()
    )
  );

-- UPDATE: Users can update files for their own pets
create policy "Users can update files for their pets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where user_id = auth.uid()
    )
  );

-- DELETE: Users can delete files for their own pets
create policy "Users can delete files for their pets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where user_id = auth.uid()
    )
  );
