import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import GuestToolPreview from '@/components/GuestToolPreview';
import { useApp } from '@/contexts/AppContext';

interface RouteGuardProps {
  isPublic?: boolean;
  children: React.ReactNode;
}

// Noms lisibles pour les pages protégées
const PAGE_NAMES: Record<string, string> = {
  '/espace':               'ton Espace',
  '/tableau-de-bord':      'ton Tableau de bord',
  '/aide-ia':              'l\'Aide IA',
  '/scanner':              'le Scanner',
  '/linguistique':         'les Outils Linguistiques',
  '/maths-sciences':       'les Maths & Sciences',
  '/organisation':         'l\'Organisation',
  '/flashcards':           'les Flashcards',
  '/notes':                'les Notes',
  '/motivation':           'la Motivation & Progrès',
  '/communaute':           'la Communauté',
  '/visio':                'la Classe Virtuelle',
  '/focus':                'le Mode Deep Work',
  '/quiz':                 'le Quiz',
  '/examen':               'le Mode Examen',
  '/carte-mentale':        'la Carte Mentale',
  '/profil':               'ton Profil',
  '/parents-espace':       'l\'Espace Parents',
};

// Pages qui affichent une démo séduisante au lieu de rediriger directement vers /connexion.
// Stratégie visiteur : montrer la valeur → inciter à l'inscription.
const DEMO_PREVIEW_PATHS = new Set([
  '/aide-ia', '/scanner', '/flashcards', '/organisation',
  '/maths-sciences', '/linguistique', '/notes', '/quiz',
  '/carte-mentale', '/tableau-de-bord', '/motivation',
  '/focus', '/examen', '/communaute', '/visio', '/ressources',
]);

/**
 * Protège les routes non-publiques.
 * — Pages "démo" : affiche GuestToolPreview (vitrine séduisante + CTA inscription)
 * — Autres pages protégées (espace/:category, parents-espace…) : redirige vers /connexion
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ isPublic, children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isPublic && !isAuthenticated) {
    // Pages outils → démo visiteur (restent accessibles, incitent à l'inscription)
    if (DEMO_PREVIEW_PATHS.has(location.pathname)) {
      const pageName = PAGE_NAMES[location.pathname];
      return <GuestToolPreview path={location.pathname} pageName={pageName} />;
    }
    // Autres pages protégées (espaces personnels) → redirection connexion
    const pageName = PAGE_NAMES[location.pathname] ?? 'cette page';
    return (
      <Navigate
        to="/connexion"
        state={{ from: location.pathname, pageName }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
