import {
  BookOpen, Brain, Calculator, ChevronDown, ChevronRight, ChevronUp,
  Clock, Globe, GraduationCap, Heart, Lightbulb,
  MessageSquare, Search, Sparkles, Target, ThumbsUp, Users, Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/db/supabase';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KbEntry {
  id: string;
  subject: string;
  level: string;
  question_text: string;
  tags: string[];
  answer_text: string;
  answer_steps: { step: number; title: string; text: string }[];
  teacher_name: string | null;
  view_count: number;
  helpful_votes: number;
  quality_score: number;
  created_at: string;
}

// ─── Données statiques ────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: 'all',       label: 'Toutes',        icon: Sparkles,      color: 'text-primary',   bg: 'bg-primary/10'   },
  { id: 'Maths',     label: 'Maths',          icon: Calculator,    color: 'text-chart-1',   bg: 'bg-chart-1/10'   },
  { id: 'Français',  label: 'Français',       icon: BookOpen,      color: 'text-chart-2',   bg: 'bg-chart-2/10'   },
  { id: 'Histoire',  label: 'Histoire',       icon: Globe,         color: 'text-chart-3',   bg: 'bg-chart-3/10'   },
  { id: 'Physique',  label: 'Physique',       icon: Zap,           color: 'text-chart-4',   bg: 'bg-chart-4/10'   },
  { id: 'SVT',       label: 'SVT',            icon: Heart,         color: 'text-success',   bg: 'bg-success/10'   },
  { id: 'Anglais',   label: 'Anglais',        icon: Globe,         color: 'text-chart-5',   bg: 'bg-chart-5/10'   },
  { id: 'Philo',     label: 'Philo',          icon: Lightbulb,     color: 'text-warning',   bg: 'bg-warning/10'   },
];

const LEVELS = [
  'all', 'Primaire', 'Collège', 'Lycée', 'Supérieur',
];

const LEVEL_MAP: Record<string, string[]> = {
  Primaire:  ['CP','CE1','CE2','CM1','CM2','Primaire'],
  Collège:   ['6e','5e','4e','3e','Collège'],
  Lycée:     ['2nde','1ère','Terminale','Lycée'],
  Supérieur: ['BTS','Licence','Master','Doctorat','Supérieur'],
};

// ─── Composant — Carte réponse ─────────────────────────────────────────────────
const ReponseCard: React.FC<{ entry: KbEntry; expanded: boolean; onToggle: () => void }> = ({
  entry, expanded, onToggle,
}) => {
  const subj = SUBJECTS.find(s => s.id === entry.subject) ?? SUBJECTS[0];

  return (
    <Card
      className={cn(
        'shadow-card transition-all duration-200 cursor-pointer hover:shadow-md',
        expanded && 'border-primary/30 shadow-primary/10',
      )}
      onClick={onToggle}
    >
      <CardContent className="p-0">
        {/* En-tête question */}
        <div className="flex items-start gap-3 p-4">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', subj.bg)}>
            <subj.icon className={cn('w-4 h-4', subj.color)} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{entry.subject}</Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{entry.level}</Badge>
              {entry.tags.slice(0, 2).map(t => (
                <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">{t}</Badge>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-foreground text-pretty leading-snug">
              {entry.question_text}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" aria-hidden="true" />
                {entry.helpful_votes} utile{entry.helpful_votes > 1 ? 's' : ''}
              </span>
              {entry.teacher_name && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" aria-hidden="true" />
                  {entry.teacher_name.split(' — ')[0]}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 mt-1">
            {expanded
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          </div>
        </div>

        {/* Corps réponse (expansible) */}
        {expanded && (
          <div className="border-t border-border/50 p-4 pt-3 space-y-4" onClick={e => e.stopPropagation()}>
            {/* Résumé de la réponse */}
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
              <p className="text-sm text-foreground leading-relaxed text-pretty">{entry.answer_text}</p>
            </div>

            {/* Étapes numérotées */}
            {entry.answer_steps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Explication étape par étape</p>
                {entry.answer_steps.map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-primary">{s.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer réponse */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{entry.teacher_name ?? 'Enseignant Apprenix'}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={cn('text-xs', i <= entry.quality_score ? 'text-warning' : 'text-muted')} aria-hidden="true">★</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
const BaseReponsesPage: React.FC = () => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [entries, setEntries]         = useState<KbEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState('');
  const [debouncedQuery, setDebounced] = useState('');
  const [subject, setSubject]         = useState('all');
  const [level, setLevel]             = useState('all');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [total, setTotal]             = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Requête Supabase
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' })
      .eq('validated', true)
      .order('helpful_votes', { ascending: false })
      .limit(24);

    if (subject !== 'all') q = q.eq('subject', subject);
    if (level !== 'all') {
      const lvls = LEVEL_MAP[level] ?? [level];
      q = q.in('level', lvls);
    }
    if (debouncedQuery.trim().length > 1) {
      q = q.ilike('question_text', `%${debouncedQuery.trim()}%`);
    }

    const { data, count, error } = await q;
    if (!error) {
      setEntries((data ?? []) as KbEntry[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [subject, level, debouncedQuery]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const subjectInfo = useMemo(() => SUBJECTS.find(s => s.id === subject) ?? SUBJECTS[0], [subject]);

  return (
    <>
      <SEO
        title="Base de réponses — 100 000 questions répondues | Apprenix"
        description="Retrouve instantanément une réponse vérifiée par un enseignant sur toutes les matières scolaires. Maths, Français, Histoire, Physique, SVT, Philo — du CP au Bac+5."
        canonical="/base-reponses"
      />

      <div className="min-w-0 space-y-6">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-2xl bg-gradient-primary text-white -mx-1"
          style={{ isolation: 'isolate' }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 -left-10 w-48 h-48 rounded-full bg-white/4 blur-2xl" />
          </div>
          <div className="relative z-10 px-5 py-8 md:px-10 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Brain className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    Base de connaissances Apprenix
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white text-balance leading-tight mb-3">
                  100 000+ réponses<br />
                  <span className="text-white/80">vérifiées par nos enseignants</span>
                </h1>
                <p className="text-white/85 text-sm md:text-base leading-relaxed text-pretty max-w-xl">
                  Chaque réponse est rédigée et validée par un enseignant français.
                  Cherche ta question — si elle n'existe pas encore, pose-la directement.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 shrink-0 md:w-52">
                {[
                  { value: '20+',   label: 'Réponses initiales',   icon: BookOpen  },
                  { value: '100%',  label: 'Contenu humain',        icon: Users     },
                  { value: '< 10m', label: 'Délai de réponse',      icon: Clock     },
                  { value: 'CP→M2', label: 'Tous niveaux',          icon: GraduationCap },
                ].map(({ value, label, icon: Icon }) => (
                  <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-3">
                    <Icon className="w-4 h-4 text-white/70 mb-1" aria-hidden="true" />
                    <p className="text-white font-extrabold text-lg leading-none">{value}</p>
                    <p className="text-white/60 text-[10px] mt-0.5 leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Barre de recherche ────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cherche une question… ex : dérivée logarithme, discrimant, métaphore…"
            className="pl-11 pr-4 h-12 text-sm rounded-xl border-border/60 focus:border-primary/50"
            aria-label="Recherche dans la base de réponses"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Filtres matière ───────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 border',
                subject === s.id
                  ? `${s.bg} ${s.color} border-current/30`
                  : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted',
              )}
            >
              <s.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Filtres niveau ────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 scrollbar-none">
          {LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 border',
                level === l
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {l === 'all' ? 'Tous niveaux' : l}
            </button>
          ))}
        </div>

        {/* ── Compteur ─────────────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{entries.length}</span>
              {total > entries.length ? ` sur ${total}` : ''} réponse{entries.length > 1 ? 's' : ''}
              {subject !== 'all' && ` en ${subjectInfo.label}`}
              {debouncedQuery ? ` pour "${debouncedQuery}"` : ''}
            </p>
            {total > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" aria-hidden="true" />
                Objectif : 100 000 réponses
              </span>
            )}
          </div>
        )}

        {/* ── Liste des réponses ────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Aucune réponse trouvée</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  {debouncedQuery
                    ? `Aucun résultat pour "${debouncedQuery}" — pose ta question directement !`
                    : 'Essaie un autre filtre ou pose ta question à un enseignant.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button size="sm" className="h-9 text-xs" onClick={() => navigate('/aide-ia')}>
                  Poser ma question
                </Button>
                {debouncedQuery && (
                  <Button size="sm" variant="secondary" className="h-9 text-xs" onClick={() => setQuery('')}>
                    Effacer le filtre
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <ReponseCard
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() => setExpandedId(prev => prev === entry.id ? null : entry.id)}
              />
            ))}
          </div>
        )}

        {/* ── CTA — poser une question ─────────────────────────────────────── */}
        <Card className="border-primary/20 bg-primary/5 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" aria-hidden="true" />
              Tu ne trouves pas ta réponse ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-pretty">
              Pose ta question directement — un enseignant vérifié te répond en moins de 10 minutes.
              Ta question enrichira ensuite la base pour les prochains élèves.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="h-9 text-xs"
                onClick={() => navigate(isAuthenticated ? '/aide-ia' : '/connexion')}
              >
                <Brain className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Poser une question
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 text-xs"
                onClick={() => navigate('/scanner')}
              >
                Scanner un devoir
                <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Statistiques de croissance ───────────────────────────────────── */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">Roadmap de la base de connaissances</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { phase: 'Phase 1', target: '5 000', period: 'Mois 1-3', done: false, current: true },
                { phase: 'Phase 2', target: '20 000', period: 'Mois 4-6', done: false, current: false },
                { phase: 'Phase 3', target: '60 000', period: 'Mois 7-12', done: false, current: false },
                { phase: 'Phase 4', target: '100 000+', period: 'Mois 13-18', done: false, current: false },
              ].map(p => (
                <div
                  key={p.phase}
                  className={cn(
                    'rounded-xl border p-3 text-center',
                    p.current ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20',
                  )}
                >
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{p.phase}</p>
                  <p className={cn('text-lg font-extrabold mt-1', p.current ? 'text-primary' : 'text-foreground')}>
                    {p.target}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.period}</p>
                  {p.current && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                      En cours
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default BaseReponsesPage;
