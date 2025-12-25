-- Create showcase-images storage bucket
-- Run this in your Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner, created_at, updated_at)
VALUES (
  'showcase-images',
  'showcase-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  null,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create RLS policy to allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'showcase-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Create RLS policy to allow anyone to view images
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'showcase-images');

-- Create RLS policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'showcase-images' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
