import {
  CheckCircle, ChevronDown, ChevronUp,
  Cookie, ShieldCheck, SlidersHorizontal,XCircle, 
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { CookieCategory } from '@/hooks/useCookieConsent';

// ─── Définition des catégories ────────────────────────────────────────────────

interface CategoryDef {
  id: CookieCategory;
  label: string;
  desc: string;
  required: boolean;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'essential',
    label: 'Cookies essentiels',
    desc: 'Nécessaires au fonctionnement du site (session d\'authentification, préférences de thème). Ils ne peuvent pas être désactivés.',
    required: true,
  },
  {
    id: 'preferences',
    label: 'Cookies de préférences',
    desc: 'Permettent de mémoriser vos préférences (niveau scolaire, langue, mise en page) pour personnaliser votre expérience.',
    required: false,
  },
  {
    id: 'analytics',
    label: 'Cookies analytiques',
    desc: 'Nous aident à comprendre comment vous utilisez le site (pages visitées, temps passé) pour l\'améliorer. Aucune donnée vendue ni partagée à des tiers.',
    required: false,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSaveCustom: (cats: Record<CookieCategory, boolean>) => void;
}

// ─── Panneau personnalisation ─────────────────────────────────────────────────

const CustomPanel: React.FC<{
  initial: Record<CookieCategory, boolean>;
  onSave: (cats: Record<CookieCategory, boolean>) => void;
  onBack: () => void;
}> = ({ initial, onSave, onBack }) => {
  const [cats, setCats] = useState<Record<CookieCategory, boolean>>({ ...initial });

  const toggle = (id: CookieCategory) => {
    if (id === 'essential') return;
    setCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Personnaliser mes préférences</p>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(({ id, label, desc, required }) => (
          <div key={id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
            <Switch
              checked={cats[id]}
              onCheckedChange={() => toggle(id)}
              disabled={required}
              aria-label={label}
              className="mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                {required && (
                  <Badge className="text-xs px-1.5 py-0 bg-success/10 text-success border-success/20 shrink-0">
                    Requis
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2 pt-1">
        <Button
          onClick={() => onSave(cats)}
          size="sm"
          className="h-11 flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Enregistrer mes choix
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="h-11 flex-1 gap-1.5"
        >
          Retour
        </Button>
      </div>
    </div>
  );
};

// ─── Bannière principale ──────────────────────────────────────────────────────

const CookieBanner: React.FC<CookieBannerProps> = ({
  onAcceptAll,
  onRejectAll,
  onSaveCustom,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  // Focus trap : renvoi du focus sur le premier bouton à l'ouverture
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Légère attente pour laisser l'animation slide-in se terminer
    const t = setTimeout(() => firstBtnRef.current?.focus({ preventScroll: true }), 350);
    return () => clearTimeout(t);
  }, []);

  const defaultCats: Record<CookieCategory, boolean> = {
    essential: true,
    preferences: false,
    analytics: false,
  };

  return (
    /*
     * Positionnement direct en fixed — plus fiable que flexbox :
     *   Mobile  (< 768px) : bottom sheet full-width, coins hauts arrondis, fond semi-transparent
     *   Desktop (≥ 768px) : carte flottante 440px, coin bas-gauche, 24px de marge
     */
    <>
      {/* Fond semi-transparent — mobile uniquement */}
      <div
        className="fixed inset-0 z-[9998] bg-black/25 pointer-events-auto md:hidden"
        aria-hidden="true"
      />

      {/* Bannière cookie — positionnement direct fixed */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gestion des cookies"
        aria-live="polite"
        className={[
          'fixed z-[9999] pointer-events-auto',
          // Mobile : plein bas, pleine largeur, arrondi haut seulement
          'bottom-0 left-0 right-0 rounded-t-2xl max-h-[90dvh] overflow-y-auto',
          // Desktop : carte flottante coin bas-gauche
          'md:bottom-6 md:left-6 md:right-auto md:w-[440px] md:max-h-[85dvh] md:rounded-2xl',
          'bg-card border border-border shadow-2xl',
          'animate-in slide-in-from-bottom-4 duration-300',
        ].join(' ')}
      >
        {/* Barre colorée RGPD top */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-success to-chart-4 shrink-0" aria-hidden="true" />

        <div className="p-4 md:p-5">
          {/* En-tête */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-bold text-foreground">Gestion des cookies</p>
                <Badge className="text-xs px-1.5 py-0 bg-success/10 text-success border-success/20 shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5 mr-0.5" aria-hidden="true" />
                  RGPD
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Apprenix utilise uniquement des cookies techniques essentiels.
                Vous pouvez également activer des cookies de préférences et analytiques.
              </p>
            </div>
          </div>

          {/* Panneau personnalisation (conditionnel) */}
          {showCustom ? (
            <CustomPanel
              initial={defaultCats}
              onSave={(cats) => onSaveCustom(cats)}
              onBack={() => setShowCustom(false)}
            />
          ) : (
            <>
              {/* Info dépliable */}
              <button type="button"
                onClick={() => setShowInfo(v => !v)}
                className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 py-2 min-h-[48px]"
                aria-expanded={showInfo}
                aria-controls="cookie-info-panel"
              >
                <span className="flex items-center gap-1.5 text-left">
                  <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
                  Nous n'utilisons pas de cookies publicitaires ni de tracking tiers
                </span>
                {showInfo
                  ? <ChevronUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  : <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                }
              </button>

              {showInfo && (
                <div
                  id="cookie-info-panel"
                  className="mb-3 p-3 rounded-xl bg-muted/40 text-sm text-muted-foreground leading-relaxed space-y-1.5 text-pretty"
                >
                  <p>
                    <strong className="text-foreground">Cookies essentiels :</strong>{' '}
                    session d'authentification, thème (clair/sombre), niveau scolaire.
                    Toujours actifs — ne peuvent pas être refusés (art. 82 Loi Informatique et Libertés).
                  </p>
                  <p>
                    <strong className="text-foreground">Cookies optionnels :</strong>{' '}
                    préférences d'affichage, statistiques d'usage anonymes.
                    Votre choix est mémorisé pendant 13 mois (recommandation CNIL).
                  </p>
                  <Link
                    to="/politique-confidentialite"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    Politique de confidentialité complète →
                  </Link>
                </div>
              )}

              {/*
               * Boutons d'action :
               *   Mobile  (< 640px) : colonne (1 par ligne, pleine largeur)
               *   Desktop (≥ 640px) : ligne (3 côte à côte)
               */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  ref={firstBtnRef}
                  onClick={onAcceptAll}
                  size="sm"
                  className="h-10 flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-1.5 min-h-[48px] sm:min-h-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Tout accepter
                </Button>
                <Button
                  onClick={onRejectAll}
                  variant="outline"
                  size="sm"
                  className="h-10 flex-1 gap-1.5 min-h-[48px] sm:min-h-0"
                >
                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Tout refuser
                </Button>
                <Button
                  onClick={() => setShowCustom(true)}
                  variant="ghost"
                  size="sm"
                  className="h-10 flex-1 gap-1.5 text-muted-foreground hover:text-foreground min-h-[48px] sm:min-h-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  Personnaliser
                </Button>
              </div>

              {/* Note légale bas */}
              <p className="mt-3 text-center text-xs text-muted-foreground leading-snug">
                En cliquant sur « Tout accepter » vous consentez à l'utilisation de cookies non essentiels.{' '}
                <Link to="/politique-confidentialite" className="text-primary hover:underline">
                  En savoir plus
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
