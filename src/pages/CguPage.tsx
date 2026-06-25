import { ArrowLeft, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import TrustBar from '@/components/ui/TrustBar';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const CguPage: React.FC = () => (
  <div className="max-w-5xl mx-auto py-4 min-w-0">
    <SEO
      title="CGU — Conditions Générales d'Utilisation | Apprenix"
      description="CGU Apprenix : droits, obligations, contenu autorisé, signalement d'abus et propriété intellectuelle. À lire avant d'utiliser la plateforme."
      canonical="/cgu"
      keywords="CGU apprenix, conditions utilisation plateforme éducative, règles usage scolaire, droits utilisateurs, légal plateforme gratuite, conditions site éducatif"
      noIndex={false}
      dateModified="2026-06-18"
    />
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Retour à l'accueil
    </Link>

    <h1 className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground mb-2 text-balance">
      Conditions Générales d'Utilisation (CGU)
    </h1>
    <p className="text-base text-muted-foreground mb-2">
      En accédant ou en utilisant Apprenix, vous acceptez pleinement et sans réserve les présentes
      CGU. Veuillez les lire attentivement avant toute utilisation du service.
    </p>
    <p className="text-base text-muted-foreground mb-8">
      Dernière mise à jour : juin 2026 — Version 2.0
    </p>

    {/* Barre de confiance — garanties clés */}
    <TrustBar className="mb-6" />

    {/* Badge */}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-chart-4/5 border border-chart-4/20 mb-8">
      <ShieldCheck className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
      <p className="text-base text-chart-4 leading-relaxed">
        Apprenix est un service <strong>entièrement gratuit</strong>, exploité par un particulier
        non commerçant, sans but lucratif, destiné exclusivement à l'aide pédagogique.
      </p>
    </div>

    <Section title="1. Présentation du service">
      <p>
        <strong className="text-foreground">Apprenix</strong> est une plateforme éducative en ligne
        100&nbsp;% gratuite, sans publicité, destinée aux élèves et étudiants de tous niveaux
        (du CP au Bac&nbsp;+&nbsp;5). Elle propose des outils d'aide aux devoirs (IA pédagogique,
        explication de questions), des ressources pédagogiques (chapitres, formules, méthodologies,
        annales), des flashcards, un système de notes personnelles, des outils d'organisation et
        de productivité scolaire.
      </p>
      <p>
        L'accès à Apprenix est libre et gratuit. Aucune inscription n'est obligatoire pour la
        majorité des fonctionnalités. La création d'un compte facultatif permet de sauvegarder
        sa progression et ses données personnelles.
      </p>
      <p>
        Le service est exploité par un <strong className="text-foreground">particulier non commerçant</strong>,
        sans activité commerciale, sans publicité et sans aucune source de revenus liée au service.
      </p>
    </Section>

    <Section title="2. Acceptation des CGU">
      <p>
        L'utilisation du site Apprenix, quelle qu'en soit la forme (navigation, création de compte,
        utilisation d'un outil), implique l'acceptation pleine et entière des présentes CGU dans
        leur version en vigueur au moment de l'utilisation.
      </p>
      <p>
        Si vous n'acceptez pas ces conditions, veuillez cesser immédiatement d'utiliser le service.
      </p>
    </Section>

    <Section title="3. Conditions d'accès et utilisateurs mineurs">
      <p>
        L'accès à Apprenix est ouvert à toute personne disposant d'un accès à Internet, sans limite
        d'âge minimale, le service étant spécifiquement conçu pour les élèves de tous âges.
      </p>
      <p>
        <strong className="text-foreground">Mineurs de moins de 15 ans :</strong> conformément à
        l'article 8 du RGPD et à l'article 45 de la loi Informatique et Libertés, la création d'un
        compte par un enfant de moins de 15 ans doit être validée par le titulaire de l'autorité
        parentale (parent ou tuteur légal). L'utilisation sans compte reste libre et accessible.
      </p>
      <p>
        <strong className="text-foreground">Mineurs de 15 à 18 ans :</strong> peuvent créer un
        compte de manière autonome. Les parents sont toutefois encouragés à accompagner leurs enfants
        dans l'utilisation du service.
      </p>
      <p>
        L'éditeur se réserve le droit de suspendre ou d'interrompre l'accès au site à tout moment,
        sans préavis, notamment pour des raisons de maintenance, de mise à jour ou de force majeure.
      </p>
    </Section>

    <Section title="4. Utilisation acceptable du service">
      <p>En utilisant Apprenix, vous vous engagez à :</p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Utiliser le service uniquement à des fins <strong className="text-foreground">personnelles et éducatives</strong></li>
        <li>Ne pas tenter de contourner les mécanismes de sécurité du site ou d'en perturber le fonctionnement</li>
        <li>Ne pas diffuser de contenus illicites, offensants, violents, pornographiques ou contraires aux bonnes mœurs</li>
        <li>Ne pas harceler, menacer ou porter atteinte à d'autres utilisateurs</li>
        <li>Ne pas utiliser le service à des fins commerciales, publicitaires ou de démarchage sans autorisation</li>
        <li>Ne pas reproduire, redistribuer ou exploiter commercialement les contenus de la plateforme sans accord préalable</li>
        <li>Ne pas tenter d'accéder aux données d'autres utilisateurs</li>
        <li>Ne pas utiliser de robots, scrapers ou outils automatisés pour accéder au service</li>
      </ul>
      <p>
        Tout manquement grave à ces règles peut entraîner la suspension immédiate du compte et,
        le cas échéant, des poursuites judiciaires (article 323-1 et suivants du Code pénal —
        atteintes aux systèmes de traitement automatisé de données).
      </p>
    </Section>

    <Section title="5. Création et gestion de compte">
      <p>
        La création d'un compte est entièrement facultative. Si vous créez un compte, vous vous
        engagez à :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Fournir des informations exactes et maintenir leur exactitude</li>
        <li>Maintenir la confidentialité de vos identifiants de connexion</li>
        <li>Ne pas créer de compte au nom d'une autre personne sans son consentement</li>
        <li>Signaler immédiatement toute utilisation frauduleuse de votre compte</li>
      </ul>
      <p>
        Vous êtes seul responsable de toute activité réalisée depuis votre compte. En cas
        d'utilisation frauduleuse ou de compromission de vos identifiants, contactez-nous sans
        délai à{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>.
      </p>
      <p>
        Vous pouvez demander la suppression de votre compte et de vos données à tout moment en
        nous contactant par email. La suppression sera effective dans un délai de 30 jours.
      </p>
    </Section>

    <Section title="6. Propriété intellectuelle">
      <p>
        L'ensemble des contenus et fonctionnalités d'Apprenix (textes originaux, interfaces,
        code source, graphismes, logos) est protégé par le droit de la propriété intellectuelle
        (articles L.111-1 et suivants du Code de la propriété intellectuelle).
      </p>
      <p>
        Toute reproduction, même partielle, est interdite sans autorisation écrite préalable de
        l'éditeur.
      </p>
      <p>
        Les <strong className="text-foreground">contenus que vous créez</strong> (notes, flashcards,
        données personnelles) vous appartiennent intégralement. Vous nous accordez uniquement un
        droit technique de stockage pour vous les restituer, sans aucune exploitation commerciale.
      </p>
      <p>
        Les programmes scolaires et données pédagogiques sont issus des référentiels officiels
        de l'Éducation nationale (Éduscol, BOEN), librement accessibles au public.
      </p>
    </Section>

    <Section title="7. Nature pédagogique des contenus">
      <p>
        Tous les contenus pédagogiques disponibles sur Apprenix (fiches méthode, aide aux devoirs,
        résumés, annales) sont rédigés et vérifiés par des enseignants humains certifiés.
        Ils sont fournis à titre{' '}
        <strong className="text-foreground">strictement indicatif et pédagogique</strong>.
      </p>
      <p>
        Ces contenus ne constituent pas un remplacement des cours dispensés dans les établissements
        scolaires. L'éditeur encourage toujours les élèves à vérifier les informations auprès
        de leurs enseignants.
      </p>
      <p>
        L'utilisation des ressources relève de la seule responsabilité de l'utilisateur.
        Aucun contenu pédagogique n'est généré automatiquement par un système d'intelligence artificielle.
      </p>
    </Section>

    <Section title="8. Disponibilité du service">
      <p>
        L'éditeur s'efforce de maintenir Apprenix accessible en permanence, mais ne garantit pas
        une disponibilité ininterrompue (article 1218 du Code civil — force majeure). Des
        interruptions peuvent survenir pour maintenance, mise à jour ou raisons techniques
        indépendantes de notre volonté.
      </p>
      <p>
        L'éditeur se réserve le droit de modifier, suspendre ou arrêter définitivement tout ou
        partie du service, notamment en cas de contraintes techniques ou légales, sans obligation
        d'indemnisation (le service étant offert gratuitement).
      </p>
    </Section>

    <Section title="9. Limitation de responsabilité">
      <p>
        Apprenix est fourni « en l'état » (<em>as is</em>), sans garantie d'exhaustivité absolue
        des contenus pédagogiques. La responsabilité de l'éditeur est limitée aux
        cas de <strong className="text-foreground">faute lourde ou de dol</strong> (article
        1231-3 du Code civil).
      </p>
      <p>
        L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>De l'utilisation ou de l'impossibilité d'utiliser le service</li>
        <li>De la perte de données stockées localement dans le navigateur</li>
        <li>D'une erreur dans un contenu pédagogique indicatif</li>
        <li>D'une interruption temporaire du service pour maintenance</li>
      </ul>
    </Section>

    <Section title="10. Gratuité et engagement éthique">
      <p>
        Apprenix est et restera <strong className="text-foreground">100&nbsp;% gratuit</strong>,
        sans abonnement, sans carte bancaire, sans publicité comportementale, sans vente de
        données. L'éditeur s'engage formellement à ne jamais monétiser les données personnelles
        des utilisateurs, en particulier celles des mineurs.
      </p>
    </Section>

    <Section title="11. Médiation et règlement des litiges">
      <p>
        Conformément à l'ordonnance n°&nbsp;2015-1033 du 20 août 2015, en cas de litige non
        résolu à l'amiable, tout utilisateur peut avoir recours à un médiateur de la consommation.
        Toutefois, le service étant entièrement gratuit et non commercial, le recours à la
        médiation reste facultatif.
      </p>
      <p>
        Plateforme européenne de résolution des litiges en ligne (pour information) :{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          ec.europa.eu/consumers/odr
        </a>
      </p>
    </Section>

    <Section title="12. Modification des CGU">
      <p>
        L'éditeur se réserve le droit de modifier les présentes CGU à tout moment pour refléter
        les évolutions légales ou du service. La date de mise à jour est indiquée en haut de
        cette page. L'utilisation continue du service après modification vaut acceptation des
        nouvelles conditions. En cas de modification substantielle, les utilisateurs disposant
        d'un compte seront informés par email.
      </p>
    </Section>

    <Section title="13. Droit applicable et juridiction compétente">
      <p>
        Les présentes CGU sont régies par le <strong className="text-foreground">droit français</strong>.
        Tout litige relatif à leur interprétation ou leur exécution sera soumis aux tribunaux
        compétents du ressort de la <strong className="text-foreground">Seine-Saint-Denis</strong>,
        sous réserve des dispositions d'ordre public applicables aux consommateurs et aux mineurs.
      </p>
    </Section>

    <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
      <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">CNIL</a>
      <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
    </div>
  </div>
);

export default CguPage;
