// Section "Télécharger l'app Apprenix" — design compact, orienté étudiant
// iOS : guide Share → Ajouter à l'écran d'accueil (3 étapes)
// Android / Desktop : bouton install PWA natif

import {CheckCircle,ChevronDown, ChevronUp,
  Download, Plus, Share, ShieldCheck,
  Smartphone, 
  Star, WifiOff, Zap, 
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// Guide iOS compact — accordéon
function IOSGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors duration-150"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          Installer sur iPhone / iPad
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
        }
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5 px-1">
          {[
            { icon: Share,       step: '1', text: 'Appuie sur', bold: 'Partager', sub: 'en bas de Safari' },
            { icon: Plus,        step: '2', text: 'Choisis',    bold: '"Sur l\'écran d\'accueil"', sub: 'fais défiler vers le bas' },
            { icon: CheckCircle, step: '3', text: 'Appuie sur', bold: '"Ajouter"',  sub: 'l\'icône apparaît directement' },
          ].map(({ icon: Icon, step, text, bold, sub }) => (
            <div key={step} className="flex items-center gap-3 bg-secondary/40 rounded-xl px-3 py-2.5">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-primary-foreground">{step}</span>
              </div>
              <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight">
                  {text} <strong>{bold}</strong>
                </p>
                <p className="text-sm text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PwaInstallSection() {
  const { canInstall, isInstalled, platform, triggerInstall } = usePWAInstall();
  const [loading, setLoading] = useState(false);

  // Masquer si déjà en mode standalone (app lancée depuis l'écran d'accueil)
  if (isInstalled && window.matchMedia('(display-mode: standalone)').matches) return null;

  const handleInstall = async () => {
    setLoading(true);
    const outcome = await triggerInstall();
    setLoading(false);
    if (outcome === 'accepted') {
      toast.success('Apprenix installé !', {
        description: "Accès direct depuis ton écran d'accueil — même hors ligne.",
        duration: 5000,
      });
    }
  };

  return (
    <section
      id="telecharger-app"
      aria-label="Télécharger l'application Apprenix"
      className="relative rounded-2xl overflow-hidden border border-primary/20"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--chart-1) / 0.06) 100%)',
      }}
    >
      {/* Halo déco */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10">

          {/* ── Gauche : texte + badges ── */}
          <div className="flex-1 min-w-0 mb-5 md:mb-0">
            {/* Titre compact */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-foreground text-balance leading-snug">
                Apprenix dans ta poche —{' '}
                <span className="text-primary">même sans Wi-Fi</span>
              </h2>
            </div>

            <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-4 max-w-md">
              Installe l'app en 10 secondes depuis ton navigateur. Tes flashcards, notes et planning restent accessibles même hors ligne. Gratuit, sans pub, sans compte obligatoire.
            </p>

            {/* 3 avantages inline */}
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { icon: WifiOff,     label: 'Hors ligne' },
                { icon: Zap,         label: 'Instantané' },
                { icon: ShieldCheck, label: 'Aucune pub' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/60 border border-border/50 rounded-full px-3 py-1">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  {label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 dark:bg-warning/10 dark:text-warning border border-warning/30 dark:border-warning/20 rounded-full px-3 py-1">
                <Star className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
                5/5 — 0 €
              </span>
            </div>

            {/* Plateformes supportées */}
            <p className="text-sm text-muted-foreground">
              Compatible iOS 14+ · Android 8+ · PC · Mac · Edge · Firefox
            </p>
          </div>

          {/* ── Droite : CTA ── */}
          <div className="flex flex-col items-start md:items-center gap-3 shrink-0 md:min-w-[220px]">
            {isInstalled ? (
              <div className="flex items-center gap-2.5 bg-success/10 border border-success/30 rounded-2xl px-4 py-3 w-full md:max-w-xs">
                <CheckCircle className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-success">Application installée</p>
                  <p className="text-sm text-muted-foreground">Accessible depuis l'écran d'accueil</p>
                </div>
              </div>
            ) : canInstall ? (
              <>
                <Button
                  onClick={handleInstall}
                  disabled={loading}
                  size="lg"
                  className="w-full md:w-auto h-13 px-8 text-base font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200"
                  aria-label="Installer l'application Apprenix gratuitement"
                >
                  {loading ? (
                    <span className="animate-pulse">Installation…</span>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
                      Installer l'app — gratuit
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Aucun téléchargement sur l'App Store
                </p>
              </>
            ) : platform === 'ios' ? (
              <IOSGuide />
            ) : (
              <div className="bg-secondary/60 border border-border rounded-2xl px-4 py-3 w-full md:max-w-xs">
                <p className="text-xs font-semibold text-foreground mb-1">
                  Ouvre dans Chrome ou Safari
                </p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Va sur <strong>apprenix.org</strong> dans Chrome (Android) ou Safari (iOS) pour installer en un clic.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
