/**
 * useOfflineCache — Pré-cache les données critiques en localStorage
 * quand l'utilisateur est en ligne, pour qu'elles soient disponibles
 * lors d'une utilisation hors connexion (forêt, montagne, zone blanche).
 *
 * Données mises en cache :
 *  - Flashcards (toutes les cartes de l'utilisateur)
 *  - Notes (titres + contenu)
 *  - Planning / tâches
 *  - Ressources officielles (statiques, déjà en mémoire)
 *
 * Stratégie : NetworkFirst avec fallback localStorage.
 * Durée de validité : 24h par défaut (configurable).
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/db/supabase';

const CACHE_KEY_PREFIX = 'apprenix_offline_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  version: number;
}

const CACHE_VERSION = 1;

/** Lit une entrée du cache local. Retourne null si expirée ou absente. */
export function readOfflineCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.version !== CACHE_VERSION) return null;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/** Écrit dans le cache local. */
export function writeOfflineCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), version: CACHE_VERSION };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage plein — on ignore silencieusement
  }
}

/** Supprime une entrée du cache. */
export function clearOfflineCache(key: string): void {
  localStorage.removeItem(CACHE_KEY_PREFIX + key);
}

// ─── Hook principal ────────────────────────────────────────────────────────────

/**
 * Lance le pré-cache des données critiques en arrière-plan.
 * À appeler une fois dans App.tsx, après que l'utilisateur est connecté.
 * N'exécute rien si l'utilisateur est hors ligne.
 */
export function useOfflineCache(userId?: string) {
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Attendre d'être en ligne
    if (!navigator.onLine) return;
    // Ne rafraîchir qu'une fois par session pour limiter la consommation réseau
    if (hasRefreshed.current) return;

    const prefetch = async () => {
      // Délai léger pour ne pas bloquer le rendu initial
      await new Promise(r => setTimeout(r, 3000));
      if (!navigator.onLine) return;

      hasRefreshed.current = true;

      // ── Flashcards ─────────────────────────────────────────────────────────
      try {
        const query = supabase
          .from('flashcards')
          .select('id,question,answer,difficulty,next_review,review_count')
          .order('created_at', { ascending: false })
          .limit(500);

        if (userId) query.eq('user_id', userId);

        const { data } = await query;
        if (data) writeOfflineCache('flashcards', data);
      } catch { /* réseau indisponible — données existantes conservées */ }

      // ── Notes ──────────────────────────────────────────────────────────────
      try {
        const query = supabase
          .from('notes')
          .select('id,title,content,subject,updated_at,pinned')
          .order('updated_at', { ascending: false })
          .limit(200);

        if (userId) query.eq('user_id', userId);

        const { data } = await query;
        if (data) writeOfflineCache('notes', data);
      } catch { /* offline */ }

      // ── Profil utilisateur ─────────────────────────────────────────────────
      if (userId) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (data) writeOfflineCache('profile_' + userId, data);
        } catch { /* offline */ }
      }
    };

    // Lancer le préchargement quand le navigateur est inactif
    const ric = (window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void
    }).requestIdleCallback;

    if (ric) {
      ric(() => { prefetch(); }, { timeout: 10000 });
    } else {
      setTimeout(prefetch, 4000);
    }
  }, [userId]);
}
