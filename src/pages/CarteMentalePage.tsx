import {Check, Download, GitBranch,
  Pencil, 
  Plus, RotateCcw, 
  Trash2, X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/ui/PageHero';
import { useApp } from '@/contexts/AppContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Branch {
  id: string;
  label: string;
  color: string;
  children: Leaf[];
}
interface Leaf {
  id: string;
  label: string;
}
interface MindMap {
  center: string;
  branches: Branch[];
}

const BRANCH_COLORS = [
  'bg-chart-1/20 text-chart-1 border-chart-1/40',
  'bg-chart-2/20 text-chart-2 border-chart-2/40',
  'bg-chart-3/20 text-chart-3 border-chart-3/40',
  'bg-destructive/15 text-destructive border-destructive/30',
  'bg-primary/15 text-primary border-primary/30',
  'bg-warning/15 text-warning border-warning/30',
];

const CONNECTOR_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--destructive))',
  'hsl(var(--primary))',
  'hsl(var(--warning))',
];

const DEFAULT_MAP: MindMap = {
  center: 'Mon sujet',
  branches: [
    { id: '1', label: 'Idée principale 1', color: BRANCH_COLORS[0], children: [{ id: '1a', label: 'Sous-idée' }] },
    { id: '2', label: 'Idée principale 2', color: BRANCH_COLORS[1], children: [] },
  ],
};

const MindMapTemplates: React.FC<{ onLoad: (map: MindMap) => void }> = ({ onLoad }) => {
  const templates: { label: string; map: MindMap }[] = [
    {
      label: 'La Photosynthèse',
      map: { center: 'La Photosynthèse', branches: [
        { id: 't1', label: 'Définition', color: BRANCH_COLORS[0], children: [{ id: 't1a', label: 'Transformation lumière → énergie chimique' }, { id: 't1b', label: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' }] },
        { id: 't2', label: 'Conditions', color: BRANCH_COLORS[1], children: [{ id: 't2a', label: 'Lumière solaire' }, { id: 't2b', label: 'Chlorophylle' }, { id: 't2c', label: 'CO₂ et eau' }] },
        { id: 't3', label: 'Lieux', color: BRANCH_COLORS[2], children: [{ id: 't3a', label: 'Chloroplastes' }, { id: 't3b', label: 'Cellules des feuilles' }] },
        { id: 't4', label: 'Produits', color: BRANCH_COLORS[3], children: [{ id: 't4a', label: 'Glucose (énergie)' }, { id: 't4b', label: 'Dioxygène (O₂) libéré' }] },
      ]},
    },
    {
      label: 'La Révolution française',
      map: { center: 'Révolution française', branches: [
        { id: 'r1', label: 'Causes', color: BRANCH_COLORS[0], children: [{ id: 'r1a', label: 'Crise financière royale' }, { id: 'r1b', label: 'Inégalités des 3 ordres' }, { id: 'r1c', label: 'Idées des Lumières' }] },
        { id: 'r2', label: 'Événements clés', color: BRANCH_COLORS[1], children: [{ id: 'r2a', label: 'Prise de la Bastille 14/07/1789' }, { id: 'r2b', label: 'DDHC 26/08/1789' }, { id: 'r2c', label: 'Exécution de Louis XVI 1793' }] },
        { id: 'r3', label: 'La Terreur', color: BRANCH_COLORS[3], children: [{ id: 'r3a', label: 'Robespierre au pouvoir' }, { id: 'r3b', label: 'Comité de salut public' }, { id: 'r3c', label: 'Fin : Thermidor 1794' }] },
        { id: 'r4', label: 'Conséquences', color: BRANCH_COLORS[2], children: [{ id: 'r4a', label: 'Fin de la monarchie absolue' }, { id: 'r4b', label: 'Droits de l\'Homme' }, { id: 'r4c', label: 'Naissance de la République' }] },
      ]},
    },
    {
      label: 'Les fonctions (Maths)',
      map: { center: 'Fonctions mathématiques', branches: [
        { id: 'f1', label: 'Définitions', color: BRANCH_COLORS[0], children: [{ id: 'f1a', label: 'Domaine de définition' }, { id: 'f1b', label: 'Image et antécédent' }, { id: 'f1c', label: 'Courbe représentative' }] },
        { id: 'f2', label: 'Dérivées', color: BRANCH_COLORS[1], children: [{ id: 'f2a', label: 'f(x)=xⁿ → nxⁿ⁻¹' }, { id: 'f2b', label: 'f(x)=eˣ → eˣ' }, { id: 'f2c', label: 'f(x)=ln(x) → 1/x' }] },
        { id: 'f3', label: 'Sens de variation', color: BRANCH_COLORS[2], children: [{ id: 'f3a', label: 'f\'(x) > 0 → croissante' }, { id: 'f3b', label: 'f\'(x) < 0 → décroissante' }, { id: 'f3c', label: 'f\'(x) = 0 → extremum' }] },
        { id: 'f4', label: 'Intégrales', color: BRANCH_COLORS[4], children: [{ id: 'f4a', label: 'Primitive de f(x)' }, { id: 'f4b', label: '∫ₐᵇ f(x)dx = aire algébrique' }] },
      ]},
    },
    {
      label: 'L\'ADN et la génétique',
      map: { center: 'ADN & Génétique', branches: [
        { id: 'g1', label: 'Structure ADN', color: BRANCH_COLORS[0], children: [{ id: 'g1a', label: 'Double hélice' }, { id: 'g1b', label: 'Bases : A-T, G-C' }, { id: 'g1c', label: 'Nucléotides' }] },
        { id: 'g2', label: 'Expression génétique', color: BRANCH_COLORS[1], children: [{ id: 'g2a', label: 'Transcription → ARNm' }, { id: 'g2b', label: 'Traduction → Protéine' }] },
        { id: 'g3', label: 'Divisions cellulaires', color: BRANCH_COLORS[2], children: [{ id: 'g3a', label: 'Mitose : 2 cellules identiques' }, { id: 'g3b', label: 'Méiose : 4 gamètes haploïdes' }] },
        { id: 'g4', label: 'Mutations', color: BRANCH_COLORS[3], children: [{ id: 'g4a', label: 'Substitution de base' }, { id: 'g4b', label: 'Délétion / insertion' }, { id: 'g4c', label: 'Conséquences phénotypiques' }] },
      ]},
    },
    {
      label: 'La Seconde Guerre mondiale',
      map: { center: '2ème Guerre mondiale', branches: [
        { id: 'w1', label: 'Causes', color: BRANCH_COLORS[0], children: [{ id: 'w1a', label: 'Montée du nazisme' }, { id: 'w1b', label: 'Traité de Versailles humiliant' }, { id: 'w1c', label: 'Crise économique 1929' }] },
        { id: 'w2', label: 'Grandes étapes', color: BRANCH_COLORS[1], children: [{ id: 'w2a', label: '1939 : invasion Pologne' }, { id: 'w2b', label: '1940 : chute de la France' }, { id: 'w2c', label: '1944 : Débarquement' }, { id: 'w2d', label: '1945 : capitulation' }] },
        { id: 'w3', label: 'Génocide', color: BRANCH_COLORS[3], children: [{ id: 'w3a', label: 'Shoah — 6 millions de Juifs' }, { id: 'w3b', label: 'Camps d\'extermination' }] },
        { id: 'w4', label: 'Conséquences', color: BRANCH_COLORS[2], children: [{ id: 'w4a', label: 'Création ONU (1945)' }, { id: 'w4b', label: 'Procès de Nuremberg' }, { id: 'w4c', label: 'Début Guerre froide' }] },
      ]},
    },
  ];

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <Download className="w-4 h-4" /> Modèles de cartes mentales — programme français
        </CardTitle>
        <p className="text-xs text-muted-foreground">Charge un modèle prêt-à-l'emploi et modifie-le librement. Rédigé manuellement.</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button
              key={t.label}
              type="button"
              onClick={() => { onLoad(t.map); toast.success(`Modèle "${t.label}" chargé !`); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Nœud branche modifiable ──────────────────────────────────────────────────
const EditableLabel: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  size?: 'sm' | 'base';
}> = ({ value, onChange, className = '', size = 'base' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    if (draft.trim()) onChange(draft.trim());
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          className={`h-7 px-2 text-${size} min-w-0 w-full`}
        />
        <button type="button" onClick={commit} className="text-success shrink-0"><Check className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`group flex items-center gap-1 text-left ${className}`}
    >
      <span className={`text-${size} font-medium text-balance`}>{value}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 group-focus:opacity-60 shrink-0 transition-opacity" />
    </button>
  );
};

// ─── Carte mentale principale ──────────────────────────────────────────────────
const MindMapCanvas: React.FC<{
  map: MindMap;
  onUpdate: (m: MindMap) => void;
}> = ({ map, onUpdate }) => {
  const update = useCallback((fn: (m: MindMap) => MindMap) => onUpdate(fn(map)), [map, onUpdate]);

  const addBranch = () => {
    const idx = map.branches.length % BRANCH_COLORS.length;
    update(m => ({
      ...m,
      branches: [...m.branches, { id: Date.now().toString(), label: 'Nouvelle branche', color: BRANCH_COLORS[idx], children: [] }],
    }));
  };

  const removeBranch = (id: string) =>
    update(m => ({ ...m, branches: m.branches.filter(b => b.id !== id) }));

  const updateBranch = (id: string, label: string) =>
    update(m => ({ ...m, branches: m.branches.map(b => b.id === id ? { ...b, label } : b) }));

  const addLeaf = (branchId: string) =>
    update(m => ({ ...m, branches: m.branches.map(b => b.id === branchId ? { ...b, children: [...b.children, { id: Date.now().toString(), label: 'Sous-idée' }] } : b) }));

  const removeLeaf = (branchId: string, leafId: string) =>
    update(m => ({ ...m, branches: m.branches.map(b => b.id === branchId ? { ...b, children: b.children.filter(l => l.id !== leafId) } : b) }));

  const updateLeaf = (branchId: string, leafId: string, label: string) =>
    update(m => ({ ...m, branches: m.branches.map(b => b.id === branchId ? { ...b, children: b.children.map(l => l.id === leafId ? { ...l, label } : l) } : b) }));

  return (
    <div className="space-y-4">
      {/* Nœud central */}
      <div className="flex justify-center">
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-md min-w-[120px] max-w-[220px] text-center">
          <EditableLabel
            value={map.center}
            onChange={v => update(m => ({ ...m, center: v }))}
            className="justify-center text-primary-foreground"
            size="base"
          />
        </div>
      </div>

      {/* Branches */}
      <div className="space-y-3">
        {map.branches.map((branch, idx) => (
          <div key={branch.id} className="relative pl-4">
            {/* Connecteur vertical */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
              style={{ backgroundColor: CONNECTOR_COLORS[idx % CONNECTOR_COLORS.length] }}
            />

            <div className={`rounded-xl border p-3 ${branch.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CONNECTOR_COLORS[idx % CONNECTOR_COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <EditableLabel
                    value={branch.label}
                    onChange={v => updateBranch(branch.id, v)}
                    size="sm"
                  />
                </div>
                <button type="button" onClick={() => removeBranch(branch.id)} className="text-muted-foreground hover:text-destructive shrink-0 p-0.5" aria-label="Supprimer branche">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Feuilles (sous-idées) */}
              {branch.children.length > 0 && (
                <div className="space-y-1.5 ml-4 mb-2">
                  {branch.children.map(leaf => (
                    <div key={leaf.id} className="flex items-center gap-2 bg-card/60 rounded-lg px-2.5 py-1.5 border border-border/40">
                      <span className="text-muted-foreground shrink-0">›</span>
                      <div className="flex-1 min-w-0">
                        <EditableLabel
                          value={leaf.label}
                          onChange={v => updateLeaf(branch.id, leaf.id, v)}
                          size="sm"
                        />
                      </div>
                      <button type="button" onClick={() => removeLeaf(branch.id, leaf.id)} className="text-muted-foreground hover:text-destructive shrink-0 p-0.5" aria-label="Supprimer sous-idée">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="button"
                onClick={() => addLeaf(branch.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-4 transition-colors"
              >
                <Plus className="w-3 h-3" /> Ajouter une sous-idée
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ajouter branche */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addBranch}
          className="h-9 text-xs border-dashed"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter une branche
        </Button>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CarteMentalePage() {
  const { profile } = useApp();
  // Clé namespaced par userId → évite le mélange de cartes entre comptes sur le même appareil
  const STORAGE_KEY = `apprenix-mind-maps-${profile.id || 'guest'}`;

  const [maps, setMaps] = useState<{ id: string; name: string; data: MindMap }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [{ id: '1', name: 'Carte 1', data: DEFAULT_MAP }];
    } catch { return [{ id: '1', name: 'Carte 1', data: DEFAULT_MAP }]; }
  });

  const [activeId, setActiveId] = useState(() => maps[0]?.id ?? '1');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  // Sauvegarde auto
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  }, [maps, STORAGE_KEY]);

  const activeMap = maps.find(m => m.id === activeId);

  const updateMap = useCallback((data: MindMap) => {
    setMaps(prev => prev.map(m => m.id === activeId ? { ...m, data } : m));
  }, [activeId]);

  const newMap = () => {
    const id = Date.now().toString();
    const name = `Carte ${maps.length + 1}`;
    setMaps(prev => [...prev, { id, name, data: { center: 'Mon sujet', branches: [] } }]);
    setActiveId(id);
    toast.success(`"${name}" créée !`);
  };

  const deleteMap = (id: string) => {
    if (maps.length <= 1) { toast.error('Vous devez garder au moins une carte.'); return; }
    const remaining = maps.filter(m => m.id !== id);
    setMaps(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
    toast.success('Carte supprimée.');
  };

  const exportText = async () => {
    if (!activeMap) return;
    const lines = [`# ${activeMap.data.center}`, ''];
    activeMap.data.branches.forEach(b => {
      lines.push(`## ${b.label}`);
      b.children.forEach(l => lines.push(`  - ${l.label}`));
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const fileName = `${activeMap.name}.txt`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const file = new File([blob], fileName, { type: 'text/plain' });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName } as ShareData);
        toast.success('Carte prête à partager !');
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
    } else {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success('Carte exportée en .txt !');
  };

  const resetMap = () => {
    updateMap({ ...DEFAULT_MAP });
    toast.success('Carte réinitialisée.');
  };

  return (
    <>
    <h1 className="sr-only">Carte mentale — Mind Map scolaire</h1>
      <SEO
        title="Carte Mentale Gratuite — Mind Map Scolaire Interactif | Apprenix"
        description="Cartes mentales interactives pour structurer un cours ou réviser. Sauvegarde automatique. Gratuit, sans inscription, sur tous vos appareils."
        canonical="/carte-mentale"
        keywords="carte mentale scolaire gratuite, mind map lycée collège, révision visuelle, brainstorming étudiant, organiser idées cours, schéma heuristique, carte conceptuelle, révision bac carte mentale"
        dateModified="2026-06-18"
      />
      <PageHero
        variant="tool"
        icon={GitBranch}
        badge={<>🗺️ Carte Mentale</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Carte Mentale — Visualisez vos idées"
        subtitle="Créez des cartes mentales interactives pour structurer vos cours, brainstormer et réviser. Branches, sous-idées, code couleur — sauvegarde automatique incluse."
      />

      <div className="space-y-4">

        {/* Guide d'utilisation carte mentale */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <GitBranch className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">🗺️ Comment créer une carte mentale ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              <strong>1)</strong> Cliquez sur le nœud central pour le renommer · <strong>2)</strong> Cliquez <strong>"+ Branche"</strong> pour ajouter des idées · <strong>3)</strong> Cliquez sur une branche pour ajouter des sous-idées · <strong>4)</strong> Exportez en .txt pour réviser. Sauvegarde automatique !
            </p>
          </div>
        </div>

        {/* ── Génération IA ── */}
        <MindMapTemplates onLoad={(map) => updateMap(map)} />

        {/* ── Onglets + toolbar : ligne horizontale scrollable ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {maps.map(m => (
            <div key={m.id} className="flex items-center gap-1 shrink-0">
              {editingName === m.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    className="h-8 w-28 text-xs px-2"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') { setMaps(prev => prev.map(x => x.id === m.id ? { ...x, name: draftName.trim() || x.name } : x)); setEditingName(null); }
                      if (e.key === 'Escape') setEditingName(null);
                    }}
                  />
                  <button type="button" onClick={() => { setMaps(prev => prev.map(x => x.id === m.id ? { ...x, name: draftName.trim() || x.name } : x)); setEditingName(null); }}><Check className="w-3.5 h-3.5 text-success" /></button>
                </div>
              ) : (
                <button type="button"
                  onDoubleClick={() => { setDraftName(m.name); setEditingName(m.id); }}
                  onClick={() => setActiveId(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activeId === m.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                >
                  {m.name}
                </button>
              )}
              {maps.length > 1 && (
                <button type="button" onClick={() => deleteMap(m.id)} className="text-muted-foreground hover:text-destructive p-0.5 transition-colors" aria-label="Supprimer cette carte">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={newMap} className="h-8 text-xs shrink-0 border-dashed">
            <Plus className="w-3 h-3 mr-1" /> Nouvelle
          </Button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            <span className="hidden md:inline">Double-clic pour renommer un onglet · </span>Tap pour éditer un nœud
          </Badge>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={exportText} className="h-8 text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetMap} className="h-8 text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* ── Carte mentale : pleine largeur ── */}
        {activeMap && (
          <Card className="shadow-card w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                {activeMap.name} — sauvegarde automatique ✅
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-5 lg:p-6">
              <MindMapCanvas map={activeMap.data} onUpdate={updateMap} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
