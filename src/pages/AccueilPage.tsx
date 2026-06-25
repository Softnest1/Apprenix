import {
  Accessibility,
  ArrowRight, Award, BadgeCheck,
  BarChart2, BookOpen,
  Brain, Calculator,
  Calendar, CheckCircle, Clock, CreditCard, Crown, Eye, FileText, Flame, GitBranch, GraduationCap,
  Heart, HelpCircle, Languages,
  Lightbulb, Lock, Mail, MessageSquare, Minus, Newspaper, PenLine, Rocket, ScanLine, School, ShieldCheck,
  Sparkles, Timer, Trophy, Users, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommentCard from '@/components/community/CommentCard';
import ReviewForm from '@/components/community/ReviewForm';
import PwaInstallSection from '@/components/PwaInstallSection';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { useComments } from '@/hooks/useComments';
import { getLevelCategory, getLevelCategoryLabel } from '@/lib/levelUtils';
import { cn } from '@/lib/utils';

// ─── Données statiques ────────────────────────────────────────────────────────

// Prefetch silencieux — source unique dans src/lib/prefetch.ts
import { prefetchRoute } from '@/lib/prefetch';

// ─── Catégories d'outils ──────────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  { id: 'aide',        label: 'Aide & Recherche',        icon: Brain,      color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/20', desc: 'Trouver des réponses immédiatement'   },
  { id: 'apprendre',   label: 'Apprendre & Mémoriser',   icon: CreditCard, color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/20', desc: 'Ancrer le savoir durablement'          },
  { id: 'matieres',    label: 'Outils Matières',          icon: Calculator, color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/20', desc: 'Spécialisés par discipline'            },
  { id: 'organiser',   label: 'Organiser & Prendre notes',icon: Calendar,   color: 'text-primary', bg: 'bg-primary/10',  border: 'border-primary/20',  desc: 'Structurer son travail et ses idées'  },
  { id: 'performance', label: 'Concentration & Examen',   icon: Timer,      color: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/20', desc: 'Performer au bon moment'              },
] as const;
type ToolCategoryId = typeof TOOL_CATEGORIES[number]['id'];

// 13 outils pédagogiques — regroupés par catégorie pour meilleure lisibilité
const TOOLS: { path: string; icon: React.ElementType; label: string; desc: string; color: string; bg: string; category: ToolCategoryId }[] = [
  // ── Aide & Recherche ──────────────────────────────────────────────────────
  { path: '/aide-ia',        icon: Brain,         label: 'Aide aux devoirs',        desc: 'Fiches méthode pas-à-pas + ressources vérifiées, toutes matières',      color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  { path: '/scanner',        icon: ScanLine,      label: 'Scanner de devoirs',      desc: 'Photo ton exercice → explication instantanée',                          color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  { path: '/base-reponses',  icon: MessageSquare, label: 'Base de réponses',        desc: '100 000 réponses vérifiées par des enseignants — du CP au Bac+5',       color: 'text-chart-1', bg: 'bg-chart-1/10', category: 'aide'        },
  // ── Apprendre & Mémoriser ─────────────────────────────────────────────────
  { path: '/ressources',     icon: BookOpen,      label: 'Ressources pédagogiques', desc: 'Résumés, fiches, annales, méthodes et outil Remix',                     color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  { path: '/flashcards',     icon: CreditCard,    label: 'Flashcards',              desc: 'Révision espacée Anki-style — mémorise durablement',                    color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  { path: '/quiz',           icon: HelpCircle,    label: 'Quiz interactif',         desc: 'Crée tes questions, passe le quiz, obtiens ton score instantané',       color: 'text-chart-2', bg: 'bg-chart-2/10', category: 'apprendre'   },
  // ── Outils Matières ───────────────────────────────────────────────────────
  { path: '/linguistique',   icon: Languages,     label: 'Outils Linguistiques',    desc: 'Dictionnaire, conjugueur, correcteur, traducteur',                      color: 'text-chart-4', bg: 'bg-chart-4/10', category: 'matieres'    },
  { path: '/maths-sciences', icon: Calculator,    label: 'Maths & Sciences',        desc: 'Calculatrice scientifique, formules, tableau périodique',               color: 'text-chart-4', bg: 'bg-chart-4/10', category: 'matieres'    },
  // ── Organiser & Prendre notes ─────────────────────────────────────────────
  { path: '/organisation',   icon: Calendar,      label: 'Organisation',            desc: 'Agenda, planning, to-do list et Pomodoro Deep Focus',                   color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  { path: '/notes',          icon: FileText,      label: 'Notes personnelles',      desc: 'Wiki personnel — organise, recherche et exporte tes notes',             color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  { path: '/carte-mentale',  icon: GitBranch,     label: 'Carte mentale',           desc: 'Organise tes idées visuellement — sauvegarde auto, export',             color: 'text-primary', bg: 'bg-primary/10',  category: 'organiser'   },
  // ── Concentration & Examen ────────────────────────────────────────────────
  { path: '/focus',          icon: Zap,           label: 'Mode Deep Work',          desc: 'Sessions chronomètrées, musique focus, blocage distractions',           color: 'text-chart-5', bg: 'bg-chart-5/10', category: 'performance' },
  { path: '/examen',         icon: Timer,         label: 'Mode Examen',             desc: 'Minuterie personnalisable, checklist, conseils anti-stress',             color: 'text-chart-5', bg: 'bg-chart-5/10', category: 'performance' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: School,    title: 'Choisissez votre niveau', desc: 'Primaire, Collège, Lycée ou Supérieur — votre espace est automatiquement personnalisé avec les bons outils et fiches.', color: 'text-chart-4', bg: 'bg-chart-4/10', bar: 'bg-chart-4' },
  { step: '02', icon: Sparkles,  title: 'Explorez les outils',     desc: "Fiches méthode, Scanner de devoirs, Flashcards, Quiz… tous accessibles immédiatement, sans créer de compte et sans carte bancaire.", color: 'text-chart-1', bg: 'bg-chart-1/10', bar: 'bg-chart-1' },
  { step: '03', icon: Rocket,    title: 'Créez votre compte',      desc: "Facultatif mais utile : sauvegardez vos notes, flashcards et tâches sur n'importe quel appareil. Totalement gratuit, sans engagement.", color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary' },
];

type CompVal = true | false | 'partial';
interface CompRow { feature: string; apprenix: true; chatgpt: CompVal; quizlet: CompVal; brainly: CompVal; khan: CompVal; note?: string; detail?: string; }

const COMPARISON_ROWS: CompRow[] = [
  { feature: 'Mode guidé — comprendre, pas copier',     apprenix: true, chatgpt: false,     quizlet: 'partial', brainly: false,     khan: 'partial', detail: "Les autres outils donnent la réponse directement. Apprenix explique la méthode étape par étape." },
  { feature: 'Scanner de cours + OCR structuré',        apprenix: true, chatgpt: 'partial', quizlet: false,     brainly: false,     khan: false,     detail: "Scannez une fiche papier et obtenez un résumé structuré en secondes. Aucun autre outil scolaire ne le fait." },
  { feature: 'Flashcards + répétition espacée (SM-2)',  apprenix: true, chatgpt: false,     quizlet: true,      brainly: false,     khan: false,     detail: "Quizlet le propose aussi, mais en version payante. Sur Apprenix c'est 100 % gratuit et illimité." },
  { feature: 'Planning & agenda scolaire intégrés',     apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: false,     detail: "Aucun concurrent ne combine révisions + planning dans une seule application. Apprenix oui." },
  { feature: 'Mode Examen + Quiz interactif',           apprenix: true, chatgpt: false,     quizlet: 'partial', brainly: false,     khan: 'partial', detail: "Minuterie, checklist anti-stress, conseils de dernière minute — pensé pour le jour J." },
  { feature: 'Mode ULIS / SEGPA — inclusion',          apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: false,     detail: "Apprenix est la seule plateforme avec un mode dédié aux élèves en situation de handicap ou SEGPA." },
  { feature: 'Compte optionnel — accès immédiat',       apprenix: true, chatgpt: false,     quizlet: false,     brainly: false,     khan: true,      detail: "Pas besoin de créer un compte pour commencer. Ouvrez le site et utilisez tous les outils." },
  { feature: 'Fiches méthode & assistant guidé (pas généraliste)', apprenix: true, chatgpt: false, quizlet: false, brainly: false, khan: 'partial', detail: "Les fiches méthode Apprenix suivent les programmes officiels français. L'assistant guide étape par étape sans écrire à la place de l'élève." },
];

// ─── Widget Révision du jour (membres) ────────────────────────────────────────
const RevisionDuJourWidget: React.FC = () => {
  const { flashcards, decks, todos } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const dueCards   = flashcards.filter(c => c.nextReview <= today);
  const urgentTodos = todos.filter(t => !t.completed && t.dueDate && t.dueDate <= today);
  const total = dueCards.length + urgentTodos.length;
  if (total === 0) return null;
  const xpPotential = dueCards.length * 5 + urgentTodos.length * 10;

  return (
    <Card className="shadow-card border-l-4 border-l-chart-1 bg-gradient-to-r from-chart-1/5 to-transparent">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-chart-1/15 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground">Révision du jour</p>
                <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs">
                  {total} action{total > 1 ? 's' : ''} en attente
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  +{xpPotential} XP potentiel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {dueCards.length > 0 && `${dueCards.length} flashcard${dueCards.length > 1 ? 's' : ''} à réviser`}
                {dueCards.length > 0 && urgentTodos.length > 0 && ' · '}
                {urgentTodos.length > 0 && `${urgentTodos.length} tâche${urgentTodos.length > 1 ? 's' : ''} urgente${urgentTodos.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {dueCards.length > 0 && (
              <Link to="/flashcards">
                <Button size="sm" className="h-9 text-xs font-semibold">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Réviser ({dueCards.length})
                </Button>
              </Link>
            )}
            {urgentTodos.length > 0 && (
              <Link to="/organisation">
                <Button size="sm" variant="outline" className="h-9 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Tâches urgentes
                </Button>
              </Link>
            )}
          </div>
        </div>
        {dueCards.length > 0 && (() => {
          const mostUrgentDeck = decks.find(d => d.id === dueCards[0]?.deckId);
          if (!mostUrgentDeck) return null;
          const deckCards = flashcards.filter(c => c.deckId === mostUrgentDeck.id);
          const mastered = deckCards.filter(c => c.reviewCount >= 3).length;
          const pct = deckCards.length ? Math.round((mastered / deckCards.length) * 100) : 0;
          return (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-chart-1" />
                  Deck : <span className="font-medium text-foreground ml-1">{mostUrgentDeck.name}</span>
                </span>
                <span>{mastered}/{deckCards.length} · {pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

// ─── Vue VISITEUR ─────────────────────────────────────────────────────────────
const VisitorView: React.FC = () => {
  const { level } = useApp();
  const { reviews, addReview, likeReview } = useComments();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  return (
    <>
    <div className="min-w-0 space-y-8 md:space-y-12">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden animate-fade-up -mx-3 md:-mx-5 lg:-mx-6 -mt-3 md:-mt-5 lg:-mt-6 text-white bg-gradient-primary"
        style={{ isolation: 'isolate' }}
        aria-label="Présentation Apprenix"
      >
        {/* Décor subtil */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/[0.05] blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-white/[0.04] blur-2xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>

        {/* Layout hero — max-w-screen-2xl pour TV/cinéma/projecteur */}
        <div className="relative z-10 max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-start px-5 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16 xl:px-20 xl:py-20 2xl:px-24 2xl:py-24 gap-8 lg:gap-14 xl:gap-20">

          {/* ── Colonne gauche ── */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0">

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs xl:text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.15)]">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Du CP au Bac+5 · Créé en France 🇫🇷
              </span>
              <span className="inline-flex items-center gap-1.5 bg-success/30 border border-success/40 text-white text-xs xl:text-sm font-semibold px-2.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" aria-hidden="true" />
                100 % gratuit · 0 pub
              </span>
            </div>

            {/* H1 — fluid pour tous écrans */}
            <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] xl:text-6xl 2xl:text-7xl font-extrabold text-white leading-[1.08] text-balance mb-4 [text-shadow:0_2px_16px_rgba(0,0,0,0.25)]">
              La plateforme scolaire gratuite qui change tout
            </h1>

            {/* Sous-titre */}
            <p className="text-white/90 text-base md:text-lg xl:text-xl 2xl:text-2xl leading-relaxed text-pretty mb-6 max-w-lg xl:max-w-2xl [text-shadow:0_1px_4px_rgba(0,0,0,0.15)]">
              Fiches méthode, flashcards, scanner OCR, organisation scolaire — 13 outils pédagogiques. 100 % gratuit, sans pub, sans compte requis.
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-7 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 w-full md:w-auto">
              <div className="flex shrink-0 gap-2">
                {[
                  { icon: GraduationCap, label: '13 outils' },
                  { icon: ShieldCheck,   label: 'RGPD' },
                  { icon: BadgeCheck,    label: 'Éduscol' },
                ].map(({ icon: SI, label }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <SI className="w-4 h-4 xl:w-5 xl:h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white/70 text-[10px] xl:text-xs font-medium whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>
              <div className="w-px h-10 bg-white/20 shrink-0" />
              <p className="text-white text-sm xl:text-base font-semibold leading-snug text-left [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
                Recommandé par des enseignants.<br />
                <span className="text-white/70 text-xs xl:text-sm font-normal">Conforme au programme officiel.</span>
              </p>
            </div>

            {/* CTAs — double bouton : explorer + s'inscrire */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mb-6">
              <Link
                to="/espace"
                className="btn-cta inline-flex items-center justify-center gap-2 font-extrabold text-base xl:text-lg rounded-2xl text-white shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-[transform,box-shadow] duration-200 px-7 xl:px-9 py-4 xl:py-5 w-full sm:w-auto min-h-[52px] xl:min-h-[60px]"
                aria-label="Découvrir les outils gratuitement"
              >
                <Sparkles className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" aria-hidden="true" />
                <span className="truncate">Découvrir gratuitement</span>
                <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                to="/connexion?mode=inscription"
                className="inline-flex items-center justify-center gap-2 font-bold text-sm xl:text-base rounded-2xl text-white border-2 border-white/40 hover:bg-white/15 active:scale-95 transition-all duration-150 px-6 xl:px-8 py-4 xl:py-5 w-full sm:w-auto min-h-[52px] xl:min-h-[60px]"
                aria-label="Créer un compte gratuit en 30 secondes"
              >
                <Rocket className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" aria-hidden="true" />
                S'inscrire — 30 s
              </Link>
            </div>

            {/* Garanties */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1.5">
              {[
                { icon: Lock,        label: 'Sans compte requis' },
                { icon: ShieldCheck, label: '0 pub · 0 tracking' },
                { icon: CheckCircle, label: 'Hébergé en France'  },
              ].map(({ icon: TIcon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-white/75 text-xs xl:text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.15)]">
                  <TIcon className="w-3.5 h-3.5 shrink-0 text-white/60" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

          </div>

          {/* ── Colonne droite — outils phares (md+) ── */}
          <div className="hidden md:flex flex-col gap-3 shrink-0 w-[280px] lg:w-[310px] xl:w-[380px] 2xl:w-[440px]">

            {/* 4 stats */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { value: '100K+',   label: 'réponses vérifiées',  icon: Sparkles,      accent: 'bg-warning/20'  },
                { value: '< 10min', label: 'réponse enseignant',   icon: BadgeCheck,    accent: 'bg-success/20'  },
                { value: '0 pub',   label: 'aucune publicité',      icon: Eye,           accent: 'bg-white/20'    },
                { value: 'CP–M2',   label: 'tous les niveaux',      icon: GraduationCap, accent: 'bg-chart-3/20'  },
              ].map(({ value, label, icon: StatIcon, accent }) => (
                <div key={label} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-3.5 xl:p-4 flex flex-col gap-2 hover:bg-white/15 transition-colors">
                  <div className={`w-7 h-7 xl:w-9 xl:h-9 rounded-lg ${accent} flex items-center justify-center`}>
                    <StatIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-white" aria-hidden="true" />
                  </div>
                  <p className="text-white font-extrabold text-xl xl:text-2xl leading-none [text-shadow:0_1px_6px_rgba(0,0,0,0.2)]">{value}</p>
                  <p className="text-white/60 text-xs xl:text-sm leading-snug">{label}</p>
                </div>
              ))}
            </div>

            {/* Outils phares */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
              <p className="px-4 py-2 text-white/50 text-[10px] xl:text-xs font-bold uppercase tracking-widest">Outils phares</p>
              {[
                { icon: Brain,      label: 'Aide aux devoirs',         sub: 'Fiches méthode, toutes matières', path: '/aide-ia'       },
                { icon: BookOpen,   label: '100K réponses vérifiées',  sub: 'Enseignants certifiés',           path: '/base-reponses' },
                { icon: ScanLine,   label: 'Scanner de devoirs',       sub: 'Photo → explication',             path: '/scanner'       },
                { icon: CreditCard, label: 'Flashcards',               sub: 'Répétition espacée SM-2',         path: '/flashcards'    },
              ].map(({ icon: ToolIcon, label, sub, path: toolPath }) => (
                <Link key={label} to={toolPath}
                  className="flex items-center gap-3 px-4 py-3 xl:py-4 hover:bg-white/10 transition-colors group"
                  onMouseEnter={() => prefetchRoute(toolPath)}
                >
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                    <ToolIcon className="w-4 h-4 xl:w-5 xl:h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs xl:text-sm font-bold leading-tight">{label}</p>
                    <p className="text-white/55 text-[11px] xl:text-xs leading-snug mt-0.5">{sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 shrink-0 transition-colors" aria-hidden="true" />
                </Link>
              ))}
            </div>

            {/* CTA inscription inline (desktop) */}
            <Link
              to="/connexion?mode=inscription"
              className="flex items-center justify-center gap-2 w-full bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl px-4 py-3 xl:py-4 text-white text-sm xl:text-base font-bold transition-colors"
            >
              <Rocket className="w-4 h-4 shrink-0" aria-hidden="true" />
              Créer mon compte gratuit — 30 s
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>

          </div>

        </div>
      </section>

      {/* ══ 2. QUI ÊTES-VOUS ? — 4 profils ════════════════════════════════
          Priorité maximale : décision de navigation du visiteur.
          DYS/ULIS promu en 4e carte (suppression bande démo = doublon
          de la grille outils ci-dessous, suppression barre niveaux =
          doublon des badges sur la carte Élève).                       */}
      <section aria-label="Choisissez votre profil Apprenix">
        <div className="mb-6 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Users className="w-3 h-3" aria-hidden="true" />
            Votre espace personnalisé
          </span>
          <h2 className="text-display text-xl md:text-3xl font-extrabold text-foreground text-balance mt-1">
            Qui êtes-vous ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez votre profil — votre espace et vos outils sont adaptés en un clic.
          </p>
        </div>

        {/* ── 4 cartes profils (Élève / Parent / Enseignant / DYS) ─────────
            DYS/ULIS promu ici (suppression barre niveaux redondante).
            Grille 2×2 sur mobile, 4 colonnes à partir de md.           */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          {/* Carte Élève */}
          <Link to="/espace" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" aria-hidden="true" /> Le plus utilisé
                </span>
              </div>
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-primary">élève</span>
                  </h3>
                  <p className="text-xs font-semibold text-primary mb-2">Du CP au Bac+5</p>
                  <p className="hidden md:block text-sm text-muted-foreground text-pretty leading-relaxed">
                    13 outils gratuits : fiches méthode, flashcards, planning, scanner OCR…
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Primaire', 'Collège', 'Lycée', 'Supérieur'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-primary mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Mon espace
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte Parent */}
          <Link to="/parents" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-chart-4/30 bg-gradient-to-br from-chart-4/10 via-chart-4/5 to-transparent overflow-hidden hover:border-chart-4/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-chart-4/15 border border-chart-4/25 flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-chart-4" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-chart-4">parent</span>
                  </h3>
                  <p className="text-xs font-semibold text-chart-4 mb-2">Accompagner sereinement</p>
                  <p className="hidden md:block text-sm text-muted-foreground text-pretty leading-relaxed">
                    Sans pub, sans contenu inapproprié. Suivi de progression en toute confiance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['0 pub', 'RGPD', 'Gratuit'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-chart-4/10 text-chart-4 border border-chart-4/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-chart-4 mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace parents
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte Enseignant */}
          <Link to="/enseignants" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-chart-3/30 bg-gradient-to-br from-chart-3/10 via-chart-3/5 to-transparent overflow-hidden hover:border-chart-3/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-chart-3/15 border border-chart-3/25 flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-chart-3" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    Je suis <span className="text-chart-3">enseignant(e)</span>
                  </h3>
                  <p className="text-xs font-semibold text-chart-3 mb-2">Programmes Éduscol</p>
                  <p className="hidden md:block text-sm text-muted-foreground text-pretty leading-relaxed">
                    Ressources alignées sur les programmes officiels. Recommandez en toute confiance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Éduscol', 'B.O.', 'Gratuit'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-chart-3/10 text-chart-3 border border-chart-3/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-chart-3 mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace enseignants
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

          {/* Carte DYS / ULIS / SEGPA — promu depuis l'ancienne barre niveaux */}
          <Link to="/inclusion" className="group col-span-1 h-full flex">
            <div className="relative flex flex-col w-full rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent overflow-hidden hover:border-success/60 hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer">
              <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/15 border border-success/25 flex items-center justify-center shadow-md">
                  <Accessibility className="w-6 h-6 md:w-7 md:h-7 text-success" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground text-balance leading-tight mb-1">
                    <span className="text-success">DYS</span> / ULIS / SEGPA
                  </h3>
                  <p className="text-xs font-semibold text-success mb-2">Accessibilité universelle</p>
                  <p className="hidden md:block text-sm text-muted-foreground text-pretty leading-relaxed">
                    Interface adaptée, police DYS, contrastes renforcés. Aucun élève laissé de côté.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['DYS', 'ULIS', 'Adapté'].map(n => (
                    <span key={n} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-success mt-auto pt-1 group-hover:gap-2.5 transition-[gap] duration-150">
                  Espace inclusion
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ══ 2b. TOUS LES OUTILS — 13 outils ══════════════════════════════
          Placé après les profils : le visiteur sait qui il est,
          maintenant il découvre tous les outils disponibles.          */}
      <section aria-label="Les 13 outils gratuits d'Apprenix">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="section-divider pt-3 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-chart-2 bg-chart-2/10 border border-chart-2/20 px-2.5 py-1 rounded-full mb-2">
              <Award className="w-3 h-3" aria-hidden="true" />
              100 % gratuits · sans inscription
            </span>
            <h2 className="text-display text-xl md:text-3xl xl:text-4xl text-foreground text-balance mt-1">
              <span className="gradient-text">13 outils</span> — tous gratuits, tous utiles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Accessibles sans inscription, sans limite de temps.</p>
          </div>
        </div>
        {/* Grille groupée par catégorie — 5 groupes avec en-tête coloré */}
        <div className="flex flex-col gap-6">
          {TOOL_CATEGORIES.map(({ id, label, icon: CatIcon, color, bg, border, desc: catDesc }) => {
            const tools = TOOLS.filter(t => t.category === id);
            return (
              <div key={id}>
                {/* En-tête de catégorie */}
                <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3', bg, border)}>
                  <CatIcon className={cn('w-3.5 h-3.5 shrink-0', color)} aria-hidden="true" />
                  <span className={cn('text-xs font-extrabold uppercase tracking-wide', color)}>{label}</span>
                  <span className="text-xs text-muted-foreground font-medium hidden sm:inline">— {catDesc}</span>
                </div>
                {/* Cartes de la catégorie */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                  {tools.map(({ path, icon: Icon, label: toolLabel, desc, color: tc, bg: tbg }) => (
                    <Link key={path} to={path} onMouseEnter={() => prefetchRoute(path)} className="h-full flex">
                      <div className={cn(
                        'flex flex-col gap-2.5 p-3 md:p-4 rounded-2xl border bg-card w-full',
                        'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
                        'transition-[transform,border-color,box-shadow] duration-200 group cursor-pointer card-premium',
                      )}>
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110 shadow-sm', tbg)}>
                          <Icon className={cn('w-[17px] h-[17px]', tc)} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-bold text-foreground leading-snug mb-1 text-balance">{toolLabel}</p>
                          <p className="hidden md:block text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-2">{desc}</p>
                        </div>
                        <div className={cn('flex items-center gap-1 text-xs font-semibold mt-auto', tc)}>
                          <span className="truncate">Accéder</span>
                          <ArrowRight className="w-3 h-3 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ 4. COMMENT ÇA MARCHE — 3 étapes ══════════════════════════
          Après avoir vu les outils, l'utilisateur comprend comment y accéder. */}
      <section id="comment-ca-marche" aria-label="Comment fonctionne Apprenix">
        <div className="mb-6 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Zap className="w-3 h-3" aria-hidden="true" />
            Simple & rapide
          </span>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl text-foreground text-balance mt-1">
            Comment ça marche ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">3 étapes pour commencer — aucune carte bancaire requise.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, bg, bar }, i) => (
            <div key={step} className={cn(
              'relative flex flex-col items-start gap-3 p-5 rounded-2xl border bg-card card-premium',
              'hover:shadow-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-200 group',
            )}>
              {/* Trait coloré top */}
              <div className={cn('absolute top-0 left-4 right-4 h-[3px] rounded-full opacity-60', bar)} aria-hidden="true" />
              {/* Connecteur → entre étapes (desktop uniquement) */}
              {i < HOW_IT_WORKS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-border/70 hidden md:block z-10" aria-hidden="true" />
              )}
              <div className="flex items-center gap-3 w-full pt-1">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform duration-200 group-hover:scale-110', bg)}>
                  <Icon className={cn('w-6 h-6', color)} aria-hidden="true" />
                </div>
                <span className={cn('text-2xl md:text-3xl font-black leading-none tabular-nums', color)}>{step}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1.5 text-balance">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 5. POURQUOI APPRENIX — tableau comparatif ════════════════════ */}
      <section aria-label="Pourquoi choisir Apprenix plutôt qu'un concurrent">
        <div className="mb-5 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <Crown className="w-3 h-3" aria-hidden="true" />
            Comparatif 2026
          </span>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl font-black text-foreground text-balance mt-1">
            Apprenix vs les autres plateformes
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-xl">
            Ce que les autres ne font pas — ou font payer.
          </p>
        </div>

        {/* Tableau comparatif — desktop ; liste simplifiée — mobile */}
        <Card className="border border-border/60">
          <div className="md:hidden divide-y divide-border/40">
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} className={cn('px-4 py-3', i % 2 !== 0 ? 'bg-muted/10' : '')}>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground leading-snug">{row.feature}</p>
                    {row.detail && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed text-pretty">{row.detail}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block w-full overflow-x-auto" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <table className="w-full min-w-[540px] table-fixed" role="table" aria-label="Tableau comparatif Apprenix vs concurrents">
              <colgroup>
                <col style={{ width: '34%' }} /><col style={{ width: '13%' }} /><col style={{ width: '13%' }} /><col style={{ width: '13%' }} /><col style={{ width: '13%' }} /><col style={{ width: '14%' }} />
              </colgroup>
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th scope="col" className="text-left text-xs font-semibold text-muted-foreground px-3 py-2.5 whitespace-nowrap">Fonctionnalité</th>
                  {[{ label: 'Apprenix', isPrimary: true }, { label: 'ChatGPT', isPrimary: false }, { label: 'Quizlet', isPrimary: false }, { label: 'Brainly', isPrimary: false }, { label: 'Khan', isPrimary: false }].map(({ label, isPrimary }) => (
                    <th key={label} scope="col" className="text-center px-1 py-2.5 whitespace-nowrap">
                      {isPrimary
                        ? <span className="inline-flex flex-col items-center gap-0.5"><Crown className="w-3.5 h-3.5 text-primary" aria-hidden="true" /><span className="text-xs font-black text-primary leading-none">{label}</span></span>
                        : <span className="text-xs font-semibold text-muted-foreground">{label}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={cn('border-b border-border/40', i % 2 !== 0 ? 'bg-muted/10' : '')}>
                    <td className="px-3 py-2.5 text-xs text-foreground font-medium leading-snug">{row.feature}</td>
                    <td className="px-1 py-2.5 text-center bg-primary/5"><CheckCircle className="w-4 h-4 text-primary mx-auto" aria-label="Disponible" role="img" /></td>
                    {(['chatgpt','quizlet','brainly','khan'] as const).map(p => {
                      const val = row[p];
                      return (
                        <td key={p} className="px-1 py-2.5 text-center">
                          {val === true      && <CheckCircle className="w-4 h-4 text-success mx-auto" aria-label="Disponible" role="img" />}
                          {val === 'partial' && <Minus className="w-4 h-4 text-warning mx-auto" aria-label="Partiel ou payant" role="img" />}
                          {val === false     && <X className="w-3.5 h-3.5 text-destructive/50 mx-auto" aria-label="Non disponible" role="img" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2.5 md:px-4 border-t border-border/40 bg-muted/20 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-primary" aria-hidden="true" /><strong className="text-foreground">Apprenix</strong></span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" aria-hidden="true" />Disponible</span>
            <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-warning" aria-hidden="true" />Partiel / payant</span>
            <span className="flex items-center gap-1"><X className="w-2.5 h-2.5 text-destructive/50" aria-hidden="true" />Absent</span>
          </div>
        </Card>
        <p className="mt-2 text-xs text-muted-foreground">Données vérifiées en juin 2026.</p>
      </section>

      {/* ══ 6. CONFIANCE — Avis · FAQ · Actualités ══════════════════════
          Ordre stratégique : avis (preuve sociale) → FAQ → actualités.
          FAQ en 2 cols sur mobile pour éviter 6 cartes empilées.       */}
      <section aria-label="Confiance — Avis, FAQ et actualités">

        {/* ── Avis communauté (en premier — preuve sociale immédiate) ── */}
        <div className="mb-5 section-divider pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            Ils utilisent Apprenix
          </span>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-display text-xl md:text-3xl font-extrabold text-foreground text-balance mt-1">
              Avis de la communauté
            </h2>
            <button type="button" onClick={() => setReviewDialogOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2 mt-1"
              aria-label="Laisser un avis">
              <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
              Laisser un avis
            </button>
          </div>
        </div>
        {reviews.length === 0 ? (
          <Card className="border-dashed border-2 border-border/40 mb-8">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">Aucun avis pour l'instant</p>
              <p className="text-sm text-muted-foreground text-pretty max-w-sm">Sois le premier à partager ton expérience !</p>
              <button type="button" onClick={() => setReviewDialogOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2">
                <PenLine className="w-4 h-4" aria-hidden="true" />
                Laisser le premier avis
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {reviews.slice(0, 3).map(review => (
              <CommentCard key={review.id} item={review} onLike={likeReview} variant="review" />
            ))}
          </div>
        )}

        {/* ── FAQ — 2 cols mobile / 3 cols desktop ── */}
        <div className="mb-5 section-divider pt-3">
          <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs font-semibold mb-2 flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5" aria-hidden="true" /> Questions fréquentes
          </Badge>
          <h2 className="text-display text-xl md:text-3xl xl:text-4xl text-foreground text-balance mt-1">
            Ce que se demandent <span className="gradient-text">parents & enseignants</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Tout ce que vous devez savoir avant de recommander Apprenix.</p>
        </div>
        {/* 2 colonnes mobile pour éviter 6 blocs empilés — 3 colonnes desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {([
            { q: "L'outil peut-il rédiger les devoirs à la place de mon enfant ?",         a: "Non. L'aide Apprenix fournit des fiches méthode étape par étape pour comprendre les concepts — jamais pour rédiger à la place.", Icon: Brain, color: 'text-chart-1', bg: 'bg-chart-1/10' },
            { q: 'Les contenus sont-ils alignés sur les programmes officiels ?',          a: 'Oui. Toutes les ressources sont vérifiées sur Éduscol et le B.O. Mises à jour chaque rentrée.', Icon: GraduationCap, color: 'text-chart-3', bg: 'bg-chart-3/10' },
            { q: 'Puis-je suivre la progression de mon enfant ?',                        a: 'Oui. Le tableau de bord affiche l\'activité, les révisions, les flashcards maîtrisées et les tâches en temps réel.', Icon: BarChart2, color: 'text-primary', bg: 'bg-primary/10' },
            { q: 'Mon enfant peut-il utiliser Apprenix dès le primaire ?',               a: 'Absolument. L\'espace Primaire (CP→CM2) propose une interface simplifiée, des fiches illustrées et la police adaptée à la dyslexie.', Icon: School, color: 'text-chart-2', bg: 'bg-chart-2/10' },
            { q: 'Apprenix est-il adapté aux élèves en difficulté ou ULIS ?',            a: 'Oui. Mode ULIS/SEGPA dédié : interface simplifiée, police dyslexie (OpenDyslexic), grands contrastes — conforme RGAA 4.1.', Icon: Heart, color: 'text-destructive', bg: 'bg-destructive/10' },
          ] as const).map(({ q, a, Icon, color, bg }) => (
            <Card key={q} className={cn(
              'h-full border-border/60 hover:border-chart-4/40',
              'hover:shadow-md hover:-translate-y-0.5',
              'transition-[transform,border-color,box-shadow] duration-200',
            )}>
              <CardContent className="p-4 flex flex-col gap-2.5 h-full">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground text-balance leading-snug pt-1">{q}</h3>
                </div>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed flex-1">{a}</p>
              </CardContent>
            </Card>
          ))}

          {/* Contact direct — 6e carte */}
          <Card className="h-full border-chart-4/30 bg-chart-4/5 hover:border-chart-4/50 transition-colors">
            <CardContent className="p-4 flex flex-col gap-3 h-full">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-chart-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-foreground text-balance leading-snug pt-1">
                  Comment contacter l'équipe ?
                </h3>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">Charly, le fondateur, répond personnellement à chaque message.</p>
              <div className="flex flex-col gap-2 mt-auto">
                <a href="https://wa.me/33667485226" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-success/10 border border-success/30 hover:bg-success/20 transition-colors group">
                  <span className="text-base leading-none" aria-hidden="true">💬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-success">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">+33 6 67 48 52 26 — réponse le jour même</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-success shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </a>
                <a href="mailto:apprenix.contact@gmail.com"
                  aria-label="Envoyer un email à apprenix.contact@gmail.com"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 hover:bg-primary/15 transition-colors group">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary">Email</p>
                    <p className="text-xs text-muted-foreground truncate">apprenix.contact@gmail.com</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Actualités Apprenix — lien vers la vraie page ── */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-chart-2 shrink-0" aria-hidden="true" />
            Actualités Apprenix
          </h3>
          <Link to="/actualites" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-75 transition-opacity">
            Tout voir <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
        <Link to="/actualites" className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-[border-color,box-shadow] duration-200 p-4 md:p-5">
          <div className="w-11 h-11 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-chart-2" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground text-balance">Éducation numérique & EdTech France</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {['Numérique & Éducation', 'Méthodes de révision', 'Deep Work', 'Bac 2026', 'RGPD & Sécurité'].map(tag => (
                <span key={tag} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-chart-2 group-hover:gap-2 transition-[gap] duration-150">
            <span className="hidden md:inline">Lire</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Link>
      </section>

      {/* ══ 7. TÉLÉCHARGER + CTA FINAL ════════════════════════════════
          PWA install + appel à l'action = une seule conclusion claire   */}
      <PwaInstallSection />

      <section
        className="relative rounded-2xl p-6 md:p-10 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--chart-1) / 0.07) 100%)', border: '1px solid hsl(var(--primary) / 0.20)' }}
        aria-label="Commencer avec Apprenix"
      >
        {/* Halos */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-chart-1/8 blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />
        {/* Grille pointillés */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="cta-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>
        {/* Diagonale */}
        <div className="absolute -top-8 left-1/4 w-px h-[130%] bg-current opacity-[0.06] rotate-[18deg] pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
            <Rocket className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Rejoindre 100 % gratuitement
          </span>
          <h2 className="text-display text-xl md:text-4xl xl:text-5xl text-foreground text-balance mb-3 leading-tight font-extrabold">
            Prêt à vraiment progresser ?<br className="hidden md:block" />
            <span className="gradient-text"> Apprenix t'attend.</span>
          </h2>
          <p className="text-base md:text-lg xl:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-lg mx-auto">
            13 outils pédagogiques alignés sur les programmes français — accessibles dès maintenant, sans créer de compte.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Link
              to="/espace"
              className="btn-cta inline-flex items-center justify-center gap-2.5 font-extrabold text-base rounded-2xl text-white shadow-xl hover:shadow-2xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 px-6 md:px-9 py-3.5 w-full md:w-auto min-h-[52px] overflow-hidden whitespace-nowrap"
              aria-label="Commencer à utiliser Apprenix gratuitement"
            >
              <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="truncate min-w-0">Commencer gratuitement</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
            <button type="button"
              onClick={() => setReviewDialogOpen(true)}
              className="h-13 px-6 text-sm font-semibold rounded-2xl border border-border/70 text-foreground hover:bg-primary/5 hover:border-primary/30 transition-[background-color,border-color] duration-150 inline-flex items-center justify-center gap-2 min-h-[52px]"
              aria-label="Laisser un avis sur Apprenix"
            >
              <PenLine className="w-4 h-4 shrink-0" aria-hidden="true" />
              Partager mon avis
            </button>
          </div>
        </div>
      </section>

      {/* ══ SEO — Contenu longue traîne ══════════════════════════════════
          Visible par tous + indexé par Google. Structure h2/h3/p optimisée.
          Mots-clés : aide devoirs gratuit, flashcards, révision bac, DYS.  */}
      <section aria-label="À propos d'Apprenix" className="border-t border-border/40 pt-8 space-y-5">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            Pourquoi Apprenix ?
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                Aide aux devoirs gratuite — toutes matières
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                L'assistant Apprenix répond à toutes tes questions scolaires pas à pas — mathématiques, français, histoire-géo, anglais, physique-chimie, SVT, philosophie, économie. Disponible 24h/24, sans pub, sans abonnement. Le <strong className="text-foreground">mode socratique</strong> te guide par des questions pour que tu comprennes vraiment, pas juste que tu recopies la réponse.
              </p>
              <Link to="/aide-ia" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2 mt-1">
                Essayer l'aide aux devoirs <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-chart-4 shrink-0" aria-hidden="true" />
                Flashcards — mémoriser 2× plus vite
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                La <strong className="text-foreground">répétition espacée</strong> (algorithme SM-2, le même qu'Anki) est la méthode de mémorisation la plus efficace validée par les neurosciences. Crée tes propres decks par matière ou choisis dans nos bibliothèques de cours, et révise au bon moment. Idéal pour préparer le Brevet, le Baccalauréat ou les examens universitaires.
              </p>
              <Link to="/flashcards" className="inline-flex items-center gap-1 text-xs font-semibold text-chart-4 hover:underline underline-offset-2 mt-1">
                Créer mes flashcards gratuites <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-chart-2 shrink-0" aria-hidden="true" />
                Révision Bac &amp; Brevet 2026 — fiches, annales, méthode
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Prépare le <strong className="text-foreground">Baccalauréat 2026</strong> et le <strong className="text-foreground">Brevet 2026</strong> avec des fiches de révision conformes aux programmes Éduscol, des annales corrigées et des fiches méthode par épreuve. Toutes spécialités : Maths, NSI, SES, HGGSP, Physique, Philo, Français, Grand Oral.
              </p>
              <div className="flex gap-3 mt-1 flex-wrap">
                <Link to="/bac-francais" className="inline-flex items-center gap-1 text-xs font-semibold text-chart-2 hover:underline underline-offset-2">Bac Français <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
                <Link to="/bac-philo" className="inline-flex items-center gap-1 text-xs font-semibold text-chart-2 hover:underline underline-offset-2">Bac Philo <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
                <Link to="/revision-bac-2026" className="inline-flex items-center gap-1 text-xs font-semibold text-chart-2 hover:underline underline-offset-2">Révision Bac 2026 <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-chart-1 shrink-0" aria-hidden="true" />
                Inclusion — élèves DYS, ULIS, SEGPA
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Apprenix est conçu pour <strong className="text-foreground">tous les élèves</strong>, y compris ceux en situation de handicap. Mode contraste élevé, texte agrandi, navigation clavier complète. Page inclusion : droits MDPH, formulaires PPS/PAP/PPRE, logiciels ANAE pour dyslexie, dyscalculie, dyspraxie. Conforme RGAA niveau AA.
              </p>
              <Link to="/inclusion" className="inline-flex items-center gap-1 text-xs font-semibold text-chart-1 hover:underline underline-offset-2 mt-1">
                Voir les outils d'inclusion <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-base font-extrabold text-foreground">Apprenix est vraiment gratuit — et voici pourquoi</h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Apprenix a été créé par <strong className="text-foreground">Charly Soudan</strong>, arrivé en France à 8 ans des Philippines, avec une conviction simple : chaque élève — peu importe son quartier, ses moyens ou sa situation de handicap — mérite les meilleurs outils éducatifs. <strong className="text-foreground">100 % gratuit, sans publicité, sans abonnement, sans données revendues.</strong> Les données sont hébergées en Union Européenne, conformément au RGPD.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/mission"         className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">Notre mission <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
              <Link to="/transparence"    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">Transparence RGPD <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
              <Link to="/enseignants"     className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">Espace enseignants <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
              <Link to="/methode-de-travail" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">Méthode de travail <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
              <Link to="/cours-maths-gratuit" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2">Cours maths gratuits <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
    {/* ── Dialog Laisser un avis ── */}
    <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
          <DialogDescription>Partagez votre expérience avec la communauté Apprenix.</DialogDescription>
        </DialogHeader>
        <ReviewForm onSubmit={(data) => { addReview(data); setReviewDialogOpen(false); }} />
      </DialogContent>
    </Dialog>

    </>
  );
};

// ─── Vue MEMBRE (connecté) ────────────────────────────────────────────────────
const DAILY_TIPS = [
  "Révisez vos flashcards le matin : la mémoire à long terme se consolide mieux après une nuit de sommeil.",
  "La technique Pomodoro (25 min de travail, 5 min de pause) améliore la concentration de 40 %.",
  "Relire ses notes dans les 24 h qui suivent un cours permet de retenir 80 % des informations.",
  "Expliquer un concept à voix haute — même seul — est la méthode de mémorisation la plus efficace.",
  "Varier les matières pendant une session de révision réduit la fatigue mentale et améliore la rétention.",
  "Préparez votre planning de révision la veille : 5 minutes d'organisation = 1 heure gagnée le lendemain.",
  "Désactivez les notifications pendant vos sessions Deep Work — chaque interruption coûte 23 minutes de concentration.",
];

const MemberView: React.FC = () => {
  const { level, profile, flashcards, todos, notes } = useApp();
  const category = getLevelCategory(level);
  const catLabel  = getLevelCategoryLabel(level);
  const firstName = profile.name.split(' ')[0];

  // Conseil rotatif basé sur le jour de l'année — change chaque jour
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip  = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];

  // Stats rapides
  const today = new Date().toISOString().split('T')[0];
  const dueCards    = flashcards.filter(c => c.nextReview <= today).length;
  const urgentTodos = todos.filter(t => !t.completed && t.dueDate && t.dueDate <= today).length;
  const totalNotes  = notes.length;

  return (
    <div className="min-w-0 space-y-5 md:space-y-7">

      {/* ── Hero membre personnalisé ── */}
      <section className="relative rounded-2xl overflow-hidden bg-hero-pattern animate-fade-up" aria-label={`Tableau de bord de ${firstName}`}>
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
          <GraduationCap className="absolute right-6 top-1/2 -translate-y-1/2 w-36 h-36 text-white opacity-[0.06] hidden md:block" />
        </div>
        <div className="relative z-10 px-5 py-5 md:px-8 md:py-7">
          {/* Ligne du haut */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="hero-badge animate-fade-up delay-50">
              <ApprenixLogo size={16} variant="icon" />
              <span className="font-bold text-sm text-white">Apprenix</span>
            </div>
            <span className="ml-auto hero-badge animate-fade-up delay-100">
              🎓 {catLabel}
            </span>
          </div>

          <h1 className="text-display text-xl md:text-3xl xl:text-4xl text-white mb-1.5 text-balance leading-tight animate-fade-up delay-200">
            Content de te revoir, <span className="text-white font-extrabold">{firstName}</span> ! 👋
          </h1>
          <p className="text-white text-base md:text-lg xl:text-xl mb-4 text-pretty max-w-md leading-relaxed animate-fade-up delay-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.20)]">
            Tes outils, flashcards et suivi de progression sont prêts.
          </p>

          {/* Stats rapides — visibles d'emblée */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: dueCards,    label: 'flashcard' + (dueCards !== 1 ? 's' : '') + ' à réviser', icon: CreditCard, urgent: dueCards > 0, path: '/flashcards' },
              { value: urgentTodos, label: 'tâche' + (urgentTodos !== 1 ? 's' : '') + ' urgente' + (urgentTodos !== 1 ? 's' : ''), icon: CheckCircle, urgent: urgentTodos > 0, path: '/organisation' },
              { value: totalNotes,  label: 'note' + (totalNotes !== 1 ? 's' : '') + ' sauvegardée' + (totalNotes !== 1 ? 's' : ''), icon: FileText, urgent: false, path: '/notes' },
            ].map(({ value, label, icon: StatIcon, urgent, path: statPath }) => (
              <Link key={label} to={statPath}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
                  urgent && value > 0
                    ? 'bg-warning/30 border-warning/50 text-white hover:bg-warning/40'
                    : 'bg-white/15 border-white/25 text-white/90 hover:bg-white/25',
                )}
              >
                <StatIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{value}</span>
                <span className="hidden sm:inline font-medium opacity-80">{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Link to="/espace" className="shrink-0">
              <Button className="w-full md:w-auto bg-white hover:bg-white/90 active:scale-95 font-bold h-10 px-6 shadow-lg text-sm rounded-xl transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-xl" style={{ color: 'hsl(var(--primary))' }}>
                <School className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                Mon espace {catLabel}
                <ArrowRight className="ml-1.5 w-4 h-4 shrink-0" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/motivation" className="shrink-0">
              <Button variant="ghost" className="w-full md:w-auto border-2 border-white/60 text-white hover:bg-white/15 hover:border-white active:scale-95 h-10 px-5 text-sm rounded-xl transition-[background-color,border-color,transform] duration-200">
                <Trophy className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                Ma progression
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Widget Révision du jour ── */}
      <RevisionDuJourWidget />

      {/* ── Conseil du jour (rotatif) ── */}
      <Card className="border-l-4 border-l-primary bg-primary/5 border-border/60">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary mb-0.5">Conseil du jour</p>
            <p className="text-sm text-foreground text-pretty leading-relaxed">{todayTip}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Mes outils — groupés par catégorie (même structure que VisitorView) ── */}
      <section aria-label="Tous les outils">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-base md:text-lg xl:text-xl font-bold text-foreground text-balance">Mes outils</h2>
          <Badge variant="secondary" className="text-xs shrink-0 font-semibold">13 gratuits</Badge>
        </div>
        <div className="flex flex-col gap-5">
          {TOOL_CATEGORIES.map(({ id, label, icon: CatIcon, color, bg, border }) => {
            const catTools = TOOLS.filter(t => t.category === id);
            return (
              <div key={id}>
                <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3', bg, border)}>
                  <CatIcon className={cn('w-3.5 h-3.5 shrink-0', color)} aria-hidden="true" />
                  <span className={cn('text-xs font-extrabold uppercase tracking-wide', color)}>{label}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                  {catTools.map(({ path, icon: Icon, label: toolLabel, color: tc, bg: tbg }) => (
                    <Link key={path} to={path} onMouseEnter={() => prefetchRoute(path)} className="h-full flex">
                      <Card className="h-full card-hover card-glow cursor-pointer group border-border/60 w-full">
                        <CardContent className="p-3 md:p-4 flex flex-col gap-2.5 h-full">
                          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0', tbg)}>
                            <Icon className={cn('w-4 h-4', tc)} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-foreground text-balance leading-snug">{toolLabel}</h3>
                          </div>
                          <div className={cn('flex items-center gap-1 text-xs font-bold mt-auto', tc)}>
                            Accéder <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
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
      </section>

    </div>
  );
};

// ─── Page d'accueil principale ────────────────────────────────────────────────
const AccueilPage: React.FC = () => {
  const { isAuthenticated, authReady, profileReady, level } = useApp();
  const navigate = useNavigate();

  // Auto-redirect : un utilisateur connecté n'a pas besoin de la page marketing
  // On attend profileReady pour rediriger vers le BON niveau (pas le défaut '2nde')
  useEffect(() => {
    if (authReady && isAuthenticated && profileReady) {
      navigate(`/espace/${getLevelCategory(level)}`, { replace: true });
    }
  }, [authReady, isAuthenticated, profileReady, level, navigate]);

  // Pendant le chargement d'un utilisateur connecté → spinner (évite le flash de la page marketing)
  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Apprenix — Aide scolaire gratuite, Flashcards & Méthode 100% gratuits"
        description="Aide aux devoirs, flashcards et révision gratuits du CP au Bac+5. Zéro pub, zéro abonnement. Pour élèves, parents, enseignants et DYS."
        canonical="/"
        keywords="plateforme éducative gratuite, aide aux devoirs gratuite, fiches méthode scolaire, révision scolaire gratuite, flashcards gratuits, lycée collège université, Apprenix, bac 2026, brevet 2026, apprendre gratuitement, DYS inclusion, enseignants ressources, alternative Skolengo, alternative Pronote gratuit"
        dateModified="2026-06-18"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Apprenix',
          'applicationCategory': 'EducationApplication',
          'operatingSystem': 'Web, iOS, Android, Windows, macOS',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR' },
          'description': 'Plateforme éducative 100% gratuite du CP à la fac.' }}
      />
      <VisitorView />
    </>
  );
};

export default AccueilPage;
