import { useEffect, useRef, useState } from 'react';

// Accès sécurisé à localStorage (SSR-safe + mode privé iOS Safari)
const safeStorage = {
  get: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      // Quota dépassé, mode privé strict (iOS Safari), ou stockage désactivé — silencieux
    }
  },
};

/**
 * Hook pour persister l'état dans localStorage avec écriture différée (debounce 300 ms).
 * Évite les écritures I/O à chaque frappe clavier ou mise à jour rapide.
 * Compatible : iOS Safari, Android Chrome, mode privé, SSR.
 *
 * ⚠️ Flush synchrone au démontage : garantit que la dernière valeur est
 *    toujours écrite même si l'utilisateur ferme la page avant 300 ms.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = safeStorage.get(key);
    if (item === null) return initialValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      // Valeur corrompue → retour à la valeur initiale
      return initialValue;
    }
  });

  // Référence stable sur la valeur courante pour éviter de re-créer le timer inutilement
  const valueRef = useRef(storedValue);
  valueRef.current = storedValue;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        safeStorage.set(key, JSON.stringify(valueRef.current));
      } catch {
        // Silencieux — déjà géré dans safeStorage.set
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      // Flush immédiat au démontage → évite la perte de données si la page
      // est fermée/rechargée avant l'expiration du délai de 300 ms
      safeStorage.set(key, JSON.stringify(valueRef.current));
    };
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
