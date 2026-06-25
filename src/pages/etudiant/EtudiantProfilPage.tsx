import {
  AlertCircle, BookOpen, CheckCircle, ChevronDown, ChevronUp, Copy,
  Eye, EyeOff, GraduationCap, Hash, RefreshCw, Save, School,
  Settings, Shield, ShieldCheck, ShieldQuestion, Star, Trash2, X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { normalizeAnswer, useApp } from '@/contexts/AppContext';
import { supabase } from '@/db/supabase';
import { SCHOOL_SUBJECTS as SUBJECTS } from '@/lib/constants';
import type { SchoolLevel, Subject } from '@/types/types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const LEVEL_GROUPS: { label: string; levels: SchoolLevel[] }[] = [
  { label: 'École primaire', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { label: 'Collège',        levels: ['6e', '5e', '4e', '3e'] },
  { label: 'Lycée',          levels: ['2nde', '1ère', 'Terminale'] },
  { label: 'Supérieur',      levels: ['BTS', 'Licence', 'Master', 'Grandes Écoles'] },
  { label: '💚 ULIS & SEGPA', levels: ['ULIS', 'SEGPA'] },
];

const AVATARS = [
  '👦','👧','🧑','👩','👨','🧑‍🎓','👩‍🎓','👨‍🎓',
  '🧑‍💻','👩‍💻','🦊','🐼','🦁','🐺','🐸','🦋',
  '🌟','🚀','🎯','🧠',
];

const SECURITY_QUESTIONS = [
  "Quel était le surnom affectueux que vous donniez à votre meilleur(e) ami(e) d'enfance ?",
  'Quel est le plat ou le dessert que votre famille prépare uniquement pour les grandes occasions ?',
  'Quel personnage de fiction vous a le plus marqué(e) ?',
  'Dans quelle ville rêveriez-vous de vous réveiller un matin ?',
  'Quel est le titre du premier livre, manga ou comic qui vous a vraiment passionné(e) ?',
  'Quel talent ou passe-temps secret peu de personnes autour de vous connaissent ?',
  'Quel objet insolite possédez-vous et auquel vous tenez particulièrement ?',
  'Quelle chanson vous ramène immédiatement à un souvenir précis de votre enfance ?',
  "Quel est le nom de votre animal imaginaire ou réel préféré ?",
  'Si vous pouviez maîtriser une compétence instantanément, laquelle choisiriez-vous ?',
];

// ─── Composant SaveBadge — confirmation visuelle de sauvegarde ─────────────
const SaveBadge: React.FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success animate-in fade-in duration-300">
      <CheckCircle className="w-3.5 h-3.5" /> Sauvegardé
    </span>
  ) : null;

// ─── Page Profil Étudiant ─────────────────────────────────────────────────────
const EtudiantProfilPage: React.FC = () => {
  const { profile, setProfile, isDark, toggleTheme, todos, aiHistory, recentActivity } = useApp();
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const verified    = !!(profile as { verified?: boolean }).verified;
  const initials    = (profile.name || 'É').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const completedTodos   = todos.filter(t => t.completed).length;
  const totalUsageHours  = Math.floor((aiHistory.length * 3 + completedTodos * 5 + recentActivity.length * 2) / 60 * 10) / 10;

  // ── Section 1 : Identité ──────────────────────────────────────────────────
  const [identOpen,    setIdentOpen]   = useState(true);
  const [editName,     setEditName]    = useState(profile.name);
  const [editLevel,    setEditLevel]   = useState<SchoolLevel>(profile.schoolLevel);
  const [editAvatar,   setEditAvatar]  = useState(profile.avatarUrl || '🧑‍🎓');
  const [identSaved,   setIdentSaved]  = useState(false);

  const saveIdentity = async () => {
    if (!editName.trim()) return;
    setProfile(p => ({ ...p, name: editName.trim(), schoolLevel: editLevel, avatarUrl: editAvatar }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          name: editName.trim(), school_level: editLevel, avatar_url: editAvatar,
        }).eq('id', user.id);
      }
    } catch { /* offline — données locales sauvegardées */ }
    setIdentSaved(true);
    toast.success('Profil mis à jour !', { description: 'Nom, niveau et personnage sauvegardés.' });
    setTimeout(() => { if (mountedRef.current) setIdentSaved(false); }, 3000);
  };
  // ── Section 2 : Matières favorites ───────────────────────────────────────
  const [favsOpen, setFavsOpen] = useState(false);

  const toggleFavorite = (subject: Subject) => {
    setProfile(p => ({
      ...p,
      favoriteSubjects: p.favoriteSubjects.includes(subject)
        ? p.favoriteSubjects.filter(s => s !== subject)
        : [...p.favoriteSubjects, subject],
    }));
  };

  // ── Section 3 : Sécurité — Question secrète ───────────────────────────────
  const [secOpen,      setSecOpen]     = useState(false);
  const [secEditing,   setSecEditing]  = useState(false);
  const [secQuestion,  setSecQuestion] = useState(profile.securityQuestion || SECURITY_QUESTIONS[0]);
  const [secAnswer,    setSecAnswer]   = useState('');
  const [secShowAns,   setSecShowAns]  = useState(false);
  const [secSuccess,   setSecSuccess]  = useState(false);
  const [secError,     setSecError]    = useState('');

  const openSecSection = () => {
    // Resynchroniser la question depuis le profil (au cas où la page était déjà ouverte)
    setSecQuestion(profile.securityQuestion || SECURITY_QUESTIONS[0]);
    setSecEditing(false);
    setSecSuccess(false);
    setSecError('');
    setSecOpen(v => !v);
  };
  const saveSecurity = async () => {
    if (!secAnswer.trim()) { setSecError('Veuillez saisir votre réponse secrète.'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          security_question: secQuestion, security_answer: normalizeAnswer(secAnswer),
        }).eq('id', user.id);
      }
    } catch { /* offline */ }
    setProfile(p => ({ ...p, securityQuestion: secQuestion, securityAnswer: normalizeAnswer(secAnswer) }));
    setSecError('');
    setSecSuccess(true);
    toast.success('Question secrète enregistrée !');
    setTimeout(() => { if (mountedRef.current) { setSecSuccess(false); setSecEditing(false); setSecAnswer(''); } }, 2500);
  };

  // ── Section 4 : Carte d'étudiant / Carnet de correspondance ─────────────
  const [cardOpen,       setCardOpen]       = useState(false);
  const [cardEditing,    setCardEditing]    = useState(false);
  const [cardNumber,     setCardNumber]     = useState('');
  const [cardSchool,     setCardSchool]     = useState('');
  const [cardYear,       setCardYear]       = useState('');
  const [cardSaved,      setCardSaved]      = useState(false);

  // Charger les données carte depuis Supabase au montage
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles')
          .select('student_card_number, student_card_school, student_card_year')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          if (data.student_card_number) setCardNumber(data.student_card_number as string);
          if (data.student_card_school) setCardSchool(data.student_card_school as string);
          if (data.student_card_year)   setCardYear(data.student_card_year as string);
        }
      } catch { /* offline */ }
    })();
  }, []);

  const hasCard = !!(cardNumber || cardSchool);

  const saveCard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          student_card_number: cardNumber.trim(),
          student_card_school: cardSchool.trim(),
          student_card_year:   cardYear.trim(),
        }).eq('id', user.id);
      }
    } catch { /* offline */ }
    setCardSaved(true);
    setCardEditing(false);
    toast.success('Carte étudiant sauvegardée !');
    setTimeout(() => { if (mountedRef.current) setCardSaved(false); }, 3000);
  };

  // ── Section 5 : Code parental ─────────────────────────────────────────────
  const [parentalOpen, setParentalOpen] = useState(false);
  const [parentalCode, setParentalCode] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem('ep_parental_code');
      return raw ? (JSON.parse(raw) as { code: string }).code : null;
    } catch { return null; }
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const generateParentalCode = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const code = String(100000 + (arr[0] % 900000));
    localStorage.setItem('ep_parental_code', JSON.stringify({ code, createdAt: new Date().toISOString() }));
    setParentalCode(code);
  };
  const revokeParentalCode  = () => { localStorage.removeItem('ep_parental_code'); setParentalCode(null); };
  const copyParentalCode    = async () => {
    if (!parentalCode) return;
    try { await navigator.clipboard.writeText(parentalCode); setCopySuccess(true); setTimeout(() => { if (mountedRef.current) setCopySuccess(false); }, 2000); } catch { /* fallback */ }
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-w-0 px-4 md:px-6 py-6 max-w-2xl mx-auto space-y-4">
      <SEO
        title="Mon profil | Apprenix"
        description="Gérez votre profil étudiant, vos matières préférées, la sécurité et vos paramètres."
        canonical="/espace/profil"
        keywords="profil étudiant apprenix, paramètres, niveau scolaire, matières"
        dateModified="2026-06-18"
      />

      {/* ── Carte profil — toujours visible ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 shadow-xl shadow-primary/20">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/[0.07] pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar — grand et visible */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl md:text-4xl shrink-0 shadow-lg select-none">
            {profile.avatarUrl || initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-lg md:text-xl text-white text-balance leading-tight">{profile.name}</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 bg-success/20 border border-success/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Vérifié
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm mt-0.5">
              {profile.schoolLevel}
              {' · '}<span className="font-bold text-white">{profile.xpPoints} XP</span>
              {profile.streakDays > 0 && <> · {profile.streakDays}j 🔥</>}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.favoriteSubjects.slice(0, 3).map(s => (
                <Badge key={s} className="bg-white/20 text-white border-white/25 text-[11px]">{s}</Badge>
              ))}
              {profile.favoriteSubjects.length > 3 && (
                <Badge className="bg-white/15 text-white/60 border-white/20 text-[11px]">+{profile.favoriteSubjects.length - 3}</Badge>
              )}
            </div>
          </div>
        </div>
        {/* Stats mini */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-4">
          {[
            { value: `${totalUsageHours}h`, label: 'Utilisation' },
            { value: completedTodos,        label: 'Tâches faites' },
            { value: aiHistory.length,      label: 'Sessions IA' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-center">
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════ SECTION 1 — Identité & Avatar ═══════════════════════════════════ */}
      <Card className="shadow-card">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setIdentOpen(v => !v)}
          aria-expanded={identOpen}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none">🎭</span> Identité &amp; Avatar
              </span>
              <span className="flex items-center gap-2">
                <SaveBadge show={identSaved} />
                {identOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </span>
            </CardTitle>
          </CardHeader>
        </button>

        {identOpen && (
          <CardContent className="pt-0 space-y-5">
            {/* Prénom */}
            <div>
              <Label htmlFor="edit-name" className="text-sm font-normal text-muted-foreground mb-1.5 block">
                Prénom affiché
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-10 text-base"
                placeholder="Votre prénom"
              />
            </div>

            {/* Niveau scolaire */}
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-1.5 block">
                Niveau scolaire
              </Label>
              <Select value={editLevel} onValueChange={v => setEditLevel(v as SchoolLevel)}>
                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVEL_GROUPS.map(({ label, levels }) => (
                    <div key={label}>
                      <div className="px-2 pt-2 pb-0.5">
                        <span className="text-xs font-bold text-muted-foreground select-none">{label}</span>
                      </div>
                      {levels.map(l => (
                        <SelectItem key={l} value={l} className="pl-5 text-sm">{l}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Choix d'avatar — TOUJOURS VISIBLE */}
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-2 block">
                Choisir un personnage
              </Label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setEditAvatar(av)}
                    className={[
                      'w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all duration-150',
                      editAvatar === av
                        ? 'ring-2 ring-primary bg-primary/10 scale-110 shadow-md'
                        : 'bg-secondary hover:bg-muted hover:scale-105',
                    ].join(' ')}
                    aria-label={`Personnage ${av}`}
                    aria-pressed={editAvatar === av}
                  >
                    {av}
                  </button>
                ))}
              </div>
              {/* Aperçu du personnage sélectionné */}
              <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                  {editAvatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{editName || profile.name}</p>
                  <p className="text-xs text-muted-foreground">{editLevel} · {profile.xpPoints} XP</p>
                </div>
              </div>
            </div>

            {/* Bouton Sauvegarder */}
            <Button
              onClick={saveIdentity}
              disabled={!editName.trim()}
              className="w-full h-10 gap-2"
            >
              <Save className="w-4 h-4" /> Sauvegarder les modifications
            </Button>
          </CardContent>
        )}
      </Card>

      {/* ════ SECTION 2 — Matières favorites ═════════════════════════════════ */}
      <Card className="shadow-card">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setFavsOpen(v => !v)}
          aria-expanded={favsOpen}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-chart-4" />
                Matières favorites
                {profile.favoriteSubjects.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({profile.favoriteSubjects.length} sélectionnée{profile.favoriteSubjects.length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
              {favsOpen
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
        </button>

        {favsOpen && (
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-muted-foreground">
              Touchez une matière pour l'ajouter ou la retirer.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subject => {
                const isFav = profile.favoriteSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleFavorite(subject)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                      isFav
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-muted-foreground hover:bg-muted',
                    ].join(' ')}
                    aria-pressed={isFav}
                  >
                    {isFav && '★ '}{subject}
                  </button>
                );
              })}
            </div>
            {profile.favoriteSubjects.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Aucune matière sélectionnée.</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* ════ SECTION 3 — Sécurité : Question secrète ════════════════════════ */}
      <Card className="shadow-card">
        <button
          type="button"
          className="w-full text-left"
          onClick={openSecSection}
          aria-expanded={secOpen}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <ShieldQuestion className="w-4 h-4 text-primary" />
                Question secrète
                {profile.securityQuestion
                  ? <span className="text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Configurée</span>
                  : <span className="text-[10px] font-semibold text-chart-4 bg-chart-4/10 border border-chart-4/20 px-1.5 py-0.5 rounded-full">Non configurée</span>
                }
              </span>
              {secOpen
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
        </button>

        {secOpen && (
          <CardContent className="pt-0 space-y-3">
            {secSuccess && (
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <p className="text-sm text-success font-medium">Question secrète enregistrée !</p>
              </div>
            )}

            {!secEditing ? (
              profile.securityQuestion ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-xs text-muted-foreground mb-1">Votre question :</p>
                    <p className="text-sm text-foreground font-medium text-pretty">{profile.securityQuestion}</p>
                  </div>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => {
                      setSecQuestion(profile.securityQuestion || SECURITY_QUESTIONS[0]);
                      setSecEditing(true); setSecSuccess(false); setSecError('');
                    }}
                    className="h-9 text-xs gap-1.5"
                  >
                    Modifier la question secrète
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-chart-4/5 border border-chart-4/20">
                    <p className="text-sm text-muted-foreground text-pretty">
                      Sans question secrète, vous ne pourrez pas récupérer votre compte en cas d'oubli de mot de passe.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => { setSecEditing(true); setSecSuccess(false); setSecError(''); }}
                    className="h-9 text-xs gap-1.5 w-full"
                  >
                    Configurer maintenant
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {secError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{secError}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-normal text-muted-foreground mb-1 block">
                    Choisissez votre question
                  </Label>
                  <Select value={secQuestion} onValueChange={setSecQuestion}>
                    <SelectTrigger className="h-auto text-xs min-h-[2.75rem] py-2 px-3">
                      <span className="block w-full text-left break-words whitespace-normal leading-snug line-clamp-3 pr-1">
                        {secQuestion}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[min(calc(100vw-2rem),26rem)]" position="popper" sideOffset={4}>
                      {SECURITY_QUESTIONS.map(q => (
                        <SelectItem key={q} value={q} className="text-xs py-2.5 px-3 whitespace-normal break-words leading-snug cursor-pointer">
                          <span className="block w-full min-w-0">{q}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profil-sec-answer" className="text-xs font-normal text-muted-foreground mb-1 block">
                    Votre réponse secrète
                  </Label>
                  <div className="relative">
                    <Input
                      id="profil-sec-answer"
                      type={secShowAns ? 'text' : 'password'}
                      value={secAnswer}
                      onChange={e => setSecAnswer(e.target.value)}
                      className="h-10 text-sm pr-9"
                      autoComplete="off"
                      placeholder="Votre réponse…"
                    />
                    <button
                      type="button"
                      aria-label={secShowAns ? 'Masquer la réponse' : 'Afficher la réponse'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSecShowAns(v => !v)}
                    >
                      {secShowAns ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">La réponse n'est pas sensible à la casse.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveSecurity} className="h-9 text-xs flex-1 gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Enregistrer
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => { setSecEditing(false); setSecError(''); setSecAnswer(''); }}
                    className="h-9 w-9 p-0"
                    aria-label="Annuler"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ════ SECTION 4 — Carte d'étudiant / Carnet de correspondance ════════ */}
      <Card className="shadow-card">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setCardOpen(v => !v)}
          aria-expanded={cardOpen}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-chart-2" />
                Carte &amp; Carnet de correspondance
                {hasCard
                  ? <span className="text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Renseigné</span>
                  : <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">Non renseigné</span>
                }
              </span>
              <span className="flex items-center gap-2">
                {cardSaved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success animate-in fade-in duration-300">
                    <CheckCircle className="w-3.5 h-3.5" /> Sauvegardé
                  </span>
                )}
                {cardOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </span>
            </CardTitle>
          </CardHeader>
        </button>

        {cardOpen && (
          <CardContent className="pt-0 space-y-4">
            <p className="text-xs text-muted-foreground text-pretty">
              Renseignez les informations de votre carte d'étudiant ou carnet de correspondance
              donné par votre établissement scolaire.
            </p>

            {/* Aperçu carte — visible quand renseigné et pas en édition */}
            {hasCard && !cardEditing ? (
              <div className="space-y-3">
                {/* Carte visuelle */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-chart-2/80 to-chart-2 p-4 shadow-md">
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.07] pointer-events-none" />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">Carte d'étudiant</p>
                      <p className="text-base font-bold text-white truncate">{profile.name}</p>
                      {cardSchool && (
                        <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1 truncate">
                          <School className="w-3 h-3 shrink-0" /> {cardSchool}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {cardNumber && (
                          <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg">
                            <Hash className="w-3 h-3" />{cardNumber}
                          </span>
                        )}
                        {cardYear && (
                          <span className="text-[11px] text-white/70 font-medium">
                            Année {cardYear}
                          </span>
                        )}
                        <span className="text-[11px] text-white/70 font-medium">
                          {profile.schoolLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm" variant="outline"
                  onClick={() => setCardEditing(true)}
                  className="h-9 text-xs gap-1.5"
                >
                  Modifier les informations
                </Button>
              </div>
            ) : cardEditing || !hasCard ? (
              <div className="space-y-3">
                {/* Numéro de carte */}
                <div>
                  <label htmlFor="card-number" className="text-xs font-normal text-muted-foreground mb-1 block">
                    Numéro de carte / identifiant élève
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      id="card-number"
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="Ex : 202400123"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      autoComplete="off"
                    />
                  </div>
                </div>
                {/* Nom de l'établissement */}
                <div>
                  <label htmlFor="card-school" className="text-xs font-normal text-muted-foreground mb-1 block">
                    Nom de l'établissement
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      id="card-school"
                      type="text"
                      value={cardSchool}
                      onChange={e => setCardSchool(e.target.value)}
                      placeholder="Ex : Lycée Victor Hugo, Paris"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                {/* Année scolaire */}
                <div>
                  <label htmlFor="card-year" className="text-xs font-normal text-muted-foreground mb-1 block">
                    Année scolaire
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      id="card-year"
                      type="text"
                      value={cardYear}
                      onChange={e => setCardYear(e.target.value)}
                      placeholder="Ex : 2025-2026"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveCard}
                    disabled={!cardNumber.trim() && !cardSchool.trim()}
                    className="h-9 text-xs flex-1 gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Enregistrer
                  </Button>
                  {hasCard && (
                    <Button
                      size="sm" variant="outline"
                      onClick={() => setCardEditing(false)}
                      className="h-9 w-9 p-0"
                      aria-label="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        )}
      </Card>

      {/* ════ SECTION 5 — Code parental ══════════════════════════════════════ */}
      <Card className="shadow-card">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setParentalOpen(v => !v)}
          aria-expanded={parentalOpen}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Code parental
                {parentalCode
                  ? <span className="text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Actif</span>
                  : <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">Inactif</span>
                }
              </span>
              {parentalOpen
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
        </button>

        {parentalOpen && (
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-muted-foreground text-pretty">
              Générez un code à 6 chiffres pour que vos parents consultent votre progression —{' '}
              <strong className="text-foreground">sur cet appareil uniquement</strong>.{' '}
              <Link to="/parents-espace" className="text-primary hover:underline text-xs">Espace parents →</Link>
            </p>

            {parentalCode ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Code parental actif</p>
                  <p className="text-4xl font-black tracking-[0.3em] text-primary font-mono">{parentalCode}</p>
                  <p className="text-xs text-muted-foreground">Partagez ce code avec vos parents.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-9 text-xs flex-1 gap-1.5" onClick={copyParentalCode}>
                    {copySuccess
                      ? <><CheckCircle className="w-3.5 h-3.5 text-success" /> Copié !</>
                      : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                  </Button>
                  <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={generateParentalCode} title="Nouveau code" aria-label="Générer un nouveau code">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-9 w-9 p-0 text-destructive hover:text-destructive" onClick={revokeParentalCode} title="Révoquer le code" aria-label="Révoquer le code parental">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" className="w-full h-10 gap-2" onClick={generateParentalCode}>
                <Shield className="w-4 h-4" /> Générer un code parental
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* ════ SECTION 6 — Paramètres ═════════════════════════════════════════ */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" /> Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {[
            {
              id: 'dark-mode',
              label: 'Mode sombre',
              desc: 'Basculer entre le thème clair et sombre',
              checked: isDark,
              onChange: toggleTheme,
            },
            {
              id: 'notifs',
              label: 'Notifications',
              desc: 'Rappels de révision et de défis',
              checked: true,
              onChange: () => {},
            },
            {
              id: 'pomodoro-sound',
              label: 'Sons du Pomodoro',
              desc: 'Bip de fin de session',
              checked: true,
              onChange: () => {},
            },
          ].map(({ id, label, desc, checked, onChange }) => (
            <div key={id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground text-pretty">{desc}</p>
              </div>
              <Switch id={id} checked={checked} onCheckedChange={onChange} className="shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EtudiantProfilPage;
