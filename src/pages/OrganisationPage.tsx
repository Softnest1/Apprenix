import {
  BarChart3, BookOpen, Brain,
  Calendar, CheckSquare,
  ChevronLeft, ChevronRight, Clock, Pause, Play, Plus, RotateCcw, Timer, Trash2, TrendingUp, Zap,
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
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import type { CalendarEvent, RevisionSession, Todo } from '@/types/types';

// ─── Constantes ────────────────────────────────────────────────────────────────
const EVENT_TYPES: CalendarEvent['eventType'][] = ['cours', 'examen', 'devoir', 'revision', 'other'];
const EVENT_META: Record<string, { label: string; dot: string; badge: string }> = {
  cours:    { label: 'Cours',    dot: 'bg-chart-3',         badge: 'bg-chart-3/15 text-chart-3 border-chart-3/30' },
  examen:   { label: 'Examen',   dot: 'bg-destructive',     badge: 'bg-destructive/15 text-destructive border-destructive/30' },
  devoir:   { label: 'Devoir',   dot: 'bg-chart-1',         badge: 'bg-chart-1/15 text-chart-1 border-chart-1/30' },
  revision: { label: 'Révision', dot: 'bg-chart-2',         badge: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
  other:    { label: 'Autre',    dot: 'bg-muted-foreground', badge: 'bg-secondary text-muted-foreground border-border' },
};
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ─── Onglet Agenda ─────────────────────────────────────────────────────────────
const AgendaTab: React.FC = () => {
  const { events, addEvent, deleteEvent, level } = useApp();
  const subjects = getSubjectsForLevel(level);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const adjustedFirst = (new Date(year, month, 1).getDay() + 6) % 7;
  const DAYS_SHORT = ['L','M','Me','J','V','S','D'];

  const dateStr = (d: number) =>
    `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const eventsForDay = (d: number) => events.filter(e => e.eventDate === dateStr(d));
  const selectedDayEvs = selectedDay ? eventsForDay(selectedDay) : [];

  const emptyForm = (d: number | null) => ({
    title: '', eventType: 'cours' as CalendarEvent['eventType'],
    eventDate: d ? dateStr(d) : today.toISOString().split('T')[0],
    startTime: '', endTime: '', subject: '', notes: '',
  });
  const [form, setForm] = useState(emptyForm(null));

  const handleDayClick = (d: number) => {
    if (selectedDay === d) { setSelectedDay(null); setShowForm(false); return; }
    setSelectedDay(d);
    setForm(emptyForm(d));
    setShowForm(false);
  };
  const handleAdd = () => {
    if (!form.title.trim()) return;
    addEvent(form);
    setForm(emptyForm(selectedDay));
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Navigation mois */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0"
          aria-label="Mois précédent"
          onClick={() => { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()-1)); setSelectedDay(null); setShowForm(false); }}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true"/>
        </Button>
        <span className="font-bold text-base text-foreground text-center flex-1 truncate" aria-live="polite">
          {MONTHS_FR[month]} {year}
        </span>
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0"
          aria-label="Mois suivant"
          onClick={() => { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()+1)); setSelectedDay(null); setShowForm(false); }}>
          <ChevronRight className="w-4 h-4" aria-hidden="true"/>
        </Button>
        <Button size="sm" className="h-10 px-4 shrink-0 font-semibold"
          onClick={() => { setSelectedDay(null); setForm(emptyForm(null)); setShowForm(v => !v); }}>
          <Plus className="w-4 h-4 mr-1.5"/>Ajouter
        </Button>
      </div>

      {/* Légende compacte — toujours visible, jamais coupée */}
      <div className="flex flex-wrap gap-x-3 gap-y-1" role="list" aria-label="Légende">
        {Object.entries(EVENT_META).map(([key, { label, dot }]) => (
          <span key={key} role="listitem" className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden="true"/>
            {label}
          </span>
        ))}
      </div>

      {/* Grille calendrier */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-1.5 md:p-3">
          {/* En-têtes */}
          <div className="grid grid-cols-7 mb-0.5">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center py-1.5 text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          {/* Cellules */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {Array.from({ length: adjustedFirst }).map((_, i) => (
              <div key={`e${i}`} className="bg-card min-h-[44px] md:min-h-[56px]"/>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEv = eventsForDay(day);
              const isToday    = today.getDate()===day && today.getMonth()===month && today.getFullYear()===year;
              const isSelected = selectedDay === day;
              return (
                <button type="button" key={day}
                  onClick={() => handleDayClick(day)}
                  aria-label={`${day} ${MONTHS_FR[month]}${dayEv.length ? ` — ${dayEv.length} événement${dayEv.length>1?'s':''}`:''}`}
                  aria-pressed={isSelected}
                  className={[
                    'bg-card min-h-[44px] md:min-h-[56px] p-0.5 w-full transition-colors',
                    'active:bg-secondary/80 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                    isSelected ? 'ring-2 ring-inset ring-primary bg-primary/5' : '',
                    isToday && !isSelected ? 'ring-1 ring-inset ring-primary/50' : '',
                  ].join(' ')}
                >
                  <span className={[
                    'text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full mx-auto mb-0.5',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                  ].join(' ')}>
                    {day}
                  </span>
                  <div className="flex justify-center gap-px flex-wrap">
                    {dayEv.slice(0,3).map(ev => (
                      <span key={ev.id} className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_META[ev.eventType]?.dot}`} aria-hidden="true"/>
                    ))}
                    {dayEv.length > 3 && <span className="text-[9px] text-muted-foreground">+{dayEv.length-3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire ajout */}
      {showForm && (
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">
              {selectedDay ? `Nouvel événement — ${selectedDay} ${MONTHS_FR[month]}` : 'Nouvel événement'}
            </p>
            <div>
              <Label htmlFor="ag-titre" className="text-sm text-muted-foreground mb-1 block">Titre *</Label>
              <Input id="ag-titre" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex : Contrôle de Maths"
                className="h-11 text-base" autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">Type</Label>
                <Select value={form.eventType} onValueChange={v => setForm(f => ({ ...f, eventType: v as CalendarEvent['eventType'] }))}>
                  <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{EVENT_META[t].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ag-date" className="text-sm text-muted-foreground mb-1 block">Date</Label>
                <Input id="ag-date" type="date" value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} className="h-11"/>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Matière (optionnel)</Label>
              <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Choisir…"/></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleAdd} disabled={!form.title.trim()} className="h-11 flex-1 font-semibold">
                <Plus className="w-4 h-4 mr-1.5"/>Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-11 px-5">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Événements du jour sélectionné */}
      {selectedDay !== null && !showForm && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground">{selectedDay} {MONTHS_FR[month]} {year}</p>
              <Button size="sm" variant="outline" className="h-9 text-xs"
                onClick={() => { setForm(emptyForm(selectedDay)); setShowForm(true); }}>
                <Plus className="w-3 h-3 mr-1"/>Ajouter
              </Button>
            </div>
            {selectedDayEvs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun événement ce jour 📅</p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvs.map(ev => (
                  <div key={ev.id}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${EVENT_META[ev.eventType]?.badge}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${EVENT_META[ev.eventType]?.dot}`} aria-hidden="true"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ev.title}</p>
                      {ev.subject && <p className="text-xs opacity-70 truncate">{ev.subject}</p>}
                    </div>
                    <Badge className={`text-xs shrink-0 ${EVENT_META[ev.eventType]?.badge}`}>{EVENT_META[ev.eventType]?.label}</Badge>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:text-destructive"
                      onClick={() => deleteEvent(ev.id)} aria-label={`Supprimer ${ev.title}`}>
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true"/>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Onglet To-do ──────────────────────────────────────────────────────────────
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

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed
  );
  const priorityColor = (p: string) => ({
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-success/10 text-success border-success/20',
  }[p] ?? '');
  const priorityLabel = (p: string) => ({ high: 'Urgent', medium: 'Moyen', low: 'Faible' }[p] ?? '');

  return (
    <div className="space-y-3">
      {/* Formulaire */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-bold text-foreground">➕ Nouvelle tâche</p>
          <div className="flex gap-2">
            <Input aria-label="Titre de la tâche" value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Lire chap. 3 de Maths…"
              className="h-11 text-base flex-1"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
            <Button onClick={handleAdd} disabled={!title.trim()} className="h-11 w-11 shrink-0 p-0" aria-label="Ajouter">
              <Plus className="w-5 h-5" aria-hidden="true"/>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Priorité</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Todo['priority'])}>
                <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 Urgent</SelectItem>
                  <SelectItem value="medium">🟡 Moyen</SelectItem>
                  <SelectItem value="low">🟢 Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-due" className="text-sm text-muted-foreground mb-1 block">Échéance</Label>
              <Input id="task-due" type="date" value={dueDate}
                onChange={e => setDueDate(e.target.value)} className="h-11"/>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <div className="flex rounded-xl border border-border overflow-hidden" role="tablist">
        {(['all','pending','done'] as const).map(f => (
          <button type="button" key={f} role="tab" aria-selected={filter===f}
            onClick={() => setFilter(f)}
            className={`flex-1 min-h-[44px] text-xs font-medium transition-colors ${filter===f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
            {f==='all' ? `Toutes (${todos.length})` : f==='pending' ? `En cours (${todos.filter(t=>!t.completed).length})` : `Terminées (${todos.filter(t=>t.completed).length})`}
          </button>
        ))}
      </div>

      {todos.length > 0 && (
        <div className="flex justify-end">
          <ExportButton fileName="mes-taches-apprenix" variant="outline" size="sm" label="Exporter"
            getContent={() => ({
              title: 'Mes tâches — Apprenix',
              subtitle: `${todos.length} tâche${todos.length>1?'s':''} · exporté le ${new Date().toLocaleDateString('fr-FR')}`,
              sections: [
                { heading: 'En cours', body: todos.filter(t=>!t.completed).map(t=>`• [${priorityLabel(t.priority)}] ${t.title}${t.dueDate?` — ${new Date(t.dueDate).toLocaleDateString('fr-FR')}`:''}` ).join('\n') || 'Aucune.' },
                { heading: 'Terminées', body: todos.filter(t=>t.completed).map(t=>`✓ ${t.title}`).join('\n') || 'Aucune.' },
              ],
            })}/>
        </div>
      )}

      {todos.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-chart-2/10 flex items-center justify-center mb-3">
            <CheckSquare className="w-7 h-7 text-chart-2"/>
          </div>
          <p className="font-semibold text-foreground">Aucune tâche</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs text-pretty">Ajoutez votre première tâche ci-dessus !</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length===0 && todos.length>0 && (
          <p className="text-center text-sm text-muted-foreground py-6">Aucune tâche dans cette catégorie.</p>
        )}
        {filtered.map(todo => (
          <div key={todo.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${todo.completed ? 'opacity-55 bg-secondary border-border' : 'bg-card border-border hover:border-primary/30'}`}>
            <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="shrink-0 w-5 h-5"/>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium truncate block ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 shrink-0"/>{new Date(todo.dueDate).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <Badge className={`text-xs shrink-0 ${priorityColor(todo.priority)}`}>{priorityLabel(todo.priority)}</Badge>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:text-destructive"
              onClick={() => deleteTodo(todo.id)} aria-label={`Supprimer ${todo.title}`}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true"/>
            </Button>
          </div>
        ))}
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
  const toggleSession = (id: string) => setRevisionSessions(s => s.map(ss => ss.id===id ? { ...ss, completed: !ss.completed } : ss));
  const deleteSession = (id: string) => setRevisionSessions(s => s.filter(ss => ss.id!==id));

  const completed = revisionSessions.filter(s => s.completed).length;
  const progress  = revisionSessions.length ? (completed / revisionSessions.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-bold text-foreground">➕ Planifier une session</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-sm text-muted-foreground mb-1 block">Matière *</Label>
              <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Choisir…"/></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="rev-chap" className="text-sm text-muted-foreground mb-1 block">Chapitre</Label>
              <Input id="rev-chap" value={form.chapter}
                onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
                placeholder="Ex : Algèbre linéaire…" className="h-11 text-base"/>
            </div>
            <div>
              <Label htmlFor="rev-date" className="text-sm text-muted-foreground mb-1 block">Date *</Label>
              <Input id="rev-date" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-11"/>
            </div>
            <div>
              <Label htmlFor="rev-dur" className="text-sm text-muted-foreground mb-1 block">Durée (min)</Label>
              <Input id="rev-dur" type="number" inputMode="numeric" value={form.duration}
                min={15} step={15} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="h-11"/>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!form.subject || !form.date} className="h-11 w-full font-semibold">
            <Plus className="w-4 h-4 mr-1.5"/>Ajouter la session
          </Button>
        </CardContent>
      </Card>

      {revisionSessions.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Avancement</p>
              <span className="text-sm font-bold text-primary">{completed}/{revisionSessions.length}</span>
            </div>
            <Progress value={progress} className="h-2"/>
          </CardContent>
        </Card>
      )}

      {revisionSessions.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-chart-3/10 flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7 text-chart-3"/>
          </div>
          <p className="font-semibold text-foreground">Aucune session planifiée</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs text-pretty">
            Ajoutez votre première session ci-dessus.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {[...revisionSessions].sort((a,b) => a.date.localeCompare(b.date)).map(sess => (
          <div key={sess.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${sess.completed ? 'opacity-55 bg-secondary border-border' : 'bg-card border-border hover:border-primary/30'}`}>
            <Checkbox checked={sess.completed} onCheckedChange={() => toggleSession(sess.id)} className="shrink-0 w-5 h-5"/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{sess.subject}</Badge>
                {sess.chapter && <span className="text-sm text-foreground truncate">{sess.chapter}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0"/>{new Date(sess.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0"/>{sess.duration} min
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:text-destructive"
              onClick={() => deleteSession(sess.id)} aria-label={`Supprimer ${sess.subject}`}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true"/>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Onglet Pomodoro ───────────────────────────────────────────────────────────
const PomodoroTab: React.FC = () => {
  const { pomodoroSessions, addPomodoroSession } = useApp();
  const [workMin, setWorkMin]   = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak]   = useState(false);
  const [seconds, setSeconds]   = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSecs = (isBreak ? breakMin : workMin) * 60;
  const progress  = ((totalSecs - seconds) / totalSecs) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const today = new Date().toISOString().split('T')[0];
  const allTimeSessions = pomodoroSessions.reduce((a, s) => a + s.sessionCount, 0);
  const allTimeFocus    = pomodoroSessions.reduce((a, s) => a + s.workMinutes, 0);
  const todaySess  = pomodoroSessions.find(s => s.date === today);
  const todayCount = todaySess?.sessionCount ?? 0;
  const todayFocus = todaySess?.workMinutes ?? 0;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (!isBreak) {
              setSessions(c => c + 1);
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

  const reset  = () => { setIsRunning(false); setIsBreak(false); setSeconds(workMin * 60); };
  const toggle = () => setIsRunning(r => !r);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Timer */}
        <div className="flex-1 min-w-0 space-y-3">
          <Card className="shadow-sm">
            <CardContent className="p-5 flex flex-col items-center gap-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isBreak ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse':''} ${isBreak ? 'bg-success':'bg-primary'}`}/>
                {isBreak ? 'Pause 🌿' : isRunning ? 'Deep Focus 🎯' : 'Prêt à démarrer'}
              </div>

              {/* Cercle SVG */}
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="44" fill="none"
                    stroke={isBreak ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*44}`}
                    strokeDashoffset={`${2*Math.PI*44*(1-progress/100)}`}
                    className="transition-all duration-1000"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground tabular-nums" aria-live="polite">
                    {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
                  </span>
                  <span className="text-xs text-muted-foreground">{isBreak ? 'Pause' : 'Travail'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={toggle} className={`h-12 px-8 font-semibold ${isBreak ? 'bg-success text-success-foreground':'bg-primary text-primary-foreground'}`}>
                  {isRunning ? <><Pause className="w-4 h-4 mr-2"/>Pause</> : <><Play className="w-4 h-4 mr-2"/>Démarrer</>}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={reset} aria-label="Réinitialiser">
                  <RotateCcw className="w-4 h-4"/>
                </Button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {Array.from({ length: Math.min(sessions,8) }).map((_,i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-primary"/>
                ))}
                {sessions > 8 && <span className="text-xs text-muted-foreground">+{sessions-8}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{sessions} session{sessions!==1?'s':''} cette séance</p>
            </CardContent>
          </Card>

          {/* Personnalisation */}
          <Card className="shadow-sm">
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pom-work" className="text-sm text-muted-foreground mb-1 block">Travail (min)</Label>
                <Input id="pom-work" type="number" inputMode="numeric" value={workMin} min={1} max={120}
                  onChange={e => { setWorkMin(Number(e.target.value)); if (!isRunning && !isBreak) setSeconds(Number(e.target.value)*60); }}
                  className="h-11"/>
              </div>
              <div>
                <Label htmlFor="pom-break" className="text-sm text-muted-foreground mb-1 block">Pause (min)</Label>
                <Input id="pom-break" type="number" inputMode="numeric" value={breakMin} min={1} max={30}
                  onChange={e => setBreakMin(Number(e.target.value))} className="h-11"/>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:w-56 md:shrink-0">
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-1" aria-hidden="true"/>
              <p className="text-2xl font-bold text-primary">
                {sessions>0 ? Math.min(100,Math.round((sessions*workMin)/(sessions*workMin+sessions*(breakMin/4))*100)) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Score focus</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-chart-2"/>Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sessions</span><span className="font-bold">{todayCount+sessions}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Focus</span><span className="font-bold">{todayFocus+totalFocusMin} min</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">XP</span><span className="font-bold text-chart-4">{(todayCount+sessions)*25}</span></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-chart-3"/>Total</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sessions</span><span className="font-bold">{allTimeSessions+sessions}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Focus</span><span className="font-bold">{Math.floor((allTimeFocus+totalFocusMin)/60)}h{(allTimeFocus+totalFocusMin)%60}m</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">XP Pomo</span><span className="font-bold text-chart-4">{(allTimeSessions+sessions)*25}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Onglet Mémorisation ───────────────────────────────────────────────────────
const MemoriTab: React.FC = () => {
  const TECHNIQUES = [
    { icon:'📅', name:'Révisions espacées', desc:'Révisez à J+1, J+3, J+7, J+14, J+30. La courbe de l\'oubli prouve que cela double la mémorisation.', steps:['Révisez le soir du cours','Relisez le lendemain','Test à J+3','Révision J+7 et J+14','Consolidation J+30'] },
    { icon:'🍅', name:'Technique Pomodoro',  desc:'25 min de travail intense, 5 min de pause. Le cerveau mémorise mieux en sessions courtes.', steps:['Choisir une seule tâche','25 min sans interruption','Pause 5 min (bougez !)','Après 4 sessions : 20 min de pause'] },
    { icon:'🧠', name:'Méthode Feynman',     desc:'Expliquez le concept comme si vous l\'enseigniez. Ce qui n\'est pas clair révèle les lacunes.', steps:['Choisir un concept','L\'expliquer simplement','Identifier les zones floues','Revoir ces points','Réexpliquer'] },
    { icon:'🏛️', name:'Mémo Palace',         desc:'Associez les infos à des lieux imaginaires. Technique des champions de la mémoire.', steps:['Choisir un lieu familier','Créer un parcours mental','Associer chaque info à un lieu','Visualiser le parcours pour réviser'] },
  ];
  return (
    <div className="space-y-3">
      <div className="flex gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true"/>
        <p className="text-sm text-foreground text-pretty">Les techniques scientifiques de mémorisation peuvent multiplier votre efficacité par 3 à 5 !</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TECHNIQUES.map(t => (
          <Card key={t.name} className="shadow-sm h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{t.icon}</span>{t.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <p className="text-sm text-muted-foreground text-pretty">{t.desc}</p>
              <ol className="space-y-1.5">
                {t.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
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

// ─── Navigation par onglets ────────────────────────────────────────────────────
type TabId = 'agenda' | 'planning' | 'todo' | 'pomodoro' | 'memo';
const TABS: { id: TabId; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'agenda',   label: 'Agenda',    shortLabel: 'Agenda',   icon: Calendar     },
  { id: 'planning', label: 'Révisions', shortLabel: 'Révision', icon: BookOpen     },
  { id: 'todo',     label: 'To-do',     shortLabel: 'To-do',    icon: CheckSquare  },
  { id: 'pomodoro', label: 'Pomodoro',  shortLabel: 'Pomo',     icon: Timer        },
  { id: 'memo',     label: 'Méthodes',  shortLabel: 'Mémo',     icon: Brain        },
];

// ─── Page principale ───────────────────────────────────────────────────────────
const OrganisationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('agenda');

  return (
    <div className="min-w-0 flex flex-col gap-0">
      <SEO
        title="Organisation scolaire — Agenda, Planning & Pomodoro | Apprenix"
        description="Agenda scolaire, planning de révision, to-do list et minuteur Pomodoro. 100 % gratuit."
        canonical="/organisation"
        keywords="agenda scolaire gratuit, planning révision, to-do list étudiant, pomodoro en ligne"
        dateModified="2026-06-25"
      />
      <h1 className="sr-only">Organisation & Planning scolaire</h1>

      {/* En-tête compact */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-foreground">Organisation & Planning</h2>
            <ENBadge/>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Agenda · Révisions · To-do · Pomodoro · Méthodes</p>
        </div>
      </div>

      {/* Sélecteur d'onglets — icône + label court, toujours visible sur 375px */}
      <div className="flex rounded-xl bg-secondary/60 p-1 gap-0.5 mb-4" role="tablist" aria-label="Sections">
        {TABS.map(({ id, shortLabel, icon: Icon }) => (
          <button type="button" key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={[
              'flex flex-col items-center justify-center flex-1 min-h-[52px] gap-0.5 rounded-lg text-[10px] font-semibold transition-all',
              activeTab === id
                ? 'bg-card shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="w-4 h-4 shrink-0"/>
            <span className="leading-none whitespace-nowrap">{shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div id={`tabpanel-${activeTab}`} role="tabpanel">
        {activeTab === 'agenda'   && <AgendaTab/>}
        {activeTab === 'planning' && <PlanningTab/>}
        {activeTab === 'todo'     && <TodoTab/>}
        {activeTab === 'pomodoro' && <PomodoroTab/>}
        {activeTab === 'memo'     && <MemoriTab/>}
      </div>
    </div>
  );
};

export default OrganisationPage;
