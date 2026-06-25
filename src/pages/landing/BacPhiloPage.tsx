/**
 * Landing SEO — Bac Philo 2026
 * Cible : "bac philo 2026", "dissertation philosophie bac", "méthode dissertation philo"
 * Trafic estimé : 12 000–25 000 recherches/mois (France, pic avril–juin)
 */

import { ArrowRight, BookOpen, Brain, CheckCircle, Clock, FileText, GraduationCap, Lightbulb, Sparkles, Star, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AUTEURS = [
  { nom: 'Platon', thème: 'Idées, justice, âme', oeuvre: 'La République' },
  { nom: 'Descartes', thème: 'Cogito, raison, doute', oeuvre: 'Méditations' },
  { nom: 'Kant', thème: 'Devoir moral, liberté', oeuvre: 'Critique de la raison pure' },
  { nom: 'Nietzsche', thème: 'Volonté, valeurs, nihilisme', oeuvre: 'Ainsi parlait Zarathoustra' },
  { nom: 'Sartre', thème: 'Liberté, existence, responsabilité', oeuvre: 'L\'Être et le Néant' },
  { nom: 'Simone de Beauvoir', thème: 'Féminisme, liberté, identité', oeuvre: 'Le Deuxième Sexe' },
  { nom: 'Aristote', thème: 'Bonheur, politique, logique', oeuvre: 'Éthique à Nicomaque' },
  { nom: 'Rousseau', thème: 'Nature, société, contrat', oeuvre: 'Du contrat social' },
];

const NOTIONS = [
  'Le bonheur', 'La liberté', 'La conscience', 'Le langage', 'L\'art', 'Le travail',
  'La technique', 'L\'État', 'La justice', 'La vérité', 'Le temps', 'La nature',
  'La religion', 'L\'histoire', 'La raison', 'La perception',
];

const METHODE_DISSERTATION = [
  {
    step: '01', title: 'Analyser le sujet (15 min)',
    desc: 'Définir chaque terme du sujet. Reformuler la question. Repérer les présupposés et les tensions. Ne jamais commencer à rédiger sans cette étape.',
    icon: Brain,
  },
  {
    step: '02', title: 'Problématiser (10 min)',
    desc: 'Dégager le paradoxe ou la tension philosophique du sujet. La problématique n\'est PAS une reformulation du sujet — c\'est sa mise en question.',
    icon: Lightbulb,
  },
  {
    step: '03', title: 'Construire le plan (20 min)',
    desc: 'Plan dialectique classique : Thèse → Antithèse → Synthèse. Chaque partie = 1 argument central + exemples + références philosophiques.',
    icon: Target,
  },
  {
    step: '04', title: 'Rédiger l\'introduction (20 min)',
    desc: 'Accroche → présentation du sujet → définition des termes → problématique → annonce du plan. L\'intro doit tenir en 1 page max.',
    icon: FileText,
  },
  {
    step: '05', title: 'Développer les parties (2h30)',
    desc: 'Chaque partie : phrase d\'annonce → argumentation → exemple concret → référence d\'auteur → transition vers la partie suivante.',
    icon: BookOpen,
  },
  {
    step: '06', title: 'Rédiger la conclusion (15 min)',
    desc: 'Récapituler le cheminement → répondre à la problématique → ouverture vers une question plus large. Jamais de nouvelle idée en conclusion.',
    icon: Star,
  },
];

const SUJETS_FREQUENTS = [
  { sujet: 'La liberté est-elle une illusion ?', notion: 'Liberté' },
  { sujet: 'Peut-on être heureux sans les autres ?', notion: 'Bonheur' },
  { sujet: 'La conscience nous rend-elle libres ?', notion: 'Conscience' },
  { sujet: 'Le travail est-il une contrainte ou un épanouissement ?', notion: 'Travail' },
  { sujet: 'L\'art peut-il se passer de règles ?', notion: 'Art' },
  { sujet: 'Faut-il toujours chercher la vérité ?', notion: 'Vérité' },
  { sujet: 'La technique nous libère-t-elle ?', notion: 'Technique' },
  { sujet: 'L\'État est-il l\'ennemi de la liberté ?', notion: 'État' },
];

export default function BacPhiloPage() {
  return (
    <>
      <SEO
        title="Bac Philo 2026 — Fiches, méthode dissertation & auteurs clés | Apprenix"
        description="Prépare le Bac Philosophie 2026 avec Apprenix : méthode dissertation, fiches auteurs (Platon, Kant, Sartre…), notions clés et sujets fréquents. Gratuit, sans pub."
        canonical="/bac-philo"
        keywords="bac philo 2026, dissertation philosophie bac, méthode dissertation philo, fiches philo terminale, auteurs philo bac, notions philosophie terminale, bac philosophie gratuit, révision philo terminale"
        dateModified="2026-06-18"
        ogType="article"
        breadcrumbs={[
          { name: 'Accueil', url: 'https://apprenix.org/' },
          { name: 'Révision Bac 2026', url: 'https://apprenix.org/revision-bac-2026' },
          { name: 'Bac Philo 2026' },
        ]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Révision Bac Philosophie 2026',
            description: 'Méthode dissertation, fiches auteurs et notions clés pour le Bac Philosophie 2026',
            provider: { '@type': 'Organization', name: 'Apprenix', url: 'https://apprenix.org' },
            isAccessibleForFree: true,
            inLanguage: 'fr-FR',
            educationalLevel: 'Terminale',
            courseMode: 'online',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Comment réussir la dissertation de philosophie au bac ?',
                acceptedAnswer: { '@type': 'Answer', text: 'Pour réussir la dissertation philo au bac, il faut : (1) analyser précisément le sujet et définir chaque terme, (2) formuler une problématique claire (pas juste reformuler), (3) construire un plan dialectique (thèse/antithèse/synthèse), (4) illustrer chaque argument par des exemples et des références d\'auteurs, (5) soigner l\'introduction et la conclusion. L\'assistant méthode d\'Apprenix peut t\'aider à structurer ta dissertation étape par étape.' },
              },
              {
                '@type': 'Question',
                name: 'Quelles sont les notions clés du programme de philosophie terminale ?',
                acceptedAnswer: { '@type': 'Answer', text: 'Les notions clés du Bac Philo sont : le bonheur, la liberté, la conscience, le langage, l\'art, le travail, la technique, l\'État, la justice, la vérité, le temps, la nature, la religion, l\'histoire, la raison et la perception. Chaque notion peut faire l\'objet d\'une dissertation ou d\'un commentaire de texte.' },
              },
            ],
          },
        ]}
      />

      <div className="min-w-0 space-y-10">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden -mx-3 md:-mx-5 lg:-mx-6 -mt-3 md:-mt-5 lg:-mt-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white px-5 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-2xl" />
          </div>
          <div className="relative max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Terminale</Badge>
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Bac 2026</Badge>
              <Badge className="bg-emerald-500/30 border-emerald-400/40 text-white text-xs font-bold">100 % gratuit</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white text-balance leading-[1.1] mb-4">
              Bac Philo 2026 —<br className="hidden md:block" /> Méthode, fiches &amp; auteurs
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed text-pretty mb-6 max-w-lg">
              Dissertation étape par étape, fiches notions, 8 auteurs clés et sujets fréquents. Tout ce qu'il faut pour décrocher une bonne note en philosophie — sans abonnement, sans pub.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/aide-ia">
                <Button className="bg-white text-purple-700 hover:bg-white/90 font-bold px-6 py-3 rounded-xl min-h-[48px]">
                  <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                  Fiches méthode Philosophie
                </Button>
              </Link>
              <Link to="/ressources">
                <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl min-h-[48px]">
                  <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                  Fiches de révision
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Méthode dissertation ── */}
        <section aria-label="Méthode dissertation philosophie bac">
          <div className="mb-5">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-violet-300 text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300">Méthode</Badge>
            <h2 className="text-xl md:text-3xl font-extrabold text-foreground text-balance">
              Dissertation philo en 6 étapes
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-xl">La méthode complète pour structurer ta dissertation et éviter les erreurs classiques — avec le timing pour une épreuve de 4h.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METHODE_DISSERTATION.map(({ step, title, desc, icon: Icon }) => (
              <Card key={step} className="border-border/60 hover:border-violet-300 transition-colors duration-150">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-500">{step}</span>
                      <h3 className="text-sm font-bold text-foreground text-balance">{title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed text-pretty">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Sujets fréquents ── */}
        <section aria-label="Sujets fréquents bac philo">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-violet-300 text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300">Sujets</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Sujets de dissertation fréquents</h2>
            <p className="text-sm text-muted-foreground mt-1">Analyse de sujets types tombés ou susceptibles de tomber au Bac 2026.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUJETS_FREQUENTS.map(({ sujet, notion }) => (
              <Card key={sujet} className="border-border/60 group hover:border-violet-300 transition-colors duration-150 cursor-pointer" onClick={() => { window.location.href = '/aide-ia'; }}>
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground text-balance">« {sujet} »</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Notion : <span className="font-medium text-violet-600 dark:text-violet-400">{notion}</span></p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-violet-500 transition-colors ml-auto" aria-hidden="true" />
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Utilise l'<Link to="/aide-ia" className="text-violet-600 hover:underline font-semibold">aide aux devoirs d'Apprenix</Link> pour analyser n'importe quel sujet de dissertation philo étape par étape.
          </p>
        </section>

        {/* ── Notions ── */}
        <section aria-label="Notions clés philosophie terminale">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-violet-300 text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300">Notions</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Les 16 notions du programme Terminale</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {NOTIONS.map(n => (
              <Link key={n} to="/aide-ia"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800/30 transition-colors min-h-[36px]">
                {n}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Auteurs ── */}
        <section aria-label="Auteurs clés philosophie bac">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-violet-300 text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300">Auteurs</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">8 auteurs incontournables du Bac Philo</h2>
            <p className="text-sm text-muted-foreground mt-1">Maîtriser ces auteurs permet de citer des références dans n'importe quelle dissertation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AUTEURS.map(({ nom, thème, oeuvre }) => (
              <Card key={nom} className="border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">{nom[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{nom}</p>
                    <p className="text-xs text-muted-foreground truncate">{thème} · <em>{oeuvre}</em></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 md:p-10 text-white text-center space-y-4">
          <GraduationCap className="w-10 h-10 mx-auto text-white/80" aria-hidden="true" />
          <h2 className="text-xl md:text-3xl font-extrabold text-balance">Prêt à réussir ton Bac Philo 2026 ?</h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto text-pretty">
            Consulte les fiches méthode, analyse des sujets guidés, accède aux auteurs et aux notions — gratuit, sans pub, disponible 24h/24.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/aide-ia">
              <Button className="bg-white text-purple-700 hover:bg-white/90 font-bold px-8 py-3 rounded-xl min-h-[48px]">
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                Fiches méthode Philosophie — gratuit
              </Button>
            </Link>
            <Link to="/espace">
              <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl min-h-[48px]">
                <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
                Espace Lycée complet
              </Button>
            </Link>
          </div>
          <p className="text-white/50 text-xs">Aucune inscription requise · Zéro pub · RGPD</p>
        </section>

        {/* ── Liens internes ── */}
        <nav aria-label="Autres révisions Bac 2026" className="flex flex-wrap gap-2">
          {[
            { to: '/bac-francais',     label: '← Bac Français 2026' },
            { to: '/revision-bac-2026', label: 'Révision Bac 2026 (toutes matières)' },
            { to: '/cours-maths-gratuit', label: 'Cours Maths gratuits' },
            { to: '/flashcards',       label: 'Flashcards philo' },
            { to: '/methode-de-travail', label: 'Méthode de travail lycée' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-xs font-semibold text-primary hover:underline underline-offset-2 border border-border/50 rounded-full px-3 py-1.5 hover:border-primary/30 transition-colors min-h-[36px] flex items-center">
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </>
  );
}
