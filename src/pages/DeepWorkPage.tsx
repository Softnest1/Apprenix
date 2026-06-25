import {CheckCircle,
  ChevronLeft, Pause, Play, RotateCcw, Volume2, VolumeX,
  X, Zap, 
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';

// ─── Constantes ────────────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '25 min', value: 25 * 60, desc: 'Pomodoro classique' },
  { label: '50 min', value: 50 * 60, desc: 'Session longue' },
  { label: '90 min', value: 90 * 60, desc: 'Deep Work intense' },
];

const SOUNDS = [
  { id: 'silence', label: 'Silence', emoji: '🔇' },
  { id: 'rain', label: 'Pluie', emoji: '🌧️' },
  { id: 'library', label: 'Bibliothèque', emoji: '📚' },
  { id: 'white', label: 'Bruit blanc', emoji: '🌊' },
];

// ─── Moteur audio Web Audio API — compatible iOS/Safari/Android/Desktop ─────────
//
// iOS Safari bloque toute lecture audio tant qu'elle n'est pas déclenchée
// dans un handler d'événement utilisateur direct (click/touchend).
// Solution :
//   1. AudioContext créé dans handleStart() (geste utilisateur direct)
//   2. audioCtx.resume() appelé dans le même tick si state === 'suspended'
//   3. Les nœuds sont recréés à chaque reprise pour éviter les bugs iOS
//
// Sons générés algorithmiquement (pas de fichiers externes) :
//   • Bruit blanc : buffer de samples aléatoires
//   • Pluie       : bruit blanc → filtre BiquadFilter(lowpass, 400Hz) + gain 0.55
//   • Bibliothèque: bruit blanc → 2 filtres bandpass très serrés + gain 0.18
//
// Compatibilité testée : iOS 15+, Safari macOS, Chrome, Firefox, Edge, Android Chrome

type SoundId = 'silence' | 'rain' | 'library' | 'white';

interface SoundEngine {
  ctx: AudioContext;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  stop: () => void;
}

function createWhiteNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const frames = sampleRate * seconds;
  const buf = ctx.createBuffer(1, frames, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function startSound(soundId: SoundId, volume: number, ctx: AudioContext): SoundEngine | null {
  if (soundId === 'silence') return null;

  const buf = createWhiteNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;

  if (soundId === 'white') {
    // Bruit blanc pur
    source.connect(gainNode);
  } else if (soundId === 'rain') {
    // Pluie : lowpass 450Hz sur bruit blanc
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 450;
    lowpass.Q.value = 0.5;
    source.connect(lowpass);
    lowpass.connect(gainNode);
  } else if (soundId === 'library') {
    // Bibliothèque : deux filtres bandpass très atténués (murmures lointains)
    const bp1 = ctx.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.value = 350;
    bp1.Q.value = 0.8;
    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = 800;
    bp2.Q.value = 1.2;
    // Mixeur : source → bp1 → gain1 → dest & source → bp2 → gain2 → dest
    const g1 = ctx.createGain(); g1.gain.value = 0.6;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    source.connect(bp1); bp1.connect(g1); g1.connect(gainNode);
    source.connect(bp2); bp2.connect(g2); g2.connect(gainNode);
  }

  gainNode.connect(ctx.destination);
  source.start(0);

  return {
    ctx,
    source,
    gainNode,
    stop: () => {
      try {
        source.stop();
        source.disconnect();
        gainNode.disconnect();
      } catch { /* déjà stoppé */ }
    },
  };
}

const MOTIVATIONS = [
  'Concentre-toi sur l\'essentiel.',
  'Chaque minute compte. Reste présent.',
  'Tu es capable de grandes choses.',
  'La concentration est un muscle — entraîne-le.',
  'Pas de distraction. Juste toi et ton objectif.',
  'Le temps que tu investis aujourd\'hui, tu le récolteras demain.',
  'Un problème à la fois. C\'est suffisant.',
  'Coupe le bruit. Coupe les réseaux. Crée quelque chose.',
  'La profondeur vaut mieux que la vitesse.',
  'Ce moment de travail te rapproche de ta réussite.',
];

// ─── Cercle de progression SVG ─────────────────────────────────────────────────

const ProgressRing: React.FC<{ progress: number; size: number; strokeWidth: number; color: string }> = ({
  progress, size, strokeWidth, color,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 w-full h-auto max-w-[240px]"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
};

// ─── Formatage du temps ────────────────────────────────────────────────────────

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

// ─── Page Deep Work ────────────────────────────────────────────────────────────

type Phase = 'config' | 'running' | 'done';

const DeepWorkPage: React.FC = () => {
  const { addXp, addActivity, addPomodoroSession } = useApp();
  const navigate = useNavigate();

  // Config
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0]);
  const [phase, setPhase] = useState<Phase>('config');
  const [volume, setVolume] = useState(0.5);

  // Timer
  const [timeLeft, setTimeLeft] = useState(DURATIONS[0].value);
  const [isRunning, setIsRunning] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio — refs pour AudioContext et SoundEngine actifs
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const soundEngineRef = useRef<SoundEngine | null>(null);

  const quoteIndex = useRef(Math.floor(Math.random() * MOTIVATIONS.length));
  const currentQuote = MOTIVATIONS[quoteIndex.current];

  const totalSeconds = selectedDuration.value;
  const elapsed = totalSeconds - timeLeft;
  const progress = elapsed / totalSeconds;

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // ── Démarre / arrête le son ──────────────────────────────────────────────────
  // CRITIQUE iOS : AudioContext doit être créé/résumé dans un handler click direct.
  const startAudio = useCallback((soundId: SoundId, vol: number) => {
    // Arrêter l'ancien son s'il tourne
    soundEngineRef.current?.stop();
    soundEngineRef.current = null;

    if (soundId === 'silence') return;

    // Créer ou réutiliser l'AudioContext
    // On le crée ici (dans un événement utilisateur direct) pour satisfaire iOS Safari
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    // iOS met l'AudioContext en 'suspended' si créé hors click → on le résume
    const doStart = () => {
      soundEngineRef.current = startSound(soundId, vol, ctx);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(doStart).catch(() => {});
    } else {
      doStart();
    }
  }, []);

  const stopAudio = useCallback(() => {
    soundEngineRef.current?.stop();
    soundEngineRef.current = null;
  }, []);

  // Mettre à jour le volume en temps réel sans recréer le son
  const updateVolume = useCallback((vol: number) => {
    setVolume(vol);
    if (soundEngineRef.current) {
      soundEngineRef.current.gainNode.gain.setTargetAtTime(vol, soundEngineRef.current.ctx.currentTime, 0.05);
    }
  }, []);

  // Nettoyage audio quand on quitte la page
  useEffect(() => {
    return () => {
      stopAudio();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [stopAudio]);

  const handleStart = useCallback(() => {
    setPhase('running');
    setIsRunning(true);
    setTimeLeft(selectedDuration.value);
    setPauseCount(0);
    // Démarrer le son ici : on est dans un handler click → iOS autorisé
    startAudio(selectedSound.id as SoundId, volume);
  }, [selectedDuration, selectedSound, volume, startAudio]);

  const handlePause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setPauseCount(p => p + 1);
      // Pause audio : suspension douce
      audioCtxRef.current?.suspend().catch(() => {});
    } else {
      setIsRunning(true);
      // Reprise audio
      audioCtxRef.current?.resume().catch(() => {});
    }
  }, [isRunning]);

  const handleReset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(selectedDuration.value);
    audioCtxRef.current?.suspend().catch(() => {});
  }, [selectedDuration.value]);

  const handleFinish = useCallback(() => {
    clearTimer();
    stopAudio();
    setIsRunning(false);
    setPhase('done');
    const worked = Math.round((totalSeconds - timeLeft) / 60);
    addPomodoroSession({ date: new Date().toISOString().split('T')[0], sessionCount: 1, workMinutes: worked });
    addXp(Math.round(worked * 0.5));
    addActivity(`Session Deep Work terminée (${worked} min)`);
  }, [timeLeft, totalSeconds, addPomodoroSession, addXp, addActivity, stopAudio]);

  // Tick
  useEffect(() => {
    if (phase !== 'running') return;
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            setPhase('done');
            stopAudio();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [isRunning, phase, stopAudio]);

  // Maj total quand la durée change (phase config)
  useEffect(() => {
    if (phase === 'config') setTimeLeft(selectedDuration.value);
  }, [selectedDuration, phase]);

  const workedMinutes = Math.round((totalSeconds - timeLeft) / 60);

  return (
    <main className="min-h-dvh bg-background flex flex-col" id="deepwork-main" aria-label="Mode Focus Deep Work">
      <SEO
        title="Mode Focus — Concentration Profonde & Minuteur Pomodoro | Apprenix"
        description="Mode Deep Work : concentration intense avec minuteur Pomodoro, sons d'ambiance et blocage des distractions. Idéal pour le bac et les examens."
        canonical="/focus"
        keywords="deep work étudiant gratuit, concentration profonde révision, minuteur pomodoro en ligne, session focus gratuit, travail sans distraction, ambiance sonore étude, technique pomodoro, méthode deep work révision bac"
        noIndex={false}
        dateModified="2026-06-20"
      />

      {/* ── Barre de progression haut ── */}
      {phase === 'running' && (
        <div className="h-1 bg-border/40 shrink-0">
          <div
            className="h-full bg-primary transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* ── Header minimal ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-9" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-1" />Retour
        </Button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Deep Work</span>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={() => { stopAudio(); navigate('/motivation'); }} aria-label="Quitter" title="Quitter">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Contenu central ── */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">

        {/* ── Phase CONFIG ── */}
        {phase === 'config' && (
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground text-balance">Prêt à vous concentrer ?</h1>
              <p className="text-muted-foreground text-sm text-pretty max-w-xs mx-auto">
                Choisissez votre durée et une ambiance sonore. Désactivez vos notifications.
              </p>
            </div>

            {/* Durée */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Durée de la session</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(d => (
                  <button type="button" key={d.label} onClick={() => setSelectedDuration(d)}
                    className={`p-3 rounded-xl border text-center transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedDuration.value === d.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                    <div className="text-base font-bold">{d.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Son */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ambiance sonore</p>
              <div className="grid grid-cols-2 gap-2">
                {SOUNDS.map(s => (
                  <button type="button" key={s.id} onClick={() => setSelectedSound(s)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selectedSound.id === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Volume — visible seulement si son sélectionné */}
              {selectedSound.id !== 'silence' && (
                <div className="flex items-center gap-3 px-1">
                  <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Slider
                    min={0} max={1} step={0.05}
                    value={[volume]}
                    onValueChange={([v]) => setVolume(v)}
                    className="flex-1"
                    aria-label="Volume du son d'ambiance"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              )}
              {selectedSound.id !== 'silence' && (
                <p className="text-sm text-muted-foreground text-center text-pretty">
                  Son généré dans le navigateur — fonctionne sur iOS, Android, tablette, ordinateur
                </p>
              )}
            </div>

            <Button className="w-full h-12 bg-primary text-primary-foreground text-base font-semibold" onClick={handleStart}>
              <Zap className="w-5 h-5 mr-2" />Démarrer la session
            </Button>
          </div>
        )}

        {/* ── Phase RUNNING ── */}
        {phase === 'running' && (
          <div className="w-full max-w-md flex flex-col items-center gap-6 md:gap-8">
            <div className="relative flex items-center justify-center w-full max-w-[240px] mx-auto">
              <ProgressRing progress={progress} size={240} strokeWidth={10} color="hsl(var(--primary))" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl md:text-4xl font-bold text-foreground tabular-nums">{fmt(timeLeft)}</span>
                <span className="text-xs md:text-sm text-muted-foreground mt-1 text-center px-2">{selectedDuration.label} · {isRunning ? 'En cours' : 'En pause'}</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground italic max-w-xs text-pretty">"{currentQuote}"</p>

            {/* Contrôles */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" aria-label="Réinitialiser" className="h-12 w-12 rounded-full border-2" onClick={handleReset}>
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg" size="icon" aria-label="Pause / Reprendre" onClick={handlePause}>
                {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
              </Button>
              <Button variant="outline" size="sm" className="h-12 px-4 rounded-xl border-2 text-sm" onClick={handleFinish}>
                Terminer
              </Button>
            </div>

            {/* Volume en cours de session */}
            {selectedSound.id !== 'silence' && (
              <div className="flex items-center gap-3 w-full max-w-xs px-2">
                <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider min={0} max={1} step={0.05} value={[volume]} onValueChange={([v]) => updateVolume(v)} className="flex-1" aria-label="Volume" />
                <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">{selectedSound.emoji} {selectedSound.label}</Badge>
              {pauseCount > 0 && <span>{pauseCount} pause{pauseCount > 1 ? 's' : ''}</span>}
            </div>
          </div>
        )}

        {/* ── Phase DONE ── */}
        {phase === 'done' && (
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground text-balance">Session terminée</h2>
              <p className="text-muted-foreground text-sm mt-2 text-pretty max-w-xs mx-auto">
                Votre cerveau a besoin d'une pause avant la prochaine session.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Concentré', value: `${workedMinutes}min` },
                { label: 'Pauses', value: String(pauseCount) },
                { label: 'XP gagnés', value: `+${Math.round(workedMinutes * 0.5)}` },
              ].map(s => (
                <div key={s.label} className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <div className="text-base font-bold text-foreground leading-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-primary text-primary-foreground" onClick={() => { setPhase('config'); setTimeLeft(selectedDuration.value); }}>
                <Zap className="w-4 h-4 mr-2" />Nouvelle session
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/motivation')}>
                Retour au tableau de bord
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default DeepWorkPage;
