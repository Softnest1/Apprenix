import React from 'react';
import { cn } from '@/lib/utils';

interface ApprenixLogoProps {
  /** Taille de l'icône badge en pixels */
  size?: number;
  className?: string;
  /**
   * "icon"     → icône seule sans fond (usage in-text, mini)
   * "badge"    → icône sur fond orange arrondi (défaut — sidebar, favicon)
   * "wordmark" → icône + texte "Apprenix" côte à côte (header, footer)
   */
  variant?: 'icon' | 'badge' | 'wordmark';
}

/**
 * Logo Apprenix — concept "Sommet"
 *
 * Concept stratégique :
 *   • Montagne / sommet = objectif atteint, ambition, dépassement de soi
 *   • Forme implicite du A = Apprenix, lisible sans fond
 *   • Étoile 4 branches au sommet = excellence, cap IA (4 directions = pour tous)
 *   • 3 marches à gauche = progression (CP → Terminale → Fac)
 *   • Chemin intérieur = parcours inclusif, chaque élève a SA route
 *
 * Résultat : lisible en 16 px (favicon), mémorable en 512 px (splash),
 * reconnaissable sans fond (mode icon) et sans texte.
 *
 * NOTE LAYOUT :
 *   variant="wordmark" utilise inline-flex — ne jamais appliquer
 *   "block" via className car cela écrase display:flex → logo cassé.
 *   Pour contrôler la visibilité utiliser hidden/inline-flex uniquement.
 */
const ApprenixLogo: React.FC<ApprenixLogoProps> = ({
  size = 36,
  className,
  variant = 'badge',
}) => {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0', className)}
        aria-label="Logo Apprenix"
        role="img"
      >
        <SommetShape color="#FF6B0A" />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    const textSize = Math.round(size * 0.52);
    return (
      // inline-flex garanti — className ne doit PAS contenir "block"
      <span
        className={cn('inline-flex items-center gap-2 shrink-0', className)}
        role="img"
        aria-label="Logo Apprenix"
      >
        <BadgeIcon size={size} />
        <span
          className="font-extrabold tracking-tight leading-none text-foreground"
          style={{ fontSize: textSize }}
          aria-hidden="true"
          translate="no"
        >
          Apprenix
        </span>
      </span>
    );
  }

  // variant === 'badge' (défaut)
  return <BadgeIcon size={size} className={className} />;
};

/* ── Icône badge : fond orange arrondi + Sommet blanc ── */
const BadgeIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  const radius = Math.round(size * 0.26);
  const pad    = Math.round(size * 0.14);
  const inner  = size - pad * 2;

  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      style={{
        width:        size,
        height:       size,
        minWidth:     size,
        borderRadius: radius,
        background:   'linear-gradient(145deg, #FF8533 0%, #FF6B0A 60%, #E55900 100%)',
        boxShadow:    '0 2px 8px rgba(255,107,10,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
      aria-hidden="true"
    >
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <SommetShape color="#FFFFFF" />
      </svg>
    </span>
  );
};

/**
 * Forme "Sommet"  — viewBox 0 0 100 100
 *
 * Lecture visuelle :
 *   • Deux jambes qui montent vers la pointe centrale → montagne + A
 *   • 3 marches sur la jambe gauche → progression par étapes
 *   • Barre transversale à mi-hauteur → lettre A confirmée
 *   • Étoile 4 branches au sommet → excellence & IA (4 directions)
 *   • Petite flèche sous la barre → chemin inclusif "va plus loin"
 */
const SommetShape: React.FC<{ color: string }> = ({ color }) => {
  const c  = color;           // couleur principale
  const cs = color + 'CC';    // 80% opacité — détails secondaires

  return (
    <>
      {/* ── Étoile 4 branches au sommet ── */}
      {/* Branches horizontale et verticale */}
      <line x1="50" y1="5"  x2="50" y2="20" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <line x1="43" y1="12" x2="57" y2="12" stroke={c} strokeWidth="5" strokeLinecap="round" />
      {/* Branches diagonales */}
      <line x1="44" y1="6"  x2="50" y2="12" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="56" y1="6"  x2="50" y2="12" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="44" y1="18" x2="50" y2="12" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="56" y1="18" x2="50" y2="12" stroke={c} strokeWidth="3.5" strokeLinecap="round" />

      {/* ── Jambe droite : ligne fluide du sommet en bas-droite ── */}
      <line x1="50" y1="22" x2="76" y2="86" stroke={c} strokeWidth="7.5" strokeLinecap="round" />

      {/* ── Jambe gauche : 3 marches de progression ── */}
      {/* Segment 1 — du sommet au 1er palier */}
      <line x1="50" y1="22" x2="37" y2="50" stroke={c} strokeWidth="7.5" strokeLinecap="round" />
      {/* Palier 1 — marche horizontale (niveau 1) */}
      <line x1="37" y1="50" x2="31" y2="50" stroke={cs} strokeWidth="5.5" strokeLinecap="round" />
      {/* Segment 2 */}
      <line x1="31" y1="50" x2="27" y2="68" stroke={c} strokeWidth="7.5" strokeLinecap="round" />
      {/* Palier 2 — marche horizontale (niveau 2) */}
      <line x1="27" y1="68" x2="22" y2="68" stroke={cs} strokeWidth="5.5" strokeLinecap="round" />
      {/* Segment 3 */}
      <line x1="22" y1="68" x2="19" y2="86" stroke={c} strokeWidth="7.5" strokeLinecap="round" />

      {/* ── Barre transversale (confirme la lecture "A") ── */}
      <line x1="33" y1="62" x2="65" y2="62" stroke={c} strokeWidth="6" strokeLinecap="round" />

      {/* ── Petite flèche de progression sous la barre ── */}
      <polyline
        points="44,73 50,79 56,73"
        fill="none"
        stroke={cs}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default ApprenixLogo;
