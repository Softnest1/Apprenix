import {
  ArrowRight, BookOpen, Brain, Calendar, CheckCircle,
  ClipboardList, CreditCard, GraduationCap, Heart,
  HelpCircle, MessageCircle, ScanLine, Star, Users, Zap,
} from 'lucide-react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { getLevelCategory } from '@/lib/levelUtils';

// ─── Config par rôle ──────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  student: {
    emoji: '🎓',
    headline: 'Bienvenue dans ton espace étudiant !',
    sub: 'Tout ce qu\'il te faut pour réussir est prêt. Voici par où commencer :',
    color: 'from-primary to-primary/70',
    badge: 'Espace Étudiant',
    steps: [
      {
        icon: Brain,
        title: 'Aide IA aux devoirs',
        desc: 'Pose une question, obtiens une explication claire et pas-à-pas.',
        path: '/aide-ia',
        cta: 'Poser une question',
      },
      {
        icon: CreditCard,
        title: 'Mes Flashcards',
        desc: 'Créé tes premières cartes de révision avec la méthode SM-2.',
        path: '/flashcards',
        cta: 'Créer des flashcards',
      },
      {
        icon: Calendar,
        title: 'Mon Planning',
        desc: 'Organise ton agenda et tes séances Pomodoro pour mieux travailler.',
        path: '/organisation',
        cta: 'Configurer mon agenda',
      },
      {
        icon: ScanLine,
        title: 'Scanner mes devoirs',
        desc: 'Prends en photo un exercice et reçois une correction immédiate.',
        path: '/scanner',
        cta: 'Scanner un devoir',
      },
    ],
    destLabel: 'Accéder à mon espace',
  },
  teacher: {
    emoji: '📋',
    headline: 'Bienvenue dans votre espace enseignant !',
    sub: 'Votre espace est prêt. Voici les premières actions recommandées :',
    color: 'from-[#2e4fb5] to-[#1a3490]',
    badge: 'Espace Enseignant',
    steps: [
      {
        icon: HelpCircle,
        title: 'Répondre aux élèves',
        desc: 'Des élèves attendent vos réponses. Aidez-les à progresser.',
        path: '/espace-enseignant/questions',
        cta: 'Voir les questions',
      },
      {
        icon: BookOpen,
        title: 'Publier un contenu',
        desc: 'Partagez un cours, une fiche ou un exercice avec les élèves.',
        path: '/espace-enseignant/contenus',
        cta: 'Créer un contenu',
      },
      {
        icon: ClipboardList,
        title: 'Corriger des copies',
        desc: 'Notez et commentez les travaux soumis par les élèves.',
        path: '/espace-enseignant/corrections',
        cta: 'Voir les copies',
      },
      {
        icon: MessageCircle,
        title: 'Messagerie',
        desc: 'Échangez directement avec vos élèves et leurs parents.',
        path: '/espace-enseignant/messagerie',
        cta: 'Ouvrir la messagerie',
      },
    ],
    destLabel: 'Accéder à mon tableau de bord',
  },
  parent: {
    emoji: '👨‍👩‍👧',
    headline: 'Bienvenue dans votre espace parent !',
    sub: 'Suivez la scolarité de votre enfant en un coup d\'œil. Par où commencer :',
    color: 'from-[#c47a1e] to-[#a0600f]',
    badge: 'Espace Parent',
    steps: [
      {
        icon: Star,
        title: 'Tableau de bord enfant',
        desc: 'Consultez les XP, la série de travail et les devoirs à faire.',
        path: '/parents-espace',
        cta: 'Voir le tableau de bord',
      },
      {
        icon: MessageCircle,
        title: 'Contacter un enseignant',
        desc: 'Envoyez un message directement à l\'équipe pédagogique.',
        path: '/parents-espace',
        cta: 'Envoyer un message',
      },
      {
        icon: CheckCircle,
        title: 'Suivre les devoirs',
        desc: 'Vérifiez les tâches prévues et les progrès accomplis.',
        path: '/parents-espace',
        cta: 'Voir les devoirs',
      },
      {
        icon: Users,
        title: 'Trouver un enseignant',
        desc: 'Trouvez un soutien scolaire adapté au niveau de votre enfant.',
        path: '/trouver-enseignant',
        cta: 'Chercher un prof',
      },
    ],
    destLabel: 'Accéder à mon espace parent',
  },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

// ─── Page ─────────────────────────────────────────────────────────────────────
const BienvenuePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { level, profile, profileReady } = useApp();

  // Détecter le rôle depuis l'URL ou le profil
  const rawRole = searchParams.get('role') ?? (profile as { role?: string }).role ?? 'student';
  const role: RoleKey = (['student', 'teacher', 'parent'] as RoleKey[]).includes(rawRole as RoleKey)
    ? (rawRole as RoleKey)
    : 'student';

  const config = ROLE_CONFIG[role];

  const handleDest = () => {
    if (role === 'teacher') { navigate('/espace-enseignant', { replace: true }); return; }
    if (role === 'parent')  { navigate('/parents-espace',    { replace: true }); return; }
    // Attendre profileReady pour garantir le bon niveau (évite /espace/lycee par défaut)
    if (!profileReady) return;
    navigate(`/espace/${getLevelCategory(level)}`, { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background">
      <SEO
        title="Bienvenue sur Apprenix"
        description="Votre espace Apprenix est prêt. Découvrez vos premiers pas."
        noIndex
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${config.color} px-4 py-10 text-center text-white`}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" aria-hidden />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.07] pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
            <ApprenixLogo size={36} />
          </div>
          <Badge className="mb-3 bg-white/20 text-white border-white/30 inline-flex gap-1.5">
            <Zap className="w-3 h-3" />
            {config.badge}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-balance">
            {config.emoji} {config.headline}
          </h1>
          <p className="text-white/80 text-sm md:text-base text-pretty max-w-sm mx-auto">
            {config.sub}
          </p>
        </div>
      </div>

      {/* ── Étapes ────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.steps.map(({ icon: Icon, title, desc, path, cta }, i) => (
            <Card
              key={title}
              className="h-full border border-border/60 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate(path)}
            >
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                <div className="flex items-start gap-3">
                  {/* Numéro + icône */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto h-8 text-xs gap-1.5 w-full group-hover:border-primary/40 group-hover:text-primary transition-colors"
                  onClick={e => { e.stopPropagation(); navigate(path); }}
                >
                  {cta}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Valeurs ── */}
        <div className="flex flex-wrap justify-center gap-2 py-2">
          {[
            { icon: Heart,        label: '100 % gratuit' },
            { icon: CheckCircle,  label: 'Sans pub' },
            { icon: GraduationCap,label: 'Contenu humain' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Icon className="w-3 h-3 text-primary" />
              {label}
            </span>
          ))}
        </div>

        {/* ── CTA principal ── */}
        <div className="text-center pt-2">
          <Button size="lg" className="h-12 px-10 gap-2 text-base font-semibold" onClick={handleDest}>
            {config.destLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Vous pourrez revenir ici à tout moment depuis votre profil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BienvenuePage;
