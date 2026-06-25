import React, { lazy, Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AccessibilityToolbar, { A11yPrefsProvider } from '@/components/AccessibilityToolbar';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import EnseignantLayout from '@/components/layouts/EnseignantLayout';
import EtudiantLayout from '@/components/layouts/EtudiantLayout';
import OfflineBanner from '@/components/OfflineBanner';
import PresentationBanner from '@/components/PresentationBanner';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { CookieConsentProvider } from '@/hooks/CookieConsentProvider';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { ROUTE_PREFETCH } from '@/lib/prefetch';
import NotFound from './pages/NotFound';
import { routes } from './routes';

// ─── Lazy-load des composants lourds non-critiques au premier rendu ────────────
const ChatBot     = lazy(() => import('@/components/ChatBot'));
const CookieBanner = lazy(() => import('@/components/common/CookieBanner'));

// ─── Préchargement silencieux des pages critiques en arrière-plan ─────────────
// Utilise ROUTE_PREFETCH (source unique de vérité dans lib/prefetch.ts)
// pour éviter les imports dupliqués entre App.tsx, Footer et MainLayout.
const CRITICAL_ROUTES = [
  '/aide-ia', '/scanner', '/ressources', '/organisation',
  '/flashcards', '/maths-sciences', '/linguistique', '/notes', '/actualites',
];

function prefetchCriticalPages() {
  const ric = (window as typeof window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback;
  if (ric) {
    CRITICAL_ROUTES.forEach((route, i) => {
      ric(() => ROUTE_PREFETCH[route]?.().catch(() => {/* silencieux */}), { timeout: 3000 + i * 500 });
    });
  } else {
    CRITICAL_ROUTES.forEach((route, i) => {
      setTimeout(() => ROUTE_PREFETCH[route]?.().catch(() => {/* silencieux */}), 1500 + i * 300);
    });
  }
}

// ─── Composant interne avec accès au hook (doit être dans Router) ─────────────
const AppContent: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, saveCustom } = useCookieConsent();

  // Pré-cache des données critiques pour l'accès hors ligne
  useOfflineCache();

  useEffect(() => {
    const timer = setTimeout(prefetchCriticalPages, 800);
    return () => clearTimeout(timer);
  }, []);

  // Détecter les mises à jour du Service Worker et notifier OfflineBanner
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const notify = () => window.dispatchEvent(new CustomEvent('apprenix:sw-update-ready'));
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;
      // SW déjà en attente au montage (ex : rafraîchissement manuel)
      if (reg.waiting) { notify(); return; }
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) notify();
        });
      });
    });
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', minHeight: '100dvh', width: '100%' }}>
      <ScrollToTop />
      <IntersectObserver />
      <Routes>
        {/* ── Espace étudiant — EtudiantLayout monté UNE seule fois, Outlet reçoit le contenu ── */}
        <Route element={<EtudiantLayout />}>
          {routes
            .filter(r => r.layoutGroup === 'student')
            .map(r => <Route key={r.path} path={r.path} element={r.element} />)}
        </Route>

        {/* ── Espace enseignant — EnseignantLayout monté UNE seule fois ── */}
        <Route element={<EnseignantLayout />}>
          {routes
            .filter(r => r.layoutGroup === 'teacher')
            .map(r => <Route key={r.path} path={r.path} element={r.element} />)}
        </Route>

        {/* ── Toutes les autres routes (public, landing, parents…) ── */}
        {routes
          .filter(r => !r.layoutGroup)
          .map(r => <Route key={r.path} path={r.path} element={r.element} />)}

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </ErrorBoundary>
      <AccessibilityToolbar />
      <PresentationBanner />
      <OfflineBanner />
      {showBanner && (
        <Suspense fallback={null}>
          <CookieBanner
            onAcceptAll={acceptAll}
            onRejectAll={rejectAll}
            onSaveCustom={saveCustom}
          />
        </Suspense>
      )}
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <A11yPrefsProvider>
        <CookieConsentProvider>
          <Router>
            <AppContent />
          </Router>
        </CookieConsentProvider>
      </A11yPrefsProvider>
    </AppProvider>
  );
};

export default App;
