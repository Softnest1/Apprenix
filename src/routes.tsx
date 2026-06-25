import { lazy, type ReactNode, Suspense } from 'react';

// ─── Helpers rechargement forcé ──────────────────────────────────────────────
// Remplace window.location.reload() — ajoute un paramètre _cb= pour contourner
// le cache navigateur (vieux chunk hash → 404 → boucle infinie sans _cb).
function forceCacheBustReload(): void {
  const base = window.location.pathname;
  window.location.replace(`${base}?_cb=${Date.now()}`);
}

// ─── Retry lazy — recharge le chunk jusqu'à 3 fois si réseau instable ─────────
// Si le chunk n'existe plus (déploiement stale), force un rechargement complet
// avec cache-busting pour éviter que le navigateur serve l'ancienne URL en cache.
function lazyWithRetry<T extends React.ComponentType<Record<string, unknown>>>(
  factory: () => Promise<{ default: T }>,
  retries = 3,
  delay = 400,
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (n: number) => {
        factory().then(resolve).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (
            msg.includes('Failed to fetch dynamically imported module') ||
            msg.includes('Unable to preload CSS') ||
            msg.includes('Importing a module script failed')
          ) {
            const key = '__chunk_reload__';
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, '1');
              forceCacheBustReload();
            } else {
              // Deuxième échec : nettoyage + abandon (montre l'ErrorBoundary)
              sessionStorage.removeItem(key);
              reject(err);
            }
            return;
          }
          if (n <= 0) { reject(err); return; }
          setTimeout(() => attempt(n - 1), delay);
        });
      };
      attempt(retries);
    }),
  );
}

import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import RouteGuard from '@/components/RouteGuard';

// ─── Chargement paresseux de chaque page (code splitting) ────────────────────
// Chaque import() crée un chunk séparé → le bundle initial est 10× plus léger
const ExamenPage            = lazyWithRetry(() => import('./pages/ExamenPage'));
const QuizPage              = lazyWithRetry(() => import('./pages/QuizPage'));
const CarteMentalePage      = lazyWithRetry(() => import('./pages/CarteMentalePage'));
const AccueilPage              = lazyWithRetry(() => import('./pages/AccueilPage'));
const ChansonsEduPage          = lazyWithRetry(() => import('./pages/ChansonsEduPage'));
const EspaceEtudiantPage       = lazyWithRetry(() => import('./pages/EspaceEtudiantPage'));
// DashboardPage et EspaceNiveauPage remplacés par /espace (EspaceEtudiantPage) — imports supprimés v4.3
const AideIAPage               = lazyWithRetry(() => import('./pages/AideIAPage'));
const ScannerPage              = lazyWithRetry(() => import('./pages/ScannerPage'));
const RessourcesPage           = lazyWithRetry(() => import('./pages/RessourcesPage'));
const LinguistiquePage         = lazyWithRetry(() => import('./pages/LinguistiquePage'));
const MathsSciencesPage        = lazyWithRetry(() => import('./pages/MathsSciencesPage'));
const OrganisationPage         = lazyWithRetry(() => import('./pages/OrganisationPage'));
const ConnexionPage            = lazyWithRetry(() => import('./pages/ConnexionPage'));
const FlashcardsPage           = lazyWithRetry(() => import('./pages/FlashcardsPage'));
const NotesPage                = lazyWithRetry(() => import('./pages/NotesPage'));
const RecuperationPage            = lazyWithRetry(() => import('./pages/RecuperationPage'));
const ActualitesPage           = lazyWithRetry(() => import('./pages/ActualitesPage'));
const CommunautePage           = lazyWithRetry(() => import('./pages/CommunautePage'));
const VisioPage                = lazyWithRetry(() => import('./pages/VisioPage'));
const DeepWorkPage             = lazyWithRetry(() => import('./pages/DeepWorkPage'));
const MotivationPage           = lazyWithRetry(() => import('./pages/MotivationPage'));
const MentionsLegalesPage      = lazyWithRetry(() => import('./pages/MentionsLegalesPage'));
const PolitiqueConfidentialitePage = lazyWithRetry(() => import('./pages/PolitiqueConfidentialitePage'));
const CguPage                  = lazyWithRetry(() => import('./pages/CguPage'));
const MissionPage              = lazyWithRetry(() => import('./pages/MissionPage'));
const ParentsPage              = lazyWithRetry(() => import('./pages/ParentsPage'));
const SecuritePage             = lazyWithRetry(() => import('./pages/SecuritePage'));
const FaqPage                  = lazyWithRetry(() => import('./pages/FaqPage'));
const ContactPage              = lazyWithRetry(() => import('./pages/ContactPage'));
const ContactMerciPage         = lazyWithRetry(() => import('./pages/ContactMerciPage'));
const EnseignantsPage          = lazyWithRetry(() => import('./pages/EnseignantsPage'));
const NouveautesPage           = lazyWithRetry(() => import('./pages/NouveautesPage'));
const TransparencePage         = lazyWithRetry(() => import('./pages/TransparencePage'));
const AccessibilitePage        = lazyWithRetry(() => import('./pages/AccessibilitePage'));
const PlanDuSitePage           = lazyWithRetry(() => import('./pages/PlanDuSitePage'));
const InclusionPage            = lazyWithRetry(() => import('./pages/InclusionPage'));
const ParentsEspacePage        = lazyWithRetry(() => import('./pages/ParentsEspacePage'));
const BienvenuePage            = lazyWithRetry(() => import('./pages/BienvenuePage'));
const EtablissementsPage       = lazyWithRetry(() => import('./pages/EtablissementsPage'));
const RessourcesOfficiellesPage = lazyWithRetry(() => import('./pages/RessourcesOfficiellesPage'));
// ─── Espaces dédiés — connexion obligatoire ───────────────────────────────────
const EspaceEnseignantDashboard        = lazyWithRetry(() => import('./pages/EspaceEnseignantDashboard'));
const EnseignantProfilPage             = lazyWithRetry(() => import('./pages/enseignant/EnseignantProfilPage'));
const EnseignantQuestionsPage          = lazyWithRetry(() => import('./pages/enseignant/EnseignantQuestionsPage'));
const EnseignantCorrectionsPage        = lazyWithRetry(() => import('./pages/enseignant/EnseignantCorrectionsPage'));
const EnseignantContenusPage           = lazyWithRetry(() => import('./pages/enseignant/EnseignantContenusPage'));
const EnseignantAgendaPage             = lazyWithRetry(() => import('./pages/enseignant/EnseignantAgendaPage'));
const EnseignantMessageriePage         = lazyWithRetry(() => import('./pages/enseignant/EnseignantMessageriePage'));
const DemandesAccompagnementPage       = lazyWithRetry(() => import('./pages/enseignant/DemandesAccompagnementPage'));
const CollaborationsEnseignantPage     = lazyWithRetry(() => import('./pages/enseignant/CollaborationsEnseignantPage'));
const AdministrationPage               = lazyWithRetry(() => import('./pages/AdministrationPage'));
const EtudiantProfilPage               = lazyWithRetry(() => import('./pages/etudiant/EtudiantProfilPage'));
const MesQuestionsPage                 = lazyWithRetry(() => import('./pages/MesQuestionsPage'));
const MesDepotsPage                    = lazyWithRetry(() => import('./pages/MesDepotsPage'));
const AccessibilitePersoPage           = lazyWithRetry(() => import('./pages/AccessibilitePersoPage'));

const BaseReponsesPage                 = lazyWithRetry(() => import('./pages/BaseReponsesPage'));
const TrouverProfesseurPage            = lazyWithRetry(() => import('./pages/TrouverProfesseurPage'));
const MesDemandesPage                  = lazyWithRetry(() => import('./pages/MesDemandesPage'));
const MesCollaborationsPage            = lazyWithRetry(() => import('./pages/MesCollaborationsPage'));
const EspaceCollaborationPage          = lazyWithRetry(() => import('./pages/EspaceCollaborationPage'));

// ─── Pages landing SEO — haut trafic organique ────────────────────────────────
const BacFrancaisPage         = lazyWithRetry(() => import('./pages/landing/BacFrancaisPage'));
const BrevetMathsPage         = lazyWithRetry(() => import('./pages/landing/BrevetMathsPage'));
const AideDevoirsGratuitPage  = lazyWithRetry(() => import('./pages/landing/AideDevoirsGratuitPage'));
const FlashcardsGratuitPage   = lazyWithRetry(() => import('./pages/landing/FlashcardsGratuitPage'));
const RevisionBac2026Page     = lazyWithRetry(() => import('./pages/landing/RevisionBac2026Page'));
const BacPhiloPage            = lazyWithRetry(() => import('./pages/landing/BacPhiloPage'));
const CoursMathsGratuitPage   = lazyWithRetry(() => import('./pages/landing/CoursMathsGratuitPage'));
const MethodeDeTravailPage    = lazyWithRetry(() => import('./pages/landing/MethodeDeTravailPage'));

// ─── Fallback de chargement — barre top + skeleton page ──────────────────────
const PageLoader = () => (
  /* min-h-[calc(100dvh-4rem)] : 100dvh = unité dynamique iOS Safari — ignore la barre d'adresse native */
  <div className="min-h-[calc(100dvh-4rem)] flex flex-col">
    {/* Barre de progression en haut — effet NProgress */}
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden pointer-events-none">
      <div className="h-full bg-primary animate-page-progress" />
    </div>
    {/* Skeleton de page — évite le flash "page blanche" */}
    <div className="flex-1 p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-7 bg-muted rounded-lg w-48" />
      <div className="h-48 bg-muted rounded-2xl w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** true = accessible sans connexion (mode visiteur autorisé) */
  public?: boolean;
  /**
   * Groupe de layout pour les routes imbriquées (nested routes).
   * 'student'  → rendu dans <EtudiantLayout><Outlet /></EtudiantLayout>
   * 'teacher'  → rendu dans <EnseignantLayout><Outlet /></EnseignantLayout>
   * undefined  → rendu plat (MainLayout ou route autonome)
   */
  layoutGroup?: 'student' | 'teacher';
}

/** Enveloppe layout + garde de sécurité + Suspense (espace étudiant / public) */
const wrap = (el: ReactNode, isPublic?: boolean): ReactNode => (
  <MainLayout>
    <RouteGuard isPublic={isPublic}>
      <Suspense fallback={<PageLoader />}>
        {el}
      </Suspense>
    </RouteGuard>
  </MainLayout>
);

/** Enveloppe dédiée à l'espace enseignant — element brut, pas de layout (nested route) */
const wrapTeacher = (el: ReactNode): ReactNode => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

/** Enveloppe dédiée à l'espace étudiant — element brut, pas de layout (nested route) */
const wrapEtudiant = (el: ReactNode): ReactNode => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const routes: RouteConfig[] = [
  // ── Toujours publiques ───────────────────────────────────────────────────────
  { name: 'Accueil',                     path: '/',                 element: wrap(<AccueilPage />, true),          public: true },
  { name: 'Connexion / Inscription',     path: '/connexion',        element: <Suspense fallback={<PageLoader />}><ConnexionPage /></Suspense>, public: true },
  { name: 'Bienvenue post-inscription',  path: '/bienvenue',        element: <Suspense fallback={<PageLoader />}><BienvenuePage /></Suspense>, public: true },
  { name: 'Récupération accès',          path: '/recuperation',     element: <Suspense fallback={<PageLoader />}><RecuperationPage /></Suspense>, public: true },

  // ── Espace étudiant — nested route (EtudiantLayout parent dans App.tsx) ───────
  // EtudiantLayout est rendu UNE SEULE FOIS ; <Outlet /> reçoit le contenu de la route active
  { name: 'Mon espace (accueil)',         path: '/espace',              element: wrapEtudiant(<EspaceEtudiantPage />),      layoutGroup: 'student' },
  // /espace/:category — chaque niveau a sa propre URL (primaire, college, lycee, superieur, adapte)
  { name: 'Espace par niveau',           path: '/espace/:category',    element: wrapEtudiant(<EspaceEtudiantPage />),      layoutGroup: 'student' },
  { name: 'Mon Profil étudiant',          path: '/espace/profil',       element: wrapEtudiant(<EtudiantProfilPage />),      layoutGroup: 'student' },
  { name: 'Aide aux devoirs',            path: '/aide-ia',             element: wrapEtudiant(<AideIAPage />),              layoutGroup: 'student' },
  { name: 'Base de réponses',            path: '/base-reponses',       element: wrapEtudiant(<BaseReponsesPage />),        layoutGroup: 'student', public: true },
  { name: 'Trouver un enseignant',       path: '/trouver-enseignant',  element: wrapEtudiant(<TrouverProfesseurPage />),   layoutGroup: 'student' },
  { name: 'Mes demandes',               path: '/mes-demandes',        element: wrapEtudiant(<MesDemandesPage />),         layoutGroup: 'student' },
  { name: 'Mes collaborations',         path: '/mes-collaborations',  element: wrapEtudiant(<MesCollaborationsPage />),   layoutGroup: 'student' },
  { name: 'Espace de collaboration',    path: '/espace-collaboration/:id', element: wrapEtudiant(<EspaceCollaborationPage />), layoutGroup: 'student' },
  { name: 'Scanner de devoirs',          path: '/scanner',             element: wrapEtudiant(<ScannerPage />),             layoutGroup: 'student' },
  { name: 'Outils Linguistiques',        path: '/linguistique',        element: wrapEtudiant(<LinguistiquePage />),        layoutGroup: 'student' },
  { name: 'Maths & Sciences',            path: '/maths-sciences',      element: wrapEtudiant(<MathsSciencesPage />),       layoutGroup: 'student' },
  { name: 'Organisation & Productivité', path: '/organisation',        element: wrapEtudiant(<OrganisationPage />),        layoutGroup: 'student' },
  { name: 'Flashcards',                  path: '/flashcards',          element: wrapEtudiant(<FlashcardsPage />),          layoutGroup: 'student' },
  { name: 'Notes',                       path: '/notes',               element: wrapEtudiant(<NotesPage />),               layoutGroup: 'student' },
  { name: 'Tableau de bord (redirect)',  path: '/tableau-de-bord',     element: <Navigate to="/espace" replace />,         layoutGroup: 'student' },
  { name: 'Mode Examen',                 path: '/examen',              element: wrapEtudiant(<ExamenPage />),              layoutGroup: 'student' },
  { name: 'Quiz Interactif',             path: '/quiz',                element: wrapEtudiant(<QuizPage />),                layoutGroup: 'student' },
  { name: 'Carte Mentale',               path: '/carte-mentale',       element: wrapEtudiant(<CarteMentalePage />),        layoutGroup: 'student' },
  { name: 'Communauté',                  path: '/communaute',          element: wrapEtudiant(<CommunautePage />),          layoutGroup: 'student' },
  { name: 'Classe Virtuelle',            path: '/visio',               element: wrapEtudiant(<VisioPage />),               layoutGroup: 'student' },
  { name: 'Mode Deep Work',              path: '/focus',               element: wrapEtudiant(<DeepWorkPage />),            layoutGroup: 'student' },
  { name: 'Ressources pédagogiques',     path: '/ressources',          element: wrapEtudiant(<RessourcesPage />),          layoutGroup: 'student', public: true },
  { name: 'Chansons & Vidéos éducatives', path: '/chansons-educatives', element: wrapEtudiant(<ChansonsEduPage />),         layoutGroup: 'student', public: true },
  { name: 'Motivation & Progrès',        path: '/motivation',          element: wrapEtudiant(<MotivationPage />),          layoutGroup: 'student' },
  { name: 'Mes Questions',               path: '/mes-questions',       element: wrapEtudiant(<MesQuestionsPage />),        layoutGroup: 'student' },
  { name: 'Mes Dépôts',                 path: '/mes-depots',          element: wrapEtudiant(<MesDepotsPage />),           layoutGroup: 'student' },
  { name: 'Accessibilité personnalisée', path: '/accessibilite-perso', element: wrapEtudiant(<AccessibilitePersoPage />), layoutGroup: 'student' },
  { name: 'Mon Profil (redirect)',       path: '/profil',              element: <Navigate to="/espace/profil" replace />,  layoutGroup: 'student' },

  // ── Annuaire & ressources officielles — public (MainLayout) ─────────────────
  { name: 'Actualités Apprenix',         path: '/actualites',              element: wrap(<ActualitesPage />, true),              public: true },
  { name: 'Annuaire des établissements', path: '/etablissements',          element: wrap(<EtablissementsPage />, true),          public: true },
  { name: 'Ressources officielles',      path: '/ressources-officielles',  element: wrap(<RessourcesOfficiellesPage />, true),   public: true },

  // ── Pages légales (toujours publiques) ──────────────────────────────────────
  { name: 'Mentions légales',                path: '/mentions-legales',          element: wrap(<MentionsLegalesPage />, true),         public: true },
  { name: 'Politique de confidentialité',    path: '/politique-confidentialite', element: wrap(<PolitiqueConfidentialitePage />, true), public: true },
  { name: "Conditions d'utilisation",        path: '/cgu',                       element: wrap(<CguPage />, true),                     public: true },

  // ── Pages de confiance & découverte (toujours publiques) ─────────────────────
  { name: 'Notre mission',                   path: '/mission',                   element: wrap(<MissionPage />, true),                 public: true },
  { name: 'Pour les parents',                path: '/parents',                   element: wrap(<ParentsPage />, true),                 public: true },
  { name: 'Sécurité & données',              path: '/securite',                  element: wrap(<SecuritePage />, true),                public: true },
  { name: "Centre d'aide",                   path: '/faq',                       element: wrap(<FaqPage />, true),                     public: true },
  { name: 'Contact',                         path: '/contact',                   element: wrap(<ContactPage />, true),                 public: true },
  { name: 'Merci — Contact',                 path: '/contact/merci',             element: wrap(<ContactMerciPage />, true),             public: true },
  { name: 'Transparence & Conformité',      path: '/transparence',              element: wrap(<TransparencePage />, true),            public: true },
  { name: 'Pour les enseignants',            path: '/enseignants',               element: wrap(<EnseignantsPage />, true),             public: true },
  { name: 'Nouveautés',                      path: '/nouveautes',                element: wrap(<NouveautesPage />, true),              public: true },
  { name: 'Accessibilité',                   path: '/accessibilite',             element: wrap(<AccessibilitePage />, true),           public: true },
  { name: 'Inclusion ULIS & SEGPA',          path: '/inclusion',                 element: wrap(<InclusionPage />, true),               public: true },
  { name: 'Plan du site',                    path: '/plan-du-site',              element: wrap(<PlanDuSitePage />, true),              public: true },

  // ── Espace parents — page autonome avec sa propre garde auth ────────────
  // ParentsEspacePage appelle useApp() directement et redirige si non connecté.
  // Pas de MainLayout (page standalone avec son propre design ApprenixLogo).
  // Pas de RouteGuard ici : doublon redondant qui causait un crash HMR
  // (stale context → useApp() retourne null lors du hot-reload).
  {
    name: 'Espace Parents',
    path: '/parents-espace',
    element: <Suspense fallback={<PageLoader />}><ParentsEspacePage /></Suspense>,
  },

  // ── Administration — accès réservé aux admins ────────────────────────────────
  { name: 'Administration', path: '/administration', element: wrap(<AdministrationPage />, false), public: false },

  // ── Espace Enseignant — nested route (EnseignantLayout parent dans App.tsx) ─
  { name: 'Espace Enseignant',              path: '/espace-enseignant',                  element: wrapTeacher(<EspaceEnseignantDashboard />),       layoutGroup: 'teacher' },
  { name: 'Profil Enseignant',              path: '/espace-enseignant/profil',           element: wrapTeacher(<EnseignantProfilPage />),             layoutGroup: 'teacher' },
  { name: 'Questions Enseignant',           path: '/espace-enseignant/questions',        element: wrapTeacher(<EnseignantQuestionsPage />),          layoutGroup: 'teacher' },
  { name: 'Corrections Enseignant',         path: '/espace-enseignant/corrections',      element: wrapTeacher(<EnseignantCorrectionsPage />),        layoutGroup: 'teacher' },
  { name: 'Contenus Enseignant',            path: '/espace-enseignant/contenus',         element: wrapTeacher(<EnseignantContenusPage />),           layoutGroup: 'teacher' },
  { name: 'Agenda Enseignant',              path: '/espace-enseignant/agenda',           element: wrapTeacher(<EnseignantAgendaPage />),             layoutGroup: 'teacher' },
  { name: 'Messagerie Enseignant',          path: '/espace-enseignant/messagerie',       element: wrapTeacher(<EnseignantMessageriePage />),         layoutGroup: 'teacher' },
  { name: 'Demandes Accompagnement',        path: '/espace-enseignant/demandes',         element: wrapTeacher(<DemandesAccompagnementPage />),       layoutGroup: 'teacher' },
  { name: 'Collaborations Enseignant',      path: '/espace-enseignant/collaborations',   element: wrapTeacher(<CollaborationsEnseignantPage />),     layoutGroup: 'teacher' },

  // ── Landing pages SEO — trafic organique ciblé ───────────────────────────
  { name: 'Révision Bac Français 2026',         path: '/bac-francais',          element: wrap(<BacFrancaisPage />, true),         public: true },
  { name: 'Révision Brevet Maths 2026',         path: '/brevet-maths',          element: wrap(<BrevetMathsPage />, true),         public: true },
  { name: 'Aide aux devoirs gratuite IA',        path: '/aide-devoirs-gratuit',  element: wrap(<AideDevoirsGratuitPage />, true),  public: true },
  { name: 'Flashcards gratuites en ligne',       path: '/flashcards-gratuit',    element: wrap(<FlashcardsGratuitPage />, true),   public: true },
  { name: 'Révision Bac 2026 — Toutes matières', path: '/revision-bac-2026',    element: wrap(<RevisionBac2026Page />, true),     public: true },
  { name: 'Bac Philo 2026',                      path: '/bac-philo',             element: wrap(<BacPhiloPage />, true),            public: true },
  { name: 'Cours Maths Gratuits',                path: '/cours-maths-gratuit',   element: wrap(<CoursMathsGratuitPage />, true),   public: true },
  { name: 'Méthode de Travail Efficace',         path: '/methode-de-travail',    element: wrap(<MethodeDeTravailPage />, true),    public: true },
];
