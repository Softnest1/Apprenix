/**
 * ChansonsEduPage — Chansons & Vidéos Éducatives
 *
 * Bibliothèque de vidéos musicales éducatives pour le primaire et autres niveaux.
 * Compatibilité audio multi-appareils : voir ttsUtils.ts
 */
import {
  BookOpen,
  ExternalLink,
  Filter,
  Maximize2,
  Monitor,
  Music,
  Music2,
  Play,
  School,
  Star,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import PageHero from '@/components/ui/PageHero';
import { getAudioTips, getDeviceInfo } from '@/lib/ttsUtils';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoEdu {
  id: string;
  youtubeId: string;        // ID YouTube (embed)
  titre: string;
  description: string;
  niveaux: string[];        // ['CP', 'CE1'] ou ['Tous']
  themes: string[];         // ['Alphabet', 'Lecture', ...]
  duree: string;            // '3 min'
  source: string;           // 'Lumni', 'TFO', ...
  sourceUrl?: string;
  featured?: boolean;
}

// ─── Catalogue vidéos ─────────────────────────────────────────────────────────
// Vidéos éducatives vérifiées — chaînes pédagogiques officielles
const VIDEOS: VideoEdu[] = [
  // ── Alphabet & Lettres ────────────────────────────────────────────────────
  {
    id: 'v1',
    youtubeId: 'hq3yfQnllfQ',
    titre: "L'Alphabet en chanson — A à Z",
    description: "Toutes les lettres de l'alphabet chantées avec des mots illustrés. La vidéo la plus utilisée en classe de CP pour mémoriser l'ordre alphabétique.",
    niveaux: ['CP', 'CE1'],
    themes: ['Alphabet', 'Lecture'],
    duree: '3 min',
    source: 'YouTube Éducatif',
    featured: true,
  },
  {
    id: 'v2',
    youtubeId: '8pDGGBHC9Z0',
    titre: "Les voyelles : A E I O U en chanson",
    description: "Distinguer les voyelles des consonnes grâce à une mélodie entraînante. Idéal pour les CP qui commencent à lire.",
    niveaux: ['CP', 'CE1'],
    themes: ['Alphabet', 'Phonétique'],
    duree: '2 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v3',
    youtubeId: 'J0fdVLMoMM0',
    titre: "Les sons du Français — phonèmes chantés",
    description: "Les sons [ou], [an], [on], [in], [eu] mis en musique pour apprendre à les reconnaître à l'oreille et à l'écrit.",
    niveaux: ['CP', 'CE1', 'CE2'],
    themes: ['Phonétique', 'Lecture'],
    duree: '4 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v4',
    youtubeId: 'kpk2tdsPh0A',
    titre: "Épelle ton prénom — apprendre à épeler",
    description: "Une chanson interactive pour apprendre à épeler les mots lettre par lettre. Chaque enfant peut épeler son propre prénom !",
    niveaux: ['CP', 'CE1'],
    themes: ['Alphabet', 'Lecture'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },

  // ── Chiffres & Maths ──────────────────────────────────────────────────────
  {
    id: 'v5',
    youtubeId: 'D0Ajq682yrA',
    titre: "Compter jusqu'à 20 en chanson",
    description: "Les chiffres de 1 à 20 chantés sur un rythme entraînant. Parfait pour les CP et les GS de maternelle qui apprennent à compter.",
    niveaux: ['CP', 'CE1'],
    themes: ['Chiffres & Maths'],
    duree: '2 min',
    source: 'YouTube Éducatif',
    featured: true,
  },
  {
    id: 'v6',
    youtubeId: 'WJ6D4rKAZ1A',
    titre: "La table de 2 en rap",
    description: "Mémoriser la table de 2 grâce au rap et à la répétition rythmée. Idéale pour les CE1 et CE2 qui débutent les tables.",
    niveaux: ['CE1', 'CE2'],
    themes: ['Chiffres & Maths', 'Tables'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v7',
    youtubeId: 'c9SL_ZWPbGs',
    titre: "Les tables de multiplication chantées (2 à 9)",
    description: "Toutes les tables de 2 à 9 mises en chanson — la méthode préférée des enseignants de CM1 pour ancrer les tables de façon durable.",
    niveaux: ['CE2', 'CM1', 'CM2'],
    themes: ['Chiffres & Maths', 'Tables'],
    duree: '12 min',
    source: 'YouTube Éducatif',
    featured: true,
  },
  {
    id: 'v8',
    youtubeId: 'VIVIegSt81k',
    titre: "Les formes géométriques en chanson",
    description: "Carré, cercle, triangle, rectangle, losange… toutes les formes géométriques apprises en musique avec des exemples du quotidien.",
    niveaux: ['CP', 'CE1', 'CE2'],
    themes: ['Chiffres & Maths', 'Géométrie'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },

  // ── Lecture & Écriture ────────────────────────────────────────────────────
  {
    id: 'v9',
    youtubeId: 'z9ZYL9rxqGE',
    titre: "Les syllabes en chanson : BA BE BI BO BU",
    description: "Apprendre à former des syllabes simples en les chantant. La méthode syllabique rendue musicale — incontournable pour le CP.",
    niveaux: ['CP'],
    themes: ['Phonétique', 'Lecture'],
    duree: '4 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v10',
    youtubeId: '8TLBtS4JJN0',
    titre: "Les mots outils — chanson de grammaire",
    description: "\"Le, la, les, un, une, des, de, du…\" — les mots outils les plus fréquents mis en rime pour les mémoriser naturellement.",
    niveaux: ['CE1', 'CE2'],
    themes: ['Grammaire', 'Lecture'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },

  // ── Sciences & Monde ─────────────────────────────────────────────────────
  {
    id: 'v11',
    youtubeId: 'eVm063xmnow',
    titre: "Les saisons en chanson",
    description: "Printemps, été, automne, hiver — comprendre les saisons et leurs caractéristiques grâce à une comptine illustrée.",
    niveaux: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    themes: ['Sciences', 'Découverte du monde'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v12',
    youtubeId: 'lJIGMRNHYGc',
    titre: "Les animaux de la ferme — chanson et sons",
    description: "Chaque animal chante son propre cri ! Vache, mouton, cochon, poule… Apprentissage du vocabulaire par l'imitation sonore.",
    niveaux: ['CP', 'CE1'],
    themes: ['Sciences', 'Vocabulaire'],
    duree: '4 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v13',
    youtubeId: 'BELlZKpi1Zs',
    titre: "Le système solaire chanté",
    description: "Les 8 planètes du système solaire, leurs caractéristiques et l'ordre du Soleil vers Neptune — en chanson pour ne plus jamais les oublier.",
    niveaux: ['CE2', 'CM1', 'CM2'],
    themes: ['Sciences', 'Astronomie'],
    duree: '5 min',
    source: 'YouTube Éducatif',
  },

  // ── Langues ───────────────────────────────────────────────────────────────
  {
    id: 'v14',
    youtubeId: 'OFM6CPB4E4s',
    titre: "Colors in English — chanson anglais CP/CE1",
    description: "Apprendre les couleurs en anglais en chantant. Red, blue, green, yellow, orange, purple… Les couleurs en anglais mises en musique.",
    niveaux: ['CP', 'CE1', 'CE2'],
    themes: ['Anglais', 'Vocabulaire'],
    duree: '3 min',
    source: 'YouTube Éducatif',
  },
  {
    id: 'v15',
    youtubeId: 'BEoAKub9oQk',
    titre: "Numbers 1–20 in English — comptine anglaise",
    description: "Compter de 1 à 20 en anglais avec une chanson rythmée. Première approche des chiffres en anglais pour les élèves de primaire.",
    niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
    themes: ['Anglais', 'Chiffres & Maths'],
    duree: '2 min',
    source: 'YouTube Éducatif',
  },

  // ── ULIS / Tous niveaux ───────────────────────────────────────────────────
  {
    id: 'v16',
    youtubeId: 'L0MK7qz13bU',
    titre: "Les jours de la semaine en chanson",
    description: "Lundi, mardi, mercredi… Mémoriser les 7 jours de la semaine dans l'ordre grâce à cette comptine très connue des maîtresses de CP.",
    niveaux: ['CP', 'CE1', 'ULIS/SEGPA'],
    themes: ['Vie quotidienne', 'Vocabulaire'],
    duree: '2 min',
    source: 'YouTube Éducatif',
    featured: true,
  },
  {
    id: 'v17',
    youtubeId: 'nGt9jAkWie4',
    titre: "Les couleurs en chanson — arc-en-ciel",
    description: "Rouge, orange, jaune, vert, bleu, indigo, violet — les couleurs de l'arc-en-ciel mises en musique avec une illustration colorée.",
    niveaux: ['CP', 'CE1', 'ULIS/SEGPA'],
    themes: ['Vocabulaire', 'Arts'],
    duree: '2 min',
    source: 'YouTube Éducatif',
  },
];

// ─── Filtres ──────────────────────────────────────────────────────────────────
const NIVEAU_FILTERS = ['Tous', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', 'ULIS/SEGPA'];

const THEME_FILTERS = [
  { id: 'all',           label: 'Tous les thèmes',     emoji: '🎵' },
  { id: 'Alphabet',      label: 'Alphabet & Lettres',  emoji: '🔤' },
  { id: 'Phonétique',    label: 'Phonétique',          emoji: '👄' },
  { id: 'Grammaire',     label: 'Grammaire',           emoji: '📝' },
  { id: 'Lecture',       label: 'Lecture',             emoji: '📖' },
  { id: 'Chiffres & Maths', label: 'Chiffres & Maths', emoji: '🔢' },
  { id: 'Tables',        label: 'Tables de mult.',     emoji: '✖️' },
  { id: 'Sciences',      label: 'Sciences',            emoji: '🌿' },
  { id: 'Anglais',       label: 'Anglais',             emoji: '🇬🇧' },
  { id: 'Vocabulaire',   label: 'Vocabulaire',         emoji: '💬' },
  { id: 'Vie quotidienne', label: 'Vie quotidienne',   emoji: '📅' },
];

// ─── Composant carte vidéo ─────────────────────────────────────────────────────
const VideoCard: React.FC<{ video: VideoEdu }> = ({ video }) => {
  const [playing, setPlaying]   = useState(false);
  const [blocked, setBlocked]   = useState(false); // réseau scolaire bloque YouTube
  const iframeRef               = useRef<HTMLIFrameElement>(null);

  // playsinline=1   → inline sur iOS (pas de plein écran forcé)
  // autoplay=1      → déclenché après clic utilisateur (gesture iOS)
  // enablejsapi=1   → compatibilité Safari/WKWebView
  // fs=1            → bouton plein écran (projecteur)
  // origin=         → sécurité CORS YouTube
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&hl=fr&playsinline=1&enablejsapi=1&fs=1&origin=${encodeURIComponent(window.location.origin)}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;

  // Plein écran natif (bouton Projecteur) — fonctionne sur PC/Mac/Android
  const requestFullscreen = () => {
    const el = iframeRef.current as HTMLIFrameElement & {
      webkitRequestFullscreen?: () => void;
      mozRequestFullScreen?: () => void;
    };
    if (!el) return;
    if (el.requestFullscreen)        el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
  };

  return (
    <Card className={cn('h-full flex flex-col overflow-hidden', video.featured && 'border-primary/30 shadow-card')}>
      {/* Vignette / Lecteur */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {playing && !blocked ? (
          <>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={video.titre}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setBlocked(true)}
            />
            {/* Bouton plein écran / projecteur (PC/Mac) */}
            <button
              type="button"
              onClick={requestFullscreen}
              aria-label="Plein écran — mode projecteur"
              title="Plein écran pour projecteur"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-10"
            >
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        ) : blocked ? (
          /* Fallback réseau scolaire / YouTube bloqué */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
            <WifiOff className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
            <p className="text-xs font-semibold text-foreground">Vidéo non disponible sur ce réseau</p>
            <p className="text-xs text-muted-foreground text-pretty">
              YouTube est peut-être bloqué par le filtre du réseau scolaire.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-1"
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              Ouvrir dans YouTube
            </a>
          </div>
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={`Miniature — ${video.titre}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Overlay play */}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Lire la vidéo : ${video.titre}`}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-primary-foreground ml-1" aria-hidden="true" />
              </div>
            </button>
            {/* Badge durée */}
            <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-mono px-1.5 py-0.5 rounded">
              {video.duree}
            </span>
            {/* Badge vedette */}
            {video.featured && (
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" aria-hidden="true" />
                Coup de cœur
              </span>
            )}
          </>
        )}
      </div>

      {/* Contenu */}
      <CardContent className="flex-1 flex flex-col gap-2 pt-3 pb-3 px-3">
        <h3 className="text-sm font-bold text-foreground text-balance leading-snug">
          {video.titre}
        </h3>
        <p className="text-xs text-muted-foreground text-pretty leading-relaxed flex-1">
          {video.description}
        </p>

        {/* Niveaux */}
        <div className="flex flex-wrap gap-1 mt-1">
          {video.niveaux.map(n => (
            <Badge key={n} variant="secondary" className="text-xs px-1.5 py-0">{n}</Badge>
          ))}
        </div>

        {/* Thèmes */}
        <div className="flex flex-wrap gap-1">
          {video.themes.map(t => (
            <Badge key={t} variant="outline" className="text-xs px-1.5 py-0 text-primary border-primary/30">
              {t}
            </Badge>
          ))}
        </div>

        {/* Source + lien externe */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground">{video.source}</span>
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            aria-label={`Ouvrir ${video.titre} sur YouTube`}
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            YouTube
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Bannière conseils audio (détectée une fois au montage) ───────────────────
const AudioTipsBanner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const tips = useMemo(() => getAudioTips(getDeviceInfo()), []);

  return (
    <div className="rounded-xl border border-chart-2/30 bg-chart-2/5">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <Volume2 className="w-5 h-5 text-chart-2 shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            🎧 Conseils son — iPhone, Android, PC, Mac &amp; Projecteur
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
            Cliquez pour voir les conseils adaptés à votre appareil (haut-parleurs, Bluetooth, HDMI…)
          </p>
        </div>
        <Monitor className="w-4 h-4 text-chart-2 shrink-0" aria-hidden="true" />
      </button>
      {open && (
        <div className="border-t border-chart-2/20 px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map(tip => (
            <div key={tip.titre} className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border">
              <span className="text-lg shrink-0" aria-hidden="true">{tip.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{tip.titre}</p>
                <p className="text-xs text-muted-foreground text-pretty mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
          {/* Conseil réseau scolaire */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border md:col-span-2">
            <Wifi className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Réseau scolaire — YouTube parfois bloqué</p>
              <p className="text-xs text-muted-foreground text-pretty mt-0.5">
                Certains établissements bloquent YouTube via leur pare-feu. Si une vidéo n'apparaît pas,
                un lien <strong>«&nbsp;Ouvrir dans YouTube&nbsp;»</strong> s'affichera directement sur la carte.
                Vous pouvez aussi demander à votre administrateur réseau d'autoriser <code>youtube-nocookie.com</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page principale ───────────────────────────────────────────────────────────
const ChansonsEduPage: React.FC = () => {
  const [niveauActif, setNiveauActif] = useState('Tous');
  const [themeActif, setThemeActif]   = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const videosFiltrees = useMemo(() => {
    return VIDEOS.filter(v => {
      const matchNiveau = niveauActif === 'Tous' || v.niveaux.includes(niveauActif);
      const matchTheme  = themeActif === 'all'   || v.themes.includes(themeActif);
      return matchNiveau && matchTheme;
    });
  }, [niveauActif, themeActif]);

  const videosVedettes = useMemo(() => VIDEOS.filter(v => v.featured), []);

  return (
    <div className="min-w-0 space-y-6">
      <SEO
        title="Chansons & Vidéos Éducatives — Alphabet, Tables, Sciences | Apprenix"
        description="Bibliothèque de vidéos musicales éducatives pour le CP, CE1, CE2, CM1, CM2 et ULIS/SEGPA. Alphabet en chanson, tables de multiplication chantées, phonétique, sciences."
        canonical="/chansons-educatives"
        keywords="chansons éducatives CP, alphabet en chanson, tables multiplication chanson, phonétique musique, vidéos éducatives primaire, comptines école"
        dateModified="2026-06-18"
      />

      {/* Hero */}
      <PageHero
        variant="tool"
        icon={Music}
        badge={<>🎵 Chansons & Vidéos</>}
        badgeClassName="bg-chart-2/10 text-chart-2 border-chart-2/20"
        title="Apprendre en chantant !"
        subtitle="Des vidéos musicales soigneusement sélectionnées pour mémoriser l'alphabet, les tables de multiplication, la phonétique et bien plus — du CP au CM2."
        stats={[
          { value: String(VIDEOS.length),                     label: 'Vidéos sélectionnées' },
          { value: String(VIDEOS.filter(v => v.featured).length), label: 'Coups de cœur' },
          { value: '0',                                       label: 'Publicité' },
        ]}
      >
        <ENBadge />
      </PageHero>

      {/* ── Bannière conseils son multi-appareils ── */}
      <AudioTipsBanner />

      {/* ── Vidéos vedettes ── */}
      <section aria-labelledby="vedettes-titre">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 id="vedettes-titre" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              Les coups de cœur
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Les vidéos les plus populaires en classe — validées par des enseignants
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videosVedettes.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>

      {/* ── Filtres ── */}
      <section aria-label="Filtres de recherche">
        {/* Bouton afficher/masquer filtres (mobile) */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <Music2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            Toutes les vidéos
            <Badge variant="secondary" className="text-xs">{videosFiltrees.length}</Badge>
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 md:hidden"
            onClick={() => setShowFilters(v => !v)}
          >
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            Filtrer
          </Button>
        </div>

        {/* Filtres niveau — tablettes+ toujours visibles */}
        <div className={cn('space-y-3', !showFilters && 'hidden md:block')}>
          {/* Niveaux */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              Niveau :
            </span>
            {NIVEAU_FILTERS.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNiveauActif(n)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors min-h-[32px]',
                  niveauActif === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Thèmes */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              Thème :
            </span>
            {THEME_FILTERS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeActif(t.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors min-h-[32px]',
                  themeActif === t.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grille de vidéos ── */}
      {videosFiltrees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Music className="w-10 h-10 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">Aucune vidéo pour ces filtres</p>
          <p className="text-sm text-muted-foreground">Essaie un autre niveau ou un autre thème.</p>
          <Button variant="outline" size="sm" onClick={() => { setNiveauActif('Tous'); setThemeActif('all'); }}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videosFiltrees.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}

      {/* ── Bloc enseignants ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-balance">
            <School className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            Pour les enseignants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-sm text-muted-foreground text-pretty">
            Ces vidéos peuvent être projetées en classe, intégrées dans un plan de leçon ou envoyées
            aux parents comme soutien à domicile. Elles sont toutes gratuites, sans publicité en mode
            intégré (lecteur YouTube), et conformes aux usages pédagogiques (droit de représentation
            en classe — article L. 122-5 du CPI).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {[
              { emoji: '🖥️', titre: 'Projecteur', desc: 'Lancez directement depuis cette page sur votre TBI ou vidéoprojecteur' },
              { emoji: '📋', titre: 'Fiche pédagogique', desc: 'Combinez avec les fiches méthode Apprenix pour une séance complète' },
              { emoji: '🏠', titre: 'Devoir maison', desc: 'Partagez le lien aux parents pour que l\'enfant revoie la chanson chez lui' },
            ].map(({ emoji, titre, desc }) => (
              <div key={titre} className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border">
                <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{titre}</p>
                  <p className="text-xs text-muted-foreground text-pretty mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/enseignants">
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Espace enseignants
              </Button>
            </Link>
            <Link to="/aide-ia">
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Fiches méthode
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChansonsEduPage;
