import {
  Accessibility as A11yIcon, ArrowRight, ArrowUp, BadgeCheck,
  BookOpen, Brain,
  Calendar, ChevronDown, ChevronUp,
  Cookie, CreditCard, ExternalLink, FileText, Globe, GraduationCap, Heart,
  Languages, Lock,
  Mail, MessageCircle,
  Server,
  ShieldCheck, ScanLine, Sparkles, User, Users, Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import WhatsAppContactModal from '@/components/WhatsAppContactModal';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { ROUTE_PREFETCH } from '@/lib/prefetch';

// ─── Données — RÈGLE : chaque path n'apparaît QU'UNE SEULE FOIS ──────────────

// Col 1 — 8 outils (démo pour visiteurs, accès direct pour connectés)
const TOOLS_LIST = [
  { label: 'Aide aux devoirs',       path: '/aide-ia',        icon: Brain      },
  { label: 'Scanner de devoirs',     path: '/scanner',        icon: ScanLine   },
  { label: 'Flashcards & révision',  path: '/flashcards',     icon: CreditCard },
  { label: 'Planning & Pomodoro',    path: '/organisation',   icon: Calendar   },
  { label: 'Maths & Sciences',       path: '/maths-sciences', icon: Zap        },
  { label: 'Outils linguistiques',   path: '/linguistique',   icon: Languages  },
  { label: 'Fiches & ressources',    path: '/ressources',     icon: BookOpen   },
  { label: 'Bloc-notes intelligent', path: '/notes',          icon: FileText   },
];

// Col 2 — Ressources & contenus (0 doublon avec col 1)
const RESOURCES_LIST = [
  { label: 'Base 100K réponses',     path: '/base-reponses'          },
  { label: 'Ressources officielles', path: '/ressources-officielles' },
  { label: 'Actualités éducatives',  path: '/actualites'             },
  { label: 'Communauté d\'entraide', path: '/communaute'             },
  { label: 'Classe virtuelle',       path: '/visio'                  },
  { label: 'Nouveautés 2026',        path: '/nouveautes'             },
];

// Col 3 — Examens & SEO (landing pages longue traîne — 0 doublon avec PROFILS qui couvre déjà /espace /parents /enseignants /inclusion)
const SEO_LANDING_LIST = [
  { label: 'Révision Bac 2026',        path: '/revision-bac-2026'   },
  { label: 'Bac Français 2026',        path: '/bac-francais'        },
  { label: 'Bac Philo 2026',           path: '/bac-philo'           },
  { label: 'Brevet Maths 2026',        path: '/brevet-maths'        },
  { label: 'Aide aux devoirs gratuite',path: '/aide-devoirs-gratuit'},
  { label: 'Méthode de travail',       path: '/methode-de-travail'  },
  { label: 'Cours maths gratuits',     path: '/cours-maths-gratuit' },
  { label: 'Établissements scolaires', path: '/etablissements'      },
];

// Col 3b — Confiance & support (0 doublon avec le reste)
const SUPPORT_LIST = [
  { label: 'Notre mission',    path: '/mission'       },
  { label: "Centre d'aide",    path: '/faq'           },
  { label: 'Nous contacter',   path: '/contact'       },
  { label: 'Sécurité & RGPD',  path: '/securite'      },
  { label: 'Transparence',     path: '/transparence'  },
  { label: 'Accessibilité',    path: '/accessibilite' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales',  path: '/mentions-legales'          },
  { label: 'Confidentialité',   path: '/politique-confidentialite' },
  { label: 'CGU',               path: '/cgu'                       },
  { label: 'Plan du site',      path: '/plan-du-site'              },
];

const PROFILS = [
  {
    icon: BookOpen,      label: 'Élèves & Étudiants',
    sub: 'fiches méthode · flashcards · planning · révision',
    path: '/espace',       iconBg: 'bg-primary/25',    iconColor: 'text-primary',  cta: 'Mon espace',
  },
  {
    icon: Users,         label: 'Parents',
    sub: 'Suivi · sécurité · 0 pub · mode parental',
    path: '/parents',      iconBg: 'bg-chart-2/25',    iconColor: 'text-chart-2',  cta: 'Espace parents',
  },
  {
    icon: GraduationCap, label: 'Enseignants',
    sub: 'Ressources Éduscol · RGPD',
    path: '/enseignants',  iconBg: 'bg-chart-4/25',    iconColor: 'text-chart-4',  cta: 'Ressources',
  },
  {
    icon: A11yIcon,      label: 'DYS / ULIS / SEGPA',
    sub: 'Interface adaptée · MDPH / PPS / PAP',
    path: '/inclusion',    iconBg: 'bg-success/25',    iconColor: 'text-success',  cta: 'Mode inclusion',
  },
];

const TRUST_BADGES = [
  { icon: BadgeCheck,  color: 'text-primary', label: '100 % gratuit · pour toujours'        },
  { icon: ShieldCheck, color: 'text-success',  label: 'RGPD · données hébergées en UE'       },
  { icon: Lock,        color: 'text-chart-4',  label: '0 pub · 0 tracking · 0 cookie tiers'  },
  { icon: A11yIcon,    color: 'text-chart-3',  label: 'RGAA 4.1 · Inclusion ULIS / SEGPA'    },
];

const FOOTER_STATS = [
  { value: '13',    label: 'outils gratuits', icon: Sparkles    },
  { value: '0 €',   label: 'pour toujours',   icon: BadgeCheck  },
  { value: '0 pub', label: 'jamais',           icon: ShieldCheck },
  { value: 'RGPD',  label: 'conforme',         icon: Lock        },
];

const handleNav = () =>
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));

// ─── Sous-composants ──────────────────────────────────────────────────────────
const NavLink: React.FC<{ path: string; label: string }> = ({ path, label }) => (
  <li>
    <Link
      to={path}
      onClick={handleNav}
      onPointerDown={() => ROUTE_PREFETCH[path]?.()}
      onMouseEnter={() => ROUTE_PREFETCH[path]?.()}
      className="flex items-center min-h-[44px] text-xs text-white/65 hover:text-white transition-colors font-medium leading-snug"
    >
      {label}
    </Link>
  </li>
);

const ColHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35 mb-3">{children}</p>
);

function LegalAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/55 transition-colors min-h-[44px]"
        aria-expanded={open}
      >
        Infos légales &amp; hébergeur
        {open
          ? <ChevronUp   className="w-3 h-3 shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-3 h-3 shrink-0" aria-hidden="true" />}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2 text-xs text-white/50 pl-1">
          <span className="inline-flex items-center gap-2">
            <User className="w-3 h-3 shrink-0 text-white/30" aria-hidden="true" />
            <span><strong className="text-white/60">Éditeur :</strong> Charly Soudan — activité non commerciale</span>
          </span>
          <span className="inline-flex items-start gap-2">
            <Server className="w-3 h-3 shrink-0 mt-0.5 text-white/30" aria-hidden="true" />
            <span><strong className="text-white/55">Frontend :</strong> Vercel · <strong className="text-white/55">BDD :</strong> Supabase UE (eu-west)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Globe className="w-3 h-3 shrink-0 text-white/30" aria-hidden="true" />
            <a href="https://apprenix.org" target="_blank" rel="noopener noreferrer"
              className="text-white/45 hover:text-white/65 underline underline-offset-2 transition-colors">
              apprenix.org
            </a>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const [waOpen, setWaOpen] = useState(false);
  const { resetConsent } = useCookieConsent();
  const wrap = 'w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12';

  return (
    <footer
      className="w-full shrink-0"
      aria-label="Pied de page Apprenix"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >

      {/* ══ ZONE 1 — BANDEAU CTA + STATS ══════════════════════════════════════ */}
      <div
        className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-4)) 100%)' }}
      >
        {/* Cercles décoratifs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/[0.07] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/[0.05] pointer-events-none" aria-hidden="true" />

        <div className={`${wrap} relative z-10 py-6 flex flex-col gap-5`}>

          {/* Texte + bouton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-white leading-snug text-balance">
                  Éducation 100 % gratuite — du CP au Bac+5
                </p>
                <p className="text-xs text-white/75 mt-0.5">
                  Sans pub · Sans abonnement · Données hébergées en France
                </p>
              </div>
            </div>
            <Link
              to="/connexion?mode=inscription"
              onClick={handleNav}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary text-sm font-extrabold hover:bg-white/93 active:scale-95 transition-[background-color,transform] duration-150 shrink-0 min-h-[48px] whitespace-nowrap self-start md:self-auto shadow-xl"
            >
              <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
              S'inscrire gratuitement
              <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>

          {/* Stats trust pills */}
          <div className="flex flex-wrap items-center gap-2">
            {FOOTER_STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 hover:bg-white/22 transition-colors"
              >
                <Icon className="w-3 h-3 text-white/80 shrink-0" aria-hidden="true" />
                <span className="text-white font-bold text-xs">{value}</span>
                <span className="text-white/65 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ZONE 2 — CORPS PRINCIPAL ══════════════════════════════════════════ */}
      <div className="bg-sidebar w-full">
        <div className={`${wrap} pt-10 pb-4 flex flex-col gap-10`}>

          {/* ── A. Logo + colonnes nav ──────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* Colonne brand */}
            <div className="flex flex-col gap-5 lg:max-w-[256px] shrink-0">
              {/* Logo + tagline */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <ApprenixLogo size={32} />
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-extrabold text-white tracking-tight">Apprenix</span>
                    <span className="text-[10px] text-white/45 font-medium mt-0.5">100 % gratuit</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed text-pretty">
                  Plateforme éducative sans pub, sans abonnement, sans données revendues.
                  Aide aux devoirs, flashcards, planning — du CP au Bac+5.
                </p>
              </div>

              {/* Badges confiance */}
              <div className="flex flex-col gap-2">
                {TRUST_BADGES.map(({ icon: Icon, color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-white/60">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-0.5 pt-1">
                <ColHead>Nous contacter</ColHead>
                <a
                  href="mailto:apprenix.contact@gmail.com"
                  className="inline-flex items-center gap-2 min-h-[44px] text-xs text-white/65 hover:text-white transition-colors font-medium"
                  aria-label="Email Apprenix"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate">apprenix.contact@gmail.com</span>
                </a>
                <button
                  type="button"
                  onClick={() => setWaOpen(true)}
                  className="inline-flex items-center gap-2 min-h-[44px] text-xs text-white/65 hover:text-white transition-colors font-medium text-left w-fit"
                  aria-label="Contacter via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* ── Navigation 3 colonnes ──────────────────────────────── */}
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">

              {/* Col 1 — 8 outils (démo visiteurs / accès direct connectés) */}
              <div>
                <ColHead>Outils gratuits</ColHead>
                <ul className="list-none m-0 p-0 flex flex-col">
                  {TOOLS_LIST.map(({ path, label, icon: Icon }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={handleNav}
                        onPointerDown={() => ROUTE_PREFETCH[path]?.()}
                        onMouseEnter={() => ROUTE_PREFETCH[path]?.()}
                        className="flex items-center gap-2 min-h-[44px] text-xs text-white/65 hover:text-white transition-colors font-medium group"
                      >
                        <Icon className="w-3 h-3 text-white/30 group-hover:text-primary shrink-0 transition-colors" aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 2 — Ressources & contenus */}
              <div>
                <ColHead>Ressources & contenus</ColHead>
                <ul className="list-none m-0 p-0">
                  {RESOURCES_LIST.map(l => <NavLink key={l.path} {...l} />)}
                </ul>
              </div>

              {/* Col 3 — Examens & SEO (PROFILS couvre déjà /espace /parents /enseignants /inclusion) */}
              <div className="sm:col-span-2 lg:col-span-1">
                <ColHead>Examens & révisions</ColHead>
                <ul className="list-none m-0 p-0 flex flex-col">
                  {SEO_LANDING_LIST.map(({ path, label }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={handleNav}
                        onPointerDown={() => ROUTE_PREFETCH[path]?.()}
                        onMouseEnter={() => ROUTE_PREFETCH[path]?.()}
                        className="flex items-center gap-2 min-h-[44px] text-xs text-white/65 hover:text-white transition-colors font-medium"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <ColHead>Confiance & support</ColHead>
                  <ul className="list-none m-0 p-0 flex flex-col">
                    {SUPPORT_LIST.map(l => <NavLink key={l.path} {...l} />)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── B. Profils "Votre espace" ───────────────────────────────── */}
          <div>
            <ColHead>Votre espace personnel</ColHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PROFILS.map(({ icon: Icon, label, sub, path, iconBg, iconColor, cta }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={handleNav}
                  onPointerDown={() => ROUTE_PREFETCH[path]?.()}
                  onMouseEnter={() => ROUTE_PREFETCH[path]?.()}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/22 transition-[background-color,border-color] duration-150 min-h-[56px]"
                  aria-label={label}
                >
                  <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white/85 group-hover:text-white transition-colors truncate leading-tight">{label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 truncate">{sub}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-white/35 group-hover:text-white/60 transition-colors hidden md:block whitespace-nowrap">{cta}</span>
                    <ArrowRight className={`w-3 h-3 ${iconColor} opacity-40 group-hover:opacity-90 group-hover:translate-x-0.5 transition-[opacity,transform] duration-150`} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── C. Séparateur + barre légale ───────────────────────────── */}
          <div className="border-t border-white/10 pt-5 flex flex-col gap-3">

            {/* Liens légaux — <li> wrappers pour éviter l'avertissement React.Fragment+key */}
            <nav aria-label="Liens légaux" className="flex flex-wrap items-center gap-x-1 gap-y-0">
              {LEGAL_LINKS.map((link, i) => (
                <li key={link.path} className="list-none flex items-center">
                  {i > 0 && <span className="text-white/20 text-xs select-none mx-1" aria-hidden="true">·</span>}
                  <Link
                    to={link.path}
                    onClick={handleNav}
                    className="text-xs text-white/40 hover:text-white/65 transition-colors min-h-[44px] flex items-center whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <span className="text-white/20 text-xs select-none mx-1" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={resetConsent}
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/65 transition-colors min-h-[44px] whitespace-nowrap"
                aria-label="Gérer mes préférences de cookies"
              >
                <Cookie className="w-3 h-3" aria-hidden="true" />
                Cookies
              </button>
              <span className="text-white/20 text-xs select-none mx-1" aria-hidden="true">·</span>
              <a
                href="https://www.signalement.gouv.fr"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/65 transition-colors min-h-[44px] whitespace-nowrap"
                aria-label="Signalement de contenus illicites"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                Signalement illicites
              </a>
            </nav>

            {/* Accordéon hébergeur */}
            <LegalAccordion />

            {/* Copyright + retour en haut */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-xs text-white/40">
                  © {new Date().getFullYear()} Apprenix — Charly Soudan · Site non commercial · France
                </p>
                <p className="text-xs text-white/25">
                  Contenu sous licence{' '}
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr"
                    target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white/45 transition-colors"
                  >
                    CC BY-NC-SA 4.0
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-white/40 flex items-center gap-1 whitespace-nowrap">
                  Fait avec
                  <Heart className="w-3 h-3 text-primary fill-primary shrink-0 mx-0.5" aria-hidden="true" />
                  pour les élèves
                </p>
                {/* Bouton retour en haut */}
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  aria-label="Retour en haut de page"
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-primary/25 border border-white/12 hover:border-primary/40 flex items-center justify-center transition-[background-color,border-color] duration-150 shrink-0 group"
                >
                  <ArrowUp className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" aria-hidden="true" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <WhatsAppContactModal open={waOpen} onOpenChange={setWaOpen} />
    </footer>
  );
};

export default Footer;
