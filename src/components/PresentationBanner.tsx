/**
 * PresentationBanner — barre de statut Mode Projecteur
 *
 * Affichée en bas de l'écran UNIQUEMENT quand le mode projecteur est actif.
 * Visible pour le professeur sur son écran ET sur le vidéoprojecteur.
 * Contient :
 *   - Indicateur visuel "Mode Projecteur ACTIF"
 *   - Rappel F11 plein écran
 *   - Bouton "Quitter" accessible au clic
 */

import { Maximize2, Minimize2, Monitor, X } from 'lucide-react';
import React from 'react';
import { useA11yPrefs } from '@/components/AccessibilityToolbar';
import { useFullscreen } from '@/hooks/useFullscreen';

const PresentationBanner: React.FC = () => {
  const { prefs, setPrefs } = useA11yPrefs();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  if (!prefs.presentation) return null;

  const handleQuit = () => {
    setPrefs({ presentation: false });
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Mode Projecteur actif"
      className="fixed bottom-0 left-0 right-0 z-[9000] flex items-center justify-between gap-3 px-4 py-3 md:px-6"
      style={{
        background: 'hsl(14 100% 42%)',
        borderTop: '2px solid hsl(14 100% 65%)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
      }}
    >
      {/* Indicateur gauche */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          aria-hidden="true"
        >
          <Monitor className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-extrabold text-sm md:text-base leading-tight truncate">
            📽️ Mode Projecteur actif
          </p>
          <p className="text-white/80 text-xs leading-tight hidden md:block">
            Police agrandie · Fort contraste · Animations désactivées · <kbd className="bg-white/20 px-1 rounded text-white font-mono">F7</kbd> pour quitter
          </p>
        </div>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bouton plein écran — utile sur le PC du prof avant projection */}
        <button type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Plein écran (F11)'}
          aria-label={isFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[48px] transition-[background-color]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          {isFullscreen
            ? <Minimize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            : <Maximize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          }
          <span className="hidden sm:inline">{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
        </button>

        {/* Bouton quitter le mode projecteur */}
        <button type="button"
          onClick={handleQuit}
          title="Quitter le mode projecteur"
          aria-label="Quitter le mode projecteur"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold min-h-[48px] transition-[background-color]"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.40)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
        >
          <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Quitter</span>
        </button>
      </div>
    </div>
  );
};

export default PresentationBanner;
