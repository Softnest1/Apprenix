import {
  ArrowRight, BookOpen, Calendar,Code2, GraduationCap, 
  Heart, Lightbulb, 
  Mail, MapPin, Megaphone, MessageCircle, Plane, ShieldCheck, Star,User,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import { Separator } from '@/components/ui/separator';

const ENGAGEMENTS = [
  {
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Gratuité totale',
    desc: 'Toutes les fonctionnalités sont 100 % gratuites, sans abonnement ni paiement. Pour toujours.',
  },
  {
    icon: ShieldCheck,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Respect de vos données',
    desc: 'Vos données personnelles sont protégées conformément au RGPD. Aucune revente, aucun tracking publicitaire.',
  },
  {
    icon: Megaphone,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Sans publicité',
    desc: 'Aucune publicité intrusive, pour une expérience d\'apprentissage sereine et concentrée.',
  },
  {
    icon: GraduationCap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    title: 'Conformité programmes',
    desc: 'Nos contenus suivent les programmes officiels de l\'Éducation nationale (référentiels Éduscol).',
  },
];

/* Jalons du parcours */
const PARCOURS = [
  {
    icon: Plane,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    year: '2008',
    title: 'Arrivée en France',
    desc: 'Né aux Philippines, Charly arrive en France à 8 ans. Première ville : Saint-Denis (Seine-Saint-Denis).',
  },
  {
    icon: MapPin,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    year: 'Quelques années plus tard',
    title: 'Tremblay-en-France',
    desc: 'La famille s\'installe à Tremblay-en-France (93290), en Seine-Saint-Denis, où Charly grandit et suit sa scolarité.',
  },
  {
    icon: Lightbulb,
    color: 'text-warning',
    bg: 'bg-warning/10',
    year: 'Lycée & après',
    title: 'Passion pour la technologie',
    desc: 'Passionné de tech et d\'éducation, Charly constate que les bons outils pédagogiques sont souvent payants ou inaccessibles.',
  },
  {
    icon: Code2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    year: '2024 — 2025',
    title: 'Création d\'Apprenix',
    desc: 'À 24 ans, Charly crée Apprenix : une plateforme 100 % gratuite, sans publicité, pour que chaque élève ait accès aux meilleurs outils.',
  },
];

/* Chiffres honnêtes — uniquement ce qui est vérifiable */
const STATS = [
  { value: '16', label: 'Niveaux scolaires', icon: GraduationCap },
  { value: '100 %', label: 'Gratuit', icon: Star },
  { value: '0', label: 'Publicité', icon: Megaphone },
  { value: '1', label: 'Créateur indépendant', icon: User },
];

const MissionPage: React.FC = () => (
  <div className="max-w-5xl mx-auto py-4 min-w-0">
      <h1 className="sr-only">Notre mission — Apprenix</h1>
    <SEO
      title="Notre Mission — L'éducation de qualité, gratuite pour tous | Apprenix"
      description="Rendre l'éducation de qualité accessible à tous, du CP au Bac+5, gratuitement et pour toujours. Un projet 100% indépendant, né à Saint-Denis."
      canonical="/mission"
      keywords="mission apprenix, qui sommes nous, Charly Soudan fondateur, projet éducatif gratuit, éducation accessible tous, plateforme scolaire inclusive France, EdTech sociale, IA éducation gratuite, éducation égalité chances"
      noIndex={false}
      dateModified="2026-06-20"
    />

    <PageHero
      variant="info"
      icon={Heart}
      badge={<><Heart className="w-3 h-3 mr-1 fill-primary" />À propos d'Apprenix</>}
      badgeClassName="bg-primary/10 text-primary border-primary/20"
      title="Notre mission & Qui sommes-nous"
      subtitle="Rendre l'éducation vraiment accessible à tous — gratuitement, sans conditions, sans abonnement, pour toujours. Un projet 100 % indépendant, né à Saint-Denis, porté avec passion."
      stats={[
        { value: '100 %', label: 'Gratuit pour toujours' },
        { value: '0 €', label: 'Aucun abonnement' },
        { value: '0 pub', label: 'Zéro publicité' },
      ]}
      cta={{ label: 'Rapport de transparence', to: '/transparence' }}
      ctaSecondary={{ label: 'Sécurité & données', to: '/securite' }}
    />

    {/* ── Carte CV du fondateur ───────────────────────────── */}
    <Card className="mb-8 overflow-hidden">
      {/* Bandeau coloré */}
      <div className="h-2 w-full bg-gradient-to-r from-primary via-chart-4 to-chart-1" />
      <CardContent className="p-5 md:p-6">
        {/* En-tête carte */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          {/* Avatar initiales */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-xl md:text-3xl xl:text-4xl font-extrabold text-white select-none">CS</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">Charly Soudan</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Fondateur & créateur
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Créateur d'Apprenix · 24 ans · Tremblay-en-France (93)
            </p>
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Infos CV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Lieu de naissance</p>
              <p className="text-sm font-semibold text-foreground">Philippines</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Âge</p>
              <p className="text-sm font-semibold text-foreground">24 ans</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Première ville en France</p>
              <p className="text-sm font-semibold text-foreground">Saint-Denis (93)</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Ville actuelle</p>
              <p className="text-sm font-semibold text-foreground">Tremblay-en-France (93)</p>
            </div>
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Bio */}
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Né aux <strong className="text-foreground">Philippines</strong>, Charly Soudan arrive en France
            à l'âge de 8 ans et s'installe d'abord à <strong className="text-foreground">Saint-Denis</strong>
            {' '}(Seine-Saint-Denis). Sa famille déménage ensuite à{' '}
            <strong className="text-foreground">Tremblay-en-France</strong>, toujours en Seine-Saint-Denis,
            où il grandit et suit sa scolarité.
          </p>
          <p>
            Passionné de technologie et convaincu que l'éducation de qualité doit être accessible à tous —
            indépendamment du niveau social ou des ressources financières — Charly décide à <strong className="text-foreground">24 ans</strong>{' '}
            de créer <strong className="text-foreground">Apprenix</strong> : une plateforme éducative entièrement
            gratuite, sans publicité, pensée pour les élèves de France.
          </p>
          <p>
            Apprenix est un <strong className="text-foreground">projet personnel et indépendant</strong>,
            sans investisseurs, sans actionnaires, sans objectif de rentabilité.
            C'est un engagement : que chaque élève, du CP au Bac&nbsp;+&nbsp;5, ait accès aux meilleurs
            outils pédagogiques — gratuitement, pour toujours.
          </p>
        </div>
      </CardContent>
    </Card>

    {/* ── Parcours timeline ────────────────────────────────── */}
    <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">Mon parcours en quelques étapes</h2>
      <p className="text-sm text-muted-foreground mt-0.5">De Saint-Denis à la création d'Apprenix — en 4 jalons.</p>
    </div>
    <div className="mb-8 space-y-3">
      {PARCOURS.map(({ icon: Icon, color, bg, year, title, desc }) => (
        <Card key={title} className="h-full">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0">{year}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* ── Chiffres honnêtes ────────────────────────────────── */}
    <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">Le projet en chiffres</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Seuls des chiffres vérifiables et exacts.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {STATS.map(({ value, label, icon: Icon }) => (
        <Card key={label} className="h-full">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground text-balance">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* ── Engagements ──────────────────────────────────────── */}
    <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">Nos engagements éducatifs</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Des engagements écrits dans les CGU — pas de promesses vides.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {ENGAGEMENTS.map(({ icon: Icon, color, bg, title, desc }) => (
        <Card key={title} className="h-full">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* ── CTA contact ──────────────────────────────────────── */}
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Une question ? Une suggestion ?</p>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Charly lit personnellement tous les messages reçus.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/contact">
            <Button size="sm" className="h-9 bg-primary text-primary-foreground">
              <Mail className="w-4 h-4 mr-1.5" />
              Nous contacter
            </Button>
          </Link>
          <Link to="/faq">
            <Button size="sm" variant="outline" className="h-9">
              <ArrowRight className="w-4 h-4 mr-1.5" />
              FAQ
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>

    {/* Liens bas de page */}
    <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/parents" className="hover:text-primary transition-colors">Pour les parents</Link>
      <Link to="/enseignants" className="hover:text-primary transition-colors">Pour les enseignants</Link>
      <Link to="/securite" className="hover:text-primary transition-colors">Sécurité & données</Link>
      <Link to="/faq" className="hover:text-primary transition-colors">Centre d'aide</Link>
      <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
      <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
    </div>
  </div>
);

export default MissionPage;
