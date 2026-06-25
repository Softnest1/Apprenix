/**
 * Landing SEO — Révision Bac 2026
 * Cible : "révision bac 2026", "bac 2026 préparation", "réviser bac terminale"
 * Trafic estimé : 10 000–30 000 recherches/mois (France, pic jan–juin 2026)
 */

import {
  ArrowRight, BookOpen, Brain, Calculator, Calendar, CheckCircle, Clock, FileText,
  GraduationCap, Sparkles, Star,
  Target, TrendingUp,Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingHero from '@/components/ui/LandingHero';

const MATIERES_BAC = [
  {
    name: "Français (Première)", icon: BookOpen, color: "text-primary", bg: "bg-primary/10",
    link: "/bac-francais",
    desc: "Commentaire, dissertation, explication linéaire, oral." },
  {
    name: "Philosophie", icon: Brain, color: "text-chart-2", bg: "bg-chart-2/10",
    link: "/aide-ia",
    desc: "Dissertation philo, explication de texte, méthodologie." },
  {
    name: "Mathématiques", icon: Calculator, color: "text-chart-4", bg: "bg-chart-4/10",
    link: "/maths-sciences",
    desc: "Analyse, probabilités, géométrie, algorithmique." },
  {
    name: "Histoire-Géo", icon: TrendingUp, color: "text-success", bg: "bg-success/10",
    link: "/ressources",
    desc: "Composition, étude de doc, croquis cartographique." },
  {
    name: "Anglais (LVA/LVB)", icon: FileText, color: "text-chart-1", bg: "bg-chart-1/10",
    link: "/linguistique",
    desc: "Compréhension écrite/orale, expression, traduction." },
  {
    name: "Spécialités (SES, SVT, Physique…)", icon: Sparkles, color: "text-chart-3", bg: "bg-chart-3/10",
    link: "/aide-ia",
    desc: "Toutes les spécialités de terminale couvertes." },
];

const OUTILS_BAC = [
  {
    icon: Sparkles, title: "Assistant aux devoirs",
    desc: "Pose ta question, l'assistant explique la méthode et te guide sans donner directement la réponse.",
    link: "/aide-ia", cta: "Utiliser l'assistant" },
  {
    icon: Brain, title: "Flashcards SRS",
    desc: "Mémorise les notions clés avec la répétition espacée. Fiches créées par des enseignants, conformes aux programmes Éduscol.",
    link: "/flashcards", cta: "Créer mes flashcards" },
  {
    icon: BookOpen, title: "Fiches de révision",
    desc: "Fiches synthétiques, annales corrigées, méthodes éprouvées pour chaque matière.",
    link: "/ressources", cta: "Accéder aux fiches" },
  {
    icon: Calculator, title: "Calculatrice scientifique",
    desc: "Formules, conversions, tableaux de valeurs, tableau périodique. Tout pour les maths et sciences.",
    link: "/maths-sciences", cta: "Ouvrir la calculatrice" },
  {
    icon: Calendar, title: "Planning de révision",
    desc: "Organise tes sessions de révision, tes deadlines et ton emploi du temps personnalisé.",
    link: "/organisation", cta: "Mon planning bac" },
  {
    icon: Target, title: "Quiz interactifs",
    desc: "Teste tes connaissances avec des QCM vérifiés par des enseignants. Identifie tes lacunes rapidement.",
    link: "/quiz", cta: "Faire un quiz" },
];

const PLANNING_SEMAINES = [
  {
    periode: "Janvier–Février", label: "Consolidation",
    actions: ["Fais le point sur tes lacunes par matière", "Commence les flashcards SRS", "Revois les cours de première"] },
  {
    periode: "Mars–Avril", label: "Intensification",
    actions: ["Fais les annales des 3 dernières années", "Demande à l'assistant d'expliquer les points difficiles", "Organise des sessions Pomodoro quotidiennes"] },
  {
    periode: "Mai", label: "Sprint final",
    actions: ["1 sujet type bac par jour", "Révise uniquement tes flashcards en retard", "Prépare l'oral de français et le Grand Oral"] },
  {
    periode: "Épreuves", label: "Jour J",
    desc: "La veille : revois uniquement tes fiches synthétiques. Dors 8h. Déjeune avant l'épreuve.",
    actions: ["Dernière révision légère", "Fiches de rappel des formules", "Prépare ton matériel"] },
];

export default function RevisionBac2026Page() {
  return (
    <>
      <SEO
        title="Révision Bac 2026 — Toutes les Matières, Aide IA Gratuite | Apprenix"
        description="Prépare le Bac 2026 avec l'IA : français, philo, maths, histoire, anglais, spécialités. Plan de révision, fiches, flashcards, annales. Gratuit, sans abonnement."
        keywords={[
          "révision bac 2026","bac 2026","préparer bac terminale","réviser bac","bac 2026 préparation",
          "révisions bac terminale","programme bac 2026","bachotage bac","annales bac 2026",
          "aide bac gratuite","fiches révision bac","méthode révision bac","planning révision bac",
          "bac général 2026","comment réviser bac",
        ]}
        ogType="article"
      />

      <main className="min-h-dvh bg-background">

        {/* ── Hero ── */}
        <LandingHero
          gradientFrom="35,95%,28%"
          gradientMid="42,100%,42%"
          gradientTo="28,88%,34%"
          badge="🎓 Bac 2026 — Terminale Générale & Technologique"
          title={<>Prépare le Bac 2026<br /><span className="text-amber-300">avec Apprenix — gratuitement</span></>}
          subtitle="Plan de révision, fiches, flashcards, annales corrigées, assistant Apprenix — tout ce qu'il faut pour réussir le Bac 2026. Pour toutes les matières, tous les terminales. Zéro pub, zéro abonnement."
          ctaPrimary={{ label: 'Commencer ma révision bac', to: '/aide-ia', icon: Sparkles }}
          ctaSecondary={{ label: 'Créer mon planning de révision', to: '/organisation', icon: Calendar }}
        />

        {/* ── Compte à rebours info ── */}
        <section className="py-6 px-4 bg-primary/5 border-y border-primary/10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <Clock className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-foreground">Épreuves de Français (Première) : mi-juin 2026</p>
              <p className="text-sm text-muted-foreground">Épreuves de Terminale : juin 2026 — Baccalauréat général, technologique et professionnel</p>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-primary text-primary-foreground gap-1.5">
              <Link to="/organisation">
                Mon planning <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Matières ── */}
        <section className="py-12 px-4" aria-labelledby="matieres-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="matieres-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Toutes les matières du Bac 2026
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Sélectionne ta matière pour accéder aux ressources adaptées.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MATIERES_BAC.map((m) => (
                <Link key={m.name} to={m.link} className="group">
                  <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${m.bg}`}>
                          <m.icon className={`w-5 h-5 ${m.color}`} aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-foreground text-sm">{m.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground text-pretty">{m.desc}</p>
                      <div className="mt-auto flex items-center gap-1 text-xs text-primary font-medium">
                        Réviser <ArrowRight className="w-3 h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Outils ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="outils-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="outils-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Les outils pour réussir le Bac
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              6 outils essentiels, 100% gratuits, disponibles sur mobile et desktop.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OUTILS_BAC.map((o) => (
                <Card key={o.title} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="p-2 rounded-xl bg-primary/10 w-fit">
                      <o.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-foreground">{o.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{o.desc}</p>
                    <div className="mt-auto">
                      <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <Link to={o.link}>
                          {o.cta} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Planning ── */}
        <section className="py-12 px-4" aria-labelledby="planning-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="planning-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Plan de révision pour le Bac 2026
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Un plan progressif de janvier aux épreuves pour arriver serein le jour J.
            </p>
            <div className="space-y-4">
              {PLANNING_SEMAINES.map((p) => (
                <div key={p.periode} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="shrink-0">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs whitespace-nowrap">
                      {p.periode}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{p.label}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {p.actions.map((action) => (
                      <li key={action} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild size="lg" className="bg-primary text-primary-foreground h-11 gap-2">
                <Link to="/organisation">
                  <Calendar className="w-5 h-5" />
                  Créer mon planning personnalisé
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Témoignages fictifs (réalistes) ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="temoignages-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="temoignages-title" className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-balance">
              Ils préparent leur Bac avec Apprenix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "Yasmine, Terminale ES", stars: 5,
                  text: "L'assistant m'a aidée à comprendre des sujets de philo que mon prof n'avait pas eu le temps d'expliquer. Gratuit et super efficace." },
                {
                  name: "Thomas, Terminale S", stars: 5,
                  text: "Les flashcards créées par les enseignants m'ont sauvé pour les intégrales. J'ai tout révisé pendant les trajets dans le RER." },
                {
                  name: "Maman de Lola (1ère)", stars: 5,
                  text: "Je peux voir la progression de ma fille avec le mode parental. Elle utilise Apprenix chaque soir. Je recommande à tous les parents." },
              ].map((t) => (
                <Card key={t.name} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground text-pretty italic">"{t.text}"</p>
                    <p className="text-xs text-muted-foreground font-medium mt-auto">— {t.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-12 px-4 bg-primary/5 border-t border-primary/10">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 text-balance">
              Ton Bac 2026 commence maintenant
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Plus tu commences tôt, plus tu seras à l'aise. Et avec Apprenix, c'est gratuit pour toujours.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 text-base bg-primary text-primary-foreground gap-2">
                <Link to="/aide-ia">
                  <Zap className="w-5 h-5" />
                  Commencer maintenant — gratuit
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 text-base gap-2">
                <Link to="/connexion">
                  <Users className="w-5 h-5" />
                  Créer mon compte
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Aucune carte bancaire · Aucune pub · 100% gratuit, pour toujours
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
