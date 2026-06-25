import type { ReactNode } from 'react';
import { CookieConsentContext, useCookieConsentInternal } from './useCookieConsent';

/** Enveloppe toute l'app — source unique de l'état cookie consent */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const value = useCookieConsentInternal();
  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}
