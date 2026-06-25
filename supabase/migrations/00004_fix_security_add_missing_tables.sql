
-- ══════════════════════════════════════════════════════════════════════════════
-- APPRENIX — Migration sécurité + tables manquantes
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. CORRECTION SÉCURITÉ : articles (anon write → authenticated only) ───────
DROP POLICY IF EXISTS "articles_insert_anon" ON articles;
DROP POLICY IF EXISTS "articles_update_anon" ON articles;
DROP POLICY IF EXISTS "articles_delete_anon" ON articles;

CREATE POLICY "articles_insert_auth" ON articles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "articles_update_auth" ON articles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "articles_delete_auth" ON articles
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "articles_select_anon" ON articles
  FOR SELECT TO anon USING (true);

-- ── 2. CORRECTION SÉCURITÉ : community_answers (pas de user_id → limiter update par upvotes) ──
-- Les tables community_questions et community_answers n'ont pas de user_id.
-- On supprime les politiques permissives non sécurisées et on restreint UPDATE à upvotes uniquement.
DROP POLICY IF EXISTS "ca_update_all" ON community_answers;

-- UPDATE : anon interdit, authenticated peut voter (upvotes uniquement via RPC)
CREATE POLICY "ca_update_deny_all" ON community_answers
  FOR UPDATE USING (false);

-- ── 3. ADD user_id column à community_questions et community_answers ──────────
ALTER TABLE community_questions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE community_answers   ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 4. DELETE policies pour community (owner ou admin) ────────────────────────
CREATE POLICY "cq_delete_own" ON community_questions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ca_delete_own" ON community_answers
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── 5. TABLE : flashcard_decks ────────────────────────────────────────────────
CREATE TABLE flashcard_decks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  subject     text        NOT NULL DEFAULT '',
  color       text        NOT NULL DEFAULT 'blue',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fd_select_own" ON flashcard_decks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fd_insert_own" ON flashcard_decks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fd_update_own" ON flashcard_decks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fd_delete_own" ON flashcard_decks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fd_deny_anon"  ON flashcard_decks FOR SELECT TO anon USING (false);

-- ── 6. TABLE : flashcards ─────────────────────────────────────────────────────
CREATE TABLE flashcards (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id      uuid         REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  question     text         NOT NULL CHECK (char_length(question) BETWEEN 1 AND 2000),
  answer       text         NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 2000),
  difficulty   text         NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  next_review  date         NOT NULL DEFAULT CURRENT_DATE,
  review_count integer      NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  ease_factor  numeric(4,2) NOT NULL DEFAULT 2.50,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fc_select_own" ON flashcards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fc_insert_own" ON flashcards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fc_update_own" ON flashcards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fc_delete_own" ON flashcards FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fc_deny_anon"  ON flashcards FOR SELECT TO anon USING (false);

-- ── 7. TABLE : notes ──────────────────────────────────────────────────────────
CREATE TABLE notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  content    text        NOT NULL DEFAULT '',
  subject    text        NOT NULL DEFAULT '',
  tags       text[]      NOT NULL DEFAULT '{}',
  color      text        NOT NULL DEFAULT 'default',
  pinned     boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_own" ON notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes_insert_own" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON notes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes_deny_anon"  ON notes FOR SELECT TO anon USING (false);

-- ── 8. TABLE : revision_sessions ──────────────────────────────────────────────
CREATE TABLE revision_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      text        NOT NULL,
  duration_min integer     NOT NULL DEFAULT 0 CHECK (duration_min >= 0),
  score        integer     CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  session_date date        NOT NULL DEFAULT CURRENT_DATE,
  notes_text   text        CHECK (char_length(notes_text) <= 1000),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE revision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rs_select_own" ON revision_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rs_insert_own" ON revision_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rs_delete_own" ON revision_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rs_deny_anon"  ON revision_sessions FOR SELECT TO anon USING (false);

-- ── 9. TABLE : pomodoro_sessions ──────────────────────────────────────────────
CREATE TABLE pomodoro_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_min integer     NOT NULL CHECK (duration_min > 0),
  completed    boolean     NOT NULL DEFAULT true,
  subject      text        NOT NULL DEFAULT '',
  session_date date        NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ps_select_own" ON pomodoro_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ps_insert_own" ON pomodoro_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ps_delete_own" ON pomodoro_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ps_deny_anon"  ON pomodoro_sessions FOR SELECT TO anon USING (false);

-- ── 10. TABLE : user_settings ─────────────────────────────────────────────────
CREATE TABLE user_settings (
  user_id       uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode     boolean NOT NULL DEFAULT false,
  notifications boolean NOT NULL DEFAULT true,
  socratic_mode boolean NOT NULL DEFAULT false,
  language      text    NOT NULL DEFAULT 'fr',
  font_size     text    NOT NULL DEFAULT 'normal' CHECK (font_size IN ('small','normal','large','xlarge')),
  high_contrast boolean NOT NULL DEFAULT false,
  dyslexia_font boolean NOT NULL DEFAULT false,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "us_select_own" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "us_insert_own" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_update_own" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_deny_anon"  ON user_settings FOR SELECT TO anon USING (false);

-- ── 11. TRIGGERS updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_fd_updated_at BEFORE UPDATE ON flashcard_decks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fc_updated_at BEFORE UPDATE ON flashcards       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON notes         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_us_updated_at BEFORE UPDATE ON user_settings    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 12. TRIGGER auto-création profil + settings à l'inscription ────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, school_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Élève'),
    COALESCE(NEW.raw_user_meta_data->>'school_level', '2nde')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 13. INDEXES PERFORMANCE ────────────────────────────────────────────────────
CREATE INDEX idx_todos_user_created      ON todos             (user_id, created_at DESC);
CREATE INDEX idx_calendar_user_date      ON calendar_events   (user_id, event_date DESC);
CREATE INDEX idx_ai_history_user_created ON ai_history        (user_id, created_at DESC);
CREATE INDEX idx_flashcards_user_review  ON flashcards        (user_id, next_review ASC);
CREATE INDEX idx_flashcards_deck         ON flashcards        (deck_id);
CREATE INDEX idx_fd_user_created         ON flashcard_decks   (user_id, created_at DESC);
CREATE INDEX idx_notes_user_updated      ON notes             (user_id, updated_at DESC);
CREATE INDEX idx_notes_pinned            ON notes             (user_id, pinned) WHERE pinned = true;
CREATE INDEX idx_rs_user_date            ON revision_sessions (user_id, session_date DESC);
CREATE INDEX idx_ps_user_date            ON pomodoro_sessions (user_id, session_date DESC);
CREATE INDEX idx_articles_published      ON articles          (published_at DESC);
CREATE INDEX idx_articles_featured       ON articles          (featured) WHERE featured = true;
CREATE INDEX idx_community_q_created     ON community_questions (created_at DESC);
CREATE INDEX idx_community_a_question    ON community_answers   (question_id);
CREATE INDEX idx_badges_user             ON user_badges         (user_id);

-- ── 14. STORAGE BUCKETS ────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',         'avatars',         true,  1048576, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('scanner-uploads', 'scanner-uploads', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS — avatars (public read, owner write)
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS — scanner-uploads (owner only)
CREATE POLICY "scanner_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'scanner-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "scanner_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'scanner-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "scanner_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'scanner-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
