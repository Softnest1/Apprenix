
-- Ajouter les types vidéo au bucket collaboration-files
UPDATE storage.buckets
SET
  allowed_mime_types = array_append(allowed_mime_types, 'video/mp4'),
  file_size_limit    = 209715200  -- 200 Mo pour les vidéos
WHERE id = 'collaboration-files'
  AND NOT ('video/mp4' = ANY(allowed_mime_types));

UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'video/webm')
WHERE id = 'collaboration-files'
  AND NOT ('video/webm' = ANY(allowed_mime_types));

UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'video/ogg')
WHERE id = 'collaboration-files'
  AND NOT ('video/ogg' = ANY(allowed_mime_types));

UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'video/quicktime')
WHERE id = 'collaboration-files'
  AND NOT ('video/quicktime' = ANY(allowed_mime_types));

UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'video/x-msvideo')
WHERE id = 'collaboration-files'
  AND NOT ('video/x-msvideo' = ANY(allowed_mime_types));
