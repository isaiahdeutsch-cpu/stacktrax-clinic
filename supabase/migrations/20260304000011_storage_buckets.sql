-- ============================================================================
-- Migration 011: Storage Buckets and Storage RLS
-- ============================================================================

-- Lab reports and clinical documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-documents',
  'clinic-documents',
  false,
  20971520, -- 20MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Org logos and branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-assets',
  'org-assets',
  true,   -- public so logos can be displayed without auth
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Storage RLS policies for clinic-documents
-- Files organized as: {org_id}/{patient_profile_id}/{filename}
CREATE POLICY "Org staff read clinic documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinic-documents'
  AND is_org_member_with_role((storage.foldername(name))[1]::uuid, 'staff')
);

CREATE POLICY "Clinician+ upload clinic documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinic-documents'
  AND is_org_member_with_role((storage.foldername(name))[1]::uuid, 'clinician')
);

CREATE POLICY "Admin delete clinic documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinic-documents'
  AND is_org_member_with_role((storage.foldername(name))[1]::uuid, 'admin')
);

-- Storage RLS for message-attachments
-- Files organized as: {org_id}/{thread_id}/{filename}
CREATE POLICY "Org staff read message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND is_org_member_with_role((storage.foldername(name))[1]::uuid, 'staff')
);

CREATE POLICY "Clinician+ upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND is_org_member_with_role((storage.foldername(name))[1]::uuid, 'clinician')
);

-- PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
