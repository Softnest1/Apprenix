import { AlertCircle, CheckCircle, CheckSquare, Clock, Copy, Edit3, Eye, EyeOff, History, RefreshCw, Save, Settings, Shield, ShieldQuestion, Star, Trash2, User, Wrench } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

// Groupes pour le sélecteur — organisés par cycle, sans doublon
const LEVEL_GROUPS_PROFIL: { label: string; levels: SchoolLevel[] }[] = [
  { label: '🏫 École primaire', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { label: '📚 Collège',        levels: ['6e', '5e', '4e', '3e'] },
  { label: '🎓 Lycée',          levels: ['2nde', '1ère', 'Terminale'] },
  { label: '🏛️ Supérieur',      levels: ['BTS', 'Licence', 'Master', 'Grandes Écoles'] },
  { label: '💚 ULIS & SEGPA',   levels: ['ULIS', 'SEGPA'] },
];
const AVATARS = ['👦', '👧', '🧑', '👩', '👨', '🧑‍🎓', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💻', '🦊', '🐼', '🦁', '🐺', '🐸'];

const SECURITY_QUESTIONS = [
  'Quel était le surnom affectueux que vous donniez à votre meilleur(e) ami(e) d\'enfance ?',
  'Quel est le plat ou le dessert que votre famille prépare uniquement pour les grandes occasions ?',
  'Quel personnage de fiction vous a le plus marqué(e) et pourquoi ?',
  'Dans quelle ville imaginaire ou réelle rêveriez-vous de vous réveiller un matin ?',
  'Quel est le titre du premier livre, manga ou comic qui vous a vraiment passionné(e) ?',
  'Quel talent ou passe-temps secret peu de personnes autour de vous connaissent ?',
  'Quel objet insolite possédez-vous et auquel vous tenez particulièrement ?',
  'Quelle est la chanson qui vous ramène immédiatement à un souvenir précis de votre enfance ?',
  'Quel est le nom de votre animal imaginaire ou réel préféré que vous auriez aimé avoir ?',
  'Si vous pouviez maîtriser une compétence instantanément, laquelle choisiriez-vous ?',
];

const ProfilPage: React.FC = () => {
  const { profile, setProfile, isDark, toggleTheme, todos, aiHistory, recentActivity } = useApp();
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editLevel, setEditLevel] = useState<SchoolLevel>(profile.schoolLevel);
  const [editAvatar, setEditAvatar] = useState(profile.avatarUrl || '🧑‍🎓');

  // Question secrète
  const [secEditing, setSecEditing]     = useState(false);
  const [secQuestion, setSecQuestion]   = useState(profile.securityQuestion ?? SECURITY_QUESTIONS[0]);
  const [secAnswer, setSecAnswer]       = useState('');
  const [secShowAns, setSecShowAns]     = useState(false);
  const [secSuccess, setSecSuccess]     = useState(false);
  const [secError, setSecError]         = useState('');

  // ── Mode Parents ──────────────────────────────────────────────────────────
  const [parentalCode, setParentalCode] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem('ep_parental_code');
      return raw ? (JSON.parse(raw) as { code: string }).code : null;
    } catch { return null; }
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const generateParentalCode = () => {
    // crypto.getRandomValues — génération cryptographiquement sûre (CSPRNG)
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = String(100000 + (array[0] % 900000));
    localStorage.setItem('ep_parental_code', JSON.stringify({ code, createdAt: new Date().toISOString() }));
    setParentalCode(code);
  };

  const revokeParentalCode = () => {
    localStorage.removeItem('ep_parental_code');
    setParentalCode(null);
  };

  const copyParentalCode = async () => {
    if (!parentalCode) return;
    try {
      await navigator.clipboard.writeText(parentalCode);
      setCopySuccess(true);
      setTimeout(() => { if (mountedRef.current) setCopySuccess(false); }, 2000);
    } catch {
      // fallback silencieux
    }
  };

  const toggleFavorite = (subject: Subject) => {
    setProfile(p => ({
      ...p,
      favoriteSubjects: p.favoriteSubjects.includes(subject)
        ? p.favoriteSubjects.filter(s => s !== subject)
        : [...p.favoriteSubjects, subject] }));
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setProfile(p => ({ ...p, name: editName.trim(), schoolLevel: editLevel, avatarUrl: editAvatar }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        name: editName.trim(),
        school_level: editLevel,
        avatar_url: editAvatar }).eq('id', user.id);
    }
    if (mountedRef.current) setEditing(false);
  };

  // Mettre à jour la question/réponse dans Supabase
  const saveSecurity = async () => {
    if (!secAnswer.trim()) { setSecError('Veuillez saisir votre réponse secrète.'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        security_question: secQuestion,
        security_answer: normalizeAnswer(secAnswer) }).eq('id', user.id);
    }
    if (!mountedRef.current) return;
    setProfile(p => ({
      ...p,
      securityQuestion: secQuestion,
      securityAnswer: normalizeAnswer(secAnswer) }));
    setSecError('');
    setSecSuccess(true);
    setTimeout(() => { if (mountedRef.current) { setSecSuccess(false); setSecEditing(false); setSecAnswer(''); } }, 2500);
  };

  const startEditing = () => {
    // Re-synchroniser les champs avec les valeurs actuelles du profil
    setEditName(profile.name);
    setEditLevel(profile.schoolLevel);
    setEditAvatar(profile.avatarUrl || '🧑‍🎓');
    setEditing(true);
  };

  const completedTodos = todos.filter(t => t.completed).length;
  const totalUsageHours = Math.floor((aiHistory.length * 3 + completedTodos * 5 + recentActivity.length * 2) / 60 * 10) / 10;

  return (
    <div className="min-w-0 space-y-6">
    <h1 className="sr-only">Mon profil Apprenix</h1>
      <SEO
        title="Mon Profil — Paramètres & Sécurité | Apprenix"
        description="Gérez votre profil Apprenix : identité, niveau scolaire, question secrète, code parental et réglages."
        canonical="/profil"
        noIndex={true}
        dateModified="2026-06-24"
      />

      {/* ── Fil d'orientation ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/espace" className="hover:text-primary transition-colors font-medium">Mon Espace</Link>
        <span>›</span>
        <span className="text-foreground font-semibold">Mon Profil</span>
      </div>

      {/* ── En-tête profil ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-5 md:p-6 shadow-xl shadow-primary/20">
        {/* Cercles décoratifs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/[0.08] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 right-16 w-12 h-12 rounded-full bg-white/[0.06] pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-4 w-full min-w-0">
          <Avatar className="w-16 h-16 border-2 border-white/30 shrink-0 shadow-lg">
            <AvatarFallback className="text-2xl bg-white/20 text-white">{profile.avatarUrl || '🧑‍🎓'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-lg text-white truncate text-balance leading-tight">{profile.name}</h2>
            <p className="text-white/75 text-sm mt-0.5">
              {profile.schoolLevel} · <span className="text-white font-semibold">{profile.xpPoints} XP</span> · {profile.streakDays} jour{profile.streakDays !== 1 ? 's' : ''} de suite 🔥
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.favoriteSubjects.slice(0, 3).map(s => (
                <Badge key={s} className="bg-white/20 text-white border-white/25 text-xs font-semibold">{s}</Badge>
              ))}
              {profile.favoriteSubjects.length > 3 && (
                <Badge className="bg-white/15 text-white/70 border-white/20 text-xs">+{profile.favoriteSubjects.length - 3}</Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => editing ? saveProfile() : startEditing()}
            className={`h-9 text-xs shrink-0 ${editing ? 'bg-white text-primary hover:bg-white/90 font-bold' : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'}`}
          >
            {editing ? <><Save className="w-3.5 h-3.5 mr-1" /> Sauvegarder</> : <><Edit3 className="w-3.5 h-3.5 mr-1" /> Modifier</>}
          </Button>
        </div>
      </div>

      {/* Formulaire d'édition — affiché seulement en mode édition */}
      {editing && (
        <Card className="shadow-card border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Modifier mon profil</p>
            </div>
            {/* Nom */}
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-1 block">Prénom affiché</Label>
              <Input
                aria-label="Modifier votre nom"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-10 text-base"
                placeholder="Votre prénom"
              />
            </div>
            {/* Niveau scolaire */}
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-1 block">Niveau scolaire</Label>
              <Select value={editLevel} onValueChange={v => setEditLevel(v as SchoolLevel)}>
                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVEL_GROUPS_PROFIL.map(({ label, levels }) => (
                    <div key={label}>
                      <div className="px-2 pt-2 pb-0.5">
                        <span className="text-xs font-bold text-muted-foreground select-none">{label}</span>
                      </div>
                      {levels.map(l => <SelectItem key={l} value={l} className="pl-5 text-sm">{l}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Avatar */}
            <div>
              <Label className="text-sm font-normal text-muted-foreground mb-2 block">Choisir un avatar</Label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(av => (
                  <button type="button" key={av} onClick={() => setEditAvatar(av)}
                    className={`w-10 h-10 rounded-full text-2xl flex items-center justify-center transition-[background-color,border-color,color,box-shadow,transform] ${editAvatar === av ? 'ring-2 ring-primary bg-primary/10 scale-110' : 'bg-secondary hover:bg-muted'}`}
                  >{av}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveProfile} className="h-9 text-xs flex-1 bg-primary text-primary-foreground">
                <Save className="w-3.5 h-3.5 mr-1" /> Sauvegarder
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-9 text-xs">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matières favorites */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-chart-4" /> Matières favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-base text-muted-foreground mb-3">Cliquez sur une matière pour l'ajouter ou la retirer</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subject => {
              const isFav = profile.favoriteSubjects.includes(subject);
              return (
                <button type="button"
                  key={subject}
                  onClick={() => toggleFavorite(subject)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] ${
                    isFav
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {isFav && '★ '}{subject}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card h-full">
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <Clock className="w-8 h-8 text-chart-3" />
            <span className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground">{totalUsageHours}h</span>
            <span className="text-sm text-muted-foreground leading-relaxed text-pretty">Temps total d'utilisation estimé</span>
          </CardContent>
        </Card>
        <Card className="shadow-card h-full">
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <Wrench className="w-8 h-8 text-chart-1" />
            <span className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground">{aiHistory.length + Math.min(recentActivity.length, 20)}</span>
            <span className="text-sm text-muted-foreground leading-relaxed text-pretty">Outils utilisés</span>
          </CardContent>
        </Card>
        <Card className="shadow-card h-full">
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <CheckSquare className="w-8 h-8 text-chart-2" />
            <span className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground">{completedTodos}</span>
            <span className="text-sm text-muted-foreground leading-relaxed text-pretty">Tâches complétées</span>
          </CardContent>
        </Card>
      </div>

      {/* Historique activités */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" /> Historique des activités (20 dernières)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
          ) : (
            <div className="space-y-1.5">
              {recentActivity.slice(0, 20).map((act, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-sm text-foreground text-pretty">{act}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question secrète de récupération */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldQuestion className="w-4 h-4 text-primary" /> Question secrète de récupération
            </CardTitle>
            {!secEditing && (
              <Button size="sm" variant="outline" onClick={() => { setSecEditing(true); setSecSuccess(false); setSecError(''); }} className="h-9 text-xs">
                <Edit3 className="w-3.5 h-3.5 mr-1" /> {profile.securityQuestion ? 'Modifier' : 'Configurer'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {secSuccess && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <p className="text-sm text-success">Question secrète enregistrée !</p>
            </div>
          )}
          {!secEditing ? (
            profile.securityQuestion ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <p className="text-sm text-muted-foreground mb-1">Votre question actuelle :</p>
                  <p className="text-sm text-foreground font-medium text-pretty">{profile.securityQuestion}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  ✓ Question configurée — vous pouvez récupérer votre accès sans email depuis la page <strong>Récupération</strong>.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-chart-4/5 border border-chart-4/20">
                <p className="text-sm text-muted-foreground text-pretty">
                  ⚠️ Aucune question secrète configurée. En cas d'oubli de votre mot de passe ou email, vous ne pourrez pas récupérer votre compte. Configurez-en une maintenant.
                </p>
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
                <Label className="text-xs font-normal text-muted-foreground mb-1 block">Choisissez votre question</Label>
                <Select value={secQuestion} onValueChange={setSecQuestion}>
                  <SelectTrigger className="h-auto text-xs min-h-[2.75rem] py-2 px-3 whitespace-normal text-left">
                    <span className="block w-full min-w-0 text-left break-words whitespace-normal leading-snug line-clamp-3 pr-1">
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
                <Label htmlFor="profil-sec-answer" className="text-xs font-normal text-muted-foreground mb-1 block">Votre réponse secrète</Label>
                <div className="relative">
                  <Input
                    id="profil-sec-answer"
                    type={secShowAns ? 'text' : 'password'}
                    value={secAnswer}
                    onChange={e => setSecAnswer(e.target.value)}
                    placeholder="Saisissez votre réponse unique…"
                    className="h-10 text-sm pr-9"
                    autoComplete="off"
                  />
                  <button type="button"
                    aria-label={secShowAns ? 'Masquer' : 'Afficher'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSecShowAns(v => !v)}
                  >
                    {secShowAns ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">La réponse n'est pas sensible à la casse.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveSecurity} className="h-9 text-xs bg-primary text-primary-foreground flex-1">
                  <Save className="w-3.5 h-3.5 mr-1" /> Enregistrer
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setSecEditing(false); setSecError(''); setSecAnswer(''); }} className="h-9 text-xs">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mode Parents ─────────────────────────────────────────────── */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Mode Parents
            </CardTitle>
            <Link to="/parents-espace" className="text-xs text-primary hover:underline shrink-0">
              Ouvrir l'espace parents →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground text-pretty">
            Générez un code à 6 chiffres pour permettre à vos parents de consulter votre progression
            depuis l'espace parents — <strong className="text-foreground">sur cet appareil uniquement</strong>.
          </p>

          {parentalCode ? (
            <div className="space-y-3">
              {/* Affichage du code */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Code parental actif</p>
                <p className="text-4xl font-black tracking-[0.3em] text-primary font-mono">{parentalCode}</p>
                <p className="text-sm text-muted-foreground">Partagez ce code avec vos parents.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs flex-1 gap-1.5"
                  onClick={copyParentalCode}
                >
                  {copySuccess
                    ? <><CheckCircle className="w-3.5 h-3.5 text-success" />Copié !</>
                    : <><Copy className="w-3.5 h-3.5" />Copier le code</>
                  }
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs gap-1.5"
                  onClick={generateParentalCode}
                  title="Générer un nouveau code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs gap-1.5 text-destructive hover:text-destructive"
                  onClick={revokeParentalCode}
                  title="Révoquer le code"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center">
                <Shield className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun code parental actif.</p>
              </div>
              <Button size="sm" className="w-full h-9 text-xs gap-1.5" onClick={generateParentalCode}>
                <Shield className="w-3.5 h-3.5" />
                Générer un code parental
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paramètres */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" /> Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Mode sombre</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Basculer entre le thème clair et sombre</p>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Rappels de révision et de défis</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sons du Pomodoro</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Bip de fin de session</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilPage;
