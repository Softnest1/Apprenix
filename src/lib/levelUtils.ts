// ─── Paliers XP partagés — source unique de vérité ───────────────────────────
export const XP_LEVELS = [
  { level: 1, name: 'Débutant',  minXp: 0,    icon: '🌱' },
  { level: 2, name: 'Apprenti',  minXp: 200,  icon: '📚' },
  { level: 3, name: 'Étudiant',  minXp: 500,  icon: '🎓' },
  { level: 4, name: 'Érudit',    minXp: 1000, icon: '🔬' },
  { level: 5, name: 'Expert',    minXp: 2000, icon: '⭐' },
  { level: 6, name: 'Maître',    minXp: 3500, icon: '🏆' },
  { level: 7, name: 'Légende',   minXp: 5000, icon: '🌟' },
] as const;

/** Calcule le niveau actuel, les XP restants et le pourcentage de progression */
export function getXpInfo(xpPoints: number) {
  const current = [...XP_LEVELS].reverse().find(l => xpPoints >= l.minXp) ?? XP_LEVELS[0];
  const next    = XP_LEVELS.find(l => l.minXp > xpPoints);
  const xpToNext = next ? next.minXp - xpPoints : 0;
  const progress = next
    ? ((xpPoints - current.minXp) / (next.minXp - current.minXp)) * 100
    : 100;
  return { current, next, xpToNext, progress: Math.min(progress, 100) };
}

// Utilitaires de filtrage par niveau scolaire
import type { SchoolLevel } from '@/types/types';

export type LevelCategory = 'primaire' | 'college' | 'lycee' | 'superieur' | 'adapte';

export const getLevelCategory = (level: SchoolLevel): LevelCategory => {
  if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(level)) return 'primaire';
  if (['6e', '5e', '4e', '3e'].includes(level)) return 'college';
  if (['2nde', '1\u00e8re', 'Terminale'].includes(level)) return 'lycee';
  if (['ULIS', 'SEGPA'].includes(level)) return 'adapte';
  return 'superieur';
};

export const getSubjectsForLevel = (level: SchoolLevel): string[] => {
  const cat = getLevelCategory(level);
  if (cat === 'primaire') return ['Maths', 'Fran\u00e7ais', 'Histoire', 'G\u00e9ographie'];
  if (cat === 'college') return ['Maths', 'Fran\u00e7ais', 'Anglais', 'Histoire', 'G\u00e9ographie', 'Physique', 'Chimie', 'SVT', 'Espagnol', 'Allemand'];
  if (cat === 'lycee') return ['Maths', 'Physique', 'Chimie', 'SVT', 'Histoire', 'G\u00e9ographie', 'Fran\u00e7ais', 'Anglais', 'Espagnol', 'Allemand', 'Philosophie', '\u00c9conomie/SES', 'NSI/Informatique'];
  if (cat === 'adapte') return ['Lecture', 'Calcul', 'Fran\u00e7ais', 'Vie quotidienne', 'Vie sociale', 'Orientation', 'Arts plastiques', '\u00c9ducation physique'];
  return ['Maths', 'Physique', 'Chimie', 'SVT', 'Histoire', 'Anglais', 'Espagnol', 'Allemand', 'Philosophie', '\u00c9conomie/SES', 'NSI/Informatique'];
};

export const getTextTypesForLevel = (level: SchoolLevel): string[] => {
  const cat = getLevelCategory(level);
  if (cat === 'primaire') return ['R\u00e9sum\u00e9', 'R\u00e9daction', 'Email formel'];
  if (cat === 'college') return ['R\u00e9sum\u00e9', 'R\u00e9daction', 'Email formel', 'Lettre de motivation', 'Commentaire de texte'];
  if (cat === 'lycee') return ['Dissertation', 'Commentaire de texte', 'Synth\u00e8se', 'R\u00e9sum\u00e9', 'Email formel', 'Lettre de motivation'];
  if (cat === 'adapte') return ['R\u00e9sum\u00e9 simple', 'Message', 'Liste', 'Petite r\u00e9daction'];
  return ['Dissertation', 'Commentaire de texte', 'Synth\u00e8se', 'R\u00e9sum\u00e9', 'Email formel', 'Lettre de motivation', 'Rapport de stage', 'Note de synth\u00e8se'];
};

export const getMathsFormulaTagsForLevel = (level: SchoolLevel): string[] => {
  const cat = getLevelCategory(level);
  if (cat === 'primaire') return ['base'];
  if (cat === 'college') return ['base', 'college'];
  if (cat === 'lycee') return ['base', 'college', 'lycee'];
  if (cat === 'adapte') return ['base'];
  return ['base', 'college', 'lycee', 'superieur'];
};

export const getCompatibleAnnaleLevels = (level: SchoolLevel): string[] => {
  const cat = getLevelCategory(level);
  if (cat === 'primaire') return ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  if (cat === 'college') return ['6e', '5e', '4e', '3e'];
  if (cat === 'lycee') return ['2nde', '1\u00e8re', 'Terminale'];
  if (cat === 'adapte') return ['ULIS', 'SEGPA'];
  return ['BTS', 'Licence', 'Master', 'Grandes \u00c9coles', 'Terminale'];
};

export const getLevelCategoryLabel = (level: SchoolLevel): string => {
  const labels: Record<LevelCategory, string> = {
    primaire: '\u00c9cole primaire',
    college: 'Coll\u00e8ge',
    lycee: 'Lyc\u00e9e',
    superieur: 'Sup\u00e9rieur',
    adapte: 'Dispositif adapt\u00e9 (ULIS / SEGPA)',
  };
  return labels[getLevelCategory(level)];
};

export interface LevelConfig {
  emoji: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  ctaPath: string;
  secondaryCtaLabel: string;
  secondaryCtaPath: string;
  priorityTools: { path: string; badge?: string }[];
  quickSubjects: string[];
  tip: string;
  examLabel: string | null;
}

const LEVEL_CONFIGS: Record<LevelCategory, LevelConfig> = {
  primaire: {
    emoji: '\ud83c\udfeb',
    heroTitle: 'Des bases solides pour progresser',
    heroSubtitle: "Pose tes questions à l'assistant, comprends tes exercices de Maths et de Français, et avance étape par étape dans ton programme.",
    ctaLabel: 'Poser une question',
    ctaPath: '/aide-ia',
    secondaryCtaLabel: 'Voir mes outils',
    secondaryCtaPath: '/ressources',
    priorityTools: [
      { path: '/aide-ia', badge: 'Essentiel' },
      { path: '/scanner', badge: 'Pratique' },
      { path: '/linguistique', badge: 'Utile' },
      { path: '/organisation', badge: 'Bon r\u00e9flexe' },
    ],
    quickSubjects: ['Maths', 'Fran\u00e7ais', 'Histoire', 'G\u00e9ographie'],
    tip: 'Conseil\u00a0: commence chaque jour en posant une question sur ce que tu n\'as pas compris en classe.',
    examLabel: null,
  },
  college: {
    emoji: '\ud83d\udcda',
    heroTitle: 'Pr\u00e9pare ton Brevet avec m\u00e9thode',
    heroSubtitle: 'R\u00e9vise tes mati\u00e8res, ma\u00eetrise les techniques du Brevet et organise ton travail gr\u00e2ce \u00e0 des outils gratuits et complets.',
    ctaLabel: 'Pr\u00e9parer le Brevet',
    ctaPath: '/ressources',
    secondaryCtaLabel: 'Aide aux devoirs',
    secondaryCtaPath: '/aide-ia',
    priorityTools: [
      { path: '/ressources', badge: 'Brevet' },
      { path: '/aide-ia', badge: 'Devoirs' },
      { path: '/maths-sciences', badge: 'Calculs' },
      { path: '/organisation', badge: 'Planning' },
    ],
    quickSubjects: ['Maths', 'Fran\u00e7ais', 'Histoire', 'Physique', 'Anglais', 'SVT'],
    tip: 'Conseil\u00a0: note chaque soir 3 choses apprises en cours dans ton agenda pour mieux les retenir.',
    examLabel: 'Brevet',
  },
  lycee: {
    emoji: '\ud83c\udf93',
    heroTitle: 'D\u00e9croche ton Bac avec m\u00e9thode',
    heroSubtitle: 'Dissertations, annales, fiches de r\u00e9vision, assistant Apprenix et planning intelligent \u2014 tout ce qu\'il te faut pour r\u00e9ussir.',
    ctaLabel: 'Pr\u00e9parer le Bac',
    ctaPath: '/ressources',
    secondaryCtaLabel: 'Aide aux devoirs',
    secondaryCtaPath: '/aide-ia',
    priorityTools: [
      { path: '/ressources', badge: 'Bac' },
      { path: '/aide-ia', badge: 'Dissertation' },
      { path: '/linguistique', badge: 'R\u00e9daction' },
      { path: '/tableau-de-bord', badge: 'Streaks' },
    ],
    quickSubjects: ['Maths', 'Fran\u00e7ais', 'Philosophie', 'Histoire', 'Physique', 'Anglais'],
    tip: 'M\u00e9thode\u00a0: 1 fiche de r\u00e9vision par chapitre + 1 annale corrig\u00e9e par semaine = progression garantie.',
    examLabel: 'Bac',
  },
  superieur: {
    emoji: '\ud83c\udfd7\ufe0f',
    heroTitle: 'Ma\u00eetrisez vos \u00e9tudes sup\u00e9rieures',
    heroSubtitle: 'Synth\u00e8ses, rapports, organisation avanc\u00e9e, outils scientifiques et assistant Apprenix \u2014 la plateforme pour les \u00e9tudiants exigeants.',
    ctaLabel: 'Organiser mes r\u00e9visions',
    ctaPath: '/organisation',
    secondaryCtaLabel: 'Assistant avanc\u00e9',
    secondaryCtaPath: '/aide-ia',
    priorityTools: [
      { path: '/organisation', badge: 'Priorit\u00e9' },
      { path: '/aide-ia', badge: 'Analyse' },
      { path: '/maths-sciences', badge: 'Formules' },
      { path: '/linguistique', badge: 'Synth\u00e8se' },
    ],
    quickSubjects: ['Maths', 'Philosophie', '\u00c9conomie/SES', 'Anglais', 'Physique', 'NSI/Informatique'],
    tip: 'Technique Pomodoro\u00a0: 25\u00a0min de travail intense + 5\u00a0min de pause = meilleure concentration et r\u00e9tention.',
    examLabel: 'Examens',
  },
  adapte: {
    emoji: '\ud83d\udc9a',
    heroTitle: 'Ton espace adapt\u00e9 ULIS\u00a0/ SEGPA',
    heroSubtitle: 'Des explications en mots simples, des exercices \u00e9tape par \u00e9tape et des outils pens\u00e9s pour toi. Tu avances \u00e0 ton rythme, sans pression.',
    ctaLabel: 'Aide aux devoirs adapt\u00e9e',
    ctaPath: '/aide-ia',
    secondaryCtaLabel: 'Ressources inclusion',
    secondaryCtaPath: '/inclusion',
    priorityTools: [
      { path: '/aide-ia',      badge: 'Mode ULIS\u2005💚' },
      { path: '/flashcards',   badge: 'Visuelles' },
      { path: '/organisation', badge: 'Emploi du temps' },
      { path: '/inclusion',    badge: 'Mes droits' },
    ],
    quickSubjects: ['Lecture', 'Calcul', 'Fran\u00e7ais', 'Vie quotidienne'],
    tip: 'Astuce\u00a0: dans l\u2019aide aux devoirs, active le \u00ab\u00a0Mode ULIS\u2009/\u2009SEGPA\u00a0\u00bb pour avoir des r\u00e9ponses en phrases courtes et \u00e9tapes num\u00e9rot\u00e9es. 💚',
    examLabel: null,
  },
};

export const getLevelConfig = (level: SchoolLevel): LevelConfig =>
  LEVEL_CONFIGS[getLevelCategory(level)];

export const LEVEL_GROUPS: { label: string; levels: SchoolLevel[] }[] = [
  { label: '\u00c9cole primaire', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { label: 'Coll\u00e8ge', levels: ['6e', '5e', '4e', '3e'] },
  { label: 'Lyc\u00e9e', levels: ['2nde', '1\u00e8re', 'Terminale'] },
  { label: 'Sup\u00e9rieur', levels: ['BTS', 'Licence', 'Master', 'Grandes \u00c9coles'] },
  { label: '♿ ULIS & SEGPA', levels: ['ULIS', 'SEGPA'] },
];
