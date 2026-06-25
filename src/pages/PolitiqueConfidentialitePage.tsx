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

const PolitiqueConfidentialitePage: React.FC = () => (
  <div className="max-w-5xl mx-auto py-4 min-w-0">
    <SEO
      title="Politique de Confidentialité — RGPD & Cookies | Apprenix"
      description="Comment Apprenix collecte et protège vos données. Conformité RGPD, politique cookies, droits d'accès et de suppression. Aucune donnée vendue à des tiers."
      canonical="/politique-confidentialite"
      keywords="politique confidentialité apprenix, RGPD plateforme scolaire, données personnelles élèves, cookies éducatifs, droits RGPD suppression, hébergement UE certifié, vie privée scolaire"
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
      Politique de confidentialité
    </h1>
    <p className="text-base text-muted-foreground mb-2">
      Conformément au <strong className="text-foreground">Règlement Général sur la Protection des
      Données (RGPD — UE 2016/679)</strong> et à la{' '}
      <strong className="text-foreground">loi n°&nbsp;78-17 du 6 janvier 1978</strong> (Informatique
      et Libertés) modifiée par la loi n°&nbsp;2018-493 du 20 juin 2018.
    </p>
    <p className="text-base text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

    {/* Barre de confiance — garanties clés */}
    <TrustBar className="mb-6" />

    {/* Badge RGPD */}
    <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
      <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
      <p className="text-base text-success leading-relaxed">
        <strong>Engagement RGPD :</strong> Apprenix ne vend, ne loue et ne monétise jamais vos
        données personnelles. Le service est 100&nbsp;% gratuit et sans publicité comportementale.
      </p>
    </div>

    <Section title="1. Responsable du traitement (RGPD art. 13-1°)">
      <p>
        Le responsable du traitement des données personnelles collectées sur Apprenix est{' '}
        <strong className="text-foreground">Charly Soudan</strong>, personne physique éditrice du site,
        particulier résidant en France (Tremblay-en-France, 93290).
      </p>
      <p>
        <strong className="text-foreground">Contact DPO / référent protection des données :</strong>{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>
      </p>
      <p>
        <strong className="text-foreground">Adresse postale :</strong>{' '}
        36 avenue du Parc, 93290 Tremblay-en-France, France
      </p>
    </Section>

    <Section title="2. Données collectées (RGPD art. 13-1°c)">
      <p>Apprenix collecte uniquement les données strictement nécessaires à son fonctionnement :</p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>
          <strong className="text-foreground">Données de compte (facultatives) :</strong> prénom,
          adresse email, niveau scolaire — uniquement si vous créez un compte volontairement
        </li>
        <li>
          <strong className="text-foreground">Données d'usage locales :</strong> flashcards
          créées, notes personnelles, progression — stockées exclusivement dans votre navigateur
          (localStorage), jamais transmises sans votre action
        </li>
        <li>
          <strong className="text-foreground">Données techniques minimales :</strong> logs d'accès
          anonymisés (adresse IP pseudonymisée, type de navigateur, horodatage) — conservés
          uniquement à des fins de maintenance et de sécurité
        </li>
      </ul>
      <p>
        <strong className="text-foreground">Données jamais collectées :</strong> numéro de carte
        bancaire, données de santé, données biométriques, données de géolocalisation précise,
        données relatives à la vie sexuelle ou aux opinions politiques ou religieuses.
      </p>
    </Section>

    <Section title="3. Finalités du traitement (RGPD art. 13-1°c)">
      <p>Les données collectées sont utilisées <strong className="text-foreground">exclusivement</strong> pour :</p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Fournir, maintenir et améliorer les fonctionnalités de la plateforme</li>
        <li>Sauvegarder votre progression scolaire et vos préférences d'interface</li>
        <li>Assurer la sécurité technique et la maintenance du service</li>
        <li>Répondre à vos demandes d'assistance (email, WhatsApp)</li>
        <li>Respecter nos obligations légales (LCEN, RGPD, droit français)</li>
      </ul>
      <p>
        Vos données ne sont jamais revendues, louées, ni partagées avec des tiers à des fins
        commerciales ou publicitaires. Aucun profilage automatisé à des fins de publicité ciblée.
      </p>
    </Section>

    <Section title="4. Base légale des traitements (RGPD art. 6)">
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>
          <strong className="text-foreground">Consentement (art. 6.1.a) :</strong> création de compte,
          stockage de la progression, préférences utilisateur
        </li>
        <li>
          <strong className="text-foreground">Intérêt légitime (art. 6.1.f) :</strong> logs techniques
          anonymisés pour la sécurité et la maintenance
        </li>
        <li>
          <strong className="text-foreground">Obligation légale (art. 6.1.c) :</strong> conservation
          des données requises par la loi française (LCEN, etc.)
        </li>
      </ul>
    </Section>

    <Section title="5. Dispositions spéciales — Mineurs de moins de 15 ans">
      <p>
        Conformément à l'article 8 du RGPD et à l'article 45 de la loi Informatique et Libertés,
        le traitement des données personnelles d'un mineur de moins de{' '}
        <strong className="text-foreground">15 ans</strong> requiert le{' '}
        <strong className="text-foreground">consentement conjoint du mineur et de son titulaire de
        l'autorité parentale</strong>.
      </p>
      <p>
        Les mineurs de moins de 15 ans sont invités à utiliser Apprenix avec l'accord et la
        supervision d'un parent ou tuteur légal. La création d'un compte par un enfant de moins
        de 15 ans doit être validée par un adulte responsable.
      </p>
      <p>
        Apprenix ne pratique aucune publicité ciblée envers les mineurs et ne collecte pas de
        données sensibles les concernant.
      </p>
    </Section>

    <Section title="6. Durée de conservation (RGPD art. 13-2°a)">
      <p>
        <strong className="text-foreground">Données de compte :</strong> conservées pendant toute
        la durée d'activité du compte, puis supprimées dans un délai de{' '}
        <strong className="text-foreground">30 jours</strong> suivant la demande de suppression.
      </p>
      <p>
        <strong className="text-foreground">Données locales (localStorage) :</strong> restent sous
        votre contrôle exclusif et peuvent être supprimées à tout moment depuis les paramètres de
        votre navigateur (Paramètres &gt; Confidentialité &gt; Effacer les données du site).
      </p>
      <p>
        <strong className="text-foreground">Logs techniques :</strong> conservés au maximum{' '}
        <strong className="text-foreground">12 mois</strong> puis supprimés automatiquement.
      </p>
    </Section>

    <Section title="7. Cookies et stockage local">
      <p>
        Apprenix utilise <strong className="text-foreground">uniquement le stockage local</strong>{' '}
        (<em>localStorage</em>) de votre navigateur pour sauvegarder vos préférences (thème clair/sombre,
        niveau scolaire, progression, notes). Il n'y a pas de cookie de tracking, de cookie publicitaire
        ni de cookie analytique tiers.
      </p>
      <p>
        Des cookies techniques strictement nécessaires au fonctionnement du service (session
        d'authentification sécurisée) peuvent être utilisés. Ces cookies ne requièrent pas votre
        consentement préalable (article 82 de la loi Informatique et Libertés).
      </p>
    </Section>

    <Section title="8. Transferts de données hors Union européenne">
      <p>
        Les données peuvent être hébergées par des prestataires disposant de serveurs hors UE :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>
          <strong className="text-foreground">Supabase Inc.</strong> (données et authentification) :
          serveurs prioritairement situés dans l'UE (région eu-west). Les éventuels transferts
          vers les États-Unis sont encadrés par les{' '}
          <strong className="text-foreground">clauses contractuelles types (CCT)</strong> de la
          Commission européenne (décision du 4 juin 2021).
        </li>
        <li>
          <strong className="text-foreground">Vercel Inc.</strong> (hébergement front-end) :
          transferts encadrés par les CCT et le Data Privacy Framework UE-États-Unis.
        </li>
      </ul>
    </Section>

    <Section title="9. Partage des données">
      <p>
        Apprenix ne partage aucune donnée personnelle avec des tiers à des fins commerciales.
        Les seuls partages possibles sont :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>
          <strong className="text-foreground">Sous-traitants techniques</strong> (Supabase, Vercel)
          — uniquement pour le fonctionnement du service, liés par contrat au respect du RGPD
        </li>
        <li>
          <strong className="text-foreground">Obligation légale</strong> — en cas de réquisition
          judiciaire ou administrative prévue par la loi française
        </li>
      </ul>
    </Section>

    <Section title="10. Vos droits (RGPD art. 15 à 22)">
      <p>
        Conformément au RGPD, vous disposez des droits suivants, exerçables à tout moment :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li><strong className="text-foreground">Droit d'accès (art. 15)</strong> — obtenir une copie de vos données</li>
        <li><strong className="text-foreground">Droit de rectification (art. 16)</strong> — corriger des données inexactes</li>
        <li><strong className="text-foreground">Droit à l'effacement (art. 17)</strong> — « droit à l'oubli »</li>
        <li><strong className="text-foreground">Droit d'opposition (art. 21)</strong> — refuser un traitement</li>
        <li><strong className="text-foreground">Droit à la portabilité (art. 20)</strong> — recevoir vos données dans un format lisible</li>
        <li><strong className="text-foreground">Droit de limitation (art. 18)</strong> — suspendre un traitement</li>
        <li><strong className="text-foreground">Droit de retrait du consentement (art. 7)</strong> — à tout moment, sans effet rétroactif</li>
      </ul>
      <p>
        <strong className="text-foreground">Pour exercer ces droits :</strong> envoyez un email à{' '}
        <a href="mailto:apprenix.contact@gmail.com" className="text-primary hover:underline">
          apprenix.contact@gmail.com
        </a>
        . Nous répondrons dans un délai maximum de{' '}
        <strong className="text-foreground">1 mois</strong> (art. 12-3 RGPD), prolongeable de
        2 mois en cas de complexité.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la{' '}
        <strong className="text-foreground">CNIL</strong> :{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          www.cnil.fr
        </a>{' '}
        — 3 Place de Fontenoy, 75007 Paris — Tél. 01 53 73 22 22.
      </p>
    </Section>

    <Section title="11. Sécurité des données (RGPD art. 32)">
      <p>
        Des mesures techniques et organisationnelles appropriées sont mises en place pour protéger
        vos données personnelles contre tout accès non autorisé, perte, altération ou divulgation :
      </p>
      <ul className="list-disc list-inside space-y-1 pl-2">
        <li>Chiffrement des communications (HTTPS/TLS)</li>
        <li>Authentification sécurisée (hachage des mots de passe, tokens JWT)</li>
        <li>Accès restreint aux données (principe du moindre privilège)</li>
        <li>Surveillance et alertes en cas d'incident de sécurité</li>
      </ul>
      <p>
        En cas de violation de données à caractère personnel présentant un risque pour vos droits
        et libertés, vous serez notifié dans les{' '}
        <strong className="text-foreground">72 heures</strong> suivant la découverte de l'incident,
        conformément à l'article 33 du RGPD.
      </p>
    </Section>

    <Section title="12. Modification de la politique de confidentialité">
      <p>
        Cette politique peut être mise à jour pour refléter les évolutions légales ou du service.
        La date de dernière mise à jour est indiquée en haut de cette page.
        En cas de modification substantielle, les utilisateurs disposant d'un compte seront informés
        par email.
      </p>
    </Section>

    <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
      <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
      <Link to="/cgu" className="hover:text-primary transition-colors">Conditions d'utilisation</Link>
      <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">CNIL</a>
      <a href="https://www.signalement.gouv.fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Signalement.gouv.fr</a>
      <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
    </div>
  </div>
);

export default PolitiqueConfidentialitePage;
