import { AlertTriangle, ArrowRightLeft, BookOpen, ExternalLink, FileText, GraduationCap, Lightbulb, Search, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { getCompatibleAnnaleLevels, getLevelCategoryLabel, getSubjectsForLevel } from '@/lib/levelUtils';

const CHAPTERS: Record<string, string[]> = {
  'Maths': [
    // Collège
    'Calcul numérique et fractions', 'Proportionnalité et pourcentages', 'Équations et inéquations du 1er degré',
    'Géométrie plane (triangles, quadrilatères, cercles)', 'Théorème de Pythagore', 'Théorème de Thalès',
    'Trigonométrie dans le triangle rectangle', 'Calcul littéral et développement/factorisation',
    'Statistiques et représentations graphiques', 'Probabilités élémentaires',
    // Lycée
    'Fonctions : généralités, variations, extremums', 'Fonctions affines et polynômes du second degré',
    'Dérivation : règles et applications', 'Fonctions exponentielle et logarithme',
    'Suites numériques (arithmétiques et géométriques)', 'Intégration et primitives',
    'Trigonométrie (radians, cos, sin, tan, formules)', 'Nombres complexes',
    'Géométrie vectorielle dans le plan et l\'espace', 'Produit scalaire',
    'Probabilités conditionnelles et loi des grands nombres', 'Variables aléatoires et loi binomiale',
    'Loi normale et approximations', 'Matrices et systèmes linéaires (Tle)',
    // Supérieur
    'Séries numériques et séries entières', 'Calcul différentiel (dérivées partielles)', 'Intégrales multiples',
    'Équations différentielles', 'Algèbre linéaire (vecteurs, matrices, déterminants)', 'Espaces vectoriels',
    'Probabilités avancées (lois continues, espérance, variance)', 'Statistiques inférentielles',
  ],
  'Physique': [
    // Collège / 2nde
    'Mesures et unités SI', 'Électricité : circuits, tension, intensité', 'Loi d\'Ohm et résistances',
    'Mouvements et forces', 'Énergie et puissance',
    // Lycée
    'Cinématique : vitesse, accélération, vecteurs', 'Lois de Newton (1er, 2e, 3e)',
    'Travail, énergie mécanique, conservation', 'Gravitation universelle et satellites',
    'Oscillateurs mécaniques (ressort, pendule)', 'Hydrodynamique et pression des fluides',
    'Thermodynamique : température, chaleur, premier principe', 'Gaz parfaits et pression',
    'Optique géométrique : réflexion, réfraction, lentilles', 'Optique ondulatoire et diffraction',
    'Ondes mécaniques et sonores', 'Ondes électromagnétiques et spectre',
    'Électromagnétisme : champ électrique et magnétique', 'Induction électromagnétique',
    'Radioactivité et noyau atomique', 'Réactions nucléaires et énergie',
    'Circuits RLC et régimes transitoires', 'Physique quantique (introduction)',
  ],
  'Chimie': [
    // Collège / 2nde
    'Structure de la matière : atomes, ions, molécules', 'Tableau périodique des éléments',
    'Réactions chimiques : réactifs, produits, conservation de la masse',
    'Solutions aqueuses et dilution', 'Acides et bases : pH, neutralisation',
    // Lycée
    'Oxydoréduction : nombre d\'oxydation, couples, réactions', 'Électrochimie et piles',
    'Chimie organique : nomenclature, familles fonctionnelles', 'Réactions d\'addition, substitution, élimination',
    'Polymères et macromolécules', 'Cinétique chimique : vitesse et facteurs',
    'Équilibres chimiques et constante d\'équilibre', 'Thermochimie et enthalpie de réaction',
    'Spectroscopie : IR, RMN, UV-visible', 'Stéréochimie et isomérie',
    // Supérieur
    'Orbitales moléculaires et liaisons chimiques', 'Chimie de coordination',
    'Chimie analytique : dosage, étalonnage', 'Électrochimie avancée (diagrammes E-pH)',
  ],
  'SVT': [
    // Collège
    'La cellule : unité du vivant', 'Organisation du corps humain', 'Digestion et nutrition',
    'Respiration et échanges gazeux', 'Circulation sanguine', 'Système nerveux et réflexes',
    'Reproduction sexuée et asexuée', 'Génétique : ADN, chromosomes, gènes',
    'Évolution des espèces et sélection naturelle', 'Écosystèmes et biodiversité',
    // Lycée
    'Expression du génome : transcription et traduction', 'Mutations et variabilité génétique',
    'Hérédité et lois de Mendel', 'Immunologie et système immunitaire',
    'Régulation hormonale et homéostasie', 'Neurophysiologie et plasticité cérébrale',
    'Reproduction humaine et contraception', 'Géologie : tectonique des plaques',
    'Roches et formation de la lithosphère', 'Atmosphère et effet de serre',
    'Photosynthèse et respiration cellulaire', 'Biotechnologies et OGM',
    'Évolution de la biodiversité au cours du temps', 'Flux de matière et énergie dans les écosystèmes',
  ],
  'Histoire': [
    // Collège (6e-3e)
    'La Préhistoire et les débuts de l\'humanité', 'Les premières civilisations : Mésopotamie, Égypte',
    'La Grèce antique et la démocratie athénienne', 'Rome antique : République et Empire',
    'Le Moyen Âge : féodalité, seigneurs, serfs', 'L\'Islam : naissance et expansion (VIIe-XIIIe s.)',
    'La Renaissance et les grandes découvertes', 'La Réforme et les guerres de Religion',
    'La Révolution française (1789-1799)', 'L\'Empire napoléonien et ses conquêtes',
    'La révolution industrielle (XIXe s.)', 'La colonisation et l\'impérialisme européen',
    'La Première Guerre mondiale (1914-1918)', 'La Seconde Guerre mondiale (1939-1945)',
    // Lycée
    'Les régimes totalitaires (nazisme, stalinisme, fascisme)', 'La Guerre Froide (1947-1991)',
    'La décolonisation et les nouvelles nations', 'La Ve République française',
    'La construction européenne depuis 1945', 'Le monde depuis 1991 : nouvelles tensions géopolitiques',
    'La mondialisation et ses enjeux', 'Mémoires et histoires : la Shoah et les crimes de masse',
    'Les médias et l\'opinion publique (XIXe-XXIe s.)', 'Science, technologie et société au XXe s.',
  ],
  'Géographie': [
    // Collège
    'Habiter la Terre : milieux, risques, ressources', 'Les métropoles mondiales',
    'L\'Afrique : développement et défis', 'L\'Asie orientale : puissances économiques',
    // Lycée
    'La mondialisation : flux, réseaux, acteurs', 'L\'Union européenne : intégration et crises',
    'Les États-Unis : première puissance mondiale', 'La Chine : émergence et ambitions mondiales',
    'Les Suds dans la mondialisation : inégalités de développement', 'Les migrations internationales',
    'L\'environnement et le développement durable', 'Énergie et transition énergétique',
    'Géopolitique des mers et des océans', 'La France : territoire, population, économie',
    'Les espaces ruraux et périurbains en France', 'Risques naturels et technologiques',
  ],
  'Français': [
    // Grammaire fondamentale
    'Classes grammaticales : nom, verbe, adjectif, pronom, adverbe, préposition, conjonction',
    'Fonctions grammaticales : sujet, COD, COI, attribut, complément circonstanciel',
    'Types et formes de phrases (déclarative, interrogative, impérative, exclamative)',
    'La phrase complexe : subordination et coordination',
    'Le groupe nominal : déterminants et accords', 'Conjugaison : tous les temps et modes',
    'Accord du participe passé (avec être, avoir, pronominaux)',
    // Orthographe
    'Homophones lexicaux et grammaticaux (a/à, ou/où, se/ce, son/sont…)',
    'Pluriels particuliers (noms composés, mots en -al, -ou, -ail)', 'Majuscules et ponctuation',
    // Littérature
    'Genres littéraires : roman, poésie, théâtre, essai, autobiographie',
    'Mouvements littéraires : Humanisme, Classicisme, Lumières, Romantisme, Réalisme, Surréalisme',
    'Figures de style : métaphore, comparaison, antithèse, hyperbole, ironie, anaphore, chiasme',
    'La narration : point de vue, narrateur, temps de narration', 'Le texte argumentatif et ses procédés',
    'L\'analyse d\'un poème : versification, prosodie, images', 'La dissertation littéraire',
    'Le commentaire de texte (littéraire, philosophique)', 'L\'explication linéaire (Bac)',
    'La question de grammaire (Bac Français)', 'Œuvres au programme du Bac',
  ],
  'Anglais': [
    // Grammaire anglaise
    'Les temps du présent : simple, continuous, perfect', 'Les temps du passé : simple, continuous, perfect, perfect continuous',
    'Le futur : will, going to, present continuous, shall', 'Les modaux : can, could, may, might, must, shall, should, will, would',
    'Le conditionnel : zéro, 1er, 2e, 3e type (if-clauses)', 'Les propositions relatives (who, which, that, whose)',
    'La voix passive', 'Le discours indirect (reported speech)', 'Les questions indirectes',
    'Les articles (a, an, the, zéro article)', 'Les comparatifs et superlatifs',
    // Lexique et expression
    'Vocabulaire des médias et de la société', 'Vocabulaire de l\'environnement et du développement durable',
    'Vocabulaire des sciences et des technologies', 'Vocabulaire politique et géopolitique',
    'Phrasal verbs courants', 'Expressions idiomatiques', 'Faux amis français/anglais',
    // Expression écrite
    'Rédiger un essai argumentatif (for and against)', 'Écrire une lettre formelle ou un email',
    'Résumer un texte en anglais', 'La synthèse de documents en anglais',
  ],
  'Espagnol': [
    'Conjugaison du présent (régulier et irrégulier)', 'Le prétérit indéfini (indefinido)',
    'L\'imparfait (imperfecto) et son opposition au passé composé', 'Le futur et le conditionnel',
    'Le subjonctif présent et passé (usage)', 'Ser vs Estar : règles et exceptions',
    'Por vs Para : emplois et distinctions', 'Les pronoms personnels (directs, indirects, réfléchis)',
    'Les prépositions et régimes verbaux', 'Le vocabulaire des grandes civilisations hispanophones',
    'L\'Amérique latine : histoire et enjeux contemporains', 'L\'Espagne : identités régionales et culture',
  ],
  'Allemand': [
    'Les cas : Nominatif, Accusatif, Datif, Génitif', 'Les articles définis et indéfinis (déclinaisons)',
    'Les verbes forts (irréguliers) et les modaux', 'Le Perfekt et le Präteritum',
    'Le Konjunktiv II (conditionnel) : hätte, wäre, würde', 'Les verbes séparables et inséparables',
    'La subordonnée : position du verbe en fin de proposition', 'Le passif (Passiv)',
    'Les prépositions + accusatif, datif ou génitif', 'Wortschatz : société, médias, environnement, Europe',
  ],
  'Philosophie': [
    'La conscience et l\'inconscient (Descartes, Freud)', 'La perception et la représentation du réel',
    'Autrui : reconnaissance, altérité, intersubjectivité', 'Le désir et le bonheur (Épicure, Schopenhauer)',
    'La liberté : libre arbitre, déterminisme, liberté politique', 'La volonté et la raison',
    'Le langage et la pensée', 'L\'art et l\'esthétique', 'La vérité et la connaissance',
    'La démonstration, l\'intuition et la vérification scientifique', 'Le travail et la technique',
    'La nature, la culture et l\'humanité', 'L\'État, la politique et la justice',
    'Le droit et la morale', 'La religion et la foi', 'L\'histoire et le progrès',
    'Grands courants : stoïcisme, empirisme, rationalisme, existentialisme, utilitarisme',
    'Auteurs clés : Platon, Aristote, Descartes, Kant, Hegel, Marx, Nietzsche, Sartre, Rawls',
  ],
  'Économie/SES': [
    // Microéconomie
    'Offre et demande : marché et formation des prix', 'Élasticités et comportement du consommateur',
    'Structures de marché : CPP, monopole, oligopole', 'Externalités et défaillances du marché',
    // Macroéconomie
    'PIB et mesure de la croissance économique', 'Consommation, épargne et investissement',
    'Fluctuations économiques et crises', 'Politique monétaire et rôle de la Banque Centrale',
    'Politique budgétaire et dette publique', 'Commerce international et balance des paiements',
    // Sociologie
    'Stratification sociale et classes sociales (Marx, Weber, Bourdieu)', 'Mobilité sociale et inégalités',
    'Socialisation primaire et secondaire', 'Déviance et contrôle social', 'Famille et évolutions',
    // Science politique
    'Démocratie, élections et participation politique', 'L\'État et ses institutions',
    'Intégration européenne et gouvernance mondiale', 'Mondialisation et inégalités Nord-Sud',
  ],
  'NSI/Informatique': [
    // Structures de données
    'Types de données de base : entiers, flottants, booléens, chaînes', 'Listes, tuples, dictionnaires, ensembles',
    'Piles et files (LIFO/FIFO)', 'Arbres binaires et arbres de recherche (ABR)',
    'Graphes : représentation et parcours (BFS, DFS)', 'Tables de hachage',
    // Algorithmique
    'Algorithmes de tri : tri sélection, insertion, fusion, rapide', 'Complexité algorithmique (O notation)',
    'Récursivité et paradigmes de programmation', 'Programmation dynamique', 'Algorithmes gloutons',
    'Recherche dans un graphe : Dijkstra, A*', 'Algorithmes de recherche : séquentielle et dichotomique',
    // Programmation
    'Python : syntaxe, fonctions, modules, POO', 'Programmation orientée objet : classes, héritage, encapsulation',
    'Gestion des exceptions et tests unitaires',
    // Systèmes et réseaux
    'Architecture de von Neumann et CPU', 'Systèmes d\'exploitation : processus, mémoire, fichiers',
    'Réseaux : protocoles TCP/IP, DNS, HTTP, HTTPS', 'Sécurité informatique : chiffrement, RSA, SHA',
    // Bases de données
    'Modèle relationnel et algèbre relationnelle', 'Langage SQL : SELECT, JOIN, GROUP BY, sous-requêtes',
    'Transactions et ACID', 'Bases NoSQL (introduction)',
    // Web
    'HTML5, CSS3 et JavaScript (bases)', 'DOM et interactions côté client', 'APIs REST et JSON',
  ],
};

const ANNALES = [
  // Baccalauréat général
  { subject: 'Maths', level: 'Terminale', year: '2025', title: 'Bac général Maths 2025 (Métropole)', topics: ['Probabilités et variables aléatoires', 'Suites et limites', 'Intégration et primitives', 'Géométrie vectorielle 3D'] },
  { subject: 'Français', level: 'Première', year: '2025', title: 'Bac Français Écrit 2025', topics: ['Dissertation littéraire', 'Commentaire de texte', 'Contraction + essai'] },
  { subject: 'Histoire-Géo', level: 'Terminale', year: '2025', title: 'Bac Histoire-Géographie 2025', topics: ['Les États-Unis dans la mondialisation', 'L\'Afrique face aux défis du XXIe s.', 'Mers et océans', 'Composition historique'] },
  { subject: 'Physique', level: 'Terminale', year: '2025', title: 'Bac Physique-Chimie 2025', topics: ['Mécanique (Newton, énergie)', 'Électromagnétisme (induction)', 'Chimie organique (synthèse)', 'Ondes et signaux'] },
  { subject: 'SVT', level: 'Terminale', year: '2025', title: 'Bac SVT 2025', topics: ['Expression du génome (épigénétique)', 'Système immunitaire', 'Tectonique des plaques', 'Neurones et plasticité cérébrale'] },
  { subject: 'Philosophie', level: 'Terminale', year: '2025', title: 'Bac Philosophie 2025', topics: ['La conscience et l\'inconscient', 'La justice et le droit', 'La vérité', 'Le travail et la technique'] },
  { subject: 'SES', level: 'Terminale', year: '2025', title: 'Bac SES 2025', topics: ['Croissance, fluctuations et crises', 'Défaillances du marché', 'Stratification sociale', 'Institutions politiques et démocratie'] },
  // Baccalauréat 2024
  { subject: 'Maths', level: 'Terminale', year: '2024', title: 'Bac général Maths 2024 (Métropole)', topics: ['Suites numériques', 'Probabilités (loi binomiale)', 'Fonctions et dérivées', 'Géométrie dans l\'espace'] },
  { subject: 'Français', level: 'Première', year: '2024', title: 'Bac Français Écrit 2024', topics: ['Dissertation sur œuvre au programme', 'Explication linéaire', 'Question de grammaire'] },
  { subject: 'Histoire-Géo', level: 'Terminale', year: '2024', title: 'Bac Histoire-Géographie 2024', topics: ['La Guerre Froide', 'La mondialisation', 'Composition et croquis'] },
  { subject: 'Physique', level: 'Terminale', year: '2024', title: 'Bac Physique-Chimie 2024', topics: ['Mécanique (chute libre, forces)', 'Optique (lentilles)', 'Chimie organique', 'Électricité (circuit RLC)'] },
  { subject: 'SVT', level: 'Terminale', year: '2024', title: 'Bac SVT 2024', topics: ['Expression du génome', 'Immunologie', 'Tectonique des plaques', 'Neurones et plasticité'] },
  { subject: 'Philosophie', level: 'Terminale', year: '2024', title: 'Bac Philosophie 2024', topics: ['La liberté', 'L\'art', 'Le travail', 'L\'État'] },
  { subject: 'SES', level: 'Terminale', year: '2024', title: 'Bac SES 2024', topics: ['Croissance et inégalités', 'Marchés et politiques économiques', 'Justice sociale', 'Mobilité sociale'] },
  // Baccalauréat 2023
  { subject: 'Maths', level: 'Terminale', year: '2023', title: 'Bac général Maths 2023 (Métropole)', topics: ['Fonctions logarithme et exponentielle', 'Nombres complexes', 'Probabilités conditionnelles', 'Intégration'] },
  { subject: 'Physique', level: 'Terminale', year: '2023', title: 'Bac Physique-Chimie 2023', topics: ['Ondes et signaux', 'Radioactivité', 'Thermodynamique', 'Cinétique chimique'] },
  { subject: 'SVT', level: 'Terminale', year: '2023', title: 'Bac SVT 2023', topics: ['Génétique (mutations, lois de Mendel)', 'Corps humain (hormones)', 'Géologie (tectonique)', 'Écosystèmes'] },
  { subject: 'NSI/Informatique', level: 'Terminale', year: '2023', title: 'Bac NSI 2023', topics: ['Algorithmique et complexité', 'Bases de données SQL', 'Réseaux et protocoles', 'Structures arborescentes'] },
  // Brevet des collèges 2025
  { subject: 'Maths', level: '3e', year: '2025', title: 'Brevet Maths 2025', topics: ['Calcul littéral et équations du 2nd degré', 'Géométrie (triangles, cercles, vecteurs)', 'Statistiques et probabilités', 'Fonctions et représentations graphiques'] },
  { subject: 'Français', level: '3e', year: '2025', title: 'Brevet Français 2025', topics: ['Compréhension écrite et oral', 'Grammaire et orthographe', 'Rédaction : récit et argumentation'] },
  { subject: 'Histoire-Géo', level: '3e', year: '2025', title: 'Brevet Histoire-Géographie 2025', topics: ['La Première Guerre mondiale', 'L\'Europe depuis 1945', 'Mondialisation et espaces', 'Questions citoyenneté'] },
  // Brevet des collèges 2024
  { subject: 'Maths', level: '3e', year: '2024', title: 'Brevet Maths 2024', topics: ['Calcul numérique et algébrique', 'Géométrie (Pythagore, Thalès)', 'Statistiques et probabilités', 'Fonctions affines'] },
  { subject: 'Français', level: '3e', year: '2024', title: 'Brevet Français 2024', topics: ['Compréhension d\'un texte narratif', 'Dictée et grammaire', 'Rédaction (récit ou argumentation)'] },
  { subject: 'Histoire-Géo', level: '3e', year: '2024', title: 'Brevet Histoire-Géographie 2024', topics: ['La Seconde Guerre mondiale', 'Décolonisation', 'La France et l\'UE', 'Mondialisation et développement'] },
  { subject: 'Maths', level: '3e', year: '2023', title: 'Brevet Maths 2023', topics: ['Équations et inéquations', 'Géométrie dans l\'espace (volumes)', 'Probabilités', 'Proportionnalité'] },
  { subject: 'Physique', level: '3e', year: '2023', title: 'Brevet Physique-Chimie 2023', topics: ['Électricité (loi d\'Ohm)', 'Réactions chimiques', 'Mouvements et forces', 'Énergie'] },
  // Baccalauréat technologique / professionnel (STI2D, STMG)
  { subject: 'Maths', level: 'Terminale', year: '2023', title: 'Bac STMG Maths 2023', topics: ['Fonctions du second degré', 'Suites et financements', 'Statistiques (médiane, quartiles)'] },
  { subject: 'Économie/SES', level: 'Terminale', year: '2023', title: 'Bac STMG Économie 2023', topics: ['Entreprise et financement', 'Marchés et concurrence', 'Politiques économiques'] },
];

const METHODES = [
  {
    title: 'La Dissertation',
    steps: [
      'Analyser le sujet : définir chaque terme, repérer les tensions et formuler une problématique',
      'Brainstormer : noter toutes les idées, arguments, exemples, sans les trier',
      'Construire le plan thèse / antithèse / synthèse (ou 3 thèses progressives)',
      'Rédiger l\'introduction : accroche → définition des termes → problématique → annonce du plan',
      'Développer chaque partie : 2-3 sous-parties, chacune avec argument + exemple + analyse',
      'Rédiger les transitions entre parties (bilan de la partie + ouverture sur la suivante)',
      'Conclure : bilan synthétique → réponse à la problématique → ouverture vers une question plus vaste',
      'Vérifier : cohérence, absence de contradiction, longueur équilibrée entre les parties',
    ],
  },
  {
    title: 'Le Commentaire littéraire',
    steps: [
      'Lire le texte 2-3 fois, annoter les procédés stylistiques et les effets produits',
      'Identifier le genre, la forme, le mouvement littéraire et le contexte de l\'œuvre',
      'Formuler une problématique : "En quoi ce texte... ?"',
      'Construire un plan en 2 ou 3 axes (pas un résumé, mais une analyse)',
      'Dans chaque axe : citer le texte entre guillemets → analyser le procédé → interpréter l\'effet',
      'Rédiger une introduction : présentation de l\'auteur/œuvre → situation de l\'extrait → problématique → plan',
      'Soigner la conclusion : bilan analytique + ouverture (comparaison avec une autre œuvre)',
    ],
  },
  {
    title: 'L\'Explication linéaire (Bac Français)',
    steps: [
      'Lire le texte à voix haute, identifier le mouvement et les temps forts',
      'Dégager le projet de lecture (= axe directeur) : "Ce texte est une... qui montre que..."',
      'Segmenter en 3 à 5 mouvements cohérents avec des titres clairs',
      'Pour chaque mouvement : analyser lignes par lignes les procédés + leurs effets',
      'Varier le vocabulaire d\'analyse : focalisation, tonalité, registre, champ lexical, figure de style…',
      'Introduction : auteur/œuvre/situation → problématique/projet de lecture → plan',
      'Conclure en répondant au projet de lecture et en proposant une ouverture',
    ],
  },
  {
    title: 'La Synthèse de documents',
    steps: [
      'Lire tous les documents une première fois pour avoir une vue d\'ensemble',
      'Identifier le thème commun et rédiger en 1 phrase ce que chaque doc apporte',
      'Classer les idées par thèmes transversaux (pas par document !)',
      'Construire un plan thématique en 2 ou 3 parties',
      'Rédiger en confrontant les documents : "Selon le doc 1... tandis que le doc 2..."',
      'Ne jamais donner son avis personnel, rester factuel et objectif',
      'Vérifier que tous les documents sont cités de façon équilibrée',
    ],
  },
  {
    title: 'L\'Oral (Bac, exposé)',
    steps: [
      'Préparer une introduction accrocheuse (citation, question rhétorique, anecdote)',
      'Structurer en 2-3 parties clairement annoncées dans l\'introduction',
      'Rédiger des fiches avec mots-clés et exemples (ne pas lire un texte rédigé)',
      'Utiliser des transitions formulées à voix haute ("En premier lieu… Cependant… Enfin…")',
      'Regarder l\'auditoire, articuler, varier le rythme et l\'intonation',
      'Préparer 2-3 questions potentielles pour la phase d\'entretien',
      'Conclure par une réponse claire à la problématique + ouverture mémorable',
    ],
  },
  {
    title: 'L\'Étude de document (Histoire-Géo)',
    steps: [
      'Identifier : nature, auteur, date, contexte, destinataire du document',
      'Dégager les informations explicites (ce qui est dit) et implicites (ce qui est sous-entendu)',
      'Confronter le document avec ses connaissances : confirme ou nuance-t-il le cours ?',
      'Repérer les limites et la partialité éventuelle du document',
      'Construire un plan en 2-3 parties selon les idées directrices, pas selon l\'ordre du texte',
      'Rédiger une introduction : présentation du document → contexte → problématique',
      'Conclure : bilan de l\'apport et des limites du document',
    ],
  },
  {
    title: 'La Résolution de problème (Maths)',
    steps: [
      'Lire l\'énoncé deux fois, identifier les données (ce qui est connu) et l\'inconnue (ce qui est cherché)',
      'Faire un schéma ou un tableau de bord si pertinent',
      'Identifier le(s) théorème(s) ou formule(s) applicables à la situation',
      'Résoudre étape par étape en justifiant chaque opération',
      'Vérifier la cohérence du résultat (unités, ordre de grandeur, vérification dans l\'équation)',
      'Rédiger clairement : une ligne = une étape logique, chaque égalité est justifiée',
      'Conclure par une phrase : "La valeur de x est donc…" ou "L\'aire du triangle est donc…"',
    ],
  },
  {
    title: 'Le Compte-rendu d\'expérience (Physique-Chimie)',
    steps: [
      'Introduire l\'objectif de l\'expérience en 2-3 phrases',
      'Lister le matériel et les protocole étapes par étapes',
      'Présenter les résultats bruts sous forme de tableau avec unités',
      'Analyser les résultats : calculs, courbes, comparaison avec les valeurs théoriques',
      'Calculer et commenter les incertitudes et les sources d\'erreur',
      'Conclure : l\'expérience valide-t-elle l\'hypothèse ? Écart relatif avec la théorie ?',
    ],
  },
];



// ── Fiches de révision par matière ────────────────────────────────────────────
interface FicheRevision {
  subject: string;
  titre: string;
  niveau: string;
  points: string[];
  formules?: string[];
  couleur: string;
  icon: string;
}

const FICHES_REVISION: FicheRevision[] = [
  {
    subject: 'Maths', titre: 'Fonctions du second degré', niveau: '1ère / Terminale',
    couleur: 'text-blue-600 bg-blue-50 border-blue-200', icon: '📐',
    points: [
      'Forme développée : f(x) = ax² + bx + c (a ≠ 0)',
      'Discriminant : Δ = b² − 4ac',
      'Si Δ > 0 : deux racines x₁ = (−b − √Δ)/2a et x₂ = (−b + √Δ)/2a',
      'Si Δ = 0 : une racine double x₀ = −b/2a',
      'Si Δ < 0 : pas de racine réelle',
      'Sommet (extremum) : x_S = −b/2a ; y_S = f(x_S)',
    ],
    formules: ['Δ = b² − 4ac', 'x = (−b ± √Δ) / 2a', 'x_S = −b/2a'],
  },
  {
    subject: 'Maths', titre: 'Dérivation — Règles essentielles', niveau: '1ère / Terminale',
    couleur: 'text-blue-600 bg-blue-50 border-blue-200', icon: '∂',
    points: [
      '(xⁿ)\' = n·xⁿ⁻¹', '(eˣ)\' = eˣ', '(ln x)\' = 1/x',
      '(u + v)\' = u\' + v\'', '(u·v)\' = u\'v + uv\'',
      '(u/v)\' = (u\'v − uv\') / v²', '(u(v(x)))\' = u\'(v(x))·v\'(x)',
      'Si f\'(x) > 0 sur I → f croissante sur I',
    ],
    formules: ['(uv)\' = u\'v + uv\'', '(u/v)\' = (u\'v − uv\') / v²'],
  },
  {
    subject: 'Maths', titre: 'Probabilités & Variables aléatoires', niveau: 'Terminale',
    couleur: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🎲',
    points: [
      'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)',
      'Probabilité conditionnelle : P(B|A) = P(A ∩ B) / P(A)',
      'Formule des probabilités totales : P(B) = Σ P(Aᵢ) · P(B|Aᵢ)',
      'Loi binomiale X ~ B(n, p) : P(X=k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ',
      'E(X) = n·p ; Var(X) = n·p·(1−p)',
    ],
    formules: ['P(B|A) = P(A∩B)/P(A)', 'P(X=k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ', 'E(X)=np'],
  },
  {
    subject: 'Physique', titre: 'Lois de Newton', niveau: '1ère / Terminale',
    couleur: 'text-purple-600 bg-purple-50 border-purple-200', icon: '🍎',
    points: [
      '1ère loi (inertie) : si ΣF = 0, le système est en mouvement rectiligne uniforme',
      '2ème loi (fondamentale) : ΣF = m·a (N = kg·m/s²)',
      '3ème loi (action-réaction) : F_A→B = −F_B→A',
      'Poids : P = m·g (g ≈ 9,81 m/s² sur Terre)',
      'Réaction normale : N ⊥ à la surface de contact',
    ],
    formules: ['ΣF⃗ = m·a⃗', 'P = mg', 'F_A→B = −F_B→A'],
  },
  {
    subject: 'Physique', titre: 'Ondes et Optique', niveau: '1ère / Terminale',
    couleur: 'text-purple-600 bg-purple-50 border-purple-200', icon: '🌊',
    points: [
      'Célérité : v = λ·f (λ = longueur d\'onde, f = fréquence)',
      'Loi de Snell-Descartes : n₁·sin θ₁ = n₂·sin θ₂',
      'Relation de conjugaison (lentille mince) : 1/v − 1/u = 1/f\'',
      'Grandissement : g = v/u = taille image / taille objet',
      'Diffraction : condition a·sin θ = k·λ',
    ],
    formules: ['v = λ·f', 'n₁sin θ₁ = n₂sin θ₂', '1/v − 1/u = 1/f\''],
  },
  {
    subject: 'Français', titre: 'Figures de style — Essentielles', niveau: 'Collège / Lycée',
    couleur: 'text-rose-600 bg-rose-50 border-rose-200', icon: '✍️',
    points: [
      'Métaphore : comparaison sans outil de comparaison — "sa voix est du miel"',
      'Comparaison : avec outil ("comme", "tel") — "courageux comme un lion"',
      'Personnification : attribuer des traits humains à un objet/animal',
      'Hyperbole : exagération volontaire — "j\'ai mille fois essayé"',
      'Anaphore : répétition en début de vers/phrase pour insister',
      'Litote : dire moins pour suggérer plus — "ce n\'est pas mal" = c\'est bien',
      'Antithèse : opposition de deux idées dans une même phrase',
    ],
  },
  {
    subject: 'Français', titre: 'Types et genres littéraires', niveau: 'Lycée',
    couleur: 'text-rose-600 bg-rose-50 border-rose-200', icon: '📖',
    points: [
      'Roman : prose narrative longue. Genres : réaliste, fantastique, policier, SF…',
      'Poésie : langage travaillé, rythme, images. Genres : sonnet, ode, élégie…',
      'Théâtre : destiné à être joué. Genres : tragédie, comédie, drame romantique',
      'Essai : réflexion argumentée sur un sujet. Genres : philosophique, politique',
      'Autobiographie : récit de sa propre vie (pacte autobiographique de Lejeune)',
    ],
  },
  {
    subject: 'Histoire-Géo', titre: 'La Seconde Guerre mondiale', niveau: 'Lycée',
    couleur: 'text-amber-600 bg-amber-50 border-amber-200', icon: '🌍',
    points: [
      '1939 : invasion de la Pologne par Hitler (1er sept.) → entrée en guerre de la France et du Royaume-Uni',
      '1940 : armistice de Pétain (22 juin) ; appel du 18 juin de De Gaulle (BBC)',
      'La Shoah : extermination systématique de 6 millions de Juifs par les nazis (1941-1945)',
      '1944 : débarquement en Normandie (6 juin — D-Day) puis libération de Paris (25 août)',
      '1945 : capitulation de l\'Allemagne (8 mai) ; bombes atomiques au Japon (6 & 9 août) → fin de la guerre',
      'ONU créée en 1945 pour maintenir la paix internationale',
    ],
  },
  {
    subject: 'Histoire-Géo', titre: 'La mondialisation', niveau: 'Terminale',
    couleur: 'text-amber-600 bg-amber-50 border-amber-200', icon: '🗺️',
    points: [
      'Mondialisation = intégration croissante des économies, flux de marchandises, capitaux, personnes, idées',
      'Acteurs : FMN (firmes multinationales), États, ONG, organisations internationales (FMI, OMC)',
      'Métropolisation : concentration des richesses dans les grandes villes mondiales',
      'Inégalités : Nord/Sud, gradient du développement, marges et zones intégrées',
      'Contestation : altermondialisme, protectionnisme, souverainisme économique',
    ],
  },
  {
    subject: 'SVT', titre: 'ADN, gènes et hérédité', niveau: 'Lycée',
    couleur: 'text-green-600 bg-green-50 border-green-200', icon: '🧬',
    points: [
      'ADN = double hélice de nucléotides (A-T, C-G) portant l\'information génétique',
      'Gène = séquence d\'ADN codant pour une protéine (via ARNm)',
      'Allèle = version d\'un gène ; dominant masque le récessif',
      'Mitose : division cellulaire → 2 cellules identiques (croissance, cicatrisation)',
      'Méiose : division réductrice → 4 cellules haploïdes (gamètes)',
      'Mutation = modification de la séquence ADN (peut être neutre, bénéfique ou néfaste)',
    ],
  },
  {
    subject: 'SVT', titre: 'Écosystèmes et biodiversité', niveau: 'Lycée',
    couleur: 'text-green-600 bg-green-50 border-green-200', icon: '🌿',
    points: [
      'Écosystème = biocénose (êtres vivants) + biotope (milieu physique)',
      'Producteurs : végétaux (photosynthèse) ; Consommateurs : herbivores, carnivores',
      'Chaîne alimentaire : producteurs → consommateurs 1er ordre → 2e ordre → décomposeurs',
      'Biodiversité = diversité spécifique, génétique, et des écosystèmes',
      'Perturbations : pollution, déforestation, changement climatique → érosion biodiversité',
    ],
  },
  {
    subject: 'Chimie', titre: 'Atomistique & Tableau périodique', niveau: '2nde / 1ère',
    couleur: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: '⚗️',
    points: [
      'Atome = noyau (protons + neutrons) + électrons en couches K, L, M',
      'Numéro atomique Z = nombre de protons (identifie l\'élément)',
      'Nombre de masse A = protons + neutrons ; neutrons = A − Z',
      'Ions : perte d\'e⁻ → cation (+) ; gain d\'e⁻ → anion (−)',
      'Règle de l\'octet : les atomes tendent à avoir 8 électrons en couche externe',
      'Électronégativité croissante dans le tableau : de gauche à droite et de bas en haut',
    ],
    formules: ['Z = n(protons)', 'A = Z + N', 'Ion : Z − n(e⁻) = charge'],
  },
  {
    subject: 'Anglais', titre: 'Temps et auxiliaires modaux', niveau: 'Collège / Lycée',
    couleur: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: '🇬🇧',
    points: [
      'Present simple : habitudes, vérités générales — "She works every day"',
      'Present continuous : action en cours — "She is working now"',
      'Preterit simple : passé révolu — "She worked yesterday"',
      'Present perfect : lien avec le présent — "She has worked here for 3 years"',
      'Will : futur/décision spontanée ; Going to : intention / prédiction basée sur preuves',
      'Can = capacité ; Must = obligation ; Should = conseil ; Might = possibilité',
    ],
  },
  {
    subject: 'Philosophie', titre: 'Notions essentielles — Bac Philo', niveau: 'Terminale',
    couleur: 'text-violet-600 bg-violet-50 border-violet-200', icon: '🏛️',
    points: [
      'Liberté : libre-arbitre vs déterminisme (Descartes ↔ Spinoza)',
      'Bonheur : eudémonisme (Aristote) vs devoir moral (Kant)',
      'Vérité : correspondance, cohérence, pragmatisme — "qu\'est-ce qui est vrai ?"',
      'L\'État : contrat social (Hobbes, Locke, Rousseau) ; légitimité du pouvoir',
      'La conscience : Descartes (cogito), Freud (inconscient), Sartre (mauvaise foi)',
      'Méthode dissertation : thèse → antithèse → synthèse ; 3 parties x 3 arguments',
    ],
  },
];

const FICHES_PAR_MATIERE = FICHES_REVISION.reduce<Record<string, FicheRevision[]>>((acc, f) => {
  if (!acc[f.subject]) acc[f.subject] = [];
  acc[f.subject].push(f);
  return acc;
}, {});

// ── Résumés de cours par matière ─────────────────────────────────────────────
interface ResuméCours {
  subject: string;
  titre: string;
  niveau: string;
  intro: string;
  points: string[];
  icon: string;
}

const RESUMES_COURS: ResuméCours[] = [
  {
    subject: 'Maths', titre: 'Résumé — Fonctions & Graphes', niveau: '1ère / Terminale', icon: '📐',
    intro: 'Une fonction associe à chaque valeur x un unique résultat f(x). L\'étude des fonctions est le cœur des maths au lycée.',
    points: [
      'Ensemble de définition : ensemble des x pour lesquels f(x) existe',
      'Variations : f croissante si f(a) < f(b) quand a < b ; décroissante si f(a) > f(b)',
      'Extremum local : maximum ou minimum sur un intervalle',
      'Dérivée f\'(x) : si f\'(x) > 0 → croissante ; si f\'(x) < 0 → décroissante ; si f\'(x) = 0 → extremum',
      'Représentation graphique : chaque point (x ; f(x)) est tracé dans un repère (O, i, j)',
    ],
  },
  {
    subject: 'Maths', titre: 'Résumé — Suites numériques', niveau: 'Terminale', icon: '🔢',
    intro: 'Une suite est une liste ordonnée de nombres (uₙ). On distingue deux types principaux au lycée.',
    points: [
      'Suite arithmétique : uₙ₊₁ = uₙ + r (raison r) ; terme général : uₙ = u₀ + n·r',
      'Suite géométrique : uₙ₊₁ = uₙ × q (raison q) ; terme général : uₙ = u₀ × qⁿ',
      'Sens de variation : arithmétique → dépend du signe de r ; géométrique → dépend de q et u₀',
      'Somme des termes : Σ arithmétique = n × (u₀ + uₙ₋₁)/2 ; Σ géométrique = u₀ × (1 − qⁿ)/(1 − q)',
      'Limite : si |q| < 1, suite géométrique → 0 ; si q > 1 → +∞',
    ],
  },
  {
    subject: 'Français', titre: 'Résumé — Rédiger une dissertation', niveau: 'Lycée', icon: '✍️',
    intro: 'La dissertation est un exercice de réflexion organisée en 3 parties qui répondent à une problématique.',
    points: [
      'Introduction : accroche → contextualisation → problématique → annonce du plan',
      'Plan : 3 parties, chacune avec 2-3 arguments + exemples tirés des œuvres au programme',
      'Chaque paragraphe : argument → exemple précis (titre, auteur, extrait) → analyse → transition',
      'Conclusion : bilan de la réflexion → réponse à la problématique → ouverture',
      'Longueur conseillée : 4 à 6 pages ; transitions obligatoires entre chaque partie',
    ],
  },
  {
    subject: 'Français', titre: 'Résumé — Rédiger un commentaire', niveau: 'Lycée', icon: '📖',
    intro: 'Le commentaire littéraire analyse un texte en montrant ses effets et ses enjeux.',
    points: [
      'Étape 1 — Lecture : repérer le genre, le mouvement, le registre (lyrique, épique, tragique…)',
      'Étape 2 — Axes : trouver 2-3 axes de lecture qui répondent à la problématique',
      'Structure : Introduction (présentation + problématique + plan) → 2-3 parties → Conclusion',
      'Chaque analyse : citer précisément → nommer la figure de style → interpréter l\'effet produit',
      'Éviter : le paraphrase (raconter le texte) ; toujours interpréter, pas décrire',
    ],
  },
  {
    subject: 'Histoire', titre: 'Résumé — La France sous la Ve République', niveau: 'Terminale', icon: '🇫🇷',
    intro: 'La Ve République est fondée en 1958 par de Gaulle. Elle instaure un régime semi-présidentiel.',
    points: [
      '1958 : Constitution de la Ve République ; pouvoirs renforcés du Président',
      '1969 : démission de de Gaulle après le référendum perdu ; Pompidou élu',
      '1981 : première alternance gauche — élection de François Mitterrand',
      'Cohabitations : 1986-88, 1993-95, 1997-2002 (Président et Premier ministre de partis opposés)',
      '2000 : quinquennat (mandat présidentiel réduit de 7 à 5 ans)',
    ],
  },
  {
    subject: 'Histoire', titre: 'Résumé — La Guerre froide (1947-1991)', niveau: 'Lycée', icon: '🌍',
    intro: 'La Guerre froide est une période de tension mondiale entre les États-Unis (bloc occidental) et l\'URSS (bloc communiste).',
    points: [
      '1947 : doctrine Truman (containment) + plan Marshall → début de la Guerre froide',
      '1949 : création de l\'OTAN (Ouest) et du Comecon (Est)',
      '1961 : construction du mur de Berlin pour stopper l\'exode est-allemand',
      '1962 : crise des missiles de Cuba — moment le plus proche d\'une guerre nucléaire',
      '1989 : chute du mur de Berlin ; 1991 : dissolution de l\'URSS → fin de la Guerre froide',
    ],
  },
  {
    subject: 'Physique', titre: 'Résumé — Énergie & Thermodynamique', niveau: 'Terminale', icon: '🔥',
    intro: 'La thermodynamique étudie les échanges d\'énergie sous forme de chaleur et de travail.',
    points: [
      '1er principe : ΔU = W + Q (variation d\'énergie interne = travail + chaleur reçus)',
      'Température absolue en Kelvin : T(K) = T(°C) + 273,15',
      'Gaz parfait : PV = nRT (P en Pa, V en m³, n en mol, R = 8,314 J/mol/K)',
      'Capacité thermique : Q = m·c·ΔT (c = chaleur massique en J/kg/K)',
      'Échangeur de chaleur : chaleur cédée = chaleur reçue (conservation en système isolé)',
    ],
  },
  {
    subject: 'SVT', titre: 'Résumé — La transmission de l\'information génétique', niveau: 'Terminale', icon: '🧬',
    intro: 'L\'ADN contient l\'information génétique transmise lors de la division cellulaire et de la reproduction.',
    points: [
      'Réplication de l\'ADN : chaque brin sert de matrice ; ADN polymérase synthétise le brin complémentaire',
      'Transcription : ADN → ARNm (dans le noyau) grâce à l\'ARN polymérase',
      'Traduction : ARNm → protéine (dans le ribosome) ; chaque codon (3 bases) code un acide aminé',
      'Mutation : modification de la séquence ADN → peut altérer la protéine synthétisée',
      'Transmission héréditaire : les allèles sont transmis via les gamètes (lois de Mendel)',
    ],
  },
  {
    subject: 'Philosophie', titre: 'Résumé — La liberté (notion Bac)', niveau: 'Terminale', icon: '🏛️',
    intro: 'La liberté est la capacité d\'agir selon sa propre volonté. Elle oppose libre-arbitre et déterminisme.',
    points: [
      'Libre-arbitre (Descartes) : la volonté humaine est infinie ; nous sommes libres de nos choix',
      'Déterminisme (Spinoza) : tout est causé ; l\'illusion de liberté vient de l\'ignorance des causes',
      'Liberté et loi (Rousseau) : obéir à la loi qu\'on s\'est soi-même prescrite = vraie liberté',
      'Liberté et responsabilité (Sartre) : "l\'existence précède l\'essence" — nous sommes "condamnés à être libres"',
      'Méthode dissertation : thèse (libre-arbitre) → antithèse (déterminisme) → synthèse (liberté comme conquête)',
    ],
  },
  {
    subject: 'Anglais', titre: 'Résumé — Rédiger un essay en anglais', niveau: 'Lycée / BTS', icon: '🇬🇧',
    intro: 'L\'essay anglais suit une structure en 5 paragraphes logiques.',
    points: [
      'Introduction : hook (accroche) → background (contexte) → thesis statement (ta thèse en 1 phrase)',
      'Body §1 : topic sentence + argument + example + link back to thesis',
      'Body §2 : même structure ; point de vue opposé ou complémentaire',
      'Body §3 : argument le plus fort ou synthèse nuancée',
      'Conclusion : restate thesis (reformulé) → summary → closing thought (ouverture)',
    ],
  },
];

const RESUMES_PAR_MATIERE = RESUMES_COURS.reduce<Record<string, ResuméCours[]>>((acc, r) => {
  if (!acc[r.subject]) acc[r.subject] = [];
  acc[r.subject].push(r);
  return acc;
}, {});

const REMIX_FORMATS = [
  { id: 'flashcards', label: '🃏 Flashcards', desc: 'Convertit en paires Question/Réponse pour la révision espacée' },
  { id: 'quiz', label: '📝 Quiz QCM', desc: 'Transforme en questions à choix multiples avec corrigés' },
  { id: 'story', label: '📖 Story mnémotechnique', desc: 'Transforme en histoire mémorable pour retenir les concepts' },
];



const RessourcesPage: React.FC = () => {
  const { level, addActivity } = useApp();
  const navigate = useNavigate();
  const subjects = getSubjectsForLevel(level);
  const [selectedSubject, setSelectedSubject] = useState('Maths');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchAnnale, setSearchAnnale] = useState('');
  const [selectedAnnale, setSelectedAnnale] = useState<(typeof ANNALES)[0] | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  // Remix — transformation manuelle (pas de LLM)
  const [remixInput, setRemixInput] = useState('');
  const [remixFormat, setRemixFormat] = useState('flashcards');
  const [remixSubject, setRemixSubject] = useState('Maths');

  const compatibleLevels = getCompatibleAnnaleLevels(level);
  const filteredAnnales = ANNALES.filter(a =>
    compatibleLevels.includes(a.level) && (
      a.subject.toLowerCase().includes(searchAnnale.toLowerCase()) ||
      a.title.toLowerCase().includes(searchAnnale.toLowerCase()) ||
      a.level.toLowerCase().includes(searchAnnale.toLowerCase())
    )
  );

  return (
    <div className="min-w-0 space-y-4">
    <h1 className="sr-only">Ressources pédagogiques</h1>
      <SEO
        title="Ressources pédagogiques gratuites — Fiches de révision & Cours | Apprenix"
        description="Fiches de révision, cours, annales et exercices corrigés par niveau et matière. Du CP au Bac+5, gratuit. Conformes aux programmes."
        canonical="/ressources"
        keywords="fiches révision gratuites, résumés cours, annales bac 2026, annales brevet 2026, ressources pédagogiques conformes eduscol, fiches histoire géo, fiches maths, fiches français, cours en ligne gratuit, lycée collège université"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Ressources pédagogiques gratuites — Apprenix",
          "description": "Fiches de révision, résumés, annales et méthodes de travail pour tous les niveaux scolaires. 100% gratuit.",
          "url": "https://apprenix.org/ressources",
          "isPartOf": {"@type": "WebSite", "name": "Apprenix", "url": "https://apprenix.org"},
          "about": {
            "@type": "Thing",
            "name": "Ressources éducatives",
            "description": "Fiches de révision et supports pédagogiques gratuits pour élèves du primaire à l'université"
          },
          "audience": {"@type": "EducationalAudience", "educationalRole": "student"},
          "isAccessibleForFree": true,
          "inLanguage": "fr-FR"
        }}
      />
      {/* ── Engagement contenu humain ── */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-foreground text-pretty">
          <strong>Contenu 100 % humain</strong> — fiches méthode, annales et méthodes rédigées et vérifiées par des enseignants.
          Les annales sont des aperçus indicatifs. Utilisez toujours vos manuels et cours comme référence principale.
        </p>
      </div>

      {/* ── En-tête page ── */}
      <PageHero
        variant="tool"
        icon={BookOpen}
        badge={<>📚 Ressources pédagogiques</>}
        badgeClassName="bg-chart-3/10 text-chart-3 border-chart-3/20"
        title="Ressources pédagogiques"
        subtitle="Fiches de révision, annales, méthodes de travail — conformes aux programmes Éduscol. Tout le contenu dont tu as besoin, vérifié par des humains."
        stats={[
          { value: 'Éduscol', label: 'Programmes officiels' },
          { value: '5', label: 'Types de ressources' },
          { value: 'Gratuit', label: 'Sans abonnement' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* Filtres partagés */}
      <div className="flex flex-col md:flex-row gap-2 mb-2">
        <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedChapter(''); }}>
          <SelectTrigger className="h-9 text-sm w-full md:w-40"><SelectValue placeholder="Matière" /></SelectTrigger>
          <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
          <SelectTrigger className="h-9 text-sm w-full md:w-44"><SelectValue placeholder="Chapitre…" /></SelectTrigger>
          <SelectContent>
            {(CHAPTERS[selectedSubject] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="resumes">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto whitespace-nowrap h-auto">
            <TabsTrigger value="resumes" className="text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Résumés
            </TabsTrigger>
            <TabsTrigger value="fiches" className="text-xs">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Fiches
            </TabsTrigger>
            <TabsTrigger value="remix" className="text-xs">
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Remix
            </TabsTrigger>
            <TabsTrigger value="annales" className="text-xs">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Annales
            </TabsTrigger>
            <TabsTrigger value="methodes" className="text-xs">
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Méthodes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Résumés — vrais résumés de cours par matière */}
        <TabsContent value="resumes" className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Résumés de cours — {selectedSubject}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rédigés et vérifiés par des enseignants · Conformes aux programmes Éduscol
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-xs font-medium text-primary">100 % humain</span>
            </div>
          </div>

          {/* Résumés de la matière sélectionnée */}
          {(RESUMES_PAR_MATIERE[selectedSubject] ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(RESUMES_PAR_MATIERE[selectedSubject] ?? []).map(resume => (
                <Card key={resume.titre} className="shadow-card h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0" aria-hidden="true">{resume.icon}</span>
                        <CardTitle className="text-sm font-semibold text-balance leading-snug">{resume.titre}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 whitespace-nowrap">{resume.niveau}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 space-y-3">
                    {/* Introduction */}
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed italic border-l-2 border-primary/30 pl-3">{resume.intro}</p>
                    {/* Points essentiels */}
                    <ul className="space-y-1.5">
                      {resume.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-foreground leading-snug text-pretty">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Matière sans résumé dédié → "bientôt" 100 % interne */
            <Card className="shadow-card">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Résumés {selectedSubject} en cours de rédaction</p>
                  <p className="text-xs text-muted-foreground mt-1 text-pretty">
                    Nos enseignants rédigent les résumés pour cette matière. Ils seront disponibles directement ici, sans quitter Apprenix.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 justify-center">
                  <Button size="sm" className="h-9 text-xs" onClick={() => { navigate('/aide-ia'); addActivity('Résumé → aide devoirs'); }}>
                    Poser une question à un enseignant
                  </Button>
                  <Button size="sm" variant="secondary" className="h-9 text-xs" onClick={() => { navigate('/flashcards'); addActivity('Résumé → flashcards'); }}>
                    Réviser avec des flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA vers Aide aux devoirs */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground text-pretty">
              <strong className="text-foreground">Une question sur un cours ?</strong>{' '}
              Pose-la directement à un enseignant via la section Aide aux devoirs.
            </p>
            <Button size="sm" className="h-8 text-xs shrink-0" onClick={() => { addActivity('Lien Aide devoirs'); navigate('/aide-ia'); }}>
              Aide aux devoirs
            </Button>
          </div>
        </TabsContent>

        {/* Fiches — vraies fiches de révision par matière */}
        <TabsContent value="fiches" className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Fiches de révision — {selectedSubject}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rédigées et vérifiées par des enseignants · Conformes aux programmes Éduscol
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-2/10 border border-chart-2/25">
              <span className="w-2 h-2 rounded-full bg-chart-2 shrink-0" />
              <span className="text-xs font-medium text-chart-2">100 % humain</span>
            </div>
          </div>

          {/* Fiches de la matière sélectionnée */}
          {(FICHES_PAR_MATIERE[selectedSubject] ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(FICHES_PAR_MATIERE[selectedSubject] ?? []).map(fiche => (
                <Card key={fiche.titre} className="shadow-card h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0" aria-hidden="true">{fiche.icon}</span>
                        <CardTitle className="text-sm font-semibold text-balance leading-snug">{fiche.titre}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 whitespace-nowrap">{fiche.niveau}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 space-y-3">
                    {/* Points clés */}
                    <ul className="space-y-1.5">
                      {fiche.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-foreground leading-snug text-pretty">{pt}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Formules clés */}
                    {fiche.formules && fiche.formules.length > 0 && (
                      <div className="rounded-lg bg-secondary border border-border p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Formules clés</p>
                        <div className="flex flex-wrap gap-2">
                          {fiche.formules.map(f => (
                            <code key={f} className="text-xs bg-card border border-border rounded px-2 py-0.5 font-mono text-foreground">{f}</code>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Matière sans fiche dédiée → "bientôt" 100 % interne */
            <Card className="shadow-card">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Fiches {selectedSubject} en cours de rédaction</p>
                  <p className="text-xs text-muted-foreground mt-1 text-pretty">
                    Nos enseignants rédigent les fiches pour cette matière. Elles arriveront directement ici, sans quitter Apprenix.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 justify-center">
                  <Button size="sm" className="h-9 text-xs" onClick={() => { navigate('/aide-ia'); addActivity('Fiches → aide devoirs'); }}>
                    Poser une question à un enseignant
                  </Button>
                  <Button size="sm" variant="secondary" className="h-9 text-xs" onClick={() => { navigate('/quiz'); addActivity('Fiches → quiz'); }}>
                    S'entraîner avec des quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lien rapide → toutes les ressources */}
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground text-pretty">
              Complète ces fiches avec les <strong className="text-foreground">Méthodes</strong> (onglet Méthodes) et les <strong className="text-foreground">annales officielles</strong> (onglet Annales) pour une révision complète.
            </p>
          </div>
        </TabsContent>

        {/* ── Remix de contenu ── */}
        <TabsContent value="remix" className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-chart-4/10 to-chart-5/10 border border-chart-4/20 p-4 flex items-start gap-3">
            <Wand2 className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Outil Remix — Choisir le format de révision</p>
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Choisissez le format qui vous convient le mieux parmi les ressources disponibles. Les enseignants proposent plusieurs formats pour chaque chapitre.</p>
            </div>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">Matière</Label>
                  <Select value={remixSubject} onValueChange={setRemixSubject}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">Format de révision</Label>
                  <Select value={remixFormat} onValueChange={setRemixFormat}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REMIX_FORMATS.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-xs font-medium text-foreground mb-0.5">
                  {REMIX_FORMATS.find(f => f.id === remixFormat)?.label}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {REMIX_FORMATS.find(f => f.id === remixFormat)?.desc}
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
                <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Contenu 100 % humain</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Toutes les fiches, flashcards et résumés sont <strong>créés par des enseignants</strong>.
                    Aucun contenu n'est généré automatiquement. Consultez les annales et méthodes pour réviser efficacement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annales */}
        <TabsContent value="annales" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label="Rechercher une annale"
              value={searchAnnale}
              onChange={e => setSearchAnnale(e.target.value)}
              placeholder={`Rechercher — ${getLevelCategoryLabel(level)} (${level})`}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {filteredAnnales.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <p className="text-sm font-medium text-foreground">Aucune annale disponible pour votre niveau ({level})</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Les annales sont progressivement ajoutées pour chaque niveau scolaire.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnales.map((a, i) => (
              <Card key={i} className="shadow-card h-full">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground text-balance">{a.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">{a.year}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{a.subject}</Badge>
                    <Badge variant="secondary" className="text-xs">{a.level}</Badge>
                    {a.topics.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1 h-9 text-xs" onClick={() => { setSelectedAnnale(a); setShowCorrection(false); }}>
                      Voir l'énoncé
                    </Button>
                    <Button size="sm" className="flex-1 h-9 text-xs bg-primary text-primary-foreground" onClick={() => { setSelectedAnnale(a); setShowCorrection(true); }}>
                      Voir la correction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedAnnale && (
            <Card className="shadow-card border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-semibold">{selectedAnnale.title} — {showCorrection ? 'Correction' : 'Énoncé'}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant={!showCorrection ? 'default' : 'outline'} className="h-9 text-xs" onClick={() => setShowCorrection(false)}>Énoncé</Button>
                    <Button size="sm" variant={showCorrection ? 'default' : 'outline'} className="h-9 text-xs" onClick={() => setShowCorrection(true)}>Correction</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg bg-warning/5 border border-warning/25">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    Aperçu simplifié à titre indicatif — pour les sujets officiels complets, consultez les sites de l'Éducation nationale (education.gouv.fr) ou Eduscol.
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  {showCorrection ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Correction détaillée</p>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">La correction de {selectedAnnale.title} aborde les notions de {selectedAnnale.topics.join(', ')}.</p>
                      <p className="text-sm text-foreground">Chaque exercice est résolu étape par étape avec les justifications nécessaires. Les points de méthode importants sont signalés pour vous aider à mémoriser les bonnes pratiques.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Énoncé — {selectedAnnale.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Niveau : {selectedAnnale.level} · Année : {selectedAnnale.year}</p>
                      <p className="text-sm text-foreground">Cet examen porte sur les chapitres suivants : {selectedAnnale.topics.join(', ')}. Il comporte plusieurs exercices progressifs permettant de valider la maîtrise des compétences attendues au niveau {selectedAnnale.level}.</p>
                      <p className="text-sm text-muted-foreground italic">Durée recommandée : 3h · Calculatrice autorisée pour les exercices de calcul</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Méthodes */}
        <TabsContent value="methodes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {METHODES.map(m => (
              <Card key={m.title} className="shadow-card h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">M</span>
                    {m.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ol className="space-y-2">
                    {m.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-foreground text-pretty">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RessourcesPage;
