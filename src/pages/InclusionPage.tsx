import {Accessibility, ArrowRight, BookOpen, Brain, CheckCircle, 
  ChevronDown, ChevronUp, ExternalLink, Eye, FileText,
  GraduationCap, Hand, Headphones, 
  Heart, Lightbulb, Monitor, Phone,Puzzle,
  Shield, Star, Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import { type LienOfficiel, RESSOURCES_INCLUSION, type SectionRessources } from '@/lib/ressourcesParNiveau';

// ─── Accordéon simple ─────────────────────────────────────────────────────────
const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ElementType }> = ({
  title, children, defaultOpen = false, icon: Icon,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-card hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />}
          <span className="text-sm font-semibold text-foreground text-balance">{title}</span>
        </div>
        {open
          ? <ChevronUp  className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-card text-sm text-muted-foreground space-y-2 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Données logiciels adaptés ────────────────────────────────────────────────
const LOGICIELS = [
  {
    cat: 'Lecture & DYS',
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10',
    items: [
      { name: 'Médialexie', desc: 'Police et mise en page adaptées à la dyslexie', gratuit: true },
      { name: 'OpenDys', desc: 'Police OpenDyslexic, téléchargement gratuit', gratuit: true },
      { name: 'Balabolka', desc: 'Synthèse vocale — lit les textes à voix haute', gratuit: true },
      { name: 'Antidote', desc: 'Correcteur orthographique avancé avec explications', gratuit: false },
      { name: 'Tadeo', desc: 'Sous-titrage et accessibilité en temps réel', gratuit: false },
    ],
  },
  {
    cat: 'Aide à l\'écriture',
    icon: FileText,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    items: [
      { name: 'Word (accessibilité)', desc: 'Vérificateur d\'accessibilité intégré + dictée vocale', gratuit: false },
      { name: 'Google Docs (dictée)', desc: 'Dictée vocale gratuite — Outils > Saisie vocale', gratuit: true },
      { name: 'Claro Suite', desc: 'Suite complète pour DYS : lecture, écriture, symboles', gratuit: false },
      { name: 'Co:Writer', desc: 'Prédiction de mots intelligente pour faciliter l\'écriture', gratuit: false },
    ],
  },
  {
    cat: 'Organisation & Mémoire',
    icon: Brain,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    items: [
      { name: 'Apprenix (gratuit)', desc: 'Flashcards, emploi du temps, notes, aide aux devoirs — tout en un', gratuit: true },
      { name: 'Canva (cartes mentales)', desc: 'Créer des cartes mentales visuelles gratuitement', gratuit: true },
      { name: 'SimpleMind', desc: 'Carte mentale simple et visuelle', gratuit: true },
      { name: 'Boardmaker', desc: 'Pictogrammes et communication alternative (CAA)', gratuit: false },
    ],
  },
  {
    cat: 'Audio & Vidéo',
    icon: Headphones,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    items: [
      { name: 'NaturalReader', desc: 'Texte en voix naturelle, version gratuite disponible', gratuit: true },
      { name: 'VLC (sous-titres)', desc: 'Lecteur vidéo universel avec sous-titres personnalisables', gratuit: true },
      { name: 'Subtitle Edit', desc: 'Créer et modifier des sous-titres facilement', gratuit: true },
    ],
  },
  {
    cat: 'Tablette & Mobile',
    icon: Phone,
    color: 'text-success',
    bg: 'bg-success/10',
    items: [
      { name: 'VoiceOver (iOS)', desc: 'Lecteur d\'écran intégré iPhone/iPad — entièrement gratuit', gratuit: true },
      { name: 'TalkBack (Android)', desc: 'Lecteur d\'écran Android — intégré, gratuit', gratuit: true },
      { name: 'Proloquo2Go', desc: 'Communication alternative par pictogrammes (iPad)', gratuit: false },
      { name: 'ModMath', desc: 'Calculatrice visuelle pour DYS sur iPad', gratuit: false },
    ],
  },
];

// ─── Droits & dispositifs ─────────────────────────────────────────────────────
const DROITS = [
  {
    sigle: 'MDPH',
    full: 'Maison Départementale des Personnes Handicapées',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
    desc: 'Guichet unique pour toutes les démarches liées au handicap. Évalue les besoins et attribue les aides adaptées (AVS/AESH, matériel, transport).',
    actions: ['Demander une reconnaissance de handicap (RQTH)', 'Obtenir un AVS/AESH pour accompagnement scolaire', 'Accéder aux allocations (AAH, PCH)', 'Déposer un dossier PAG/PPC'],
  },
  {
    sigle: 'PPS',
    full: 'Projet Personnalisé de Scolarisation',
    icon: GraduationCap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    desc: 'Document officiel qui définit le parcours scolaire adapté à l\'élève en situation de handicap. Coordonné par la MDPH avec l\'équipe éducative.',
    actions: ['Aménagements de classe (tiers temps, AVS, matériel)', 'Adaptation des évaluations', 'Orientation en ULIS ou SEGPA', 'Révision annuelle avec la famille'],
  },
  {
    sigle: 'PAP',
    full: 'Plan d\'Accompagnement Personnalisé',
    icon: FileText,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    desc: 'Plan d\'aide pour les élèves avec troubles des apprentissages (DYS, TDAH, TDA) sans reconnaissance MDPH. Mis en place par le chef d\'établissement.',
    actions: ['Temps majoré aux examens', 'Documents agrandis ou adaptés', 'Utilisation d\'un ordinateur en classe', 'Reformulation des consignes'],
  },
  {
    sigle: 'PPRE',
    full: 'Programme Personnalisé de Réussite Éducative',
    icon: Star,
    color: 'text-warning',
    bg: 'bg-warning/10',
    desc: 'Dispositif pour les élèves en risque de difficultés scolaires, sans trouble spécifique diagnostiqué. Suivi rapproché avec objectifs précis.',
    actions: ['Soutien scolaire renforcé', 'Objectifs définis en concertation avec la famille', 'Bilan régulier des progrès', 'Possible orientation vers PAP si troubles identifiés'],
  },
  {
    sigle: 'ULIS',
    full: 'Unité Localisée pour l\'Inclusion Scolaire',
    icon: Users,
    color: 'text-success',
    bg: 'bg-success/10',
    desc: 'Dispositif scolaire pour les élèves en situation de handicap. L\'élève fait partie d\'une classe ordinaire mais bénéficie de regroupements avec un enseignant spécialisé (CAPASH).',
    actions: ['Cours adaptés en petit groupe', 'Présence d\'un enseignant spécialisé', 'Inclusion progressive dans les classes ordinaires', 'Projet individualisé (PPS) obligatoire'],
  },
  {
    sigle: 'SEGPA',
    full: 'Section d\'Enseignement Général et Professionnel Adapté',
    icon: Puzzle,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    desc: 'Section au sein d\'un collège pour les élèves avec des difficultés scolaires importantes. Programme allégé avec une orientation progressive vers la voie professionnelle.',
    actions: ['Effectifs réduits (16 élèves max)', 'Enseignement préprofessionnel dès la 5e', 'Programme adapté du socle commun', 'Préparation au CAP / lycée professionnel'],
  },
];

// ─── Conseils pratiques ───────────────────────────────────────────────────────
const CONSEILS = [
  { icon: Eye,         tip: 'Activer la police dyslexie dans la barre d\'accessibilité Apprenix (icône 🔒 en bas à droite)' },
  { icon: Monitor,     tip: 'Utiliser un fond d\'écran crème ou jaune pâle pour réduire la fatigue visuelle (paramètres du navigateur)' },
  { icon: Headphones,  tip: 'Activer "Lire à haute voix" dans Word/Edge pour écouter le texte pendant la lecture' },
  { icon: Hand,        tip: 'Utiliser la dictée vocale (Google Docs ou Windows) pour écrire sans clavier' },
  { icon: Brain,       tip: 'Créer des flashcards visuelles dans Apprenix pour mémoriser avec des images et des couleurs' },
  { icon: Lightbulb,   tip: 'Activer le "Mode ULIS/SEGPA" dans l\'aide aux devoirs Apprenix pour des explications ultra-simplifiées' },
];

// ─── Sous-composant : un lien ressource inclusion ────────────────────────────
const RessourceLienItem: React.FC<{ lien: LienOfficiel; index: number }> = ({ lien, index }) => (
  <a
    href={lien.url}
    target="_blank" rel="noopener noreferrer"
    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group${index > 1 ? ' md:border-t md:border-border' : ''}`}
    aria-label={`${lien.label} — ${lien.desc} (ouvre dans un nouvel onglet)`}
  >
    <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{lien.emoji ?? '📎'}</span>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-balance">
          {lien.label}
        </p>
        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed text-pretty line-clamp-2">{lien.desc}</p>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground border border-border font-medium">{lien.tag}</span>
        {lien.gratuit && (
          <span className="px-1.5 py-0.5 text-xs rounded bg-chart-2/10 text-chart-2 border border-chart-2/20 font-semibold">✓ Gratuit</span>
        )}
      </div>
    </div>
  </a>
);

// ─── Sous-composant : une section accordéon ressource inclusion ───────────────
const RessourceSectionItem: React.FC<{ sec: SectionRessources; defaultOpen?: boolean }> = ({ sec, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
    <h1 className="sr-only">Inclusion scolaire — DYS, ULIS & Handicap</h1>
      <button type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${sec.fond} shrink-0 text-base`} aria-hidden="true">
            {sec.emoji}
          </span>
          <span className="text-sm font-semibold text-foreground">{sec.titre}</span>
          <span className="text-xs text-muted-foreground tabular-nums">({sec.liens.length})</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
      </button>
      {open && (
        <div className="bg-card border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {sec.liens.map((lien, i) => (
              <RessourceLienItem key={lien.url} lien={lien} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Bloc ressources inclusion complet ───────────────────────────────────────
const RessourcesInclusionBloc: React.FC = () => (
  <section aria-labelledby="ressources-inclusion-title">
    <div className="section-divider pt-3 mb-3">
      <h2 id="ressources-inclusion-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        Ressources officielles — cliquer &amp; accéder
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        Sources vérifiées : Ministère EN, Éduscol, INSERM, ONISEP, associations nationales — 0 % IA, 100 % réel
      </p>
    </div>
    <div className="space-y-2">
      {RESSOURCES_INCLUSION.map((sec, i) => (
        <RessourceSectionItem key={sec.id} sec={sec} defaultOpen={i === 0} />
      ))}
    </div>
  </section>
);
const InclusionPage: React.FC = () => (
  <div className="min-w-0 space-y-6">
    <SEO
      title="Inclusion scolaire — Outils DYS, ULIS, SEGPA & MDPH | Apprenix"
      description="Outils accessibles pour les élèves DYS, ULIS, SEGPA, malvoyants et déficients moteurs. Droits MDPH, ressources adaptées, interface inclusive. 100% gratuit."
      canonical="/inclusion"
      keywords="outils DYS gratuits, ULIS aide scolaire, SEGPA ressources, logiciels dyslexie, droits MDPH élève, PPS PAP PPRE, inclusion numérique scolaire, accessibilité école, élève handicap réussir, aide dyspraxie, aide dyscalculie"
      dateModified="2026-06-20"
    />

    <PageHero
      variant="tool"
      icon={Heart}
      badge={<>♿ Inclusion &amp; Accessibilité</>}
      badgeClassName="bg-success/10 text-success border-success/25"
      title="Espace ULIS, SEGPA & Inclusion"
      subtitle="Des outils adaptés à chaque élève, quelles que soient ses difficultés. Mode ULIS/SEGPA intégré, ressources inclusives, droits scolaires — tout en un endroit."
      stats={[
        { value: 'DYS', label: 'Dyslexie, dysorthographie' },
        { value: 'TDAH', label: 'Trouble attention' },
        { value: 'RGAA', label: 'Conformité 4.1' },
      ]}
    >
      <div className="flex flex-wrap gap-2 mt-1">
        {[
          { label: 'DYS', color: 'bg-success/10 text-success border-success/25' },
          { label: 'TDAH', color: 'bg-chart-3/10 text-chart-3 border-chart-3/25' },
          { label: 'Handicap cognitif', color: 'bg-chart-4/10 text-chart-4 border-chart-4/25' },
          { label: 'Handicap moteur', color: 'bg-chart-1/10 text-chart-1 border-chart-1/25' },
          { label: 'Handicap sensoriel', color: 'bg-chart-5/10 text-chart-5 border-chart-5/25' },
        ].map(({ label, color }) => (
          <span key={label} className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${color}`}>{label}</span>
        ))}
      </div>
    </PageHero>

    {/* CTA Aide aux devoirs ULIS */}
    <Card className="border-success/30 bg-success/5">
      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-success" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground text-balance">Aide aux devoirs — Mode ULIS/SEGPA</p>
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
            Va dans l'aide aux devoirs Apprenix et active le <strong>Mode ULIS/SEGPA</strong> :
            réponses en mots simples, phrases courtes, étapes numérotées et exemples du quotidien. 💚
          </p>
        </div>
        <Link to="/aide-ia" className="shrink-0">
          <Button className="h-9 text-sm font-semibold" aria-label="Accéder à l'aide aux devoirs en mode ULIS/SEGPA">
            Aide aux devoirs <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        </Link>
      </CardContent>
    </Card>

    {/* ── Espace ULIS ─────────────────────────────────────────────────────────── */}
    <section aria-labelledby="ulis-title">
      <div className="section-divider pt-3 mb-3">
        <h2 id="ulis-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
          <Users className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          Espace ULIS — Ce que ça change concrètement
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tout ce qu'un élève ULIS peut faire sur Apprenix, adapté à son quotidien en classe.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            icon: BookOpen, color: 'text-success', bg: 'bg-success/10',
            titre: '12 fiches méthode adaptées',
            desc: 'Calcul, lecture, écriture, vie pratique et orientation — toutes rédigées en mots simples, étapes courtes et exemples concrets.',
            cta: { label: 'Ouvrir les fiches ULIS', to: '/aide-ia' },
          },
          {
            icon: Brain, color: 'text-chart-2', bg: 'bg-chart-2/10',
            titre: 'Réponses ultra-simplifiées',
            desc: 'En mode ULIS/SEGPA, le guide adapté répond avec des phrases courtes, des étapes numérotées et des exemples du quotidien (pas de jargon scolaire).',
            cta: { label: 'Activer le mode adapté', to: '/aide-ia' },
          },
          {
            icon: Eye, color: 'text-chart-3', bg: 'bg-chart-3/10',
            titre: 'Interface accessible intégrée',
            desc: 'Police dyslexie, texte agrandi, espacement élargi, réduction d\'animations — disponible sur toutes les pages via le bouton ♿.',
            cta: null,
          },
          {
            icon: Star, color: 'text-warning', bg: 'bg-warning/10',
            titre: 'Flashcards visuelles',
            desc: 'Crée des flashcards avec images et couleurs pour mémoriser avec un support visuel fort — idéal pour les profils ULIS.',
            cta: { label: 'Créer des flashcards', to: '/flashcards' },
          },
        ].map(({ icon: Icon, color, bg, titre, desc, cta }) => (
          <Card key={titre} className="h-full flex flex-col">
            <CardContent className="p-4 flex flex-col gap-3 flex-1">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground text-balance">{titre}</p>
                  <p className="text-xs text-muted-foreground mt-1 text-pretty leading-relaxed">{desc}</p>
                </div>
              </div>
              {cta && (
                <Link to={cta.to} className="mt-auto">
                  <Button variant="outline" size="sm" className="text-xs w-full">
                    {cta.label} <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Droits ULIS */}
      <div className="mt-3 p-4 rounded-xl border border-success/20 bg-success/5 space-y-2">
        <p className="text-sm font-semibold text-success flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> Tes droits en ULIS — ce que tu peux demander
        </p>
        <ul className="space-y-1.5" role="list">
          {[
            'Un PPS (Projet Personnalisé de Scolarisation) révisé chaque année avec ta famille',
            'Un AESH (accompagnant) si le PPS le prévoit',
            'Des cours en regroupement avec l\'enseignant spécialisé CAPASH',
            'Des aménagements aux examens : tiers-temps, secrétaire, ordinateur',
            'Une inclusion progressive dans les classes ordinaires à ton rythme',
          ].map(d => (
            <li key={d} className="flex items-start gap-2 text-xs text-foreground">
              <ArrowRight className="w-3 h-3 text-success mt-0.5 shrink-0" aria-hidden="true" /> {d}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ── Espace SEGPA ────────────────────────────────────────────────────────── */}
    <section aria-labelledby="segpa-title">
      <div className="section-divider pt-3 mb-3">
        <h2 id="segpa-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-chart-3 shrink-0" aria-hidden="true" />
          Espace SEGPA — Orientation &amp; Réussite professionnelle
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          La SEGPA mène à de vrais diplômes et de vrais métiers. Voici comment Apprenix t'accompagne.
        </p>
      </div>

      {/* Parcours SEGPA visuel */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        {[
          { step: '1', label: 'Collège SEGPA', sub: '6e → 3e', color: 'bg-chart-3/10 border-chart-3/30 text-chart-3' },
          { step: '→', label: '', sub: '', color: 'hidden md:flex bg-transparent border-transparent text-muted-foreground text-xl items-center justify-center' },
          { step: '2', label: 'Lycée Pro', sub: '2de → Tle', color: 'bg-chart-4/10 border-chart-4/30 text-chart-4' },
          { step: '→', label: '', sub: '', color: 'hidden md:flex bg-transparent border-transparent text-muted-foreground text-xl items-center justify-center' },
          { step: '3', label: 'CAP', sub: '2 ans', color: 'bg-primary/10 border-primary/30 text-primary' },
          { step: '→', label: '', sub: '', color: 'hidden md:flex bg-transparent border-transparent text-muted-foreground text-xl items-center justify-center' },
          { step: '4', label: 'Bac Pro', sub: '3 ans', color: 'bg-success/10 border-success/30 text-success' },
          { step: '→', label: '', sub: '', color: 'hidden md:flex bg-transparent border-transparent text-muted-foreground text-xl items-center justify-center' },
          { step: '🎓', label: 'Emploi / BTS', sub: 'Perspectives', color: 'bg-warning/10 border-warning/30 text-warning' },
        ].map(({ step, label, sub, color }, i) => (
          <div key={i} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border text-center ${color}`}>
            <span className="text-lg font-black leading-none">{step}</span>
            {label && <span className="text-xs font-semibold mt-0.5 leading-tight">{label}</span>}
            {sub  && <span className="text-xs opacity-70 leading-tight">{sub}</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            icon: GraduationCap, color: 'text-chart-3', bg: 'bg-chart-3/10',
            titre: '2 fiches méthode Orientation',
            desc: 'Découvrir les métiers qui t\'intéressent + comprendre les diplômes après la SEGPA (CAP, Bac Pro) — expliqué simplement, étape par étape.',
            cta: { label: 'Voir les fiches Orientation', to: '/aide-ia' },
          },
          {
            icon: Lightbulb, color: 'text-warning', bg: 'bg-warning/10',
            titre: 'Explorateur de métiers ONISEP',
            desc: 'Accède directement au site officiel ONISEP pour explorer les métiers accessibles après une SEGPA, les formations et les salaires.',
            cta: { label: 'Explorer les métiers', href: 'https://www.onisep.fr/decouvrir-les-metiers' },
          },
          {
            icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10',
            titre: 'Fiches méthode niveaux collège',
            desc: 'Toutes les fiches méthode classiques (calcul, français, lecture) sont aussi accessibles aux élèves SEGPA pour renforcer les bases du socle commun.',
            cta: { label: 'Voir toutes les fiches', to: '/aide-ia' },
          },
          {
            icon: Phone, color: 'text-chart-4', bg: 'bg-chart-4/10',
            titre: 'Emploi du temps & organisation',
            desc: 'L\'outil organisation Apprenix aide à gérer les emplois du temps, les devoirs et les rappels — utile aussi pour les stages en entreprise (PFMP).',
            cta: { label: 'Organiser mon temps', to: '/organisation' },
          },
        ].map(({ icon: Icon, color, bg, titre, desc, cta }) => (
          <Card key={titre} className="h-full flex flex-col">
            <CardContent className="p-4 flex flex-col gap-3 flex-1">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground text-balance">{titre}</p>
                  <p className="text-xs text-muted-foreground mt-1 text-pretty leading-relaxed">{desc}</p>
                </div>
              </div>
              {cta && (
                'to' in cta ? (
                  <Link to={cta.to!} className="mt-auto">
                    <Button variant="outline" size="sm" className="text-xs w-full">
                      {cta.label} <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                    </Button>
                  </Link>
                ) : (
                  <a href={cta.href} target="_blank" rel="noopener noreferrer" className="mt-auto">
                    <Button variant="outline" size="sm" className="text-xs w-full">
                      {cta.label} <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                    </Button>
                  </a>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Droits SEGPA */}
      <div className="mt-3 p-4 rounded-xl border border-chart-3/20 bg-chart-3/5 space-y-2">
        <p className="text-sm font-semibold text-chart-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> Tes droits en SEGPA — ce que tu peux demander
        </p>
        <ul className="space-y-1.5" role="list">
          {[
            'Effectifs réduits (16 élèves maximum par classe)',
            'Un enseignement préprofessionnel dès la 5e (cuisine, bois, métal, textile…)',
            'Des stages en entreprise (PFMP) pour découvrir les métiers',
            'Une orientation choisie vers le lycée pro ou le CFA (apprentissage)',
            'Un accompagnement personnalisé par l\'équipe SEGPA + le CIO pour l\'orientation',
          ].map(d => (
            <li key={d} className="flex items-start gap-2 text-xs text-foreground">
              <ArrowRight className="w-3 h-3 text-chart-3 mt-0.5 shrink-0" aria-hidden="true" /> {d}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Logiciels adaptés */}
    <section aria-labelledby="logiciels-title">
      <div className="section-divider pt-3 mb-3">
      <h2 id="logiciels-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
        <Monitor className="w-4 h-4 text-primary shrink-0" aria-hidden="true" /> Logiciels et outils adaptés
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">Outils numériques accessibles pour chaque type de handicap.</p>
    </div>
      <div className="space-y-3">
        {LOGICIELS.map(cat => (
          <Accordion key={cat.cat} title={cat.cat} icon={cat.icon}>
            <div className="space-y-2 pt-1">
              {cat.items.map(item => (
                <div key={item.name} className="flex items-start gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <Badge variant={item.gratuit ? 'default' : 'secondary'} className={`text-xs h-5 ${item.gratuit ? 'bg-success/10 text-success border-success/20' : ''}`}>
                        {item.gratuit ? '✓ Gratuit' : 'Payant'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        ))}
      </div>
    </section>

    {/* Droits et dispositifs */}
    <section aria-labelledby="droits-title">
      <div className="section-divider pt-3 mb-3">
      <h2 id="droits-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary shrink-0" aria-hidden="true" /> Vos droits &amp; dispositifs scolaires
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">MDPH, AESH, PPS, PAP — vos droits scolaires reconnus.</p>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DROITS.map(d => (
          <Card key={d.sigle} className="h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${d.bg} flex items-center justify-center shrink-0`}>
                  <d.icon className={`w-4 h-4 ${d.color}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm font-bold text-foreground">{d.sigle}</CardTitle>
                    <Badge variant="outline" className="text-xs h-5 font-normal">{d.full}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground text-pretty">{d.desc}</p>
              <ul className="space-y-1" role="list">
                {d.actions.map(a => (
                  <li key={a} className="flex items-start gap-1.5 text-xs text-foreground">
                    <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" aria-hidden="true" /> {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Conseils pratiques */}
    <section aria-labelledby="conseils-title">
      <div className="section-divider pt-3 mb-3">
      <h2 id="conseils-title" className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-warning shrink-0" aria-hidden="true" /> Conseils pratiques au quotidien
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">Astuces pour mieux utiliser Apprenix selon votre profil.</p>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CONSEILS.map((c, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <c.icon className="w-4 h-4 text-warning" aria-hidden="true" />
            </div>
            <p className="text-sm text-foreground text-pretty leading-relaxed">{c.tip}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Ressources officielles structurées ULIS/SEGPA/DYS ── */}
    <RessourcesInclusionBloc />

    {/* Accessibilité Apprenix */}
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Accessibility className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-foreground text-balance">Apprenix — accessibilité intégrée</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              La barre d'accessibilité Apprenix est disponible sur toutes les pages. Elle permet d'activer la police dyslexie, le contraste élevé, l'espacement élargi, la réduction des animations et d'ajuster la taille du texte.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/accessibilite">
            <Button variant="outline" size="sm" className="h-9 text-xs" aria-label="Voir la déclaration d'accessibilité">
              Déclaration d'accessibilité <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/aide-ia">
            <Button size="sm" className="h-9 text-xs bg-primary text-primary-foreground" aria-label="Utiliser l'aide aux devoirs en mode ULIS">
              <Heart className="w-3 h-3 mr-1" aria-hidden="true" /> Mode ULIS/SEGPA
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default InclusionPage;
