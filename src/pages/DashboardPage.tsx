import {Activity, ArrowRight, BarChart3, BookOpen, Calendar, CheckCircle, CheckCircle2, CheckSquare, Circle,
  Clock,
  Flame, GraduationCap, Lock,
  MapPin, Plus, Quote, RefreshCw, ScanLine,
  Star,
  Target, Trash2, TrendingUp, Trophy, Users, Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ENBadge from '@/components/ui/ENBadge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import { MOTIVATION_QUOTES } from '@/lib/quotes';
import type { AiHistoryItem } from '@/types/types';

// ─── Suivi de révision — onglet dédié ─────────────────────────────────────────
const STORAGE_SUIVI_BASE = 'apprenix-suivi-revision';

interface ChapterEntry { id: string; subject: string; chapter: string; done: boolean; }

const SuiviRevisionTab: React.FC = () => {
  const { level, profile } = useApp();
  const subjects = getSubjectsForLevel(level);
  // Clé namespaced par userId → évite le mélange de données entre comptes
  const STORAGE_SUIVI = `${STORAGE_SUIVI_BASE}-${profile.id || 'guest'}`;

  const [entries, setEntries] = useState<ChapterEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_SUIVI) ?? '[]'); } catch { return []; }
  });
  const [selSubject, setSelSubject] = useState<string>(subjects[0] ?? '');
  const [chapter, setChapter]       = useState('');

  // Persistence auto — useEffect car c'est un side-effect (pas un calcul)
  useEffect(() => { localStorage.setItem(STORAGE_SUIVI, JSON.stringify(entries)); }, [entries, STORAGE_SUIVI]);

  const add = () => {
    if (!chapter.trim() || !selSubject) return;
    setEntries(prev => [...prev, { id: Date.now().toString(), subject: selSubject, chapter: chapter.trim(), done: false }]);
    setChapter('');
  };

  const toggle = (id: string) => setEntries(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e));
  const remove  = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  // Stats par matière
  const statsBySubject = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    entries.forEach(e => {
      if (!map[e.subject]) map[e.subject] = { total: 0, done: 0 };
      map[e.subject].total++;
      if (e.done) map[e.subject].done++;
    });
    return Object.entries(map).map(([subject, v]) => ({ subject, ...v, pct: Math.round((v.done / v.total) * 100) }));
  }, [entries]);

  const totalDone  = entries.filter(e => e.done).length;
  const totalCount = entries.length;
  const globalPct  = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0;

  // Grouper par matière pour affichage
  const grouped = useMemo(() => {
    const map: Record<string, ChapterEntry[]> = {};
    entries.forEach(e => { if (!map[e.subject]) map[e.subject] = []; map[e.subject].push(e); });
    return map;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Barre globale */}
      {totalCount > 0 && (
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Progression globale</p>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{globalPct}%</Badge>
            </div>
            <Progress value={globalPct} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{totalDone}/{totalCount} chapitres révisés</p>
          </CardContent>
        </Card>
      )}

      {/* Formulaire ajout */}
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Ajouter un chapitre à réviser</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selSubject} onValueChange={setSelSubject}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Matière" /></SelectTrigger>
              <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <input
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Nom du chapitre..."
              className="col-span-1 md:col-span-1 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button onClick={add} disabled={!chapter.trim() || !selSubject} className="h-10 bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats par matière */}
      {statsBySubject.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statsBySubject.map(s => (
            <Card key={s.subject} className="shadow-card">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-foreground truncate mb-1">{s.subject}</p>
                <Progress value={s.pct} className="h-2 mb-1" />
                <p className="text-sm text-muted-foreground">{s.done}/{s.total} · {s.pct}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Liste par matière */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(grouped).map(([subject, chapters]) => (
            <Card key={subject} className="shadow-card">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {subject}
                  <Badge variant="outline" className="text-xs ml-auto">
                    {chapters.filter(c => c.done).length}/{chapters.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {chapters.map(ch => (
                  <div key={ch.id} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${ch.done ? 'bg-success/5 border-success/20' : 'bg-card border-border'}`}>
                    <Checkbox checked={ch.done} onCheckedChange={() => toggle(ch.id)} className="shrink-0" />
                    <span className={`text-sm flex-1 min-w-0 truncate ${ch.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{ch.chapter}</span>
                    {ch.done && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                    <button type="button" onClick={() => remove(ch.id)} className="text-muted-foreground hover:text-destructive shrink-0 p-0.5" aria-label="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Circle className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucun chapitre ajouté — commencez votre suivi de révision.</p>
        </div>
      )}
    </div>
  );
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const XP_LEVELS = [
  { level: 1, name: 'Débutant',  minXp: 0,    icon: '🌱' },
  { level: 2, name: 'Apprenti',  minXp: 200,  icon: '📚' },
  { level: 3, name: 'Étudiant',  minXp: 500,  icon: '🎓' },
  { level: 4, name: 'Érudit',    minXp: 1000, icon: '🔬' },
  { level: 5, name: 'Expert',    minXp: 2000, icon: '⭐' },
  { level: 6, name: 'Maître',    minXp: 3500, icon: '🏆' },
  { level: 7, name: 'Légende',   minXp: 5000, icon: '🌟' },
];

const STREAK_CALENDAR_DAYS = 30;

const buildChartFromHistory = (aiHistory: AiHistoryItem[], days: number) => {
  const labels = days <= 7
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : Array.from({ length: days }, (_, i) => `J-${days - i}`);
  return labels.map((day, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (days - 1 - i));
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayItems = aiHistory.filter(h => h.createdAt?.startsWith(dateStr));
    return { day, Sessions: dayItems.length };
  });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6)  return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

// ─── Tableau de bord fusionné ─────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const {
    profile, setProfile, todos, toggleTodo, challenges, completeChallenge, recentActivity,
    badges, addXp, aiHistory, quests, completeQuestMission, flashcards,
    notes, pomodoroSessions, revisionSessions,
  } = useApp();

  const [chartPeriod, setChartPeriod] = useState<7 | 30>(7);
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDay() % MOTIVATION_QUOTES.length);

  // ── Calculs mémoïsés pour éviter les re-calculs inutiles ───────────────────
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const xpPoints      = profile.xpPoints;
  const currentLevelData = useMemo(() => [...XP_LEVELS].reverse().find(l => xpPoints >= l.minXp) || XP_LEVELS[0], [xpPoints]);
  const nextLevelData = useMemo(() => XP_LEVELS.find(l => l.minXp > xpPoints), [xpPoints]);
  const xpToNext      = nextLevelData ? nextLevelData.minXp - xpPoints : 0;
  const xpProgress    = nextLevelData
    ? ((xpPoints - currentLevelData.minXp) / (nextLevelData.minXp - currentLevelData.minXp)) * 100
    : 100;
  const currentLevel  = currentLevelData.level;

  const pendingTodos    = useMemo(() => todos.filter(t => !t.completed).slice(0, 4), [todos]);
  const completedTodos  = useMemo(() => todos.filter(t => t.completed).length, [todos]);
  const dailyChallenges = useMemo(() => challenges.filter(c => c.type === 'daily'), [challenges]);
  const weeklyChallenges = useMemo(() => challenges.filter(c => c.type === 'weekly'), [challenges]);
  const todayQuote      = MOTIVATION_QUOTES[quoteIndex];
  const greeting        = getGreeting();
  const streakDays      = profile.streakDays;
  const streakClaimedToday = profile.lastActiveDate === today;

  // ── Statistiques enrichies mémoïsées ───────────────────────────────────────
  const totalPomodoro    = useMemo(() => pomodoroSessions.reduce((acc, s) => acc + s.sessionCount, 0), [pomodoroSessions]);
  const totalNotes       = notes.length;
  const totalFlashcardsStudied = useMemo(() => flashcards.filter(f => f.nextReview > today).length, [flashcards, today]);
  const completedChallenges = useMemo(() => challenges.filter(c => c.completed).length, [challenges]);
  const completedRevisions  = useMemo(() => revisionSessions.filter(r => r.completed).length, [revisionSessions]);

  const handleMaintainStreak = () => {
    // La série est maintenue automatiquement à l'ouverture de l'app (AppContext)
    // Cette fonction est conservée pour compatibilité mais ne fait plus rien manuellement
    void 0;
  };

  const calendarDays = useMemo(() => Array.from({ length: STREAK_CALENDAR_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (STREAK_CALENDAR_DAYS - 1 - i));
    return { date: d.getDate(), isActive: i >= STREAK_CALENDAR_DAYS - streakDays, isToday: i === STREAK_CALENDAR_DAYS - 1 };
  }), [streakDays]);

  const chartData    = useMemo(() => buildChartFromHistory(aiHistory, chartPeriod), [aiHistory, chartPeriod]);
  const hasChartData = aiHistory.length > 0;

  const topSubjects = useMemo(() => {
    const subjectCounts: Record<string, number> = {};
    for (const item of aiHistory) {
      if (item.subject) subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
    }
    return Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([subject, count]) => ({ subject, count }));
  }, [aiHistory]);
  const maxCount      = topSubjects[0]?.count || 1;
  const { subjectCounts, predSubjects } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of aiHistory) {
      if (item.subject) counts[item.subject] = (counts[item.subject] || 0) + 1;
    }
    return { subjectCounts: counts, predSubjects: Object.keys(counts).slice(0, 6) };
  }, [aiHistory]);

  // ── Prédiction enrichie : XP + streaks + flashcards + notes + pomodoro + défis ──
  const getPrediction = (subject: string) => {
    const aiCount      = subjectCounts[subject] || 0;
    const xpBonus      = Math.min(30, Math.round(xpPoints / 100));
    const streakBonus  = Math.min(15, streakDays * 2);
    const flashBonus   = Math.min(20, totalFlashcardsStudied * 2);
    const noteBonus    = Math.min(10, totalNotes);
    const pomodoroBonus = Math.min(15, totalPomodoro);
    const challengeBonus = Math.min(10, completedChallenges);
    const revisionBonus  = Math.min(10, completedRevisions);
    return Math.min(100, Math.round(aiCount * 12 + xpBonus + streakBonus + flashBonus + noteBonus + pomodoroBonus + challengeBonus + revisionBonus));
  };

  // ── Classement XP par paliers — transparent, basé sur votre propre progression ──
  const XP_MILESTONES = [
    { label: 'Palier Légende',  threshold: 5000 },
    { label: 'Palier Maître',   threshold: 3500 },
    { label: 'Palier Expert',   threshold: 2000 },
    { label: 'Palier Érudit',   threshold: 1000 },
    { label: 'Palier Étudiant', threshold: 500  },
    { label: 'Palier Apprenti', threshold: 200  },
    { label: 'Palier Débutant', threshold: 0    },
  ];
  const myMilestoneRank = XP_MILESTONES.findIndex(m => xpPoints >= m.threshold);
  const milestoneAbove  = myMilestoneRank > 0 ? XP_MILESTONES[myMilestoneRank - 1] : null;
  const xpToNextMilestone = milestoneAbove ? milestoneAbove.threshold - xpPoints : 0;
  const currentMilestone  = XP_MILESTONES[Math.max(myMilestoneRank, 0)];

  // Paliers affichés dans le classement (les 3 au-dessus + le vôtre)
  const MILESTONE_RANKS = XP_MILESTONES.map((m, i) => ({
    rank:       i + 1,
    label:      m.label,
    threshold:  m.threshold,
    isUnlocked: xpPoints >= m.threshold,
    isYou:      m.label === currentMilestone?.label,
    badge:      i === 0 ? '1.' : i === 1 ? '2.' : i === 2 ? '3.' : `${i + 1}.`,
  }));

  const priorityColor = (p: string) => {
    if (p === 'high')   return 'bg-destructive/10 text-destructive border-destructive/20';
    if (p === 'medium') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-success/10 text-success border-success/20';
  };
  const priorityLabel = (p: string) => ({ high: 'Urgent', medium: 'Moyen', low: 'Faible' }[p] ?? '');

  return (
    <div className="min-w-0 space-y-6">
      <SEO
        title="Mon Tableau de Bord — Progression, XP & Statistiques | Apprenix"
        description="Suivez votre progression : XP, streaks, badges et statistiques détaillées. Visualisez vos efforts et restez motivé. Gratuit, sans abonnement."
        canonical="/tableau-de-bord"
        keywords="tableau de bord étudiant apprenix, suivi progression scolaire, streak révision, points XP scolaire, statistiques révision, planning semaine étudiant, badges scolaires"
        dateModified="2026-06-20"
      />
      {/* ── Hero Dashboard — style moderne avec cercles déco ── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 60%, #1a4a72 100%)' }}
        aria-label="Résumé de progression — série, XP et niveau"
      >
        {/* Cercles décoratifs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-8 w-36 h-36 rounded-full bg-white/8" />
          <div className="absolute top-1/2 -translate-y-1/2 right-20 w-20 h-20 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Gauche */}
            <div className="min-w-0">
              <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-white text-balance leading-tight mb-1">
                {greeting}, <span className="font-extrabold">{profile.name}</span> ! 👋
              </h1>
              <p className="text-white/90 text-sm md:text-base flex items-center gap-1.5 flex-wrap">
                <GraduationCap className="w-4 h-4 shrink-0" />
                Niveau : <span className="font-bold text-white ml-0.5">{profile.schoolLevel}</span>
                <ENBadge className="ml-1 bg-white/20 text-white border-white/30 dark:bg-white/20 dark:text-white dark:border-white/30" />
              </p>
            </div>
            {/* Droite — stats XP en pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: streakDays, label: 'Série' },
                { value: xpPoints,   label: 'XP total' },
                { value: currentLevelData.icon, label: `Niv. ${currentLevel}` },
              ].map(({ value, label }) => (
                <div key={label} className="text-center px-4 py-2 rounded-xl bg-white/15 border border-white/20 min-w-[60px]">
                  <p className="text-xl md:text-2xl font-extrabold text-white leading-none">{value}</p>
                  <p className="text-xs text-white/70 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Barre XP */}
          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>Progression vers le niveau {nextLevelData ? currentLevel + 1 : currentLevel}</span>
              <span className="font-semibold text-white">
                {nextLevelData ? `${xpToNext} XP restants` : 'Niveau maximum atteint'}
              </span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full transition-[width] duration-700" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Accès rapide aux outils — grille 3×3 ── */}
      <section aria-label="Accès rapide aux outils">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            Mes outils
          </h2>
          <Link to="/espace" className="text-xs font-medium text-primary hover:opacity-75 transition-opacity flex items-center gap-1">
            Tout explorer <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {([
            { path: '/aide-ia',         Icon: Star,           label: 'Devoirs',        color: 'text-chart-1', bg: 'bg-chart-1/10' },
            { path: '/scanner',         Icon: ScanLine,       label: 'Scanner',        color: 'text-chart-2', bg: 'bg-chart-2/10' },
            { path: '/flashcards',      Icon: BookOpen,       label: 'Flashcards',     color: 'text-chart-4', bg: 'bg-chart-4/10' },
            { path: '/organisation',    Icon: Calendar,       label: 'Planning',       color: 'text-primary', bg: 'bg-primary/10'  },
            { path: '/notes',           Icon: MapPin,         label: 'Notes',          color: 'text-chart-3', bg: 'bg-chart-3/10' },
            { path: '/maths-sciences',  Icon: Activity,       label: 'Maths',          color: 'text-chart-5', bg: 'bg-chart-5/10' },
            { path: '/linguistique',    Icon: TrendingUp,     label: 'Linguistique',   color: 'text-chart-1', bg: 'bg-chart-1/10' },
            { path: '/focus',           Icon: Target,         label: 'Focus',          color: 'text-chart-2', bg: 'bg-chart-2/10' },
            { path: '/ressources',      Icon: BarChart3,      label: 'Ressources',     color: 'text-chart-3', bg: 'bg-chart-3/10' },
          ] as const).map(({ path, Icon, label, color, bg }) => (
            <Link key={path} to={path} className="group">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-muted/40 hover:-translate-y-0.5 transition-[transform,border-color,background-color] duration-150 cursor-pointer text-center">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:scale-110', bg)}>
                  <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Mode Parents → /parents-espace ── */}
      <Card className="border border-border/60">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-chart-3" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Mode Parents</p>
              <p className="text-sm text-muted-foreground leading-snug">Générez un code depuis votre profil</p>
            </div>
          </div>
          <Link to="/parents-espace" className="shrink-0">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 whitespace-nowrap">
              <ArrowRight className="w-3.5 h-3.5" />
              Espace parents
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ── 4 métriques ── */}
      <div className="grid grid-cols-2 gap-3" role="list" aria-label="Métriques de progression">
        <Card className="h-full card-hover border-border/60" role="listitem">
          <CardContent className="p-3 flex flex-col gap-1" aria-label={`Série : ${streakDays} jours consécutifs`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Série</span>
              <Flame className="w-3.5 h-3.5 text-chart-1" aria-hidden="true" />
            </div>
            <span className="text-display text-lg font-extrabold text-foreground">{streakDays}</span>
            <span className="text-xs text-muted-foreground">jours consécutifs</span>
          </CardContent>
        </Card>
        <Card className="h-full card-hover border-border/60" role="listitem">
          <CardContent className="p-3 flex flex-col gap-1" aria-label={`XP total : ${xpPoints}, ${xpToNext} XP pour le niveau ${currentLevel + 1}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">XP</span>
              <Zap className="w-3.5 h-3.5 text-chart-4" aria-hidden="true" />
            </div>
            <span className="text-display text-lg font-extrabold text-foreground">{xpPoints}</span>
            <Progress value={xpProgress} className="h-1.5" aria-label={`Progression XP : ${xpProgress}%`} />
            <span className="text-xs text-muted-foreground">{nextLevelData ? `encore ${xpToNext} XP pour ${nextLevelData.name}` : '🌟 Niveau max'}</span>
          </CardContent>
        </Card>
        <Card className="h-full card-hover border-border/60" role="listitem">
          <CardContent className="p-3 flex flex-col gap-1" aria-label={`Tâches : ${completedTodos} terminées sur ${todos.length}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tâches</span>
              <CheckSquare className="w-3.5 h-3.5 text-chart-2" aria-hidden="true" />
            </div>
            <span className="text-display text-lg font-extrabold text-foreground">{completedTodos}/{todos.length}</span>
            <Progress value={todos.length ? (completedTodos / todos.length) * 100 : 0} className="h-1.5" aria-label={`${todos.length ? Math.round((completedTodos / todos.length) * 100) : 0}% des tâches terminées`} />
            <Link to="/organisation" className="text-xs text-primary flex items-center gap-1 mt-auto pt-1">Gérer <ArrowRight className="w-3 h-3" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
        <Card className="h-full card-hover border-border/60" role="listitem">
          <CardContent className="p-3 flex flex-col gap-1" aria-label={`Défis du jour : ${dailyChallenges.filter(c => c.completed).length} sur ${dailyChallenges.length} complétés`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Défis</span>
              <Trophy className="w-3.5 h-3.5 text-chart-5" aria-hidden="true" />
            </div>
            <span className="text-display text-lg font-extrabold text-foreground">
              {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
            </span>
            <span className="text-xs text-muted-foreground">défis du jour</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Progression par paliers XP ── */}
      <Card className="border border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-chart-4" />
              Votre progression XP
            </CardTitle>
            <Badge variant="outline" className="text-xs border-chart-4/30 text-chart-4 bg-chart-4/10">
              Paliers réels
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Débloquez chaque palier en accumulant des XP — 100% basé sur votre activité réelle.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {MILESTONE_RANKS.map(m => (
            <div
              key={m.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                m.isYou
                  ? 'bg-primary/10 border border-primary/20'
                  : m.isUnlocked
                  ? 'bg-success/5 border border-success/20'
                  : 'bg-muted/30'
              }`}
            >
              <span className="text-sm w-6 text-center shrink-0">{m.badge}</span>
              <span className={`text-sm font-medium flex-1 min-w-0 truncate ${
                m.isYou ? 'text-primary font-bold' : m.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {m.label}
                {m.isYou && <span className="ml-1 text-xs text-primary font-normal">(vous)</span>}
              </span>
              <span className={`text-xs font-semibold shrink-0 ${m.isUnlocked ? 'text-success' : 'text-muted-foreground'}`}>
                {m.threshold === 0 ? 'Départ' : `${m.threshold} XP`}
                {m.isUnlocked && ' ✓'}
              </span>
            </div>
          ))}
          {milestoneAbove && (
            <div className="pt-2 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Encore <span className="font-bold text-primary">{xpToNextMilestone} XP</span> pour atteindre <span className="font-semibold">{milestoneAbove.label}</span>
              </p>
            </div>
          )}
          <div className="pt-1 flex flex-col gap-2">
            <Link to="/communaute" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Voir la communauté
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Button>
            </Link>
            <Link to="/motivation" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs text-chart-4 border-chart-4/30 hover:bg-chart-4/10 gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Ma progression complète
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Onglets principaux ── */}
      <Tabs defaultValue="today">
        <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="w-max min-w-full flex gap-0">
            <TabsTrigger value="today"      className="shrink-0 text-xs whitespace-nowrap px-3">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="progress"   className="shrink-0 text-xs whitespace-nowrap px-3">Progression</TabsTrigger>
            <TabsTrigger value="suivi"      className="shrink-0 text-xs whitespace-nowrap px-3">Mes chapitres</TabsTrigger>
            <TabsTrigger value="quests"     className="shrink-0 text-xs whitespace-nowrap px-3">Quêtes</TabsTrigger>
            <TabsTrigger value="prediction" className="shrink-0 text-xs whitespace-nowrap px-3">Maîtrise par matière</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Onglet Aujourd'hui ── */}
        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">📋 Aujourd'hui — tes tâches, défis et activité récente</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Coche tes tâches au fur et à mesure, valide tes défis du jour pour gagner des XP, et suis ce que tu as fait récemment sur Apprenix.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Tâches */}
            <Card className="h-full flex flex-col border-border/60">
              <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" /> Prochaines tâches
                  </CardTitle>
                  <Link to="/organisation">
                    <Button variant="ghost" size="sm" className="h-9 text-xs text-primary">Tout voir <ArrowRight className="w-3 h-3 ml-1" /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col flex-1 space-y-2">
                {pendingTodos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <CheckSquare className="w-8 h-8 text-success mx-auto mb-2 opacity-60" />
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Toutes les tâches sont faites !</p>
                  </div>
                ) : (
                  <>
                    {pendingTodos.map(todo => (
                      <div key={todo.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-secondary/50 transition-colors">
                        <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground truncate block font-medium">{todo.title}</span>
                          {todo.dueDate && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {new Date(todo.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <Badge className={`text-xs shrink-0 ${priorityColor(todo.priority)}`}>{priorityLabel(todo.priority)}</Badge>
                      </div>
                    ))}
                    {todos.filter(t => !t.completed).length > 4 && (
                      <p className="text-sm text-muted-foreground text-center pt-1">+{todos.filter(t => !t.completed).length - 4} autre(s)</p>
                    )}
                  </>
                )}
                <div className="mt-auto pt-2">
                  <Link to="/organisation">
                    <Button variant="outline" size="sm" className="w-full h-9 text-xs rounded-xl">+ Ajouter une tâche</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Défis + Citation */}
            <div className="space-y-4 flex flex-col">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-chart-4" /> Défis du jour
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {dailyChallenges.slice(0, 2).map(ch => (
                    <div key={ch.id} className={`p-3 rounded-xl border transition-colors ${ch.completed ? 'bg-success/5 border-success/30' : 'bg-secondary border-border/60'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{ch.description}</p>
                          <Badge className="mt-1.5 text-xs bg-chart-4/10 text-chart-4 border-chart-4/20">+{ch.xpReward} XP</Badge>
                        </div>
                        {ch.completed ? (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0">✓</Badge>
                        ) : (
                          <Button size="sm" className="h-9 text-xs shrink-0 bg-primary text-primary-foreground rounded-xl" onClick={() => completeChallenge(ch.id)}>
                            Valider
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Citation */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex items-start justify-between gap-2 w-full min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm italic text-foreground text-pretty leading-relaxed">"{todayQuote.text}"</p>
                        <p className="text-sm text-muted-foreground mt-1.5 font-medium">— {todayQuote.author}</p>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="Nouvelle citation" className="h-9 w-9 shrink-0" onClick={() => setQuoteIndex(i => (i + 1) % MOTIVATION_QUOTES.length)}>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activité récente */}
          {recentActivity.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" /> Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {recentActivity.slice(0, 6).map((act, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-sm text-muted-foreground text-pretty">{act}</p>
                      </div>
                      {i < Math.min(recentActivity.length, 6) - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Onglet Progression ── */}
        <TabsContent value="progress" className="space-y-6 mt-4">
          {/* Bandeau */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-4/5 border border-chart-4/20">
            <TrendingUp className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">📈 Ta progression globale</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Ici tu vois ton niveau XP, tes badges débloqués et ton calendrier de révision. Plus tu utilises Apprenix, plus ta progression augmente !</p>
            </div>
          </div>
          {/* Niveau XP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl md:text-2xl xl:text-3xl shrink-0">{currentLevelData.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-display text-lg text-foreground">Niv. {currentLevelData.level} — {currentLevelData.name}</h2>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{xpPoints} XP</Badge>
                    </div>
                    <Progress value={xpProgress} className="h-3 mb-1" />
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                      {nextLevelData ? `${xpToNext} XP pour atteindre ${nextLevelData.name}` : 'Niveau maximum atteint.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Flame className="w-8 h-8 text-chart-1" />
                <span className="text-display text-xl md:text-3xl xl:text-4xl text-foreground">{streakDays}</span>
                <span className="text-sm text-muted-foreground leading-relaxed text-pretty">jours consécutifs</span>
                <div className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-chart-1/10 border border-chart-1/20 py-2 px-3">
                  <Flame className="w-3.5 h-3.5 text-chart-1 shrink-0" />
                  <span className="text-xs font-medium text-chart-1">
                    {streakClaimedToday ? 'Série maintenue aujourd\'hui ✓' : 'Revenez demain pour continuer'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendrier streak */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-chart-1" /> Calendrier des 30 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                {calendarDays.map((d, i) => (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${d.isToday ? 'ring-2 ring-primary' : ''} ${d.isActive ? 'bg-chart-1 text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {d.date}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Graphique */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Activité — sessions de travail
                </CardTitle>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {([7, 30] as const).map(p => (
                    <button type="button" key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1 text-xs font-medium transition-colors ${chartPeriod === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>{p}j</button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {hasChartData ? (
                <div className="w-full min-w-0 overflow-hidden h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Utilisez l'aide aux devoirs pour voir votre graphique.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Badges
                <Badge variant="secondary" className="text-xs ml-auto">{badges.filter(b => b.unlocked).length}/{badges.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className={`p-3 rounded-xl border text-center transition-[background-color,border-color,opacity,filter] ${badge.unlocked ? 'bg-card border-primary/30' : 'bg-secondary border-border/60 opacity-50 grayscale'}`}>
                    <div className="text-2xl md:text-3xl xl:text-4xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-semibold text-foreground text-balance">{badge.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{badge.description}</p>
                    {badge.unlocked && <Badge className="text-xs bg-success/10 text-success border-success/20 mt-1">✓</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top matières */}
          {topSubjects.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Top matières — questions posées
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2.5">
                {topSubjects.map(({ subject, count }, i) => (
                  <div key={subject} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 shrink-0 ${i === 0 ? 'text-chart-4' : 'text-muted-foreground'}`}>{i + 1}</span>
                    <span className="text-sm text-foreground w-24 shrink-0 truncate">{subject}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-[width]" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">{count}q</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Défis hebdomadaires */}
          {weeklyChallenges.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-chart-4" /> Défis de la semaine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {weeklyChallenges.map(ch => (
                  <div key={ch.id} className={`p-3 rounded-xl border ${ch.completed ? 'bg-success/5 border-success/20' : 'bg-secondary border-border/60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{ch.description}</p>
                        <Badge className="mt-1.5 text-xs bg-chart-4/10 text-chart-4 border-chart-4/20">+{ch.xpReward} XP</Badge>
                      </div>
                      {ch.completed ? (
                        <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0">✓</Badge>
                      ) : (
                        <Button size="sm" className="h-9 text-xs shrink-0 rounded-xl" onClick={() => completeChallenge(ch.id)}>Valider</Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Onglet Quêtes ── */}
        <TabsContent value="quests" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-5/5 border border-chart-5/20">
            <Trophy className="w-5 h-5 text-chart-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">🗺️ Quêtes — missions progressives</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Chaque quête est une liste d'étapes à valider une par une. Clique sur <strong>"Valider"</strong> quand tu as accompli une étape. Les étapes se débloquent dans l'ordre.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Complète des missions pour débloquer des récompenses XP et des badges. Chaque quête est composée d'étapes progressives — valide chaque étape au fur et à mesure.</p>
          {quests.map(quest => {
            const completedCount = quest.missions.filter(m => m.completed).length;
            const totalCount = quest.missions.length;
            const pct = Math.round((completedCount / totalCount) * 100);
            const isComplete = completedCount === totalCount;
            return (
              <Card key={quest.id} className={`border-border/60 ${isComplete ? 'border-success/30 bg-success/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base text-balance">{quest.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{quest.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">+{quest.xpReward} XP</Badge>
                      {isComplete && <Badge className="bg-success/10 text-success border-success/20 text-xs">✓</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{completedCount}/{totalCount} missions</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    {quest.missions.map((mission, idx) => {
                      const unlocked = idx === 0 || quest.missions[idx - 1].completed;
                      return (
                        <div key={mission.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${mission.completed ? 'bg-success/5 border-success/20' : unlocked ? 'bg-card border-border/60 hover:bg-secondary' : 'bg-muted/30 border-border opacity-60'}`}>
                          <div className="shrink-0">
                            {mission.completed ? <CheckCircle className="w-4 h-4 text-success" />
                              : unlocked ? <MapPin className="w-4 h-4 text-primary" />
                              : <Lock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <span className="flex-1 min-w-0 text-sm text-foreground">{mission.title}</span>
                          {!mission.completed && unlocked && (
                            <Button size="sm" className="h-9 text-xs px-3 shrink-0 rounded-lg" onClick={() => completeQuestMission(quest.id, mission.id)}>Valider</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── Onglet Prédiction ── */}
        <TabsContent value="prediction" className="space-y-4 mt-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Score de maîtrise estimé par matière</p>
                <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Calculé automatiquement à partir de vos fiches consultées, tâches complétées, XP et flashcards révisées. Plus vous utilisez Apprenix, plus l'estimation s'affine.</p>
              </div>
            </div>
          </div>

          {predSubjects.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">Aucune donnée disponible</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">Utilisez la plateforme pour générer vos prédictions de maîtrise.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predSubjects.map(subject => {
                const score = getPrediction(subject);
                const levelPred = score >= 80 ? 'Maîtrise' : score >= 50 ? 'En progrès' : 'À renforcer';
                const color    = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
                const barColor = score >= 80 ? 'bg-success'   : score >= 50 ? 'bg-warning'   : 'bg-destructive';
                return (
                  <Card key={subject} className="h-full border-border/60">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{subject}</span>
                        <Badge variant="outline" className={`text-xs ${color}`}>{levelPred}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Score estimé</span>
                          <span className={`font-bold ${color}`}>{score}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-[width] duration-500`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-pretty">
                        {score >= 80 ? 'Excellente maîtrise — continuez ainsi !'
                          : score >= 50 ? 'En progression — intensifiez vos révisions.'
                          : 'À renforcer — utilisez les flashcards et l\'aide aux devoirs.'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        {/* ── Onglet Suivi de révision ── */}
        <TabsContent value="suivi" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20">
            <BookOpen className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">📚 Suivi de révision — tes chapitres</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Ajoute les chapitres que tu dois réviser, par matière. Coche-les au fur et à mesure. La barre de progression te montre combien il te reste. Tout se sauvegarde automatiquement.</p>
            </div>
          </div>
          <SuiviRevisionTab />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default DashboardPage;
