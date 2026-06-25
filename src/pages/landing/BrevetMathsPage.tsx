/**
 * Landing SEO — Révision Brevet Mathématiques
 * Cible : "révision brevet maths", "brevet maths 2026", "aide maths brevet"
 * Trafic estimé : 6 000–15 000 recherches/mois (France)
 */

import {ArrowRight,Brain, 
  Calculator, 
  CheckCircle, Clock, FileText, GraduationCap, Sigma,Sparkles, Star, 
  TrendingUp, Users,Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingHero from '@/components/ui/LandingHero';

const CHAPITRES = [
  {
    titre: "Calcul et fractions",
    icon: Calculator,
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "Fractions, puissances, racines carrées, priorités des opérations. L'assistant détaille chaque étape de calcul.",
    outil: "/maths-sciences",
    cta: "Calculatrice guidée" },
  {
    titre: "Algèbre et équations",
    icon: Sigma,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    desc: "Équations du 1er et 2e degré, systèmes, factorisations, développements. Avec correction pas à pas.",
    outil: "/aide-ia",
    cta: "Aide algèbre" },
  {
    titre: "Géométrie",
    icon: TrendingUp,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    desc: "Théorème de Pythagore, Thalès, trigonométrie, aires et volumes. Formules et démonstrations clés.",
    outil: "/maths-sciences",
    cta: "Formules géométrie" },
  {
    titre: "Statistiques et probabilités",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
    desc: "Moyenne, médiane, écart-type, diagrammes, probabilités. Exercices type brevet avec correction.",
    outil: "/aide-ia",
    cta: "Exercices statistiques" },
  {
    titre: "Fonctions et graphiques",
    icon: FileText,
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    desc: "Fonctions linéaires, affines, tableaux de valeurs, représentations graphiques. Tracé et interprétation.",
    outil: "/maths-sciences",
    cta: "Tableau de valeurs" },
  {
    titre: "Problèmes et raisonnements",
    icon: Brain,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    desc: "Problèmes ouverts, démonstrations, PGCD, nombres premiers. Méthode de résolution guidée par l'assistant.",
    outil: "/aide-ia",
    cta: "Aide problèmes" },
];

const STATS = [
  { value: "4h", label: "d'épreuves (2 parties)", icon: Clock },
  { value: "40%", label: "du coefficient total", icon: Star },
  { value: "12", label: "chapitres au programme", icon: FileText },
  { value: "0€", label: "100% gratuit toujours", icon: Zap },
];

const FORMULES = [
  "Pythagore : c² = a² + b²",
  "Thales : AB/AD = AC/AE = BC/DE",
  "cos(α) = adjacent / hypoténuse",
  "Aire cercle : π × r²",
  "Volume sphère : (4/3) × π × r³",
  "Discriminant : Δ = b² − 4ac",
  "Probabilité : P(A) = cas favorables / cas possibles",
  "Moyenne : Σxᵢ / n",
];

export default function BrevetMathsPage() {
  return (
    <>
      <SEO
        title="Révision Brevet Maths 2026 — Aide IA, Formules, Exercices Gratuits | Apprenix"
        description="Prépare le Brevet de Maths 2026 gratuitement : calcul, algèbre, géométrie, statistiques. Aide IA étape par étape, formules, calculatrice scientifique. Zéro pub."
        keywords={[
          "révision brevet maths","brevet maths 2026","aide maths brevet","exercices maths brevet",
          "formules brevet maths","géométrie brevet","algèbre brevet","statistiques brevet",
          "correction brevet maths","maths collège 3ème","pythagore brevet","thales brevet",
          "probabilités brevet","préparation brevet maths",
        ]}
        ogType="article"
      />

      <main className="min-h-dvh bg-background">

        {/* ── Hero ── */}
        <LandingHero
          gradientFrom="200,80%,28%"
          gradientMid="210,90%,40%"
          gradientTo="195,70%,32%"
          badge="📐 Brevet de Mathématiques 2026"
          title={<>Révise le Brevet de Maths<br /><span className="text-cyan-300">avec Apprenix — gratuitement</span></>}
          subtitle="Calcul, algèbre, géométrie, statistiques : l'assistant Apprenix explique chaque étape, corrige tes erreurs et te prépare aux exercices du brevet. Zéro pub, zéro abonnement."
          ctaPrimary={{ label: 'Assistant pour les maths', to: '/aide-ia', icon: Sparkles }}
          ctaSecondary={{ label: 'Calculatrice + formules', to: '/maths-sciences', icon: Calculator }}
        />

        {/* ── Stats ── */}
        <section className="py-8 px-4 border-b border-border bg-muted/30">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-1 p-3">
                <s.icon className="w-5 h-5 text-primary mb-1" aria-hidden="true" />
                <span className="text-2xl font-extrabold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Chapitres ── */}
        <section className="py-12 px-4" aria-labelledby="chapitres-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="chapitres-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Tous les chapitres du programme
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Chaque chapitre est couvert par les outils Apprenix. Clique sur un chapitre pour commencer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHAPITRES.map((c) => (
                <Card key={c.titre} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${c.bg}`}>
                        <c.icon className={`w-5 h-5 ${c.color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{c.titre}</h3>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{c.desc}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-2">
                      <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <Link to={c.outil}>
                          {c.cta}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Formules indispensables ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="formules-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="formules-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Formules indispensables au Brevet
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Ces formules sont données dans l'épreuve — mais les connaître par cœur t'économise un temps précieux.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {FORMULES.map((f) => (
                <div key={f} className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border font-mono text-sm">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Retrouve toutes les formules organisées par chapitre et par niveau dans Apprenix.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground h-11 gap-2">
              <Link to="/maths-sciences">
                <Calculator className="w-5 h-5" />
                Toutes les formules + calculatrice
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Plan de révision ── */}
        <section className="py-12 px-4" aria-labelledby="plan-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="plan-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Plan de révision express (2 semaines)
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Même avec peu de temps, ce plan concentré te permet de revoir l'essentiel avant l'examen.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "S1–J1/J2", title: "Calcul & Algèbre",
                  desc: "Révise les fractions, puissances, équations. Fais 5–10 exercices par type.",
                  link: "/aide-ia", cta: "Exercices calcul IA" },
                {
                  step: "S1–J3/J5", title: "Géométrie",
                  desc: "Pythagore, Thalès, trigonométrie. Mémorise les formules d'aires et volumes.",
                  link: "/maths-sciences", cta: "Formules géométrie" },
                {
                  step: "S2–J1/J3", title: "Statistiques & Probabilités",
                  desc: "Moyenne, diagrammes, probabilités. Ce chapitre est souvent bien noté — ne le néglige pas.",
                  link: "/aide-ia", cta: "Exercices statistiques" },
                {
                  step: "S2–J4/J7", title: "Révision générale + Annales",
                  desc: "Fais des sujets entiers de brevet dans les conditions de l'examen. L'assistant corrige et explique.",
                  link: "/ressources", cta: "Annales brevet maths" },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="w-16 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs text-center leading-tight px-1">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{item.desc}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-8 text-xs gap-1.5">
                      <Link to={item.link}>{item.cta} <ArrowRight className="w-3 h-3" /></Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-12 px-4 bg-primary/5 border-t border-primary/10">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 text-balance">
              Objectif : 20/20 en maths au Brevet !
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Commence dès maintenant. Plus tôt tu révises, plus tu seras à l'aise le jour J.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 text-base bg-primary text-primary-foreground gap-2">
                <Link to="/aide-ia">
                  <Zap className="w-5 h-5" />
                  Commencer — 100% gratuit
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
              Aucune carte bancaire · Sans pub · RGPD respecté
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
