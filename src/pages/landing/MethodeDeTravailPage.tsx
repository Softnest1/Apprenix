/**
 * Landing SEO — Méthode de travail efficace
 * Cible : "méthode de travail lycée", "comment mieux travailler à l'école", "organisation scolaire efficace"
 * Trafic estimé : 8 000–15 000 recherches/mois (France)
 */

import { ArrowRight, BookOpen, Brain, Calendar, CheckCircle, Clock, GraduationCap, Lightbulb, Sparkles, Star, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const METHODES_PRINCIPALES = [
  {
    icon: Clock, title: 'Méthode Pomodoro', emoji: '🍅',
    desc: '25 minutes de travail intense + 5 minutes de pause. Après 4 cycles, une longue pause de 20–30 min. Réduit la procrastination de 40 % et améliore la concentration selon une étude de l\'Université de Illinois.',
    lien: '/focus', cta: 'Démarrer un Pomodoro',
    color: 'text-chart-1', bg: 'bg-chart-1/10',
  },
  {
    icon: Brain, title: 'Technique Feynman', emoji: '🧠',
    desc: 'Explique un concept comme si tu l\'enseignais à un enfant de 10 ans. Si tu bloques, c\'est là où se trouvent tes lacunes. La méthode de mémorisation la plus efficace selon Nobel de Physique Richard Feynman.',
    lien: '/aide-ia', cta: "Pratiquer avec l'assistant",
    color: 'text-primary', bg: 'bg-primary/10',
  },
  {
    icon: BookOpen, title: 'Répétition espacée', emoji: '🃏',
    desc: 'Révise le même contenu à intervalles croissants : J+1, J+3, J+7, J+14, J+30. Cette technique réduit l\'oubli de 80 % et est validée par des décennies de recherche en sciences cognitives.',
    lien: '/flashcards', cta: 'Créer des flashcards',
    color: 'text-chart-4', bg: 'bg-chart-4/10',
  },
  {
    icon: Target, title: 'Méthode Cornell', emoji: '📝',
    desc: 'Divise ta feuille en 3 zones : notes (droite), mots-clés (gauche), résumé (bas). Cette structure force ton cerveau à synthétiser l\'information et améliore la mémorisation de 60 % versus la prise de notes classique.',
    lien: '/notes', cta: 'Prendre des notes Cornell',
    color: 'text-chart-2', bg: 'bg-chart-2/10',
  },
  {
    icon: Calendar, title: 'Planning hebdomadaire', emoji: '📅',
    desc: 'Planifie tes révisions le dimanche soir pour toute la semaine. Alterne les matières (interleaving) plutôt que de tout réviser en bloc. 5 minutes de planification = 1 heure gagnée selon les experts en productivité.',
    lien: '/organisation', cta: 'Créer mon planning',
    color: 'text-chart-3', bg: 'bg-chart-3/10',
  },
  {
    icon: Zap, title: 'Deep Work (Cal Newport)', emoji: '⚡',
    desc: 'Sessions de 90 minutes de concentration maximale, sans aucune distraction (téléphone en mode avion, notifications coupées). Privilégier les créneaux du matin. Les travaux cognitifs profonds se réalisent dans cet état.',
    lien: '/focus', cta: 'Mode Deep Work 90 min',
    color: 'text-chart-5', bg: 'bg-chart-5/10',
  },
];

const ERREURS_CLASSIQUES = [
  { erreur: 'Relire ses cours passivement', solution: 'Tester sa mémoire activement (flashcards, quiz)' },
  { erreur: 'Tout réviser la veille (bachotage)', solution: 'Étaler les révisions sur plusieurs semaines (spacing)' },
  { erreur: 'Réviser toujours la même matière en bloc', solution: 'Alterner les matières chaque heure (interleaving)' },
  { erreur: 'Travailler avec le téléphone à côté', solution: 'Mode avion pendant les sessions, téléphone dans une autre pièce' },
  { erreur: 'Faire des longues sessions de 4h+ sans pause', solution: 'Sessions de 25–90 min avec vraies pauses actives' },
  { erreur: 'Recopier ses cours mot pour mot', solution: 'Synthétiser avec ses propres mots (méthode Feynman)' },
  { erreur: 'Ignorer le planning et travailler "quand j\'ai le temps"', solution: 'Bloquer des créneaux fixes dans l\'agenda, comme des rendez-vous' },
  { erreur: 'Commencer par les matières faciles', solution: 'Commencer par la matière la plus difficile (mangez la grenouille)' },
];

const PLANNING_TYPE = [
  { moment: 'Matin 7h–8h', activite: 'Révision flashcards (15 min) + planification de la journée (5 min)', emoji: '🌅' },
  { moment: 'Après école 17h–19h', activite: '2 Pomodoros (25 min chacun) sur la matière du lendemain', emoji: '📚' },
  { moment: 'Soirée 20h–21h', activite: 'Révision active du cours du jour (méthode Cornell)', emoji: '📝' },
  { moment: 'Dimanche soir', activite: 'Planning de la semaine + révision flashcards difficiles', emoji: '📅' },
  { moment: 'Avant un exam', activite: 'J-7 : plan de révision ciblé. J-1 : fiches synthèse uniquement, repos', emoji: '🎯' },
];

export default function MethodeDeTravailPage() {
  return (
    <>
      <SEO
        title="Méthode de Travail Efficace — Lycée & Collège | Apprenix"
        description="Les meilleures méthodes de travail pour lycéens et collégiens : Pomodoro, Feynman, répétition espacée, Deep Work. Améliore tes notes avec des techniques validées par les neurosciences."
        canonical="/methode-de-travail"
        keywords="méthode de travail lycée, comment mieux travailler à l'école, organisation scolaire efficace, méthode Pomodoro lycée, technique Feynman, répétition espacée, comment réviser efficacement, méthode de révision collège lycée, organisation scolaire gratuit"
        dateModified="2026-06-18"
        ogType="article"
        breadcrumbs={[
          { name: 'Accueil', url: 'https://apprenix.org/' },
          { name: 'Organisation', url: 'https://apprenix.org/organisation' },
          { name: 'Méthode de travail efficace' },
        ]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Méthode de travail efficace — Lycée & Collège',
            description: 'Les meilleures méthodes de travail pour lycéens et collégiens validées par les neurosciences',
            author: { '@type': 'Person', name: 'Charly Soudan' },
            publisher: { '@type': 'Organization', name: 'Apprenix', url: 'https://apprenix.org' },
            datePublished: '2024-01-01',
            dateModified: '2026-06-18',
            inLanguage: 'fr-FR',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Quelle est la meilleure méthode de révision pour le lycée ?',
                acceptedAnswer: { '@type': 'Answer', text: 'Les méthodes les plus efficaces validées par les neurosciences sont : (1) la répétition espacée (flashcards SM-2), (2) la technique Pomodoro (25 min travail / 5 min pause), (3) le testing effect (se tester activement plutôt que relire), et (4) l\'interleaving (alterner les matières). Apprenix propose des outils gratuits pour chacune de ces méthodes.' },
              },
              {
                '@type': 'Question',
                name: 'Combien d\'heures faut-il travailler par jour au lycée ?',
                acceptedAnswer: { '@type': 'Answer', text: 'La qualité prime sur la quantité. 2 heures de travail concentré (sans téléphone, sans distraction) valent mieux que 5 heures de travail distrait. En lycée général, 2–3h de travail personnel par soir sont suffisantes si elles sont bien organisées. Les périodes de révisions intenses (avant le bac) peuvent aller jusqu\'à 6–8h/jour, avec des pauses régulières.' },
              },
            ],
          },
        ]}
      />

      <div className="min-w-0 space-y-10">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden -mx-3 md:-mx-5 lg:-mx-6 -mt-3 md:-mt-5 lg:-mt-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white px-5 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Collège &amp; Lycée</Badge>
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Neurosciences</Badge>
              <Badge className="bg-emerald-300/30 border-emerald-200/40 text-white text-xs font-bold">100 % gratuit</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white text-balance leading-[1.1] mb-4">
              Méthodes de Travail Efficaces<br className="hidden md:block" /> pour Lycéens &amp; Collégiens
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed text-pretty mb-6 max-w-xl">
              6 méthodes validées par les neurosciences, les erreurs à éviter absolument, et un planning type — pour travailler mieux, pas plus longtemps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/focus">
                <Button className="bg-white text-emerald-700 hover:bg-white/90 font-bold px-6 py-3 rounded-xl min-h-[48px]">
                  <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
                  Démarrer un Pomodoro
                </Button>
              </Link>
              <Link to="/organisation">
                <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl min-h-[48px]">
                  <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                  Créer mon planning
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6 méthodes ── */}
        <section aria-label="Méthodes de travail efficaces">
          <div className="mb-5">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300">Méthodes</Badge>
            <h2 className="text-xl md:text-3xl font-extrabold text-foreground text-balance">
              6 méthodes validées par les neurosciences
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-xl">Ces techniques sont utilisées par les meilleurs élèves et recommandées par les chercheurs en sciences cognitives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METHODES_PRINCIPALES.map(({ icon: Icon, title, emoji, desc, lien, cta, color, bg }) => (
              <Card key={title} className="border-border/60 group hover:border-emerald-300 transition-colors duration-150">
                <CardContent className="p-5 flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground mb-1 text-balance">{emoji} {title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed text-pretty mb-2">{desc}</p>
                    <Link to={lien} className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline underline-offset-2 ${color}`}>
                      {cta} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Planning type ── */}
        <section aria-label="Planning de travail type lycéen">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300">Planning</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Planning type d'un lycéen organisé</h2>
            <p className="text-sm text-muted-foreground mt-1">À adapter à ton emploi du temps — l'essentiel est la régularité.</p>
          </div>
          <div className="space-y-2">
            {PLANNING_TYPE.map(({ moment, activite, emoji }) => (
              <Card key={moment} className="border-border/60">
                <CardContent className="p-3 md:p-4 flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">{moment}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activite}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Crée ton planning personnalisé dans l'<Link to="/organisation" className="text-emerald-600 hover:underline font-semibold">agenda d'Apprenix</Link> — gratuit, avec rappels et to-do list.
          </p>
        </section>

        {/* ── Erreurs à éviter ── */}
        <section aria-label="Erreurs de travail classiques à éviter">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-red-300 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300">Erreurs</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">8 erreurs à éviter absolument</h2>
            <p className="text-sm text-muted-foreground mt-1">Les pièges les plus courants qui font perdre des heures de travail inutilement.</p>
          </div>
          <div className="space-y-2">
            {ERREURS_CLASSIQUES.map(({ erreur, solution }) => (
              <Card key={erreur} className="border-border/60 bg-muted/20">
                <CardContent className="p-3 md:p-4 flex gap-3 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-destructive/80 line-through">{erreur}</p>
                    <p className="text-xs font-medium text-success mt-0.5 flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
                      {solution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 md:p-10 text-white text-center space-y-4">
          <Sparkles className="w-10 h-10 mx-auto text-white/80" aria-hidden="true" />
          <h2 className="text-xl md:text-3xl font-extrabold text-balance">Prêt à travailler mieux — pas plus ?</h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto text-pretty">
            Apprenix met à ta disposition tous les outils pour appliquer ces méthodes : Pomodoro, flashcards, planning, assistant pédagogique. Gratuit, sans pub, disponible 24h/24.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/organisation">
              <Button className="bg-white text-emerald-700 hover:bg-white/90 font-bold px-8 py-3 rounded-xl min-h-[48px]">
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                Créer mon planning
              </Button>
            </Link>
            <Link to="/flashcards">
              <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl min-h-[48px]">
                <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                Mes flashcards
              </Button>
            </Link>
          </div>
          <p className="text-white/50 text-xs">Aucune inscription requise · Zéro pub · RGPD</p>
        </section>

        {/* ── Liens internes ── */}
        <nav aria-label="Autres ressources organisation scolaire" className="flex flex-wrap gap-2">
          {[
            { to: '/focus',            label: 'Mode Deep Work Pomodoro' },
            { to: '/flashcards',       label: 'Flashcards — répétition espacée' },
            { to: '/organisation',     label: 'Agenda &amp; to-do list' },
            { to: '/aide-ia',          label: 'Assistant — toutes matières' },
            { to: '/revision-bac-2026', label: 'Révision Bac 2026' },
            { to: '/cours-maths-gratuit', label: 'Cours maths gratuits' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-xs font-semibold text-primary hover:underline underline-offset-2 border border-border/50 rounded-full px-3 py-1.5 hover:border-primary/30 transition-colors min-h-[36px] flex items-center">{label}</Link>
          ))}
        </nav>

      </div>
    </>
  );
}
