# 需求文档

## 1. 应用概述

### 1.1 应用名称
Apprenix v3.2 - Refonte complète de l'espace enseignant + Fonctionnalité « Trouver un professeur »

### 1.2 描述
Refonte complète du profil et de l'espace enseignant sur la plateforme éducative gratuite Apprenix (CP à Bac+5, sans publicité, sans abonnement). Cette extension v3.2 remplace entièrement l'espace enseignant existant par un système complet comprenant : profil enseignant détaillé, tableau de bord réorganisé avec 8 sections fonctionnelles, navigation dédiée (Navbar/Sidebar séparée de l'espace étudiant), outils pédagogiques intégrés.

Cette version ajoute également une fonctionnalité complète « Trouver un professeur » dans l'espace étudiant, permettant aux étudiants de rechercher des professeurs, d'envoyer des demandes d'accompagnement, et de collaborer dans un espace de travail partagé après acceptation.

### 1.3 Contexte existant
La plateforme dispose actuellement de :
- Authentification via Supabase
- Espace étudiant avec outils (aide aux devoirs, scanner, flashcards, notes, quiz)
- Page parent (localStorage)
- Page enseignant (vitrine uniquement)
- Tableau de bord gamification
- 43 pages organisées par profil utilisateur
- Modules v3.1 existants : Questions & Soumissions (/mes-questions, /mes-depots), Back-office enseignant (/espace-enseignant/), Espace admin (/administration/), Espace parent amélioré (/parents-espace), Panneau d'accessibilité personnel (/accessibilite-perso)
- Architecture de navigation v3.1 : 5 groupes (Outils, Base de réponses, Espaces, Ressources, À propos)
- Base de données Supabase avec tables `profiles` (étudiants) et `teacher_extra` (données enseignants)

### 1.4 Périmètre de cette extension
- Remplacement complet de l'espace enseignant existant
- Création d'une page profil enseignant dédiée (/espace-enseignant/profil)
- Refonte du tableau de bord enseignant avec 8 sections fonctionnelles
- Création d'une navigation dédiée (Navbar/Sidebar) séparée de MainLayout
- Intégration d'outils pédagogiques pour les enseignants
- Gestion des données via AppContext (localStorage + Supabase)
- **Nouvelle fonctionnalité « Trouver un professeur » dans l'espace étudiant**
- **Système de demande/acceptation d'accompagnement**
- **Espace de travail collaboratif étudiant-professeur**
- **Gestion des demandes et collaborations dans l'espace enseignant**

## 2. Utilisateurs et scénarios d'usage

### 2.1 Utilisateurs cibles
- Enseignants et professeurs (du primaire au supérieur)
- Enseignants vérifiés (badge ✅) et non vérifiés
- **Étudiants recherchant un accompagnement personnalisé**

### 2.2 Scénarios principaux

#### Scénarios enseignant (existants)
- Enseignant accède à son profil pour consulter ses statistiques et mettre à jour ses informations
- Enseignant consulte le tableau de bord pour voir les questions en attente et les copies à corriger
- Enseignant répond à une question d'élève directement depuis la section Questions des élèves
- Enseignant corrige une copie soumise et attribue une note avec commentaires
- Enseignant crée un nouveau contenu pédagogique (cours, fiche, exercice) et le publie
- Enseignant consulte son agenda pour voir les cours et événements à venir
- Enseignant échange avec un élève via la messagerie intégrée
- Enseignant utilise le générateur de quiz pour créer un exercice
- Enseignant accède à sa bibliothèque de ressources personnelles
- Enseignant navigue entre les sections via la sidebar dédiée
- Enseignant sur mobile utilise le menu hamburger pour accéder aux sections

#### Nouveaux scénarios « Trouver un professeur »
- **Étudiant accède à la page « Trouver un professeur » depuis le menu de navigation**
- **Étudiant recherche un professeur par matière, niveau ou disponibilité**
- **Étudiant consulte le profil d'un professeur (avatar, nom, matières, niveaux, institution, bio, disponibilité)**
- **Étudiant envoie une demande d'accompagnement à un professeur avec un message optionnel**
- **Étudiant consulte le statut de ses demandes (En attente / Accepté / Refusé)**
- **Professeur consulte les demandes d'accompagnement en attente dans son espace**
- **Professeur accepte ou refuse une demande d'accompagnement**
- **Étudiant et professeur accèdent à l'espace de travail collaboratif après acceptation**
- **Étudiant et professeur échangent via la messagerie directe dans l'espace de travail**
- **Étudiant et professeur partagent des fichiers/liens dans l'espace de travail**
- **Professeur définit des objectifs dans le tableau de suivi, étudiant coche la progression**
- **Professeur active/désactive sa visibilité dans l'annuaire**
- **Professeur configure ses coordonnées de contact optionnelles (téléphone, email)**
- **Professeur définit le nombre maximum d'étudiants simultanés**
- **Professeur retire un étudiant de ses collaborations**
- **Étudiant annule une demande en attente ou quitte une collaboration**

## 3. Structure des pages et fonctionnalités

### 3.1 Architecture de l'espace enseignant

```
/espace-enseignant/
├── /profil (Page profil enseignant)
├── /dashboard (Tableau de bord — vue d'ensemble)
├── /questions (Section Questions des élèves)
├── /corrections (Section Corrections / Copies)
├── /contenus (Section Mes contenus)
│   ├── /nouveau (Créer un contenu)
│   └── /[id]/modifier (Modifier un contenu)
├── /agenda (Section Agenda / Planning)
├── /messagerie (Section Messagerie élèves)
├── /ressources (Section Ressources personnelles)
├── /parametres (Section Paramètres du compte)
├── /demandes (Section Demandes d'accompagnement) [NOUVEAU]
└── /collaborations (Section Mes collaborations) [NOUVEAU]
```

### 3.2 Architecture de l'espace étudiant (ajout)

```
/espace-etudiant/
├── ... (pages existantes)
├── /trouver-professeur (Page Trouver un professeur) [NOUVEAU]
├── /mes-demandes (Page Mes demandes d'accompagnement) [NOUVEAU]
└── /mes-collaborations (Page Mes collaborations) [NOUVEAU]
    └── /[id] (Espace de travail collaboratif avec un professeur) [NOUVEAU]
```

### 3.3 Page profil enseignant (/espace-enseignant/profil)

#### 3.3.1 Informations affichées
- Photo de profil / avatar (upload possible)
- Nom complet
- Matière(s) enseignée(s) (liste)
- Établissement
- Niveau(x) enseignés (Primaire / Collège / Lycée / Supérieur)
- Biographie courte / présentation (texte libre, max 500 caractères)
- Badge Enseignant vérifié ✅ (si verified: true dans les données utilisateur)
- **Disponibilité actuelle (badge : Disponible / Occupé / En pause)** [NOUVEAU]
- **Visibilité dans l'annuaire (Activé / Désactivé)** [NOUVEAU]
- **Coordonnées de contact optionnelles (téléphone, email)** [NOUVEAU]
- **Mode de contact préféré (Téléphone / Email / Messagerie in-app uniquement)** [NOUVEAU]
- **Nombre maximum d'étudiants simultanés** [NOUVEAU]

#### 3.3.2 Statistiques du profil
- Nombre de questions répondues
- Nombre de contenus publiés
- Nombre d'étudiants aidés
- **Nombre de collaborations actives** [NOUVEAU]

#### 3.3.3 Outils rapides depuis le profil
- Bouton Répondre à une question → /espace-enseignant/questions
- Bouton Créer un contenu → /espace-enseignant/contenus/nouveau
- Bouton Voir mon agenda → /espace-enseignant/agenda
- **Bouton Voir mes demandes → /espace-enseignant/demandes** [NOUVEAU]
- **Bouton Voir mes collaborations → /espace-enseignant/collaborations** [NOUVEAU]

#### 3.3.4 Modification du profil
- Bouton Modifier le profil (ouvre formulaire d'édition)
- Champs modifiables : photo, nom, matières, établissement, niveaux, biographie, **disponibilité, visibilité annuaire, coordonnées contact, mode contact préféré, nombre max étudiants** [NOUVEAU]
- Bouton Enregistrer les modifications (sauvegarde dans AppContext + Supabase)

### 3.4 Tableau de bord enseignant (/espace-enseignant/dashboard)

#### 3.4.1 Vue d'ensemble
- Cartes de statistiques clés :
  - Questions en attente (nombre)
  - Copies à corriger (nombre)
  - Contenus publiés (nombre)
  - Étudiants aidés cette semaine (nombre)
  - **Demandes d'accompagnement en attente (nombre)** [NOUVEAU]
  - **Collaborations actives (nombre)** [NOUVEAU]

#### 3.4.2 Accès rapide aux sections
- Liste de liens vers les **10 sections principales** (8 existantes + 2 nouvelles)
- Chaque lien affiche un aperçu du nombre d'éléments en attente

### 3.5 Section Questions des élèves (/espace-enseignant/questions)

#### 3.5.1 Liste des questions
- Affichage de toutes les questions posées par les élèves
- Filtres : Toutes / En attente / Résolues / Par matière
- Tri : Plus récentes / Plus anciennes / Plus urgentes

#### 3.5.2 Détail d'une question
- Titre de la question
- Contenu de la question
- Matière concernée
- Niveau de l'élève
- Date de soumission
- Statut : En attente / Résolue

#### 3.5.3 Répondre à une question
- Champ de texte pour rédiger la réponse
- Bouton Publier la réponse
- Bouton Marquer comme résolue
- La réponse est enregistrée et visible par l'élève

### 3.6 Section Corrections / Copies (/espace-enseignant/corrections)

#### 3.6.1 Liste des soumissions
- Affichage de toutes les copies soumises par les élèves
- Filtres : Toutes / À corriger / Corrigées / Par matière
- Tri : Plus récentes / Plus anciennes / Par élève

#### 3.6.2 Détail d'une soumission
- Nom de l'élève
- Titre du devoir
- Fichier soumis (lien de téléchargement)
- Date de soumission
- Statut : À corriger / Corrigée

#### 3.6.3 Corriger une copie
- Champ de notation (note sur 20)
- Champ de commentaires / retours (texte libre)
- Bouton Enregistrer la correction
- La correction est enregistrée et visible par l'élève

### 3.7 Section Mes contenus (/espace-enseignant/contenus)

#### 3.7.1 Liste des contenus
- Affichage de tous les contenus créés par l'enseignant
- Types de contenus : Cours / Fiche / Exercice
- Filtres : Tous / Cours / Fiches / Exercices / Par matière
- Tri : Plus récents / Plus anciens / Par titre

#### 3.7.2 Actions sur un contenu
- Bouton Voir (affiche le contenu)
- Bouton Modifier (ouvre /espace-enseignant/contenus/[id]/modifier)
- Bouton Supprimer (confirmation requise)

#### 3.7.3 Créer un contenu (/espace-enseignant/contenus/nouveau)
- Champ Titre
- Champ Type (Cours / Fiche / Exercice)
- Champ Matière
- Champ Niveau
- Champ Contenu (éditeur de texte riche)
- Bouton Publier le contenu
- Le contenu est enregistré et visible dans la liste

#### 3.7.4 Modifier un contenu (/espace-enseignant/contenus/[id]/modifier)
- Formulaire pré-rempli avec les données du contenu
- Champs modifiables : Titre, Type, Matière, Niveau, Contenu
- Bouton Enregistrer les modifications

### 3.8 Section Agenda / Planning (/espace-enseignant/agenda)

#### 3.8.1 Calendrier
- Vue mensuelle du calendrier
- Affichage des cours et événements

#### 3.8.2 Ajouter un événement
- Champ Titre de l'événement
- Champ Date et heure
- Champ Description
- Bouton Ajouter l'événement
- L'événement est enregistré et affiché dans le calendrier

#### 3.8.3 Modifier / Supprimer un événement
- Clic sur un événement dans le calendrier ouvre les détails
- Bouton Modifier (ouvre formulaire d'édition)
- Bouton Supprimer (confirmation requise)

### 3.9 Section Messagerie élèves (/espace-enseignant/messagerie)

#### 3.9.1 Liste des conversations
- Affichage de toutes les conversations avec les élèves
- Tri : Plus récentes / Plus anciennes
- Indicateur de messages non lus

#### 3.9.2 Détail d'une conversation
- Nom de l'élève
- Historique des messages échangés
- Champ de saisie pour envoyer un nouveau message
- Bouton Envoyer

### 3.10 Section Ressources personnelles (/espace-enseignant/ressources)

#### 3.10.1 Bibliothèque de ressources
- Affichage de tous les documents et liens enregistrés par l'enseignant
- Types de ressources : Document / Lien
- Filtres : Tous / Documents / Liens / Par matière

#### 3.10.2 Ajouter une ressource
- Champ Type (Document / Lien)
- Champ Titre
- Champ Fichier (si Document) ou URL (si Lien)
- Champ Matière
- Bouton Ajouter la ressource
- La ressource est enregistrée et affichée dans la liste

#### 3.10.3 Actions sur une ressource
- Bouton Télécharger (si Document) ou Ouvrir (si Lien)
- Bouton Supprimer (confirmation requise)

### 3.11 Section Paramètres du compte (/espace-enseignant/parametres)

#### 3.11.1 Paramètres affichés
- Informations du compte : Email, Mot de passe (masqué)
- Préférences de notification : Email / Push
- Thème de l'interface : Clair / Sombre

#### 3.11.2 Modifier les paramètres
- Bouton Modifier l'email (ouvre formulaire)
- Bouton Modifier le mot de passe (ouvre formulaire)
- Toggle pour activer/désactiver les notifications
- Toggle pour changer le thème
- Bouton Enregistrer les modifications

### 3.12 Section Demandes d'accompagnement (/espace-enseignant/demandes) [NOUVEAU]

#### 3.12.1 Liste des demandes
- Affichage de toutes les demandes d'accompagnement reçues
- Filtres : Toutes / En attente / Acceptées / Refusées
- Tri : Plus récentes / Plus anciennes

#### 3.12.2 Détail d'une demande
- Nom de l'étudiant
- Matière concernée
- Niveau de l'étudiant
- Message de l'étudiant (optionnel)
- Date de la demande
- Statut : En attente / Acceptée / Refusée

#### 3.12.3 Traiter une demande
- Bouton Accepter la demande
- Bouton Refuser la demande
- Après acceptation, création automatique d'un espace de travail collaboratif
- Notification envoyée à l'étudiant

### 3.13 Section Mes collaborations (/espace-enseignant/collaborations) [NOUVEAU]

#### 3.13.1 Liste des collaborations actives
- Affichage de toutes les collaborations en cours avec les étudiants
- Tri : Plus récentes / Plus anciennes / Par étudiant

#### 3.13.2 Accès à un espace de travail collaboratif
- Clic sur une collaboration ouvre l'espace de travail partagé
- Lien vers /espace-enseignant/collaborations/[id]

#### 3.13.3 Retirer un étudiant
- Bouton Retirer l'étudiant (confirmation requise)
- La collaboration est supprimée
- Notification envoyée à l'étudiant

### 3.14 Espace de travail collaboratif (/espace-enseignant/collaborations/[id]) [NOUVEAU]

#### 3.14.1 Informations de la collaboration
- Nom de l'étudiant
- Matière concernée
- Date de début de la collaboration

#### 3.14.2 Messagerie directe
- Historique des messages échangés entre professeur et étudiant
- Champ de saisie pour envoyer un nouveau message
- Bouton Envoyer

#### 3.14.3 Partage de fichiers/liens
- Liste des fichiers et liens partagés
- Bouton Ajouter un fichier/lien
- Champ Titre
- Champ Fichier (upload) ou URL
- Bouton Partager
- Le fichier/lien est enregistré et visible par les deux parties

#### 3.14.4 Notes partagées
- Zone de texte libre pour prendre des notes
- Édition en temps réel visible par les deux parties
- Bouton Enregistrer les notes

#### 3.14.5 Tableau de suivi
- Liste des objectifs définis par le professeur
- Bouton Ajouter un objectif (professeur uniquement)
- Champ Titre de l'objectif
- Champ Description
- Bouton Enregistrer l'objectif
- Chaque objectif affiche une case à cocher pour la progression (étudiant uniquement)
- L'étudiant coche la case lorsque l'objectif est atteint
- Le professeur voit la progression en temps réel

### 3.15 Page Trouver un professeur (/espace-etudiant/trouver-professeur) [NOUVEAU]

#### 3.15.1 Liste des professeurs
- Affichage de tous les professeurs visibles dans l'annuaire
- Filtres : Par matière / Par niveau scolaire / Par disponibilité
- Tri : Plus récents / Plus anciens / Par nom

#### 3.15.2 Fiche de profil professeur
- Avatar emoji
- Nom complet
- Matière(s) enseignée(s)
- Niveau(x) enseignés
- Institution
- Biographie courte
- Badge Enseignant vérifié (si applicable)
- Badge de disponibilité (Disponible / Occupé / En pause)
- **Les coordonnées (téléphone, email) ne sont PAS affichées à ce stade**

#### 3.15.3 Demander un accompagnement
- Bouton Demander un accompagnement
- Formulaire de demande :
  - Champ Matière concernée (pré-rempli si filtré)
  - Champ Message optionnel (texte libre, max 500 caractères)
  - Bouton Envoyer la demande
- La demande est enregistrée avec statut « En attente »
- Notification envoyée au professeur

### 3.16 Page Mes demandes d'accompagnement (/espace-etudiant/mes-demandes) [NOUVEAU]

#### 3.16.1 Liste des demandes
- Affichage de toutes les demandes envoyées par l'étudiant
- Filtres : Toutes / En attente / Acceptées / Refusées
- Tri : Plus récentes / Plus anciennes

#### 3.16.2 Détail d'une demande
- Nom du professeur
- Matière concernée
- Message envoyé
- Date de la demande
- Statut : En attente / Acceptée / Refusée

#### 3.16.3 Annuler une demande en attente
- Bouton Annuler la demande (uniquement si statut « En attente »)
- Confirmation requise
- La demande est supprimée

### 3.17 Page Mes collaborations (/espace-etudiant/mes-collaborations) [NOUVEAU]

#### 3.17.1 Liste des collaborations actives
- Affichage de toutes les collaborations en cours avec les professeurs
- Tri : Plus récentes / Plus anciennes / Par professeur

#### 3.17.2 Accès à un espace de travail collaboratif
- Clic sur une collaboration ouvre l'espace de travail partagé
- Lien vers /espace-etudiant/mes-collaborations/[id]

#### 3.17.3 Quitter une collaboration
- Bouton Quitter la collaboration (confirmation requise)
- La collaboration est supprimée
- Notification envoyée au professeur

### 3.18 Espace de travail collaboratif (/espace-etudiant/mes-collaborations/[id]) [NOUVEAU]

#### 3.18.1 Informations de la collaboration
- Nom du professeur
- Matière concernée
- Date de début de la collaboration
- **Coordonnées du professeur (téléphone et/ou email) affichées UNIQUEMENT après acceptation** (selon les préférences du professeur)

#### 3.18.2 Messagerie directe
- Historique des messages échangés entre étudiant et professeur
- Champ de saisie pour envoyer un nouveau message
- Bouton Envoyer

#### 3.18.3 Partage de fichiers/liens
- Liste des fichiers et liens partagés
- Bouton Ajouter un fichier/lien
- Champ Titre
- Champ Fichier (upload) ou URL
- Bouton Partager
- Le fichier/lien est enregistré et visible par les deux parties

#### 3.18.4 Notes partagées
- Zone de texte libre pour prendre des notes
- Édition en temps réel visible par les deux parties
- Bouton Enregistrer les notes

#### 3.18.5 Tableau de suivi
- Liste des objectifs définis par le professeur
- Chaque objectif affiche une case à cocher pour la progression
- L'étudiant coche la case lorsque l'objectif est atteint
- Le professeur voit la progression en temps réel

### 3.19 Navigation dédiée enseignant (Navbar/Sidebar)

#### 3.19.1 Structure de la Sidebar (Desktop ≥1024px)

**En haut**
- Logo Apprenix + indication Espace Enseignant

**Menu principal** (liste verticale)
1. Tableau de bord → /espace-enseignant/dashboard
2. Mon profil → /espace-enseignant/profil
3. Questions des élèves → /espace-enseignant/questions
4. Corrections / Copies → /espace-enseignant/corrections
5. Mes contenus → /espace-enseignant/contenus
6. Agenda / Planning → /espace-enseignant/agenda
7. Messagerie élèves → /espace-enseignant/messagerie
8. Ressources → /espace-enseignant/ressources
9. **Demandes d'accompagnement → /espace-enseignant/demandes** [NOUVEAU]
10. **Mes collaborations → /espace-enseignant/collaborations** [NOUVEAU]
11. Paramètres → /espace-enseignant/parametres

**En bas**
- Profil rapide : Avatar + Nom de l'enseignant + lien vers /espace-enseignant/profil
- Toggle Thème clair/sombre
- Bouton Déconnexion

#### 3.19.2 Menu mobile (Tablet/Mobile <1024px)

**Hamburger menu**
- Icône hamburger en haut à gauche
- Clic ouvre Sheet drawer depuis la gauche

**Contenu du Sheet**
- Logo Apprenix + indication Espace Enseignant
- Menu principal (même liste que Sidebar desktop, incluant les 2 nouvelles sections)
- Profil rapide en bas
- Toggle Thème
- Bouton Déconnexion

**Fermeture du Sheet**
- Clic sur un lien de navigation ferme le Sheet
- Clic sur le backdrop ferme le Sheet
- Touche Escape ferme le Sheet

#### 3.19.3 Séparation avec MainLayout
- La navigation enseignant (Navbar/Sidebar) est complètement séparée de MainLayout (navigation étudiant)
- L'enseignant ne voit jamais la navigation étudiant lorsqu'il est dans /espace-enseignant/*
- Le composant de navigation enseignant est un layout dédié (EnseignantLayout)

### 3.20 Navigation de l'espace étudiant (ajout) [NOUVEAU]

- Ajout d'un lien « Trouver un professeur » dans le menu de navigation de l'espace étudiant
- Ajout d'un lien « Mes demandes » dans le menu de navigation de l'espace étudiant
- Ajout d'un lien « Mes collaborations » dans le menu de navigation de l'espace étudiant

### 3.21 Outils pédagogiques intégrés

#### 3.21.1 Générateur de quiz / exercices
- Accessible depuis /espace-enseignant/contenus/nouveau (Type: Exercice)
- Champ Titre du quiz
- Ajout de questions : Champ Question + Champ Réponse correcte + Champs Réponses incorrectes (3 max)
- Bouton Ajouter une question
- Bouton Publier le quiz
- Le quiz est enregistré et visible dans Mes contenus

#### 3.21.2 Correcteur orthographique intégré
- Disponible dans tous les champs de texte riche (Contenu, Réponse, Commentaires)
- Soulignement automatique des fautes
- Suggestions de correction au survol

#### 3.21.3 Créateur de fiches de révision
- Accessible depuis /espace-enseignant/contenus/nouveau (Type: Fiche)
- Champ Titre de la fiche
- Champ Matière
- Champ Niveau
- Champ Contenu (éditeur de texte riche)
- Bouton Publier la fiche
- La fiche est enregistrée et visible dans Mes contenus

#### 3.21.4 Import/export de documents
- Bouton Importer un document (dans /espace-enseignant/ressources)
- Formats acceptés : PDF, DOCX, PPTX
- Bouton Exporter un contenu (dans /espace-enseignant/contenus)
- Formats d'export : PDF, DOCX

#### 3.21.5 Statistiques de progression des élèves
- Accessible depuis /espace-enseignant/dashboard
- Affichage des statistiques globales : Nombre d'élèves aidés, Taux de réussite moyen, Progression par matière
- Graphiques de progression (courbes, barres)

## 4. Règles métier et logique

### 4.1 Gestion des données
- Toutes les données enseignant et étudiant sont stockées dans AppContext (localStorage + Supabase)
- Les données incluent : profil enseignant, profil étudiant, questions, soumissions, contenus, événements, messages, ressources, paramètres, **demandes d'accompagnement, collaborations, espaces de travail** [NOUVEAU]
- Synchronisation automatique avec Supabase lors de chaque modification

### 4.2 Vérification du rôle enseignant
- L'accès à /espace-enseignant/* est réservé aux utilisateurs avec le rôle teacher
- Si un utilisateur non-enseignant tente d'accéder, redirection vers /connexion ou page 403

### 4.3 Badge Enseignant vérifié
- Le badge ✅ s'affiche uniquement si verified: true dans les données utilisateur
- La vérification est gérée par l'administration (hors périmètre de cette extension)

### 4.4 Statut des questions et soumissions
- Questions : En attente (par défaut) → Résolue (après réponse de l'enseignant)
- Soumissions : À corriger (par défaut) → Corrigée (après notation et commentaires)

### 4.5 Notifications
- Lorsqu'un enseignant répond à une question, l'élève reçoit une notification (si activée dans paramètres)
- Lorsqu'un enseignant corrige une copie, l'élève reçoit une notification (si activée dans paramètres)
- **Lorsqu'un étudiant envoie une demande d'accompagnement, le professeur reçoit une notification** [NOUVEAU]
- **Lorsqu'un professeur accepte ou refuse une demande, l'étudiant reçoit une notification** [NOUVEAU]
- **Lorsqu'un professeur retire un étudiant d'une collaboration, l'étudiant reçoit une notification** [NOUVEAU]
- **Lorsqu'un étudiant quitte une collaboration, le professeur reçoit une notification** [NOUVEAU]

### 4.6 Thème clair/sombre
- Le choix du thème est enregistré dans les paramètres utilisateur
- Le thème s'applique à tout l'espace enseignant et à tout l'espace étudiant

### 4.7 Visibilité dans l'annuaire [NOUVEAU]
- Un professeur peut activer ou désactiver sa visibilité dans l'annuaire « Trouver un professeur »
- Si désactivée, le profil du professeur n'apparaît pas dans la liste des professeurs disponibles
- Par défaut, la visibilité est activée

### 4.8 Coordonnées de contact [NOUVEAU]
- Les coordonnées (téléphone, email) sont optionnelles
- Elles ne sont JAMAIS affichées dans la liste des professeurs ou sur la fiche de profil avant acceptation
- Elles sont affichées UNIQUEMENT dans l'espace de travail collaboratif après acceptation de la demande
- Le professeur choisit quelles coordonnées partager (téléphone et/ou email)
- Le professeur choisit le mode de contact préféré (Téléphone / Email / Messagerie in-app uniquement)

### 4.9 Nombre maximum d'étudiants [NOUVEAU]
- Le professeur définit le nombre maximum d'étudiants simultanés qu'il accepte
- Si le nombre maximum est atteint, le professeur ne reçoit plus de nouvelles demandes
- Le badge de disponibilité passe automatiquement à « Occupé »

### 4.10 Statut des demandes d'accompagnement [NOUVEAU]
- Demandes : En attente (par défaut) → Acceptée (après acceptation du professeur) → Refusée (après refus du professeur)
- Une demande acceptée crée automatiquement un espace de travail collaboratif
- Une demande refusée ne peut plus être modifiée

### 4.11 Gestion des collaborations [NOUVEAU]
- Une collaboration est créée automatiquement après acceptation d'une demande
- Le professeur peut retirer un étudiant d'une collaboration à tout moment
- L'étudiant peut quitter une collaboration à tout moment
- La suppression d'une collaboration supprime l'espace de travail partagé (messagerie, fichiers, notes, objectifs)

### 4.12 Espace de travail collaboratif [NOUVEAU]
- L'espace de travail est accessible par le professeur et l'étudiant
- La messagerie directe est privée entre les deux parties
- Les fichiers/liens partagés sont visibles par les deux parties
- Les notes partagées sont éditables par les deux parties
- Le tableau de suivi : seul le professeur peut ajouter des objectifs, seul l'étudiant peut cocher la progression

## 5. Situations exceptionnelles et cas limites

| Situation | Comportement attendu |
|-----------|---------------------|
| Enseignant non vérifié accède à son profil | Le badge ✅ n'est pas affiché, toutes les autres fonctionnalités sont accessibles |
| Enseignant tente de répondre à une question déjà résolue | Message d'information : La question a déjà été résolue |
| Enseignant tente de corriger une copie déjà corrigée | Affichage de la correction existante, possibilité de modifier |
| Enseignant supprime un contenu publié | Confirmation requise : Êtes-vous sûr de vouloir supprimer ce contenu ? |
| Enseignant crée un contenu sans remplir tous les champs obligatoires | Message d'erreur : Veuillez remplir tous les champs obligatoires |
| Enseignant importe un fichier de format non supporté | Message d'erreur : Format de fichier non supporté. Formats acceptés : PDF, DOCX, PPTX |
| Enseignant sur mobile navigue entre les sections | Le Sheet drawer se ferme automatiquement après chaque navigation |
| Enseignant modifie son profil et quitte la page sans enregistrer | Message de confirmation : Vous avez des modifications non enregistrées. Voulez-vous quitter ? |
| Enseignant se déconnecte depuis l'espace enseignant | Redirection vers la page d'accueil /, affichage de la navigation publique |
| Enseignant accède à une section vide (aucune question, aucune copie) | Message informatif : Aucun élément à afficher pour le moment |
| Enseignant utilise le correcteur orthographique dans un champ de texte | Soulignement automatique des fautes, suggestions au survol |
| Enseignant exporte un contenu en PDF | Génération du PDF et téléchargement automatique |
| Enseignant consulte les statistiques de progression | Affichage des graphiques avec données en temps réel |
| Enseignant ajoute un événement dans l'agenda sans date | Message d'erreur : Veuillez sélectionner une date |
| Enseignant envoie un message vide dans la messagerie | Bouton Envoyer désactivé tant que le champ est vide |
| Enseignant ajoute une ressource sans titre | Message d'erreur : Veuillez saisir un titre |
| Enseignant change le thème de l'interface | Application immédiate du nouveau thème à tout l'espace enseignant |
| Enseignant modifie son mot de passe | Formulaire de modification avec confirmation du nouveau mot de passe |
| Enseignant active les notifications par email | Enregistrement de la préférence, notifications envoyées par email |
| **Enseignant désactive sa visibilité dans l'annuaire** | **Son profil n'apparaît plus dans la liste « Trouver un professeur »** [NOUVEAU] |
| **Enseignant atteint le nombre maximum d'étudiants** | **Badge de disponibilité passe à « Occupé », aucune nouvelle demande reçue** [NOUVEAU] |
| **Enseignant accepte une demande** | **Création automatique d'un espace de travail collaboratif, notification envoyée à l'étudiant** [NOUVEAU] |
| **Enseignant refuse une demande** | **Statut de la demande passe à « Refusée », notification envoyée à l'étudiant** [NOUVEAU] |
| **Enseignant retire un étudiant d'une collaboration** | **Confirmation requise, collaboration supprimée, notification envoyée à l'étudiant** [NOUVEAU] |
| **Étudiant envoie une demande à un professeur occupé** | **Message d'information : Ce professeur n'accepte plus de nouvelles demandes pour le moment** [NOUVEAU] |
| **Étudiant envoie une demande à un professeur invisible** | **Impossible (le professeur n'apparaît pas dans la liste)** [NOUVEAU] |
| **Étudiant annule une demande en attente** | **Confirmation requise, demande supprimée** [NOUVEAU] |
| **Étudiant tente d'annuler une demande acceptée ou refusée** | **Bouton Annuler désactivé, message : Cette demande ne peut plus être annulée** [NOUVEAU] |
| **Étudiant quitte une collaboration** | **Confirmation requise, collaboration supprimée, notification envoyée au professeur** [NOUVEAU] |
| **Étudiant accède à l'espace de travail après suppression de la collaboration** | **Redirection vers /espace-etudiant/mes-collaborations, message : Cette collaboration n'existe plus** [NOUVEAU] |
| **Étudiant envoie un message vide dans l'espace de travail** | **Bouton Envoyer désactivé tant que le champ est vide** [NOUVEAU] |
| **Étudiant partage un fichier sans titre** | **Message d'erreur : Veuillez saisir un titre** [NOUVEAU] |
| **Étudiant coche un objectif déjà coché** | **La case reste cochée, aucune action supplémentaire** [NOUVEAU] |
| **Professeur ajoute un objectif sans titre** | **Message d'erreur : Veuillez saisir un titre** [NOUVEAU] |
| **Professeur consulte les coordonnées d'un étudiant** | **Les coordonnées de l'étudiant ne sont pas affichées (hors périmètre)** [NOUVEAU] |
| **Étudiant consulte les coordonnées d'un professeur avant acceptation** | **Les coordonnées ne sont pas affichées** [NOUVEAU] |
| **Étudiant consulte les coordonnées d'un professeur après acceptation** | **Les coordonnées (téléphone et/ou email) sont affichées selon les préférences du professeur** [NOUVEAU] |

## 6. Critères de validation

### Validation de l'espace enseignant (existant)

1. Accéder à /espace-enseignant/profil et vérifier l'affichage de la photo, nom, matières, établissement, niveaux, biographie
2. Vérifier l'affichage du badge ✅ si verified: true
3. Vérifier l'affichage des statistiques : questions répondues, contenus publiés, étudiants aidés
4. Cliquer sur Modifier le profil et vérifier l'ouverture du formulaire d'édition
5. Modifier les informations du profil et cliquer sur Enregistrer, vérifier la sauvegarde
6. Accéder à /espace-enseignant/dashboard et vérifier l'affichage des cartes de statistiques clés
7. Vérifier l'affichage des liens vers les sections principales
8. Accéder à /espace-enseignant/questions et vérifier l'affichage de la liste des questions
9. Filtrer les questions par statut (En attente / Résolues) et vérifier le filtrage
10. Cliquer sur une question et vérifier l'affichage du détail
11. Rédiger une réponse et cliquer sur Publier, vérifier l'enregistrement
12. Marquer une question comme résolue et vérifier le changement de statut
13. Accéder à /espace-enseignant/corrections et vérifier l'affichage de la liste des soumissions
14. Filtrer les soumissions par statut (À corriger / Corrigées) et vérifier le filtrage
15. Cliquer sur une soumission et vérifier l'affichage du détail
16. Attribuer une note et rédiger des commentaires, cliquer sur Enregistrer, vérifier l'enregistrement
17. Accéder à /espace-enseignant/contenus et vérifier l'affichage de la liste des contenus
18. Filtrer les contenus par type (Cours / Fiches / Exercices) et vérifier le filtrage
19. Cliquer sur Créer un contenu et vérifier l'ouverture de /espace-enseignant/contenus/nouveau
20. Remplir le formulaire de création de contenu et cliquer sur Publier, vérifier l'enregistrement
21. Cliquer sur Modifier un contenu et vérifier l'ouverture de /espace-enseignant/contenus/[id]/modifier
22. Modifier le contenu et cliquer sur Enregistrer, vérifier la sauvegarde
23. Cliquer sur Supprimer un contenu et vérifier la demande de confirmation
24. Accéder à /espace-enseignant/agenda et vérifier l'affichage du calendrier mensuel
25. Ajouter un événement et vérifier l'affichage dans le calendrier
26. Cliquer sur un événement et vérifier l'affichage des détails
27. Modifier un événement et vérifier la sauvegarde
28. Supprimer un événement et vérifier la demande de confirmation
29. Accéder à /espace-enseignant/messagerie et vérifier l'affichage de la liste des conversations
30. Cliquer sur une conversation et vérifier l'affichage de l'historique des messages
31. Envoyer un nouveau message et vérifier l'enregistrement
32. Accéder à /espace-enseignant/ressources et vérifier l'affichage de la bibliothèque de ressources
33. Ajouter une ressource (Document ou Lien) et vérifier l'enregistrement
34. Télécharger un document ou ouvrir un lien et vérifier le fonctionnement
35. Supprimer une ressource et vérifier la demande de confirmation
36. Accéder à /espace-enseignant/parametres et vérifier l'affichage des paramètres du compte
37. Modifier l'email et vérifier la sauvegarde
38. Modifier le mot de passe et vérifier la sauvegarde
39. Activer/désactiver les notifications et vérifier l'enregistrement de la préférence
40. Changer le thème (Clair / Sombre) et vérifier l'application immédiate
41. Vérifier l'affichage de la Sidebar sur desktop (≥1024px) avec les sections
42. Vérifier l'affichage du profil rapide en bas de la Sidebar (avatar + nom)
43. Cliquer sur le toggle Thème et vérifier le changement de thème
44. Cliquer sur Déconnexion et vérifier la redirection vers /
45. Réduire la fenêtre à une taille tablet/mobile (<1024px) et vérifier l'affichage du menu hamburger
46. Cliquer sur le menu hamburger et vérifier l'ouverture du Sheet drawer
47. Vérifier l'affichage du menu principal dans le Sheet
48. Cliquer sur un lien de navigation dans le Sheet et vérifier la fermeture automatique
49. Cliquer sur le backdrop et vérifier la fermeture du Sheet
50. Appuyer sur Escape et vérifier la fermeture du Sheet
51. Vérifier que la navigation enseignant est séparée de MainLayout (pas de navigation étudiant visible)
52. Accéder à /espace-enseignant/contenus/nouveau avec Type: Exercice et vérifier l'affichage du générateur de quiz
53. Ajouter des questions au quiz et vérifier l'enregistrement
54. Publier le quiz et vérifier l'affichage dans Mes contenus
55. Utiliser le correcteur orthographique dans un champ de texte et vérifier le soulignement des fautes
56. Survoler une faute et vérifier l'affichage des suggestions de correction
57. Créer une fiche de révision depuis /espace-enseignant/contenus/nouveau (Type: Fiche) et vérifier l'enregistrement
58. Importer un document depuis /espace-enseignant/ressources et vérifier l'enregistrement
59. Exporter un contenu en PDF depuis /espace-enseignant/contenus et vérifier le téléchargement
60. Consulter les statistiques de progression depuis /espace-enseignant/dashboard et vérifier l'affichage des graphiques
61. Tenter d'accéder à /espace-enseignant/* avec un utilisateur non-enseignant et vérifier la redirection vers /connexion ou page 403
62. Vérifier que le badge ✅ ne s'affiche pas pour un enseignant non vérifié (verified: false)
63. Tenter de répondre à une question déjà résolue et vérifier le message d'information
64. Tenter de corriger une copie déjà corrigée et vérifier l'affichage de la correction existante
65. Supprimer un contenu publié et vérifier la demande de confirmation
66. Créer un contenu sans remplir tous les champs obligatoires et vérifier le message d'erreur
67. Importer un fichier de format non supporté et vérifier le message d'erreur
68. Modifier le profil et quitter la page sans enregistrer, vérifier le message de confirmation
69. Accéder à une section vide (aucune question, aucune copie) et vérifier le message informatif
70. Ajouter un événement dans l'agenda sans date et vérifier le message d'erreur
71. Envoyer un message vide dans la messagerie et vérifier que le bouton Envoyer est désactivé
72. Ajouter une ressource sans titre et vérifier le message d'erreur

### Validation de la fonctionnalité « Trouver un professeur » [NOUVEAU]

73. Accéder à /espace-enseignant/profil et vérifier l'affichage des nouveaux champs : disponibilité, visibilité annuaire, coordonnées contact, mode contact préféré, nombre max étudiants
74. Modifier la disponibilité et vérifier la sauvegarde
75. Désactiver la visibilité dans l'annuaire et vérifier que le profil n'apparaît plus dans /espace-etudiant/trouver-professeur
76. Activer la visibilité dans l'annuaire et vérifier que le profil réapparaît dans /espace-etudiant/trouver-professeur
77. Ajouter des coordonnées de contact (téléphone, email) et vérifier la sauvegarde
78. Définir le mode de contact préféré et vérifier la sauvegarde
79. Définir le nombre maximum d'étudiants et vérifier la sauvegarde
80. Accéder à /espace-enseignant/dashboard et vérifier l'affichage des nouvelles cartes : demandes en attente, collaborations actives
81. Accéder à /espace-enseignant/demandes et vérifier l'affichage de la liste des demandes
82. Filtrer les demandes par statut (En attente / Acceptées / Refusées) et vérifier le filtrage
83. Cliquer sur une demande et vérifier l'affichage du détail
84. Accepter une demande et vérifier la création automatique d'un espace de travail collaboratif
85. Vérifier l'envoi de la notification à l'étudiant après acceptation
86. Refuser une demande et vérifier le changement de statut
87. Vérifier l'envoi de la notification à l'étudiant après refus
88. Accéder à /espace-enseignant/collaborations et vérifier l'affichage de la liste des collaborations actives
89. Cliquer sur une collaboration et vérifier l'ouverture de l'espace de travail collaboratif
90. Retirer un étudiant d'une collaboration et vérifier la demande de confirmation
91. Vérifier la suppression de la collaboration et l'envoi de la notification à l'étudiant
92. Accéder à /espace-enseignant/collaborations/[id] et vérifier l'affichage des informations de la collaboration
93. Vérifier l'affichage de la messagerie directe avec l'historique des messages
94. Envoyer un nouveau message et vérifier l'enregistrement
95. Vérifier l'affichage de la section Partage de fichiers/liens
96. Ajouter un fichier/lien et vérifier l'enregistrement
97. Vérifier l'affichage de la section Notes partagées
98. Modifier les notes partagées et vérifier la sauvegarde
99. Vérifier l'affichage du Tableau de suivi avec les objectifs
100. Ajouter un objectif et vérifier l'enregistrement
101. Vérifier que l'étudiant peut cocher la progression de l'objectif
102. Accéder à /espace-etudiant/trouver-professeur et vérifier l'affichage de la liste des professeurs
103. Filtrer les professeurs par matière et vérifier le filtrage
104. Filtrer les professeurs par niveau scolaire et vérifier le filtrage
105. Filtrer les professeurs par disponibilité et vérifier le filtrage
106. Cliquer sur un professeur et vérifier l'affichage de la fiche de profil
107. Vérifier que les coordonnées (téléphone, email) ne sont PAS affichées à ce stade
108. Cliquer sur Demander un accompagnement et vérifier l'ouverture du formulaire
109. Remplir le formulaire de demande et cliquer sur Envoyer, vérifier l'enregistrement
110. Vérifier l'envoi de la notification au professeur
111. Accéder à /espace-etudiant/mes-demandes et vérifier l'affichage de la liste des demandes
112. Filtrer les demandes par statut (En attente / Acceptées / Refusées) et vérifier le filtrage
113. Cliquer sur une demande et vérifier l'affichage du détail
114. Annuler une demande en attente et vérifier la demande de confirmation
115. Vérifier la suppression de la demande
116. Tenter d'annuler une demande acceptée ou refusée et vérifier que le bouton est désactivé
117. Accéder à /espace-etudiant/mes-collaborations et vérifier l'affichage de la liste des collaborations actives
118. Cliquer sur une collaboration et vérifier l'ouverture de l'espace de travail collaboratif
119. Vérifier l'affichage des coordonnées du professeur (téléphone et/ou email) après acceptation
120. Quitter une collaboration et vérifier la demande de confirmation
121. Vérifier la suppression de la collaboration et l'envoi de la notification au professeur
122. Accéder à /espace-etudiant/mes-collaborations/[id] et vérifier l'affichage des informations de la collaboration
123. Vérifier l'affichage de la messagerie directe avec l'historique des messages
124. Envoyer un nouveau message et vérifier l'enregistrement
125. Vérifier l'affichage de la section Partage de fichiers/liens
126. Ajouter un fichier/lien et vérifier l'enregistrement
127. Vérifier l'affichage de la section Notes partagées
128. Modifier les notes partagées et vérifier la sauvegarde
129. Vérifier l'affichage du Tableau de suivi avec les objectifs
130. Cocher la progression d'un objectif et vérifier l'enregistrement
131. Vérifier que le professeur voit la progression en temps réel
132. Tenter d'envoyer une demande à un professeur occupé et vérifier le message d'information
133. Vérifier que le badge de disponibilité passe à « Occupé » lorsque le nombre maximum d'étudiants est atteint
134. Vérifier l'affichage des nouveaux liens dans le menu de navigation de l'espace étudiant : Trouver un professeur, Mes demandes, Mes collaborations
135. Vérifier l'affichage des nouveaux liens dans la Sidebar de l'espace enseignant : Demandes d'accompagnement, Mes collaborations

## 7. Fonctionnalités non implémentées dans cette version

- Notifications en temps réel pour les nouvelles questions/soumissions
- Chat en direct entre enseignants et élèves (hors espace de travail collaboratif)
- Visioconférence intégrée pour tutorat en ligne
- Correction automatique des copies par IA
- Génération automatique de contenus pédagogiques par IA (contrainte absolue : is_ai_generated doit rester FALSE)
- Système de badges et récompenses pour les enseignants
- Classements des enseignants
- Notation des enseignants par les élèves
- Système de parrainage d'enseignants
- Marketplace de contenus pédagogiques payants
- Abonnements premium pour fonctionnalités avancées
- Publicités (la plateforme reste 100% gratuite sans publicité)
- Intégration avec systèmes de gestion scolaire externes (Pronote, ENT)
- Export SCORM des données
- API publique pour intégrations tierces
- Applications mobiles natives (iOS/Android)
- Mode hors ligne avec synchronisation
- Reconnaissance vocale pour dictée de questions
- Traduction automatique des contenus en plusieurs langues
- Système de versioning des contenus
- Historique complet des modifications de contenus
- Système de commentaires sur les contenus
- Forum de discussion entre enseignants
- Bibliothèque de ressources externes (liens vers sites éducatifs)
- Intégration avec outils de visioconférence externes (Zoom, Teams)
- Calendrier partagé entre parents et enseignants
- Système de prise de rendez-vous en ligne
- Gestion des absences et retards
- Suivi du comportement et sanctions
- Carnet de correspondance numérique
- Bulletins de notes automatisés
- Statistiques avancées de progression par compétence
- Recommandations de contenus personnalisées
- Parcours d'apprentissage adaptatifs
- Tests de positionnement automatiques
- Certification de compétences
- Diplômes numériques
- Portfolio numérique de l'élève
- CV éducatif automatisé
- Lettres de recommandation numériques
- Système de mentorat d'élèves
- Tutorat entre pairs (hors espace de travail collaboratif)
- Groupes d'étude collaboratifs
- Projets collaboratifs entre classes
- Échanges virtuels internationaux
- Partenariats avec universités
- Stages en entreprise via la plateforme
- Orientation professionnelle intégrée
- Tests d'orientation professionnelle
- Fiches métiers interactives
- Témoignages de professionnels
- Visites virtuelles d'entreprises
- Salons de l'emploi en ligne
- Coaching personnalisé
- Soutien psychologique
- Gestion du stress et de l'anxiété
- Techniques de mémorisation
- Méthodes de travail efficaces
- Gestion du temps et organisation
- Préparation aux examens
- Simulations d'examens
- Annales corrigées
- Fiches de révision automatisées
- Cartes mentales interactives
- Résumés de cours générés automatiquement
- Exercices adaptatifs selon le niveau
- Correction automatique avec explications détaillées
- Vidéos explicatives personnalisées
- Podcasts éducatifs
- Livres audio de cours
- Réalité virtuelle pour apprentissage immersif
- Réalité augmentée pour visualisation 3D
- Simulations scientifiques interactives
- Laboratoires virtuels
- Expériences en ligne
- Sorties scolaires virtuelles
- Musées virtuels
- Visites de monuments historiques en 3D
- Voyages spatiaux virtuels
- Exploration sous-marine en VR
- Découverte de la faune et flore en AR
- Apprentissage des langues avec IA conversationnelle
- Échanges linguistiques avec natifs
- Immersion culturelle virtuelle
- Cours de langues en visioconférence
- Certification en ligne de langues
- Préparation aux tests de langues (TOEFL, IELTS, etc.)
- Bibliothèque de livres numériques
- Accès aux bases de données académiques
- Abonnements à des revues scientifiques
- Outils de recherche documentaire
- Gestion automatisée de bibliographie
- Détection de plagiat
- Aide à la rédaction de thèses et mémoires
- Correction orthographique et grammaticale avancée (au-delà du correcteur intégré)
- Suggestions de reformulation
- Analyse du style d'écriture
- Amélioration de la lisibilité
- Génération de plans de rédaction
- Modèles de documents académiques
- Normes de citation automatisées (APA, MLA, etc.)
- Export multi-formats (au-delà de PDF, DOCX)
- Collaboration en temps réel sur documents (au-delà des notes partagées)
- Commentaires et annotations partagés
- Historique des versions
- Fusion de modifications
- Gestion des conflits
- Droits d'accès granulaires
- Partage sécurisé de documents
- Signature électronique
- Archivage à long terme
- Conformité RGPD renforcée
- Audits de sécurité réguliers
- Chiffrement de bout en bout
- Authentification à deux facteurs
- Connexion via réseaux sociaux
- Single Sign-On (SSO)
- Gestion de sessions multiples
- Déconnexion automatique après inactivité
- Alertes de connexion suspecte
- Historique des connexions
- Gestion des appareils de confiance
- Révocation d'accès à distance
- Récupération de compte sécurisée
- Questions de sécurité personnalisées
- Code de secours pour récupération
- Support multilingue complet (au-delà du français)
- Localisation des contenus
- Adaptation culturelle des exemples
- Formats de date et heure locaux
- Devises locales
- Unités de mesure locales
- Claviers virtuels pour langues non-latines
- Support de l'écriture de droite à gauche
- Polices spécifiques pour langues asiatiques
- Traduction automatique de l'interface
- Glossaire multilingue
- Aide contextuelle multilingue
- Support client multilingue
- Documentation technique multilingue
- Vidéos de formation multilingues
- Webinaires multilingues
- Communauté internationale
- Événements internationaux
- Partenariats internationaux
- Expansion géographique progressive
- Conformité aux réglementations locales
- Adaptation aux systèmes éducatifs nationaux
- Reconnaissance des diplômes internationaux
- Équivalences de niveaux scolaires
- Conversion des notes selon les systèmes
- Calendriers scolaires internationaux
- Jours fériés locaux
- Fuseaux horaires multiples
- Synchronisation automatique de l'heure
- Planification d'événements internationaux
- Coordination entre écoles de différents pays
- Projets éducatifs transnationaux
- Mobilité virtuelle des étudiants
- Crédits ECTS pour cours en ligne
- Reconnaissance académique internationale
- Partenariats avec universités étrangères
- Doubles diplômes en ligne
- Programmes d'échange virtuels
- Bourses internationales
- Financement participatif pour projets éducatifs
- Dons pour soutenir la plateforme gratuite
- Mécénat d'entreprises
- Subventions publiques
- Appels à projets éducatifs
- Recherche et développement éducatif
- Innovation technologique pour l'éducation
- Expérimentations pédagogiques
- Études d'impact de la plateforme
- Publications scientifiques sur les résultats
- Conférences académiques
- Colloques sur l'éducation numérique
- Participation à des consortiums de recherche
- Collaboration avec laboratoires universitaires
- Thèses de doctorat sur la plateforme
- Stages de recherche pour étudiants
- Programmes de bourses de recherche
- Prix d'innovation éducative
- Reconnaissance par la communauté éducative
- Labels de qualité éducative
- Certifications éducatives
- Accréditations institutionnelles
- Audits de qualité externes
- Évaluations par experts indépendants
- Transparence totale sur les méthodes
- Rapports annuels publics
- Indicateurs de performance publiés
- Objectifs de qualité chiffrés
- Engagement d'amélioration continue
- **Système de notation des professeurs par les étudiants**
- **Avis et commentaires publics sur les professeurs**
- **Système de recommandation automatique de professeurs**
- **Matching automatique étudiant-professeur basé sur IA**
- **Historique complet des échanges étudiant-professeur**
- **Statistiques détaillées de performance des professeurs**
- **Tableau de bord analytique pour les professeurs**
- **Rapports de progression automatisés pour les étudiants**
- **Système de paiement pour cours particuliers**
- **Réservation de créneaux horaires pour sessions en ligne**
- **Intégration calendrier externe (Google Calendar, Outlook)**
- **Rappels automatiques pour sessions programmées**
- **Enregistrement des sessions de tutorat**
- **Transcription automatique des échanges**
- **Traduction automatique des messages**
- **Modération automatique des contenus partagés**
- **Système de signalement d'abus**
- **Vérification d'identité renforcée pour professeurs**
- **Certification professionnelle des enseignants**
- **Formation continue pour enseignants**
- **Communauté de pratique entre enseignants**
- **Partage de bonnes pratiques pédagogiques**
- **Bibliothèque de ressources mutualisées entre enseignants**
- **Co-création de contenus entre enseignants**
- **Projets collaboratifs inter-enseignants**
- **Mentorat entre enseignants expérimentés et débutants**
- **Évaluation par les pairs pour enseignants**
- **Portfolio professionnel pour enseignants**
- **CV enseignant automatisé**
- **Lettres de recommandation entre enseignants**
- **Réseau professionnel d'enseignants**
- **Offres d'emploi pour enseignants**
- **Recrutement d'enseignants via la plateforme**
- **Gestion administrative des enseignants**
- **Contrats de travail numériques**
- **Feuilles de temps automatisées**
- **Gestion de la paie pour enseignants**
- **Déclarations fiscales automatisées**
- **Assurance professionnelle pour enseignants**
- **Protection juridique pour enseignants**
- **Support RH pour enseignants**
- **Gestion des congés et absences**
- **Remplacement automatique d'enseignants absents**
- **Pool de remplaçants disponibles**
- **Planification automatique des remplacements**
- **Coordination multi-enseignants pour un même étudiant**
- **Suivi longitudinal de l'étudiant par plusieurs enseignants**
- **Réunions pédagogiques virtuelles entre enseignants**
- **Conseils de classe en ligne**
- **Bulletins scolaires collaboratifs**
- **Évaluations croisées entre enseignants**
- **Harmonisation des notes entre enseignants**
- **Grilles d'évaluation partagées**
- **Référentiels de compétences communs**
- **Progression pédagogique coordonnée**
- **Projets interdisciplinaires**
- **Enseignement en équipe**
- **Co-enseignement synchrone**
- **Classes virtuelles partagées**
- **Groupes de niveau inter-classes**
- **Différenciation pédagogique automatisée**
- **Parcours personnalisés pour chaque étudiant**
- **Adaptation automatique du contenu selon le niveau**
- **Exercices génératifs basés sur les lacunes détectées**
- **Feedback automatisé sur les exercices**
- **Correction semi-automatique avec validation enseignant**
- **Banque de questions mutualisée**
- **Générateur d'évaluations automatique**
- **Examens en ligne sécurisés**
- **Surveillance automatisée des examens**
- **Détection de triche par IA**
- **Proctoring en ligne**
- **Authentification biométrique pour examens**
- **Blockchain pour certification des diplômes**
- **Badges numériques vérifiables**
- **Open Badges pour compétences**
- **Micro-certifications empilables**
- **Parcours de certification modulaires**
- **Reconnaissance des acquis de l'expérience**
- **Validation des acquis professionnels**
- **Passerelles entre formations**
- **Équivalences automatiques de diplômes**
- **Mobilité académique facilitée**
- **Transfert de crédits entre établissements**
- **Dossier étudiant portable**
- **Interopérabilité avec autres plateformes éducatives**
- **Standards LTI pour intégrations**
- **API REST complète pour développeurs tiers**
- **Webhooks pour événements en temps réel**
- **SDK pour applications mobiles tierces**
- **Plugins pour LMS existants (Moodle, Canvas)**
- **Extensions pour navigateurs**
- **Applications de bureau (Windows, Mac, Linux)**
- **Support de tablettes graphiques**
- **Support de stylets numériques**
- **Reconnaissance d'écriture manuscrite**
- **Conversion écriture manuscrite en texte**
- **Annotation de documents PDF**
- **Tableau blanc collaboratif**
- **Outils de dessin partagés**
- **Schémas et diagrammes interactifs**
- **Graphiques dynamiques**
- **Simulations mathématiques**
- **Calculatrice scientifique intégrée**
- **Éditeur d'équations LaTeX**
- **Rendu 3D de molécules chimiques**
- **Simulateur de circuits électriques**
- **Éditeur de code avec coloration syntaxique**
- **Environnement de développement intégré (IDE)**
- **Compilation et exécution de code en ligne**
- **Débogueur interactif**
- **Tests unitaires automatisés**
- **Revue de code entre pairs**
- **Gestion de versions avec Git**
- **Dépôts de code partagés**
- **Projets de programmation collaboratifs**
- **Hackathons virtuels**
- **Concours de programmation**
- **Challenges algorithmiques**
- **Gamification de l'apprentissage du code**
- **Badges de progression en programmation**
- **Classements de codeurs**
- **Système de points et récompenses**
- **Déblocage de niveaux**
- **Quêtes pédagogiques**
- **Missions à accomplir**
- **Avatars personnalisables**
- **Mondes virtuels éducatifs**
- **Métavers pédagogique**
- **Salles de classe virtuelles en 3D**
- **Interactions sociales en réalité virtuelle**
- **Événements virtuels immersifs**
- **Conférences en VR**
- **Salons étudiants virtuels**
- **Portes ouvertes en ligne**
- **Visites virtuelles d'établissements**
- **Immersion dans les métiers**
- **Stages virtuels**
- **Simulations professionnelles**
- **Serious games éducatifs**
- **Jeux sérieux pour l'orientation**
- **Escape games pédagogiques**
- **Énigmes éducatives**
- **Chasses au trésor virtuelles**
- **Rallyes pédagogiques en ligne**
- **Compétitions inter-établissements**
- **Olympiades académiques virtuelles**
- **Tournois de connaissances**
- **Quiz géants en direct**
- **Émissions éducatives interactives**
- **Webinaires avec experts**
- **Masterclasses en ligne**
- **Cours magistraux enregistrés**
- **MOOC intégrés**
- **SPOC pour groupes restreints**
- **Classes inversées**
- **Pédagogie active en ligne**
- **Apprentissage par projet**
- **Apprentissage par problèmes**
- **Apprentissage par enquête**
- **Pédagogie Montessori adaptée au numérique**
- **Pédagogie Freinet en ligne**
- **Pédagogie Steiner-Waldorf numérique**
- **Approches pédagogiques alternatives**
- **Neurosciences appliquées à l'éducation**
- **Sciences cognitives pour l'apprentissage**
- **Psychologie de l'éducation**
- **Ergonomie cognitive des interfaces**
- **Design pédagogique basé sur la recherche**
- **Learning analytics avancés**
- **Big data éducatif**
- **Intelligence artificielle pour l'éducation**
- **Machine learning pour prédiction de réussite**
- **Systèmes de recommandation intelligents**
- **Chatbots pédagogiques**
- **Assistants virtuels pour étudiants**
- **Tuteurs intelligents**
- **Agents conversationnels pour orientation**
- **Support automatisé 24/7**
- **FAQ dynamiques**
- **Base de connaissances auto-apprenante**
- **Documentation interactive**
- **Tutoriels vidéo contextuels**
- **Guides pas à pas**
- **Tooltips intelligents**
- **Onboarding personnalisé**
- **Parcours de découverte adaptatifs**
- **Démonstrations interactives**
- **Sandbox pour expérimentation**
- **Environnement de test sécurisé**
- **Données de démonstration**
- **Comptes de test**
- **Mode prévisualisation**
- **Aperçu avant publication**
- **Brouillons automatiques**
- **Sauvegarde automatique**
- **Récupération de sessions**
- **Historique d'annulation étendu**
- **Restauration de versions antérieures**
- **Comparaison de versions**
- **Fusion intelligente de modifications**
- **Résolution de conflits assistée**
- **Collaboration asynchrone avancée**
- **Workflow de validation**
- **Circuit d'approbation**
- **Signatures électroniques multiples**
- **Traçabilité complète des actions**
- **Logs d'audit détaillés**
- **Conformité RGPD automatisée**
- **Gestion des consentements**
- **Droit à l'oubli**
- **Portabilité des données**
- **Export complet des données personnelles**
- **Suppression définitive de compte**
- **Anonymisation des données**
- **Pseudonymisation**
- **Chiffrement des données sensibles**
- **Coffre-fort numérique**
- **Stockage sécurisé de documents**
- **Partage sécurisé avec expiration**
- **Liens de téléchargement temporaires**
- **Protection par mot de passe de fichiers**
- **Watermarking de documents**
- **DRM pour contenus protégés**
- **Gestion des droits d'auteur**
- **Licences Creative Commons**
- **Respect de la propriété intellectuelle**
- **Déclaration de plagiat**
- **Vérification d'originalité**
- **Citations automatiques**
- **Bibliographie générée**
- **Gestion de références bibliographiques**
- **Intégration Zotero/Mendeley**
- **Import/export BibTeX**
- **Styles de citation multiples**
- **Formatage automatique selon normes**
- **Templates de documents académiques**
- **Modèles de rapports**
- **Structures de thèses**
- **Formats de mémoires**
- **Gabarits de présentations**
- **Diaporamas interactifs**
- **Présentations collaboratives**
- **Mode présentateur**
- **Notes de présentation**
- **Télécommande virtuelle**
- **Pointeur laser virtuel**
- **Annotations en direct**
- **Sondages en temps réel**
- **Questions-réponses interactives**
- **Nuages de mots**
- **Votes en direct**
- **Feedback instantané**
- **Évaluation à chaud**
- **Questionnaires de satisfaction**
- **Enquêtes de climat scolaire**
- **Baromètre de bien-être**
- **Suivi du moral des troupes**
- **Prévention du décrochage**
- **Détection précoce des difficultés**
- **Alertes automatiques**
- **Signaux faibles**
- **Indicateurs de risque**
- **Tableaux de bord prédictifs**
- **Visualisations de données avancées**
- **Rapports personnalisables**
- **Exports de données**
- **Intégration avec outils BI**
- **Connecteurs pour Excel/Google Sheets**
- **API de données**
- **Flux de données en temps réel**
- **Webhooks pour événements métier**
- **Intégrations Zapier/Make**
- **Automatisations no-code**
- **Workflows personnalisables**
- **Règles métier configurables**
- **Moteur de règles**
- **Logique conditionnelle avancée**
- **Expressions régulières**
- **Validation de données complexe**
- **Contraintes d'intégrité**
- **Triggers de base de données**
- **Procédures stockées**
- **Vues matérialisées**
- **Indexation avancée**
- **Optimisation de requêtes**
- **Cache distribué**
- **CDN pour assets statiques**
- **Compression d'images**
- **Lazy loading**
- **Code splitting**
- **Tree shaking**
- **Minification**
- **Bundling optimisé**
- **Service workers**
- **Stratégies de cache**
- **Offline-first**
- **Synchronisation différée**
- **Résolution de conflits hors ligne**
- **Mode dégradé**
- **Fallbacks gracieux**
- **Gestion d'erreurs robuste**
- **Retry automatique**
- **Circuit breaker**
- **Rate limiting**
- **Throttling**
- **Debouncing**
- **Optimistic UI**
- **Skeleton screens**
- **Progressive enhancement**
- **Graceful degradation**
- **Polyfills**
- **Transpilation**
- **Support navigateurs anciens**
- **Tests de compatibilité**
- **Tests multi-navigateurs**
- **Tests multi-devices**
- **Tests d'accessibilité automatisés**
- **Audits Lighthouse**
- **Scores de performance**
- **Métriques Core Web Vitals**
- **Monitoring de performance**
- **APM (Application Performance Monitoring)**
- **Tracing distribué**
- **Logging centralisé**
- **Alerting**
- **Monitoring d'infrastructure**
- **Métriques système**
- **Dashboards de monitoring**
- **SLA tracking**
- **Uptime monitoring**
- **Synthetic monitoring**
- **Real User Monitoring (RUM)**
- **Session replay**
- **Heatmaps**
- **Click tracking**
- **Scroll tracking**
- **Form analytics**
- **Funnel analysis**
- **Cohort analysis**
- **Retention analysis**
- **Churn prediction**
- **Lifetime value**
- **Attribution modeling**
- **Marketing analytics**
- **SEO analytics**
- **Social media analytics**
- **Email marketing analytics**
- **Campaign tracking**
- **UTM parameters**
- **Conversion tracking**
- **Goal tracking**
- **Event tracking**
- **Custom dimensions**
- **Custom metrics**
- **Segments**
- **Audiences**
- **Remarketing**
- **Retargeting**
- **Lookalike audiences**
- **Programmatic advertising**
- **Ad exchanges**
- **Real-time bidding**
- **Header bidding**
- **Ad serving**
- **Ad verification**
- **Brand safety**
- **Viewability**
- **Fraud detection**
- **Invalid traffic filtering**
- **Bot detection**
- **CAPTCHA**
- **reCAPTCHA**
- **hCaptcha**
- **Cloudflare Turnstile**
- **WAF (Web Application Firewall)**
- **DDoS protection**
- **Rate limiting avancé**
- **IP whitelisting/blacklisting**
- **Geo-blocking**
- **Content filtering**
- **Malware scanning**
- **Vulnerability scanning**
- **Penetration testing**
- **Security audits**
- **Compliance certifications**
- **ISO 27001**
- **SOC 2**
- **HIPAA**
- **PCI DSS**
- **FERPA**
- **COPPA**
- **GDPR**
- **CCPA**
- **Privacy Shield**
- **Standard Contractual Clauses**
- **Data Processing Agreements**
- **Privacy policies**
- **Terms of service**
- **Cookie policies**
- **Acceptable use policies**
- **Community guidelines**
- **Code of conduct**
- **Moderation policies**
- **Content policies**
- **Copyright policies**
- **DMCA compliance**
- **Takedown procedures**
- **Counter-notice procedures**
- **Dispute resolution**
- **Arbitration**
- **Mediation**
- **Legal support**
- **Compliance team**
- **Data Protection Officer**
- **Privacy team**
- **Security team**
- **Incident response team**
- **Crisis management**
- **Business continuity**
- **Disaster recovery**
- **Backup and restore**
- **High availability**
- **Failover**
- **Load balancing**
- **Auto-scaling**
- **Horizontal scaling**
- **Vertical scaling**
- **Database replication**
- **Database sharding**
- **Microservices architecture**
- **Service mesh**
- **API gateway**
- **Message queues**
- **Event streaming**
- **Pub/sub**
- **Serverless functions**
- **Edge computing**
- **Multi-region deployment**
- **Global CDN**
- **Anycast routing**
- **DNS load balancing**
- **Traffic management**
- **Blue-green deployment**
- **Canary releases**
- **Feature flags**
- **A/B testing infrastructure**
- **Experimentation platform**
- **Personalization engine**
- **Recommendation system**
- **Search engine**
- **Full-text search**
- **Faceted search**
- **Autocomplete**
- **Spell checking**
- **Synonyms**
- **Stemming**
- **Lemmatization**
- **Natural language processing**
- **Sentiment analysis**
- **Topic modeling**
- **Named entity recognition**
- **Text classification**
- **Text clustering**
- **Text summarization**
- **Keyword extraction**
- **Language detection**
- **Machine translation**
- **Speech recognition**
- **Speech synthesis**
- **Voice commands**
- **Voice search**
- **Voice assistants**
- **Conversational AI**
- **Dialogue management**
- **Intent recognition**
- **Entity extraction**
- **Slot filling**
- **Context management**
- **Multi-turn conversations**
- **Conversation history**
- **Personalized responses**
- **Emotional intelligence**
- **Empathy in AI**
- **Ethical AI**
- **Explainable AI**
- **Transparent algorithms**
- **Bias detection**
- **Fairness metrics**
- **Algorithmic accountability**
- **AI governance**
- **Responsible AI**
- **Human-in-the-loop**
- **Human oversight**
- **AI safety**
- **AI alignment**
- **Value alignment**
- **AI ethics board**
- **Ethics review**
- **Impact assessment**
- **Risk assessment**
- **Mitigation strategies**
- **Continuous monitoring**
- **Continuous improvement**
- **Feedback loops**
- **Learning from mistakes**
- **Post-mortems**
- **Retrospectives**
- **Lessons learned**
- **Best practices**
- **Knowledge base**
- **Documentation**
- **Runbooks**
- **Playbooks**
- **Standard operating procedures**
- **Training materials**
- **Onboarding guides**
- **User manuals**
- **Admin guides**
- **Developer documentation**
- **API documentation**
- **SDK documentation**
- **Code examples**
- **Tutorials**
- **How-to guides**
- **Troubleshooting guides**
- **FAQ**
- **Glossary**
- **Release notes**
- **Changelog**
- **Roadmap**
- **Feature requests**
- **Bug reports**
- **Issue tracking**
- **Project management**
- **Agile methodologies**
- **Scrum**
- **Kanban**
- **Sprint planning**
- **Daily standups**
- **Sprint reviews**
- **Sprint retrospectives**
- **Backlog grooming**
- **Story mapping**
- **User stories**
- **Acceptance criteria**
- **Definition of done**
- **Velocity tracking**
- **Burndown charts**
- **Cumulative flow diagrams**
- **Cycle time**
- **Lead time**
- **Throughput**
- **Work in progress limits**
- **Continuous delivery**
- **Continuous deployment**
- **CI/CD pipelines**
- **Automated testing**
- **Unit tests**
- **Integration tests**
- **End-to-end tests**
- **Regression tests**
- **Performance tests**
- **Load tests**
- **Stress tests**
- **Chaos engineering**
- **Fault injection**
- **Resilience testing**
- **Security testing**
- **Static analysis**
- **Dynamic analysis**
- **Code review**
- **Pair programming**
- **Mob programming**
- **Code quality metrics**
- **Code coverage**
- **Technical debt tracking**
- **Refactoring**
- **Code smells detection**
- **Linting**
- **Formatting**
- **Style guides**
- **Coding standards**
- **Architecture decision records**
- **Design patterns**
- **Anti-patterns**
- **System design**
- **Capacity planning**
- **Performance tuning**
- **Optimization**
- **Profiling**
- **Benchmarking**
- **Competitive analysis**
- **Market research**
- **User research**
- **Usability testing**
- **User interviews**
- **Surveys**
- **Focus groups**
- **Card sorting**
- **Tree testing**
- **First click testing**
- **Five second test**
- **Preference testing**
- **A/B testing**
- **Multivariate testing**
- **Heuristic evaluation**
- **Cognitive walkthrough**
- **Expert review**
- **Competitive benchmarking**
- **Best practices research**
- **Design patterns library**
- **Component library**
- **Design system**
- **Style guide**
- **Brand guidelines**
- **Accessibility guidelines**
- **Usability reports**
- **User research insights**
- **Persona development**
- **Journey mapping**
- **Information architecture**
- **Card sorting results**
- **Tree testing results**
- **First click test results**
- **Five second test results**
- **Preference test results**
- **A/B test results**
- **Multivariate test results**
- **Heuristic evaluation findings**
- **Cognitive walkthrough findings**
- **Expert review findings**
- **Competitive benchmark results**
- **Best practices documentation**
- **Design patterns catalog**
- **Anti-patterns catalog**
- **Case studies**
- **Success stories**
- **Lessons learned documentation**