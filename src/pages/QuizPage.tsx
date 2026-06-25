import {
  BookOpen, Calculator, CheckCircle2,
  ChevronRight, FlaskConical, Globe2,
  GraduationCap, HelpCircle, Languages,
  Pencil, Play, Plus,
  RotateCcw, ScrollText, Trash2,
  Trophy, XCircle,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QA { id: string; question: string; answer: string; }

// ─── Banques de quiz — programme scolaire français ────────────────────────────
interface SampleSet { label: string; subject: string; items: Omit<QA, 'id'>[] }

const SAMPLE_SETS: SampleSet[] = [
  {
    subject: 'Histoire',
    label: '1ère Guerre mondiale',
    items: [
      { question: 'En quelle année débute la Première Guerre mondiale ?', answer: '1914' },
      { question: 'Quel événement déclenche la Première Guerre mondiale ?', answer: "L'assassinat de l'archiduc François-Ferdinand à Sarajevo (28 juin 1914)" },
      { question: 'En quelle année se termine la Première Guerre mondiale ?', answer: '1918' },
      { question: 'Quel traité met fin à la Première Guerre mondiale ?', answer: 'Traité de Versailles (28 juin 1919)' },
      { question: 'Qu\'est-ce qu\'une tranchée ?', answer: "Fossé creusé pour abriter les soldats des tirs ennemis — symbole de la guerre de position (1914-1918)" },
    ],
  },
  {
    subject: 'Histoire',
    label: '2ème Guerre mondiale',
    items: [
      { question: 'Date d\'invasion de la Pologne par Hitler ?', answer: '1er septembre 1939' },
      { question: 'Que se passe-t-il le 18 juin 1940 ?', answer: "Appel du général de Gaulle à la BBC pour poursuivre la résistance contre l'occupant nazi" },
      { question: 'Qu\'est-ce que la Shoah ?', answer: "Extermination systématique de 6 millions de Juifs d'Europe par les nazis" },
      { question: 'Date du débarquement en Normandie ?', answer: '6 juin 1944 (Jour J — Opération Overlord)' },
      { question: 'Date de la capitulation de l\'Allemagne ?', answer: '8 mai 1945 (fin de la guerre en Europe)' },
    ],
  },
  {
    subject: 'Histoire',
    label: 'Révolution française',
    items: [
      { question: 'Date de la prise de la Bastille ?', answer: '14 juillet 1789' },
      { question: 'Devise de la République française ?', answer: 'Liberté, Égalité, Fraternité' },
      { question: 'Qui est Louis XVI ?', answer: 'Roi de France guillotiné le 21 janvier 1793' },
      { question: 'Qu\'est-ce que la Déclaration des droits de l\'homme (1789) ?', answer: 'Texte fondateur proclamant les droits naturels : liberté, propriété, sûreté, résistance à l\'oppression' },
      { question: 'Qu\'est-ce que la Terreur ?', answer: 'Période 1793-1794 de répression violente sous Robespierre' },
    ],
  },
  {
    subject: 'Maths',
    label: 'Théorèmes',
    items: [
      { question: 'Énoncer le théorème de Pythagore', answer: 'Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)' },
      { question: 'Formule de la dérivée de xⁿ ?', answer: 'n · xⁿ⁻¹' },
      { question: 'Que vaut π (pi) arrondi à 4 décimales ?', answer: '3,1416' },
      { question: 'Formule du discriminant d\'un trinôme ax² + bx + c ?', answer: 'Δ = b² − 4ac' },
      { question: 'Somme des angles d\'un triangle ?', answer: '180° (ou π radians)' },
    ],
  },
  {
    subject: 'Maths',
    label: 'Algèbre',
    items: [
      { question: '(a + b)² = ?', answer: 'a² + 2ab + b²' },
      { question: '(a − b)² = ?', answer: 'a² − 2ab + b²' },
      { question: '(a + b)(a − b) = ?', answer: 'a² − b²' },
      { question: 'log(a × b) = ?', answer: 'log(a) + log(b)' },
      { question: 'log(aⁿ) = ?', answer: 'n · log(a)' },
    ],
  },
  {
    subject: 'Français',
    label: 'Figures de style',
    items: [
      { question: 'Définir la métaphore', answer: 'Comparaison implicite sans outil comparatif. Ex : "La vie est un voyage"' },
      { question: 'Définir l\'hyperbole', answer: 'Exagération pour accentuer un effet. Ex : "Je meurs de faim"' },
      { question: 'Définir l\'anaphore', answer: 'Répétition d\'un mot ou groupe en début de phrases successives' },
      { question: 'Définir l\'oxymore', answer: 'Association de deux mots contradictoires. Ex : "obscure clarté"' },
      { question: 'Définir la litote', answer: 'Dire moins pour suggérer plus. Ex : "Ce n\'est pas mal" = c\'est très bien' },
    ],
  },
  {
    subject: 'SVT',
    label: 'Génétique',
    items: [
      { question: 'Que signifie ADN ?', answer: 'Acide DésoxyriboNucléique — molécule portant l\'information génétique' },
      { question: 'Les 4 bases de l\'ADN ?', answer: 'Adénine (A), Thymine (T), Guanine (G), Cytosine (C)' },
      { question: 'Différence entre mitose et méiose ?', answer: 'Mitose : 2 cellules filles identiques. Méiose : 4 gamètes haploïdes avec brassage génétique' },
      { question: 'Définition d\'une mutation ?', answer: 'Modification permanente de la séquence d\'ADN' },
      { question: 'Qu\'est-ce que la transcription ?', answer: 'Synthèse d\'un ARNm à partir d\'un brin d\'ADN matrice dans le noyau' },
    ],
  },
  {
    subject: 'Physique',
    label: 'Formules clés',
    items: [
      { question: '2ème loi de Newton ?', answer: 'ΣF = m·a (somme des forces = masse × accélération)' },
      { question: 'Formule de l\'énergie cinétique ?', answer: 'Ec = ½·m·v²' },
      { question: 'Loi d\'Ohm ?', answer: 'U = R·I (tension = résistance × intensité)' },
      { question: 'Valeur de g sur Terre ?', answer: 'g ≈ 9,81 m/s²' },
      { question: 'Formule de la puissance électrique ?', answer: 'P = U·I = R·I²' },
    ],
  },
  {
    subject: 'Chimie',
    label: 'Bases',
    items: [
      { question: 'Loi de conservation de la masse ?', answer: '"Rien ne se perd, rien ne se crée, tout se transforme" (Lavoisier)' },
      { question: 'Formule du pH ?', answer: 'pH = −log[H₃O⁺]' },
      { question: 'Acide selon Brønsted ?', answer: 'Espèce chimique capable de donner un proton H⁺' },
      { question: 'Formule du CO₂ ?', answer: 'CO₂ — 1 carbone, 2 oxygènes' },
      { question: 'Réaction d\'oxydoréduction ?', answer: 'Transfert d\'électrons : réducteur perd des e⁻, oxydant en gagne' },
    ],
  },
  {
    subject: 'Géographie',
    label: 'Capitales du monde',
    items: [
      { question: 'Capitale de l\'Allemagne ?', answer: 'Berlin' },
      { question: 'Capitale du Brésil ?', answer: 'Brasília' },
      { question: 'Capitale de l\'Australie ?', answer: 'Canberra' },
      { question: 'Capitale du Japon ?', answer: 'Tokyo' },
      { question: 'Capitale du Canada ?', answer: 'Ottawa' },
      { question: 'Capitale de la Chine ?', answer: 'Pékin (Beijing)' },
    ],
  },
  {
    subject: 'Philosophie',
    label: 'Grands auteurs',
    items: [
      { question: 'Cogito de Descartes ?', answer: '"Je pense, donc je suis" — première certitude indubitable' },
      { question: 'Impératif catégorique de Kant ?', answer: '"Agis selon la maxime qui peut devenir loi universelle"' },
      { question: 'Platon — mythe de la caverne ?', answer: 'Les hommes confondent apparences et réalité. La philosophie mène vers la Vérité' },
      { question: 'Sartre — "l\'existence précède l\'essence" ?', answer: "L'homme se définit par ses actes, pas par une nature fixe (existentialisme)" },
      { question: 'Hobbes — état de nature ?', answer: '"L\'homme est un loup pour l\'homme" — d\'où la nécessité du contrat social' },
    ],
  },
  {
    subject: 'Anglais',
    label: 'Vocabulaire B1',
    items: [
      { question: '"to achieve" en français ?', answer: 'accomplir, réussir, atteindre un objectif' },
      { question: '"despite" en français ?', answer: 'malgré, en dépit de' },
      { question: '"whereas" en français ?', answer: 'alors que, tandis que (contraste/opposition)' },
      { question: '"therefore" en français ?', answer: 'donc, par conséquent' },
      { question: '"to deal with" en français ?', answer: 'faire face à, gérer, s\'occuper de' },
    ],
  },
];

// ─── Icônes par matière ───────────────────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: React.ElementType; color: string }> = {
  Histoire:    { icon: ScrollText,    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  Maths:       { icon: Calculator,    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  Français:    { icon: BookOpen,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  SVT:         { icon: FlaskConical,  color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
  Physique:    { icon: FlaskConical,  color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  Chimie:      { icon: FlaskConical,  color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  Géographie:  { icon: Globe2,        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
  Philosophie: { icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  Anglais:     { icon: Languages,     color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
};

const SUBJECTS = [...new Set(SAMPLE_SETS.map(s => s.subject))];

// ─── Composant : sélecteur de banques ────────────────────────────────────────
const BankSelector: React.FC<{
  onAddMany: (pairs: { question: string; answer: string }[]) => void;
}> = ({ onAddMany }) => {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const handleLoad = (set: SampleSet) => {
    onAddMany(set.items.map(it => ({ question: it.question, answer: it.answer })));
    toast.success(`${set.items.length} questions « ${set.label} » ajoutées !`);
  };

  return (
    <div className="space-y-3">
      {/* Onglets matières */}
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <div className="flex gap-1.5 min-w-max">
          {SUBJECTS.map(subj => {
            const meta = SUBJECT_META[subj] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };
            const Icon = meta.icon;
            const active = activeSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setActiveSubject(active ? null : subj)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[36px] whitespace-nowrap ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banques pour la matière sélectionnée */}
      {activeSubject && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SAMPLE_SETS.filter(s => s.subject === activeSubject).map(set => {
            const meta = SUBJECT_META[set.subject] ?? { icon: BookOpen, color: 'text-muted-foreground bg-muted' };
            const Icon = meta.icon;
            return (
              <button
                key={set.label}
                type="button"
                onClick={() => handleLoad(set)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/40 transition-all text-left group"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-pretty group-hover:text-primary transition-colors">{set.label}</p>
                  <p className="text-xs text-muted-foreground">{set.items.length} questions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {!activeSubject && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Sélectionne une matière pour charger des questions du programme officiel
        </p>
      )}
    </div>
  );
};

// ─── Éditeur de quiz ──────────────────────────────────────────────────────────
const QuizEditor: React.FC<{
  items: QA[];
  onAdd: (q: string, a: string) => void;
  onRemove: (id: string) => void;
  onStart: () => void;
  onAddMany: (pairs: { question: string; answer: string }[]) => void;
}> = ({ items, onAdd, onRemove, onStart, onAddMany }) => {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulk, setBulk] = useState('');
  const [tab, setTab] = useState<'bank' | 'manual'>('bank');

  const handleAdd = () => {
    if (!q.trim() || !a.trim()) { toast.error('Remplis la question et la réponse.'); return; }
    onAdd(q.trim(), a.trim());
    setQ(''); setA('');
    toast.success('Question ajoutée !');
  };

  const handleBulkImport = () => {
    const lines = bulk.split('\n').filter(l => l.includes('|'));
    let count = 0;
    lines.forEach(line => {
      const [question, answer] = line.split('|').map(s => s.trim());
      if (question && answer) { onAdd(question, answer); count++; }
    });
    if (count > 0) {
      toast.success(`${count} question${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''} !`);
      setBulk(''); setBulkMode(false);
    } else {
      toast.error('Format invalide. Utilisez : Question | Réponse');
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Onglets ajout ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-full">
        {([
          { key: 'bank', label: 'Banques de questions', icon: BookOpen },
          { key: 'manual', label: 'Créer manuellement', icon: Plus },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
              tab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key === 'bank' ? 'Banques' : 'Manuel'}</span>
          </button>
        ))}
      </div>

      {/* ── Contenu onglet ────────────────────────────────────────────────────── */}
      {tab === 'bank' && <BankSelector onAddMany={onAddMany} />}

      {tab === 'manual' && (
        <div className="space-y-4">
          {/* Import en masse */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <button
              type="button"
              onClick={() => setBulkMode(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary whitespace-nowrap"
            >
              <Pencil className="w-3 h-3" /> Import en masse
            </button>
            <div className="flex-1 border-t border-border" />
          </div>

          {bulkMode ? (
            <Card className="border-border shadow-none">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Une ligne par Q&R, séparés par <code className="bg-secondary px-1 rounded font-mono">|</code>
                  <br />Ex : <em className="text-foreground">Capitale de la France | Paris</em>
                </p>
                <Textarea
                  value={bulk}
                  onChange={e => setBulk(e.target.value)}
                  placeholder={"Quelle est la formule de l'eau ? | H₂O\nQui a écrit Les Misérables ? | Victor Hugo"}
                  className="min-h-28 text-sm px-3"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkImport} className="h-9 text-xs">Importer</Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkMode(false)} className="h-9 text-xs">Annuler</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-none">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="quiz-q" className="text-xs font-medium text-muted-foreground mb-1.5 block">Question</Label>
                  <Input
                    id="quiz-q"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Ex : Quelle est la capitale de l'Espagne ?"
                    className="h-10 text-sm"
                    onKeyDown={e => e.key === 'Enter' && a && handleAdd()}
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-a" className="text-xs font-medium text-muted-foreground mb-1.5 block">Réponse</Label>
                  <Input
                    id="quiz-a"
                    value={a}
                    onChange={e => setA(e.target.value)}
                    placeholder="Ex : Madrid"
                    className="h-10 text-sm"
                    onKeyDown={e => e.key === 'Enter' && q && handleAdd()}
                  />
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!q.trim() || !a.trim()} className="w-full h-9 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter cette question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Liste des Q&R ─────────────────────────────────────────────────────── */}
      {items.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{items.length} question{items.length > 1 ? 's' : ''}</span>
              <Badge variant="secondary" className="text-xs">{items.length >= 5 ? '✅ Prêt' : `encore ${5 - items.length} pour commencer`}</Badge>
            </div>
            <Button size="sm" onClick={onStart} disabled={items.length < 1} className="h-9 text-xs gap-1.5">
              <Play className="w-3.5 h-3.5" /> Lancer le quiz
            </Button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1" role="list" aria-label="Liste des questions">
            {items.map((item, i) => (
              <div key={item.id}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
                role="listitem"
              >
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5 w-5 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.answer}</p>
                </div>
                <button type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 p-1.5 min-w-[36px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
                  aria-label={`Supprimer : ${item.question}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">Aucune question pour l'instant</p>
          <p className="text-xs text-muted-foreground mt-1">Charge une banque ou crée tes propres Q&R</p>
        </div>
      )}
    </div>
  );
};

// ─── Mode quiz actif ──────────────────────────────────────────────────────────
interface QuizResult { id: string; correct: boolean; userAnswer: string; }

const QuizPlay: React.FC<{
  items: QA[];
  onEnd: (results: QuizResult[]) => void;
}> = ({ items, onEnd }) => {
  const [shuffled] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [current, setCurrent]   = useState(0);
  const [answer, setAnswer]     = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults]   = useState<QuizResult[]>([]);

  const item     = shuffled[current];
  const progress = ((current) / shuffled.length) * 100;
  const correct  = results.filter(r => r.correct).length;

  const check = () => { if (!revealed) setRevealed(true); };

  const next = (isCorrect: boolean) => {
    const newResults = [...results, { id: item.id, correct: isCorrect, userAnswer: answer }];
    if (current + 1 >= shuffled.length) {
      onEnd(newResults);
    } else {
      setResults(newResults);
      setCurrent(c => c + 1);
      setAnswer('');
      setRevealed(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Question {current + 1} / {shuffled.length}</span>
          <div className="flex items-center gap-3">
            <span className="text-success font-medium">{correct} ✓</span>
            <span className="text-destructive font-medium">{results.length - correct} ✗</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Carte question */}
      <Card className="shadow-card border-primary/20 bg-primary/5 min-h-[110px]">
        <CardContent className="p-5 flex items-center">
          <p className="text-base md:text-lg font-semibold text-foreground text-pretty leading-relaxed">{item.question}</p>
        </CardContent>
      </Card>

      {/* Zone réponse */}
      {!revealed ? (
        <div className="space-y-3">
          <Input
            aria-label="Votre réponse"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Votre réponse..."
            className="h-11 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && check()}
          />
          <Button onClick={check} className="w-full h-11 font-semibold gap-2">
            <ChevronRight className="w-4 h-4" /> Voir la réponse
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Card className="border-success/30 bg-success/5 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-success mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bonne réponse
              </p>
              <p className="text-sm text-foreground font-medium text-pretty">{item.answer}</p>
            </CardContent>
          </Card>
          {answer.trim() && (
            <div className="px-1">
              <p className="text-xs text-muted-foreground">Ta réponse : <span className="text-foreground italic">{answer}</span></p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => next(false)} variant="outline" className="h-11 border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
              <XCircle className="w-4 h-4" /> Je ne savais pas
            </Button>
            <Button onClick={() => next(true)} className="h-11 bg-success text-success-foreground gap-2">
              <CheckCircle2 className="w-4 h-4" /> Je savais !
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Résultats ────────────────────────────────────────────────────────────────
const QuizResults: React.FC<{
  items: QA[];
  results: QuizResult[];
  onRestart: () => void;
  onEdit: () => void;
}> = ({ items, results, onRestart, onEdit }) => {
  const correct = results.filter(r => r.correct).length;
  const pct     = Math.round((correct / results.length) * 100);
  const [showAll, setShowAll] = useState(false);
  const failed = results.filter(r => !r.correct);

  const emoji  = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '📚';
  const msg    = pct >= 80 ? 'Excellent travail !' : pct >= 60 ? 'Bon résultat, continue !' : pct >= 40 ? 'Pas mal, encore un effort !' : 'Revois le cours et recommence !';
  const color  = pct >= 80 ? 'text-success' : pct >= 60 ? 'text-amber-500' : 'text-destructive';

  const displayedResults = showAll ? results : results.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Score principal */}
      <Card className="shadow-card overflow-hidden">
        <div className="bg-primary/5 border-b border-border p-5 text-center space-y-1">
          <span className="text-5xl block mb-2" aria-hidden="true">{emoji}</span>
          <p className={`text-3xl font-bold ${color}`}>{pct}%</p>
          <p className="text-sm text-muted-foreground">{correct}/{results.length} bonnes réponses</p>
          <Progress value={pct} className="h-3 mt-3" />
          <p className="text-sm text-foreground font-medium pt-1">{msg}</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { label: 'Correctes', value: correct, cls: 'text-success' },
            { label: 'Manquées', value: results.length - correct, cls: 'text-destructive' },
            { label: 'Score', value: `${pct}%`, cls: color },
          ].map(({ label, value, cls }) => (
            <div key={label} className="p-3 text-center">
              <p className={`text-lg font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Questions manquées en premier */}
      {failed.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">À revoir ({failed.length})</p>
          <div className="space-y-1.5">
            {failed.map(r => {
              const item = items.find(it => it.id === r.id);
              if (!item) return null;
              return (
                <div key={r.id} className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-sm">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-pretty">{item.question}</p>
                    <p className="text-xs text-success mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" /> {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toutes les réponses */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Toutes les réponses</p>
          {results.length > 5 && (
            <button type="button" onClick={() => setShowAll(v => !v)} className="text-xs text-primary hover:underline">
              {showAll ? 'Réduire' : `Voir tout (${results.length})`}
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {displayedResults.map(r => {
            const item = items.find(it => it.id === r.id);
            if (!item) return null;
            return (
              <div key={r.id} className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${r.correct ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                {r.correct
                  ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-label="Correct" />
                  : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-label="Incorrect" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-pretty">{item.question}</p>
                  {!r.correct && <p className="text-xs text-success mt-0.5">{item.answer}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button onClick={onRestart} className="h-10 gap-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </Button>
        <Button onClick={onEdit} variant="outline" className="h-10 gap-2 text-sm">
          <Pencil className="w-4 h-4" /> Modifier les Q&R
        </Button>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function QuizPage() {
  const { addActivity, addXp } = useApp();
  const [items, setItems]   = useState<QA[]>([]);
  const [mode, setMode]     = useState<'edit' | 'play' | 'results'>('edit');
  const [results, setResults] = useState<QuizResult[]>([]);

  const add     = useCallback((q: string, a: string) =>
    setItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, question: q, answer: a }]), []);
  const addMany = useCallback((pairs: { question: string; answer: string }[]) =>
    setItems(prev => [...prev, ...pairs.map(p => ({ id: `${Date.now()}-${Math.random()}`, question: p.question, answer: p.answer }))]), []);
  const remove  = useCallback((id: string) =>
    setItems(prev => prev.filter(it => it.id !== id)), []);

  const start = () => {
    if (items.length < 1) { toast.error('Ajoutez au moins une question !'); return; }
    setMode('play');
  };

  const end = (r: QuizResult[]) => {
    setResults(r);
    setMode('results');
    const correct = r.filter(x => x.correct).length;
    const pct = Math.round((correct / r.length) * 100);
    addXp(Math.round(pct / 10) * 2 + 5);
    addActivity(`Quiz terminé : ${correct}/${r.length} correctes (${pct}%)`);
  };

  const restart = () => { setMode('play'); setResults([]); };
  const edit    = () => { setMode('edit'); setResults([]); };

  const modeLabel = { edit: 'Mes questions', play: 'Quiz en cours', results: 'Résultats' }[mode];
  const modeIcon  = { edit: Pencil, play: Play, results: Trophy }[mode];
  const ModeIcon  = modeIcon;

  return (
    <>
      <h1 className="sr-only">Quiz interactif gratuit</h1>
      <SEO
        title="Quiz Interactif Gratuit — Révisez avec vos propres questions | Apprenix"
        description="Quiz personnalisés avec score en temps réel pour toutes les matières. Idéal pour le Bac, le Brevet et les évaluations. 100% gratuit."
        canonical="/quiz"
        keywords="quiz interactif scolaire gratuit, créer quiz révision, questions réponses cours, quiz bac 2026, quiz brevet 2026, auto-évaluation scolaire"
        dateModified="2026-06-18"
      />
      <PageHero
        variant="tool"
        icon={HelpCircle}
        badge={<>🎯 Quiz Interactif</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Quiz Interactif — Testez vos connaissances"
        subtitle="Chargez une banque de questions du programme officiel, créez les vôtres, et lancez un quiz chronométré pour vraiment savoir ce que vous avez retenu."
      />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="shadow-card">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ModeIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                {modeLabel}
                {items.length > 0 && mode === 'edit' && (
                  <Badge variant="outline" className="text-xs font-normal ml-1">{items.length}</Badge>
                )}
              </CardTitle>
              {mode !== 'edit' && (
                <button type="button" onClick={edit}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  ← Retour édition
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {mode === 'edit'    && <QuizEditor   items={items} onAdd={add} onRemove={remove} onStart={start} onAddMany={addMany} />}
            {mode === 'play'    && <QuizPlay     items={items} onEnd={end} />}
            {mode === 'results' && <QuizResults  items={items} results={results} onRestart={restart} onEdit={edit} />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
