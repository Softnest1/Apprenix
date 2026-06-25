// ─── Constantes partagées entre les pages ────────────────────────────────────
// Source unique de vérité pour les listes réutilisées dans plusieurs composants.

import type { SchoolLevel, Subject } from '@/types/types';

/** Matières scolaires — ordre canonique (alphanumérique par domaine) */
export const SCHOOL_SUBJECTS: Subject[] = [
  'Maths',
  'Physique',
  'Chimie',
  'SVT',
  'Histoire',
  'Géographie',
  'Français',
  'Anglais',
  'Espagnol',
  'Allemand',
  'Philosophie',
  'Économie/SES',
  'NSI/Informatique',
];

/** Niveaux scolaires — du CP aux Grandes Écoles + dispositifs adaptés */
export const SCHOOL_LEVELS: SchoolLevel[] = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6e', '5e', '4e', '3e',
  '2nde', '1ère', 'Terminale',
  'BTS', 'Licence', 'Master', 'Grandes Écoles',
  'ULIS', 'SEGPA',
];
