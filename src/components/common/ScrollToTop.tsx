import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Désactive la restauration de scroll native du navigateur pour toute la session.
// Sans cela, après setSearchParams() ou navigate(), le navigateur peut restaurer
// une position de scroll précédente et faire "sauter" la page vers le bas.
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

/**
 * ScrollToTop v3 — remonte en haut à chaque changement de pathname OU de search.
 * - Écoute `location.key` (unique par entrée history) pour couvrir à la fois
 *   les changements de pathname ET les setSearchParams (changement de search).
 * - Ignorer le montage initial pour éviter un saut inutile.
 * - requestAnimationFrame garantit que le DOM est peint avant le scroll.
 */
const ScrollToTop: React.FC = () => {
  const location = useLocation();
  const prevKey = useRef(location.key);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    const pathnameChanged = prevPathname.current !== location.pathname;
    // Ne remonter que sur vrai changement de page (pathname), pas sur chaque setSearchParams
    if (pathnameChanged) {
      prevPathname.current = location.pathname;
      prevKey.current = location.key;
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
    } else {
      prevKey.current = location.key;
    }
  }, [location.key, location.pathname]);

  return null;
};

export default ScrollToTop;
