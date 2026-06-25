import {
  AlertCircle, BarChart3, BookOpen,
  Calculator, CheckCircle, ChevronLeft,
  ChevronRight, Clock, CreditCard, Download,
  Eye, FlaskConical, Globe2, GraduationCap,
  Languages, Layers, Pencil, Plus,
  RotateCcw, ScrollText, Trash2,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ENBadge from '@/components/ui/ENBadge';
import ExportButton from '@/components/ui/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { getSubjectsForLevel } from '@/lib/levelUtils';
import type { Subject } from '@/types/types';

type View = 'list' | 'study' | 'manage';

// ─── Bibliothèque de packs de révision (programme français officiel) ───────────
interface FlashPack { name: string; subject: Subject; level: string; cards: { q: string; a: string }[] }

const FLASH_PACKS: FlashPack[] = [
  {
    name: 'Maths — Dérivées & Intégrales', subject: 'Maths' as Subject, level: 'Terminale',
    cards: [
      { q: "Dérivée de f(x) = xⁿ ?", a: "f'(x) = n·xⁿ⁻¹" },
      { q: "Dérivée de f(x) = eˣ ?", a: "f'(x) = eˣ" },
      { q: "Dérivée de f(x) = ln(x) ?", a: "f'(x) = 1/x" },
      { q: "Dérivée de f(x) = sin(x) ?", a: "f'(x) = cos(x)" },
      { q: "Dérivée de f(x) = cos(x) ?", a: "f'(x) = −sin(x)" },
      { q: "Primitive de f(x) = xⁿ (n ≠ −1) ?", a: "F(x) = xⁿ⁺¹/(n+1) + C" },
      { q: "Primitive de f(x) = eˣ ?", a: "F(x) = eˣ + C" },
      { q: "Primitive de f(x) = 1/x ?", a: "F(x) = ln|x| + C" },
      { q: "Formule de la dérivée d'un produit u·v ?", a: "(uv)' = u'v + uv'" },
      { q: "Formule de la dérivée d'un quotient u/v ?", a: "(u/v)' = (u'v − uv') / v²" },
      { q: "Théorème de Rolle : condition ?", a: "Si f est dérivable sur [a,b], f(a)=f(b), alors ∃c∈]a,b[ tel que f'(c)=0" },
      { q: "Interprétation géométrique de ∫ₐᵇ f(x)dx ?", a: "Aire algébrique entre la courbe et l'axe des abscisses entre a et b" },
    ],
  },
  {
    name: 'Maths — Probabilités & Statistiques', subject: 'Maths' as Subject, level: 'Lycée',
    cards: [
      { q: "P(A ∪ B) = ?", a: "P(A) + P(B) − P(A ∩ B)" },
      { q: "P(A ∩ B) si A et B indépendants ?", a: "P(A) × P(B)" },
      { q: "Probabilité conditionnelle P(A|B) = ?", a: "P(A ∩ B) / P(B)" },
      { q: "Espérance d'une variable aléatoire X ?", a: "E(X) = Σ xᵢ · P(X = xᵢ)" },
      { q: "Variance V(X) = ?", a: "E(X²) − [E(X)]²" },
      { q: "Loi binomiale B(n,p) : P(X=k) = ?", a: "C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ" },
      { q: "Espérance de la loi binomiale B(n,p) ?", a: "E(X) = n·p" },
      { q: "Écart-type de la loi binomiale B(n,p) ?", a: "σ = √(n·p·(1−p))" },
      { q: "Loi normale centrée réduite N(0,1) : moyenne et écart-type ?", a: "μ = 0, σ = 1" },
      { q: "Intervalle de fluctuation au seuil 95% ?", a: "[p − 1/√n ; p + 1/√n]" },
    ],
  },
  {
    name: 'Maths — Géométrie & Trigonométrie', subject: 'Maths' as Subject, level: 'Lycée',
    cards: [
      { q: "sin²(x) + cos²(x) = ?", a: "1 (identité fondamentale)" },
      { q: "tan(x) = ?", a: "sin(x) / cos(x)" },
      { q: "cos(a+b) = ?", a: "cos(a)cos(b) − sin(a)sin(b)" },
      { q: "sin(a+b) = ?", a: "sin(a)cos(b) + cos(a)sin(b)" },
      { q: "Formule d'Euler : eⁱˣ = ?", a: "cos(x) + i·sin(x)" },
      { q: "Valeur de sin(30°) = sin(π/6) ?", a: "1/2" },
      { q: "Valeur de cos(60°) = cos(π/3) ?", a: "1/2" },
      { q: "Valeur de tan(45°) = tan(π/4) ?", a: "1" },
      { q: "Théorème de Pythagore ?", a: "Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)" },
      { q: "Formule du cosinus (Al-Kashi) ?", a: "c² = a² + b² − 2ab·cos(C)" },
    ],
  },
  {
    name: 'Physique-Chimie — Mécanique', subject: 'Physique-Chimie' as Subject, level: 'Terminale',
    cards: [
      { q: "Deuxième loi de Newton ?", a: "ΣF⃗ = m·a⃗ (somme des forces = masse × accélération)" },
      { q: "Formule de l'énergie cinétique ?", a: "Ec = ½·m·v²" },
      { q: "Formule de l'énergie potentielle de pesanteur ?", a: "Ep = m·g·h" },
      { q: "Valeur de g (accélération gravitationnelle) ?", a: "g ≈ 9,81 m·s⁻² (ou 10 m·s⁻² en approximation)" },
      { q: "Formule de la vitesse d'une MRUA ?", a: "v = v₀ + a·t" },
      { q: "Formule de la position en MRUA ?", a: "x = x₀ + v₀·t + ½·a·t²" },
      { q: "Principe de conservation de l'énergie mécanique (sans frottement) ?", a: "Ec + Ep = constante" },
      { q: "Loi de la gravitation universelle (Newton) ?", a: "F = G·m₁·m₂/r² avec G = 6,67×10⁻¹¹ N·m²·kg⁻²" },
      { q: "Quantité de mouvement p = ?", a: "p = m·v⃗" },
      { q: "Travail d'une force constante W = ?", a: "W = F·d·cos(θ)" },
    ],
  },
  {
    name: 'Physique-Chimie — Électricité', subject: 'Physique-Chimie' as Subject, level: 'Lycée',
    cards: [
      { q: "Loi d'Ohm ?", a: "U = R·I (tension = résistance × intensité)" },
      { q: "Puissance électrique P = ?", a: "P = U·I = R·I² = U²/R" },
      { q: "Energie électrique E = ?", a: "E = P·t (en joules si t en secondes)" },
      { q: "Résistances en série : Req = ?", a: "Req = R1 + R2 + ... + Rn" },
      { q: "Résistances en parallèle : 1/Req = ?", a: "1/Req = 1/R1 + 1/R2 + ... + 1/Rn" },
      { q: "Loi des nœuds (Kirchhoff) ?", a: "La somme des courants entrants = somme des courants sortants" },
      { q: "Loi des mailles (Kirchhoff) ?", a: "La somme algébrique des tensions dans une maille = 0" },
      { q: "Charge d'un condensateur : Q = ?", a: "Q = C·U (charge = capacité × tension)" },
      { q: "Énergie stockée dans un condensateur ?", a: "Ec = ½·C·U²" },
    ],
  },
  {
    name: 'SVT — Génétique & ADN', subject: 'SVT' as Subject, level: 'Terminale',
    cards: [
      { q: "Qu'est-ce que l'ADN ?", a: "Acide DésoxyriboNucléique — molécule en double hélice porteuse de l'information génétique" },
      { q: "Les 4 bases azotées de l'ADN ?", a: "Adénine (A), Thymine (T), Guanine (G), Cytosine (C)" },
      { q: "Règle de complémentarité des bases ?", a: "A s'apparie avec T ; G s'apparie avec C" },
      { q: "Définition d'un gène ?", a: "Séquence d'ADN codant pour une protéine ou un ARN fonctionnel" },
      { q: "Définition d'un allèle ?", a: "Forme alternative d'un gène occupant le même locus sur des chromosomes homologues" },
      { q: "Qu'est-ce que la mitose ?", a: "Division cellulaire produisant 2 cellules filles identiques à la cellule mère (même nombre de chromosomes)" },
      { q: "Qu'est-ce que la méiose ?", a: "Division cellulaire produisant 4 gamètes haploïdes (n chromosomes), avec brassage génétique" },
      { q: "Définition du phénotype ?", a: "Ensemble des caractères observables d'un individu (morphologiques, biochimiques)" },
      { q: "Définition du génotype ?", a: "Constitution génétique d'un individu — ensemble de ses allèles" },
      { q: "Qu'est-ce qu'une mutation ?", a: "Modification permanente de la séquence d'ADN (substitution, délétion, insertion de nucléotides)" },
      { q: "Transcription de l'ADN : définition ?", a: "Synthèse d'un ARNm à partir d'un brin d'ADN matrice dans le noyau" },
      { q: "Traduction : définition ?", a: "Synthèse d'une protéine à partir d'un ARNm par les ribosomes dans le cytoplasme" },
    ],
  },
  {
    name: 'SVT — Système immunitaire', subject: 'SVT' as Subject, level: 'Terminale',
    cards: [
      { q: "Immunité innée vs adaptative ?", a: "Innée : rapide, non spécifique. Adaptative : lente, spécifique, avec mémoire immunitaire" },
      { q: "Qu'est-ce qu'un antigène ?", a: "Molécule étrangère reconnue par le système immunitaire et déclenchant une réponse immunitaire" },
      { q: "Qu'est-ce qu'un anticorps ?", a: "Protéine (immunoglobuline) produite par les plasmocytes, spécifique d'un antigène" },
      { q: "Rôle des lymphocytes T cytotoxiques ?", a: "Détruire les cellules infectées ou tumorales présentant l'antigène (immunité cellulaire)" },
      { q: "Rôle des lymphocytes B ?", a: "Se différencient en plasmocytes pour produire des anticorps (immunité humorale)" },
      { q: "Qu'est-ce que la mémoire immunitaire ?", a: "Conservation de lymphocytes mémoire après un premier contact, permettant une réponse plus rapide lors d'une réinfection" },
      { q: "Définition d'un vaccin ?", a: "Administration d'un antigène (atténué ou inactivé) pour induire une réponse immunitaire et une mémoire sans déclencher la maladie" },
      { q: "Qu'est-ce que le CMH ?", a: "Complexe Majeur d'Histocompatibilité — protéines de surface présentant les antigènes aux lymphocytes T" },
    ],
  },
  {
    name: 'Histoire — La Seconde Guerre mondiale', subject: 'Histoire-Géographie' as Subject, level: 'Lycée',
    cards: [
      { q: "Date du début de la Seconde Guerre mondiale ?", a: "1er septembre 1939 (invasion de la Pologne par l'Allemagne nazie)" },
      { q: "Date de la capitulation de la France ?", a: "22 juin 1940 (armistice de Compiègne)" },
      { q: "Qu'est-ce que le régime de Vichy ?", a: "Gouvernement collaborationniste français dirigé par le maréchal Pétain (1940-1944)" },
      { q: "Qui dirige la France libre depuis Londres ?", a: "Le général Charles de Gaulle (appel du 18 juin 1940)" },
      { q: "Qu'est-ce que la Solution finale ?", a: "Projet d'extermination systématique des Juifs d'Europe par les nazis (Shoah)" },
      { q: "Date du débarquement en Normandie ?", a: "6 juin 1944 (Opération Overlord)" },
      { q: "Date de la capitulation de l'Allemagne nazie ?", a: "8 mai 1945 (fin de la guerre en Europe)" },
      { q: "Dates des bombes atomiques sur le Japon ?", a: "6 août 1945 (Hiroshima) et 9 août 1945 (Nagasaki)" },
      { q: "Création de l'ONU : date et objectif ?", a: "1945 — maintenir la paix internationale et développer la coopération entre nations" },
      { q: "Procès de Nuremberg : objet ?", a: "Jugement des dirigeants nazis pour crimes de guerre et crimes contre l'humanité (1945-1946)" },
    ],
  },
  {
    name: 'Histoire — Révolution française', subject: 'Histoire-Géographie' as Subject, level: 'Collège',
    cards: [
      { q: "Date de la prise de la Bastille ?", a: "14 juillet 1789" },
      { q: "Que symbolise la prise de la Bastille ?", a: "Début de la Révolution française et fin de l'absolutisme royal" },
      { q: "Date de la déclaration des droits de l'homme et du citoyen ?", a: "26 août 1789" },
      { q: "Qui est Louis XVI ?", a: "Roi de France guillotiné le 21 janvier 1793 pendant la Révolution" },
      { q: "Qu'est-ce que la Terreur ?", a: "Période (1793-1794) de répression violente dirigée par Robespierre et le Comité de salut public" },
      { q: "Qui est Robespierre ?", a: "Révolutionnaire jacobin, figure principale de la Terreur, guillotiné en juillet 1794 (Thermidor)" },
      { q: "Devise de la République française ?", a: "Liberté, Égalité, Fraternité" },
      { q: "Quand Bonaparte prend le pouvoir (coup d'État) ?", a: "18-19 brumaire an VIII — 9-10 novembre 1799" },
    ],
  },
  {
    name: 'Français — Figures de style', subject: 'Français' as Subject, level: 'Lycée',
    cards: [
      { q: "Définir la métaphore ?", a: "Comparaison implicite sans outil de comparaison. Ex : 'La vie est un voyage'" },
      { q: "Définir la comparaison ?", a: "Rapprochement avec outil de comparaison (comme, tel, ainsi que). Ex : 'courageux comme un lion'" },
      { q: "Définir l'hyperbole ?", a: "Exagération pour renforcer un effet. Ex : 'Je meurs de faim'" },
      { q: "Définir l'anaphore ?", a: "Répétition d'un mot ou groupe en début de phrases successives. Ex : 'Je t'aime pour ta douceur, je t'aime pour ta force…'" },
      { q: "Définir l'antithèse ?", a: "Opposition de deux termes ou idées contraires pour créer un contraste. Ex : 'C'était un ange au visage de démon'" },
      { q: "Définir la litote ?", a: "Dire moins pour suggérer plus. Ex : 'Ce n'est pas mal' pour dire 'c'est très bien'" },
      { q: "Définir la personnification ?", a: "Attribuer des caractéristiques humaines à un être inanimé ou abstrait" },
      { q: "Définir l'oxymore ?", a: "Association de deux termes contradictoires. Ex : 'obscure clarté', 'silence éloquent'" },
      { q: "Définir l'allitération ?", a: "Répétition d'un même son consonantique dans des mots proches. Ex : 'Pour qui sont ces serpents qui sifflent sur vos têtes'" },
      { q: "Définir l'assonance ?", a: "Répétition d'un même son vocalique dans des mots proches. Ex : 'Les sanglots longs des violons'" },
      { q: "Définir l'euphémisme ?", a: "Atténuation d'une réalité difficile par une expression plus douce. Ex : 'Il nous a quittés' pour 'il est mort'" },
      { q: "Définir la synecdoque ?", a: "Désigner un tout par une partie (ou l'inverse). Ex : 'les voiles' pour 'les bateaux'" },
    ],
  },
  {
    name: 'Français — Grammaire & Syntaxe', subject: 'Français' as Subject, level: 'Collège',
    cards: [
      { q: "Les 9 classes grammaticales ?", a: "Nom, article, adjectif, pronom, verbe, adverbe, préposition, conjonction, interjection" },
      { q: "Qu'est-ce qu'un COD ?", a: "Complément d'objet direct — répond à 'qui ?' ou 'quoi ?' après un verbe transitif direct, sans préposition" },
      { q: "Qu'est-ce qu'un COI ?", a: "Complément d'objet indirect — reliéau verbe par une préposition (à, de…). Ex : 'Je parle DE toi'" },
      { q: "Différence phrase simple / phrase complexe ?", a: "Simple : une seule proposition. Complexe : plusieurs propositions (juxtaposition, coordination ou subordination)" },
      { q: "Les temps de l'indicatif (7) ?", a: "Présent, imparfait, passé simple, passé composé, futur simple, futur antérieur, plus-que-parfait, conditionnel présent" },
      { q: "Accord du participe passé avec avoir ?", a: "S'accorde avec le COD seulement si le COD est placé AVANT le verbe" },
      { q: "Accord du participe passé avec être ?", a: "S'accorde toujours avec le sujet (en genre et en nombre)" },
      { q: "Qu'est-ce qu'une proposition subordonnée relative ?", a: "Proposition introduite par un pronom relatif (qui, que, dont…) qui complète un nom antécédent" },
    ],
  },
  {
    name: 'Anglais — Vocabulaire B1', subject: 'Langues' as Subject, level: 'Lycée',
    cards: [
      { q: "to achieve ?", a: "accomplir, réussir, atteindre un objectif" },
      { q: "to overcome ?", a: "surmonter, vaincre (une difficulté)" },
      { q: "despite ?", a: "malgré, en dépit de" },
      { q: "although / even though ?", a: "bien que, même si (conjonction de concession)" },
      { q: "to rely on ?", a: "compter sur, dépendre de" },
      { q: "therefore ?", a: "donc, par conséquent (marqueur de conséquence logique)" },
      { q: "whereas ?", a: "alors que, tandis que (opposition/contraste)" },
      { q: "to deal with ?", a: "faire face à, gérer, s'occuper de" },
      { q: "throughout ?", a: "tout au long de, dans tout" },
      { q: "to raise awareness ?", a: "sensibiliser, faire prendre conscience" },
      { q: "nevertheless ?", a: "néanmoins, cependant, pourtant" },
      { q: "to improve ?", a: "améliorer, progresser" },
    ],
  },
  {
    name: 'Géographie — Capitales mondiales', subject: 'Histoire-Géographie' as Subject, level: 'Collège',
    cards: [
      { q: "Capitale de l'Allemagne ?", a: "Berlin" },
      { q: "Capitale du Brésil ?", a: "Brasília" },
      { q: "Capitale de la Chine ?", a: "Pékin (Beijing)" },
      { q: "Capitale de l'Australie ?", a: "Canberra" },
      { q: "Capitale du Canada ?", a: "Ottawa" },
      { q: "Capitale de l'Inde ?", a: "New Delhi" },
      { q: "Capitale du Japon ?", a: "Tokyo" },
      { q: "Capitale de la Russie ?", a: "Moscou" },
      { q: "Capitale de l'Argentine ?", a: "Buenos Aires" },
      { q: "Capitale de l'Afrique du Sud ?", a: "Pretoria (administrative), Le Cap (législative), Bloemfontein (judiciaire)" },
      { q: "Capitale du Mexique ?", a: "Mexico (Ciudad de México)" },
      { q: "Capitale de l'Égypte ?", a: "Le Caire" },
    ],
  },
  {
    name: 'Philosophie — Auteurs & Concepts', subject: 'Philosophie' as Subject, level: 'Terminale',
    cards: [
      { q: "Cogito de Descartes ?", a: "'Je pense, donc je suis' — l'existence du sujet pensant est la première certitude indubitable" },
      { q: "L'impératif catégorique de Kant ?", a: "'Agis uniquement selon la maxime qui peut être érigée en loi universelle'" },
      { q: "Platon — mythe de la caverne ?", a: "Allégorie illustrant que les hommes confondent les apparences avec la réalité. La philosophie mène vers la Vérité (les Idées)" },
      { q: "Aristote — définition de l'homme ?", a: "'L'homme est un animal politique' (zoon politikon) — il ne peut se réaliser qu'en société" },
      { q: "Nietzsche — mort de Dieu ?", a: "Proclamation de la fin des valeurs absolues (religieuses, morales). Appel au dépassement de l'homme vers le Surhomme" },
      { q: "Sartre — 'l'existence précède l'essence' ?", a: "L'homme n'a pas de nature fixe : il se définit par ses actes et ses choix (existentialisme)" },
      { q: "Hobbes — état de nature ?", a: "'L'homme est un loup pour l'homme' — guerre de tous contre tous, d'où la nécessité du contrat social" },
      { q: "Rousseau — nature de l'homme ?", a: "L'homme est naturellement bon ; c'est la société qui le corrompt" },
      { q: "Epicure — définition du plaisir ?", a: "Le souverain bien est l'ataraxie (absence de trouble) et l'aponie (absence de douleur)" },
      { q: "Marx — matérialisme historique ?", a: "L'histoire est déterminée par les conditions matérielles de production ; la lutte des classes est le moteur de l'Histoire" },
    ],
  },
  {
    name: 'Chimie — Réactions & Équations', subject: 'Physique-Chimie' as Subject, level: 'Lycée',
    cards: [
      { q: "Loi de conservation de la masse (Lavoisier) ?", a: "'Rien ne se perd, rien ne se crée, tout se transforme' — la masse totale est conservée" },
      { q: "Comment équilibrer une équation chimique ?", a: "Ajuster les coefficients stœchiométriques pour avoir le même nombre d'atomes de chaque élément des deux côtés" },
      { q: "Qu'est-ce qu'un acide selon Brønsted ?", a: "Espèce chimique capable de donner un proton H⁺" },
      { q: "Qu'est-ce qu'une base selon Brønsted ?", a: "Espèce chimique capable d'accepter un proton H⁺" },
      { q: "Formule du pH ?", a: "pH = −log[H₃O⁺]" },
      { q: "Qu'est-ce qu'une réaction de combustion complète ?", a: "Réaction avec dioxygène (O₂) produisant CO₂ et H₂O uniquement" },
      { q: "Réaction d'oxydoréduction : définition ?", a: "Transfert d'électrons entre un réducteur (perd des électrons) et un oxydant (gagne des électrons)" },
      { q: "Formule molaire du dioxyde de carbone ?", a: "CO₂ — 1 carbone, 2 oxygènes" },
    ],
  },
];

// ─── Icônes & couleurs par matière ───────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: React.ElementType; color: string }> = {
  'Maths':             { icon: Calculator,    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  'Physique-Chimie':   { icon: FlaskConical,  color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  'SVT':               { icon: FlaskConical,  color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
  'Histoire-Géographie': { icon: ScrollText,  color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  'Français':          { icon: BookOpen,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  'Philosophie':       { icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  'Langues':           { icon: Languages,     color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  'Géographie':        { icon: Globe2,        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
};
const getMeta = (subject: string) => SUBJECT_META[subject] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };

// ─── Bibliothèque : sélection par onglet matière ─────────────────────────────
const FlashLibrary: React.FC<{
  subjects: string[];
  onImport: (pack: FlashPack) => void;
}> = React.memo(({ subjects, onImport }) => {
  const availableSubjects = [...new Set(FLASH_PACKS.map(p => p.subject))].filter(
    s => !subjects.length || subjects.includes(s)
  );
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const filtered = activeSubject ? FLASH_PACKS.filter(p => p.subject === activeSubject) : [];

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          Bibliothèque — packs du programme officiel
        </CardTitle>
        <p className="text-xs text-muted-foreground">Importe un pack rédigé manuellement en un clic — toutes les matières du collège au lycée.</p>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* Onglets matières */}
        <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          <div className="flex gap-1.5 min-w-max">
            {availableSubjects.map(subj => {
              const meta = getMeta(subj);
              const Icon = meta.icon;
              const active = activeSubject === subj;
              return (
                <button key={subj} type="button"
                  onClick={() => setActiveSubject(active ? null : subj)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[36px] whitespace-nowrap ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {subj}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packs de la matière sélectionnée */}
        {activeSubject && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(pack => {
              const meta = getMeta(pack.subject);
              const Icon = meta.icon;
              return (
                <button key={pack.name} type="button"
                  onClick={() => onImport(pack)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/40 transition-all text-left group"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-pretty">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">{pack.cards.length} cartes · {pack.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        {!activeSubject && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Sélectionne une matière pour voir les packs disponibles
          </p>
        )}
      </CardContent>
    </Card>
  );
});
FlashLibrary.displayName = 'FlashLibrary';

const FlashcardsPage: React.FC = () => {
  const { level, decks, addDeck, deleteDeck, flashcards, addFlashcard, importPackCards, deleteFlashcard, reviewFlashcard } = useApp();
  const subjects = getSubjectsForLevel(level);
  const today = new Date().toISOString().split('T')[0];

  // ── État local ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('list');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: '', subject: subjects[0] as Subject });
  const [cardForm, setCardForm] = useState({ question: '', answer: '' });
  const [studyIndex, setStudyIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // ── Génération IA de flashcards supprimée — contenu 100 % humain ──────────────

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const deckCards = flashcards.filter(c => c.deckId === activeDeckId);
  const dueCards = deckCards.filter(c => c.nextReview <= today);
  const studyCard = dueCards[studyIndex] ?? null;

  // ── Stats globales ───────────────────────────────────────────────────────────
  const totalCards = flashcards.length;
  const easyCards = flashcards.filter(c => c.difficulty === 'easy').length;
  const hardCards = flashcards.filter(c => c.difficulty === 'hard').length;
  const todayDue = flashcards.filter(c => c.nextReview <= today).length;
  const masteryPct = totalCards > 0 ? Math.round((easyCards / totalCards) * 100) : 0;

  const deckStats = useMemo(() => decks.map(deck => {
    const cards = flashcards.filter(c => c.deckId === deck.id);
    const due = cards.filter(c => c.nextReview <= today).length;
    return { ...deck, total: cards.length, due };
  }), [decks, flashcards, today]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreateDeck = () => {
    if (!deckForm.name.trim()) return;
    addDeck({ name: deckForm.name.trim(), subject: deckForm.subject, level });
    setDeckForm({ name: '', subject: subjects[0] as Subject });
    setShowNewDeck(false);
  };

  const handleCreateCard = () => {
    if (!cardForm.question.trim() || !cardForm.answer.trim() || !activeDeckId) return;
    addFlashcard({ deckId: activeDeckId, question: cardForm.question.trim(), answer: cardForm.answer.trim(), difficulty: 'medium' });
    setCardForm({ question: '', answer: '' });
    setShowNewCard(false);
  };

  const handleReview = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!studyCard) return;
    reviewFlashcard(studyCard.id, difficulty);
    setRevealed(false);
    if (studyIndex + 1 >= dueCards.length) {
      setView('list');
      setStudyIndex(0);
    } else {
      setStudyIndex(i => i + 1);
    }
  };

  const startStudy = (deckId: string) => {
    // Remonter en haut AVANT le changement de vue — la vue 'study' est plus courte
    // que la liste, si le scroll est à mi-page on se retrouverait sur le footer.
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveDeckId(deckId);
    setStudyIndex(0);
    setRevealed(false);
    setView('study');
  };

  // ── Navigation clavier (Space = révéler/évaluer, Flèches = évaluation) ──────
  React.useEffect(() => {
    if (view !== 'study') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      }
      if (revealed) {
        if (e.key === '1') handleReview('hard');
        if (e.key === '2') handleReview('medium');
        if (e.key === '3') handleReview('easy');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, revealed, studyCard]);

  // useCallback stable → FlashLibrary (React.memo) ne re-rend pas à chaque render parent
  // IMPORTANT : doit être déclaré AVANT les early returns conditionnels (Rules of Hooks)
  const handleImport = useCallback((pack: FlashPack) => {
    const deckId = addDeck({ name: pack.name, subject: pack.subject, level });
    importPackCards(pack.cards.map(c => ({ deckId, question: c.q, answer: c.a, difficulty: 'medium' as const })));
    toast.success(`Pack "${pack.name}" importé — ${pack.cards.length} cartes ajoutées ! 🃏`);
  }, [addDeck, importPackCards, level]);

  // ── Vue : Étude ───────────────────────────────────────────────────────────────
  if (view === 'study' && activeDeck) {
    const done   = studyIndex;
    const total  = dueCards.length;
    const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); setStudyIndex(0); }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeDeck.name}</p>
            <p className="text-xs text-muted-foreground">{done}/{total} cartes révisées</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{total - done} restantes</Badge>
        </div>

        {/* Barre de progression */}
        <div className="space-y-1">
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct}% terminé</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">Espace</kbd> révéler ·
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">1</kbd>
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">2</kbd>
              <kbd className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">3</kbd> évaluer
            </span>
          </div>
        </div>

        {studyCard ? (
          <div className="space-y-4">
            {/* Carte principale */}
            <Card className="shadow-card min-h-[200px] flex flex-col">
              <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Question</span>
                <Badge variant="outline" className="text-xs">
                  {studyCard.difficulty === 'easy' ? '🟢 Facile' : studyCard.difficulty === 'hard' ? '🔴 Difficile' : '🟡 Moyen'}
                </Badge>
              </div>
              <CardContent className="flex-1 flex items-center justify-center p-6">
                <p className="text-lg md:text-xl font-semibold text-foreground text-center text-balance leading-relaxed">
                  {studyCard.question}
                </p>
              </CardContent>
            </Card>

            {/* Zone réponse */}
            {!revealed ? (
              <div className="text-center space-y-3">
                <Button onClick={() => setRevealed(true)} size="lg" className="w-full md:w-auto gap-2 h-12">
                  <Eye className="w-4 h-4" /> Révéler la réponse
                </Button>
                <p className="text-xs text-muted-foreground">ou appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Espace</kbd></p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Réponse */}
                <Card className="border-success/30 bg-success/5 shadow-none">
                  <div className="border-b border-success/20 px-5 py-2.5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success uppercase tracking-wide">Réponse</span>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-base text-foreground font-medium text-pretty leading-relaxed">
                      {studyCard.answer}
                    </p>
                  </CardContent>
                </Card>

                {/* Évaluation */}
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground font-medium">Comment tu t'en es sorti ?</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button"
                      onClick={() => handleReview('hard')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors group min-h-[80px]"
                      aria-label="Difficile — revoir dans 1 jour"
                    >
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">Difficile</span>
                      <span className="text-[11px] text-muted-foreground">+1 jour · <kbd className="font-mono opacity-60">1</kbd></span>
                    </button>
                    <button type="button"
                      onClick={() => handleReview('medium')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors group min-h-[80px]"
                      aria-label="Moyen — revoir dans 3 jours"
                    >
                      <Clock className="w-5 h-5 text-warning" />
                      <span className="text-sm font-semibold text-warning">Moyen</span>
                      <span className="text-[11px] text-muted-foreground">+3 jours · <kbd className="font-mono opacity-60">2</kbd></span>
                    </button>
                    <button type="button"
                      onClick={() => handleReview('easy')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors group min-h-[80px]"
                      aria-label="Facile — revoir dans 7 jours"
                    >
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold text-success">Facile</span>
                      <span className="text-[11px] text-muted-foreground">+7 jours · <kbd className="font-mono opacity-60">3</kbd></span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Session terminée */
          <Card className="shadow-card">
            <CardContent className="py-12 text-center space-y-4">
              <span className="text-5xl block">🎉</span>
              <div>
                <p className="text-xl font-bold text-foreground">Session terminée !</p>
                <p className="text-sm text-muted-foreground mt-1">Tu as révisé toutes les cartes dues pour aujourd'hui.</p>
              </div>
              <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
                L'algorithme SM-2 a programmé tes prochaines révisions. Reviens demain !
              </p>
              <Button onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); setStudyIndex(0); }}
                className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Retour aux decks
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Vue : Gestion d'un deck ──────────────────────────────────────────────────
  if (view === 'manage' && activeDeck) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1.5"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setView('list'); }}>
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeDeck.name}</p>
            <p className="text-xs text-muted-foreground">{deckCards.length} carte{deckCards.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deckCards.length > 0 && (
              <ExportButton
                fileName={`flashcards-${activeDeck.name.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`}
                variant="outline" size="sm" label="Exporter"
                getContent={() => ({
                  title: `Flashcards — ${activeDeck.name}`,
                  subtitle: `Matière : ${activeDeck.subject} · ${deckCards.length} carte${deckCards.length > 1 ? 's' : ''}`,
                  sections: deckCards.map((c, i) => ({
                    heading: `Carte ${i + 1} — ${c.question}`,
                    body: `Réponse : ${c.answer}\nDifficulté : ${c.difficulty === 'easy' ? 'Facile' : c.difficulty === 'hard' ? 'Difficile' : 'Moyen'}`,
                  })),
                })}
              />
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setShowNewCard(true)}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
        </div>

        {/* Légende difficultés */}
        <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
          {[
            { label: 'Facile', cls: 'bg-success/10 text-success border-success/30' },
            { label: 'Moyen', cls: 'bg-warning/10 text-warning border-warning/30' },
            { label: 'Difficile', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
          ].map(d => (
            <span key={d.label} className={`px-2 py-0.5 rounded-full border text-xs font-medium ${d.cls}`}>{d.label}</span>
          ))}
          <span className="text-muted-foreground self-center">— niveau de mémorisation actuel</span>
        </div>

        {/* Liste des cartes */}
        {deckCards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="font-semibold text-foreground">Aucune carte dans ce deck</p>
              <p className="text-sm text-muted-foreground">Commence par ajouter ta première flashcard.</p>
              <Button onClick={() => setShowNewCard(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Créer une carte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {deckCards.map((card, i) => (
              <Card key={card.id} className="hover:bg-secondary/30 transition-colors">
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground text-pretty">{card.question}</p>
                    <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{card.answer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      card.difficulty === 'easy'   ? 'bg-success/10 text-success border-success/30' :
                      card.difficulty === 'hard'   ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                                     'bg-warning/10 text-warning border-warning/30'
                    }`}>
                      {card.difficulty === 'easy' ? 'Facile' : card.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
                    </span>
                    <button type="button"
                      onClick={() => deleteFlashcard(card.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label={`Supprimer : ${card.question}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog nouvelle carte */}
        <Dialog open={showNewCard} onOpenChange={setShowNewCard}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle flashcard</DialogTitle>
              <DialogDescription className="sr-only">Créer une nouvelle carte question / réponse.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Question (recto)</Label>
                <Textarea placeholder="Ex : Quelle est la formule de l'eau ?" value={cardForm.question}
                  onChange={e => setCardForm(f => ({ ...f, question: e.target.value }))} rows={2} className="px-3" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Réponse (verso)</Label>
                <Textarea placeholder="Ex : H₂O — deux atomes d'hydrogène, un atome d'oxygène" value={cardForm.answer}
                  onChange={e => setCardForm(f => ({ ...f, answer: e.target.value }))} rows={2} className="px-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCard(false)}>Annuler</Button>
              <Button onClick={handleCreateCard} disabled={!cardForm.question.trim() || !cardForm.answer.trim()}>Créer la carte</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Vue : Liste des decks ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 min-w-0">
      <h1 className="sr-only">Flashcards — Répétition espacée</h1>
      <SEO
        title="Flashcards gratuits — Mémorisez 2× plus vite, répétition espacée | Apprenix"
        description="Créez et révisez vos flashcards avec la répétition espacée SM-2. Mémorisez vocabulaire, dates et formules 2× plus vite. Gratuit."
        canonical="/flashcards"
        keywords="flashcards répétition espacée gratuit, révision intelligente, mémorisation scolaire, cartes mémoire, alternative Anki gratuit"
        dateModified="2026-06-20"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Révision par flashcards — Apprenix",
          "description": "Système de flashcards avec algorithme de répétition espacée pour mémoriser efficacement toutes les matières scolaires.",
          "url": "https://apprenix.org/flashcards",
          "provider": { "@type": "Organization", "name": "Apprenix", "url": "https://apprenix.org" },
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
          "educationalLevel": "CP, Collège, Lycée, Université",
          "inLanguage": "fr-FR",
          "isAccessibleForFree": true,
        }}
      />

      <PageHero
        variant="tool"
        icon={BookOpen}
        badge={<>🃏 Flashcards</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Flashcards — Mémorisez 2× plus vite"
        subtitle="Crée tes propres decks ou importe un pack du programme officiel, puis révise avec l'algorithme de répétition espacée SM-2 — la méthode validée par la recherche."
        stats={[
          { value: String(easyCards), label: 'Cartes maîtrisées' },
          { value: String(todayDue), label: 'À réviser aujourd\'hui' },
          { value: 'SM-2', label: 'Algorithme scientifique' },
        ]}
        cta={{ label: 'Nouveau deck', onClick: () => setShowNewDeck(true) }}
      >
        <ENBadge />
      </PageHero>

      {/* ── Bannière "à réviser aujourd'hui" ── */}
      {todayDue > 0 && (
        <Card className="border-warning/30 bg-warning/5 shadow-none">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm text-foreground flex-1 min-w-0">
              <span className="font-semibold">{todayDue} carte{todayDue > 1 ? 's' : ''}</span> à réviser aujourd'hui — lance une session pour ne pas perdre ta progression !
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Stats globales ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'À réviser aujourd\'hui', value: todayDue,     icon: Clock,       color: 'text-warning' },
          { label: 'Cartes maîtrisées',      value: easyCards,   icon: CheckCircle, color: 'text-success' },
          { label: 'Cartes difficiles',      value: hardCards,   icon: AlertCircle, color: 'text-destructive' },
          { label: 'Taux de maîtrise',       value: `${masteryPct}%`, icon: BarChart3, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="h-full shadow-none border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted`}>
                <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground text-balance leading-snug">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Bibliothèque ── */}
      <FlashLibrary subjects={subjects} onImport={handleImport} />

      {/* ── Mes decks ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Mes decks ({decks.length})</h2>
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => setShowNewDeck(true)}>
            <Plus className="w-3.5 h-3.5" /> Nouveau deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 md:py-20 text-center space-y-3">
              <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <p className="text-lg font-semibold text-foreground">Aucun deck pour l'instant</p>
              <p className="text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
                Importe un pack depuis la bibliothèque ou crée ton propre deck de zéro.
              </p>
              <Button onClick={() => setShowNewDeck(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Créer mon premier deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckStats.map(deck => {
              const meta    = getMeta(deck.subject);
              const Icon    = meta.icon;
              const mastery = deck.total > 0
                ? Math.round((flashcards.filter(c => c.deckId === deck.id && c.difficulty === 'easy').length / deck.total) * 100)
                : 0;

              return (
                <Card key={deck.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm text-balance leading-snug">{deck.name}</CardTitle>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs py-0">{deck.subject}</Badge>
                          <Badge variant="outline" className="text-xs py-0">{deck.level}</Badge>
                        </div>
                      </div>
                      <button type="button"
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                        onClick={() => deleteDeck(deck.id)}
                        aria-label={`Supprimer le deck ${deck.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-3">
                    {/* Stats du deck */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{deck.total} carte{deck.total !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-foreground">{mastery}% maîtrisé</span>
                      </div>
                      <Progress value={mastery} className="h-1.5" />
                      {deck.due > 0 && (
                        <p className="text-xs text-warning font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {deck.due} carte{deck.due > 1 ? 's' : ''} à réviser
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" className="flex-1 gap-1.5"
                        disabled={deck.due === 0}
                        onClick={() => startStudy(deck.id)}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {deck.due > 0 ? `Étudier (${deck.due})` : '✓ À jour'}
                      </Button>
                      <button type="button"
                        className="px-3 rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[36px] flex items-center justify-center"
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setActiveDeckId(deck.id); setView('manage'); }}
                        aria-label={`Gérer les cartes du deck ${deck.name}`}
                        title="Gérer les cartes"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Dialog nouveau deck ── */}
      <Dialog open={showNewDeck} onOpenChange={setShowNewDeck}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau deck de flashcards</DialogTitle>
            <DialogDescription className="sr-only">Créer un nouveau deck pour organiser vos flashcards par matière.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="deck-name" className="text-sm font-medium">Nom du deck</Label>
              <Input id="deck-name" placeholder="ex : Formules de Physique" value={deckForm.name}
                onChange={e => setDeckForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && deckForm.name.trim() && handleCreateDeck()}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Matière</Label>
              <Select value={deckForm.subject} onValueChange={v => setDeckForm(f => ({ ...f, subject: v as Subject }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDeck(false)}>Annuler</Button>
            <Button onClick={handleCreateDeck} disabled={!deckForm.name.trim()}>Créer le deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardsPage;
