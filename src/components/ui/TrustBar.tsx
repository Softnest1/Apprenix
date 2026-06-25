import { BadgeCheck, Lock, MapPin, Megaphone, ShieldCheck } from 'lucide-react';
import React from 'react';

// ─── Barre de confiance réutilisable ─────────────────────────────────────────
// Usage : <TrustBar /> sur n'importe quelle page
// Variantes :
//   light  — fond blanc/card  → légal, contenu, pages secondaires
//   dark   — fond sombre hero → à l'intérieur des sections orange/primaire

export interface TrustBarProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const BADGES = [
  { icon: BadgeCheck, label: '100 % gratuit',       color: 'text-success' },
  { icon: ShieldCheck, label: 'RGPD · France',       color: 'text-chart-3' },
  { icon: Megaphone,  label: '0 pub · 0 tracking',  color: 'text-chart-1' },
  { icon: Lock,       label: 'Sans compte requis',   color: 'text-primary' },
  { icon: MapPin,     label: 'Hébergé en France',    color: 'text-chart-4' },
];

const TrustBar: React.FC<TrustBarProps> = ({ variant = 'light', className = '' }) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={[
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-2',
        isDark ? '' : 'py-3 px-4 rounded-xl bg-muted/40 border border-border/50',
        className,
      ].join(' ')}
      aria-label="Garanties Apprenix"
    >
      {BADGES.map(({ icon: Icon, label, color }) => (
        <span
          key={label}
          className={[
            'inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap',
            isDark ? 'text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]' : `${color}`,
          ].join(' ')}
        >
          <Icon
            className={[
              'w-3.5 h-3.5 shrink-0',
              isDark ? 'text-white/70' : color,
            ].join(' ')}
            aria-hidden="true"
          />
          {label}
        </span>
      ))}
    </div>
  );
};

export default TrustBar;
