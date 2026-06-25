import { AlertCircle, BarChart2, BookMarked, BookOpen, Calculator, ChevronDown, ChevronRight, Code, ExternalLink, FlaskConical, Globe, Heart, Languages, Lightbulb, Loader2, MessageCircle, Pencil, RotateCcw, Search, Send, Sparkles, Target, UserCheck, Volume2, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import LectureGuideeModal from '@/components/ui/LectureGuideeModal';
import { buildUtterance, unlockAudioContext } from '@/lib/ttsUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// v1626 — static ttsUtils import (no dynamic import)
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import type { ExportContent } from '@/components/ui/ExportButton';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { useApp } from '@/contexts/AppContext';
import { createStudentQuestion } from '@/lib/api';
import { callLLM, type LLMMessage } from '@/lib/llm';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step { label: string; detail: string; }
interface FicheMethode {
  id: string;
  subject: string;
  niveau: string[];
  titre: string;
  type: string;
  steps: Step[];
  conseil: string;
  exemple?: string;
}
interface Ressource {
  label: string;
  url: string;
  desc: string;
  tag: string;
}

// ─── Fiches méthode rédigées manuellement ─────────────────────────────────────
const FICHES: FicheMethode[] = [
  // ── Maths ──
  {
    id: 'm1', subject: 'Maths', niveau: ['Lycée', 'Collège'], titre: 'Résoudre une équation du 2nd degré', type: 'Algèbre',
    steps: [
      { label: 'Mettre sous forme ax² + bx + c = 0', detail: 'Développe, réduis, puis déplace tous les termes à gauche du signe =.' },
      { label: 'Identifier a, b et c', detail: 'a = coefficient de x², b = coefficient de x, c = terme constant.' },
      { label: 'Calculer le discriminant Δ', detail: 'Δ = b² − 4ac. C\'est la clé pour savoir combien de solutions existe.' },
      { label: 'Interpréter Δ', detail: 'Δ > 0 → 2 solutions réelles. Δ = 0 → 1 solution double. Δ < 0 → pas de solution réelle.' },
      { label: 'Calculer les solutions', detail: 'x₁ = (−b + √Δ) / 2a  et  x₂ = (−b − √Δ) / 2a' },
    ],
    conseil: 'Commence TOUJOURS par vérifier que l\'équation est bien = 0 avant de chercher a, b, c.',
    exemple: 'x² − 5x + 6 = 0 → a=1, b=−5, c=6 → Δ = 25−24 = 1 → x₁ = 3, x₂ = 2',
  },
  {
    id: 'm2', subject: 'Maths', niveau: ['Lycée', 'Collège'], titre: 'Calculer la dérivée d\'une fonction', type: 'Analyse',
    steps: [
      { label: 'Identifier le type de fonction', detail: 'Constante, polynôme, racine, fraction, produit, quotient ou composée ?' },
      { label: 'Appliquer les formules de base', detail: '(xⁿ)\' = n·xⁿ⁻¹ | (√x)\' = 1/(2√x) | (eˣ)\' = eˣ | (ln x)\' = 1/x' },
      { label: 'Pour un produit u·v', detail: '(u·v)\' = u\'·v + u·v\'' },
      { label: 'Pour un quotient u/v', detail: '(u/v)\' = (u\'·v − u·v\') / v²' },
      { label: 'Simplifier le résultat', detail: 'Factorise si possible pour trouver les zéros de f\' plus facilement.' },
    ],
    conseil: 'Dresse un tableau de signe de f\'(x) pour déterminer les variations de f sans oublier aucun intervalle.',
    exemple: 'f(x) = 3x² − 2x + 1 → f\'(x) = 6x − 2',
  },
  {
    id: 'm3', subject: 'Maths', niveau: ['Collège'], titre: 'Résoudre un système de 2 équations', type: 'Algèbre',
    steps: [
      { label: 'Choisir une méthode', detail: 'Substitution (isoler une variable), ou combinaison linéaire (addition/soustraction).' },
      { label: 'Substitution : isoler x ou y', detail: 'Dans l\'équation la plus simple, isole x (ou y) puis remplace dans l\'autre.' },
      { label: 'Résoudre l\'équation restante', detail: 'Tu obtiens une équation à une seule inconnue — résous-la normalement.' },
      { label: 'Trouver la 2ᵉ inconnue', detail: 'Réinjecte la valeur trouvée dans l\'une des équations originales.' },
      { label: 'Vérification', detail: 'Substitue le couple (x, y) dans LES DEUX équations pour confirmer.' },
    ],
    conseil: 'La vérification est obligatoire en contrôle. Elle te rapporte des points même si tu t\'es trompé en route.',
    exemple: 'x + y = 5 et 2x − y = 1 → additionner : 3x = 6 → x = 2 → y = 3',
  },
  {
    id: 'm4', subject: 'Maths', niveau: ['Collège', 'Lycée'], titre: 'Utiliser le théorème de Thalès', type: 'Géométrie',
    steps: [
      { label: 'Vérifier les conditions', detail: 'Deux droites parallèles coupant deux sécantes passant par un même point.' },
      { label: 'Identifier les points homologues', detail: 'Repère quels points se correspondent sur chaque sécante depuis le point commun.' },
      { label: 'Écrire les égalités de rapports', detail: 'AM/AB = AN/AC = MN/BC (avec A le point commun aux sécantes).' },
      { label: 'Substituer les valeurs connues', detail: 'Remplace les longueurs connues dans le rapport et résous l\'équation.' },
      { label: 'Conclure et préciser l\'unité', detail: 'Annonce clairement la valeur trouvée avec son unité.' },
    ],
    conseil: 'Thalès s\'applique UNIQUEMENT si les droites sont bien parallèles — toujours le vérifier ou le justifier.',
    exemple: 'AM = 3, AB = 9, AC = 6 → AN = AM × AC / AB = 3 × 6 / 9 = 2',
  },
  // ── Français ──
  {
    id: 'f1', subject: 'Français', niveau: ['Lycée'], titre: 'Rédiger une introduction de dissertation', type: 'Méthode rédac.',
    steps: [
      { label: 'Accroche (2–3 lignes)', detail: 'Citation, fait d\'actualité, paradoxe ou question rhétorique en lien avec le sujet.' },
      { label: 'Présentation du sujet', detail: 'Reformule le sujet avec tes propres mots. Définis les termes-clés.' },
      { label: 'Problématique', detail: 'Une question précise qui montre la tension du sujet. Évite les questions fermées (oui/non).' },
      { label: 'Annonce du plan', detail: 'Énonce clairement tes 2 ou 3 parties : "Dans un premier temps… puis… enfin…".' },
    ],
    conseil: 'L\'introduction représente environ 10 % de la copie. Rédige-la au propre EN DERNIER, une fois le plan clair.',
    exemple: 'Sujet : "La liberté est-elle une illusion ?" → accroche Rousseau → définir liberté/illusion → problématique → annonce plan.',
  },
  {
    id: 'f2', subject: 'Français', niveau: ['Lycée', 'Collège'], titre: 'Analyser un poème (explication linéaire)', type: 'Lecture',
    steps: [
      { label: 'Lire le poème deux fois', detail: 'La 1ère fois globalement. La 2ème en relevant les images, sons et structures qui t\'interpellent.' },
      { label: 'Identifier la forme', detail: 'Nombre de strophes, de vers. Métrique (alexandrin = 12 syllabes). Type de rimes (croisées, embrassées, suivies).' },
      { label: 'Relever les figures de style', detail: 'Métaphore, comparaison, hyperbole, anaphore, oxymore, personnification, allitération, assonance.' },
      { label: 'Relier forme et sens', detail: 'Pour chaque figure repérée, explique l\'effet produit sur le lecteur : "cela crée une impression de…".' },
      { label: 'Formuler le mouvement du texte', detail: 'Comment le sens évolue-t-il du début à la fin ? Quelle est la progression du propos du poète ?' },
    ],
    conseil: 'Ne jamais NOMMER une figure de style sans EXPLIQUER son effet. "Il y a une métaphore" ≠ analyse.',
    exemple: 'Baudelaire — "Spleen" : anaphore de "Quand" → accumulation écrasante du temps → sentiment d\'enfermement.',
  },
  {
    id: 'f3', subject: 'Français', niveau: ['Collège', 'Lycée'], titre: 'Accord du participe passé', type: 'Grammaire',
    steps: [
      { label: 'Avec ÊTRE', detail: 'Le PP s\'accorde en genre et nombre avec le SUJET du verbe. Ex : Elles sont arrivées.' },
      { label: 'Avec AVOIR — chercher le COD', detail: 'Pose la question "quoi ?" ou "qui ?" après le verbe. Si le COD est AVANT, accord ; si après, pas d\'accord.' },
      { label: 'Verbes pronominaux (se/s\')', detail: 'Se conjuguent avec ÊTRE. Accord avec le sujet SAUF si le pronom est COI.' },
      { label: 'Cas particuliers : laisser + inf.', detail: '"Laisser" suivi d\'un infinitif est invariable depuis la réforme orthographique de 1990.' },
    ],
    conseil: 'Pour AVOIR, toujours repérer où se trouve le COD. Si le COD est placé AVANT le verbe (pronom "l\', les, la"), le PP s\'accorde.',
    exemple: 'La lettre que j\'ai écrite (COD "que" = "la lettre" → féminin singulier → "écrite").',
  },
  // ── Histoire ──
  {
    id: 'h1', subject: 'Histoire', niveau: ['Lycée', 'Collège'], titre: 'Rédiger une composition d\'histoire', type: 'Méthode rédac.',
    steps: [
      { label: 'Analyser le sujet', detail: 'Surligne les mots-clés. Définis les bornes chronologiques et le cadre géographique.' },
      { label: 'Mobiliser le cours', detail: 'Rappelle-toi les grandes dates, acteurs, événements et notions liés au sujet.' },
      { label: 'Construire le plan', detail: 'Plan thématique ou chronologique selon le sujet. 2 ou 3 parties, chacune avec 2–3 sous-parties.' },
      { label: 'Rédiger avec des connecteurs logiques', detail: '"En effet… De plus… Cependant… En conclusion…" — montrent la logique du raisonnement.' },
      { label: 'Conclure avec un bilan et ouverture', detail: 'Réponds à la problématique et ouvre sur une question plus large liée au sujet.' },
    ],
    conseil: 'Chaque paragraphe = 1 idée + 1 exemple + 1 analyse. Ne jamais énoncer un fait sans l\'expliquer.',
    exemple: 'Sujet "Les causes de la 1ère GM" : I. Tensions européennes (nationalisme, alliances) II. L\'étincelle de Sarajevo III. L\'engrenage militaire.',
  },
  // ── SVT ──
  {
    id: 's1', subject: 'SVT', niveau: ['Lycée', 'Collège'], titre: 'Rédiger une synthèse SVT à partir de documents', type: 'Méthode',
    steps: [
      { label: 'Lire tous les documents', detail: 'Identifie la nature de chaque doc (graphique, schéma, texte, tableau) et sa donnée principale.' },
      { label: 'Formuler une problématique', detail: 'À partir du titre de l\'exercice, formule la question à laquelle tu dois répondre.' },
      { label: 'Extraire et relier les informations', detail: 'Pour chaque document, note l\'information utile (avec référence "Doc 1…"). Cherche les liens entre docs.' },
      { label: 'Rédiger en paragraphes logiques', detail: 'Structure : idée → preuve tirée du/des doc(s) → interprétation biologique.' },
      { label: 'Conclure avec un schéma bilan si demandé', detail: 'Représente les mécanismes décrits de façon synthétique et légendée.' },
    ],
    conseil: 'Cite TOUJOURS le document utilisé (ex : "Le graphique du doc 2 montre que…"). Ça prouve que tu argumentes.',
    exemple: 'Exercice photosynthèse : Doc1 (courbe absorption lumière) + Doc2 (schéma chloroplaste) → montrer lien lumière/glucose.',
  },
  // ── Physique ──
  {
    id: 'p1', subject: 'Physique', niveau: ['Lycée', 'Collège'], titre: 'Résoudre un exercice de physique (méthode générale)', type: 'Méthode',
    steps: [
      { label: 'Identifier le système et la situation', detail: 'Quel objet étudie-t-on ? Quel type de problème (mécanique, optique, électricité…) ?' },
      { label: 'Lister les données et inconnues', detail: 'Encadre ou note toutes les valeurs numériques données et ce que tu cherches.' },
      { label: 'Choisir la loi ou formule applicable', detail: 'F = ma ? Loi d\'Ohm ? Conservation d\'énergie ? Snell-Descartes ? Identifie quelle loi s\'applique.' },
      { label: 'Appliquer numériquement', detail: 'Remplace les symboles par les valeurs. Calcule pas à pas. Garde les unités à chaque étape.' },
      { label: 'Vérifier cohérence et unités', detail: 'Le résultat est-il raisonnable ? Les unités s\'annulent-elles bien ? (analyse dimensionnelle)' },
    ],
    conseil: 'Fais TOUJOURS le calcul littéral (avec les lettres) AVANT de remplacer par les chiffres. Tu repères mieux les erreurs.',
    exemple: 'U = 12 V, R = 4 Ω → I = U/R = 12/4 = 3 A',
  },
  // ── Anglais ──
  {
    id: 'a1', subject: 'Anglais', niveau: ['Lycée', 'Collège'], titre: 'Utiliser le présent parfait vs prétérit', type: 'Grammaire',
    steps: [
      { label: 'Present Perfect → lien avec le présent', detail: 'Utilise HAVE + participe passé quand l\'action passée a un effet maintenant. "I have lost my keys" (je ne les ai toujours pas).' },
      { label: 'Simple Past → date/moment précis', detail: 'Utilise la forme en -ed/-ed irrégulier quand tu précises QUAND. "I lost my keys yesterday".' },
      { label: 'Marqueurs du Present Perfect', detail: '"already, just, yet, ever, never, since, for, recently, so far" → signal = Present Perfect.' },
      { label: 'Marqueurs du Simple Past', detail: '"yesterday, last week, in 2010, ago, when I was young" → signal = Simple Past.' },
    ],
    conseil: 'Si tu hésites : est-ce qu\'on précise QUAND ? → Simple Past. Est-ce que ça a un effet MAINTENANT ? → Present Perfect.',
    exemple: '"She has finished her homework" (elle peut jouer maintenant) vs "She finished at 6pm" (heure précise).',
  },
  // ── Espagnol ──
  {
    id: 'e1', subject: 'Espagnol', niveau: ['Lycée', 'Collège'], titre: 'Ser vs Estar — règles complètes', type: 'Grammaire',
    steps: [
      { label: 'SER → identité permanente', detail: 'Nationalité, profession, origine, caractère, matière, heure, relations. "Soy francés. Es médico. Es de madera."' },
      { label: 'ESTAR → état temporaire / localisation', detail: '"Estoy cansado" (je suis fatigué en ce moment). "El libro está en la mesa" (position).' },
      { label: 'Cas particuliers', detail: '"Estar" pour les états civils temporaires (separado, muerto en contexte). "Ser" pour les heures et les événements localisés.' },
      { label: 'Adjectifs qui changent de sens', detail: '"Ser aburrido" = être ennuyeux (caractère) / "Estar aburrido" = s\'ennuyer (état). Listo, malo, bueno → même logique.' },
    ],
    conseil: 'Demande-toi : est-ce une caractéristique ESSENTIELLE (SER) ou une situation MOMENTANÉE (ESTAR) ?',
    exemple: 'Juan es alto (caractère permanent) / Juan está enfermo hoy (état temporaire du jour).',
  },
  // ── Philosophie ──
  {
    id: 'ph1', subject: 'Philosophie', niveau: ['Lycée'], titre: 'Analyser un texte philosophique', type: 'Méthode lecture',
    steps: [
      { label: 'Première lecture globale', detail: 'Identifie le sujet traité, le mouvement général du texte et la thèse de l\'auteur.' },
      { label: 'Dégager la thèse', detail: 'En une phrase : "L\'auteur soutient que…". La thèse répond à une question philosophique précise.' },
      { label: 'Identifier la structure argumentative', detail: 'Comment l\'auteur construit-il son raisonnement ? Déduction ? Exemple ? Réfutation d\'une objection ?' },
      { label: 'Analyser les concepts-clés', detail: 'Définis précisément chaque notion importante du texte. "Qu\'entend l\'auteur par X ?".' },
      { label: 'Discussion critique', detail: 'Peux-tu objecter un argument ? Quel autre philosophe pense différemment ? Quelle est la portée de la thèse ?' },
    ],
    conseil: 'L\'explication de texte ne consiste pas à paraphraser mais à JUSTIFIER chaque affirmation de l\'auteur en montrant le raisonnement.',
    exemple: 'Texte Descartes cogito : thèse = le doute prouve l\'existence du sujet pensant → analyser "je pense donc je suis".',
  },
  // ── NSI ──
  {
    id: 'n1', subject: 'NSI/Informatique', niveau: ['Lycée'], titre: 'Comprendre et écrire une fonction récursive', type: 'Algorithmique',
    steps: [
      { label: 'Identifier le cas de base', detail: 'Quel est le cas SIMPLE qui ne nécessite pas d\'appel récursif ? Sans lui, la fonction boucle indéfiniment.' },
      { label: 'Définir l\'appel récursif', detail: 'Comment la fonction s\'appelle-t-elle elle-même avec un paramètre PLUS PETIT (ou plus proche du cas de base) ?' },
      { label: 'Vérifier la terminaison', detail: 'À chaque appel, le paramètre doit se rapprocher du cas de base. Sinon → récursion infinie.' },
      { label: 'Dérouler sur un exemple', detail: 'Trace l\'exécution à la main pour n=3 ou n=4. C\'est le meilleur moyen de comprendre.' },
      { label: 'Analyser la complexité', detail: 'Compte le nombre d\'appels récursifs. Fibonacci naïf = O(2ⁿ). Factorielle = O(n).' },
    ],
    conseil: 'Commence TOUJOURS par écrire le cas de base. Un étudiant sur deux oublie cette étape et obtient une erreur de dépassement de pile.',
    exemple: 'fact(n): si n==0 → retourne 1, sinon → retourne n × fact(n−1). fact(4) = 4×3×2×1 = 24.',
  },
  // ── Économie ──
  {
    id: 'ec1', subject: 'Économie/SES', niveau: ['Lycée'], titre: 'Construire une réponse structurée en SES', type: 'Méthode',
    steps: [
      { label: 'Décoder la question', detail: 'Identifie les mots-clés : "expliquer", "analyser", "montrer". Chaque verbe demande un niveau d\'analyse différent.' },
      { label: 'Mobiliser le cours', detail: 'Quelles notions, mécanismes, auteurs (Marx, Keynes, Bourdieu…) sont liés au sujet ?' },
      { label: 'Exploiter les documents', detail: 'Pour chaque doc, extrais UNE information précise avec les chiffres ou données exactes.' },
      { label: 'Articuler cours et documents', detail: 'Chaque paragraphe = notion du cours + illustration tirée des docs + analyse du lien.' },
      { label: 'Nuancer et conclure', detail: 'Montre les limites ou les cas contraires. Conclure en répondant directement à la question.' },
    ],
    conseil: 'En SES, "expliquer" = montrer le MÉCANISME causal. Pas juste décrire le phénomène : dire POURQUOI et COMMENT il se produit.',
    exemple: '"Expliquer la hausse du chômage" → mécanisme offre/demande de travail + données du doc + nuance cycle économique.',
  },
];

// ─── Ressources pédagogiques vérifiées (sans IA) ──────────────────────────────
const RESSOURCES: Record<string, Ressource[]> = {
  'Maths': [
    { label: 'Maths et Tiques — Yvan Monka', url: 'https://www.maths-et-tiques.fr', desc: 'Cours vidéo + exercices corrigés, du collège à la terminale.', tag: 'Lycée & Sup' },
    { label: 'Lelivrescolaire.fr — Maths', url: 'https://www.lelivrescolaire.fr/matiere/mathematiques', desc: 'Cours et exercices conformes aux programmes, gratuits.', tag: 'Cours' },
  ],
  'Physique': [
    { label: 'Lumni — Physique-Chimie', url: 'https://www.lumni.fr/lycee', desc: 'Vidéos pédagogiques officielles, niveau lycée.', tag: 'Vidéos' },
  ],
  'Chimie': [
    { label: 'Chimie — EduMedia Sciences', url: 'https://www.edumedia-sciences.com/fr/', desc: 'Animations interactives de chimie et de physique, lycée/prépa.', tag: 'Interactif' },
  ],
  'SVT': [
    { label: 'Lumni — SVT', url: 'https://www.lumni.fr/lycee', desc: 'Vidéos documentaires SVT, programmes lycée officiels.', tag: 'Vidéos' },
    { label: 'Futura Sciences — Planète & Vie', url: 'https://www.futura-sciences.com/planete/', desc: 'Articles scientifiques vulgarisés + glossaire précis.', tag: 'Vulgarisation' },
  ],
  'Français': [
    { label: 'Projet Voltaire', url: 'https://www.projet-voltaire.fr', desc: 'Entraînement à l\'orthographe et à la grammaire avec explications.', tag: 'Orthographe' },
    { label: 'Bac de Français', url: 'https://www.bacdefrancais.net', desc: 'Fiches méthode bac français, explications linéaires, dissertations.', tag: 'Méthode Bac' },
    { label: 'Bescherelle', url: 'https://bescherelle.com', desc: 'Conjugueur de référence : tous les verbes, tous les temps.', tag: 'Conjugaison' },
  ],
  'Histoire': [
    { label: 'Lumni — Histoire', url: 'https://www.lumni.fr/college', desc: 'Vidéos pédagogiques de l\'INA, programmes collège et lycée.', tag: 'Vidéos' },
    { label: 'Herodote.net', url: 'https://www.herodote.net', desc: 'Encyclopédie d\'histoire fiable avec chronologies détaillées.', tag: 'Encyclopédie' },
    { label: 'Vie publique — Dossiers Hist.', url: 'https://www.vie-publique.fr', desc: 'Dossiers thématiques officiels sur l\'histoire et la société française.', tag: 'Dossiers' },
  ],
  'Géographie': [
    { label: 'Géoconfluences ENS Lyon', url: 'https://geoconfluences.ens-lyon.fr', desc: 'Ressources de géographie validées par des enseignants-chercheurs.', tag: 'Référence' },
    { label: 'Lumni — Géographie', url: 'https://www.lumni.fr/college', desc: 'Vidéos documentaires programmes officiels.', tag: 'Vidéos' },
  ],
  'Anglais': [
    { label: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', desc: 'Grammaire, vocabulaire, podcasts et quiz par la BBC.', tag: 'Grammaire & Écoute' },
    { label: 'Perfect English Grammar', url: 'https://www.perfect-english-grammar.com', desc: 'Exercices de grammaire anglaise, tous niveaux, gratuit.', tag: 'Exercices' },
    { label: 'WordReference', url: 'https://www.wordreference.com/fr/en/', desc: 'Dictionnaire bilingue + forum de questions de traduction.', tag: 'Dictionnaire' },
  ],
  'Espagnol': [
    { label: 'Cervantes Virtual', url: 'https://www.cervantes.es', desc: 'Institut Cervantes : grammaire et ressources officielles en espagnol.', tag: 'Référence' },
    { label: 'WordReference ES-FR', url: 'https://www.wordreference.com/esfr/', desc: 'Dictionnaire espagnol-français avec exemples.', tag: 'Dictionnaire' },
  ],
  'Philosophie': [
    { label: 'La Philosophie.com', url: 'https://la-philosophie.com', desc: 'Définitions, notions et auteurs — cours de philo lycée.', tag: 'Notions' },
    { label: 'Les Philosophes.fr', url: 'https://les-philosophes.fr', desc: 'Présentation des grands philosophes et de leurs thèses.', tag: 'Auteurs' },
  ],
  'Économie/SES': [
    { label: 'SES-ENS Lyon', url: 'https://ses.ens-lyon.fr', desc: 'Ressources SES validées pour lycée et prépa, rigoureuses.', tag: 'Référence' },
    { label: 'INSEE — Statistiques', url: 'https://www.insee.fr/fr/statistiques', desc: 'Données statistiques officielles pour illustrer les dissertations.', tag: 'Données' },
  ],
  'NSI/Informatique': [
    { label: 'France-ioi', url: 'https://www.france-ioi.org', desc: 'Exercices d\'algorithmique progressifs, du débutant au concours.', tag: 'Algorithmique' },
    { label: 'OpenClassrooms — Python', url: 'https://openclassrooms.com/fr/courses/7168871', desc: 'Cours Python gratuit, structuré et certifiable.', tag: 'Python' },
    { label: 'NSI Lycée', url: 'https://pixees.fr/informatiquelycee/', desc: 'Cours officiels NSI complets par David Roche, alignés sur le programme.', tag: 'Cours NSI' },
  ],
  'Allemand': [
    { label: 'Deutsche Welle — Apprendre', url: 'https://www.dw.com/fr/', desc: 'Cours et actualités en allemand, tous niveaux, par la DW.', tag: 'Cours' },
    { label: 'PONS Dictionnaire', url: 'https://fr.pons.com', desc: 'Dictionnaire allemand-français fiable, avec exemples.', tag: 'Dictionnaire' },
  ],
};

// ─── Données de navigation ────────────────────────────────────────────────────
const SUBJECTS_LIST = [
  { id: 'Maths',            icon: Calculator, color: 'text-chart-1' },
  { id: 'Physique',         icon: FlaskConical, color: 'text-chart-2' },
  { id: 'Chimie',           icon: FlaskConical, color: 'text-chart-2' },
  { id: 'SVT',              icon: BookOpen, color: 'text-success' },
  { id: 'Histoire',         icon: Globe, color: 'text-chart-3' },
  { id: 'Géographie',       icon: Globe, color: 'text-chart-4' },
  { id: 'Français',         icon: Pencil, color: 'text-primary' },
  { id: 'Anglais',          icon: Languages, color: 'text-chart-1' },
  { id: 'Espagnol',         icon: Languages, color: 'text-chart-3' },
  { id: 'Allemand',         icon: Languages, color: 'text-chart-4' },
  { id: 'Philosophie',      icon: BookMarked, color: 'text-chart-2' },
  { id: 'Économie/SES',     icon: BarChart2, color: 'text-chart-3' },
  { id: 'NSI/Informatique', icon: Code, color: 'text-primary' },
];

const ULIS_FICHES: FicheMethode[] = [
  // ── Vie quotidienne ──────────────────────────────────────────────────────────
  {
    id: 'u1', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Lire l\'heure sur une horloge', type: 'Vie pratique',
    steps: [
      { label: 'Regarde la petite aiguille', detail: 'La PETITE aiguille indique les HEURES. Elle est plus courte.' },
      { label: 'Regarde la grande aiguille', detail: 'La GRANDE aiguille indique les MINUTES. Elle tourne plus vite.' },
      { label: 'Si la grande aiguille est sur 12', detail: 'Il est pile l\'heure. Exemple : petite sur 3 + grande sur 12 = 3 heures.' },
      { label: 'Si la grande aiguille est sur 6', detail: 'Il est "et demie" (30 minutes). Petite entre 4 et 5 + grande sur 6 = 4h30.' },
      { label: 'Compter par 5 pour les minutes', detail: 'Chaque chiffre du cadran = 5 minutes. Chiffre 1 = 5 min, chiffre 2 = 10 min…' },
    ],
    conseil: '🎯 Entraîne-toi avec une vraie horloge ou ton réveil. 5 minutes chaque matin et tu mémoriseras vite !',
    exemple: 'Petite aiguille sur 7, grande aiguille sur 3 → 7 heures et quart (7h15) ⏰',
  },
  {
    id: 'u4', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Lire un emploi du temps', type: 'Vie pratique',
    steps: [
      { label: 'Trouve le jour d\'aujourd\'hui', detail: 'Regarde en haut de la colonne : Lundi, Mardi, Mercredi… Trouve le jour où tu es.' },
      { label: 'Lis la ligne de l\'heure', detail: 'Sur la gauche tu vois les heures (8h, 9h, 10h…). Cherche l\'heure actuelle.' },
      { label: 'Croise colonne + ligne', detail: 'La case où la colonne (jour) et la ligne (heure) se croisent = ton cours en ce moment.' },
      { label: 'Prépare le matériel pour le cours suivant', detail: 'Regarde la case juste en dessous pour savoir ce qui vient après la récré.' },
    ],
    conseil: '📅 Colle une photo de ton emploi du temps dans ton agenda ou sur ton téléphone pour l\'avoir toujours avec toi.',
    exemple: 'Mardi à 10h → case "Mardi / 10h" = Mathématiques → je prends mon cahier de maths 📐',
  },
  {
    id: 'u5', subject: 'Vie quotidienne', niveau: ['ULIS/SEGPA'], titre: 'Préparer son cartable', type: 'Vie pratique',
    steps: [
      { label: 'Regarde ton emploi du temps du lendemain', detail: 'Lis chaque matière inscrite pour la journée de demain.' },
      { label: 'Prends le cahier de chaque matière', detail: 'Pour chaque matière, mets dans le cartable : le cahier ET le livre si tu en as un.' },
      { label: 'Vérifie les affaires communes', detail: 'Règle, crayon, gomme, stylo → ils doivent être dans ton plumier CHAQUE jour.' },
      { label: 'Referme et soulève le cartable', detail: 'S\'il est trop lourd, enlève ce qui n\'est pas pour demain.' },
    ],
    conseil: '✅ Fais-le le soir avant, jamais le matin en vitesse. Tu risques d\'oublier quelque chose si tu es fatigué.',
    exemple: 'Demain : maths + français + EPS → cahier maths, cahier français, affaires de sport 🎒',
  },
  // ── Calcul ───────────────────────────────────────────────────────────────────
  {
    id: 'u2', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Faire une addition avec des dizaines', type: 'Calcul',
    steps: [
      { label: 'Écris les chiffres en colonnes', detail: 'Unités sous unités, dizaines sous dizaines. Sers-toi de papier quadrillé !' },
      { label: 'Commence par les unités (à droite)', detail: 'Additionne les chiffres de droite d\'abord. Si le résultat est ≥ 10, tu "retiens" 1.' },
      { label: 'Note la retenue au-dessus', detail: 'Écris le petit "1" au-dessus de la colonne des dizaines pour ne pas l\'oublier.' },
      { label: 'Additionne les dizaines', detail: 'N\'oublie pas d\'ajouter la retenue ! Additionne les trois chiffres si besoin.' },
      { label: 'Lis le résultat', detail: 'Lis le nombre de gauche à droite. C\'est ta réponse !' },
    ],
    conseil: '✅ Tu peux utiliser tes doigts pour les unités. Il n\'y a aucune honte — c\'est une stratégie, pas une faiblesse.',
    exemple: '47 + 35 → unités : 7+5=12 → pose 2, retiens 1 → dizaines : 4+3+1=8 → résultat : 82',
  },
  {
    id: 'u6', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Faire une soustraction simple', type: 'Calcul',
    steps: [
      { label: 'Écris le grand nombre en haut', detail: 'Le plus grand chiffre va toujours EN HAUT. L\'autre va en dessous.' },
      { label: 'Commence par les unités (à droite)', detail: 'Soustrait le chiffre du bas au chiffre du haut. Si c\'est impossible, "emprunte" 1 dizaine.' },
      { label: 'Si tu empruntes', detail: 'Raye la dizaine du haut, mets-en une de moins et ajoute 10 aux unités du haut.' },
      { label: 'Calcule les dizaines', detail: 'Retire maintenant les dizaines. N\'oublie pas d\'enlever 1 si tu avais emprunté.' },
      { label: 'Vérifie par addition', detail: 'Pour vérifier : résultat + chiffre du bas = chiffre du haut ? Si oui, c\'est bon !' },
    ],
    conseil: '🔢 Utilise une frise numérique ou tes doigts. Dessine des bâtons si besoin — tous les moyens sont bons.',
    exemple: '53 − 27 → unités : 3 < 7, j\'emprunte → 13−7=6 → dizaines : 4−2=2 → résultat : 26 ✓ (26+27=53 ✓)',
  },
  {
    id: 'u7', subject: 'Calcul', niveau: ['ULIS/SEGPA'], titre: 'Mémoriser la table de multiplication par 2', type: 'Calcul',
    steps: [
      { label: 'Comprends ce que ça veut dire', detail: '2 × 3 = ajouter 2 trois fois → 2 + 2 + 2 = 6. Multiplier par 2 = doubler.' },
      { label: 'Apprends avec les doigts', detail: 'Compte de 2 en 2 sur tes doigts : 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.' },
      { label: 'Fais des flashcards', detail: 'Écris "2×6 = ?" d\'un côté, "12" de l\'autre. Joue au quiz avec toi-même ou un ami.' },
      { label: 'Répète 5 minutes par jour', detail: 'Chaque soir avant de dormir, récite la table de 2 à voix haute ou en chantant.' },
    ],
    conseil: '🎵 Mets la table en chanson sur un air que tu aimes. La musique aide beaucoup à mémoriser !',
    exemple: '2×1=2 · 2×2=4 · 2×3=6 · 2×4=8 · 2×5=10 · 2×6=12 · 2×7=14 · 2×8=16 · 2×9=18 · 2×10=20',
  },
  // ── Lecture & Français ───────────────────────────────────────────────────────
  {
    id: 'u3', subject: 'Lecture', niveau: ['ULIS/SEGPA'], titre: 'Trouver l\'idée principale d\'un texte', type: 'Lecture',
    steps: [
      { label: 'Lis le titre', detail: 'Le titre dit souvent DE QUOI parle le texte. C\'est ton premier indice !' },
      { label: 'Lis la 1ère et la dernière phrase', detail: 'L\'idée principale est souvent au début ou à la fin du texte.' },
      { label: 'Demande-toi : "De quoi ça parle ?"', detail: 'En UNE phrase simple, dis le sujet du texte. "Ce texte parle de…"' },
      { label: 'Cherche les mots qui reviennent souvent', detail: 'Les mots répétés sont importants. Ce sont les mots-clés du texte.' },
      { label: 'Écris ta réponse', detail: 'Commence ta phrase par "L\'idée principale de ce texte est…"' },
    ],
    conseil: '💡 Si tu ne comprends pas un mot, saute-le et continue. Tu comprendras souvent le sens grâce au reste.',
    exemple: 'Un texte où "lion", "savane", "chasse" reviennent souvent → idée principale : la vie du lion en Afrique 🦁',
  },
  {
    id: 'u8', subject: 'Français', niveau: ['ULIS/SEGPA'], titre: 'Comprendre une consigne d\'exercice', type: 'Méthode',
    steps: [
      { label: 'Lis la consigne deux fois', detail: 'Lis d\'abord vite, puis lis lentement en t\'arrêtant sur chaque mot important.' },
      { label: 'Souligne le verbe d\'action', detail: 'Cherche le mot qui dit QUOI FAIRE : "entoure", "recopie", "relie", "calcule", "colorie"…' },
      { label: 'Souligne l\'objet de l\'action', detail: 'Sur QUOI tu dois faire l\'action ? "les verbes", "les mots en gras", "les nombres pairs"…' },
      { label: 'Reformule avec tes mots', detail: 'Dis à voix basse : "Je dois ___ les ___". Si tu n\'y arrives pas, demande à l\'enseignant.' },
      { label: 'Commence par un exemple', detail: 'Fais d\'abord le 1er élément pour vérifier que tu as bien compris avant de continuer.' },
    ],
    conseil: '🙋 Demander de l\'aide quand on ne comprend pas une consigne, c\'est intelligent, pas une faiblesse.',
    exemple: '"Entoure les verbes conjugués" → verbe d\'action = entoure · objet = verbes conjugués → je cherche les verbes ✏️',
  },
  {
    id: 'u9', subject: 'Français', niveau: ['ULIS/SEGPA'], titre: 'Écrire une phrase complète', type: 'Écriture',
    steps: [
      { label: 'Commence par un sujet (QUI ?)', detail: 'Le sujet = la personne ou la chose dont tu parles. Ex : "Le chien", "Ma sœur", "Je".' },
      { label: 'Ajoute un verbe (FAIT QUOI ?)', detail: 'Le verbe = l\'action. Ex : "mange", "court", "aime", "est".' },
      { label: 'Complète si besoin (QUOI / OÙ / QUAND ?)', detail: 'Ajoute des informations : "mange une pomme", "court dans le jardin".' },
      { label: 'Commence par une majuscule', detail: 'Le 1er mot de la phrase prend TOUJOURS une majuscule.' },
      { label: 'Termine par un point', detail: 'Chaque phrase se termine par . (point) ou ? (question) ou ! (exclamation).' },
    ],
    conseil: '✍️ Si tu veux écrire mais les lettres sont dures, essaie de dicter à voix haute d\'abord, puis recopie.',
    exemple: '"Le chien mange son repas dans la cuisine." → Sujet : Le chien · Verbe : mange · Complément : son repas dans la cuisine 🐶',
  },
  // ── SEGPA — Orientation professionnelle ──────────────────────────────────────
  {
    id: 'u10', subject: 'Orientation', niveau: ['ULIS/SEGPA'], titre: 'Découvrir les métiers qui m\'intéressent', type: 'Orientation',
    steps: [
      { label: 'Fais la liste de ce que tu aimes faire', detail: 'Cuisiner ? Réparer des trucs ? Aider les gens ? Travailler dehors ? Tout noter, même si ça semble petit.' },
      { label: 'Cherche les métiers liés à tes goûts', detail: 'Aimes les animaux → soigneur animalier, vétérinaire, eleveur. Aimes cuisiner → cuisinier, boulanger, pâtissier.' },
      { label: 'Explore sur l\'ONISEP', detail: 'Va sur onisep.fr → "Découvrir les métiers" → tape un mot-clé. Tu verras le salaire, la formation, les débouchés.' },
      { label: 'Demande un stage d\'observation', detail: 'En SEGPA dès la 5e, tu peux visiter des entreprises. Parle-en à ton professeur principal.' },
    ],
    conseil: '🔍 Il n\'y a pas de mauvais métier. Un métier qui te plaît vraiment = tu seras meilleur et plus heureux.',
    exemple: 'J\'aime cuisiner → recherche "cuisinier" sur ONISEP → CAP Cuisine en 2 ans après le collège → plusieurs débouchés 🍳',
  },
  {
    id: 'u11', subject: 'Orientation', niveau: ['ULIS/SEGPA'], titre: 'Comprendre les diplômes après la SEGPA', type: 'Orientation',
    steps: [
      { label: 'La SEGPA mène au lycée professionnel', detail: 'Après le collège SEGPA, la plupart des élèves entrent en lycée professionnel (LP) pour préparer un CAP ou un Bac Pro.' },
      { label: 'Le CAP en 2 ans', detail: 'CAP = Certificat d\'Aptitude Professionnelle. 2 ans en lycée pro. Beaucoup de pratique. Tu sors avec un vrai diplôme métier.' },
      { label: 'Le Bac Pro en 3 ans', detail: 'Après un CAP (ou directement), tu peux faire un Bac Professionnel en 3 ans. Il ouvre des portes vers des postes plus élevés.' },
      { label: 'Les métiers SEGPA les plus courants', detail: 'Cuisine, boulangerie, coiffure, maçonnerie, menuiserie, mécanique auto, vente, aide à la personne, horticulture…' },
    ],
    conseil: 'Des élèves SEGPA deviennent chefs cuisinier, artisans, entrepreneurs. Le diplôme professionnel, c\'est un vrai tremplin.',
    exemple: 'SEGPA → lycée pro → CAP Boulangerie (2 ans) → Bac Pro Boulanger-Pâtissier (3 ans) → emploi ou BTS 🎓',
  },
  {
    id: 'u12', subject: 'Vie sociale', niveau: ['ULIS/SEGPA'], titre: 'Demander de l\'aide à un adulte', type: 'Vie pratique',
    steps: [
      { label: 'Identifie ce que tu ne comprends pas', detail: 'Dis-toi d\'abord ce qui est dur. "Je ne comprends pas la consigne." ou "Je n\'arrive pas à lire ce mot."' },
      { label: 'Choisit le bon moment', detail: 'Attends que le prof soit disponible (pas quand il explique à la classe). Lève la main ou attends la fin de la question.' },
      { label: 'Utilise une phrase simple', detail: '"Excusez-moi, je n\'ai pas compris…" ou "Je peux avoir de l\'aide pour…?" C\'est suffisant.' },
      { label: 'Écoute la réponse', detail: 'Regarde la personne qui t\'explique. Dis "merci" après. Si tu n\'as toujours pas compris, tu peux redemander.' },
    ],
    conseil: '🤝 Les adultes VEULENT t\'aider. Demander de l\'aide, c\'est ce que font les personnes intelligentes — pas les faibles.',
    exemple: '"Excusez-moi madame, je n\'ai pas compris la question 3. Est-ce que vous pouvez m\'expliquer ?" ✋',
  },
];

// ─── Composants ───────────────────────────────────────────────────────────────
const FicheCard: React.FC<{ fiche: FicheMethode }> = ({ fiche }) => {
  const [open, setOpen] = useState(false);
  const [lectureOpen, setLectureOpen] = useState(false);
  const isUlis = fiche.niveau.includes('ULIS/SEGPA');

  return (<>
    <Card className={`h-full flex flex-col ${isUlis ? 'border-success/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-balance leading-snug flex-1 min-w-0">
            {fiche.titre}
          </CardTitle>
          <Badge variant="outline" className={`text-xs shrink-0 whitespace-nowrap ${isUlis ? 'border-success/40 text-success' : 'border-primary/30 text-primary'}`}>
            {fiche.type}
          </Badge>
        </div>
        <div className="flex gap-1 flex-wrap mt-1">
          {fiche.niveau.map(n => (
            <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* Aperçu condensé — étape 1 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">1</span>
          <p className="text-pretty leading-snug">{fiche.steps[0].label}</p>
        </div>

        {/* Détail dépliable */}
        {open && (
          <div className="space-y-2 text-sm">
            {fiche.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="text-muted-foreground text-pretty leading-snug">{step.detail}</p>
                </div>
              </div>
            ))}
            {fiche.exemple && (
              <div className="mt-2 p-2.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-mono leading-relaxed">
                <span className="font-semibold text-primary mr-1">Ex :</span>{fiche.exemple}
              </div>
            )}
            <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-muted-foreground text-pretty">{fiche.conseil}</p>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          {/* 🔊 Bouton Lecture Guidée — toujours visible */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => setLectureOpen(true)}
            aria-label="Écouter les étapes à voix haute"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            🔊 Écouter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
          >
            {open
              ? <><ChevronDown className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Réduire</>
              : <><ChevronRight className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Voir toutes les étapes ({fiche.steps.length})</>}
          </Button>
          {open && (
            <ExportButton
              fileName={`fiche-${fiche.id}`}
              variant="ghost"
              size="sm"
              label="Télécharger"
              getContent={(): ExportContent => ({
                title: fiche.titre,
                subtitle: `Matière : ${fiche.subject} · ${fiche.niveau.join(', ')} · Type : ${fiche.type}`,
                sections: [
                  ...fiche.steps.map((s, i) => ({
                    heading: `Étape ${i + 1} — ${s.label}`,
                    body: s.detail,
                  })),
                  { heading: 'Conseil', body: fiche.conseil },
                  ...(fiche.exemple ? [{ heading: 'Exemple', body: fiche.exemple }] : []),
                ],
              })}
            />
          )}
        </div>
      </CardContent>
    </Card>

    {/* Mode Lecture Guidée plein écran */}
    {lectureOpen && (
      <LectureGuideeModal fiche={fiche} onClose={() => setLectureOpen(false)} />
    )}
  </>);
};

// ─── Page principale ──────────────────────────────────────────────────────────
const AideIAPage: React.FC = () => {
  const navigate = useNavigate();
  const { addActivity, addXp, level } = useApp();

  // ── État fiches / ressources ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  // Auto-activé si le niveau du profil est ULIS ou SEGPA
  const [ulisMode, setUlisMode] = useState(() =>
    level === 'ULIS' || level === 'SEGPA'
  );
  const [activeTab, setActiveTab] = useState<'fiches' | 'ressources'>('fiches');

  // Synchronise ulisMode si l'utilisateur change de niveau depuis son profil
  useEffect(() => {
    setUlisMode(level === 'ULIS' || level === 'SEGPA');
  }, [level]);

  // ── Chat IA ──────────────────────────────────────────────────────────────
  interface ChatMessage { role: 'user' | 'model'; text: string; }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSubject, setChatSubject] = useState<string>('all');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleChatSend = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    setChatInput('');
    setChatError('');

    const matiere = chatSubject !== 'all' ? chatSubject : null;
    const systemCtx = matiere
      ? `Tu es un professeur expert en ${matiere} pour le collège et le lycée français. Réponds en français, clairement et de façon pédagogique.`
      : `Tu es un professeur expert pour le collège et le lycée français, spécialisé dans toutes les matières. Réponds en français, clairement et de façon pédagogique.`;

    // Construire l'historique LLM
    const history: LLMMessage[] = [
      { role: 'user', parts: [{ text: systemCtx }] },
      { role: 'model', parts: [{ text: 'Compris. Je suis prêt à t\'aider. Quelle est ta question ?' }] },
      ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: q }] },
    ];

    setChatMessages(prev => [...prev, { role: 'user', text: q }]);

    setChatLoading(true);
    abortRef.current = new AbortController();

    // Placeholder streaming
    setChatMessages(prev => [...prev, { role: 'model', text: '' }]);
    try {
      let accumulated = '';
      await callLLM(history, {
        signal: abortRef.current.signal,
        onChunk: chunk => {
          accumulated += chunk;
          setChatMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'model', text: accumulated };
            return copy;
          });
        },
      });
      addActivity(`Question IA : ${q.slice(0, 60)}`);
      addXp(5);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setChatMessages(prev => prev.slice(0, -1)); // retire le placeholder vide
        return;
      }
      setChatError(err instanceof Error ? err.message : 'Erreur IA');
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setChatMessages([]);
    setChatError('');
    setChatLoading(false);
  };

  // ── État formulaire question → enseignant ────────────────────────────────
  const [question, setQuestion] = useState('');
  const [qSubject, setQSubject] = useState<string>('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendQuestion = async () => {
    const q = question.trim();
    if (!q) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Connecte-toi pour envoyer une question à un enseignant.', {
        action: { label: 'Se connecter', onClick: () => navigate('/connexion') },
      });
      return;
    }
    setSending(true);
    try {
      await createStudentQuestion({
        subject: qSubject !== 'all' ? qSubject : 'Général',
        level: 'Tous niveaux',
        title: q.length > 80 ? q.slice(0, 80) + '…' : q,
        content: q,
        status: 'open',
      });
      toast.success('Question envoyée ! Un enseignant répondra bientôt.', { duration: 4000 });
      setSent(true);
      setQuestion('');
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessaie.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setSent(false);
  };

  const fichesSource = ulisMode ? ULIS_FICHES : FICHES;

  const filtered = useMemo(() => {
    return fichesSource.filter(f => {
      const matchSubject = selectedSubject === 'all' || f.subject === selectedSubject;
      const q = search.toLowerCase();
      const matchSearch = !q || f.titre.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.subject.toLowerCase().includes(q) || f.steps.some(s => s.label.toLowerCase().includes(q));
      return matchSubject && matchSearch;
    });
  }, [fichesSource, selectedSubject, search]);

  const ressourcesList: Ressource[] = selectedSubject === 'all'
    ? Object.values(RESSOURCES).flat()
    : (RESSOURCES[selectedSubject] ?? []);

  return (
    <div className="min-w-0 space-y-4">
    <h1 className="sr-only">Aide aux devoirs gratuite</h1>
      <SEO
        title="Aide aux devoirs gratuite — Fiches méthode & Ressources vérifiées | Apprenix"
        description="Fiches méthode, exercices résolus et ressources pédagogiques pour toutes les matières. Collège, Lycée, ULIS/SEGPA. Gratuit, zéro génération automatique."
        canonical="/aide-ia"
        keywords="aide devoirs gratuite, fiches méthode scolaire, exercices résolus, ressources pédagogiques vérifiées, aide collège lycée, méthode dissertation, grammaire français, Khan Academy, Sésamath, aide ULIS SEGPA"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          "name": "Aide aux devoirs — Fiches méthode & Ressources | Apprenix",
          "description": "Fiches méthode pas-à-pas et ressources vérifiées pour toutes les matières scolaires.",
          "url": "https://apprenix.org/aide-ia",
          "inLanguage": "fr-FR",
          "isAccessibleForFree": true,
          "educationalLevel": "Collège, Lycée, ULIS, SEGPA"
        }}
      />

      {/* Hero */}
      <PageHero
        variant="tool"
        icon={BookOpen}
        badge={<>📚 Aide aux devoirs</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Aide aux devoirs — Méthodes & Fiches"
        subtitle="Des fiches méthode rédigées avec soin, des exercices commentés étape par étape, des ressources pédagogiques vérifiées — pour vraiment comprendre, pas juste copier."
        stats={[
          { value: String(FICHES.length + ULIS_FICHES.length), label: 'Fiches méthode' },
          { value: String(Object.values(RESSOURCES).flat().length), label: 'Ressources vérifiées' },
          { value: 'ULIS', label: 'Mode adapté inclus' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* ── CHAT IA — section principale (réponse instantanée) ──────────────── */}
      <Card className="border-primary/25 bg-gradient-to-br from-primary/5 to-transparent shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <Sparkles className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Assistant IA — Réponse instantanée
          </CardTitle>
          <p className="text-sm text-muted-foreground text-pretty">
            Pose ta question directement à l'IA — explication immédiate, étape par étape. Aucune attente.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filtres matière */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={chatSubject} onValueChange={setChatSubject}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Matière de la question">
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {SUBJECTS_LIST.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {chatMessages.length > 0 && (
              <Button variant="outline" size="sm" className="h-9 gap-1.5 shrink-0 self-start" onClick={clearChat}>
                <X className="w-3.5 h-3.5" aria-hidden="true" /> Effacer la conversation
              </Button>
            )}
          </div>

          {/* Zone de conversation */}
          {chatMessages.length > 0 && (
            <div className="rounded-xl border border-border bg-background max-h-96 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-pretty ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    {msg.role === 'model'
                      ? msg.text
                          ? <div>
                              <div>
                                {msg.text.split('\n').map((line, li) => {
                                  const parts = line.split(/\*\*(.*?)\*\*/g);
                                  const node = parts.map((p, j) =>
                                    j % 2 === 1 ? <strong key={j}>{p}</strong> : p
                                  );
                                  return <span key={li}>{node}{li < msg.text.split('\n').length - 1 && <br />}</span>;
                                })}
                              </div>
                              {/* Bouton lire à voix haute la réponse IA */}
                              <button
                                type="button"
                                onClick={() => {
                                   if (window.speechSynthesis) {
                                     window.speechSynthesis.cancel();
                                     unlockAudioContext();
                                     const utt = buildUtterance(msg.text.replace(/\*\*/g, ''), { rate: 0.9 });
                                     window.speechSynthesis.speak(utt);
                                   }
                                 }}
                                className="inline-flex items-center gap-1 mt-2 text-xs text-primary/70 hover:text-primary transition-colors"
                                aria-label="Lire cette réponse à voix haute"
                              >
                                <Volume2 className="w-3 h-3" aria-hidden="true" />
                                Écouter
                              </button>
                            </div>
                          : <span className="inline-flex gap-1 items-center text-muted-foreground text-xs">
                              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Rédaction en cours…
                            </span>
                      : msg.text
                    }
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs" aria-hidden="true">🎓</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* Suggestions rapides */}
          {chatMessages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {[
                'Comment résoudre une équation du 2nd degré ?',
                'Explique-moi la photosynthèse',
                'Qu\'est-ce que le cogito de Descartes ?',
                'Comment rédiger une introduction ?',
              ].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setChatInput(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors min-h-[36px]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Erreur */}
          {chatError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-destructive text-pretty">{chatError}</p>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="flex gap-2">
            <input
              type="text"
              aria-label="Poser une question à l'IA"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && void handleChatSend()}
              placeholder="Ex : Comment résoudre 2x² − 5x + 2 = 0 ?"
              disabled={chatLoading}
              className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            />
            <Button
              onClick={() => void handleChatSend()}
              disabled={chatLoading || !chatInput.trim()}
              className="h-10 px-4 gap-1.5 shrink-0 bg-primary text-primary-foreground"
              aria-label="Envoyer la question"
            >
              {chatLoading
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <Send className="w-4 h-4" aria-hidden="true" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
            L'IA explique et guide — pour une correction humaine garantie, utilise le formulaire ci-dessous.
          </p>
        </CardContent>
      </Card>

      {/* ── BLOC BASE DE RÉPONSES — mise en avant prioritaire ─────────────────── */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-foreground text-balance leading-snug">
                Cherche d'abord dans notre base de 100 000 réponses
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                Vérifiées par des enseignants certifiés · Maths, Français, SVT, Philo, Histoire, Anglais…
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/base-reponses')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity min-h-[40px] whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              Chercher une réponse
            </button>
          </div>
        </div>
      </div>

      {/* ── POSER UNE QUESTION À UN ENSEIGNANT ───────────────────────────────── */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <UserCheck className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Pose ta question à un enseignant
          </CardTitle>
          <p className="text-sm text-muted-foreground text-pretty">
            Décris ton exercice ou ta difficulté — un enseignant te répondra personnellement.
            <span className="ml-1 font-medium text-primary">Réponse humaine garantie.</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {sent ? (
            /* Confirmation envoi */
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
                <Send className="w-6 h-6 text-success" aria-hidden="true" />
              </div>
              <p className="font-semibold text-foreground">Question envoyée !</p>
              <p className="text-sm text-muted-foreground text-pretty">Un enseignant te répondra bientôt dans <strong>Mes Questions</strong>.</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Nouvelle question
                </Button>
                <Button size="sm" onClick={() => navigate('/mes-questions')} className="gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> Voir mes questions
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Ligne matière */}
              <Select value={qSubject} onValueChange={setQSubject}>
                <SelectTrigger className="w-full md:w-52" aria-label="Choisir une matière">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {SUBJECTS_LIST.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Zone saisie */}
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ex : Je n'arrive pas à résoudre cette équation du 2nd degré : 2x² − 5x + 2 = 0. Peux-tu m'expliquer chaque étape ?"
                className="min-h-[120px] resize-none text-sm"
                aria-label="Saisir ta question"
                disabled={sending}
              />

              {/* Bouton principal */}
              <Button
                onClick={handleSendQuestion}
                disabled={sending || !question.trim()}
                className="w-full gap-2"
              >
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Envoi en cours…</>
                  : <><Send className="w-4 h-4" aria-hidden="true" />Envoyer ma question à un enseignant</>
                }
              </Button>

              {/* Garantie humain */}
              <p className="text-sm text-muted-foreground text-pretty">
                <Lightbulb className="w-3 h-3 inline mr-1 text-primary" aria-hidden="true" />
                Toutes les réponses sont rédigées par de vraies personnes — zéro génération automatique, zéro contenu inventé.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bandeau mode ULIS/SEGPA */}
      <div className={`rounded-xl border-2 transition-colors duration-200 ${ulisMode ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'}`}>
        <button type="button"
          onClick={() => { setUlisMode(v => !v); setSelectedSubject('all'); }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
          aria-pressed={ulisMode}
          aria-label="Activer ou désactiver le mode ULIS / SEGPA"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ulisMode ? 'bg-success/15' : 'bg-muted'}`}>
              <Heart className={`w-4 h-4 ${ulisMode ? 'text-success' : 'text-muted-foreground'}`} aria-hidden="true" />
            </div>
            <div className="text-left min-w-0">
              <p className={`text-sm font-semibold ${ulisMode ? 'text-success' : 'text-foreground'}`}>Mode ULIS / SEGPA</p>
              <p className="text-sm text-muted-foreground text-pretty">Mots simples · Étapes courtes · Exemples du quotidien</p>
            </div>
          </div>
          <Badge className={`shrink-0 ml-3 text-xs ${ulisMode ? 'bg-success/15 text-success border-success/30' : 'bg-secondary text-muted-foreground border-border'}`}>
            {ulisMode ? 'Activé ✓' : 'Désactivé'}
          </Badge>
        </button>
      </div>

      {/* Onglets Fiches / Ressources */}
      <div className="flex rounded-xl border border-border overflow-hidden" role="tablist" aria-label="Type de contenu">
        {([
          { id: 'fiches', label: '📋 Fiches méthode' },
          { id: 'ressources', label: '🛠️ Outils Apprenix' },
        ] as const).map(tab => (
          <button type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs md:text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Rechercher une méthode, une notion…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Rechercher une fiche méthode"
            autoComplete="off"
          />
        </div>
        {!ulisMode && (
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-52" aria-label="Filtrer par matière">
              <SelectValue placeholder="Toutes les matières" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {SUBJECTS_LIST.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Panel : Fiches méthode */}
      {activeTab === 'fiches' && (
        <div id="panel-fiches" role="tabpanel" aria-label="Fiches méthode" className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Aucune fiche ne correspond à cette recherche.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{filtered.length} fiche{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(f => <FicheCard key={f.id} fiche={f} />)}
              </div>
            </>
          )}

          {/* Encart méthode de travail */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 flex gap-4">
              <Target className="w-8 h-8 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground text-balance">La méthode, c\'est 80 % du travail</p>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Comprendre <em>comment</em> résoudre un problème vaut bien plus que d\'en avoir la solution. Chaque fiche ici t\'apprend une démarche réutilisable dans tous tes exercices du même type.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panel : Outils Apprenix */}
      {activeTab === 'ressources' && (
        <div id="panel-ressources" role="tabpanel" aria-label="Outils Apprenix" className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/25 bg-primary/5">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <p className="text-xs font-medium text-primary">100 % Apprenix — tout est intégré, rien à quitter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              { icon: '🃏', title: 'Flashcards', desc: 'Révise par répétition espacée — crée tes propres cartes ou utilise celles des enseignants', path: '/flashcards', cta: 'Ouvrir les flashcards' },
              { icon: '📝', title: 'Quiz & QCM', desc: 'Teste tes connaissances sur toutes les matières — corrigés instantanés', path: '/quiz', cta: 'Faire un quiz' },
              { icon: '📅', title: 'Planning de révision', desc: 'Organise tes révisions avec un planning personnalisé par matière et niveau', path: '/planning', cta: 'Voir mon planning' },
              { icon: '📸', title: 'Scanner de devoirs', desc: 'Prends en photo ton exercice — notre enseignant te répond par message', path: '/scanner', cta: 'Scanner un devoir' },
              { icon: '📚', title: 'Fiches de révision', desc: 'Toutes les fiches méthode rédigées par nos enseignants, par matière et niveau', path: '/ressources', cta: 'Voir les fiches' },
              { icon: '🏆', title: 'Mes progrès', desc: 'Suis tes résultats, tes badges et ta progression semaine par semaine', path: '/profil', cta: 'Voir mes progrès' },
            ] as const).map(tool => (
              <button
                key={tool.path}
                type="button"
                onClick={() => { addActivity(`Outil → ${tool.title}`); navigate(tool.path); }}
                className="group text-left flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
              >
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{tool.desc}</p>
                  <p className="text-xs text-primary font-medium mt-2">{tool.cta} →</p>
                </div>
              </button>
            ))}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex gap-3">
              <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-muted-foreground text-pretty">
                <strong className="text-foreground">Apprenix est 100 % indépendant.</strong> Tous les contenus, exercices et outils sont créés et vérifiés par nos enseignants — sans redirection vers des sites tiers.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Carte ressource ──────────────────────────────────────────────────────────
const RessourceCard: React.FC<{ ressource: Ressource }> = ({ ressource: r }) => (
  <Card>
    <CardContent className="p-4 flex items-start gap-3">
      <ExternalLink className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{r.label}</p>
          <Badge variant="secondary" className="text-xs">{r.tag}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{r.desc}</p>
        <a
          href={r.url}
          target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          aria-label={`Ouvrir ${r.label} (nouvel onglet)`}
        >
          Ouvrir le site <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </CardContent>
  </Card>
);

export default AideIAPage;
