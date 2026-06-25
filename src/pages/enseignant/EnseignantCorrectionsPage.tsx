import {
  CheckCircle, ClipboardList, Clock,
  Eye, Filter, Loader2, Save, Star,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getAllSubmissions, gradeSubmission } from '@/lib/api';
import type { DbStudentSubmission } from '@/db/supabase';

function statusBadge(s: string) {
  const map: Record<string, string> = {
    submitted: 'bg-info/10 text-info border-info/30',
    reviewed:  'bg-warning/10 text-warning-foreground border-warning/30',
    graded:    'bg-success/10 text-success border-success/30',
  };
  const labels: Record<string, string> = { submitted: 'Rendu', reviewed: 'En correction', graded: 'Noté' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[s] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {labels[s] ?? s}
    </span>
  );
}

function NoteModal({ sub, onClose, onSuccess }: {
  sub: DbStudentSubmission; onClose: () => void; onSuccess: () => void;
}) {
  const [grade,   setGrade]   = useState(sub.grade?.toString() ?? '');
  const [comment, setComment] = useState(sub.teacher_feedback ?? '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const g = parseFloat(grade);
    if (isNaN(g) || g < 0 || g > 20) { toast.error('La note doit être entre 0 et 20.'); return; }
    setLoading(true);
    try {
      await gradeSubmission(sub.id, '', g, comment.trim());
      toast.success('Correction enregistrée !');
      onSuccess();
    } catch { toast.error('Erreur lors de l\'enregistrement.'); } finally { setLoading(false); }
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-balance">{sub.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {statusBadge(sub.status ?? '')}
            <span>{sub.subject}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(sub.created_at ?? '').toLocaleDateString('fr-FR')}</span>
          </div>
          {sub.file_url && (
            <div className="flex flex-wrap gap-2">
              <a href={sub.file_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline border border-border rounded-lg px-2.5 py-1.5 bg-card">
                <Eye className="w-3 h-3" /> Voir le fichier
              </a>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="grade" className="text-sm font-normal text-muted-foreground mb-1.5">Note /20</Label>
              <Input id="grade" type="number" min="0" max="20" step="0.5" value={grade}
                onChange={e => setGrade(e.target.value)} placeholder="Ex : 14.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="comment" className="text-sm font-normal text-muted-foreground mb-1.5">Commentaires / retours</Label>
            <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Points forts, points à améliorer…" rows={4} disabled={loading} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button onClick={save} disabled={loading || !grade}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnseignantCorrectionsPage() {
  const [subs,    setSubs]    = useState<DbStudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<'all' | 'submitted' | 'graded'>('all');
  const [selected,setSelected]= useState<DbStudentSubmission | null>(null);

  useEffect(() => { getAllSubmissions(200).then(s => { setSubs(s); setLoading(false); }); }, []);

  const reload = () => getAllSubmissions(200).then(setSubs);
  const filtered  = filter === 'all' ? subs : subs.filter(s => s.status === filter);
  const pendingCount = subs.filter(s => s.status === 'submitted').length;

  return (
    <>
      <SEO title="Copies à corriger — Espace Enseignant" description="Corrigez les travaux soumis par les élèves sur Apprenix." />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-info/5 border border-info/20">
          <ClipboardList className="w-5 h-5 text-info shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">📝 Comment corriger une copie ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Cliquez sur <strong>"Corriger"</strong> sur une copie <em>Rendue</em> · Consultez le fichier joint si disponible · Entrez la note sur 20 et vos commentaires · Cliquez <strong>"Enregistrer"</strong>. L'élève verra sa note dans son espace.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">Copies à corriger</h1>
            <p className="text-sm text-muted-foreground">{pendingCount} copie{pendingCount !== 1 ? 's' : ''} en attente</p>
          </div>
          <div className="md:ml-auto flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="submitted">À corriger</SelectItem>
                <SelectItem value="graded">Corrigées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucune copie</p>
            <p className="text-sm mt-1">Les travaux des élèves apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(s.status ?? '')}
                        <span className="text-xs text-muted-foreground">{s.subject}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(s.created_at ?? '').toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {s.title && <p className="font-semibold text-foreground text-balance">{s.title}</p>}
                      {s.file_url && (
                        <div className="flex flex-wrap gap-1.5">
                          <a href={s.file_url} target="_blank" rel="noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Voir le fichier
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {s.status === 'graded' ? (
                        <div className="text-right">
                          <p className="text-xl font-bold text-success">{s.grade}/20</p>
                          <Button variant="outline" size="sm" className="mt-1 gap-1.5" onClick={() => setSelected(s)}>
                            <Eye className="w-3.5 h-3.5" /> Voir
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setSelected(s)} className="gap-1.5">
                          <Star className="w-3.5 h-3.5" /> Corriger
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <NoteModal sub={selected} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); reload(); }} />
      )}
    </>
  );
}
