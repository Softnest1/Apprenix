import {
  BookOpen, Calendar, CheckCircle, ChevronRight,
  ClipboardList, HelpCircle, Info, Loader2, MessageSquare,
  Plus, TrendingUp, Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import {
  getAllOpenQuestions, getAllSubmissions, getMyContents,
} from '@/lib/api';
import type { DbContentItem, DbStudentQuestion, DbStudentSubmission } from '@/db/supabase';

interface StatCardProps {
  label: string; value: number; icon: React.ElementType;
  color: string; textColor: string;
}
function StatCard({ label, value, icon: Icon, color, textColor }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickLinkProps {
  icon: React.ElementType; label: string; desc: string;
  to: string; badge?: number; badgeColor?: string;
}
function QuickLink({ icon: Icon, label, desc, to, badge, badgeColor = 'bg-destructive/15 text-destructive' }: QuickLinkProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-left w-full group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      {!!badge && badge > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>{badge}</span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}

export default function EspaceEnseignantDashboard() {
  const { profile } = useApp();
  const navigate     = useNavigate();

  const [questions,    setQuestions]    = useState<DbStudentQuestion[]>([]);
  const [submissions,  setSubmissions]  = useState<DbStudentSubmission[]>([]);
  const [contents,     setContents]     = useState<DbContentItem[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    setLoading(true);
    try {
      const [q, s, c] = await Promise.all([
        getAllOpenQuestions(100),
        getAllSubmissions(100),
        getMyContents(profile.id, 50),
      ]);
      setQuestions(q); setSubmissions(s); setContents(c);
    } finally { setLoading(false); }
  };

  const openQ    = questions.filter(q => q.status === 'open').length;
  const pendingS = submissions.filter(s => s.status === 'submitted').length;
  const answered = questions.filter(q => q.status === 'answered').length;
  const published = contents.filter(c => c.status === 'published').length;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <>
      <SEO
        title="Tableau de bord — Espace Enseignant"
        description="Votre tableau de bord enseignant Apprenix : questions élèves, corrections, contenus pédagogiques."
      />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 md:p-7 shadow-lg shadow-primary/20">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/[0.08] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm mb-1">Bienvenue dans votre espace</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white text-balance leading-tight">
                Bonjour, {profile.name || 'Enseignant'} 👋
              </h1>
              <p className="text-white/75 text-sm mt-1.5 text-pretty">
                {openQ > 0 || pendingS > 0
                  ? `${openQ > 0 ? `${openQ} question${openQ > 1 ? 's' : ''} en attente` : ''}${openQ > 0 && pendingS > 0 ? ' · ' : ''}${pendingS > 0 ? `${pendingS} copie${pendingS > 1 ? 's' : ''} à corriger` : ''}`
                  : 'Tout est à jour ! Aucune tâche en attente.'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/espace-enseignant/contenus')}
              className="h-10 px-5 bg-white text-foreground hover:bg-white/90 shadow font-bold gap-2 shrink-0 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Nouveau contenu
            </Button>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Questions en attente" value={openQ}    icon={HelpCircle}    color="bg-warning/10"  textColor="text-warning-foreground" />
          <StatCard label="Copies à corriger"    value={pendingS} icon={ClipboardList} color="bg-info/10"     textColor="text-info" />
          <StatCard label="Contenus publiés"     value={published}icon={BookOpen}      color="bg-primary/10"  textColor="text-primary" />
          <StatCard label="Réponses données"     value={answered} icon={CheckCircle}   color="bg-success/10"  textColor="text-success" />
        </div>

        {/* ── Guide d'utilisation ─────────────────────────────────── */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/20">
          <Info className="w-5 h-5 text-white shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-white">🗺️ Comment utiliser votre espace ?</p>
            <p className="text-sm text-white/80 mt-0.5 text-pretty">
              <strong className="text-white">Questions élèves</strong> : répondez aux demandes d'aide en attente ·{' '}
              <strong className="text-white">Copies</strong> : notez les travaux soumis ·{' '}
              <strong className="text-white">Contenus</strong> : publiez cours et fiches de révision ·{' '}
              <strong className="text-white">Messagerie</strong> : échangez directement avec vos élèves.
            </p>
          </div>
        </div>

        {/* ── Accès rapide sections ─────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Actions prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickLink icon={HelpCircle}    label="Questions élèves"   desc="Répondre et aider les élèves"            to="/espace-enseignant/questions"   badge={openQ}    badgeColor="bg-warning/15 text-warning-foreground" />
              <QuickLink icon={ClipboardList} label="Copies à corriger"  desc="Noter et commenter les travaux rendus"   to="/espace-enseignant/corrections" badge={pendingS} />
              <QuickLink icon={MessageSquare} label="Messagerie"         desc="Échanges directs avec vos élèves"        to="/espace-enseignant/messagerie"  />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Contenus & Outils
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickLink icon={BookOpen}  label="Mes contenus"  desc={`${contents.length} contenu(s) — cours, fiches, exercices`} to="/espace-enseignant/contenus"  />
              <QuickLink icon={Calendar}  label="Mon agenda"    desc="Planifier et suivre les cours"                              to="/espace-enseignant/agenda"    />
              <QuickLink icon={Users}     label="Mon profil"    desc="Mettre à jour mes informations enseignant"                  to="/espace-enseignant/profil"    />
            </CardContent>
          </Card>
        </div>

        {/* ── Dernières questions ──────────────────────────────────── */}
        {questions.length > 0 && (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Dernières questions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/espace-enseignant/questions')}>
                Voir tout <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {questions.slice(0, 3).map(q => (
                <button
                  key={q.id} type="button"
                  onClick={() => navigate('/espace-enseignant/questions')}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${q.status === 'open' ? 'bg-warning' : 'bg-success'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.subject} · {q.level}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Derniers contenus ────────────────────────────────────── */}
        {contents.length > 0 && (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Mes derniers contenus
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/espace-enseignant/contenus')}>
                Voir tout <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {contents.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.subject} · {c.type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    c.status === 'published' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {c.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </>
  );
}
