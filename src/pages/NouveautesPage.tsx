import {ArrowRight, Bell, CheckCircle, Rss,
  Sparkles, 
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/PageHero';

const CHANGELOG = [
  {
    version: 'v2.2.0',
    date: '2026-06-18',
    title: 'Espace ULIS & SEGPA — Navigation adaptée + Persistance des données',
    type: 'Amélioration',
    typeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    items: [
      'Espace ULIS & SEGPA : sidebar dédiée avec navigation simplifiée — outils pertinents uniquement (aide 💚, flashcards visuelles, agenda, ressources inclusion)',
      'Bandeau vert ULIS/SEGPA dans la sidebar indiquant le mode actif et pointant directement vers la page droits & ressources',
      'Correction bug : les élèves ULIS/SEGPA voyaient la couleur et l\'emoji "Lycée" (orange 🎓) — remplacé par vert 💚',
      'Suppression des outils non adaptés au profil ULIS/SEGPA (Mode Examen, Quiz, Carte Mentale, Deep Work) de la navigation',
      'Lien direct "/inclusion" ajouté dans la sidebar pour tous les profils ULIS/SEGPA',
      'Correction bug avatar : les emojis personnages choisis dans le profil s\'affichent maintenant dans la sidebar des espaces étudiant et enseignant',
      'Persistance des données : correction du partage de données entre comptes sur le même appareil (suivi de révision, cartes mentales)',
      'EnseignantAgendaPage : agenda enseignant désormais synchronisé avec Supabase via AppContext',
      'ParentsEspacePage : tableau de bord parents lit désormais les vraies données Supabase (AppContext) au lieu du localStorage isolé',
      'Actualités EdTech : 7 nouveaux articles de sources officielles (Cahiers pédagogiques, CNIL, AMUE, Numerama) insérés dans la base',
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-06-21',
    title: 'Expérience mobile & tablette — refonte complète',
    type: 'Amélioration',
    typeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    items: [
      'Bandeau de bienvenue simplifié : message rotatif discret, sans boutons parasites',
      'Page d\'accueil redessinée : titre plus impactant, CTA unique bien visible, indicateurs de confiance en bas du héros',
      'Correction du glissement latéral du menu sur Android et iOS',
      'Tableau comparatif "Pourquoi choisir Apprenix" : lisible sur tous les écrans sans défilement horizontal',
      'Calendrier de planning : colonnes adaptées à la taille de l\'écran, usage tactile amélioré',
      'Tableau périodique des éléments : navigation fluide sur mobile',
      'Tableau d\'accessibilité RGAA : lecture claire sur petit écran avec étiquettes condensées',
      'Défilement horizontal amélioré sur tous les tableaux et listes de la plateforme',
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-06-15',
    title: 'Pack Confiance & Accessibilité',
    type: 'Majeure',
    typeColor: 'bg-primary/10 text-primary border-primary/20',
    items: [
      'Nouvelle page Notre mission & À propos',
      'Nouvelle page Pour les parents avec supervision et FAQ',
      'Nouvelle page Sécurité & Données avec checklist RGPD',
      'Nouveau Centre d\'aide (FAQ interactive par catégorie)',
      'Nouveau formulaire de contact structuré',
      'Nouvelle page Pour les enseignants (Éduscol)',
      'Témoignages communautaires sur la page d\'accueil',
      'Compteurs de preuve sociale (chiffres honnêtes et vérifiables uniquement)',
      'Section réseaux sociaux sur l\'accueil et le footer',
      'Badge « Conforme programmes Éducation nationale » sur tous les outils',
      'Badge SSL sécurisé sur la page de connexion',
      'Améliorations d\'accessibilité (aria-labels, landmarks HTML5)',
    ],
  },
  {
    version: 'v1.5.0',
    date: '2026-05-20',
    title: 'Mode Deep Work & Communauté',
    type: 'Fonctionnalité',
    typeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    items: [
      'Mode Deep Work plein écran avec minuteur 25/50/90 min',
      'Ambiance sonore (silence, pluie, bibliothèque, bruit blanc)',
      'Page Communauté d\'entraide entre étudiants',
      'Système de questions/réponses par matière et niveau',
      'Leaderboard des contributeurs',
    ],
  },
  {
    version: 'v1.4.0',
    date: '2026-04-10',
    title: 'Gamification & Quêtes narratives',
    type: 'Fonctionnalité',
    typeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    items: [
      'Système de quêtes narratives par niveau scolaire',
      'Progression prévisionnelle des matières',
      'Badges et récompenses débloqués',
      'Widget « Tournoi de la semaine »',
    ],
  },
  {
    version: 'v1.3.0',
    date: '2026-03-01',
    title: 'Actualités EdTech & Contributions',
    type: 'Fonctionnalité',
    typeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    items: [
      'Page Actualités avec fil EdTech 2026',
      'Filtres par catégorie (Numérique & Éducation, Innovations…)',
      'Onglet Contributions — partagez votre expérience',
      'Section "Pourquoi faire confiance à Apprenix ?"',
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-02-10',
    title: 'Flashcards & répétition espacée',
    type: 'Fonctionnalité',
    typeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    items: [
      'Système de flashcards avec algorithme de répétition espacée',
      'Widget « Révision du jour » sur l\'accueil',
      'Statistiques de rétention par deck',
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-01-15',
    title: 'Notes, Wiki personnel & Organisation',
    type: 'Fonctionnalité',
    typeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    items: [
      'Wiki personnel de notes par matière et tags',
      'Recherche plein texte dans les notes',
      'Outil Pomodoro avec statistiques de la semaine',
      'Widget « Charge cognitive » sur la to-do list',
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-11-01',
    title: 'Lancement officiel d\'Apprenix',
    type: 'Majeure',
    typeColor: 'bg-primary/10 text-primary border-primary/20',
    items: [
      'Aide aux devoirs — fiches méthode & mode Socratique',
      'Scanner de devoirs par OCR',
      'Ressources pédagogiques & outil Transformer',
      'Outils linguistiques (dictionnaire, conjugueur, correcteur)',
      'Maths & Sciences (calculatrice, tableau périodique)',
      'Organisation (agenda, planning, to-do, Pomodoro)',
      'Tableau de bord avec analytics hebdomadaire',
      'Système de gamification (XP, badges, streaks)',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2025-09-20',
    title: 'Correctif sécurité — connexion',
    type: 'Correctif',
    typeColor: 'bg-destructive/10 text-destructive border-destructive/20',
    items: [
      'Correction du bug critique de vérification du mot de passe',
      'Ajout du trimming de l\'email pour éviter les contournements',
      'Amélioration des messages d\'erreur de connexion',
    ],
  },
];

const NouveautesPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-4 min-w-0">
    <h1 className="sr-only">Nouveautés Apprenix</h1>
      <SEO
        title="Nouveautés & Mises à Jour Apprenix — Changelog 2026 | Apprenix"
        description="Nouveautés Apprenix : matières ajoutées, outils améliorés, corrections et optimisations. La plateforme évolue chaque semaine grâce à vos retours."
        canonical="/nouveautes"
        noIndex={false}
        keywords="nouveautés apprenix 2026, changelog plateforme éducative, nouvelles fonctionnalités scolaires, améliorations outils scolaires, mises à jour apprenix, évolution plateforme"
        dateModified="2026-06-21"
      />

      <PageHero
        variant="tool"
        icon={Sparkles}
        badge={<><Sparkles className="w-3 h-3 mr-1" />Changelog</>}
        badgeClassName="bg-primary/10 text-primary border-primary/20"
        title="Nouveautés Apprenix"
        subtitle="Toutes les mises à jour, nouvelles fonctionnalités et améliorations de la plateforme — dans l'ordre chronologique inverse."
        stats={[
          { value: 'Chaque', label: 'semaine de nouveautés' },
          { value: '100 %', label: 'Mises à jour gratuites' },
          { value: '0 €', label: 'Sans abonnement' },
        ]}
        cta={{ label: 'Suggérer une fonctionnalité', to: '/contact' }}
      />

      {/* Suivre les nouveautés */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Suivre les nouveautés</p>
              <p className="text-sm text-muted-foreground text-pretty">
                Une question ou suggestion sur une nouveauté ? Contactez-nous directement.
              </p>
              <a href="/contact" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity">
                <ArrowRight className="w-3.5 h-3.5" /> Nous contacter
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changelog */}
      <div className="section-divider pt-3 mb-5">
        <h2 className="text-lg md:text-xl font-bold text-foreground text-balance flex items-center gap-2">
          <Rss className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          Historique des versions
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Toutes les mises à jour depuis la création d'Apprenix.</p>
      </div>
      <div className="space-y-4">
        {CHANGELOG.map((entry) => (
          <Card key={entry.version}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${entry.typeColor}`}>{entry.type}</Badge>
                  <span className="text-base font-bold text-foreground">{entry.version}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed text-pretty">—</span>
                  <CardTitle className="text-sm font-semibold text-foreground">{entry.title}</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">{entry.date}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="mt-8 bg-secondary/50">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">
              Vous avez une idée de fonctionnalité ?
            </p>
            <p className="text-sm text-muted-foreground text-pretty">
              Vos suggestions sont les bienvenues ! Elles font souvent partie des prochaines versions.
            </p>
          </div>
          <Link to="/contact" className="shrink-0">
            <Button size="sm" variant="outline" className="h-9" aria-label="Soumettre une suggestion">
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Soumettre une idée
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Liens bas de page */}
      <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link to="/mission" className="hover:text-primary transition-colors">Notre mission</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
        <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
      </div>
    </div>
  );
};

export default NouveautesPage;
