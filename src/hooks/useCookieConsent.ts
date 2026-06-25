import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CookieCategory = 'essential' | 'preferences' | 'analytics';

export interface CookieConsent {
  answered: boolean;
  categories: Record<CookieCategory, boolean>;
  updatedAt: string;
}

const STORAGE_KEY = 'apprenix_cookie_consent';
const CONSENT_VERSION = 'v1';

export const DEFAULT_CONSENT: CookieConsent = {
  answered: false,
  categories: { essential: true, preferences: false, analytics: false },
  updatedAt: '',
};

// ─── Helpers persistance ──────────────────────────────────────────────────────

/** CNIL : le consentement doit être renouvelé tous les 13 mois maximum */
const CONSENT_EXPIRY_MS = 13 * 30 * 24 * 60 * 60 * 1000; // ≈ 13 mois

export function loadConsent(): CookieConsent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONSENT };
    const parsed = JSON.parse(raw);
    // Vérification version
    if (parsed.version !== CONSENT_VERSION) return { ...DEFAULT_CONSENT };
    const consent = parsed.consent as CookieConsent;
    // Vérification expiration (13 mois — art. 82 Loi I&L / recommandation CNIL)
    if (consent.answered && consent.updatedAt) {
      const elapsed = Date.now() - new Date(consent.updatedAt).getTime();
      if (elapsed > CONSENT_EXPIRY_MS) {
        // Consentement expiré : remettre à zéro pour re-demander
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* silencieux */ }
        return { ...DEFAULT_CONSENT };
      }
    }
    return consent;
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

export function saveConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CONSENT_VERSION, consent }));
  } catch { /* silencieux */ }
}

export const COOKIE_STORAGE_KEY = STORAGE_KEY;

// ─── Types retour du hook ─────────────────────────────────────────────────────
export interface CookieConsentValue {
  consent: CookieConsent;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (categories: Record<CookieCategory, boolean>) => void;
  resetConsent: () => void;
}

// ─── Context partagé (source unique de vérité) ────────────────────────────────
export const CookieConsentContext = createContext<CookieConsentValue | null>(null);

// ─── Hook interne (logique réelle — utilisée uniquement par le Provider) ───────
export function useCookieConsentInternal(): CookieConsentValue {
  const [consent, setConsentState] = useState<CookieConsent>(loadConsent);

  useEffect(() => {
    if (consent.answered) saveConsent(consent);
  }, [consent]);

  const acceptAll = useCallback(() => {
    setConsentState({ answered: true, categories: { essential: true, preferences: true, analytics: true }, updatedAt: new Date().toISOString() });
  }, []);

  const rejectAll = useCallback(() => {
    setConsentState({ answered: true, categories: { essential: true, preferences: false, analytics: false }, updatedAt: new Date().toISOString() });
  }, []);

  const saveCustom = useCallback((categories: Record<CookieCategory, boolean>) => {
    setConsentState({ answered: true, categories: { ...categories, essential: true }, updatedAt: new Date().toISOString() });
  }, []);

  const resetConsent = useCallback(() => {
    setConsentState({ ...DEFAULT_CONSENT });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silencieux */ }
  }, []);

  return { consent, showBanner: !consent.answered, acceptAll, rejectAll, saveCustom, resetConsent };
}

// ─── Hook public — doit être utilisé à l'intérieur de CookieConsentProvider ───
export function useCookieConsent(): CookieConsentValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent doit être utilisé dans <CookieConsentProvider>');
  return ctx;
}
