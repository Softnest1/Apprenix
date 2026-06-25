import { AlertTriangle, ArrowLeftRight, BookOpen, CheckSquare, ExternalLink, FileText, Languages, Lightbulb, Pen, Search, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
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

// ─── Données du dictionnaire ──────────────────────────────────────────────────
const DICTIONARY: Record<string, { def: string; synonyms: string[]; examples: string[] }> = {
  // ── Mots courants du quotidien ────────────────────────────────────────────────
  'bonjour': { def: 'Salutation utilisée pour accueillir quelqu\'un ou commencer une conversation, principalement le matin et l\'après-midi.', synonyms: ['salut', 'bonsoir', 'coucou', 'allô'], examples: ['Bonjour, comment allez-vous ?', 'Il m\'a dit bonjour en arrivant.'] },
  'merci': { def: 'Expression de gratitude ou de remerciement adressée à quelqu\'un qui nous a rendu service.', synonyms: ['remerciement', 'gratitude', 'reconnaissance'], examples: ['Merci pour votre aide.', 'Elle dit merci à tous ses professeurs.'] },
  'école': { def: 'Établissement d\'enseignement où les élèves reçoivent une instruction dans différentes disciplines.', synonyms: ['établissement', 'collège', 'lycée', 'institution'], examples: ['Il va à l\'école tous les matins.', 'L\'école est obligatoire jusqu\'à 16 ans en France.'] },
  'famille': { def: 'Groupe de personnes unies par des liens de parenté, d\'alliance ou d\'adoption, vivant ou non ensemble.', synonyms: ['foyer', 'ménage', 'clan', 'proches'], examples: ['La famille est le pilier de la société.', 'Il passe ses vacances en famille.'] },
  'amour': { def: 'Sentiment d\'affection profonde et d\'attachement envers une personne, une chose ou une idée.', synonyms: ['affection', 'tendresse', 'passion', 'attachement'], examples: ['L\'amour est le moteur de bien des chefs-d\'œuvre.', 'L\'amour familial est inconditionnel.'] },
  'amitié': { def: 'Sentiment réciproque d\'affection, d\'estime et de confiance entre personnes qui ne sont pas liées par des liens familiaux.', synonyms: ['camaraderie', 'fraternité', 'solidarité', 'entente'], examples: ['L\'amitié vraie résiste à l\'épreuve du temps.', 'Ils ont noué une amitié durable au lycée.'] },
  'maison': { def: 'Bâtiment construit pour l\'habitation humaine, généralement individuel, avec des pièces et un toit.', synonyms: ['demeure', 'habitation', 'résidence', 'logement'], examples: ['Il rentre à la maison après l\'école.', 'Leur maison est entourée d\'un jardin.'] },
  'travail': { def: 'Activité physique ou intellectuelle exercée en vue d\'un résultat, souvent dans le cadre d\'un emploi rémunéré.', synonyms: ['emploi', 'activité', 'labeur', 'profession'], examples: ['Le travail est une valeur essentielle.', 'Elle cherche un travail dans l\'enseignement.'] },
  'temps': { def: 'Notion fondamentale représentant la succession des événements du passé au futur, mesurée en secondes, heures, etc.', synonyms: ['durée', 'période', 'époque', 'moment'], examples: ['Le temps passe vite quand on est occupé.', 'Il faut bien gérer son temps de travail.'] },
  'vie': { def: 'État caractéristique des êtres organisés, capable de se reproduire, croître et réagir aux stimuli. Existence humaine.', synonyms: ['existence', 'destin', 'parcours', 'vécu'], examples: ['La vie est un cadeau précieux.', 'Il mène une vie studieuse et équilibrée.'] },
  'monde': { def: 'La Terre et tout ce qui l\'entoure ; l\'ensemble des êtres humains et des sociétés qui y vivent.', synonyms: ['univers', 'humanité', 'société', 'terre'], examples: ['Le monde change à grande vitesse.', 'Il a voyagé à travers le monde.'] },
  'science': { def: 'Ensemble organisé de connaissances relatives à certains faits ou phénomènes, obtenues par l\'observation et le raisonnement.', synonyms: ['connaissance', 'savoir', 'discipline', 'recherche'], examples: ['La science permet de comprendre le monde.', 'Il se passionne pour la science depuis l\'enfance.'] },
  'nature': { def: 'L\'ensemble du monde physique et vivant non produit par l\'homme : plantes, animaux, paysages, phénomènes naturels.', synonyms: ['environnement', 'écosystème', 'milieu naturel', 'création'], examples: ['La nature est notre bien commun à préserver.', 'Une randonnée en pleine nature ressource l\'esprit.'] },
  'culture': { def: 'Ensemble des connaissances, croyances, arts, lois, mœurs et coutumes acquis par l\'homme en tant que membre d\'une société.', synonyms: ['civilisation', 'patrimoine', 'tradition', 'savoir'], examples: ['La culture française est reconnue dans le monde entier.', 'La lecture enrichit la culture générale.'] },
  'histoire': { def: 'Récit ou étude des événements du passé humain. Science qui étudie et interprète le passé des sociétés humaines.', synonyms: ['passé', 'mémoire', 'chronique', 'annales'], examples: ['L\'histoire nous enseigne les erreurs du passé.', 'L\'histoire de France est riche en événements.'] },
  'bonheur': { def: 'État de satisfaction complète et durable, sentiment d\'épanouissement et de plénitude dans l\'existence.', synonyms: ['félicité', 'joie', 'bien-être', 'contentement'], examples: ['Le bonheur est souvent dans les petites choses.', 'Il a trouvé son bonheur dans l\'enseignement.'] },
  'respect': { def: 'Considération et égard portés à quelqu\'un ou quelque chose, impliquant de ne pas nuire ni offenser.', synonyms: ['considération', 'estime', 'déférence', 'égard'], examples: ['Le respect mutuel est la base de toute relation.', 'Respecter les règles est un devoir civique.'] },
  'courage': { def: 'Qualité morale permettant d\'affronter la peur, le danger ou la difficulté sans céder à la panique.', synonyms: ['bravoure', 'témérité', 'vaillance', 'hardiesse'], examples: ['Il faut du courage pour admettre ses erreurs.', 'Son courage face à l\'adversité est admirable.'] },
  'intelligence': { def: 'Capacité de comprendre, d\'apprendre, de raisonner et de s\'adapter à des situations nouvelles.', synonyms: ['intellect', 'perspicacité', 'sagacité', 'entendement'], examples: ['L\'intelligence ne se limite pas aux performances scolaires.', 'L\'intelligence émotionnelle est tout aussi importante.'] },
  'connaissance': { def: 'Résultat de l\'acte de connaître ; ensemble des informations, faits, principes et expériences acquis par l\'apprentissage.', synonyms: ['savoir', 'érudition', 'culture', 'instruction'], examples: ['La connaissance s\'acquiert tout au long de la vie.', 'Partager ses connaissances est un acte généreux.'] },
  'étudier': { def: 'Appliquer son esprit à l\'apprentissage d\'une matière, chercher à comprendre et à mémoriser un contenu.', synonyms: ['apprendre', 'réviser', 'travailler', 'approfondir'], examples: ['Il étudie deux heures chaque soir.', 'Étudier régulièrement est la clé de la réussite.'] },
  'apprendre': { def: 'Acquérir des connaissances nouvelles ou développer de nouvelles compétences par l\'étude ou l\'expérience.', synonyms: ['étudier', 'mémoriser', 'assimiler', 'découvrir'], examples: ['Apprendre une nouvelle langue ouvre des portes.', 'Il aime apprendre de nouvelles choses chaque jour.'] },
  'réussite': { def: 'Fait de réussir, d\'atteindre avec succès un but que l\'on s\'était fixé.', synonyms: ['succès', 'accomplissement', 'victoire', 'achievement'], examples: ['La réussite scolaire demande effort et méthode.', 'Sa réussite est le fruit d\'un travail acharné.'] },
  'effort': { def: 'Tension physique ou mentale dirigée vers un but ; énergie déployée pour accomplir quelque chose de difficile.', synonyms: ['peine', 'travail', 'application', 'persévérance'], examples: ['Tout effort mérite récompense.', 'Ses efforts ont finalement payé.'] },
  'objectif': { def: 'But que l\'on se propose d\'atteindre ; résultat concret visé au terme d\'une action.', synonyms: ['but', 'cible', 'fin', 'ambition'], examples: ['Il s\'est fixé comme objectif d\'intégrer une grande école.', 'Atteindre ses objectifs demande de la discipline.'] },
  'problème': { def: 'Difficulté à résoudre, question complexe qui exige une réflexion ou une solution.', synonyms: ['difficulté', 'enjeu', 'question', 'obstacle'], examples: ['Ce problème de maths est difficile.', 'Il faut résoudre les problèmes un par un.'] },
  'solution': { def: 'Moyen ou réponse qui permet de résoudre un problème, une difficulté ou une question.', synonyms: ['réponse', 'remède', 'résolution', 'démarche'], examples: ['Il a trouvé une solution originale.', 'Chercher des solutions plutôt que des excuses.'] },
  'question': { def: 'Phrase interrogative par laquelle on demande une information, un avis ou une explication.', synonyms: ['interrogation', 'demande', 'problématique', 'requête'], examples: ['Poser des questions est le signe d\'un esprit curieux.', 'La question de l\'examen portait sur la dérivation.'] },
  'réponse': { def: 'Ce que l\'on dit ou écrit pour donner suite à une question, une demande ou une sollicitation.', synonyms: ['riposte', 'réaction', 'solution', 'explication'], examples: ['La réponse doit être argumentée et structurée.', 'Il a donné une réponse précise et complète.'] },
  'information': { def: 'Donnée ou renseignement permettant d\'acquérir ou de partager des connaissances sur un sujet particulier.', synonyms: ['donnée', 'renseignement', 'nouvelle', 'fait'], examples: ['L\'information doit être vérifiée avant d\'être partagée.', 'Le numérique a révolutionné la circulation de l\'information.'] },
  // ── Vocabulaire général ──────────────────────────────────────────────────────
  'liberté': { def: 'État de quelqu\'un qui n\'est pas soumis à la servitude ou à l\'esclavage. Pouvoir d\'agir selon sa propre volonté, en dehors de toute contrainte.', synonyms: ['indépendance', 'autonomie', 'affranchissement', 'émancipation'], examples: ['La liberté est un droit fondamental.', 'La liberté d\'expression est garantie par la Constitution.'] },
  'analyse': { def: 'Décomposition d\'un tout en ses éléments constitutifs pour en étudier la nature, les fonctions et les relations.', synonyms: ['étude', 'examen', 'décomposition', 'investigation'], examples: ['L\'analyse du texte révèle une structure complexe.', 'Faire l\'analyse d\'une situation.'] },
  'hypothèse': { def: 'Proposition admise comme vraie avant démonstration, servant de point de départ à un raisonnement scientifique.', synonyms: ['supposition', 'conjecture', 'postulat', 'théorie'], examples: ['Formuler une hypothèse de travail.', 'Cette hypothèse reste à vérifier.'] },
  'démocratie': { def: 'Régime politique dans lequel la souveraineté appartient au peuple, qui l\'exerce directement ou par l\'intermédiaire de représentants élus.', synonyms: ['régime représentatif', 'gouvernement du peuple', 'république'], examples: ['La démocratie repose sur la séparation des pouvoirs.', 'Les élections sont le pilier de la démocratie.'] },
  'paradoxe': { def: 'Proposition qui va à l\'encontre de l\'opinion commune et qui semble contredire la logique, mais peut révéler une vérité profonde.', synonyms: ['contradiction', 'antinomie', 'absurdité apparente', 'aporie'], examples: ['C\'est un paradoxe : plus on travaille, moins on semble avancer.', 'Le paradoxe du menteur est célèbre en logique.'] },
  'métaphore': { def: 'Figure de style consistant à désigner une chose par le nom d\'une autre, en établissant une comparaison implicite.', synonyms: ['image', 'comparaison', 'analogie', 'symbole'], examples: ['La vie est un long fleuve tranquille.', 'L\'orateur avait un cœur de pierre.'] },
  'ambiguïté': { def: 'Caractère de ce qui peut être interprété de plusieurs façons différentes, prêtant à confusion ou à équivoque.', synonyms: ['équivoque', 'incertitude', 'flou', 'obscurité'], examples: ['L\'ambiguïté de sa réponse a semé le doute.', 'Il faut lever toute ambiguïté avant de signer.'] },
  'synthèse': { def: 'Opération intellectuelle qui consiste à rassembler et à combiner des éléments distincts pour former un tout cohérent.', synonyms: ['résumé', 'récapitulation', 'bilan', 'conclusion'], examples: ['Faire la synthèse des documents proposés.', 'Cette introduction est une belle synthèse.'] },
  'allégorie': { def: 'Représentation d\'une idée abstraite ou morale à travers une image concrète, un récit ou un personnage.', synonyms: ['symbole', 'parabole', 'représentation', 'figure'], examples: ['La Justice représentée par une femme aveugle est une allégorie.', 'Le Jugement dernier est une allégorie du bien et du mal.'] },
  'énigme': { def: 'Question, parole ou situation difficile à comprendre ou à expliquer, dont la solution est cachée.', synonyms: ['mystère', 'devinette', 'charade', 'problème'], examples: ['Cette disparition reste une énigme pour la police.', 'L\'enquêteur tente de résoudre l\'énigme.'] },
  'justice': { def: 'Principe moral selon lequel chacun reçoit ce qu\'il mérite ; institution chargée d\'appliquer le droit.', synonyms: ['équité', 'droit', 'impartialité', 'légalité'], examples: ['La justice est rendue au nom du peuple.', 'Rendre justice aux victimes est primordial.'] },
  'vérité': { def: 'Conformité d\'une idée, d\'un énoncé ou d\'une proposition avec la réalité des faits.', synonyms: ['réalité', 'exactitude', 'authenticité', 'véracité'], examples: ['La vérité finit toujours par éclater au grand jour.', 'Il faut distinguer vérité et opinion.'] },
  'pouvoir': { def: 'Capacité ou droit d\'agir sur quelqu\'un ou quelque chose ; autorité exercée par une personne ou une institution.', synonyms: ['autorité', 'influence', 'contrôle', 'domination'], examples: ['Le pouvoir corrompt ceux qui en abusent.', 'Le pouvoir législatif vote les lois.'] },
  'société': { def: 'Groupe d\'individus partageant un territoire, des règles communes, des institutions et une culture partagée.', synonyms: ['communauté', 'collectivité', 'groupe', 'civilisation'], examples: ['La société évolue avec les nouvelles technologies.', 'Chacun a un rôle à jouer dans la société.'] },
  'identité': { def: 'Caractère de ce qui est identique ; ensemble des traits propres à une personne ou à un groupe qui les distingue des autres.', synonyms: ['individualité', 'personnalité', 'singularité', 'moi'], examples: ['La langue est un marqueur fort d\'identité culturelle.', 'Il est en quête d\'identité.'] },
  'valeur': { def: 'Ce qui est estimé, digne d\'intérêt ou d\'importance ; principe moral servant de référence dans les choix.', synonyms: ['principe', 'idéal', 'norme', 'bien'], examples: ['Les valeurs républicaines sont liberté, égalité, fraternité.', 'Il agit toujours selon ses valeurs.'] },
  // ── Philosophie ──────────────────────────────────────────────────────────────
  'conscience': { def: 'Connaissance intuitive ou réflexive que l\'être humain a de lui-même et du monde extérieur. Faculté de percevoir et de juger le bien et le mal.', synonyms: ['lucidité', 'sensibilité', 'éveil', 'perception'], examples: ['Prendre conscience de ses erreurs.', 'La conscience morale guide nos actes.'] },
  'dialectique': { def: 'Méthode de raisonnement fondée sur la confrontation d\'idées opposées (thèse, antithèse) pour aboutir à une synthèse.', synonyms: ['raisonnement', 'argumentation', 'logique', 'débat'], examples: ['La dialectique hégélienne oppose thèse et antithèse.', 'Utiliser la dialectique pour convaincre.'] },
  'éthique': { def: 'Ensemble des principes moraux qui guident le comportement d\'une personne ou d\'un groupe dans la vie en société.', synonyms: ['morale', 'déontologie', 'valeurs', 'principes'], examples: ['L\'éthique médicale impose le respect du patient.', 'Agir selon ses valeurs éthiques.'] },
  'empirisme': { def: 'Doctrine philosophique selon laquelle toute connaissance provient de l\'expérience sensible et non de principes innés.', synonyms: ['expérimentalisme', 'positivisme', 'pragmatisme'], examples: ['Locke et Hume sont les pères de l\'empirisme.', 'L\'empirisme s\'oppose au rationalisme.'] },
  'rationalisme': { def: 'Doctrine selon laquelle la raison est la seule source valable de connaissance, indépendamment des sens.', synonyms: ['intellectualisme', 'logicisme', 'positivisme'], examples: ['Descartes est le fondateur du rationalisme moderne.', 'Le rationalisme met la raison au centre de la connaissance.'] },
  'raison': { def: 'Faculté intellectuelle permettant de distinguer le vrai du faux et de raisonner de façon logique et réfléchie.', synonyms: ['intellect', 'entendement', 'logique', 'réflexion'], examples: ['La raison nous distingue des animaux selon Descartes.', 'Agir en raison, c\'est agir de façon réfléchie.'] },
  'subjectivité': { def: 'Caractère de ce qui appartient au sujet pensant et est influencé par ses perceptions, émotions et opinions personnelles.', synonyms: ['partialité', 'personnalité', 'ressenti', 'perspective'], examples: ['La subjectivité peut biaiser une analyse critique.', 'L\'art est par nature une expression de la subjectivité.'] },
  'objectivité': { def: 'Qualité de ce qui est fondé sur des faits réels, indépendamment des opinions ou des sentiments personnels.', synonyms: ['impartialité', 'neutralité', 'rigueur', 'factualité'], examples: ['Un journaliste doit s\'efforcer à l\'objectivité.', 'L\'objectivité scientifique s\'obtient par la méthode expérimentale.'] },
  'déterminisme': { def: 'Doctrine selon laquelle tout événement est la conséquence nécessaire de causes antérieures, excluant le hasard et le libre arbitre.', synonyms: ['causalité', 'fatalisme', 'nécessitarisme'], examples: ['Le déterminisme s\'oppose à la liberté de la volonté.', 'Einstein croyait au déterminisme en physique.'] },
  'humanisme': { def: 'Courant de pensée qui place l\'être humain et son épanouissement au centre des valeurs et de la réflexion.', synonyms: ['anthropocentrisme', 'philanthropie', 'bienveillance'], examples: ['La Renaissance est marquée par l\'essor de l\'humanisme.', 'L\'humanisme défend la dignité de tout être humain.'] },
  // ── Sciences ─────────────────────────────────────────────────────────────────
  'photosynthèse': { def: 'Processus biologique par lequel les plantes convertissent la lumière solaire, le dioxyde de carbone et l\'eau en glucose et en dioxygène.', synonyms: ['assimilation chlorophyllienne', 'biophotosynthèse'], examples: ['La photosynthèse a lieu dans les chloroplastes.', 'Sans photosynthèse, la vie telle qu\'on la connaît n\'existerait pas.'] },
  'énergie': { def: 'Capacité d\'un système physique à produire un travail mécanique ou un transfert de chaleur. Grandeur physique fondamentale.', synonyms: ['force', 'puissance', 'vitalité', 'capacité'], examples: ['L\'énergie cinétique est proportionnelle au carré de la vitesse.', 'Les énergies renouvelables limitent les émissions de CO₂.'] },
  'atome': { def: 'Plus petite unité constituante de la matière ordinaire, composée d\'un noyau (protons et neutrons) et d\'électrons gravitant autour.', synonyms: ['particule', 'corpuscule', 'élément'], examples: ['Un atome d\'hydrogène ne possède qu\'un seul proton.', 'La liaison entre atomes forme des molécules.'] },
  'chromosomes': { def: 'Structures filiformes situées dans le noyau de la cellule, constituées d\'ADN et de protéines, portant les gènes héréditaires.', synonyms: ['gènes', 'ADN', 'matériel génétique'], examples: ['L\'humain possède 46 chromosomes.', 'Les chromosomes X et Y déterminent le sexe biologique.'] },
  'évolution': { def: 'Processus par lequel les espèces vivantes se transforment au fil du temps sous l\'effet de la sélection naturelle et des mutations génétiques.', synonyms: ['transformation', 'sélection naturelle', 'mutation', 'phylogénèse'], examples: ['Darwin a décrit la théorie de l\'évolution.', 'L\'évolution explique la diversité du vivant.'] },
  'cellule': { def: 'Unité structurale et fonctionnelle fondamentale de tout organisme vivant, délimitée par une membrane et contenant un matériel génétique.', synonyms: ['unité vivante', 'élément biologique', 'microstructure'], examples: ['Le corps humain est composé de milliards de cellules.', 'La cellule eucaryote possède un noyau délimité.'] },
  'molécule': { def: 'Ensemble d\'atomes liés par des liaisons chimiques, constituant la plus petite entité stable d\'un corps pur.', synonyms: ['composé chimique', 'structure moléculaire'], examples: ['La molécule d\'eau est composée de deux atomes d\'hydrogène et un d\'oxygène.', 'Les molécules organiques contiennent du carbone.'] },
  'gravité': { def: 'Force d\'attraction universelle exercée par tout corps possédant une masse sur les autres corps, décrite par Newton et Einstein.', synonyms: ['pesanteur', 'gravitation', 'attraction universelle'], examples: ['La gravité maintient les planètes en orbite autour du soleil.', 'La gravité terrestre vaut environ 9,81 m/s².'] },
  'biodiversité': { def: 'Variété et richesse de toutes les formes de vie sur Terre : espèces, écosystèmes et diversité génétique au sein d\'une espèce.', synonyms: ['diversité biologique', 'richesse spécifique', 'écosystème'], examples: ['La biodiversité est menacée par le réchauffement climatique.', 'Protéger la biodiversité est un impératif mondial.'] },
  'écologie': { def: 'Science qui étudie les relations entre les êtres vivants et leur environnement ; par extension, préoccupation pour la protection de la nature.', synonyms: ['biologie environnementale', 'environnementalisme', 'écologisme'], examples: ['L\'écologie est au cœur des débats politiques actuels.', 'Elle a choisi des études en écologie marine.'] },
  'mathématiques': { def: 'Science qui étudie les propriétés des nombres, des structures, des formes et des transformations par le raisonnement logique et la démonstration.', synonyms: ['calcul', 'arithmétique', 'algèbre', 'géométrie'], examples: ['Les mathématiques sont omniprésentes dans la physique.', 'Maîtriser les mathématiques est un atout indéniable.'] },
  // ── Histoire ─────────────────────────────────────────────────────────────────
  'révolution': { def: 'Changement brusque et radical dans les structures politiques, sociales ou économiques d\'une société, souvent accompagné de violence.', synonyms: ['insurrection', 'renversement', 'bouleversement', 'soulèvement'], examples: ['La Révolution française de 1789 a changé l\'Europe.', 'La révolution industrielle a transformé le mode de production.'] },
  'colonisation': { def: 'Processus par lequel une nation étend son autorité politique, économique et culturelle sur un territoire étranger et ses habitants.', synonyms: ['conquête', 'domination', 'impérialisme', 'expansion'], examples: ['La colonisation de l\'Afrique par les puissances européennes s\'est intensifiée au XIXe siècle.', 'La décolonisation a suivi la Seconde Guerre mondiale.'] },
  'totalitarisme': { def: 'Système politique dans lequel l\'État exerce un contrôle total sur tous les aspects de la vie individuelle et collective.', synonyms: ['dictature', 'autoritarisme', 'despotisme', 'tyrannie'], examples: ['Le nazisme et le stalinisme sont des formes de totalitarisme.', 'Le totalitarisme supprime les libertés individuelles.'] },
  'guerre': { def: 'Conflit armé entre des groupes organisés, notamment entre États, impliquant l\'usage de la violence et ayant des enjeux politiques, économiques ou idéologiques.', synonyms: ['conflit', 'combat', 'belligérance', 'hostilités'], examples: ['La Première Guerre mondiale a fait 17 millions de victimes.', 'La guerre froide opposait l\'URSS aux États-Unis.'] },
  'paix': { def: 'Absence de guerre et de conflit armé ; état de calme, d\'harmonie et de tranquillité entre personnes ou nations.', synonyms: ['tranquillité', 'harmonie', 'cessez-le-feu', 'concorde'], examples: ['La paix est la condition nécessaire au développement humain.', 'Le traité de paix met fin aux hostilités.'] },
  'résistance': { def: 'Action d\'opposer une force à une autre pour ne pas y céder ; mouvement clandestin qui s\'oppose à une occupation étrangère.', synonyms: ['opposition', 'rébellion', 'lutte', 'combat'], examples: ['La Résistance française a joué un rôle crucial pendant la Seconde Guerre mondiale.', 'Il faut parfois de la résistance pour défendre ses convictions.'] },
  'citoyenneté': { def: 'Statut d\'un citoyen membre d\'une communauté politique, impliquant des droits et des devoirs civiques.', synonyms: ['civisme', 'appartenance civique', 'nationalité'], examples: ['La citoyenneté implique le droit de vote et le devoir de respecter les lois.', 'L\'école forme à la citoyenneté démocratique.'] },
  // ── Langue française ─────────────────────────────────────────────────────────
  'cohérence': { def: 'Qualité de ce qui est logiquement organisé, sans contradiction interne, formant un ensemble harmonieux et compréhensible.', synonyms: ['logique', 'cohésion', 'harmonie', 'consistance'], examples: ['La cohérence d\'un texte est assurée par les connecteurs logiques.', 'Son raisonnement manque de cohérence.'] },
  'argumentation': { def: 'Ensemble des arguments et des procédés rhétoriques utilisés pour défendre une thèse ou convaincre un interlocuteur.', synonyms: ['démonstration', 'plaidoyer', 'raisonnement', 'rhétorique'], examples: ['Une bonne argumentation repose sur des exemples précis.', 'L\'argumentation doit être progressive.'] },
  'péripétie': { def: 'Changement brusque de situation dans le déroulement d\'un récit ou d\'une action, créant un rebondissement.', synonyms: ['rebondissement', 'coup de théâtre', 'événement', 'incident'], examples: ['Le roman est riche en péripéties.', 'Les péripéties maintiennent le lecteur en haleine.'] },
  'ironie': { def: 'Façon de s\'exprimer dans laquelle on dit le contraire de ce qu\'on veut faire comprendre, souvent à des fins satiriques ou humoristiques.', synonyms: ['sarcasme', 'antiphrase', 'moquerie', 'causticité'], examples: ['L\'ironie socratique consiste à feindre l\'ignorance.', 'Il a répondu avec beaucoup d\'ironie.'] },
  'euphémisme': { def: 'Figure de style atténuant une expression choquante, désagréable ou brutale en la remplaçant par une formulation plus douce.', synonyms: ['atténuation', 'litote', 'adoucissement'], examples: ['Dire "il nous a quittés" au lieu de "il est mort" est un euphémisme.', 'Les euphémismes adoucissent la réalité.'] },
  'oxymore': { def: 'Figure de style associant deux termes dont les sens sont contradictoires ou opposés pour créer un effet stylistique frappant.', synonyms: ['contradiction', 'antithèse', 'paradoxe stylistique'], examples: ['"Une obscure clarté" est un célèbre oxymore de Corneille.', 'L\'oxymore exprime une tension entre deux réalités.'] },
  'enjambement': { def: 'Procédé poétique consistant à reporter à la ligne suivante un ou plusieurs mots nécessaires au sens du vers précédent.', synonyms: ['rejet', 'contre-rejet', 'débordement'], examples: ['L\'enjambement crée un effet de souffle et de mouvement dans le poème.', 'Victor Hugo utilise fréquemment l\'enjambement.'] },
  'narrateur': { def: 'Personnage ou voix fictive qui raconte l\'histoire dans un récit littéraire, distinct de l\'auteur réel.', synonyms: ['conteur', 'voix narrative', 'instance narrative'], examples: ['Le narrateur omniscient connaît les pensées de tous les personnages.', 'Dans ce roman, le narrateur est aussi le personnage principal.'] },
  'thèse': { def: 'Proposition, point de vue ou affirmation que l\'on défend et que l\'on cherche à démontrer dans un texte argumentatif.', synonyms: ['position', 'affirmation', 'argument principal', 'postulat'], examples: ['La thèse de l\'auteur est clairement exposée en introduction.', 'Défendre une thèse demande des arguments solides.'] },
  'antithèse': { def: 'Figure de style opposant deux idées, deux mots ou deux images contraires pour créer un contraste frappant.', synonyms: ['opposition', 'contraste', 'contradiction', 'polar opposé'], examples: ['"Soyez forts pour être doux" est une antithèse.', 'L\'antithèse met en valeur les deux aspects d\'une réalité.'] },
  'hyperbole': { def: 'Figure de style consistant à exagérer une réalité pour la rendre plus frappante, plus expressive ou pour intensifier un effet.', synonyms: ['exagération', 'amplification', 'surenchère'], examples: ['"Je meurs de faim" est une hyperbole.', 'L\'hyperbole est fréquente dans le langage courant.'] },
  'comparaison': { def: 'Figure de style qui met en relation deux éléments à l\'aide d\'un terme comparatif explicite (comme, tel, ainsi que...).', synonyms: ['analogie', 'rapprochement', 'similitude', 'parallèle'], examples: ['Il est courageux comme un lion.', 'La comparaison rend le texte plus vivant et imagé.'] },
  'anaphore': { def: 'Figure de style consistant à répéter un mot ou un groupe de mots au début de plusieurs phrases ou vers successifs.', synonyms: ['répétition', 'insistance', 'refrain rhétorique'], examples: ['"Je suis venu, j\'ai vu, j\'ai vaincu" contient une anaphore.', 'L\'anaphore crée un effet rythmique et insistant.'] },
  'ponctuation': { def: 'Ensemble de signes graphiques (point, virgule, point-virgule, etc.) servant à organiser un texte écrit et à en faciliter la lecture.', synonyms: ['signes de ponctuation', 'marques typographiques'], examples: ['La ponctuation guide la lecture et le sens d\'un texte.', 'Une mauvaise ponctuation peut changer le sens d\'une phrase.'] },
  'orthographe': { def: 'Ensemble des règles qui régissent la façon correcte d\'écrire les mots d\'une langue.', synonyms: ['graphie', 'spelling', 'grammaire orthographique'], examples: ['Maîtriser l\'orthographe est indispensable à l\'écrit.', 'Un dictionnaire aide à vérifier l\'orthographe.'] },
  'grammaire': { def: 'Ensemble des règles qui décrivent le fonctionnement d\'une langue : la morphologie, la syntaxe et l\'orthographe grammaticale.', synonyms: ['syntaxe', 'morphologie', 'linguistique', 'règles linguistiques'], examples: ['La grammaire française est réputée complexe.', 'Étudier la grammaire permet de mieux construire ses phrases.'] },
  'vocabulaire': { def: 'Ensemble des mots d\'une langue ou utilisés par une personne, un groupe ou dans un domaine particulier.', synonyms: ['lexique', 'terminologie', 'glossaire', 'mots'], examples: ['Un vocabulaire riche enrichit l\'expression écrite et orale.', 'Ce texte utilise un vocabulaire technique spécialisé.'] },
  'littérature': { def: 'Ensemble des œuvres écrites d\'une langue ou d\'une époque, considérées dans leur dimension artistique et culturelle.', synonyms: ['belles lettres', 'œuvres littéraires', 'écriture', 'lettres'], examples: ['La littérature française est l\'une des plus riches du monde.', 'Lire de la littérature développe l\'empathie.'] },
  'poésie': { def: 'Art d\'exprimer des émotions et des idées à travers un langage travaillé, rythmé et imagé, souvent en vers.', synonyms: ['vers', 'lyrisme', 'art poétique', 'versification'], examples: ['La poésie de Rimbaud est d\'une modernité saisissante.', 'La poésie joue sur les sonorités autant que sur le sens.'] },
  'roman': { def: 'Œuvre littéraire de fiction en prose, de longueur variable, qui raconte une histoire avec des personnages, une intrigue et un cadre.', synonyms: ['récit', 'fiction', 'prose narrative', 'œuvre'], examples: ['Le roman est le genre littéraire dominant depuis le XIXe siècle.', 'Elle a lu ce roman en une nuit tellement il était captivant.'] },
  'dissertation': { def: 'Exercice scolaire ou académique consistant à développer une réflexion structurée sur un sujet en défendant une thèse avec des arguments.', synonyms: ['rédaction', 'devoir', 'essai', 'composition'], examples: ['La dissertation de philosophie exige un plan thèse/antithèse/synthèse.', 'Réussir une dissertation demande méthode et culture.'] },
  // ── Mathématiques ─────────────────────────────────────────────────────────────
  'démonstration': { def: 'Raisonnement rigoureux permettant d\'établir la vérité d\'une proposition à partir d\'axiomes et de règles logiques acceptés.', synonyms: ['preuve', 'justification', 'vérification', 'raisonnement'], examples: ['La démonstration par récurrence est très utilisée.', 'Une démonstration doit être rigoureuse et sans lacune.'] },
  'fonction': { def: 'Relation mathématique qui associe à chaque élément d\'un ensemble de départ exactement un élément d\'un ensemble d\'arrivée.', synonyms: ['application', 'correspondance', 'mapping', 'loi'], examples: ['f(x) = 2x + 3 est une fonction affine.', 'La dérivée mesure la variation d\'une fonction.'] },
  'vecteur': { def: 'Objet mathématique caractérisé par une direction, un sens et une norme (longueur), représentant un déplacement ou une force.', synonyms: ['grandeur vectorielle', 'flèche'], examples: ['Un vecteur est représenté par une flèche.', 'La somme de deux vecteurs s\'obtient par la règle du parallélogramme.'] },
  'intégrale': { def: 'Opération mathématique permettant de calculer l\'aire sous une courbe, l\'inverse de la dérivation.', synonyms: ['primitive', 'antidérivée', 'calcul intégral'], examples: ['L\'intégrale de f entre a et b donne l\'aire sous la courbe.', 'Le calcul d\'une intégrale définie donne un nombre réel.'] },
  'équation': { def: 'Égalité mathématique contenant une ou plusieurs inconnues dont on cherche les valeurs qui vérifient l\'égalité.', synonyms: ['relation', 'égalité', 'expression algébrique'], examples: ['Résoudre une équation du second degré utilise le discriminant.', '2x + 3 = 7 est une équation simple du premier degré.'] },
  'probabilité': { def: 'Mesure numérique entre 0 et 1 exprimant la chance qu\'un événement aléatoire se réalise.', synonyms: ['chance', 'vraisemblance', 'likelihood', 'statistique'], examples: ['La probabilité de tirer un as dans un jeu de 52 cartes est 4/52.', 'Les probabilités sont essentielles en statistiques.'] },
  'statistique': { def: 'Science qui collecte, organise, analyse et interprète des données numériques pour décrire des phénomènes ou prendre des décisions.', synonyms: ['données', 'analyse de données', 'étude quantitative'], examples: ['Les statistiques montrent une hausse du niveau moyen.', 'La médiane est plus robuste que la moyenne en statistique.'] },
  'géométrie': { def: 'Branche des mathématiques qui étudie les formes, les surfaces, les volumes et leurs propriétés dans l\'espace.', synonyms: ['mathématiques spatiales', 'topologie élémentaire'], examples: ['La géométrie euclidienne est la base de l\'enseignement secondaire.', 'Les théorèmes de Thalès et Pythagore sont fondamentaux.'] },
  'algorithme': { def: 'Suite finie et ordonnée d\'opérations ou d\'instructions permettant de résoudre un problème ou d\'effectuer un calcul.', synonyms: ['procédure', 'méthode', 'calcul systématique', 'programme'], examples: ['Les algorithmes de tri organisent des données.', 'Google utilise des algorithmes complexes pour ses recherches.'] },
  'dérivée': { def: 'Limite du taux de variation d\'une fonction en un point, mesurant la vitesse de variation instantanée de cette fonction.', synonyms: ['taux de variation', 'pente', 'différentielle'], examples: ['La dérivée de x² est 2x.', 'La dérivée d\'une fonction donne la pente de sa tangente.'] },
  // ── Vocabulaire courant éducatif ──────────────────────────────────────────────
  'révision': { def: 'Relecture et approfondissement de notions déjà étudiées dans le but de les consolider en mémoire.', synonyms: ['relecture', 'mémorisation', 'récapitulation', 'apprentissage'], examples: ['Les révisions du bac commencent plusieurs semaines avant l\'examen.', 'Une bonne révision repose sur la répétition espacée.'] },
  'examen': { def: 'Épreuve ou ensemble d\'épreuves organisées pour évaluer les connaissances et les compétences d\'un candidat.', synonyms: ['épreuve', 'contrôle', 'concours', 'test'], examples: ['L\'examen du baccalauréat a lieu en juin.', 'Préparer un examen demande de la rigueur et de la méthode.'] },
  'méthode': { def: 'Ensemble de procédés organisés et raisonnés permettant d\'atteindre un but ou de résoudre un problème efficacement.', synonyms: ['procédé', 'démarche', 'approche', 'technique'], examples: ['Avoir une bonne méthode de travail améliore les résultats.', 'La méthode scientifique repose sur l\'observation et l\'expérimentation.'] },
  'concentration': { def: 'Effort mental consistant à focaliser toute son attention sur une activité ou un sujet, en excluant les distractions.', synonyms: ['attention', 'focalisation', 'application', 'contention'], examples: ['La concentration est essentielle pour apprendre efficacement.', 'Le bruit nuit à la concentration.'] },
  'mémoire': { def: 'Faculté cognitive permettant d\'enregistrer, de conserver et de restituer des informations, des expériences ou des apprentissages.', synonyms: ['souvenir', 'rétention', 'rappel', 'mnémotechnique'], examples: ['Travailler la mémoire par des exercices réguliers améliore les résultats.', 'La mémoire à long terme conserve les connaissances consolidées.'] },
  'résumé': { def: 'Version condensée d\'un texte ou d\'un exposé, présentant les idées essentielles de manière brève et claire.', synonyms: ['abrégé', 'synthèse', 'précis', 'récapitulatif'], examples: ['Faire un résumé de cours aide à mémoriser l\'essentiel.', 'Le résumé doit conserver les idées principales sans les déformer.'] },
  'projet': { def: 'Plan d\'action ou ensemble d\'activités organisées en vue d\'atteindre un objectif défini dans un délai précis.', synonyms: ['plan', 'programme', 'initiative', 'entreprise'], examples: ['Son projet de fin d\'année porte sur les énergies renouvelables.', 'Conduire un projet demande organisation et anticipation.'] },
  'compétence': { def: 'Aptitude à mettre en œuvre des connaissances et des savoir-faire pour accomplir une tâche ou résoudre un problème.', synonyms: ['aptitude', 'capacité', 'habileté', 'savoir-faire'], examples: ['Les compétences numériques sont très recherchées.', 'Développer ses compétences tout au long de la vie est indispensable.'] },
  'motivation': { def: 'Force intérieure qui pousse à agir, à s\'engager dans une activité et à persévérer vers un but.', synonyms: ['stimulation', 'élan', 'désir', 'enthousiasme'], examples: ['La motivation est le moteur de la réussite scolaire.', 'Un enseignant passionné transmet sa motivation.'] },
  'persévérance': { def: 'Qualité de quelqu\'un qui maintient son effort et poursuit son action malgré les obstacles et les difficultés.', synonyms: ['ténacité', 'opiniâtreté', 'obstination', 'constance'], examples: ['La persévérance finit par payer.', 'La persévérance dans l\'étude permet de surmonter les notions difficiles.'] },
  // ── Sciences sociales / Économie ─────────────────────────────────────────────
  'mondialisation': { def: 'Processus d\'intégration croissante des économies, des cultures et des sociétés à l\'échelle planétaire, notamment par les échanges commerciaux.', synonyms: ['globalisation', 'internationalisation', 'ouverture des marchés'], examples: ['La mondialisation crée des interdépendances économiques.', 'La mondialisation a des effets positifs et négatifs sur les pays en développement.'] },
  'économie': { def: 'Science qui étudie la production, la distribution et la consommation des richesses ; ensemble des activités productives d\'une société.', synonyms: ['activité économique', 'marché', 'système économique'], examples: ['L\'économie française est la 7e mondiale.', 'La crise économique de 2008 a touché le monde entier.'] },
  'capitalisme': { def: 'Système économique fondé sur la propriété privée des moyens de production, le marché libre et la recherche du profit.', synonyms: ['libéralisme économique', 'économie de marché', 'système libéral'], examples: ['Le capitalisme est le système dominant dans les pays occidentaux.', 'Les critiques du capitalisme pointent ses inégalités.'] },
  'inégalité': { def: 'Différence ou disparité entre des individus ou des groupes concernant l\'accès aux ressources, aux droits ou aux opportunités.', synonyms: ['disparité', 'déséquilibre', 'écart', 'discrimination'], examples: ['Les inégalités sociales se creusent dans certains pays.', 'L\'école doit lutter contre les inégalités de départ.'] },
  'solidarité': { def: 'Sentiment de responsabilité mutuelle unissant les membres d\'une communauté, se traduisant par l\'entraide et l\'assistance réciproque.', synonyms: ['fraternité', 'cohésion', 'entraide', 'soutien mutuel'], examples: ['La solidarité entre camarades est une valeur importante.', 'L\'État social repose sur la solidarité nationale.'] },
  'environnement': { def: 'Ensemble des éléments naturels et artificiels qui entourent un individu ou une espèce et influencent leur existence.', synonyms: ['milieu', 'cadre de vie', 'écosystème', 'biosphère'], examples: ['Protéger l\'environnement est une responsabilité collective.', 'Les activités humaines dégradent l\'environnement.'] },
};

// ─── Conjugaisons ─────────────────────────────────────────────────────────────
type Tenses = 'présent' | 'passé composé' | 'imparfait' | 'futur simple' | 'conditionnel' | 'subjonctif';

interface VerbTable {
  présent: string[];
  'passé composé': string[];
  imparfait: string[];
  'futur simple': string[];
  conditionnel: string[];
  subjonctif: string[];
  aux?: 'avoir' | 'être'; // auxiliaire pour le passé composé
  pp?: string; // participe passé
}

// Table complète des verbes irréguliers et semi-réguliers
// Ordre : je, tu, il, nous, vous, ils
const VERB_TABLES: Record<string, VerbTable> = {
  'être': {
    présent:       ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    'passé composé':['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
    imparfait:     ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    'futur simple':['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    conditionnel:  ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
    subjonctif:    ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
  },
  'avoir': {
    présent:       ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    'passé composé':["ai eu", "as eu", "a eu", "avons eu", "avez eu", "ont eu"],
    imparfait:     ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    'futur simple':['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
    conditionnel:  ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
    subjonctif:    ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
  },
  'faire': {
    présent:       ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    'passé composé':['ai fait', 'as fait', 'a fait', 'avons fait', 'avez fait', 'ont fait'],
    imparfait:     ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
    'futur simple':['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
    conditionnel:  ['ferais', 'ferais', 'ferait', 'ferions', 'feriez', 'feraient'],
    subjonctif:    ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
  },
  'aller': {
    présent:       ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    'passé composé':['suis allé(e)', 'es allé(e)', 'est allé(e)', 'sommes allé(e)s', 'êtes allé(e)s', 'sont allé(e)s'],
    imparfait:     ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
    'futur simple':['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
    conditionnel:  ['irais', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
    subjonctif:    ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
  },
  'venir': {
    présent:       ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
    'passé composé':['suis venu(e)', 'es venu(e)', 'est venu(e)', 'sommes venu(e)s', 'êtes venu(e)s', 'sont venu(e)s'],
    imparfait:     ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'],
    'futur simple':['viendrai', 'viendras', 'viendra', 'viendrons', 'viendrez', 'viendront'],
    conditionnel:  ['viendrais', 'viendrais', 'viendrait', 'viendrions', 'viendriez', 'viendraient'],
    subjonctif:    ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent'],
  },
  'pouvoir': {
    présent:       ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
    'passé composé':['ai pu', 'as pu', 'a pu', 'avons pu', 'avez pu', 'ont pu'],
    imparfait:     ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'],
    'futur simple':['pourrai', 'pourras', 'pourra', 'pourrons', 'pourrez', 'pourront'],
    conditionnel:  ['pourrais', 'pourrais', 'pourrait', 'pourrions', 'pourriez', 'pourraient'],
    subjonctif:    ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
  },
  'vouloir': {
    présent:       ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
    'passé composé':['ai voulu', 'as voulu', 'a voulu', 'avons voulu', 'avez voulu', 'ont voulu'],
    imparfait:     ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient'],
    'futur simple':['voudrai', 'voudras', 'voudra', 'voudrons', 'voudrez', 'voudront'],
    conditionnel:  ['voudrais', 'voudrais', 'voudrait', 'voudrions', 'voudriez', 'voudraient'],
    subjonctif:    ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
  },
  'savoir': {
    présent:       ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
    'passé composé':['ai su', 'as su', 'a su', 'avons su', 'avez su', 'ont su'],
    imparfait:     ['savais', 'savais', 'savait', 'savions', 'saviez', 'savaient'],
    'futur simple':['saurai', 'sauras', 'saura', 'saurons', 'saurez', 'sauront'],
    conditionnel:  ['saurais', 'saurais', 'saurait', 'saurions', 'sauriez', 'sauraient'],
    subjonctif:    ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
  },
  'prendre': {
    présent:       ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
    'passé composé':['ai pris', 'as pris', 'a pris', 'avons pris', 'avez pris', 'ont pris'],
    imparfait:     ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
    'futur simple':['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'],
    conditionnel:  ['prendrais', 'prendrais', 'prendrait', 'prendrions', 'prendriez', 'prendraient'],
    subjonctif:    ['prenne', 'prennes', 'prenne', 'prenions', 'preniez', 'prennent'],
  },
  'mettre': {
    présent:       ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'],
    'passé composé':['ai mis', 'as mis', 'a mis', 'avons mis', 'avez mis', 'ont mis'],
    imparfait:     ['mettais', 'mettais', 'mettait', 'mettions', 'mettiez', 'mettaient'],
    'futur simple':['mettrai', 'mettras', 'mettra', 'mettrons', 'mettrez', 'mettront'],
    conditionnel:  ['mettrais', 'mettrais', 'mettrait', 'mettrions', 'mettriez', 'mettraient'],
    subjonctif:    ['mette', 'mettes', 'mette', 'mettions', 'mettiez', 'mettent'],
  },
  'voir': {
    présent:       ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
    'passé composé':['ai vu', 'as vu', 'a vu', 'avons vu', 'avez vu', 'ont vu'],
    imparfait:     ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient'],
    'futur simple':['verrai', 'verras', 'verra', 'verrons', 'verrez', 'verront'],
    conditionnel:  ['verrais', 'verrais', 'verrait', 'verrions', 'verriez', 'verraient'],
    subjonctif:    ['voie', 'voies', 'voie', 'voyions', 'voyiez', 'voient'],
  },
  'devoir': {
    présent:       ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
    'passé composé':['ai dû', 'as dû', 'a dû', 'avons dû', 'avez dû', 'ont dû'],
    imparfait:     ['devais', 'devais', 'devait', 'devions', 'deviez', 'devaient'],
    'futur simple':['devrai', 'devras', 'devra', 'devrons', 'devrez', 'devront'],
    conditionnel:  ['devrais', 'devrais', 'devrait', 'devrions', 'devriez', 'devraient'],
    subjonctif:    ['doive', 'doives', 'doive', 'devions', 'deviez', 'doivent'],
  },
  'tenir': {
    présent:       ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'],
    'passé composé':['ai tenu', 'as tenu', 'a tenu', 'avons tenu', 'avez tenu', 'ont tenu'],
    imparfait:     ['tenais', 'tenais', 'tenait', 'tenions', 'teniez', 'tenaient'],
    'futur simple':['tiendrai', 'tiendras', 'tiendra', 'tiendrons', 'tiendrez', 'tiendront'],
    conditionnel:  ['tiendrais', 'tiendrais', 'tiendrait', 'tiendrions', 'tiendriez', 'tiendraient'],
    subjonctif:    ['tienne', 'tiennes', 'tienne', 'tenions', 'teniez', 'tiennent'],
  },
  'partir': {
    présent:       ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
    'passé composé':['suis parti(e)', 'es parti(e)', 'est parti(e)', 'sommes parti(e)s', 'êtes parti(e)s', 'sont parti(e)s'],
    imparfait:     ['partais', 'partais', 'partait', 'partions', 'partiez', 'partaient'],
    'futur simple':['partirai', 'partiras', 'partira', 'partirons', 'partirez', 'partiront'],
    conditionnel:  ['partirais', 'partirais', 'partirait', 'partirions', 'partiriez', 'partiraient'],
    subjonctif:    ['parte', 'partes', 'parte', 'partions', 'partiez', 'partent'],
  },
  'sortir': {
    présent:       ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
    'passé composé':['suis sorti(e)', 'es sorti(e)', 'est sorti(e)', 'sommes sorti(e)s', 'êtes sorti(e)s', 'sont sorti(e)s'],
    imparfait:     ['sortais', 'sortais', 'sortait', 'sortions', 'sortiez', 'sortaient'],
    'futur simple':['sortirai', 'sortiras', 'sortira', 'sortirons', 'sortirez', 'sortiront'],
    conditionnel:  ['sortirais', 'sortirais', 'sortirait', 'sortirions', 'sortiriez', 'sortiraient'],
    subjonctif:    ['sorte', 'sortes', 'sorte', 'sortions', 'sortiez', 'sortent'],
  },
  'dire': {
    présent:       ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
    'passé composé':['ai dit', 'as dit', 'a dit', 'avons dit', 'avez dit', 'ont dit'],
    imparfait:     ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient'],
    'futur simple':['dirai', 'diras', 'dira', 'dirons', 'direz', 'diront'],
    conditionnel:  ['dirais', 'dirais', 'dirait', 'dirions', 'diriez', 'diraient'],
    subjonctif:    ['dise', 'dises', 'dise', 'disions', 'disiez', 'disent'],
  },
  'lire': {
    présent:       ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'],
    'passé composé':['ai lu', 'as lu', 'a lu', 'avons lu', 'avez lu', 'ont lu'],
    imparfait:     ['lisais', 'lisais', 'lisait', 'lisions', 'lisiez', 'lisaient'],
    'futur simple':['lirai', 'liras', 'lira', 'lirons', 'lirez', 'liront'],
    conditionnel:  ['lirais', 'lirais', 'lirait', 'lirions', 'liriez', 'liraient'],
    subjonctif:    ['lise', 'lises', 'lise', 'lisions', 'lisiez', 'lisent'],
  },
  'écrire': {
    présent:       ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'],
    'passé composé':['ai écrit', 'as écrit', 'a écrit', 'avons écrit', 'avez écrit', 'ont écrit'],
    imparfait:     ['écrivais', 'écrivais', 'écrivait', 'écrivions', 'écriviez', 'écrivaient'],
    'futur simple':['écrirai', 'écriras', 'écrira', 'écrirons', 'écrirez', 'écriront'],
    conditionnel:  ['écrirais', 'écrirais', 'écrirait', 'écririons', 'écririez', 'écriraient'],
    subjonctif:    ['écrive', 'écrives', 'écrive', 'écrivions', 'écriviez', 'écrivent'],
  },
  'ouvrir': {
    présent:       ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'],
    'passé composé':['ai ouvert', 'as ouvert', 'a ouvert', 'avons ouvert', 'avez ouvert', 'ont ouvert'],
    imparfait:     ['ouvrais', 'ouvrais', 'ouvrait', 'ouvrions', 'ouvriez', 'ouvraient'],
    'futur simple':['ouvrirai', 'ouvriras', 'ouvrira', 'ouvrirons', 'ouvrirez', 'ouvriront'],
    conditionnel:  ['ouvrirais', 'ouvrirais', 'ouvrirait', 'ouvririons', 'ouvririez', 'ouvriraient'],
    subjonctif:    ['ouvre', 'ouvres', 'ouvre', 'ouvrions', 'ouvriez', 'ouvrent'],
  },
  'vivre': {
    présent:       ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'],
    'passé composé':['ai vécu', 'as vécu', 'a vécu', 'avons vécu', 'avez vécu', 'ont vécu'],
    imparfait:     ['vivais', 'vivais', 'vivait', 'vivions', 'viviez', 'vivaient'],
    'futur simple':['vivrai', 'vivras', 'vivra', 'vivrons', 'vivrez', 'vivront'],
    conditionnel:  ['vivrais', 'vivrais', 'vivrait', 'vivrions', 'vivriez', 'vivraient'],
    subjonctif:    ['vive', 'vives', 'vive', 'vivions', 'viviez', 'vivent'],
  },
  'croire': {
    présent:       ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'],
    'passé composé':['ai cru', 'as cru', 'a cru', 'avons cru', 'avez cru', 'ont cru'],
    imparfait:     ['croyais', 'croyais', 'croyait', 'croyions', 'croyiez', 'croyaient'],
    'futur simple':['croirai', 'croiras', 'croira', 'croirons', 'croirez', 'croiront'],
    conditionnel:  ['croirais', 'croirais', 'croirait', 'croirions', 'croiriez', 'croiraient'],
    subjonctif:    ['croie', 'croies', 'croie', 'croyions', 'croyiez', 'croient'],
  },
  'recevoir': {
    présent:       ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'],
    'passé composé':['ai reçu', 'as reçu', 'a reçu', 'avons reçu', 'avez reçu', 'ont reçu'],
    imparfait:     ['recevais', 'recevais', 'recevait', 'recevions', 'receviez', 'recevaient'],
    'futur simple':['recevrai', 'recevras', 'recevra', 'recevrons', 'recevrez', 'recevront'],
    conditionnel:  ['recevrais', 'recevrais', 'recevrait', 'recevrions', 'recevriez', 'recevraient'],
    subjonctif:    ['reçoive', 'reçoives', 'reçoive', 'recevions', 'receviez', 'reçoivent'],
  },
  'connaître': {
    présent:       ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'],
    'passé composé':['ai connu', 'as connu', 'a connu', 'avons connu', 'avez connu', 'ont connu'],
    imparfait:     ['connaissais', 'connaissais', 'connaissait', 'connaissions', 'connaissiez', 'connaissaient'],
    'futur simple':['connaîtrai', 'connaîtras', 'connaîtra', 'connaîtrons', 'connaîtrez', 'connaîtront'],
    conditionnel:  ['connaîtrais', 'connaîtrais', 'connaîtrait', 'connaîtrions', 'connaîtriez', 'connaîtraient'],
    subjonctif:    ['connaisse', 'connaisses', 'connaisse', 'connaissions', 'connaissiez', 'connaissent'],
  },
  'vendre': {
    présent:       ['vends', 'vends', 'vend', 'vendons', 'vendez', 'vendent'],
    'passé composé':['ai vendu', 'as vendu', 'a vendu', 'avons vendu', 'avez vendu', 'ont vendu'],
    imparfait:     ['vendais', 'vendais', 'vendait', 'vendions', 'vendiez', 'vendaient'],
    'futur simple':['vendrai', 'vendras', 'vendra', 'vendrons', 'vendrez', 'vendront'],
    conditionnel:  ['vendrais', 'vendrais', 'vendrait', 'vendrions', 'vendriez', 'vendraient'],
    subjonctif:    ['vende', 'vendes', 'vende', 'vendions', 'vendiez', 'vendent'],
  },
  'finir': {
    présent:       ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'],
    'passé composé':['ai fini', 'as fini', 'a fini', 'avons fini', 'avez fini', 'ont fini'],
    imparfait:     ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient'],
    'futur simple':['finirai', 'finiras', 'finira', 'finirons', 'finirez', 'finiront'],
    conditionnel:  ['finirais', 'finirais', 'finirait', 'finirions', 'finiriez', 'finiraient'],
    subjonctif:    ['finisse', 'finisses', 'finisse', 'finissions', 'finissiez', 'finissent'],
  },
  'choisir': {
    présent:       ['choisis', 'choisis', 'choisit', 'choisissons', 'choisissez', 'choisissent'],
    'passé composé':['ai choisi', 'as choisi', 'a choisi', 'avons choisi', 'avez choisi', 'ont choisi'],
    imparfait:     ['choisissais', 'choisissais', 'choisissait', 'choisissions', 'choisissiez', 'choisissaient'],
    'futur simple':['choisirai', 'choisiras', 'choisira', 'choisirons', 'choisirez', 'choisiront'],
    conditionnel:  ['choisirais', 'choisirais', 'choisirait', 'choisirions', 'choisiriez', 'choisiraient'],
    subjonctif:    ['choisisse', 'choisisses', 'choisisse', 'choisissions', 'choisissiez', 'choisissent'],
  },
  'parler': {
    présent:       ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
    'passé composé':['ai parlé', 'as parlé', 'a parlé', 'avons parlé', 'avez parlé', 'ont parlé'],
    imparfait:     ['parlais', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient'],
    'futur simple':['parlerai', 'parleras', 'parlera', 'parlerons', 'parlerez', 'parleront'],
    conditionnel:  ['parlerais', 'parlerais', 'parlerait', 'parlerions', 'parleriez', 'parleraient'],
    subjonctif:    ['parle', 'parles', 'parle', 'parlions', 'parliez', 'parlent'],
  },
  'aimer': {
    présent:       ['aime', 'aimes', 'aime', 'aimons', 'aimez', 'aiment'],
    'passé composé':['ai aimé', 'as aimé', 'a aimé', 'avons aimé', 'avez aimé', 'ont aimé'],
    imparfait:     ['aimais', 'aimais', 'aimait', 'aimions', 'aimiez', 'aimaient'],
    'futur simple':['aimerai', 'aimeras', 'aimera', 'aimerons', 'aimerez', 'aimeront'],
    conditionnel:  ['aimerais', 'aimerais', 'aimerait', 'aimerions', 'aimeriez', 'aimeraient'],
    subjonctif:    ['aime', 'aimes', 'aime', 'aimions', 'aimiez', 'aiment'],
  },
  'manger': {
    présent:       ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
    'passé composé':['ai mangé', 'as mangé', 'a mangé', 'avons mangé', 'avez mangé', 'ont mangé'],
    imparfait:     ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient'],
    'futur simple':['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront'],
    conditionnel:  ['mangerais', 'mangerais', 'mangerait', 'mangerions', 'mangeriez', 'mangeraient'],
    subjonctif:    ['mange', 'manges', 'mange', 'mangions', 'mangiez', 'mangent'],
  },
  'commencer': {
    présent:       ['commence', 'commences', 'commence', 'commençons', 'commencez', 'commencent'],
    'passé composé':['ai commencé', 'as commencé', 'a commencé', 'avons commencé', 'avez commencé', 'ont commencé'],
    imparfait:     ['commençais', 'commençais', 'commençait', 'commencions', 'commenciez', 'commençaient'],
    'futur simple':['commencerai', 'commenceras', 'commencera', 'commencerons', 'commencerez', 'commenceront'],
    conditionnel:  ['commencerais', 'commencerais', 'commencerait', 'commencerions', 'commenceriez', 'commenceraient'],
    subjonctif:    ['commence', 'commences', 'commence', 'commencions', 'commenciez', 'commencent'],
  },
};

const PERSONS = ["Je / J'", 'Tu', 'Il / Elle', 'Nous', 'Vous', 'Ils / Elles'];
const PERSONS_SUBJ = ["que je / j'", 'que tu', "qu'il / elle", 'que nous', 'que vous', "qu'ils / elles"];

// Conjugaison régulière -er (ex: travailler, étudier, donner…)
const conjugateRegularER = (verb: string, tense: Tenses): string[] => {
  const root = verb.replace(/er$/i, '');
  const tables: Record<Tenses, string[]> = {
    'présent':       [`${root}e`, `${root}es`, `${root}e`, `${root}ons`, `${root}ez`, `${root}ent`],
    'passé composé': [`ai ${root}é`, `as ${root}é`, `a ${root}é`, `avons ${root}é`, `avez ${root}é`, `ont ${root}é`],
    'imparfait':     [`${root}ais`, `${root}ais`, `${root}ait`, `${root}ions`, `${root}iez`, `${root}aient`],
    'futur simple':  [`${root}erai`, `${root}eras`, `${root}era`, `${root}erons`, `${root}erez`, `${root}eront`],
    'conditionnel':  [`${root}erais`, `${root}erais`, `${root}erait`, `${root}erions`, `${root}eriez`, `${root}eraient`],
    'subjonctif':    [`${root}e`, `${root}es`, `${root}e`, `${root}ions`, `${root}iez`, `${root}ent`],
  };
  return tables[tense] || tables['présent'];
};

// Conjugaison régulière -ir groupe 2 (ex: grandir, rougir…)
const conjugateRegularIR2 = (verb: string, tense: Tenses): string[] => {
  const root = verb.replace(/ir$/i, '');
  const tables: Record<Tenses, string[]> = {
    'présent':       [`${root}is`, `${root}is`, `${root}it`, `${root}issons`, `${root}issez`, `${root}issent`],
    'passé composé': [`ai ${root}i`, `as ${root}i`, `a ${root}i`, `avons ${root}i`, `avez ${root}i`, `ont ${root}i`],
    'imparfait':     [`${root}issais`, `${root}issais`, `${root}issait`, `${root}issions`, `${root}issiez`, `${root}issaient`],
    'futur simple':  [`${root}irai`, `${root}iras`, `${root}ira`, `${root}irons`, `${root}irez`, `${root}iront`],
    'conditionnel':  [`${root}irais`, `${root}irais`, `${root}irait`, `${root}irions`, `${root}iriez`, `${root}iraient`],
    'subjonctif':    [`${root}isse`, `${root}isses`, `${root}isse`, `${root}issions`, `${root}issiez`, `${root}issent`],
  };
  return tables[tense] || tables['présent'];
};

const conjugateVerb = (verb: string, tense: string): Record<string, string> => {
  const key = verb.toLowerCase().trim();
  const t = tense as Tenses;
  const persons = tense === 'subjonctif' ? PERSONS_SUBJ : PERSONS;

  let forms: string[];

  if (VERB_TABLES[key]) {
    // Verbe dans la table complète
    forms = VERB_TABLES[key][t] || VERB_TABLES[key]['présent'];
  } else if (key.endsWith('er')) {
    // Verbe régulier du 1er groupe
    forms = conjugateRegularER(key, t);
  } else if (key.endsWith('ir')) {
    // Verbe du 2e groupe (régulier -issons)
    forms = conjugateRegularIR2(key, t);
  } else {
    // Verbe inconnu — affiche un message d'aide
    forms = persons.map(() => `(${key} — verbe non répertorié)`);
  }

  return Object.fromEntries(persons.map((p, i) => [p, forms[i] ?? '']));
};

import { getTextTypesForLevel } from '@/lib/levelUtils';

const LANGUAGES = ['Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Arabe', 'Chinois', 'Japonais', 'Russe'];
const TENSES = ['présent', 'passé composé', 'imparfait', 'futur simple', 'conditionnel', 'subjonctif'];

const LinguistiquePage: React.FC = () => {
  const { addActivity, level } = useApp();
  const textTypes = getTextTypesForLevel(level);

  // Dictionnaire
  const [searchWord, setSearchWord] = useState('');
  const [dictResult, setDictResult] = useState<typeof DICTIONARY['liberté'] | null>(null);
  const [dictError, setDictError] = useState('');

  // Conjugueur
  const [verb, setVerb] = useState('');
  const [tense, setTense] = useState('présent');
  const [conjugation, setConjugation] = useState<Record<string, string> | null>(null);

  // Correcteur
  const [textToCorrect, setTextToCorrect] = useState('');
  const [corrections, setCorrections] = useState<{ original: string; corrected: string; errors: { word: string; suggestion: string; type: string }[] } | null>(null);

  // Plan dissertation — sujet saisi manuellement, plan statique affiché
  const [dissSubject, setDissSubject] = useState('');
  const [dissSubjectMat, setDissSubjectMat] = useState('Philosophie');
  const [showDissGuide, setShowDissGuide] = useState(false);

  // Aide rédaction — sujet + type, conseils statiques
  const [redacSubject, setRedacSubject] = useState('');
  const [redacType, setRedacType] = useState('Dissertation');
  const [showRedacGuide, setShowRedacGuide] = useState(false);

  // Traducteur
  const [textToTranslate, setTextToTranslate] = useState('');
  const [sourceLang, setSourceLang] = useState('Français');
  const [targetLang, setTargetLang] = useState('Anglais');
  const [translation, setTranslation] = useState('');

  // État de chargement correcteur uniquement (les autres sont supprimés)
  const [loadingCorrector, setLoadingCorrector] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const searchDict = () => {
    const key = searchWord.toLowerCase().trim();
    if (!key) return;
    // Recherche exacte d'abord
    if (DICTIONARY[key]) {
      setDictResult(DICTIONARY[key]);
      setDictError('');
      addActivity(`Dictionnaire : recherche de "${searchWord}"`);
      return;
    }
    // Recherche partielle : mot contient la saisie
    const partialKeys = Object.keys(DICTIONARY).filter(w => w.includes(key));
    if (partialKeys.length > 0) {
      setDictResult(DICTIONARY[partialKeys[0]]);
      setDictError('');
      addActivity(`Dictionnaire : recherche de "${searchWord}" → "${partialKeys[0]}"`);
      return;
    }
    // Aucun résultat : suggestions par première lettre ou mots populaires
    setDictResult(null);
    const suggestions = Object.keys(DICTIONARY)
      .filter(w => w.startsWith(key[0] ?? ''))
      .slice(0, 5);
    const fallback = ['bonjour', 'école', 'science', 'liberté', 'conscience'];
    setDictError(
      `Aucune définition trouvée pour "${searchWord}". Essayez : ${(suggestions.length ? suggestions : fallback).join(', ')} — ou consultez les ${Object.keys(DICTIONARY).length} mots disponibles.`
    );
  };

  const runConjugation = () => {
    if (!verb.trim()) return;
    setConjugation(conjugateVerb(verb, tense));
    addActivity(`Conjugaison : ${verb} au ${tense}`);
  };

  const runCorrector = async () => {
    if (!textToCorrect.trim()) return;
    setLoadingCorrector(true);
    await new Promise(r => setTimeout(r, 600));

    // ── Règles de correction réelles ───────────────────────────────────────
    const RULES: { pattern: RegExp; suggestion: string; type: string }[] = [
      // Orthographe courante
      { pattern: /\bpeut etre\b/gi,              suggestion: 'peut-être',                       type: 'Orthographe' },
      { pattern: /\bau jour d'hui\b/gi,          suggestion: 'aujourd\'hui',                    type: 'Orthographe' },
      { pattern: /\bc'est a dire\b/gi,           suggestion: 'c\'est-à-dire',                   type: 'Orthographe' },
      { pattern: /\bvis a vis\b/gi,              suggestion: 'vis-à-vis',                       type: 'Orthographe' },
      { pattern: /\bca\b/gi,                     suggestion: 'ça',                              type: 'Orthographe' },
      { pattern: /\bcest\b/gi,                   suggestion: 'c\'est',                          type: 'Orthographe' },
      { pattern: /\bjai\b/gi,                    suggestion: 'j\'ai',                           type: 'Orthographe' },
      { pattern: /\bsest\b/gi,                   suggestion: 's\'est',                          type: 'Orthographe' },
      { pattern: /\bquelqu'un\b/gi,              suggestion: 'quelqu\'un',                      type: 'Orthographe' },
      { pattern: /\bd'accord\b/gi,               suggestion: 'd\'accord',                       type: 'Orthographe' },
      { pattern: /\ben train de\b/gi,            suggestion: 'en train de',                     type: 'Orthographe' },
      { pattern: /\btout a coup\b/gi,            suggestion: 'tout à coup',                     type: 'Orthographe' },
      { pattern: /\btout de suite\b/gi,          suggestion: 'tout de suite',                   type: 'Orthographe' },
      { pattern: /\bpar ce que\b/gi,             suggestion: 'parce que',                       type: 'Orthographe' },
      { pattern: /\blong temps\b/gi,             suggestion: 'longtemps',                       type: 'Orthographe' },
      { pattern: /\bmalgrés\b/gi,                suggestion: 'malgré',                          type: 'Orthographe' },
      { pattern: /\bparmis\b/gi,                 suggestion: 'parmi',                           type: 'Orthographe' },
      { pattern: /\baprès que\b/gi,              suggestion: 'après que (+ indicatif)',         type: 'Grammaire' },
      { pattern: /\bquoi que\b(?! ce soit)/gi,   suggestion: 'quoique (conjonction) ou quoi que (pronom relatif)', type: 'Orthographe' },
      // Homophones
      { pattern: /\bsa va\b/gi,                  suggestion: 'ça va',                           type: 'Homophone' },
      { pattern: /\bon a\b(?! pas)/gi,            suggestion: 'on a (verbe avoir) — ou on-a (avec trait d\'union pour test)', type: 'Homophone' },
      { pattern: /\bson[t]? (voiture|maison|livre|travail)\b/gi, suggestion: 'son (déterminant possessif)',      type: 'Homophone' },
      // Accentuation
      { pattern: /\betre\b/gi,                   suggestion: 'être',                            type: 'Accentuation' },
      { pattern: /\ba cause\b/gi,                suggestion: 'à cause',                         type: 'Accentuation' },
      { pattern: /\bgrâce a\b/gi,                suggestion: 'grâce à',                         type: 'Accentuation' },
      { pattern: /\bsuite a\b/gi,                suggestion: 'suite à',                         type: 'Accentuation' },
      { pattern: /\bla meme\b/gi,                suggestion: 'la même',                         type: 'Accentuation' },
      { pattern: /\bou\b(?=.*\bou\b)/gi,         suggestion: 'où (lieu/temps) ou ou (conjonction) ?', type: 'Accentuation' },
      // Ponctuation
      { pattern: /[,;]\S/g,                      suggestion: 'espace après ponctuation',        type: 'Ponctuation' },
      { pattern: /  +/g,                         suggestion: 'espace simple',                   type: 'Espacement' },
      // Majuscules
      { pattern: /\bi\b/g,                       suggestion: 'Je / j\'',                        type: 'Majuscule' },
      // Style / registre soutenu
      { pattern: /\bpar contre\b/gi,             suggestion: 'en revanche / cependant',         type: 'Style' },
      { pattern: /\bun peu\b/gi,                 suggestion: 'légèrement / quelque peu',        type: 'Style' },
      { pattern: /\bbeaucoup de\b/gi,            suggestion: 'de nombreux / une multitude de',  type: 'Style' },
      { pattern: /\btrop de\b/gi,                suggestion: 'un excès de / une profusion de',  type: 'Style' },
      { pattern: /\bbien sûr\b/gi,               suggestion: 'naturellement / assurément',      type: 'Style' },
      { pattern: /\bfaire voir\b/gi,             suggestion: 'montrer / démontrer / illustrer', type: 'Style' },
      { pattern: /\bmettre en place\b/gi,        suggestion: 'instaurer / établir / créer',     type: 'Style' },
      { pattern: /\bmontrer que\b/gi,            suggestion: 'démontrer que / établir que',     type: 'Style' },
      // Répétitions
      { pattern: /\b([a-zéèêàùûîôä]{1,}) \1\b/gi, suggestion: '(mot dupliqué — vérifier)',    type: 'Répétition' },
      // ── SMS / abréviations / verlan / argot ──────────────────────────────
      // Abréviations SMS ultra-courantes
      { pattern: /\bc\b/gi,                        suggestion: 'c\'est',                          type: 'SMS' },
      { pattern: /\bt\b(?=\s+[a-zéèêàùû])/gi,      suggestion: 'tu / t\'es',                     type: 'SMS' },
      { pattern: /\bpk\b/gi,                        suggestion: 'pourquoi',                        type: 'SMS' },
      { pattern: /\bpke\b/gi,                       suggestion: 'parce que',                       type: 'SMS' },
      { pattern: /\bpcq\b/gi,                       suggestion: 'parce que',                       type: 'SMS' },
      { pattern: /\bpck\b/gi,                       suggestion: 'parce que',                       type: 'SMS' },
      { pattern: /\bstp\b/gi,                       suggestion: 's\'il te plaît',                  type: 'SMS' },
      { pattern: /\bsvp\b/gi,                       suggestion: 's\'il vous plaît',                type: 'SMS' },
      { pattern: /\bjsp\b/gi,                       suggestion: 'je ne sais pas',                  type: 'SMS' },
      { pattern: /\bjpp\b/gi,                       suggestion: 'je n\'en peux plus',              type: 'SMS' },
      { pattern: /\bjvais\b/gi,                     suggestion: 'je vais',                         type: 'SMS' },
      { pattern: /\bjsuis\b/gi,                     suggestion: 'je suis',                         type: 'SMS' },
      { pattern: /\bkelk\b/gi,                      suggestion: 'quelque',                         type: 'SMS' },
      { pattern: /\bkoi\b/gi,                       suggestion: 'quoi',                            type: 'SMS' },
      { pattern: /\bkand\b/gi,                      suggestion: 'quand',                           type: 'SMS' },
      { pattern: /\bkoi\b/gi,                       suggestion: 'quoi',                            type: 'SMS' },
      { pattern: /\bvla\b/gi,                       suggestion: 'voilà',                           type: 'SMS' },
      { pattern: /\bvlà\b/gi,                       suggestion: 'voilà',                           type: 'SMS' },
      { pattern: /\bqd\b/gi,                        suggestion: 'quand',                           type: 'SMS' },
      { pattern: /\bms\b/gi,                        suggestion: 'mais',                            type: 'SMS' },
      { pattern: /\bjte\b/gi,                       suggestion: 'je te',                           type: 'SMS' },
      { pattern: /\bjtm\b/gi,                       suggestion: 'je t\'aime',                      type: 'SMS' },
      { pattern: /\bdac\b/gi,                       suggestion: 'd\'accord',                       type: 'SMS' },
      { pattern: /\boué\b/gi,                       suggestion: 'oui',                             type: 'SMS' },
      { pattern: /\bwé\b/gi,                        suggestion: 'oui',                             type: 'SMS' },
      { pattern: /\btjr\b/gi,                       suggestion: 'toujours',                        type: 'SMS' },
      { pattern: /\btjrs\b/gi,                      suggestion: 'toujours',                        type: 'SMS' },
      { pattern: /\bauj\b/gi,                       suggestion: 'aujourd\'hui',                    type: 'SMS' },
      // Registre familier / argot courant
      { pattern: /\bpote\b/gi,                      suggestion: 'ami / camarade',                  type: 'Registre familier' },
      { pattern: /\bpotes\b/gi,                     suggestion: 'amis / camarades',                type: 'Registre familier' },
      { pattern: /\bmec\b/gi,                       suggestion: 'garçon / individu / personne',    type: 'Registre familier' },
      { pattern: /\bnana\b/gi,                      suggestion: 'fille / femme',                   type: 'Registre familier' },
      { pattern: /\bkiffer\b/gi,                    suggestion: 'apprécier / aimer',               type: 'Registre familier' },
      { pattern: /\bkiffe\b/gi,                     suggestion: 'apprécie / aime',                 type: 'Registre familier' },
      { pattern: /\brelou\b/gi,                     suggestion: 'pénible / ennuyeux',              type: 'Registre familier' },
      { pattern: /\bcheulou\b/gi,                   suggestion: 'louche / suspect',                type: 'Registre familier' },
      { pattern: /\bgrave\b(?= (bien|sympa|cool|chiant))/gi, suggestion: 'vraiment / très',       type: 'Registre familier' },
      { pattern: /\bcool\b/gi,                      suggestion: 'agréable / sympathique / bien',   type: 'Registre familier' },
      { pattern: /\btruc\b/gi,                      suggestion: 'chose / élément / objet',         type: 'Registre familier' },
      { pattern: /\bmachin\b/gi,                    suggestion: 'chose / élément',                 type: 'Registre familier' },
      { pattern: /\bbouffer\b/gi,                   suggestion: 'manger',                          type: 'Registre familier' },
      { pattern: /\bflic\b/gi,                      suggestion: 'policier',                        type: 'Registre familier' },
      { pattern: /\bboulot\b/gi,                    suggestion: 'travail',                         type: 'Registre familier' },
      { pattern: /\bfric\b/gi,                      suggestion: 'argent',                          type: 'Registre familier' },
      { pattern: /\bgosses\b/gi,                    suggestion: 'enfants',                         type: 'Registre familier' },
    ];

    const errors: { word: string; suggestion: string; type: string }[] = [];
    let corrected = textToCorrect;

    for (const rule of RULES) {
      const matches = corrected.match(rule.pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches)];
        for (const m of uniqueMatches) {
          if (!errors.find(e => e.word === m)) {
            errors.push({ word: m, suggestion: rule.suggestion, type: rule.type });
          }
        }
      }
      // Applique les corrections simples (non-stylistiques)
      if (!['Style'].includes(rule.type)) {
        corrected = corrected.replace(rule.pattern, (match) => {
          if (rule.type === 'Majuscule') return match.toUpperCase();
          if (rule.type === 'Espacement') return ' ';
          return rule.suggestion.split(' / ')[0];
        });
      }
    }
    corrected = corrected.trim();

    setCorrections({ original: textToCorrect, corrected, errors });
    setLoadingCorrector(false);
    addActivity('Texte vérifié par le correcteur');
  };

  const generateDissGuide = () => {
    if (!dissSubject.trim()) return;
    setShowDissGuide(true);
    addActivity(`Guide dissertation : "${dissSubject}"`);
  };

  const generateRedacGuide = () => {
    if (!redacSubject.trim()) return;
    setShowRedacGuide(true);
    addActivity(`Guide rédaction : ${redacType}`);
  };

  const [translationError, setTranslationError] = useState('');

  // Correspondance nom de langue → code BCP-47
  const LANG_CODES: Record<string, string> = {
    'Français': 'fr', 'Anglais': 'en', 'Espagnol': 'es', 'Allemand': 'de',
    'Italien': 'it', 'Portugais': 'pt', 'Arabe': 'ar', 'Chinois': 'zh',
    'Japonais': 'ja', 'Russe': 'ru',
  };

  const translateText = async () => {
    if (!textToTranslate.trim()) return;
    setLoadingTranslation(true);
    setTranslation('');
    setTranslationError('');
    try {
      const targetCode = LANG_CODES[targetLang] ?? targetLang.toLowerCase().slice(0, 2);
      const sourceCode = LANG_CODES[sourceLang];
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-text-translation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({ q: textToTranslate.trim(), target: targetCode, source: sourceCode }),
        }
      );
      if (res.status === 429) throw new Error('Quota dépassé — réessayez dans un moment.');
      if (res.status === 402) throw new Error('Solde insuffisant — contactez l\'administrateur.');
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const json = await res.json();
      const translated: string = json?.data?.translations?.[0]?.translatedText;
      if (!translated) throw new Error('Réponse inattendue du service de traduction.');
      setTranslation(translated);
      addActivity(`Traduction ${sourceLang} → ${targetLang}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de traduction inattendue.';
      setTranslationError(msg);
    } finally {
      setLoadingTranslation(false);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
    <h1 className="sr-only">Outils linguistiques — Conjugueur & Correcteur</h1>
      <SEO
        title="Outils Linguistiques Gratuits — Conjugueur, Correcteur & Traducteur | Apprenix"
        description="Conjugueur français complet, correcteur orthographique, traducteur multilingue et aide à la rédaction. 100% gratuit, sans publicité, pour tous les élèves."
        canonical="/linguistique"
        keywords="conjugueur français gratuit, correcteur orthographe en ligne, dictionnaire français, aide dissertation gratuite, plan rédaction, traducteur gratuit multilingue, grammaire lycée, synonymes, conjugaison, outils français collège lycée fac"
        dateModified="2026-06-20"
      />
      {/* ── Hero ── */}
      <PageHero
        variant="community"
        icon={Languages}
        badge={<>🌍 Outils Linguistiques</>}
        badgeClassName="bg-chart-4/10 text-chart-4 border-chart-4/25"
        title="Outils Linguistiques"
        subtitle="Dictionnaire, conjugueur, correcteur orthographique, plan de dissertation, aide à la rédaction et traducteur intelligent — tout pour maîtriser la langue française."
        stats={[
          { value: '6', label: 'Outils intégrés' },
          { value: 'FR · EN', label: 'Français & Anglais' },
          { value: 'Humain', label: 'Contenu vérifié' },
        ]}
      >
        <ENBadge />
      </PageHero>

      <Tabs defaultValue="dictionnaire">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto whitespace-nowrap">
            <TabsTrigger value="dictionnaire" className="text-xs"><Search className="w-3.5 h-3.5 mr-1" /> Dictionnaire</TabsTrigger>
            <TabsTrigger value="conjugueur" className="text-xs"><BookOpen className="w-3.5 h-3.5 mr-1" /> Conjugueur</TabsTrigger>
            <TabsTrigger value="correcteur" className="text-xs"><CheckSquare className="w-3.5 h-3.5 mr-1" /> Correcteur</TabsTrigger>
            <TabsTrigger value="dissertation" className="text-xs"><Pen className="w-3.5 h-3.5 mr-1" /> Dissertation</TabsTrigger>
            <TabsTrigger value="redaction" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1" /> Rédaction</TabsTrigger>
            <TabsTrigger value="traducteur" className="text-xs"><ArrowLeftRight className="w-3.5 h-3.5 mr-1" /> Traducteur</TabsTrigger>
          </TabsList>
        </div>

        {/* Dictionnaire */}
        <TabsContent value="dictionnaire" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Dictionnaire Français
                <Badge variant="secondary" className="text-xs ml-auto">{Object.keys(DICTIONARY).length} mots</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={searchWord} onChange={e => setSearchWord(e.target.value)} placeholder="Chercher un mot... ex: conscience, métaphore, évolution" className="h-10" onKeyDown={e => e.key === 'Enter' && searchDict()} />
                <Button onClick={searchDict} className="h-9 bg-primary text-primary-foreground shrink-0">Chercher</Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                {Object.keys(DICTIONARY).length} mots disponibles — essayez : bonjour, science, école, liberté, conscience, métaphore…
              </p>
              {dictError && <p className="text-sm text-destructive">{dictError}</p>}
              {dictResult && (
                <div className="space-y-3 p-4 bg-secondary rounded-lg">
                  <div><Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Définition</Label><p className="text-sm text-foreground mt-1 text-pretty">{dictResult.def}</p></div>
                  <div><Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Synonymes</Label><div className="flex flex-wrap gap-1.5 mt-1">{dictResult.synonyms.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
                  <div><Label className="text-sm text-muted-foreground leading-relaxed text-pretty">Exemples</Label><ul className="mt-1 space-y-1">{dictResult.examples.map((e, i) => <li key={i} className="text-sm text-foreground italic">• {e}</li>)}</ul></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conjugueur */}
        <TabsContent value="conjugueur" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Conjugueur</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><Label htmlFor="conj-verb" className="text-sm text-muted-foreground mb-1 block">Verbe</Label><Input id="conj-verb" value={verb} onChange={e => setVerb(e.target.value)} placeholder="Ex : parler, être, avoir" className="h-10" /></div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">Temps</Label>
                  <Select value={tense} onValueChange={setTense}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{TENSES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-end"><Button onClick={runConjugation} disabled={!verb.trim()} className="w-full h-9 bg-primary text-primary-foreground">Conjuguer</Button></div>
              </div>
              {conjugation && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-base text-muted-foreground mb-3">Conjugaison de <strong className="text-foreground">{verb}</strong> au <strong className="text-primary">{tense}</strong></p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(conjugation).map(([pronoun, form]) => (
                      <div key={pronoun} className="flex flex-col">
                        <span className="text-sm text-muted-foreground leading-relaxed text-pretty">{pronoun}</span>
                        <span className="text-sm font-medium text-foreground">{form}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correcteur */}
        <TabsContent value="correcteur" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Correcteur orthographique</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={textToCorrect} onChange={e => setTextToCorrect(e.target.value)} placeholder="Collez votre texte ici pour le faire corriger..." className="min-h-32 text-sm resize-none px-3" />
              <Button onClick={runCorrector} disabled={!textToCorrect.trim() || loadingCorrector} className="w-full h-9 bg-primary text-primary-foreground">
                {loadingCorrector ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Correction...</> : <><CheckSquare className="w-4 h-4 mr-2" /> Corriger</>}
              </Button>
              {corrections && (
                <div className="space-y-3">
                  {/* Résultat : texte corrigé ou badge "aucune erreur" */}
                  {corrections.errors.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                      <CheckSquare className="w-4 h-4 text-success shrink-0" />
                      <p className="text-sm text-success font-medium">
                        Aucune erreur détectée — ton texte est correct selon les règles disponibles.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-accent/50 rounded-lg border border-accent">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Texte corrigé</p>
                        <p className="text-sm text-foreground">{corrections.corrected}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">{corrections.errors.length} correction{corrections.errors.length > 1 ? 's' : ''} suggérée{corrections.errors.length > 1 ? 's' : ''} :</p>
                        {corrections.errors.map((e, i) => {
                          const badgeClass =
                            e.type === 'SMS'               ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-400/30' :
                            e.type === 'Registre familier' ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-400/30' :
                            e.type === 'Style'             ? 'bg-chart-1/15 text-chart-1 border-chart-1/30' :
                            e.type === 'Grammaire'         ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                                             'bg-destructive/10 text-destructive border-destructive/20';
                          return (
                            <div key={i} className="flex items-start gap-2 p-2 bg-secondary rounded-md mb-1.5">
                              <Badge className={`text-xs shrink-0 mt-0.5 ${badgeClass}`}>{e.type}</Badge>
                              <span className="text-xs min-w-0"><span className="line-through text-muted-foreground">{e.word}</span> → <span className="text-success font-medium">{e.suggestion}</span></span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground/70 italic">
                    Le correcteur vérifie les règles grammaticales courantes, homophones, accents, abréviations SMS et registre familier/argot. Pour une correction approfondie, utilise l'onglet Rédaction.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan dissertation — méthodo statique */}
        <TabsContent value="dissertation" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Pen className="w-4 h-4 text-primary" /> Méthode dissertation — Plan type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="diss-subject" className="text-sm text-muted-foreground mb-1 block">Ton sujet (pour t'aider à réfléchir)</Label>
                  <Input id="diss-subject" value={dissSubject} onChange={e => { setDissSubject(e.target.value); setShowDissGuide(false); }} placeholder="Ex : La liberté est-elle une illusion ?" className="h-10" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">Matière</Label>
                  <Select value={dissSubjectMat} onValueChange={setDissSubjectMat}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Philosophie', 'Français', 'Histoire', 'Économie/SES'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generateDissGuide} disabled={!dissSubject.trim()} className="w-full h-9 bg-primary text-primary-foreground">
                <Lightbulb className="w-4 h-4 mr-2" /> Afficher la méthode
              </Button>
              {showDissGuide && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground text-pretty">
                      Structure standard de dissertation — à adapter selon les consignes de ton professeur. Contenu rédigé par des enseignants, zéro génération automatique.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg border-l-4 border-l-primary space-y-2">
                    {[
                      { titre: 'Introduction', points: ['Accroche (citation, fait d\'actualité, paradoxe)', 'Définition des termes clés du sujet', 'Problématique précise', 'Annonce du plan en 2 ou 3 parties'] },
                      { titre: 'Partie I — Thèse', points: ['Argument principal + exemple concret', 'Argument secondaire + illustration', 'Transition vers la partie II'] },
                      { titre: 'Partie II — Antithèse', points: ['Contre-argument + exemple', 'Nuance ou limite de la thèse', 'Transition vers la partie III (si plan en 3 parties)'] },
                      { titre: 'Partie III — Synthèse (si applicable)', points: ['Dépassement des deux positions', 'Point de vue nuancé et personnel', 'Ouverture vers une question plus large'] },
                      { titre: 'Conclusion', points: ['Bilan des parties', 'Réponse directe à la problématique', 'Ouverture (question connexe ou enjeu contemporain)'] },
                    ].map(({ titre, points }) => (
                      <div key={titre}>
                        <p className="font-semibold text-sm text-foreground mb-1">{titre}</p>
                        {points.map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Pour une aide personnalisée sur ton sujet « {dissSubject} », consulte ton enseignant de {dissSubjectMat}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aide rédaction — méthodo statique */}
        <TabsContent value="redaction" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Aide à la rédaction — Méthode par type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="redac-subject" className="text-sm text-muted-foreground mb-1 block">Sujet ou thème</Label>
                  <Input id="redac-subject" value={redacSubject} onChange={e => { setRedacSubject(e.target.value); setShowRedacGuide(false); }} placeholder="Votre sujet" className="h-10" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">Type de texte</Label>
                  <Select value={redacType} onValueChange={v => { setRedacType(v); setShowRedacGuide(false); }}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{textTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generateRedacGuide} disabled={!redacSubject.trim()} className="w-full h-9 bg-primary text-primary-foreground">
                <Lightbulb className="w-4 h-4 mr-2" /> Voir les conseils de méthode
              </Button>
              {showRedacGuide && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground text-pretty">
                      Conseils de méthode pour <strong>{redacType}</strong> — rédigés par des enseignants, conformes aux programmes Éduscol.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg border-l-4 border-l-chart-2 space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">Structure recommandée</p>
                      {redacType === 'Dissertation' && ['Introduction (10 %)', 'Développement en 2 ou 3 parties équilibrées (80 %)', 'Conclusion (10 %)'].map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                      {redacType === 'Commentaire de texte' && ['Introduction : auteur, œuvre, thèse, plan', 'Axe I : premier aspect du texte', 'Axe II : deuxième aspect du texte', 'Conclusion : bilan + ouverture'].map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                      {!['Dissertation', 'Commentaire de texte'].includes(redacType) && ['Introduction avec accroche et présentation', 'Développement structuré (arguments + exemples)', 'Conclusion avec bilan et ouverture'].map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">Connecteurs logiques utiles</p>
                      {['Tout d\'abord, ensuite, enfin', 'En effet, par conséquent, ainsi', 'Cependant, néanmoins, toutefois', 'En conclusion, pour conclure, en somme'].map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">Erreurs fréquentes à éviter</p>
                      {['Ne pas répondre directement à la question', 'Manquer d\'exemples concrets', 'Répéter les mêmes mots (utiliser des synonymes)', 'Oublier la transition entre les parties'].map(p => <p key={p} className="text-sm text-muted-foreground ml-3">• {p}</p>)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Pour une aide personnalisée sur « {redacSubject} », pose ta question à un enseignant via la section Aide aux devoirs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traducteur */}
        <TabsContent value="traducteur" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" /> Traducteur — 10 langues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <Label className="text-sm text-muted-foreground mb-1 block">Langue source</Label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Français', ...LANGUAGES].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="min-w-0">
                  <Label className="text-sm text-muted-foreground mb-1 block">Langue cible</Label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                value={textToTranslate}
                onChange={e => { setTextToTranslate(e.target.value); setTranslation(''); setTranslationError(''); }}
                placeholder="Entrez le texte à traduire..."
                className="min-h-24 text-sm resize-none px-3"
              />
              <Button
                onClick={translateText}
                disabled={!textToTranslate.trim() || loadingTranslation}
                className="w-full h-9 bg-primary text-primary-foreground"
              >
                {loadingTranslation
                  ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Traduction en cours...</>
                  : <><ArrowLeftRight className="w-4 h-4 mr-2" /> Traduire</>}
              </Button>
              {translationError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25">
                  <p className="text-sm text-destructive font-medium">{translationError}</p>
                </div>
              )}
              {translation && !translationError && (
                <div className="p-4 bg-secondary rounded-lg border-l-4 border-l-chart-3">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">{sourceLang} → {targetLang}</p>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{translation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinguistiquePage;
