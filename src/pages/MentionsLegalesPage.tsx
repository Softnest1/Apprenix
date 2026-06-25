import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
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

const MentionsLegalesPage: React.FC = () => (
  <div className="max-w-5xl mx-auto py-4 min-w-0">
    <SEO
      title="Mentions Légales — Éditeur, Hébergeur & Contact | Apprenix"
      description="Mentions légales Apprenix : éditeur, directeur de publication, hébergeur, contact LCEN et signalement de contenus. Conforme au droit français."
      canonical="/mentions-legales"
      keywords="mentions légales apprenix, éditeur plateforme éducative, hébergeur site scolaire, directeur publication, responsabilité légale, transparence éditeur"
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

    <h1 className="text-xl md:text-3xl xl:text-4xl font-bold text-foreground mb-2 text-balance">Mentions légales</h1>
    <p className="text-base text-muted-foreground mb-2">
      Conformément aux dispositions de la <strong className="text-foreground">loi n°&nbsp;2004-575 du 21 juin 2004</strong>{' '}
      pour la confiance en l'économie numérique (LCEN), notamment son article 6 III.
    </p>
    <p className="text-base text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

    {/* Barre de confiance — garanties clés */}
    <TrustBar className="mb-6" />

    {/* Badge de conformité */}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
      <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
      <p className="text-base text-success leading-relaxed">
        Ce site est exploité par un <strong>particulier non commerçant</strong>, à titre gracieux et non lucratif.
        Il est entièrement gratuit, sans publicité et sans abonnement. Aucun chiffre d'affaires n'est
        réalisé sur ce service.
      </p>
    </div>

    <Section title="1. Éditeur du site (LCEN art. 6 III-1°)">
      <p>
        Le site <strong className="text-foreground">Apprenix</strong> est édité à titre personnel
        par <strong className="text-foreground">Charly Soudan</strong>, personne physique résidant en France.
      </p>
      <p>
        <strong className="text-foreground">Adresse postale :</strong>{' '}
        36 avenue du Parc, 93290 Tremblay-en-France, France
      </p>
      <p>
        <strong className="text-foreground">Email de contact :</strong>{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>
      </p>
      <p>
        <strong className="text-foreground">Statut :</strong> Particulier — site non commercial,
        sans publicité, 100&nbsp;% gratuit, sans but lucratif. Non assujetti à la TVA.
        Pas de numéro SIRET (personne physique, activité non commerciale).
      </p>
    </Section>

    <Section title="2. Directeur de la publication (LCEN art. 6 III-1°)">
      <p>
        Le directeur de la publication est la personne physique éditrice du site, joignable
        exclusivement à l'adresse email indiquée à l'article 1.
      </p>
      <p>
        Conformément à l'article 6 III de la LCEN, l'identité complète de l'éditeur est
        communiquée sur simple demande à l'autorité judiciaire ou administrative compétente.
      </p>
    </Section>

    <Section title="3. Hébergement technique (LCEN art. 6 III-2°)">
      <p>
        <strong className="text-foreground">Hébergeur de l'application (front-end) :</strong>
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Vercel Inc. — 340 Pine Street, Suite 700, San Francisco, CA 94104, USA</li>
        <li>Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a></li>
      </ul>
      <p className="mt-2">
        <strong className="text-foreground">Hébergeur des données (base de données et authentification) :</strong>
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Supabase Inc. — 970 Toa Payoh North #07-04, Singapore 318992</li>
        <li>Données stockées sur des serveurs situés dans l'Union européenne (région eu-west)</li>
        <li>Site : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></li>
      </ul>
      <p className="mt-2 text-xs">
        Les transferts de données hors UE (États-Unis) sont encadrés par les clauses contractuelles
        types (CCT) approuvées par la Commission européenne, conformément au RGPD.
      </p>
    </Section>

    <Section title="4. Propriété intellectuelle">
      <p>
        L'ensemble des contenus présents sur le site Apprenix (textes, graphiques, logos, icônes,
        interfaces, code source) est protégé par le droit de la propriété intellectuelle français
        et les conventions internationales.
      </p>
      <p>
        Toute reproduction, distribution, modification, adaptation ou publication, même partielle,
        est strictement interdite sans l'accord écrit préalable de l'éditeur
        (article L.122-4 du Code de la propriété intellectuelle).
      </p>
      <p>
        Les outils pédagogiques (aide IA, flashcards, ressources, formules, etc.) sont mis à
        disposition gratuitement pour un usage strictement personnel et éducatif. Tout usage
        commercial est formellement interdit.
      </p>
      <p>
        Les programmes scolaires et données pédagogiques reproduits sont basés sur les référentiels
        officiels de l'Éducation nationale française (Éduscol, BOEN), librement accessibles.
      </p>
    </Section>

    <Section title="5. Protection des mineurs">
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning/10 border border-warning/30 mb-3">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          Apprenix est une plateforme éducative destinée notamment aux enfants et adolescents.
          Des mesures spécifiques sont prises pour assurer leur protection.
        </p>
      </div>
      <p>
        Conformément à l'article <strong className="text-foreground">L.227-24 du Code pénal</strong> et
        à la loi n°&nbsp;2020-901 du 24 juillet 2020, Apprenix s'engage à :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>N'héberger aucun contenu violent, pornographique ou préjudiciable aux mineurs</li>
        <li>Ne pratiquer aucune publicité ciblée ni profilage commercial des mineurs</li>
        <li>Requérir l'accord parental pour la création d'un compte par un mineur de moins de 15 ans</li>
        <li>Ne jamais vendre ni partager les données des mineurs à des tiers</li>
        <li>Concevoir les contenus dans le respect de l'intérêt supérieur de l'enfant</li>
      </ul>
      <p>
        En cas de signalement de contenu inapproprié ou de comportement préjudiciable, contactez-nous
        immédiatement à{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>{' '}
        ou via la plateforme nationale :{' '}
        <a href="https://www.signalement.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          signalement.gouv.fr
        </a>
      </p>
    </Section>

    <Section title="6. Responsabilité éditoriale">
      <p>
        L'éditeur s'efforce de maintenir les informations disponibles à jour et exactes. Toutefois,
        les contenus pédagogiques (fiches méthode, résumés, annales) sont rédigés et vérifiés
        par des enseignants humains certifiés et fournis
        à titre <strong className="text-foreground">indicatif et pédagogique</strong> uniquement.
        Ils ne remplacent pas l'avis d'un enseignant agréé.
      </p>
      <p>
        L'éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de
        l'utilisation du site ou de l'impossibilité d'y accéder. La responsabilité de l'éditeur
        est expressément limitée aux cas de faute lourde ou de dol (article 1231-3 du Code civil).
      </p>
    </Section>

    <Section title="7. Liens hypertextes">
      <p>
        Le site peut contenir des liens vers des sites tiers (Éduscol, CNIL, signalement.gouv.fr,
        etc.). L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité
        quant à leur contenu, leur disponibilité ou leur politique de confidentialité.
      </p>
      <p>
        Tout lien hypertexte vers le site Apprenix doit faire l'objet d'une autorisation préalable
        de l'éditeur, sauf pour les liens éditoriaux non commerciaux.
      </p>
    </Section>

    <Section title="8. Signalement de contenus illicites (LCEN art. 6 I-7°)">
      <p>
        Conformément à l'article 6 I-7° de la LCEN, tout contenu manifestement illicite présent
        sur le site peut être signalé à l'éditeur via :{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>
      </p>
      <p>
        Vous pouvez également contacter la plateforme nationale de signalement :{' '}
        <a href="https://www.signalement.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          www.signalement.gouv.fr
        </a>
      </p>
    </Section>

    <Section title="9. Accessibilité numérique">
      <p>
        Apprenix s'efforce de respecter les recommandations d'accessibilité du Référentiel Général
        d'Amélioration de l'Accessibilité (RGAA 4.1) pour garantir l'accès au plus grand nombre,
        y compris aux personnes en situation de handicap.
      </p>
    </Section>

    <Section title="10. Droit applicable et juridiction compétente">
      <p>
        Les présentes mentions légales sont régies par le <strong className="text-foreground">droit français</strong>.
        En cas de litige relatif à l'interprétation ou à l'exécution des présentes, les tribunaux
        français du ressort de la <strong className="text-foreground">Seine-Saint-Denis</strong> seront
        seuls compétents, sous réserve des dispositions d'ordre public applicables.
      </p>
    </Section>

    <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">
        Politique de confidentialité
      </Link>
      <Link to="/cgu" className="hover:text-primary transition-colors">
        Conditions d'utilisation
      </Link>
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
        CNIL
      </a>
      <a href="https://www.signalement.gouv.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
        Signalement.gouv.fr
      </a>
      <Link to="/" className="hover:text-primary transition-colors">
        Retour à l'accueil
      </Link>
    </div>
  </div>
);

export default MentionsLegalesPage;
