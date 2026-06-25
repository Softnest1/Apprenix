import {AlertTriangle,BookOpen, Brain, 
  Calendar, CheckCircle2,ChevronRight,Clock, 
  Droplets, Eye, Heart, Info,Lightbulb, ListChecks, Maximize2, Minimize2,Pause, Play, RotateCcw, Sparkles, Sun, 
  Timer, 
  X, 
  Zap, 
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { useFullscreen } from '@/hooks/useFullscreen';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChecklistItem { id: string; label: string; done: boolean; category: string; }

// ─── Données ──────────────────────────────────────────────────────────────────
const CHECKLIST_DEFAULT: ChecklistItem[] = [
  { id: 'carte-id',     label: "Carte d'identité ou passeport",             done: false, category: 'Matériel' },
  { id: 'convoc',       label: 'Convocation (imprimée ou sur téléphone)',    done: false, category: 'Matériel' },
  { id: 'stylos',       label: '2 stylos (bille ou plume) + recharge',      done: false, category: 'Matériel' },
  { id: 'crayon',       label: 'Crayon papier + gomme',                      done: false, category: 'Matériel' },
  { id: 'regle',        label: 'Règle + équerre + rapporteur',               done: false, category: 'Matériel' },
  { id: 'calculatrice', label: 'Calculatrice autorisée (piles OK)',          done: false, category: 'Matériel' },
  { id: 'eau',          label: "Bouteille d'eau transparente (sans étiquette)", done: false, category: 'Matériel' },
  { id: 'fiches',       label: 'Fiches de révision relues la veille',        done: false, category: 'Révisions' },
  { id: 'formules',     label: 'Formules clés mémorisées',                   done: false, category: 'Révisions' },
  { id: 'exercices',    label: 'Exercices types refaits',                    done: false, category: 'Révisions' },
  { id: 'sommeil',      label: 'Nuit complète (7–8 h minimum)',              done: false, category: 'Bien-être' },
  { id: 'repas',        label: 'Petit-déjeuner équilibré',                   done: false, category: 'Bien-être' },
  { id: 'telephone',    label: 'Téléphone éteint ou en mode avion',          done: false, category: 'Bien-être' },
];

const EXAM_DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 h',    value: 60 },
  { label: '2 h',    value: 120 },
  { label: '3 h',    value: 180 },
  { label: '4 h',    value: 240 },
];

type TipEntry = { icon: React.ReactNode; title: string; text: string };
type TipTab   = 'avant' | 'pendant' | 'apres';

const TIPS: Record<TipTab, TipEntry[]> = {
  avant: [
    { icon: <Brain className="w-4 h-4" />,       title: 'Révise en mode actif',              text: 'Fais des exercices, des cartes mémoire, des résumés écrits à la main. Lire passivement ne suffit pas.' },
    { icon: <Clock className="w-4 h-4" />,        title: 'Arrête de réviser la veille au soir', text: 'Ton cerveau a besoin de sommeil pour consolider la mémoire. Une bonne nuit vaut mieux qu\'une révision de nuit.' },
    { icon: <ListChecks className="w-4 h-4" />,  title: 'Prépare ton matériel la veille',    text: 'Fais ta checklist le soir avant. Moins tu as de stress le matin, mieux ton cerveau fonctionnera.' },
    { icon: <Droplets className="w-4 h-4" />,    title: 'Hydrate-toi et mange bien',          text: 'Un petit-déjeuner avec des glucides lents (flocons d\'avoine, pain complet) améliore la concentration.' },
    { icon: <Heart className="w-4 h-4" />,        title: 'Respiration anti-stress (4-7-8)',   text: 'Inspire 4 s → bloque 7 s → expire lentement 8 s. Répète 3 fois pour activer la détente.' },
    { icon: <Sparkles className="w-4 h-4" />,    title: 'Arrive avec 20 min d\'avance',      text: 'Ça te laisse le temps de t\'installer, de sortir ton matériel et de respirer avant que ça commence.' },
  ],
  pendant: [
    { icon: <Eye className="w-4 h-4" />,          title: 'Lis TOUT le sujet en premier',     text: 'Parcours l\'ensemble des questions avant d\'écrire. Repère les questions faciles et planifie ton ordre.' },
    { icon: <Timer className="w-4 h-4" />,         title: 'Gère ton temps question par question', text: 'Alloue ~1 min par point. Réserve 10-15 min pour la relecture finale.' },
    { icon: <ChevronRight className="w-4 h-4" />, title: 'Commence par ce que tu sais',      text: 'Démarre par les questions où tu es à l\'aise. Ça te met en confiance et tu gagnes des points vite.' },
    { icon: <AlertTriangle className="w-4 h-4" />, title: 'Si tu bloques : passe et reviens', text: 'Note un ★ à côté et passe à la suite. Écrire autre chose débloque souvent la mémoire.' },
    { icon: <Droplets className="w-4 h-4" />,    title: 'Bois régulièrement',                text: 'La déshydratation (même légère) réduit la concentration. Prends une gorgée toutes les 30 min.' },
    { icon: <BookOpen className="w-4 h-4" />,     title: 'Présentation = points gratuits',   text: 'Retours à la ligne, titres soulignés, écriture lisible. Chaque point de présentation compte.' },
  ],
  apres: [
    { icon: <Heart className="w-4 h-4" />,        title: 'Ne commente pas avec les autres',  text: 'Comparer ses réponses juste après crée du stress inutile. Tu ne peux plus rien changer.' },
    { icon: <Sparkles className="w-4 h-4" />,    title: 'Félicite-toi d\'avoir essayé',     text: 'Quel que soit le résultat, tu t\'es préparé et tu as tenté. C\'est ça qui compte pour progresser.' },
    { icon: <Brain className="w-4 h-4" />,        title: 'Analyse à froid (pas à chaud)',    text: 'Attends 24-48 h avant de regarder les corrections. L\'émotion de sortie déforme les souvenirs.' },
    { icon: <Clock className="w-4 h-4" />,        title: 'Accorde-toi une vraie pause',      text: 'Ton cerveau a fourni un effort intense. Une journée de repos améliore tes performances pour la suite.' },
    { icon: <ListChecks className="w-4 h-4" />,  title: 'Prépare le prochain sereinement',  text: 'Si tu as d\'autres épreuves, reprends la checklist et recommence le cycle. La méthode, pas le stress.' },
  ],
};

// ─── Onboarding Banner ────────────────────────────────────────────────────────
const OnboardingBanner: React.FC = () => {
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' ? !localStorage.getItem('examenOnboardingSeen') : true
  );
  if (!visible) return null;
  const dismiss = () => { localStorage.setItem('examenOnboardingSeen', 'true'); setVisible(false); };
  return (
    <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4 flex gap-3 items-start">
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
        <Info className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground text-balance">Bienvenue sur le Mode Examen 👋</p>
        <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
          Cette page te donne 3 outils : un <strong>chronomètre</strong> pour simuler tes conditions
          d'épreuve, une <strong>checklist</strong> pour ne rien oublier le jour J, et des <strong>conseils</strong>{' '}
          classés par moment (avant / pendant / après).
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer le message de bienvenue"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── 3 étapes visuelles ───────────────────────────────────────────────────────
const HowItWorks: React.FC = () => {
  const steps = [
    {
      Icon: Calendar, colorText: 'text-chart-2', colorBg: 'bg-chart-2/10',
      num: '1', when: 'La veille',
      title: 'Prépare ton matériel',
      desc: 'Coche la checklist des affaires à emporter et relis tes fiches en mode actif.',
    },
    {
      Icon: Sun, colorText: 'text-warning', colorBg: 'bg-warning/10',
      num: '2', when: 'Le matin',
      title: 'Pars serein',
      desc: 'Relis les conseils « Avant l\'examen », prends un vrai petit-déjeuner, arrive 20 min en avance.',
    },
    {
      Icon: Timer, colorText: 'text-primary', colorBg: 'bg-primary/10',
      num: '3', when: 'Pendant l\'examen',
      title: 'Gère ton temps',
      desc: 'Lance le chronomètre, passe en plein écran et lis les conseils « Pendant l\'examen ».',
    },
  ];
  return (
    <div className="space-y-3">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-foreground text-balance">Comment utiliser le Mode Examen ?</h2>
        <p className="text-sm text-muted-foreground text-pretty">3 étapes, dans l'ordre, pour arriver prêt le jour J.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map(({ Icon, colorText, colorBg, num, when, title, desc }) => (
          <div key={num} className="flex gap-3 items-start bg-card border border-border rounded-xl p-4 h-full">
            <div className={cn('shrink-0 w-10 h-10 rounded-full flex items-center justify-center', colorBg)}>
              <Icon className={cn('w-5 h-5', colorText)} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className={cn('text-xs font-bold uppercase tracking-wide', colorText)}>{when}</span>
              <p className="text-sm font-semibold text-foreground mt-0.5 text-balance">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 text-pretty leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Chronomètre ──────────────────────────────────────────────────────────────
const ExamTimer: React.FC = () => {
  const savedDuration = parseInt(localStorage.getItem('examenTimerDuration') ?? '60', 10);
  const [durationMin, setDurationMin] = useState(isNaN(savedDuration) ? 60 : savedDuration);
  const [customMin, setCustomMin]     = useState('');
  const [seconds, setSeconds]         = useState(durationMin * 60);
  const [running, setRunning]         = useState(false);
  const [done, setDone]               = useState(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen({ targetRef: containerRef });

  const totalSeconds = durationMin * 60;
  const progress     = ((totalSeconds - seconds) / totalSeconds) * 100;
  const mins         = Math.floor(seconds / 60);
  const secs         = seconds % 60;
  const isWarning    = seconds <= 300 && seconds > 60;
  const isCritical   = seconds <= 60;

  const colorClass = isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground';
  const ringColor  = isCritical ? 'hsl(var(--destructive))' : isWarning ? 'hsl(var(--warning))' : 'hsl(var(--primary))';

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            toast.success('Temps écoulé !', { description: 'Posez vos stylos.' });
            return 0;
          }
          if (s === 301) toast.warning('5 minutes restantes !');
          if (s === 61)  toast.warning('1 minute restante !');
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, done]);

  const applyDuration = useCallback((min: number) => {
    setDurationMin(min);
    setSeconds(min * 60);
    setRunning(false);
    setDone(false);
    localStorage.setItem('examenTimerDuration', String(min));
  }, []);

  const reset = useCallback(() => {
    setSeconds(durationMin * 60);
    setRunning(false);
    setDone(false);
  }, [durationMin]);

  return (
    <div
      ref={containerRef}
      className={isFullscreen
        ? 'fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8 p-6'
          + ' [padding-top:env(safe-area-inset-top,0px)] [padding-bottom:env(safe-area-inset-bottom,0px)]'
          + ' [padding-left:env(safe-area-inset-left,0px)] [padding-right:env(safe-area-inset-right,0px)]'
        : 'space-y-5'}
    >
      {/* Instructions pas-à-pas */}
      {!isFullscreen && (
        <ol className="flex flex-col md:flex-row gap-2 md:gap-1" aria-label="Guide d'utilisation du chronomètre">
          {[
            { n: '1', text: 'Choisissez la durée de votre épreuve' },
            { n: '2', text: 'Appuyez sur Démarrer' },
            { n: '3', text: 'Plein écran pour vous concentrer' },
          ].map((step, i, arr) => (
            <li key={step.n} className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {step.n}
              </span>
              <span className="text-xs text-muted-foreground">{step.text}</span>
              {i < arr.length - 1 && (
                <ChevronRight className="w-3 h-3 text-border shrink-0 hidden md:block" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      )}

      {/* Étape 1 — Durée */}
      {!isFullscreen && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Étape 1 — Durée de l'épreuve</p>
          <div className="flex flex-wrap gap-2">
            {EXAM_DURATIONS.map(d => (
              <button
                type="button"
                key={d.value}
                onClick={() => applyDuration(d.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  durationMin === d.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-secondary',
                )}
              >
                {d.label}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <Input
                aria-label="Durée personnalisée en minutes"
                type="number"
                value={customMin}
                onChange={e => setCustomMin(e.target.value)}
                placeholder="min"
                className="h-8 w-16 text-xs"
                min={1}
                max={480}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  const m = parseInt(customMin);
                  if (m > 0 && m <= 480) applyDuration(m);
                  else toast.error('Durée invalide', { description: 'Entre 1 et 480 minutes.' });
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2-3 label */}
      {!isFullscreen && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Étape 2 — Démarrer & suivre</p>
      )}

      {/* Cercle SVG + contrôles */}
      <div className={cn('flex flex-col items-center gap-4', !isFullscreen && 'pb-2')}>
        <div className="relative">
          <svg
            className={cn('-rotate-90', isFullscreen ? 'w-72 h-72' : 'w-52 h-52')}
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Temps restant : ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="off">
            {done ? (
              <CheckCircle2 className={cn(isFullscreen ? 'w-20 h-20' : 'w-12 h-12', 'text-success')} aria-hidden="true" />
            ) : (
              <>
                <span className={cn('font-bold tabular-nums', isFullscreen ? 'text-7xl' : 'text-5xl', colorClass)}>
                  {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isCritical ? '⚠️ Terminez !' : isWarning ? 'Bientôt fini !' : running ? 'En cours…' : 'Prêt'}
                </span>
              </>
            )}
          </div>
        </div>

        {!isFullscreen && <Progress value={progress} className="w-full h-2" aria-hidden="true" />}

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {!done && (
            <Button
              onClick={() => setRunning(r => !r)}
              className={cn(
                'h-12 px-8 text-base font-semibold gap-2',
                running ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground',
              )}
              aria-label={running ? 'Mettre en pause le chronomètre' : 'Démarrer le chronomètre'}
            >
              {running
                ? <><Pause className="w-5 h-5" aria-hidden="true" />Pause</>
                : <><Play  className="w-5 h-5" aria-hidden="true" />Démarrer</>
              }
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-12 w-12" onClick={reset} aria-label="Réinitialiser le chronomètre">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="outline" size="icon"
            className="h-12 w-12"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran pour se concentrer'}
            title={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Plein écran — sans distraction'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>

        {done && (
          <div className="flex items-center gap-2 text-success font-semibold text-lg">
            <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span className="text-balance">Temps écoulé — posez vos stylos !</span>
          </div>
        )}

        {!isFullscreen && !running && !done && (
          <p className="text-xs text-muted-foreground text-center text-pretty">
            💡 Active le plein écran <Maximize2 className="inline w-3 h-3" aria-hidden="true" /> pour simuler les vraies conditions d'examen.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Checklist ────────────────────────────────────────────────────────────────
const ExamChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('examenChecklist');
      return saved ? (JSON.parse(saved) as ChecklistItem[]) : CHECKLIST_DEFAULT;
    } catch { return CHECKLIST_DEFAULT; }
  });
  const [newLabel, setNewLabel] = useState('');

  const save = useCallback((updated: ChecklistItem[]) => {
    setItems(updated);
    localStorage.setItem('examenChecklist', JSON.stringify(updated));
  }, []);

  const toggle  = (id: string) => save(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const add     = () => {
    if (!newLabel.trim()) { toast.error('Saisir un texte avant d\'ajouter.'); return; }
    save([...items, { id: Date.now().toString(), label: newLabel.trim(), done: false, category: 'Personnalisé' }]);
    setNewLabel('');
  };
  const remove  = (id: string) => save(items.filter(it => it.id !== id));
  const resetAll = () => {
    if (!window.confirm('Remettre la checklist à zéro ? Les éléments personnalisés seront supprimés.')) return;
    save(CHECKLIST_DEFAULT);
    toast.success('Checklist réinitialisée');
  };

  const doneCount  = items.filter(it => it.done).length;
  const allDone    = doneCount === items.length;
  const categories = [...new Set(items.map(it => it.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{doneCount}/{items.length}</span> éléments cochés
        </p>
        <div className="flex items-center gap-2">
          {allDone && (
            <Badge className="bg-success/10 text-success border-success/30 text-xs gap-1">
              <CheckCircle2 className="w-3 h-3" /> Tout prêt !
            </Badge>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={resetAll} aria-label="Réinitialiser la checklist">
            <RotateCcw className="w-3 h-3 mr-1" />Réinitialiser
          </Button>
        </div>
      </div>

      <Progress value={(doneCount / items.length) * 100} className="h-2" aria-label={`${doneCount} sur ${items.length} éléments cochés`} />

      {categories.map(cat => {
        const catItems = items.filter(it => it.category === cat);
        const catDone  = catItems.filter(it => it.done).length;
        return (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{cat}</p>
              <span className="text-xs text-muted-foreground">({catDone}/{catItems.length})</span>
            </div>
            {catItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                  item.done ? 'bg-success/5 border-success/20' : 'bg-card border-border',
                )}
              >
                <Checkbox
                  id={`check-${item.id}`}
                  checked={item.done}
                  onCheckedChange={() => toggle(item.id)}
                  className="shrink-0"
                />
                <label
                  htmlFor={`check-${item.id}`}
                  className={cn(
                    'text-sm flex-1 cursor-pointer leading-snug',
                    item.done ? 'line-through text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {item.label}
                </label>
                {item.category === 'Personnalisé' && (
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 min-w-[44px] min-h-[48px] flex items-center justify-center shrink-0"
                    aria-label={`Supprimer : ${item.label}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div className="flex gap-2 pt-1">
        <Input
          aria-label="Ajouter un élément personnalisé à la checklist"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Ajouter un élément…"
          className="h-9 text-sm"
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <Button size="sm" onClick={add} disabled={!newLabel.trim()} className="h-9 bg-primary text-primary-foreground shrink-0">
          Ajouter
        </Button>
      </div>
    </div>
  );
};

// ─── Conseils par onglet ──────────────────────────────────────────────────────
const ExamTips: React.FC = () => {
  const [tab, setTab] = useState<TipTab>(() =>
    (localStorage.getItem('examenConseilsTab') as TipTab) ?? 'avant'
  );

  const tabs: { id: TipTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'avant',   label: 'Avant',   Icon: Calendar },
    { id: 'pendant', label: 'Pendant', Icon: Timer    },
    { id: 'apres',   label: 'Après',   Icon: Heart    },
  ];

  const setAndSave = (t: TipTab) => {
    setTab(t);
    localStorage.setItem('examenConseilsTab', t);
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden" role="tablist" aria-label="Moment de l'examen">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setAndSave(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
              tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3" role="tabpanel" aria-label={`Conseils ${tab} l'examen`}>
        {TIPS[tab].map((tip, i) => (
          <div key={i} className="flex gap-3 items-start p-3.5 rounded-xl bg-card border border-border">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-0.5">
              {tip.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground text-balance">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 text-pretty leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
type Section = 'timer' | 'checklist' | 'conseils';

export default function ExamenPage() {
  const [activeSection, setActiveSection] = useState<Section>('timer');

  const sections: { id: Section; label: string; desc: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'timer',     label: 'Chronomètre', desc: "Pendant l'examen",       Icon: Timer      },
    { id: 'checklist', label: 'Checklist',   desc: 'La veille & le matin',   Icon: ListChecks },
    { id: 'conseils',  label: 'Conseils',    desc: 'Avant / Pendant / Après', Icon: Lightbulb  },
  ];

  return (
    <>
      <h1 className="sr-only">Mode Examen — Prépare ton Bac, ton Brevet et tes examens</h1>
      <SEO
        title="Mode Examen — Minuterie Bac & Brevet, Checklist & Stratégies | Apprenix"
        description="Simule le Bac/Brevet avec la minuterie officielle, prépare ta checklist et gère le stress. Gratuit, sans inscription, tous niveaux."
        canonical="/examen"
        keywords="mode examen bac 2026, minuterie examen brevet 2026, checklist examen lycée, anti-stress examen, stratégies examen bac, préparer examen, simulation examen gratuit, jour J bac conseils"
        dateModified="2026-06-23"
      />
      <PageHero
        variant="tool"
        icon={Timer}
        badge={<>⏱️ Mode Examen</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Mode Examen"
        subtitle="Un chronomètre pour t'entraîner, une checklist pour ne rien oublier, et des conseils clairs pour réussir le jour J."
      />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Onboarding */}
        <OnboardingBanner />

        {/* Guide 3 étapes */}
        <HowItWorks />

        {/* Navigation sections */}
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Sections du mode examen">
          {sections.map(({ id, label, desc, Icon }) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={activeSection === id}
              aria-controls={`panel-${id}`}
              onClick={() => setActiveSection(id)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all duration-150',
                activeSection === id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold leading-tight">{label}</span>
              <span className={cn('text-[10px] leading-tight', activeSection === id ? 'text-primary-foreground/80' : 'text-muted-foreground/70')}>
                {desc}
              </span>
            </button>
          ))}
        </div>

        {/* Panneau Chronomètre */}
        {activeSection === 'timer' && (
          <Card className="shadow-card" id="panel-timer" role="tabpanel" aria-label="Chronomètre d'examen">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-balance">
                <Timer className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                Chronomètre d'examen
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                Sélectionne la durée de ton épreuve, lance le timer et passe en plein écran pour reproduire les vraies conditions.
              </p>
            </CardHeader>
            <CardContent><ExamTimer /></CardContent>
          </Card>
        )}

        {/* Panneau Checklist */}
        {activeSection === 'checklist' && (
          <Card className="shadow-card" id="panel-checklist" role="tabpanel" aria-label="Checklist avant l'examen">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-balance">
                <ListChecks className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                Checklist de préparation
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                À cocher <strong>la veille</strong> et <strong>le matin</strong> de l'examen. Coche chaque ligne au fur et à mesure.
              </p>
            </CardHeader>
            <CardContent><ExamChecklist /></CardContent>
          </Card>
        )}

        {/* Panneau Conseils */}
        {activeSection === 'conseils' && (
          <Card className="shadow-card" id="panel-conseils" role="tabpanel" aria-label="Conseils méthodologiques">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-balance">
                <Lightbulb className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                Conseils méthodologiques
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                Sélectionne le bon moment pour lire les conseils adaptés à ta situation.
              </p>
            </CardHeader>
            <CardContent><ExamTips /></CardContent>
          </Card>
        )}

        {/* Bannière motivation */}
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex gap-3 items-center">
            <Zap className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground text-balance">Tu as travaillé pour ça. 💪</p>
              <p className="text-sm text-muted-foreground text-pretty">
                Chaque heure de révision est dans ta mémoire. Fais confiance à ta préparation et donne le meilleur de toi.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
