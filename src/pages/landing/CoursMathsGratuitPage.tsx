/**
 * Landing SEO — Cours de maths gratuits
 * Cible : "cours maths gratuit", "cours de mathématiques gratuit en ligne", "révision maths collège lycée"
 * Trafic estimé : 18 000–30 000 recherches/mois (France)
 */

import { ArrowRight, BookOpen, Brain, Calculator, CheckCircle, GraduationCap, Sparkles, Star, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CHAPITRES_COLLEGE = [
  { niveau: '6ème', chapitres: ['Nombres entiers et décimaux', 'Fractions', 'Géométrie plane', 'Périmètre et aire', 'Statistiques de base'] },
  { niveau: '5ème', chapitres: ['Nombres relatifs', 'Proportionnalité', 'Equations du 1er degré', 'Triangles et symétries', 'Probabilités'] },
  { niveau: '4ème', chapitres: ['Fractions et décimaux', 'Développement factorisation', 'Théorème de Pythagore', 'Fonctions linéaires', 'Statistiques'] },
  { niveau: '3ème – Brevet', chapitres: ['Racines carrées', 'Systèmes d\'équations', 'Théorème de Thalès', 'Trigonométrie', 'Fonctions du 2ème degré', 'Statistiques et probabilités'] },
];

const CHAPITRES_LYCEE = [
  { niveau: '2nde', chapitres: ['Nombres et calculs', 'Fonctions – généralités', 'Suites numériques', 'Géométrie dans l\'espace', 'Statistiques'] },
  { niveau: '1ère', chapitres: ['Second degré', 'Suites arithmétiques/géométriques', 'Dérivation', 'Trigonométrie', 'Exponentielle', 'Probabilités'] },
  { niveau: 'Terminale', chapitres: ['Limites et continuité', 'Dérivation avancée', 'Intégration', 'Logarithme', 'Dénombrement', 'Loi normale', 'Géométrie vectorielle'] },
];

const FORMULES = [
  { formule: 'Théorème de Pythagore', text: 'a² + b² = c²', desc: 'Dans un triangle rectangle, le carré de l\'hypoténuse = somme des carrés des deux autres côtés.' },
  { formule: 'Identités remarquables', text: '(a+b)² = a²+2ab+b²', desc: 'Développement et factorisation — incontournables du collège au bac.' },
  { formule: 'Discriminant', text: 'Δ = b² - 4ac', desc: 'Résolution d\'équation du 2ème degré ax²+bx+c=0. Si Δ>0, deux solutions réelles.' },
  { formule: 'Dérivée usuelle', text: '(xⁿ)\' = n·xⁿ⁻¹', desc: 'Formule de base de la dérivation — fondamentale en 1ère et Terminale.' },
  { formule: 'Somme géométrique', text: 'Σ = q×(qⁿ-1)/(q-1)', desc: 'Somme des n premiers termes d\'une suite géométrique de raison q ≠ 1.' },
  { formule: 'Trigonométrie', text: 'sin²θ + cos²θ = 1', desc: 'Identité fondamentale — valable pour tout angle θ. Indispensable en lycée.' },
];

const METHODES = [
  {
    icon: Calculator, title: 'Calculatrice scientifique gratuite',
    desc: 'Utilise la calculatrice intégrée d\'Apprenix pour vérifier tes calculs, évaluer des expressions complexes et résoudre des équations.',
    link: '/maths-sciences', cta: 'Ouvrir la calculatrice',
  },
  {
    icon: Brain, title: 'Assistant — Explication pas à pas',
    desc: "Pose ta question de maths à l'assistant et reçois une explication détaillée, étape par étape, avec des exemples adaptés à ton niveau.",
    link: '/aide-ia', cta: 'Poser une question maths',
  },
  {
    icon: BookOpen, title: 'Flashcards formules',
    desc: 'Mémorise les formules essentielles grâce aux flashcards avec répétition espacée (SM-2). Plus efficace que relire ses cours.',
    link: '/flashcards', cta: 'Créer des flashcards maths',
  },
  {
    icon: Target, title: 'Scanner un exercice',
    desc: "Prends une photo de ton exercice de maths — l'assistant l'analyse et te donne une correction détaillée étape par étape.",
    link: '/scanner', cta: 'Scanner un exercice maths',
  },
];

export default function CoursMathsGratuitPage() {
  return (
    <>
      <SEO
        title="Cours de Maths Gratuits en Ligne — Collège, Lycée, Bac | Apprenix"
        description="Cours de mathématiques gratuits du collège au Bac : 6ème, 5ème, 4ème, 3ème, Seconde, Première, Terminale. Aide IA, formules, exercices corrigés. Sans pub, sans abonnement."
        canonical="/cours-maths-gratuit"
        keywords="cours maths gratuit, cours mathématiques gratuit en ligne, révision maths collège lycée, aide maths gratuit, exercices maths corrigés, formules maths bac, cours maths 6ème 5ème 4ème 3ème seconde terminale, maths en ligne gratuit France"
        dateModified="2026-06-18"
        ogType="article"
        breadcrumbs={[
          { name: 'Accueil', url: 'https://apprenix.org/' },
          { name: 'Maths & Sciences', url: 'https://apprenix.org/maths-sciences' },
          { name: 'Cours de Maths Gratuits' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: 'Cours de Mathématiques Gratuits en Ligne',
          description: 'Cours de maths du collège au Bac avec assistant, formules et exercices corrigés',
          provider: { '@type': 'Organization', name: 'Apprenix', url: 'https://apprenix.org' },
          isAccessibleForFree: true,
          inLanguage: 'fr-FR',
          educationalLevel: ['Collège', 'Lycée', 'Bac'],
          courseMode: 'online',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          hasCourseInstance: [
            { '@type': 'CourseInstance', courseMode: 'online', name: 'Maths Collège (6ème → 3ème)' },
            { '@type': 'CourseInstance', courseMode: 'online', name: 'Maths Lycée (2nde → Terminale)' },
          ],
        }}
      />

      <div className="min-w-0 space-y-10">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden -mx-3 md:-mx-5 lg:-mx-6 -mt-3 md:-mt-5 lg:-mt-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white px-5 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Collège → Bac</Badge>
              <Badge className="bg-white/20 border-white/30 text-white text-xs font-bold">Assistant inclus</Badge>
              <Badge className="bg-emerald-500/30 border-emerald-400/40 text-white text-xs font-bold">100 % gratuit</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white text-balance leading-[1.1] mb-4">
              Cours de Maths Gratuits<br className="hidden md:block" /> du Collège au Bac
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed text-pretty mb-6 max-w-xl">
              Formules clés, cours par chapitre, assistant disponible et exercices corrigés. De la 6ème à la Terminale — sans inscription, sans pub, 24h/24.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/aide-ia">
                <Button className="bg-white text-blue-700 hover:bg-white/90 font-bold px-6 py-3 rounded-xl min-h-[48px]">
                  <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                  Assistant Maths — gratuit
                </Button>
              </Link>
              <Link to="/maths-sciences">
                <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl min-h-[48px]">
                  <Calculator className="w-4 h-4 mr-2" aria-hidden="true" />
                  Calculatrice &amp; formules
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Formules clés ── */}
        <section aria-label="Formules mathématiques clés">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">Formules</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Formules essentielles à connaître</h2>
            <p className="text-sm text-muted-foreground mt-1">Les formules incontournables de la 3ème à la Terminale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FORMULES.map(({ formule, text, desc }) => (
              <Card key={formule} className="border-border/60">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground">{formule}</h3>
                    <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{text}</code>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Mémorise toutes les formules avec les <Link to="/flashcards" className="text-blue-600 hover:underline font-semibold">flashcards maths d'Apprenix</Link> — algorithme de répétition espacée SM-2.
          </p>
        </section>

        {/* ── Programme Collège ── */}
        <section aria-label="Programme maths collège">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">Collège</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Programme Maths Collège — 6ème au Brevet</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHAPITRES_COLLEGE.map(({ niveau, chapitres }) => (
              <Card key={niveau} className="border-border/60">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center shrink-0">{niveau[0]}</span>
                    {niveau}
                  </h3>
                  <ul className="space-y-1.5">
                    {chapitres.map(ch => (
                      <li key={ch} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                        {ch}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Programme Lycée ── */}
        <section aria-label="Programme maths lycée">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300">Lycée</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">Programme Maths Lycée — Seconde au Bac</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CHAPITRES_LYCEE.map(({ niveau, chapitres }) => (
              <Card key={niveau} className="border-border/60">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">{niveau}</h3>
                  <ul className="space-y-1.5">
                    {chapitres.map(ch => (
                      <li key={ch} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
                        {ch}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Outils ── */}
        <section aria-label="Outils maths gratuits Apprenix">
          <div className="mb-4">
            <Badge variant="outline" className="text-xs font-bold mb-2 border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">Outils gratuits</Badge>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance">4 outils pour progresser en maths</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METHODES.map(({ icon: Icon, title, desc, link, cta }) => (
              <Card key={title} className="border-border/60 group hover:border-blue-300 transition-colors duration-150">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground mb-1 text-balance">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed text-pretty mb-2">{desc}</p>
                    <Link to={link} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline underline-offset-2">
                      {cta} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-10 text-white text-center space-y-4">
          <Calculator className="w-10 h-10 mx-auto text-white/80" aria-hidden="true" />
          <h2 className="text-xl md:text-3xl font-extrabold text-balance">Besoin d'aide en maths maintenant ?</h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto text-pretty">
            Pose ta question à l'assistant Apprenix — explications étape par étape, adaptées à ton niveau, disponibles 24h/24. Gratuit.
          </p>
          <Link to="/aide-ia">
            <Button className="bg-white text-blue-700 hover:bg-white/90 font-bold px-8 py-3 rounded-xl min-h-[48px]">
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Assistant Maths — gratuit
            </Button>
          </Link>
          <p className="text-white/50 text-xs">Aucune inscription · Zéro pub · RGPD</p>
        </section>

        {/* ── Liens internes ── */}
        <nav aria-label="Autres ressources maths" className="flex flex-wrap gap-2">
          {[
            { to: '/brevet-maths', label: 'Révision Brevet Maths 2026' },
            { to: '/revision-bac-2026', label: 'Révision Bac 2026' },
            { to: '/bac-philo', label: 'Bac Philo 2026' },
            { to: '/flashcards', label: 'Flashcards formules maths' },
            { to: '/maths-sciences', label: 'Calculatrice scientifique' },
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
