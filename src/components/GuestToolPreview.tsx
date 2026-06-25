// Page de présentation visiteur — démo immersive & interactive par outil.
// Stratégie : faire VIVRE l'outil au visiteur → désir → inscription.
import {
  ArrowRight, Award, BookMarked, Brain, Calculator, Calendar,
  CheckCircle, ChevronRight, CreditCard, Eye, FileText,
  GitBranch, HelpCircle, Languages, Lock, Rocket,
  ScanLine, ShieldCheck, Sparkles, Star, Timer,
  Trophy, TrendingUp, Users, Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type DemoWidget =
  | { type: 'flashcard'; front: string; back: string }
  | { type: 'steps'; question: string; steps: string[] }
  | { type: 'schedule'; rows: { day: string; tasks: string[] }[] }
  | { type: 'formula'; input: string; steps: string[]; result: string }
  | { type: 'quiz'; question: string; options: string[]; correct: number }
  | { type: 'mindmap'; root: string; branches: { label: string; children: string[] }[] }
  | { type: 'scan'; lines: string[] }
  | { type: 'thread'; posts: { author: string; text: string; votes: number }[] }
  | { type: 'generic'; lines: { q: string; a: string }[] };

interface ToolMeta {
  icon: React.ElementType;
  emoji: string;
  title: string;
  tagline: string;
  subtitle: string;
  accentFrom: string; // hsl string for gradient start
  accentTo: string;   // hsl string for gradient end
  accentClass: string; // Tailwind text-* class
  features: { icon: string; text: string }[];
  demo: DemoWidget;
  cta: string;
  stats: { value: string; label: string }[];
}

// ─── Métadonnées par outil ────────────────────────────────────────────────────
const TOOL_META: Record<string, ToolMeta> = {
  '/aide-ia': {
    icon: Brain,
    emoji: '🧠',
    title: 'Aide aux devoirs IA',
    tagline: 'Comprendre, pas copier',
    subtitle: 'Fiches méthode pas-à-pas, exercices commentés — le professeur particulier gratuit.',
    accentFrom: 'hsl(221 83% 38%)',
    accentTo: 'hsl(250 80% 50%)',
    accentClass: 'text-blue-600 dark:text-blue-400',
    features: [
      { icon: '📐', text: 'Toutes matières — Maths, Physique, Français…' },
      { icon: '🪜', text: 'Méthode étape par étape — jamais la réponse directe' },
      { icon: '♿', text: 'Mode ULIS / SEGPA — accessibilité totale' },
      { icon: '✅', text: 'Ressources vérifiées par des enseignants' },
    ],
    demo: {
      type: 'steps',
      question: 'Résoudre 2x² − 5x + 2 = 0',
      steps: [
        '① Identifier : a = 2, b = −5, c = 2',
        '② Calculer Δ = b² − 4ac = 25 − 16 = 9',
        '③ √Δ = 3',
        '④ x₁ = (5+3)/4 = 2   ·   x₂ = (5−3)/4 = ½',
      ],
    },
    cta: 'Accéder à l\'Aide IA',
    stats: [{ value: '13', label: 'matières' }, { value: '<3s', label: 'réponse' }, { value: '100%', label: 'gratuit' }],
  },
  '/scanner': {
    icon: ScanLine,
    emoji: '📸',
    title: 'Scanner de devoirs',
    tagline: 'Photo → explication instantanée',
    subtitle: 'Prends en photo ton exercice — l\'IA l\'analyse et t\'explique la méthode.',
    accentFrom: 'hsl(160 70% 30%)',
    accentTo: 'hsl(180 65% 38%)',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    features: [
      { icon: '📷', text: 'Photo de ton cahier, feuille ou tableau' },
      { icon: '🔍', text: 'OCR intelligent — lit même l\'écriture manuscrite' },
      { icon: '🪜', text: 'Explication personnalisée pas à pas' },
      { icon: '🌐', text: 'Mode hors-ligne disponible' },
    ],
    demo: {
      type: 'scan',
      lines: [
        '📷 Photo capturée…',
        '🔍 Exercice détecté : « Factorisez x² − 4 »',
        '✅ Identité remarquable : a² − b² = (a−b)(a+b)',
        '💡 Donc : x² − 4 = (x−2)(x+2)',
        '🎯 Vérification : (x−2)(x+2) = x²+2x−2x−4 = x²−4 ✓',
      ],
    },
    cta: 'Tester le Scanner',
    stats: [{ value: '< 2s', label: 'analyse' }, { value: 'OCR', label: 'manuscrit' }, { value: '0', label: 'photo perdue' }],
  },
  '/flashcards': {
    icon: CreditCard,
    emoji: '🃏',
    title: 'Flashcards & Révision',
    tagline: 'Mémorise 3× plus vite',
    subtitle: 'Répétition espacée SM-2 — la science de la mémoire à long terme, enfin gratuite.',
    accentFrom: 'hsl(262 72% 44%)',
    accentTo: 'hsl(290 65% 48%)',
    accentClass: 'text-violet-600 dark:text-violet-400',
    features: [
      { icon: '🔁', text: 'Algorithme SM-2 — révision au bon moment' },
      { icon: '📊', text: 'Statistiques de progression en temps réel' },
      { icon: '👨‍🏫', text: 'Decks enseignants vérifiés inclus' },
      { icon: '🤝', text: 'Partage de decks entre élèves' },
    ],
    demo: { type: 'flashcard', front: 'En quelle année a débuté\nla Révolution française ?', back: '1789 — Prise de la Bastille le 14 juillet.\n\nLouis XVI arrêté, fin de l\'Ancien Régime.' },
    cta: 'Créer mes flashcards',
    stats: [{ value: 'SM-2', label: 'algorithme' }, { value: '×3', label: 'rétention' }, { value: '∞', label: 'decks' }],
  },
  '/organisation': {
    icon: Calendar,
    emoji: '📅',
    title: 'Planning & Pomodoro',
    tagline: 'Organise, priorise, réussis',
    subtitle: 'Agenda scolaire intégré, minuteur Pomodoro et to-do list intelligente en un seul endroit.',
    accentFrom: 'hsl(20 85% 40%)',
    accentTo: 'hsl(38 88% 46%)',
    accentClass: 'text-orange-600 dark:text-orange-400',
    features: [
      { icon: '📆', text: 'Planning hebdomadaire personnalisé' },
      { icon: '⏱️', text: 'Minuteur Pomodoro 25/5 min intégré' },
      { icon: '✅', text: 'To-do list intelligente avec priorités' },
      { icon: '🔔', text: 'Rappels de révision automatiques' },
    ],
    demo: {
      type: 'schedule',
      rows: [
        { day: 'Lun 23', tasks: ['📚 Maths — Fonctions (45 min)', '📖 Histoire Ch.3 (30 min)'] },
        { day: 'Mar 24', tasks: ['🔬 SVT — Génétique (40 min)', '✏️ Anglais (20 min)'] },
        { day: 'Mer 25', tasks: ['🎯 Examen blanc Physique (2h)', '🃏 Flashcards Chimie (15 min)'] },
      ],
    },
    cta: 'Créer mon planning',
    stats: [{ value: '25min', label: 'Pomodoro' }, { value: '↑38%', label: 'productivité' }, { value: '7j', label: 'planning' }],
  },
  '/maths-sciences': {
    icon: Calculator,
    emoji: '🧮',
    title: 'Maths & Sciences',
    tagline: 'Calculatrice scientifique + formules',
    subtitle: 'Résolution d\'équations pas à pas, formules physique-chimie, tableau périodique. Tout en un.',
    accentFrom: 'hsl(200 80% 35%)',
    accentTo: 'hsl(220 75% 44%)',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
    features: [
      { icon: '🔢', text: 'Calculatrice scientifique complète' },
      { icon: '📐', text: 'Résolution d\'équations pas à pas' },
      { icon: '⚗️', text: 'Formulaire Physique-Chimie officiel' },
      { icon: '🧪', text: 'Tableau périodique interactif' },
    ],
    demo: {
      type: 'formula',
      input: 'x² + 3x − 4 = 0',
      steps: ['Δ = b² − 4ac = 9 + 16 = 25', '√Δ = 5', 'x = (−3 ± 5) / 2'],
      result: 'x₁ = 1  ·  x₂ = −4',
    },
    cta: 'Ouvrir Maths & Sciences',
    stats: [{ value: '200+', label: 'formules' }, { value: '118', label: 'éléments' }, { value: 'Bac+', label: 'niveau max' }],
  },
  '/linguistique': {
    icon: Languages,
    emoji: '📝',
    title: 'Outils Linguistiques',
    tagline: 'Conjugueur · Correcteur · Synonymes',
    subtitle: 'Maîtrise le français et les langues — conjugueur, correcteur, traducteur et dictionnaire.',
    accentFrom: 'hsl(340 72% 38%)',
    accentTo: 'hsl(10 78% 44%)',
    accentClass: 'text-rose-600 dark:text-rose-400',
    features: [
      { icon: '📚', text: 'Conjugueur complet — tous les temps' },
      { icon: '✍️', text: 'Correcteur orthographique & grammatical' },
      { icon: '🌍', text: 'Traducteur multilingue intégré' },
      { icon: '🔍', text: 'Dictionnaire des synonymes' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: 'Conjuguer "aller" au subjonctif présent', a: 'que j\'aille · que tu ailles · qu\'il aille\nque nous allions · que vous alliez · qu\'ils aillent' },
        { q: 'Synonymes de "magnifique"', a: 'splendide · somptueux · grandiose · éblouissant · sublime · majestueux' },
      ],
    },
    cta: 'Utiliser les outils Langue',
    stats: [{ value: '400k+', label: 'mots' }, { value: '22', label: 'temps' }, { value: '40+', label: 'langues' }],
  },
  '/notes': {
    icon: FileText,
    emoji: '📓',
    title: 'Notes intelligentes',
    tagline: 'Ton wiki scolaire personnel',
    subtitle: 'Prends tes notes en cours, organise-les par matière, recherche en un clic. Export PDF.',
    accentFrom: 'hsl(45 90% 38%)',
    accentTo: 'hsl(30 85% 44%)',
    accentClass: 'text-amber-600 dark:text-amber-400',
    features: [
      { icon: '🗂️', text: 'Organisation par matière et chapitre' },
      { icon: '🔍', text: 'Recherche instantanée dans toutes les notes' },
      { icon: '📤', text: 'Export PDF en 1 clic' },
      { icon: '☁️', text: 'Synchronisation sur tous tes appareils' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '📐 Maths — Dérivées', a: '• (xⁿ)′ = nxⁿ⁻¹\n• (sin x)′ = cos x\n• (eˣ)′ = eˣ\n• (ln x)′ = 1/x' },
        { q: '📖 Français — Figures de style', a: '• Métaphore : comparaison sans "comme"\n• Anaphore : répétition en début de phrase\n• Hyperbole : exagération intentionnelle' },
      ],
    },
    cta: 'Créer mes notes',
    stats: [{ value: '∞', label: 'notes' }, { value: 'PDF', label: 'export' }, { value: 'sync', label: 'multi-appareils' }],
  },
  '/quiz': {
    icon: HelpCircle,
    emoji: '🎯',
    title: 'Quiz interactif',
    tagline: 'Teste-toi — score instantané',
    subtitle: 'Crée tes propres quiz ou utilise la bibliothèque vérifiée par des enseignants.',
    accentFrom: 'hsl(142 60% 32%)',
    accentTo: 'hsl(162 58% 38%)',
    accentClass: 'text-green-600 dark:text-green-400',
    features: [
      { icon: '✅', text: 'Quiz vérifiés par des enseignants' },
      { icon: '📊', text: 'Score et corrections détaillées' },
      { icon: '⚡', text: 'Mode révision rapide 10 questions' },
      { icon: '📈', text: 'Historique de résultats' },
    ],
    demo: {
      type: 'quiz',
      question: 'Quelle est la dérivée de sin(x) ?',
      options: ['−cos(x)', 'cos(x)', '1/sin(x)', '−sin(x)'],
      correct: 1,
    },
    cta: 'Créer mon quiz',
    stats: [{ value: '500+', label: 'quiz dispo' }, { value: '<1s', label: 'correction' }, { value: '100%', label: 'gratuit' }],
  },
  '/carte-mentale': {
    icon: GitBranch,
    emoji: '🗺️',
    title: 'Carte mentale',
    tagline: 'Visualise — mémorise — comprends',
    subtitle: 'Structure visuellement tes cours en cartes mentales. Navigation zoomable, export image.',
    accentFrom: 'hsl(180 65% 30%)',
    accentTo: 'hsl(200 70% 38%)',
    accentClass: 'text-teal-600 dark:text-teal-400',
    features: [
      { icon: '🌿', text: 'Structure hiérarchique par chapitre' },
      { icon: '🎨', text: 'Couleurs et icônes personnalisables' },
      { icon: '🔎', text: 'Navigation zoomable' },
      { icon: '📤', text: 'Export image haute résolution' },
    ],
    demo: {
      type: 'mindmap',
      root: '🌿 Révolution française',
      branches: [
        { label: '📌 Causes', children: ['Crise éco.', 'Inégalités', 'Éclairés'] },
        { label: '⚡ 1789', children: ['Bastille', 'DDHC', 'États Gén.'] },
        { label: '🔮 Conséquences', children: ['République', 'Terreur', 'Empire'] },
      ],
    },
    cta: 'Créer ma carte mentale',
    stats: [{ value: 'visuel', label: 'apprentissage' }, { value: 'zoom', label: 'navigation' }, { value: 'PNG', label: 'export' }],
  },
  '/motivation': {
    icon: Trophy,
    emoji: '🏆',
    title: 'Motivation & Progrès',
    tagline: 'XP · Badges · Classement',
    subtitle: 'Transforme tes révisions en jeu — gagne des XP, débloque des badges, monte de niveau.',
    accentFrom: 'hsl(38 90% 40%)',
    accentTo: 'hsl(25 85% 46%)',
    accentClass: 'text-amber-600 dark:text-amber-400',
    features: [
      { icon: '⭐', text: 'Système XP et niveaux progressifs' },
      { icon: '🏅', text: '20+ badges à débloquer' },
      { icon: '🔥', text: 'Série quotidienne — ne perds pas ta flamme' },
      { icon: '👥', text: 'Classement communauté hebdomadaire' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '🌟 Ton profil aujourd\'hui', a: 'Niveau 7 — Explorateur Avancé\n2 450 XP · Prochain palier : 3 000 XP (+550)' },
        { q: '🔥 Série actuelle : 12 jours', a: '🏅 Curiosité · Assiduité · Matheux · Littéraire\n🎯 Défi du jour : Révise 10 flashcards → +50 XP' },
      ],
    },
    cta: 'Commencer à gagner des XP',
    stats: [{ value: '20+', label: 'badges' }, { value: 'XP', label: 'quotidien' }, { value: '🔥', label: 'série' }],
  },
  '/focus': {
    icon: Timer,
    emoji: '🎯',
    title: 'Mode Deep Work',
    tagline: 'Concentration maximale',
    subtitle: 'Entre en zone de focus total — minuteur plein écran, ambiances sonores, 0 distraction.',
    accentFrom: 'hsl(240 60% 32%)',
    accentTo: 'hsl(260 65% 42%)',
    accentClass: 'text-indigo-600 dark:text-indigo-400',
    features: [
      { icon: '⏱️', text: 'Minuteur plein écran — 25 à 90 min' },
      { icon: '🎵', text: 'Ambiances sonores — pluie, forêt, lo-fi' },
      { icon: '📵', text: 'Notifications bloquées automatiquement' },
      { icon: '📊', text: 'Suivi du temps de travail total' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '⏱️ Session en cours', a: '24:32 restantes\n🎵 Pluie douce · Mode Focus\n📵 Notifications bloquées' },
        { q: '📊 Cette semaine', a: 'Lundi 45 min · Mardi 1h20 · Mercredi 50 min\nTotal : 3h35 de travail profond ✨' },
      ],
    },
    cta: 'Lancer une session Focus',
    stats: [{ value: '25→90', label: 'minutes' }, { value: '×2', label: 'productivité' }, { value: '0', label: 'distraction' }],
  },
  '/examen': {
    icon: Timer,
    emoji: '📋',
    title: 'Mode Examen',
    tagline: 'Entraîne-toi comme au vrai bac',
    subtitle: 'Simule les conditions du bac ou du brevet. Minuteur officiel, brouillon, anti-stress.',
    accentFrom: 'hsl(0 65% 32%)',
    accentTo: 'hsl(15 70% 38%)',
    accentClass: 'text-red-600 dark:text-red-400',
    features: [
      { icon: '⏳', text: 'Minuteur officiel — 2h, 3h ou 4h' },
      { icon: '🖥️', text: 'Mode plein écran strict — sans aide' },
      { icon: '📄', text: 'Brouillon intégré — zone de calcul' },
      { icon: '📊', text: 'Bilan de session et conseils ciblés' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '📋 Bac Maths — Terminale', a: '⏳ Durée : 4h00\n📄 Calculatrice autorisée\n🔒 Mode examen actif\n📝 Brouillon disponible' },
      ],
    },
    cta: 'Simuler mon examen',
    stats: [{ value: '4h', label: 'durée max' }, { value: 'strict', label: 'mode bac' }, { value: '✅', label: 'bilan' }],
  },
  '/communaute': {
    icon: Users,
    emoji: '💬',
    title: "Forum d'entraide",
    tagline: 'Pose, aide, progresse ensemble',
    subtitle: 'Communauté bienveillante — pose tes questions, aide les autres, gagne des badges.',
    accentFrom: 'hsl(210 70% 36%)',
    accentTo: 'hsl(230 65% 44%)',
    accentClass: 'text-blue-600 dark:text-blue-400',
    features: [
      { icon: '💬', text: 'Forum par matière et par niveau' },
      { icon: '👍', text: 'Système de votes et de meilleures réponses' },
      { icon: '🏅', text: 'Badges de contribution' },
      { icon: '🛡️', text: 'Modération active — espace sécurisé' },
    ],
    demo: {
      type: 'thread',
      posts: [
        { author: 'Léa · Terminale', text: 'Besoin d\'aide pour les intégrales — je comprends pas la méthode de substitution 😅', votes: 12 },
        { author: 'Thomas · Prépa', text: 'Tu poses u = g(x), du = g\'(x)dx — puis tu substitues dans l\'intégrale. Exemple : ∫2x·cos(x²)dx…', votes: 28 },
        { author: 'Sofia · BTS', text: 'Super explication Thomas ! Je rajoute : pense à revenir à x à la fin 😉', votes: 9 },
      ],
    },
    cta: 'Rejoindre la communauté',
    stats: [{ value: 'actif', label: '24h/24' }, { value: '✅', label: 'modéré' }, { value: '0', label: 'toxicité' }],
  },
  '/visio': {
    icon: Users,
    emoji: '🎥',
    title: 'Classe virtuelle',
    tagline: 'Révise à plusieurs, en HD',
    subtitle: 'Visio jusqu\'à 10 élèves, tableau blanc partagé, documents en temps réel.',
    accentFrom: 'hsl(190 72% 32%)',
    accentTo: 'hsl(210 68% 40%)',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
    features: [
      { icon: '🎥', text: 'Visio HD jusqu\'à 10 personnes' },
      { icon: '🖊️', text: 'Tableau blanc collaboratif en direct' },
      { icon: '📄', text: 'Partage de documents et fiches' },
      { icon: '🎬', text: 'Enregistrement de session' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '👥 Groupe Maths Terminale', a: '4 participants · 🎥 Vidéo HD active\n📋 Tableau blanc partagé — corrigé en direct\n⏱️ Session : 45 min' },
      ],
    },
    cta: 'Créer une classe virtuelle',
    stats: [{ value: '10', label: 'élèves max' }, { value: 'HD', label: 'vidéo' }, { value: '∞', label: 'durée' }],
  },
  '/ressources': {
    icon: BookMarked,
    emoji: '📚',
    title: 'Ressources pédagogiques',
    tagline: 'Fiches · Annales · Méthodes',
    subtitle: 'Fiches méthode par matière, annales corrigées, guides de révision — du CP au Bac+5.',
    accentFrom: 'hsl(155 65% 30%)',
    accentTo: 'hsl(175 60% 38%)',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    features: [
      { icon: '📄', text: 'Fiches méthode par matière et par niveau' },
      { icon: '🗓️', text: 'Annales corrigées — 5 dernières années' },
      { icon: '🔖', text: 'Guides de révision CP → Bac+5' },
      { icon: '🔗', text: 'Ressources officielles Éduscol intégrées' },
    ],
    demo: {
      type: 'generic',
      lines: [
        { q: '📐 Maths — Lycée', a: '• Dérivées et intégrales\n• Fonctions logarithme et exponentielle\n• Probabilités et statistiques\n• Géométrie dans l\'espace' },
        { q: '📖 Français — Collège', a: '• Méthode dissertation en 3 parties\n• Lecture analytique — commentaire composé\n• Conjugaison — tous les temps\n• Orthographe — règles clés' },
      ],
    },
    cta: 'Accéder aux ressources',
    stats: [{ value: '500+', label: 'fiches' }, { value: '5 ans', label: 'annales' }, { value: 'CP+5', label: 'niveaux' }],
  },
};

// ─── Engagements clés ─────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { value: '100 %', label: 'Gratuit à vie', icon: Zap, color: 'text-amber-500' },
  { value: '0 pub', label: 'Sans publicité', icon: Eye, color: 'text-emerald-500' },
  { value: 'RGPD', label: 'Données protégées', icon: ShieldCheck, color: 'text-blue-500' },
  { value: '< 30 s', label: 'Inscription', icon: Rocket, color: 'text-violet-500' },
];

// ─── Widget Flashcard animé ───────────────────────────────────────────────────
const FlashcardWidget: React.FC<{ front: string; back: string }> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [interacted, setInteracted] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-sm cursor-pointer select-none"
        style={{ perspective: '900px' }}
        onClick={() => { setFlipped(f => !f); setRevealed(true); setInteracted(true); }}
        role="button"
        aria-label={flipped ? 'Voir la question' : 'Voir la réponse'}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && (setFlipped(f => !f), setInteracted(true))}
      >
        {/* Pulsing hint — disparaît au premier clic */}
        {!interacted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white text-violet-700 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg animate-bounce pointer-events-none select-none">
            👆 Clique pour retourner
          </div>
        )}
        <div
          className="relative w-full h-44 transition-all duration-500"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Recto */}
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-400/40 bg-gradient-to-br from-violet-600 to-violet-800 p-5 flex flex-col items-center justify-center text-center shadow-xl"
            style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Question</p>
            <p className="text-white font-bold text-base md:text-lg text-balance leading-snug whitespace-pre-line">{front}</p>
            <p className="text-white/50 text-xs mt-4 flex items-center gap-1"><Zap className="w-3 h-3" aria-hidden="true" /> Clique pour retourner</p>
          </div>
          {/* Verso */}
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 flex flex-col items-center justify-center text-center shadow-xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Réponse</p>
            <p className="text-white font-semibold text-sm md:text-base text-balance leading-relaxed whitespace-pre-line">{back}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        {[{ label: '😕 À revoir', bg: 'bg-red-500/15 text-red-400 border-red-400/30' }, { label: '🤔 Moyen', bg: 'bg-amber-500/15 text-amber-400 border-amber-400/30' }, { label: '✅ Connu !', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30' }].map(b => (
          <button key={b.label} type="button" disabled={!revealed}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all', b.bg, !revealed && 'opacity-30 cursor-not-allowed')}>
            {b.label}
          </button>
        ))}
      </div>
      {!revealed && <p className="text-xs text-muted-foreground">Retourne la carte pour noter ta maîtrise</p>}
    </div>
  );
};

// ─── Widget Steps animés ──────────────────────────────────────────────────────
const StepsWidget: React.FC<{ question: string; steps: string[] }> = ({ question, steps }) => {
  const [shown, setShown] = useState(1);
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
        <p className="text-xs text-muted-foreground font-semibold mb-0.5">Question</p>
        <p className="text-sm font-bold text-foreground">{question}</p>
      </div>
      <div className="flex flex-col gap-2">
        {steps.slice(0, shown).map((step, i) => (
          <div key={i} className={cn('flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-mono', 'bg-muted/50 border-border animate-fade-up')}>
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">{i+1}</span>
            <span className="text-foreground leading-relaxed">{step}</span>
          </div>
        ))}
      </div>
      {shown < steps.length ? (
        <button type="button" onClick={() => setShown(s => s + 1)}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors self-start px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 hover:bg-primary/12">
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          Étape suivante
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Résolu ! Inscris-toi pour des centaines d'exercices.
        </div>
      )}
    </div>
  );
};

// ─── Widget Planning ──────────────────────────────────────────────────────────
const ScheduleWidget: React.FC<{ rows: { day: string; tasks: string[] }[] }> = ({ rows }) => (
  <div className="flex flex-col gap-2">
    {rows.map(row => (
      <div key={row.day} className="flex gap-3 items-start">
        <div className="shrink-0 w-14 text-center rounded-lg bg-primary/10 border border-primary/20 py-2">
          <p className="text-[10px] font-black text-primary uppercase tracking-wide">{row.day.split(' ')[0]}</p>
          <p className="text-sm font-black text-foreground leading-none">{row.day.split(' ')[1]}</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {row.tasks.map(t => (
            <div key={t} className="text-xs text-foreground bg-muted/50 border border-border/60 rounded-lg px-3 py-2 leading-snug">{t}</div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Widget Formule ───────────────────────────────────────────────────────────
const FormulaWidget: React.FC<{ input: string; steps: string[]; result: string }> = ({ input, steps, result }) => (
  <div className="flex flex-col gap-3">
    <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 font-mono">
      <p className="text-xs text-muted-foreground mb-1">Équation à résoudre</p>
      <p className="text-base font-black text-foreground">{input}</p>
    </div>
    {steps.map((s, i) => (
      <div key={i} className="flex items-center gap-2 text-sm font-mono text-foreground/80">
        <span className="shrink-0 text-cyan-500 font-black">→</span> {s}
      </div>
    ))}
    <div className="rounded-xl bg-emerald-500/12 border border-emerald-500/25 px-4 py-3 font-mono">
      <p className="text-xs text-muted-foreground mb-1">Résultat</p>
      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{result}</p>
    </div>
  </div>
);

// ─── Widget Quiz interactif ───────────────────────────────────────────────────
const QuizWidget: React.FC<{ question: string; options: string[]; correct: number }> = ({ question, options, correct }) => {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
        <p className="text-xs text-muted-foreground mb-1 font-semibold">Question</p>
        <p className="text-sm font-bold text-foreground">{question}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correct;
          const showResult = selected !== null;
          return (
            <button key={i} type="button"
              onClick={() => selected === null && setSelected(i)}
              disabled={selected !== null}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border text-left transition-all duration-200',
                !showResult && 'bg-muted/50 border-border hover:border-green-400/50 hover:bg-green-500/8 cursor-pointer',
                showResult && isCorrect && 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
                showResult && isSelected && !isCorrect && 'bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300',
                showResult && !isSelected && !isCorrect && 'opacity-50 border-border bg-muted/20',
              )}>
              <span className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black">
                {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={cn('rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2',
          selected === correct ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25' : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25')}>
          {selected === correct ? <><CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> Bravo ! +10 XP</> : <><Lock className="w-4 h-4 shrink-0" aria-hidden="true" /> Bonne réponse : {options[correct]}</>}
        </div>
      )}
    </div>
  );
};

// ─── Widget Mind map ──────────────────────────────────────────────────────────
const MindmapWidget: React.FC<{ root: string; branches: { label: string; children: string[] }[] }> = ({ root, branches }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-extrabold shadow-md">{root}</div>
    <div className="grid grid-cols-3 gap-3 w-full">
      {branches.map(b => (
        <div key={b.label} className="flex flex-col items-center gap-1.5">
          <div className="px-2.5 py-1.5 rounded-xl bg-primary/15 border border-primary/25 text-xs font-bold text-foreground text-center text-balance">{b.label}</div>
          {b.children.map(c => (
            <div key={c} className="px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground text-center w-full">{c}</div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Widget Scan animé ────────────────────────────────────────────────────────
const ScanWidget: React.FC<{ lines: string[] }> = ({ lines }) => {
  const [shown, setShown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setShown(s => s < lines.length ? s + 1 : s), 800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lines.length]);
  return (
    <div className="rounded-2xl bg-black/80 border border-emerald-500/30 p-4 font-mono min-h-[180px] flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-amber-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-emerald-400/60 text-xs ml-2">Apprenix Scanner</span>
      </div>
      {lines.slice(0, shown).map((l, i) => (
        <p key={i} className={cn('text-sm leading-relaxed', l.startsWith('✅') || l.startsWith('💡') || l.startsWith('🎯') ? 'text-emerald-400' : l.startsWith('🔍') ? 'text-amber-400' : 'text-white/80')}>
          {l}
        </p>
      ))}
      {shown < lines.length && <span className="text-emerald-400 animate-pulse">▋</span>}
    </div>
  );
};

// ─── Widget Thread communauté ─────────────────────────────────────────────────
const ThreadWidget: React.FC<{ posts: { author: string; text: string; votes: number }[] }> = ({ posts }) => (
  <div className="flex flex-col gap-3">
    {posts.map((p, i) => (
      <div key={i} className="flex gap-3 items-start">
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-chart-1/30 border border-border flex items-center justify-center text-xs font-black text-primary">
          {p.author[0]}
        </div>
        <div className="flex-1 min-w-0 rounded-2xl border border-border/60 bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-bold text-foreground">{p.author}</p>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" /> {p.votes}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─── Widget Générique ─────────────────────────────────────────────────────────
const GenericWidget: React.FC<{ lines: { q: string; a: string }[] }> = ({ lines }) => (
  <div className="flex flex-col gap-3">
    {lines.map((line, i) => (
      <div key={i} className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-2.5 bg-muted/50 border-b border-border/40">
          <p className="text-xs font-bold text-foreground">{line.q}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line font-mono">{line.a}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─── Sélecteur de widget ──────────────────────────────────────────────────────
const DemoWidgetRenderer: React.FC<{ widget: DemoWidget }> = ({ widget }) => {
  switch (widget.type) {
    case 'flashcard': return <FlashcardWidget front={widget.front} back={widget.back} />;
    case 'steps':     return <StepsWidget question={widget.question} steps={widget.steps} />;
    case 'schedule':  return <ScheduleWidget rows={widget.rows} />;
    case 'formula':   return <FormulaWidget input={widget.input} steps={widget.steps} result={widget.result} />;
    case 'quiz':      return <QuizWidget question={widget.question} options={widget.options} correct={widget.correct} />;
    case 'mindmap':   return <MindmapWidget root={widget.root} branches={widget.branches} />;
    case 'scan':      return <ScanWidget lines={widget.lines} />;
    case 'thread':    return <ThreadWidget posts={widget.posts} />;
    case 'generic':   return <GenericWidget lines={widget.lines} />;
  }
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface GuestToolPreviewProps {
  path: string;
  pageName?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────
const GuestToolPreview: React.FC<GuestToolPreviewProps> = ({ path, pageName }) => {
  const navigate = useNavigate();
  const meta = TOOL_META[path];

  const Icon     = meta?.icon     ?? Lock;
  const title    = meta?.title    ?? pageName ?? 'Outil Apprenix';
  const tagline  = meta?.tagline  ?? 'Essaie gratuitement';
  const subtitle = meta?.subtitle ?? 'Connecte-toi pour accéder à cette fonctionnalité.';
  const emoji    = meta?.emoji    ?? '🔒';
  const features = meta?.features ?? [];
  const demo     = meta?.demo     ?? { type: 'generic' as const, lines: [] };
  const cta      = meta?.cta      ?? 'Créer mon compte gratuit';
  const stats    = meta?.stats    ?? [];
  const from     = meta?.accentFrom ?? 'hsl(221 83% 38%)';
  const to       = meta?.accentTo   ?? 'hsl(250 80% 50%)';

  const goSignup = () => navigate('/connexion?mode=inscription');
  const goLogin  = () => navigate('/connexion');

  return (
    <div className="min-h-[calc(100dvh-58px)] bg-background overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — gradient immersif, multi-écran
          Large viewport (TV/cinema/projecteur) : max-w-screen-2xl
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      >
        {/* Décors géométriques */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-white/[0.04] blur-2xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gtp-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gtp-dots)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-5 py-10 md:py-14 lg:py-16 xl:py-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/55 text-xs mb-6 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="text-white/80">{title}</span>
            <Badge className="ml-2 bg-white/20 text-white border-white/25 text-[10px] font-bold">Démo gratuite</Badge>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-14 items-start">

            {/* ── Colonne gauche — pitch ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {/* Titre */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xl">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 xl:w-10 xl:h-10 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/65 text-sm md:text-base font-bold mb-1">{emoji} {tagline}</p>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-white text-balance leading-[1.1] [text-shadow:0_2px_16px_rgba(0,0,0,0.25)]">
                    {title}
                  </h1>
                </div>
              </div>

              <p className="text-white/85 text-base md:text-lg xl:text-xl leading-relaxed text-pretty max-w-2xl [text-shadow:0_1px_4px_rgba(0,0,0,0.2)]">
                {subtitle}
              </p>

              {/* Stats rapides */}
              {stats.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {stats.map(s => (
                    <div key={s.label} className="flex flex-col items-center bg-white/15 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                      <span className="text-xl md:text-2xl font-black text-white leading-none">{s.value}</span>
                      <span className="text-[10px] text-white/60 font-medium mt-0.5 uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={goSignup}
                  className="inline-flex items-center justify-center gap-2 h-12 md:h-14 xl:h-16 px-6 md:px-8 xl:px-10 rounded-2xl bg-white text-gray-900 font-extrabold text-sm md:text-base shadow-2xl hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 transition-[transform,opacity] duration-150"
                >
                  <Rocket className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden="true" />
                  {cta} — Gratuit
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={goLogin}
                  className="inline-flex items-center justify-center gap-2 h-12 md:h-14 xl:h-16 px-6 md:px-8 rounded-2xl border-2 border-white/40 text-white font-semibold text-sm md:text-base hover:bg-white/10 transition-colors"
                >
                  Déjà inscrit(e) ?
                </button>
              </div>

              {/* Micro-preuve */}
              <p className="text-xs text-white/55 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Inscription en 30 s · Sans carte bancaire · Sans engagement
              </p>
            </div>

            {/* ── Colonne droite — démo live (desktop) ── */}
            <div className="hidden lg:flex w-[380px] xl:w-[440px] 2xl:w-[500px] shrink-0 flex-col">
              <div className="rounded-2xl bg-background/12 border border-white/20 backdrop-blur-sm overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/15 bg-white/8">
                  <div className="flex gap-1.5" aria-hidden="true">
                    {['bg-red-400', 'bg-amber-400', 'bg-green-400'].map(c => <div key={c} className={cn('w-3 h-3 rounded-full', c)} />)}
                  </div>
                  <p className="text-white/55 text-xs mx-auto">{emoji} {title}</p>
                </div>
                <div className="p-4 bg-background/95">
                  <DemoWidgetRenderer widget={demo} />
                </div>
                {/* Barre de verrouillage partiel */}
                <div className="px-4 py-3 bg-gradient-to-r from-white/8 to-white/4 border-t border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Version complète disponible après inscription</span>
                  </div>
                  <button type="button" onClick={goSignup}
                    className="shrink-0 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg border border-white/30 transition-colors whitespace-nowrap">
                    S'inscrire <ArrowRight className="w-3 h-3 inline ml-0.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          CORPS — démo mobile + fonctionnalités + social proof
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 md:py-10 space-y-8">

        {/* ── Démo live mobile (visible < lg) ── */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <p className="text-sm font-extrabold text-foreground">{emoji} Essaie en direct</p>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Interactif</Badge>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <DemoWidgetRenderer widget={demo} />
            </CardContent>
          </Card>
        </div>

        {/* ── Features + Trust en 2 colonnes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Fonctionnalités */}
          {features.length > 0 && (
            <Card className="shadow-card xl:col-span-2">
              <CardContent className="p-5">
                <h2 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  Ce que tu peux faire
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map(f => (
                    <div key={f.text} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{f.icon}</span>
                      <span className="text-sm text-foreground leading-snug text-pretty">{f.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges de confiance */}
          <div className="flex flex-col gap-3">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <b.icon className={cn('w-5 h-5', b.color)} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground leading-none">{b.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3 autres outils à découvrir ── */}
        <div>
          <p className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            Explore aussi ces outils gratuits
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { path: '/flashcards',    emoji: '🃏', label: 'Flashcards',        desc: 'Répétition espacée SM-2' },
              { path: '/aide-ia',       emoji: '🧠', label: 'Aide aux devoirs',  desc: 'Fiches méthode + IA' },
              { path: '/organisation',  emoji: '📅', label: 'Planning',          desc: 'Agenda + Pomodoro' },
            ].filter(t => t.path !== path).slice(0, 3).map(t => (
              <Link key={t.path} to={t.path}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
                <span className="text-2xl shrink-0" aria-hidden="true">{t.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground leading-tight">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA final — large, immersif ── */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-10 xl:p-14 text-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.06] blur-xl" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="flex -space-x-2" aria-hidden="true">
                {['bg-amber-400', 'bg-blue-400', 'bg-emerald-400', 'bg-violet-400'].map(c => (
                  <div key={c} className={cn('w-9 h-9 rounded-full border-2 border-white/40', c)} />
                ))}
                <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold">+</div>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-white text-balance mb-3 [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]">
              Prêt(e) à utiliser {title} en entier ?
            </h2>
            <p className="text-white/80 text-sm md:text-base xl:text-lg mb-6 text-pretty max-w-xl mx-auto">
              Rejoins des milliers d'élèves qui révisent gratuitement avec Apprenix.
              Inscription en 30 secondes, aucune carte requise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={goSignup}
                className="inline-flex items-center justify-center gap-2 h-12 md:h-14 xl:h-16 px-7 md:px-9 xl:px-12 rounded-2xl bg-white text-gray-900 font-extrabold text-sm md:text-base xl:text-lg shadow-2xl hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 transition-[transform,opacity]"
              >
                <Award className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden="true" />
                Créer mon compte gratuit
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goLogin}
                className="inline-flex items-center justify-center h-12 md:h-14 xl:h-16 px-6 md:px-8 xl:px-10 rounded-2xl border-2 border-white/40 text-white font-semibold text-sm md:text-base hover:bg-white/10 transition-colors"
              >
                Se connecter
              </button>
            </div>
            <p className="text-xs text-white/50 mt-4">
              Sans engagement · Sans pub · Données protégées RGPD
            </p>
          </div>
        </div>

        {/* ── Navigation secondaire ── */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          Explore librement →{' '}
          {[
            { to: '/', label: 'Accueil' },
            { to: '/ressources', label: 'Fiches méthode' },
            { to: '/maths-sciences', label: 'Maths' },
            { to: '/flashcards', label: 'Flashcards' },
          ].filter(l => l.to !== path).map((l, i, arr) => (
            <React.Fragment key={l.to}>
              <Link to={l.to} className="text-primary hover:underline font-medium">{l.label}</Link>
              {i < arr.length - 1 && <span className="mx-1 text-border">·</span>}
            </React.Fragment>
          ))}
        </p>

      </div>

      {/* ── Sticky CTA mobile bas de page ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-2 items-center shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground truncate">Gratuit · Inscription 30 s</p>
        </div>
        <button
          type="button"
          onClick={goSignup}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl font-extrabold text-xs text-primary-foreground shadow-md active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <Rocket className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          S'inscrire — Gratuit
        </button>
      </div>
      {/* Espace pour le sticky bar mobile */}
      <div className="lg:hidden h-16" aria-hidden="true" />

    </div>
  );
};

export default GuestToolPreview;
