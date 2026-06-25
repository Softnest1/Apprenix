
-- ── Bucket collaboration-files ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'collaboration-files',
  'collaboration-files',
  false,
  20971520, -- 20 MB max
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Fonction helper : vérifier que l'utilisateur est participant de la collaboration ──
-- (réutilise is_collaboration_participant déjà définie)

-- ── Policies Storage : seuls les participants peuvent voir/uploader ────────
CREATE POLICY "collab_files_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'collaboration-files'
    AND is_collaboration_participant((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "collab_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'collaboration-files'
    AND is_collaboration_participant((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "collab_files_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'collaboration-files'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
