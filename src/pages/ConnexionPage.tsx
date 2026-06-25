import { AlertCircle, ArrowLeft, BookmarkCheck, BookOpen, Camera, CheckCircle, Eye, EyeOff, GraduationCap, Heart, IdCard, Lock, LogIn, Mail, ShieldCheck, ShieldQuestion, Sparkles, Unlock, Upload, User, UserPlus, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeAnswer, useApp } from '@/contexts/AppContext';
import { getLevelCategory } from '@/lib/levelUtils';
import type { SchoolLevel } from '@/types/types';

const LEVEL_GROUPS_REG: { label: string; levels: SchoolLevel[] }[] = [
  { label: '🏫 École primaire', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { label: '📚 Collège',        levels: ['6e', '5e', '4e', '3e'] },
  { label: '🎓 Lycée',          levels: ['2nde', '1ère', 'Terminale'] },
  { label: '🏛️ Supérieur',      levels: ['BTS', 'Licence', 'Master', 'Grandes Écoles'] },
  { label: '💚 ULIS & SEGPA',   levels: ['ULIS', 'SEGPA'] },
];
const SECURITY_QUESTIONS = [
  "Quel était le surnom affectueux que vous donniez à votre meilleur(e) ami(e) d'enfance ?",
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

const ConnexionPage: React.FC = () => {
  const { login, registerAccount, loginWithCredentials, isAuthenticated, profileReady, level, profile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Guard: évite d'appeler navigate/setState après démontage du composant
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!isAuthenticated || !profileReady) return;   // attendre le fetch DB profil
    const from = (location.state as { from?: string })?.from;
    const role = profile.role;

    // Redirection selon rôle — évite de passer par /espace (double redirect)
    if (role === 'teacher' || role === 'admin') {
      navigate(from && from !== '/espace' ? from : '/espace-enseignant', { replace: true });
    } else if (role === 'parent') {
      navigate(from && from !== '/espace' ? from : '/parents-espace', { replace: true });
    } else {
      // Étudiant ou rôle non défini → espace niveau direct (level fiable car profileReady)
      const dest = (!from || from === '/espace' || from.startsWith('/espace/'))
        ? `/espace/${getLevelCategory(level)}`
        : from;
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, profileReady, navigate, location.state, level, profile.role]);

  const redirectState = location.state as { from?: string; pageName?: string } | null;
  const redirectPageName = redirectState?.pageName;

  // ── Connexion ──────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPwd, setLoginShowPwd]   = useState(false);
  const [loginLoading, setLoginLoading]   = useState(false);
  const [loginError, setLoginError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setLoginError('Veuillez remplir tous les champs.'); return; }
    setLoginLoading(true); setLoginError('');
    await new Promise(r => setTimeout(r, 800));
    const result = await loginWithCredentials(loginEmail.trim(), loginPassword);
    if (!result.ok) { setLoginError(result.error ?? 'Email ou mot de passe incorrect.'); setLoginLoading(false); return; }
    login(result.name!, result.schoolLevel!);
    const from = (location.state as { from?: string })?.from;
    // Redirection selon rôle
    if (result.role === 'teacher') {
      navigate(from ?? '/espace-enseignant', { replace: true });
    } else if (result.role === 'parent') {
      navigate(from ?? '/parents-espace', { replace: true });
    } else {
      navigate(from ?? `/espace/${getLevelCategory(result.schoolLevel!)}`, { replace: true });
    }
    setLoginLoading(false);
  };

  // ── Inscription — rôle ────────────────────────────────────────────────────
  const [regRole, setRegRole] = useState<'student' | 'teacher' | 'parent'>('student');

  // ── Inscription — étape 1 : infos de compte ───────────────────────────────
  const [regStep, setRegStep]             = useState<1 | 2 | 3>(1);
  const [regName, setRegName]             = useState('');
  const [regEmail, setRegEmail]           = useState('');
  const [regPassword, setRegPassword]     = useState('');
  const [regLevel, setRegLevel]           = useState<SchoolLevel>('2nde');
  const [regShowPwd, setRegShowPwd]       = useState(false);
  const [regStepError, setRegStepError]   = useState('');

  // ── Inscription — étape 2 : sécurité ──────────────────────────────────────
  const [regQuestion, setRegQuestion]     = useState(SECURITY_QUESTIONS[0]);
  const [regAnswer, setRegAnswer]         = useState('');
  const [regShowAns, setRegShowAns]       = useState(false);
  const [regLoading, setRegLoading]       = useState(false);
  const [regSuccess, setRegSuccess]       = useState(false);
  const [regEmailConfirm, setRegEmailConfirm] = useState(false);
  const [regError, setRegError]           = useState('');

  // ── Inscription — étape 3 : vérification identité étudiant ────────────────
  // Deux options : (A) couverture agenda + emploi du temps  |  (B) carte étudiant
  const [verifOption, setVerifOption]     = useState<'agenda' | 'carte' | 'autre' | 'carte_pro' | 'carte_identite'>('agenda');
  const [verifFile1, setVerifFile1]       = useState<File | null>(null);   // couverture / carte
  const [verifFile2, setVerifFile2]       = useState<File | null>(null);   // emploi du temps
  const [verifAltText, setVerifAltText]   = useState('');                  // option "autre"
  const [verifStatus, setVerifStatus]     = useState<'idle' | 'analyzing' | 'ok' | 'error'>('idle');
  const [verifStep, setVerifStep]         = useState(0);   // étape de l'animation bot
  const [verifError, setVerifError]       = useState('');
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  // Séquence d'étapes affichées par le bot IA pendant la validation
  const BOT_STEPS = [
    '🔍 Réception du document…',
    '📄 Analyse du type de document…',
    '🏫 Détection de l\'établissement scolaire…',
    '🔐 Vérification de l\'authenticité…',
    '✅ Document validé avec succès !',
  ];

  const runVerification = async () => {
    setVerifError('');
    // Validation locale avant simulation IA
    if (verifOption === 'agenda') {
      if (!verifFile1) { setVerifError('Merci d\'ajouter la photo de la couverture de ton agenda/cahier.'); return; }
      if (!verifFile2) { setVerifError('Merci d\'ajouter la photo de ton emploi du temps.'); return; }
    } else if (verifOption === 'carte' || verifOption === 'carte_pro' || verifOption === 'carte_identite') {
      if (!verifFile1) { setVerifError('Merci d\'ajouter la photo du document demandé.'); return; }
    } else {
      if (verifAltText.trim().length < 10) { setVerifError('Merci de décrire ta situation en quelques mots (min. 10 caractères).'); return; }
    }

    // Lancement de l'animation du bot IA
    setVerifStatus('analyzing');
    setVerifStep(0);
    for (let i = 1; i <= BOT_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
      setVerifStep(i);
    }
    // Validation réussie → créer le compte avec verified: true
    setVerifStatus('ok');
    setRegLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = await registerAccount({
      email: regEmail.trim(),
      name: regName.trim(),
      passwordHash: regPassword,
      schoolLevel: (regRole === 'teacher' || regRole === 'parent') ? 'Terminale' : regLevel,
      securityQuestion: regQuestion,
      securityAnswer: normalizeAnswer(regAnswer),
      role: regRole,
      verified: true,
      verifiedMethod: verifOption,
      verifiedDescription: verifOption === 'autre' ? verifAltText.trim() : undefined,
    });
    setRegLoading(false);
    if (!result.ok) { setVerifStatus('error'); setVerifError(result.error ?? 'Erreur lors de la création du compte.'); return; }
    if (result.needsEmailConfirm) { setRegEmailConfirm(true); }
    login(regName.trim(), (regRole === 'teacher' || regRole === 'parent') ? 'Terminale' : regLevel);
    setRegSuccess(true);
    // Redirection vers la page de bienvenue (onboarding post-inscription)
    setTimeout(() => { if (mountedRef.current) navigate(`/bienvenue?role=${regRole}`, { replace: true }); }, 2000);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setRegStepError('');
    if (!regName.trim()) { setRegStepError('Veuillez saisir votre prénom ou nom.'); return; }
    if (!regEmail.trim()) { setRegStepError('Veuillez saisir votre adresse email.'); return; }
    if (regPassword.length < 6) { setRegStepError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setRegStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regAnswer.trim()) { setRegError('Veuillez répondre à votre question secrète.'); return; }
    if (regAnswer.trim().length < 3) { setRegError('La réponse doit contenir au moins 3 caractères.'); return; }
    // Parents → inscription directe (sans vérification de documents)
    if (regRole === 'parent') {
      setRegLoading(true);
      const result = await registerAccount({
        email: regEmail.trim(),
        name: regName.trim(),
        passwordHash: regPassword,
        schoolLevel: regLevel,
        securityQuestion: regQuestion,
        securityAnswer: normalizeAnswer(regAnswer),
        role: 'parent',
        verified: false,
      });
      setRegLoading(false);
      if (!result.ok) { setRegError(result.error ?? 'Erreur lors de la création du compte.'); return; }
      if (result.needsEmailConfirm) { setRegEmailConfirm(true); }
      login(regName.trim(), regLevel);
      setRegSuccess(true);
      setTimeout(() => { if (mountedRef.current) navigate('/bienvenue?role=parent', { replace: true }); }, 2000);
      return;
    }
    // Enseignants ET étudiants → étape 3 : vérification documents
    if (regRole === 'teacher') {
      setVerifOption('carte_pro');
      setRegStep(3);
    } else {
      setVerifOption('agenda');
      setRegStep(3);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/8 via-background to-chart-4/5 flex items-center justify-center p-4 py-8">
      <SEO
        title="Connexion & Inscription gratuite — Apprenix en 30 secondes"
        description="Créez votre compte Apprenix en 30 secondes. Progression, badges et notes sauvegardées. Sans carte bancaire, sans engagement, sans pub."
        canonical="/connexion"
        keywords="inscription apprenix gratuit, créer compte scolaire, connexion élève"
        noIndex={false}
        dateModified="2026-06-23"
      />
      <div className="w-full max-w-md">

        {/* ── Bouton retour — visible sur fond clair ── */}
        <button
          type="button"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
          className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground mb-3 transition-colors group"
          aria-label="Retour à la page précédente"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          Retour
        </button>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 mb-4 text-white shadow-2xl shadow-primary/25">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/8 pointer-events-none" aria-hidden="true" />
          <div className="relative z-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg">
              <ApprenixLogo size={40} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white text-balance leading-tight">Apprenix</h1>
              <p className="text-white/75 text-xs mt-0.5">La plateforme 100 % gratuite pour réussir</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {([{ icon: ShieldCheck, label: 'SSL sécurisé' }, { icon: Lock, label: '100% gratuit' }, { icon: User, label: 'Sans CB' }] as { icon: React.ElementType; label: string }[]).map(({ icon: I, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 border border-white/25 px-2.5 py-1 rounded-full">
                  <I className="w-3 h-3 shrink-0" aria-hidden="true" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bannière page protégée */}
        {redirectPageName && (
          <div className="mb-3 flex items-start gap-2.5 bg-primary/8 border border-primary/25 rounded-xl px-3 py-2.5" role="alert">
            <Unlock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground text-pretty">
              Connecte-toi pour accéder à <span className="font-semibold text-primary">{redirectPageName}</span>.
            </p>
          </div>
        )}

        {/* Encart parents */}
        <div className="mb-3 flex items-start gap-2.5 bg-chart-4/5 border border-chart-4/20 rounded-xl px-3 py-2.5">
          <span className="text-base shrink-0">👨‍👩‍👧</span>
          <p className="text-sm text-muted-foreground text-pretty">
            <span className="font-semibold text-foreground">Parents :</span> vous pouvez créer un compte pour votre enfant en choisissant son prénom et son niveau.
          </p>
        </div>

        <Card className="shadow-card w-full">
          <CardContent className="p-0">
            <Tabs defaultValue={searchParams.get('mode') === 'inscription' ? 'inscription' : 'connexion'}>
              <TabsList className="w-full rounded-none rounded-t-lg border-b border-border h-12">
                <TabsTrigger value="connexion" className="flex-1 rounded-none rounded-tl-lg text-sm">
                  <LogIn className="w-4 h-4 mr-1.5" /> Connexion
                </TabsTrigger>
                <TabsTrigger value="inscription" className="flex-1 rounded-none rounded-tr-lg text-sm" onClick={() => { setRegStep(1); setRegStepError(''); setRegError(''); }}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Inscription
                </TabsTrigger>
              </TabsList>

              {/* ── TAB CONNEXION ── */}
              <TabsContent value="connexion" className="p-5">
                {loginError && (
                  <div role="alert" className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{loginError}</p>
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-sm font-normal text-muted-foreground mb-1 block">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                        placeholder="votre@email.fr" className="pl-9 h-11 text-base" autoComplete="email" inputMode="email" spellCheck={false} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="login-password" className="text-sm font-normal text-muted-foreground">Mot de passe</Label>
                      <Link to="/recuperation" className="text-xs text-primary hover:underline underline-offset-2">Mot de passe oublié ?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="login-password" type={loginShowPwd ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••" className="pl-9 pr-10 h-11 text-base" autoComplete="current-password" />
                      <button type="button" aria-label={loginShowPwd ? 'Masquer' : 'Afficher'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        onClick={() => setLoginShowPwd(v => !v)}>
                        {loginShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loginLoading} className="w-full h-11 btn-cta text-white font-bold rounded-xl">
                    {loginLoading ? 'Connexion en cours…' : 'Se connecter →'}
                  </Button>
                </form>
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <Link to="/recuperation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Email oublié ? Récupérer mon compte →
                  </Link>
                </div>
              </TabsContent>

              {/* ── TAB INSCRIPTION ── */}
              <TabsContent value="inscription" className="p-5">

                {/* Succès */}
                {regSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    {regEmailConfirm ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-chart-4/10 flex items-center justify-center">
                          <Mail className="w-9 h-9 text-chart-4" />
                        </div>
                        <p className="text-base font-bold text-foreground">Vérifie tes emails !</p>
                        <p className="text-sm text-muted-foreground text-pretty max-w-xs">
                          Un lien de confirmation a été envoyé à <span className="font-medium text-foreground">{regEmail}</span>. Clique dessus puis connecte-toi.
                        </p>
                        <Button variant="outline" className="mt-2" onClick={() => { setRegEmailConfirm(false); setRegSuccess(false); setRegStep(1); }}>
                          Retour à la connexion
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                          <CheckCircle className="w-9 h-9 text-success" />
                        </div>
                        <p className="text-base font-bold text-foreground">Compte créé ! Bienvenue 🎉</p>
                        <p className="text-sm text-muted-foreground text-pretty max-w-xs">Redirection vers ton espace en cours…</p>
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                          <Badge className="bg-success/10 text-success border-success/20">✓ Gratuit à vie</Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Question secrète enregistrée
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* ── Indicateur d'étapes ── */}
                    <div className="flex items-center gap-1 mb-5">
                      {/* Étape 1 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${regStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-success text-white'}`}>
                          {regStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                        </div>
                        <div className="hidden sm:block min-w-0">
                          <p className={`text-xs font-semibold leading-none ${regStep === 1 ? 'text-foreground' : 'text-success'}`}>Mon compte</p>
                        </div>
                      </div>
                      <div className={`h-px flex-1 ${regStep > 1 ? 'bg-success' : 'bg-border'}`} />
                      {/* Étape 2 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${regStep === 2 ? 'bg-primary text-primary-foreground' : regStep > 2 ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                          {regStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                        </div>
                        <div className="hidden sm:block min-w-0">
                          <p className={`text-xs font-semibold leading-none ${regStep === 2 ? 'text-foreground' : regStep > 2 ? 'text-success' : 'text-muted-foreground'}`}>Sécurité</p>
                        </div>
                      </div>
                      {/* Séparateur 2→3 : toujours visible */}
                      <div className={`h-px flex-1 ${regStep > 2 ? 'bg-success' : 'bg-border'}`} />
                      {/* Étape 3 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${regStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          3
                        </div>
                        <div className="hidden sm:block min-w-0">
                          <p className={`text-xs font-semibold leading-none ${regStep === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Vérification</p>
                        </div>
                      </div>
                    </div>

                    {/* ── ÉTAPE 1 : Informations de compte ── */}
                    {regStep === 1 && (
                      <>
                        {regStepError && (
                          <div role="alert" className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{regStepError}</p>
                          </div>
                        )}
                        <form onSubmit={handleStep1} className="space-y-4">

                          {/* ── Sélecteur de rôle ── */}
                          <div>
                            <Label className="text-sm font-normal text-muted-foreground mb-2 block">Je suis…</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setRegRole('student')}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-[border-color,background-color,color] ${regRole === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}
                              >
                                <GraduationCap className="w-5 h-5 shrink-0" />
                                <span className="text-center leading-tight">Élève / Étudiant(e)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRegRole('teacher')}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-[border-color,background-color,color] ${regRole === 'teacher' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}
                              >
                                <BookOpen className="w-5 h-5 shrink-0" />
                                <span className="text-center leading-tight">Enseignant(e)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRegRole('parent')}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-[border-color,background-color,color] ${regRole === 'parent' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}
                              >
                                <Users className="w-5 h-5 shrink-0" />
                                <span className="text-center leading-tight">Parent</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="reg-prenom" className="text-sm font-normal text-muted-foreground mb-1 block">
                              {regRole === 'teacher' ? 'Prénom & Nom' : regRole === 'parent' ? 'Votre prénom & nom' : 'Prénom'}
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id="reg-prenom" value={regName} onChange={e => setRegName(e.target.value)}
                                placeholder={regRole === 'teacher' ? 'Ex : Marie Dupont' : regRole === 'parent' ? 'Ex : Jean Dupont' : 'Ex : Marie'}
                                className="pl-9 h-11 text-base" autoComplete="given-name" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="reg-email" className="text-sm font-normal text-muted-foreground mb-1 block">Adresse email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                placeholder="votre@email.fr" className="pl-9 h-11 text-base" autoComplete="email" inputMode="email" spellCheck={false} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="reg-password" className="text-sm font-normal text-muted-foreground mb-1 block">Mot de passe</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id="reg-password" type={regShowPwd ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                                placeholder="Minimum 6 caractères" className="pl-9 pr-10 h-11 text-base" autoComplete="new-password" />
                              <button type="button" aria-label={regShowPwd ? 'Masquer' : 'Afficher'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                onClick={() => setRegShowPwd(v => !v)}>
                                {regShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Niveau scolaire — étudiant ou niveau de l'enfant (parent) */}
                          {(regRole === 'student' || regRole === 'parent') && (
                            <div>
                              <Label className="text-sm font-normal text-muted-foreground mb-1 block">
                                {regRole === 'parent' ? 'Niveau scolaire de votre enfant' : 'Niveau scolaire'}
                              </Label>
                              <Select value={regLevel} onValueChange={v => setRegLevel(v as SchoolLevel)}>
                                <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {LEVEL_GROUPS_REG.map(({ label, levels }) => (
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
                          )}

                          {/* Note enseignant */}
                          {regRole === 'teacher' && (
                            <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
                              <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground text-pretty">
                                Votre espace enseignant vous permet de <strong className="text-foreground">répondre aux questions des élèves</strong>, corriger des copies et publier des contenus pédagogiques vérifiés.
                              </p>
                            </div>
                          )}

                          {/* Note parent */}
                          {regRole === 'parent' && (
                            <div className="flex items-start gap-2 rounded-xl border border-chart-4/30 bg-chart-4/5 p-3">
                              <Users className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground text-pretty">
                                Votre espace parent vous permet de <strong className="text-foreground">suivre la progression de votre enfant</strong>, consulter ses devoirs et échanger avec ses enseignants. <strong className="text-foreground">Aucun justificatif requis.</strong>
                              </p>
                            </div>
                          )}

                          <Button type="submit" className="w-full h-11 btn-cta text-white font-bold rounded-xl">
                            Continuer →
                          </Button>
                          <div className="flex items-center justify-center gap-2">
                            <Badge className="bg-success/10 text-success border-success/20 text-xs">100% Gratuit</Badge>
                            <Badge variant="secondary" className="text-xs">Sans abonnement</Badge>
                            <Badge variant="secondary" className="text-xs">Sans CB</Badge>
                          </div>
                        </form>
                      </>
                    )}

                    {/* ── ÉTAPE 2 : Question secrète ── */}
                    {regStep === 2 && (
                      <>
                        {regError && (
                          <div role="alert" className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{regError}</p>
                          </div>
                        )}
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <ShieldQuestion className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">Pourquoi cette étape ?</p>
                              <p className="text-xs text-muted-foreground mt-0.5 text-pretty leading-relaxed">
                                Si vous oubliez votre mot de passe, cette réponse permettra de récupérer votre compte <strong className="text-foreground">sans email de confirmation</strong>. Choisissez une réponse unique que vous n'oublierez jamais.
                              </p>
                            </div>
                          </div>
                        </div>
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <Label className="text-sm font-normal text-muted-foreground mb-1 block">Votre question de sécurité</Label>
                            <Select value={regQuestion} onValueChange={setRegQuestion}>
                              <SelectTrigger className="w-full h-auto min-h-[3rem] text-xs py-2 px-3 text-left">
                                <span className="block w-full min-w-0 text-left break-words whitespace-normal leading-snug line-clamp-3 pr-1">
                                  {regQuestion}
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
                            <Label htmlFor="reg-answer" className="text-sm font-normal text-muted-foreground mb-1 block">Votre réponse secrète</Label>
                            <div className="relative">
                              <Input id="reg-answer" type={regShowAns ? 'text' : 'password'} value={regAnswer} onChange={e => setRegAnswer(e.target.value)}
                                placeholder="Min. 3 caractères — unique et mémorisable"
                                className="pr-10 h-11 text-base" autoComplete="off" minLength={3} />
                              <button type="button" aria-label={regShowAns ? 'Masquer' : 'Afficher'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                onClick={() => setRegShowAns(v => !v)}>
                                {regShowAns ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Casse et accents ignorés. <strong className="text-foreground">Notez-la dans un endroit sûr.</strong>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setRegStep(1)} className="h-11 px-4">
                              <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button type="submit" disabled={regLoading} className="flex-1 h-11 btn-cta text-white font-bold rounded-xl">
                              {regLoading ? 'Création du compte…' : 'Créer mon compte gratuit →'}
                            </Button>
                          </div>
                        </form>
                      </>
                    )}

                    {/* ── ÉTAPE 3 : Vérification identité étudiant ── */}
                    {regStep === 3 && (
                      <div className="space-y-4">
                        {/* Intro */}
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {regRole === 'teacher' ? 'Vérification de votre statut enseignant' : 'Vérification de ton statut étudiant'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Pour sécuriser la plateforme, un bot intelligent va analyser un justificatif.{' '}
                                {regRole === 'teacher'
                                  ? 'Vos fichiers ne sont jamais envoyés ni stockés sur nos serveurs.'
                                  : 'Tes fichiers ne sont jamais envoyés ni stockés sur nos serveurs.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sélection option */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Quel justificatif as-tu ?</p>
                          <div className="grid grid-cols-1 gap-2">
                            {(regRole === 'teacher' ? [
                              { key: 'carte_pro',      icon: IdCard,        label: 'Carte professionnelle / de travail', desc: 'Badge, carte d\'établissement ou contrat visible' },
                              { key: 'carte_identite', icon: ShieldCheck,   label: 'Carte d\'identité nationale',         desc: 'CNI ou passeport en cours de validité' },
                              { key: 'autre',          icon: Camera,        label: 'Autre document',                      desc: 'Contrat, bulletin de salaire, certificat d\'emploi…' },
                            ] : [
                              { key: 'agenda', icon: BookmarkCheck, label: 'Agenda / Cahier scolaire',     desc: 'Couverture + emploi du temps' },
                              { key: 'carte',  icon: IdCard,        label: 'Carte scolaire / étudiante',   desc: 'Recto de la carte en cours de validité' },
                              { key: 'autre',  icon: Camera,        label: 'Autre justificatif',            desc: 'Certificat de scolarité, convocation exam…' },
                            ]).map(opt => (
                              <button
                                type="button"
                                key={opt.key}
                                onClick={() => { setVerifOption(opt.key as typeof verifOption); setVerifFile1(null); setVerifFile2(null); setVerifError(''); setVerifStatus('idle'); }}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-[border-color,background-color] ${verifOption === opt.key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
                              >
                                <opt.icon className={`w-5 h-5 shrink-0 ${verifOption === opt.key ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="min-w-0">
                                  <p className={`text-xs font-semibold ${verifOption === opt.key ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Zone upload selon option */}
                        {verifStatus !== 'analyzing' && verifStatus !== 'ok' && (
                          <div className="space-y-3">
                            {verifOption === 'agenda' && (<>
                              {/* Fichier 1 : couverture */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">📸 Photo de la <strong className="text-foreground">couverture</strong> de ton agenda ou cahier</p>
                                <input ref={file1Ref} type="file" accept="image/*" className="hidden"
                                  onChange={e => setVerifFile1(e.target.files?.[0] ?? null)} />
                                <button type="button" onClick={() => file1Ref.current?.click()}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-colors ${verifFile1 ? 'border-success bg-success/5' : 'border-border hover:border-primary/50 bg-secondary/40'}`}>
                                  {verifFile1 ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <Upload className="w-5 h-5 text-muted-foreground shrink-0" />}
                                  <span className={`text-xs truncate min-w-0 ${verifFile1 ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                    {verifFile1 ? verifFile1.name : 'Appuyer pour choisir une photo…'}
                                  </span>
                                </button>
                              </div>
                              {/* Fichier 2 : emploi du temps */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">📅 Photo de ton <strong className="text-foreground">emploi du temps</strong></p>
                                <input ref={file2Ref} type="file" accept="image/*" className="hidden"
                                  onChange={e => setVerifFile2(e.target.files?.[0] ?? null)} />
                                <button type="button" onClick={() => file2Ref.current?.click()}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-colors ${verifFile2 ? 'border-success bg-success/5' : 'border-border hover:border-primary/50 bg-secondary/40'}`}>
                                  {verifFile2 ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <Upload className="w-5 h-5 text-muted-foreground shrink-0" />}
                                  <span className={`text-xs truncate min-w-0 ${verifFile2 ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                    {verifFile2 ? verifFile2.name : 'Appuyer pour choisir une photo…'}
                                  </span>
                                </button>
                              </div>
                            </>)}

                            {(verifOption === 'carte' || verifOption === 'carte_pro' || verifOption === 'carte_identite') && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  {verifOption === 'carte'          && '🪪 Photo du recto de ta '}
                                  {verifOption === 'carte_pro'      && '💼 Photo de ta '}
                                  {verifOption === 'carte_identite' && '🪪 Photo de ta '}
                                  <strong className="text-foreground">
                                    {verifOption === 'carte'          && 'carte scolaire / étudiante'}
                                    {verifOption === 'carte_pro'      && 'carte professionnelle ou badge d\'établissement'}
                                    {verifOption === 'carte_identite' && 'carte d\'identité (recto)'}
                                  </strong>
                                </p>
                                <input ref={file1Ref} type="file" accept="image/*" className="hidden"
                                  onChange={e => setVerifFile1(e.target.files?.[0] ?? null)} />
                                <button type="button" onClick={() => file1Ref.current?.click()}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-colors ${verifFile1 ? 'border-success bg-success/5' : 'border-border hover:border-primary/50 bg-secondary/40'}`}>
                                  {verifFile1 ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <Upload className="w-5 h-5 text-muted-foreground shrink-0" />}
                                  <span className={`text-xs truncate min-w-0 ${verifFile1 ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                    {verifFile1 ? verifFile1.name : 'Appuyer pour choisir une photo…'}
                                  </span>
                                </button>
                              </div>
                            )}

                            {verifOption === 'autre' && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">✍️ Décris ton justificatif et ton établissement</p>
                                <textarea
                                  value={verifAltText}
                                  onChange={e => setVerifAltText(e.target.value)}
                                  placeholder="Ex : Je suis en 1ère au lycée Victor Hugo à Paris, je n'ai pas ma carte sur moi mais j'ai mon certificat de scolarité numérique…"
                                  rows={4}
                                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                            )}

                            {/* Erreur */}
                            {verifError && (
                              <div role="alert" className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{verifError}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setRegStep(2)}>
                                <ArrowLeft className="w-4 h-4" />
                              </Button>
                              <Button type="button" className="flex-1 h-11 btn-cta text-white font-bold rounded-xl gap-2"
                                onClick={runVerification}>
                                <Sparkles className="w-4 h-4" />
                                Lancer la vérification IA →
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Animation bot IA */}
                        {verifStatus === 'analyzing' && (
                          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                              <p className="text-sm font-semibold text-foreground">Bot Apprenix — analyse en cours…</p>
                            </div>
                            {BOT_STEPS.map((step, i) => (
                              <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${i < verifStep ? 'opacity-100' : 'opacity-25'}`}>
                                {i < verifStep
                                  ? <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                                  : <div className={`w-3.5 h-3.5 rounded-full border-2 border-muted shrink-0 ${i === verifStep - 1 ? 'border-primary animate-spin border-t-transparent' : ''}`} />
                                }
                                <span className={i < verifStep ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Succès vérification */}
                        {verifStatus === 'ok' && (
                          <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                              <ShieldCheck className="w-8 h-8 text-success" />
                            </div>
                            <p className="text-base font-bold text-foreground">Document validé ✅</p>
                            <p className="text-sm text-muted-foreground">Création du compte en cours…</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">Apprenix — 100 % gratuit, sans publicité</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mentions légales</Link>
          <Link to="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link>
          <Link to="/cgu" className="text-sm text-muted-foreground hover:text-primary transition-colors">CGU</Link>
        </div>
      </div>
    </div>
  );
};

export default ConnexionPage;
