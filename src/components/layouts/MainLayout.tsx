import {Accessibility as AccessibilityIcon, Bell, BookMarked, BookOpen, Brain, Building2, Calculator, Calendar,ChevronRight,ClipboardList, CreditCard, FileText, GitBranch, Globe, 
  GraduationCap, Heart, 
  HelpCircle, Home, Info,Languages, LayoutDashboard, LifeBuoy,LogIn, LogOut,
  Menu, MessageSquare as MessageSquareIcon,Moon, Newspaper,
  Scale,
  ScanLine, School, 
  Shield, Sparkles, Sun, 
  Target,
  Timer, TrendingUp, Trophy,
  User, 
  UserCheck, Users,Video,X, 
  Zap, 
} from 'lucide-react';
import ParentalCodeModal from '@/components/ParentalCodeModal';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { A11yPanel } from '@/components/AccessibilityToolbar';
import GuestBanner from '@/components/GuestBanner';
import Footer from '@/components/layouts/Footer';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getLevelCategory, getXpInfo } from '@/lib/levelUtils';
// ─── Prefetch — source unique dans src/lib/prefetch.ts ───────────────────────
import { ROUTE_PREFETCH as NAV_PREFETCH } from '@/lib/prefetch';
import { cn } from '@/lib/utils';
import type { SchoolLevel } from '@/types/types';

// ─── 4 catégories simplifiées pour le sélecteur sidebar ──────────────────────
interface CategoryButton { category: string; label: string; emoji: string; defaultLevel: SchoolLevel; }
const CATEGORY_BUTTONS: CategoryButton[] = [
  { category: 'primaire',  label: 'Primaire',  emoji: '🏫', defaultLevel: 'CM2' },
  { category: 'college',   label: 'Collège',   emoji: '📚', defaultLevel: '3e'  },
  { category: 'lycee',     label: 'Lycée',     emoji: '🎓', defaultLevel: 'Terminale' },
  { category: 'superieur', label: 'Supérieur', emoji: '🏛️', defaultLevel: 'Licence' },
];

// ─── Sous-niveaux par catégorie ───────────────────────────────────────────────
const LEVEL_GROUPS_SIDEBAR: Record<string, { level: SchoolLevel; label: string }[]> = {
  primaire:  [
    { level: 'CP',  label: 'CP'  }, { level: 'CE1', label: 'CE1' },
    { level: 'CE2', label: 'CE2' }, { level: 'CM1', label: 'CM1' },
    { level: 'CM2', label: 'CM2' },
  ],
  college:   [
    { level: '6e', label: '6e' }, { level: '5e', label: '5e' },
    { level: '4e', label: '4e' }, { level: '3e', label: '3e' },
  ],
  lycee:     [
    { level: '2nde', label: '2nde' }, { level: '1ère', label: '1ère' },
    { level: 'Terminale', label: 'Terminale' },
  ],
  superieur: [
    { level: 'BTS', label: 'BTS' }, { level: 'Licence', label: 'Licence' },
    { level: 'Master', label: 'Master' }, { level: 'Grandes Écoles', label: 'Grd. Écoles' },
  ],
};

interface SidebarNavItem { path: string; label: string; icon: React.ElementType; demo?: boolean; }
interface SidebarSection  { id: string; label: string; icon: React.ElementType; items: SidebarNavItem[]; }
interface SidebarContentProps { onClose?: () => void; }

const SidebarContent: React.FC<SidebarContentProps> = React.memo(({ onClose }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const {
    level, setLevel, profile, isAuthenticated, logout,
  } = useApp();
  const currentCategory = getLevelCategory(level);

  // ── Mode parental — modale accessible depuis toutes les pages ─────────────
  const [parentalOpen, setParentalOpen] = useState(false);

  // ── État local : afficher ou masquer le changement de catégorie ──────────
  // Réservé aux visiteurs uniquement — les étudiants connectés sont verrouillés sur leur catégorie.

  // ── Helpers navigation ────────────────────────────────────────────────────
  const go = (path: string) => {
    onClose?.();
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(path);
    });
  };

  const handleLevelChange = (newLevel: SchoolLevel) => {
    setLevel(newLevel);
    // Pas de navigation — le tableau de bord /espace filtre par contexte
  };

  const handleLogout = async () => { await logout(); navigate('/', { replace: true }); onClose?.(); };

  const isActive = (path: string, exact = false) => {
    const loc = location.pathname;
    if (exact) return loc === path;
    return loc === path || (loc.startsWith(path + '/') && !['/', '/contact'].includes(path));
  };

  const navCls = (path: string, exact = false) => cn(
    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
    'min-h-[48px] w-full text-left',
    isActive(path, exact)
      ? 'sidebar-nav-active text-white shadow-sm'
      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
  );

  // ── Sections dynamiques selon rôle — étudiant connecté VS visiteur ───────
  // RÈGLE : un étudiant connecté ne voit QUE SES liens (outils, matières, parcours,
  //         communauté). Il n'a jamais accès aux espaces parents / enseignants / autres.
  //         Un visiteur voit tout en mode "découverte" avec CTA connexion.
  const isPrimaire = currentCategory === 'primaire';

  // ── Emoji et label courts par catégorie ──────────────────────────────────
  const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
    primaire:  { emoji: '🏫', label: 'Primaire'  },
    college:   { emoji: '📚', label: 'Collège'   },
    lycee:     { emoji: '🎓', label: 'Lycée'     },
    superieur: { emoji: '🏛️', label: 'Supérieur' },
  };
  const catMeta = CATEGORY_META[currentCategory] ?? { emoji: '📖', label: currentCategory };

// ── Sections dynamiques selon rôle ───────────────────────────────────────────
  // RÈGLE : pas de doublon — chaque lien apparaît UNE SEULE FOIS dans la nav
  const sections = useMemo(() => {
    const role: string = (profile as { role?: string })?.role ?? 'student';

    if (!isAuthenticated) {
      // ── VISITEUR : 3 sections claires, 0 doublon ──────────────────────────
      // Règle : outils = démos interactives / espaces = connexion requise / infos = public
      return [
        {
          id: 'decouvrir', label: '✨ Démos interactives', icon: Zap,
          items: [
            { path: '/aide-ia',        label: 'Aide aux devoirs',       icon: Brain,      demo: true },
            { path: '/scanner',        label: 'Scanner de devoirs',     icon: ScanLine,   demo: true },
            { path: '/flashcards',     label: 'Flashcards',             icon: CreditCard, demo: true },
            { path: '/organisation',   label: 'Planning & Pomodoro',    icon: Calendar,   demo: true },
            { path: '/maths-sciences', label: 'Maths & Sciences',       icon: Calculator, demo: true },
            { path: '/linguistique',   label: 'Outils linguistiques',   icon: Languages,  demo: true },
            { path: '/ressources',     label: 'Fiches & ressources',    icon: BookMarked, demo: true },
            { path: '/notes',          label: 'Bloc-notes',             icon: FileText,   demo: true },
          ],
        },
        {
          id: 'espaces', label: 'Espaces & profils', icon: School,
          items: [
            { path: '/espace',       label: 'Espace étudiant',           icon: GraduationCap     },
            { path: '/parents',      label: 'Je suis parent',            icon: Heart             },
            { path: '/enseignants',  label: 'Je suis enseignant(e)',     icon: UserCheck         },
            { path: '/inclusion',    label: 'Élève DYS / ULIS / SEGPA', icon: AccessibilityIcon },
            { path: '/base-reponses',label: 'Base de réponses',          icon: Sparkles          },
          ],
        },
        {
          id: 'infos', label: 'Aide & informations', icon: Info,
          items: [
            { path: '/faq',        label: "Centre d'aide",  icon: LifeBuoy          },
            { path: '/contact',    label: 'Nous contacter', icon: MessageSquareIcon },
            { path: '/nouveautes', label: 'Nouveautés',     icon: Bell              },
            { path: '/mission',    label: 'Notre mission',  icon: Info              },
          ],
        },
      ];
    }

    // ── ENSEIGNANT ────────────────────────────────────────────────────────
    if (role === 'teacher') {
      return [
        {
          id: 'enseignant', label: 'Espace Enseignant', icon: UserCheck,
          items: [
            { path: '/espace-enseignant',            label: 'Tableau de bord',  icon: LayoutDashboard },
            { path: '/espace-enseignant/questions',  label: 'Questions élèves', icon: HelpCircle      },
          ],
        },
        {
          id: 'ressources', label: 'Ressources', icon: BookOpen,
          items: [
            { path: '/ressources',             label: 'Fiches & ressources',   icon: BookMarked },
            { path: '/ressources-officielles', label: 'Programmes officiels',  icon: Scale      },
          ],
        },
        {
          id: 'support', label: 'Aide & support', icon: LifeBuoy,
          items: [
            { path: '/faq',        label: "Centre d'aide",  icon: LifeBuoy          },
            { path: '/contact',    label: 'Nous contacter', icon: MessageSquareIcon },
            { path: '/nouveautes', label: 'Nouveautés',     icon: Bell              },
          ],
        },
      ];
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────
    if (role === 'admin') {
      return [
        {
          id: 'admin', label: 'Administration', icon: Shield,
          items: [
            { path: '/administration',    label: 'Panneau admin',          icon: LayoutDashboard },
            { path: '/espace-enseignant', label: 'Espace enseignant',      icon: UserCheck       },
          ],
        },
        {
          id: 'support', label: 'Aide & support', icon: LifeBuoy,
          items: [
            { path: '/faq',        label: "Centre d'aide",  icon: LifeBuoy          },
            { path: '/contact',    label: 'Nous contacter', icon: MessageSquareIcon },
          ],
        },
      ];
    }

    // ── PARENT ────────────────────────────────────────────────────────────
    if (role === 'parent') {
      return [
        {
          id: 'parent', label: 'Espace Parent', icon: Heart,
          items: [
            { path: '/parents-espace', label: 'Suivi de mon enfant',  icon: GraduationCap     },
            { path: '/parents',        label: 'Guide parents',        icon: Heart             },
            { path: '/securite',       label: 'Sécurité & RGPD',     icon: Shield            },
          ],
        },
        {
          id: 'support', label: 'Aide', icon: LifeBuoy,
          items: [
            { path: '/faq',     label: "Centre d'aide",  icon: LifeBuoy          },
            { path: '/contact', label: 'Nous contacter', icon: MessageSquareIcon },
          ],
        },
      ];
    }

    // ── ÉTUDIANT CONNECTÉ — sections par défaut ───────────────────────────
    return [
      {
        id: 'outils', label: 'Mes outils', icon: Zap,
        items: [
          { path: '/aide-ia',      label: 'Aide aux devoirs',    icon: Brain      },
          { path: '/scanner',      label: 'Scanner de devoirs',  icon: ScanLine   },
          { path: '/flashcards',   label: 'Mes Flashcards',      icon: CreditCard },
          { path: '/notes',        label: 'Mes Notes',           icon: FileText   },
          { path: '/organisation', label: 'Mon Planning',        icon: Calendar   },
          ...(!isPrimaire ? [
            { path: '/quiz',          label: 'Quiz interactif', icon: HelpCircle },
            { path: '/carte-mentale', label: 'Carte mentale',   icon: GitBranch  },
          ] : []),
        ],
      },
      {
        id: 'matieres', label: 'Mes matières', icon: BookOpen,
        items: [
          { path: '/maths-sciences', label: 'Maths & Sciences',       icon: Calculator },
          { path: '/linguistique',   label: 'Outils linguistiques',   icon: Languages  },
          { path: '/ressources',     label: 'Fiches & ressources',    icon: BookMarked },
          ...(!isPrimaire ? [
            { path: '/ressources-officielles', label: 'Programmes officiels', icon: Scale },
          ] : []),
        ],
      },
      {
        id: 'mes-travaux', label: 'Mes travaux', icon: UserCheck,
        items: [
          { path: '/mes-questions',    label: 'Mes questions',           icon: HelpCircle     },
          { path: '/mes-depots',       label: 'Mes dépôts & corrections', icon: BookMarked    },
          { path: '/accessibilite-perso', label: 'Accessibilité perso', icon: AccessibilityIcon },
        ],
      },
      {
        id: 'parcours', label: 'Mon parcours', icon: TrendingUp,
        items: [
          { path: '/espace', label: `Mon espace ${catMeta.label}`, icon: LayoutDashboard },
          { path: '/focus',           label: 'Mode Focus',          icon: Target          },
          { path: '/motivation',      label: 'Motivation & XP',     icon: Trophy          },
          ...(!isPrimaire ? [{ path: '/examen', label: 'Mode Examen', icon: Timer }] : []),
        ],
      },
      {
        id: 'communaute', label: 'Communauté', icon: Globe,
        items: [
          { path: '/actualites', label: 'Actualités éducatives', icon: Newspaper },
          { path: '/nouveautes', label: 'Nouveautés Apprenix',   icon: Bell      },
          ...(!isPrimaire ? [
            { path: '/communaute', label: "Forum d'entraide",  icon: Users },
            { path: '/visio',      label: 'Classe virtuelle',  icon: Video },
          ] : []),
        ],
      },
      {
        id: 'support', label: 'Aide & support', icon: LifeBuoy,
        items: [
          { path: '/faq',     label: "Centre d'aide",  icon: LifeBuoy          },
          { path: '/contact', label: 'Nous contacter', icon: MessageSquareIcon },
          { path: '/mission', label: 'Notre mission',  icon: Info              },
        ],
      },
    ];
  }, [isAuthenticated, isPrimaire, profile]);


  return (
    <div className="flex flex-col bg-sidebar text-sidebar-foreground" style={{ height: '100%' }}>

      {/* ── En-tête sidebar : logo + nom + bouton fermer ─────────────────── */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border/60 shrink-0">
        {/* Logo + nom cliquable → accueil */}
        <button
          type="button"
          onClick={() => { onClose?.(); navigate('/'); }}
          className="flex items-center gap-2 group"
          aria-label="Apprenix — Accueil"
        >
          <ApprenixLogo size={28} />
          <div className="flex flex-col items-start leading-none">
            <span className="font-black text-sm text-sidebar-foreground group-hover:text-primary transition-colors tracking-tight leading-none" translate="no">Apprenix</span>
            <span className="text-[10px] text-sidebar-foreground/50 font-medium leading-none mt-[3px]">100 % gratuit · sans pub</span>
          </div>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 min-h-[48px] min-w-[48px] rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Carte identité étudiant — pill compacte (connecté uniquement) ────── */}
      {isAuthenticated && (
        <div className="px-3 py-2 border-b border-sidebar-border/60 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary">
            <span className="text-sm leading-none shrink-0" aria-hidden="true">
              {profile.avatarUrl || '🧑‍🎓'}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-bold truncate block text-sidebar-foreground">{profile.name}</span>
            </div>
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-normal opacity-80 text-sidebar-foreground">
              <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
              {profile.xpPoints} XP
            </span>
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20">
              {level}
            </span>
          </div>
        </div>
      )}

      {/* ── Sélecteur de niveau ──────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-b border-sidebar-border/60 shrink-0">
        {isAuthenticated ? (
          /* Étudiant connecté : sous-niveaux de SA catégorie uniquement — pas d'accès aux autres catégories */
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <span className="text-base leading-none">{catMeta.emoji}</span>
              <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50">
                Mon niveau — {catMeta.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(LEVEL_GROUPS_SIDEBAR[currentCategory] ?? []).map(({ level: lvl, label: lbl }) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all border min-h-[32px]',
                    level === lvl
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-sidebar-accent/40 border-sidebar-border/30 text-sidebar-foreground/70 hover:bg-sidebar-accent',
                  )}
                  aria-pressed={level === lvl}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Visiteur : 4 catégories pour explorer librement */
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50 mb-1.5">Explorer par niveau</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_BUTTONS.map(({ category, label, emoji, defaultLevel }) => {
                const active = currentCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleLevelChange(defaultLevel)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all min-h-[48px] border',
                      active
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-sidebar-accent/40 border-sidebar-border/30 text-sidebar-foreground/80 hover:bg-sidebar-accent',
                    )}
                    aria-pressed={active}
                  >
                    <span className="text-base leading-none shrink-0">{emoji}</span>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Zone scrollable ──────────────────────────────────────────────────── */}
      <nav
        className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5"
        aria-label="Navigation principale"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {/* ── Accueil ──────────────────────────────────────────────────────── */}
        <button type="button" onClick={() => go('/')} className={navCls('/', true)}>
          <Home className="w-4 h-4 shrink-0" />
          <span className="flex-1 min-w-0 truncate">Accueil</span>
        </button>

        {/* ── Mon Espace — lien direct vers le niveau actif ────────────────── */}
        <button type="button" onClick={() => go('/espace')} className={navCls('/espace')}>
          <School className="w-4 h-4 shrink-0" />
          <span className="flex-1 min-w-0 truncate">
            {isAuthenticated ? `Mon espace ${catMeta.label}` : `Espace ${catMeta.label}`}
          </span>
          <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
        </button>

        {/* ── Accès rapides ────────────────────────────────────────────────── */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/45 px-1 mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
            Accès rapides
          </p>
          <div className="space-y-1">
            {/* Bot IA — Léa */}
            <button
              type="button"
              aria-label="Ouvrir l'assistant Apprenix"
              onClick={() => { onClose?.(); setTimeout(() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show')), 100); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl min-h-[48px] font-semibold text-sm transition-all bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-sm"
            >
              <span className="text-base leading-none shrink-0" aria-hidden="true">👩‍🏫</span>
              <span className="flex-1 min-w-0 truncate text-left">Assistant Apprenix</span>
              <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary-foreground/20 leading-none">Aide</span>
            </button>

            {/* Mode parental — visible uniquement quand connecté */}
            {isAuthenticated && (
              <button
                type="button"
                aria-label="Configurer le mode parental"
                onClick={() => setParentalOpen(true)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl min-h-[48px] font-medium text-sm transition-all bg-sidebar-accent/50 border border-sidebar-border/40 text-sidebar-foreground hover:bg-sidebar-accent active:scale-[0.98]"
              >
                <Shield className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex-1 min-w-0 truncate text-left">Mode parental</span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-40" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ── Sections dynamiques (filtrées par rôle + niveau) ─────────────── */}
        {(sections as SidebarSection[]).map(({ id, label, icon: SectionIcon, items }) => (
          <div key={id} className="pt-3 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/45 px-1 mb-1.5 flex items-center gap-1.5">
              <SectionIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ path, label: lbl, icon: Icon, demo }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => go(path)}
                  onPointerDown={() => NAV_PREFETCH[path]?.()}
                  className={navCls(path)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 min-w-0 truncate">{lbl}</span>
                  {/* Badge "Démo" sur les outils qui affichent une vitrine visiteur */}
                  {demo && !isAuthenticated && (
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary leading-none">
                      Démo
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* ── CTA inscription visiteur (bas de nav) ────────────────────────── */}
        {!isAuthenticated && (
          <div className="pt-3 pb-1 mx-1">
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-chart-1/10 border border-primary/20 p-3 text-center">
              <p className="text-xs font-bold text-white mb-0.5">100 % gratuit</p>
              <p className="text-[11px] text-sidebar-foreground/70 mb-2.5 leading-snug">
                Inscris-toi en 30 s pour sauvegarder tes résultats et accéder à tous les outils.
              </p>
              <button
                type="button"
                onClick={() => go('/connexion?mode=inscription')}
                className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Créer mon compte
              </button>
            </div>
          </div>
        )}

        {/* ── Mon Profil — lien dans la nav (connecté uniquement) ─────────────── */}
        {isAuthenticated && (
          <div className="pt-1 pb-1 border-t border-sidebar-border/40 mt-2">
            <button
              type="button"
              onClick={() => go('/profil')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                'min-h-[48px] w-full text-left',
                location.pathname === '/profil'
                  ? 'sidebar-nav-active text-white shadow-sm'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate">Mon Profil</span>
            </button>
          </div>
        )}
      </nav>

      {/* ── Pied compact : profil / connexion + thème + déconnexion ─────────── */}
      <div
        className="border-t border-sidebar-border/40 shrink-0 px-2 py-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        {isAuthenticated ? (
          /* Connecté : avatar + nom → profil, icône thème, icône logout */
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go('/profil')}
              className="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Voir mon profil"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm shrink-0">
                {profile.avatarUrl || '🧑‍🎓'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                  {profile.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/40 truncate mt-0.5 flex items-center gap-1">
                  <User className="w-2.5 h-2.5 shrink-0" />
                  Mon profil
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onClose?.(); setTimeout(() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show')), 80); }}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label="Ouvrir l'assistant Apprenix"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-destructive/65 hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Visiteur : bouton "Se connecter" — "Créer mon compte" est déjà dans le CTA ci-dessus */
          <Button
            className="w-full h-11 bg-gradient-primary text-white hover:opacity-90 text-sm font-semibold rounded-xl shadow-sm"
            onClick={() => go('/connexion')}
          >
            <LogIn className="w-4 h-4 mr-1.5 shrink-0" />
            Se connecter
          </Button>
        )}
      </div>

      {/* ── Modale mode parental (portée globale depuis la sidebar) ──────────── */}
      {parentalOpen && (
        <ParentalCodeModal onClose={() => setParentalOpen(false)} />
      )}

    </div>
  );
});

SidebarContent.displayName = 'SidebarContent';

// ─── Header ───────────────────────────────────────────────────────────────────
const ALL_PAGE_LABELS: { path: string; label: string; exact?: boolean }[] = [
  { path: '/',          label: 'Accueil',               exact: true },
  { path: '/espace',    label: 'Mon espace étudiant' },
  { path: '/base-reponses',         label: 'Base de réponses'           },
  { path: '/aide-ia',               label: 'Aide aux devoirs'           },
  { path: '/scanner',               label: 'Scanner de devoirs'         },
  { path: '/ressources',            label: 'Ressources'                 },
  { path: '/ressources-officielles',label: 'Ressources officielles'     },
  { path: '/etablissements',        label: 'Annuaire des établissements'},
  { path: '/maths-sciences',        label: 'Maths & Sciences'           },
  { path: '/linguistique',          label: 'Linguistique'               },
  { path: '/organisation',          label: 'Planning & Agenda'          },
  { path: '/flashcards',            label: 'Flashcards'                 },
  { path: '/notes',                 label: 'Notes personnelles'         },
  { path: '/motivation',            label: 'Motivation'                 },
  { path: '/focus',                 label: 'Mode Focus'                 },
  { path: '/actualites',            label: 'Actualités'                 },
  { path: '/communaute',            label: 'Communauté'                 },
  { path: '/nouveautes',            label: 'Nouveautés'                 },
  { path: '/mission',               label: 'Notre mission'              },
  { path: '/parents',               label: 'Pour les parents'           },
  { path: '/enseignants',           label: 'Pour les enseignants'       },
  { path: '/inclusion',             label: 'Inclusion — DYS / ULIS / SEGPA' },
  { path: '/securite',              label: 'Sécurité & RGPD'            },
  { path: '/faq',                   label: "Centre d'aide"              },
  { path: '/contact',               label: 'Contact'                    },
  { path: '/contact/merci',         label: 'Message envoyé — Merci !'  },
  { path: '/transparence',          label: 'Transparence & Conformité'  },
  { path: '/accessibilite',         label: 'Accessibilité — Apprenix'   },
  { path: '/profil',                label: 'Mon profil'                 },
  { path: '/examen',                label: 'Mode Examen'                },
  { path: '/quiz',                  label: 'Quiz interactif'            },
  { path: '/carte-mentale',         label: 'Carte mentale'              },
  { path: '/visio',                 label: 'Classe virtuelle'           },
  { path: '/parents-espace',        label: 'Espace Parents'             },
  { path: '/connexion',             label: 'Connexion'                  },
  { path: '/mentions-legales',           label: 'Mentions légales'             },
  { path: '/politique-confidentialite',  label: 'Confidentialité'              },
  { path: '/cgu',                        label: "Conditions d'utilisation"     },
  { path: '/recuperation',               label: 'Récupération'                 },
  // Espaces dédiés (connexion obligatoire)
  { path: '/espace-enseignant',          label: 'Espace Enseignant'            },
  { path: '/administration',             label: 'Administration'               },
  { path: '/mes-questions',              label: 'Mes questions'                },
  { path: '/mes-depots',                 label: 'Mes dépôts'                   },
  { path: '/accessibilite-perso',        label: 'Accessibilité personnalisée'  },
  // Landing SEO
  { path: '/bac-francais',               label: 'Révision Bac Français 2026'   },
  { path: '/brevet-maths',               label: 'Révision Brevet Maths 2026'   },
  { path: '/aide-devoirs-gratuit',       label: 'Aide aux devoirs gratuite'    },
  { path: '/flashcards-gratuit',         label: 'Flashcards gratuites en ligne'},
  { path: '/revision-bac-2026',          label: 'Révision Bac 2026'            },
  { path: '/bac-philo',                  label: 'Bac Philo 2026'               },
  { path: '/cours-maths-gratuit',        label: 'Cours Maths Gratuits'         },
  { path: '/methode-de-travail',         label: 'Méthode de Travail Efficace'  },
];

// ─── Données navbar desktop ───────────────────────────────────────────────────
type NavBadge = 'Nouveau' | 'Bêta';
type NavRole  = 'student' | 'parent' | 'teacher' | 'admin';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  desc?: string;
  badge?: NavBadge;
  requiresAuth?: boolean;
  roles?: NavRole[];
}
interface NavGroup { id: string; label: string; icon: React.ElementType; items: NavItem[]; cols?: number; }

// ─── Navbar visiteur — 4 groupes stratégiques, 0 doublon ──────────────────────
// Règle : chaque chemin n'apparaît QU'UNE SEULE FOIS dans toute la nav visiteur.
// Stratégie : Démos interactives → envie → inscription → espaces perso.
const NAVBAR_GROUPS: NavGroup[] = [
  // 1 ── Découvrir les outils — tous en démo interactive, 2 colonnes
  {
    id: 'outils',
    label: 'Découvrir',
    icon: Zap,
    cols: 2,
    items: [
      { label: 'Aide aux devoirs',       path: '/aide-ia',        icon: Brain,      desc: '✨ Démo — Fiches méthode & exercices guidés',   badge: 'Bêta' },
      { label: 'Scanner de devoirs',     path: '/scanner',        icon: ScanLine,   desc: '✨ Démo — Photo → explication étape par étape'         },
      { label: 'Flashcards & révision',  path: '/flashcards',     icon: CreditCard, desc: '✨ Démo — Répétition espacée, retourne les cartes'     },
      { label: 'Planning & Pomodoro',    path: '/organisation',   icon: Calendar,   desc: '✨ Démo — Agenda, to-do, minuteur focus'                },
      { label: 'Maths & Sciences',       path: '/maths-sciences', icon: Calculator, desc: '✨ Démo — Calculs, formules, résolution guidée'          },
      { label: 'Outils linguistiques',   path: '/linguistique',   icon: Languages,  desc: '✨ Démo — Conjugueur, correcteur, traducteur'           },
      { label: 'Fiches & ressources',    path: '/ressources',     icon: BookMarked, desc: '✨ Démo — Fiches méthode par matière & niveau'          },
      { label: 'Bloc-notes intelligent', path: '/notes',          icon: FileText,   desc: '✨ Démo — Notes organisées, recherche rapide'           },
    ],
  },
  // 2 ── Espaces & profils — connexion requise, routage par rôle
  {
    id: 'espaces',
    label: 'Espaces',
    icon: School,
    items: [
      { label: 'Espace étudiant',           path: '/espace',           icon: GraduationCap,     desc: 'Mon tableau de bord & progression',     requiresAuth: true },
      { label: 'Base de réponses',          path: '/base-reponses',    icon: Sparkles,          desc: '100 000 réponses vérifiées par des humains'             },
      { label: 'Espace Parents',            path: '/parents',          icon: Heart,             desc: 'Suivi de votre enfant, 0 pub, RGPD'                    },
      { label: 'Espace Enseignant',         path: '/enseignants',      icon: UserCheck,         desc: 'Tableau de bord & ressources pédagogiques'             },
      { label: 'Élèves DYS / ULIS / SEGPA', path: '/inclusion',       icon: AccessibilityIcon, desc: 'Interface adaptée RGAA & pédagogie différenciée'       },
      { label: 'Établissements scolaires',  path: '/etablissements',   icon: Building2,         desc: 'Annuaire & partenariats institutionnels'               },
    ],
  },
  // 3 ── Ressources & actualités — contenu public, 0 doublon avec outils
  {
    id: 'ressources',
    label: 'Ressources',
    icon: BookOpen,
    items: [
      { label: 'Ressources officielles', path: '/ressources-officielles', icon: Globe,     desc: 'Éduscol, ONISEP, programmes gouvernement'  },
      { label: 'Actualités éducatives',  path: '/actualites',             icon: Newspaper, desc: 'Infos scolaires & orientation'              },
      { label: 'Communauté',             path: '/communaute',             icon: Users,     desc: "Forum d'entraide entre élèves"              },
      { label: 'Nouveautés Apprenix',    path: '/nouveautes',             icon: Bell,      desc: 'Dernières fonctionnalités', badge: 'Nouveau' },
    ],
  },
  // 4 ── À propos — confiance & support
  {
    id: 'apropos',
    label: 'À propos',
    icon: Info,
    items: [
      { label: 'Notre mission',    path: '/mission',       icon: Info,              desc: 'Pourquoi Apprenix est 100 % gratuit & sans pub' },
      { label: "Centre d'aide",    path: '/faq',           icon: LifeBuoy,          desc: 'Réponses aux questions courantes'               },
      { label: 'Nous contacter',   path: '/contact',       icon: MessageSquareIcon, desc: 'WhatsApp ou email — réponse rapide'             },
      { label: 'Sécurité & RGPD',  path: '/securite',      icon: Shield,            desc: 'Données, vie privée, conformité'                },
      { label: 'Transparence',     path: '/transparence',  icon: Scale,             desc: 'Conformité & intégrité 3000 %'                  },
      { label: 'Accessibilité',    path: '/accessibilite', icon: AccessibilityIcon, desc: 'RGAA — interface pour tous'                     },
    ],
  },
];

// ─── Navbar élève connecté — uniquement les pages ABSENTES de la sidebar ──────
// La sidebar (EtudiantLayout) couvre déjà tous les outils (/aide-ia, /scanner,
// /flashcards, /communaute, /visio, etc.). On n'y met donc que les pages
// informatives & publiques que l'élève ne trouve pas dans son menu latéral.
const NAVBAR_GROUPS_STUDENT: NavGroup[] = [
  {
    id: 'ressources-st',
    label: 'Ressources',
    icon: BookOpen,
    items: [
      { label: 'Base de réponses',       path: '/base-reponses',          icon: Sparkles,   desc: '100 000 réponses vérifiées par des humains' },
      { label: 'Ressources officielles', path: '/ressources-officielles', icon: Globe,      desc: 'Éduscol, ONISEP, programmes nationaux'      },
      { label: 'Actualités éducatives',  path: '/actualites',             icon: Newspaper,  desc: 'Infos scolaires & calendrier'               },
      { label: 'Nouveautés Apprenix',    path: '/nouveautes',             icon: Bell,       desc: 'Dernières fonctionnalités', badge: 'Nouveau' as NavBadge },
    ],
  },
  {
    id: 'aide-st',
    label: 'Aide & infos',
    icon: LifeBuoy,
    items: [
      { label: "Centre d'aide",    path: '/faq',         icon: LifeBuoy,          desc: 'Réponses aux questions courantes'              },
      { label: 'Nous contacter',   path: '/contact',     icon: MessageSquareIcon, desc: 'WhatsApp ou email — réponse rapide'            },
      { label: 'Notre mission',    path: '/mission',     icon: Info,              desc: 'Pourquoi Apprenix est 100 % gratuit & sans pub' },
      { label: 'Sécurité & RGPD',  path: '/securite',   icon: Shield,            desc: 'Données, vie privée, conformité RGPD'          },
    ],
  },
];

// ─── Navbar parent — groupes dédiés ──────────────────────────────────────────
const NAVBAR_GROUPS_PARENT: NavGroup[] = [
  {
    id: 'espace-parent',
    label: 'Espace Parent',
    icon: Heart,
    items: [
      { label: 'Suivi de mon enfant',  path: '/parents-espace', icon: GraduationCap, desc: 'Activité, progression et résultats'        },
      { label: 'Guide parents',        path: '/parents',        icon: Heart,         desc: 'Conseils pour accompagner votre enfant'    },
      { label: 'Mode parental',        path: '/parents-espace', icon: Shield,        desc: 'Filtres, restrictions et contrôle parental' },
      { label: 'Sécurité & RGPD',      path: '/securite',       icon: Shield,        desc: 'Protection des données de votre enfant'    },
    ],
  },
  {
    id: 'outils-parent',
    label: 'Outils & ressources',
    icon: BookOpen,
    items: [
      { label: 'Base de réponses',      path: '/base-reponses',          icon: Sparkles,   desc: '100 000 réponses validées par des humains' },
      { label: 'Ressources officielles',path: '/ressources-officielles', icon: Scale,      desc: 'Éduscol, ONISEP, programmes nationaux'    },
      { label: 'Fiches & méthodes',     path: '/ressources',             icon: BookMarked, desc: 'Guides de travail par matière & niveau'   },
      { label: 'Inclusion scolaire',    path: '/inclusion',              icon: AccessibilityIcon, desc: 'DYS, ULIS, SEGPA — ressources adaptées' },
    ],
  },
  {
    id: 'actualites-parent',
    label: 'Actualités & aide',
    icon: Newspaper,
    items: [
      { label: 'Actualités éducatives', path: '/actualites',  icon: Newspaper,       desc: 'Infos scolaires & orientation'           },
      { label: 'Nouveautés Apprenix',   path: '/nouveautes',  icon: Bell,            desc: 'Dernières fonctionnalités', badge: 'Nouveau' as NavBadge },
      { label: "Centre d'aide",         path: '/faq',         icon: LifeBuoy,        desc: 'Questions fréquentes'                    },
      { label: 'Nous contacter',        path: '/contact',     icon: MessageSquareIcon, desc: 'WhatsApp ou email — réponse rapide'    },
    ],
  },
];

// ─── Navbar enseignant — groupes dédiés ──────────────────────────────────────
const NAVBAR_GROUPS_TEACHER: NavGroup[] = [
  {
    id: 'tableau-bord',
    label: 'Mon tableau de bord',
    icon: LayoutDashboard,
    items: [
      { label: 'Vue d\'ensemble',    path: '/espace-enseignant',             icon: LayoutDashboard, desc: "Activité, questions et corrections"      },
      { label: 'Questions élèves',   path: '/espace-enseignant/questions',   icon: HelpCircle,      desc: 'Questions en attente de réponse'         },
      { label: 'Copies à corriger',  path: '/espace-enseignant/corrections', icon: ClipboardList,   desc: 'Travaux soumis par les élèves'           },
      { label: 'Mes contenus',       path: '/espace-enseignant/contenus',    icon: BookOpen,        desc: "Fiches & ressources que j'ai publiées"   },
    ],
  },
  {
    id: 'ressources-ens',
    label: 'Ressources',
    icon: BookOpen,
    items: [
      { label: 'Fiches & méthodes',       path: '/ressources',             icon: BookMarked, desc: 'Ressources pédagogiques par matière'   },
      { label: 'Programmes officiels',    path: '/ressources-officielles', icon: Scale,      desc: 'Éduscol, BO, référentiels nationaux'   },
      { label: 'Base de réponses',        path: '/base-reponses',          icon: Sparkles,   desc: '100 000 réponses vérifiées par des humains' },
      { label: 'Actualités éducatives',   path: '/actualites',             icon: Newspaper,  desc: 'Infos scolaires & orientation'         },
    ],
  },
  {
    id: 'communaute-ens',
    label: 'Communauté',
    icon: Users,
    items: [
      { label: 'Forum enseignants',  path: '/communaute',  icon: Users,           desc: 'Échanges entre collègues'               },
      { label: 'Tester les outils',  path: '/aide-ia',     icon: Brain,           desc: 'Tester les outils élèves'               },
      { label: 'Nouveautés',         path: '/nouveautes',  icon: Bell,            desc: 'Dernières fonctionnalités', badge: 'Nouveau' as NavBadge },
    ],
  },
  {
    id: 'aide-ens',
    label: 'Aide & infos',
    icon: LifeBuoy,
    items: [
      { label: "Centre d'aide",   path: '/faq',        icon: LifeBuoy,          desc: 'Questions fréquentes'                   },
      { label: 'Nous contacter',  path: '/contact',    icon: MessageSquareIcon, desc: 'WhatsApp ou email — réponse rapide'     },
      { label: 'Notre mission',   path: '/mission',    icon: Info,              desc: 'Pourquoi Apprenix est 100 % gratuit'    },
      { label: 'Sécurité & RGPD', path: '/securite',   icon: Shield,            desc: 'Données, vie privée, conformité'        },
    ],
  },
];

// ─── Méga-dropdown desktop ────────────────────────────────────────────────────
const NavDropdown: React.FC<{ group: NavGroup; onNavigate: (path: string) => void }> = ({ group, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, profile } = useApp();
  const userRole = (profile as { role?: string })?.role ?? 'student';

  // Filter items by role/auth
  const visibleItems = group.items.filter(item => {
    if (item.roles && item.roles.length > 0 && !item.roles.includes(userRole as NavRole)) return false;
    return true;
  });

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const isGroupActive = visibleItems.some(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'));
  const isMega = (group.cols ?? 1) > 1;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${group.label} — menu`}
        className={cn(
          // md (tablette) : icône seule + chevron → ~36 px, 4 groupes = ~144 px, tient sur 768 px
          // lg+ (bureau)  : icône + libellé + chevron → ~110 px, 4 groupes = ~440 px, tient sur 1024 px
          // xl+ (4K/TV)   : padding élargi pour respirer sur très grand écran
          'relative flex items-center gap-1 md:gap-1 lg:gap-1.5 xl:gap-2 px-2 md:px-2 lg:px-3 xl:px-4 py-2',
          'text-sm font-medium transition-all duration-150 min-h-[40px] whitespace-nowrap rounded-lg',
          isGroupActive
            ? 'text-primary bg-primary/8'
            : 'text-foreground/70 hover:text-foreground hover:bg-muted/60',
        )}
      >
        <group.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {/* Libellé masqué en dessous de lg pour économiser de l'espace */}
        <span className="hidden lg:inline">{group.label}</span>
        <ChevronRight className={cn('w-3 h-3 shrink-0 transition-transform duration-200', open ? 'rotate-90' : '')} aria-hidden="true" />
        {isGroupActive && (
          <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`${group.label} — sous-menu`}
          className={cn(
            'absolute top-[calc(100%+8px)] left-0 z-[200]',
            'bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden',
            isMega ? 'w-[520px]' : 'w-[300px]',
          )}
          style={{ boxShadow: '0 8px 40px hsl(var(--foreground)/0.10), 0 2px 8px hsl(var(--foreground)/0.06)' }}
        >
          {/* En-tête méga-menu */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/30">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <group.icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">{group.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">{visibleItems.length} éléments</span>
          </div>

          {/* Grille d'items */}
          <div className={cn('p-2', isMega ? 'grid grid-cols-2 gap-0' : 'flex flex-col')}>
            {visibleItems.map(({ label, path, icon: ItemIcon, desc, badge, requiresAuth }) => {
              const active   = location.pathname === path;
              const locked   = requiresAuth && !isAuthenticated;
              const isDemo   = !isAuthenticated && group.id === 'outils';
              return (
                <button
                  key={`${path}-${label}`}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    if (locked) { onNavigate('/connexion'); return; }
                    onNavigate(path);
                  }}
                  className={cn(
                    'group/item flex items-start gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-100',
                    active ? 'bg-primary/10' : locked ? 'opacity-60 hover:opacity-80 hover:bg-muted/40' : 'hover:bg-muted/60',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-150 group-hover/item:scale-110',
                    active ? 'bg-primary/15' : 'bg-muted',
                  )}>
                    <ItemIcon className={cn('w-4 h-4', active ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground')} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={cn('text-sm font-semibold leading-snug', active ? 'text-primary' : 'text-foreground')}>{label}</p>
                      {isDemo && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 leading-none">
                          Démo
                        </span>
                      )}
                      {badge && !isDemo && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary leading-none">
                          {badge}
                        </span>
                      )}
                      {locked && (
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground leading-none">
                          Connexion
                        </span>
                      )}
                    </div>
                    {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-snug text-pretty">{desc}</p>}
                  </div>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* Pied méga-menu Outils */}
          {isMega && (
            <div className="border-t border-border/50 px-4 py-2.5 bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isAuthenticated ? '8 outils — 100 % gratuits' : '8 démos interactives — inscris-toi pour tout débloquer'}
              </span>
              <button
                type="button"
                onClick={() => { setOpen(false); onNavigate(isAuthenticated ? '/espace' : '/connexion?mode=inscription'); }}
                className="text-xs font-semibold text-primary hover:opacity-75 transition-opacity flex items-center gap-1"
              >
                {isAuthenticated ? 'Voir mon espace' : "S'inscrire gratuitement"}
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
  'espace':                   'Espace étudiant',
  'espace-enseignant':        'Espace Enseignant',
  'parents-espace':           'Espace Parents',
  'administration':           'Administration',
  'base-reponses':            'Base de réponses',
  'aide-ia':                  'Aide aux devoirs',
  'scanner':                  'Scanner de devoirs',
  'flashcards':               'Flashcards',
  'organisation':             'Planning & Pomodoro',
  'maths-sciences':           'Maths & Sciences',
  'linguistique':             'Outils linguistiques',
  'ressources':               'Ressources',
  'notes':                    'Bloc-notes',
  'mes-questions':            'Mes questions',
  'mes-depots':               'Mes dépôts',
  'ressources-officielles':   'Ressources officielles',
  'actualites':               'Actualités',
  'nouveautes':               'Nouveautés',
  'communaute':               'Communauté',
  'mission':                  'Notre mission',
  'faq':                      "Centre d'aide",
  'contact':                  'Contact',
  'securite':                 'Sécurité & RGPD',
  'transparence':             'Transparence',
  'accessibilite':            'Accessibilité',
  'accessibilite-perso':      'Accessibilité personnalisée',
  'inclusion':                'Élèves DYS / ULIS / SEGPA',
  'etablissements':           'Établissements',
  'parents':                  'Espace Parents',
  'enseignants':              'Espace Enseignant',
  'motivation':               'Motivation & XP',
  'tableau-de-bord':          'Mon espace',
  'focus':                    'Mode Focus',
  'examen':                   'Mode Examen',
  'quiz':                     'Quiz',
  'carte-mentale':            'Carte mentale',
  'visio':                    'Classe virtuelle',
  'dashboard':                'Tableau de bord',
  'contenus':                 'Contenus',
  'nouveau':                  'Nouveau',
};

const humanizeSegment = (seg: string) =>
  SEGMENT_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null; // no breadcrumb for top-level pages

  const crumbs = [
    { label: 'Accueil', href: '/' },
    ...segments.map((seg, i) => ({
      label: humanizeSegment(seg),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav aria-label="Fil d'Ariane" className="w-full max-w-[1600px] mx-auto px-3 md:px-6 lg:px-8 pt-3 pb-0">
      <ol className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 opacity-40" aria-hidden="true" />}
              {isLast ? (
                <span className="font-medium text-foreground truncate" aria-current="page">{crumb.label}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(crumb.href)}
                  className="hover:text-foreground hover:underline transition-colors truncate"
                >
                  {crumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ─── Mobile bottom tab bar (< lg) ────────────────────────────────────────────
const MobileBottomBar: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated, profile } = useApp();
  const userRole  = (profile as { role?: string })?.role ?? 'student';

  const mySpacePath =
    userRole === 'teacher' ? '/espace-enseignant' :
    userRole === 'parent'  ? '/parents-espace'    :
    userRole === 'admin'   ? '/administration'    :
    '/espace';

  const tabs = isAuthenticated
    ? [
        { label: 'Accueil',    icon: Home,           path: '/',              exact: true  },
        { label: 'Outils',     icon: Zap,            path: '/aide-ia',       exact: false },
        { label: 'Réponses',   icon: Sparkles,       path: '/base-reponses', exact: false },
        { label: 'Mon espace', icon: GraduationCap,  path: mySpacePath,      exact: false },
      ]
    : [
        { label: 'Accueil',   icon: Home,    path: '/',              exact: true  },
        { label: 'Démos',     icon: Zap,     path: '/aide-ia',       exact: false },
        { label: 'Réponses',  icon: Sparkles,path: '/base-reponses', exact: false },
        { label: 'Connexion', icon: LogIn,   path: '/connexion',     exact: false },
      ];

  const isActive = (tab: typeof tabs[0]) =>
    tab.exact
      ? location.pathname === tab.path
      : location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');

  return (
    <nav
      aria-label="Navigation rapide"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/60"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 24px hsl(var(--foreground)/0.07)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map(tab => {
          const active = isActive(tab);
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative overflow-hidden flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-all duration-150',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <tab.icon className={cn('w-5 h-5 shrink-0 transition-transform duration-150', active ? 'scale-110' : '')} aria-hidden="true" />
              <span className={cn('text-[10px] font-medium leading-none', active ? 'font-bold' : '')}>{tab.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-[2px] rounded-full bg-primary" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ─── Header / Navbar premium ──────────────────────────────────────────────────
const Header: React.FC<{
  onMenuToggle: () => void;
  isOpen: boolean;
}> = React.memo(({ onMenuToggle, isOpen }) => {
  const { isDark, toggleTheme, isAuthenticated, profile, logout } = useApp();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [a11yOpen, setA11yOpen]         = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (path: string) => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(path);
    });
  };
  const handleLogout = async () => { setUserMenuOpen(false); await logout(); navigate('/', { replace: true }); };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    if (userMenuOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [userMenuOpen]);
  useEffect(() => { setUserMenuOpen(false); }, [location.pathname]);

  // Icône + label de la page courante
  const pageInfo = ALL_PAGE_LABELS.find(p =>
    p.exact ? location.pathname === p.path : location.pathname.startsWith(p.path + '/') || location.pathname === p.path,
  );
  const currentLabel = pageInfo?.label ?? 'Apprenix';

  const isEspaceActive = location.pathname.startsWith('/espace') || location.pathname.startsWith('/espace-enseignant') || location.pathname.startsWith('/parents-espace');
  const userRole = (profile as { role?: string })?.role ?? 'student';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 shrink-0 transition-all duration-200',
        scrolled
          ? 'bg-card/92 backdrop-blur-2xl'
          : 'bg-card',
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: scrolled
          ? '0 4px 32px hsl(var(--foreground)/0.07), 0 1px 0 hsl(var(--border)/0.9)'
          : '0 1px 0 hsl(var(--border)/0.55)',
      }}
    >
      {/* Ligne accent dégradée en bas du header */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)/0.55) 40%, hsl(var(--chart-1)/0.35) 70%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/*
        ══════════════════════════════════════════════════════════════════
        HEADER — LAYOUT RESPONSIVE (toutes tailles d'écran)

        MOBILE (<md)    :  [≡ Menu]  [spacer]  [✨ IA][♿ Accès][🌙 Sombre]
        TABLETTE (md)   :  [≡] [nav groupes icône] │ [✨][♿][🌙] [→Connexion/Avatar]
        DESKTOP (lg+)   :  [🔶 Apprenix] │ [nav groupes icône+label] │ [✨][♿][🌙] [Avatar]
        TV/4K (≥1600px) :  idem desktop, centré max-w-[1600px], padding élargi

        Icônes seules sur tablette/desktop (tooltip au survol)
        Icône + label court sur mobile (reconnaissable sans tooltip)
        ══════════════════════════════════════════════════════════════════
      */}
      {/* max-w-[1600px] cohérent avec le contenu principal — évite le décalage
          sur TV/4K/ultrawide où header et contenu doivent s'aligner.
          Pas de safe-area paddingLeft/Right ici : #root les applique déjà
          globalement (index.css). Les appliquer une 2ème fois doublerait
          le décalage sur iOS paysage (notch ~44px × 2 = 88px perdu).  */}
      <div
        className="w-full max-w-[1600px] mx-auto flex items-center gap-2 min-h-[58px] px-3 md:px-5 lg:px-8 xl:px-10 2xl:px-12"
      >

        {/* ── GAUCHE : hamburger mobile/tablette ──────────────────────── */}
        <div className="flex items-center shrink-0">
          {/* Hamburger — visible jusqu'à lg */}
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            aria-controls="main-navigation"
            className={cn(
              'lg:hidden shrink-0 w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all duration-200',
              isOpen
                ? 'bg-primary text-primary-foreground shadow-md scale-95'
                : 'bg-muted/70 text-foreground hover:bg-primary/15 hover:text-primary',
            )}
          >
            <div className="relative w-5 h-5 flex flex-col justify-center gap-[5px]">
              <span className={cn('block h-[2px] rounded-full transition-all duration-200 origin-center', isOpen ? 'bg-primary-foreground rotate-45 translate-y-[7px]' : 'bg-current w-5')} />
              <span className={cn('block h-[2px] rounded-full transition-all duration-200', isOpen ? 'bg-primary-foreground opacity-0 w-0' : 'bg-current w-4')} />
              <span className={cn('block h-[2px] rounded-full transition-all duration-200 origin-center', isOpen ? 'bg-primary-foreground -rotate-45 -translate-y-[7px]' : 'bg-current w-5')} />
            </div>
          </button>

          {/* Logo + nom — desktop uniquement (sidebar non-persistante) */}
          <button
            type="button"
            onClick={() => go('/')}
            className="hidden lg:flex items-center gap-2.5 shrink-0 group ml-2 mr-2"
            aria-label="Apprenix — Accueil"
          >
            <ApprenixLogo size={32} />
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors tracking-tight leading-none" translate="no">Apprenix</span>
              <span className="text-[10px] text-muted-foreground font-medium leading-none mt-[3px]">100 % gratuit</span>
            </div>
          </button>

          <div className="hidden lg:block w-px h-5 bg-border/60 mx-1 shrink-0" aria-hidden="true" />
        </div>

        {/* ── CENTRE : nav tablette + desktop ─────────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5 shrink-0" aria-label="Navigation principale">
          {(userRole === 'teacher'
            ? NAVBAR_GROUPS_TEACHER
            : userRole === 'parent'
            ? NAVBAR_GROUPS_PARENT
            : isAuthenticated
            ? NAVBAR_GROUPS_STUDENT
            : NAVBAR_GROUPS
          ).map(group => (
            <NavDropdown key={group.id} group={group} onNavigate={go} />
          ))}
        </nav>

        {/* Spacer — pousse la zone droite à l'extrémité */}
        <div className="flex-1" aria-hidden="true" />

        {/* ── DROITE : actions ────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">

          {/* Séparateur avant icônes d'action — visible uniquement depuis md */}
          <div className="hidden md:block w-px h-5 bg-border/60 mx-0.5 shrink-0" aria-hidden="true" />

          {/* ── Bot IA — tous écrans ──────────────────────────────────── */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('apprenix:chatbot-show'))}
            aria-label="Ouvrir l'assistant Apprenix"
            title="Assistant Apprenix"
            className="flex items-center gap-1.5 h-9 px-2 md:px-2.5 min-h-[44px] rounded-xl text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-150 shrink-0"
          >
            <Sparkles className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" aria-hidden="true" />
            <span className="md:hidden text-xs font-semibold leading-none">Assistant</span>
          </button>

          {/* ── Accessibilité — tous écrans ──────────────────────────── */}
          <button
            type="button"
            onClick={() => setA11yOpen(v => !v)}
            aria-label="Options d'accessibilité"
            aria-expanded={a11yOpen}
            aria-haspopup="dialog"
            title="Accessibilité"
            className={cn(
              'flex items-center gap-1.5 h-9 px-2 md:px-2.5 min-h-[44px] rounded-xl transition-all duration-150 shrink-0',
              a11yOpen
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:text-primary hover:bg-primary/10',
            )}
          >
            <AccessibilityIcon className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" aria-hidden="true" />
            <span className="md:hidden text-xs font-semibold leading-none">Accès</span>
          </button>

          {/* ── Thème — tous écrans ───────────────────────────────────── */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            className="flex items-center gap-1.5 h-9 px-2 md:px-2.5 min-h-[44px] rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-150 shrink-0"
          >
            {isDark
              ? <Sun  className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" aria-hidden="true" />
              : <Moon className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" aria-hidden="true" />}
            <span className="md:hidden text-xs font-semibold leading-none">
              {isDark ? 'Clair' : 'Sombre'}
            </span>
          </button>

          {/* ── Séparateur avant connexion / avatar ─────────────────── */}
          <div className="hidden md:block w-px h-5 bg-border/60 mx-0.5 shrink-0" aria-hidden="true" />

          {/* ── Visiteur : connexion — md+ discret (sidebar le porte aussi) */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => go('/connexion')}
              className={cn(
                'hidden md:flex items-center gap-1.5 h-9 px-3 lg:px-4',
                'border border-border text-foreground/80 text-xs font-semibold rounded-xl',
                'hover:border-primary/50 hover:text-primary hover:bg-primary/8',
                'transition-all duration-150 shrink-0 min-h-[44px]',
              )}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">Se connecter</span>
            </button>
          )}

          {/* ── CONNECTÉ : avatar compact + dropdown — tous écrans ──────── */}
          {isAuthenticated && (
            <div ref={userMenuRef} className="relative block">
              <button
                type="button"
                onClick={() => setUserMenuOpen(v => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Menu utilisateur"
                className={cn(
                  'flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border transition-all duration-150 min-h-[40px] min-w-[44px]',
                  userMenuOpen
                    ? 'border-primary/40 bg-primary/8 shadow-sm'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50',
                )}
              >
                {/* Avatar gradient — utilise l'avatar choisi par l'étudiant */}
                <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-sm shrink-0 shadow-sm">
                  {profile.avatarUrl || '🧑‍🎓'}
                </div>
                {/* Nom + XP — tablette + desktop */}
                <div className="hidden md:flex flex-col items-start leading-none gap-0.5 max-w-[100px]">
                  <span className="text-xs font-bold text-foreground truncate w-full leading-tight">
                    {profile.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-primary font-semibold leading-none">
                    {profile.xpPoints} XP
                  </span>
                </div>
                <ChevronRight
                  className={cn('hidden md:block w-3 h-3 text-muted-foreground shrink-0 transition-transform duration-200', userMenuOpen ? 'rotate-90' : '')}
                  aria-hidden="true"
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] z-[200] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden w-60"
                  style={{ boxShadow: '0 8px 40px hsl(var(--foreground)/0.10), 0 2px 8px hsl(var(--foreground)/0.06)' }}
                >
                  {/* En-tête utilisateur */}
                  <div className="px-4 py-3 bg-gradient-to-br from-primary/8 to-transparent border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-xl shrink-0 shadow-md">
                        {profile.avatarUrl || '🧑‍🎓'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{profile.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{profile.schoolLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Zap className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold text-primary">{profile.xpPoints} XP</span>
                      <span className="text-xs text-muted-foreground ml-auto">Niveau actif</span>
                    </div>
                  </div>
                  {/* Liens */}
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { icon: User,              label: 'Mon profil',      path: '/profil' },
                      { icon: School,            label: 'Mon espace',      path: '/espace'            },
                      { icon: Trophy,            label: 'Ma progression',  path: '/motivation'        },
                      /* Accessibilité — raccourci depuis user menu sur mobile */
                      { icon: AccessibilityIcon, label: 'Accessibilité',   path: '__a11y__'           },
                    ].map(({ icon: ItemIcon, label, path }) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (path === '__a11y__') { setA11yOpen(true); return; }
                          go(path);
                        }}
                        className={cn(
                          'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 min-h-[44px]',
                          location.pathname === path
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/80 hover:text-foreground hover:bg-muted/60',
                        )}
                      >
                        <ItemIcon className={cn('w-4 h-4 shrink-0', location.pathname === path ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Déconnexion */}
                  <div className="border-t border-border/50 p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/8 transition-colors min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Overlay panneau accessibilité ──────────────────────────────── */}
      {a11yOpen && (
        <div
          className="fixed inset-0 z-[9001] flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setA11yOpen(false); }}
          aria-modal="true"
          role="dialog"
          aria-label="Options d'accessibilité"
        >
          <div className="mt-[60px] mr-2 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <A11yPanel onClose={() => setA11yOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';

// ─── État sidebar ──────────────────────────────────────────────────────────────
// Sidebar TOUJOURS fermée au chargement initial — évite le flash open/close
// visible dès que l'utilisateur avait quitté avec la sidebar ouverte.
// On supprime la clé legacy au cas où elle aurait été écrite par une ancienne version.
const getSavedSidebarState = (): boolean => {
  try { localStorage.removeItem('apprenix_sidebar_open'); } catch { /* ignore */ }
  return false;
};

// ─── Détection élément scrollable horizontalement ────────────────────────────
// Remonte l'arbre DOM depuis l'élément touché jusqu'au body.
// Si un ancêtre a overflow-x: auto/scroll, la zone est scrollable
// → on ne doit PAS intercepter le swipe (peu importe le scrollWidth réel).
function hasHorizontalScrollAncestor(el: EventTarget | null): boolean {
  let node = el as HTMLElement | null;
  while (node && node !== document.body) {
    try {
      const overflowX = window.getComputedStyle(node).overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') return true;
    } catch { /* ignore */ }
    node = node.parentElement;
  }
  return false;
}

// ─── MainLayout ───────────────────────────────────────────────────────────────
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(getSavedSidebarState);
  // backdropVisible reste true pendant 260 ms après fermeture pour animer le
  // fond en même temps que la sidebar — évite le flash "contenu sans overlay"
  const [backdropVisible, setBackdropVisible] = useState(false);
  const backdropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerHeight, setHeaderHeight] = useState(56);
  const isMounted = useRef(false);
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // ── Modals Accessibilité — gérés dans AppContext + App.tsx (root) ──

  // Escape ferme les modals ouverts (gérés dans AppContext)
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  // Mesure la hauteur réelle du header (gère safe-area, zoom, etc.)
  useEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height + 1); // +1 pour le border-b
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Marque monté après premier render — active les transitions CSS sidebar
  useEffect(() => { isMounted.current = true; }, []);

  // backdropVisible suit sidebarOpen avec un délai de fermeture de 260 ms
  // pour que le fondu du backdrop se termine en même temps que la sidebar.
  useEffect(() => {
    if (backdropTimer.current) clearTimeout(backdropTimer.current);
    if (sidebarOpen) {
      setBackdropVisible(true);
    } else {
      // Garde le backdrop visible le temps de l'animation sidebar (260 ms)
      backdropTimer.current = setTimeout(() => setBackdropVisible(false), 260);
    }
    return () => {
      if (backdropTimer.current) clearTimeout(backdropTimer.current);
    };
  }, [sidebarOpen]);

  // Fermeture sur changement de route + annonce navigation lecteurs d'écran
  useEffect(() => {
    setSidebarOpen(false);
    // Annonce le changement de page aux lecteurs d'écran (NVDA, VoiceOver, TalkBack)
    const title = document.title?.split('|')[0]?.trim() || 'Nouvelle page';
    const el = document.getElementById('a11y-page-announce');
    if (el) {
      el.textContent = '';
      requestAnimationFrame(() => { el.textContent = `Navigation : ${title}`; });
    }
  }, [location.pathname]);

  // NOTE: Pas de body.style.overflow = 'hidden' ici.
  // Sur Android Chrome / iOS Safari, bloquer l'overflow du body casse les
  // événements touch à l'intérieur de la sidebar (scroll figé, swipe mort).
  // La prévention du scroll en arrière-plan est gérée par :
  //   • `touch-none` sur le backdrop (bloque les touchmove qui traversent)
  //   • `overscroll-behavior: contain` sur la sidebar scroll container
  //   • `pointer-events-none` sur le contenu principal pendant l'ouverture

  // ── Swipe gesture — détection robuste multi-plateforme ───────────────────
  //
  //    HISTORIQUE DES CORRECTIFS :
  //    v427 : selectstart capture:true bloquait iOS/Safari → supprimé
  //    v428 : garde Y (barre geste Android bas-écran) + zone X élargie
  //    v475 : 5 nouveaux correctifs pour "écran noir" + faux swipes :
  //      1. touchcancel handler — manquant → gestureActive restait true après
  //         interruption système (notif, geste home iOS) → faux déclenchement
  //         au prochain touchend  → sidebar ouverte inopinément → écran noir
  //      2. Garde multi-touch : e.touches.length > 1 → annule (pinch-zoom)
  //      3. Détection parent scrollable horizontal → annule sur tables/carousels
  //      4. startX minimum : 8 → 20 px (Samsung back-gesture zone : 0-20 px)
  //      5. Seuil distance : 55 → 60 px (réduit faux positifs subtils)
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  useEffect(() => {
    // Désactiver sur appareils sans tactile (desktop pur)
    if (typeof navigator === 'undefined' || navigator.maxTouchPoints === 0) return;

    let startX       = 0;
    let startY       = 0;
    let startTime    = 0;
    // ── Pattern "deferred confirmation" ──────────────────────────────────────
    // PROBLÈME v475 : gestureActive = true était posé dans onTouchStart dès
    // que le doigt touchait la zone 20–64 px, AVANT de connaître la direction.
    // Résultat : pendant les 1–2 premiers touchmove, le navigateur mobile
    // hésitait entre scroll et swipe → micro-blocage du scroll vertical perçu
    // comme "la page ne descend plus" sur AccueilPage et toutes les autres.
    //
    // SOLUTION : deux états séparés.
    //   pendingGesture = "le doigt est dans la zone, on surveille"  (onTouchStart)
    //   gestureActive  = "c'est bien un swipe horizontal confirmé"  (onTouchMove)
    //
    // Les scrolls verticaux ne passent JAMAIS en gestureActive → zéro latence.
    let pendingGesture      = false;   // doigt dans zone bord gauche (ouverture)
    let gestureActive       = false;   // swipe droite CONFIRMÉ (ouverture)
    let pendingCloseGesture = false;   // doigt quelque part + sidebar ouverte (fermeture)
    let closeGestureActive  = false;   // swipe gauche CONFIRMÉ (fermeture)

    const resetGesture = () => {
      pendingGesture = false; gestureActive = false;
      pendingCloseGesture = false; closeGestureActive = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      pendingGesture = false;
      gestureActive  = false;
      pendingCloseGesture = false;
      closeGestureActive  = false;

      // Multi-touch (pinch, zoom, rotation) → ignorer immédiatement
      if (e.touches.length > 1) return;

      const t = e.touches[0];
      startX    = t.clientX;
      startY    = t.clientY;
      startTime = Date.now();

      const androidGestureZone = window.innerHeight - 80;

      // ── Swipe FERMETURE : sidebar déjà ouverte → n'importe où sur l'écran ──
      if (sidebarOpenRef.current && startY < androidGestureZone) {
        if (!hasHorizontalScrollAncestor(e.target)) {
          pendingCloseGesture = true;
        }
        return; // on ne déclenche pas l'ouverture quand sidebar est ouverte
      }

      // ── Swipe OUVERTURE : bord gauche 50–80 px, sidebar fermée ──
      // Zone bord gauche : 50–80 px
      //   - min 50 px : Samsung/Android back-gesture zone = 0–40 px environ.
      //     Listeners passifs ne peuvent PAS appeler preventDefault → toute zone
      //     qui chevauche 0–40 px risque de déclencher le retour arrière natif
      //     EN MÊME TEMPS que l'ouverture sidebar. 50 px garantit zéro conflit.
      //   - max 80 px : zone assez large pour rester utilisable tout en évitant
      //     les faux positifs sur les éléments proches du bord.
      const inZone = startX >= 50 && startX <= 80
        && startY < androidGestureZone
        && !sidebarOpenRef.current;

      if (!inZone) return;

      // Si l'élément touché est dans un conteneur à scroll horizontal
      // (table overflow-x-auto, carrousel, etc.) → ne pas intercepter
      if (hasHorizontalScrollAncestor(e.target)) return;

      // Marquer comme "candidat swipe" — PAS encore gestureActive.
      // Le navigateur reste libre de lancer le scroll vertical sans délai.
      pendingGesture = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      // Multi-touch en cours → tout annuler
      if (e.touches.length > 1) { resetGesture(); return; }

      const dx = e.touches[0].clientX - startX;
      const dy = Math.abs(e.touches[0].clientY - startY);

      // ── Swipe FERMETURE ──────────────────────────────────────────────────
      if (closeGestureActive) {
        // Swipe gauche confirmé — annuler si dérive verticale
        if (dy > 24 || dy > Math.abs(dx) * 0.5 || (Date.now() - startTime) > 600 || dx > 0) {
          closeGestureActive = false;
        }
        return;
      }

      if (pendingCloseGesture) {
        // Confirmer le swipe gauche : dx ≤ −6 px, direction horizontale nette
        if (
          dx <= -6 &&
          Math.abs(dx) > dy * 1.5 &&
          dy <= 24 &&
          (Date.now() - startTime) <= 500
        ) {
          closeGestureActive  = true;
          pendingCloseGesture = false;
        } else if (dy > Math.abs(dx) || dy > 10 || dx > 0 || (Date.now() - startTime) > 500) {
          pendingCloseGesture = false;
        }
        return;
      }

      // ── Swipe OUVERTURE ──────────────────────────────────────────────────
      if (gestureActive) {
        // Swipe déjà confirmé — surveiller pour le conserver ou l'annuler
        if (dy > 24 || dy > dx * 0.5 || (Date.now() - startTime) > 600 || dx < 0) {
          gestureActive = false;
        }
        return;
      }

      if (!pendingGesture) return;

      // ── Confirmation différée : premier touchmove depuis la zone bord gauche ──
      if (
        dx >= 6 &&
        dx > dy * 1.5 &&
        dy <= 24 &&
        (Date.now() - startTime) <= 500
      ) {
        gestureActive  = true;
        pendingGesture = false;
      } else if (dy > dx || dy > 10 || dx < 0 || (Date.now() - startTime) > 500) {
        pendingGesture = false;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const wasOpen   = gestureActive;
      const wasClose  = closeGestureActive;
      resetGesture();

      const dx = e.changedTouches[0].clientX - startX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      const dt = Date.now() - startTime;

      // Swipe droite → OUVRIR
      if (wasOpen && dx >= 60 && dy < 22 && dt < 500 && dx / Math.max(dy, 1) >= 2.0) {
        setSidebarOpen(true);
        return;
      }
      // Swipe gauche → FERMER
      if (wasClose && dx <= -50 && dy < 26 && dt < 500 && Math.abs(dx) / Math.max(dy, 1) >= 1.8) {
        setSidebarOpen(false);
      }
    };

    // touchcancel : interruption système (notification, geste home iOS,
    // appel entrant, verrouillage écran) → réinitialise l'état proprement.
    document.addEventListener('touchstart',  onTouchStart,  { passive: true });
    document.addEventListener('touchmove',   onTouchMove,   { passive: true });
    document.addEventListener('touchend',    onTouchEnd,    { passive: true });
    document.addEventListener('touchcancel', resetGesture,  { passive: true });

    return () => {
      document.removeEventListener('touchstart',  onTouchStart);
      document.removeEventListener('touchmove',   onTouchMove);
      document.removeEventListener('touchend',    onTouchEnd);
      document.removeEventListener('touchcancel', resetGesture);
    };
  }, [setSidebarOpen]);

  // Focus accessibilité après navigation — uniquement pour lecteurs d'écran.
  // Focus accessibilité après navigation — lecteurs d'écran clavier (desktop).
  // Sur mobile tactile, focus() sans preventScroll fiable cause un scroll Android
  // indésirable (Samsung Internet, MIUI, etc.) → on ne focus PAS sur touch-only.
  useEffect(() => {
    if (navigator.maxTouchPoints > 0) return; // mobile/tablette tactile → skip
    const main = document.getElementById('main-content');
    if (!main) return;
    requestAnimationFrame(() => {
      try { main.focus({ preventScroll: true }); } catch { /* navigateurs anciens */ }
    });
  }, [location.pathname]);

  // ── Protection propriété intellectuelle — cross-browser (Chrome, Firefox,
  //    Safari, Opera, Opera Mini, Mi Browser, Samsung Internet, Edge) ────────
  useEffect(() => {
    const MSG = '© Apprenix — Reproduction interdite sans autorisation écrite.';

    // 1. Clic droit — tous navigateurs (y.c. Opera Mini via attribut HTML)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toast.warning('Contenu protégé', { description: MSG, duration: 4000 });
      return false;
    };

    // 2. Raccourcis clavier — étendu à Opera/Mi (ajout Ctrl+P, Ctrl+A, F5 DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Blocage : Ctrl+U (source), Ctrl+S (save), Ctrl+A (select all), Ctrl+P (print)
      if (ctrl && ['u','U','s','S','a','A','p','P'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning('Contenu protégé', { description: MSG, duration: 4000 });
        return false;
      }
      // F12 — DevTools info
      if (e.key === 'F12') {
        e.preventDefault();
        toast.info('© Apprenix', {
          description: "Code source protégé par le droit d'auteur français.",
          duration: 5000,
        });
        return false;
      }
    };

    // 3. Sélection texte — bloquée via CSS (user-select: none dans index.css)
    //    NE PAS utiliser selectstart JS avec capture:true :
    //    Safari/iOS utilise selectstart avant d'identifier les gestes tactiles
    //    → notre preventDefault() annulait la reconnaissance de TOUS les swipes.
    //    La protection CSS .protected-content est suffisante et sans effet de bord.

    // 4. Glisser-déposer de contenus — bloqué (images, textes)
    const blockDrag = (e: DragEvent) => { e.preventDefault(); return false; };

    // 5. Copie / Couper — bloqués sauf dans les champs de saisie (input, textarea, contentEditable)
    //    Guard input : évite de bloquer la copie de texte saisi par l'utilisateur
    //    (bug Android Chrome : long-press sur input déclenchait le toast "Copie bloquée")
    const isEditableTarget = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    };
    const handleCopy = (e: ClipboardEvent) => {
      if (isEditableTarget(e)) return;
      e.preventDefault();
      toast.warning('Copie bloquée', { description: MSG, duration: 3000 });
      return false;
    };
    const handleCut = (e: ClipboardEvent) => {
      if (isEditableTarget(e)) return;
      e.preventDefault();
      return false;
    };

    // 6. Impression — message d'avertissement
    const handleBeforePrint = () => {
      toast.info('Impression', {
        description: '© Apprenix — Ce contenu est protégé. Un filigrane sera ajouté.',
        duration: 4000,
      });
    };

    document.addEventListener('contextmenu',  handleContextMenu, { capture: true });
    document.addEventListener('keydown',       handleKeyDown,     { capture: true });
    document.addEventListener('dragstart',     blockDrag,         { capture: true });
    document.addEventListener('copy',          handleCopy,        { capture: true });
    document.addEventListener('cut',           handleCut,         { capture: true });
    window.addEventListener('beforeprint',     handleBeforePrint);

    return () => {
      document.removeEventListener('contextmenu',  handleContextMenu, { capture: true });
      document.removeEventListener('keydown',       handleKeyDown,     { capture: true });
      document.removeEventListener('dragstart',     blockDrag,         { capture: true });
      document.removeEventListener('copy',          handleCopy,        { capture: true });
      document.removeEventListener('cut',           handleCut,         { capture: true });
      window.removeEventListener('beforeprint',     handleBeforePrint);
    };
  }, []);

  return (
    /*
     * ── Layout racine — sidebar overlay universelle ───────────────────────────
     *  Swipe OUVERT : native touchstart/touchmove/touchend sur document
     *                 bord gauche < 30 px + scroll détecté dès touchmove
     *  Swipe FERMÉ  : tap backdrop (onClick)
     *  0 div zone bord gauche, 0 handler React sur le root
     */
    <div
      className="flex flex-col w-full flex-1 min-w-0"
    >
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      {/* Live region — annonce navigation pour lecteurs d'écran (NVDA, VoiceOver, TalkBack) */}
      <div
        id="a11y-page-announce"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* ── Backdrop — fondu synchronisé avec l'animation sidebar (260 ms) ── */}
      {backdropVisible && (
        <div
          className="fixed inset-0 z-40 touch-none transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(0,0,0,0.75)',
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? 'auto' : 'none',
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar overlay — universelle tous écrans ─────────────────────── */}
      {/*
       *  Largeur : 280px mobile → 320px tablette → 340px desktop/grand écran
       *  max-w-[88vw] : garantit qu'on voit au moins 12% du contenu derrière
       *  safe-area-inset-left : iOS en mode paysage (notch côté gauche)
       *  100dvh : unité dynamique — ignore la barre d'adresse iOS Safari
       */}
      <aside
        id="main-navigation"
        role="navigation"
        aria-label="Navigation principale"
        aria-modal={sidebarOpen ? true : undefined}
        aria-hidden={!sidebarOpen}
        className="fixed left-0 z-[60] bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden w-[280px] max-w-[88vw] md:w-[320px] lg:w-[340px] xl:w-[360px] 2xl:w-[380px]"
        style={{
          top: `${headerHeight}px`,
          height: `calc(100dvh - ${headerHeight}px)`,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(calc(-100% - 2px))',
          transition: isMounted.current ? 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          /* iOS paysage : décale le contenu pour éviter le notch gauche */
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        }}
      >
        {/* overscroll-contain : isole le scroll de la sidebar — ne traverse plus vers le body */}
        <div className="flex flex-col h-full overflow-y-auto touch-pan-y overscroll-contain">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* ── Header sticky — wrapper mesuré par ResizeObserver ───────────── */}
      <div ref={headerWrapRef} className="shrink-0">
        <Header
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          isOpen={sidebarOpen}
        />
      </div>

      {/* ── Fil d'Ariane (pages > 1 niveau) ─────────────────────────────── */}
      <Breadcrumb />

      {/* ── Zone contenu principale ──────────────────────────────────────── */}
      {/* NOTE : PAS de overflowX:hidden ici — sur iOS Safari, overflow-x:hidden
          sur un flex container crée implicitement overflow-y:auto, ce qui génère
          un scroll interne et clip le contenu en bas (fine ligne blanche + coupure).
          Le overflowX:hidden est uniquement sur le <main> ci-dessous.            */}
      <div className="flex flex-col flex-1 min-w-0" ref={(el) => { if (el) el.inert = sidebarOpen; }}>
        {/* flex: 1 0 auto — absorbe tout l'espace restant entre header et footer.
            Empêche le footer de remonter pendant le chargement des skeletons
            (zéro CLS / zéro infinite re-render causé par un layout shift). */}
        <main
          className="min-w-0 outline-none p-3 md:p-5 lg:p-6 xl:p-8"
          id="main-content"
          aria-label="Contenu principal"
          tabIndex={-1}
          style={{
            flex: '1 0 auto',
            overflowX: 'hidden',
            paddingBottom: 'max(96px, calc(80px + env(safe-area-inset-bottom, 0px)))',
          }}
        >
          {/* max-w-[1600px] — cohérent avec le header ; limite la largeur sur TV/4K/projecteurs */}
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
        {/* shrink-0 + margin-top auto (via flex parent) — footer ancré en bas.
            Aucun sticky/top/position → zéro CLS, zéro boucle de re-render. */}
        <Footer />
      </div>



      {/* Toast flottant — positionné en fixed, hors du flux de layout */}
      <GuestBanner />

    </div>
  );
};

export default MainLayout;
