-- Setup Row Level Security policies for medical_record_attachments table
-- This script handles potential conflicts and ensures proper policy setup

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert attachment records" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can view attachment records" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can update attachment records" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can delete attachment records" ON medical_record_attachments;

-- Enable RLS on the table (if not already enabled)
ALTER TABLE medical_record_attachments ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert attachment records
-- Using auth.uid() IS NOT NULL to ensure user is authenticated
CREATE POLICY "Users can insert attachment records" ON medical_record_attachments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to select attachment records
CREATE POLICY "Users can view attachment records" ON medical_record_attachments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update attachment records
CREATE POLICY "Users can update attachment records" ON medical_record_attachments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete attachment records
CREATE POLICY "Users can delete attachment records" ON medical_record_attachments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'medical_record_attachments';

-- IMPORTANT: You also need to setup storage policies manually in Supabase dashboard
-- Go to Storage > Policies and create these policies for the 'fichas-medicas' bucket:

-- 1. Upload Policy:
--    Name: "Authenticated users can upload files"
--    Operation: INSERT
--    Target roles: authenticated
--    Policy definition: auth.role() = 'authenticated'

-- 2. Download Policy:
--    Name: "Authenticated users can download files"
--    Operation: SELECT
--    Target roles: authenticated
--    Policy definition: auth.role() = 'authenticated'

-- 3. Delete Policy:
--    Name: "Authenticated users can delete files"
--    Operation: DELETE
--    Target roles: authenticated
--    Policy definition: auth.role() = 'authenticated'
