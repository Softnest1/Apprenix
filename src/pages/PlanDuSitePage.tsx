import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, ScanLine, CreditCard, Calendar, Languages, FileText,
  Wrench, Timer, BookOpen, Trophy, Users, Video, GraduationCap,
  Map, Star, Flame, Shield, HelpCircle, Mail, Eye, Scale,
  Lock, FileCheck, Building2, Newspaper, Accessibility, Heart,
  Globe, Layout, Home, ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

// ─── Sections du plan du site ─────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'outils',
    title: 'Outils éducatifs',
    icon: Wrench,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    links: [
      { path: '/aide-ia',        label: 'Aide aux devoirs IA',      icon: Brain,      desc: 'Assistant IA — toutes matières, CP → Bac+5',       badge: 'Outil phare' },
      { path: '/scanner',        label: 'Scanner IA',               icon: ScanLine,   desc: 'Photo d\'un exercice → correction instantanée' },
      { path: '/flashcards',     label: 'Flashcards',               icon: CreditCard, desc: 'Répétition espacée SM-2 — mémoriser 2× plus vite' },
      { path: '/linguistique',   label: 'Outils linguistiques',     icon: Languages,  desc: 'Conjugueur, correcteur, traducteur, dissertation' },
      { path: '/maths-sciences', label: 'Maths & Sciences',         icon: Wrench,     desc: 'Calculatrice, formules, tableau périodique' },
      { path: '/organisation',   label: 'Organisation',             icon: Calendar,   desc: 'Agenda, to-do list, minuteur Pomodoro' },
      { path: '/notes',          label: 'Notes de cours',           icon: FileText,   desc: 'Wiki personnel — prise de notes par matière' },
      { path: '/carte-mentale',  label: 'Carte mentale',            icon: Map,        desc: 'Mind map interactif — visualiser ses cours' },
      { path: '/quiz',           label: 'Quiz interactif',          icon: Star,       desc: 'Questions-réponses par matière et niveau' },
      { path: '/examen',         label: 'Mode examen',              icon: Timer,      desc: 'Conditions d\'examen réelles — Brevet, Bac' },
      { path: '/focus',          label: 'Mode Deep Work',           icon: Flame,      desc: 'Concentration maximale — ambiances sonores' },
      { path: '/motivation',     label: 'Motivation & Progrès',     icon: Trophy,     desc: 'XP, badges, streaks, défis quotidiens' },
    ],
  },
  {
    id: 'ressources',
    title: 'Ressources & contenus',
    icon: BookOpen,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
    links: [
      { path: '/ressources',             label: 'Ressources pédagogiques',  icon: BookOpen,   desc: 'Fiches de révision, résumés, annales corrigées' },
      { path: '/ressources-officielles', label: 'Ressources officielles',   icon: Globe,      desc: 'Liens vérifiés EN, Éduscol, INSERM, ONISEP' },
      { path: '/base-reponses',          label: 'Base de réponses',         icon: FileText,   desc: 'Réponses aux questions fréquentes des élèves' },
      { path: '/actualites',             label: 'Actualités éducatives',    icon: Newspaper,  desc: 'Infos scolaires, réformes, concours' },
      { path: '/etablissements',         label: 'Annuaire établissements',  icon: Building2,  desc: '68 936 écoles, collèges et lycées de France' },
    ],
  },
  {
    id: 'espaces',
    title: 'Espaces par niveau',
    icon: GraduationCap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/20',
    links: [
      { path: '/espace/primaire',  label: 'Espace Primaire',          icon: GraduationCap, desc: 'CP, CE1, CE2, CM1, CM2 — outils adaptés' },
      { path: '/espace/college',   label: 'Espace Collège',           icon: GraduationCap, desc: '6ème, 5ème, 4ème, 3ème — Brevet 2026' },
      { path: '/espace/lycee',     label: 'Espace Lycée',             icon: GraduationCap, desc: 'Seconde, Première, Terminale — Bac 2026' },
      { path: '/espace/superieur', label: 'Espace Supérieur',         icon: GraduationCap, desc: 'BTS, Licence, Master, Doctorat, CPGE' },
    ],
  },
  {
    id: 'landing',
    title: 'Révision ciblée',
    icon: Star,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/20',
    links: [
      { path: '/revision-bac-2026',    label: 'Révision Bac 2026',          icon: Star,      desc: 'Toutes matières — fiches + planning express', badge: 'Populaire' },
      { path: '/bac-francais',         label: 'Bac Français 2026',          icon: BookOpen,  desc: 'EAF — commentaire, dissertation, oral' },
      { path: '/bac-philo',            label: 'Bac Philo 2026',             icon: BookOpen,  desc: 'Méthode dissertation, 16 notions, 8 auteurs' },
      { path: '/brevet-maths',         label: 'Brevet Maths 2026',          icon: Wrench,    desc: 'Algèbre, géométrie, stats — aide IA' },
      { path: '/cours-maths-gratuit',  label: 'Cours de maths gratuits',    icon: Wrench,    desc: '6ème → Terminale — formules + explications' },
      { path: '/aide-devoirs-gratuit', label: 'Aide devoirs gratuite',      icon: Brain,     desc: 'Alternative gratuite aux cours particuliers' },
      { path: '/flashcards-gratuit',   label: 'Flashcards gratuites',       icon: CreditCard,desc: 'Créer et réviser sans inscription' },
      { path: '/methode-de-travail',   label: 'Méthode de travail',         icon: Timer,     desc: 'Pomodoro, Feynman, Deep Work — neurosciences' },
    ],
  },
  {
    id: 'publics',
    title: 'Espaces dédiés',
    icon: Users,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    border: 'border-chart-1/20',
    links: [
      { path: '/parents',      label: 'Espace parents',         icon: Heart,         desc: 'Suivi progression, conseils, ressources' },
      { path: '/enseignants',  label: 'Espace enseignants',     icon: GraduationCap, desc: 'Ressources Éduscol, outils classe, kit RGPD' },
      { path: '/inclusion',    label: 'Inclusion DYS & ULIS',   icon: Accessibility, desc: 'Outils adaptés, droits MDPH, PPS, PAP' },
      { path: '/communaute',   label: 'Communauté',             icon: Users,         desc: 'Forum élèves, partage, entraide' },
      { path: '/visio',        label: 'Classe virtuelle',       icon: Video,         desc: 'Sessions en direct avec un enseignant' },
    ],
  },
  {
    id: 'legal',
    title: 'Légal & confiance',
    icon: Shield,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-border',
    links: [
      { path: '/mission',                  label: 'Notre mission',              icon: Heart,     desc: '100% gratuit, sans pub — pourquoi Apprenix existe' },
      { path: '/securite',                 label: 'Sécurité & données',         icon: Shield,    desc: 'RGPD, hébergement UE, aucune donnée revendue' },
      { path: '/transparence',             label: 'Transparence',               icon: Eye,       desc: 'Rapport annuel, finances, décisions publiques' },
      { path: '/accessibilite',            label: 'Accessibilité',              icon: Accessibility, desc: 'RGAA AA, polices DYS, contraste élevé' },
      { path: '/faq',                      label: "Centre d'aide",              icon: HelpCircle,desc: 'Questions fréquentes — élèves, parents, enseignants' },
      { path: '/contact',                  label: 'Contact',                    icon: Mail,      desc: 'Nous écrire — réponse sous 48h' },
      { path: '/nouveautes',               label: 'Nouveautés',                 icon: Newspaper, desc: 'Dernières mises à jour et fonctionnalités' },
      { path: '/mentions-legales',         label: 'Mentions légales',           icon: Scale,     desc: 'Éditeur, hébergeur, responsabilités' },
      { path: '/politique-confidentialite',label: 'Politique de confidentialité', icon: Lock,   desc: 'Traitement des données personnelles' },
      { path: '/cgu',                      label: "Conditions d'utilisation",   icon: FileCheck, desc: 'Règles d\'utilisation de la plateforme' },
    ],
  },
];

// ─── Composant ────────────────────────────────────────────────────────────────
const PlanDuSitePage: React.FC = () => {
  return (
    <>
      <SEO
        title="Plan du site — Toutes les pages d'Apprenix"
        description="Retrouvez toutes les pages d'Apprenix : outils éducatifs, espaces par niveau, ressources officielles, espace parents et enseignants, mentions légales."
        canonical="/plan-du-site"
        breadcrumbs={[
          { name: 'Accueil', url: 'https://apprenix.org/' },
          { name: 'Plan du site' },
        ]}
      />

      <main className="min-h-dvh bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">

          {/* ── En-tête ── */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                Accueil
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Plan du site</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance">
                  Plan du site
                </h1>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Toutes les pages d'Apprenix — plateforme éducative 100&nbsp;% gratuite
                </p>
              </div>
            </div>
          </div>

          {/* ── Sections ── */}
          <div className="flex flex-col gap-8">
            {SECTIONS.map(({ id, title, icon: SectionIcon, color, bg, border, links }) => (
              <section key={id} aria-labelledby={`section-${id}`}>
                {/* Titre de section */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-4 ${bg} ${border}`}>
                  <SectionIcon className={`w-4 h-4 shrink-0 ${color}`} aria-hidden="true" />
                  <h2 id={`section-${id}`} className={`text-sm font-extrabold uppercase tracking-wide ${color}`}>
                    {title}
                  </h2>
                  <span className={`text-xs font-semibold opacity-70 ${color}`}>({links.length})</span>
                </div>

                {/* Grille de liens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {links.map(({ path, label, icon: LinkIcon, desc, badge }) => (
                    <Link
                      key={path}
                      to={path}
                      className="group flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/40 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
                        <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {label}
                          </span>
                          {badge && (
                            <Badge variant="secondary" className="text-xs shrink-0 py-0">
                              {badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                        <span className="text-xs text-muted-foreground/60 font-mono">{path}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 shrink-0 mt-1 transition-colors" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* ── Pied de page de la page ── */}
          <footer className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Mis à jour le 25 juin 2026 · <a href="/sitemap.xml" className="hover:text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer">sitemap.xml</a> · <Link to="/contact" className="hover:text-primary underline underline-offset-2">Signaler un lien cassé</Link>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default PlanDuSitePage;
