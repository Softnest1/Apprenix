/**
 * Landing SEO — Aide aux devoirs gratuite IA
 * Cible : "aide devoirs gratuit", "aide aux devoirs IA", "devoirs IA gratuit"
 * Trafic estimé : 15 000–40 000 recherches/mois (France)
 */

import {
  ArrowRight, BookOpen, Brain, Calculator, CheckCircle, Clock, FileText, 
  GraduationCap, Heart,Languages,Shield, 
  Sparkles, Star, TrendingUp,Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingHero from '@/components/ui/LandingHero';

const MATIERES = [
  { name: "Mathématiques", icon: Calculator, color: "text-primary", level: "CP → Bac+5" },
  { name: "Français", icon: BookOpen, color: "text-chart-2", level: "CP → Terminale" },
  { name: "Histoire-Géo", icon: TrendingUp, color: "text-chart-4", level: "CE1 → Terminale" },
  { name: "Anglais", icon: Languages, color: "text-success", level: "CE1 → Bac+5" },
  { name: "SVT / Sciences", icon: Brain, color: "text-chart-1", level: "CM1 → Bac+5" },
  { name: "Philosophie", icon: FileText, color: "text-chart-3", level: "Terminale → Fac" },
  { name: "Physique-Chimie", icon: Sparkles, color: "text-primary", level: "4ème → Bac+5" },
  { name: "Économie (SES)", icon: TrendingUp, color: "text-chart-2", level: "Seconde → Bac" },
];

const AVANTAGES = [
  {
    icon: Zap, title: "Réponse en secondes",
    desc: "L'assistant analyse ta question et te donne une explication claire, avec des exemples adaptés à ton niveau." },
  {
    icon: Brain, title: "Mode socratique",
    desc: "L'assistant te guide par des questions pour que tu comprennes vraiment le raisonnement." },
  {
    icon: Shield, title: "Sécurisé pour les enfants",
    desc: "Aucune pub, aucune donnée vendue. Certifié RGPD, adapté aux mineurs." },
  {
    icon: Heart, title: "Sans jugement",
    desc: "Pose la même question 10 fois — l'assistant reste patient et bienveillant." },
  {
    icon: Star, title: "Adapté à ton niveau",
    desc: "Du CP à l'université : l'assistant adapte automatiquement le vocabulaire et la complexité." },
  {
    icon: Clock, title: "Disponible 24h/24",
    desc: "Révisions de dernière minute à 23h ? Apprenix est là, sans rendez-vous." },
];

const NIVEAUX = [
  { label: "Primaire (CP → CM2)", color: "bg-success/10 text-success border-success/20" },
  { label: "Collège (6e → 3e)", color: "bg-primary/10 text-primary border-primary/20" },
  { label: "Lycée (2de → Tle)", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  { label: "BTS / IUT / Fac", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  { label: "Prépa / Grandes écoles", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
];

export default function AideDevoirsGratuitPage() {
  return (
    <>
      <SEO
        title="Aide aux devoirs gratuite avec l'IA — Toutes matières, Tous niveaux | Apprenix"
        description="Aide aux devoirs gratuite et immédiate avec l'IA. Maths, français, anglais, histoire, sciences — du CP au Bac+5. Explications claires, mode socratique, sans pub."
        keywords={[
          "aide aux devoirs gratuite", "aide devoirs IA", "aide devoirs gratuit en ligne",
          "aide devoirs intelligence artificielle", "aide scolaire gratuite", "soutien scolaire gratuit",
          "aide devoirs maths", "aide devoirs français", "aide devoirs collège", "aide devoirs lycée",
          "aide devoirs primaire", "tuteur IA gratuit", "cours particuliers gratuits IA",
        ]}
        ogType="website"
      />

      <main className="min-h-dvh bg-background">

        {/* ── Hero ── */}
        <LandingHero
          gradientFrom="150,65%,22%"
          gradientMid="158,75%,32%"
          gradientTo="142,60%,26%"
          badge="✅ 100% Gratuit — Toujours"
          title={<>Aide aux devoirs gratuite<br /><span className="text-emerald-300">avec l'assistant Apprenix</span></>}
          subtitle="Bloqué sur un exercice ? L'assistant Apprenix t'explique la méthode, corrige tes erreurs et t'aide à comprendre — pas juste à copier. Du CP au Bac+5, toutes matières, 24h/24."
          ctaPrimary={{ label: "Poser ma question — gratuit", to: '/aide-ia', icon: Sparkles }}
          ctaSecondary={{ label: 'Scanner mon devoir (photo)', to: '/scanner', icon: FileText }}
          extra={
            <div className="flex flex-wrap justify-center gap-2">
              {NIVEAUX.map((n) => (
                <span
                  key={n.label}
                  className="inline-flex items-center bg-white/15 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  {n.label}
                </span>
              ))}
            </div>
          }
        />

        {/* ── Matières ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="matieres-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="matieres-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance text-center">
              Toutes les matières couvertes
            </h2>
            <p className="text-muted-foreground mb-8 text-center text-pretty">
              De la primaire à l'université — l'assistant s'adapte à ton niveau et ta matière.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MATIERES.map((m) => (
                <Card key={m.name} className="h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2 h-full">
                    <m.icon className={`w-8 h-8 ${m.color} mt-1`} aria-hidden="true" />
                    <span className="font-bold text-foreground text-sm">{m.name}</span>
                    <Badge variant="outline" className="text-xs">{m.level}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button asChild size="lg" className="h-11 bg-primary text-primary-foreground gap-2">
                <Link to="/aide-ia">
                  <Sparkles className="w-5 h-5" />
                  Commencer maintenant
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Avantages ── */}
        <section className="py-12 px-4" aria-labelledby="avantages-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="avantages-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Pourquoi Apprenix est différent
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Pas juste un chatbot qui donne les réponses — un vrai assistant pédagogique.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVANTAGES.map((a) => (
                <Card key={a.title} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="p-2 rounded-xl bg-primary/10 w-fit">
                      <a.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{a.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparaison ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="comparaison-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="comparaison-title" className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-balance">
              Apprenix vs. les alternatives
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-bold text-foreground whitespace-nowrap">Solution</th>
                    <th className="text-center p-3 font-bold text-primary whitespace-nowrap">Apprenix</th>
                    <th className="text-center p-3 text-muted-foreground whitespace-nowrap">Cours particuliers</th>
                    <th className="text-center p-3 text-muted-foreground whitespace-nowrap">Autres outils</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Gratuit", "✅ Toujours", "❌ 20–60€/h", "⚠️ Limité"],
                    ["Disponible 24h/24", "✅", "❌", "✅"],
                    ["Adapté programme français", "✅", "✅", "⚠️ Partiel"],
                    ["Sans inscription obligatoire", "✅", "❌", "❌"],
                    ["Mode socratique", "✅", "✅", "❌"],
                    ["Sécurisé mineurs RGPD", "✅", "✅", "⚠️ Variable"],
                    ["40+ outils éducatifs", "✅", "❌", "❌"],
                  ].map(([feature, app, cours, autres]) => (
                    <tr key={feature} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-foreground font-medium whitespace-nowrap">{feature}</td>
                      <td className="p-3 text-center text-success font-semibold whitespace-nowrap">{app}</td>
                      <td className="p-3 text-center text-muted-foreground whitespace-nowrap">{cours}</td>
                      <td className="p-3 text-center text-muted-foreground whitespace-nowrap">{autres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Parents + Enseignants ── */}
        <section className="py-12 px-4 border-t border-border" aria-labelledby="parents-title">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 id="parents-title" className="text-2xl font-bold text-foreground mb-3 text-balance">
                🧑‍👩‍👧 Pour les parents
              </h2>
              <ul className="space-y-2 mb-4">
                {[
                  "Aucune donnée personnelle vendue",
                  "Mode parental : suivez la progression",
                  "Conforme RGPD, adapté aux mineurs",
                  "Aucune pub, aucun abonnement caché",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to="/parents">En savoir plus <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3 text-balance">
                👩‍🏫 Pour les enseignants
              </h2>
              <ul className="space-y-2 mb-4">
                {[
                  "Aligné sur les référentiels Éduscol",
                  "Mode Projecteur pour la classe",
                  "Accessible DYS, ULIS, SEGPA",
                  "Aucun coût pour les établissements",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to="/enseignants">Espace enseignants <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-12 px-4 bg-primary/5 border-t border-primary/10">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 text-balance">
              La meilleure aide aux devoirs — et elle est gratuite
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Rejoins des milliers d'élèves qui utilisent Apprenix pour progresser.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 text-base bg-primary text-primary-foreground gap-2">
                <Link to="/aide-ia">
                  <Sparkles className="w-5 h-5" />
                  Essayer maintenant — gratuit
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 text-base gap-2">
                <Link to="/connexion">
                  <Users className="w-5 h-5" />
                  Créer un compte
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
