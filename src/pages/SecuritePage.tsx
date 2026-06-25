import {ArrowRight, 
  CheckCircle, Database, Eye,Globe,Key, Lock, Server, 
  ShieldCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import TrustBar from '@/components/ui/TrustBar';

const CHECKLIST = [
  {
    icon: Globe,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'HTTPS / SSL — Chiffrement des communications',
    desc: 'Toutes les connexions au site sont chiffrées via HTTPS (TLS 1.3). Les données transitent de manière sécurisée entre votre navigateur et nos serveurs.' },
  {
    icon: Key,
    color: 'text-warning',
    bg: 'bg-warning/10',
    title: 'Hachage des mots de passe',
    desc: 'Les mots de passe ne sont jamais stockés en clair. Ils sont hachés avec un algorithme sécurisé avant d\'être sauvegardés. Même nous ne pouvons pas lire votre mot de passe.' },
  {
    icon: Lock,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    title: 'Sessions sécurisées (JWT)',
    desc: 'Les sessions utilisateur sont gérées par des JSON Web Tokens signés. Chaque session expire automatiquement et ne peut pas être falsifiée.' },
  {
    icon: Server,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    title: 'Hébergement en Union Européenne',
    desc: 'Les données sont hébergées prioritairement dans des centres de données situés dans l\'UE (Supabase eu-west, Vercel). Les éventuels transferts hors UE sont encadrés par les clauses contractuelles types de la Commission européenne.' },
  {
    icon: ShieldCheck,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Conformité RGPD totale',
    desc: 'Notre traitement des données personnelles est conforme au Règlement Général sur la Protection des Données (UE 2016/679) et à la loi Informatique et Libertés.' },
  {
    icon: Database,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Données locales sous votre contrôle',
    desc: 'La majorité de vos données (notes, flashcards, progression) sont stockées dans votre navigateur (localStorage). Vous pouvez les supprimer à tout moment depuis les paramètres de votre navigateur.' },
  {
    icon: Eye,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    title: 'Zéro tracking publicitaire',
    desc: 'Aucun cookie de tracking, aucune régie publicitaire, aucun pixel Facebook ou Google Analytics à des fins publicitaires. Vos habitudes de navigation ne sont jamais revendues.' },
  {
    icon: CheckCircle,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Principe du moindre privilège',
    desc: 'L\'accès aux données est restreint au strict nécessaire. Les données d\'un utilisateur ne sont jamais accessibles à un autre utilisateur.' },
];

const RIGHTS = [
  { title: 'Accès (art. 15)', desc: 'Obtenez une copie de toutes vos données' },
  { title: 'Rectification (art. 16)', desc: 'Corrigez des données inexactes' },
  { title: 'Effacement (art. 17)', desc: 'Droit à l\'oubli — suppression complète' },
  { title: 'Portabilité (art. 20)', desc: 'Recevez vos données dans un format lisible' },
  { title: 'Opposition (art. 21)', desc: 'Refusez un traitement de données' },
  { title: 'Limitation (art. 18)', desc: 'Suspendez temporairement un traitement' },
];

const SecuritePage: React.FC = () => (
  <div className="max-w-5xl mx-auto py-4 min-w-0">
      <h1 className="sr-only">Sécurité & Protection des données — Apprenix</h1>
    <SEO
      title="Sécurité & Protection des Données — HTTPS, RGPD & EU | Apprenix"
      description="Apprenix protège vos données : HTTPS, hébergement en Europe, conformité RGPD, aucune donnée vendue. Transparence totale. Sécurisé pour les mineurs."
      canonical="/securite"
      keywords="sécurité données apprenix, RGPD plateforme scolaire, HTTPS scolaire, hébergement Europe conforme, zero tracking élèves, conformité LCEN, protection données mineurs, cybersécurité scolaire"
      noIndex={false}
      dateModified="2026-06-20"
    />

    <PageHero
      variant="trust"
      icon={ShieldCheck}
      badge={<><ShieldCheck className="w-3 h-3 mr-1" />Sécurité &amp; données</>}
      badgeClassName="bg-success/10 text-success border-success/20"
      title="Sécurité & Protection des données"
      subtitle="HTTPS, chiffrement des données, zéro cookie publicitaire, hébergement en Union Européenne — voici exactement comment vos données et celles de vos enfants sont protégées."
      stats={[
        { value: 'HTTPS', label: 'Chiffrement TLS 1.3' },
        { value: 'UE', label: 'Hébergement Union Européenne' },
        { value: '72 h', label: 'Notification violation RGPD' },
      ]}
      cta={{ label: 'Voir la politique de confidentialité', to: '/politique-confidentialite' }}
    />

    <TrustBar className="mb-6" />

    {/* Bandeau vert confiance */}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
      <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
      <p className="text-base text-success leading-relaxed text-pretty">
        <strong>Engagement sécurité :</strong> En cas de violation de données présentant un risque,
        vous serez notifié dans les 72 heures conformément à l'article 33 du RGPD.
      </p>
    </div>

    {/* Checklist sécurité */}
    <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">Checklist de sécurité</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Mesures techniques actives sur la plateforme.</p>
    </div>
    <div className="space-y-3 mb-8">
      {CHECKLIST.map(({ icon: Icon, color, bg, title, desc }) => (
        <Card key={title}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1 text-balance">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
            </div>
            <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Vos droits RGPD */}
    <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">Vos droits RGPD</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Comment exercer vos droits sur vos données personnelles.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
      {RIGHTS.map(({ title, desc }) => (
        <div key={title} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border">
          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <Card className="mb-8 bg-primary/5 border-primary/20">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed text-pretty mb-3">
          Pour exercer vos droits, envoyez un email à{' '}
          <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline font-medium">
            apprenix.contact@gmail.com
          </a>.
          Réponse garantie sous{' '}
          <strong className="text-foreground">1 mois maximum</strong> (art. 12-3 RGPD).
          Vous pouvez également déposer une réclamation auprès de la{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            CNIL
          </a>.
        </p>
        <Link to="/espace/profil">
          <Button size="sm" variant="outline" className="h-9 text-xs">
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
            Gérer mes données (profil)
          </Button>
        </Link>
      </CardContent>
    </Card>

    {/* Liens bas de page */}
    <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
      <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
      <Link to="/parents" className="hover:text-primary transition-colors">Pour les parents</Link>
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">CNIL</a>
      <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
    </div>
  </div>
);

export default SecuritePage;
