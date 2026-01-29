-- Storage bucket for organization candidate resumes
-- Run this in Supabase SQL Editor

-- Create the storage bucket for org resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-resumes',
  'org-resumes',
  false,  -- Private bucket
  10485760,  -- 10MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Organization members can upload resumes for their org
CREATE POLICY "Org members can upload resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'org-resumes'
  AND auth.role() = 'authenticated'
);

-- Policy: Organization members can view their org's resumes
CREATE POLICY "Org members can view resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'org-resumes'
  AND auth.role() = 'authenticated'
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
ON storage.objects
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
