/**
 * ttsUtils.ts — Utilitaires audio/TTS multi-appareils
 *
 * Couverture :
 *  iOS Safari/Chrome    — gesture chain, keepalive 10 s, voix Amélie/Thomas
 *  Android Chrome       — voix chargées async via onvoiceschanged, "Google français"
 *  Windows Chrome/Edge  — Microsoft Hortense / Microsoft Paul / Google français
 *  Windows Firefox      — SAPI voix Windows, délai 100 ms avant speak()
 *  macOS Safari/Chrome  — Thomas, Amélie
 *  Samsung Internet     — TTS limité → détection + avertissement
 *  Projecteur / HDMI    — Mode Classe : volume 1.0 + rate réduit
 */

// ─── Détection appareil ────────────────────────────────────────────────────────

export type DeviceType = 'ios' | 'android' | 'windows' | 'mac' | 'other';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  browser: string;
  hasTTS: boolean;
  hasAudioContext: boolean;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return { type: 'other', isMobile: false, isTablet: false, browser: 'unknown', hasTTS: false, hasAudioContext: false };
  }
  const ua = navigator.userAgent;
  const platform = navigator.platform ?? '';

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isAndroid = /Android/.test(ua);
  const isMac     = /Mac/.test(platform) && !isIOS;
  const isWindows = /Win/.test(platform);

  const isMobile  = /Mobi|Android|iPhone|iPod/.test(ua);
  const isTablet  = /iPad/.test(ua) || (/Android/.test(ua) && !/Mobi/.test(ua));

  let browser = 'unknown';
  if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/OPR|Opera/.test(ua)) browser = 'opera';
  else if (/Edg\//.test(ua))     browser = 'edge';
  else if (/Firefox/.test(ua))   browser = 'firefox';
  else if (/Chrome/.test(ua))    browser = 'chrome';
  else if (/Safari/.test(ua))    browser = 'safari';

  const type: DeviceType = isIOS ? 'ios' : isAndroid ? 'android' : isMac ? 'mac' : isWindows ? 'windows' : 'other';

  return {
    type,
    isMobile,
    isTablet,
    browser,
    hasTTS: typeof window !== 'undefined' && 'speechSynthesis' in window,
    hasAudioContext: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
  };
}

// ─── Sélection de la meilleure voix française ─────────────────────────────────

const FR_VOICE_PRIORITIES = [
  // macOS / iOS
  'Amélie', 'Thomas', 'Aurelie',
  // Windows
  'Microsoft Hortense', 'Microsoft Paul',
  // Google (Chrome / Android)
  'Google français', 'Google French',
  // Générique
  'fr-FR', 'fr_FR', 'fr',
];

let cachedVoice: SpeechSynthesisVoice | null = null;

/** Retourne la meilleure voix française disponible, ou null si aucune. */
export function getBestFrenchVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  // Retourne le cache si disponible et toujours dans la liste
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;

  // Priorité 1 : nom exact
  for (const name of FR_VOICE_PRIORITIES) {
    const match = voices.find(v => v.name === name);
    if (match) { cachedVoice = match; return match; }
  }

  // Priorité 2 : lang fr-* ou fr_*
  const frVoice = voices.find(v => v.lang.startsWith('fr'));
  if (frVoice) { cachedVoice = frVoice; return frVoice; }

  return null;
}

/** Liste toutes les voix françaises disponibles (pour le sélecteur UI). */
export function getFrenchVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr'));
}

// ─── Chargement asynchrone des voix (Android Chrome / Firefox) ────────────────

/**
 * Attend que les voix soient chargées (Android / Firefox les charge de façon async).
 * Résout après 2 s max pour ne pas bloquer l'UI.
 */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve([]); return; }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }

    const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

// ─── Déblocage AudioContext (Chrome/Safari politique autoplay) ─────────────────

let audioContextUnlocked = false;

/**
 * Débloque l'AudioContext du navigateur lors du premier clic utilisateur.
 * Nécessaire sur certains navigateurs (Safari, Chrome mobile) qui suspendent
 * l'audio tant qu'aucun geste n'a eu lieu.
 */
export function unlockAudioContext(): void {
  if (audioContextUnlocked) return;
  try {
    const AudioCtx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    audioContextUnlocked = true;
  } catch {
    // AudioContext non supporté — silencieux
  }
}

// ─── Construction d'une utterance optimisée ────────────────────────────────────

export interface TTSOptions {
  rate?: number;    // 0.6–1.3 (défaut 0.85)
  pitch?: number;   // 0.8–1.2 (défaut 1.05)
  volume?: number;  // 0–1     (défaut 1.0)
  voice?: SpeechSynthesisVoice | null;
}

export function buildUtterance(text: string, opts: TTSOptions = {}): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang   = 'fr-FR';
  utt.rate   = opts.rate   ?? 0.85;
  utt.pitch  = opts.pitch  ?? 1.05;
  utt.volume = opts.volume ?? 1.0;
  const voice = opts.voice ?? getBestFrenchVoice();
  if (voice) utt.voice = voice;
  return utt;
}

// ─── Durée estimée (fallback onend) ───────────────────────────────────────────

export function estimateDuration(text: string, rate: number): number {
  const baseSecs = (text.length * 0.07) / rate;
  return Math.max(2000, baseSecs * 1000 + 1500);
}

// ─── Stop global ──────────────────────────────────────────────────────────────

export function stopSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─── Détection iOS (utilitaire rapide) ────────────────────────────────────────

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// ─── Conseil audio par appareil (affiché dans l'UI) ──────────────────────────

export interface AudioTip {
  icon: string;
  titre: string;
  desc: string;
}

export function getAudioTips(info: DeviceInfo): AudioTip[] {
  const tips: AudioTip[] = [];

  if (info.type === 'ios') {
    tips.push({
      icon: '🔕',
      titre: 'Bouton silencieux iPhone/iPad',
      desc: 'Le petit interrupteur sur le côté droit met l\'appareil en mode silencieux. Assurez-vous qu\'il est bien sur la position sonore (pas de ligne orange visible).',
    });
    tips.push({
      icon: '🔊',
      titre: 'Volume média iOS',
      desc: 'Utilisez les boutons Volume + et Volume − sur le côté de l\'appareil pendant la lecture. Le volume de sonnerie et le volume média sont séparés sur iOS.',
    });
  }

  if (info.type === 'android') {
    tips.push({
      icon: '🔊',
      titre: 'Volume média Android',
      desc: 'Appuyez sur Volume + pendant la lecture vidéo ou vocale. Certains Android ont un volume « Média » séparé du volume d\'appel — vérifiez dans Paramètres → Sons.',
    });
    if (info.browser === 'samsung') {
      tips.push({
        icon: '⚠️',
        titre: 'Samsung Internet — voix limitée',
        desc: 'Samsung Internet peut bloquer la synthèse vocale. Ouvrez cette page dans Chrome ou Firefox pour une meilleure expérience vocale.',
      });
    }
  }

  if (info.type === 'windows') {
    tips.push({
      icon: '🖥️',
      titre: 'Projecteur / écran externe (Windows)',
      desc: 'Si le son ne sort pas par le projecteur, allez dans Paramètres → Système → Son → et sélectionnez le périphérique de sortie HDMI/DisplayPort. Vérifiez aussi que le volume du mixeur Windows n\'est pas coupé pour ce navigateur.',
    });
    tips.push({
      icon: '🔇',
      titre: 'Son coupé dans le navigateur',
      desc: 'Cliquez droit sur l\'onglet dans Chrome/Edge → vérifiez que « Réactiver le son » est disponible. Certains onglets sont mis en sourdine automatiquement.',
    });
  }

  if (info.type === 'mac') {
    tips.push({
      icon: '🖥️',
      titre: 'Projecteur / HDMI (Mac)',
      desc: 'Allez dans Préférences Système → Son → Sortie, et sélectionnez votre écran ou projecteur HDMI. Sur macOS Ventura+ : Réglages Système → Son → Sortie.',
    });
    tips.push({
      icon: '🍎',
      titre: 'Safari — autorisation audio',
      desc: 'Si la synthèse vocale ne démarre pas sur Safari, allez dans Safari → Réglages pour ce site → Lecture automatique → Autoriser tout le contenu automatique.',
    });
  }

  // Conseil universel haut-parleurs Bluetooth
  tips.push({
    icon: '📡',
    titre: 'Haut-parleur Bluetooth',
    desc: 'Si vous utilisez une enceinte Bluetooth, assurez-vous qu\'elle est bien connectée AVANT d\'ouvrir la page. Reconnecter en cours de lecture peut couper le son.',
  });

  // Conseil projecteur universel
  tips.push({
    icon: '📽️',
    titre: 'Utilisation en classe avec projecteur',
    desc: 'Branchez le câble HDMI avant de lancer la vidéo. Réglez le volume du navigateur au maximum et ajustez ensuite sur le projecteur/ampli de la salle. Le Mode Classe agrandit le texte et monte le volume pour une meilleure lisibilité.',
  });

  return tips;
}
