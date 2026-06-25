// Bannière visible UNIQUEMENT en mode standalone (PWA installée)
// Permet à l'utilisateur d'ouvrir la page courante dans le navigateur

import { ExternalLink, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const DISMISS_KEY  = 'apprenix-pwa-banner-dismissed-v2';
const UPDATE_KEY   = 'apprenix-pwa-display-mode';

export default function PwaBrowserBanner() {
  const [mode, setMode] = useState<'none' | 'standalone-old' | 'standalone-new'>('none');

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    const dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    if (dismissed) return;

    // Détecter si c'est l'ancienne version standalone (sans barre d'URL visible)
    // minimal-ui affiche la barre → on peut le détecter via CSS env vars ou simplement
    // tester si window.outerHeight ≈ window.innerHeight (standalone = pas de barre)
    const isOldStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isMinimalUi     = window.matchMedia('(display-mode: minimal-ui)').matches;

    if (isOldStandalone && !isMinimalUi) {
      setMode('standalone-old');  // ancienne version → proposer de mettre à jour
    } else {
      setMode('standalone-new');  // nouvelle version minimal-ui → simple info
    }

    // Sauvegarder pour analytics internes
    localStorage.setItem(UPDATE_KEY, isOldStandalone ? 'standalone' : 'minimal-ui');
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setMode('none');
  };

  const openInBrowser = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  if (mode === 'none') return null;

  // Ancienne version standalone — guide la mise à jour
  if (mode === 'standalone-old') {
    return (
      <div
        role="alert"
        className="fixed top-0 left-0 right-0 z-[200] bg-primary px-3 py-2.5 flex flex-col gap-1.5"
      >
        <div className="flex items-start gap-2">
          <RefreshCw className="w-4 h-4 text-white shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-snug">
              Mise à jour disponible
            </p>
            <p className="text-xs text-white/80 text-pretty leading-snug mt-0.5">
              Une nouvelle version évite la redirection automatique. Pour l'activer :
              désinstalle l'app depuis l'écran d'accueil → réinstalle depuis Chrome.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 rounded text-white/70 hover:text-white shrink-0"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <button
            type="button"
            onClick={openInBrowser}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white underline underline-offset-2"
          >
            <ExternalLink className="w-3 h-3" />
            Ouvrir dans Chrome maintenant
          </button>
        </div>
      </div>
    );
  }

  // Nouvelle version minimal-ui — bannière discrète
  return (
    <div
      role="banner"
      className="fixed top-0 left-0 right-0 z-[200] bg-sidebar border-b border-sidebar-border px-3 py-2 flex items-center gap-2"
    >
      <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
      <p className="flex-1 min-w-0 text-xs text-white/80 leading-snug">
        Tu es dans <strong className="text-white">l'app Apprenix</strong>
      </p>
      <button
        type="button"
        onClick={openInBrowser}
        className="shrink-0 text-xs font-bold text-primary underline underline-offset-2 min-h-[48px] px-1"
      >
        Ouvrir dans le navigateur
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
