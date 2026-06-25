
-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  school_level text NOT NULL DEFAULT '2nde',
  favorite_subjects text[] DEFAULT '{}',
  xp_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_active_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Todos table
CREATE TABLE todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Calendar events table
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'other' CHECK (event_type IN ('cours', 'examen', 'devoir', 'revision', 'other')),
  event_date date NOT NULL,
  start_time text,
  end_time text,
  subject text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI question history
CREATE TABLE ai_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  subject text NOT NULL,
  level text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User progress / badges
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Anon no access profiles" ON profiles FOR SELECT TO anon USING (false);

-- Todos policies
CREATE POLICY "Users can view own todos" ON todos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos" ON todos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anon no access todos" ON todos FOR SELECT TO anon USING (false);

-- Calendar events policies
CREATE POLICY "Users can view own events" ON calendar_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON calendar_events FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON calendar_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anon no access events" ON calendar_events FOR SELECT TO anon USING (false);

-- AI history policies
CREATE POLICY "Users can view own ai history" ON ai_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai history" ON ai_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon no access ai history" ON ai_history FOR SELECT TO anon USING (false);

-- Badges policies
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon no access badges" ON user_badges FOR SELECT TO anon USING (false);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, school_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'school_level', '2nde')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
