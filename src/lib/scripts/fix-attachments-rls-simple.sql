-- Fix RLS policies for medical_record_attachments table
-- This creates very permissive policies for testing

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own attachments" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can view their own attachments" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON medical_record_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON medical_record_attachments;

-- Create very simple policies for testing
CREATE POLICY "Allow authenticated users to insert attachments" ON medical_record_attachments
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select attachments" ON medical_record_attachments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update attachments" ON medical_record_attachments
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete attachments" ON medical_record_attachments
    FOR DELETE TO authenticated
    USING (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'medical_record_attachments';
