import { Check, Download, GitBranch, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Leaf   { id: string; label: string }
interface Branch { id: string; label: string; colorIdx: number; children: Leaf[] }
interface MindMap { center: string; branches: Branch[] }

// ─── Palette couleurs sémantiques ─────────────────────────────────────────────
const PALETTE = [
  { bg: 'bg-chart-1/15 border-chart-1/40', text: 'text-chart-1',     dot: 'bg-chart-1'     },
  { bg: 'bg-chart-2/15 border-chart-2/40', text: 'text-chart-2',     dot: 'bg-chart-2'     },
  { bg: 'bg-chart-3/15 border-chart-3/40', text: 'text-chart-3',     dot: 'bg-chart-3'     },
  { bg: 'bg-destructive/10 border-destructive/30', text: 'text-destructive', dot: 'bg-destructive' },
  { bg: 'bg-primary/10 border-primary/30', text: 'text-primary',     dot: 'bg-primary'     },
  { bg: 'bg-chart-4/15 border-chart-4/40', text: 'text-chart-4',     dot: 'bg-chart-4'     },
];
const SVG_COLORS = [
  'hsl(var(--chart-1))','hsl(var(--chart-2))','hsl(var(--chart-3))',
  'hsl(var(--destructive))','hsl(var(--primary))','hsl(var(--chart-4))',
];

// ─── Modèles prêts à l'emploi ─────────────────────────────────────────────────
const TEMPLATES: { label: string; emoji: string; map: MindMap }[] = [
  {
    label: 'Révision de cours', emoji: '📚',
    map: { center: 'Mon cours', branches: [
      { id:'1', label:'Définitions clés', colorIdx:0, children:[{id:'1a',label:'Terme 1'},{id:'1b',label:'Terme 2'}] },
      { id:'2', label:'Concepts centraux', colorIdx:1, children:[{id:'2a',label:'Idée A'},{id:'2b',label:'Idée B'}] },
      { id:'3', label:'Exemples', colorIdx:2, children:[{id:'3a',label:'Exemple 1'}] },
      { id:'4', label:'À retenir', colorIdx:4, children:[{id:'4a',label:'Point essentiel'}] },
    ]},
  },
  {
    label: 'Dissertation', emoji: '✍️',
    map: { center: 'Sujet', branches: [
      { id:'1', label:'Introduction', colorIdx:0, children:[{id:'1a',label:'Accroche'},{id:'1b',label:'Problématique'},{id:'1c',label:'Plan annoncé'}] },
      { id:'2', label:'Thèse (I)', colorIdx:1, children:[{id:'2a',label:'Argument 1'},{id:'2b',label:'Exemple'}] },
      { id:'3', label:'Antithèse (II)', colorIdx:2, children:[{id:'3a',label:'Nuance'},{id:'3b',label:'Contre-exemple'}] },
      { id:'4', label:'Synthèse (III)', colorIdx:3, children:[{id:'4a',label:'Dépassement'}] },
      { id:'5', label:'Conclusion', colorIdx:4, children:[{id:'5a',label:'Bilan'},{id:'5b',label:'Ouverture'}] },
    ]},
  },
  {
    label: 'Projet de groupe', emoji: '👥',
    map: { center: 'Projet', branches: [
      { id:'1', label:'Objectifs', colorIdx:0, children:[{id:'1a',label:'Objectif principal'},{id:'1b',label:'Livrables'}] },
      { id:'2', label:'Équipe', colorIdx:1, children:[{id:'2a',label:'Rôles'},{id:'2b',label:'Responsabilités'}] },
      { id:'3', label:'Planning', colorIdx:2, children:[{id:'3a',label:'Étape 1'},{id:'3b',label:'Étape 2'},{id:'3c',label:'Rendu final'}] },
      { id:'4', label:'Ressources', colorIdx:4, children:[{id:'4a',label:'Documents'},{id:'4b',label:'Outils'}] },
    ]},
  },
  {
    label: 'Brainstorming', emoji: '💡',
    map: { center: 'Mon idée', branches: [
      { id:'1', label:'Pourquoi ?', colorIdx:0, children:[] },
      { id:'2', label:'Comment ?', colorIdx:1, children:[] },
      { id:'3', label:'Qui ?', colorIdx:2, children:[] },
      { id:'4', label:'Quand ?', colorIdx:3, children:[] },
      { id:'5', label:'Obstacles', colorIdx:4, children:[] },
    ]},
  },
];

const DEFAULT_MAP: MindMap = {
  center: 'Mon sujet',
  branches: [
    { id:'1', label:'Idée principale 1', colorIdx:0, children:[{id:'1a',label:'Sous-idée'}] },
    { id:'2', label:'Idée principale 2', colorIdx:1, children:[] },
  ],
};

// ─── Composant label éditable (single tap sur mobile) ─────────────────────────
const EditableLabel: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  textClass?: string;
}> = ({ value, onChange, className = '', textClass = 'text-sm' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed); else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input ref={inputRef} value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') { setDraft(value); setEditing(false); } }}
          className="h-8 px-2 text-sm min-w-0 flex-1"/>
        <button type="button" onClick={commit} className="text-success shrink-0 p-1" aria-label="Valider"><Check className="w-3.5 h-3.5"/></button>
        <button type="button" onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground shrink-0 p-1" aria-label="Annuler"><X className="w-3.5 h-3.5"/></button>
      </div>
    );
  }

  return (
    <button type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`group flex items-center gap-1 text-left w-full ${className}`}
      aria-label={`Modifier : ${value}`}
    >
      <span className={`${textClass} font-medium text-balance flex-1 min-w-0`}>{value}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 group-focus:opacity-50 shrink-0 transition-opacity" aria-hidden="true"/>
    </button>
  );
};

// ─── Canvas carte mentale ─────────────────────────────────────────────────────
const MindMapCanvas: React.FC<{ map: MindMap; onUpdate: (m: MindMap) => void }> = ({ map, onUpdate }) => {
  const upd = useCallback((fn: (m: MindMap) => MindMap) => onUpdate(fn(map)), [map, onUpdate]);

  const addBranch = () => {
    const idx = map.branches.length % PALETTE.length;
    upd(m => ({ ...m, branches: [...m.branches, { id: Date.now().toString(), label: 'Nouvelle branche', colorIdx: idx, children: [] }] }));
  };
  const removeBranch = (id: string) => upd(m => ({ ...m, branches: m.branches.filter(b => b.id!==id) }));
  const updateBranch = (id: string, label: string) => upd(m => ({ ...m, branches: m.branches.map(b => b.id===id ? { ...b, label } : b) }));
  const addLeaf      = (bid: string) => upd(m => ({ ...m, branches: m.branches.map(b => b.id===bid ? { ...b, children:[...b.children,{id:Date.now().toString(),label:'Sous-idée'}] } : b) }));
  const removeLeaf   = (bid: string, lid: string) => upd(m => ({ ...m, branches: m.branches.map(b => b.id===bid ? { ...b, children:b.children.filter(l=>l.id!==lid) } : b) }));
  const updateLeaf   = (bid: string, lid: string, label: string) => upd(m => ({ ...m, branches: m.branches.map(b => b.id===bid ? { ...b, children:b.children.map(l=>l.id===lid?{...l,label}:l) } : b) }));

  return (
    <div className="space-y-3">
      {/* Nœud central */}
      <div className="flex justify-center">
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-md max-w-[260px] w-full text-center">
          <EditableLabel
            value={map.center}
            onChange={v => upd(m => ({ ...m, center: v }))}
            textClass="text-base text-primary-foreground"
          />
        </div>
      </div>

      {/* Branches */}
      <div className="space-y-2.5">
        {map.branches.map((branch, idx) => {
          const pal = PALETTE[branch.colorIdx % PALETTE.length];
          const svgColor = SVG_COLORS[branch.colorIdx % SVG_COLORS.length];
          return (
            <div key={branch.id} className="relative pl-3">
              {/* Barre latérale couleur */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: svgColor }}/>

              <div className={`rounded-xl border p-3 ${pal.bg}`}>
                {/* En-tête branche */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pal.dot}`} aria-hidden="true"/>
                  <div className="flex-1 min-w-0">
                    <EditableLabel value={branch.label} onChange={v => updateBranch(branch.id, v)}
                      textClass={`text-sm ${pal.text}`}/>
                  </div>
                  <button type="button" onClick={() => removeBranch(branch.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded"
                    aria-label={`Supprimer la branche ${branch.label}`}>
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true"/>
                  </button>
                </div>

                {/* Sous-idées */}
                {branch.children.length > 0 && (
                  <div className="space-y-1.5 ml-4 mb-2">
                    {branch.children.map(leaf => (
                      <div key={leaf.id} className="flex items-center gap-2 bg-card/70 rounded-lg px-2.5 py-1.5 border border-border/40">
                        <span className="text-muted-foreground text-base shrink-0 leading-none" aria-hidden="true">›</span>
                        <div className="flex-1 min-w-0">
                          <EditableLabel value={leaf.label} onChange={v => updateLeaf(branch.id, leaf.id, v)} textClass="text-xs"/>
                        </div>
                        <button type="button" onClick={() => removeLeaf(branch.id, leaf.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center rounded"
                          aria-label={`Supprimer ${leaf.label}`}>
                          <X className="w-3 h-3" aria-hidden="true"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={() => addLeaf(branch.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-4 transition-colors min-h-[32px]">
                  <Plus className="w-3 h-3" aria-hidden="true"/>Ajouter une sous-idée
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton Ajouter branche */}
      <div className="flex justify-center pt-1">
        <Button variant="outline" onClick={addBranch} className="h-11 px-6 text-sm border-dashed font-semibold">
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true"/>Ajouter une branche
        </Button>
      </div>
    </div>
  );
};

// ─── Page principale ───────────────────────────────────────────────────────────
export default function CarteMentalePage() {
  const { profile } = useApp();
  const STORAGE_KEY = `apprenix-mind-maps-v2-${profile.id || 'guest'}`;

  const [maps, setMaps] = useState<{ id: string; name: string; data: MindMap }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [{ id:'1', name:'Carte 1', data: DEFAULT_MAP }];
    } catch { return [{ id:'1', name:'Carte 1', data: DEFAULT_MAP }]; }
  });
  const [activeId, setActiveId]           = useState(() => maps[0]?.id ?? '1');
  const [editingName, setEditingName]     = useState<string | null>(null);
  const [draftName, setDraftName]         = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(maps)); }, [maps, STORAGE_KEY]);

  const activeMap = maps.find(m => m.id === activeId);

  const updateMap = useCallback((data: MindMap) => {
    setMaps(prev => prev.map(m => m.id===activeId ? { ...m, data } : m));
  }, [activeId]);

  const newMap = () => {
    const id   = Date.now().toString();
    const name = `Carte ${maps.length + 1}`;
    setMaps(prev => [...prev, { id, name, data:{ center:'Mon sujet', branches:[] } }]);
    setActiveId(id);
    toast.success(`"${name}" créée !`);
  };

  const deleteMap = (id: string) => {
    if (maps.length <= 1) { toast.error('Gardez au moins une carte.'); return; }
    const remaining = maps.filter(m => m.id!==id);
    setMaps(remaining);
    if (activeId===id) setActiveId(remaining[0].id);
    toast.success('Carte supprimée.');
  };

  const commitName = (id: string) => {
    setMaps(prev => prev.map(m => m.id===id ? { ...m, name: draftName.trim() || m.name } : m));
    setEditingName(null);
  };

  const exportText = async () => {
    if (!activeMap) return;
    const lines = [`# ${activeMap.data.center}`, ''];
    activeMap.data.branches.forEach(b => {
      lines.push(`## ${b.label}`);
      b.children.forEach(l => lines.push(`  - ${l.label}`));
      lines.push('');
    });
    const blob     = new Blob([lines.join('\n')], { type:'text/plain' });
    const fileName = `${activeMap.name}.txt`;
    const isIOS    = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const file = new File([blob], fileName, { type:'text/plain' });
      const nav  = navigator as Navigator & { canShare?: (d:{files:File[]})=>boolean };
      if (nav.canShare?.({ files:[file] })) { await navigator.share({ files:[file], title:fileName } as ShareData); toast.success('Prêt à partager !'); return; }
      window.open(URL.createObjectURL(blob), '_blank');
    } else {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href=url; a.download=fileName; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success('Carte exportée en .txt !');
  };

  const resetMap = () => { updateMap({ ...DEFAULT_MAP }); toast.success('Carte réinitialisée.'); };

  return (
    <>
      <h1 className="sr-only">Carte Mentale — Mind Map scolaire</h1>
      <SEO
        title="Carte Mentale Gratuite — Mind Map Scolaire | Apprenix"
        description="Cartes mentales interactives pour structurer un cours ou réviser. Sauvegarde automatique."
        canonical="/carte-mentale"
        keywords="carte mentale scolaire gratuite, mind map lycée collège, révision visuelle, brainstorming"
        dateModified="2026-06-25"
      />

      <div className="space-y-4">
        {/* En-tête compact */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary shrink-0" aria-hidden="true"/>Carte Mentale
              </h2>
              <Badge variant="outline" className="text-xs text-muted-foreground hidden md:inline-flex">
                Tap pour éditer · Sauvegarde auto ✅
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Tap sur un nœud pour le modifier directement</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="outline" size="sm" onClick={exportText} className="h-9 text-xs">
              <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true"/>Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetMap} className="h-9 text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" aria-hidden="true"/>Reset
            </Button>
          </div>
        </div>

        {/* Modèles — accordéon compact */}
        <div className="rounded-xl border border-border overflow-hidden">
          <button type="button"
            onClick={() => setShowTemplates(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left min-h-[48px]"
            aria-expanded={showTemplates}
          >
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span aria-hidden="true">📋</span> Modèles prêts à l'emploi
            </span>
            <span className={`text-muted-foreground transition-transform duration-200 ${showTemplates?'rotate-180':''}`} aria-hidden="true">▾</span>
          </button>
          {showTemplates && (
            <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2 bg-card">
              {TEMPLATES.map(t => (
                <button key={t.label} type="button"
                  onClick={() => { updateMap(t.map); setShowTemplates(false); toast.success(`"${t.label}" chargé !`); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all min-h-[72px]"
                >
                  <span className="text-2xl" aria-hidden="true">{t.emoji}</span>
                  <span className="text-xs font-medium text-foreground text-center text-balance leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sélecteur de cartes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Mes cartes mentales">
          {maps.map(m => (
            <div key={m.id} className="flex items-center gap-1 shrink-0">
              {editingName === m.id ? (
                <div className="flex items-center gap-1">
                  <Input value={draftName} onChange={e => setDraftName(e.target.value)}
                    className="h-9 w-28 text-xs px-2" autoFocus
                    onKeyDown={e => { if (e.key==='Enter') commitName(m.id); if (e.key==='Escape') setEditingName(null); }}/>
                  <button type="button" onClick={() => commitName(m.id)} className="p-1" aria-label="Valider">
                    <Check className="w-3.5 h-3.5 text-success"/>
                  </button>
                </div>
              ) : (
                <button type="button"
                  role="tab"
                  aria-selected={activeId===m.id}
                  onClick={() => setActiveId(m.id)}
                  onDoubleClick={() => { setDraftName(m.name); setEditingName(m.id); }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors min-h-[36px] ${activeId===m.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                >
                  {m.name}
                </button>
              )}
              {maps.length > 1 && (
                <button type="button" onClick={() => deleteMap(m.id)}
                  className="text-muted-foreground hover:text-destructive p-1 min-w-[28px] min-h-[28px] flex items-center justify-center rounded"
                  aria-label={`Supprimer la carte ${m.name}`}>
                  <X className="w-3 h-3" aria-hidden="true"/>
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={newMap} className="h-9 text-xs shrink-0 border-dashed">
            <Plus className="w-3 h-3 mr-1" aria-hidden="true"/>Nouvelle
          </Button>
        </div>

        {/* Canvas carte mentale */}
        {activeMap && (
          <Card className="shadow-sm w-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true"/>
                {activeMap.name}
                <span className="text-success">· sauvegardé ✅</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <MindMapCanvas map={activeMap.data} onUpdate={updateMap}/>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
