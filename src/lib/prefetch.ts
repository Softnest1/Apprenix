/**
 * Prefetch map partagé — source unique de vérité pour le préchargement des routes.
 * Importé par Footer, MainLayout et AccueilPage pour éviter toute duplication.
 */
export const ROUTE_PREFETCH: Record<string, () => Promise<unknown>> = {
  '/':                          () => import('@/pages/AccueilPage'),
  '/aide-ia':                   () => import('@/pages/AideIAPage'),
  '/scanner':                   () => import('@/pages/ScannerPage'),
  '/ressources':                () => import('@/pages/RessourcesPage'),
  '/linguistique':              () => import('@/pages/LinguistiquePage'),
  '/maths-sciences':            () => import('@/pages/MathsSciencesPage'),
  '/organisation':              () => import('@/pages/OrganisationPage'),
  '/flashcards':                () => import('@/pages/FlashcardsPage'),
  '/notes':                     () => import('@/pages/NotesPage'),
  '/tableau-de-bord':           () => import('@/pages/EspaceEtudiantPage'),
  '/motivation':                () => import('@/pages/MotivationPage'),
  '/focus':                     () => import('@/pages/DeepWorkPage'),
  '/examen':                    () => import('@/pages/ExamenPage'),
  '/quiz':                      () => import('@/pages/QuizPage'),
  '/carte-mentale':             () => import('@/pages/CarteMentalePage'),
  '/etablissements':            () => import('@/pages/EtablissementsPage'),
  '/ressources-officielles':    () => import('@/pages/RessourcesOfficiellesPage'),
  '/actualites':                () => import('@/pages/ActualitesPage'),
  '/communaute':                () => import('@/pages/CommunautePage'),
  '/connexion':                 () => import('@/pages/ConnexionPage'),
  '/profil':                    () => import('@/pages/ProfilPage'),
  '/mission':                   () => import('@/pages/MissionPage'),
  '/parents':                   () => import('@/pages/ParentsPage'),
  '/enseignants':               () => import('@/pages/EnseignantsPage'),
  '/securite':                  () => import('@/pages/SecuritePage'),
  '/faq':                       () => import('@/pages/FaqPage'),
  '/contact':                   () => import('@/pages/ContactPage'),
  '/nouveautes':                () => import('@/pages/NouveautesPage'),
  '/transparence':              () => import('@/pages/TransparencePage'),
  '/mentions-legales':          () => import('@/pages/MentionsLegalesPage'),
  '/politique-confidentialite': () => import('@/pages/PolitiqueConfidentialitePage'),
  '/cgu':                       () => import('@/pages/CguPage'),
  '/accessibilite':             () => import('@/pages/AccessibilitePage'),
  '/inclusion':                 () => import('@/pages/InclusionPage'),
  // ── Landing pages SEO ──────────────────────────────────────────────────────
  '/bac-francais':         () => import('@/pages/landing/BacFrancaisPage'),
  '/brevet-maths':         () => import('@/pages/landing/BrevetMathsPage'),
  '/aide-devoirs-gratuit': () => import('@/pages/landing/AideDevoirsGratuitPage'),
  '/flashcards-gratuit':   () => import('@/pages/landing/FlashcardsGratuitPage'),
  '/revision-bac-2026':    () => import('@/pages/landing/RevisionBac2026Page'),
  '/bac-philo':            () => import('@/pages/landing/BacPhiloPage'),
  '/cours-maths-gratuit':  () => import('@/pages/landing/CoursMathsGratuitPage'),
  '/methode-de-travail':   () => import('@/pages/landing/MethodeDeTravailPage'),
};

/** Déclenche le préchargement silencieux d'une route au survol */
export const prefetchRoute = (path: string): void => {
  ROUTE_PREFETCH[path]?.().catch(() => {/* silencieux */});
};
