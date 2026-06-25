import {
  AlertCircle, Camera, CheckCheck, CheckCircle, Copy,
  FileText, ImageIcon, Lightbulb, RefreshCw,
  ScanLine, Sparkles, Upload, X, Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import ExportButton from '@/components/ui/ExportButton';
import PageHero from '@/components/ui/PageHero';
import { useApp } from '@/contexts/AppContext';
import { callLLM } from '@/lib/llm';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Conseils de scan ────────────────────────────────────────────────────────
const GUIDE_TIPS = [
  { emoji: '💡', tip: 'Bonne lumière naturelle — pas d\'ombres sur le texte' },
  { emoji: '📐', tip: 'Cadre bien centré — tout le texte doit être visible' },
  { emoji: '🔍', tip: 'Image nette — maintiens le téléphone immobile 2 s' },
  { emoji: '📄', tip: 'Feuille à plat — évite les plis et reflets' },
];

// ─── Compression image (canvas) avant envoi OCR ───────────────────────────────
// Réduit à max 1800px, JPEG 0.88 → qualité OCR excellente, poids raisonnable
async function compressImage(dataUrl: string, maxPx = 1800, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      // Fond blanc (important pour OCR sur feuilles blanches)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ─── Prompt IA enrichi — analyse pédagogique structurée ─────────────────────
async function analyseAvecIA(texteOcr: string): Promise<string> {
  const prompt = `Tu es un professeur expert en pédagogie française (collège, lycée, BTS, licence).
Voici le texte extrait d'un devoir/exercice scolaire par OCR :

---
${texteOcr}
---

Réponds en français, de façon claire, structurée et bienveillante. Format :

## 📚 Matière & type d'exercice
Identifie précisément : matière, niveau scolaire estimé, type (calcul, dissertation, QCM, problème ouvert, etc.).

## 🔍 Compréhension du sujet
Reformule le sujet clairement. Identifie les mots-clés et notions mobilisées.

## 🪜 Résolution étape par étape
Si c'est un exercice à résoudre : donne la solution COMPLÈTE, numérotée, avec les calculs intermédiaires visibles.
Si c'est un texte ou une question ouverte : propose un plan détaillé avec les arguments clés.

## 💡 Méthode à retenir
Explique la méthode générale pour ce type d'exercice en 3-5 points pratiques.

## ✅ Points clés & pièges à éviter
Liste les notions importantes et les erreurs classiques que font les élèves sur ce sujet.

Adapte le niveau de langage à un élève de collège ou lycée. Sois précis, pédagogique, sans être trop scolaire.`;

  return callLLM([{ role: 'user', parts: [{ text: prompt }] }]);
}

// ─── Étapes de progression ───────────────────────────────────────────────────
type ScanStep = 'idle' | 'compressing' | 'ocr' | 'analysing' | 'done' | 'error';

const STEP_LABELS: Record<ScanStep, string> = {
  idle:        '',
  compressing: 'Optimisation de l\'image…',
  ocr:         'Lecture du texte en cours (OCR)…',
  analysing:   'Analyse pédagogique en cours…',
  done:        'Analyse terminée !',
  error:       'Une erreur est survenue',
};

// ─── Rendu bold inline sécurisé — sans dangerouslySetInnerHTML ───────────────
// Convertit **texte** en <strong> via des nœuds React (aucun HTML brut injecté).
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
  );
}

// ─── Rendu Markdown léger ────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    // Titres ## et ###
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) return (
      <p key={i} className="font-extrabold text-foreground text-base mt-4 mb-1.5 flex items-center gap-1.5">
        {h2[1]}
      </p>
    );
    const h3 = line.match(/^###\s+(.*)/);
    if (h3) return <p key={i} className="font-bold text-foreground text-sm mt-3 mb-1">{h3[1]}</p>;
    // Listes
    const li = line.match(/^[-•*]\s+(.*)/);
    if (li) return (
      <div key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
        <span className="shrink-0 text-primary mt-0.5">•</span>
        <span>{renderBold(li[1])}</span>
      </div>
    );
    // Listes numérotées
    const oli = line.match(/^(\d+)\.\s+(.*)/);
    if (oli) return (
      <div key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
        <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">{oli[1]}</span>
        <span>{renderBold(oli[2])}</span>
      </div>
    );
    // Ligne standard avec bold inline
    return (
      <p key={i} className="text-sm text-foreground leading-relaxed">
        {renderBold(line)}
      </p>
    );
  });
}

// ─── Composant principal ─────────────────────────────────────────────────────
const ScannerPage: React.FC = () => {
  const { addActivity, addXp } = useApp();
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const [image,          setImage]          = useState<string | null>(null);
  const [fileName,       setFileName]       = useState('');
  const [ocrText,        setOcrText]        = useState('');
  const [analysis,       setAnalysis]       = useState('');
  const [step,           setStep]           = useState<ScanStep>('idle');
  const [ocrError,       setOcrError]       = useState('');
  const [analysisError,  setAnalysisError]  = useState('');
  const [dragging,       setDragging]       = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [showRawOcr,     setShowRawOcr]     = useState(false);

  // Deux refs : galerie (fileRef) et appareil photo directement (cameraRef)
  const fileRef   = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // ── OCR + Analyse automatique ─────────────────────────────────────────────
  const runOcrThenAnalyse = useCallback(async (dataUrl: string) => {
    setOcrText('');
    setAnalysis('');
    setOcrError('');
    setAnalysisError('');

    // 1. Compression
    setStep('compressing');
    let compressed = dataUrl;
    try {
      compressed = await compressImage(dataUrl);
    } catch {
      // Si compression échoue, on utilise l'image originale
      compressed = dataUrl;
    }

    // 2. OCR
    setStep('ocr');
    let texte = '';
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ocr-parse-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ base64Image: compressed, language: 'fre' }),
      });
      if (!res.ok) throw new Error(`Erreur OCR (${res.status}) — réessaie avec une photo plus nette`);
      const data = await res.json();
      if (data.IsErroredOnProcessing || data.OCRExitCode === 4) {
        throw new Error(data.ParsedResults?.[0]?.ErrorMessage ?? 'OCR échoué — le texte n\'est peut-être pas lisible');
      }
      texte = data.ParsedResults?.[0]?.ParsedText ?? '';
      if (!texte.trim()) throw new Error('Aucun texte détecté. Vérifie la luminosité et la netteté de la photo.');
      setOcrText(texte);
      addActivity('Devoir scanné (OCR)');
      addXp(10);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Erreur OCR inconnue');
      setStep('error');
      return;
    }

    // 3. Analyse IA automatique
    setStep('analysing');
    try {
      const result = await analyseAvecIA(texte);
      setAnalysis(result);
      addActivity('Analyse du devoir complétée');
      addXp(20);
      setStep('done');
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Erreur d'analyse IA");
      setStep('error');
    }
  }, [addActivity, addXp]);

  // ── Chargement fichier ─────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setOcrError('Fichier non pris en charge — choisis une image JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setOcrError('Image trop grande (max 15 Mo). La compression réduira la taille automatiquement.');
    }
    setFileName(file.name || 'photo.jpg');
    setStep('idle');
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target?.result as string;
      setImage(b64);
      void runOcrThenAnalyse(b64);
    };
    reader.readAsDataURL(file);
  }, [runOcrThenAnalyse]);

  const reset = () => {
    setImage(null);
    setFileName('');
    setOcrText('');
    setAnalysis('');
    setOcrError('');
    setAnalysisError('');
    setStep('idle');
    setShowRawOcr(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const copyOcr = async () => {
    await navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => { if (mountedRef.current) setCopied(false); }, 2000);
  };

  const retryAnalysis = async () => {
    if (!ocrText) return;
    setAnalysisError('');
    setStep('analysing');
    try {
      const result = await analyseAvecIA(ocrText);
      setAnalysis(result);
      setStep('done');
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Erreur d'analyse");
      setStep('error');
    }
  };

  // ── Barre de progression ───────────────────────────────────────────────────
  const steps: { key: ScanStep; label: string }[] = [
    { key: 'compressing', label: 'Optimisation' },
    { key: 'ocr',         label: 'Lecture OCR'  },
    { key: 'analysing',   label: 'Analyse IA'   },
    { key: 'done',        label: 'Terminé ✓'    },
  ];
  const stepIdx = steps.findIndex(s => s.key === step);
  const isProcessing = ['compressing', 'ocr', 'analysing'].includes(step);

  return (
    <div className="min-w-0 space-y-4">
      <h1 className="sr-only">Scanner de devoirs</h1>
      <SEO
        title="Scanner de devoirs — Photo → Correction instantanée | Apprenix"
        description="Photographiez votre exercice et obtenez une correction détaillée en secondes. Gratuit, sans compte. Maths, physique, chimie et plus."
        canonical="/scanner"
        keywords="scanner devoir IA, photo exercice analyse IA, OCR scolaire, correction devoir photo, explication exercice IA, aide devoir photo mobile, scanner cours IA gratuit"
        dateModified="2026-06-20"
      />

      {/* ── Hero ── */}
      <PageHero
        variant="tool"
        icon={ScanLine}
        badge={<>📷 Scanner de devoirs</>}
        badgeClassName="bg-chart-2/10 text-chart-2 border-chart-2/25"
        title="Scanner de devoirs"
        subtitle="Prends en photo ton exercice — l'OCR lit le texte, puis l'IA t'explique la solution étape par étape. Automatique."
        stats={[
          { value: 'OCR',    label: 'Lecture réelle' },
          { value: 'Auto',   label: 'Analyse immédiate' },
          { value: '< 1 min', label: 'Du scan au résultat' },
        ]}
      >
        <ENBadge />
      </PageHero>

      <div className="flex flex-col md:flex-row gap-5">
        {/* ── Zone principale ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ──────── Zone d'import ──────── */}
          {!image ? (
            <Card className="shadow-card">
              <CardContent className="p-5 md:p-6">

                {/* Zone drag & drop */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Zone de dépôt d'image ou appareil photo"
                  className={`border-2 border-dashed rounded-2xl p-6 md:p-10 text-center transition-colors cursor-pointer ${
                    dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/3'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-2xl bg-chart-2/10 border border-chart-2/20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-chart-2" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5 text-balance text-base">
                    Dépose ta photo de devoir ici
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 text-pretty max-w-xs mx-auto">
                    Glisse-dépose ou clique — l'image est compressée et analysée automatiquement
                  </p>
                  <p className="text-xs text-muted-foreground">JPG · PNG · WEBP · HEIC — jusqu'à 15 Mo</p>
                </div>

                {/* Inputs cachés */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  aria-label="Sélectionner une image depuis la galerie"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {/* capture=environment → ouvre directement l'appareil photo arrière sur mobile */}
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                  aria-label="Prendre une photo avec l'appareil photo"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                {/* Deux boutons d'action — caméra vs galerie */}
                <div className="flex flex-col md:flex-row gap-3 mt-4">
                  <Button
                    className="flex-1 h-12 text-sm font-bold bg-primary text-primary-foreground shadow-md"
                    onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
                  >
                    <Camera className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
                    📷 Prendre en photo
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 text-sm font-semibold"
                    onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                    <ImageIcon className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
                    Choisir dans la galerie
                  </Button>
                </div>

                {/* Matières supportées */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {['📐 Maths', '⚗️ Physique', '🧬 SVT', '📖 Français', '🌍 Histoire-Géo', '🔣 Chimie', '🇬🇧 Anglais', '🧮 Calcul'].map(m => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground">{m}</span>
                  ))}
                </div>

                {ocrError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-destructive text-pretty">{ocrError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* ──────── Image chargée ──────── */
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 min-w-0">
                    <ImageIcon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    <span className="truncate">{fileName}</span>
                    {step === 'done' && <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0">✓ Analysé</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    {ocrText && !isProcessing && (
                      <Button variant="ghost" size="sm" className="h-9 text-xs gap-1"
                        onClick={() => void runOcrThenAnalyse(image)}>
                        <RefreshCw className="w-3 h-3" aria-hidden="true" /> Rescanner
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={reset}
                      aria-label="Supprimer l'image">
                      <X className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-xl overflow-hidden bg-muted">
                  <img src={image} alt="Devoir scanné" className="w-full h-auto max-h-64 object-contain" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ──────── Barre de progression animée ──────── */}
          {image && step !== 'idle' && (
            <Card className="shadow-card border-primary/20">
              <CardContent className="p-4">
                {/* Label étape courante */}
                <div className="flex items-center gap-2 mb-3">
                  {isProcessing ? (
                    <ScanLine className="w-4 h-4 text-primary animate-pulse shrink-0" aria-hidden="true" />
                  ) : step === 'done' ? (
                    <CheckCircle className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
                  )}
                  <p className={`text-sm font-semibold ${step === 'done' ? 'text-success' : step === 'error' ? 'text-destructive' : 'text-foreground'}`}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
                {/* Stepper visuel */}
                <div className="flex items-center gap-1">
                  {steps.map((s, i) => {
                    const done    = stepIdx > i || step === 'done';
                    const active  = stepIdx === i && isProcessing;
                    return (
                      <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                            done   ? 'bg-primary text-primary-foreground' :
                            active ? 'bg-primary/20 text-primary ring-2 ring-primary animate-pulse' :
                                     'bg-muted text-muted-foreground'
                          }`}>
                            {done ? '✓' : i + 1}
                          </div>
                          <p className="text-[9px] text-center text-muted-foreground leading-tight hidden md:block truncate w-full">{s.label}</p>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-4 rounded transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ──────── Erreurs ──────── */}
          {image && ocrError && (
            <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/30 p-4">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-destructive mb-1">Texte non détecté</p>
                <p className="text-sm text-destructive/80 text-pretty mb-3">{ocrError}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1"
                    onClick={() => { void runOcrThenAnalyse(image); }}>
                    <RefreshCw className="w-3 h-3" aria-hidden="true" /> Réessayer
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={reset}>
                    <Camera className="w-3 h-3" aria-hidden="true" /> Nouvelle photo
                  </Button>
                </div>
              </div>
            </div>
          )}
          {analysisError && (
            <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/30 p-4">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-destructive mb-1">Analyse IA indisponible</p>
                <p className="text-sm text-destructive/80 text-pretty mb-2">{analysisError}</p>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => void retryAnalysis()}>
                  <RefreshCw className="w-3 h-3" aria-hidden="true" /> Relancer l'analyse
                </Button>
              </div>
            </div>
          )}

          {/* ──────── Texte OCR extrait (rétractable) ──────── */}
          {ocrText && (
            <Card className="shadow-card border-l-4 border-l-chart-3">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowRawOcr(v => !v)}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors min-w-0"
                  >
                    <FileText className="w-4 h-4 text-chart-3 shrink-0" aria-hidden="true" />
                    Texte lu par OCR
                    <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-xs shrink-0">
                      {ocrText.split(' ').length} mots
                    </Badge>
                    <span className="text-muted-foreground text-xs">{showRawOcr ? '▲ masquer' : '▼ voir'}</span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <ExportButton
                      fileName="devoir-scanné"
                      disabled={!ocrText}
                      variant="outline"
                      size="sm"
                      label="Exporter"
                      getContent={() => ({
                        title: 'Devoir scanné — Apprenix',
                        subtitle: `Fichier : ${fileName}`,
                        sections: [
                          { heading: 'Texte extrait (OCR)', body: ocrText },
                          ...(analysis ? [{ heading: 'Analyse pédagogique', body: analysis }] : []),
                        ],
                      })}
                    />
                    <Button variant="ghost" size="sm" className="h-9 text-xs gap-1 shrink-0" onClick={() => void copyOcr()}>
                      {copied ? <><CheckCheck className="w-3 h-3" aria-hidden="true" /> Copié</> : <><Copy className="w-3 h-3" aria-hidden="true" /> Copier</>}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showRawOcr && (
                <CardContent className="pt-0">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-muted/50 border border-border/40 p-3 rounded-xl leading-relaxed max-h-48 overflow-y-auto">
                    {ocrText}
                  </pre>
                </CardContent>
              )}
            </Card>
          )}

          {/* ──────── Analyse pédagogique ──────── */}
          {(step === 'analysing' || analysis) && (
            <Card className="shadow-card border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    Analyse pédagogique
                    {step === 'analysing' && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs animate-pulse">
                        Génération…
                      </Badge>
                    )}
                    {step === 'done' && (
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">
                        Terminé ✓
                      </Badge>
                    )}
                  </CardTitle>
                  {analysis && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1"
                        onClick={async () => {
                          await navigator.clipboard.writeText(analysis);
                          setCopied(true);
                          setTimeout(() => { if (mountedRef.current) setCopied(false); }, 2000);
                        }}>
                        {copied ? <><CheckCheck className="w-3 h-3" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {step === 'analysing' && !analysis ? (
                  <div className="space-y-2.5 p-1">
                    {[80, 65, 90, 55, 75, 60].map((w, i) => (
                      <div key={i} className="h-3.5 bg-muted rounded-full animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3 text-primary animate-pulse shrink-0" aria-hidden="true" />
                      Analyse pédagogique par l'IA en cours…
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-1 p-3 bg-muted/30 border border-border/40 rounded-xl max-h-[600px] overflow-y-auto">
                    {renderMarkdown(analysis)}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

        </div>

        {/* ── Guide d'utilisation ── */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <Card className="shadow-card sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                Comment bien scanner ?
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {GUIDE_TIPS.map(({ emoji, tip }, i) => (
                <div key={tip} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    <span className="mr-1" aria-hidden="true">{emoji}</span>{tip}
                  </p>
                </div>
              ))}

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
                  Entièrement automatique
                </p>
                <p className="text-xs text-muted-foreground text-pretty">
                  Dès que tu choisis ton image, l'OCR lit le texte et l'IA lance l'analyse sans que tu aies à cliquer.
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 border border-border/50 p-3 space-y-1.5">
                <p className="text-xs font-bold text-foreground">📌 Matières supportées</p>
                <p className="text-xs text-muted-foreground text-pretty">
                  Maths, Physique-Chimie, SVT, Français, Histoire-Géo, Anglais et toute autre matière avec du texte imprimé ou manuscrit lisible.
                </p>
              </div>

              <div className="rounded-xl bg-success/5 border border-success/20 p-3">
                <p className="text-xs font-bold text-foreground mb-1">🔒 Données protégées</p>
                <p className="text-xs text-muted-foreground text-pretty">
                  Aucune image n'est stockée. Le traitement est immédiat et confidentiel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
