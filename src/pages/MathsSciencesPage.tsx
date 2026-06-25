import { Atom, Calculator, FlaskConical, Ruler, Zap } from 'lucide-react';
import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ENBadge from '@/components/ui/ENBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

// ─── Parseur mathématique safe (sans eval / new Function) ────────────────────
// Supporte : +  −  *  /  ** | sin cos tan log10 log sqrt abs | PI E | ( ) | !
// Grammaire (précédences standard) :
//   expr    = term   (('+' | '-') term)*
//   term    = factor (('*' | '/') factor)*
//   factor  = unary  ('**' unary)*          ← droite-associatif
//   unary   = '-' unary | postfix
//   postfix = primary '!'?
//   primary = NUMBER | CONST | FUNC '(' expr ')' | '(' expr ')'

type Token =
  | { t: 'num';  v: number }
  | { t: 'op';   v: string }
  | { t: 'func'; v: string }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'fact' };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    if (/\s/.test(src[i])) { i++; continue; }
    // Fonctions et constantes (ordre : log10 avant log)
    const fns = ['Math.log10', 'Math.log', 'Math.sin', 'Math.cos', 'Math.tan', 'Math.sqrt', 'Math.abs', 'Math.PI', 'Math.E'];
    let matched = false;
    for (const fn of fns) {
      if (src.startsWith(fn, i)) {
        if (fn === 'Math.PI') tokens.push({ t: 'num', v: Math.PI });
        else if (fn === 'Math.E') tokens.push({ t: 'num', v: Math.E });
        else tokens.push({ t: 'func', v: fn });
        i += fn.length; matched = true; break;
      }
    }
    if (matched) continue;
    // Opérateur ** avant *
    if (src.startsWith('**', i)) { tokens.push({ t: 'op', v: '**' }); i += 2; continue; }
    if (src[i] === '*') { tokens.push({ t: 'op', v: '*' }); i++; continue; }
    if (src[i] === '/') { tokens.push({ t: 'op', v: '/' }); i++; continue; }
    if (src[i] === '+') { tokens.push({ t: 'op', v: '+' }); i++; continue; }
    if (src[i] === '-') { tokens.push({ t: 'op', v: '-' }); i++; continue; }
    if (src[i] === '(') { tokens.push({ t: 'lp' }); i++; continue; }
    if (src[i] === ')') { tokens.push({ t: 'rp' }); i++; continue; }
    if (src[i] === '!') { tokens.push({ t: 'fact' }); i++; continue; }
    // Nombre (entier ou décimal, éventuellement négatif géré par unary)
    const numMatch = src.slice(i).match(/^\d+(?:\.\d+)?/);
    if (numMatch) { tokens.push({ t: 'num', v: parseFloat(numMatch[0]) }); i += numMatch[0].length; continue; }
    throw new Error(`Token inconnu : ${src[i]}`);
  }
  return tokens;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n > 170) return Infinity;
  let r = 1; for (let k = 2; k <= n; k++) r *= k; return r;
}

function parse(tokens: Token[]): number {
  let pos = 0;
  const peek = () => tokens[pos] as Token | undefined;
  const consume = () => tokens[pos++] as Token;

  // Helpers typés
  const peekIsOp = (...ops: string[]) => {
    const t = peek();
    return t?.t === 'op' && ops.includes((t as { t: 'op'; v: string }).v);
  };
  const peekIs = (type: Token['t']) => peek()?.t === type;

  function parseExpr(): number {
    let left = parseTerm();
    while (peekIsOp('+', '-')) {
      const op = (consume() as { t: 'op'; v: string }).v;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (peekIsOp('*', '/')) {
      const op = (consume() as { t: 'op'; v: string }).v;
      const right = parseFactor();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parseFactor(): number {
    const base = parseUnary();
    if (peekIsOp('**')) {
      consume();
      const exp = parseFactor(); // droite-associatif : récursion sur parseFactor
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (peekIsOp('-')) { consume(); return -parsePostfix(); }
    if (peekIsOp('+')) { consume(); return parsePostfix(); }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let val = parsePrimary();
    while (peekIs('fact')) { consume(); val = factorial(val); }
    return val;
  }

  function parsePrimary(): number {
    const tok = peek();
    if (!tok) throw new Error('Expression vide');
    if (tok.t === 'num') { consume(); return (tok as { t: 'num'; v: number }).v; }
    if (tok.t === 'lp') {
      consume();
      const val = parseExpr();
      if (!peekIs('rp')) throw new Error('Parenthèse fermante manquante');
      consume();
      return val;
    }
    if (tok.t === 'func') {
      const fn = (tok as { t: 'func'; v: string }).v;
      consume();
      if (!peekIs('lp')) throw new Error('( attendue après la fonction');
      consume();
      const arg = parseExpr();
      if (!peekIs('rp')) throw new Error('Parenthèse fermante manquante');
      consume();
      if (fn === 'Math.sin')   return Math.sin(arg);
      if (fn === 'Math.cos')   return Math.cos(arg);
      if (fn === 'Math.tan')   return Math.tan(arg);
      if (fn === 'Math.log10') return Math.log10(arg);
      if (fn === 'Math.log')   return Math.log(arg);
      if (fn === 'Math.sqrt')  return Math.sqrt(arg);
      if (fn === 'Math.abs')   return Math.abs(arg);
      throw new Error(`Fonction inconnue : ${fn}`);
    }
    throw new Error(`Token inattendu : ${JSON.stringify(tok)}`);
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error('Expression invalide');
  return result;
}

function safeEval(expression: string): number {
  const tokens = tokenize(expression);
  return parse(tokens);
}

// ─── Calculatrice ─────────────────────────────────────────────────────────────
const CalcButton: React.FC<{ label: string; onClick: () => void; variant?: 'primary' | 'op' | 'fn' | 'default' }> = ({ label, onClick, variant = 'default' }) => {
  const cls = {
    primary: 'bg-primary text-primary-foreground',
    op: 'bg-chart-1/15 text-chart-1 hover:bg-chart-1/25 font-bold',
    fn: 'bg-secondary text-muted-foreground hover:bg-muted text-xs',
    default: 'bg-secondary text-foreground hover:bg-muted',
  }[variant];
  return (
    <button type="button"
      onClick={onClick}
      className={`h-11 rounded-md text-sm font-medium transition-colors ${cls}`}
    >
      {label}
    </button>
  );
};

const ScientificCalc: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Convertit l'expression interne en affichage lisible
  const toDisplay = (expr: string): string => expr
    .replace(/Math\.sin\(/g, 'sin(')
    .replace(/Math\.cos\(/g, 'cos(')
    .replace(/Math\.tan\(/g, 'tan(')
    .replace(/Math\.log10\(/g, 'log(')
    .replace(/Math\.log\(/g, 'ln(')
    .replace(/Math\.sqrt\(/g, '√(')
    .replace(/Math\.abs\(/g, 'abs(')
    .replace(/Math\.PI/g, 'π')
    .replace(/Math\.E(?!\w)/g, 'e')
    .replace(/\*\*\(-1\)/g, '⁻¹')
    .replace(/\*\*2/g, '²')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');

  const displayText = result || toDisplay(expression) || '0';
  const subText = result ? toDisplay(expression) : '';

  // Ajoute val à l'expression ; après un résultat, les opérateurs enchaînent
  const append = (val: string) => {
    if (result) {
      const isOp = ['+', '-', '*', '/', '**', '**2', '**(-1)'].some(op => val === op);
      setExpression(isOp ? result + val : val);
      setResult('');
    } else {
      setExpression(p => p + val);
    }
  };

  const calculate = () => {
    if (!expression) return;
    try {
      const res = safeEval(expression);
      if (!isFinite(res) && !isNaN(res)) { setResult('Infini'); setExpression(''); return; }
      if (isNaN(res)) { setResult('Erreur'); setExpression(''); return; }
      const resultStr = String(parseFloat(res.toFixed(10)));
      const displayExpr = toDisplay(expression);
      setHistory(h => [`${displayExpr} = ${resultStr}`, ...h].slice(0, 15));
      setResult(resultStr);
      setExpression(resultStr);
    } catch {
      setResult('Erreur');
      setExpression('');
    }
  };

  const clear = () => { setExpression(''); setResult(''); };

  const backspace = () => {
    if (result) { setResult(''); setExpression(''); return; }
    setExpression(p => p.slice(0, -1));
  };

  return (
    <div className="space-y-4">
      <div className="bg-secondary rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-right h-4 truncate">{subText}</p>
        <p className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground text-right">{displayText}</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        <CalcButton label="sin" onClick={() => append('Math.sin(')} variant="fn" />
        <CalcButton label="cos" onClick={() => append('Math.cos(')} variant="fn" />
        <CalcButton label="tan" onClick={() => append('Math.tan(')} variant="fn" />
        <CalcButton label="log" onClick={() => append('Math.log10(')} variant="fn" />
        <CalcButton label="ln"  onClick={() => append('Math.log(')} variant="fn" />

        <CalcButton label="√"  onClick={() => append('Math.sqrt(')} variant="fn" />
        <CalcButton label="x²" onClick={() => append('**2')} variant="fn" />
        <CalcButton label="xⁿ" onClick={() => append('**')} variant="fn" />
        <CalcButton label="π"  onClick={() => append('Math.PI')} variant="fn" />
        <CalcButton label="e"  onClick={() => append('Math.E')} variant="fn" />

        <CalcButton label="(" onClick={() => append('(')} variant="op" />
        <CalcButton label=")" onClick={() => append(')')} variant="op" />
        <CalcButton label="%" onClick={() => append('/100')} variant="op" />
        <CalcButton label="⌫" onClick={backspace} variant="op" />
        <CalcButton label="C" onClick={clear} variant="primary" />

        {['7','8','9'].map(n => <CalcButton key={n} label={n} onClick={() => append(n)} />)}
        <CalcButton label="÷" onClick={() => append('/')} variant="op" />
        <CalcButton label="!" onClick={() => append('!')} variant="fn" />

        {['4','5','6'].map(n => <CalcButton key={n} label={n} onClick={() => append(n)} />)}
        <CalcButton label="×" onClick={() => append('*')} variant="op" />
        <CalcButton label="abs" onClick={() => append('Math.abs(')} variant="fn" />

        {['1','2','3'].map(n => <CalcButton key={n} label={n} onClick={() => append(n)} />)}
        <CalcButton label="−" onClick={() => append('-')} variant="op" />
        <CalcButton label="1/x" onClick={() => append('**(-1)')} variant="fn" />

        <CalcButton label="0" onClick={() => append('0')} />
        <CalcButton label="." onClick={() => append('.')} />
        <CalcButton label="ANS" onClick={() => { if (history[0]) { const ans = history[0].split('=')[1]?.trim() || ''; setExpression(ans); setResult(''); } }} variant="fn" />
        <CalcButton label="+" onClick={() => append('+')} variant="op" />
        <CalcButton label="=" onClick={calculate} variant="primary" />
      </div>
      {history.length > 0 && (
        <div className="bg-secondary rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-2">Historique</p>
          {history.map((h, i) => <p key={i} className="text-xs text-foreground font-mono">{h}</p>)}
        </div>
      )}
    </div>
  );
};

// ─── Convertisseur ────────────────────────────────────────────────────────────
const UNIT_CATEGORIES = {
  'Longueur': { units: ['mm', 'cm', 'm', 'km', 'inch', 'foot', 'mile'], toBase: (v: number, u: string) => {
    const f: Record<string,number> = {mm:0.001,cm:0.01,m:1,km:1000,inch:0.0254,foot:0.3048,mile:1609.34};
    return v * (f[u] || 1);
  }, fromBase: (v: number, u: string) => {
    const f: Record<string,number> = {mm:1000,cm:100,m:1,km:0.001,inch:39.3701,foot:3.28084,mile:0.000621371};
    return v * (f[u] || 1);
  }},
  'Masse': { units: ['mg', 'g', 'kg', 't', 'oz', 'lb'], toBase: (v: number, u: string) => {
    const f: Record<string,number> = {mg:0.000001,g:0.001,kg:1,t:1000,oz:0.0283495,lb:0.453592};
    return v * (f[u] || 1);
  }, fromBase: (v: number, u: string) => {
    const f: Record<string,number> = {mg:1e6,g:1000,kg:1,t:0.001,oz:35.274,lb:2.20462};
    return v * (f[u] || 1);
  }},
  'Température': { units: ['°C', '°F', 'K'], toBase: (v: number, u: string) => {
    if (u === '°C') return v;
    if (u === '°F') return (v - 32) * 5/9;
    return v - 273.15;
  }, fromBase: (v: number, u: string) => {
    if (u === '°C') return v;
    if (u === '°F') return v * 9/5 + 32;
    return v + 273.15;
  }},
  'Volume': { units: ['mL', 'cL', 'dL', 'L', 'm³', 'ft³'], toBase: (v: number, u: string) => {
    const f: Record<string,number> = {mL:0.001,cL:0.01,dL:0.1,L:1,'m³':1000,'ft³':28.3168};
    return v * (f[u] || 1);
  }, fromBase: (v: number, u: string) => {
    const f: Record<string,number> = {mL:1000,cL:100,dL:10,L:1,'m³':0.001,'ft³':0.0353};
    return v * (f[u] || 1);
  }},
  'Vitesse': { units: ['m/s', 'km/h', 'mph', 'nœud'], toBase: (v: number, u: string) => {
    const f: Record<string,number> = {'m/s':1,'km/h':0.277778,mph:0.44704,'nœud':0.514444};
    return v * (f[u] || 1);
  }, fromBase: (v: number, u: string) => {
    const f: Record<string,number> = {'m/s':1,'km/h':3.6,mph:2.23694,'nœud':1.94384};
    return v * (f[u] || 1);
  }},
};

const Converter: React.FC = () => {
  const [category, setCategory] = useState('Longueur');
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [result, setResult] = useState('');

  const cat = UNIT_CATEGORIES[category as keyof typeof UNIT_CATEGORIES];

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const base = cat.toBase(v, fromUnit);
    const res = cat.fromBase(base, toUnit);
    setResult(`${v} ${fromUnit} = ${parseFloat(res.toFixed(8))} ${toUnit}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground mb-1 block">Catégorie</Label>
        <Select value={category} onValueChange={v => { setCategory(v); setValue(''); setResult(''); const c = UNIT_CATEGORIES[v as keyof typeof UNIT_CATEGORIES]; setFromUnit(c.units[0]); setToUnit(c.units[1]); }}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.keys(UNIT_CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-sm text-muted-foreground mb-1 block">De</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{cat.units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-sm text-muted-foreground mb-1 block">Vers</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{cat.units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label htmlFor="conv-value" className="text-sm text-muted-foreground mb-1 block">Valeur</Label>
        <Input id="conv-value" value={value} onChange={e => setValue(e.target.value)} type="number" inputMode="decimal" placeholder="0" className="h-9 text-sm" onKeyDown={e => e.key === 'Enter' && convert()} />
      </div>
      <Button onClick={convert} className="w-full h-9 bg-primary text-primary-foreground">Convertir</Button>
      {result && <div className="p-4 bg-secondary rounded-lg text-center"><p className="text-lg font-bold text-foreground">{result}</p></div>}
    </div>
  );
};

// ─── Formules ─────────────────────────────────────────────────────────────────
const FORMULAS = {
  'Maths': [
    // Algèbre / équations
    { name: 'Discriminant', formula: 'Δ = b² - 4ac', desc: 'Équation ax²+bx+c=0 : Δ>0 → 2 racines ; Δ=0 → 1 ; Δ<0 → aucune' },
    { name: 'Solutions (Δ ≥ 0)', formula: 'x = (-b ± √Δ) / 2a', desc: 'Deux solutions réelles si Δ > 0' },
    { name: 'Identités remarquables', formula: '(a+b)²=a²+2ab+b² | (a-b)²=a²-2ab+b² | (a+b)(a-b)=a²-b²', desc: 'À connaître par cœur' },
    { name: 'Somme et produit des racines', formula: 'x₁+x₂ = -b/a  |  x₁·x₂ = c/a', desc: 'Relations de Viète pour ax²+bx+c=0' },
    // Trigonométrie
    { name: 'Identité fondamentale', formula: 'cos²θ + sin²θ = 1', desc: 'Valable pour tout angle θ' },
    { name: 'sin dans un triangle rect.', formula: 'sin θ = opposé / hypoténuse', desc: 'SOH — sinus = opposé / hypoténuse' },
    { name: 'cos dans un triangle rect.', formula: 'cos θ = adjacent / hypoténuse', desc: 'CAH — cosinus = adjacent / hypoténuse' },
    { name: 'tan dans un triangle rect.', formula: 'tan θ = opposé / adjacent = sin θ / cos θ', desc: 'TOA — tangente = opposé / adjacent' },
    { name: 'Formule d\'addition (cos)', formula: 'cos(a+b) = cos a·cos b − sin a·sin b', desc: 'Formule d\'addition des cosinus' },
    { name: 'Formule d\'addition (sin)', formula: 'sin(a+b) = sin a·cos b + cos a·sin b', desc: 'Formule d\'addition des sinus' },
    { name: 'Valeurs remarquables', formula: 'sin 0°=0 | sin 30°=½ | sin 45°=√2/2 | sin 60°=√3/2 | sin 90°=1', desc: 'À mémoriser pour les calculs rapides' },
    // Suites
    { name: 'Suite arithmétique (terme)', formula: 'uₙ = u₀ + n·r', desc: 'r = raison, u₀ = premier terme' },
    { name: 'Suite arithmétique (somme)', formula: 'Sₙ = n·(u₁ + uₙ)/2', desc: 'Somme des n premiers termes' },
    { name: 'Suite géométrique (terme)', formula: 'uₙ = u₀ · qⁿ', desc: 'q = raison, q ≠ 0' },
    { name: 'Suite géométrique (somme)', formula: 'Sₙ = u₁·(1 − qⁿ)/(1 − q)', desc: 'q ≠ 1' },
    // Analyse / Dérivées
    { name: 'Dérivée de xⁿ', formula: '(xⁿ)\'= n·xⁿ⁻¹', desc: 'Dérivée d\'une puissance' },
    { name: 'Dérivée de eˣ', formula: '(eˣ)\'= eˣ', desc: 'Cas particulier : (e^(ax))\'= a·e^(ax)' },
    { name: 'Dérivée de ln x', formula: '(ln x)\'= 1/x', desc: 'x > 0' },
    { name: 'Dérivée de sin x', formula: '(sin x)\'= cos x', desc: 'x en radians' },
    { name: 'Dérivée de cos x', formula: '(cos x)\'= −sin x', desc: 'x en radians' },
    { name: 'Dérivée produit (uv)', formula: '(uv)\'= u\'v + uv\'', desc: 'Règle du produit' },
    { name: 'Dérivée quotient (u/v)', formula: '(u/v)\'= (u\'v − uv\') / v²', desc: 'v ≠ 0' },
    { name: 'Dérivée composée', formula: '(f∘g)\'= g\'·(f\'∘g)', desc: 'Règle de la chaîne : [f(g(x))]\'= g\'(x)·f\'(g(x))' },
    // Intégrales
    { name: 'Intégrale de xⁿ', formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C', desc: 'n ≠ −1' },
    { name: 'Intégrale de eˣ', formula: '∫eˣdx = eˣ + C', desc: 'Primitive de l\'exponentielle' },
    { name: 'Intégrale de 1/x', formula: '∫(1/x)dx = ln|x| + C', desc: 'x ≠ 0' },
    { name: 'Intégrale définie (IPP)', formula: '∫f\'g = [fg] − ∫fg\'', desc: 'Intégration par parties' },
    // Géométrie
    { name: 'Théorème de Pythagore', formula: 'a² + b² = c²', desc: 'c = hypoténuse, triangle rectangle' },
    { name: 'Théorème de Thalès', formula: 'AM/AB = AN/AC = MN/BC', desc: 'Si MN ∥ BC dans le triangle ABC' },
    { name: 'Aire du cercle', formula: 'A = πr²', desc: 'r = rayon' },
    { name: 'Périmètre du cercle', formula: 'P = 2πr', desc: 'r = rayon' },
    { name: 'Volume sphère', formula: 'V = (4/3)πr³', desc: 'r = rayon' },
    { name: 'Volume cône / pyramide', formula: 'V = (1/3)·B·h', desc: 'B = aire de la base, h = hauteur' },
    { name: 'Volume cylindre', formula: 'V = πr²·h', desc: 'r = rayon, h = hauteur' },
    { name: 'Produit scalaire', formula: 'u⃗·v⃗ = |u⃗|·|v⃗|·cos θ = x₁x₂ + y₁y₂', desc: 'Deux définitions équivalentes' },
    // Probabilités / Statistiques
    { name: 'Probabilité conditionnelle', formula: 'P(A|B) = P(A∩B) / P(B)', desc: 'P(B) > 0' },
    { name: 'Formule des probabilités totales', formula: 'P(A) = Σ P(A|Bᵢ)·P(Bᵢ)', desc: 'Partition (B₁,…,Bₙ) de l\'espace' },
    { name: 'Loi binomiale', formula: 'P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ', desc: 'X ~ B(n,p) ; E(X)=np ; V(X)=np(1-p)' },
    { name: 'Coefficient binomial', formula: 'C(n,k) = n! / (k!·(n-k)!)', desc: '"k parmi n"' },
    { name: 'Espérance', formula: 'E(X) = Σ xᵢ·P(X=xᵢ)', desc: 'Valeur moyenne pondérée' },
    { name: 'Variance', formula: 'V(X) = E(X²) − [E(X)]²', desc: 'Écart-type σ = √V(X)' },
    { name: 'Loi normale', formula: 'X ~ N(μ,σ²) : P(μ−σ ≤ X ≤ μ+σ) ≈ 68%', desc: '95% pour ±2σ ; 99.7% pour ±3σ' },
    // Nombres complexes
    { name: 'Forme algébrique', formula: 'z = a + ib  (a,b ∈ ℝ)', desc: 'a = partie réelle, b = partie imaginaire' },
    { name: 'Module', formula: '|z| = √(a²+b²)', desc: '|z|² = z·z̄' },
    { name: 'Forme trigonométrique', formula: 'z = r(cos θ + i sin θ)', desc: 'r = |z|, θ = argument' },
    { name: 'Formule d\'Euler', formula: 'e^(iθ) = cos θ + i sin θ', desc: 'Notation exponentielle' },
    // Logarithme / Exponentielle
    { name: 'Propriétés de ln', formula: 'ln(ab)=ln a+ln b | ln(a/b)=ln a−ln b | ln(aⁿ)=n·ln a', desc: 'a, b > 0' },
    { name: 'Propriétés de exp', formula: 'eᵃ⁺ᵇ=eᵃ·eᵇ | e⁻ᵃ=1/eᵃ | (eᵃ)ⁿ=eⁿᵃ', desc: 'exp et ln sont fonctions inverses' },
  ],
  'Physique': [
    // Mécanique
    { name: 'Vitesse moyenne', formula: 'v = Δd/Δt', desc: 'v en m/s, d en m, t en s' },
    { name: 'Accélération', formula: 'a = Δv/Δt', desc: 'a en m/s², variation de vitesse' },
    { name: '2e loi de Newton', formula: 'ΣF⃗ = m·a⃗', desc: 'Somme des forces = masse × accélération' },
    { name: 'Poids', formula: 'P = m·g', desc: 'g = 9.81 m/s² sur Terre' },
    { name: 'Chute libre (vitesse)', formula: 'v(t) = g·t', desc: 'Depuis le repos, sans frottement' },
    { name: 'Chute libre (distance)', formula: 'h = ½·g·t²', desc: 'h en m, t en s' },
    { name: 'Quantité de mouvement', formula: 'p⃗ = m·v⃗', desc: 'Conservation si ΣF⃗ ext = 0' },
    { name: 'Gravitation universelle', formula: 'F = G·m₁m₂/r²', desc: 'G = 6.674×10⁻¹¹ N·m²·kg⁻²' },
    { name: 'Travail d\'une force', formula: 'W = F·d·cos θ', desc: 'θ = angle entre F⃗ et déplacement' },
    { name: 'Énergie cinétique', formula: 'Ec = ½mv²', desc: 'm en kg, v en m/s' },
    { name: 'Énergie potentielle gravitationnelle', formula: 'Ep = mgh', desc: 'g = 9.81 m/s², h = hauteur en m' },
    { name: 'Conservation énergie mécanique', formula: 'Em = Ec + Ep = constante', desc: 'Si pas de frottement' },
    { name: 'Puissance mécanique', formula: 'P = W/t = F·v', desc: 'P en watts' },
    { name: 'Oscillateur (pulsation)', formula: 'ω₀ = √(k/m)', desc: 'Ressort : k = raideur (N/m), m = masse' },
    { name: 'Période oscillateur', formula: 'T = 2π/ω₀ = 2π√(m/k)', desc: 'Pendule : T = 2π√(L/g)' },
    // Électricité
    { name: 'Loi d\'Ohm', formula: 'U = R·I', desc: 'U en V, R en Ω, I en A' },
    { name: 'Lois de Kirchhoff (nœuds)', formula: 'ΣI entrants = ΣI sortants', desc: 'Conservation des charges' },
    { name: 'Lois de Kirchhoff (mailles)', formula: 'Σ tensions dans une maille = 0', desc: 'Conservation de l\'énergie' },
    { name: 'Puissance électrique', formula: 'P = U·I = U²/R = R·I²', desc: 'P en watts' },
    { name: 'Énergie électrique', formula: 'E = P·t = U·I·t', desc: 'E en joules (ou en kWh : E = P(kW)·t(h))' },
    { name: 'Résistances en série', formula: 'R_eq = R₁ + R₂ + …', desc: 'Même courant dans chaque résistance' },
    { name: 'Résistances en parallèle', formula: '1/R_eq = 1/R₁ + 1/R₂ + …', desc: 'Même tension aux bornes' },
    { name: 'Condensateur (charge)', formula: 'Q = C·U  |  I = C·(dU/dt)', desc: 'C en farads (F)' },
    { name: 'Circuit RC (charge)', formula: 'u_C(t) = E·(1 − e^(−t/τ))', desc: 'τ = RC (constante de temps)' },
    // Optique
    { name: 'Loi de Snell-Descartes', formula: 'n₁·sin θ₁ = n₂·sin θ₂', desc: 'n = indice de réfraction (n_verre ≈ 1.5)' },
    { name: 'Vergence d\'une lentille', formula: 'D = 1/f\'  (en dioptries)', desc: 'f\' = distance focale en mètres' },
    { name: 'Relation conjugaison (lentille)', formula: '1/v − 1/u = 1/f\'', desc: 'u = dist. objet, v = dist. image (algébriques)' },
    { name: 'Grandissement', formula: 'γ = v/u = taille image / taille objet', desc: 'γ < 0 : image renversée' },
    // Ondes
    { name: 'Relation onde', formula: 'v = λ·f = λ/T', desc: 'v en m/s, λ en m, f en Hz, T en s' },
    { name: 'Énergie d\'un photon', formula: 'E = h·f = h·c/λ', desc: 'h = 6.626×10⁻³⁴ J·s, c = 3×10⁸ m/s' },
    { name: 'Effet Doppler', formula: 'f_obs = f_source · (v ± v_obs)/(v ∓ v_source)', desc: '+ si rapprochement, − si éloignement' },
    // Thermodynamique
    { name: 'Gaz parfaits', formula: 'PV = nRT', desc: 'R = 8.314 J/(mol·K), T en Kelvin' },
    { name: 'Conversion °C ↔ K', formula: 'T(K) = T(°C) + 273.15', desc: '0 K = zéro absolu = −273.15 °C' },
    { name: '1er principe thermo', formula: 'ΔU = W + Q', desc: 'ΔU = variation d\'énergie interne' },
    // Radioactivité
    { name: 'Loi de décroissance radioactive', formula: 'N(t) = N₀·e^(−λt)', desc: 'λ = constante radioactive' },
    { name: 'Demi-vie', formula: 't₁/₂ = ln 2 / λ ≈ 0.693/λ', desc: 'Temps pour que N₀ diminue de moitié' },
    { name: 'Défaut de masse / énergie', formula: 'E = Δm·c²', desc: 'c = 3×10⁸ m/s, Δm en kg' },
  ],
  'Chimie': [
    // Généralités
    { name: 'Quantité de matière', formula: 'n = m/M = V/Vm = N/Nₐ', desc: 'Vm = 22.4 L/mol (CNTP) ; Nₐ = 6.022×10²³' },
    { name: 'Concentration molaire', formula: 'c = n/V', desc: 'c en mol/L, n en mol, V en L' },
    { name: 'Dilution', formula: 'c₁·V₁ = c₂·V₂', desc: 'Conservation de la quantité de matière lors d\'une dilution' },
    { name: 'Taux d\'avancement', formula: 'τ = x_max / x_éq', desc: 'τ = 1 : réaction totale ; τ < 1 : équilibre' },
    // Acides-bases
    { name: 'pH', formula: 'pH = −log[H₃O⁺]', desc: 'Eau pure : pH = 7 (à 25°C)' },
    { name: 'Relation pH/pOH', formula: 'pH + pOH = 14', desc: 'pOH = −log[OH⁻]' },
    { name: 'Henderson-Hasselbalch', formula: 'pH = pKa + log([A⁻]/[AH])', desc: 'Tampon acide faible/base conjuguée' },
    { name: 'Produit ionique de l\'eau', formula: 'Ke = [H₃O⁺]·[OH⁻] = 10⁻¹⁴', desc: 'pKe = 14 à 25°C' },
    // Oxydoréduction
    { name: 'Potentiel standard (Nernst)', formula: 'E = E° + (0.06/n)·log([ox]/[red])', desc: 'À 25°C, n = nb d\'électrons échangés' },
    { name: 'Force électromotrice', formula: 'E_pile = E_cathode − E_anode', desc: 'E > 0 : réaction spontanée' },
    // Cinétique
    { name: 'Vitesse de réaction', formula: 'v = −(1/a)·d[A]/dt = (1/b)·d[B]/dt', desc: 'a, b = coefficients stœchiométriques' },
    { name: 'Loi de vitesse (ordre 1)', formula: '[A](t) = [A]₀·e^(−k·t)', desc: 'k = constante de vitesse' },
    { name: 'Temps de demi-réaction (ordre 1)', formula: 't₁/₂ = ln 2 / k', desc: 'Indépendant de [A]₀' },
    // Thermochimie
    { name: 'Enthalpie standard de réaction', formula: 'ΔrH° = Σ ΔfH°(produits) − Σ ΔfH°(réactifs)', desc: 'Loi de Hess' },
    { name: 'Énergie de liaison', formula: 'ΔrH° = Σ E(liaisons rompues) − Σ E(liaisons formées)', desc: 'Liaisons rompues : énergie absorbée' },
    // Gaz
    { name: 'Gaz parfaits', formula: 'PV = nRT', desc: 'R = 8.314 J/(mol·K)' },
    { name: 'Loi de Dalton (pression partielle)', formula: 'P_total = P₁ + P₂ + … + Pₙ', desc: 'Mélange de gaz parfaits' },
    // Spectroscopie
    { name: 'Loi de Beer-Lambert', formula: 'A = ε·l·c', desc: 'A = absorbance, ε = coeff. d\'extinction (L/(mol·cm)), l = longueur (cm)' },
    // Constantes utiles
    { name: 'Constante de Faraday', formula: 'F = Nₐ·e = 96 485 C/mol', desc: 'Charge d\'une mole d\'électrons' },
  ],
};

import { getMathsFormulaTagsForLevel } from '@/lib/levelUtils';

// Niveaux requis pour chaque formule
const FORMULA_LEVELS: Record<string, Record<string, string>> = {
  'Maths': {
    // Collège
    'Théorème de Pythagore': 'college', 'Périmètre du cercle': 'college', 'Aire du cercle': 'college',
    'Volume cône / pyramide': 'college', 'Volume cylindre': 'college',
    'Valeurs remarquables': 'college',
    // Lycée
    'Discriminant': 'lycee', 'Solutions (Δ ≥ 0)': 'lycee', 'Identités remarquables': 'lycee',
    'Somme et produit des racines': 'lycee',
    'Identité fondamentale': 'lycee', 'sin dans un triangle rect.': 'college',
    'cos dans un triangle rect.': 'college', 'tan dans un triangle rect.': 'college',
    'Formule d\'addition (cos)': 'lycee', 'Formule d\'addition (sin)': 'lycee',
    'Suite arithmétique (terme)': 'lycee', 'Suite arithmétique (somme)': 'lycee',
    'Suite géométrique (terme)': 'lycee', 'Suite géométrique (somme)': 'lycee',
    'Dérivée de xⁿ': 'lycee', 'Dérivée de eˣ': 'lycee', 'Dérivée de ln x': 'lycee',
    'Dérivée de sin x': 'lycee', 'Dérivée de cos x': 'lycee',
    'Dérivée produit (uv)': 'lycee', 'Dérivée quotient (u/v)': 'lycee', 'Dérivée composée': 'lycee',
    'Intégrale de xⁿ': 'lycee', 'Intégrale de eˣ': 'lycee',
    'Produit scalaire': 'lycee', 'Volume sphère': 'college',
    'Probabilité conditionnelle': 'lycee', 'Formule des probabilités totales': 'lycee',
    'Loi binomiale': 'lycee', 'Coefficient binomial': 'lycee',
    'Espérance': 'lycee', 'Variance': 'lycee', 'Loi normale': 'lycee',
    'Propriétés de ln': 'lycee', 'Propriétés de exp': 'lycee',
    // Supérieur
    'Intégrale de 1/x': 'superieur', 'Intégrale définie (IPP)': 'superieur',
    'Forme algébrique': 'lycee', 'Module': 'lycee',
    'Forme trigonométrique': 'superieur', 'Formule d\'Euler': 'superieur',
  },
  'Physique': {
    // Collège
    'Vitesse moyenne': 'college', 'Poids': 'college',
    // Lycée
    'Accélération': 'lycee', '2e loi de Newton': 'lycee',
    'Chute libre (vitesse)': 'lycee', 'Chute libre (distance)': 'lycee',
    'Quantité de mouvement': 'lycee', 'Gravitation universelle': 'lycee',
    'Travail d\'une force': 'lycee', 'Énergie cinétique': 'lycee',
    'Énergie potentielle gravitationnelle': 'lycee', 'Conservation énergie mécanique': 'lycee',
    'Puissance mécanique': 'lycee', 'Oscillateur (pulsation)': 'lycee', 'Période oscillateur': 'lycee',
    'Loi d\'Ohm': 'lycee', 'Lois de Kirchhoff (nœuds)': 'lycee', 'Lois de Kirchhoff (mailles)': 'lycee',
    'Puissance électrique': 'lycee', 'Énergie électrique': 'lycee',
    'Résistances en série': 'lycee', 'Résistances en parallèle': 'lycee',
    'Condensateur (charge)': 'lycee', 'Circuit RC (charge)': 'lycee',
    'Loi de Snell-Descartes': 'lycee', 'Vergence d\'une lentille': 'lycee',
    'Relation conjugaison (lentille)': 'lycee', 'Grandissement': 'lycee',
    'Relation onde': 'lycee', 'Énergie d\'un photon': 'lycee', 'Effet Doppler': 'lycee',
    'Gaz parfaits': 'lycee', 'Conversion °C ↔ K': 'lycee', '1er principe thermo': 'superieur',
    'Loi de décroissance radioactive': 'lycee', 'Demi-vie': 'lycee', 'Défaut de masse / énergie': 'lycee',
  },
  'Chimie': {
    // Lycée
    'Quantité de matière': 'lycee', 'Concentration molaire': 'lycee', 'Dilution': 'lycee',
    'Taux d\'avancement': 'lycee', 'pH': 'lycee', 'Relation pH/pOH': 'lycee',
    'Henderson-Hasselbalch': 'superieur', 'Produit ionique de l\'eau': 'lycee',
    'Vitesse de réaction': 'lycee', 'Loi de vitesse (ordre 1)': 'superieur',
    'Temps de demi-réaction (ordre 1)': 'superieur',
    'Enthalpie standard de réaction': 'lycee', 'Énergie de liaison': 'lycee',
    'Gaz parfaits': 'lycee', 'Loi de Dalton (pression partielle)': 'lycee',
    'Loi de Beer-Lambert': 'lycee', 'Constante de Faraday': 'superieur',
    // Supérieur
    'Potentiel standard (Nernst)': 'superieur', 'Force électromotrice': 'superieur',
  },
};

const FormulasTab: React.FC = () => {
  const { level } = useApp();
  const allowedTags = getMathsFormulaTagsForLevel(level);
  const [subject, setSubject] = useState('Maths');
  const [search, setSearch] = useState('');
  const formulas = (FORMULAS[subject as keyof typeof FORMULAS] || []).filter(f => {
    const reqLevel = FORMULA_LEVELS[subject]?.[f.name] ?? 'college';
    if (!allowedTags.includes(reqLevel)) return false;
    return f.name.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.keys(FORMULAS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="h-9 text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {formulas.map(f => (
          <div key={f.name} className="p-3 bg-secondary rounded-lg border border-border">
            <p className="text-xs text-primary font-semibold mb-1">{f.name}</p>
            <p className="text-base font-mono font-bold text-foreground">{f.formula}</p>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tableau périodique ───────────────────────────────────────────────────────
const ELEMENTS = [
  { z: 1, symbol: 'H', name: 'Hydrogène', mass: 1.008, cat: 'nonmetal', group: 1, period: 1 },
  { z: 2, symbol: 'He', name: 'Hélium', mass: 4.003, cat: 'noble', group: 18, period: 1 },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, cat: 'alkali', group: 1, period: 2 },
  { z: 4, symbol: 'Be', name: 'Béryllium', mass: 9.012, cat: 'alkaline', group: 2, period: 2 },
  { z: 5, symbol: 'B', name: 'Bore', mass: 10.811, cat: 'metalloid', group: 13, period: 2 },
  { z: 6, symbol: 'C', name: 'Carbone', mass: 12.011, cat: 'nonmetal', group: 14, period: 2 },
  { z: 7, symbol: 'N', name: 'Azote', mass: 14.007, cat: 'nonmetal', group: 15, period: 2 },
  { z: 8, symbol: 'O', name: 'Oxygène', mass: 15.999, cat: 'nonmetal', group: 16, period: 2 },
  { z: 9, symbol: 'F', name: 'Fluor', mass: 18.998, cat: 'halogen', group: 17, period: 2 },
  { z: 10, symbol: 'Ne', name: 'Néon', mass: 20.180, cat: 'noble', group: 18, period: 2 },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, cat: 'alkali', group: 1, period: 3 },
  { z: 12, symbol: 'Mg', name: 'Magnésium', mass: 24.305, cat: 'alkaline', group: 2, period: 3 },
  { z: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, cat: 'post-trans', group: 13, period: 3 },
  { z: 14, symbol: 'Si', name: 'Silicium', mass: 28.086, cat: 'metalloid', group: 14, period: 3 },
  { z: 15, symbol: 'P', name: 'Phosphore', mass: 30.974, cat: 'nonmetal', group: 15, period: 3 },
  { z: 16, symbol: 'S', name: 'Soufre', mass: 32.065, cat: 'nonmetal', group: 16, period: 3 },
  { z: 17, symbol: 'Cl', name: 'Chlore', mass: 35.453, cat: 'halogen', group: 17, period: 3 },
  { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, cat: 'noble', group: 18, period: 3 },
  { z: 19, symbol: 'K', name: 'Potassium', mass: 39.098, cat: 'alkali', group: 1, period: 4 },
  { z: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, cat: 'alkaline', group: 2, period: 4 },
  { z: 26, symbol: 'Fe', name: 'Fer', mass: 55.845, cat: 'transition', group: 8, period: 4 },
  { z: 29, symbol: 'Cu', name: 'Cuivre', mass: 63.546, cat: 'transition', group: 11, period: 4 },
  { z: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, cat: 'transition', group: 12, period: 4 },
  { z: 47, symbol: 'Ag', name: 'Argent', mass: 107.868, cat: 'transition', group: 11, period: 5 },
  { z: 79, symbol: 'Au', name: 'Or', mass: 196.967, cat: 'transition', group: 11, period: 6 },
  { z: 82, symbol: 'Pb', name: 'Plomb', mass: 207.2, cat: 'post-trans', group: 14, period: 6 },
];

const CAT_COLORS: Record<string, string> = {
  alkali: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  alkaline: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  transition: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  nonmetal: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  noble: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  halogen: 'bg-primary/20 text-primary border-primary/30',
  metalloid: 'bg-muted text-muted-foreground border-border',
  'post-trans': 'bg-secondary text-secondary-foreground border-border',
};

const CAT_LABELS: Record<string, string> = {
  alkali: 'Métal alcalin', alkaline: 'Métal alc-terreux', transition: 'Métal de transition',
  nonmetal: 'Non-métal', noble: 'Gaz noble', halogen: 'Halogène',
  metalloid: 'Métalloïde', 'post-trans': 'Métal post-transition',
};

const PeriodicTable: React.FC = () => {
  const [selected, setSelected] = useState<typeof ELEMENTS[0] | null>(null);
  return (
    <div className="space-y-4">
      {/* Tableau périodique — mobile : boutons 10×10 colonnes, zéro scroll horizontal */}
      <div className="grid grid-cols-10 md:grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5 md:gap-1 w-full">
        {ELEMENTS.map(el => (
          <button type="button"
            key={el.z}
            onClick={() => setSelected(el)}
            className={`aspect-square rounded border text-center transition-[background-color,border-color,color,box-shadow,transform] hover:scale-105 ${CAT_COLORS[el.cat]} ${selected?.z === el.z ? 'ring-2 ring-primary scale-105' : ''}`}
          >
            <div className="text-[9px] md:text-[10px] leading-none opacity-60">{el.z}</div>
            <div className="text-[10px] md:text-xs font-bold leading-tight">{el.symbol}</div>
            <div className="text-[9px] leading-none truncate px-0.5 hidden md:block">{el.name.slice(0, 4)}</div>
          </button>
        ))}
      </div>
      {/* Légende */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CAT_LABELS).map(([cat, label]) => (
          <Badge key={cat} className={`text-xs ${CAT_COLORS[cat]}`}>{label}</Badge>
        ))}
      </div>
      {selected && (
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${CAT_COLORS[selected.cat]}`}>
                <span className="text-xs">{selected.z}</span>
                <span className="text-2xl font-bold">{selected.symbol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  <div className="min-w-0"><span className="text-sm text-muted-foreground leading-relaxed text-pretty">Numéro atomique</span><p className="text-sm font-medium text-foreground">{selected.z}</p></div>
                  <div className="min-w-0"><span className="text-sm text-muted-foreground leading-relaxed text-pretty">Masse atomique</span><p className="text-sm font-medium text-foreground">{selected.mass} g/mol</p></div>
                  <div className="min-w-0"><span className="text-sm text-muted-foreground leading-relaxed text-pretty">Catégorie</span><p className="text-sm font-medium text-foreground">{CAT_LABELS[selected.cat]}</p></div>
                  <div className="min-w-0"><span className="text-sm text-muted-foreground leading-relaxed text-pretty">Période / Groupe</span><p className="text-sm font-medium text-foreground">{selected.period} / {selected.group}</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ─── Constantes physique-chimie ───────────────────────────────────────────────
const CONSTANTS = [
  { name: 'Vitesse de la lumière', symbol: 'c', value: '3 × 10⁸ m/s', domain: 'Physique' },
  { name: 'Constante de Planck', symbol: 'h', value: '6.626 × 10⁻³⁴ J·s', domain: 'Physique' },
  { name: 'Constante gravitationnelle', symbol: 'G', value: '6.674 × 10⁻¹¹ N·m²·kg⁻²', domain: 'Physique' },
  { name: 'Accélération gravitationnelle', symbol: 'g', value: '9.81 m/s²', domain: 'Physique' },
  { name: 'Constante des gaz parfaits', symbol: 'R', value: '8.314 J·mol⁻¹·K⁻¹', domain: 'Chimie' },
  { name: 'Nombre d\'Avogadro', symbol: 'Nₐ', value: '6.022 × 10²³ mol⁻¹', domain: 'Chimie' },
  { name: 'Charge élémentaire', symbol: 'e', value: '1.602 × 10⁻¹⁹ C', domain: 'Physique' },
  { name: 'Masse de l\'électron', symbol: 'mₑ', value: '9.109 × 10⁻³¹ kg', domain: 'Physique' },
  { name: 'Permittivité du vide', symbol: 'ε₀', value: '8.854 × 10⁻¹² F·m⁻¹', domain: 'Physique' },
  { name: 'Volume molaire (CNTP)', symbol: 'Vm', value: '24.0 L·mol⁻¹', domain: 'Chimie' },
];

const MathsSciencesPage: React.FC = () => {
  // addActivity removed (unused)
  return (
    <div className="min-w-0 space-y-4">
    <h1 className="sr-only">Maths & Sciences — Calculatrice & Formules</h1>
      <SEO
        title="Maths & Sciences Gratuits — Calculatrice, Formules & Physique | Apprenix"
        description="Calculatrice, formules de maths, tableau périodique et physique-chimie. Tous les outils scientifiques pour les élèves, gratuits et sans inscription."
        canonical="/maths-sciences"
        keywords="calculatrice scientifique gratuite, formules mathématiques lycée, tableau périodique interactif, convertisseur unités gratuit, physique chimie lycée, aide maths bac 2026, formules physique, calcul en ligne, outils sciences gratuits"
        dateModified="2026-06-21"
      />

      {/* ── En-tête page ── */}
      <PageHero
        variant="tool"
        icon={Calculator}
        badge={<>🔢 Maths &amp; Sciences</>}
        badgeClassName="bg-chart-5/10 text-chart-5 border-chart-5/20"
        title="Maths & Sciences"
        subtitle="Calculatrice scientifique, convertisseur d'unités, formules mathématiques et physiques, tableau périodique interactif — tous les outils en un seul endroit."
        stats={[
          { value: '5', label: 'Outils intégrés' },
          { value: '100+', label: 'Formules & constantes' },
          { value: '118', label: 'Éléments tableau périodique' },
        ]}
      >
        <ENBadge />
      </PageHero>

      <Tabs defaultValue="calculatrice">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto whitespace-nowrap">
            <TabsTrigger value="calculatrice" className="text-xs"><Calculator className="w-3.5 h-3.5 mr-1" /> Calculatrice</TabsTrigger>
            <TabsTrigger value="convertisseur" className="text-xs"><Ruler className="w-3.5 h-3.5 mr-1" /> Convertisseur</TabsTrigger>
            <TabsTrigger value="formules" className="text-xs"><Zap className="w-3.5 h-3.5 mr-1" /> Formules</TabsTrigger>
            <TabsTrigger value="periodique" className="text-xs"><Atom className="w-3.5 h-3.5 mr-1" /> Tableau périodique</TabsTrigger>
            <TabsTrigger value="constantes" className="text-xs"><FlaskConical className="w-3.5 h-3.5 mr-1" /> Constantes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calculatrice">
          <div className="max-w-sm mx-auto">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> Calculatrice scientifique</CardTitle></CardHeader>
              <CardContent><ScientificCalc /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="convertisseur">
          <div className="max-w-md mx-auto">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Convertisseur d'unités</CardTitle></CardHeader>
              <CardContent><Converter /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formules">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Formules essentielles</CardTitle></CardHeader>
            <CardContent><FormulasTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodique">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Atom className="w-4 h-4 text-primary" /> Tableau périodique interactif</CardTitle></CardHeader>
            <CardContent><PeriodicTable /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constantes">
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /> Constantes physique-chimie</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONSTANTS.map(c => (
                  <div key={c.name} className="p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-primary text-sm">{c.symbol}</span>
                          <span className="text-sm font-medium text-foreground">= {c.value}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{c.domain}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MathsSciencesPage;
