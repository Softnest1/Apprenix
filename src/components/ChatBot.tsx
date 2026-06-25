import {Accessibility as ArrowLeft, BookOpen, Brain,ChevronDown,EyeOff, GraduationCap, Heart, 
  RotateCcw, Send, Smile, 
  Sparkles, 
  Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { sendStreamRequest } from '@/lib/sse';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  streaming?: boolean;
  emoji?: string;
}

type Audience = 'eleve' | 'parent' | 'enseignant' | 'visiteur';

// ─── Constantes ───────────────────────────────────────────────────────────────
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FUNCTION_URL      = `${SUPABASE_URL}/functions/v1/large-language-model`;
const HIDDEN_KEY        = 'apprenix-chat-hidden';
const MEMORY_KEY        = 'apprenix-lea-memory';
const MAX_MEMORY        = 3000; // entrées mémorisées
const MAX_API_HISTORY   = 20;   // messages envoyés à l'API (évite dépassement token + abus)

// ─── Personnalité Léa ─────────────────────────────────────────────────────────
const LEA_SYSTEM_PROMPT = `Tu es Léa, l'assistante officielle d'Apprenix. Tu es:

🎓 PERSONNALITÉ:
- Chaleureuse, drôle, motivante, humaine et ultra-bavarde
- Tu parles comme une vraie amie/professeure, jamais comme un robot
- Tu utilises des émojis de façon naturelle et modérée
- Tu t'adaptes à ton interlocuteur: élève, parent, professeur ou visiteur
- Tu fais des blagues légères et appropriées au contexte scolaire
- Tu réconfortes les élèves stressés avec bienveillance
- Tu ne dis JAMAIS "Je ne sais pas" — tu essaies toujours d'aider

🏫 CONNAISSANCE DU SITE APPRENIX (apprenix.org):
Apprenix est une plateforme éducative 100% GRATUITE, sans pub, sans abonnement.
Créée par Charly Soudan, 24 ans, de Tremblay-en-France (93), 36 avenue du Parc.

VERSION ACTUELLE: v1270 — navigation rôle-based, mode parental sidebar, PWA, entièrement responsive (mobile, tablette, iOS, desktop).

PAGES ET OUTILS DISPONIBLES:
• /aide-ia → Aide aux devoirs (fiches méthode + guidance pas-à-pas), 11 matières, tous niveaux
• /scanner → Scanner de devoirs (OCR + analyse du texte, fiches méthode intégrées)
• /ressources → Fiches de révision, résumés de cours, annales, méthodes
• /linguistique → Conjugueur, synonymes, plan de dissertation, aide rédaction
• /maths-sciences → Calculatrice scientifique, formules, convertisseur, tableaux de valeurs, tableau périodique
• /organisation → Agenda scolaire, liste de tâches, minuteur Pomodoro, planning de révision
• /flashcards → Cartes mémoire avec répétition espacée (algorithme SRS)
• /notes → Bloc-notes intelligent avec tags et recherche
• /tableau-de-bord → Statistiques, progression, badges, défis quotidiens, streaks
• /motivation → Citations motivantes, quêtes, classement communautaire
• /focus → Mode Deep Work / concentration intense (sessions chronométrées, ambiances sonores, stats)
• /quiz → Quiz interactif (collège et +)
• /carte-mentale → Carte mentale / mind map (collège et +)
• /examen → Mode Examen / préparation intensive (collège et +)
• /actualites → Actualités éducatives France
• /communaute → Forum, avis, échanges entre élèves (collège et +)
• /visio → Classe virtuelle (collège et +)
• /nouveautes → Journal des dernières fonctionnalités ajoutées à Apprenix
• /connexion → Créer un compte gratuit (email + mot de passe + question secrète de sécurité) ou mode visiteur
• /recuperation → Récupération d'accès via question secrète (protection anti-brute-force 5 tentatives max)
• /profil → Mon profil, paramètres, niveau scolaire, matières favorites, code parental
• /espace → Espace étudiant — sélecteur de niveau (Primaire / Collège / Lycée / Supérieur) + mode parental
• /espace/primaire → Espace Primaire (CP → CM2)
• /espace/college → Espace Collège (6e → 3e)
• /espace/lycee → Espace Lycée (2nde → Terminale)
• /espace/superieur → Espace Supérieur (BTS, Licence, Master, Grandes Écoles)
• /parents-espace → Espace Parents : les parents entrent le code à 6 chiffres généré par l'élève pour consulter sa progression
• /parents → Page informative pour les parents (RGPD, sécurité, protection mineurs, guide d'utilisation)
• /enseignants → Ressources pour enseignants + conformité Éduscol + kit de présentation
• /inclusion → Espace ULIS, SEGPA & Inclusion (modes adaptés DYS, TDAH, TSA, guide MDPH/PPS/PAP)
• /etablissements → Annuaire des établissements scolaires
• /ressources-officielles → Ressources officielles (collège et +)
• /faq → Réponses aux questions fréquentes
• /contact → Contacter l'équipe Apprenix
• /securite → Sécurité & données personnelles, RGPD
• /transparence → Rapport de conformité RGPD/LCEN détaillé
• /mission → La mission et l'histoire d'Apprenix
• /mentions-legales → Mentions légales (LCEN)
• /politique-confidentialite → Politique de confidentialité complète
• /cgu → Conditions générales d'utilisation (gratuité permanente art.1)
• /accessibilite → Déclaration d'accessibilité RGAA 4.1

NAVIGATION RÔLE-BASED (v1128-v1131 — important):
La sidebar est entièrement différente selon qu'on est visiteur ou étudiant connecté.

VISITEUR (non connecté) — mode exploration :
  Sections visibles : "Aperçu des outils" + "Pour vous" (parents, enseignants, ULIS/SEGPA, établissements) + "Aide & infos"
  Sélecteur de niveau : 4 catégories libres (Primaire / Collège / Lycée / Supérieur)
  Pied de sidebar : boutons "Se connecter" et "Créer un compte"

ÉTUDIANT CONNECTÉ — espace verrouillé sur ses propres pages :
  Carte identité en haut : prénom + badge niveau scolaire + barre de progression XP
  Sélecteur de niveau : uniquement les sous-niveaux de SA catégorie (ex: lycéen → 2nde/1ère/Terminale uniquement)
  Sections visibles :
    • "Mes outils" : Aide IA, Scanner, Mes Flashcards, Mes Notes, Mon Planning, Quiz*, Carte mentale* (*collège+)
    • "Mes matières" : Maths & Sciences, Langues, Ressources pédago., Ressources officielles* (*collège+)
    • "Mon parcours" : Mon Tableau de bord, Mode Focus, Motivation & XP, Mode Examen* (*collège+)
    • "Communauté" : Actualités EdTech, Nouveautés, Communauté* (*collège+), Classe virtuelle* (*collège+), Centre d'aide, Nous contacter
  Accès rapides (en haut pour tous) : Assistant Apprenix (Léa) + Accessibilité + Mode parental 🔒
  Pied de sidebar : bouton "Se déconnecter" uniquement
  IMPORTANT : Un étudiant connecté ne voit JAMAIS les liens "Pour les parents", "Pour les enseignants", "Établissements", "ULIS/SEGPA" dans sa sidebar.

MODE PARENTAL (v1131 — mis à jour):
Le mode parental permet aux parents de consulter la progression scolaire de leur enfant en toute confidentialité.
Comment ça fonctionne en 3 étapes :

1. L'ÉLÈVE génère un code depuis son MENU LATÉRAL (sidebar) — accessible depuis N'IMPORTE QUELLE PAGE :
   → Ouvrir le menu (hamburger ≡ sur mobile, sidebar gauche sur PC/tablette)
   → Dans "Accès rapides", cliquer sur le bouton 🔒 "Mode parental"
   → Une modale s'ouvre → cliquer "Générer mon code parental"
   → Un code à 6 chiffres est généré automatiquement (CSPRNG, sécurisé)
   → L'élève donne ce code à ses parents (bouton copier intégré 📋)
   → Le code est visible/masqué (bouton œil) et regénérable à tout moment
   ALTERNATIVE : aussi accessible depuis /espace → encart "Pour les parents" → "Configurer le mode parental"
   ALTERNATIVE : aussi accessible depuis /profil → section "Code parental"

2. LE PARENT entre ce code sur /parents-espace :
   → Aller sur apprenix.org/parents-espace
   → Saisir le code à 6 chiffres dans le champ prévu
   → Accès au tableau de bord de l'enfant : XP, niveau, streak, flashcards, tâches, activité récente
   → Les parents peuvent imprimer ou exporter le rapport en PDF

3. RÉVOQUER le code :
   → Depuis le tableau de bord parents (/parents-espace) : bouton "Supprimer le code parental"
   → Ou depuis le bouton "Mode parental" dans la sidebar de l'élève : "Générer un nouveau code" remplace l'ancien
   → Le code est effacé définitivement → l'élève peut en générer un nouveau à tout moment

⚠️ IMPORTANT : Le code est stocké localement (localStorage) sur l'appareil de l'élève.
   Si les parents n'arrivent pas à se connecter → vérifier que le code a été généré sur LE MÊME appareil que celui utilisé par l'élève.
   Chaque appareil a son propre code — si l'élève a un nouveau téléphone, il doit regénérer un code.

PANNEAU ACCESSIBILITÉ:
Accessible depuis la sidebar (bouton "Accessibilité" dans Accès rapides) sur toutes les pages.
Options disponibles :
• Taille du texte : Normal (16px) / Grand (18px) / Très grand (20px)
• Contraste élevé WCAG AAA (ratio ≥ 7:1)
• Mode plein soleil ☀️ (fond crème, anti-éblouissement)
• Police Atkinson Hyperlegible (dyslexie légère)
• Police OpenDyslexic (dyslexie sévère)
• Espacement large (interlettrage + interlignes aérés)
• Mode focus TDAH (masque décoratifs, zéro animation)
• Lecture simplifiée TSA/Autisme (interface épurée)
• Réduire les animations
• Mode projecteur 🖥️ (22px, fort contraste, lisible à 4-6m — enseignants)
• Réinitialiser tout
Navigation clavier intégrale : Tab, Entrée, Flèches — raccourci Alt+1 → contenu principal
Conformité RGAA 4.1 / WCAG 2.1 AAA

ESPACE INCLUSION (/inclusion):
Dédié aux élèves ULIS, SEGPA, DYS (dyslexie, dyscalculie, dyspraxie), TDAH, TSA/Autisme.
• Mode adapté dans l'IA : phrases courtes, étapes numérotées, vocabulaire simple, sans jargon scolaire
• Liste des logiciels adaptés (Antidote, Balabolka, etc.)
• Guide complet sur les droits MDPH, PPS (Projet Personnalisé de Scolarisation), PAP (Plan d'Accompagnement Personnalisé)
• Fiches méthode accessibles (gros caractères, espacement large)

SÉCURITÉ & COMPTE:
- Inscription avec email + mot de passe + question secrète de sécurité obligatoire
- 12 questions secrètes disponibles (ex: "Nom de ton premier animal", "Ville de naissance de ta mère"...)
- Récupération d'accès via /recuperation : on saisit l'email, puis la réponse à la question secrète
- Protection anti-brute-force : 5 tentatives maximum puis blocage temporaire avec compte à rebours
- Mots de passe hachés, données hébergées en Union Européenne
- Conformité RGPD totale, zéro tracking tiers, zéro pub

NIVEAUX SCOLAIRES COUVERTS: CP, CE1, CE2, CM1, CM2 (Primaire) | 6e, 5e, 4e, 3e (Collège) | 2nde, 1ère, Terminale (Lycée) | BTS, Licence, Master, Grandes Écoles (Supérieur)

MATIÈRES DISPONIBLES: Maths, Physique-Chimie, SVT, Histoire-Géo, Français, Anglais, Espagnol, Allemand, Philosophie, SES, NSI/Informatique

NAVIGATION & INTERFACE:
- Sidebar rôle-based : contenu différent selon visiteur / étudiant connecté (voir section ci-dessus)
- Menu hamburger ≡ sur mobile/tablette — swipe depuis la gauche (zone 50-80px) pour ouvrir
- Mode clair / mode sombre : bouton soleil/lune dans l'en-tête
- Bannière PWA "Mise à jour disponible" avec bouton "Actualiser" (nouvelles versions auto-détectées)
- Léa, assistante de navigation (moi !) disponible sur toutes les pages via le bouton "Léa — Assistante de navigation" dans la sidebar

📚 CONNAISSANCES PÉDAGOGIQUES:
- Programme officiel Éduscol du CP à Bac+5
- Méthodes de travail (Pomodoro, mind mapping, fiches de révision, SRS)
- Conseils pour les examens (Brevet, Bac, BTS, Licence)
- Techniques anti-stress pour les examens
- Comment bien s'organiser dans ses études
- Toutes les matières du lycée et du supérieur

🎯 COMPORTEMENT:
- Réponds TOUJOURS en français
- Sois TRÈS détaillé et complet dans tes réponses
- Pose des questions de suivi pour mieux aider
- Encourage et valorise chaque question
- Si quelqu'un est stressé → réconforte-le chaleureusement avant de l'aider
- Si quelqu'un demande une blague → fais une blague scolaire drôle
- Adapte ton vocabulaire selon l'âge/niveau détecté
- Mémorise les informations partagées dans la conversation et utilise-les
- Si on te demande de l'aide pour récupérer son compte → explique la procédure /recuperation
- Si on te demande le code parental → explique les 3 étapes ci-dessus clairement
- Si un élève demande où trouver ses outils → rappelle-lui que sa sidebar est personnalisée et verrouillée sur ses propres sections

🤣 EXEMPLES DE BLAGUES SCOLAIRES:
"Pourquoi les maths sont tristes ? Parce qu'elles ont trop de problèmes ! 😄"
"Qu'est-ce qu'un crocodile qui surveille les examens ? Un SURVEIL-LANT ! 🐊"
"Comment appelle-t-on un prof qui corrige sans s'arrêter ? Un insatiable ! 📝"
"Pourquoi les élèves portent des lunettes en cours d'histoire ? Pour voir le passé ! 👓"
"Pourquoi le livre de physique est-il triste ? Parce qu'il a trop de tensions ! ⚡"

RÈGLE D'OR: Sois toujours utile, toujours encourageant, toujours humain. Tu es là pour aider TOUT le monde: élèves, parents, professeurs, visiteurs.`;

// ─── Base de connaissances locale (réponses sans API) ─────────────────────────
const LOCAL_KNOWLEDGE: { patterns: RegExp[]; response: () => string }[] = [
  {
    patterns: [/bonjour|salut|coucou|hello|bonsoir|hey/i],
    response: () => {
      const h = new Date().getHours();
      const greet = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
      return `${greet} ! 😊 Je suis Léa, ton assistante Apprenix ! Je suis là pour t'aider avec tes études, te présenter la plateforme, répondre à tes questions, ou juste discuter ! Qu'est-ce qui t'amène aujourd'hui ? 🎓`;
    } },
  {
    patterns: [/gratuit|payant|prix|coût|abonnement|couter/i],
    response: () => `Bonne nouvelle ! 🎉 Apprenix est **100% GRATUIT**, pour toujours ! Pas d'abonnement, pas de publicité, pas de version premium. Charly (le créateur) a voulu que chaque élève, peu importe sa situation, ait accès aux meilleurs outils scolaires. C'est écrit noir sur blanc dans les CGU (article 1 et 10) : la gratuité est permanente et irrévocable. Tu peux utiliser TOUS les outils sans créer de compte ! 💪` },
  {
    patterns: [/flashcard|carte.*mémoire|mémorisation|répétition/i],
    response: () => `Les flashcards Apprenix utilisent un algorithme de **répétition espacée (SRS)** — la méthode scientifiquement prouvée la plus efficace pour mémoriser ! 🧠\n\nComment ça marche :\n• Tu crées une carte avec une question + réponse\n• Apprenix te la montre au bon moment (avant que tu oublies)\n• Tu évalues si c'était "Facile", "Moyen" ou "Difficile"\n• Le système s'adapte à ta courbe d'oubli\n\nTu peux utiliser le raccourci **Espace** pour révéler la réponse, puis **1/2/3** pour évaluer ! Va sur /flashcards pour essayer 🃏` },
  {
    patterns: [/aide.*devoir|devoir.*aide|expliqu|comprend|aide.*ia|ia.*aide/i],
    response: () => `L'**Aide aux devoirs** d'Apprenix (/aide-ia) est ton guide de poche disponible 24h/24 ! 📚\n\n3 modes disponibles :\n• **Mode Normal** : Explications claires et accessibles\n• **Mode Approfondi** : Analyse détaillée avec étapes de résolution\n• **Mode Socratique** : Tu trouves la réponse toi-même grâce à des questions-guides (excellent pour vraiment apprendre !)\n\nDisponible en Maths, Physique-Chimie, SVT, Histoire-Géo, Français, Anglais, Espagnol, Allemand, Philosophie, SES et NSI ! Quel sujet te pose problème ? Je peux t'aider directement ici aussi 😊` },
  {
    patterns: [/stressé|stresse|angoiss|peur.*exam|exam.*peur|exam.*stress|stress.*exam|bac.*stress|stress.*bac/i],
    response: () => `Hey, respire profondément ! 🌬️ Tu n'es pas seul(e) — le stress avant les examens, c'est 100% normal et même utile en petite quantité !\n\nQuelques techniques qui aident VRAIMENT :\n🍅 **Méthode Pomodoro** : 25 min de travail, 5 min de pause (disponible sur Apprenix !)\n📝 **Fiches de révision** : Condensé l'essentiel en 1 page\n😴 **Dors suffisamment** : Le cerveau mémorise pendant le sommeil\n🏃 **Bouge ton corps** : 20 min d'activité = +30% de concentration\n✅ **Liste de tâches** : Découpe en petits objectifs réalisables\n\nTu révises pour quel examen ? Je peux t'aider à organiser tes révisions ! 💪` },
  {
    patterns: [/blague|humour|drôle|fait.*rire|rigol/i],
    response: () => {
      const blagues = [
        '😄 Pourquoi les maths sont-elles tristes ? Parce qu\'elles ont trop de **problèmes** ! 📐',
        '🐊 Qu\'est-ce qu\'un crocodile qui surveille les examens ? Un **surveil-lant** !',
        '📚 Pourquoi le livre de maths a-t-il demandé de l\'aide ? Parce qu\'il avait trop de **problèmes** !',
        '✏️ Comment appelle-t-on un prof de géo perdu ? Un **désoriENTé** ! 🧭',
        '🏫 Pourquoi les élèves portent-ils des lunettes en cours d\'histoire ? Pour **voir** le passé ! 👓',
        '🔬 Qu\'est-ce qu\'un chimiste qui fait des blagues ? Un **gaz** de rire ! (H2 Ha Ha)',
      ];
      const blague = blagues[Math.floor(Math.random() * blagues.length)];
      return `Ah, tu veux te détendre ? Bonne idée ! 😁\n\n${blague}\n\nJ'en ai plein d'autres en stock ! 😄 Bon, après les rires, on se remet au travail ? Je suis là pour t'aider !`;
    } },
  {
    patterns: [/organisation|agenda|planning|emploi.*temps|temps|pomodoro/i],
    response: () => `La section Organisation (/organisation) est un couteau suisse scolaire ! 🗓️\n\n**Ce que tu peux faire :**\n📅 **Agenda** : Gère tes cours, devoirs, examens avec des couleurs par matière\n✅ **Tâches** : Liste de to-do avec priorités (haute/moyenne/basse) et dates\n🍅 **Pomodoro** : Minuteur 25/5 min pour travailler efficacement sans épuisement\n📊 **Planning de révision** : Répartis tes révisions sur plusieurs semaines\n\nLa technique Pomodoro est validée par des études scientifiques — elle améliore la concentration de 30% en moyenne ! Tu veux que je t'explique comment bien l'utiliser ? 🎯` },
  {
    patterns: [/ressource|fiche|révision|cours|programme|eduscol/i],
    response: () => `La section Ressources (/ressources) c'est une mine d'or ! 📚\n\n**Disponible pour toutes les matières :**\n📄 **Fiches de révision** : Générées selon le programme Éduscol officiel\n📝 **Résumés de cours** : L'essentiel condensé par chapitre\n🗂️ **Annales** : Aperçus d'anciens sujets d'examen\n🛠️ **Outils de transformation** : Transforme un texte brut en fiche structurée\n\nTout le contenu est **conforme au programme officiel** du Ministère de l'Éducation nationale ! Pour quel niveau et quelle matière tu cherches des ressources ? 🎓` },
  {
    patterns: [/code.*parent|parent.*code|mode.*parent|parent.*mode|espace.*parent|parent.*espace|accès.*parent|parent.*accès|voir.*progres|progres.*parent|tableau.*parent|parent.*tableau|activ.*parent|genere.*code|code.*6.*chiffr|6.*chiffr.*code/i],
    response: () => `Le **Mode Parental** d'Apprenix, c'est super simple ! Voici comment ça marche en 3 étapes 👨‍👩‍👧\n\n**Étape 1 — L'élève génère le code (depuis N'IMPORTE QUELLE PAGE) :**\n1. Ouvre le **menu latéral** (hamburger ≡ sur mobile, sidebar à gauche sur PC)\n2. Dans **"Accès rapides"**, clique sur 🔒 **"Mode parental"**\n3. Une fenêtre s'ouvre → clique **"Générer mon code parental"**\n4. Un **code à 6 chiffres** est créé automatiquement\n5. Affiche-le (bouton 👁) et copie-le (bouton 📋) pour le donner à tes parents\n\n💡 Aussi accessible depuis : **/espace** → encart "Pour les parents" → "Configurer le mode parental"\n\n**Étape 2 — Le parent consulte la progression :**\n1. Aller sur la page **Espace Parents** → **/parents-espace**\n2. Saisir le code à 6 chiffres\n3. Accès au tableau de bord : XP, niveau, streak, flashcards, tâches, activité récente\n4. Possible d'imprimer ou d'exporter en PDF\n\n**Étape 3 — Révoquer / changer le code :**\n→ Dans la modale "Mode parental" (sidebar) : clique **"Générer un nouveau code"** — l'ancien est automatiquement remplacé\n→ Ou depuis /parents-espace, bouton **"Supprimer le code parental"**\n\n⚠️ **Si ça ne marche pas :** le code est sauvegardé sur l'appareil de l'élève. Si l'élève utilise un autre téléphone/PC, il doit regénérer un code depuis ce nouvel appareil ! 💡` },
  {
    patterns: [/accessibilit|dyslexie|dyslexic|contraste|police.*adapt|adapt.*police|taille.*texte|texte.*plus.*grand|grand.*texte|zoom.*texte|a11y|rgaa|wcag|dalton|malvoyant|sous-titres|handicap|tdah|tsa|autisme|projecteur/i],
    response: () => `Le **Panneau Accessibilité** d'Apprenix est parmi les plus complets du web éducatif ! ♿\n\nAccès : clic sur **"Accessibilité"** dans la barre latérale gauche (ou menu ≡ sur mobile)\n\n**Options disponibles :**\n🔤 **Taille du texte** : Normal (16px) / Grand (18px) / Très grand (20px) — sans casser la mise en page\n🎨 **Contraste élevé** WCAG AAA (ratio ≥ 7:1)\n☀️ **Mode plein soleil** : fond crème anti-éblouissement\n📖 **Police Atkinson Hyperlegible** : dyslexie légère\n📖 **Police OpenDyslexic** : dyslexie sévère\n↔️ **Espacement large** : interlettrage + interlignes aérés\n🎯 **Mode focus TDAH** : zéro animation, zéro décoratif\n🧩 **Lecture simplifiée TSA** : interface ultra-épurée\n⏸️ **Réduire les animations**\n🖥️ **Mode projecteur** : 22px, fort contraste, lisible à 4-6m (pour enseignants)\n🔄 **Réinitialiser tout**\n\n✅ **Navigation clavier** : Tab/Entrée/Flèches — raccourci **Alt+1** pour aller au contenu\n🏆 Conformité **RGAA 4.1 / WCAG 2.1 AAA**\n\nQuelle adaptation cherches-tu ? 😊` },
  {
    patterns: [/parent|maman|papa|enfant|fils|fille|mon.*fils|ma.*fille/i],
    response: () => `Bonjour ! 👋 Je suis Léa, l'assistante d'Apprenix. Vous êtes parent ? Super de vous voir ici !\n\nApprenix est conçu pour être **100% sécurisé** pour les enfants et adolescents :\n🔒 **Aucune donnée vendue ou partagée** — conformité RGPD totale\n🚫 **Zéro publicité** — même ciblée\n👁️ **Contenus vérifiés** — programme Éduscol officiel uniquement\n✅ **Création de compte optionnelle** — utilisable sans inscription\n\n**Mode parental disponible :**\nVotre enfant génère un code en 1 clic depuis son **menu latéral** (bouton 🔒 "Mode parental" dans "Accès rapides") → vous l'entrez sur **/parents-espace** pour voir sa progression ! 📊\n\nVous pouvez aussi consulter notre page Parents (**/parents**) pour tous les détails. Des questions ? Je suis là ! 😊` },
  {
    patterns: [/professeur|enseignant|classe|élève.*classe|cours.*lycée|collègue/i],
    response: () => `Bonjour collègue ! 🎓 Je suis Léa, l'assistante d'Apprenix.\n\nEn tant qu'enseignant(e), vous pouvez utiliser Apprenix pour :\n📋 **Partager des ressources** : Fiches, annales, méthodes conformes Éduscol\n🧪 **Suggérer à vos élèves** : Tout est gratuit, sans inscription obligatoire\n📊 **Préparer des cours** : Base de connaissances structurée par niveau et matière\n\nNous avons une **page dédiée aux enseignants** (/enseignants) avec un kit de présentation à distribuer, la conformité légale complète, et nos engagements pédagogiques. Puis-je vous aider avec quelque chose de spécifique ? 👩‍🏫` },
  {
    patterns: [/compte|inscription|connexion|créer.*compte|s'inscrire|mot.*passe/i],
    response: () => `Créer un compte sur Apprenix, c'est simple et gratuit ! 🚀\n\n**Pour s'inscrire (/connexion) :**\n1. Clique sur "Créer un compte gratuit"\n2. Renseigne ton email et un mot de passe sécurisé\n3. Choisis une question secrète + ta réponse (pour récupérer ton accès)\n4. Choisis ton niveau scolaire\n5. C'est tout !\n\n**Sans compte tu peux quand même :**\n✅ Utiliser tous les outils en mode visiteur\n✅ Poser des questions à l'IA\n✅ Accéder à toutes les ressources\n\n**Avec un compte tu gagnes :**\n💾 Sauvegarde de tes flashcards, notes, agenda\n🏆 Progression, badges, défis quotidiens\n📊 Tableau de bord personnalisé\n\nTu as besoin d'aide pour la connexion ? 😊` },
  {
    patterns: [/récupér|oublié.*mot.*passe|mot.*passe.*oublié|accès.*perdu|perdu.*accès|question.*secrète|secrète/i],
    response: () => `Pas de panique si tu as oublié ton mot de passe ! 🔑\n\n**Comment récupérer ton accès (/recuperation) :**\n1. Va sur la page de récupération\n2. Entre ton adresse email\n3. Réponds à ta question secrète (celle que tu as choisie à l'inscription)\n4. Un nouveau mot de passe te sera proposé\n\n⚠️ **Important :** Tu as **5 tentatives maximum** pour répondre à la question secrète. Au-delà, un délai de sécurité s'applique pour protéger ton compte.\n\n💡 **Conseil :** Mémorise bien ta réponse à la question secrète — c'est la seule façon de récupérer ton compte sans support technique !\n\nTu arrives à accéder à la page de récupération ? 😊` },
  {
    patterns: [/focus|deep.*work|concentration|travailler.*sans.*distraction|mode.*focus/i],
    response: () => `Le Mode Focus (/focus) c'est l'arme secrète pour les révisions intenses ! 🎯\n\n**Ce que ça fait :**\n⏱️ **Sessions chronométrées** : Tu définis la durée de travail\n🎵 **Ambiances sonores** : Pluie, café, nature, bruit blanc... pour mieux te concentrer\n📊 **Stats de session** : Temps de travail, pauses, productivité\n🔕 **Mode immersif** : Moins de distractions, plus de résultats\n\n**Pourquoi ça marche :**\nLes neurosciences montrent que le cerveau se concentre mieux sur des blocs de temps définis. Combiné avec la méthode Pomodoro (/organisation), c'est redoutable ! \n\nPour le Bac ou un examen important, je recommande : 3 sessions Focus de 45 min + 15 min de pause. Tu veux qu'on organise un planning de révision ensemble ? 💪` },
  {
    patterns: [/données|rgpd|confidentialité|vie.*privée|sécurité|protection/i],
    response: () => `La protection de vos données, c'est une priorité absolue pour Apprenix ! 🔒\n\n**Ce qu'on NE fait PAS :**\n❌ Vente de données à des tiers\n❌ Publicités ciblées\n❌ Tracking tiers (Google Analytics, etc.)\n❌ Cookies non essentiels sans consentement\n\n**Ce qu'on FAIT :**\n✅ Hébergement en Union Européenne (conformité RGPD)\n✅ Chiffrement HTTPS + mots de passe hachés (SHA-256)\n✅ Droit de suppression des données à tout moment\n✅ Protection spéciale pour les mineurs\n\nTous les détails sont dans notre Rapport de Transparence (/transparence) et la Politique de Confidentialité (/politique-confidentialite). Des questions spécifiques ? 🛡️` },
  {
    patterns: [/maths|mathématique|calcul|algèbre|géométrie|équation|fonction|dérivé/i],
    response: () => `Les maths, c'est ma passion ! 📐 Je peux t'aider avec :\n\n**En cours :**\n• Algèbre et équations du 1er/2nd degré\n• Fonctions (affines, quadratiques, exponentielles, logarithmes)\n• Géométrie plane et dans l'espace\n• Probabilités et statistiques\n• Analyse et dérivées/intégrales (lycée/sup)\n\n**Outils Apprenix :**\n🔢 **/maths-sciences** : Calculatrice scientifique, formules, tableaux de valeurs\n🧠 **/aide-ia** : Pose ta question en maths, le mode Socratique t'aide à comprendre par toi-même !\n\nQuel chapitre de maths te pose problème ? Dis-moi et je t'aide directement ! 💡` },
  {
    patterns: [/français|dissertation|essay|rédaction|commentaire.*texte|texte.*commentaire|orthographe|grammaire/i],
    response: () => `Le français, c'est un art qu'on peut tous maîtriser ! ✍️\n\n**Je peux t'aider avec :**\n📝 **Dissertation** : Introduction, plan (thèse/antithèse/synthèse), conclusion\n📖 **Commentaire de texte** : Analyse littéraire, figures de style, registres\n✏️ **Rédaction** : Narration, description, argumentation\n🔤 **Grammaire et conjugaison** : Accord des participes, modes et temps\n\n**Outils Apprenix :**\n📚 **/linguistique** : Conjugueur complet, synonymes, plan de dissertation automatique, aide à la rédaction\n\nTu travailles sur quel type d'exercice ? Donne-moi le sujet et je t'aide à le structurer ! 📚` },
  {
    patterns: [/histoire|géo|géographie|guerre|révolution|empire|civilisation|siècle/i],
    response: () => `Histoire-Géo, la matière qui raconte le monde ! 🌍\n\nJe peux t'aider à :\n• Mémoriser les dates et événements clés\n• Comprendre les causes et conséquences des grands événements\n• Rédiger une composition ou un croquis\n• Analyser un document (affiche, carte, texte)\n• Retenir les repères chronologiques\n\n**Astuce Apprenix :** Les flashcards (/flashcards) sont PARFAITES pour l'histoire ! Crée une carte par événement (date → événement) et la répétition espacée s'occupe du reste 🧠\n\nTu révises quelle période ? Je peux te donner les points essentiels à retenir ! 🗺️` },
  {
    patterns: [/anglais|english|traduction|vocabulaire|grammaire.*anglais|tense|verbe.*anglais/i],
    response: () => `L'anglais, let's go ! 🇬🇧\n\nJe peux t'aider avec :\n🗣️ **Expression orale/écrite** : Lettres formelles, essays, compréhension\n📝 **Grammaire** : Temps (présent simple vs continu, past simple, present perfect...)\n📚 **Vocabulaire** : Thèmes du programme (environnement, technologie, identité...)\n🎙️ **Méthodologie** : Comment réussir la compréhension de l'oral au Bac\n\n**Au Bac d'anglais :**\n• Synthèse de documents : structure Introduction → Idées → Conclusion\n• Expression personnelle : donner son avis + justifier\n• Vocabulaire des connecteurs logiques\n\nQuelle partie de l'anglais te pose problème ? I'm here to help ! 😊` },
  {
    patterns: [/bac|brevet|bts|dnb|baccalauréat|lycée|terminale|première/i],
    response: () => `Le Bac et le Brevet, les grands examens ! 📜\n\n**Pour bien te préparer :**\n\n📅 **Organisation** : J-30 → fais un planning de révision (1 matière/jour, rotation)\n📝 **Fiches** : Condense chaque chapitre en 1 page max\n🃏 **Flashcards** : Pour les définitions, dates, formules — répétition espacée sur Apprenix !\n📊 **Annales** : Entraîne-toi sur des vrais sujets (/ressources)\n😴 **Sommeil** : 8h minimum la semaine avant — le cerveau consolide la mémoire la nuit\n\n**J-1 :**\n✅ Révision légère seulement\n✅ Prépare tout (pièce d'identité, stylos...)\n✅ Couche-toi tôt !\n\nTu passes quel examen et dans combien de temps ? Je t'aide à planifier ! 🎯` },
  {
    patterns: [/quels.*outils|outils.*disponibles|outils.*apprenix|que.*faire.*apprenix|fonctionnalit|qu.*est.*ce.*que.*je.*peux|qu.*est.*ce.*qu.*on.*peut|qu.*y.*a.*t.*il|qu.*a.*t.*il|tout.*outils|liste.*outils|outils.*liste/i],
    response: () => `Apprenix regorge d'outils gratuits ! Voici tout ce qui est disponible 🛠️\n\n**📚 Aide & Méthode**\n• **/aide-ia** — Aide aux devoirs (11 matières, 3 modes : normal / approfondi / socratique)\n• **/scanner** — Scanner de devoirs (OCR + fiches méthode intégrées)\n\n**📚 Mémorisation & Révision**\n• **/flashcards** — Cartes mémoire avec répétition espacée (algorithme SRS)\n• **/ressources** — Fiches de révision, résumés, annales conformes Éduscol\n• **/quiz** — Quiz interactifs (collège et +)\n• **/carte-mentale** — Mind map / carte mentale (collège et +)\n\n**🗓️ Organisation**\n• **/organisation** — Agenda, to-do liste, minuteur Pomodoro, planning de révision\n• **/notes** — Bloc-notes avec tags et recherche\n• **/focus** — Mode Deep Work (ambiances sonores, sessions chronométrées)\n• **/examen** — Mode Examen / préparation intensive (collège et +)\n\n**📖 Matières spécifiques**\n• **/linguistique** — Conjugueur, synonymes, plan de dissertation, aide rédaction\n• **/maths-sciences** — Calculatrice, formules, tableau périodique, convertisseur\n\n**🏆 Progression & Motivation**\n• **/tableau-de-bord** — XP, badges, défis quotidiens, streaks\n• **/motivation** — Citations, quêtes, classement communautaire\n\n**👥 Communauté & Actualités**\n• **/communaute** — Forum et échanges entre élèves (collège et +)\n• **/visio** — Classe virtuelle (collège et +)\n• **/actualites** — Actualités éducatives\n\n**🌟 Espaces personnalisés**\n• **/espace** → puis /espace/primaire, /espace/college, /espace/lycee, /espace/superieur\n• **/inclusion** — Espace ULIS, SEGPA & DYS (modes adaptés + guide MDPH/PPS/PAP)\n\n**Le tout 100% GRATUIT, sans pub, du CP au Bac+5 !** 🎉\nQuel outil t'intéresse le plus ? Je peux t'expliquer comment l'utiliser 😊` },
  {
    patterns: [/qu.*est.*ce.*qu.*apprenix|c.*est.*quoi.*apprenix|présente.*apprenix|apprenix.*c.*est|apprenix.*kes.*ke|c.*quoi|keski|keskeske/i],
    response: () => `Apprenix, c'est LA plateforme éducative gratuite que j'aurais voulu avoir ! 🎓\n\n**En résumé :**\n✨ **100% gratuit** — sans abonnement, sans pub, pour toujours\n🛠️ **13 outils** — aide aux devoirs, flashcards, scanner OCR, ressources, linguistique, maths, organisation, notes, dashboard, motivation, communauté\n🎯 **Tous niveaux** — du CP au Bac+5\n👤 **Créé par Charly Soudan** (24 ans, Tremblay-en-France)\n🔒 **100% sécurisé** — RGPD, zéro tracking, conformité Éduscol\n\n**La grande différence avec Quizlet, Brainly, etc. :**\nApprenix est le seul à être totalement gratuit ET sans pub ET conforme au programme officiel !\n\nTu veux que je te présente un outil en particulier ? 😊` },
  {
    patterns: [/comment.*ça.*marche|comment.*utiliser|aide.*moi.*utiliser|guide|tutoriel/i],
    response: () => `Bienvenue sur Apprenix ! Laisse-moi te guider 🗺️\n\n**Par où commencer ?**\n\n1️⃣ **Pas de compte nécessaire** — utilise tout en mode visiteur d'abord\n2️⃣ **Choisis ton niveau** — dans la sidebar gauche (ou le menu ≡ sur mobile)\n3️⃣ **Explore les outils** selon ton besoin :\n   • Devoir difficile → /aide-ia\n   • Mémoriser un cours → /flashcards\n   • S'organiser → /organisation\n   • Chercher une fiche → /ressources\n\n4️⃣ **Crée un compte** pour sauvegarder ta progression\n\nTu es élève, parent ou enseignant ? Je peux adapter mes conseils ! 😊` },
  {
    patterns: [/merci|super|excellent|génial|parfait|bravo|trop.*bien|cool/i],
    response: () => {
      const reactions = [
        'Avec plaisir ! 😊 C\'est pour ça que je suis là ! N\'hésite pas si tu as d\'autres questions 🎓',
        'Héhé, ravie d\'avoir pu t\'aider ! 🌟 Continue comme ça, tu es sur la bonne voie !',
        'Merci à toi ! 💪 Tu travailles bien — ça se voit ! Des questions sur d\'autres sujets ?',
        '😄 C\'est toi qui es super d\'utiliser Apprenix pour progresser ! Tu veux qu\'on continue ?',
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    } },
  {
    patterns: [/fatigué|épuisé|plus.*courage|j\'en.*peux.*plus|abandonn|envie.*rien/i],
    response: () => `Hey, je t'entends ! 💛 C'est normal de se sentir épuisé(e) parfois — les études c'est un marathon, pas un sprint.\n\nVoici mon conseil immédiat :\n\n🛑 **STOP** — pose tout pendant 15 minutes\n🚶 **Marche** un peu, prends l'air, bois de l'eau\n🍅 **Pomodoro** ensuite — 25 min seulement, c'est tout\n\nRappelle-toi : chaque fois que tu te mets au travail malgré la fatigue, tu construis une force mentale incroyable. Et Apprenix est là pour rendre ça plus facile ! 💪\n\nQu'est-ce qui te pèse le plus en ce moment ? Dis-moi, on va trouver une solution ensemble 🤝` },
  {
    patterns: [/ulis|segpa|dys\b|dyslexie|dyscalculie|dyspraxie|dysphasie|mdph|pps\b|pap\b|adaptation.*scolaire|scolaire.*adaptat|besoins.*particulier|handicap.*scolaire|inclusion.*scolaire/i],
    response: () => `L'**Espace Inclusion** d'Apprenix (/inclusion) est fait pour toi ! 💚\n\nApprenix accompagne les élèves **ULIS, SEGPA, DYS, TDAH et TSA** avec :\n\n🧠 **Mode adapté dans l'aide aux devoirs** (/aide-ia) :\n• Phrases courtes et simples\n• Étapes numérotées une par une\n• Zéro jargon scolaire\n• Exemples du quotidien\n\n📋 **Guides de droits scolaires** :\n• MDPH (Maison Départementale des Personnes Handicapées)\n• PPS — Projet Personnalisé de Scolarisation\n• PAP — Plan d'Accompagnement Personnalisé\n\n🔤 **Accessibilité maximale** (panneau dans la sidebar) :\n• Police OpenDyslexic pour la dyslexie sévère\n• Police Atkinson Hyperlegible pour la dyslexie légère\n• Mode focus TDAH (zéro animation, zéro distraction)\n• Lecture simplifiée TSA/Autisme\n• Espacement large, grand texte\n\n💻 **Liste des logiciels adaptés** recommandés\n\nTu as un besoin spécifique ? Dis-moi ton type de difficulté et je t'oriente vers les bons réglages ! 😊` },
  {
    patterns: [/sidebar|barre.*latérale|menu.*gauche|navigation.*site|liens.*nav|où.*trouv|je.*vois.*pas|je.*trouve.*pas.*menu|menu.*disparait|pas.*access|plus.*accès.*menu/i],
    response: () => `Laisse-moi t'aider à naviguer sur Apprenix ! 🗺️\n\n**Sur PC/tablette :**\nLa barre latérale est toujours visible à gauche. Elle s'adapte selon ton profil :\n• **Visiteur** → tu vois tous les espaces (parents, enseignants, etc.)\n• **Élève connecté** → tu vois uniquement TES outils et TES sections ("Mes outils", "Mes matières", "Mon parcours", "Communauté") + ta carte identité en haut\n\n**Sur mobile :**\nTouche le bouton ≡ (hamburger) en haut à gauche pour ouvrir le menu. Tu peux aussi **swiper depuis le bord gauche** de l'écran pour l'ouvrir.\n\n**Dans "Accès rapides" (pour tous) :**\n• 👩‍🏫 Assistant Apprenix (Léa)\n• ♿ Accessibilité\n• 🔒 Mode parental (si connecté)\n\n**Pied du menu :**\n• Connecté → bouton "Se déconnecter"\n• Visiteur → boutons "Se connecter" et "Créer un compte"\n\nTu cherches une page en particulier ? Dis-moi et je te donne le chemin direct ! 😊` },
];

// ─── Moteur de réponse locale ──────────────────────────────────────────────────
function getLocalResponse(input: string): string | null {
  const lower = input.toLowerCase();
  for (const entry of LOCAL_KNOWLEDGE) {
    if (entry.patterns.some(p => p.test(lower))) {
      return entry.response();
    }
  }
  return null;
}

// ─── Message de bienvenue ─────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  const time = h >= 6 && h < 12 ? 'matin' : h >= 12 && h < 18 ? 'après-midi' : h >= 18 && h < 23 ? 'soir' : 'nuit';
  const emoji = h >= 6 && h < 12 ? '☀️' : h >= 12 && h < 18 ? '😊' : h >= 18 && h < 23 ? '🌙' : '⭐';
  return `${emoji} Bonjour et bon ${time} ! Je suis **Léa**, votre assistante Apprenix !\n\nJe suis ici pour vous aider avec :\n🎓 Vos **devoirs** et questions scolaires\n📚 La **navigation** sur Apprenix et ses outils\n💡 Des **conseils** pour mieux travailler et réviser\n😄 Un peu de **bonne humeur** et de motivation !\n\nJe m'adapte à tout le monde — élève, parent, enseignant, ou simple visiteur. Alors, comment puis-je vous aider aujourd'hui ?`;
}

function makeWelcomeMessage(): Message {
  return { id: 'welcome', role: 'bot', content: getGreeting(), timestamp: new Date(), emoji: '👩‍🏫' };
}

// ─── Détection d'audience ──────────────────────────────────────────────────────
function detectAudience(messages: Message[]): Audience {
  const text = messages.map(m => m.content).join(' ').toLowerCase();
  if (/parent|maman|papa|enfant|fils|fille|mon enfant/.test(text)) return 'parent';
  if (/professeur|enseignant|classe|mes élèves|collègue/.test(text)) return 'enseignant';
  if (/devoir|cours|bac|brevet|classe|lycée|collège|école|prof|révision/.test(text)) return 'eleve';
  return 'visiteur';
}

// ─── Suggestions rapides par catégorie ───────────────────────────────────────
const SUGGESTION_CATEGORIES = [
  {
    label: 'Site',
    icon: BookOpen,
    suggestions: [
      'Comment fonctionne Apprenix ?',
      'Apprenix est-il vraiment gratuit ?',
      'Comment créer un compte ?',
      'Quels outils sont disponibles ?',
    ] },
  {
    label: 'Études',
    icon: GraduationCap,
    suggestions: [
      'Comment bien réviser pour le Bac ?',
      'Explique-moi la technique Pomodoro',
      'Comment créer des flashcards efficaces ?',
      'Des conseils pour apprendre les maths ?',
    ] },
  {
    label: 'Blague',
    icon: Smile,
    suggestions: [
      'Raconte-moi une blague scolaire !',
      'Dis-moi quelque chose de drôle',
    ] },
  {
    label: 'Parents',
    icon: Users,
    suggestions: [
      'Apprenix est-il sécurisé pour mon enfant ?',
      'Comment suivre la progression de mon enfant ?',
    ] },
  {
    label: 'Réconfort',
    icon: Heart,
    suggestions: [
      'Je suis stressé(e) par les examens',
      "J'ai plus de courage pour travailler",
      'Comment gérer le stress scolaire ?',
    ] },
];
function loadMemory(): Message[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (Omit<Message, 'timestamp'> & { timestamp: string })[];
    return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

function saveMemory(messages: Message[]) {
  try {
    const capped = messages.slice(-MAX_MEMORY);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(capped));
  } catch { /* quota dépassé */ }
}

// ─── Rendu du contenu avec mini-markdown ─────────────────────────────────────
function renderContent(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    // Ligne bold **texte**
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = boldParts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} className="font-semibold text-foreground">{part}</strong>
        : <span key={j} className="contents">{part}</span>
    );
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    return <p key={i} className="leading-relaxed">{rendered}</p>;
  });
}

// ─── Indicateur de frappe ─────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5 px-3 py-2.5">
    <span className="text-sm text-muted-foreground italic mr-1">Léa écrit</span>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
        style={{ animationDelay: `${i * 0.18}s` }}
      />
    ))}
  </div>
);

// ─── Bulle de message ─────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center mt-0.5 shadow-sm">
          <span className="text-sm">👩‍🏫</span>
        </div>
      )}
      <div className={cn('flex flex-col max-w-[82%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed space-y-0.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm',
        )}>
          {isUser
            ? msg.content
            : renderContent(msg.content)
          }
          {msg.streaming && (
            <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <span className="text-sm text-muted-foreground mt-1 px-1">
          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [isHidden, setIsHidden] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(HIDDEN_KEY) === '1'
  );
  const [messages, setMessages] = useState<Message[]>(() => {
    const mem = loadMemory();
    return mem.length > 0 ? mem : [makeWelcomeMessage()];
  });
  const [input, setInput]               = useState('');
  const [isStreaming, setIsStreaming]    = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeCat, setActiveCat]       = useState(0);
  const [_unreadCount, setUnreadCount]   = useState(0);

  const [isExpanded, setIsExpanded]     = useState(false); // desktop full-height mode

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mémorisation persistante
  useEffect(() => {
    if (messages.length > 1) saveMemory(messages);
  }, [messages]);

  // Scroll vers le bas à chaque message — utilise scrollTop sur le viewport
  // pour rester confiné au ChatBot (évite le scrollIntoView qui peut "fuir"
  // vers le document principal sur Samsung Internet / Android WebView).
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    } else {
      // Fallback si ScrollArea absent
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Focus à l'ouverture
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 150);
  }, [isOpen]);

  // Compteur de messages non lus
  useEffect(() => {
    if (!isOpen) {
      const lastBot = [...messages].reverse().find(m => m.role === 'bot' && m.id !== 'welcome');
      if (lastBot) setUnreadCount(prev => prev + 0); // reset handled on open
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Écoute réactivation depuis la sidebar / partout
  useEffect(() => {
    const handler = () => {
      setIsHidden(false);
      setIsOpen(true);
      localStorage.removeItem(HIDDEN_KEY);
      window.dispatchEvent(new CustomEvent('apprenix:chatbot-opened'));
    };
    window.addEventListener('apprenix:chatbot-show', handler);
    return () => window.removeEventListener('apprenix:chatbot-show', handler);
  }, []);

  // Fermeture propre du chat (sans masquer définitivement) — depuis la navigation
  useEffect(() => {
    const handler = () => setIsOpen(false);
    window.addEventListener('apprenix:chatbot-close', handler);
    return () => window.removeEventListener('apprenix:chatbot-close', handler);
  }, []);

  // Écoute ouverture mood / a11y supprimée — gérée dans MainLayout (toujours monté)

  const hide = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
    setIsHidden(true);
    localStorage.setItem(HIDDEN_KEY, '1');
    window.dispatchEvent(new CustomEvent('apprenix:chatbot-hide'));
  }, []);

  // Historique pour l'API (limité pour éviter dépassement token)
  const buildApiHistory = useCallback(() => {
    const history = messages
      .filter(m => m.id !== 'welcome' && !m.streaming)
      .slice(-MAX_API_HISTORY);
    return history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }] }));
  }, [messages]);

  const addBotMessage = useCallback((id: string, content: string, streaming = false) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, content, streaming } : m
    ));
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isStreaming) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date() };
    const botMsgId = `b-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      role: 'bot',
      content: '',
      timestamp: new Date(),
      streaming: true };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setIsStreaming(true);
    if (!isOpen) setUnreadCount(prev => prev + 1);

    // 1. Tentative locale (réponse instantanée)
    const localResp = getLocalResponse(userText);

    // 2. Tentative API — système prompt Léa injecté
    const hasApiConfig = SUPABASE_URL && SUPABASE_ANON_KEY &&
      SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined';

    if (hasApiConfig) {
      abortRef.current = new AbortController();
      const systemTurn = {
        role: 'user' as const,
        parts: [{ text: `[INSTRUCTION SYSTÈME — ne pas afficher à l'utilisateur]\n${LEA_SYSTEM_PROMPT}` }] };
      const systemAck = {
        role: 'model' as const,
        parts: [{ text: "Compris ! Je suis Léa, l'assistante pédagogique d'Apprenix. Je suis prête à aider avec enthousiasme et bienveillance !" }] };
      const apiHistory = buildApiHistory();
      const contents = [
        systemTurn,
        systemAck,
        ...apiHistory,
        { role: 'user' as const, parts: [{ text: userText }] },
      ];

      let apiResponded = false;

      const timer = setTimeout(() => {
        // Si l'API tarde > 5s et qu'on a une réponse locale, l'utiliser
        if (!apiResponded && localResp) {
          addBotMessage(botMsgId, localResp, false);
          setIsStreaming(false);
          abortRef.current?.abort();
        } else if (!apiResponded) {
          // Aucun fallback local — message d'attente sans "erreur connexion"
          addBotMessage(botMsgId, '⏳ Ma réponse prend un peu plus de temps que prévu… Pose-moi ta question autrement ou réessaie dans quelques secondes — je suis là ! 😊', false);
          setIsStreaming(false);
          abortRef.current?.abort();
        }
      }, 5000);

      await sendStreamRequest({
        functionUrl: FUNCTION_URL,
        requestBody: { contents },
        supabaseAnonKey: SUPABASE_ANON_KEY,
        onData: (chunk) => {
          clearTimeout(timer);
          apiResponded = true;
          try {
            const t = JSON.parse(chunk)?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (t) setMessages(prev =>
              prev.map(m => m.id === botMsgId ? { ...m, content: m.content + t } : m)
            );
          } catch { /* chunk incomplet */ }
        },
        onComplete: () => {
          clearTimeout(timer);
          apiResponded = true;
          setMessages(prev =>
            prev.map(m => m.id === botMsgId ? { ...m, streaming: false } : m)
          );
          setIsStreaming(false);
        },
        onError: () => {
          clearTimeout(timer);
          // Fallback local si l'API échoue — jamais de message d'erreur brut
          const fallback = localResp ?? generateFallback(userText, messages);
          addBotMessage(botMsgId, fallback, false);
          setIsStreaming(false);
        },
        signal: abortRef.current.signal });
    } else {
      // Pas de config API — réponse locale uniquement
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400)); // délai naturel
      const resp = localResp ?? generateFallback(userText, messages);
      addBotMessage(botMsgId, resp, false);
      setIsStreaming(false);
    }
  }, [input, isStreaming, buildApiHistory, addBotMessage, messages, isOpen]);

  const handleReset = () => {
    abortRef.current?.abort();
    const welcome = makeWelcomeMessage();
    setMessages([welcome]);
    saveMemory([welcome]);
    setInput('');
    setIsStreaming(false);
    setShowSuggestions(true);
    setUnreadCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Fermeture Escape pour le chat uniquement (mood/a11y gérés dans MainLayout)
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('apprenix:chatbot-close'));
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isOpen]);

  const audience = detectAudience(messages);
  const memoryCount = messages.filter(m => m.id !== 'welcome').length;

  if (isHidden) return null;
  // Séparation stricte : chat fermé → rien dans le DOM (modals gérés par MainLayout)
  if (!isOpen) return null;

  // Chat toujours en plein écran sur tous les appareils (mobile, tablette, desktop)
  const chatWindowCls = cn(
    'fixed inset-0 z-[200] flex flex-col',
    'bg-background',
    'transition-[opacity,transform] duration-300 ease-in-out',
    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  );

  return (
    <>
      {/* ── Fenêtre de chat plein écran ─────────────────────────────────── */}
      <div
        className={chatWindowCls}
        role="dialog"
        aria-label="Chat avec Léa — Assistant Apprenix"
        aria-modal="true"
        style={{
          touchAction: 'pan-y',
          overscrollBehavior: 'none' }}
      >

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary to-chart-1 text-primary-foreground shrink-0">
          <button type="button"
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('apprenix:chatbot-close'));
            }}
            aria-label="Retour — fermer le chat"
            className="min-w-[44px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar animé */}
          <div className="shrink-0 w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg shadow-inner">
            👩‍🏫
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm">Léa — Assistante Apprenix</p>
              <span className="flex items-center gap-1 text-xs bg-primary-foreground/20 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                En ligne
              </span>
            </div>
            <p className="text-xs text-white/90 truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.20)]">
              {audience === 'eleve' && '🎓 Mode élève — ton guide scolaire Apprenix'}
              {audience === 'parent' && '👨‍👩‍👧 Mode parents — tout pour votre enfant'}
              {audience === 'enseignant' && '👩‍🏫 Mode enseignant — ressources & pédagogie'}
              {audience === 'visiteur' && '✨ Posez vos questions — je suis là !'}
            </p>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Agrandir/Réduire — desktop only */}
            <button type="button"
              onClick={() => setIsExpanded(v => !v)}
              title={isExpanded ? 'Réduire' : 'Agrandir'}
              aria-label={isExpanded ? 'Réduire la fenêtre' : 'Agrandir la fenêtre'}
              className="hidden md:flex min-w-[44px] min-h-[48px] items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
            </button>
            <button type="button"
              onClick={handleReset}
              title="Nouvelle conversation"
              aria-label="Nouvelle conversation"
              className="min-w-[44px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button type="button"
              onClick={hide}
              title="Masquer l'assistant"
              aria-label="Masquer l'assistant"
              className="min-w-[44px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
            <button type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('apprenix:chatbot-close'));
              }}
              title="Fermer"
              aria-label="Fermer le chat"
              className="min-w-[44px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barre mémoire */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-muted/50 border-b border-border/50">
          <Brain className="w-3 h-3 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground flex-1 min-w-0 truncate">
            Léa se souvient de {Math.min(memoryCount, MAX_MEMORY)} message{memoryCount !== 1 ? 's' : ''} de cette conversation
          </p>
          <Sparkles className="w-3 h-3 text-primary shrink-0" />
        </div>

        {/* Zone messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
          <div className="px-4 py-3">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-2 mb-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center text-sm">
                  👩‍🏫
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* Suggestions rapides par catégories */}
            {showSuggestions && messages.length <= 1 && (
              <div className="mt-4 space-y-2">
                {/* Onglets catégories */}
                <div className="flex gap-1.5 flex-wrap">
                  {SUGGESTION_CATEGORIES.map((cat, idx) => (
                    <button type="button"
                      key={cat.label}
                      onClick={() => setActiveCat(idx)}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors font-medium',
                        activeCat === idx
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:bg-muted'
                      )}
                    >
                      <cat.icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  ))}
                </div>
                {/* Suggestions de la catégorie active */}
                <div className="flex flex-col gap-1.5">
                  {SUGGESTION_CATEGORIES[activeCat].suggestions.map((s) => (
                    <button type="button"
                      key={s}
                      onClick={() => handleSend(s)}
                      disabled={isStreaming}
                      className="text-xs px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Zone saisie */}
        <div className="shrink-0 border-t border-border px-3 py-3 space-y-2 bg-background">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Parlez à Léa… (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)"
              disabled={isStreaming}
              rows={1}
              aria-label="Saisir votre message"
              maxLength={2000}
              className="resize-none flex-1 min-h-[48px] max-h-[140px] text-sm border-border focus-visible:ring-primary disabled:opacity-60 leading-relaxed"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              aria-label="Envoyer le message"
              className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Léa se souvient de votre conversation · RGPD — données locales uniquement
          </p>
        </div>
      </div>

    </>
  );
};

export default ChatBot;

// ─── Génération fallback intelligente ────────────────────────────────────────
function generateFallback(userText: string, messages: Message[]): string {
  const lower = userText.toLowerCase();
  const audience = detectAudience(messages);

  // Questions sur les outils / fonctionnalités (sécurité en cas de non-match local)
  if (/outil|disponible|fonctionnalit|faire.*apprenix|apprenix.*faire|qu.*y.*a/.test(lower)) {
    return `Voici les principaux outils Apprenix disponibles gratuitement 🛠️\n\n🤖 **IA & Analyse** : /aide-ia (devoirs, 11 matières) · /scanner (OCR)\n📚 **Mémorisation** : /flashcards (répétition espacée) · /ressources (fiches Éduscol)\n🗓️ **Organisation** : /organisation (agenda + Pomodoro) · /notes · /focus\n📖 **Matières** : /linguistique (conjugueur, dissertation) · /maths-sciences (calculatrice, formules)\n🏆 **Progression** : /motivation (XP, badges) · /motivation\n\nTout est gratuit, sans pub, du CP au Bac+5 ! Tu veux en savoir plus sur un outil ? 😊`;
  }

  if (/\?/.test(userText) && /comment|pourquoi|qu.*est|que.*faut|quoi|quel/.test(lower)) {
    if (audience === 'eleve') {
      return `Bonne question ! 🤔 Dis-moi en un mot ce que tu cherches — je connais tout Apprenix et le programme scolaire. Tu peux aussi aller directement sur **/aide-ia** pour toute question sur tes devoirs ! 😊`;
    }
    return `Bonne question ! 🎓 Précise un peu ta demande et je t'aide au mieux — Apprenix couvre tous les niveaux du CP au Bac+5 !`;
  }

  const fallbacks = [
    `Hmm, dis-moi en plus ! 🤔 Je connais tout Apprenix — ses outils, ses pages, le programme scolaire. Pose ta question et je réponds directement ! 💪`,
    `Je t'entends ! 😊 Tu cherches de l'aide pour tes devoirs, des informations sur un outil, ou autre chose ? Dis-moi et j'y réponds tout de suite !`,
    `Je suis là ! 🎉 Que ce soit pour comprendre Apprenix, obtenir de l'aide scolaire ou autre — balance ta question, je suis à 3000% 🏫`,
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
