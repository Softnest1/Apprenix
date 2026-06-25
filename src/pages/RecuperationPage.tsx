import {AlertCircle, ArrowLeft, 
  CheckCircle, Eye, EyeOff,KeyRound,Lock, 
  Mail, ShieldQuestion } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import ApprenixLogo from '@/components/ui/ApprenixLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';

// ─── Types de récupération ────────────────────────────────────────────────────
type Mode = 'choix' | 'mdp_email' | 'mdp_question' | 'mdp_nouveau' | 'mdp_no_question' | 'email_nom' | 'email_no_question';

const RecuperationPage: React.FC = () => {
  const {} = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('choix');

  const [mdpEmail, setMdpEmail]           = useState('');
  const [mdpAnswer, setMdpAnswer]         = useState('');
  const [mdpNew, setMdpNew]               = useState('');
  const [mdpNewShow, setMdpNewShow]       = useState(false);
  const [mdpAccount, setMdpAccount]       = useState<{ email: string; securityQuestion: string; securityAnswer: string } | undefined>();
  const [mdpError, setMdpError]           = useState('');
  const [mdpSuccess, setMdpSuccess]       = useState(false);
  // Limite de tentatives anti-brute-force
  const [mdpAttempts, setMdpAttempts]     = useState(0);
  const MAX_ATTEMPTS = 5;

  // Email oublié — non supporté sans compte localStorage : on redirige vers support
  const [emailNom, setEmailNom]           = useState('');
  const [emailError, setEmailError]       = useState('');

  // ── Étape 1 MDP : obtenir la question via Edge Function (bypass RLS) ─────
  const handleMdpEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMdpError('');
    const email = mdpEmail.trim().toLowerCase();
    if (!email) { setMdpError('Veuillez saisir votre adresse email.'); return; }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ mode: 'get_question', email }),
        },
      );
      const json = await res.json();

      if (!json.found) {
        setMdpError('Aucun compte trouvé avec cet email. Vérifiez l\'orthographe ou créez un nouveau compte.');
        return;
      }

      // Construit un objet compatible avec le reste du flow
      setMdpAccount({ email, securityQuestion: json.question, securityAnswer: '' });
      setMode('mdp_question');
    } catch {
      setMdpError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    }
  };

  // ── Étape 2 MDP : vérifier la réponse (vérification côté serveur dans step 3) ──
  const handleMdpAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mdpAccount) return;
    if (mdpAttempts >= MAX_ATTEMPTS) {
      setMdpError(`Trop de tentatives (${MAX_ATTEMPTS} max). Revenez plus tard ou contactez le support.`);
      return;
    }
    if (!mdpAnswer.trim()) { setMdpError('Veuillez saisir votre réponse.'); return; }
    setMdpError('');
    setMode('mdp_nouveau');
  };

  // ── Étape 3 MDP : réinitialiser via Edge Function (pas de session active) ─
  const handleMdpNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mdpAccount) return;
    if (mdpNew.length < 8) { setMdpError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (mdpNew.trim() !== mdpNew) { setMdpError('Le mot de passe ne doit pas commencer ou finir par un espace.'); return; }
    setMdpError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({
            email: mdpAccount.email,
            securityAnswer: mdpAnswer,
            newPassword: mdpNew }) },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const next = mdpAttempts + 1;
        setMdpAttempts(next);
        if (res.status === 401) {
          const restant = MAX_ATTEMPTS - next;
          setMdpError(restant > 0
            ? `Réponse incorrecte. Il vous reste ${restant} tentative${restant > 1 ? 's' : ''}.`
            : `Trop de tentatives. Revenez plus tard ou contactez le support.`
          );
          if (next >= MAX_ATTEMPTS) setMode('mdp_no_question');
        } else {
          setMdpError(json.error ?? 'Erreur lors de la mise à jour du mot de passe.');
        }
        return;
      }
      setMdpSuccess(true);
    } catch {
      setMdpError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    }
  };

  // ── Étape 1 EMAIL : redirige vers le support (recherche par nom non supportée) ─
  const handleEmailNom = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = emailNom.trim().toLowerCase();
    if (!nom) { setEmailError('Veuillez saisir votre prénom.'); return; }
    setEmailError('');
    setMode('email_no_question');
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <SEO
        title="Récupérer mon compte — Mot de passe oublié | Apprenix"
        description="Réinitialisez votre mot de passe Apprenix en quelques secondes. Entrez votre email, recevez le lien de réinitialisation. Simple, sécurisé, gratuit."
        canonical="/recuperation"
        keywords="récupération compte apprenix, réinitialiser mot de passe, mot de passe oublié scolaire, accès compte étudiant, reset password apprenix"
        noIndex={false}
        dateModified="2026-06-20"
      />
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3">
            <ApprenixLogo size={64} />
          </div>
          <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-foreground text-balance text-center">Apprenix</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">Récupération d'accès</p>
        </div>

        <Card className="shadow-card w-full">
          <CardContent className="p-6">

            {/* ── Choix initial ── */}
            {mode === 'choix' && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <ShieldQuestion className="w-10 h-10 text-primary mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Que souhaitez-vous récupérer ?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sans vérification par email — répondez à votre question secrète.
                  </p>
                </div>
                <button type="button"
                  onClick={() => { setMode('mdp_email'); setMdpError(''); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-[background-color,border-color,color,box-shadow,transform] text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Mot de passe oublié</p>
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Je connais mon email mais j'ai oublié mon mot de passe</p>
                  </div>
                </button>
                <button type="button"
                  onClick={() => { setMode('email_nom'); setEmailError(''); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-chart-3/40 hover:bg-chart-3/5 transition-[background-color,border-color,color,box-shadow,transform] text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-chart-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Email oublié</p>
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">J'ai oublié l'adresse email avec laquelle je me suis inscrit(e)</p>
                  </div>
                </button>
                <div className="pt-2 text-center">
                  <Link to="/connexion" className="text-xs text-primary hover:underline underline-offset-2 flex items-center justify-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Retour à la connexion
                  </Link>
                </div>
              </div>
            )}

            {/* ── MDP : Saisie email ── */}
            {mode === 'mdp_email' && (
              <div className="space-y-4">
                <button type="button" onClick={() => setMode('choix')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-3 h-3" /> Retour
                </button>
                <div className="text-center mb-4">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Mot de passe oublié</h2>
                  <p className="text-sm text-muted-foreground mt-1">Saisissez votre adresse email pour retrouver votre compte</p>
                </div>
                {mdpError && (
                  <div role="alert" className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{mdpError}</p>
                  </div>
                )}
                <form onSubmit={handleMdpEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="recup-mdp-email" className="text-sm font-normal text-muted-foreground mb-1 block">Adresse email du compte</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="recup-mdp-email"
                        type="email"
                        value={mdpEmail}
                        onChange={e => setMdpEmail(e.target.value)}
                        placeholder="votre@email.fr"
                        className="pl-9 h-10 text-base"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground font-semibold">
                    Continuer
                  </Button>
                </form>
              </div>
            )}

            {/* ── MDP : Question de sécurité ── */}
            {mode === 'mdp_question' && mdpAccount && (
              <div className="space-y-4">
                <button type="button" onClick={() => { setMode('mdp_email'); setMdpError(''); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-3 h-3" /> Retour
                </button>
                <div className="text-center mb-4">
                  <ShieldQuestion className="w-8 h-8 text-chart-4 mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Question secrète</h2>
                  <p className="text-sm text-muted-foreground mt-1">Répondez à votre question de sécurité pour continuer</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Votre question :</p>
                  <p className="text-sm font-semibold text-foreground break-words text-pretty">{mdpAccount.securityQuestion}</p>
                </div>
                {mdpError && (
                  <div role="alert" className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{mdpError}</p>
                  </div>
                )}
                <form onSubmit={handleMdpAnswer} className="space-y-4">
                  <div>
                    <Label htmlFor="recup-mdp-answer" className="text-sm font-normal text-muted-foreground mb-1 block">Votre réponse</Label>
                    <Input
                      id="recup-mdp-answer"
                      value={mdpAnswer}
                      onChange={e => setMdpAnswer(e.target.value)}
                      placeholder="Saisissez votre réponse secrète…"
                      className="h-10 text-base"
                      autoComplete="off"
                    />
                    <p className="text-sm text-muted-foreground mt-1">La réponse n'est pas sensible à la casse ni aux majuscules.</p>
                  </div>
                  <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground font-semibold">
                    Vérifier ma réponse
                  </Button>
                </form>
              </div>
            )}

            {/* ── MDP : Nouveau mot de passe ── */}
            {mode === 'mdp_nouveau' && !mdpSuccess && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <KeyRound className="w-8 h-8 text-success mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Choisissez un nouveau mot de passe</h2>
                  <p className="text-sm text-muted-foreground mt-1">Identité vérifiée ✓ — Saisissez votre nouveau mot de passe</p>
                </div>
                {mdpError && (
                  <div role="alert" className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{mdpError}</p>
                  </div>
                )}
                <form onSubmit={handleMdpNew} className="space-y-4">
                  <div>
                    <Label htmlFor="recup-new-password" className="text-sm font-normal text-muted-foreground mb-1 block">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="recup-new-password"
                        type={mdpNewShow ? 'text' : 'password'}
                        value={mdpNew}
                        onChange={e => setMdpNew(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="pl-9 pr-9 h-10 text-base"
                        autoComplete="new-password"
                      />
                      <button type="button"
                        aria-label={mdpNewShow ? 'Masquer' : 'Afficher'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded"
                        onClick={() => setMdpNewShow(v => !v)}
                      >
                        {mdpNewShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground font-semibold">
                    Enregistrer le nouveau mot de passe
                  </Button>
                </form>
              </div>
            )}

            {/* ── MDP : Succès ── */}
            {mdpSuccess && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="w-14 h-14 text-success" />
                <h2 className="text-base font-bold text-foreground">Mot de passe modifié !</h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Votre mot de passe a été mis à jour avec succès.</p>
                <Badge className="bg-success/10 text-success border-success/20">Compte sécurisé ✓</Badge>
                <Button className="w-full h-10 bg-primary text-primary-foreground font-semibold mt-2" onClick={() => navigate('/connexion')}>
                  Se connecter avec le nouveau mot de passe
                </Button>
              </div>
            )}

            {/* ── MDP : Pas de question secrète définie ── */}
            {mode === 'mdp_no_question' && (
              <div className="space-y-4">
                <button type="button" onClick={() => { setMode('mdp_email'); setMdpError(''); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-3 h-3" /> Retour
                </button>
                <div className="text-center mb-4">
                  <ShieldQuestion className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Question secrète non configurée</h2>
                  <p className="text-sm text-muted-foreground mt-1 text-pretty leading-relaxed">
                    Ce compte n'a pas encore de question secrète. Configurez-en une depuis votre profil, ou contactez le support.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400 text-pretty leading-relaxed">
                  💡 Pour sécuriser votre compte, connectez-vous et rendez-vous dans <strong>Mon Profil → Sécurité</strong> pour définir une question secrète.
                </div>
                <a
                  href="https://wa.me/33667485226?text=Bonjour%2C%20j'ai%20besoin%20d'aide%20pour%20récupérer%20mon%20mot%20de%20passe%20Apprenix."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contacter le support WhatsApp
                </a>
                <Button variant="outline" className="w-full h-10" onClick={() => navigate('/connexion')}>
                  Retour à la connexion
                </Button>
              </div>
            )}

            {/* ── EMAIL : Saisie prénom ── */}
            {mode === 'email_nom' && (
              <div className="space-y-4">
                <button type="button" onClick={() => setMode('choix')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-3 h-3" /> Retour
                </button>
                <div className="text-center mb-4">
                  <Mail className="w-8 h-8 text-chart-3 mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Email oublié</h2>
                  <p className="text-sm text-muted-foreground mt-1">Saisissez le prénom utilisé lors de votre inscription</p>
                </div>
                {emailError && (
                  <div role="alert" className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{emailError}</p>
                  </div>
                )}
                <form onSubmit={handleEmailNom} className="space-y-4">
                  <div>
                    <Label htmlFor="recup-email-nom" className="text-sm font-normal text-muted-foreground mb-1 block">Votre prénom (utilisé à l'inscription)</Label>
                    <Input
                      id="recup-email-nom"
                      value={emailNom}
                      onChange={e => setEmailNom(e.target.value)}
                      placeholder="Ex: Marie"
                      className="h-10 text-base"
                      autoComplete="given-name"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 bg-chart-3 text-white font-semibold">
                    Continuer
                  </Button>
                </form>
              </div>
            )}

            {/* ── EMAIL : Pas de question secrète définie ── */}
            {mode === 'email_no_question' && (
              <div className="space-y-4">
                <button type="button" onClick={() => { setMode('email_nom'); setEmailError(''); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-3 h-3" /> Retour
                </button>
                <div className="text-center mb-4">
                  <ShieldQuestion className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h2 className="text-base font-bold text-foreground">Récupération impossible automatiquement</h2>
                  <p className="text-sm text-muted-foreground mt-1 text-pretty leading-relaxed">
                    Aucune question secrète n'est associée à ce compte. Contactez le support pour récupérer votre accès.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400 text-pretty leading-relaxed">
                  💡 Pour éviter ce problème à l'avenir, connectez-vous et rendez-vous dans <strong>Mon Profil → Sécurité</strong> pour définir une question secrète.
                </div>
                <a
                  href="https://wa.me/33667485226?text=Bonjour%2C%20j'ai%20besoin%20d'aide%20pour%20retrouver%20mon%20email%20Apprenix."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contacter le support WhatsApp
                </a>
                <Button variant="outline" className="w-full h-10" onClick={() => navigate('/connexion')}>
                  Retour à la connexion
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 mt-4">
          <Link to="/connexion" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Connexion
          </Link>
          <Link to="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperationPage;
