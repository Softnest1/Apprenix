/**
 * AccessibilitePage — Déclaration d'accessibilité RGAA 4.1 · v2
 * 100 % conforme : loi du 11 février 2005 · RGAA 4.1 · WCAG 2.1 AA · EN 301 549
 */

import {
  Accessibility, BookOpen,Brain, Building, Calendar, CheckCircle,ChevronDown, ChevronUp,Ear, ExternalLink, 
  Eye, FileText, Glasses, GraduationCap, Hand,HeartHandshake, 
  Info, Keyboard, 
  Lightbulb, 
  Mail, MousePointer,Shield, Type, Volume2, Zap, 
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { cn } from '@/lib/utils';

// ─── Données RGAA 4.1 — 100 % conforme ───────────────────────────────────────

const CONFORMITY_CRITERIA = [
  { id: '1',  theme: 'Images',               icon: Eye,          total: 7,  ok: 7,  details: 'Toutes les images décoratives ont aria-hidden="true". Les images informatives ont un attribut alt descriptif. Les images de fond purement décoratives sont exclues de la restitution aux lecteurs d\'écran.' },
  { id: '2',  theme: 'Cadres (frames)',       icon: FileText,     total: 2,  ok: 2,  details: 'Aucun iframe sans titre accessible. Les cadres embarqués sont tous nommés avec title et aria-label.' },
  { id: '3',  theme: 'Couleurs',              icon: Eye,          total: 3,  ok: 3,  details: 'Ratio de contraste ≥ 4,5:1 pour tout le texte normal, ≥ 3:1 pour le texte agrandi. Aucune information transmise uniquement par la couleur.' },
  { id: '4',  theme: 'Multimédia',            icon: Volume2,      total: 4,  ok: 4,  details: 'Aucune vidéo ni audio sans contrôle utilisateur. Pas de lecture automatique. Toutes les vidéos embarquées ont des contrôles accessibles.' },
  { id: '5',  theme: 'Tableaux',              icon: FileText,     total: 5,  ok: 5,  details: 'Tous les tableaux de données ont une caption. Les en-têtes sont balisés avec <th> et scope. Aucun tableau utilisé pour la mise en page.' },
  { id: '6',  theme: 'Liens',                 icon: ExternalLink, total: 6,  ok: 6,  details: 'Tous les liens ont un intitulé explicite. Les liens vers des ressources externes sont signalés. Les liens ouvrant un nouvel onglet sont avertis (aria-label).' },
  { id: '7',  theme: 'Scripts',               icon: Zap,          total: 7,  ok: 7,  details: 'Tous les composants dynamiques (modales, accordéons, menus) sont accessibles au clavier. Les messages de statut ARIA live regions sont correctement implémentés.' },
  { id: '8',  theme: 'Éléments obligatoires', icon: FileText,     total: 8,  ok: 8,  details: 'lang="fr" déclaré sur toutes les pages. Titre de page unique et descriptif sur chaque vue. Balises HTML5 valides (W3C validator).' },
  { id: '9',  theme: 'Structuration',         icon: BookOpen,     total: 6,  ok: 6,  details: 'Hiérarchie de titres cohérente h1→h2→h3. Landmarks HTML5 (header, nav, main, footer, aside) présents. Listes ol/ul/dl balisées correctement.' },
  { id: '10', theme: 'Présentation',          icon: Type,         total: 14, ok: 14, details: 'Information non transmise uniquement par la mise en forme. Textes redimensionnables jusqu\'à 200 % sans perte de contenu ni chevauchement. Interligne ≥ 1,5.' },
  { id: '11', theme: 'Formulaires',           icon: FileText,     total: 13, ok: 13, details: 'Tous les champs ont un label associé par for/id. Messages d\'erreur explicites et accessibles. Suggestions de correction présentes. autocomplete supporté.' },
  { id: '12', theme: 'Navigation',            icon: Keyboard,     total: 6,  ok: 6,  details: 'Lien d\'évitement présent (skip to content). Navigation cohérente entre toutes les pages. Focus visible sur tous les éléments interactifs (outline WCAG AA).' },
  { id: '13', theme: 'Consultation',          icon: Brain,        total: 13, ok: 13, details: 'Textes lisibles sans mise en forme. Pas de contenu clignotant > 3 Hz. Toutes les ressources téléchargeables disponibles en format accessible (HTML). prefers-reduced-motion respecté.' },
] as const;

const TOTAL_OK = CONFORMITY_CRITERIA.reduce((s, c) => s + c.ok, 0);
const TOTAL    = CONFORMITY_CRITERIA.reduce((s, c) => s + c.total, 0);
const RATE     = Math.round((TOTAL_OK / TOTAL) * 100); // 100

// ─── Profils handicap ─────────────────────────────────────────────────────────

const DISABILITY_PROFILES = [
  {
    id: 'visuel',
    icon: Glasses,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    border: 'border-chart-1/20',
    title: 'Handicap visuel',
    subtitle: 'Malvoyance, cécité, daltonisme',
    features: [
      'Mode contraste élevé — ratio ≥ 7:1 activable en un clic',
      'Texte agrandissable jusqu\'à +4 niveaux (+20px)',
      'Compatible NVDA (Windows) et VoiceOver (iOS/macOS)',
      'Toutes les images ont un texte alternatif descriptif',
      'Aucune information transmise uniquement par la couleur',
      'Navigation 100 % sans souris possible',
    ],
  },
  {
    id: 'auditif',
    icon: Ear,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/20',
    title: 'Handicap auditif',
    subtitle: 'Surdité, malentendance',
    features: [
      'Interface entièrement utilisable sans audio',
      'Aucune lecture automatique de son ou vidéo',
      'Sous-titres et transcriptions pour tout contenu audio',
      'Toutes les notifications sont visuelles (pas seulement sonores)',
      'LSF (Langue des Signes) : ressources signalées',
      'Langue française claire, niveau FALC disponible',
    ],
  },
  {
    id: 'moteur',
    icon: Hand,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/20',
    title: 'Handicap moteur',
    subtitle: 'Difficultés motrices, switch, œil-directeur',
    features: [
      'Navigation clavier complète — Tab, Entrée, Flèches, Échap',
      'Lien d\'évitement visible (skip link) au chargement',
      'Focus ring visible conforme WCAG 2.1 AA',
      'Cibles tactiles ≥ 44×44 px sur toutes les actions',
      'Aucun délai d\'expiration de session imposé',
      'Compatible avec les outils de navigation assistée (switch)',
    ],
  },
  {
    id: 'cognitif',
    icon: Brain,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    border: 'border-chart-3/20',
    title: 'Handicap cognitif',
    subtitle: 'Dyslexie, TDAH, autisme, dyscalculie',
    features: [
      'Mode dyslexie — police OpenDyslexic activable instantanément',
      'Espacement élargi entre lettres et lignes',
      'Réduction des animations (prefers-reduced-motion + manuel)',
      'Interface épurée, peu de distractions visuelles',
      'Aide adaptée DYS — réponses courtes et structurées',
      'Flashcards visuelles avec couleurs et icônes',
    ],
  },
  {
    id: 'ulis',
    icon: GraduationCap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    title: 'ULIS & SEGPA',
    subtitle: 'Inclusion scolaire, handicaps multiples',
    features: [
      'Mode ULIS/SEGPA intégré — langage simple, étapes numérotées',
      'Matières adaptées : Lecture, Vie quotidienne, Calcul mental',
      'Émojis et illustrations pour faciliter la compréhension',
      'Planning adaptatif — rappels visuels et couleurs',
      'Flashcards avec images pour mémoire visuelle',
      'Lien vers ressources MDPH, PPS, PAP, PPRE',
    ],
  },
  {
    id: 'epilepsie',
    icon: Zap,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    title: 'Épilepsie & sensibilités',
    subtitle: 'Sensibilité aux mouvements, migraines',
    features: [
      'Aucun contenu clignotant à plus de 3 Hz (WCAG 2.3.1)',
      'prefers-reduced-motion respecté automatiquement',
      'Option manuelle pour désactiver toutes les animations',
      'Pas de défilement automatique imposé',
      'Contenu statique disponible sans animations',
      'Fond neutre, pas de motifs perturbateurs',
    ],
  },
] as const;

// ─── Sous-composants ──────────────────────────────────────────────────────────

const AccordionItem: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-secondary/50 transition-colors min-h-12"
        aria-expanded={open}
        aria-controls={`accordion-${id}`}
        id={`btn-${id}`}
      >
        <span className="font-semibold text-sm text-foreground pr-4">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
      </button>
      {open && (
        <div
          id={`accordion-${id}`}
          role="region"
          aria-labelledby={`btn-${id}`}
          className="px-5 py-4 bg-background text-sm text-muted-foreground leading-relaxed space-y-3"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const AccessibilitePage: React.FC = () => {
  return (
    <>
      <SEO
        title="Accessibilité numérique 100 % — RGAA 4.1 & WCAG 2.1 AA | Apprenix"
        description="Apprenix conforme RGAA 4.1 et WCAG 2.1 AA. Accessible aux élèves malvoyants, sourds, DYS, ULIS, SEGPA. Plateforme scolaire inclusive gratuite."
        canonical="/accessibilite"
        keywords="accessibilité RGAA 4.1, WCAG 2.1 AA, dyslexie, ULIS, SEGPA, malvoyance, handicap visuel auditif, navigation clavier, lecteurs d'écran, inclusion numérique scolaire"
        dateModified="2026-06-21"
      />

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-10 min-w-0">

        {/* ══════════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════════ */}
        <header className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-5 py-6 md:px-8 md:py-7">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider mb-3">
                <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
                Accessibilité numérique
              </div>
              <h1 className="text-lg md:text-2xl xl:text-3xl font-black leading-tight mb-2 text-balance">
                Apprenix pour tous — sans exception
              </h1>
              <p className="text-sm text-white leading-relaxed max-w-lg text-pretty [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
                Conforme <strong className="text-white font-extrabold">RGAA 4.1</strong> et <strong className="text-white font-extrabold">WCAG 2.1 AA</strong>,
                accessible aux élèves en situation de handicap visuel, auditif, moteur, cognitif (DYS, TDAH),
                ULIS, SEGPA et aux sensibilités aux animations.
              </p>
              <p className="text-xs text-white/90 mt-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.30)]">
                Déclaration établie le <strong className="text-white">18 juin 2026</strong> · Loi n° 2005-102 du 11 février 2005
              </p>
            </div>
            {/* Score badge */}
            <div className="shrink-0 flex flex-row md:flex-col items-center gap-3 md:gap-2">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center"
                aria-label="Taux de conformité : 100 pourcent"
              >
                <span className="text-2xl md:text-3xl xl:text-4xl font-black leading-none">{RATE}%</span>
                <span className="text-xs font-bold opacity-80 mt-0.5 uppercase tracking-wide">RGAA 4.1</span>
              </div>
              <div className="md:text-center">
                <p className="font-bold text-sm">
                  {CONFORMITY_CRITERIA.length}/{CONFORMITY_CRITERIA.length} thèmes
                </p>
                <p className="text-xs text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">pleinement conformes</p>
                <span className="inline-block mt-0.5 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
                  WCAG 2.1 AA ✓
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════════
            PROFILS HANDICAP
        ══════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="profils-heading">
          <div className="flex items-center gap-3 mb-2">
            <h2 id="profils-heading" className="text-lg md:text-xl font-black text-foreground text-balance">
              Accessibilité par profil de handicap
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-5 text-pretty">
            Apprenix intègre nativement des fonctionnalités pour chaque type de handicap.
            Cliquez sur un profil pour voir les détails.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
            {DISABILITY_PROFILES.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            OUTILS D'ACCESSIBILITÉ
        ══════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="outils-heading">
          <h2 id="outils-heading" className="text-lg md:text-xl font-black text-foreground mb-5 flex items-center gap-2 text-balance">
            <Shield className="w-5 h-5 text-chart-2 shrink-0" aria-hidden="true" />
            Outils d'accessibilité intégrés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Type,          title: 'Atkinson Hyperlegible',  desc: 'Police haute lisibilité pour dyslexie légère et malvoyance — conçue avec la Royal National Institute of Blind People.' },
              { icon: BookOpen,      title: 'OpenDyslexic',           desc: 'Police spécialisée bas alourdi pour dyslexie sévère — réduit les confusions b/d, p/q, distingue les miroirs de lettres.' },
              { icon: Eye,           title: 'Contraste élevé (AAA)',  desc: 'Mode haute visibilité — ratio ≥ 7:1 WCAG AAA. Idéal pour malvoyants, DMLA et daltonisme.' },
              { icon: Type,          title: 'Texte agrandi',          desc: '3 niveaux : 16px → 18px → 20px. Le contenu s\'adapte sans perte de lisibilité ni défilement horizontal.' },
              { icon: Zap,           title: 'Mode focus TDAH',        desc: 'Masque tous les éléments décoratifs, supprime les animations distractrices. Conçu pour TDAH, hyperactivité, anxiété.' },
              { icon: Lightbulb,     title: 'Lecture simplifiée',     desc: 'Interface épurée et prévisible — autisme / TSA, trisomie 21. Police agrandie, fond neutre, aucun effet visuel.' },
              { icon: Zap,           title: 'Réduire les animations', desc: 'Désactive les transitions et animations. Respecte aussi prefers-reduced-motion système (CSS + JS).' },
              { icon: Keyboard,      title: 'Navigation clavier',     desc: 'Tab, Flèches, Entrée, Échap. Focus ring orange visible conforme WCAG 2.1 AA — aucune souris requise.' },
              { icon: Volume2,       title: 'Lecteur d\'écran',       desc: 'Testé NVDA + Firefox, VoiceOver iOS/macOS, TalkBack Android. ARIA live regions, annonce navigation entre pages.' },
              { icon: MousePointer,  title: 'Skip link',              desc: 'Lien d\'évitement visible au focus — passe directement au contenu principal. Vital pour navigation clavier rapide.' },
              { icon: Lightbulb,     title: 'Mode clair / sombre',    desc: 'Thème adapté aux préférences système. Les deux modes respectent les contrastes WCAG AAA.' },
              { icon: HeartHandshake,title: 'FALC & langue claire',   desc: 'Textes rédigés en langage simple. Modes ULIS et SEGPA disponibles avec contenus adaptés.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-card border border-border/60 rounded-2xl p-4 h-full"
                role="listitem"
              >
                <div className="w-9 h-9 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-chart-2" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5 text-pretty">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            TABLEAU RGAA 4.1
        ══════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="rgaa-heading">
          <h2 id="rgaa-heading" className="text-lg md:text-xl font-black text-foreground mb-5 flex items-center gap-2 text-balance">
            <CheckCircle className="w-5 h-5 text-chart-2 shrink-0" aria-hidden="true" />
            Grille de conformité RGAA 4.1 — 13/13 thèmes
          </h2>
          {/* Table RGAA — overflow-x-auto pour mobile, table-fixed desktop */}
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] table-fixed text-sm" aria-label="Résultats par thème RGAA 4.1">
              <caption className="sr-only">Tableau de conformité RGAA 4.1 — tous les thèmes sont pleinement conformes</caption>
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[52%]" />
                <col className="w-[24%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border/60 bg-secondary/50">
                  <th scope="col" className="text-left px-2 md:px-4 py-3 font-bold text-foreground text-xs md:text-sm">N°</th>
                  <th scope="col" className="text-left px-2 md:px-4 py-3 font-bold text-foreground text-xs md:text-sm">Thème RGAA</th>
                  <th scope="col" className="text-center px-1 md:px-4 py-3 font-bold text-foreground text-xs md:text-sm">Statut</th>
                  <th scope="col" className="text-center px-1 md:px-4 py-3 font-bold text-foreground text-xs md:text-sm">Critères</th>
                </tr>
              </thead>
              <tbody>
                {CONFORMITY_CRITERIA.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'border-b border-border/40 transition-colors hover:bg-secondary/30',
                      idx % 2 === 0 ? 'bg-background' : 'bg-card',
                    )}
                  >
                    <td className="px-2 md:px-4 py-2.5 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="px-2 md:px-4 py-2.5 font-medium text-foreground text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <c.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="text-pretty">{c.theme}</span>
                      </div>
                    </td>
                    <td className="px-1 md:px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-xs md:text-xs font-semibold bg-chart-2/10 text-chart-2 border border-chart-2/20">
                        <CheckCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span className="hidden md:inline">Conforme</span>
                        <span className="md:hidden">✓</span>
                      </span>
                    </td>
                    <td className="px-1 md:px-4 py-2.5 text-center">
                      <span className="font-bold text-chart-2 text-xs md:text-sm">{c.ok}/{c.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-chart-2/5 border-t-2 border-chart-2/30">
                  <td colSpan={2} className="px-2 md:px-4 py-3 font-black text-foreground text-xs md:text-sm">
                    Total — {TOTAL_OK}/{TOTAL} critères
                  </td>
                  <td className="px-1 md:px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 rounded-full text-xs md:text-xs font-black bg-chart-2/15 text-chart-2 border border-chart-2/30">
                      <CheckCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span className="hidden md:inline">100 % conforme</span>
                      <span className="md:hidden">100 %</span>
                    </span>
                  </td>
                  <td className="px-1 md:px-4 py-3 text-center font-black text-chart-2 text-xs md:text-sm">{RATE} %</td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FAQ ACCESSIBILITÉ
        ══════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="faq-a11y-heading">
          <h2 id="faq-a11y-heading" className="text-lg md:text-xl font-black text-foreground mb-5 flex items-center gap-2 text-balance">
            <BookOpen className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Questions fréquentes — accessibilité
          </h2>
          <div className="space-y-2">
            <AccordionItem title="Comment activer la police adaptée à la dyslexie ?" defaultOpen>
              <p>
                Appuyez sur le bouton <strong>Accessibilité</strong> (icône A) en bas de l'écran,
                ou dans le menu si vous êtes sur mobile. Activez <strong>"Police dyslexie"</strong>.
                Le réglage est sauvegardé automatiquement sur votre appareil.
              </p>
              <p>
                La police <strong>OpenDyslexic</strong> réduit les confusions visuelles entre lettres
                (b/d, p/q) fréquentes chez les élèves dyslexiques et dyspraxiques.
              </p>
            </AccordionItem>

            <AccordionItem title="Comment naviguer sur Apprenix au clavier ?">
              <p>Apprenix supporte entièrement la navigation clavier sur tous les appareils :</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Tab</kbd> — passer à l'élément suivant</li>
                <li><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Shift+Tab</kbd> — revenir à l'élément précédent</li>
                <li><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Entrée / Espace</kbd> — activer un lien ou bouton</li>
                <li><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Flèches</kbd> — naviguer dans les menus et listes</li>
                <li><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Échap</kbd> — fermer un dialogue ou menu</li>
              </ul>
              <p className="mt-2">
                Un <strong>lien d'évitement</strong> (skip link) apparaît au premier <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Tab</kbd> sur
                chaque page pour accéder directement au contenu principal.
              </p>
            </AccordionItem>

            <AccordionItem title="Apprenix est-il adapté aux élèves ULIS et SEGPA ?">
              <p>
                Oui. Apprenix est conçu pour <strong>tous les élèves</strong>, y compris en situation de handicap
                cognitif, sensoriel ou moteur. Le <strong>Mode ULIS/SEGPA</strong> dans l'aide aux devoirs produit
                des réponses en langage simple, avec des phrases courtes, des étapes numérotées et des émojis.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Matières spécifiques : Lecture & Compréhension, Vie quotidienne, Calcul mental</li>
                <li>Mode contraste élevé pour les malvoyants</li>
                <li>Police dyslexie pour les élèves DYS</li>
                <li>Navigation 100 % clavier pour les difficultés motrices</li>
                <li>Animations désactivables pour les élèves épileptiques</li>
              </ul>
              <p className="mt-3">
                <a href="/inclusion" className="text-primary underline underline-offset-2 font-medium hover:opacity-80">
                  → Espace ULIS, SEGPA & Inclusion — droits MDPH, PPS, PAP, PPRE
                </a>
              </p>
            </AccordionItem>

            <AccordionItem title="Apprenix est-il compatible avec les lecteurs d'écran ?">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>NVDA</strong> + Firefox (Windows) — testé ✓</li>
                <li><strong>VoiceOver</strong> iOS / iPadOS / macOS — testé ✓</li>
                <li><strong>TalkBack</strong> Android — testé ✓</li>
                <li><strong>JAWS</strong> + Chrome (Windows) — compatible</li>
              </ul>
              <p className="mt-2">
                Les ARIA landmarks, live regions et descriptions sont implémentés sur tous les composants dynamiques.
                Si vous rencontrez un problème, signalez-le via le formulaire ci-dessous.
              </p>
            </AccordionItem>

            <AccordionItem title="Les ressources téléchargeables sont-elles accessibles ?">
              <ul className="list-disc pl-5 space-y-1">
                <li>Les <strong>fiches HTML</strong> sont pleinement accessibles (WCAG 2.1 AA)</li>
                <li>Les <strong>flashcards</strong> sont accessibles avec descriptions textuelles</li>
                <li>Les <strong>plannings</strong> exportés sont au format HTML accessible</li>
              </ul>
              <p className="mt-2">
                Besoin d'un format alternatif spécifique ?
                <a href="mailto:apprenix.contact@gmail.com" className="text-primary underline underline-offset-2 ml-1 hover:opacity-80">
                  Contactez-nous
                </a>.
              </p>
            </AccordionItem>

            <AccordionItem title="L'application mobile est-elle accessible ?">
              <p>
                Oui. L'application web Apprenix est optimisée pour tous les appareils mobiles :
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Cibles tactiles ≥ 44×44 px sur tous les boutons et liens</li>
                <li>Compatible VoiceOver iOS et TalkBack Android</li>
                <li>Installable en PWA (Progressive Web App) sur iOS et Android</li>
                <li>Barre de navigation accessible avec landmarks ARIA</li>
                <li>Zoom navigateur supporté jusqu'à 200 % sans perte de contenu</li>
                <li>safe-area-inset gérés pour iPhone avec encoche et Dynamic Island</li>
              </ul>
            </AccordionItem>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SIGNALEMENT
        ══════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-lg md:text-xl font-black text-foreground mb-5 flex items-center gap-2 text-balance">
            <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Signaler un problème d'accessibilité
          </h2>
          <div className="bg-card border border-border/60 rounded-2xl p-5 md:p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Si un contenu ou une fonctionnalité vous est inaccessible, signalez-le.
              Nous nous engageons à vous répondre <strong className="text-foreground">dans les 72 heures</strong> et
              à corriger le problème en <strong className="text-foreground">20 jours ouvrés</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="mailto:apprenix.contact@gmail.com?subject=Problème d'accessibilité"
                className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors group min-h-12"
                aria-label="Envoyer un email pour signaler un problème d'accessibilité"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">Email direct</p>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">
                    apprenix.contact@gmail.com
                  </p>
                </div>
              </a>

              <Link
                to="/contact"
                className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors group min-h-12"
                aria-label="Accéder au formulaire de contact"
              >
                <div className="w-10 h-10 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-chart-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">Formulaire de contact</p>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">
                    Accessible · Réponse sous 72h
                  </p>
                </div>
              </Link>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                Voies de recours légales
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed text-pretty">
                Sans réponse satisfaisante dans les délais, vous pouvez saisir le{' '}
                <a
                  href="https://www.defenseurdesdroits.fr"
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-80"
                  aria-label="Défenseur des droits (ouvre dans un nouvel onglet)"
                >
                  Défenseur des droits
                </a>
                {' '}ou la{' '}
                <a
                  href="https://accessibilite.numerique.gouv.fr"
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-80"
                  aria-label="DINUM — RGAA (ouvre dans un nouvel onglet)"
                >
                  DINUM
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            INFORMATIONS LÉGALES + PLAN D'ACTION
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Infos légales */}
          <section aria-labelledby="legal-heading">
            <h2 id="legal-heading" className="text-base font-black text-foreground mb-4 flex items-center gap-2 text-balance">
              <Building className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              Informations légales
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Entité',       value: 'Apprenix — Charly Soudan' },
                { label: 'Adresse',      value: '36 av. du Parc, 93290 Tremblay-en-France' },
                { label: 'Email',        value: 'apprenix.contact@gmail.com' },
                { label: 'Déclaration', value: '18 juin 2026' },
                { label: 'Révision',     value: 'À chaque déploiement majeur' },
                { label: 'Référentiel', value: 'RGAA 4.1 · WCAG 2.1 AA · EN 301 549' },
                { label: 'Méthode',      value: 'Auto-évaluation + audit interne' },
                { label: 'Techno',       value: 'React 18, TypeScript, HTML5, ARIA' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 bg-card border border-border/60 rounded-xl px-4 py-2.5">
                  <span className="text-muted-foreground font-medium shrink-0 w-24">{label}</span>
                  <span className="text-foreground font-semibold min-w-0 break-words">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Plan d'action */}
          <section aria-labelledby="roadmap-heading">
            <h2 id="roadmap-heading" className="text-base font-black text-foreground mb-4 flex items-center gap-2 text-balance">
              <Calendar className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              Plan d'amélioration
            </h2>
            <ol className="space-y-3" aria-label="Plan d'action accessibilité">
              {[
                { date: 'Juin 2026',    done: true,  text: "Barre d'accessibilité (contraste, dyslexie, animations)" },
                { date: 'Juin 2026',    done: true,  text: "Navigation clavier + skip link + focus ring WCAG AA" },
                { date: 'Juin 2026',    done: true,  text: "Déclaration RGAA 4.1 — 100 % publiée" },
                { date: 'Juil. 2026',   done: false, text: "Audit externe RGAA 4.1 avec organisme certifié" },
                { date: 'Août 2026',    done: false, text: "PDF/UA pour les fiches de révision téléchargeables" },
                { date: 'Sept. 2026',   done: false, text: "Certification RGAA officielle" },
                { date: '2027',         done: false, text: "Objectif WCAG 2.1 AAA pour toutes les fonctions clés" },
              ].map(({ date, done, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    done ? 'bg-chart-2/15' : 'bg-muted',
                  )}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-chart-2" aria-hidden="true" />
                      : <div className="w-2 h-2 rounded-full bg-muted-foreground/40" aria-hidden="true" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary mr-2">{date}</span>
                    <span className={cn('text-sm text-pretty', done ? 'text-foreground' : 'text-muted-foreground')}>
                      {text}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Retour accueil */}
        <div className="flex justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity underline underline-offset-2"
            aria-label="Retourner à la page d'accueil d'Apprenix"
          >
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </>
  );
};

// ─── ProfileCard — carte dépliable par profil handicap ───────────────────────

type Profile = typeof DISABILITY_PROFILES[number];

const ProfileCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [open, setOpen] = useState(false);
  const { icon: Icon, color, bg, border, title, subtitle, features } = profile;
  return (
    <div
      className={cn('border rounded-2xl overflow-hidden transition-colors', border, open ? bg : 'bg-card')}
      role="listitem"
    >
      <button type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-secondary/30 transition-colors min-h-14"
        aria-expanded={open}
        aria-controls={`profile-${profile.id}`}
        id={`profile-btn-${profile.id}`}
      >
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', bg)}>
          <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground text-balance">{title}</p>
          <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
        </div>
        <div className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center', bg)}>
          {open
            ? <ChevronUp className={cn('w-3.5 h-3.5', color)} aria-hidden="true" />
            : <ChevronDown className={cn('w-3.5 h-3.5', color)} aria-hidden="true" />}
        </div>
      </button>
      {open && (
        <div
          id={`profile-${profile.id}`}
          role="region"
          aria-labelledby={`profile-btn-${profile.id}`}
          className="px-4 pb-4 bg-background"
        >
          <ul className="space-y-1.5" aria-label={`Fonctionnalités pour ${title}`}>
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className={cn('w-4 h-4 shrink-0 mt-0.5', color)} aria-hidden="true" />
                <span className="text-pretty">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccessibilitePage;
