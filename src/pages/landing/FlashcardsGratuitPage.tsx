/**
 * Landing SEO — Flashcards gratuites en ligne
 * Cible : "flashcards gratuites", "flashcards révision", "méthode leitner", "répétition espacée"
 * Trafic estimé : 5 000–12 000 recherches/mois (France)
 */

import {BookOpen, 
  Brain, Clock, GraduationCap,
  Repeat, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingHero from '@/components/ui/LandingHero';

const FONCTIONNALITES = [
  {
    icon: Sparkles, title: "Ressources Éduscol",
    desc: "Toutes les flashcards sont créées par des enseignants certifiés, conformes aux programmes officiels Éduscol — zéro génération automatique.",
    cta: null },
  {
    icon: Repeat, title: "Répétition espacée (SRS)",
    desc: "L'algorithme de répétition espacée programme tes révisions au bon moment : tu passes plus de temps sur ce que tu ne sais pas encore.",
    cta: null },
  {
    icon: Brain, title: "Méthode Leitner intégrée",
    desc: "Le système de boîtes de Leitner est intégré : les cartes difficiles reviennent plus souvent, les cartes maîtrisées s'espacent.",
    cta: null },
  {
    icon: BookOpen, title: "Tous les sujets scolaires",
    desc: "Crée des decks pour chaque matière, chaque chapitre, chaque examen. Organise tes decks par niveau et par matière.",
    cta: null },
  {
    icon: TrendingUp, title: "Suivi de progression",
    desc: "Visualise ton taux de maîtrise par deck, tes sessions de révision et tes progrès au fil du temps.",
    cta: null },
  {
    icon: Clock, title: "Disponible hors ligne (PWA)",
    desc: "Installe Apprenix comme une application sur ton téléphone. Tes flashcards sont disponibles même sans internet.",
    cta: null },
];

const EXEMPLES_DECKS = [
  { subject: "Histoire", deck: "La Seconde Guerre mondiale — 20 cartes", level: "Lycée" },
  { subject: "SVT", deck: "La cellule et sa structure — 15 cartes", level: "3e" },
  { subject: "Anglais", deck: "Vocabulaire GCSE / Cambridge — 30 cartes", level: "Lycée" },
  { subject: "Maths", deck: "Formules de géométrie brevet — 12 cartes", level: "3e" },
  { subject: "Géographie", deck: "Les capitales européennes — 25 cartes", level: "Collège" },
  { subject: "Philo", deck: "Les grands auteurs et leurs œuvres — 18 cartes", level: "Terminale" },
];

const SCIENCE_FACTS = [
  { stat: "67%", desc: "de mémorisation en plus grâce à la répétition espacée vs relecture" },
  { stat: "20 min", desc: "par jour suffisent pour réviser efficacement avec les flashcards" },
  { stat: "90%", desc: "de rétention à long terme avec la méthode SRS (vs 20% avec le bachotage)" },
];

export default function FlashcardsGratuitPage() {
  return (
    <>
      <SEO
        title="Flashcards Gratuites en Ligne — Répétition Espacée, Méthode Leitner | Apprenix"
        description="Crée tes flashcards gratuitement ou choisis parmi nos bibliothèques de révision. Algorithme de répétition espacée (SRS), méthode Leitner, disponible sur mobile. Pour tous les niveaux. Sans pub."
        keywords={[
          "flashcards gratuites","flashcards révision","répétition espacée","méthode leitner",
          "flashcards en ligne","créer flashcards","flashcards scolaires","flashcards bac",
          "flashcards brevet","SRS révision","anki gratuit","cartes mémoire","mémorisation",
          "flashcards IA","révision efficace","apprendre flashcards",
        ]}
        ogType="website"
      />

      <main className="min-h-dvh bg-background">

        {/* ── Hero ── */}
        <LandingHero
          gradientFrom="265,70%,28%"
          gradientMid="275,80%,42%"
          gradientTo="255,65%,33%"
          badge="🧠 Méthode scientifique de mémorisation"
          title={<>Flashcards gratuites<br /><span className="text-violet-300">prêtes à réviser en 1 clic</span></>}
          subtitle="Crée tes propres flashcards ou choisis parmi nos bibliothèques de révision. L'algorithme de répétition espacée (SRS) optimise tes révisions pour une mémorisation maximale. Gratuit, sans pub, sans limite."
          ctaPrimary={{ label: "Créer mes flashcards", to: '/flashcards', icon: Sparkles }}
          ctaSecondary={{ label: 'Commencer à réviser', to: '/flashcards', icon: Brain }}
        />

        {/* ── Science de la mémorisation ── */}
        <section className="py-10 px-4 bg-primary/5 border-y border-primary/10">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCIENCE_FACTS.map((f) => (
              <div key={f.stat} className="text-center">
                <p className="text-4xl font-extrabold text-primary">{f.stat}</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section className="py-12 px-4" aria-labelledby="fonctionnalites-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="fonctionnalites-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Tout ce qu'il faut pour mémoriser efficacement
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Apprenix applique les méthodes scientifiques de mémorisation pour te faire progresser durablement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FONCTIONNALITES.map((f) => (
                <Card key={f.title} className="h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="p-2 rounded-xl bg-primary/10 w-fit">
                      <f.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Exemples de decks ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="exemples-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="exemples-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              Exemples de decks du programme scolaire
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Nos bibliothèques proposent des cartes pertinentes sur les sujets clés du programme français.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {EXEMPLES_DECKS.map((d) => (
                <div key={d.deck} className="p-4 rounded-xl bg-background border border-border">
                  <Badge variant="outline" className="text-xs mb-2">{d.subject}</Badge>
                  <p className="text-sm font-medium text-foreground">{d.deck}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.level}</p>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="bg-primary text-primary-foreground h-11 gap-2">
              <Link to="/flashcards">
                <Sparkles className="w-5 h-5" />
                Explorer les decks disponibles
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Méthode Leitner expliquée ── */}
        <section className="py-12 px-4" aria-labelledby="leitner-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="leitner-title" className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
              La méthode Leitner — comment ça marche ?
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty">
              Développée par le journaliste Sebastian Leitner dans les années 70, cette méthode
              est aujourd'hui validée par des dizaines d'études scientifiques.
            </p>
            <ol className="space-y-4">
              {[
                {
                  step: "1", title: "Tu vois une carte",
                  desc: "Tu vois la question (recto) et tu essaies de te souvenir de la réponse (verso)." },
                {
                  step: "2", title: "Tu t'évalues",
                  desc: "Facile, Moyen ou Difficile ? Ta réponse détermine quand cette carte réapparaîtra." },
                {
                  step: "3", title: "L'algorithme programme la prochaine révision",
                  desc: "Facile → dans 7 jours. Moyen → dans 3 jours. Difficile → demain. Toujours au bon moment." },
                {
                  step: "4", title: "Tu mémorises sans effort excessif",
                  desc: "Chaque session est courte mais efficace. Tu révises exactement ce dont tu as besoin, quand tu en as besoin." },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center shrink-0 text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 px-4 bg-muted/20" aria-labelledby="faq-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="faq-title" className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-balance">
              Questions fréquentes sur les flashcards
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Les flashcards Apprenix sont-elles vraiment gratuites ?",
                  a: "Oui, totalement gratuites. Aucun abonnement, aucune limite de decks, aucune publicité. La gratuité est inscrite dans les CGU d'Apprenix (article 1)." },
                {
                  q: "Puis-je utiliser Apprenix sur mon téléphone ?",
                  a: "Oui. Apprenix est une PWA (Progressive Web App) — tu peux l'installer sur ton téléphone Android ou iPhone et utiliser tes flashcards hors ligne." },
                {
                  q: "Combien de flashcards puis-je créer ?",
                  a: "Autant que tu veux — aucune limite. Tu peux créer tes propres decks manuellement ou importer nos bibliothèques de révision du programme officiel. 100 % gratuit, toujours." },
                {
                  q: "Mes flashcards sont-elles sauvegardées ?",
                  a: "Oui, automatiquement dans ton navigateur. En créant un compte gratuit, tes données sont sauvegardées et accessibles depuis n'importe quel appareil." },
              ].map((item) => (
                <div key={item.q} className="p-4 rounded-2xl bg-background border border-border">
                  <h3 className="font-bold text-foreground text-sm mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-12 px-4 bg-primary/5 border-t border-primary/10">
          <div className="max-w-2xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 text-balance">
              Commence à mémoriser intelligemment
            </h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              Crée ton premier deck en moins de 30 secondes avec nos bibliothèques prêtes à l'emploi. Gratuit, toujours.
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 text-base bg-primary text-primary-foreground gap-2">
                <Link to="/flashcards">
                  <Zap className="w-5 h-5" />
                  Créer mes flashcards — gratuit
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
