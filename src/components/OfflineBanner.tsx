// Bannière hors-ligne + bouton d'installation PWA
// Les mises à jour SW sont appliquées automatiquement (silencieusement)

import { BookOpen, Brain, Calendar, Download, Wifi, WifiOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// Fonctionnalités disponibles hors ligne (avec cache SW + données pré-chargées)
const OFFLINE_FEATURES = [
  { icon: Brain,    label: 'Flashcards' },
  { icon: BookOpen, label: 'Notes' },
  { icon: Calendar, label: 'Planning' },
];

export default function OfflineBanner() {
  const [isOffline, setIsOffline]     = useState(!navigator.onLine);
  const [expanded, setExpanded]       = useState(false);
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed]     = useState(false);

  // Mise à jour SW automatique — silencieuse, sans bannière
  useEffect(() => {
    const applyUpdateSilently = (reg: ServiceWorkerRegistration) => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });
    };

    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;
      if (reg.waiting) { applyUpdateSilently(reg); return; }
      const onUpdate = () => { if (reg.waiting) applyUpdateSilently(reg); };
      reg.addEventListener('updatefound', () => {
        reg.installing?.addEventListener('statechange', onUpdate);
      });
    });

    const onSWUpdate = () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg?.waiting) applyUpdateSilently(reg);
      });
    };
    window.addEventListener('apprenix:sw-update-ready', onSWUpdate);
    return () => window.removeEventListener('apprenix:sw-update-ready', onSWUpdate);
  }, []);

  // Détecter connexion/déconnexion
  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      toast.warning('Mode hors ligne actif', {
        description: 'Flashcards, notes et planning restent accessibles.',
        id: 'offline-toast',
        duration: Infinity,
        icon: <WifiOff className="w-4 h-4" />,
      });
    };
    const goOnline = () => {
      setIsOffline(false);
      setExpanded(false);
      toast.dismiss('offline-toast');
      toast.success('Connexion rétablie !', {
        description: 'Synchronisation des données en cours…',
        duration: 3000,
        icon: <Wifi className="w-4 h-4" />,
      });
    };

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    if (!navigator.onLine) goOffline();

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleInstall = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'accepted') {
      toast.success('Apprenix installé !', {
        description: "Accès hors ligne complet depuis votre écran d'accueil.",
      });
    }
  };

  const showInstall = canInstall && !isInstalled && !dismissed && !isOffline;

  if (!isOffline && !showInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-3 pb-3">

      {/* ── Bannière hors-ligne — prioritaire ─────────────────────────── */}
      {isOffline ? (
        <div className="pointer-events-auto flex flex-col gap-0 bg-destructive text-destructive-foreground rounded-xl shadow-lg max-w-lg mx-auto w-full overflow-hidden">
          {/* Ligne principale */}
          <div className="flex items-center gap-3 px-4 py-3">
            <WifiOff className="w-4 h-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Mode hors ligne</p>
              <p className="text-xs opacity-80">Certaines fonctions restent disponibles</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="text-xs font-medium underline underline-offset-2 opacity-90"
              >
                {expanded ? 'Masquer' : 'Voir'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>

          {/* Détail des fonctions dispo — accordéon */}
          {expanded && (
            <div className="px-4 pb-3 border-t border-white/20 pt-2.5">
              <p className="text-xs opacity-70 mb-2 font-medium uppercase tracking-wide">
                Disponible sans connexion
              </p>
              <div className="flex flex-wrap gap-2">
                {OFFLINE_FEATURES.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1 text-xs font-medium"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
              <p className="text-xs opacity-60 mt-2.5 text-pretty">
                💡 Pour un accès hors ligne optimal en forêt ou en montagne,
                installez Apprenix sur votre écran d'accueil.
              </p>
            </div>
          )}
        </div>

      ) : showInstall ? (
        /* ── Bannière installation PWA — uniquement si en ligne ────────── */
        <div className="pointer-events-auto flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-lg max-w-lg mx-auto w-full">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight text-balance">
              Installer Apprenix
            </p>
            <p className="text-xs text-muted-foreground text-pretty">
              Accès hors ligne total · Fonctionne sans connexion
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" className="h-8 text-xs" onClick={handleInstall}>
              Installer
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
