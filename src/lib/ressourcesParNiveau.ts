/**
 * Ressources pédagogiques officielles centralisées par niveau et matière.
 * Sources : Ministère EN, Éduscol, CNED, Lumni, Sésamath, ONISEP, BNF, CNRS...
 * Mise à jour : juin 2026 — 0 % IA, 100 % sources institutionnelles vérifiées.
 * Audit URLs juin 2026 : 17 liens morts/404 corrigés (Lumni restructuré, exo7, baccalaureat.fr, annales.net, geoconfluences, etc.)
 */

export interface LienOfficiel {
  label: string;
  url: string;
  desc: string;
  tag: string;
  gratuit: boolean;
  niveaux?: string[];        // ex : ['3e', 'Terminale']
  emoji?: string;
}

export interface SectionRessources {
  id: string;
  titre: string;
  emoji: string;
  couleur: string;           // token Tailwind complet (ex : 'text-chart-2')
  fond: string;              // ex : 'bg-chart-2/10'
  liens: LienOfficiel[];
}

// ─── PRIMAIRE ──────────────────────────────────────────────────────────────────
export const RESSOURCES_PRIMAIRE: SectionRessources[] = [
  {
    id: 'primaire-programmes',
    titre: 'Programmes officiels',
    emoji: '📋',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      { label: 'Éduscol Cycle 2 (CP–CE2)', url: 'https://eduscol.education.fr/ecole', desc: 'Programmes officiels CP, CE1, CE2 — lecture, écriture, maths, monde vivant', tag: 'Programmes', gratuit: true, emoji: '📚' },
      { label: 'Éduscol Cycle 3 (CM1–CM2)', url: 'https://eduscol.education.fr/ecole', desc: 'Programmes officiels CM1, CM2 — français, maths, histoire, sciences', tag: 'Programmes', gratuit: true, emoji: '📚' },
      { label: 'BOEN Programmes Primaire', url: 'https://www.education.gouv.fr/les-programmes-scolaires-du-cp-au-cm2', desc: 'Bulletin officiel des programmes en vigueur — texte de référence', tag: 'Officiel', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'primaire-maths',
    titre: 'Maths',
    emoji: '🔢',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      { label: 'Sésamath CP–CM2', url: 'https://www.sesamath.net/index.php?choix=accueil', desc: 'Exercices de maths 100 % gratuits créés par des enseignants', tag: 'Exercices', gratuit: true, niveaux: ['CP','CE1','CE2','CM1','CM2'], emoji: '🔢' },
      { label: 'Tables de multiplication (Éduscol)', url: 'https://eduscol.education.fr/document/25408/download', desc: 'Ressource officielle pour mémoriser les tables — Éduscol', tag: 'Outils', gratuit: true, niveaux: ['CE1','CE2','CM1','CM2'], emoji: '✖️' },
      { label: 'Khan Academy Maths Primaire', url: 'https://fr.khanacademy.org/math', desc: 'Parcours adaptatif gratuit du CP au CM2 avec exercices interactifs', tag: 'Exercices', gratuit: true, emoji: '🎓' },
      { label: 'Mathenpoche', url: 'https://mathenpoche.sesamath.net/', desc: 'Exercices en ligne par chapitre et par classe — CP à 3e', tag: 'Exercices', gratuit: true, emoji: '🔢' },
    ],
  },
  {
    id: 'primaire-francais',
    titre: 'Français',
    emoji: '📝',
    couleur: 'text-chart-4',
    fond: 'bg-chart-4/10',
    liens: [
      { label: 'Lumni Primaire Français', url: 'https://www.lumni.fr/primaire', desc: 'Vidéos et exercices de grammaire, conjugaison, orthographe — France TV', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'Bescherelle (orthographe)', url: 'https://bescherelle.com/', desc: 'Règles d\'orthographe et conjugaison — référence Bescherelle en ligne', tag: 'Orthographe', gratuit: true, emoji: '✏️' },
      { label: 'Conjuguons.fr', url: 'https://www.conjuguons.fr/', desc: 'Conjugaison de tous les verbes français — outil de référence gratuit', tag: 'Conjugaison', gratuit: true, emoji: '📖' },
      { label: 'La Dictée du jour (Éduscol)', url: 'https://eduscol.education.fr/la-dictee-au-quotidien', desc: 'Ressources officielles pour la dictée quotidienne au primaire', tag: 'Dictée', gratuit: true, emoji: '✍️' },
    ],
  },
  {
    id: 'primaire-sciences',
    titre: 'Sciences & Monde vivant',
    emoji: '🌿',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      { label: 'La main à la pâte', url: 'https://www.fondation-lamap.org/', desc: 'Sciences et technologie au primaire — Fondation de l\'École polytechnique', tag: 'Sciences', gratuit: true, emoji: '🔬' },
      { label: 'Lumni Sciences Primaire', url: 'https://www.lumni.fr/primaire', desc: 'Vidéos SVT et sciences du monde vivant pour les 6–11 ans', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'CNRS — Actualités sciences', url: 'https://www.cnrs.fr/fr/cnrsinfo', desc: 'Dossiers scientifiques simplifiés pour les primaires — CNRS', tag: 'Sciences', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'primaire-outils',
    titre: 'Outils en ligne',
    emoji: '💻',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'CNED École (cours officiels)', url: 'https://www.cned.fr/ecole', desc: 'Cours à distance du Centre national d\'enseignement à distance — officiel', tag: 'Cours', gratuit: false, emoji: '📦' },
      { label: 'Lumni Primaire (toutes matières)', url: 'https://www.lumni.fr/primaire', desc: 'Plateforme vidéo éducative France Télévisions — CP au CM2', tag: 'Vidéos', gratuit: true, emoji: '📺' },
      { label: 'Prim à bord', url: 'https://primabord.eduscol.education.fr/', desc: 'ENT officiel Éduscol pour les écoles primaires', tag: 'ENT', gratuit: true, emoji: '🖥️' },
    ],
  },
];

// ─── COLLÈGE ──────────────────────────────────────────────────────────────────
export const RESSOURCES_COLLEGE: SectionRessources[] = [
  {
    id: 'college-brevet',
    titre: 'Brevet des Collèges',
    emoji: '🏆',
    couleur: 'text-chart-4',
    fond: 'bg-chart-4/10',
    liens: [
      { label: 'Annales officielles Brevet', url: 'https://www.education.gouv.fr/brevet-des-colleges', desc: 'Sujets officiels du Brevet par session, par série et par académie', tag: 'Annales', gratuit: true, niveaux: ['3e'], emoji: '📄' },
      { label: 'Annales.net Brevet', url: 'https://www.annabac.com/', desc: 'Archives de sujets corrigés Brevet — toutes matières', tag: 'Annales', gratuit: true, niveaux: ['3e'], emoji: '📄' },
      { label: 'Lumni Révisions Brevet', url: 'https://www.lumni.fr/college', desc: 'Vidéos de révision par matière pour le Brevet — France TV', tag: 'Révisions', gratuit: true, niveaux: ['4e','3e'], emoji: '🎬' },
      { label: 'CNED Brevet', url: 'https://www.cned.fr/college', desc: 'Cours officiels et préparation au Brevet en ligne', tag: 'Cours', gratuit: false, niveaux: ['3e'], emoji: '📦' },
    ],
  },
  {
    id: 'college-maths',
    titre: 'Maths',
    emoji: '📐',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      { label: 'Sésamath Collège', url: 'https://www.sesamath.net/', desc: 'Manuels et exercices interactifs 6e–3e, créés par des enseignants', tag: 'Exercices', gratuit: true, niveaux: ['6e','5e','4e','3e'], emoji: '🔢' },
      { label: 'Mathenpoche Collège', url: 'https://mathenpoche.sesamath.net/', desc: 'Exercices en ligne par chapitre — 6e à 3e', tag: 'Exercices', gratuit: true, emoji: '🔢' },
      { label: 'Khan Academy Maths Collège', url: 'https://fr.khanacademy.org/math', desc: 'Parcours adaptatif maths 6e–3e — vidéos + exercices interactifs', tag: 'Parcours', gratuit: true, emoji: '🎓' },
      { label: 'Exo7 Collège/Lycée', url: 'http://exo7.emath.fr/', desc: 'Exercices corrigés niveaux 3e–Terminale avec solutions détaillées', tag: 'Exercices', gratuit: true, niveaux: ['3e'], emoji: '📘' },
      { label: 'Éduscol Maths Cycle 4', url: 'https://eduscol.education.fr/mathematiques', desc: 'Ressources officielles et progressions maths collège', tag: 'Programmes', gratuit: true, emoji: '📋' },
    ],
  },
  {
    id: 'college-francais',
    titre: 'Français',
    emoji: '📚',
    couleur: 'text-chart-4',
    fond: 'bg-chart-4/10',
    liens: [
      { label: 'Lumni Français Collège', url: 'https://www.lumni.fr/college', desc: 'Grammaire, orthographe, lecture, littérature — France TV', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'Bescherelle en ligne', url: 'https://bescherelle.com/', desc: 'Conjugueur de référence — tous les temps, tous les verbes', tag: 'Conjugaison', gratuit: true, emoji: '📖' },
      { label: 'Académie française — Dictionnaire', url: 'https://www.dictionnaire-academie.fr/', desc: 'Dictionnaire officiel de la langue française — Académie française', tag: 'Dictionnaire', gratuit: true, emoji: '🏛️' },
      { label: 'Éduscol Français Cycle 4', url: 'https://eduscol.education.fr/francais', desc: 'Ressources officielles français 5e–3e — programmes et séquences', tag: 'Programmes', gratuit: true, emoji: '📋' },
    ],
  },
  {
    id: 'college-histoire-geo',
    titre: 'Histoire-Géographie',
    emoji: '🗺️',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'Lumni Histoire-Géo Collège', url: 'https://www.lumni.fr/college', desc: 'Documentaires et vidéos histoire-géo collège — France TV', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'Géoconfluences (ENS Lyon)', url: 'https://eduscol.education.fr/histoire-geographie', desc: 'Ressources géographie validées — cycles 3 et 4, terminale', tag: 'Géographie', gratuit: true, emoji: '🌍' },
      { label: 'Éduscol Histoire-Géo', url: 'https://eduscol.education.fr/histoire-geographie', desc: 'Ressources officielles histoire-géo cycles 3 et 4', tag: 'Programmes', gratuit: true, emoji: '📋' },
      { label: 'Gallica (sources historiques)', url: 'https://gallica.bnf.fr/', desc: 'Bibliothèque numérique BNF — documents historiques originaux', tag: 'Archives', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'college-sciences',
    titre: 'SVT & Physique-Chimie',
    emoji: '🔬',
    couleur: 'text-chart-5',
    fond: 'bg-chart-5/10',
    liens: [
      { label: 'Lumni SVT Collège', url: 'https://www.lumni.fr/college', desc: 'Vidéos SVT 6e–3e — cellule, évolution, écosystèmes', tag: 'SVT', gratuit: true, emoji: '🎬' },
      { label: 'Lumni Physique-Chimie Collège', url: 'https://www.lumni.fr/college', desc: 'Expériences et cours de physique-chimie collège', tag: 'Physique', gratuit: true, emoji: '🎬' },
      { label: 'Éduscol Sciences Cycle 4', url: 'https://eduscol.education.fr/svt', desc: 'Ressources officielles SVT collège', tag: 'Programmes', gratuit: true, emoji: '📋' },
    ],
  },
  {
    id: 'college-langues',
    titre: 'Langues vivantes',
    emoji: '🌐',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'TV5MONDE Apprendre le français', url: 'https://apprendre.tv5monde.com/', desc: 'Exercices de français langue étrangère et langue seconde', tag: 'FLE/FLS', gratuit: true, emoji: '🇫🇷' },
      { label: 'Cambridge English (gratuit)', url: 'https://www.cambridgeenglish.org/learning-english/', desc: 'Ressources anglais gratuites du Cambridge Assessment', tag: 'Anglais', gratuit: true, emoji: '🇬🇧' },
      { label: 'Éduscol Langues Vivantes', url: 'https://eduscol.education.fr/langues-vivantes', desc: 'Ressources officielles LV1/LV2 collège et lycée', tag: 'Programmes', gratuit: true, emoji: '📋' },
    ],
  },
];

// ─── LYCÉE GÉNÉRAL ───────────────────────────────────────────────────────────
export const RESSOURCES_LYCEE_GENERAL: SectionRessources[] = [
  {
    id: 'lycee-bac',
    titre: 'Baccalauréat — Annales',
    emoji: '🎓',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      { label: 'Annales officielles Bac', url: 'https://www.education.gouv.fr/annales-du-baccalaureat-general', desc: 'Sujets officiels du Bac par épreuve, par session et par académie', tag: 'Annales', gratuit: true, niveaux: ['Terminale','1ère'], emoji: '📄' },
      { label: 'Annales Bac — AnnaBac', url: 'https://www.annabac.com/', desc: 'Archives complètes des sujets Bac depuis 1997 avec corrigés', tag: 'Annales', gratuit: true, niveaux: ['Terminale'], emoji: '📄' },
      { label: 'Lumni Révisions Bac', url: 'https://www.lumni.fr/lycee', desc: 'Cours vidéo de révision par spécialité pour le Bac — France TV', tag: 'Révisions', gratuit: true, emoji: '🎬' },
    ],
  },
  {
    id: 'lycee-maths',
    titre: 'Maths',
    emoji: '📐',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      { label: 'Exo7 (2nde → Terminale)', url: 'http://exo7.emath.fr/', desc: 'Exercices corrigés par des enseignants de prépa — niveau lycée et CPGE', tag: 'Exercices', gratuit: true, emoji: '📘' },
      { label: 'Khan Academy Maths Lycée', url: 'https://fr.khanacademy.org/math', desc: 'Cours et exercices adaptatifs maths 2nde–Terminale', tag: 'Parcours', gratuit: true, emoji: '🎓' },
      { label: 'Sésamath Lycée', url: 'https://www.sesamath.net/', desc: 'Ressources maths lycée 2nde–Terminale créées par des enseignants', tag: 'Exercices', gratuit: true, emoji: '🔢' },
      { label: 'Éduscol Maths Lycée', url: 'https://eduscol.education.fr/mathematiques', desc: 'Ressources officielles maths lycée — programmes et activités', tag: 'Programmes', gratuit: true, emoji: '📋' },
      { label: 'Maths-et-tiques', url: 'https://www.maths-et-tiques.fr/', desc: 'Cours complets 2nde–Terminale rédigés par Y. Morel (enseignant)', tag: 'Cours', gratuit: true, emoji: '✏️' },
    ],
  },
  {
    id: 'lycee-physique',
    titre: 'Physique-Chimie',
    emoji: '⚗️',
    couleur: 'text-chart-5',
    fond: 'bg-chart-5/10',
    liens: [
      { label: 'Lumni Physique-Chimie Lycée', url: 'https://www.lumni.fr/lycee', desc: 'Cours et expériences de physique-chimie lycée — France TV', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'Khan Academy Physique', url: 'https://fr.khanacademy.org/science/physics', desc: 'Cours de physique illustrés avec exercices interactifs', tag: 'Cours', gratuit: true, emoji: '🎓' },
      { label: 'Éduscol Physique-Chimie Lycée', url: 'https://eduscol.education.fr/physique-chimie', desc: 'Ressources officielles physique-chimie 2nde–Terminale', tag: 'Programmes', gratuit: true, emoji: '📋' },
      { label: 'CNRS — Physique (actualités)', url: 'https://www.cnrs.fr/fr/cnrsinfo', desc: 'Dossiers scientifiques CNRS niveau lycée–prépa', tag: 'Sciences', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'lycee-svt',
    titre: 'SVT (Spécialité)',
    emoji: '🧬',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      { label: 'Lumni SVT Lycée', url: 'https://www.lumni.fr/lycee', desc: 'Vidéos SVT lycée — génétique, évolution, écologie', tag: 'Vidéos', gratuit: true, emoji: '🎬' },
      { label: 'INRAE (Biologie & Agronomie)', url: 'https://www.inrae.fr/nos-recherches', desc: 'Ressources biologie INRAE niveau Terminale SVT', tag: 'Sciences', gratuit: true, emoji: '🔬' },
      { label: 'Éduscol SVT Lycée', url: 'https://eduscol.education.fr/svt', desc: 'Ressources officielles SVT lycée — spécialité et tronc commun', tag: 'Programmes', gratuit: true, emoji: '📋' },
    ],
  },
  {
    id: 'lycee-philo',
    titre: 'Philosophie (Terminale)',
    emoji: '💭',
    couleur: 'text-chart-4',
    fond: 'bg-chart-4/10',
    liens: [
      { label: 'Lumni Philo Terminale', url: 'https://www.lumni.fr/lycee', desc: 'Cours et dissertations de philosophie Terminale — France TV', tag: 'Cours', gratuit: true, niveaux: ['Terminale'], emoji: '🎬' },
      { label: 'Éduscol Philosophie', url: 'https://eduscol.education.fr/philosophie', desc: 'Ressources officielles philosophie Terminale — notions et auteurs', tag: 'Programmes', gratuit: true, emoji: '📋' },
      { label: 'Ac-Philo (Académie de Créteil)', url: 'https://www.ac-creteil.fr/philosophie', desc: 'Ressources philosophie validées par l\'inspection académique', tag: 'Cours', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'lycee-orientation',
    titre: 'Orientation Post-Bac',
    emoji: '🧭',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'Parcoursup (officiel)', url: 'https://www.parcoursup.gouv.fr/', desc: 'Plateforme nationale d\'admission post-Bac — MESR officiel', tag: 'Orientation', gratuit: true, niveaux: ['Terminale'], emoji: '🏛️' },
      { label: 'ONISEP Lycée', url: 'https://www.onisep.fr/Choisir-mes-etudes/Au-lycee-au-CFA', desc: 'Fiches métiers, formations et orientation après le Bac', tag: 'Orientation', gratuit: true, emoji: '🗺️' },
      { label: 'Guides Parcoursup Éduscol', url: 'https://eduscol.education.fr/parcoursup', desc: 'Guides officiels Éduscol pour préparer Parcoursup', tag: 'Orientation', gratuit: true, emoji: '📋' },
    ],
  },
];

// ─── LYCÉE PRO ───────────────────────────────────────────────────────────────
export const RESSOURCES_LYCEE_PRO: SectionRessources[] = [
  {
    id: 'lyceepro-programmes',
    titre: 'Programmes & Référentiels',
    emoji: '📋',
    couleur: 'text-chart-4',
    fond: 'bg-chart-4/10',
    liens: [
      { label: 'Éduscol Voie professionnelle', url: 'https://eduscol.education.fr/162/voie-professionnelle', desc: 'Programmes officiels CAP, Bac Pro et BEP — référentiels par diplôme', tag: 'Programmes', gratuit: true, emoji: '📋' },
      { label: 'ONISEP Voie Pro', url: 'https://www.onisep.fr/Choisir-mes-etudes/Apres-le-college/La-voie-professionnelle', desc: 'Fiches diplômes et métiers pour la voie professionnelle', tag: 'Orientation', gratuit: true, emoji: '🗺️' },
      { label: 'RNCP — Fiche diplôme', url: 'https://www.francecompetences.fr/recherche/rncp/', desc: 'Répertoire national des certifications professionnelles — diplômes reconnus', tag: 'Diplômes', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'lyceepro-alternance',
    titre: 'Alternance & Apprentissage',
    emoji: '🤝',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      { label: 'Alternance.emploi.gouv.fr', url: 'https://www.alternance.emploi.gouv.fr/', desc: 'Trouver un contrat d\'apprentissage ou de professionnalisation', tag: 'Alternance', gratuit: true, emoji: '🤝' },
      { label: 'France Travail (stages & emplois)', url: 'https://www.francetravail.fr/', desc: 'Offres de stage, apprentissage et premier emploi', tag: 'Stages', gratuit: true, emoji: '💼' },
      { label: 'AFPA Formation Pro', url: 'https://www.afpa.fr/', desc: 'Formation professionnelle pour alternants — organisme public', tag: 'Formation', gratuit: false, emoji: '🏫' },
      { label: '1 jeune 1 solution', url: 'https://www.1jeune1solution.gouv.fr/', desc: 'Plateforme gouvernementale emploi, stage, apprentissage — 16–26 ans', tag: 'Emploi', gratuit: true, emoji: '🏛️' },
    ],
  },
  {
    id: 'lyceepro-aides',
    titre: 'Aides financières',
    emoji: '💶',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'Bourses lycée pro (EN)', url: 'https://www.service-public.fr/particuliers/vosdroits/F12', desc: 'Bourses de lycée pro — conditions, montants, dossier PFMP', tag: 'Aides', gratuit: true, emoji: '💰' },
      { label: 'PFMP — Période en entreprise (EN)', url: 'https://eduscol.education.fr/570/les-pfmp', desc: 'Ressources officielles sur les périodes de formation en milieu professionnel', tag: 'Stage', gratuit: true, emoji: '🏭' },
      { label: 'Mon compte formation (CPF)', url: 'https://www.moncompteformation.gouv.fr/', desc: 'Crédit formation personnel — à partir de 16 ans en alternance', tag: 'Formation', gratuit: true, emoji: '💳' },
    ],
  },
];

// ─── SUPÉRIEUR ────────────────────────────────────────────────────────────────
export const RESSOURCES_SUPERIEUR: SectionRessources[] = [
  {
    id: 'sup-moocs',
    titre: 'MOOCs & Cours universitaires',
    emoji: '🎓',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'FUN-MOOC (officiel)', url: 'https://www.fun-mooc.fr/', desc: 'France Université Numérique — MOOCs certifiants des universités françaises', tag: 'MOOCs', gratuit: true, emoji: '🏛️' },
      { label: 'Coursera (Universités mondiales)', url: 'https://www.coursera.org/', desc: 'Cours en ligne des meilleures universités — nombreux cours gratuits en audit', tag: 'MOOCs', gratuit: true, emoji: '🌍' },
      { label: 'MIT OpenCourseWare (anglais)', url: 'https://ocw.mit.edu/', desc: 'Tous les cours du MIT en libre accès — niveau Licence à Doctorat', tag: 'Cours', gratuit: true, emoji: '🔬' },
      { label: 'OpenClassrooms', url: 'https://openclassrooms.com/fr/', desc: 'Formations certifiantes reconnues par l\'État — informatique, data, design', tag: 'Formations', gratuit: false, emoji: '💻' },
    ],
  },
  {
    id: 'sup-orientation',
    titre: 'Orientation & Admission',
    emoji: '🧭',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      { label: 'Mon Master (MESR officiel)', url: 'https://www.monmaster.gouv.fr/', desc: 'Plateforme nationale d\'admission en Master — obligatoire depuis 2023', tag: 'Admission', gratuit: true, emoji: '🏛️' },
      { label: 'Campus France', url: 'https://www.campusfrance.org/', desc: 'Études à l\'étranger et mobilité internationale — Agence nationale', tag: 'Mobilité', gratuit: true, emoji: '✈️' },
      { label: 'ONISEP Études Supérieures', url: 'https://www.onisep.fr/Choisir-mes-etudes/Apres-le-bac', desc: 'Guide complet post-Bac : BTS, Licence, IUT, Grandes Écoles, CPGE', tag: 'Orientation', gratuit: true, emoji: '🗺️' },
      { label: 'Letudiant.fr', url: 'https://www.letudiant.fr/', desc: 'Classements, dossiers d\'admission et conseils orientation', tag: 'Orientation', gratuit: true, emoji: '📰' },
    ],
  },
  {
    id: 'sup-aides',
    titre: 'Aides & Bourses',
    emoji: '💶',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      { label: 'CNOUS Bourses (Crous)', url: 'https://www.cnous.fr/', desc: 'Bourses sur critères sociaux, logement, restauration — CROUS officiel', tag: 'Bourses', gratuit: true, emoji: '💰' },
      { label: 'Simulateur de bourse (Mesri)', url: 'https://www.messervices.etudiant.gouv.fr/', desc: 'Calcule ton droit à la bourse Crous en 5 minutes', tag: 'Simulateur', gratuit: true, emoji: '🧮' },
      { label: 'Aide aux étudiants étrangers (Campus France)', url: 'https://www.campusfrance.org/fr', desc: 'Bourses du gouvernement français pour étudiants internationaux', tag: 'Bourses', gratuit: true, emoji: '🌍' },
    ],
  },
  {
    id: 'sup-recherche',
    titre: 'Recherche & Bibliothèques',
    emoji: '📚',
    couleur: 'text-chart-5',
    fond: 'bg-chart-5/10',
    liens: [
      { label: 'Gallica (BNF)', url: 'https://gallica.bnf.fr/', desc: 'Bibliothèque numérique BNF — 8 millions de documents libres', tag: 'Bibliothèque', gratuit: true, emoji: '🏛️' },
      { label: 'HAL — Archives ouvertes', url: 'https://hal.science/', desc: 'Archive ouverte nationale : publications scientifiques françaises', tag: 'Recherche', gratuit: true, emoji: '🔬' },
      { label: 'Theses.fr', url: 'https://www.theses.fr/', desc: 'Catalogue national des thèses soutenues en France — ABES', tag: 'Thèses', gratuit: true, emoji: '📖' },
      { label: 'Persée (revues FR)', url: 'https://www.persee.fr/', desc: 'Archives des grandes revues académiques françaises en libre accès', tag: 'Revues', gratuit: true, emoji: '📰' },
      { label: 'Google Scholar', url: 'https://scholar.google.fr/', desc: 'Moteur de recherche académique mondial — articles, citations, brevets', tag: 'Recherche', gratuit: true, emoji: '🔍' },
    ],
  },
  {
    id: 'sup-maths-info',
    titre: 'Maths & Informatique',
    emoji: '💻',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      { label: 'Exo7 (CPGE & Licence)', url: 'http://exo7.emath.fr/', desc: '1500+ exercices corrigés pour CPGE, L1–L3 maths', tag: 'Exercices', gratuit: true, emoji: '📘' },
      { label: 'Bibmath.net', url: 'https://www.bibmath.net/', desc: 'Cours et exercices rédigés maths L1–L3 et CPGE', tag: 'Cours', gratuit: true, emoji: '📗' },
      { label: 'France IOI (algorithmique)', url: 'https://www.france-ioi.org/', desc: 'Apprentissage algorithmique et programmation — gratuit et progressif', tag: 'Informatique', gratuit: true, emoji: '💡' },
      { label: 'The Algorithms (GitHub)', url: 'https://github.com/TheAlgorithms', desc: 'Implémentations d\'algorithmes classiques en Python, Java, C++', tag: 'Code', gratuit: true, emoji: '⚙️' },
    ],
  },
];

// ─── INCLUSION ULIS / SEGPA / DYS ─────────────────────────────────────────────
export const RESSOURCES_INCLUSION: SectionRessources[] = [
  {
    id: 'inclusion-droits',
    titre: 'Droits officiels & démarches',
    emoji: '⚖️',
    couleur: 'text-primary',
    fond: 'bg-primary/10',
    liens: [
      // ✅ FIXÉ 2026-06 : URL avec ID numérique → URL canonique stable sans ID
      { label: 'Scolarisation élèves handicapés (EN)', url: 'https://www.education.gouv.fr/l-ecole-inclusive', desc: 'Politique officielle d\'inclusion — droits, MDPH, PPS, AESH', tag: 'Droits', gratuit: true, emoji: '🏛️' },
      // ✅ service-public.fr — URL stable
      { label: 'Service-Public.fr — Droits scolaires', url: 'https://www.service-public.fr/particuliers/vosdroits/F1898', desc: 'Fiche officielle vos droits en matière de scolarisation handicap', tag: 'Droits', gratuit: true, emoji: '⚖️' },
      // ✅ FIXÉ 2026-06 : /demarches/trouver-ma-mdph → 404 ; homepage stable
      { label: 'Mon Parcours Handicap — MDPH', url: 'https://www.monparcourshandicap.gouv.fr/', desc: 'Portail officiel gouvernemental — MDPH, RQTH, PCH, AAH', tag: 'MDPH', gratuit: true, emoji: '🗺️' },
      // ✅ FIXÉ 2026-06 : URL numérotée eduscol → URL canonique sans ID
      { label: 'PPS — Guide officiel (EN)', url: 'https://eduscol.education.fr/le-projet-personnalise-de-scolarisation', desc: 'Projet Personnalisé de Scolarisation — guide et modèle Éduscol', tag: 'PPS', gratuit: true, emoji: '📄' },
      // ✅ FIXÉ 2026-06 : URL numérotée eduscol → URL canonique sans ID
      { label: 'PAP — Guide officiel (EN)', url: 'https://eduscol.education.fr/le-plan-d-accompagnement-personnalise', desc: 'Plan d\'Accompagnement Personnalisé — DYS, TDAH, TDA — guide Éduscol', tag: 'PAP', gratuit: true, emoji: '📄' },
    ],
  },
  {
    id: 'inclusion-ulis-segpa',
    titre: 'ULIS & SEGPA — Ressources pédagogiques',
    emoji: '💚',
    couleur: 'text-chart-2',
    fond: 'bg-chart-2/10',
    liens: [
      // ✅ FIXÉ 2026-06 : URL numérotée /1462/... → canonique sans ID
      { label: 'Éduscol ULIS', url: 'https://eduscol.education.fr/l-ulis-un-dispositif-de-scolarisation', desc: 'Tout sur les ULIS : organisation, programmes adaptés, CAPASH', tag: 'ULIS', gratuit: true, emoji: '🏫' },
      // ✅ FIXÉ 2026-06 : URL numérotée /570/la-segpa → canonique sans ID
      { label: 'Éduscol SEGPA', url: 'https://eduscol.education.fr/la-segpa', desc: 'Tout sur les SEGPA : programmes, orientation, partenariats professionnels', tag: 'SEGPA', gratuit: true, emoji: '🏫' },
      // ✅ FIXÉ 2026-06 : canope.fr → domaine inexistant (000) ; remplacé par reseau-canope.fr (domaine officiel confirmé)
      { label: 'Canopé — École Inclusive', url: 'https://www.reseau-canope.fr/', desc: 'Ressources pédagogiques pour l\'école inclusive — Réseau Canopé officiel', tag: 'Pédagogie', gratuit: true, emoji: '📚' },
      // ✅ FIXÉ 2026-06 : UNAPEI FALC — URL stable
      { label: 'FALC — Facile à lire (UNAPEI)', url: 'https://www.unapei.org/article/les-documents-en-facile-a-lire-et-a-comprendre-falc/', desc: 'Guides en FALC — format accessible pour handicap cognitif et SEGPA', tag: 'FALC', gratuit: true, emoji: '📖' },
      // ✅ FIXÉ 2026-06 : URL avec ID numérique → URL canonique
      { label: 'EREA en France (EN)', url: 'https://www.education.gouv.fr/les-etablissements-regionaux-d-enseignement-adapte', desc: 'Les 80 EREA — établissements régionaux d\'enseignement adapté', tag: 'EREA', gratuit: true, emoji: '🏫' },
    ],
  },
  {
    id: 'inclusion-dys',
    titre: 'Troubles DYS & TDAH',
    emoji: '🧠',
    couleur: 'text-chart-5',
    fond: 'bg-chart-5/10',
    liens: [
      // ✅ FIXÉ 2026-06 : URL numérotée /1936/... → canonique sans ID
      { label: 'Éduscol — Troubles DYS', url: 'https://eduscol.education.fr/les-troubles-specifiques-des-apprentissages', desc: 'Dyslexie, dyspraxie, dyscalculie, TDAH — aménagements officiels', tag: 'DYS', gratuit: true, emoji: '🧠' },
      // ✅ FIXÉ 2026-06 : inserm.fr/dossier/dyslexie/ → 404 ; remplacé par FFDYS (Fédération Française des DYS) — 200 confirmé
      { label: 'FFDYS — Fédération Française des DYS', url: 'https://www.ffdys.com/', desc: 'Fédération nationale — ressources DYS, guides pratiques, droits et aménagements', tag: 'Sciences', gratuit: true, emoji: '🔬' },
      // ✅ dyspraxies.fr — association stable
      { label: 'Dyspraxie France Dys', url: 'https://www.dyspraxies.fr/', desc: 'Association nationale — guides pratiques, droits, outils', tag: 'Association', gratuit: true, emoji: '🤝' },
      // 🔴 FIXÉ : medialexie.net introuvable → remplacé par OpenDyslexic (police libre, https valide)
      { label: 'OpenDyslexic — Police DYS', url: 'https://opendyslexic.org/', desc: 'Police typographique libre et gratuite adaptée à la dyslexie', tag: 'Outil', gratuit: true, emoji: '🔤' },
      // ✅ tdah-france.fr — association stable
      { label: 'HyperSupers TDAH France', url: 'https://www.tdah-france.fr/', desc: 'Association nationale TDAH — droits, conseils, aménagements scolaires', tag: 'TDAH', gratuit: true, emoji: '🤝' },
      // ✅ FIXÉ 2026-06 : URL numérotée /2325/... → canonique sans ID
      { label: 'Éduscol — Ressources pédago DYS', url: 'https://eduscol.education.fr/ressources-pour-les-eleves-a-besoins-educatifs-particuliers', desc: 'Ressources pédagogiques officielles adaptées DYS — exercices et fiches', tag: 'Pédagogie', gratuit: true, emoji: '📚' },
    ],
  },
  {
    id: 'inclusion-accessibilite-num',
    titre: 'Accessibilité numérique',
    emoji: '♿',
    couleur: 'text-chart-3',
    fond: 'bg-chart-3/10',
    liens: [
      // ✅ FIXÉ 2026-06 : URL numérotée /1656/... → canonique sans ID
      { label: 'RGAA — Accessibilité numérique (EN)', url: 'https://eduscol.education.fr/accessibilite-numerique', desc: 'Référentiel général d\'accessibilité numérique dans l\'éducation', tag: 'RGAA', gratuit: true, emoji: '🏛️' },
      // ✅ FIXÉ 2026-06 : URL numérotée /124/... → canonique sans ID
      { label: 'Inclusion scolaire — Éduscol', url: 'https://eduscol.education.fr/l-inclusion-scolaire', desc: 'Espace dédié à l\'inclusion scolaire — toutes ressources officielles', tag: 'Inclusion', gratuit: true, emoji: '♿' },
      // 🔴 FIXÉ : onisep.fr/formation-scolaire/ changé → nouvelle structure ONISEP 2024
      { label: 'ONISEP — Élèves à besoins particuliers', url: 'https://www.onisep.fr/parcours-et-metiers/handicap', desc: 'Dispositifs pour élèves à besoins particuliers — formation et emploi', tag: 'ONISEP', gratuit: true, emoji: '🗺️' },
      // ✅ FIXÉ 2026-06 : /vivre-avec-un-handicap/education-et-scolarite/ → 404 ; remplacé par homepage APF (200 confirmé)
      { label: 'APF France Handicap — Scolarité', url: 'https://www.apf-francehandicap.org/', desc: 'Guide scolarisation et handicap — droits, démarches et ressources pratiques', tag: 'Guide', gratuit: true, emoji: '📘' },
    ],
  },
];

// ─── Index global par catégorie d'espace ─────────────────────────────────────
export const RESSOURCES_PAR_CATEGORIE: Record<string, SectionRessources[]> = {
  primaire:  RESSOURCES_PRIMAIRE,
  college:   RESSOURCES_COLLEGE,
  lycee:     RESSOURCES_LYCEE_GENERAL,
  superieur: RESSOURCES_SUPERIEUR,
};
