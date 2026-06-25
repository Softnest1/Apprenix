import {
  CheckCircle, Clock, FileText, Loader2, Plus,
  Send, Star, UploadCloud, X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import {
  createSubmission,
  getMySubmissions,
  uploadSubmissionFile,
} from '@/lib/api';
import type { DbStudentSubmission } from '@/db/supabase';

const SUBJECTS = ['Maths','Français','Histoire-Géo','Anglais','Physique-Chimie',
  'SVT','Philosophie','NSI','Espagnol','Allemand','SES','Arts plastiques'];

// ─── Carte dépôt ──────────────────────────────────────────────────────────────
function DepotCard({ s }: { s: DbStudentSubmission }) {
  const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    submitted: { label: 'Rendu — en attente',  color: 'bg-info/10 text-info border-info/30',        icon: Clock        },
    reviewed:  { label: 'En cours de correction', color: 'bg-warning/10 text-warning-foreground border-warning/30', icon: FileText     },
    graded:    { label: 'Noté',                color: 'bg-success/10 text-success border-success/30', icon: CheckCircle  },
  };
  const info = statusMap[s.status ?? 'submitted'] ?? statusMap.submitted;
  const Icon = info.icon;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
                <Icon className="w-3 h-3" /> {info.label}
              </span>
              <span className="text-xs text-muted-foreground">{s.subject}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(s.created_at ?? '').toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="font-semibold text-foreground text-balance">{s.title}</p>
            {s.file_url && (
              <div className="flex flex-wrap gap-2 mt-1">
                <a href={s.file_url} target="_blank" rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 border border-primary/20 rounded px-2 py-0.5">
                  <FileText className="w-3 h-3" /> Voir le fichier
                </a>
              </div>
            )}
          </div>
          {s.status === 'graded' && (
            <div className="shrink-0 text-center md:text-right">
              <div className="flex items-center gap-1 text-success font-bold text-xl">
                <Star className="w-5 h-5" />
                {s.grade !== undefined && s.grade !== null ? `${s.grade}/20` : '—'}
              </div>
            </div>
          )}
        </div>
        {s.teacher_feedback && (
          <div className="rounded-lg bg-success/5 border border-success/20 p-3 text-sm space-y-1">
            <p className="font-medium text-success flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Retour de l'enseignant
            </p>
            <p className="text-foreground text-pretty">{s.teacher_feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Formulaire nouveau dépôt ─────────────────────────────────────────────────
function NouveauDepotForm({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState({ title: '', subject: '', description: '' });
  const [files, setFiles]   = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f => f.size < 52_428_800);
    const rejected = Array.from(incoming).length - valid.length;
    if (rejected > 0) toast.warning(`${rejected} fichier(s) ignoré(s) — taille max 50 Mo`);
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  const submit = async () => {
    if (!form.title.trim() || !form.subject || files.length === 0) {
      toast.error('Titre, matière et au moins 1 fichier sont requis.'); return;
    }
    setLoading(true);
    setProgress(0);
    try {
      const urls: string[] = [];
      const types: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadSubmissionFile(userId, files[i]);
        if (url) { urls.push(url); types.push(files[i].type); }
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      if (urls.length === 0) { toast.error('Échec de l\'envoi des fichiers.'); return; }
      await createSubmission({
        subject: form.subject,
        title: form.title.trim(),
        file_url: urls[0] ?? '',
        status: 'submitted',
      });
      toast.success('Dépôt envoyé ! Votre enseignant vous répondra bientôt.');
      setForm({ title: '', subject: '', description: '' });
      setFiles([]);
      setOpen(false);
      onSuccess();
    } catch { toast.error('Erreur lors du dépôt.'); }
    finally { setLoading(false); setProgress(0); }
  };

  if (!open) return (
    <Card className="border-dashed border-2 border-primary/30 hover:border-primary/60 transition-colors cursor-pointer"
      onClick={() => setOpen(true)}>
      <CardContent className="p-6 flex items-center justify-center gap-3 text-primary">
        <UploadCloud className="w-5 h-5" />
        <span className="font-medium">Déposer un nouveau travail</span>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Nouveau dépôt</h2>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Matière <span className="text-destructive">*</span></Label>
            <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Titre du travail <span className="text-destructive">*</span></Label>
            <Input placeholder="ex : Devoir maison — fonctions"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description (optionnel)</Label>
          <Textarea rows={3} placeholder="Précisions, consignes, remarques..."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {/* Zone de dépôt fichiers */}
        <div className="space-y-2">
          <Label>Fichiers <span className="text-destructive">*</span> (PDF, images, Word — max 50 Mo chacun, 5 fichiers)</Label>
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          >
            <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Cliquez ou glissez vos fichiers ici</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX — max 50 Mo par fichier</p>
          </div>
          <input ref={fileRef} type="file" multiple accept=".pdf,image/*,.doc,.docx" className="hidden"
            onChange={e => addFiles(e.target.files)} />
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
                  <span className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-xs">({(f.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                    className="shrink-0 text-destructive hover:opacity-70 ml-2">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading && progress > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Envoi en cours… {progress}%</p>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
          <Button onClick={submit} disabled={loading || files.length === 0 || !form.title || !form.subject}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Envoyer le travail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page principale
// ═══════════════════════════════════════════════════════════════════════════════
export default function MesDepotsPage() {
  const { profile, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<DbStudentSubmission[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<'all' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/connexion'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try { setSubmissions(await getMySubmissions(profile.id, 50)); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? submissions
    : filter === 'graded' ? submissions.filter(s => s.status === 'graded')
    : submissions.filter(s => s.status !== 'graded');

  const graded = submissions.filter(s => s.status === 'graded');
  const avgGrade = graded.length > 0
    ? (graded.reduce((acc, s) => acc + (s.grade ?? 0), 0) / graded.length).toFixed(1)
    : null;

  return (
    <>
      <SEO
        title="Mes Dépôts — Apprenix"
        description="Déposez vos travaux et recevez les corrections et notes de vos enseignants."
      />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance">Mes Dépôts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Envoyez vos travaux — corrections humaines garanties
            </p>
          </div>
          {avgGrade && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-2">
              <Star className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">Moyenne : {avgGrade}/20</span>
            </div>
          )}
        </div>

        <NouveauDepotForm userId={profile.id} onSuccess={load} />

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'submitted', 'graded'] as const).map(f => (
            <button key={f} type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}>
              {{ all: 'Tous', submitted: 'En attente', graded: 'Notés' }[f]}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({submissions.filter(s => f === 'graded' ? s.status === 'graded' : s.status !== 'graded').length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UploadCloud className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun dépôt dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => <DepotCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </>
  );
}
