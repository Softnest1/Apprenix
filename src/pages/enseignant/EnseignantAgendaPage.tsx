import {
  Calendar, CalendarDays, Clock, Edit3,
  Loader2, Plus, Trash2, X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AgendaEvent {
  id: string;
  title: string;
  date: string;   // ISO YYYY-MM-DD
  time: string;   // HH:mm
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function useAgenda(): [AgendaEvent[], (e: AgendaEvent) => void, (id: string) => void] {
  const { events, addEvent: ctxAddEvent, deleteEvent } = useApp();

  // Filtrer les événements de type 'cours' (agenda enseignant)
  // et les mapper vers AgendaEvent pour maintenir la compatibilité de l'UI existante
  const agendaEvents: AgendaEvent[] = events.map(ev => ({
    id:          ev.id,
    title:       ev.title,
    date:        ev.eventDate,
    time:        ev.startTime ?? '',
    description: ev.notes ?? '',
    // Mapper eventType vers une couleur
    color: (ev.eventType === 'examen'   ? 'orange'
         :  ev.eventType === 'devoir'   ? 'purple'
         :  ev.eventType === 'revision' ? 'green'
         :                               'blue') as AgendaEvent['color'],
  }));

  const add = (e: AgendaEvent) => {
    ctxAddEvent({
      title:     e.title,
      eventDate: e.date,
      eventType: 'cours',
      startTime: e.time || undefined,
      notes:     e.description || undefined,
    });
  };

  return [agendaEvents, add, deleteEvent];
}

const COLORS: AgendaEvent['color'][] = ['blue','green','orange','purple'];
const colorClass: Record<AgendaEvent['color'], string> = {
  blue:   'bg-info/10 border-info/30 text-info',
  green:  'bg-success/10 border-success/30 text-success',
  orange: 'bg-warning/10 border-warning/30 text-warning-foreground',
  purple: 'bg-primary/10 border-primary/30 text-primary',
};
const dotClass: Record<AgendaEvent['color'], string> = {
  blue: 'bg-info', green: 'bg-success', orange: 'bg-warning', purple: 'bg-primary',
};

function EventModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: AgendaEvent) => void }) {
  const [title, setTitle] = useState('');
  const [date,  setDate]  = useState('');
  const [time,  setTime]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [color, setColor] = useState<AgendaEvent['color']>('blue');

  const submit = () => {
    if (!title.trim()) { toast.error('Le titre est obligatoire.'); return; }
    if (!date)         { toast.error('Veuillez sélectionner une date.'); return; }
    onAdd({ id: crypto.randomUUID(), title: title.trim(), date, time, description: desc.trim(), color });
    toast.success('Événement ajouté !');
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
        <DialogHeader><DialogTitle>Ajouter un événement</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ev-title" className="text-sm font-normal text-muted-foreground mb-1.5">Titre *</Label>
            <Input id="ev-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Cours de Maths 3e" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ev-date" className="text-sm font-normal text-muted-foreground mb-1.5">Date *</Label>
              <Input id="ev-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ev-time" className="text-sm font-normal text-muted-foreground mb-1.5">Heure</Label>
              <Input id="ev-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="ev-desc" className="text-sm font-normal text-muted-foreground mb-1.5">Description</Label>
            <Textarea id="ev-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Détails de l'événement…" rows={2} />
          </div>
          <div>
            <Label className="text-sm font-normal text-muted-foreground mb-2 block">Couleur</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${dotClass[c]} ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={submit} disabled={!title.trim() || !date}>
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnseignantAgendaPage() {
  const [events, addEvent, removeEvent] = useAgenda();
  const [modal, setModal] = useState(false);

  // Grouper par date
  const grouped = events.reduce<Record<string, AgendaEvent[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] ?? []).push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const today = new Date().toISOString().split('T')[0];
  const upcoming = sortedDates.filter(d => d >= today);
  const past     = sortedDates.filter(d => d < today);

  const renderEvent = (ev: AgendaEvent) => (
    <div key={ev.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass[ev.color]} group`}>
      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotClass[ev.color]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
        {ev.time && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {ev.time}
          </p>
        )}
        {ev.description && <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{ev.description}</p>}
      </div>
      <button type="button" onClick={() => removeEvent(ev.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <SEO title="Agenda — Espace Enseignant" description="Planifiez vos cours et événements." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Agenda & Planning</h1>
            <p className="text-sm text-muted-foreground">{events.length} événement(s)</p>
          </div>
          <Button size="sm" onClick={() => setModal(true)} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">📅 Comment planifier vos cours ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Cliquez sur <strong>"Ajouter"</strong> · Saisissez le titre (ex : <em>"Cours Maths 3e"</em>), la date, l'heure et une couleur · Cliquez <strong>"Ajouter"</strong> pour confirmer. Vos événements sont classés par date — passés et à venir — et partagés avec votre agenda principal.
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun événement planifié</p>
            <p className="text-sm mt-1">Ajoutez vos cours et événements à venir</p>
            <Button className="mt-4 gap-1.5" onClick={() => setModal(true)}>
              <Plus className="w-4 h-4" /> Ajouter un événement
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> À venir
                </h2>
                <div className="space-y-4">
                  {upcoming.map(date => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 capitalize">
                        {formatDate(date)}
                        {date === today && <span className="ml-2 text-primary font-bold">· Aujourd'hui</span>}
                      </p>
                      <div className="space-y-2">{grouped[date].map(renderEvent)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Passés
                </h2>
                <div className="space-y-4 opacity-60">
                  {past.map(date => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 capitalize">{formatDate(date)}</p>
                      <div className="space-y-2">{grouped[date].map(renderEvent)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      {modal && <EventModal onClose={() => setModal(false)} onAdd={addEvent} />}
    </>
  );
}
