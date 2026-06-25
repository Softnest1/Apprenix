import {
  BookOpen, Check, ChevronRight, Eye, Loader2, Monitor,
  Moon, RefreshCw, Settings, Sun, Type, Volume2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';
import { updateAccessibilityPrefs } from '@/lib/api';
import type { AccessibilityPrefs } from '@/db/supabase';

// ─── Profils prédéfinis ────────────────────────────────────────────────────────
const PROFILES: Array<{
  id: AccessibilityPrefs['profile'];
  label: string;
  icon: string;
  desc: string;
  prefs: Partial<AccessibilityPrefs>;
}> = [
  {
    id: 'standard',
    label: 'Standard',
    icon: '📖',
    desc: 'Interface par défaut, adaptée à la majorité des utilisateurs.',
    prefs: { font: 'inter', fontSize: 16, lineHeight: 1.5, background: 'white', contrast: 'normal', daltonism: 'none', tts: false, syllabation: false, falc: false, simplifiedNav: false },
  },
  {
    id: 'dys',
    label: 'DYS (dyslexie)',
    icon: '🔡',
    desc: 'Police OpenDyslexic, espacement large, fond crème, syllabation activée.',
    prefs: { font: 'opendyslexic', fontSize: 18, lineHeight: 2, background: 'cream', contrast: 'normal', daltonism: 'none', tts: true, syllabation: true, falc: false, simplifiedNav: false },
  },
  {
    id: 'ulis',
    label: 'ULIS / SEGPA',
    icon: '🌟',
    desc: 'Navigation simplifiée, FALC, pictogrammes, texte allégé.',
    prefs: { font: 'luciole', fontSize: 18, lineHeight: 2, background: 'lightblue', contrast: 'normal', daltonism: 'none', tts: true, syllabation: false, falc: true, simplifiedNav: true },
  },
  {
    id: 'malvoyant',
    label: 'Malvoyant',
    icon: '👁️',
    desc: 'Contraste très élevé, grande police, Luciole, synthèse vocale.',
    prefs: { font: 'luciole', fontSize: 20, lineHeight: 1.8, background: 'white', contrast: 'veryhigh', daltonism: 'none', tts: true, syllabation: false, falc: false, simplifiedNav: false },
  },
];

const FONTS: Array<{ id: AccessibilityPrefs['font']; label: string; css: string }> = [
  { id: 'inter',        label: 'Inter',         css: 'Inter, sans-serif'        },
  { id: 'luciole',      label: 'Luciole',       css: '"Atkinson Hyperlegible", sans-serif' },
  { id: 'opendyslexic', label: 'OpenDyslexic',  css: '"OpenDyslexic", sans-serif' },
  { id: 'arial',        label: 'Arial',         css: 'Arial, sans-serif'        },
];

const BG_COLORS: Array<{ id: AccessibilityPrefs['background']; label: string; css: string }> = [
  { id: 'white',     label: 'Blanc',       css: '#ffffff' },
  { id: 'cream',     label: 'Crème',       css: '#fdf6e3' },
  { id: 'lightblue', label: 'Bleu clair',  css: '#e8f4f8' },
  { id: 'lightgray', label: 'Gris clair',  css: '#f5f5f5' },
];

const DALTON: Array<{ id: AccessibilityPrefs['daltonism']; label: string }> = [
  { id: 'none',        label: 'Aucune adaptation' },
  { id: 'protanopia',  label: 'Protanopie (rouge)' },
  { id: 'deuteranopia',label: 'Deutéranopie (vert)' },
  { id: 'tritanopia',  label: 'Tritanopie (bleu)'  },
];

const DEFAULT_PREFS: AccessibilityPrefs = {
  profile: 'standard',
  font: 'inter',
  fontSize: 16,
  lineHeight: 1.5,
  background: 'white',
  contrast: 'normal',
  daltonism: 'none',
  tts: false,
  syllabation: false,
  falc: false,
  simplifiedNav: false,
};

// ─── Toggle switch accessible ─────────────────────────────────────────────────
function Toggle({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ─── Prévisualisation en direct ───────────────────────────────────────────────
function LivePreview({ prefs }: { prefs: AccessibilityPrefs }) {
  const fontCss = FONTS.find(f => f.id === prefs.font)?.css ?? 'Inter, sans-serif';
  const bgCss   = BG_COLORS.find(b => b.id === prefs.background)?.css ?? '#ffffff';
  const filterCss = {
    none:         'none',
    protanopia:   'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia:   'url(#tritanopia)',
  }[prefs.daltonism ?? 'none'];

  return (
    <div className="rounded-xl border-2 border-dashed border-border overflow-hidden">
      <div className="px-3 py-1.5 bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="w-3.5 h-3.5" /> Prévisualisation en direct
      </div>
      <div
        className="p-4 transition-all duration-300"
        style={{
          fontFamily: fontCss,
          fontSize: `${prefs.fontSize ?? 16}px`,
          lineHeight: prefs.lineHeight ?? 1.5,
          background: bgCss,
          filter: filterCss === 'none' ? undefined : filterCss,
          ...(prefs.contrast === 'veryhigh' ? { filter: 'contrast(1.4)' } : prefs.contrast === 'high' ? { filter: 'contrast(1.2)' } : {}),
        }}
      >
        <p className="font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Exemple de texte Apprenix</p>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
          {prefs.syllabation
            ? 'Voi-ci un ex-emple de tex-te a-vec syl-la-ba-tion pour ai-der à la lec-ture.'
            : 'Voici un exemple de texte tel qu\'il apparaîtra sur la plateforme avec vos paramètres.'}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ background: '#065F46' }}>Mathématiques</span>
          <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ background: '#EA580C' }}>Français</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page principale
// ═══════════════════════════════════════════════════════════════════════════════
export default function AccessibilitePersoPage() {
  const { profile, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULT_PREFS);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/connexion'); return; }
    if (profile && (profile as { accessibility_prefs?: AccessibilityPrefs }).accessibility_prefs) {
      setPrefs({ ...DEFAULT_PREFS, ...(profile as { accessibility_prefs?: AccessibilityPrefs }).accessibility_prefs });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile.id]);

  const set = <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) =>
    setPrefs(p => ({ ...p, [key]: value }));

  const applyProfile = (p: typeof PROFILES[0]) => {
    setPrefs(prev => ({ ...prev, ...p.prefs, profile: p.id }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateAccessibilityPrefs(profile.id, prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Paramètres d\'accessibilité sauvegardés !');
    } catch { toast.error('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <SEO
        title="Accessibilité personnalisée — Apprenix"
        description="Personnalisez votre expérience Apprenix : police, taille, contraste, daltonisme, synthèse vocale, FALC."
      />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Accessibilité personnalisée
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Adaptez l'interface à vos besoins — DYS, ULIS, SEGPA, malvoyance, daltonisme
            </p>
          </div>
          <Button onClick={save} disabled={saving}>
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
              : saved
                ? <Check className="w-4 h-4 mr-2 text-success" />
                : <ChevronRight className="w-4 h-4 mr-2" />
            }
            {saved ? 'Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">

            {/* Profils prédéfinis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Profils prédéfinis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PROFILES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyProfile(p)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      prefs.profile === p.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">{p.label}</p>
                          {prefs.profile === p.id && (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{p.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Police */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" /> Police d'écriture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={prefs.font === f.id}
                      aria-label={`Police ${f.label}`}
                      onClick={() => set('font', f.id)}
                      className={`min-h-[44px] rounded-lg border p-3 text-center transition-all ${
                        prefs.font === f.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                      style={{ fontFamily: f.css }}
                    >
                      <p className="text-sm font-medium text-foreground">Aa</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.label}</p>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-normal text-muted-foreground">
                    Taille : <span className="font-semibold text-foreground">{prefs.fontSize ?? 16}px</span>
                  </Label>
                  <Slider
                    min={12} max={28} step={1}
                    value={[prefs.fontSize ?? 16]}
                    onValueChange={([v]) => set('fontSize', v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>12px</span><span>28px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-normal text-muted-foreground">
                    Interligne : <span className="font-semibold text-foreground">{prefs.lineHeight ?? 1.5}×</span>
                  </Label>
                  <Slider
                    min={1.2} max={2.5} step={0.1}
                    value={[prefs.lineHeight ?? 1.5]}
                    onValueChange={([v]) => set('lineHeight', v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1.2×</span><span>2.5×</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Couleurs et contraste */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> Couleurs & contraste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Fond de page</Label>
                  <div className="flex gap-2 flex-wrap">
                    {BG_COLORS.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        aria-label={b.label}
                        aria-pressed={prefs.background === b.id}
                        onClick={() => set('background', b.id)}
                        className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg border-2 transition-all ${
                          prefs.background === b.id ? 'border-primary scale-110' : 'border-border hover:border-primary/50'
                        }`}
                        style={{ background: b.css }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Niveau de contraste</Label>
                  <div className="flex gap-2 flex-wrap">
                    {([['normal', 'Normal', Sun], ['high', 'Élevé', Moon], ['veryhigh', 'Très élevé', Eye]] as const).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={prefs.contrast === id}
                        onClick={() => set('contrast', id)}
                        className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all ${
                          prefs.contrast === id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Daltonisme</Label>
                  <div className="space-y-1">
                    {DALTON.map(d => (
                      <button
                        key={d.id}
                        type="button"
                        aria-pressed={prefs.daltonism === d.id}
                        onClick={() => set('daltonism', d.id)}
                        className={`min-h-[44px] w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                          prefs.daltonism === d.id
                            ? 'border-primary bg-primary/5 text-foreground font-medium'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options supplémentaires */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" /> Options supplémentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <Toggle
                  label="Synthèse vocale (TTS)"
                  description="Lecture automatique du texte à haute voix"
                  checked={prefs.tts ?? false}
                  onChange={v => set('tts', v)}
                />
                <Toggle
                  label="Syllabation"
                  description="Affiche les syllabes séparées pour faciliter la lecture"
                  checked={prefs.syllabation ?? false}
                  onChange={v => set('syllabation', v)}
                />
                <Toggle
                  label="Mode FALC"
                  description="Facile à Lire et à Comprendre — textes simplifiés, pictogrammes"
                  checked={prefs.falc ?? false}
                  onChange={v => set('falc', v)}
                />
                <Toggle
                  label="Navigation simplifiée"
                  description="Réduit le nombre d'éléments affichés pour plus de clarté"
                  checked={prefs.simplifiedNav ?? false}
                  onChange={v => set('simplifiedNav', v)}
                />
              </CardContent>
            </Card>

          </div>

          {/* ── Colonne prévisualisation ────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <LivePreview prefs={prefs} />

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Vos paramètres actuels</p>
                <Separator />
                {([
                  ['Profil', PROFILES.find(p => p.id === prefs.profile)?.label ?? '—'],
                  ['Police', FONTS.find(f => f.id === prefs.font)?.label ?? '—'],
                  ['Taille', `${prefs.fontSize ?? 16}px`],
                  ['Interligne', `${prefs.lineHeight ?? 1.5}×`],
                  ['Fond', BG_COLORS.find(b => b.id === prefs.background)?.label ?? '—'],
                  ['Contraste', prefs.contrast ?? 'normal'],
                  ['Daltonisme', DALTON.find(d => d.id === prefs.daltonism)?.label ?? '—'],
                  ['TTS', prefs.tts ? '✅ Activé' : '❌ Désactivé'],
                  ['Syllabation', prefs.syllabation ? '✅ Activée' : '❌ Désactivée'],
                  ['FALC', prefs.falc ? '✅ Activé' : '❌ Désactivé'],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
                <Separator />
                <Button onClick={save} disabled={saving} className="w-full">
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : saved
                      ? <Check className="w-4 h-4 mr-2" />
                      : <RefreshCw className="w-4 h-4 mr-2" />
                  }
                  {saved ? 'Sauvegardé !' : 'Appliquer et sauvegarder'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
