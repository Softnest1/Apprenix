import {
  ArrowRight, BookOpen, Brain, Calendar, CheckCircle, CheckSquare,
  Clock, CreditCard, FileText, GraduationCap, Heart,
  History, Languages, Lock, ScanLine, ShieldCheck, Sparkles,
  Star, Trophy, Users, Wrench, Zap,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { getLevelCategory } from '@/lib/levelUtils';
import { EspaceNiveauContent } from './EspaceNiveauPage';

// ─── Niveaux scolaires ────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: 'primaire',
    emoji: '🏫',
    title: 'École Primaire',
    subtitle: 'CP · CE1 · CE2 · CM1 · CM2',
    description: 'Fiches illustrées, exercices guidés et badges pour apprendre à lire, écrire et compter avec confiance.',
    gradient: 'from-[#2d9b6f] to-[#1a7a52]',
    border: 'border-[#2d9b6f]/30',
    glow: 'shadow-[0_4px_32px_0_rgba(45,155,111,0.18)]',
    features: ['Aide guidée pas-à-pas', 'Fiches illustrées', 'To-do simple', 'Badges de progression'],
  },
  {
    id: 'college',
    emoji: '📚',
    title: 'Collège',
    subtitle: '6e · 5e · 4e · 3e',
    description: 'Annales corrigées, planning Brevet, conjugueur et aide aux devoirs pour préparer ton diplôme avec méthode.',
    gradient: 'from-[#c47a1e] to-[#a0600f]',
    border: 'border-[#c47a1e]/30',
    glow: 'shadow-[0_4px_32px_0_rgba(196,122,30,0.18)]',
    features: ['Révisions Brevet', 'Aide pas-à-pas', 'Conjugueur', 'Planning intelligent'],
  },
  {
    id: 'lycee',
    emoji: '🎓',
    title: 'Lycée',
    subtitle: '2nde · 1ère · Terminale',
    description: 'Flashcards SM-2, dissertations guidées, annales Bac et Pomodoro Deep Focus pour décrocher tes notes.',
    gradient: 'from-[#2e4fb5] to-[#1a3490]',
    border: 'border-[#2e4fb5]/30',
    glow: 'shadow-[0_4px_32px_0_rgba(46,79,181,0.22)]',
    features: ['Flashcards Bac', 'Aide dissertations', 'Annales corrigées', 'Pomodoro Focus'],
    popular: true,
  },
  {
    id: 'superieur',
    emoji: '🏛️',
    title: 'Supérieur',
    subtitle: 'BTS · Licence · Master · Grandes Écoles',
    description: 'Mode Socratique, wiki personnel, Pomodoro++ et analyse de cours pour exceller dans l\'enseignement supérieur.',
    gradient: 'from-[#6b3fa0] to-[#4e2a80]',
    border: 'border-[#6b3fa0]/30',
    glow: 'shadow-[0_4px_32px_0_rgba(107,63,160,0.18)]',
    features: ['Mode Socratique', 'Wiki personnel', 'Pomodoro++', 'Remix de cours'],
  },
];

// ─── Catégories d'outils (page espace étudiant visiteur) ──────────────────────
const TOOL_CATS_ESPACE = [
  {
    id: 'aide',
    label: 'Aide & Devoirs',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    id: 'apprendre',
    label: 'Réviser & Apprendre',
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
  },
  {
    id: 'organiser',
    label: 'Organiser & Suivre',
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    border: 'border-chart-1/20',
  },
] as const;
type EspaceCatId = typeof TOOL_CATS_ESPACE[number]['id'];

// ─── Outils clés ─────────────────────────────────────────────────────────────
const TOOLS: { icon: React.ElementType; label: string; desc: string; path: string; color: string; cat: EspaceCatId }[] = [
  { icon: Brain,      label: 'Aide IA',          desc: 'Explications pas-à-pas',     path: '/aide-ia',        color: 'text-primary',  cat: 'aide'      },
  { icon: ScanLine,   label: 'Scanner',           desc: 'Photo → correction',          path: '/scanner',        color: 'text-primary',  cat: 'aide'      },
  { icon: CreditCard, label: 'Flashcards',        desc: 'Répétition espacée SM-2',     path: '/flashcards',     color: 'text-chart-2',  cat: 'apprendre' },
  { icon: Languages,  label: 'Outils Langue',     desc: 'Conjugueur · correcteur',     path: '/linguistique',   color: 'text-chart-2',  cat: 'apprendre' },
  { icon: Wrench,     label: 'Maths & Sciences',  desc: 'Équations · formules',        path: '/maths-sciences', color: 'text-chart-2',  cat: 'apprendre' },
  { icon: Calendar,   label: 'Planning',          desc: 'Pomodoro + to-do',            path: '/organisation',   color: 'text-chart-1',  cat: 'organiser' },
  { icon: FileText,   label: 'Notes',             desc: 'Cours organisés par matière', path: '/notes',          color: 'text-chart-1',  cat: 'organiser' },
  { icon: Trophy,     label: 'Motivation',        desc: 'Badges et streak',            path: '/motivation',     color: 'text-chart-1',  cat: 'organiser' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '100 %',  label: 'Gratuit pour toujours' },
  { value: '0 pub',  label: 'Zéro publicité' },
  { value: '8 outils', label: 'Inclus sans abonnement' },
  { value: 'E2E',    label: 'Données chiffrées' },
];

// ─── Page principale ──────────────────────────────────────────────────────────
const VALID_CATEGORIES = new Set(['primaire', 'college', 'lycee', 'superieur', 'adapte']);

const EspaceEtudiantPage: React.FC = () => {
  const { isAuthenticated, authReady, profileReady, level } = useApp();
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();

  // Attendre que l'auth ET le profil DB soient prêts avant de rediriger
  // Évite le redirect sur le niveau par défaut '2nde' avant que school_level soit chargé
  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Utilisateur connecté sur /espace (sans category) → redirige vers sa catégorie
  if (isAuthenticated && !category) {
    return <Navigate to={`/espace/${getLevelCategory(level)}`} replace />;
  }

  // Catégorie inconnue → redirige vers la catégorie du profil
  if (isAuthenticated && category && !VALID_CATEGORIES.has(category)) {
    return <Navigate to={`/espace/${getLevelCategory(level)}`} replace />;
  }

  // Utilisateur connecté sur /espace/:category → affiche le tableau de bord
  if (isAuthenticated) return <EspaceNiveauContent urlCategory={category} />;

  // Helpers — navigate en mode replace pour ne PAS accumuler /espace dans l'historique
  // Ainsi, depuis /connexion puis depuis le dashboard, le "retour" remonte correctement
  const goToSignup = () => navigate('/connexion?mode=signup', { replace: true });
  const goToLogin  = () => navigate('/connexion', { replace: true });

  // ── Landing visiteur ─────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh w-full bg-background">
      <SEO
        title="Espace Étudiant — Outils scolaires gratuits | Apprenix"
        description="Aide aux devoirs IA, flashcards, scanner, planning Pomodoro et 8 outils pour tous les niveaux — 100 % gratuit, sans pub, sans compte obligatoire."
        canonical="/espace"
        noIndex={false}
        dateModified="2026-06-25"
      />

      {/* ── Navbar légère ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <ApprenixLogo size={28} />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={goToLogin}>
              Se connecter
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={goToSignup}>
              Créer un compte gratuit
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-12 md:py-20 text-center">
        {/* Fond radial subtil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary)/0.13), transparent)',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 inline-flex gap-1.5">
            <Sparkles className="w-3 h-3" />
            100 % gratuit · 0 pub · Contenu humain
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 text-balance leading-tight">
            Ton espace scolaire.<br />
            <span className="text-primary">Tout en un. Gratuit.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 text-pretty">
            Aide aux devoirs IA, scanner, flashcards, planning Pomodoro et bien plus — pour chaque niveau scolaire,
            de la primaire au supérieur.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <Button size="lg" className="h-12 px-8 gap-2 text-base font-semibold w-full md:w-auto" onClick={goToSignup}>
              <GraduationCap className="w-5 h-5" />
              Créer mon espace gratuit
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/aide-ia">
              <Button variant="outline" size="lg" className="h-12 px-6 gap-2 text-base w-full md:w-auto">
                <Brain className="w-4 h-4" />
                Tester l&apos;Aide IA
              </Button>
            </Link>
          </div>
          {/* Micro-preuve */}
          <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            Sans carte bancaire · Accessible immédiatement · Données chiffrées
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-6 bg-secondary/20 border-y border-border/50">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Niveaux scolaires ─────────────────────────────────────────── */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-balance">
            Un espace pour chaque niveau
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            Contenu adapté et outils calibrés selon ton niveau scolaire.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEVELS.map(({ id, emoji, title, subtitle, description, gradient, border, glow, features, popular }) => (
            <Card
              key={id}
              className={`relative overflow-hidden h-full border-2 ${border} ${glow} transition-transform hover:-translate-y-0.5`}
            >
              {popular && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Populaire
                  </Badge>
                </div>
              )}
              {/* Bandeau couleur */}
              <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl shrink-0" aria-hidden>{emoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-base leading-tight">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 text-pretty">{description}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-success shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button className="gap-2 h-11 px-8" onClick={goToSignup}>
            <GraduationCap className="w-4 h-4" />
            Choisir mon niveau et démarrer
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Outils inclus ─────────────────────────────────────────────── */}
      <section className="px-4 py-12 bg-secondary/20 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-balance">
              8 outils inclus dans ton compte gratuit
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Chaque outil fonctionne seul ou ensemble — tout est synchronisé.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {TOOL_CATS_ESPACE.map(({ id, label, color, bg, border }) => {
              const tools = TOOLS.filter(t => t.cat === id);
              return (
                <div key={id}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3 ${bg} ${border}`}>
                    <span className={`text-xs font-extrabold uppercase tracking-wide ${color}`}>{label}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {tools.map(({ icon: Icon, label: tLabel, desc, path, color: tc }) => (
                      <Link key={tLabel} to={path}>
                        <Card className="h-full border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
                          <CardContent className="p-4 flex flex-col items-start gap-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                              <Icon className={`w-4 h-4 ${tc}`} />
                            </div>
                            <div className="min-w-0 w-full">
                              <p className="text-sm font-semibold text-foreground">{tLabel}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Arguments de confiance ────────────────────────────────────── */}
      <section className="px-4 py-12 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            { icon: ShieldCheck, color: 'text-success',    title: 'Données protégées',     desc: 'Chiffrement bout en bout. Aucune donnée vendue. RGPD.' },
            { icon: Users,       color: 'text-primary',    title: 'Contenu humain',         desc: 'Cours et méthodes rédigés par des enseignants certifiés.' },
            { icon: Heart,       color: 'text-chart-1',    title: 'Accessible à tous',      desc: 'Compatible RGAA 4.1. Mode DYS, ULIS, contraste élevé.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border/60">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground text-pretty">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────── */}
      <section className="px-4 py-14 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-3 text-balance">
            Prêt(e) à décoller ?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-pretty">
            Crée ton compte en 30 secondes — aucune carte bancaire, aucune pub, aucune surprise.
          </p>
          <Button size="lg" className="h-12 px-10 gap-2 text-base font-semibold" onClick={goToSignup}>
            <GraduationCap className="w-5 h-5" />
            Créer mon espace gratuit
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Déjà un compte ?{' '}
            <button type="button" onClick={goToLogin} className="text-primary hover:underline font-medium">
              Se connecter
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer minimal ────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Apprenix ·{' '}
          <Link to="/mentions-legales" className="hover:underline">Mentions légales</Link>
          {' · '}
          <Link to="/politique-confidentialite" className="hover:underline">Confidentialité</Link>
          {' · '}
          <Link to="/accessibilite" className="hover:underline">Accessibilité RGAA 4.1</Link>
        </p>
      </footer>
    </div>
  );
};

export default EspaceEtudiantPage;
