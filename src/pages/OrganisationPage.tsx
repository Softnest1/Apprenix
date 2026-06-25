import {AlertCircle, 
  BarChart3, BookOpen, Brain, 
  Calendar, CheckSquare, 
  ChevronLeft, ChevronRight, Clock, Info, Pause, Play, Plus, RotateCcw,Timer, Trash2,TrendingUp,Zap, 
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ENBadge from '@/components/ui/ENBadge';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import type { CalendarEvent, RevisionSession, Todo } from '@/types/types';

// SUBJECTS est calculé dynamiquement par niveau — voir useApp().level dans chaque composant
const EVENT_TYPES: CalendarEvent['eventType'][] = ['cours', 'examen', 'devoir', 'revision', 'other'];
const EVENT_COLORS: Record<string, string> = {
  cours: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  examen: 'bg-destructive/15 text-destructive border-destructive/30',
  devoir: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  revision: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  other: 'bg-secondary text-muted-foreground border-border',
};

// ─── Onglet Agenda ────────────────────────────────────────────────────────────
const AgendaTab: React.FC = () => {
  const { events, addEvent, deleteEvent, level } = useApp();
  const subjects = getSubjectsForLevel(level);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvId, setSelectedEvId] = useState<string | null>(null);

  const today = new Date();
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const adjustedFirst = (new Date(year, month, 1).getDay() + 6) % 7; // Lun = 0

  const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const eventsForDay = (day: number) => events.filter(e => e.eventDate === dateStr(day));

  const emptyForm = (day: number | null) => ({
    title: '', eventType: 'cours' as CalendarEvent['eventType'],
    eventDate: day ? dateStr(day) : today.toISOString().split('T')[0],
    startTime: '', endTime: '', subject: '', notes: '',
  });
  const [form, setForm] = useState(emptyForm(null));

  // Ouvrir formulaire sur tap d'une cellule
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setSelectedEvId(null);
    setForm(emptyForm(day));
    setShowForm(true);
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addEvent(form);
    setForm(emptyForm(selectedDay));
    setShowForm(false);
  };

  const handleCancel = () => { setShowForm(false); setSelectedDay(null); };

  // Détail événement sélectionné dans le panneau du bas
  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Bandeau d'aide */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">📅 Comment utiliser l'agenda ?</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Cliquez sur un jour pour voir ou ajouter un événement. Utilisez le bouton <strong>+ Ajouter</strong> pour créer cours, devoirs ou examens.</p>
        </div>
      </div>
      {/* Navigation mois */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10"
            aria-label="Mois précédent"
            onClick={() => { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1)); setSelectedDay(null); setShowForm(false); }}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <span className="font-semibold text-sm md:text-base text-foreground min-w-[120px] text-center" aria-live="polite">
            {MONTHS_FR[month]} {year}
          </span>
          <Button variant="ghost" size="icon" className="h-10 w-10"
            aria-label="Mois suivant"
            onClick={() => { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1)); setSelectedDay(null); setShowForm(false); }}>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
        <Button size="sm" className="h-9 text-xs bg-primary text-primary-foreground shrink-0"
          onClick={() => { setSelectedDay(null); setForm(emptyForm(null)); setShowForm(v => !v); }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
        </Button>
      </div>

      {/* Grille calendrier — cellules cliquables */}
      <Card className="shadow-card">
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden w-full">
            {/* En-têtes jours */}
            {DAYS_FR.map(d => (
              <div key={d} className="bg-secondary text-center py-2 text-xs md:text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {/* Cellules vides début */}
            {Array.from({ length: adjustedFirst }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-card min-h-[48px] md:min-h-[64px] lg:min-h-[88px]" />
            ))}
            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day   = i + 1;
              const dayEv = eventsForDay(day);
              const isToday   = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDay === day;
              return (
                <button type="button"
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={[
                    'bg-card min-h-[48px] md:min-h-[64px] lg:min-h-[88px] p-0.5 md:p-1 lg:p-1.5 w-full text-left',
                    'transition-colors active:bg-secondary/80 hover:bg-secondary/50',
                    isSelected ? 'ring-2 ring-inset ring-primary bg-primary/5' : '',
                    isToday && !isSelected ? 'ring-1 ring-inset ring-primary/60' : '',
                  ].join(' ')}
                  aria-label={`Sélectionner le ${day} ${MONTHS_FR[month]} ${year}`}
                >
                  {/* Numéro du jour */}
                  <span className={[
                    'text-xs md:text-xs font-semibold block mb-0.5 w-5 h-5 rounded-full flex items-center justify-center mx-auto',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                  ].join(' ')}>
                    {day}
                  </span>
                  {/* Pastilles événements */}
                  {dayEv.slice(0, 2).map(ev => (
                    <span
                      key={ev.id}
                      className={`block text-xs md:text-xs px-0.5 rounded mb-px truncate leading-4 ${EVENT_COLORS[ev.eventType]}`}
                    >
                      {ev.title}
                    </span>
                  ))}
                  {dayEv.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{dayEv.length - 2}</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire ajout — s'ouvre sous le calendrier */}
      {showForm && (
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {selectedDay
                ? `Nouvel événement — ${selectedDay} ${MONTHS_FR[month]}`
                : 'Nouvel événement'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="agenda-titre" className="text-sm text-muted-foreground mb-1 block">Titre *</Label>
                <Input
                  id="agenda-titre"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex : Contrôle de Maths"
                  className="h-10"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Type</Label>
                <Select value={form.eventType} onValueChange={v => setForm(f => ({ ...f, eventType: v as CalendarEvent['eventType'] }))}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agenda-date" className="text-sm text-muted-foreground mb-1 block">Date</Label>
                <Input id="agenda-date" type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} className="h-10" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Matière (optionnel)</Label>
                <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!form.title.trim()} className="h-9 text-xs bg-primary text-primary-foreground">
                <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-9 text-xs">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panneau événements du jour sélectionné */}
      {selectedDay !== null && !showForm && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                {selectedDay} {MONTHS_FR[month]} {year}
              </p>
              <Button size="sm" variant="outline" className="h-8 text-xs"
                onClick={() => { setForm(emptyForm(selectedDay)); setShowForm(true); }}>
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">
                Aucun événement ce jour — appuyez sur &quot;Ajouter&quot; 📅
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map(ev => (
                  /* role="button" sur div pour éviter le nesting button>button (HTML invalide) */
                  <div
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${EVENT_COLORS[ev.eventType]}`}
                    onClick={() => setSelectedEvId(selectedEvId === ev.id ? null : ev.id)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedEvId(selectedEvId === ev.id ? null : ev.id)}
                    aria-expanded={selectedEvId === ev.id}
                    aria-label={`Voir les détails : ${ev.title}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      {ev.subject && <p className="text-xs opacity-70">{ev.subject}</p>}
                    </div>
                    <Badge className={`text-xs shrink-0 ${EVENT_COLORS[ev.eventType]}`}>
                      {ev.eventType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 hover:text-destructive"
                      onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                      aria-label={`Supprimer l'événement ${ev.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Légende */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_COLORS).map(([type, cls]) => (
          <Badge key={type} className={`text-xs ${cls}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ─── Onglet To-do ─────────────────────────────────────────────────────────────
const TodoTab: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useApp();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const handleAdd = () => {
    if (!title.trim()) return;
    addTodo({ title: title.trim(), priority, dueDate: dueDate || undefined, completed: false });
    setTitle(''); setPriority('medium'); setDueDate('');
  };

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed);
  const priorityColor = (p: string) => ({ high: 'bg-destructive/10 text-destructive border-destructive/20', medium: 'bg-warning/10 text-warning border-warning/20', low: 'bg-success/10 text-success border-success/20' })[p] || '';
  const priorityLabel = (p: string) => ({ high: 'Urgent', medium: 'Moyen', low: 'Faible' })[p] || '';

  return (
    <div className="space-y-4">
      {/* Bandeau d'aide */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-2/5 border border-chart-2/20">
        <CheckSquare className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">✅ Liste de tâches — comment ça marche ?</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Écrivez une tâche, choisissez une priorité (<strong>🔴 Urgent</strong> en premier) et une date limite. Cochez quand c'est fait. Vos tâches cochées passent dans l'onglet "Terminées".</p>
        </div>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">➕ Nouvelle tâche</p>
          <div className="flex gap-2">
            <Input aria-label="Titre de la nouvelle tâche" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la tâche" className="h-9 text-sm flex-1" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <Button onClick={handleAdd} disabled={!title.trim()} className="h-9 bg-primary text-primary-foreground shrink-0" aria-label="Ajouter la tâche">
              <Plus className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm text-muted-foreground mb-1 block">Priorité</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Todo['priority'])}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 Urgent</SelectItem>
                  <SelectItem value="medium">🟡 Moyen</SelectItem>
                  <SelectItem value="low">🟢 Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="task-duedate" className="text-sm text-muted-foreground mb-1 block">Échéance</Label>
              <Input id="task-duedate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex rounded-md border border-border overflow-hidden">
          {(['all', 'pending', 'done'] as const).map(f => (
            <button type="button"
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              {f === 'all' ? `Toutes (${todos.length})` : f === 'pending' ? `En cours (${todos.filter(t => !t.completed).length})` : `Terminées (${todos.filter(t => t.completed).length})`}
            </button>
          ))}
        </div>
      </div>

      {todos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-7 h-7 text-chart-2" />
          </div>
          <p className="font-semibold text-foreground">Aucune tâche pour l'instant</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs text-pretty">Commencez par ajouter une tâche ci-dessus. Par exemple : <em>"Lire le chapitre 3 de Maths"</em>.</p>
        </div>
      )}
      {todos.length > 0 && (
        <div className="flex justify-end">
          <ExportButton
            fileName="mes-taches-apprenix"
            variant="outline"
            size="sm"
            label="Télécharger les tâches"
            getContent={() => ({
              title: 'Mes tâches — Apprenix',
              subtitle: `${todos.length} tâche${todos.length > 1 ? 's' : ''} au total · exporté le ${new Date().toLocaleDateString('fr-FR')}`,
              sections: [
                {
                  heading: 'Tâches en cours',
                  body: todos.filter(t => !t.completed).length === 0
                    ? 'Aucune tâche en cours.'
                    : todos
                        .filter(t => !t.completed)
                        .map(t => `• [${t.priority === 'high' ? 'Urgent' : t.priority === 'medium' ? 'Moyen' : 'Faible'}] ${t.title}${t.dueDate ? ` — Échéance : ${new Date(t.dueDate).toLocaleDateString('fr-FR')}` : ''}`)
                        .join('\n'),
                },
                {
                  heading: 'Tâches terminées',
                  body: todos.filter(t => t.completed).length === 0
                    ? 'Aucune tâche terminée.'
                    : todos
                        .filter(t => t.completed)
                        .map(t => `✓ ${t.title}`)
                        .join('\n'),
                },
              ],
            })}
          />
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && todos.length > 0 && <p className="text-center text-sm text-muted-foreground py-6">Aucune tâche dans cette catégorie.</p>}
        {filtered.map(todo => (
          <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-[background-color,border-color,color,box-shadow,transform] ${todo.completed ? 'opacity-60 bg-secondary border-border' : 'bg-card border-border hover:border-primary/30'}`}>
            <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'} truncate block`}>{todo.title}</span>
              {todo.dueDate && (
                <span className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {new Date(todo.dueDate).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <Badge className={`text-xs shrink-0 ${priorityColor(todo.priority)}`}>{priorityLabel(todo.priority)}</Badge>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteTodo(todo.id)} aria-label={`Supprimer la tâche : ${todo.title}`}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Onglet Pomodoro ──────────────────────────────────────────────────────────
const PomodoroTab: React.FC = () => {
  const { pomodoroSessions, addPomodoroSession } = useApp();
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = (isBreak ? breakMin : workMin) * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Stats calculées depuis l'historique persistant
  const allTimeSessions = pomodoroSessions.reduce((acc, s) => acc + s.sessionCount, 0);
  const allTimeFocus = pomodoroSessions.reduce((acc, s) => acc + s.workMinutes, 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroSessions.find(s => s.date === today);
  const todayCount = todaySessions?.sessionCount ?? 0;
  const todayFocus = todaySessions?.workMinutes ?? 0;

  // Score de concentration : sessions complètes × ratio durée travail/pause
  const focusScore = sessions > 0 ? Math.min(100, Math.round((sessions * workMin) / (sessions * workMin + sessions * (breakMin / 4)) * 100)) : 0;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (!isBreak) {
              const newCount = sessions + 1;
              setSessions(newCount);
              setTotalFocusMin(m => m + workMin);
              addPomodoroSession({ date: today, sessionCount: 1, workMinutes: workMin });
            }
            setIsBreak(b => !b);
            setIsRunning(false);
            return isBreak ? workMin * 60 : breakMin * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak, workMin, breakMin, sessions]);

  const reset = () => { setIsRunning(false); setIsBreak(false); setSeconds(workMin * 60); };
  const toggle = () => setIsRunning(r => !r);

  return (
    <div className="space-y-4">
      {/* Bandeau Pomodoro */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Timer className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">🍅 Technique Pomodoro — comment ça marche ?</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty"><strong>1)</strong> Appuyez sur <strong>Démarrer</strong> · <strong>2)</strong> Travaillez sans interruption pendant 25 min · <strong>3)</strong> Pause de 5 min · <strong>4)</strong> Répétez. Après 4 sessions, prenez une longue pause de 20 min. Votre cerveau retient mieux ainsi !</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Timer principal */}
        <div className="flex-1 min-w-0">
          <Card className="shadow-card">
            <CardContent className="p-6 text-center space-y-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isBreak ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''} ${isBreak ? 'bg-success' : 'bg-primary'}`} />
                {isBreak ? 'Pause active' : isRunning ? 'Deep Focus 🎯' : 'Prêt à démarrer'}
              </div>

              {/* Timer circulaire */}
              <div className="relative w-44 h-44 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={isBreak ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-[background-color,border-color,color,box-shadow,transform] duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-4xl font-bold text-foreground tabular-nums">
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed text-pretty">{isBreak ? 'Reposez-vous' : 'Concentrez-vous'}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={toggle} className={`h-10 px-6 font-semibold ${isBreak ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Démarrer</>}
                </Button>
                <Button variant="outline" size="icon" aria-label="Réinitialiser le Pomodoro" onClick={reset} className="h-10 w-10">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-primary" />
                ))}
                {sessions > 8 && <span className="text-sm text-muted-foreground leading-relaxed text-pretty">+{sessions - 8}</span>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{sessions} session{sessions !== 1 ? 's' : ''} cette séance</p>
            </CardContent>
          </Card>

          {/* Personnalisation */}
          <Card className="shadow-card mt-3">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Personnaliser</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="pomodoro-work" className="text-sm text-muted-foreground mb-1 block">Travail (min)</Label>
                  <Input id="pomodoro-work" type="number" inputMode="numeric" value={workMin} min={1} max={120} onChange={e => { setWorkMin(Number(e.target.value)); if (!isRunning && !isBreak) setSeconds(Number(e.target.value) * 60); }} className="h-10" />
                </div>
                <div><Label htmlFor="pomodoro-break" className="text-sm text-muted-foreground mb-1 block">Pause (min)</Label>
                  <Input id="pomodoro-break" type="number" inputMode="numeric" value={breakMin} min={1} max={30} onChange={e => setBreakMin(Number(e.target.value))} className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats panneau latéral */}
        <div className="w-full md:w-60 shrink-0 space-y-3">
          {/* Score de concentration */}
          <Card className="shadow-card border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl md:text-3xl xl:text-4xl font-bold text-primary">{focusScore}%</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Score de concentration</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Basé sur {sessions} session{sessions !== 1 ? 's' : ''} avec {workMin}min/session</p>
            </CardContent>
          </Card>

          {/* Stats aujourd'hui */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-chart-2" />Aujourd'hui</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sessions</span>
                <span className="font-bold text-foreground">{todayCount + sessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Focus total</span>
                <span className="font-bold text-foreground">{todayFocus + totalFocusMin} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP gagnés</span>
                <span className="font-bold text-chart-4">{(todayCount + sessions) * 25} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats globales */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-chart-3" />Historique total</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sessions totales</span>
                <span className="font-bold text-foreground">{allTimeSessions + sessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Heures focus</span>
                <span className="font-bold text-foreground">{Math.floor((allTimeFocus + totalFocusMin) / 60)}h{(allTimeFocus + totalFocusMin) % 60}m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP total Pomo</span>
                <span className="font-bold text-chart-4">{(allTimeSessions + sessions) * 25} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Charge cognitive */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><Brain className="w-3.5 h-3.5 text-chart-1" />Charge cognitive</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {(() => {
                const load = Math.min(100, sessions * 20);
                const label = load < 40 ? 'Légère' : load < 70 ? 'Modérée' : 'Élevée';
                const color = load < 40 ? 'bg-success' : load < 70 ? 'bg-warning' : 'bg-destructive';
                const textColor = load < 40 ? 'text-success' : load < 70 ? 'text-warning' : 'text-destructive';
                return (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Charge estimée</span>
                      <span className={`font-bold ${textColor}`}>{label}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-[background-color,border-color,color,box-shadow,transform]`} style={{ width: `${load}%` }} />
                    </div>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {load >= 70 ? 'Charge élevée — prévoyez une pause.' : load >= 40 ? 'Bonne cadence — continuez ainsi.' : 'Démarrage progressif — c\'est le bon rythme.'}
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Onglet Planning révision ─────────────────────────────────────────────────
const PlanningTab: React.FC = () => {
  const { revisionSessions, setRevisionSessions, level } = useApp();
  const subjects = getSubjectsForLevel(level);
  const [form, setForm] = useState({ subject: '', chapter: '', date: '', duration: 60 });

  const handleAdd = () => {
    if (!form.subject || !form.date) return;
    const session: RevisionSession = { id: crypto.randomUUID(), ...form, completed: false };
    setRevisionSessions(s => [...s, session]);
    setForm({ subject: '', chapter: '', date: '', duration: 60 });
  };

  const toggleSession = (id: string) => setRevisionSessions(s => s.map(sess => sess.id === id ? { ...sess, completed: !sess.completed } : sess));
  const deleteSession = (id: string) => setRevisionSessions(s => s.filter(sess => sess.id !== id));

  const completed = revisionSessions.filter(s => s.completed).length;
  const progress = revisionSessions.length ? (completed / revisionSessions.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Bandeau Planning */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/20">
        <BookOpen className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">📖 Planning de révision — comment ça marche ?</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Planifiez vos sessions de révision à l'avance : choisissez la matière, le chapitre, la date et la durée. Cochez une session quand vous l'avez faite pour suivre votre avancement.</p>
        </div>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">➕ Créer une session de révision</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><Label className="text-sm text-muted-foreground mb-1 block">Matière</Label>
              <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="revision-chapter" className="text-sm text-muted-foreground mb-1 block">Chapitre</Label>
              <Input id="revision-chapter" value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} placeholder="Ex : Algèbre, Romantisme" className="h-10" />
            </div>
            <div><Label htmlFor="revision-date" className="text-sm text-muted-foreground mb-1 block">Date</Label>
              <Input id="revision-date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10" />
            </div>
            <div><Label htmlFor="revision-duration" className="text-sm text-muted-foreground mb-1 block">Durée (min)</Label>
              <Input id="revision-duration" type="number" inputMode="numeric" value={form.duration} min={15} step={15} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="h-10" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!form.subject || !form.date} className="h-9 bg-primary text-primary-foreground text-sm">
            <Plus className="w-4 h-4 mr-2" /> Ajouter la session
          </Button>
        </CardContent>
      </Card>

      {revisionSessions.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Avancement global</p>
              <span className="text-sm font-bold text-primary">{completed}/{revisionSessions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {revisionSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 text-chart-3" />
            </div>
            <p className="font-semibold text-foreground">Aucune session planifiée</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs text-pretty">Ajoutez votre première session ci-dessus. Par exemple : <em>"Maths — Algèbre — Demain — 60 min"</em>.</p>
          </div>
        )}
        {revisionSessions.sort((a, b) => a.date.localeCompare(b.date)).map(sess => (
          <div key={sess.id} className={`flex items-center gap-3 p-3 rounded-lg border ${sess.completed ? 'opacity-60 bg-secondary' : 'bg-card hover:border-primary/30'}`}>
            <Checkbox checked={sess.completed} onCheckedChange={() => toggleSession(sess.id)} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{sess.subject}</Badge>
                {sess.chapter && <span className="text-sm text-foreground truncate">{sess.chapter}</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(sess.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {sess.duration} min
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => deleteSession(sess.id)} aria-label={`Supprimer la session ${sess.subject}`}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Onglet Mémorisation ──────────────────────────────────────────────────────
const MemoriTab: React.FC = () => {
  const TECHNIQUES = [
    { name: 'Révisions espacées', icon: '📅', desc: 'Révisez à intervalles croissants : J+1, J+3, J+7, J+14, J+30. La courbe de l\'oubli prouve que cela double votre mémorisation à long terme.', steps: ['Révisez le soir après le cours', 'Relisez le lendemain', 'Faites un test à J+3', 'Révisez à J+7 et J+14', 'Consolidez à J+30'] },
    { name: 'Technique Pomodoro', icon: '🍅', desc: '25 minutes de travail intense, puis 5 minutes de pause. Votre cerveau mémorise mieux en sessions courtes et concentrées.', steps: ['Choisir une seule tâche', 'Travailler 25 min sans interruption', 'Pause de 5 min (bougez !)', 'Après 4 sessions : pause longue 20 min'] },
    { name: 'Méthode Feynman', icon: '🧠', desc: 'Expliquez le concept comme si vous l\'enseigniez à quelqu\'un. Ce qui n\'est pas clair révèle vos lacunes.', steps: ['Choisir un concept à apprendre', 'L\'expliquer à voix haute simplement', 'Identifier les zones floues', 'Revoir le cours sur ces points', 'Réexpliquer jusqu\'à la maîtrise'] },
    { name: 'Mémo palace', icon: '🏛️', desc: 'Associez les informations à des lieux imaginaires dans un espace que vous connaissez. Technique utilisée par les champions de la mémoire.', steps: ['Choisir un lieu familier (maison)', 'Créer un parcours mental', 'Associer chaque info à un objet/lieu', 'Visualiser le parcours pour réviser'] },
  ];
  return (
    <div className="space-y-4">
    <h1 className="sr-only">Organisation scolaire — Agenda & Pomodoro</h1>
      <Card className="shadow-card bg-secondary border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground text-pretty">Les techniques de mémorisation scientifiquement prouvées peuvent multiplier votre efficacité de révision par 3 à 5. Choisissez celle qui vous correspond !</p>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECHNIQUES.map(t => (
          <Card key={t.name} className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="text-xl">{t.icon}</span> {t.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground text-pretty">{t.desc}</p>
              <ol className="space-y-1.5">
                {t.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
const OrganisationPage: React.FC = () => (
  <div className="min-w-0 space-y-4">
    <SEO
      title="Organisation scolaire gratuite — Agenda, Planning & Pomodoro | Apprenix"
      description="Agenda scolaire, planning hebdomadaire et minuteur Pomodoro. Augmentez votre productivité et réduisez le stress des révisions. 100% gratuit."
      canonical="/organisation"
      keywords="agenda scolaire gratuit, planning révision, to-do list étudiant, pomodoro en ligne gratuit, organisation scolaire, productivité lycéen étudiant, emploi du temps lycée, planning bac, minuteur concentration"
      dateModified="2026-06-21"
    />

    {/* ── En-tête page ── */}
    {/* ── Hero ── */}
    <PageHero
      variant="tool"
      icon={Calendar}
      badge={<>📅 Organisation & Planning</>}
      badgeClassName="bg-primary/10 text-primary border-primary/20"
      title="Organisation & Planning scolaire"
      subtitle="Agenda, planning de révision, to-do list, timer Pomodoro et techniques de mémorisation — tout en un seul endroit pour travailler mieux et moins stresser."
      stats={[
        { value: '5', label: 'Outils intégrés' },
        { value: 'Pomodoro', label: 'Timer intégré' },
        { value: 'Compte', label: 'Sauvegarde si connecté' },
      ]}
    >
      <ENBadge />
    </PageHero>

    <Tabs defaultValue="agenda">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex w-auto whitespace-nowrap">
          <TabsTrigger value="agenda" className="text-xs"><Calendar className="w-3.5 h-3.5 mr-1" /> Agenda</TabsTrigger>
          <TabsTrigger value="planning" className="text-xs"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Planning révision</TabsTrigger>
          <TabsTrigger value="todo" className="text-xs"><CheckSquare className="w-3.5 h-3.5 mr-1" /> To-do list</TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs"><Timer className="w-3.5 h-3.5 mr-1" /> Pomodoro</TabsTrigger>
          <TabsTrigger value="memorisation" className="text-xs"><Brain className="w-3.5 h-3.5 mr-1" /> Mémorisation</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="agenda"><AgendaTab /></TabsContent>
      <TabsContent value="planning"><PlanningTab /></TabsContent>
      <TabsContent value="todo"><TodoTab /></TabsContent>
      <TabsContent value="pomodoro"><PomodoroTab /></TabsContent>
      <TabsContent value="memorisation"><MemoriTab /></TabsContent>
    </Tabs>
  </div>
);

export default OrganisationPage;
