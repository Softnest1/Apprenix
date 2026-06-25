
-- ═══════════════════════════════════════════════════════════════════
-- APPRENIX v3.1 — Migration complète plateforme 3000%
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Extension de la table profiles ───────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role             TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student','parent','teacher','admin')),
  ADD COLUMN IF NOT EXISTS accessibility_prefs JSONB,
  ADD COLUMN IF NOT EXISTS parent_of        UUID[] DEFAULT '{}';

-- ── 2. Table content_items (cours, fiches, exercices, ressources) ───
CREATE TABLE content_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT        NOT NULL CHECK (type IN ('course','sheet','exercise','answer','article','resource')),
  title          TEXT        NOT NULL,
  body           TEXT        NOT NULL DEFAULT '',
  author_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject        TEXT        NOT NULL DEFAULT '',
  level          TEXT[]      NOT NULL DEFAULT '{}',
  accessibility  TEXT[]      DEFAULT '{}',
  status         TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  is_ai_generated BOOLEAN    NOT NULL DEFAULT FALSE,
  verified_by    UUID        REFERENCES profiles(id),
  verified_at    TIMESTAMPTZ,
  published_at   TIMESTAMPTZ,
  attachments    TEXT[]      DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- ── 3. Table student_questions ──────────────────────────────────────
CREATE TABLE student_questions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  subject     TEXT        NOT NULL DEFAULT '',
  level       TEXT        NOT NULL DEFAULT '',
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL DEFAULT '',
  attachments TEXT[]      DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE student_questions ENABLE ROW LEVEL SECURITY;

-- ── 4. Table teacher_answers ────────────────────────────────────────
CREATE TABLE teacher_answers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID        NOT NULL REFERENCES student_questions(id) ON DELETE CASCADE,
  teacher_id   UUID        NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  body         TEXT        NOT NULL DEFAULT '',
  attachments  TEXT[]      DEFAULT '{}',
  is_official  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE teacher_answers ENABLE ROW LEVEL SECURITY;

-- ── 5. Table student_submissions ────────────────────────────────────
CREATE TABLE student_submissions (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID         NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  subject          TEXT         NOT NULL DEFAULT '',
  title            TEXT         NOT NULL,
  description      TEXT         NOT NULL DEFAULT '',
  file_urls        TEXT[]       NOT NULL DEFAULT '{}',
  file_types       TEXT[]       NOT NULL DEFAULT '{}',
  status           TEXT         NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','graded')),
  teacher_feedback TEXT,
  grade            NUMERIC(4,2),
  teacher_id       UUID         REFERENCES profiles(id),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

-- ── 6. Table parent_messages ────────────────────────────────────────
CREATE TABLE parent_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL,
  sender_role TEXT        NOT NULL CHECK (sender_role IN ('parent','teacher')),
  read        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE parent_messages ENABLE ROW LEVEL SECURITY;

-- ── 7. Table site_integrity_checks ──────────────────────────────────
CREATE TABLE site_integrity_checks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT        NOT NULL,
  target_url TEXT        NOT NULL,
  status     TEXT        NOT NULL CHECK (status IN ('pass','warn','fail')),
  details    JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE site_integrity_checks ENABLE ROW LEVEL SECURITY;

-- ── 8. Storage buckets ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('question-attachments', 'question-attachments', false, 52428800,
   ARRAY['application/pdf','image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','audio/ogg']),
  ('submission-files', 'submission-files', false, 52428800,
   ARRAY['application/pdf','image/jpeg','image/png','image/webp',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/msword']),
  ('content-attachments', 'content-attachments', false, 52428800,
   ARRAY['application/pdf','image/jpeg','image/png','image/webp','audio/mpeg','video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Helper SECURITY DEFINER pour lire le rôle sans boucle RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ── content_items ───────────────────────────────────────────────────
CREATE POLICY "published_readable_by_all"
  ON content_items FOR SELECT
  USING (status = 'published');

CREATE POLICY "authors_manage_own"
  ON content_items FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid() AND is_ai_generated = FALSE);

CREATE POLICY "admins_full_access_content"
  ON content_items FOR ALL
  USING (get_my_role() IN ('admin','teacher'))
  WITH CHECK (get_my_role() IN ('admin','teacher') AND is_ai_generated = FALSE);

-- ── student_questions ───────────────────────────────────────────────
CREATE POLICY "students_manage_own_questions"
  ON student_questions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_read_all_questions"
  ON student_questions FOR SELECT
  USING (get_my_role() IN ('teacher','admin'));

-- ── teacher_answers ─────────────────────────────────────────────────
-- Réponses officielles lisibles par tous les étudiants authentifiés
CREATE POLICY "official_answers_readable"
  ON teacher_answers FOR SELECT
  USING (
    is_official = TRUE AND auth.role() = 'authenticated'
    OR teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM student_questions sq
      WHERE sq.id = question_id AND sq.student_id = auth.uid()
    )
  );

CREATE POLICY "teachers_manage_own_answers"
  ON teacher_answers FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- ── student_submissions ─────────────────────────────────────────────
CREATE POLICY "students_own_submissions"
  ON student_submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_read_grade_submissions"
  ON student_submissions FOR SELECT
  USING (get_my_role() IN ('teacher','admin'));

CREATE POLICY "teachers_update_submissions"
  ON student_submissions FOR UPDATE
  USING (get_my_role() IN ('teacher','admin'))
  WITH CHECK (get_my_role() IN ('teacher','admin'));

CREATE POLICY "parents_read_child_submissions"
  ON student_submissions FOR SELECT
  USING (
    student_id IN (
      SELECT unnest(parent_of) FROM profiles WHERE id = auth.uid()
    )
  );

-- ── parent_messages ─────────────────────────────────────────────────
CREATE POLICY "participants_read_messages"
  ON parent_messages FOR SELECT
  USING (parent_id = auth.uid() OR teacher_id = auth.uid());

CREATE POLICY "participants_send_messages"
  ON parent_messages FOR INSERT
  WITH CHECK (
    (sender_role = 'parent' AND parent_id = auth.uid())
    OR (sender_role = 'teacher' AND teacher_id = auth.uid())
  );

CREATE POLICY "mark_messages_read"
  ON parent_messages FOR UPDATE
  USING (parent_id = auth.uid() OR teacher_id = auth.uid())
  WITH CHECK (parent_id = auth.uid() OR teacher_id = auth.uid());

-- ── site_integrity_checks ───────────────────────────────────────────
CREATE POLICY "admins_manage_integrity"
  ON site_integrity_checks FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "admins_read_integrity"
  ON site_integrity_checks FOR SELECT
  USING (get_my_role() IN ('admin','teacher'));

-- ── Storage policies ────────────────────────────────────────────────
CREATE POLICY "auth_upload_questions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'question-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "owner_read_questions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "auth_upload_submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submission-files' AND auth.role() = 'authenticated');

CREATE POLICY "owner_read_submissions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-files' AND auth.role() = 'authenticated');

CREATE POLICY "teachers_upload_content"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "auth_read_content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-attachments' AND auth.role() = 'authenticated');
