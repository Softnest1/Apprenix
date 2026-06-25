import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BING_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL, YANDEX_SITE_VERIFICATION } from '@/config/site';

const BASE_URL = SITE_URL;
const DEFAULT_IMAGE = BASE_URL ? `${BASE_URL}/og-image.png` : '/og-image.png';
const SITE_NAME_LABEL = SITE_NAME;

// ─── Mots-clés par défaut — longue traîne, multi-audience, francophone ─────
const DEFAULT_KEYWORDS =
  'plateforme éducative gratuite, aide aux devoirs gratuite, aide aux devoirs IA, révision scolaire, flashcards gratuits, fiches de révision, lycée, collège, école primaire, université, Bac 2026, Brevet 2026, Parcoursup 2026, intelligence artificielle éducation, organisation scolaire, Apprenix, apprendre gratuitement, cours en ligne gratuit, révisions bac, méthode de travail efficace, outils pour élèves handicapés, DYS dyslexie, ULIS SEGPA, enseignants ressources pédagogiques conformes Éduscol, parents accompagnement enfants école, scanner exercices photo IA, alternative Skolengo gratuit, alternative Pronote';

// ─── Noms lisibles des routes — utilisé par BreadcrumbList auto-généré ──────────
const ROUTE_LABELS: Record<string, string> = {
  'aide-ia':                    'Aide aux devoirs IA',
  'ressources':                 'Ressources pédagogiques',
  'communaute':                 'Communauté',
  'scanner':                    'Scanner de devoirs',
  'linguistique':               'Outils linguistiques',
  'maths-sciences':             'Maths & Sciences',
  'organisation':               'Organisation',
  'flashcards':                 'Flashcards',
  'actualites':                 'Actualités',
  'parents':                    'Espace parents',
  'enseignants':                'Espace enseignants',
  'notes':                      'Notes de cours',
  'espace':                     'Mon espace',
  'primaire':                   'Primaire',
  'college':                    'Collège',
  'lycee':                      'Lycée',
  'superieur':                  'Études supérieures',
  'focus':                      'Mode Deep Work',
  'motivation':                 'Motivation & Progrès',
  'contact':                    'Contact',
  'transparence':               'Transparence',
  'connexion':                  'Connexion',
  'nouveautes':                 'Nouveautés',
  'mission':                    'Notre mission',
  'securite':                   'Sécurité & données',
  'faq':                        'Centre d\'aide',
  'accessibilite':              'Accessibilité',
  'inclusion':                  'Inclusion ULIS & SEGPA',
  'carte-mentale':              'Carte mentale',
  'quiz':                       'Quiz interactif',
  'examen':                     'Mode examen',
  'ressources-officielles':     'Ressources officielles',
  'etablissements':             'Annuaire établissements',
  'visio':                      'Classe virtuelle',
  'mentions-legales':           'Mentions légales',
  'politique-confidentialite':  'Politique de confidentialité',
  'cgu':                        'Conditions d\'utilisation',
  'parents-espace':             'Espace parents connecté',
  'tableau-de-bord':            'Tableau de bord',
  'profil':                     'Mon profil',
  // ── Landing pages SEO ──────────────────────────────────────────────────────
  'bac-francais':               'Révision Bac Français 2026',
  'brevet-maths':               'Révision Brevet Maths 2026',
  'aide-devoirs-gratuit':       'Aide aux devoirs gratuite IA',
  'flashcards-gratuit':         'Flashcards gratuites en ligne',
  'revision-bac-2026':          'Révision Bac 2026',
};

export interface SEOProps {
  title?: string;
  description?: string;
  /** Mots-clés — chaîne CSV ou tableau de chaînes */
  keywords?: string | string[];
  /** Mots-clés Google News / Actualités — séparés par virgule */
  newsKeywords?: string;
  canonical?: string;
  /** URL absolue de l'image OG (1200×630) — utilise og-image.png par défaut */
  ogImage?: string;
  ogType?: 'website' | 'article';
  /** Masquer la page des moteurs (pages privées / 404) */
  noIndex?: boolean;
  /** Données JSON-LD supplémentaires injectées après le WebPage de base */
  jsonLd?: object | object[];
  /** Date de dernière modification ISO (ex: "2026-06-18") — affecte le schema WebPage */
  dateModified?: string;
  /** Durée de lecture en minutes (pages articles) */
  readingTime?: number;
  /**
   * Fil d'Ariane personnalisé — génère un BreadcrumbList schema.org
   * Si non fourni, il est auto-généré depuis le canonical.
   */
  breadcrumbs?: Array<{ name: string; url?: string }>;
}

/**
 * Composant SEO universel — Apprenix
 *
 * Couverture complète :
 *   - Google / Googlebot / Google Discover
 *   - Bing / DuckDuckGo / Ecosia / Qwant
 *   - Apple Safari (iOS 16+, iPadOS, macOS)
 *   - Facebook / Instagram / WhatsApp / iMessage (Open Graph)
 *   - Twitter / X (Card)
 *   - LinkedIn (OG + article:author)
 *   - Pinterest (Rich Pins)
 *   - Telegram / Discord / Slack (OG)
 *   - Samsung Internet / Opera / Edge (theme-color, manifest)
 *   - Microsoft (msapplication)
 *   - Yandex / Naver / Baidu (robots, description)
 *   - Schema.org JSON-LD : WebPage + données passées
 *   - Dublin Core (bibliothèques, institutions)
 *   - Protection anti-scraping IA (GPTBot, CCBot, Google-Extended…)
 *
 * À placer EN PREMIER dans chaque page, avant tout autre contenu.
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  newsKeywords,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
  jsonLd,
  dateModified,
  readingTime,
  breadcrumbs,
}) => {
  const keywordsStr = Array.isArray(keywords)
    ? keywords.join(', ')
    : (keywords ?? DEFAULT_KEYWORDS);

  // ── Titre complet (évite le doublon "Apprenix — … — Apprenix") ──────────────
  const fullTitle = title
    ? title.includes('Apprenix')
      ? title
      : `${title} | Apprenix`
    : `Apprenix — Plateforme éducative 100% gratuite`;

  const metaDesc = description ?? SITE_DESCRIPTION;

  // ── URL canonique — absolue si domaine configuré, relative sinon ──────────
  const canonicalUrl = canonical
    ? BASE_URL ? `${BASE_URL}${canonical}` : canonical
    : BASE_URL || '/';

  // ── Image OG absolue (requis WhatsApp, iMessage, LinkedIn) ───────────────
  const ogImageAbsolute = ogImage.startsWith('http')
    ? ogImage
    : BASE_URL ? `${BASE_URL}${ogImage}` : ogImage;

  const now = new Date();
  const year = now.getFullYear();
  const isoNow = now.toISOString();
  const isoModified = dateModified ?? isoNow;

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  // ── BreadcrumbList — auto-généré depuis le canonical ou prop breadcrumbs ──
  const buildBreadcrumbs = (): Array<{ name: string; url?: string }> => {
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs;
    // Auto-génération depuis le chemin de l'URL canonique
    const path = canonical ?? '';
    if (!path || path === '/') return [];
    const segments = path.replace(/^\//, '').split('/').filter(Boolean);
    const items: Array<{ name: string; url: string }> = [
      { name: 'Accueil', url: `${BASE_URL || 'https://apprenix.org'}/` },
    ];
    let built = '';
    for (const seg of segments) {
      built += `/${seg}`;
      items.push({
        name: ROUTE_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        url: `${BASE_URL || 'https://apprenix.org'}${built}`,
      });
    }
    return items;
  };
  const breadcrumbItems = buildBreadcrumbs();
  const breadcrumbSchema = breadcrumbItems.length > 1
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbItems.map((item, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'name': item.name,
          ...(item.url ? { 'item': item.url } : {}),
        })),
      }
    : null;

  // Schema WebPage de base — auto-généré pour chaque page
  const webPageSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ogType === 'article' ? 'Article' : 'WebPage',
    name: fullTitle,
    headline: fullTitle,
    description: metaDesc,
    url: canonicalUrl,
    inLanguage: 'fr-FR',
    dateModified: isoModified,
    datePublished: '2024-01-01',
    ...(readingTime ? { timeRequired: `PT${readingTime}M` } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME_LABEL,
      url: BASE_URL || 'https://apprenix.org',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL || 'https://apprenix.org'}/aide-ia?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    author: {
      '@type': 'Person',
      name: 'Charly Soudan',
      jobTitle: 'Fondateur d\'Apprenix',
      nationality: { '@type': 'Country', name: 'France' },
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME_LABEL,
      url: BASE_URL || 'https://apprenix.org',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL || 'https://apprenix.org'}/apprenix-logo.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'apprenix.contact@gmail.com',
        availableLanguage: 'French',
      },
    },
    image: {
      '@type': 'ImageObject',
      url: ogImageAbsolute,
      width: 1200,
      height: 630,
    },
    copyrightYear: year,
    copyrightHolder: { '@type': 'Organization', name: SITE_NAME_LABEL },
    accessMode: ['visual', 'textual'],
    accessibilityFeature: ['highContrast', 'largePrint', 'readingOrder', 'structuralNavigation'],
    educationalUse: 'Self-study',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
  };

  const allJsonLd = [
    webPageSchema,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...jsonLdArray,
  ];

  return (
    <Helmet>
      {/* ══════════════════════════════════════════════════════════════════
          TITRE — limité à ~60 caractères pour SERP Google
      ══════════════════════════════════════════════════════════════════ */}
      <title>{fullTitle}</title>

      {/* ══════════════════════════════════════════════════════════════════
          SEO FONDAMENTAL
      ══════════════════════════════════════════════════════════════════ */}
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={keywordsStr} />
      {newsKeywords && <meta name="news_keywords" content={newsKeywords} />}
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        }
      />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="bingbot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      {/* Yandex (Russie + Belgique/Suisse francophones) */}
      <meta name="yandex" content={noIndex ? 'none' : 'index, follow'} />
      {/* Slurp — Yahoo / Oath / Verizon Media */}
      <meta name="slurp" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      {/* Teoma — Ask.com */}
      <meta name="teoma" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* ══════════════════════════════════════════════════════════════════
          PROPRIÉTÉ INTELLECTUELLE & COPYRIGHT
      ══════════════════════════════════════════════════════════════════ */}
      <meta name="author" content={`Charly Soudan — ${SITE_NAME_LABEL}`} />
      <meta name="copyright" content={`© ${SITE_NAME_LABEL} ${year} — Tous droits réservés`} />
      <meta name="owner" content={SITE_NAME_LABEL} />
      <meta name="creator" content="Charly Soudan" />
      <meta name="publisher" content={SITE_NAME_LABEL} />

      {/* Dublin Core — bibliothèques, institutions, ENT */}
      <meta name="DC.title" content={fullTitle} />
      <meta name="DC.creator" content="Charly Soudan" />
      <meta name="DC.publisher" content={SITE_NAME_LABEL} />
      <meta name="DC.rights" content={`Copyright © ${SITE_NAME_LABEL} ${year}`} />
      <meta name="DC.language" content="fr" />
      <meta name="DC.type" content="InteractiveResource" />
      <meta name="DC.format" content="text/html" />
      <meta name="DC.audience" content="Élèves, Étudiants, Enseignants, Parents" />

      {/* ══════════════════════════════════════════════════════════════════
          PROTECTION ANTI-SCRAPING IA (TDMREP + robots par agent)
          Note : googlebot principal ne reçoit PAS noai (évite d'inhiber l'indexation)
          Google-Extended est l'agent IA séparé de Gemini — à bloquer séparément
      ══════════════════════════════════════════════════════════════════ */}
      <meta name="CCBot" content="noindex" />
      <meta name="GPTBot" content="noindex" />
      <meta name="ChatGPT-User" content="noindex" />
      <meta name="Google-Extended" content="noindex" />
      <meta name="Anthropic-AI" content="noindex" />
      <meta name="PerplexityBot" content="noindex" />
      <meta name="Bytespider" content="noindex" />

      {/* ══════════════════════════════════════════════════════════════════
          CANONICAL & HREFLANG (évite le contenu dupliqué)
      ══════════════════════════════════════════════════════════════════ */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr" href={canonicalUrl} />
      <link rel="alternate" hrefLang="fr-FR" href={canonicalUrl} />
      {BASE_URL && <link rel="alternate" hrefLang="x-default" href={BASE_URL} />}

      {/* ══════════════════════════════════════════════════════════════════
          OPEN GRAPH — Facebook · LinkedIn · WhatsApp · Discord · Slack
                      iMessage · Telegram · Instagram · Threads
      ══════════════════════════════════════════════════════════════════ */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME_LABEL} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:locale:alternate" content="fr_BE" />
      <meta property="og:locale:alternate" content="fr_CH" />
      <meta property="og:locale:alternate" content="fr_CA" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageAbsolute} />
      <meta property="og:image:secure_url" content={ogImageAbsolute} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} — aperçu`} />
      <meta property="og:updated_time" content={isoModified} />
      {/* LinkedIn spécifique */}
      <meta property="article:author" content="Charly Soudan" />
      <meta property="article:publisher" content={BASE_URL || 'https://apprenix.org'} />
      <meta property="article:modified_time" content={isoModified} />

      {/* ══════════════════════════════════════════════════════════════════
          TWITTER / X CARD — summary_large_image (1200×630)
      ══════════════════════════════════════════════════════════════════ */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@apprenix" />
      <meta name="twitter:creator" content="@apprenix" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImageAbsolute} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:label1" content="Prix" />
      <meta name="twitter:data1" content="100% gratuit — à vie, sans pub" />
      <meta name="twitter:label2" content="Niveaux couverts" />
      <meta name="twitter:data2" content="CP, Collège, Lycée, Bac+5" />

      {/* ══════════════════════════════════════════════════════════════════
          PINTEREST — Rich Pins (articles, produits)
      ══════════════════════════════════════════════════════════════════ */}
      <meta name="pinterest-rich-pin" content="true" />
      <meta name="pinterest:description" content={metaDesc} />

      {/* ══════════════════════════════════════════════════════════════════
          CROSS-BROWSER / CROSS-DEVICE
          Opera GX/Mobile, Mi Browser (Xiaomi MIUI), UC Browser,
          X5 Engine (WeChat/QQ), Samsung Internet, Firefox, Edge
      ══════════════════════════════════════════════════════════════════ */}
      {/* Compatible tous appareils (PC, tablette, mobile) */}
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="375" />
      <meta name="applicable-device" content="pc,mobile" />
      {/* Xiaomi MIUI Browser — plein écran + mode appli + mode nuit */}
      <meta name="full-screen" content="yes" />
      <meta name="browsermode" content="application" />
      <meta name="nightmode" content="enable" />
      <meta name="layoutmode" content="fitscreen" />
      {/* Tencent X5 Engine (WeChat, QQ) — plein écran + mode appli */}
      <meta name="x5-fullscreen" content="true" />
      <meta name="x5-page-mode" content="app" />
      <meta name="x5-orientation" content="portrait|landscape" />
      {/* Baidu — empêche traduction automatique non souhaitée */}
      <meta name="baidu-trans" content="no" />
      <meta name="application-name" content={SITE_NAME_LABEL} />
      <meta name="category" content="education" />
      <meta name="classification" content="Education, Productivity, EdTech" />
      <meta name="coverage" content="France, Belgique, Suisse, Canada francophone" />
      <meta name="target" content="Élèves, Étudiants, Parents, Enseignants" />
      <meta name="rating" content="general" />
      <meta name="language" content="fr" />
      <meta name="geo.region" content="FR-93" />
      <meta name="geo.placename" content="Tremblay-en-France, Île-de-France, France" />
      <meta name="geo.position" content="48.9751;2.5627" />
      <meta name="ICBM" content="48.9751, 2.5627" />
      <meta name="revisit-after" content="7 days" />

      {/* ══════════════════════════════════════════════════════════════════
          GOOGLE SEARCH CONSOLE / BING WEBMASTER TOOLS / YANDEX
          → Remplir GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION,
            YANDEX_SITE_VERIFICATION dans src/config/site.ts
      ══════════════════════════════════════════════════════════════════ */}
      {GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />}
      {BING_SITE_VERIFICATION    && <meta name="msvalidate.01"           content={BING_SITE_VERIFICATION} />}
      {YANDEX_SITE_VERIFICATION  && <meta name="yandex-verification"     content={YANDEX_SITE_VERIFICATION} />}

      {/* ── Fediverse / Mastodon creator — ActivityPub, Mastodon 4.3+ ── */}
      <meta name="fediverse:creator" content="@apprenix@mastodon.social" />

      {/* ══════════════════════════════════════════════════════════════════
          JSON-LD STRUCTURÉ — WebPage + BreadcrumbList + données injectées
      ══════════════════════════════════════════════════════════════════ */}
      {allJsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
