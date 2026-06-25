import {ArrowRight, BookOpen, Brain, Calendar,
  CheckCircle, Home, MessageCircle, Sparkles, Star,
  Zap, 
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';

// Fonctionnalités phares à découvrir après l'envoi du message
const FEATURES = [
  {
    icon: Brain,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Aide aux devoirs gratuite',
    desc: 'Des fiches méthode et explications claires pour toutes les matières, accessibles instantanément.',
    href: '/aide-ia',
    cta: "Voir les fiches méthode",
  },
  {
    icon: Zap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    title: 'Flashcards intelligentes',
    desc: 'Mémorise 3× plus vite avec des révisions espacées adaptées à ton niveau.',
    href: '/flashcards',
    cta: 'Créer mes cartes',
  },
  {
    icon: Calendar,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    title: 'Planning personnalisé',
    desc: "Organise tes révisions avec un planning qui s'adapte à tes examens.",
    href: '/organisation',
    cta: 'Mon planning',
  },
  {
    icon: BookOpen,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Scanner de cours',
    desc: "Prends en photo ton cours et l'OCR en extrait les points clés en quelques secondes.",
    href: '/scanner',
    cta: 'Scanner un cours',
  },
];

const ContactMerciPage: React.FC = () => (
  <>
    <SEO
      title="Message envoyé — Merci ! | Apprenix"
      description="Votre message a bien été reçu par l'équipe Apprenix. Découvrez la plateforme scolaire gratuite pendant qu'on vous prépare une réponse."
      canonical="/contact/merci"
      noIndex={true}
    />

    {/* ── Hero ───────────────────────────────────────────────── */}
    <div className="relative overflow-hidden bg-primary">
      {/* Cercles décoratifs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary-foreground/5 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-4">
        {/* Icône animée */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-foreground/15 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-9 h-9 text-primary-foreground" strokeWidth={2} />
            </div>
          </div>
          {/* Étoiles décoratives */}
          <Sparkles className="absolute -top-1 -right-2 w-5 h-5 text-primary-foreground/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Star className="absolute -bottom-1 -left-2 w-4 h-4 text-primary-foreground/40" />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-primary-foreground text-balance">
            Message envoyé !
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-base md:text-lg xl:text-xl text-pretty max-w-md">
            Merci de nous avoir contactés. Nous vous répondrons dans les <strong className="text-primary-foreground">48 h</strong>.
          </p>
        </div>

        {/* Badge promesse */}
        <div className="flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2">
          <CheckCircle className="w-4 h-4 text-primary-foreground/80 shrink-0" />
          <span className="text-sm text-primary-foreground/90 font-medium">Tous les messages sont lus par l'équipe</span>
        </div>

        {/* Boutons */}
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-sm mt-2">
          <Button asChild variant="secondary" className="flex-1 gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </Button>
          <Button asChild className="flex-1 gap-2" variant="outline">
            <Link to="/aide-ia">
              <Brain className="w-4 h-4" />
              Essayer Apprenix
            </Link>
          </Button>
        </div>
      </div>
    </div>

    {/* ── Section "En attendant…" ─────────────────────────── */}
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">En attendant notre réponse</p>
        <h2 className="text-xl md:text-2xl xl:text-3xl font-bold text-foreground text-balance">
          Explore ce qu'Apprenix peut faire pour toi.
        </h2>
        <p className="text-muted-foreground text-sm mt-2 text-pretty max-w-md mx-auto">
          100 % gratuit, sans pub, sans inscription obligatoire.
          Des milliers d'élèves l'utilisent chaque jour.
        </p>
      </div>

      {/* Grille fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {FEATURES.map(({ icon: Icon, color, bg, title, desc, href, cta }) => (
          <Link
            key={href}
            to={href}
            className="group flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors text-balance">{title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed text-pretty">{desc}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${color} mt-2`}>
                {cta}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bandeau WhatsApp */}
      <div className="rounded-2xl border border-chart-2/30 bg-chart-2/5 p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-chart-2/15 flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 text-chart-2" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="font-semibold text-foreground text-sm">Besoin d'une réponse urgente ?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Notre WhatsApp est souvent plus rapide — réponse possible le jour même.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 border-chart-2/40 text-chart-2 hover:bg-chart-2/10"
        >
          <a
            href="https://wa.me/33667485226"
            target="_blank" rel="noopener noreferrer"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Ouvrir WhatsApp
          </a>
        </Button>
      </div>

      {/* Liens bas de page */}
      <div className="mt-8 pt-6 border-t border-border flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <Link to="/contact" className="hover:text-primary transition-colors">Renvoyer un message</Link>
        <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        <Link to="/mission" className="hover:text-primary transition-colors">Notre mission</Link>
        <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
  </>
);

export default ContactMerciPage;
