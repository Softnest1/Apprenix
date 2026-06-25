
-- ── Étendre teacher_profiles avec les nouveaux champs ─────────────────────────
ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS avatar_emoji   text NOT NULL DEFAULT '👩‍🏫',
  ADD COLUMN IF NOT EXISTS institution    text,
  ADD COLUMN IF NOT EXISTS is_visible     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS availability   text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS max_students   int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS contact_phone  text,
  ADD COLUMN IF NOT EXISTS contact_email  text,
  ADD COLUMN IF NOT EXISTS contact_mode   text NOT NULL DEFAULT 'app',
  ADD COLUMN IF NOT EXISTS total_students int NOT NULL DEFAULT 0;

-- Contraintes CHECK via trigger-safe approach
ALTER TABLE teacher_profiles
  DROP CONSTRAINT IF EXISTS teacher_profiles_availability_check;
ALTER TABLE teacher_profiles
  ADD CONSTRAINT teacher_profiles_availability_check
    CHECK (availability IN ('available','busy','paused'));
ALTER TABLE teacher_profiles
  DROP CONSTRAINT IF EXISTS teacher_profiles_contact_mode_check;
ALTER TABLE teacher_profiles
  ADD CONSTRAINT teacher_profiles_contact_mode_check
    CHECK (contact_mode IN ('phone','email','app'));

-- RLS policies additionnelles (lecture propre même si invisible)
DROP POLICY IF EXISTS "teacher_profiles_select_own" ON teacher_profiles;
CREATE POLICY "teacher_profiles_select_own"
  ON teacher_profiles FOR SELECT
  USING (user_id = auth.uid());

-- ── Accompaniment Requests ─────────────────────────────────────────────────────
CREATE TABLE accompaniment_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      text NOT NULL DEFAULT '',
  message      text,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','refused','cancelled')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE accompaniment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_select_student"  ON accompaniment_requests FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "requests_select_teacher"  ON accompaniment_requests FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "requests_insert_student"  ON accompaniment_requests FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "requests_update_student"  ON accompaniment_requests FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "requests_update_teacher"  ON accompaniment_requests FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "requests_delete_student"  ON accompaniment_requests FOR DELETE USING (student_id = auth.uid() AND status = 'pending');

-- ── Collaborations ─────────────────────────────────────────────────────────────
CREATE TABLE collaborations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id    uuid REFERENCES accompaniment_requests(id),
  subject       text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  shared_notes  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collab_select_participant"  ON collaborations FOR SELECT USING (student_id = auth.uid() OR teacher_id = auth.uid());
CREATE POLICY "collab_insert_teacher"      ON collaborations FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "collab_update_participant"  ON collaborations FOR UPDATE USING (student_id = auth.uid() OR teacher_id = auth.uid());
CREATE POLICY "collab_delete_participant"  ON collaborations FOR DELETE USING (student_id = auth.uid() OR teacher_id = auth.uid());

-- ── Collaboration Messages ─────────────────────────────────────────────────────
CREATE TABLE collaboration_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  content          text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_collaboration_participant(collab_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaborations
    WHERE id = collab_id AND (student_id = auth.uid() OR teacher_id = auth.uid())
  );
$$;

CREATE POLICY "messages_select_participant" ON collaboration_messages FOR SELECT USING (is_collaboration_participant(collaboration_id));
CREATE POLICY "messages_insert_participant" ON collaboration_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND is_collaboration_participant(collaboration_id));
CREATE POLICY "messages_delete_own"         ON collaboration_messages FOR DELETE USING (sender_id = auth.uid());

-- ── Collaboration Resources ────────────────────────────────────────────────────
CREATE TABLE collaboration_resources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  uploader_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title            text NOT NULL,
  resource_type    text NOT NULL DEFAULT 'link' CHECK (resource_type IN ('link','file')),
  url              text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE collaboration_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_participant" ON collaboration_resources FOR SELECT USING (is_collaboration_participant(collaboration_id));
CREATE POLICY "resources_insert_participant" ON collaboration_resources FOR INSERT WITH CHECK (uploader_id = auth.uid() AND is_collaboration_participant(collaboration_id));
CREATE POLICY "resources_delete_own"         ON collaboration_resources FOR DELETE USING (uploader_id = auth.uid());

-- ── Collaboration Objectives ───────────────────────────────────────────────────
CREATE TABLE collaboration_objectives (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id uuid NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  is_completed     boolean NOT NULL DEFAULT false,
  created_by       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE collaboration_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objectives_select_participant" ON collaboration_objectives FOR SELECT USING (is_collaboration_participant(collaboration_id));
CREATE POLICY "objectives_insert_teacher"     ON collaboration_objectives FOR INSERT WITH CHECK (created_by = auth.uid() AND is_collaboration_participant(collaboration_id));
CREATE POLICY "objectives_update_participant" ON collaboration_objectives FOR UPDATE USING (is_collaboration_participant(collaboration_id));
CREATE POLICY "objectives_delete_teacher"     ON collaboration_objectives FOR DELETE USING (created_by = auth.uid());

-- ── App Notifications ──────────────────────────────────────────────────────────
CREATE TABLE app_notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text,
  is_read    boolean NOT NULL DEFAULT false,
  ref_id     uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifs_select_own" ON app_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifs_insert_own" ON app_notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifs_update_own" ON app_notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifs_delete_own" ON app_notifications FOR DELETE USING (user_id = auth.uid());

-- ── RPC accept_accompaniment_request ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION accept_accompaniment_request(p_request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  req  accompaniment_requests%ROWTYPE;
  cid  uuid;
BEGIN
  SELECT * INTO req FROM accompaniment_requests
  WHERE id = p_request_id AND teacher_id = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable ou non autorisée';
  END IF;
  UPDATE accompaniment_requests SET status = 'accepted', updated_at = now() WHERE id = p_request_id;
  INSERT INTO collaborations (student_id, teacher_id, request_id, subject)
  VALUES (req.student_id, req.teacher_id, req.id, req.subject)
  RETURNING id INTO cid;
  INSERT INTO app_notifications (user_id, type, title, body, ref_id)
  VALUES (req.student_id, 'request_accepted', 'Demande acceptée !',
    'Votre demande d''accompagnement a été acceptée. Votre espace de travail est prêt.', cid);
  UPDATE teacher_profiles SET total_students = total_students + 1 WHERE user_id = auth.uid();
  RETURN cid;
END;
$$;

-- ── RPC refuse_accompaniment_request ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION refuse_accompaniment_request(p_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  req accompaniment_requests%ROWTYPE;
BEGIN
  SELECT * INTO req FROM accompaniment_requests
  WHERE id = p_request_id AND teacher_id = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande introuvable ou non autorisée';
  END IF;
  UPDATE accompaniment_requests SET status = 'refused', updated_at = now() WHERE id = p_request_id;
  INSERT INTO app_notifications (user_id, type, title, body, ref_id)
  VALUES (req.student_id, 'request_refused', 'Demande non retenue',
    'Votre demande d''accompagnement n''a pas été retenue.', req.id);
END;
$$;

-- ── RPC notify_user ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_user(target_user_id uuid, notif_type text, notif_title text, notif_body text, ref uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO app_notifications (user_id, type, title, body, ref_id)
  VALUES (target_user_id, notif_type, notif_title, notif_body, ref);
END;
$$;
