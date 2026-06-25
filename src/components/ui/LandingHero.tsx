/**
 * LandingHero — Hero premium pour les 5 pages landing SEO
 * Fond dégradé sombre, texte blanc, orbes animés, grille décorative
 * Totalement responsive : mobile 375px → cinéma 4K
 */

import { ArrowRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export interface LandingHeroProps {
  /** Couleur du dégradé : hsl values en % ex: "220,80%,28%" */
  gradientFrom?: string;
  gradientMid?: string;
  gradientTo?: string;
  /** Emoji + texte du badge */
  badge: React.ReactNode;
  /** Titre principal (peut inclure du JSX avec <span>) */
  title: React.ReactNode;
  /** Sous-titre descriptif */
  subtitle: string;
  /** CTA principal */
  ctaPrimary: { label: string; to: string; icon?: React.FC<{ className?: string }> };
  /** CTA secondaire */
  ctaSecondary?: { label: string; to: string; icon?: React.FC<{ className?: string }> };
  /** Contenu optionnel sous le sous-titre (ex : badges niveaux) */
  extra?: React.ReactNode;
}

const LandingHero: React.FC<LandingHeroProps> = ({
  gradientFrom = '220,80%,28%',
  gradientMid  = '225,90%,40%',
  gradientTo   = '215,65%,32%',
  badge,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  extra,
}) => {
  const PrimaryIcon = ctaPrimary.icon;
  const SecondaryIcon = ctaSecondary?.icon;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${gradientFrom}) 0%, hsl(${gradientMid}) 50%, hsl(${gradientTo}) 100%)`,
      }}
      aria-label="Présentation de la page"
    >
      {/* ── Décor de fond ── */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Orbe principal top-right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-white/[0.07] blur-[80px]" />
        {/* Orbe secondaire bottom-left */}
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-white/[0.05] blur-[60px]" />
        {/* Mini orbe central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-white/[0.03] blur-[80px]" />
        {/* Grille pointillée */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lh-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lh-grid)" />
        </svg>
        {/* Lignes diagonales légères */}
        <div className="absolute -top-8 left-1/3 w-px h-[150%] bg-white opacity-[0.04] rotate-[10deg]" />
        <div className="absolute -top-8 right-1/4 w-px h-[150%] bg-white opacity-[0.03] rotate-[-7deg]" />
        {/* Vague décorative bas */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.07]"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,72 720,8 1080,40 C1260,56 1380,28 1440,40 L1440,80 L0,80 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* ── Contenu ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-14 md:py-20 lg:py-24 text-center">

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse shrink-0" aria-hidden="true" />
            {badge}
          </span>
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold text-white leading-[1.1] text-balance mb-5 [text-shadow:0_2px_20px_rgba(0,0,0,0.28)]">
          {title}
        </h1>

        {/* Sous-titre */}
        <p className="text-base md:text-lg xl:text-xl text-white/85 leading-relaxed text-pretty max-w-2xl mx-auto mb-6 [text-shadow:0_1px_4px_rgba(0,0,0,0.18)]">
          {subtitle}
        </p>

        {/* Extra (badges niveaux, etc.) */}
        {extra && (
          <div className="mb-7">{extra}</div>
        )}

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
          <Link
            to={ctaPrimary.to}
            className="inline-flex items-center justify-center gap-2.5 bg-white text-primary font-extrabold text-base rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-[transform,box-shadow] duration-200 px-7 py-4 w-full md:w-auto min-h-[54px] min-w-[220px]"
          >
            {PrimaryIcon && <PrimaryIcon className="w-5 h-5 shrink-0" />}
            <span className="truncate">{ctaPrimary.label}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
          {ctaSecondary && (
            <Link
              to={ctaSecondary.to}
              className="inline-flex items-center justify-center gap-2.5 text-white font-semibold border-2 border-white/40 hover:border-white/70 rounded-2xl px-7 py-4 hover:bg-white/12 transition-[border-color,background-color] duration-200 backdrop-blur-sm w-full md:w-auto min-h-[54px] min-w-[220px] text-sm"
            >
              {SecondaryIcon && <SecondaryIcon className="w-4 h-4 shrink-0" />}
              <span className="truncate">{ctaSecondary.label}</span>
            </Link>
          )}
        </div>

        {/* Ligne de confiance */}
        <p className="mt-5 text-white/50 text-xs font-medium tracking-wide">
          100 % gratuit · Sans compte obligatoire · Sans publicité · Données hébergées en France 🇫🇷
        </p>
      </div>
    </section>
  );
};

export default LandingHero;
