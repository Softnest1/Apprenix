import {ArrowRight, BadgeCheck,
  BookOpen, ChevronDown, ChevronUp, Eye, GraduationCap,Heart, 
  Mail, Megaphone, MessageCircle, Phone,Send, Shield,
  ShieldCheck, 
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import WhatsAppContactModal from '@/components/WhatsAppContactModal';

const REASSURANCE = [
  {
    icon: ShieldCheck,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Données protégées RGPD',
    desc: 'Les données personnelles de vos enfants sont protégées conformément au RGPD (UE 2016/679) et à la loi Informatique et Libertés. Aucune revente à des tiers, jamais.',
  },
  {
    icon: Megaphone,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Zéro publicité',
    desc: 'Pas de publicité comportementale, pas de tracking commercial, pas de push marketing. Une expérience d\'apprentissage totalement épurée.',
  },
  {
    icon: Eye,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    title: 'Supervision possible',
    desc: 'L\'espace parents vous permet de consulter le résumé d\'activité de votre enfant via un code parental sécurisé (XP, matières, progression, flashcards révisées).',
  },
  {
    icon: Heart,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Protection des mineurs',
    desc: 'Conformément à l\'article 8 du RGPD, les enfants de moins de 15 ans peuvent utiliser Apprenix sans compte. La création d\'un compte nécessite le consentement parental.',
  },
  {
    icon: GraduationCap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Conforme programmes EN',
    desc: 'Tous nos contenus pédagogiques suivent les programmes officiels de l\'Éducation nationale (Éduscol, BOEN). Du CP au Bac +5.',
  },
  {
    icon: BadgeCheck,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    title: '100 % gratuit, pour toujours',
    desc: 'Apprenix est un service non commercial exploité par un particulier sans but lucratif. Aucun abonnement, aucune carte bancaire, aucune surprise.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apprenix est-il vraiment gratuit ?',
    a: 'Oui, 100 % gratuit, sans aucune exception. Pas d\'abonnement, pas de fonctionnalités payantes, pas de carte bancaire. Le service est exploité par un particulier non commerçant.',
  },
  {
    q: 'Les données de mon enfant sont-elles en sécurité ?',
    a: 'Oui. Les données sont protégées conformément au RGPD. Elles ne sont ni revendues, ni louées, ni partagées avec des tiers à des fins commerciales. Voir notre politique de confidentialité complète.',
  },
  {
    q: 'Mon enfant peut-il utiliser Apprenix sans créer de compte ?',
    a: 'Oui, toutes les fonctionnalités de base sont accessibles sans inscription. La création d\'un compte est facultative et permet uniquement de sauvegarder la progression.',
  },
  {
    q: 'Puis-je suivre la progression de mon enfant ?',
    a: 'Oui, via l\'espace parents. Votre enfant génère un code parental à 6 chiffres depuis son profil. Entrez ce code sur son appareil pour consulter XP, streak, tâches complétées et flashcards révisées.',
  },
  {
    q: 'Y a-t-il de la publicité sur Apprenix ?',
    a: 'Non, aucune publicité d\'aucune sorte. Ni bannières, ni pop-ups, ni publicités ciblées, ni tracking comportemental.',
  },
  {
    q: 'Comment contacter le service Apprenix ?',
    a: 'Trois façons : (1) WhatsApp pour une réponse rapide le jour même, (2) Email direct à apprenix.contact@gmail.com avec réponse sous 48 h, (3) Formulaire de contact sur la page /contact. Charly lit personnellement tous les messages.',
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
      >
        <span className="text-pretty">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" />
          : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border bg-secondary/20">
          <p className="pt-3 text-pretty">{a}</p>
        </div>
      )}
    </div>
  );
};

const ParentsPage: React.FC = () => {
  const [waOpen, setWaOpen] = useState(false);

  return (
    <>
    <h1 className="sr-only">Espace Parents</h1>
    <div className="max-w-5xl mx-auto py-4 min-w-0">
      <SEO
        title="Apprenix pour les Parents — Sécurisé, Sans Pub & RGPD | Apprenix"
        description="Aide scolaire sans risque : aucune pub, aucune donnée vendue, conforme RGPD, hébergé en France. Apprenix est 100% gratuit, sans abonnement, sans surprise."
        canonical="/parents"
        keywords="apprenix parents, sécurité enfants internet, plateforme éducative sûre, RGPD enfants, zéro publicité scolaire, protection mineurs, site éducatif fiable gratuit, données élèves sécurisées, confiance parents plateforme scolaire"
        noIndex={false}
        dateModified="2026-06-22"
      />

      <PageHero
        variant="trust"
        icon={ShieldCheck}
        badge={<><Heart className="w-3 h-3 mr-1 fill-chart-1" />Pour les parents &amp; tuteurs</>}
        badgeClassName="bg-chart-1/10 text-chart-1 border-chart-1/20"
        title="Apprenix pour les parents"
        subtitle="Zéro publicité, zéro tracking, aucune donnée revendue, contenu conforme aux programmes. Tout ce que vous devez savoir pour recommander Apprenix à votre enfant en toute confiance."
        stats={[
          { value: 'RGPD', label: 'Conformité totale' },
          { value: '0 pub', label: 'Aucune publicité' },
          { value: '100 %', label: 'Gratuit & sans abonnement' },
        ]}
        cta={{ label: 'Voir les garanties sécurité', to: '/securite' }}
        ctaSecondary={{ label: 'Politique de confidentialité', to: '/politique-confidentialite' }}
      />

      {/* Bandeau engagement */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
        <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <p className="text-sm text-success leading-relaxed text-pretty">
          <strong>Engagement parental :</strong> Apprenix ne vend jamais les données de vos enfants,
          ne diffuse aucune publicité et respecte scrupuleusement la réglementation française sur
          la protection des mineurs en ligne.
        </p>
      </div>

      {/* ── Ce qu'Apprenix fait concrètement pour votre enfant ───────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-chart-4/5 border border-chart-4/20 mb-8">
        <Shield className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground mb-2">🛡️ Ce qu'Apprenix fait concrètement pour votre enfant</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-success font-bold shrink-0 mt-0.5">✓</span><span><strong className="text-foreground">Aide aux devoirs</strong> — fiches méthode pas-à-pas pour comprendre, pas pour copier.</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold shrink-0 mt-0.5">✓</span><span><strong className="text-foreground">Organisation</strong> — planning, to-do list et minuteur Pomodoro intégrés.</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold shrink-0 mt-0.5">✓</span><span><strong className="text-foreground">Mémorisation</strong> — flashcards avec répétition espacée, quiz interactifs.</span></li>
            <li className="flex items-start gap-2"><span className="text-success font-bold shrink-0 mt-0.5">✓</span><span><strong className="text-foreground">Sans risque</strong> — zéro publicité, zéro contenu inapproprié, zéro données revendues.</span></li>
          </ul>
        </div>
      </div>

      {/* ── Section "Contacter le service" — mise en avant ───────────────── */}
      <div className="section-divider pt-3 mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-chart-2 bg-chart-2/10 border border-chart-2/20 px-2.5 py-1 rounded-full mb-2">
          <MessageCircle className="w-3 h-3" aria-hidden="true" />
          Contact direct
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance mt-1">Contacter le service Apprenix</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Charly répond personnellement à chaque message.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => setWaOpen(true)}
          className="flex items-start gap-3 p-4 rounded-xl border border-chart-2/30 bg-chart-2/5 hover:bg-chart-2/10 transition-colors text-left w-full group"
        >
          <div className="w-10 h-10 rounded-full bg-chart-2/15 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-5 h-5 text-chart-2" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Réponse souvent le jour même — idéal pour une question rapide.</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-chart-2">
              Écrire sur WhatsApp <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Email */}
        <a
          href="mailto:apprenix.contact@gmail.com"
          className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:bg-secondary/40 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Email direct</p>
            <p className="text-xs text-primary mt-0.5 break-all">apprenix.contact@gmail.com</p>
            <p className="text-sm text-muted-foreground mt-1">Réponse sous 48 h</p>
          </div>
        </a>

        {/* Formulaire */}
        <Link
          to="/contact"
          className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:bg-secondary/40 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Formulaire de contact</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">Question, signalement ou suggestion — formulaire sécurisé.</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary">
              Accéder <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Info délai de réponse */}
      <div className="flex items-center gap-2 px-1 mb-8">
        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground text-pretty">
          Aucun numéro de téléphone — service géré bénévolement. WhatsApp ou email garantissent une réponse personnalisée.
        </p>
      </div>

      {/* Grille de réassurance */}
      <div className="section-divider pt-3 mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full mb-2">
          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
          Garanties parents
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance mt-1">Ce qui protège votre enfant</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Garanties concrètes, vérifiables et permanentes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {REASSURANCE.map(({ icon: Icon, color, bg, title, desc }) => (
          <Card key={title} className="h-full hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 border-border/60">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supervision */}
      <Card className="mb-8 bg-chart-4/5 border-chart-4/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-chart-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Mode Parents — suivi de progression</h2>
              <p className="text-sm text-muted-foreground">Accès via code parental sécurisé</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty mb-4">
            Votre enfant génère un <strong className="text-foreground">code parental à 6 chiffres</strong> depuis
            son profil. Entrez ce code dans l'espace parents pour consulter sa progression : XP, streak,
            tâches complétées, flashcards révisées et prochaines échéances — sans avoir besoin de son mot de passe.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/parents-espace">
              <Button size="sm" className="h-9 text-xs gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                Accéder à l'espace parents
              </Button>
            </Link>
            <Link to="/motivation">
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5">
                Voir le tableau de bord
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Conformité programmes */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8">
        <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">
            Conforme aux programmes de l'Éducation nationale
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            Tous les contenus pédagogiques d'Apprenix sont basés sur les référentiels officiels
            d'Éduscol et le Bulletin Officiel de l'Éducation nationale. Votre enfant travaille
            sur des contenus adaptés à son niveau réel.
          </p>
        </div>
      </div>

      {/* FAQ parents */}
      <div className="section-divider pt-3 mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-chart-4 bg-chart-4/10 border border-chart-4/20 px-2.5 py-1 rounded-full mb-2">
          <Heart className="w-3 h-3" aria-hidden="true" />
          FAQ parents
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground text-balance mt-1">Questions fréquentes des parents</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Réponses claires, courtes et vérifiables.</p>
      </div>
      <div className="space-y-2 mb-8">
        {FAQ_ITEMS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
      <div className="flex justify-end mb-8">
        <Link to="/faq">
          <Button size="sm" variant="outline" className="h-9 text-xs">
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
            Voir toutes les questions
          </Button>
        </Link>
      </div>

      {/* Liens bas de page */}
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link to="/securite" className="hover:text-primary transition-colors">Sécurité &amp; données</Link>
        <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
        <Link to="/cgu" className="hover:text-primary transition-colors">CGU &amp; protection mineurs</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contacter l'équipe</Link>
        <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
    <WhatsAppContactModal open={waOpen} onOpenChange={setWaOpen} />
    </>
  );
};

export default ParentsPage;
