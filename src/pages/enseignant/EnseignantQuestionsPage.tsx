import {
  BookOpen, ChevronRight, Clock, Eye,
  FileText, Filter, HelpCircle, Loader2,
  MessageSquare, Send,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createTeacherAnswer, getAllOpenQuestions, getAnswersForQuestion,
} from '@/lib/api';
import type { DbStudentQuestion } from '@/db/supabase';

function statusBadge(s: string) {
  const map: Record<string, string> = {
    open:     'bg-warning/10 text-warning-foreground border-warning/30',
    answered: 'bg-success/10 text-success border-success/30',
    closed:   'bg-muted text-muted-foreground border-border',
  };
  const labels: Record<string, string> = { open: 'En attente', answered: 'Répondu', closed: 'Fermé' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[s] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {labels[s] ?? s}
    </span>
  );
}

function ReponseModal({ question, onClose, onSuccess }: {
  question: DbStudentQuestion; onClose: () => void; onSuccess: () => void;
}) {
  const [body, setBody]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [existing, setExisting] = useState<{ content?: string }[]>([]);

  useEffect(() => {
    getAnswersForQuestion(question.id).then(ans => setExisting(ans));
  }, [question.id]);

  const submit = async () => {
    if (!body.trim()) { toast.error('La réponse ne peut pas être vide.'); return; }
    setLoading(true);
    try {
      await createTeacherAnswer({ question_id: question.id, content: body.trim() });
      toast.success('Réponse publiée avec succès !');
      onSuccess();
    } catch { toast.error('Erreur lors de la publication.'); } finally { setLoading(false); }
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-balance leading-snug">{question.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground text-pretty leading-relaxed">
            {question.content}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {statusBadge(question.status ?? '')}
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{question.subject}</span>
            <span>{question.level}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(question.created_at ?? '').toLocaleDateString('fr-FR')}</span>
          </div>
          {existing.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Réponses existantes ({existing.length})</p>
              {existing.map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-success/5 border border-success/20 text-sm text-foreground text-pretty">
                  {a.content}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Votre réponse</label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Rédigez une réponse claire et pédagogique…"
              rows={4}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button onClick={submit} disabled={loading || !body.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Publier la réponse
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnseignantQuestionsPage() {
  const [questions, setQuestions] = useState<DbStudentQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<'all' | 'open' | 'answered'>('all');
  const [selected,  setSelected]  = useState<DbStudentQuestion | null>(null);

  useEffect(() => {
    getAllOpenQuestions(200).then(q => { setQuestions(q); setLoading(false); });
  }, []);

  const reload = () => getAllOpenQuestions(200).then(setQuestions);

  const filtered = filter === 'all' ? questions : questions.filter(q => q.status === filter);
  const openCount = questions.filter(q => q.status === 'open').length;

  return (
    <>
      <SEO title="Questions élèves — Espace Enseignant" description="Répondez aux questions des élèves sur Apprenix." />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20">
          <HelpCircle className="w-5 h-5 text-warning-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">❓ Comment répondre aux élèves ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Les questions <strong>en attente</strong> (badge orange) nécessitent une réponse. Cliquez sur <strong>"Répondre"</strong>, rédigez une explication pédagogique et cliquez <strong>"Publier"</strong>. L'élève verra votre réponse dans son espace.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">Questions des élèves</h1>
            <p className="text-sm text-muted-foreground">{openCount} en attente de réponse</p>
          </div>
          <div className="md:ml-auto flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="open">En attente</SelectItem>
                <SelectItem value="answered">Répondues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucune question</p>
            <p className="text-sm mt-1">Les questions des élèves apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(q.status ?? '')}
                        <span className="text-xs text-muted-foreground">{q.subject} · {q.level}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(q.created_at ?? '').toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-balance">{q.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{q.content}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelected(q)}
                      className="shrink-0 gap-1.5"
                      variant={q.status === 'answered' ? 'outline' : 'default'}
                    >
                      {q.status === 'answered' ? <Eye className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      {q.status === 'answered' ? 'Voir' : 'Répondre'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <ReponseModal
          question={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); reload(); }}
        />
      )}
    </>
  );
}
