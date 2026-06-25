-- Cache des réponses IA pour éviter les appels API redondants (économie de quota)
-- Clé = SHA-256 hex du contenu de la requête (model + messages)
-- TTL = 7 jours (configurable via expires_at)
CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  prompt_hash   TEXT        NOT NULL PRIMARY KEY,
  model         TEXT        NOT NULL DEFAULT 'gemini-2.0-flash-lite',
  response_text TEXT        NOT NULL,
  token_count   INTEGER,
  hit_count     INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Index TTL pour le nettoyage automatique
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON public.ai_response_cache (expires_at);

-- Nettoyage automatique des entrées expirées (purge toutes les 24h via pg_cron si dispo)
-- Sinon la Edge Function nettoie au fur et à mesure
CREATE OR REPLACE FUNCTION public.cleanup_ai_cache()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.ai_response_cache WHERE expires_at < now();
$$;

-- RLS : la table est accessible uniquement côté serveur (service_role)
-- Les utilisateurs anonymes ne peuvent pas lire/écrire directement
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Aucune policy publique = accès refusé côté client (service_role bypass RLS)
