
-- ═══════════════════════════════════════════════════════════════════════════
-- RENFORCEMENT RLS — Apprenix
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES : consolidation des politiques dupliquées ─────────────────
DROP POLICY IF EXISTS "Utilisateur voit son propre profil"       ON public.profiles;
DROP POLICY IF EXISTS "Utilisateur met à jour son propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"               ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"             ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"             ON public.profiles;
DROP POLICY IF EXISTS "Anon no access profiles"                  ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"                      ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"                      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"                      ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own"                      ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ── 2. ARTICLES : table sans author_id → lecture publique seule ────────────
DROP POLICY IF EXISTS "articles_delete_auth"  ON public.articles;
DROP POLICY IF EXISTS "articles_insert_auth"  ON public.articles;
DROP POLICY IF EXISTS "articles_select_all"   ON public.articles;
DROP POLICY IF EXISTS "articles_select_anon"  ON public.articles;
DROP POLICY IF EXISTS "articles_update_auth"  ON public.articles;

-- Lecture publique uniquement (articles = ressources pédagogiques)
CREATE POLICY "articles_select_all"
  ON public.articles FOR SELECT
  USING (true);

-- Écriture bloquée via RLS (géré hors RLS par service_role uniquement)
CREATE POLICY "articles_insert_deny"
  ON public.articles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "articles_update_deny"
  ON public.articles FOR UPDATE
  USING (false);

CREATE POLICY "articles_delete_deny"
  ON public.articles FOR DELETE
  USING (false);

-- ── 3. TODOS : WITH CHECK sur UPDATE ─────────────────────────────────────
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
DROP POLICY IF EXISTS "todos_update_own"           ON public.todos;

CREATE POLICY "todos_update_own"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. CALENDAR_EVENTS : WITH CHECK sur UPDATE ───────────────────────────
DROP POLICY IF EXISTS "Users can update own events"  ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_update_own"   ON public.calendar_events;

CREATE POLICY "calendar_events_update_own"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 5. COMMUNITY : INSERT requis d'être authentifié ─────────────────────
DROP POLICY IF EXISTS "ca_insert_all"   ON public.community_answers;
DROP POLICY IF EXISTS "ca_insert_auth"  ON public.community_answers;
DROP POLICY IF EXISTS "cq_insert_all"   ON public.community_questions;
DROP POLICY IF EXISTS "cq_insert_auth"  ON public.community_questions;

CREATE POLICY "ca_insert_auth"
  ON public.community_answers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "cq_insert_auth"
  ON public.community_questions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ── 6. REVISION_SESSIONS : UPDATE manquant ───────────────────────────────
DROP POLICY IF EXISTS "rs_update_own" ON public.revision_sessions;

CREATE POLICY "rs_update_own"
  ON public.revision_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 7. POMODORO_SESSIONS : UPDATE manquant ───────────────────────────────
DROP POLICY IF EXISTS "ps_update_own" ON public.pomodoro_sessions;

CREATE POLICY "ps_update_own"
  ON public.pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 8. USER_BADGES : DELETE manquant ─────────────────────────────────────
DROP POLICY IF EXISTS "ub_delete_own" ON public.user_badges;

CREATE POLICY "ub_delete_own"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);

-- ── 9. AI_HISTORY : supprimer la policy SELECT anon redondante ────────────
DROP POLICY IF EXISTS "Anon no access ai history" ON public.ai_history;

-- ── 10. Confirmer RLS activé sur toutes les tables sensibles ─────────────
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages    ENABLE ROW LEVEL SECURITY;
