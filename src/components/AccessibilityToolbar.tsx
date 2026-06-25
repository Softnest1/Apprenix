/**
 * AccessibilityToolbar v2 — WCAG 2.1 AA / RGAA 4.1
 *
 * Architecture propre :
 *  - data-attributes sur <html> (data-a11y-*) au lieu de classes CSS
 *  - CSS variables overridées par sélecteurs d'attributs → zéro !important
 *  - FAB flottant + Sheet shadcn/ui
 *  - localStorage pour persistence des prefs
 *  - Compatible tous appareils (iOS safe-area, Android, desktop)
 */

import {
  Accessibility,
  BookOpen,
  Contrast,
  Eye,
  MoveHorizontal,
  Presentation,
  RotateCcw,
  Type,
  X,
  ZoomIn,
} from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface A11yPrefs {
  fontSize: 0 | 1 | 2;        // 0=normal, 1=grand (+25%), 2=très grand (+50%)
  highContrast: boolean;       // Contraste élevé WCAG AAA (7:1)
  dyslexiaFont: boolean;       // Police Atkinson Hyperlegible
  openDyslexic: boolean;       // Police OpenDyslexic
  reducedMotion: boolean;      // Désactive toutes les animations
  wideSpacing: boolean;        // Espacement élargi (WCAG 1.4.12)
  presentation: boolean;       // Mode projecteur enseignant (F7)
}

const STORAGE_KEY = 'apprenix_a11y_v2';
export const DEFAULT_PREFS: A11yPrefs = {
  fontSize: 0,
  highContrast: false,
  dyslexiaFont: false,
  openDyslexic: false,
  reducedMotion: false,
  wideSpacing: false,
  presentation: false,
};

// ─── Chargement depuis localStorage ──────────────────────────────────────────
function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

// ─── Appliquer les prefs via data-attributes sur <html> ──────────────────────
// AUCUN !important — les sélecteurs CSS [data-a11y-*] overrident les variables.
export function applyPrefs(prefs: A11yPrefs) {
  const html = document.documentElement;

  // Taille du texte
  html.setAttribute('data-a11y-fontsize', String(prefs.fontSize));

  // Contraste élevé
  html.setAttribute('data-a11y-contrast', prefs.highContrast ? 'high' : 'normal');

  // Police
  if (prefs.openDyslexic) {
    html.setAttribute('data-a11y-font', 'opendyslexic');
  } else if (prefs.dyslexiaFont) {
    html.setAttribute('data-a11y-font', 'atkinson');
  } else {
    html.setAttribute('data-a11y-font', 'default');
  }

  // Animations
  html.setAttribute('data-a11y-motion', prefs.reducedMotion || prefs.presentation ? 'reduced' : 'normal');

  // Espacement
  html.setAttribute('data-a11y-spacing', prefs.wideSpacing || prefs.presentation ? 'wide' : 'normal');

  // Mode projecteur
  html.setAttribute('data-a11y-presentation', prefs.presentation ? 'true' : 'false');
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface A11yPrefsContextValue {
  prefs: A11yPrefs;
  setPrefs: (next: Partial<A11yPrefs> | ((p: A11yPrefs) => A11yPrefs)) => void;
}
const A11yPrefsContext = createContext<A11yPrefsContextValue | null>(null);

export const A11yPrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefsState] = useState<A11yPrefs>(loadPrefs);

  const setPrefs = useCallback((next: Partial<A11yPrefs> | ((p: A11yPrefs) => A11yPrefs)) => {
    setPrefsState(prev => {
      const updated = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  useEffect(() => { applyPrefs(prefs); }, [prefs]);

  // Raccourci F7 — Mode projecteur
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F7' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPrefs(p => ({ ...p, presentation: !p.presentation }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPrefs]);

  return (
    <A11yPrefsContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </A11yPrefsContext.Provider>
  );
};

export function useA11yPrefs(): A11yPrefsContextValue {
  const ctx = useContext(A11yPrefsContext);
  if (!ctx) return { prefs: DEFAULT_PREFS, setPrefs: () => {} };
  return ctx;
}

// ─── Toggle switch interne ────────────────────────────────────────────────────
const Toggle: React.FC<{
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}> = ({ icon, label, desc, active, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    onClick={onToggle}
    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors"
    style={{
      background: active ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--muted))',
      border: `2px solid ${active ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
    }}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
      style={{
        background: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)',
        color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
      <p className="text-xs text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </div>
    {/* Switch visuel */}
    <div
      className="shrink-0 relative rounded-full"
      style={{
        width: 40, height: 22,
        background: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        transition: 'background 150ms',
      }}
      aria-hidden="true"
    >
      <div
        className="absolute top-[3px] rounded-full bg-white shadow-sm"
        style={{
          width: 16, height: 16,
          left: active ? 21 : 3,
          transition: 'left 150ms',
        }}
      />
    </div>
  </button>
);

// ─── Panneau d'accessibilité ──────────────────────────────────────────────────
export const A11yPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { prefs, setPrefs } = useA11yPrefs();
  const panelRef = useRef<HTMLDivElement>(null);

  const tog = (key: keyof A11yPrefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const hasChanges = JSON.stringify(prefs) !== JSON.stringify(DEFAULT_PREFS);

  // Fermeture par Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus trap — preventScroll évite le saut de page sur Android/iOS
  useEffect(() => { panelRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label="Options d'accessibilité"
      className="flex flex-col rounded-t-2xl md:rounded-2xl outline-none"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: 420,
        maxHeight: 'min(88dvh, 640px)',
      }}
    >
      {/* En-tête */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-2xl md:rounded-t-2xl shrink-0"
        style={{ background: 'hsl(var(--primary))', borderBottom: '1px solid hsl(var(--primary-foreground) / 0.15)' }}
      >
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
          <span className="font-bold text-primary-foreground">Accessibilité</span>
          <span className="text-xs text-primary-foreground/70 font-medium">WCAG 2.1 AA</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            minWidth: 44, minHeight: 44,
            background: 'hsl(var(--primary-foreground) / 0.15)',
            border: '1px solid hsl(var(--primary-foreground) / 0.3)',
            color: 'hsl(var(--primary-foreground))',
          }}
          aria-label="Fermer le panneau d'accessibilité"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="overflow-y-auto overscroll-contain flex-1 px-4 py-4 space-y-3">

        {/* ① Taille du texte */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Taille du texte</p>
        <div className="flex gap-2">
          {([0, 1, 2] as const).map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setPrefs({ fontSize: lvl })}
              aria-pressed={prefs.fontSize === lvl}
              className="flex-1 rounded-xl font-bold border-2 transition-colors"
              style={{
                minHeight: 52,
                fontSize: lvl === 0 ? 15 : lvl === 1 ? 17 : 20,
                background: prefs.fontSize === lvl ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                borderColor: prefs.fontSize === lvl ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                color: prefs.fontSize === lvl ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}
              aria-label={lvl === 0 ? 'Taille normale' : lvl === 1 ? 'Grande taille +25%' : 'Très grande taille +50%'}
            >
              {lvl === 0 ? 'A' : lvl === 1 ? 'A+' : 'A++'}
            </button>
          ))}
        </div>

        {/* ② Vision */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Vision</p>
        <div className="space-y-2">
          <Toggle
            icon={<Contrast className="w-4 h-4" />}
            label="Contraste élevé"
            desc="Ratio ≥ 7:1 WCAG AAA — texte noir pur sur blanc"
            active={prefs.highContrast}
            onToggle={() => tog('highContrast')}
          />
          <Toggle
            icon={<Eye className="w-4 h-4" />}
            label="Réduire les animations"
            desc="Supprime toutes les transitions et effets"
            active={prefs.reducedMotion}
            onToggle={() => tog('reducedMotion')}
          />
        </div>

        {/* ③ Police / Dyslexie */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Police / Dyslexie</p>
        <div className="space-y-2">
          <Toggle
            icon={<Type className="w-4 h-4" />}
            label="Atkinson Hyperlegible"
            desc="Lisibilité renforcée — dyslexie légère à modérée"
            active={prefs.dyslexiaFont && !prefs.openDyslexic}
            onToggle={() => setPrefs({ dyslexiaFont: !prefs.dyslexiaFont, openDyslexic: false })}
          />
          <Toggle
            icon={<BookOpen className="w-4 h-4" />}
            label="OpenDyslexic"
            desc="Bas de lettre alourdi — dyslexie sévère"
            active={prefs.openDyslexic}
            onToggle={() => setPrefs({ openDyslexic: !prefs.openDyslexic, dyslexiaFont: false })}
          />
          <Toggle
            icon={<MoveHorizontal className="w-4 h-4" />}
            label="Espacement élargi"
            desc="Interlignes et espacement augmentés — WCAG 1.4.12"
            active={prefs.wideSpacing}
            onToggle={() => tog('wideSpacing')}
          />
        </div>

        {/* ④ Mode projecteur */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Enseignant</p>
        <div className="space-y-2">
          <Toggle
            icon={<Presentation className="w-4 h-4" />}
            label="Mode projecteur"
            desc="Police 22 px, fort contraste — lisible à 4–6 m · F7"
            active={prefs.presentation}
            onToggle={() => tog('presentation')}
          />
          {prefs.presentation && (
            <p className="text-xs px-3 py-2 rounded-xl bg-muted border border-border text-foreground">
              💡 <kbd className="font-mono bg-background border border-border rounded px-1">F7</kbd> pour activer / quitter
            </p>
          )}
        </div>

        {/* ⑤ Navigation clavier */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Navigation clavier</p>
        <p className="text-xs px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground">
          <strong>Tab, Entrée, Flèches</strong> — aucune souris requise.
          <span className="block mt-0.5 text-muted-foreground">
            <kbd className="font-mono bg-background border border-border rounded px-1">Alt+1</kbd> contenu principal
            · <kbd className="font-mono bg-background border border-border rounded px-1">F7</kbd> mode projecteur
          </span>
        </p>

        {/* ⑥ Réinitialiser */}
        {hasChanges && (
          <button
            type="button"
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-medium border-2 transition-colors"
            style={{
              minHeight: 48,
              borderColor: 'hsl(var(--border))',
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
            }}
            aria-label="Réinitialiser toutes les options d'accessibilité"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Réinitialiser tout
          </button>
        )}

        <a
          href="/accessibilite"
          className="block text-center text-xs underline underline-offset-2 py-2 text-primary"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
        >
          Déclaration d'accessibilité RGAA 4.1 →
        </a>
      </div>
    </div>
  );
};

// ─── FAB flottant — bouton ♿ toujours visible ─────────────────────────────────
export const AccessibilityFab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Fermeture backdrop
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <>
      {/* Bouton FAB */}
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="fixed z-[9000] flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
        style={{
          bottom: 'max(80px, calc(70px + env(safe-area-inset-bottom, 0px)))',
          right: 16,
          width: 48,
          height: 48,
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: '2px solid hsl(var(--primary-foreground) / 0.2)',
        }}
      >
        <Accessibility className="w-5 h-5" aria-hidden="true" />
        <ZoomIn className="w-2.5 h-2.5 absolute bottom-0.5 right-0.5" aria-hidden="true" />
      </button>

      {/* Overlay + panneau */}
      {open && (
        <div
          className="fixed inset-0 z-[9001] flex items-end md:items-center justify-center md:p-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={handleBackdrop}
          aria-hidden="false"
        >
          <div className="w-full flex justify-center px-0 md:px-0">
            <A11yPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

// ─── Export default no-op — rétrocompatibilité ───────────────────────────────
const AccessibilityToolbar: React.FC = () => null;
export default AccessibilityToolbar;

// ─── AccessibilityHeaderBtn — bouton intégré header/sidebar (sans FAB flottant) ─
export const AccessibilityHeaderBtn: React.FC<{
  className?: string;
  iconOnly?: boolean;
}> = ({ className = '', iconOnly = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={className}
      >
        <Accessibility className="w-4 h-4 shrink-0" aria-hidden="true" />
        {!iconOnly && <span>Accessibilité</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9001] flex items-end md:items-center justify-center md:p-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full flex justify-center">
            <A11yPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

