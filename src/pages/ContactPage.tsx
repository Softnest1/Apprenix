import {AlertCircle, ArrowRight, CheckCircle, 
  Clock, Home, Inbox, Loader2,
  Mail, MapPin, MessageCircle, RotateCcw,Send, 
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHero from '@/components/ui/PageHero';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import WhatsAppContactModal from '@/components/WhatsAppContactModal';
import { supabase } from '@/db/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any


const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined
  ?? '33fe4080-ce74-4a6e-b738-840ec882fa1c';

const OBJECTS = [
  { value: 'general',    label: 'Question générale' },
  { value: 'technique',  label: 'Problème technique' },
  { value: 'suggestion', label: "Suggestion d'amélioration" },
  { value: 'signalement',label: 'Signalement de contenu' },
  { value: 'rgpd',       label: 'Demande RGPD (accès / suppression)' },
  { value: 'autre',      label: 'Autre' },
];

interface FormState {
  nom: string;
  email: string;
  objet: string;
  message: string;
  website: string; // honeypot anti-spam
}

interface Errors {
  nom?: string;
  email?: string;
  objet?: string;
  message?: string;
}

const EMPTY: FormState = { nom: '', email: '', objet: '', message: '', website: '' };

const validate = (f: FormState): Errors => {
  const errs: Errors = {};
  if (!f.nom.trim() || f.nom.trim().length < 2)
    errs.nom = 'Prénom/Nom requis (min. 2 caractères)';
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    errs.email = 'Adresse email valide requise';
  if (!f.objet)
    errs.objet = 'Veuillez sélectionner un objet';
  if (!f.message.trim() || f.message.trim().length < 10)
    errs.message = 'Message requis (min. 10 caractères)';
  if (f.message.trim().length > 1000)
    errs.message = 'Message trop long (max. 1 000 caractères)';
  return errs;
};

const ContactPage: React.FC = () => {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [errors, setErrors]   = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sentName, setSentName]   = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [waOpen, setWaOpen]   = useState(false);

  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (field !== 'website' && errors[field as keyof Errors])
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const objetLabel = OBJECTS.find(o => o.value === form.objet)?.label ?? form.objet;

      // Appel direct à Web3Forms depuis le frontend (adapté du snippet officiel)
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_KEY);
      formData.append('subject', `[Apprenix] ${objetLabel} — ${form.nom.trim()}`);
      formData.append('from_name', `${form.nom.trim()} via Apprenix`);
      formData.append('replyto', form.email.trim());
      formData.append('Expéditeur', form.nom.trim());
      formData.append('Email de réponse', form.email.trim());
      formData.append('Objet', objetLabel);
      formData.append('Message', form.message.trim());
      formData.append('botcheck', ''); // protection anti-spam Web3Forms

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Web3Forms error:', data);
        toast.error('Envoi impossible', {
          description: data.message || 'Veuillez réessayer ou nous contacter via WhatsApp.',
        });
        return;
      }

      // Sauvegarde en base (non-bloquant)
      supabase.from('contact_messages').insert({
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        objet: form.objet,
        message: form.message.trim(),
      }).then(({ error }: { error: { message: string } | null }) => { if (error) console.warn('DB save skipped:', error.message); });

      setSentName(form.nom.trim().split(' ')[0]);
      setSentEmail(form.email.trim());
      setSent(true);
      setForm(EMPTY);
      toast.success('Message envoyé !', { description: 'Nous vous répondrons dans les 48 h.' });
    } catch (err) {
      console.error('Unexpected:', err);
      toast.error('Erreur réseau', { description: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <h1 className="sr-only">Contact Apprenix</h1>
    <div className="max-w-5xl mx-auto py-4 min-w-0">
      <SEO
        title="Contacter Apprenix — Support, Suggestions & Signalement | Apprenix"
        description="Besoin d'aide, d'une suggestion ou d'un signalement ? Contactez Apprenix directement par formulaire ou WhatsApp. Réponse rapide garantie."
        canonical="/contact"
        keywords="contact apprenix, support scolaire gratuit, contacter équipe apprenix, signaler bug plateforme, suggestion fonctionnalité, partenariat éducatif"
        dateModified="2026-06-20"
        noIndex={false}
      />

      <PageHero
        variant="info"
        icon={Mail}
        badge={<><Mail className="w-3 h-3 mr-1" />Nous contacter</>}
        badgeClassName="bg-chart-1/10 text-chart-1 border-chart-1/20"
        title="Contactez-nous"
        subtitle="Une question, une suggestion ou un problème ? Charly lit personnellement tous les messages et répond dans les meilleurs délais."
        stats={[
          { value: '48 h', label: 'Délai de réponse' },
          { value: '100 %', label: 'Messages lus' },
          { value: '2', label: 'Canaux disponibles' },
        ]}
      />

      {/* ── Moyens de contact rapides — visibles en haut sur desktop ────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => setWaOpen(true)}
          className="flex items-center gap-3 p-4 rounded-xl border border-chart-2/30 bg-chart-2/5 hover:bg-chart-2/10 transition-colors text-left w-full group"
        >
          <div className="w-10 h-10 rounded-full bg-chart-2/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-chart-2" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground">Réponse souvent le jour même</p>
          </div>
          <ArrowRight className="w-4 h-4 text-chart-2 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Email direct */}
        <a
          href="mailto:apprenix.contact@gmail.com"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-secondary/40 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Email direct</p>
            <p className="text-xs text-primary truncate">apprenix.contact@gmail.com</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Formulaire — scroll JS (évite le saut natif href="#" sur mobile) */}
        <button
          type="button"
          onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-secondary/40 transition-colors group text-left w-full"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Formulaire</p>
            <p className="text-sm text-muted-foreground">Réponse sous 48 h par email</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Formulaire principal ─────────────────────────────── */}
        <div id="contact-form" className="md:col-span-2">
          {sent ? (
            <Card className="overflow-hidden">
              {/* Bannière colorée du haut */}
              <div className="relative bg-primary px-6 pt-8 pb-14 flex flex-col items-center text-center">
                {/* Cercles décoratifs */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-4 w-20 h-20 rounded-full bg-primary-foreground/5 translate-y-1/2 pointer-events-none" />

                {/* Icône animée */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary-foreground/15 flex items-center justify-center animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-primary-foreground text-balance">
                  Merci {sentName} !
                </h2>
                <p className="text-sm text-primary-foreground/80 mt-1 text-pretty max-w-xs">
                  Votre message a bien été envoyé.
                </p>
              </div>

              <CardContent className="px-6 pt-0 pb-6 -mt-6 flex flex-col gap-5">
                {/* Carte email */}
                <div className="bg-background rounded-xl border border-border shadow-sm p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Inbox className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Réponse attendue à</p>
                    <p className="text-sm font-semibold text-foreground truncate">{sentEmail}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Ce qui se passe ensuite</p>

                  {/* Étape 1 — terminée */}
                  <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <div className="w-0.5 h-6 bg-border mt-1" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">Message envoyé</p>
                      <p className="text-sm text-muted-foreground">Votre message est dans notre boîte mail</p>
                    </div>
                  </div>

                  {/* Étape 2 — en cours */}
                  <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-full bg-warning/15 border-2 border-warning flex items-center justify-center">
                        <Clock className="w-3 h-3 text-warning" />
                      </div>
                      <div className="w-0.5 h-6 bg-border mt-1" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">Lecture en cours</p>
                      <p className="text-sm text-muted-foreground">Nous lisons tous les messages sous 48 h</p>
                    </div>
                  </div>

                  {/* Étape 3 — à venir */}
                  <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Réponse par email</p>
                      <p className="text-sm text-muted-foreground">Vous recevrez notre réponse sur <span className="font-medium text-foreground">{sentEmail}</span></p>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col md:flex-row gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => { setSent(false); setSentName(''); setSentEmail(''); }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nouveau message
                  </Button>
                  <Button asChild className="flex-1 gap-2">
                    <Link to="/">
                      <Home className="w-4 h-4" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                </div>

                {/* Lien WhatsApp urgent */}
                <p className="text-xs text-center text-muted-foreground text-pretty">
                  Besoin d'une réponse urgente ?{' '}
                  <button type="button"
                    onClick={() => setWaOpen(true)}
                    className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    Contactez-nous sur WhatsApp
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Formulaire de contact
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Remplissez ce formulaire — votre message arrive directement dans notre boîte.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot anti-spam */}
                  <input
                    name="website" type="text" value={form.website}
                    onChange={handleChange('website')} autoComplete="off"
                    tabIndex={-1} aria-hidden="true"
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                  />

                  {/* Nom + Email côte à côte sur desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nom" className="text-sm font-normal mb-1.5 block">
                        Prénom &amp; Nom <span className="text-destructive" aria-hidden>*</span>
                      </Label>
                      <Input
                        id="nom" placeholder="Marie Dupont"
                        value={form.nom} onChange={handleChange('nom')}
                        className={errors.nom ? 'border-destructive' : ''}
                        aria-invalid={!!errors.nom}
                        aria-describedby={errors.nom ? 'err-nom' : undefined}
                        maxLength={50} autoComplete="name"
                      />
                      {errors.nom && (
                        <p id="err-nom" role="alert" className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />{errors.nom}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-sm font-normal mb-1.5 block">
                        Email <span className="text-destructive" aria-hidden>*</span>
                      </Label>
                      <Input
                        id="contact-email" type="email" placeholder="vous@example.com"
                        value={form.email} onChange={handleChange('email')}
                        className={errors.email ? 'border-destructive' : ''}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'err-email' : undefined}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p id="err-email" role="alert" className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />{errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Objet */}
                  <div>
                    <Label className="text-sm font-normal mb-1.5 block">
                      Objet <span className="text-destructive" aria-hidden>*</span>
                    </Label>
                    <Select value={form.objet} onValueChange={v => {
                      setForm(prev => ({ ...prev, objet: v }));
                      if (errors.objet) setErrors(prev => ({ ...prev, objet: undefined }));
                    }}>
                      <SelectTrigger
                        className={errors.objet ? 'border-destructive' : ''}
                        aria-label="Choisir l'objet du message"
                        aria-invalid={!!errors.objet}
                        aria-describedby={errors.objet ? 'err-objet' : undefined}
                      >
                        <SelectValue placeholder="Sélectionner un objet…" />
                      </SelectTrigger>
                      <SelectContent>
                        {OBJECTS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.objet && (
                      <p id="err-objet" role="alert" className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />{errors.objet}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-sm font-normal mb-1.5 block">
                      Message <span className="text-destructive" aria-hidden>*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre question, suggestion ou problème…"
                      rows={6}
                      value={form.message} onChange={handleChange('message')}
                      className={errors.message ? 'border-destructive' : ''}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'err-message' : 'message-count'}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message ? (
                        <p id="err-message" role="alert" className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />{errors.message}
                        </p>
                      ) : <span />}
                      <span id="message-count" className={`text-xs ml-auto ${form.message.length > 900 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {form.message.length}/1 000
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading}
                    aria-label="Envoyer le message de contact"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours…</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Envoyer le message</>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center text-pretty">
                    Votre message est envoyé directement dans notre boîte mail — aucun client mail requis.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Contacts alternatifs (sidebar desktop) ────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-0.5">Autres façons de nous joindre</h2>
            <p className="text-sm text-muted-foreground">Choisissez le canal qui vous convient.</p>
          </div>

          {/* WhatsApp */}
          <Card className="border-chart-2/30 bg-chart-2/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-chart-2/15 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-chart-2" />
                </div>
                <span className="text-sm font-semibold text-foreground">WhatsApp</span>
                <span className="ml-auto text-xs font-medium text-chart-2 bg-chart-2/10 px-2 py-0.5 rounded-full">Rapide</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 text-pretty">
                Réponse souvent le jour même, idéal pour les questions urgentes.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-chart-2/40 text-chart-2 hover:bg-chart-2/10"
                onClick={() => setWaOpen(true)}
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Ouvrir WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Email direct */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Email direct</span>
              </div>
              <a
                href="mailto:apprenix.contact@gmail.com"
                className="text-xs text-primary hover:underline break-all block"
                aria-label="Envoyer un email à Apprenix"
              >
                apprenix&#46;contact&#64;gmail&#46;com
              </a>
              <p className="text-sm text-muted-foreground mt-1">Réponse sous 48 h</p>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">Adresse</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                36 avenue du Parc<br />93290 Tremblay-en-France<br />France
              </p>
            </CardContent>
          </Card>

          {/* Info RGPD */}
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Pour une demande RGPD (accès, rectification, suppression), choisissez l'objet{' '}
                <em>Demande RGPD</em>. Réponse sous{' '}
                <strong className="text-foreground">30 jours max</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liens bas de page */}
      <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        <Link to="/mission" className="hover:text-primary transition-colors">Notre mission</Link>
        <Link to="/securite" className="hover:text-primary transition-colors">Sécurité &amp; données</Link>
        <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
        <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
    <WhatsAppContactModal open={waOpen} onOpenChange={setWaOpen} />
    </>
  );
};

export default ContactPage;
