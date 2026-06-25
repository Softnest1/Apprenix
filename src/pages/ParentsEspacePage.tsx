import {
  AlertCircle, ArrowLeft, Calendar, CheckSquare, Clock, CreditCard,
  Download, Eye, EyeOff, FileText, Flame, GraduationCap, Home, Info,
  Loader2, Lock, LogOut, MessageCircle, Moon, Printer,
  Send, Shield, Star, Sun,
  Target, Trash2, Trophy, User, Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { getParentMessages, sendParentMessage } from '@/lib/api';
import { getLevelCategoryLabel, getLevelCategory } from '@/lib/levelUtils';
import type { DbParentMessage } from '@/db/supabase';
import type { SchoolLevel } from '@/types/types';


// ─── Calcul du niveau depuis XP ───────────────────────────────────────────────
const XP_LEVELS = [
  { level: 1, name: 'Débutant',  minXp: 0    },
  { level: 2, name: 'Apprenti',  minXp: 100  },
  { level: 3, name: 'Confirmé',  minXp: 300  },
  { level: 4, name: 'Avancé',    minXp: 600  },
  { level: 5, name: 'Expert',    minXp: 2000 },
];

const getXpLevel = (xp: number) =>
  [...XP_LEVELS].reverse().find(l => xp >= l.minXp) || XP_LEVELS[0];

// ─── Données lues depuis AppContext (synchronisées avec Supabase) ─────────────
interface ParentData {
  name: string;
  schoolLevel: SchoolLevel;
  xpPoints: number;
  streakDays: number;
  lastActiveDate: string;
  favoriteSubjects: string[];
  todosCompleted: number;
  todosTotal: number;
  upcomingTodos: Array<{ title: string; dueDate: string }>;
  flashcardsTotal: number;
  flashcardsDue: number;
  notesTotal: number;
  pomodoroSessions: number;
  recentActivity: string[];
}

// ─── Composant messagerie parents-enseignants (Supabase) ─────────────────────
const MessagerieSection: React.FC<{ parentId: string }> = ({ parentId }) => {
  const [messages, setMessages]   = useState<DbParentMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [body, setBody]           = useState('');
  const [sending, setSending]     = useState(false);
  const [showForm, setShowForm]   = useState(false);

  const loadMessages = useCallback(async () => {
    if (!parentId) return;
    try {
      const data = await getParentMessages(parentId, undefined, 30);
      setMessages(data);
    } catch { setMessages([]); }
    finally { setLoading(false); }
  }, [parentId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleSend = async () => {
    if (!body.trim()) { toast.error('Message requis.'); return; }
    if (!parentId) { toast.error('Identifiant parent manquant.'); return; }
    setSending(true);
    try {
      await sendParentMessage({
        parent_id: parentId,
        teacher_id: '',
        student_id: '',
        subject: 'Message',
        body: body.trim(),
        sender_role: 'parent',
      });
      toast.success('Message envoyé à l\'équipe enseignante !');
      setBody(''); setShowForm(false);
      await loadMessages();
    } catch { toast.error('Erreur lors de l\'envoi.'); }
    finally { setSending(false); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Messagerie parents-enseignants
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Annuler' : <><Send className="w-3.5 h-3.5 mr-1.5" /> Nouveau message</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Message <span className="text-destructive">*</span></Label>
              <Textarea rows={4} placeholder="Votre message à l'enseignant..."
                value={body} onChange={e => setBody(e.target.value)} />
            </div>
            <Button onClick={handleSend} disabled={sending || !body} className="w-full">
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Envoyer
            </Button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun message — utilisez le bouton ci-dessus pour contacter un enseignant.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map(m => (
              <div key={m.id} className={`rounded-lg p-3 text-sm border ${m.read ? 'bg-muted/30 border-border' : 'bg-primary/5 border-primary/30'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at ?? '').toLocaleDateString('fr-FR')}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">{m.sender_role === 'teacher' ? 'Enseignant' : 'Vous'}</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-pretty mt-1 line-clamp-2">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Contenu Espace Parents (hooks ici — jamais après une garde conditionnelle) ──
// ⚠️ React interdit d'appeler des hooks après un return conditionnel (Rules of Hooks).
// Solution : la garde auth est dans le composant enveloppant `ParentsEspacePage`.
const ParentsEspaceContent: React.FC = () => {
  const {
    isDark, toggleTheme, profile,
    todos, flashcards, notes, pomodoroSessions, recentActivity,
  } = useApp();
  const parentId = profile?.id ?? '';

  const [codeInput, setCodeInput]   = useState('');
  const [codeError, setCodeError]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [showCode, setShowCode]     = useState(false);
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Calcul des données parentales depuis AppContext (synchronisé Supabase) ─
  const buildParentData = (): ParentData | null => {
    if (!profile?.name) return null;
    const today = new Date().toISOString().split('T')[0];
    const completedTodos = todos.filter(t => t.completed);
    const upcoming = todos
      .filter(t => !t.completed && t.dueDate && t.dueDate >= today)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 3);
    return {
      name:             profile.name       ?? 'Étudiant',
      schoolLevel:      profile.schoolLevel ?? '2nde',
      xpPoints:         profile.xpPoints   ?? 0,
      streakDays:       profile.streakDays  ?? 0,
      lastActiveDate:   profile.lastActiveDate ?? today,
      favoriteSubjects: (profile.favoriteSubjects ?? []) as string[],
      todosCompleted:   completedTodos.length,
      todosTotal:       todos.length,
      upcomingTodos:    upcoming.map(t => ({ title: t.title, dueDate: t.dueDate ?? '' })),
      flashcardsTotal:  flashcards.length,
      flashcardsDue:    flashcards.filter(c => c.nextReview <= today).length,
      notesTotal:       notes.length,
      pomodoroSessions: pomodoroSessions.length,
      recentActivity:   recentActivity.slice(0, 5),
    };
  };

  // ── Validation du code parental ───────────────────────────────────────────
  const handleCodeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setCodeError('Le code parental doit contenir exactement 6 chiffres.');
      return;
    }
    setLoading(true);
    setCodeError('');

    // Simule un court délai de vérification
    await new Promise(r => setTimeout(r, 700));

    // Recherche dans localStorage : clé ep_parental_code
    const stored = localStorage.getItem('ep_parental_code');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { code: string };
        if (parsed.code === code) {
          const data = buildParentData();
          if (data) {
            setParentData(data);
            setIsConnected(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // code corrompu
      }
    }

    setCodeError('Code parental incorrect. Vérifiez le code avec votre enfant.');
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeInput, profile, todos, flashcards, notes, pomodoroSessions, recentActivity]);

  // ── Déconnexion ───────────────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setParentData(null);
    setCodeInput('');
  }, []);

  // ── Suppression du code parental ─────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteCode = useCallback(() => {
    localStorage.removeItem('ep_parental_code');
    setIsConnected(false);
    setParentData(null);
    setCodeInput('');
    setDeleteConfirmOpen(false);
  }, []);

  // ── Impression ────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Formatage date ─────────────────────────────────────────────────────────
  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch { return iso; }
  };

  const nowStr = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-background to-background flex flex-col">
      <SEO
        title="Espace Parents — Suivre la progression de votre enfant | Apprenix"
        description="Consultez la progression scolaire de votre enfant sur Apprenix : XP, streak, flashcards révisées, tâches complétées et prochaines échéances."
        canonical="/parents-espace"
        dateModified="2026-06-18"
        noIndex={false}
      />

      {/* ── Header Apprenix ───────────────────────────────────────────────── */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 print:hidden">
        <div className="max-w-4xl mx-auto px-3 h-14 flex items-center gap-2">
          {/* Logo + label */}
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <ApprenixLogo size={28} />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">Apprenix</p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/70">
                Espace Parents
              </p>
            </div>
          </Link>

          {/* Pill parent */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-400 ml-1">
            <span aria-hidden="true">👨‍👩‍👧</span>
            <span>Suivi parental</span>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/">
              <button
                type="button"
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Retour à l'accueil"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Accueil</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">

          {!isConnected ? (
            /* ── État initial : saisie du code ──────────────────────────── */
            <div className="flex flex-col items-center gap-6">
              {/* Hero */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-balance">Espace Parents</h1>
                <p className="text-muted-foreground text-sm md:text-base text-pretty max-w-md mx-auto">
                  Consultez la progression scolaire de votre enfant en toute confidentialité grâce au code parental.
                </p>
              </div>

              {/* Card saisie code */}
              <Card className="w-full max-w-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Entrez le code parental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    {codeError && (
                      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{codeError}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="parents-code" className="text-sm font-normal text-muted-foreground">
                        Code parental à 6 chiffres
                      </Label>
                      <div className="relative">
                        <Input
                          id="parents-code"
                          type={showCode ? 'text' : 'password'}
                          inputMode="numeric"
                          maxLength={6}
                          value={codeInput}
                          onChange={e => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="• • • • • •"
                          className="text-center text-2xl tracking-[0.5em] pr-10 font-mono h-14"
                          autoComplete="one-time-code"
                          aria-label="Code parental 6 chiffres"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowCode(v => !v)}
                          aria-label={showCode ? 'Masquer le code' : 'Afficher le code'}
                        >
                          {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={loading || codeInput.length !== 6}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                          Vérification…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Accéder à l'espace parents
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notice appareil */}
              <Card className="w-full max-w-md border-dashed border-border/70">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-sm font-semibold">Comment ça fonctionne ?</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Votre enfant génère un code depuis son profil (icône Profil en haut à droite)</li>
                        <li>Entrez ce code <strong className="text-foreground">sur l'appareil de votre enfant</strong> pour accéder à son rapport</li>
                        <li>Le code change à chaque génération pour protéger la vie privée</li>
                        <li>Vous pouvez imprimer ou exporter le rapport en PDF</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/40">
                        Si votre enfant n'a pas encore généré de code, demandez-lui de se rendre dans{' '}
                        <strong className="text-foreground">Mon Profil → Mode Parents</strong>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* ── État connecté : tableau de bord parents ─────────────────── */
            <div className="space-y-5">
              {/* Bannière d'orientation */}
              <div className="flex items-start gap-3 rounded-xl border border-chart-4/30 bg-chart-4/5 px-4 py-3 print:hidden">
                <Shield className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground text-pretty">
                  <strong className="text-foreground">Espace Parents sécurisé</strong> — Vous consultez la progression de votre enfant.
                  {' '}Cet espace est distinct de l'espace élève.{' '}
                  <Link to="/espace" className="text-primary font-semibold hover:underline">Espace élève →</Link>
                </p>
              </div>

              {/* Header dashboard */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:flex-row">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl xl:text-3xl font-extrabold text-balance truncate">
                    Progression de {parentData?.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Rapport généré le {nowStr}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handlePrint}>
                    <Printer className="w-3.5 h-3.5" />
                    Imprimer
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handlePrint}>
                    <Download className="w-3.5 h-3.5" />
                    Exporter PDF
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer le code
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={handleDisconnect}>
                    <LogOut className="w-3.5 h-3.5" />
                    Quitter
                  </Button>
                </div>
              </div>

              {/* Guide lecture du rapport */}
              <div className="flex items-start gap-3 rounded-xl border border-chart-2/20 bg-chart-2/5 p-3.5 print:hidden">
                <Info className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">📊 Comment lire ce rapport ?</p>
                  <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
                    <strong>Informations générales</strong> : niveau, XP et date de connexion ·{' '}
                    <strong>Activité de la semaine</strong> : série de révision, tâches, flashcards, sessions Pomodoro ·{' '}
                    <strong>Matières travaillées</strong> : fréquence d'utilisation par matière ·{' '}
                    <strong>Notes &amp; Organisation</strong> : fiches créées et échéances à venir.
                    Utilisez <strong>"Imprimer"</strong> ou <strong>"Exporter PDF"</strong> pour conserver ce rapport.
                  </p>
                </div>
              </div>

              {/* ── Informations générales ──────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: GraduationCap, label: 'Niveau',       value: parentData?.schoolLevel,                              sub: getLevelCategoryLabel(parentData?.schoolLevel ?? '2nde') },
                      { icon: Zap,           label: 'XP total',      value: `${parentData?.xpPoints ?? 0} XP`,                   sub: getXpLevel(parentData?.xpPoints ?? 0).name },
                      { icon: Star,          label: 'Niveau joueur', value: `Niveau ${getXpLevel(parentData?.xpPoints ?? 0).level}`, sub: getXpLevel(parentData?.xpPoints ?? 0).name },
                      { icon: Calendar,      label: 'Dernière visite',value: parentData?.lastActiveDate ? fmtDate(parentData.lastActiveDate) : '—', sub: 'Date de connexion' },
                    ].map(({ icon: Icon, label, value, sub }) => (
                      <div key={label} className="rounded-xl border border-border/60 p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <p className="text-sm font-bold leading-tight truncate">{value}</p>
                        <p className="text-sm text-muted-foreground">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Barre XP */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression XP</span>
                      <span>{parentData?.xpPoints ?? 0} / {(() => { const nxt = XP_LEVELS.find(l => l.minXp > (parentData?.xpPoints ?? 0)); return nxt ? `${nxt.minXp} XP` : 'Max'; })()}</span>
                    </div>
                    <Progress
                      value={Math.min(((parentData?.xpPoints ?? 0) % 200) / 200 * 100, 100)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ── Activité récente ────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-primary" />
                    Activité de la semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Flame,       label: 'Série',             value: `${parentData?.streakDays ?? 0} j`,     color: 'text-chart-1', bg: 'bg-chart-1/10' },
                      { icon: CheckSquare, label: 'Tâches complétées', value: `${parentData?.todosCompleted ?? 0}/${parentData?.todosTotal ?? 0}`, color: 'text-success', bg: 'bg-success/10' },
                      { icon: CreditCard,  label: 'Flashcards',        value: `${parentData?.flashcardsTotal ?? 0}`,  color: 'text-chart-4', bg: 'bg-chart-4/10' },
                      { icon: Target,      label: 'Sessions focus',     value: `${parentData?.pomodoroSessions ?? 0}`, color: 'text-primary', bg: 'bg-primary/10' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                      <div key={label} className={`rounded-xl border border-border/60 p-3 flex flex-col gap-2`}>
                        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`w-4.5 h-4.5 ${color}`} />
                        </div>
                        <p className="text-xl font-extrabold leading-none">{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Matières favorites + Notes ──────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matières favorites */}
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Matières travaillées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {(parentData?.favoriteSubjects?.length ?? 0) > 0 ? (
                      <div className="space-y-2.5">
                        {parentData!.favoriteSubjects.slice(0, 5).map((subj, i) => {
                          const pct = Math.max(40, 95 - i * 12);
                          return (
                            <div key={subj} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium truncate">{subj}</span>
                                <span className="text-muted-foreground shrink-0 ml-2">{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Aucune matière favorite définie.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Notes & organisation */}
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Notes & Organisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">Notes créées</span>
                      <span className="text-base font-bold">{parentData?.notesTotal ?? 0}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prochaines échéances</p>
                      {(parentData?.upcomingTodos?.length ?? 0) > 0 ? (
                        parentData!.upcomingTodos.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/40 last:border-0">
                            <CheckSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="flex-1 min-w-0 truncate">{t.title}</span>
                            <Badge variant="outline" className="text-xs shrink-0">{fmtDate(t.dueDate)}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune échéance à venir.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Activité récente détaillée ──────────────────────────── */}
              {(parentData?.recentActivity?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      Historique récent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parentData!.recentActivity.map((act, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1.5 border-b border-border/30 last:border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* ── Déconnexion bas de page ─────────────────────────────── */}
              <div className="flex justify-center pt-2 print:hidden">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive" onClick={handleDisconnect}>
                  <LogOut className="w-4 h-4" />
                  Quitter l'espace parents
                </Button>
              </div>

              {/* ── Messagerie parents-enseignants (Supabase) ───────────── */}
              <MessagerieSection parentId={parentId} />
            </div>
          )}
        </div>
      </main>

      {/* ── Dialogue de confirmation — suppression du code parental ─────────── */}
      {deleteConfirmOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirmer la suppression du code parental"
          className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[calc(100%-2rem)] md:max-w-sm bg-background rounded-2xl border border-border shadow-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-balance">Supprimer le code parental ?</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty leading-relaxed">
                  Le code parental sera effacé définitivement de cet appareil. L'enfant devra en générer un nouveau depuis son espace élève pour vous redonner l'accès.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-10 gap-2"
                onClick={handleDeleteCode}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Styles impression */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Page enveloppante — garde auth + rôle parent ────────────────────────────
const ParentsEspacePage: React.FC = () => {
  const { isAuthenticated, authReady, profileReady, profile, level } = useApp();
  const location = useLocation();

  // Attendre que l'auth ET le profil soient prêts pour éviter les redirections sur rôle/niveau par défaut
  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/connexion"
        state={{ from: location.pathname, pageName: "l'Espace Parents" }}
        replace
      />
    );
  }

  // Mauvais rôle → renvoyer vers l'espace approprié (niveau fiable grâce à profileReady)
  const role = (profile as { role?: string }).role;
  if (role === 'teacher' || role === 'admin') {
    return <Navigate to="/espace-enseignant" replace />;
  }
  if (role === 'student') {
    return <Navigate to={`/espace/${getLevelCategory(level)}`} replace />;
  }

  return <ParentsEspaceContent />;
};

export default ParentsEspacePage;
