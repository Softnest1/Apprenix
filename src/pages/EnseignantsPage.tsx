import {ArrowRight, BadgeCheck, 
  BookOpen, Calculator, CheckCircle, ClipboardCheck, 
  Download, Eye, FileText, 
  FlaskConical, Globe, GraduationCap, Languages,Lock, Megaphone,Monitor,Presentation, 
  ShieldCheck, Star,Users, Zap, 
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useA11yPrefs } from '@/components/AccessibilityToolbar';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';
import { Separator } from '@/components/ui/separator';

const AVANTAGES = [
  {
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Conforme aux programmes Éduscol',
    desc: 'Tous les contenus pédagogiques sont élaborés à partir des référentiels officiels de l\'Éducation nationale et des recommandations Éduscol (BOEN, programmes 2025).',
  },
  {
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Outils variés pour chaque matière',
    desc: 'Flashcards, ressources, aide aux devoirs, outils linguistiques, maths & sciences, organisation, Deep Work… Un écosystème complet pour accompagner chaque élève.',
  },
  {
    icon: Users,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    title: 'Gratuit pour tous les élèves',
    desc: '100 % gratuit, sans exception. Aucune inégalité liée aux ressources financières des familles. Engagement écrit dans les CGU (art. 10).',
  },
  {
    icon: Megaphone,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Zéro publicité — environnement serein',
    desc: 'L\'interface est totalement épurée. Les élèves peuvent se concentrer sur l\'apprentissage sans aucune distraction publicitaire.',
  },
  {
    icon: ShieldCheck,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    title: 'Données protégées RGPD',
    desc: 'Conformité RGPD totale. Hébergement UE. Consentement parental requis pour les -15 ans (art. 8 RGPD). Zéro profilage commercial.',
  },
  {
    icon: GraduationCap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    title: 'Du CP au Bac +5',
    desc: 'Apprenix couvre l\'ensemble du parcours scolaire et universitaire, avec des contenus adaptés à chaque niveau.',
  },
];

const RESSOURCES = [
  {
    icon: BookOpen,
    title: 'Fiches de révision',
    desc: 'Créées par des enseignants selon le niveau et la matière, conformes aux référentiels Éduscol.',
    link: '/ressources',
  },
  {
    icon: FlaskConical,
    title: 'Annales & exercices',
    desc: 'Exercices type bac/brevet avec corrections, classés par matière et niveau.',
    link: '/ressources',
  },
  {
    icon: Languages,
    title: 'Outils linguistiques',
    desc: 'Correcteur, conjugueur, dictionnaire, plan de dissertation, traducteur.',
    link: '/linguistique',
  },
  {
    icon: Calculator,
    title: 'Outils maths & sciences',
    desc: 'Calculatrice scientifique, formules, tableau périodique, convertisseur d\'unités.',
    link: '/maths-sciences',
  },
];

const NIVEAUX = [
  'CP → CM2', '6e → 3e', '2nde → Terminale', 'BTS', 'Licence', 'Master', 'Grandes Écoles',
];

// Tableau de conformité synthétique pour les enseignants
const CONFORMITE_RAPIDE = [
  { icon: ShieldCheck, label: 'RGPD — Règlement UE 2016/679',      status: true },
  { icon: FileText,    label: 'LCEN — Loi n° 2004-575',            status: true },
  { icon: Lock,        label: 'HTTPS / TLS 1.3 — Chiffrement',    status: true },
  { icon: Eye,         label: 'Zéro cookie tiers / tracking',      status: true },
  { icon: Globe,       label: 'Hébergement Union Européenne',      status: true },
  { icon: Users,       label: 'Protection des mineurs (art. 8)',   status: true },
  { icon: Megaphone,   label: 'Zéro publicité comportementale',    status: true },
  { icon: Star,        label: 'Gratuité permanente (CGU art. 10)', status: true },
];

const EnseignantsPage: React.FC = () => {
  const { prefs, setPrefs } = useA11yPrefs();

  const togglePresentation = () => {
    setPrefs({ presentation: !prefs.presentation });
  };

  return (
    <div className="max-w-5xl mx-auto py-4 min-w-0">
    <h1 className="sr-only">Espace Enseignants</h1>
    <SEO
      title="Apprenix pour les Enseignants — Ressources, Outils & Kit RGPD | Apprenix"
      description="Intégrez Apprenix en classe : ressources alignées Éduscol, outils de différenciation et kit RGPD clé en main. Gratuit pour tous les enseignants de France."
      canonical="/enseignants"
      keywords="apprenix enseignants, ressources éduscol conformes, outils numériques classe collège lycée, outils pédagogiques gratuits, kit RGPD enseignants, plateforme scolaire conforme, flashcards classe, outils numériques éducation nationale, professeurs lycée collège primaire"
      noIndex={false}
      dateModified="2026-06-20"
    />

    <PageHero
      variant="trust"
      icon={GraduationCap}
      badge={<><GraduationCap className="w-3 h-3 mr-1" />Pour les enseignants</>}
      badgeClassName="bg-primary/10 text-primary border-primary/20"
      title="Apprenix pour les enseignants"
      subtitle="Recommandez Apprenix à vos élèves en toute confiance — gratuit, conforme aux programmes Éduscol, sans publicité, sans collecte de données excessive."
      stats={[
        { value: 'Éduscol', label: 'Conforme aux programmes' },
        { value: 'RGPD', label: 'Protection des données' },
        { value: '0 €', label: 'Totalement gratuit' },
      ]}
      cta={{ label: 'Voir le rapport de conformité', to: '/transparence' }}
      ctaSecondary={{ label: 'Sécurité & données', to: '/securite' }}
    />

    {/* ── 🎓 Mode Classe — accès rapide Mode Projecteur ─────────────────────── */}
    <Card className="mb-6 border-2 border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-balance flex items-center gap-2 flex-wrap">
                Mode Projecteur — pour utiliser Apprenix en classe
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Nouveau</Badge>
              </p>
              <p className="text-sm text-muted-foreground text-pretty mt-0.5">
                Police 22 px lisible à 5 m, fort contraste, sidebar masquée, curseur laser rouge, animations désactivées.
                Activez avec le bouton ci-dessous ou appuyez sur <kbd className="bg-muted border border-border rounded px-1 font-mono text-xs">F7</kbd> n'importe où sur le site.
              </p>
            </div>
          </div>
          <Button
            onClick={togglePresentation}
            className="shrink-0 gap-2 h-10"
            variant={prefs.presentation ? 'secondary' : 'default'}
          >
            <Presentation className="w-4 h-4" />
            {prefs.presentation ? '✓ Mode Projecteur actif — cliquer pour quitter' : 'Activer le Mode Projecteur'}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* ── Bandeau conformité EN ─────────────────────────────────────────────── */}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
      <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <p className="text-base text-foreground leading-relaxed text-pretty">
        <strong>Conforme programmes Éducation nationale :</strong> tous nos contenus sont
        élaborés à partir des référentiels officiels (Éduscol, BOEN, programmes 2025).
      </p>
    </div>

    {/* ── Tableau de conformité rapide ─────────────────────────────────────── */}
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="section-divider pt-1 mb-3">
          <h2 className="text-lg font-bold text-foreground text-balance flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-success shrink-0" />
            Tableau de conformité réglementaire
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Conforme RGPD, LCEN, Éduscol et CNIL — vérifié juin 2026.</p>
        </div>
        <Link to="/transparence">
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
            <FileText className="w-3 h-3" />
            Rapport complet
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {CONFORMITE_RAPIDE.map(({ icon: Icon, label, status }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-2.5 ${i < CONFORMITE_RAPIDE.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-foreground text-pretty">{label}</span>
              {status
                ? <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0 gap-1"><CheckCircle className="w-3 h-3" />Conforme</Badge>
                : <Badge className="bg-warning/10 text-warning border-warning/20 text-xs shrink-0">Partiel</Badge>
              }
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Dernière vérification : juin 2026 — Sources : CNIL, Éduscol, MENJ.{' '}
        <Link to="/transparence" className="text-primary hover:underline">
          Voir le rapport de transparence détaillé →
        </Link>
      </p>
    </div>

    {/* ── Niveaux couverts ─────────────────────────────────────────────────── */}
    <div className="mb-8">
      <div className="section-divider pt-1 mb-3">
      <h2 className="text-lg font-bold text-foreground text-balance">Niveaux couverts</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Du CP au Bac+5, tous les cycles de l'Éducation nationale.</p>
    </div>
      <div className="flex flex-wrap gap-2">
        {NIVEAUX.map(n => (
          <Badge key={n} variant="secondary" className="text-xs px-3 py-1">{n}</Badge>
        ))}
      </div>
    </div>

    {/* ── Guide 3 étapes — intégrer Apprenix en classe ────────────────────── */}
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          🎓 Comment intégrer Apprenix dans votre classe ?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Partagez le lien',
              desc: <>Envoyez simplement <strong className="text-foreground">apprenix.fr</strong> à vos élèves — aucune installation, aucun compte obligatoire pour commencer.</>,
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              step: '02',
              title: 'Présentez en classe',
              desc: <>Activez le <strong className="text-foreground">Mode Projecteur</strong> (touche <kbd className="bg-muted border border-border rounded px-1 font-mono text-xs">F7</kbd>) pour une police lisible à 5 m et un fort contraste.</>,
              color: 'text-chart-4',
              bg: 'bg-chart-4/10',
            },
            {
              step: '03',
              title: 'Utilisez le kit RGPD',
              desc: <><strong className="text-foreground">Téléchargez le kit enseignant</strong> ci-dessous pour répondre aux exigences de votre établissement : rapport de conformité, politique de confidentialité, CGU.</>,
              color: 'text-success',
              bg: 'bg-success/10',
            },
          ].map(({ step, title, desc, color, bg }) => (
            <div key={step} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <span className={`text-xs font-extrabold ${color}`}>{step}</span>
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold mb-1 ${color}`}>{title}</p>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* ── Avantages ────────────────────────────────────────────────────────── */}
    <div className="section-divider pt-3 mb-4">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full mb-2">
        <GraduationCap className="w-3 h-3" aria-hidden="true" />
        Pourquoi Apprenix
      </span>
      <h2 className="text-xl md:text-2xl xl:text-3xl font-extrabold text-foreground text-balance mt-1">Pourquoi choisir Apprenix pour votre classe ?</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Gratuit, conforme Éduscol, sans publicité et facile à recommander.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {AVANTAGES.map(({ icon: Icon, color, bg, title, desc }) => (
        <Card key={title} className="h-full hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 border-border/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* ── Ressources disponibles ───────────────────────────────────────────── */}
    <div className="section-divider pt-3 mb-4">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-chart-3 bg-chart-3/10 border border-chart-3/20 px-2.5 py-1 rounded-full mb-2">
        <BookOpen className="w-3 h-3" aria-hidden="true" />
        Ressources pédagogiques
      </span>
      <h2 className="text-xl md:text-2xl xl:text-3xl font-extrabold text-foreground text-balance mt-1">Ressources disponibles pour vos cours</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Fiches, exercices, outils linguistiques et mathématiques.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {RESSOURCES.map(({ icon: Icon, title, desc, link }) => (
        <Link to={link} key={title}>
          <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{title}</p>
                <p className="text-sm text-muted-foreground text-pretty">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>

    {/* ── Conformité Éduscol ───────────────────────────────────────────────── */}
    <Card className="mb-8 bg-chart-1/5 border-chart-1/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <CheckCircle className="w-5 h-5 text-chart-1 shrink-0 mt-0.5" />
          <h2 className="text-base font-semibold text-foreground">Conformité Éduscol</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed text-pretty mb-3">
          Nos contenus pédagogiques (fiches de révision, exercices, méthodes, formules)
          sont construits à partir des programmes officiels publiés sur le portail Éduscol
          du Ministère de l'Éducation nationale et de la Jeunesse.
        </p>
        <p className="text-sm text-muted-foreground text-pretty">
          Matières couvertes : Maths, Physique-Chimie, SVT, Histoire-Géographie, Français,
          Anglais, Espagnol, Allemand, Philosophie, SES, NSI/Informatique.
        </p>
      </CardContent>
    </Card>

    {/* ── Kit enseignant ───────────────────────────────────────────────────── */}
    <div className="mb-8">
      <div className="section-divider pt-3 mb-4">
      <h2 className="text-lg md:text-xl font-bold text-foreground text-balance flex items-center gap-2">
        <Download className="w-4 h-4 text-primary shrink-0" />Kit enseignant
      </h2>
      <p className="text-sm text-muted-foreground mt-0.5">Documents à partager avec vos élèves et leur famille.</p>
    </div>
      <p className="text-base text-muted-foreground mb-4 text-pretty">
        Ces documents vous permettent de présenter Apprenix à vos élèves, à leur famille,
        ou à votre établissement.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            titre: 'Rapport de transparence',
            desc: 'Conformité légale complète : RGPD, LCEN, sources pédagogiques, hébergeurs, engagements.',
            lien: '/transparence',
            icon: ClipboardCheck,
          },
          {
            titre: 'Politique de confidentialité',
            desc: 'Protection des données des élèves, mineurs, droits RGPD, DPO.',
            lien: '/politique-confidentialite',
            icon: ShieldCheck,
          },
          {
            titre: "Conditions d'utilisation",
            desc: 'Engagement gratuité permanente, zéro pub, non-commercial (art. 1 et 10).',
            lien: '/cgu',
            icon: FileText,
          },
          {
            titre: 'Sécurité & données',
            desc: 'HTTPS, JWT, hébergement UE, zéro cookie tiers, protection mineurs.',
            lien: '/securite',
            icon: Lock,
          },
        ].map(({ titre, desc, lien, icon: Icon }) => (
          <Link to={lien} key={titre}>
            <Card className="h-full hover:border-primary/30 transition-colors group cursor-pointer">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{titre}</p>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>

    <Separator className="mb-8" />

    {/* ── CTA contact ─────────────────────────────────────────────────────── */}
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">
            Une question sur l'usage pédagogique d'Apprenix ?
          </p>
          <p className="text-sm text-muted-foreground text-pretty">
            Notre équipe est disponible pour répondre à vos questions d'utilisation en classe
            ou pour tout contrôle réglementaire.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/contact">
            <Button size="sm" className="btn-cta h-9 text-white font-semibold px-4 rounded-xl">
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Nous contacter
            </Button>
          </Link>
          <Link to="/transparence">
            <Button size="sm" variant="outline" className="h-9 btn-action rounded-xl">
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              Transparence
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>

    {/* Liens bas de page */}
    <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/ressources" className="hover:text-primary transition-colors">Ressources pédagogiques</Link>
      <Link to="/parents" className="hover:text-primary transition-colors">Pour les parents</Link>
      <Link to="/securite" className="hover:text-primary transition-colors">Sécurité &amp; données</Link>
      <Link to="/transparence" className="hover:text-primary transition-colors">Transparence</Link>
      <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
      <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
    </div>
    </div>
  );
};

export default EnseignantsPage;
