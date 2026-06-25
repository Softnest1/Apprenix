import { ArrowRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageHeroVariant = 'trust' | 'tool' | 'community' | 'info' | 'legal';

export interface HeroStat {
  value: string;
  label: string;
  /** Icône emoji optionnelle */
  emoji?: string;
}

export interface PageHeroProps {
  variant?: PageHeroVariant;
  badge?: React.ReactNode;
  badgeClassName?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon?: React.FC<{ className?: string }>;
  stats?: HeroStat[];
  cta?: { label: string; to?: string; onClick?: () => void };
  ctaSecondary?: { label: string; to: string };
  children?: React.ReactNode;
  className?: string;
}

// ─── Config par variante ──────────────────────────────────────────────────────

interface VariantConfig {
  /** Gradient fond du hero complet */
  bg:            string;
  /** Couleur du halo principal (top-right) */
  halo1:         string;
  /** Couleur du halo secondaire (bottom-left) */
  halo2:         string;
  /** Fond + ring icône */
  iconWrap:      string;
  /** Couleur de l'icône */
  iconColor:     string;
  /** Classes du badge par défaut */
  badge:         string;
  /** Couleur de la valeur stat */
  statVal:       string;
  /** Fond du bloc stat */
  statBg:        string;
  /** Barre de couleur top */
  bar:           string;
  /** Bouton CTA primaire */
  ctaPrimary:    string;
  /** Bouton CTA secondaire (outline) */
  ctaSecondary:  string;
  /** Accent: bordure, séparateurs */
  accent:        string;
}

const V: Record<PageHeroVariant, VariantConfig> = {
  tool: {
    bg:           'bg-gradient-to-br from-primary/10 via-background to-primary/5',
    halo1:        'bg-primary/20',
    halo2:        'bg-primary/10',
    iconWrap:     'bg-primary/15 ring-2 ring-primary/25 shadow-xl shadow-primary/20',
    iconColor:    'text-primary',
    badge:        'bg-primary/12 text-primary border-primary/25 shadow-sm',
    statVal:      'text-primary',
    statBg:       'bg-primary/8 border border-primary/20 hover:bg-primary/14',
    bar:          'from-primary via-primary/60 to-transparent',
    ctaPrimary:   'btn-cta text-white font-bold shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:translate-y-0',
    ctaSecondary: 'border-primary/35 text-primary hover:bg-primary/8 hover:border-primary/50',
    accent:       'border-primary/15',
  },
  trust: {
    bg:           'bg-gradient-to-br from-success/10 via-background to-chart-4/5',
    halo1:        'bg-success/18',
    halo2:        'bg-chart-4/12',
    iconWrap:     'bg-success/15 ring-2 ring-success/25 shadow-xl shadow-success/20',
    iconColor:    'text-success',
    badge:        'bg-success/12 text-success border-success/25 shadow-sm',
    statVal:      'text-success',
    statBg:       'bg-success/8 border border-success/20 hover:bg-success/14',
    bar:          'from-success via-success/60 to-transparent',
    ctaPrimary:   'bg-success text-white font-bold shadow-lg shadow-success/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-success/35 hover:bg-success/90 active:translate-y-0',
    ctaSecondary: 'border-success/35 text-success hover:bg-success/8 hover:border-success/50',
    accent:       'border-success/15',
  },
  community: {
    bg:           'bg-gradient-to-br from-chart-4/10 via-background to-chart-5/5',
    halo1:        'bg-chart-4/18',
    halo2:        'bg-chart-5/12',
    iconWrap:     'bg-chart-4/15 ring-2 ring-chart-4/25 shadow-xl shadow-chart-4/20',
    iconColor:    'text-chart-4',
    badge:        'bg-chart-4/12 text-chart-4 border-chart-4/25 shadow-sm',
    statVal:      'text-chart-4',
    statBg:       'bg-chart-4/8 border border-chart-4/20 hover:bg-chart-4/14',
    bar:          'from-chart-4 via-chart-4/60 to-transparent',
    ctaPrimary:   'bg-chart-4 text-white font-bold shadow-lg shadow-chart-4/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-chart-4/35 hover:bg-chart-4/90 active:translate-y-0',
    ctaSecondary: 'border-chart-4/35 text-chart-4 hover:bg-chart-4/8 hover:border-chart-4/50',
    accent:       'border-chart-4/15',
  },
  info: {
    bg:           'bg-gradient-to-br from-chart-3/10 via-background to-chart-1/5',
    halo1:        'bg-chart-3/18',
    halo2:        'bg-chart-1/12',
    iconWrap:     'bg-chart-3/15 ring-2 ring-chart-3/25 shadow-xl shadow-chart-3/20',
    iconColor:    'text-chart-3',
    badge:        'bg-chart-3/12 text-chart-3 border-chart-3/25 shadow-sm',
    statVal:      'text-chart-3',
    statBg:       'bg-chart-3/8 border border-chart-3/20 hover:bg-chart-3/14',
    bar:          'from-chart-3 via-chart-3/60 to-transparent',
    ctaPrimary:   'bg-chart-3 text-white font-bold shadow-lg shadow-chart-3/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-chart-3/35 hover:bg-chart-3/90 active:translate-y-0',
    ctaSecondary: 'border-chart-3/35 text-chart-3 hover:bg-chart-3/8 hover:border-chart-3/50',
    accent:       'border-chart-3/15',
  },
  legal: {
    bg:           'bg-gradient-to-br from-muted/60 via-background to-muted/30',
    halo1:        'bg-muted/80',
    halo2:        'bg-muted/50',
    iconWrap:     'bg-muted ring-2 ring-border shadow-md',
    iconColor:    'text-muted-foreground',
    badge:        'bg-muted text-muted-foreground border-border',
    statVal:      'text-foreground',
    statBg:       'bg-muted border border-border hover:bg-muted/80',
    bar:          'from-muted-foreground/50 via-border to-transparent',
    ctaPrimary:   'bg-foreground text-background font-bold shadow-md hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
    ctaSecondary: 'border-border text-foreground hover:bg-muted',
    accent:       'border-border',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

const PageHero: React.FC<PageHeroProps> = ({
  variant = 'info',
  badge,
  badgeClassName,
  title,
  subtitle,
  icon: Icon,
  stats,
  cta,
  ctaSecondary,
  children,
  className = '',
}) => {
  const v = V[variant];
  const uid = React.useId();
  const patId = `ph-grid-${uid.replace(/:/g, '')}`;

  return (
    <section
      className={`relative rounded-2xl md:rounded-3xl overflow-hidden mb-4 md:mb-6 animate-fade-up border ${v.accent} ${v.bg} ${className}`}
      aria-label="Présentation de la page"
    >
      {/* ── Barre de couleur top (6px) ── */}
      <div className={`h-[6px] w-full bg-gradient-to-r ${v.bar}`} aria-hidden="true" />

      {/* ── Décor de fond : halos + grille + cercles décoratifs ── */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl" aria-hidden="true">
        {/* Cercles décoratifs nets — style dashboard moderne */}
        <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full ${v.halo1} opacity-30`} />
        <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full ${v.halo2} opacity-20`} />
        <div className={`absolute top-1/2 right-16 w-16 h-16 rounded-full ${v.halo1} opacity-15`} />
        {/* Halo doux principal — profondeur */}
        <div className={`absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full ${v.halo1} blur-[80px] opacity-40`} />
        <div className={`absolute -bottom-16 -left-16 w-[320px] h-[320px] rounded-full ${v.halo2} blur-[60px] opacity-30`} />
        {/* Grille pointillée subtile */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={patId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patId})`} />
        </svg>
      </div>

      {/* ── Contenu principal ── */}
      <div className="relative z-10 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">

        {/* ── En-tête : icône + badge côte à côte ── */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-5 md:mb-6">

          {/* Icône grande — visible en desktop uniquement côté gauche */}
          {Icon && (
            <div className={`hidden md:flex w-16 h-16 lg:w-20 lg:h-20 rounded-full items-center justify-center shrink-0 ${v.iconWrap}`}>
              <Icon className={`w-8 h-8 lg:w-10 lg:h-10 ${v.iconColor}`} />
            </div>
          )}

          {/* Bloc texte */}
          <div className="flex-1 min-w-0">

            {/* Badge + icône mobile */}
            <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-3.5">
              {Icon && (
                <div className={`flex md:hidden w-10 h-10 rounded-full items-center justify-center shrink-0 ${v.iconWrap}`}>
                  <Icon className={`w-5 h-5 ${v.iconColor}`} />
                </div>
              )}
              {badge && (
                <Badge className={`text-xs font-semibold px-3 py-1.5 gap-1.5 ${badgeClassName ?? v.badge}`}>
                  {badge}
                </Badge>
              )}
            </div>

            {/* Titre — grande typographie */}
            <h1 className="text-2xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold text-foreground leading-[1.1] text-balance mb-3">
              {title}
            </h1>

            {/* Sous-titre — lisible, aéré */}
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mb-5">
              {subtitle}
            </p>

            {/* ── Stats ── */}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-5 md:mb-6">
                {stats.map((st) => (
                  <div
                    key={st.label}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-colors cursor-default ${v.statBg}`}
                  >
                    {st.emoji && (
                      <span className="text-lg leading-none shrink-0" aria-hidden="true">{st.emoji}</span>
                    )}
                    <div className="min-w-0">
                      <span className={`block text-lg md:text-xl font-extrabold leading-none ${v.statVal}`}>
                        {st.value}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5 leading-tight whitespace-nowrap">
                        {st.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CTAs ── */}
            {(cta || ctaSecondary) && (
              <div className="flex flex-col gap-3 md:flex-row mb-4 md:mb-5">
                {cta && (
                  cta.to ? (
                    <Button
                      asChild
                      className={`h-12 px-7 text-sm rounded-xl w-full md:w-auto min-h-[48px] transition-[transform,box-shadow,background-color] duration-150 ${v.ctaPrimary}`}
                    >
                      <Link to={cta.to}>
                        {cta.label}
                        <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={cta.onClick}
                      className={`h-12 px-7 text-sm rounded-xl w-full md:w-auto min-h-[48px] transition-[transform,box-shadow,background-color] duration-150 ${v.ctaPrimary}`}
                    >
                      {cta.label}
                      <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  )
                )}
                {ctaSecondary && (
                  <Button
                    asChild
                    variant="outline"
                    className={`h-12 px-7 text-sm font-medium rounded-xl w-full md:w-auto min-h-[48px] ${v.ctaSecondary}`}
                  >
                    <Link to={ctaSecondary.to}>{ctaSecondary.label}</Link>
                  </Button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Slot enfants (ENBadge, extra content) ── */}
        {children && (
          <div className={`pt-4 border-t ${v.accent}`}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
