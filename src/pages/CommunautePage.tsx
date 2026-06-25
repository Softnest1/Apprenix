import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CommentCard from '@/components/community/CommentCard';
import CommentForm from '@/components/community/CommentForm';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/db/supabase';
import { useComments } from '@/hooks/useComments';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any


import {Award, 
  BookOpen, CheckCircle,ChevronDown, ChevronUp,
  Loader2,Medal, MessageCircle, MessageSquare, Plus,Search, Send, Star, ThumbsUp, 
  Trophy, User, 
  Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { SCHOOL_LEVELS, SCHOOL_SUBJECTS } from '@/lib/constants';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CommunityAnswer {
  id: string;
  authorName: string;
  authorLevel: string;
  content: string;
  upvotes: number;
  date: string;
  userVote: 'up' | null; // stocké en localStorage pour éviter le spam sans auth
}

interface CommunityQuestion {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  authorName: string;
  date: string;
  answers: CommunityAnswer[];
  tags: string[];
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const SUBJECTS = SCHOOL_SUBJECTS as readonly string[];
const LEVELS   = SCHOOL_LEVELS   as readonly string[];

const SUBJECT_COLORS: Record<string, string> = {
  Maths: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  Physique: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  Chimie: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  SVT: 'bg-success/15 text-success border-success/30',
  Histoire: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  Français: 'bg-primary/15 text-primary border-primary/30',
  Philosophie: 'bg-chart-4/15 text-chart-4 border-chart-4/30' };

const getRankIcon = (i: number) => {
  if (i === 0) return <Trophy className="w-4 h-4 text-warning" />;
  if (i === 1) return <Medal className="w-4 h-4 text-muted-foreground" />;
  if (i === 2) return <Award className="w-4 h-4 text-chart-5" />;
  return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{i + 1}</span>;
};

// ─── Helpers Supabase ─────────────────────────────────────────────────────────

// Charge toutes les questions + leurs réponses depuis Supabase
async function fetchQuestions(): Promise<CommunityQuestion[]> {
  const { data: qRows, error: qErr } = await supabase
    .from('community_questions')
    .select('id, title, description, subject, level, author_name, tags, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (qErr || !qRows) return [];

  const { data: aRows } = await supabase
    .from('community_answers')
    .select('id, question_id, author_name, author_level, content, upvotes, created_at')
    .order('upvotes', { ascending: false })
    .limit(500);

  const answersMap: Record<string, CommunityAnswer[]> = {};
  (aRows ?? []).forEach(a => {
    if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
    answersMap[a.question_id].push({
      id: a.id,
      authorName: a.author_name,
      authorLevel: a.author_level,
      content: a.content,
      upvotes: a.upvotes,
      date: new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      userVote: null });
  });

  return qRows.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    subject: q.subject,
    level: q.level,
    authorName: q.author_name,
    date: new Date(q.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    tags: q.tags ?? [],
    answers: answersMap[q.id] ?? [] }));
}

// ─── Composant principal ───────────────────────────────────────────────────────

const CommunautePage: React.FC = () => {
  const { profile, addXp, addActivity, isAuthenticated } = useApp();
  const { comments, addComment, likeComment } = useComments();
  const [showCommentForm, setShowCommentForm] = useState(false);

  // ── Données réelles depuis Supabase (partagées entre tous les utilisateurs) ──
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Votes stockés en localStorage pour éviter le spam sans auth
  const [localVotes, setLocalVotes] = useLocalStorage<Record<string, 'up'>>('apprenix_answer_votes', {});

  const [activeSubject, setActiveSubject] = useState<string>('Toutes');
  const [activeLevel, setActiveLevel] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // ── Chargement initial depuis Supabase ──────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const data = await fetchQuestions();
    // Injecter les votes locaux dans les réponses
    const enriched = data.map(q => ({
      ...q,
      answers: q.answers.map(a => ({ ...a, userVote: localVotes[a.id] ?? null })) }));
    setQuestions(enriched);
    setLoading(false);
  }, [localVotes]);

  useEffect(() => { loadQuestions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Leaderboard depuis les upvotes réels ────────────────────────────────────
  const leaderboard = useMemo(() => {
    const scores: Record<string, { name: string; score: number; level: string }> = {};
    questions.forEach(q => {
      q.answers.forEach(a => {
        if (!scores[a.authorName]) scores[a.authorName] = { name: a.authorName, score: 0, level: a.authorLevel };
        scores[a.authorName].score += a.upvotes;
      });
    });
    return Object.values(scores).sort((a, b) => b.score - a.score).slice(0, 8);
  }, [questions]);

  const filtered = questions.filter(q => {
    const matchSub = activeSubject === 'Toutes' || q.subject === activeSubject;
    const matchLvl = activeLevel === 'Tous' || q.level === activeLevel;
    const matchSearch = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSub && matchLvl && matchSearch;
  });

  // ── Publier une question dans Supabase ──────────────────────────────────────
  const handlePublishQuestion = async () => {
    if (!newTitle.trim() || !newSubject || !newLevel) return;
    setSubmitting(true);
    const { error } = await supabase.from('community_questions').insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      subject: newSubject,
      level: newLevel,
      author_name: profile.name || 'Anonyme',
      tags: [newSubject, newLevel] });
    setSubmitting(false);
    if (error) { toast.error('Erreur lors de la publication. Réessayez.'); return; }
    setNewTitle(''); setNewDesc(''); setNewSubject(''); setNewLevel('');
    setShowNewQuestion(false);
    addXp(10);
    addActivity('Question publiée dans la Communauté');
    toast.success('Question publiée ! Elle est maintenant visible par tous les élèves.');
    await loadQuestions();
  };

  // ── Publier une réponse dans Supabase ───────────────────────────────────────
  const handlePublishAnswer = async (questionId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('community_answers').insert({
      question_id: questionId,
      author_name: profile.name || 'Anonyme',
      author_level: profile.schoolLevel || '',
      content: replyContent.trim(),
      upvotes: 0 });
    setSubmitting(false);
    if (error) { toast.error('Erreur lors de la publication. Réessayez.'); return; }
    setReplyContent('');
    setReplyingTo(null);
    addXp(15);
    addActivity('Réponse publiée dans la Communauté');
    toast.success('Réponse publiée ! Merci d\'avoir aidé la communauté.');
    await loadQuestions();
  };

  // ── Voter pour une réponse (anti-spam: localStorage) ───────────────────────
  const handleVote = async (answerId: string, currentUpvotes: number) => {
    if (localVotes[answerId]) {
      toast.info('Vous avez déjà voté pour cette réponse.');
      return;
    }
    const newUpvotes = currentUpvotes + 1;
    const { error } = await supabase
      .from('community_answers')
      .update({ upvotes: newUpvotes })
      .eq('id', answerId);
    if (error) { toast.error('Erreur lors du vote.'); return; }
    setLocalVotes(prev => ({ ...prev, [answerId]: 'up' }));
    setQuestions(prev => prev.map(q => ({
      ...q,
      answers: q.answers.map(a => a.id === answerId ? { ...a, upvotes: newUpvotes, userVote: 'up' as const } : a) })));
  };

  const subjectsForFilter = ['Toutes', ...SUBJECTS];
  const levelsForFilter = ['Tous', ...LEVELS];

  return (
    <div className="min-w-0 space-y-5">
    <h1 className="sr-only">Communauté Apprenix</h1>
      <SEO
        title="Communauté Apprenix — Entraide scolaire entre élèves | Apprenix"
        description="Posez vos questions, partagez vos fiches et aidez les autres élèves. Communauté bienveillante du collège à l'université. Gratuit, sans pub, sans danger."
        canonical="/communaute"
        keywords="communauté élèves gratuite, entraide scolaire, forum lycée, questions réponses cours, forum collège, forum révision bac 2026, posez vos questions scolaires, forum étudiant, entraide gratuite apprenix"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          "name": "Communauté Apprenix — Entraide entre élèves",
          "description": "Forum d'entraide scolaire gratuit pour poser des questions, partager ses connaissances et s'entraider sur toutes les matières.",
          "url": "https://apprenix.org/communaute",
          "author": {"@type": "Organization", "name": "Apprenix"},
          "isPartOf": {"@type": "WebSite", "name": "Apprenix", "url": "https://apprenix.org"},
          "audience": {"@type": "EducationalAudience", "educationalRole": "student"},
          "inLanguage": "fr-FR",
          "isAccessibleForFree": true
        }}
      />

      {/* ── Charte de la communauté ── */}
      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Charte de bonne conduite</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
            Vérifiez vos réponses avant de les publier — une information incorrecte peut induire en erreur d'autres étudiants.
            <span className="ml-1">Citez vos sources si possible. Soyez bienveillant et respectueux. Les réponses peuvent être corrigées par la communauté via les votes.</span>
          </p>
        </div>
      </div>

      {/* ── Hero ── */}
      <PageHero
        variant="community"
        icon={Users}
        badge={<>💬 Communauté Apprenix</>}
        badgeClassName="bg-chart-4/10 text-chart-4 border-chart-4/25"
        title="Communauté Apprenix — Entraide scolaire"
        subtitle="Pose tes questions, réponds à celles des autres — l'entraide entre élèves est souvent plus efficace qu'une explication seule. Toutes matières, tous niveaux, gratuit."
        stats={[
          { value: String(questions.length), label: 'Questions posées' },
          { value: String(questions.reduce((acc, q) => acc + q.answers.length, 0)), label: 'Réponses données' },
          { value: 'Toutes', label: 'Matières couvertes' },
        ]}
        cta={{ label: 'Poser une question', onClick: () => setShowNewQuestion(v => !v) }}
      />

      {/* ── Formulaire nouvelle question ── */}
      {showNewQuestion && (
        <Card className="border border-primary/30 bg-primary/3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Poser une question</CardTitle>
              <Button variant="ghost" size="icon" className="h-9 w-9 min-h-[48px] min-w-[44px]" aria-label="Fermer" onClick={() => setShowNewQuestion(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              aria-label="Poser une question à la communauté"
              placeholder="Titre de votre question…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              maxLength={120}
            />
            <Textarea
              placeholder="Décrivez votre question en détail (optionnel)…"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Matière…" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newLevel} onValueChange={setNewLevel}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Niveau…" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={handlePublishQuestion}
              disabled={!newTitle.trim() || !newSubject || !newLevel || submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Publier la question (+10 XP)
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-5">
        {/* ── Colonne principale ── */}
        <div className="flex-1 min-w-0 space-y-4 min-h-[400px]">
          {/* Recherche + filtres */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher une question…" className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="overflow-x-auto">
                <div className="flex gap-1.5 flex-nowrap pb-1">
                  {subjectsForFilter.slice(0, 7).map(s => (
                    <button type="button"
                      key={s}
                      onClick={() => setActiveSubject(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] ${
                        activeSubject === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Select value={activeLevel} onValueChange={setActiveLevel}>
                <SelectTrigger className="h-9 text-xs w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelsForFilter.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Liste questions */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <Card key={i} className="border border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-16 gap-3">
                <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Aucune question trouvée</p>
                <Button size="sm" onClick={() => setShowNewQuestion(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Poser la première question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(q => {
                const isExpanded = expandedId === q.id;
                const subColor = SUBJECT_COLORS[q.subject] || 'bg-muted text-muted-foreground border-border';
                return (
                  <Card key={q.id} className={`border transition-[background-color,border-color,color,box-shadow,transform] duration-200 ${isExpanded ? 'border-primary/30' : 'border-border/60 hover:border-border'}`}>
                    <CardContent className="p-4 space-y-3">
                      {/* Entête question */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <Badge variant="outline" className={`text-xs border ${subColor}`}>{q.subject}</Badge>
                            <Badge variant="outline" className="text-xs border">{q.level}</Badge>
                            <span className="text-sm text-muted-foreground ml-auto">{q.date}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground text-balance leading-snug">{q.title}</h3>
                          {q.description && <p className="text-sm text-muted-foreground mt-1 text-pretty">{q.description}</p>}
                          <div className="text-sm text-muted-foreground mt-1">Par {q.authorName}</div>
                        </div>
                      </div>

                      {/* Footer question */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {q.answers.length} réponse{q.answers.length !== 1 ? 's' : ''}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 text-xs text-primary hover:bg-primary/10"
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        >
                          {isExpanded ? <><ChevronUp className="w-3 h-3 mr-1" />Réduire</> : <><ChevronDown className="w-3 h-3 mr-1" />Voir les réponses</>}
                        </Button>
                      </div>

                      {/* Réponses */}
                      {isExpanded && (
                        <div className="space-y-3 pt-2 border-t border-border/60">
                          {q.answers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Sois le premier à répondre !</p>
                          ) : (
                            q.answers.map(a => (
                              <div key={a.id} className="flex gap-3 p-3 bg-muted/40 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">{a.authorName}</span>
                                    <Badge variant="outline" className="text-xs">{a.authorLevel}</Badge>
                                    <span className="text-sm text-muted-foreground ml-auto">{a.date}</span>
                                  </div>
                                  <p className="text-sm text-foreground text-pretty leading-relaxed">{a.content}</p>
                                  <div className="flex items-center gap-2">
                                    <button type="button"
                                      onClick={() => handleVote(a.id, a.upvotes)}
                                      disabled={!!localVotes[a.id]}
                                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                                        a.userVote === 'up' ? 'bg-success/20 text-success' : 'text-muted-foreground hover:text-success hover:bg-success/10'
                                      }`}
                                      title={localVotes[a.id] ? 'Déjà voté' : 'Voter pour cette réponse'}
                                    >
                                      <ThumbsUp className="w-3 h-3" /> {a.upvotes}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          {/* Répondre */}
                          {replyingTo === q.id ? (
                            <div className="space-y-2 pt-2">
                              <Textarea
                                placeholder="Votre réponse…"
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                className="min-h-[80px] resize-none text-sm"
                                maxLength={600}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => handlePublishAnswer(q.id)} disabled={!replyContent.trim() || submitting}>
                                  {submitting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                                  Publier (+15 XP)
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setReplyingTo(q.id)}>
                              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                              Répondre à cette question
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section Commentaires de la communauté ── */}
        <div className="mt-6">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 text-balance">
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                Commentaires de la communauté
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {comments.length} commentaire{comments.length !== 1 ? 's' : ''} — étudiants, parents et visiteurs bienvenus
              </p>
            </div>
            <button type="button"
              onClick={() => setShowCommentForm(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCommentForm ? 'Annuler' : 'Laisser un commentaire'}
              {showCommentForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Formulaire dépliable */}
          {showCommentForm && (
            <Card className="mb-4 border border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <CommentForm
                  connectedName={isAuthenticated ? profile.name : undefined}
                  onSubmit={data => {
                    addComment(data);
                    setShowCommentForm(false);
                    addActivity('Commentaire publié dans la Communauté');
                  }}
                  placeholder="Partagez votre expérience, une question générale ou un encouragement…"
                  submitLabel="Publier le commentaire"
                />
              </CardContent>
            </Card>
          )}

          {/* Liste des commentaires */}
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center border border-dashed border-border rounded-xl">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Soyez le premier à laisser un commentaire !</p>
              <button type="button"
                onClick={() => setShowCommentForm(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Laisser un commentaire →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {comments.map(c => (
                <CommentCard key={c.id} item={c} onLike={likeComment} variant="comment" />
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 shrink-0 space-y-4" aria-label="Informations communauté">
          {/* Leaderboard */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Top contributeurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">Sois le premier contributeur !</p>
              ) : (
                leaderboard.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {getRankIcon(i)}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{c.level}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-success font-semibold shrink-0">
                      <ThumbsUp className="w-3 h-3" />
                      {c.score}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Filtres par matière */}
          <Card className="border border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Filtrer par matière
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {['Toutes', ...SUBJECTS].map(s => (
                <button type="button"
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                    activeSubject === s
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Conseil */}
          <Card className="border border-chart-3/20 bg-chart-3/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-chart-3 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  <strong className="text-foreground">Gagne des XP</strong> en aidant la communauté : +15 XP par réponse, +10 XP par question posée.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CommunautePage;
