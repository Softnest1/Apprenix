/**
 * LectureGuideeModal — Mode Lecture Guidée plein écran
 *
 * Compatibilité multi-appareils (voir ttsUtils.ts pour le détail) :
 *  iOS Safari/Chrome   — gesture chain + keepalive 10 s + fallback onend
 *  Android Chrome      — voix async (onvoiceschanged) + "Google français"
 *  Windows Chrome/Edge — Microsoft Hortense/Paul + volume système
 *  Firefox             — délai 100 ms avant speak()
 *  macOS Safari/Chrome — Thomas / Amélie
 *  Samsung Internet    — détection + avertissement + lien Chrome
 *  Mode Classe         — volume max + texte XXL + fond sombre pour projecteur
 */
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildUtterance,
  estimateDuration,
  getDeviceInfo,
  getFrenchVoices,
  isIOS,
  stopSpeech,
  unlockAudioContext,
  waitForVoices,
} from '@/lib/ttsUtils';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step { label: string; detail: string; }

interface FicheForLecture {
  titre: string;
  subject: string;
  steps: Step[];
  conseil?: string;
  exemple?: string;
}

interface LectureGuideeModalProps {
  fiche: FicheForLecture;
  onClose: () => void;
}

// ─── Sélecteur de vitesse ─────────────────────────────────────────────────────

const SPEEDS = [
  { label: 'Très lent', value: 0.6 },
  { label: 'Lent',      value: 0.8 },
  { label: 'Normal',    value: 1.0 },
  { label: 'Rapide',    value: 1.3 },
];

// ─── Composant principal ──────────────────────────────────────────────────────

const LectureGuideeModal: React.FC<LectureGuideeModalProps> = ({ fiche, onClose }) => {
  const slides: { type: 'step' | 'conseil' | 'exemple'; num?: number; label: string; detail: string }[] = [
    ...fiche.steps.map((s, i) => ({ type: 'step' as const, num: i + 1, label: s.label, detail: s.detail })),
    ...(fiche.conseil ? [{ type: 'conseil' as const, label: '💡 Conseil de méthode', detail: fiche.conseil }] : []),
    ...(fiche.exemple ? [{ type: 'exemple' as const, label: '📝 Exemple',            detail: fiche.exemple }] : []),
  ];

  const [current,      setCurrent]      = useState(0);
  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [rate,         setRate]         = useState(0.85);
  const [volume,       setVolume]       = useState(1.0);
  const [autoAdvance,  setAutoAdvance]  = useState(true);
  const [finished,     setFinished]     = useState(false);
  const [ttsBlocked,   setTtsBlocked]   = useState(false);
  const [classeMode,   setClasseMode]   = useState(false);   // Mode Classe (projecteur)
  const [showSettings, setShowSettings] = useState(false);
  const [voices,       setVoices]       = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const deviceInfo = useRef(getDeviceInfo());

  // ── Chargement asynchrone des voix (Android/Firefox) ─────────────────────
  useEffect(() => {
    waitForVoices().then(() => {
      const fr = getFrenchVoices();
      setVoices(fr);
      if (fr.length > 0 && !selectedVoice) setSelectedVoice(fr[0]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refs partagées dans les callbacks
  const autoRef        = useRef(autoAdvance);
  const mutedRef       = useRef(muted);
  const playingRef     = useRef(playing);
  const currentRef     = useRef(current);
  const volumeRef      = useRef(volume);
  const selectedVoiceRef = useRef(selectedVoice);
  autoRef.current          = autoAdvance;
  mutedRef.current         = muted;
  playingRef.current       = playing;
  currentRef.current       = current;
  volumeRef.current        = volume;
  selectedVoiceRef.current = selectedVoice;

  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const total    = slides.length;
  const slide    = slides[current];
  const progress = ((current + 1) / total) * 100;

  const clearFallback  = () => { if (fallbackRef.current)  { clearTimeout(fallbackRef.current);  fallbackRef.current  = null; } };
  const clearKeepalive = () => { if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; } };

  // ── Avancer à la diapo suivante ──────────────────────────────────────────
  const advanceAfterSlide = useCallback((idx: number) => {
    clearFallback(); clearKeepalive();
    if (!autoRef.current) { setPlaying(false); return; }
    if (idx < slides.length - 1) {
      setCurrent(idx + 1);
    } else {
      setPlaying(false);
      setFinished(true);
    }
  }, [slides.length]);

  // ── Lecture d'une slide ───────────────────────────────────────────────────
  const readSlide = useCallback((idx: number) => {
    if (!deviceInfo.current.hasTTS || mutedRef.current) return;
    const s = slides[idx];
    if (!s) return;
    const text = `${s.label}. ${s.detail}`;

    stopSpeech(); clearFallback(); clearKeepalive();
    unlockAudioContext(); // débloque AudioContext Chrome/Safari

    const utt = buildUtterance(text, {
      rate:   rate,
      volume: classeMode ? 1.0 : volumeRef.current, // Mode Classe → volume max
      voice:  selectedVoiceRef.current,
    });

    utt.onstart = () => setTtsBlocked(false);
    utt.onend   = () => { clearFallback(); clearKeepalive(); if (playingRef.current) advanceAfterSlide(idx); };
    utt.onerror = () => { clearFallback(); clearKeepalive(); setTtsBlocked(true); setPlaying(false); };

    // Firefox : petit délai avant speak() pour éviter les coupures
    const doSpeak = () => {
      try {
        window.speechSynthesis.speak(utt);

        // Keepalive iOS : évite la coupure après ~15 s
        if (isIOS()) {
          keepaliveRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else clearKeepalive();
          }, 10_000);
        }

        // Fallback onend (Samsung Internet, Firefox, certains Android)
        fallbackRef.current = setTimeout(() => {
          if (playingRef.current && currentRef.current === idx) advanceAfterSlide(idx);
        }, estimateDuration(text, rate));
      } catch {
        setTtsBlocked(true);
        setPlaying(false);
      }
    };

    if (deviceInfo.current.browser === 'firefox') {
      setTimeout(doSpeak, 100); // Firefox nécessite un délai minimal
    } else {
      doSpeak();
    }
  }, [rate, classeMode, slides, advanceAfterSlide]);

  // ── Sync lecture / slide ──────────────────────────────────────────────────
  useEffect(() => {
    if (playing && !mutedRef.current) {
      readSlide(current);
    } else if (!playing) {
      stopSpeech(); clearFallback(); clearKeepalive();
    }
    return () => { stopSpeech(); clearFallback(); clearKeepalive(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, current]);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      { stopSpeech(); onClose(); }
      if (e.key === 'ArrowRight')  goNext();
      if (e.key === 'ArrowLeft')   goPrev();
      if (e.key === ' ')           { e.preventDefault(); togglePlay(); }
      if (e.key === 'f' || e.key === 'F') setClasseMode(v => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, playing]);

  const goNext  = () => { setFinished(false); if (current < total - 1) setCurrent(c => c + 1); };
  const goPrev  = () => { setFinished(false); if (current > 0)         setCurrent(c => c - 1); };
  const goFirst = () => { setFinished(false); setCurrent(0); };
  const goLast  = () => { setFinished(false); setCurrent(total - 1); };

  const togglePlay = () => {
    setFinished(false); setTtsBlocked(false);
    unlockAudioContext();
    setPlaying(p => !p);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) { stopSpeech(); clearFallback(); clearKeepalive(); }
  };

  // Couleur par type de slide
  const slideColor = {
    step:    { bg: 'bg-primary/10',  border: 'border-primary/25',  badge: 'bg-primary text-primary-foreground',  text: 'text-primary'  },
    conseil: { bg: 'bg-warning/10',  border: 'border-warning/25',  badge: 'bg-warning text-warning-foreground',  text: 'text-warning'  },
    exemple: { bg: 'bg-chart-2/10', border: 'border-chart-2/25', badge: 'bg-chart-2 text-white',               text: 'text-chart-2' },
  }[slide.type];

  const isSamsungInternet = deviceInfo.current.browser === 'samsung';

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col',
        classeMode ? 'bg-gray-950' : 'bg-background',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`Lecture guidée : ${fiche.titre}`}
    >

      {/* ── Barre supérieure ── */}
      <header className={cn('flex items-center gap-3 px-4 py-3 border-b shrink-0', classeMode ? 'border-white/10' : 'border-border')}>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold uppercase tracking-wide truncate', classeMode ? 'text-white/60' : 'text-muted-foreground')}>
            🔊 Lecture guidée — {fiche.subject}
          </p>
          <p className={cn('text-sm font-bold truncate text-balance', classeMode ? 'text-white' : 'text-foreground')}>
            {fiche.titre}
          </p>
        </div>

        {/* Vitesse — bureau */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {SPEEDS.map(sp => (
            <button key={sp.value} type="button" onClick={() => setRate(sp.value)}
              className={cn('text-xs px-2.5 py-1 rounded-full border transition-colors',
                rate === sp.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : classeMode
                    ? 'border-white/20 text-white/60 hover:text-white hover:border-white/40'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}>{sp.label}</button>
          ))}
        </div>

        {/* Mode Classe + Paramètres + Mute + Fermer */}
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => setClasseMode(v => !v)}
            aria-label={classeMode ? 'Quitter le mode classe' : 'Mode Classe (projecteur)'}
            title={classeMode ? 'Quitter le mode classe' : 'Mode Classe — projecteur, volume max, texte XXL'}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              classeMode
                ? 'bg-primary/30 text-white hover:bg-primary/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            {classeMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button type="button" onClick={() => setShowSettings(v => !v)}
            aria-label="Paramètres voix"
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              classeMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            <Settings className="w-4 h-4" />
          </button>

          <button type="button" onClick={toggleMute} aria-label={muted ? 'Activer le son' : 'Couper le son'}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              classeMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button type="button" onClick={() => { stopSpeech(); onClose(); }} aria-label="Fermer"
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              classeMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Panneau Paramètres voix (dépliable) ── */}
      {showSettings && (
        <div className={cn('px-4 py-3 border-b shrink-0 space-y-3', classeMode ? 'bg-gray-900 border-white/10' : 'bg-muted/50 border-border')}>
          {/* Sélecteur de voix */}
          {voices.length > 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn('text-xs font-semibold uppercase tracking-wide shrink-0', classeMode ? 'text-white/60' : 'text-muted-foreground')}>
                Voix :
              </span>
              <div className="flex gap-1 flex-wrap">
                {voices.map(v => (
                  <button key={v.name} type="button" onClick={() => setSelectedVoice(v)}
                    className={cn('text-xs px-2.5 py-1 rounded-full border transition-colors',
                      selectedVoice?.name === v.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : classeMode
                          ? 'border-white/20 text-white/60 hover:text-white'
                          : 'border-border text-muted-foreground hover:text-foreground',
                    )}>
                    {v.name.replace('Microsoft ', '').replace(' - French (France)', '')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volume slider */}
          <div className="flex items-center gap-3">
            <Volume1 className={cn('w-4 h-4 shrink-0', classeMode ? 'text-white/60' : 'text-muted-foreground')} />
            <input type="range" min="0" max="1" step="0.1" value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              aria-label="Volume de la voix"
              className="flex-1 accent-primary h-2 rounded-full" />
            <Volume2 className={cn('w-4 h-4 shrink-0', classeMode ? 'text-white/60' : 'text-muted-foreground')} />
            <span className={cn('text-xs w-8 tabular-nums', classeMode ? 'text-white/60' : 'text-muted-foreground')}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Avertissement Samsung Internet */}
          {isSamsungInternet && (
            <div className="flex items-start gap-2 text-xs rounded-lg border border-warning/30 bg-warning/10 p-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <span className="text-foreground">
                Samsung Internet a une voix limitée. Pour de meilleures performances, ouvrez cette page dans <strong>Chrome</strong> ou <strong>Firefox</strong>.
              </span>
            </div>
          )}

          {/* Mode Classe : info */}
          {classeMode && (
            <div className="flex items-start gap-2 text-xs rounded-lg border border-primary/30 bg-primary/10 p-2.5">
              <Maximize2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span className="text-primary font-medium">
                Mode Classe actif — Volume forcé à 100 %, texte agrandi, fond sombre pour projecteur.
                Touche <kbd className="bg-primary/20 px-1 rounded font-mono">F</kbd> pour basculer.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Barre de progression ── */}
      <div className={cn('w-full h-1.5 shrink-0', classeMode ? 'bg-white/10' : 'bg-muted')}>
        <div className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}
          aria-label={`Étape ${current + 1} sur ${total}`} />
      </div>

      {/* ── Compteur ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <span className={cn('text-xs font-semibold uppercase tracking-wide', classeMode ? 'text-white/50' : 'text-muted-foreground')}>
          {slide.type === 'step' ? `Étape ${slide.num} sur ${fiche.steps.length}` : slide.type === 'conseil' ? 'Conseil' : 'Exemple'}
        </span>
        <span className={cn('text-xs', classeMode ? 'text-white/40' : 'text-muted-foreground')}>
          {current + 1} / {total}
        </span>
      </div>

      {/* ── Zone principale ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 overflow-y-auto py-6">
        {/* Badge numéro */}
        <div className={cn('rounded-full flex items-center justify-center mb-5 shrink-0 border-2',
          classeMode ? 'w-20 h-20' : 'w-14 h-14',
          slideColor.bg, slideColor.border)}>
          {slide.type === 'step'
            ? <span className={cn('font-extrabold', classeMode ? 'text-4xl' : 'text-2xl', slideColor.text)}>{slide.num}</span>
            : <Zap className={cn(classeMode ? 'w-10 h-10' : 'w-7 h-7', slideColor.text)} />
          }
        </div>

        {/* Label */}
        <h2 className={cn('text-center font-extrabold text-balance leading-tight mb-4 max-w-2xl', slideColor.text,
          classeMode ? 'text-4xl md:text-5xl xl:text-6xl' : 'text-2xl md:text-3xl xl:text-4xl',
        )}>
          {slide.label}
        </h2>

        {/* Détail */}
        <p className={cn('text-center text-pretty leading-relaxed max-w-xl',
          classeMode ? 'text-white text-2xl md:text-3xl xl:text-4xl' : 'text-foreground text-lg md:text-xl xl:text-2xl',
        )}>
          {slide.detail}
        </p>

        {/* Indicateur lecture en cours */}
        {playing && !muted && !ttsBlocked && (
          <div className={cn('flex items-center gap-2 mt-6 animate-pulse', classeMode ? 'text-white/80' : 'text-primary')}>
            <Volume2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Lecture en cours…</span>
            <span className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className={cn('inline-block w-1.5 h-4 rounded-full animate-bounce', classeMode ? 'bg-white/70' : 'bg-primary')}
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}

        {/* TTS bloqué */}
        {ttsBlocked && (
          <div className="flex items-start gap-2 mt-4 max-w-sm rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-left">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Voix non disponible sur cet appareil</p>
              <p className="text-muted-foreground mt-0.5 text-pretty text-xs">
                {deviceInfo.current.type === 'ios'
                  ? 'Sur iPhone/iPad : appuie sur ▶ directement. Vérifie que le bouton silencieux sur le côté n\'est pas activé (pas de ligne orange).'
                  : deviceInfo.current.browser === 'samsung'
                    ? 'Samsung Internet limite la voix. Ouvre cette page dans Chrome pour la synthèse vocale.'
                    : 'Appuie sur ▶ pour réessayer. Si le problème persiste, vérifie le volume de ton appareil.'}
              </p>
            </div>
          </div>
        )}

        {/* Bravo — fin */}
        {finished && (
          <div className="mt-6 text-center space-y-1">
            <p className={classeMode ? 'text-5xl' : 'text-3xl'}>🎉</p>
            <p className={cn('font-bold text-success', classeMode ? 'text-2xl' : 'text-lg')}>Bravo ! Tu as tout écouté !</p>
            <p className={cn('text-muted-foreground', classeMode ? 'text-base' : 'text-sm')}>Appuie sur ◀ pour revoir une étape ou ferme pour continuer.</p>
          </div>
        )}
      </main>

      {/* ── Contrôles navigation + play ── */}
      <footer className={cn('shrink-0 border-t', classeMode ? 'border-white/10' : 'border-border')}>
        {/* Auto-avance + vitesse mobile */}
        <div className={cn('flex items-center justify-between px-4 py-2 border-b gap-3 flex-wrap',
          classeMode ? 'bg-gray-900 border-white/10' : 'border-border/50')}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div role="checkbox" aria-checked={autoAdvance} tabIndex={0}
              onKeyDown={e => e.key === ' ' && setAutoAdvance(v => !v)}
              onClick={() => setAutoAdvance(v => !v)}
              className={cn('w-9 h-5 rounded-full border-2 relative transition-colors',
                autoAdvance ? 'bg-primary border-primary' : classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border',
              )}>
              <span className={cn('absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all',
                autoAdvance ? 'left-4' : 'left-0.5')} />
            </div>
            <span className={cn('text-xs font-medium', classeMode ? 'text-white/60' : 'text-muted-foreground')}>
              Avance automatique
            </span>
          </label>
          {/* Vitesse mobile */}
          <div className="flex md:hidden items-center gap-1">
            {SPEEDS.map(sp => (
              <button key={sp.value} type="button" onClick={() => setRate(sp.value)}
                className={cn('text-xs px-2 py-1 rounded-full border transition-colors',
                  rate === sp.value ? 'bg-primary text-primary-foreground border-primary'
                    : classeMode ? 'border-white/20 text-white/60 hover:text-white' : 'border-border text-muted-foreground',
                )}>{sp.label}</button>
            ))}
          </div>
        </div>

        {/* Boutons navigation */}
        <div className={cn('flex items-center justify-between px-4 py-4 gap-3', classeMode && 'bg-gray-950')}>
          <button type="button" onClick={goFirst} disabled={current === 0} aria-label="Revenir au début"
            className={cn('w-11 h-11 rounded-full border flex items-center justify-center transition-colors disabled:opacity-30',
              classeMode ? 'border-white/20 text-white/60 hover:text-white hover:bg-white/10' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            <SkipBack className="w-5 h-5" />
          </button>

          <button type="button" onClick={goPrev} disabled={current === 0} aria-label="Étape précédente"
            className={cn('flex-1 max-w-[140px] h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-30',
              classeMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-border text-foreground hover:bg-muted',
            )}>
            <ChevronLeft className="w-6 h-6 shrink-0" />
            <span className="text-sm hidden sm:inline">Précédent</span>
          </button>

          {/* Play / Pause */}
          <button type="button" onClick={togglePlay}
            aria-label={playing ? 'Mettre en pause' : 'Lire à voix haute'}
            className={cn('rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90',
              classeMode ? 'w-28 h-28' : 'w-20 h-20',
            )}>
            {playing
              ? <Pause className={classeMode ? 'w-14 h-14' : 'w-9 h-9'} />
              : <Play  className={cn(classeMode ? 'w-14 h-14' : 'w-9 h-9', 'ml-1')} />}
          </button>

          <button type="button" onClick={goNext} disabled={current === total - 1} aria-label="Étape suivante"
            className={cn('flex-1 max-w-[140px] h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-30',
              classeMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-border text-foreground hover:bg-muted',
            )}>
            <span className="text-sm hidden sm:inline">Suivant</span>
            <ChevronRight className="w-6 h-6 shrink-0" />
          </button>

          <button type="button" onClick={goLast} disabled={current === total - 1} aria-label="Aller à la fin"
            className={cn('w-11 h-11 rounded-full border flex items-center justify-center transition-colors disabled:opacity-30',
              classeMode ? 'border-white/20 text-white/60 hover:text-white hover:bg-white/10' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted',
            )}>
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Raccourcis clavier */}
        <p className={cn('text-center text-xs pb-3 hidden md:block', classeMode ? 'text-white/30' : 'text-muted-foreground')}>
          <kbd className={cn('border rounded px-1 font-mono', classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border')}>Espace</kbd> Lecture ·{' '}
          <kbd className={cn('border rounded px-1 font-mono', classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border')}>←</kbd>
          <kbd className={cn('border rounded px-1 font-mono', classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border')}>→</kbd> Navigation ·{' '}
          <kbd className={cn('border rounded px-1 font-mono', classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border')}>F</kbd> Mode Classe ·{' '}
          <kbd className={cn('border rounded px-1 font-mono', classeMode ? 'bg-white/10 border-white/20' : 'bg-muted border-border')}>Échap</kbd> Fermer
        </p>
      </footer>
    </div>,
    document.body,
  );
};

export default LectureGuideeModal;

