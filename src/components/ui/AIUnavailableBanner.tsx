// Bannière affichée sur toutes les fonctionnalités IA quand le quota est épuisé.
// Affiche un message rassurant + un bouton Réessayer + des alternatives sans IA.
import { AlertTriangle, BookOpen, Calculator, FileText, RefreshCw } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface AIUnavailableBannerProps {
  /** Secondes restantes avant de réessayer (0 = afficher sans compte à rebours) */
  secondsLeft?: number;
  /** Appelé quand l'utilisateur clique "Réessayer" — réinitialise le backoff local */
  onRetry?: () => void;
}

const ALTERNATIVES = [
  { icon: BookOpen,    label: 'Fiches méthode',    to: '/aide-ia#fiches' },
  { icon: FileText,    label: 'Ressources',         to: '/ressources'    },
  { icon: Calculator,  label: 'Maths & Sciences',   to: '/maths-sciences'},
];

const AIUnavailableBanner: React.FC<AIUnavailableBannerProps> = ({ secondsLeft = 0, onRetry }) => {
  const mins = secondsLeft > 0 ? Math.ceil(secondsLeft / 60) : null;
  // N'afficher le compte à rebours que s'il reste du temps
  const showCountdown = mins !== null && mins > 0;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">
          L'assistant est momentanément surchargé
          </p>
          <p className="text-xs text-muted-foreground text-pretty">
            Le quota de requêtes est temporairement atteint.
            {showCountdown
              ? ` Réessaie dans environ ${mins} minute${mins > 1 ? 's' : ''}.`
              : ' Tu peux réessayer maintenant.'}
          </p>
        </div>
        {/* Bouton Réessayer — réinitialise le backoff local pour permettre un nouvel essai */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Réessayer
          </button>
        )}
      </div>

      {/* Alternatives disponibles sans IA */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">En attendant, tu peux utiliser :</p>
        <div className="flex flex-wrap gap-2">
          {ALTERNATIVES.map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIUnavailableBanner;
