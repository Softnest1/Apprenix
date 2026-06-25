import {
  CheckCircle, ChevronDown, ChevronUp, Clock, HelpCircle,
  Loader2, MessageSquare, Plus, Send, X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import {
  closeStudentQuestion,
  createStudentQuestion,
  getAnswersForQuestion,
  getMyQuestions,
  uploadQuestionAttachment,
} from '@/lib/api';
import type { DbStudentQuestion, DbTeacherAnswer } from '@/db/supabase';

const SUBJECTS = ['Maths','Français','Histoire-Géo','Anglais','Physique-Chimie','SVT',
  'Philosophie','NSI','Espagnol','Allemand','SES','Arts plastiques'];
const LEVELS   = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde','1ère','Terminale','BTS','Licence'];

// ─── Carte question avec réponses dépliables ──────────────────────────────────
function QuestionCard({ q, onClose }: { q: DbStudentQuestion; onClose: () => void }) {
  const [open, setOpen]     = useState(false);
  const [answers, setAnswers] = useState<DbTeacherAnswer[]>([]);
  const [loadingA, setLoadingA] = useState(false);

  const handleExpand = async () => {
    if (!open && answers.length === 0) {
      setLoadingA(true);
      try { setAnswers(await getAnswersForQuestion(q.id)); }
      finally { setLoadingA(false); }
    }
    setOpen(v => !v);
  };

  const statusColor: Record<string, string> = {
    open:     'bg-warning/10 text-warning-foreground border-warning/30',
    answered: 'bg-success/10 text-success border-success/30',
    closed:   'bg-muted text-muted-foreground border-border',
  };
  const statusLabel: Record<string, string> = {
    open: 'En attente', answered: 'Répondue', closed: 'Fermée',
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[q.status ?? ''] ?? ''}`}>
                {statusLabel[q.status ?? ''] ?? q.status}
              </span>
              <span className="text-xs text-muted-foreground">{q.subject} · {q.level}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(q.created_at ?? '').toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="font-medium text-foreground text-balance">{q.title}</p>
            <p className="text-sm text-muted-foreground text-pretty">{q.content}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={handleExpand}>
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="ml-1 hidden md:inline">Réponses</span>
            </Button>
            {q.status === 'open' && (
              <Button size="sm" variant="outline" onClick={onClose}
                className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {open && (
          <div className="border-t border-border pt-3 space-y-2">
            {loadingA && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
            {!loadingA && answers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">Aucune réponse pour l'instant — un enseignant vous répondra bientôt.</p>
            )}
            {!loadingA && answers.map(a => (
              <div key={a.id} className="rounded-lg bg-muted/50 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                  {a.is_official && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Réponse officielle
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(a.created_at ?? '').toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-foreground text-pretty">{a.content ?? a.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Formulaire nouvelle question ────────────────────────────────────────────
function NouvelleQuestionForm({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState({ title: '', subject: '', level: '', content: '' });
  const [file, setFile]   = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!form.title.trim() || !form.subject || !form.level || !form.content.trim()) {
      toast.error('Veuillez remplir tous les champs.'); return;
    }
    setLoading(true);
    try {
      const attachments: string[] = [];
      if (file) {
        const url = await uploadQuestionAttachment(userId, file);
        if (url) attachments.push(url);
      }
      await createStudentQuestion({
        subject: form.subject,
        level: form.level,
        title: form.title.trim(),
        content: form.content.trim(),
        status: 'open',
      });
      toast.success('Question envoyée ! Un enseignant vous répondra bientôt.');
      setForm({ title: '', subject: '', level: '', content: '' });
      setFile(null);
      setOpen(false);
      onSuccess();
    } catch { toast.error('Erreur lors de l\'envoi.'); }
    finally { setLoading(false); }
  };

  if (!open) return (
    <Card className="border-dashed border-2 border-primary/30 hover:border-primary/60 transition-colors cursor-pointer"
      onClick={() => setOpen(true)}>
      <CardContent className="p-6 flex items-center justify-center gap-3 text-primary">
        <Plus className="w-5 h-5" />
        <span className="font-medium">Poser une nouvelle question à un enseignant</span>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Nouvelle question</h2>
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
            <Label>Niveau <span className="text-destructive">*</span></Label>
            <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
              <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
              <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Titre de la question <span className="text-destructive">*</span></Label>
          <Input placeholder="ex : Pourquoi les fonctions dérivées ?"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Détails <span className="text-destructive">*</span></Label>
          <Textarea rows={4} placeholder="Décrivez votre problème avec précision..."
            value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter un fichier
          </Button>
          {file && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {file.name}
              <button type="button" onClick={() => setFile(null)} className="text-destructive hover:opacity-70 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <input ref={fileRef} type="file" accept=".pdf,image/*,audio/*" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Envoyer la question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page principale
// ═══════════════════════════════════════════════════════════════════════════════
export default function MesQuestionsPage() {
  const { profile, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<DbStudentQuestion[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | 'open' | 'answered' | 'closed'>('all');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/connexion'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try { setQuestions(await getMyQuestions(profile.id, 50)); }
    finally { setLoading(false); }
  };

  const handleClose = async (id: string) => {
    try { await closeStudentQuestion(id); await load(); toast.success('Question fermée.'); }
    catch { toast.error('Erreur.'); }
  };

  const filtered = filter === 'all' ? questions : questions.filter(q => q.status === filter);

  return (
    <>
      <SEO
        title="Mes Questions — Apprenix"
        description="Posez vos questions à nos enseignants et retrouvez leurs réponses officielles."
      />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance">Mes Questions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Posez vos questions à nos enseignants — réponses humaines garanties, aucune génération automatique
          </p>
        </div>

        <NouvelleQuestionForm userId={profile.id} onSuccess={load} />

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {(['all','open','answered','closed'] as const).map(f => (
            <button key={f} type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}>
              {{ all: 'Toutes', open: 'En attente', answered: 'Répondues', closed: 'Fermées' }[f]}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({questions.filter(q => q.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucune question dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => (
              <QuestionCard key={q.id} q={q} onClose={() => handleClose(q.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
