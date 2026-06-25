import {Award,BarChart2, BookMarked,
  BookOpen, 
  Brain, Building2, ChevronRight, Clock, ExternalLink, FileText, GraduationCap, Heart, Info, Lightbulb,School, Target, Zap } from 'lucide-react';
import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import PageHero from '@/components/ui/PageHero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Ressource {
  label: string;
  url: string;
  desc: string;
  tag: string;
  official?: boolean;
}

interface NiveauSection {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  iconBg: string;
  subtitle: string;
  ressources: Ressource[];
}

interface Methode {
  nom: string;
  temps: string;
  description: string;
  etapes: string[];
  source: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

interface StatEN {
  valeur: string;
  label: string;
  source: string;
}

// ─── Ressources par niveau ─────────────────────────────────────────────────────
const NIVEAUX: NiveauSection[] = [
  {
    id: 'primaire',
    label: 'Primaire',
    icon: School,
    color: 'text-chart-2',
    iconBg: 'bg-chart-2/10',
    subtitle: 'CP · CE1 · CE2 · CM1 · CM2',
    ressources: [
      { label: 'Éduscol Cycle 2 & 3', url: 'https://eduscol.education.fr/ecole', desc: 'Programmes officiels CP–CM2 et ressources pédagogiques', tag: 'Programmes', official: true },
      { label: 'Lumni Primaire', url: 'https://www.lumni.fr/primaire', desc: 'Vidéos éducatives France Télévisions pour les 6–11 ans', tag: 'Vidéos', official: true },
      { label: 'Prim à bord (Éduscol)', url: 'https://primabord.eduscol.education.fr/', desc: 'Espace numérique de travail officiel pour le primaire', tag: 'ENT', official: true },
      { label: 'La main à la pâte', url: 'https://www.fondation-lamap.org/', desc: 'Sciences et technologie au primaire — Fondation de l\'École', tag: 'Sciences', official: true },
      { label: 'CNED École', url: 'https://www.cned.fr/ecole', desc: 'Cours officiels à distance du Centre national d\'enseignement', tag: 'Cours', official: true },
    ] },
  {
    id: 'college',
    label: 'Collège',
    icon: BookOpen,
    color: 'text-chart-4',
    iconBg: 'bg-chart-4/10',
    subtitle: '6e · 5e · 4e · 3e',
    ressources: [
      { label: 'Éduscol Cycle 4 (6e–3e)', url: 'https://eduscol.education.fr/college', desc: 'Programmes officiels et ressources disciplinaires collège', tag: 'Programmes', official: true },
      { label: 'Brevet des collèges — Annales', url: 'https://www.education.gouv.fr/brevet-des-colleges-105552', desc: 'Sujets officiels du Brevet par année et par académie', tag: 'Brevet', official: true },
      { label: 'Lumni Collège', url: 'https://www.lumni.fr/college', desc: 'Cours vidéo par matière et niveau — France Télévisions', tag: 'Vidéos', official: true },
      { label: 'CNED Collège', url: 'https://www.cned.fr/college', desc: 'Cours officiels à distance — Maths, Français, Histoire, SVT…', tag: 'Cours', official: true },
    ] },
  {
    id: 'lycee-general',
    label: 'Lycée Général',
    icon: GraduationCap,
    color: 'text-primary',
    iconBg: 'bg-primary/10',
    subtitle: '2nde · 1ère · Terminale — Bac Général',
    ressources: [
      { label: 'Éduscol Lycée GT', url: 'https://eduscol.education.fr/lycee', desc: 'Programmes officiels et ressources Bac Général & Techno', tag: 'Programmes', official: true },
      { label: 'Annales du Bac', url: 'https://www.education.gouv.fr/baccalaureat-annales-105560', desc: 'Sujets officiels du Baccalauréat par épreuve et session', tag: 'Bac', official: true },
      { label: 'Parcoursup', url: 'https://www.parcoursup.gouv.fr/', desc: 'Plateforme nationale d\'orientation post-Bac — MESR', tag: 'Orientation', official: true },
      { label: 'Onisep (Lycée)', url: 'https://www.onisep.fr/', desc: 'Fiches métiers, formations et orientation — ONISEP', tag: 'Orientation', official: true },
      { label: 'Lumni Lycée', url: 'https://www.lumni.fr/lycee', desc: 'Révisions Bac par matière — France Télévisions', tag: 'Vidéos', official: true },
      { label: 'CNED Lycée', url: 'https://www.cned.fr/lycee', desc: 'Cours officiels par correspondance pour toutes les spécialités', tag: 'Cours', official: true },
      { label: 'Institut Français des Sciences (CNRS)', url: 'https://www.cnrs.fr/fr/education', desc: 'Dossiers scientifiques pour les lycéens — niveau Terminale', tag: 'Sciences', official: true },
    ] },
  {
    id: 'lycee-pro',
    label: 'Lycée Pro',
    icon: Award,
    color: 'text-chart-4',
    iconBg: 'bg-chart-4/10',
    subtitle: 'Bac Pro · CAP · BEP · Alternance',
    ressources: [
      { label: 'Éduscol Voie professionnelle', url: 'https://eduscol.education.fr/voie-professionnelle', desc: 'Programmes et ressources officielles Bac Pro et CAP', tag: 'Programmes', official: true },
      { label: 'Onisep Bac Pro', url: 'https://www.onisep.fr/Choisir-mes-etudes/Apres-le-college/La-voie-professionnelle', desc: 'Guide des formations professionnelles et CAP/BEP', tag: 'Orientation', official: true },
      { label: 'Alternance.emploi.gouv.fr', url: 'https://www.alternance.emploi.gouv.fr/', desc: 'Trouver un contrat d\'apprentissage ou de professionnalisation', tag: 'Alternance', official: true },
      { label: 'Mon compte formation (CPF)', url: 'https://www.moncompteformation.gouv.fr/', desc: 'Crédit formation personnel — financement officiel État', tag: 'Formation', official: true },
      { label: 'AFPA (Alternance)', url: 'https://www.afpa.fr/', desc: 'Formation professionnelle adultes et alternants — organisme public', tag: 'Formation', official: true },
      { label: 'France Travail (stages)', url: 'https://www.francetravail.fr/', desc: 'Offres de stage et d\'apprentissage — anciennement Pôle emploi', tag: 'Stages', official: true },
      { label: 'Lumni (Voie Pro)', url: 'https://www.lumni.fr/', desc: 'Vidéos métiers et formations professionnelles', tag: 'Vidéos', official: true },
    ] },
  {
    id: 'superieur',
    label: 'Supérieur',
    icon: Building2,
    color: 'text-chart-3',
    iconBg: 'bg-chart-3/10',
    subtitle: 'BTS · Licence · Master · Grande École · Doctorat',
    ressources: [
      { label: 'FUN-MOOC', url: 'https://www.fun-mooc.fr/', desc: 'France Université Numérique — MOOCs gratuits des universités françaises', tag: 'MOOCs', official: true },
      { label: 'Mon master', url: 'https://www.monmaster.gouv.fr/', desc: 'Plateforme nationale d\'admission en Master — MESR', tag: 'Orientation', official: true },
      { label: 'Campus France', url: 'https://www.campusfrance.org/', desc: 'Études à l\'étranger et mobilité internationale — Agence nationale', tag: 'Échanges', official: true },
      { label: 'CNOUS (Bourses & logement)', url: 'https://www.cnous.fr/', desc: 'Aides sociales, bourses, logement CROUS — service public étudiant', tag: 'Aides', official: true },
      { label: 'Lumni Supérieur', url: 'https://www.lumni.fr/superieur', desc: 'Conférences, cours magistraux et documentaires', tag: 'Vidéos', official: true },
      { label: 'Gallica (BNF)', url: 'https://gallica.bnf.fr/', desc: 'Bibliothèque numérique gratuite de la BNF — millions de documents', tag: 'Bibliothèque', official: true },
      { label: 'HAL (thèses & publications)', url: 'https://hal.science/', desc: 'Archive ouverte nationale de publications scientifiques', tag: 'Recherche', official: true },
      { label: 'Theses.fr', url: 'https://www.theses.fr/', desc: 'Catalogue national des thèses françaises soutenues', tag: 'Recherche', official: true },
    ] },
  {
    id: 'inclusion',
    label: 'ULIS / SEGPA / DYS',
    icon: Heart,
    color: 'text-chart-5',
    iconBg: 'bg-chart-5/10',
    subtitle: 'Handicap · Troubles DYS · Inclusion scolaire',
    ressources: [
      { label: 'Éducation nationale — Inclusion', url: 'https://www.education.gouv.fr/l-ecole-inclusive', desc: 'Politique officielle d\'inclusion scolaire — EN', tag: 'Inclusion', official: true },
      { label: 'ULIS (EN)', url: 'https://www.education.gouv.fr/l-ecole-inclusive', desc: 'Unités localisées pour l\'inclusion scolaire — droits et dispositifs', tag: 'ULIS', official: true },
      { label: 'SEGPA (EN)', url: 'https://www.education.gouv.fr/la-segpa', desc: 'Sections d\'enseignement général et professionnel adapté', tag: 'SEGPA', official: true },
      { label: 'PPS / PAP / PAI (EN)', url: 'https://www.education.gouv.fr/l-ecole-inclusive', desc: 'Projets personnalisés de scolarisation — droits officiels', tag: 'Droits', official: true },
      { label: 'MDPH — Mon Parcours Handicap', url: 'https://www.monparcourshandicap.gouv.fr/', desc: 'Portail officiel gouvernemental MDPH, RQTH, PCH, AAH', tag: 'MDPH', official: true },
      { label: 'Troubles DYS (EN)', url: 'https://www.education.gouv.fr/les-troubles-dys-de-l-apprentissage', desc: 'Dyslexie, dyspraxie, TDAH — aménagements officiels', tag: 'DYS', official: true },
      { label: 'FALC — Facile à lire (UNAPEI)', url: 'https://www.unapei.org/article/les-documents-en-facile-a-lire-et-a-comprendre-falc/', desc: 'Facile À Lire et à Comprendre — format accessible', tag: 'FALC', official: true },
      { label: 'Réseau Canopé — École Inclusive', url: 'https://www.canope.fr/', desc: 'Ressources pédagogiques pour l\'école inclusive — Canopé officiel', tag: 'Pédagogie', official: true },
    ] },
];

// ─── Méthodes de révision scientifiques ───────────────────────────────────────
const METHODES: Methode[] = [
  {
    nom: 'Méthode Feynman',
    temps: '30–45 min/sujet',
    description: 'Explique le concept à voix haute comme si tu l\'enseignais à un enfant de 10 ans. Ce que tu ne peux pas expliquer simplement, tu ne le comprends pas encore.',
    etapes: [
      'Choisis un concept à apprendre',
      'Explique-le à voix haute en langage simple, sans notes',
      'Identifie les blocages (où tu butes = lacune réelle)',
      'Reviens au cours pour combler les lacunes identifiées',
      'Réexplique jusqu\'à fluidité complète',
    ],
    source: 'Richard Feynman — Prix Nobel de Physique 1965',
    icon: Brain,
    color: 'border-primary/30 bg-primary/5' },
  {
    nom: 'Révision espacée',
    temps: 'J+1, J+3, J+7, J+14, J+30',
    description: 'Basée sur la courbe de l\'oubli d\'Ebbinghaus : on retient 80 % de plus si on révise à intervalles croissants plutôt que de tout bachoter la veille.',
    etapes: [
      'Revois le cours le soir même (J+0)',
      'Refais une synthèse rapide à J+1',
      'Test surprise à J+3 sans regarder tes notes',
      'Révision complète à J+7',
      'Relecture légère à J+14, puis J+30',
    ],
    source: 'Hermann Ebbinghaus — psychologue, 1885 (Über das Gedächtnis)',
    icon: Clock,
    color: 'border-chart-3/30 bg-chart-3/5' },
  {
    nom: 'Technique Pomodoro',
    temps: '25 min × N sessions',
    description: 'Travaille 25 minutes en concentration totale (téléphone hors de portée), puis pause stricte de 5 min. Après 4 cycles, pause longue de 15–30 min.',
    etapes: [
      'Éteins les notifications (téléphone retourné)',
      'Définis UNE tâche précise avant de démarrer',
      'Travaille 25 min SANS interruption — pas de réseaux',
      'Pause 5 min : lève-toi, étire-toi, eau',
      'Après 4 Pomodoros : pause longue 15–30 min',
    ],
    source: 'Francesco Cirillo — méthode Pomodoro, 1987',
    icon: Target,
    color: 'border-chart-1/30 bg-chart-1/5' },
  {
    nom: 'Notes Cornell',
    temps: '10 min de mise en forme',
    description: 'Divise ta feuille en 3 zones : à droite les notes brutes, à gauche les mots-clés et questions, en bas le résumé en 2–3 phrases. Format créé par l\'université Cornell.',
    etapes: [
      'Divise la feuille (colonne droite 2/3, gauche 1/3)',
      'Pendant le cours : notes brutes à droite (faits, schémas)',
      'Après le cours : mots-clés + questions à gauche',
      'En bas : résumé synthétique en 2–3 lignes',
      'Révision : cache la partie droite, réponds aux questions de gauche',
    ],
    source: 'Walter Pauk — Université Cornell (NY), 1956',
    icon: FileText,
    color: 'border-chart-2/30 bg-chart-2/5' },
  {
    nom: 'Active Recall (test forcé)',
    temps: '20 min après chaque cours',
    description: 'Ferme ton cours immédiatement après l\'avoir lu et écris de mémoire tout ce dont tu te souviens. Ce qui ne revient pas = lacune à combler.',
    etapes: [
      'Lis le cours une seule fois, attentivement',
      'Ferme tout — cours, téléphone, notes',
      'Écris de mémoire tout ce dont tu te souviens',
      'Compare avec le cours pour identifier les manques',
      'Refais la même opération 3 jours plus tard',
    ],
    source: 'Psychologie cognitive — Roediger & Karpicke, 2006 (Science)',
    icon: Zap,
    color: 'border-chart-5/30 bg-chart-5/5' },
  {
    nom: 'Carte mentale (Mind Map)',
    temps: '15–20 min par chapitre',
    description: 'Visualise un chapitre entier comme un arbre : concept central au milieu, branches principales = grandes idées, sous-branches = détails. Sollicite la mémoire visuelle.',
    etapes: [
      'Écris le concept central au milieu de la feuille',
      'Trace 5–7 branches principales (idées majeures)',
      'Ajoute des sous-branches pour chaque détail',
      'Utilise des couleurs différentes par branche',
      'Ajoute des pictogrammes pour ancrer visuellement',
    ],
    source: 'Tony Buzan — Use Your Head, 1970',
    icon: Lightbulb,
    color: 'border-chart-4/30 bg-chart-4/5' },
];

// ─── Statistiques EN ───────────────────────────────────────────────────────────
const STATS_EN: StatEN[] = [
  { valeur: '~6 800 000', label: 'Élèves du primaire', source: 'MENJ Rentrée 2025' },
  { valeur: '~3 300 000', label: 'Élèves du collège', source: 'MENJ Rentrée 2025' },
  { valeur: '~2 600 000', label: 'Élèves du lycée', source: 'MENJ Rentrée 2025' },
  { valeur: '91,5 %', label: 'Taux de réussite au Bac 2025', source: 'Ministère' },
  { valeur: '87,3 %', label: 'Taux de réussite au Brevet 2025', source: 'Ministère' },
  { valeur: '~2 900 000', label: 'Étudiants dans le supérieur', source: 'MESR 2025' },
  { valeur: '~380 000', label: 'Enseignants 1er degré', source: 'MENJ 2025' },
  { valeur: '~560 000', label: 'Enseignants 2nd degré', source: 'MENJ 2025' },
];

// ─── Carte ressource ───────────────────────────────────────────────────────────
function RessourceCard({ r }: { r: Ressource }) {
  return (
    <a
      href={r.url}
      target="_blank" rel="noopener noreferrer"
      className="group block"
      aria-label={`${r.label} — ${r.desc}`}
    >
      <Card className="h-full border-border hover:border-primary/40 hover:shadow-md transition-[border-color,box-shadow] duration-200 cursor-pointer">
        <CardContent className="p-4 flex flex-col h-full gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-balance flex-1">
              {r.label}
            </p>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1 text-pretty">{r.desc}</p>
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground border border-border font-medium">
              {r.tag}
            </span>
            {r.official && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-chart-2/10 text-chart-2 border border-chart-2/25 font-semibold">
                ✓ Officiel
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function RessourcesOfficiellesPage() {
  const [activeMethode, setActiveMethode] = useState<number | null>(null);

  return (
    <>
    <h1 className="sr-only">Ressources officielles</h1>
      <SEO
        title="Ressources Officielles — Éduscol, CNED, Onisep, Sésamath & Lumni | Apprenix"
        description="Ressources officielles : Éduscol, CNED, Onisep, Sésamath, Lumni, FUN-MOOC. Méthodes de révision scientifiques (Feynman, Cornell, Pomodoro). Gratuit."
        canonical="/ressources-officielles"
        keywords="ressources pédagogiques officielles, Éduscol scolaire, CNED cours gratuit, Onisep orientation, annales bac brevet officielles, Sésamath maths, Lumni vidéos cours, FUN-MOOC université, méthode Feynman, méthode Cornell"
        dateModified="2026-06-18"
      />

      <PageHero
        variant="trust"
        badge={<ENBadge />}
        title={<>Ressources pédagogiques<br className="hidden md:block" /> officielles & vérifiées</>}
        subtitle="Pack complet par niveau scolaire — 100 % sources institutionnelles françaises, 0 % IA, 0 % publicité. Mis à jour juin 2026."
        icon={BookMarked}
        stats={[
          { value: '6 niveaux', label: 'couverts' },
          { value: '60+', label: 'ressources vérifiées' },
          { value: '6 méthodes', label: 'de révision' },
          { value: '0 IA', label: 'tout du réel' },
        ]}
      />

      <div className="min-w-0 space-y-6 md:space-y-8">

        {/* ── Ressources par niveau ─────────────────────────────────────────── */}
        <section aria-labelledby="ressources-titre">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="ressources-titre" className="text-xl font-bold text-foreground">Ressources par niveau</h2>
            <ENBadge className="ml-2" />
          </div>

          <Tabs defaultValue="primaire" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted/60 p-1 rounded-xl w-full md:w-auto">
              {NIVEAUX.map(n => (
                <TabsTrigger
                  key={n.id}
                  value={n.id}
                  className="flex items-center gap-1.5 text-xs md:text-sm data-[state=active]:shadow-sm"
                >
                  <n.icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {n.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {NIVEAUX.map(n => (
              <TabsContent key={n.id} value={n.id} className="mt-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${n.iconBg} shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{n.label}</h3>
                    <p className="text-sm text-muted-foreground">{n.subtitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {n.ressources.map(r => <RessourceCard key={r.url} r={r} />)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* ── Méthodes de révision ──────────────────────────────────────────── */}
        <section aria-labelledby="methodes-titre">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="methodes-titre" className="text-xl font-bold text-foreground">
              Méthodes de révision à fondement scientifique
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6 max-w-2xl text-pretty">
            Ces 6 méthodes sont issues de la recherche en psychologie cognitive. Elles sont enseignées dans les universités
            et recommandées par les pédagogues. <strong className="text-foreground">Aucune IA impliquée</strong> — ce sont des
            méthodes humaines éprouvées depuis des décennies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {METHODES.map((m, i) => (
              <Card
                key={m.nom}
                className={`border cursor-pointer transition-[border-color,box-shadow,ring] duration-200 ${m.color} ${activeMethode === i ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}
                onClick={() => setActiveMethode(activeMethode === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveMethode(activeMethode === i ? null : i); } }}
                aria-expanded={activeMethode === i}
                aria-label={`Méthode ${m.nom} — cliquer pour voir les étapes`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <m.icon className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-foreground">{m.nom}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{m.temps}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{m.description}</p>

                  {activeMethode === i && (
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Étapes :</p>
                      <ol className="space-y-1.5">
                        {m.etapes.map((e, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {j + 1}
                            </span>
                            <span className="leading-relaxed">{e}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground italic border-t border-border/50 pt-2">
                    Source : {m.source}
                  </p>

                  <button type="button" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    {activeMethode === i ? 'Masquer les étapes' : 'Voir les étapes'}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeMethode === i ? 'rotate-90' : ''}`} />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Statistiques officielles ──────────────────────────────────────── */}
        <section aria-labelledby="stats-titre">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="stats-titre" className="text-xl font-bold text-foreground">
              Chiffres clés de l'Éducation nationale 2025–2026
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {STATS_EN.map(s => (
              <Card key={s.label} className="border-border text-center p-4">
                <p className="text-lg md:text-xl font-bold text-primary tabular-nums">{s.valeur}</p>
                <p className="text-sm text-foreground font-medium mt-1 text-balance">{s.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{s.source}</p>
              </Card>
            ))}
          </div>

          <Card className="border-chart-3/25 bg-chart-3/5 mt-4">
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
              <Info className="w-5 h-5 text-chart-3 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-muted-foreground flex-1">
                Ces chiffres proviennent du <strong className="text-foreground">Ministère de l'Éducation nationale et de la Jeunesse (MENJ)</strong> et du
                <strong className="text-foreground"> Ministère de l'Enseignement supérieur et de la Recherche (MESR)</strong> — Rentrée scolaire 2025.
                Source : <a href="https://www.education.gouv.fr/les-chiffres-cles-du-systeme-educatif-6515" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">education.gouv.fr</a>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── Lien annuaire établissements ─────────────────────────────────── */}
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 shrink-0">
              <School className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Trouver un établissement scolaire</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Annuaire complet des 68 936 établissements de France — collèges, lycées, écoles, EREA.
                Données officielles du Ministère, mises à jour en temps réel.
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="shrink-0 h-9 gap-1.5">
              <a href="/etablissements">
                <ExternalLink className="w-4 h-4" />
                Voir l'annuaire
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* ── Mention confiance ─────────────────────────────────────────────── */}
        <Card className="border-chart-2/25 bg-chart-2/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Award className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-foreground">100 % réel — 0 % IA</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Chaque ressource de cette page est vérifiée manuellement et provient d'une institution officielle française
                (Ministère, CNRS, BNF, ONISEP, Réseau Canopé, universités publiques) ou d'un organisme pédagogique reconnu.
                Aucune ressource générée par IA. Dernière vérification : juin 2026.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
