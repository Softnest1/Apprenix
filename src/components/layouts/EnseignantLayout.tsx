import {
  BookOpen, Calendar, ChevronLeft,
  ClipboardList, GraduationCap, HelpCircle,
  LogOut, Menu, MessageSquare, Moon,
  ShieldCheck, Sparkles, Sun, User, Users, X, Zap,
} from 'lucide-react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AccessibilityFab, AccessibilityHeaderBtn } from '@/components/AccessibilityToolbar';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface NavItem { path: string; label: string; icon: React.ElementType; exact?: boolean; badge?: number }
interface NavGroup { label: string; items: NavItem[] }

// ─── Groupes de navigation enseignant ────────────────────────────────────────
function buildNav(openQ: number, pendingS: number, pendingReq: number, activeCollab: number): NavGroup[] {
  return [
    {
      label: 'Mes élèves',
      items: [
        { path: '/espace-enseignant/questions',   label: 'Questions élèves',  icon: HelpCircle,    badge: openQ       },
        { path: '/espace-enseignant/corrections', label: 'Copies à corriger', icon: ClipboardList, badge: pendingS    },
        { path: '/espace-enseignant/demandes',    label: 'Demandes reçues',   icon: Users,         badge: pendingReq  },
        { path: '/espace-enseignant/collaborations', label: 'Collaborations', icon: MessageSquare, badge: activeCollab },
        { path: '/espace-enseignant/messagerie',  label: 'Messagerie',        icon: MessageSquare                    },
      ],
    },
    {
      label: 'Mon enseignement',
      items: [
        { path: '/espace-enseignant/contenus', label: 'Mes contenus', icon: BookOpen  },
        { path: '/espace-enseignant/agenda',   label: 'Agenda',       icon: Calendar  },
      ],
    },
  ];
}

// ─── Sidebar enseignant ───────────────────────────────────────────────────────
const SidebarNav: React.FC<{
  onClose?: () => void;
  openQ?: number;
  pendingS?: number;
  pendingReq?: number;
  activeCollab?: number;
}> = ({ onClose, openQ = 0, pendingS = 0, pendingReq = 0, activeCollab = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isDark, toggleTheme, logout, isAuthenticated } = useApp();
  const navRef   = useRef<HTMLElement>(null);
  const groups   = buildNav(openQ, pendingS, pendingReq, activeCollab);

  const verified = !!(profile as { verified?: boolean }).verified;
  const initials = (profile.name || 'P').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => { if (navRef.current) navRef.current.scrollTop = 0; }, [location.pathname]);

  const isActive = (item: NavItem) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

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

      {/* ── En-tête ────────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2 border-b border-sidebar-border shrink-0 space-y-2">

        {/* Logo + label + bouton fermer */}
        <div className="flex items-center gap-2.5 min-h-[36px]">
          <ApprenixLogo className="w-7 h-7 shrink-0" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-bold text-sidebar-foreground">Apprenix</p>
            <p className="text-[10px] font-medium tracking-widest uppercase text-sidebar-foreground/45">
              Espace Enseignant
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

        {/* Carte enseignant — pill indigo */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
          <span className="text-sm leading-none shrink-0" aria-hidden="true">👨‍🏫</span>
          <div className="flex-1 min-w-0">
            <span className="font-bold truncate block">{profile.name || 'Enseignant'}</span>
          </div>
          <span className="shrink-0 text-[10px] opacity-75 font-normal">
            {verified ? 'Vérifié' : 'Enseignant'}
          </span>
          {verified && <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-success" />}
        </div>

        {/* Bouton assistant IA */}
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

      {/* ── Lien Vue d'ensemble (standalone) ─────────────────────────────── */}
      <div className="px-2 pt-2 pb-0 shrink-0">
        <Link
          to="/espace-enseignant"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]',
            location.pathname === '/espace-enseignant'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Vue d'ensemble</span>
        </Link>
      </div>

      {/* ── Navigation scrollable ─────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto px-2 py-1"
        style={{ overscrollBehavior: 'contain' }}
        aria-label="Navigation enseignant"
      >
        {groups.map(({ label, items }) => (
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
                    {!!item.badge && item.badge > 0 && (
                      <span className={cn(
                        'shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        active
                          ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                          : 'bg-destructive/15 text-destructive',
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Pied : profil + thème + déconnexion ──────────────────────────── */}
      <div className="border-t border-sidebar-border shrink-0 px-2 py-2">
        <div className="flex items-center gap-1">
          {/* Lien profil */}
          <Link
            to="/espace-enseignant/profil"
            onClick={onClose}
            className="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {profile.avatarUrl ? (
                  <span className="text-base leading-none">{profile.avatarUrl}</span>
                ) : initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                {profile.name || 'Enseignant'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate mt-0.5 flex items-center gap-1">
                <User className="w-2.5 h-2.5 shrink-0" />
                Mon profil
              </p>
            </div>
          </Link>

          {/* Thème */}
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

          {/* Déconnexion → accueil */}
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

// ─── Titres de pages ──────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/espace-enseignant':                   'Vue d\'ensemble',
  '/espace-enseignant/profil':            'Mon profil',
  '/espace-enseignant/questions':         'Questions élèves',
  '/espace-enseignant/corrections':       'Copies à corriger',
  '/espace-enseignant/contenus':          'Mes contenus',
  '/espace-enseignant/agenda':            'Agenda',
  '/espace-enseignant/messagerie':        'Messagerie',
  '/espace-enseignant/demandes':          'Demandes reçues',
  '/espace-enseignant/collaborations':    'Mes collaborations',
};

// ─── EnseignantLayout ─────────────────────────────────────────────────────────
export const EnseignantLayout: React.FC<{
  openQ?: number;
  pendingS?: number;
  pendingReq?: number;
  activeCollab?: number;
}> = ({ openQ = 0, pendingS = 0, pendingReq = 0, activeCollab = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated, authReady, profile, isDark, toggleTheme } = useApp();
  const prevPath  = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setMobileOpen(false);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) { navigate('/connexion', { replace: true }); return; }
    const role = (profile as { role?: string }).role;
    const allowed = !role || role === 'teacher' || role === 'admin';
    if (!allowed) { navigate('/', { replace: true }); }
  }, [authReady, isAuthenticated, (profile as { role?: string }).role, navigate]);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Espace Enseignant';
  const isHome    = location.pathname === '/espace-enseignant';

  return (
    <div className="flex min-h-dvh w-full bg-background min-w-0">{/* min-h-dvh = 100dvh iOS fix ; min-w-0 empêche les enfants flex de forcer l'élargissement du root */}
      {/* Lien d'évitement — navigation clavier WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>

      {/* Sidebar desktop
          paddingTop safe-area : sticky top-0 — couvre le notch iOS en paysage */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border sticky top-0 h-dvh overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <SidebarNav openQ={openQ} pendingS={pendingS} pendingReq={pendingReq} activeCollab={activeCollab} />
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar" aria-label="Menu enseignant">
          <SidebarNav onClose={() => setMobileOpen(false)} openQ={openQ} pendingS={pendingS} pendingReq={pendingReq} activeCollab={activeCollab} />
        </SheetContent>
      </Sheet>

      {/* Zone principale */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header sticky
            paddingTop safe-area : couvre notch iOS au scroll (Dynamic Island ~59px).
            px retiré du <header> → dans le div interne avec max-w-screen-xl
            pour centrer sur 4K / TV / cinéma / tablette. */}
        <header
          className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shrink-0"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-1.5 px-3 md:px-5 lg:px-8 h-14 max-w-screen-xl mx-auto w-full">

            {/* Hamburger mobile */}
            <Button
              variant="ghost" size="icon"
              className="shrink-0 lg:hidden w-11 h-11 min-w-[44px] min-h-[44px]"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Retour desktop si sous-page */}
            {!isHome && (
              <Button
                variant="ghost" size="icon"
                className="shrink-0 hidden lg:inline-flex"
                onClick={() => navigate(-1)}
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {/* ── Titre : flex-1 sur mobile ET desktop — plus d'absolute   */}
            {/*    [≡] ── [Titre flex-1 text-center] ── [✨][♿][🌙]          */}
            <div className="flex-1 min-w-0 flex justify-center lg:justify-start px-1">
              {/* Mobile : lien centré, tronqué, espace réservé par flex */}
              <Link
                to="/espace-enseignant"
                className="lg:hidden flex items-center min-w-0"
                aria-label="Retour au tableau de bord"
              >
                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                  {pageTitle}
                </span>
              </Link>
              {/* Desktop : titre simple */}
              <span className="hidden lg:block font-semibold text-sm md:text-base text-foreground truncate">
                {pageTitle}
              </span>
            </div>

            {/* Bouton IA toujours visible */}
            <Button
              variant="ghost" size="icon"
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] text-primary hover:bg-primary/10"
              onClick={() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show'))}
              aria-label="Ouvrir l'assistant Apprenix"
            >
              <Sparkles className="w-5 h-5" />
            </Button>

            {/* Accessibilité */}
            <AccessibilityHeaderBtn
              iconOnly
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
            />

            {/* Mode sombre / clair */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Badge XP desktop */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
              <span aria-hidden="true">👨‍🏫</span>
              <span className="truncate max-w-[8rem]">{profile.name || 'Enseignant'}</span>
              {(profile as { xpPoints?: number }).xpPoints ? (
                <>
                  <span className="opacity-60">·</span>
                  <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{(profile as { xpPoints?: number }).xpPoints} XP</span>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 overflow-x-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <Suspense fallback={
            <div className="flex-1 p-4 md:p-6 space-y-4 animate-pulse">
              <div className="h-7 bg-muted rounded-lg w-48" />
              <div className="h-48 bg-muted rounded-2xl w-full" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default EnseignantLayout;
