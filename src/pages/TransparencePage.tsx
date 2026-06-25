import {
  AlertTriangle, ArrowRight, BadgeCheck,BookOpen, 
  Building2, CheckCircle, 
  ClipboardList, ExternalLink, Eye, 
  FileText, Fingerprint,Globe,GraduationCap, 
  HandshakeIcon, Heart, Lock,Mail, MapPin, Megaphone, Phone, Scale, Server, 
  ShieldCheck, Star,User } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import { Separator } from '@/components/ui/separator';
import TrustBar from '@/components/ui/TrustBar';

// ─── Données de conformité ────────────────────────────────────────────────────

const CONFORMITE = [
  {
    id: 'lcen',
    label: 'LCEN — Loi n° 2004-575',
    desc: 'Mentions légales complètes (éditeur, hébergeur, adresse, email). Responsabilité de l\'éditeur déclarée.',
    status: 'conforme',
    lien: '/mentions-legales',
    lienLabel: 'Voir les mentions légales' },
  {
    id: 'rgpd',
    label: 'RGPD — Règlement UE 2016/679',
    desc: 'Politique de confidentialité détaillée. Données minimisées, hébergement UE, droit d\'accès/suppression garanti.',
    status: 'conforme',
    lien: '/politique-confidentialite',
    lienLabel: 'Voir la politique' },
  {
    id: 'cgu',
    label: "CGU — Conditions d'utilisation",
    desc: 'Article 10 : engagement de gratuité totale et permanente. Article 5 : zéro publicité comportementale.',
    status: 'conforme',
    lien: '/cgu',
    lienLabel: 'Lire les CGU' },
  {
    id: 'mineur',
    label: 'Protection des mineurs — Art. 8 RGPD',
    desc: 'Usage sans compte possible (0 donnée collectée). Compte avec consentement parental pour les -15 ans. Aucun profilage commercial.',
    status: 'conforme',
    lien: '/securite',
    lienLabel: 'Voir la sécurité' },
  {
    id: 'cookies',
    label: 'Cookies — Directive ePrivacy',
    desc: 'Zéro cookie tiers. Zéro cookie publicitaire. Seuls des cookies de session essentiels sont utilisés.',
    status: 'conforme',
    lien: '/politique-confidentialite',
    lienLabel: 'Voir la politique cookies' },
  {
    id: 'lcen_moderation',
    label: 'Modération — LCEN art. 6',
    desc: 'Signalement des contenus illicites disponible. Contact d\'abus : apprenix.contact@gmail.com',
    status: 'conforme',
    lien: '/contact',
    lienLabel: 'Signaler un contenu' },
  {
    id: 'hebergement',
    label: 'Hébergement — Union Européenne',
    desc: 'Supabase (eu-west), Vercel (région EU). Transferts hors UE encadrés par clauses contractuelles types CE.',
    status: 'conforme',
    lien: '/mentions-legales',
    lienLabel: 'Voir les hébergeurs' },
  {
    id: 'accessibilite',
    label: 'Accessibilité — RGAA 4.1 (partiel)',
    desc: 'Contraste WCAG AA respecté, navigation clavier, attributs ARIA, dark mode natif, viewport responsive.',
    status: 'partiel',
    lien: null,
    lienLabel: null },
];

const SOURCES_PEDAGOGIQUES = [
  {
    icon: BookOpen,
    titre: 'Éduscol — Portail national des professionnels de l\'éducation',
    url: 'https://eduscol.education.fr',
    desc: 'Référentiel principal pour les fiches de révision, programmes, méthodes par matière et niveau.',
    matières: 'Toutes matières — CP au Bac' },
  {
    icon: FileText,
    titre: 'BOEN — Bulletin officiel de l\'Éducation nationale',
    url: 'https://www.education.gouv.fr/bo',
    desc: 'Programmes officiels en vigueur. Tous les référentiels sont issus des arrêtés publiés au BOEN.',
    matières: 'Programmes 2019–2025' },
  {
    icon: GraduationCap,
    titre: 'Canopé — Réseau de création et d\'accompagnement pédagogiques',
    url: 'https://www.reseau-canope.fr',
    desc: 'Ressources et méthodes pédagogiques officielles de l\'Éducation nationale.',
    matières: 'Méthodes, outils, supports' },
  {
    icon: Star,
    titre: 'Lumni — Plateforme éducative France Télévisions',
    url: 'https://www.lumni.fr',
    desc: 'Vidéos et ressources pédagogiques gratuites reconnues par le MEN.',
    matières: 'Maternelle au lycée' },
];

const ENGAGEMENTS_ECRITS = [
  {
    icon: Star,
    ref: 'CGU Art. 10',
    titre: 'Gratuité permanente et totale',
    texte: '« Apprenix s\'engage à maintenir l\'ensemble de ses fonctionnalités gratuitement, sans abonnement, sans freemium, pour une durée illimitée. »' },
  {
    icon: Megaphone,
    ref: 'CGU Art. 5',
    titre: 'Zéro publicité',
    texte: '« Aucune publicité de quelque nature que ce soit ne sera diffusée sur la plateforme — ni bannières, ni pop-ups, ni publicités ciblées, ni tracking comportemental à des fins commerciales. »' },
  {
    icon: ShieldCheck,
    ref: 'Politique de confidentialité',
    titre: 'Non-revente des données',
    texte: '« Les données personnelles des utilisateurs ne sont jamais revendues, louées ni partagées avec des tiers à des fins commerciales ou publicitaires. »' },
  {
    icon: Heart,
    ref: 'CGU Art. 1',
    titre: 'Projet non-commercial',
    texte: '« Apprenix est exploité par un particulier à titre non commercial, sans but lucratif, sans investisseurs, sans actionnaires et sans objectif de rentabilité. »' },
];

const HEBERGEURS = [
  {
    nom: 'Supabase Inc.',
    role: 'Base de données, authentification, stockage',
    region: 'eu-west-1 (Irlande, Union Européenne)',
    site: 'https://supabase.com',
    dpa: 'DPA disponible sur supabase.com/legal',
    rgpd: 'Conforme RGPD — clauses contractuelles types CE' },
  {
    nom: 'Vercel Inc.',
    role: 'Hébergement web, CDN, déploiement',
    region: 'Région Europe (Frankfurt, Paris)',
    site: 'https://vercel.com',
    dpa: 'DPA disponible sur vercel.com/legal',
    rgpd: 'Conforme RGPD — Privacy Shield remplacé par clauses CE' },
];

// ─── Sous-composants ─────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: 'conforme' | 'partiel' }> = ({ status }) => (
  status === 'conforme'
    ? <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0">✓ Conforme</Badge>
    : <Badge className="bg-warning/10 text-warning border-warning/20 text-xs shrink-0">~ Partiel</Badge>
);

// ─── Page principale ──────────────────────────────────────────────────────────

const TransparencePage: React.FC = () => {
  const [sectionOuverte, setSectionOuverte] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSectionOuverte(prev => prev === id ? null : id);

  return (
    <div className="max-w-5xl mx-auto py-4 min-w-0">
    <h1 className="sr-only">Rapport de transparence</h1>
      <SEO
        title="Transparence & Conformité — RGPD, LCEN & Éduscol | Apprenix"
        description="Transparence Apprenix : sources pédagogiques, conformité RGPD, LCEN et RGAA 4.1, rapport de sécurité. Tout sur notre fonctionnement."
        canonical="/transparence"
        keywords="transparence apprenix, rapport RGPD scolaire, conformité LCEN éducation, protection mineurs internet, sources eduscol vérifiées, hébergeur EU, DPO données élèves, confiance plateforme éducative"
        noIndex={false}
        dateModified="2026-06-20"
      />

      <PageHero
        variant="trust"
        icon={ShieldCheck}
        badge={<><ShieldCheck className="w-3 h-3 mr-1" />Rapport de transparence officiel</>}
        badgeClassName="bg-success/10 text-success border-success/20"
        title="Transparence & Conformité légale"
        subtitle="Toutes les informations légales, techniques et pédagogiques en un seul document — à destination des parents, enseignants, inspecteurs et autorités de contrôle."
        stats={[
          { value: 'RGPD', label: 'Règlement UE 2016/679' },
          { value: 'LCEN', label: 'Loi n° 2004-575' },
          { value: 'Juin 2026', label: 'Dernière mise à jour' },
        ]}
        cta={{ label: 'Voir les CGU', to: '/cgu' }}
        ctaSecondary={{ label: 'Mentions légales', to: '/mentions-legales' }}
      />

      <TrustBar className="mb-6" />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. IDENTITÉ DE L'ÉDITEUR                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">1. Identité de l'éditeur</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Informations légales complètes sur le créateur de la plateforme.</p>
        </div>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-chart-4" />
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Nom complet</p>
                  <p className="text-sm font-semibold text-foreground">Charly Soudan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Statut juridique</p>
                  <p className="text-sm font-semibold text-foreground">Particulier — non-commerçant</p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Art. 6 LCEN — sans but lucratif</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Ville</p>
                  <p className="text-sm font-semibold text-foreground">Tremblay-en-France, 93290</p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Seine-Saint-Denis, France</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Contact éditeur / DPO</p>
                <a
                    href={`mailto:${atob('YXBwcmVuaXguY29udGFjdEBnbWFpbC5jb20=')}`}
                    className="text-sm font-semibold text-primary hover:underline break-all"
                    aria-label="Envoyer un email à Apprenix"
                  >
                    apprenix&#46;contact&#64;gmail&#46;com
                  </a>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">Réponse sous 48 h ouvrées</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Site web</p>
                <p className="text-sm font-semibold text-foreground">
                  apprenix.org
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Scale className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed text-pretty">
                <strong>Déclaration de non-commercialité :</strong> Apprenix est exploité par un
                particulier à titre strictement non commercial, sans inscription au Registre du Commerce
                et des Sociétés (RCS), sans numéro SIRET, sans chiffre d'affaires, sans investisseur.
                Il n'existe aucun actionnaire, aucune société mère, aucun groupe financier derrière ce projet.
              </p>
            </div>
            <div className="text-right">
              <Link to="/mentions-legales">
                <Button variant="outline" size="sm" className="h-9 text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Mentions légales complètes
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. TABLEAU DE CONFORMITÉ RÉGLEMENTAIRE                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-success" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">2. Tableau de conformité réglementaire</h2>
          <p className="text-sm text-muted-foreground mt-0.5">LCEN, RGPD, CNIL, Éduscol — vérifications section par section.</p>
        </div>
        </div>

        <div className="space-y-2">
          {CONFORMITE.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:border-border/80 transition-colors"
              onClick={() => toggle(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <StatusBadge status={item.status as 'conforme' | 'partiel'} />
                    </div>
                    {sectionOuverte === item.id && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                          {item.desc}
                        </p>
                        {item.lien && (
                          <Link
                            to={item.lien}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ArrowRight className="w-3 h-3" />
                            {item.lienLabel}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {sectionOuverte === item.id ? '▲' : '▼'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score conformité */}
        <div className="mt-4 p-4 rounded-xl bg-success/5 border border-success/20 flex items-center gap-3">
          <BadgeCheck className="w-6 h-6 text-success shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">
              7 réglementations sur 8 : conformité totale
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              RGAA 4.1 partiellement conforme (déclaration honnête — audit professionnel non réalisé à ce stade).
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. ENGAGEMENTS ÉCRITS DANS LES CGU                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HandshakeIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">3. Engagements écrits dans les CGU</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Ce qui est gravé dans nos Conditions Générales d'Utilisation.</p>
        </div>
        </div>
        <p className="text-base text-muted-foreground mb-4 text-pretty">
          Ces engagements sont formellement inscrits dans les Conditions Générales d'Utilisation
          et sont juridiquement opposables à l'éditeur.
        </p>

        <div className="space-y-3">
          {ENGAGEMENTS_ECRITS.map(({ icon: Icon, ref, titre, texte }) => (
            <Card key={titre}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{titre}</p>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 font-mono">{ref}</Badge>
                    </div>
                    <blockquote className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3 text-pretty">
                      {texte}
                    </blockquote>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-right">
          <Link to="/cgu">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Lire les CGU complètes
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. SOURCES PÉDAGOGIQUES & CONFORMITÉ EN                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-chart-1/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-chart-1" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">4. Sources pédagogiques &amp; conformité Éducation nationale</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Référentiels officiels Éduscol et programmes du BOEN.</p>
        </div>
        </div>

        {/* Badge MEN */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
          <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Contenus élaborés à partir des référentiels officiels
            </p>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              L'intégralité des fiches de révision, exercices, formules et méthodes est construite
              à partir des programmes officiels publiés par le Ministère de l'Éducation nationale
              et de la Jeunesse (MENJ). Aucun contenu commercial ou promotionnel.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {SOURCES_PEDAGOGIQUES.map(({ icon: Icon, titre, url, desc, matières }) => (
            <Card key={titre}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{titre}</p>
                      <Badge variant="secondary" className="text-xs shrink-0">{matières}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">{desc}</p>
                    <a
                      href={url}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {url}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. HÉBERGEURS & SOUS-TRAITANTS                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4 text-chart-3" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">5. Hébergeurs &amp; sous-traitants techniques</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Qui héberge vos données et où elles sont stockées.</p>
        </div>
        </div>

        <div className="space-y-3">
          {HEBERGEURS.map((h) => (
            <Card key={h.nom}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-bold text-foreground">{h.nom}</p>
                  <Badge className="bg-success/10 text-success border-success/20 text-xs">
                    {h.rgpd.includes('Conforme') ? '✓ ' : ''}{h.rgpd.split(' — ')[0]}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Rôle :</strong> {h.role}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Globe className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Région :</strong> {h.region}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">DPA :</strong> {h.dpa}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <a href={h.site} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {h.site}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 6. RAPPORT D'ACTIVITÉ — MODÈLE ÉCONOMIQUE                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">6. Rapport d'activité &amp; modèle économique</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Transparence totale sur le financement et l'activité.</p>
        </div>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            {/* Chiffres clés */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: '0 €', label: 'Chiffre d\'affaires', icon: Building2 },
                { val: '0', label: 'Investisseurs', icon: Fingerprint },
                { val: '0', label: 'Publicités', icon: Megaphone },
                { val: '1', label: 'Créateur solo', icon: User },
              ].map(({ val, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/40 text-center gap-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xl font-bold text-foreground">{val}</span>
                  <span className="text-sm text-muted-foreground text-balance leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Modèle économique :</strong> Apprenix ne génère{' '}
                <strong className="text-foreground">aucun revenu</strong> d'aucune sorte.
                Les coûts d'hébergement (Supabase, Vercel) sont pris en charge personnellement
                par le créateur, Charly Soudan.
              </p>
              <p>
                <strong className="text-foreground">Pas de monétisation future prévue :</strong> L'engagement
                de gratuité totale est inscrit dans les CGU (article 10) et ne peut être retiré
                sans notification préalable aux utilisateurs.
              </p>
              <p>
                <strong className="text-foreground">Pas de collecte de données à des fins commerciales :</strong>{' '}
                Les données utilisateurs ne sont ni vendues, ni monétisées, ni transmises à des tiers
                à des fins publicitaires.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 7. PROTECTION DES MINEURS                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-success" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">7. Protection des mineurs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Mesures spécifiques pour la sécurité des utilisateurs mineurs.</p>
        </div>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="space-y-3">
              {[
                {
                  icon: Eye,
                  txt: 'Usage sans compte autorisé : aucune donnée collectée pour les visiteurs anonymes (mineurs ou non).' },
                {
                  icon: ShieldCheck,
                  txt: 'Conformément à l\'article 8 du RGPD, les enfants de moins de 15 ans ne peuvent créer de compte qu\'avec le consentement parental.' },
                {
                  icon: Megaphone,
                  txt: 'Zéro publicité comportementale : aucun profilage à des fins commerciales, en particulier pour les mineurs.' },
                {
                  icon: Lock,
                  txt: 'Aucune donnée d\'un mineur n\'est transmise à des tiers à des fins commerciales ou publicitaires.' },
                {
                  icon: AlertTriangle,
                  txt: 'Mécanisme de signalement disponible : tout contenu inapproprié peut être signalé via apprenix.contact@gmail.com.' },
              ].map(({ icon: Icon, txt }) => (
                <div key={txt} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{txt}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="text-right">
              <Link to="/securite">
                <Button variant="outline" size="sm" className="h-9 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Voir la page Sécurité & données
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 8. CONTACTS OFFICIELS                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="section-divider pt-2 mb-3">
          <h2 className="text-lg md:text-2xl xl:text-3xl font-bold text-foreground text-balance">8. Contacts officiels</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Responsable légal, DPO et canaux de contact officiels.</p>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              role: 'Éditeur responsable',
              nom: 'Charly Soudan',
              email: 'apprenix.contact@gmail.com',
              délai: 'Sous 48 h ouvrées',
              icon: User,
              desc: 'Questions légales, droits RGPD, réclamations' },
            {
              role: 'Délégué à la Protection des Données (DPO)',
              nom: 'Charly Soudan (éditeur)',
              email: 'apprenix.contact@gmail.com',
              délai: 'Sous 30 jours',
              icon: Fingerprint,
              desc: 'Exercice des droits RGPD : accès, rectification, suppression, portabilité' },
            {
              role: 'Signalement contenus illicites',
              nom: 'Modération Apprenix',
              email: 'apprenix.contact@gmail.com',
              délai: 'Traitement prioritaire',
              icon: AlertTriangle,
              desc: 'Art. 6 LCEN — signalement de tout contenu illicite ou inapproprié' },
            {
              role: 'Autorité de contrôle (RGPD)',
              nom: 'Commission Nationale Informatique et Libertés',
              email: null,
              délai: null,
              icon: Scale,
              desc: 'Toute réclamation peut également être adressée à la CNIL',
              lien: 'https://www.cnil.fr/fr/plaintes',
              lienLabel: 'Déposer une plainte CNIL' },
          ].map(({ role, nom, email, délai, icon: Icon, desc, lien, lienLabel }) => (
            <Card key={role} className="h-full">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide leading-tight">{role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{nom}</p>
                  <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
                </div>
                {email && (
                  <a href={`mailto:${atob('YXBwcmVuaXguY29udGFjdEBnbWFpbC5jb20=')}`} className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 shrink-0" />
                    apprenix&#46;contact&#64;gmail&#46;com
                  </a>
                )}
                {délai && (
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    <strong className="text-foreground">Délai :</strong> {délai}
                  </p>
                )}
                {lien && (
                  <a href={lien} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {lienLabel}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── CTA récapitulatif ───────────────────────────────────────────────── */}
      <Card className="bg-success/5 border-success/20 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-success" />
            Récapitulatif — Documents légaux disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { label: 'Mentions légales (LCEN)', href: '/mentions-legales' },
              { label: 'Politique de confidentialité (RGPD)', href: '/politique-confidentialite' },
              { label: "Conditions d'utilisation (CGU)", href: '/cgu' },
              { label: 'Sécurité & protection des données', href: '/securite' },
              { label: 'Pour les enseignants', href: '/enseignants' },
              { label: 'Centre d\'aide (FAQ)', href: '/faq' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-success/5 transition-colors group"
              >
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liens bas de page */}
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
        <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
        <Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link>
        <Link to="/securite" className="hover:text-primary transition-colors">Sécurité</Link>
        <Link to="/enseignants" className="hover:text-primary transition-colors">Pour les enseignants</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
        <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
  );
};

export default TransparencePage;
