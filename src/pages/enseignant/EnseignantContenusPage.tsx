import {
  BookOpen, Filter, Loader2, Plus, Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
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
import { useApp } from '@/contexts/AppContext';
import { createContent, getMyContents } from '@/lib/api';
import type { DbContentItem } from '@/db/supabase';

const SUBJECTS = ['Maths','Français','Histoire-Géo','Anglais','Physique-Chimie','SVT','Philosophie','NSI','Espagnol','Allemand','SES','Arts plastiques'];
const LEVELS   = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde','1ère','Terminale','BTS','Licence'];
const TYPES    = [
  { value: 'course',   label: 'Cours complet' },
  { value: 'sheet',    label: 'Fiche de révision' },
  { value: 'exercise', label: 'Exercice' },
  { value: 'resource', label: 'Ressource' },
] as const;

function ContenuModal({ userId, onClose, onSuccess }: { userId: string; onClose: () => void; onSuccess: () => void; }) {
  const [title,   setTitle]   = useState('');
  const [type,    setType]    = useState<string>('sheet');
  const [subject, setSubject] = useState('');
  const [level,   setLevel]   = useState('');
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !subject || !level || !body.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.'); return;
    }
    setLoading(true);
    try {
      await createContent({
        title: title.trim(), type: type as string,
        subject, level, body: body.trim(),
        author_id: userId, status: 'published', is_ai_generated: false,
      });
      toast.success('Contenu publié !');
      onSuccess();
    } catch { toast.error('Erreur lors de la publication.'); } finally { setLoading(false); }
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader><DialogTitle>Nouveau contenu pédagogique</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ct-title" className="text-sm font-normal text-muted-foreground mb-1.5">Titre *</Label>
            <Input id="ct-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du contenu" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-1.5">Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-1.5">Matière *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-normal text-muted-foreground mb-1.5">Niveau *</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
              <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ct-body" className="text-sm font-normal text-muted-foreground mb-1.5">Contenu *</Label>
            <Textarea id="ct-body" value={body} onChange={e => setBody(e.target.value)} placeholder="Rédigez votre contenu…" rows={5} />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button onClick={submit} disabled={loading || !title.trim() || !subject || !level || !body.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
              Publier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnseignantContenusPage() {
  const { profile } = useApp();
  const [contents, setContents] = useState<DbContentItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<'all' | 'course' | 'sheet' | 'exercise'>('all');
  const [modal,    setModal]    = useState(false);

  useEffect(() => { getMyContents(profile.id, 100).then(c => { setContents(c); setLoading(false); }); }, [profile.id]);

  const reload = () => getMyContents(profile.id, 100).then(setContents);
  const filtered = filter === 'all' ? contents : contents.filter(c => c.type === filter);
  const typeLabel: Record<string, string> = { course: 'Cours', sheet: 'Fiche', exercise: 'Exercice', resource: 'Ressource' };

  return (
    <>
      <SEO title="Mes contenus — Espace Enseignant" description="Gérez vos cours, fiches et exercices pédagogiques." />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">📚 Comment publier un contenu ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Cliquez sur <strong>"Nouveau"</strong> · Choisissez le type (Cours, Fiche, Exercice) · Sélectionnez la matière et le niveau · Rédigez le contenu · Cliquez <strong>"Publier"</strong>. Les élèves verront votre contenu dans la bibliothèque de ressources.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">Mes contenus</h1>
            <p className="text-sm text-muted-foreground">{contents.length} contenu(s) créé(s)</p>
          </div>
          <div className="md:ml-auto flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="course">Cours</SelectItem>
                <SelectItem value="sheet">Fiches</SelectItem>
                <SelectItem value="exercise">Exercices</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setModal(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Nouveau
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun contenu</p>
            <p className="text-sm mt-1">Créez votre premier cours ou fiche de révision</p>
            <Button className="mt-4 gap-1.5" onClick={() => setModal(true)}>
              <Plus className="w-4 h-4" /> Créer un contenu
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          c.status === 'published' ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'
                        }`}>{c.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                        <span className="text-xs text-muted-foreground">{typeLabel[c.type ?? ''] ?? c.type}</span>
                        <span className="text-xs text-muted-foreground">{c.subject} · {c.level ?? ''}</span>
                      </div>
                      <p className="font-semibold text-foreground text-balance">{c.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {c.is_ai_generated ? '⚠ Auto' : '✅ Humain'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at ?? '').toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <ContenuModal userId={profile.id} onClose={() => setModal(false)} onSuccess={() => { setModal(false); reload(); }} />
      )}
    </>
  );
}
