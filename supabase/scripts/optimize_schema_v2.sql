
-- ══════════════════════════════════════════════════════════════════════════════
-- Apprenix — Schema optimisé v2
-- Sécurité : RLS activé sur toutes les tables, politiques owner-only strictes
-- Performance : index couvrants sur user_id + date, trigger updated_at
-- Idempotent : IF NOT EXISTS + DROP POLICY IF EXISTS + ON CONFLICT DO NOTHING
-- ══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLES (idempotentes)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text        NOT NULL DEFAULT '',
  avatar_url         text,
  school_level       text        NOT NULL DEFAULT '2nde',
  favorite_subjects  text[]      NOT NULL DEFAULT '{}',
  xp_points          integer     NOT NULL DEFAULT 0 CHECK (xp_points >= 0),
  streak_days        integer     NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_active_date   date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  priority    text        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date    date,
  completed   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  event_type  text        NOT NULL DEFAULT 'other'
                CHECK (event_type IN ('cours', 'examen', 'devoir', 'revision', 'other')),
  event_date  date        NOT NULL,
  start_time  text,
  end_time    text,
  subject     text,
  notes       text        CHECK (char_length(notes) <= 2000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question    text        NOT NULL CHECK (char_length(question) BETWEEN 1 AND 5000),
  subject     text        NOT NULL,
  level       text        NOT NULL,
  answer      text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id     text        NOT NULL CHECK (char_length(badge_id) BETWEEN 1 AND 100),
  unlocked_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER : updated_at automatique sur profiles
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGER : création de profil automatique à l'inscription
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, school_level)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'school_level'), ''), '2nde')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEX DE PERFORMANCE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_todos_user_id        ON todos (user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos (user_id, completed);
CREATE INDEX IF NOT EXISTS idx_todos_user_due       ON todos (user_id, due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_user_id     ON calendar_events (user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date   ON calendar_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_user_type   ON calendar_events (user_id, event_type);

CREATE INDEX IF NOT EXISTS idx_ai_history_user_id   ON ai_history (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_date ON ai_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id  ON user_badges (user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges     ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT    TO authenticated USING      (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT    TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE    TO authenticated USING      (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE    TO authenticated USING      (auth.uid() = id);

-- ─── Todos ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "todos_select_own" ON todos;
DROP POLICY IF EXISTS "todos_insert_own" ON todos;
DROP POLICY IF EXISTS "todos_update_own" ON todos;
DROP POLICY IF EXISTS "todos_delete_own" ON todos;

CREATE POLICY "todos_select_own" ON todos FOR SELECT    TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "todos_insert_own" ON todos FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_update_own" ON todos FOR UPDATE    TO authenticated USING      (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_delete_own" ON todos FOR DELETE    TO authenticated USING      (auth.uid() = user_id);

-- ─── Calendar events ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "calendar_select_own" ON calendar_events;
DROP POLICY IF EXISTS "calendar_insert_own" ON calendar_events;
DROP POLICY IF EXISTS "calendar_update_own" ON calendar_events;
DROP POLICY IF EXISTS "calendar_delete_own" ON calendar_events;

CREATE POLICY "calendar_select_own" ON calendar_events FOR SELECT    TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "calendar_insert_own" ON calendar_events FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calendar_update_own" ON calendar_events FOR UPDATE    TO authenticated USING      (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calendar_delete_own" ON calendar_events FOR DELETE    TO authenticated USING      (auth.uid() = user_id);

-- ─── AI history ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ai_history_select_own" ON ai_history;
DROP POLICY IF EXISTS "ai_history_insert_own" ON ai_history;
DROP POLICY IF EXISTS "ai_history_delete_own" ON ai_history;

CREATE POLICY "ai_history_select_own" ON ai_history FOR SELECT    TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "ai_history_insert_own" ON ai_history FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_history_delete_own" ON ai_history FOR DELETE    TO authenticated USING      (auth.uid() = user_id);

-- ─── User badges ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "badges_select_own" ON user_badges;
DROP POLICY IF EXISTS "badges_insert_own" ON user_badges;
DROP POLICY IF EXISTS "badges_delete_own" ON user_badges;

CREATE POLICY "badges_select_own" ON user_badges FOR SELECT    TO authenticated USING      (auth.uid() = user_id);
CREATE POLICY "badges_insert_own" ON user_badges FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "badges_delete_own" ON user_badges FOR DELETE    TO authenticated USING      (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET : avatars
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_select_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

CREATE POLICY "avatars_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
