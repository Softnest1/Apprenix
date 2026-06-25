/**
 * IntersectObserver v2 — redémarre l'observer Tailwind Intersect après navigation.
 * Debounce 80ms pour éviter un scan DOM répété sur routes rapides (prefetch).
 * requestAnimationFrame garantit que le DOM est peint avant le restart.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Observer } from 'tailwindcss-intersect';

const IntersectObserver = () => {
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        Observer.restart();
      });
    }, 80);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return null;
};

export default IntersectObserver;
