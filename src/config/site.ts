// ─── Configuration du site ────────────────────────────────────────────────────
export const SITE_URL = 'https://apprenix.org'; // ← Vercel (production)
export const SITE_NAME = 'Apprenix';
export const SITE_EMAIL = 'apprenix.contact@gmail.com';

// ─── Description principale — affichée dans Google, WhatsApp, LinkedIn ────────
// ~155 caractères — motivante, inclusive, tous publics
export const SITE_DESCRIPTION =
  'Aide aux devoirs, flashcards et révision gratuits — du CP au Bac+5. Zéro pub, zéro abonnement, zéro donnée revendue. Pour tous les élèves, y compris DYS et ULIS.';

// ─── Slogan court — titres, OG, Twitter ──────────────────────────────────────
export const SITE_TAGLINE = 'Comprendre, réviser et progresser — pour tous, gratuitement.';

// ════════════════════════════════════════════════════════════════════════════
// 🔴 ACTION REQUISE — Codes de vérification moteurs de recherche
//    Sans ces codes, Google ne peut pas confirmer que vous êtes propriétaire
//    du site → impossible de soumettre le sitemap manuellement → PAS DE TRAFIC.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  ÉTAPE 1 — GOOGLE SEARCH CONSOLE (priorité absolue)                     │
// │  ➜ https://search.google.com/search-console/welcome                     │
// │  1. Cliquer "Ajouter une propriété"                                     │
// │  2. Choisir "Préfixe d'URL" → taper https://apprenix.org                │
// │  3. Choisir la méthode "Balise HTML"                                    │
// │  4. Copier la VALEUR du content="XXXXXXXXX"                             │
// │  5. Coller cette valeur ci-dessous dans GOOGLE_SITE_VERIFICATION        │
// │  6. Déployer le site, puis cliquer "Vérifier"                           │
// │                                                                         │
// │  APRÈS VÉRIFICATION :                                                   │
// │  • Aller dans Sitemaps → entrer "sitemap.xml" → Envoyer                 │
// │  • Aller dans Sitemaps → entrer "sitemap-index.xml" → Envoyer           │
// │  • Vérifier "Couverture" → s'assurer que toutes les pages sont indexées │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  ÉTAPE 2 — BING WEBMASTER TOOLS                                         │
// │  ➜ https://www.bing.com/webmasters/about                                │
// │  1. Se connecter avec un compte Microsoft                               │
// │  2. Ajouter le site https://apprenix.org                                │
// │  3. Choisir "Balise meta" → copier la valeur                            │
// │  4. Coller dans BING_SITE_VERIFICATION ci-dessous                       │
// │  5. Soumettre sitemap.xml depuis l'onglet "Sitemaps"                    │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  ÉTAPE 3 — YANDEX WEBMASTER (optionnel, Belgique/Suisse francophones)   │
// │  ➜ https://webmaster.yandex.com                                         │
// │  1. Ajouter le site → choisir "Meta tag" → copier la valeur             │
// │  2. Coller dans YANDEX_SITE_VERIFICATION ci-dessous                     │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  CONSEILS POUR OBTENIR DU TRAFIC RAPIDEMENT                             │
// │                                                                         │
// │  📌 1. Vérifier sur GSC (étape 1 ci-dessus) — URGENT                   │
// │  📌 2. Soumettre sitemap.xml dans GSC et Bing                           │
// │  📌 3. Partager le lien https://apprenix.org sur :                      │
// │        → TikTok (vidéo "j'ai créé une plateforme scolaire gratuite")    │
// │        → Instagram Reels + Stories                                      │
// │        → Facebook groupes "parents élèves" / "aide devoirs"             │
// │        → Reddit r/France, r/etudiant, r/lycee                           │
// │        → Twitter/X avec #Bac2026 #Révisions #Apprenix                   │
// │  📌 4. Demander à 10+ personnes de visiter et de rester 2+ min          │
// │        (signaux comportementaux = Google monte en ranking)               │
// │  📌 5. Créer des backlinks : annuaires éducatifs, blogs enseignants,    │
// │        pages Wikipedia, forums Webmaster                                 │
// └─────────────────────────────────────────────────────────────────────────┘
// ════════════════════════════════════════════════════════════════════════════
export const GOOGLE_SITE_VERIFICATION = ''; // ← COLLER ICI la valeur Google
export const BING_SITE_VERIFICATION    = ''; // ← COLLER ICI la valeur Bing
export const YANDEX_SITE_VERIFICATION  = ''; // ← COLLER ICI la valeur Yandex

