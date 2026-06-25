import { AccessibilityFab, AccessibilityHeaderBtn } from '@/components/AccessibilityToolbar';
import {
  AlarmClock, BookOpen, Brain,
  Calendar, ChevronLeft,
  CreditCard, FileText, Flame, GraduationCap, HelpCircle,
  History, Languages, LogOut, Menu,
  Moon, Network, ScanLine, Settings2,
  ShieldCheck, Sparkles, Star, Sun, Trophy, User, Users, Video, X, Zap,
} from 'lucide-react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import GuestToolPreview from '@/components/GuestToolPreview';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { getLevelCategory, getLevelCategoryLabel } from '@/lib/levelUtils';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem  { path: string; label: string; icon: React.ElementType; exact?: boolean }
interface NavGroup { label: string; items: NavItem[] }

// ─── Couleurs par niveau ──────────────────────────────────────────────────────
const LEVEL_META: Record<string, { emoji: string; textCls: string; bgCls: string }> = {
  primaire:  { emoji: '🏫', textCls: 'text-emerald-700 dark:text-emerald-400', bgCls: 'bg-emerald-500/15' },
  college:   { emoji: '📚', textCls: 'text-violet-700  dark:text-violet-400',  bgCls: 'bg-violet-500/15'  },
  lycee:     { emoji: '🎓', textCls: 'text-orange-700  dark:text-orange-400',  bgCls: 'bg-orange-500/15'  },
  superieur: { emoji: '🏛️', textCls: 'text-blue-700    dark:text-blue-400',    bgCls: 'bg-blue-500/15'    },
  adapte:    { emoji: '💚', textCls: 'text-green-700   dark:text-green-400',   bgCls: 'bg-green-500/15'   },
};

// ─── Navigation stratégique — groupes adaptés au niveau ──────────────────────
const NAV_GROUPS_DEFAULT: NavGroup[] = [
  {
    label: 'Apprendre',
    items: [
      { path: '/aide-ia',    label: 'Aide aux devoirs',    icon: Brain    },
      { path: '/scanner',    label: 'Scanner devoirs',     icon: ScanLine },
      { path: '/notes',      label: 'Mes notes',           icon: FileText },
      { path: '/ressources', label: 'Ressources & fiches', icon: BookOpen },
    ],
  },
  {
    label: 'Réviser',
    items: [
      { path: '/flashcards',    label: 'Flashcards',    icon: CreditCard },
      { path: '/quiz',          label: 'Quiz',          icon: Star       },
      { path: '/carte-mentale', label: 'Carte mentale', icon: Network    },
      { path: '/examen',        label: 'Mode examen',   icon: AlarmClock },
    ],
  },
  {
    label: 'Organiser',
    items: [
      { path: '/organisation',   label: 'Planning & Agenda',  icon: Calendar  },
      { path: '/focus',          label: 'Mode Deep Work',     icon: Flame     },
      { path: '/maths-sciences', label: 'Maths & Sciences',   icon: GraduationCap },
      { path: '/linguistique',   label: 'Linguistique',       icon: Languages },
    ],
  },
  {
    label: 'Ma progression',
    items: [
      { path: '/motivation',    label: 'Progrès & XP',  icon: Trophy     },
      { path: '/mes-questions', label: 'Mes questions', icon: HelpCircle },
      { path: '/mes-depots',    label: 'Mes dépôts',    icon: History    },
    ],
  },
  {
    label: 'Communauté & Professeurs',
    items: [
      { path: '/communaute',          label: 'Communauté',          icon: Users       },
      { path: '/visio',               label: 'Classe virtuelle',     icon: Video       },
      { path: '/trouver-enseignant',  label: 'Trouver un prof',      icon: GraduationCap },
      { path: '/mes-demandes',        label: 'Mes demandes',         icon: BookOpen    },
      { path: '/mes-collaborations',  label: 'Mes collaborations',   icon: Sparkles    },
      { path: '/accessibilite-perso', label: 'Accessibilité',        icon: Settings2   },
    ],
  },
];

// Navigation adaptée ULIS / SEGPA — outils simplifiés, sans Mode Examen ni Quiz
const NAV_GROUPS_ADAPTE: NavGroup[] = [
  {
    label: 'Apprendre 💚',
    items: [
      { path: '/aide-ia',    label: 'Aide aux devoirs ULIS', icon: Brain    },
      { path: '/scanner',    label: 'Scanner un exercice',   icon: ScanLine },
      { path: '/inclusion',  label: 'Ressources & droits',   icon: Users    },
      { path: '/ressources', label: 'Fiches méthode',        icon: BookOpen },
    ],
  },
  {
    label: 'Mémoriser',
    items: [
      { path: '/flashcards',  label: 'Flashcards visuelles', icon: CreditCard },
      { path: '/notes',       label: 'Mes notes',            icon: FileText   },
      { path: '/linguistique',label: 'Dictionnaire',         icon: Languages  },
    ],
  },
  {
    label: 'Organiser',
    items: [
      { path: '/organisation', label: 'Mon emploi du temps', icon: Calendar },
      { path: '/motivation',   label: 'Mes badges & XP',     icon: Trophy   },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { path: '/communaute',          label: 'Communauté',      icon: Users     },
      { path: '/accessibilite-perso', label: 'Accessibilité',   icon: Settings2 },
    ],
  },
];

// ─── Composant sidebar ───────────────────────────────────────────────────────
const SidebarNav: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, level, isDark, toggleTheme, logout, isAuthenticated } = useApp();
  const navRef   = useRef<HTMLElement>(null);
  const category = getLevelCategory(level);
  const meta     = LEVEL_META[category] ?? LEVEL_META['lycee'];
  // Navigation adaptée ULIS/SEGPA ou standard
  const NAV_GROUPS = category === 'adapte' ? NAV_GROUPS_ADAPTE : NAV_GROUPS_DEFAULT;
  const catLabel = getLevelCategoryLabel(level);
  const verified = !!(profile as { verified?: boolean }).verified;
  const initials = (profile.name || 'É').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  // Remonter en haut du scroll à chaque navigation
  useEffect(() => { if (navRef.current) navRef.current.scrollTop = 0; }, [location.pathname]);

  const isActive = (item: NavItem) =>
    item.exact ? location.pathname === item.path
               : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  // Déconnexion → retour à l'accueil (pas à /connexion)
  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/', { replace: true });
  };

  const openBot = () => {
    onClose?.();
    setTimeout(() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show')), 80);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground select-none">

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2 border-b border-sidebar-border shrink-0 space-y-2">

        {/* Logo + label + bouton fermer */}
        <div className="flex items-center gap-2.5 min-h-[36px]">
          <ApprenixLogo className="w-7 h-7 shrink-0" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-bold text-sidebar-foreground">Apprenix</p>
            <p className="text-[10px] font-medium tracking-widest uppercase text-sidebar-foreground/45">
              Espace Étudiant
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost" size="icon"
              className="shrink-0 w-8 h-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onClose}
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Niveau actif — pill colorée → lien vers la bonne URL de catégorie */}
        <Link
          to={`/espace/${category}`}
          onClick={onClose}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80',
            meta.bgCls, meta.textCls,
          )}
        >
          <span className="text-sm leading-none shrink-0" aria-hidden="true">{meta.emoji}</span>
          <span className="flex-1 min-w-0 truncate font-bold">{catLabel}</span>
          <span className="shrink-0 flex items-center gap-1 text-[10px] opacity-75 font-normal">
            <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
            {profile.xpPoints} XP
          </span>
          {verified && <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-success" />}
        </Link>

        {/* Bandeau ULIS / SEGPA — affiché uniquement pour le dispositif adapté */}
        {category === 'adapte' && (
          <Link
            to="/inclusion"
            onClick={onClose}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 hover:bg-green-500/20 transition-colors"
            aria-label="Accéder aux ressources et droits ULIS / SEGPA"
          >
            <span className="text-base leading-none shrink-0" aria-hidden="true">💚</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-green-700 dark:text-green-400 leading-tight truncate">
                Mode {level} activé
              </p>
              <p className="text-[10px] text-green-600/70 dark:text-green-400/60 leading-tight truncate">
                Ressources &amp; droits →
              </p>
            </div>
          </Link>
        )}

        {/* Bouton Assistant IA Léa — CTA principal */}
        <button
          type="button"
          onClick={openBot}
          aria-label="Ouvrir l'assistant Apprenix"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-primary-foreground/20">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="flex-1 min-w-0 text-left truncate">Assistant IA · Léa</span>
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-foreground/20">
            Aide
          </span>
        </button>
      </div>

      {/* ── Lien Tableau de bord (raccourci rapide standalone) ───────────── */}
      <div className="px-2 pt-2 pb-0 shrink-0">
        <Link
          to={`/espace/${category}`}
          onClick={onClose}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]',
            HOME_PATHS.has(location.pathname)
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Tableau de bord</span>
        </Link>
      </div>

      {/* ── Navigation principale scrollable ─────────────────────────────── */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto px-2 py-1"
        style={{ overscrollBehavior: 'contain' }}
        aria-label="Navigation étudiant"
      >
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className="mt-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30 select-none">
              {label}
            </p>
            <div className="space-y-px">
              {items.map(item => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 min-w-0 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Pied : avatar + Mon profil + thème + déconnexion ─────────────── */}
      {/* paddingBottom safe-area : évite le chevauchement avec la barre système Android/iOS */}
      <div className="border-t border-sidebar-border shrink-0 px-2 py-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-1">
          {/* Lien profil */}
          <Link
            to="/espace/profil"
            onClick={onClose}
            className="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                {profile.avatarUrl ? (
                  <span className="text-base leading-none">{profile.avatarUrl}</span>
                ) : initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                {profile.name || 'Étudiant'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate mt-0.5 flex items-center gap-1">
                <User className="w-2.5 h-2.5 shrink-0" />
                Mon profil
              </p>
            </div>
          </Link>

          {/* Bascule thème */}
          <button
            type="button"
            onClick={toggleTheme}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Accessibilité — discret, toujours visible dans la sidebar */}
          <AccessibilityHeaderBtn
            iconOnly
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          />

          {/* Déconnexion — redirige vers l'accueil, pas vers /connexion */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-destructive/65 hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE_TITLES ──────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/espace':              'Mon espace',
  '/espace/primaire':     'Espace Primaire',
  '/espace/college':      'Espace Collège',
  '/espace/lycee':        'Espace Lycée',
  '/espace/superieur':    'Espace Supérieur',
  '/espace/adapte':       'Espace ULIS & SEGPA',
  '/espace/profil':       'Mon profil',
  '/aide-ia':             'Aide aux devoirs',
  '/scanner':             'Scanner devoirs',
  '/flashcards':          'Flashcards',
  '/organisation':        'Planning & Agenda',
  '/notes':               'Mes notes',
  '/linguistique':        'Linguistique',
  '/maths-sciences':      'Maths & Sciences',
  '/mes-questions':       'Mes questions',
  '/mes-depots':          'Mes dépôts',
  '/motivation':          'XP & Badges',
  '/examen':              'Mode Examen',
  '/quiz':                'Quiz interactif',
  '/carte-mentale':       'Carte mentale',
  '/trouver-enseignant':  'Trouver un prof',
  '/accessibilite-perso': 'Accessibilité',
  '/tableau-de-bord':     'Mon espace',
  '/inclusion':           'Ressources & Droits ULIS / SEGPA',
};

// Outils pédagogiques — les visiteurs voient GuestToolPreview au lieu d'être redirigés
const TOOL_DEMO_PATHS = new Set([
  '/espace',
  '/espace/primaire', '/espace/college', '/espace/lycee', '/espace/superieur', '/espace/adapte',
  '/aide-ia', '/scanner', '/flashcards', '/organisation',
  '/maths-sciences', '/linguistique', '/notes', '/quiz',
  '/carte-mentale', '/examen', '/motivation',
  '/trouver-enseignant',
  '/ressources', '/base-reponses',
  '/communaute', '/visio', '/focus',
]);

const GUEST_PAGE_NAMES: Record<string, string> = {
  '/aide-ia':            "l'Aide IA",
  '/scanner':            'le Scanner',
  '/flashcards':         'les Flashcards',
  '/organisation':       "l'Organisation",
  '/maths-sciences':     'les Maths & Sciences',
  '/linguistique':       'les Outils Linguistiques',
  '/notes':              'les Notes',
  '/quiz':               'le Quiz',
  '/carte-mentale':      'la Carte Mentale',
  '/examen':             'le Mode Examen',
  '/motivation':         'la Motivation & Progrès',
  '/trouver-enseignant': 'Trouver un enseignant',
  '/ressources':         'les Ressources',
  '/communaute':         'la Communauté',
  '/visio':              'la Classe Virtuelle',
  '/focus':              'le Mode Deep Work',
};

// Pages "accueil niveau" — pas de bouton retour dans la topbar
const HOME_PATHS = new Set([
  '/espace',
  '/espace/primaire', '/espace/college', '/espace/lycee', '/espace/superieur', '/espace/adapte',
]);

// ─── Topbar : badge niveau compact (desktop) ─────────────────────────────────
const TopbarLevelBadge: React.FC = () => {
  const { profile, level } = useApp();
  const category = getLevelCategory(level);
  const meta     = LEVEL_META[category] ?? LEVEL_META['lycee'];
  return (
    <div className={cn(
      'hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0',
      meta.bgCls, meta.textCls,
    )}>
      <span aria-hidden="true">{meta.emoji}</span>
      <span className="truncate max-w-[8rem]">{level}</span>
      <span className="opacity-60">·</span>
      <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{profile.xpPoints} XP</span>
    </div>
  );
};

// ─── PageLoader inline (Suspense fallback dans le layout) ────────────────────
const PageLoader: React.FC = () => (
  <div className="flex-1 p-4 md:p-6 space-y-4 animate-pulse min-h-[calc(100dvh-8rem)]">
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden pointer-events-none">
      <div className="h-full bg-primary animate-page-progress" />
    </div>
    <div className="h-7 bg-muted rounded-lg w-48" />
    <div className="h-48 bg-muted rounded-2xl w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
    </div>
  </div>
);

// ─── EtudiantLayout ───────────────────────────────────────────────────────────
// Rendu UNE SEULE FOIS grâce aux nested routes React Router.
// <Outlet /> reçoit le contenu de la route active sans remonter ce composant.
export const EtudiantLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location   = useLocation();
  const navigate   = useNavigate();
  const { isAuthenticated, authReady, profile, level, isDark, toggleTheme } = useApp();
  const prevPath      = useRef(location.pathname);
  // Ref toujours synchronisée — lue dans la garde sans figurer dans ses deps.
  // Cela évite que chaque navigation interne re-déclenche la garde d'auth et
  // provoque une redirection involontaire vers une autre page étudiant.
  const pathnameRef   = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  // Fermer le drawer mobile à chaque changement de route
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setMobileOpen(false);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Garde de route : déclenché UNIQUEMENT sur changement d'état d'auth,
  // PAS sur chaque navigation (location.pathname retiré des dépendances).
  // La ref garantit un pathname toujours à jour sans risque de stale-closure.
  useEffect(() => {
    if (!authReady) return;
    const path = pathnameRef.current;
    if (!isAuthenticated && !TOOL_DEMO_PATHS.has(path)) {
      navigate('/connexion', { replace: true, state: { from: path } });
      return;
    }
    if (isAuthenticated) {
      const role = (profile as { role?: string }).role;
      if (role === 'teacher' || role === 'admin') { navigate('/espace-enseignant', { replace: true }); return; }
      if (role === 'parent') { navigate('/parents-espace', { replace: true }); return; }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAuthenticated, (profile as { role?: string }).role]);

  // Titre de la page active
  const pageTitle = (() => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    const match = Object.entries(PAGE_TITLES)
      .filter(([p]) => p !== '/espace')
      .find(([p]) => location.pathname.startsWith(p + '/'));
    return match?.[1] ?? 'Mon espace';
  })();

  // Visiteur sur page outil → vitrine séduisante
  if (!isAuthenticated && TOOL_DEMO_PATHS.has(location.pathname) && location.pathname !== '/espace') {
    return <GuestToolPreview path={location.pathname} pageName={GUEST_PAGE_NAMES[location.pathname]} />;
  }
  // Visiteur sur une URL niveau → landing page gère son propre rendu
  if (!isAuthenticated && HOME_PATHS.has(location.pathname)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    );
  }

  const isHome = HOME_PATHS.has(location.pathname);

  return (
    <div className="flex min-h-dvh w-full bg-background min-w-0">{/* min-h-dvh = 100dvh iOS fix ; min-w-0 empêche les enfants flex de forcer l'élargissement du root */}
      {/* Lien d'évitement — navigation clavier WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>

      {/* ── Sidebar desktop ───────────────────────────────────────────────── */}
      {/* paddingTop safe-area : sidebar sticky top-0 sur iPhone notch paysage */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border sticky top-0 h-dvh overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <SidebarNav />
      </aside>

      {/* ── Sheet mobile ──────────────────────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar" aria-label="Menu étudiant">
          <SidebarNav onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ── Zone principale ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar unifiée (mobile + desktop)
            paddingTop safe-area : header sticky top-0, couvre le notch iOS
            au défilement (Dynamic Island ~59px, iPhone X ~44px).
            max-w-screen-xl sur le contenu interne : centre sur 4K/TV/cinéma. */}
        <header
          className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shrink-0"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-1 px-3 md:px-5 lg:px-8 h-14 max-w-screen-xl mx-auto w-full">

            {/* ── Hamburger mobile ──────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ── Bouton retour desktop ─────────────────────────────────── */}
            {!isHome && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="hidden lg:flex shrink-0 w-9 h-9 items-center justify-center rounded-xl text-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* ── Titre : flex-1 sur mobile ET desktop — plus d'absolute   */}
            {/*    [≡] ── [Titre flex-1 text-center] ── [✨][♿][🌙]          */}
            <div className="flex-1 min-w-0 flex justify-center lg:justify-start px-1">
              {/* Mobile : lien centré, tronqué, avec espace réservé par flex */}
              <Link
                to={`/espace/${getLevelCategory(level)}`}
                className="lg:hidden flex items-center gap-1.5 min-w-0"
                aria-label="Retour à mon espace"
              >
                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                  {pageTitle}
                </span>
              </Link>
              {/* Desktop : titre simple (sidebar affiche le logo) */}
              <span className="hidden lg:block font-semibold text-sm text-foreground truncate">
                {pageTitle}
              </span>
            </div>

            {/* ── Assistant IA ─────────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show'))}
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition-colors"
              aria-label="Ouvrir l'assistant Apprenix"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* ── Accessibilité ─────────────────────────────────────────── */}
            <AccessibilityHeaderBtn
              iconOnly
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
            />

            {/* ── Mode sombre / clair ───────────────────────────────────── */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* ── Badge niveau ─────────────────────────────────────────── */}
            <TopbarLevelBadge />
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 overflow-x-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default EtudiantLayout;
