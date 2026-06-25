import {BarChart3, CheckCircle,Flame, Lock, 
  MapPin, Quote, RefreshCw, Star, TrendingUp,
  Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { MOTIVATION_QUOTES as QUOTES } from '@/lib/quotes';
import type { AiHistoryItem } from '@/types/types';

const XP_LEVELS = [
  { level: 1, name: 'Débutant', minXp: 0, icon: '🌱' },
  { level: 2, name: 'Apprenti', minXp: 200, icon: '📚' },
  { level: 3, name: 'Étudiant', minXp: 500, icon: '🎓' },
  { level: 4, name: 'Érudit', minXp: 1000, icon: '🔬' },
  { level: 5, name: 'Expert', minXp: 2000, icon: '⭐' },
  { level: 6, name: 'Maître', minXp: 3500, icon: '🏆' },
  { level: 7, name: 'Légende', minXp: 5000, icon: '🌟' },
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

const MotivationPage: React.FC = () => {
  const { profile, setProfile, badges, challenges, completeChallenge, addXp, aiHistory, todos, quests, completeQuestMission, flashcards } = useApp();
  const [chartPeriod, setChartPeriod] = useState<7 | 30>(7);
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDay() % QUOTES.length);

  const xpPoints = profile.xpPoints;
  const currentLevelData = [...XP_LEVELS].reverse().find(l => xpPoints >= l.minXp) || XP_LEVELS[0];
  const nextLevelData = XP_LEVELS.find(l => l.minXp > xpPoints);
  const xpToNext = nextLevelData ? nextLevelData.minXp - xpPoints : 0;
  const xpProgress = nextLevelData
    ? ((xpPoints - currentLevelData.minXp) / (nextLevelData.minXp - currentLevelData.minXp)) * 100
    : 100;

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const streakDays = profile.streakDays;
  const streakClaimedToday = profile.lastActiveDate === todayStr;

  const handleMaintainStreak = () => {
    if (streakClaimedToday) return;
    addXp(5);
    setProfile(p => ({ ...p, lastActiveDate: todayStr, streakDays: p.streakDays + 1 }));
  };

  const calendarDays = Array.from({ length: STREAK_CALENDAR_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (STREAK_CALENDAR_DAYS - 1 - i));
    const isActive = i >= STREAK_CALENDAR_DAYS - streakDays;
    return { date: d.getDate(), isActive, isToday: i === STREAK_CALENDAR_DAYS - 1 };
  });

  const chartData = buildChartFromHistory(aiHistory, chartPeriod);
  const hasChartData = aiHistory.length > 0;

  const subjectCounts: Record<string, number> = {};
  for (const item of aiHistory) {
    if (item.subject) subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
  }
  const topSubjects = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([subject, count]) => ({ subject, count }));
  const maxCount = topSubjects[0]?.count || 1;

  // ── Prédiction de performance ─────────────────────────────────────────────
  const predictionSubjects = Object.keys(subjectCounts).slice(0, 6);
  const completedTodos = todos.filter(t => t.completed).length;
  const reviewedFlashcards = flashcards.filter(f => f.nextReview > todayStr).length;
  const completedChallenges = challenges.filter(c => c.completed).length;
  const getPrediction = (subject: string) => {
    const aiCount     = subjectCounts[subject] || 0;
    const xpBonus     = Math.min(25, Math.round(xpPoints / 80));
    const streakBonus = Math.min(15, streakDays * 2);
    const flashBonus  = Math.min(20, reviewedFlashcards * 2);
    const todoBonus   = Math.min(10, completedTodos * 2);
    const chalBonus   = Math.min(10, completedChallenges * 3);
    return Math.min(100, Math.round(aiCount * 12 + xpBonus + streakBonus + flashBonus + todoBonus + chalBonus));
  };

  return (
    <div className="min-w-0 space-y-6">
    <h1 className="sr-only">Motivation & Progression scolaire</h1>
      <SEO
        title="Motivation & Progression — Badges, Défis & Streaks | Apprenix"
        description="Défis quotidiens, badges et streaks pour rester motivé. Gamification scolaire positive du collège au lycée. Gratuit, sans publicité."
        canonical="/motivation"
        keywords="motivation étudiant révision, progression XP apprenix, badges scolaires, streak révision quotidien, défis apprentissage, gamification scolaire, rester motivé bac, challenge étudiant quotidien"
        dateModified="2026-06-20"
      />
      {/* En-tête */}
      <PageHero
        variant="info"
        icon={Trophy}
        badge={<>Motivation &amp; Progression</>}
        badgeClassName="bg-chart-1/10 text-chart-1 border-chart-1/20"
        title="Motivation & Progression"
        subtitle="XP, badges, quêtes scolaires, série de révision et suivi de performance — gamifiez vos révisions pour rester motivé chaque jour et voir votre progression en temps réel."
        stats={[
          { value: `${streakDays}j`, label: 'Série actuelle' },
          { value: `${xpPoints} XP`, label: 'Points cumulés' },
          { value: '10+', label: 'Badges à débloquer' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* Tabs principaux */}
      <Tabs defaultValue="progress">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="w-max min-w-full">
            <TabsTrigger value="progress" className="flex-1 whitespace-nowrap text-xs md:text-sm">Progression</TabsTrigger>
            <TabsTrigger value="quests" className="flex-1 whitespace-nowrap text-xs md:text-sm">Quêtes</TabsTrigger>
            <TabsTrigger value="prediction" className="flex-1 whitespace-nowrap text-xs md:text-sm">Prédiction</TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1 whitespace-nowrap text-xs md:text-sm">Défis</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Onglet Progression ── */}
        <TabsContent value="progress" className="space-y-6 mt-4">
          {/* Bandeau explication */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-4/5 border border-chart-4/20">
            <Trophy className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">🏆 Ta progression en temps réel</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Chaque activité sur Apprenix (devoirs, flashcards, quiz…) te rapporte des XP. Monte de niveau pour débloquer des badges et voir ta série de révision.</p>
            </div>
          </div>
          {/* Niveau XP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl md:text-3xl xl:text-4xl shrink-0">
                    {currentLevelData.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold text-foreground">Niv. {currentLevelData.level} — {currentLevelData.name}</h2>
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
            <Card>
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <Flame className="w-8 h-8 text-chart-1" />
                <span className="text-2xl md:text-3xl xl:text-4xl font-bold text-foreground">{streakDays}</span>
                <span className="text-sm text-muted-foreground leading-relaxed text-pretty">jours consécutifs</span>
                <Button size="sm" onClick={handleMaintainStreak} disabled={streakClaimedToday} className="h-9 text-xs bg-chart-1/10 text-chart-1 border border-chart-1/20 hover:bg-chart-1/20 w-full disabled:opacity-50">
                  <Flame className="w-3.5 h-3.5 mr-1" /> {streakClaimedToday ? 'Série maintenue ✓' : 'Maintenir la série'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendrier streak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-chart-1" />Calendrier des 30 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                {calendarDays.map((d, i) => (
                  <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${d.isToday ? 'ring-2 ring-primary' : ''} ${d.isActive ? 'bg-chart-1 text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {d.date}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Graphique activité */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />Activité — sessions de travail réelles
                </CardTitle>
                <div className="flex rounded-md border border-border overflow-hidden">
                  {([7, 30] as const).map(p => (
                    <button type="button" key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1 text-xs font-medium transition-colors ${chartPeriod === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
                      {p}j
                    </button>
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
                      <Bar dataKey="Sessions" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />Badges
                <Badge variant="secondary" className="text-xs ml-auto">{badges.filter(b => b.unlocked).length}/{badges.length} débloqués</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className={`p-3 rounded-lg border text-center transition-[background-color,border-color,opacity,filter] ${badge.unlocked ? 'bg-card border-primary/30' : 'bg-secondary border-border opacity-50 grayscale'}`}>
                    <div className="text-2xl md:text-3xl xl:text-4xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-semibold text-foreground text-balance">{badge.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{badge.description}</p>
                    {badge.unlocked && <Badge className="text-xs bg-success/10 text-success border-success/20 mt-1">Débloqué ✓</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top matières */}
          {topSubjects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />Top matières — questions posées
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

          {/* Citations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Quote className="w-4 h-4 text-primary" />Citations
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[48px] min-w-[44px]" aria-label="Nouvelle citation" onClick={() => setQuoteIndex(i => (i + 1) % QUOTES.length)}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm italic text-foreground text-pretty">"{QUOTES[quoteIndex].text}"</p>
                <p className="text-sm text-muted-foreground mt-1">— {QUOTES[quoteIndex].author}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Onglet Quêtes ── */}
        <TabsContent value="quests" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-2/5 border border-chart-2/20">
            <Star className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">⭐ Quêtes scolaires</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Chaque quête est une série d'étapes à compléter. Valide chaque étape en cliquant dessus — tu gagnes des XP à chaque fois. Plus la quête est complète, plus la récompense est grande !</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Complète des missions pour débloquer des récompenses XP et des badges.</p>
          {quests.map(quest => {
            const completedCount = quest.missions.filter(m => m.completed).length;
            const totalCount = quest.missions.length;
            const pct = Math.round((completedCount / totalCount) * 100);
            const isComplete = completedCount === totalCount;
            return (
              <Card key={quest.id} className={isComplete ? 'border-success/30 bg-success/5' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base text-balance">{quest.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{quest.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">+{quest.xpReward} XP</Badge>
                      {isComplete && <Badge className="bg-success/10 text-success border-success/20 text-xs">Terminée ✓</Badge>}
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
                        <div key={mission.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${mission.completed ? 'bg-success/5 border-success/20' : unlocked ? 'bg-card border-border hover:bg-secondary' : 'bg-muted/30 border-border opacity-60'}`}>
                          <div className="shrink-0">
                            {mission.completed
                              ? <CheckCircle className="w-4 h-4 text-success" />
                              : unlocked
                                ? <MapPin className="w-4 h-4 text-primary" />
                                : <Lock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <span className="flex-1 min-w-0 text-sm text-foreground">{mission.title}</span>
                          {!mission.completed && unlocked && (
                            <Button size="sm" className="h-9 text-xs px-3 shrink-0" onClick={() => completeQuestMission(quest.id, mission.id)}>
                              Valider
                            </Button>
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
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ma progression prévisionnelle</p>
                <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Estimation basée sur vos activités : fiches consultées, tâches complétées, XP accumulés et flashcards révisées.</p>
              </div>
            </div>
          </div>

          {predictionSubjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">Aucune donnée disponible</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">Utilisez la plateforme pour générer vos prédictions de maîtrise.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictionSubjects.map(subject => {
                const score = getPrediction(subject);
                const level_pred = score >= 80 ? 'Maîtrise' : score >= 50 ? 'En progrès' : 'À renforcer';
                const color = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
                const barColor = score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive';
                return (
                  <Card key={subject} className="h-full">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{subject}</span>
                        <Badge variant="outline" className={`text-xs ${color}`}>{level_pred}</Badge>
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
                        {score >= 80
                          ? '✅ Excellente maîtrise — continuez à maintenir ce niveau !'
                          : score >= 50
                            ? '📈 Bonne progression — quelques révisions supplémentaires pour consolider.'
                            : 'À renforcer — consultez les ressources et les fiches méthode.'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Onglet Défis ── */}
        <TabsContent value="challenges" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-1/5 border border-chart-1/20">
            <Zap className="w-5 h-5 text-chart-1 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">⚡ Défis quotidiens & hebdomadaires</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Les défis quotidiens se renouvellent chaque jour. Valide-les en cliquant sur <strong>"Valider"</strong> quand tu les as accomplis. Chaque défi rapporte des XP et maintient ta série !</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-chart-4" />Défis quotidiens
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {dailyChallenges.map(ch => (
                  <div key={ch.id} className={`p-3 rounded-lg border ${ch.completed ? 'bg-success/5 border-success/30' : 'bg-card border-border'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{ch.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{ch.description}</p>
                        <Badge className="mt-1 text-xs bg-primary/10 text-primary border-primary/20">+{ch.xpReward} XP</Badge>
                      </div>
                      {ch.completed
                        ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        : <Button size="sm" onClick={() => completeChallenge(ch.id)} className="h-9 text-xs shrink-0">Valider</Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-chart-5" />Défis hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {weeklyChallenges.map(ch => (
                  <div key={ch.id} className={`p-3 rounded-lg border ${ch.completed ? 'bg-success/5 border-success/30' : 'bg-card border-border'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{ch.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{ch.description}</p>
                        <Badge className="mt-1 text-xs bg-chart-5/10 text-chart-5 border-chart-5/30">+{ch.xpReward} XP</Badge>
                      </div>
                      {ch.completed
                        ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        : <Button size="sm" onClick={() => completeChallenge(ch.id)} className="h-9 text-xs shrink-0">Valider</Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MotivationPage;
