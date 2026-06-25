/**
 * useFullscreen — hook unifié plein écran
 *
 * Gère :
 *  1. L'API native Fullscreen (requestFullscreen / webkit prefix pour Safari)
 *  2. La synchronisation de l'état avec l'événement `fullscreenchange`
 *     (ex : l'utilisateur appuie sur Échap dans le navigateur)
 *  3. La touche Escape pour quitter en CSS fallback (iOS Safari qui ne
 *     supporte pas requestFullscreen sur la plupart des éléments)
 *
 * Usage :
 *   const { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen(containerRef);
 *
 * Sur iOS Safari, requestFullscreen n'est pas disponible : on bascule
 * automatiquement en mode CSS uniquement (fixed inset-0 z-[9999]).
 */

import { RefObject, useCallback, useEffect, useState } from 'react';

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

/** Retourne true si le navigateur supporte l'API native Fullscreen */
function supportsNativeFullscreen(): boolean {
  const doc = document as FullscreenDocument;
  const hasRequest = !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as FullscreenElement).webkitRequestFullscreen
  );
  const hasExit = typeof doc.exitFullscreen === 'function' ||
    typeof doc.webkitExitFullscreen === 'function';
  return hasRequest && hasExit;
}

/** Retourne l'élément actuellement en plein écran (cross-browser) */
function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

/** Demande le plein écran natif sur un élément (cross-browser) */
async function requestNativeFullscreen(el: FullscreenElement): Promise<void> {
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    await el.mozRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    await el.msRequestFullscreen();
  }
}

/** Quitte le plein écran natif (cross-browser) */
async function exitNativeFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    await doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

interface UseFullscreenOptions {
  /** Élément cible pour requestFullscreen — défaut : document.documentElement */
  targetRef?: RefObject<Element | null>;
  /** Callback appelé quand l'état change */
  onChange?: (isFullscreen: boolean) => void;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  /** true si le navigateur supporte l'API native (false sur iOS Safari) */
  nativeSupported: boolean;
}

export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenReturn {
  const { targetRef, onChange } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const nativeSupported = supportsNativeFullscreen();

  // Synchronise l'état avec l'événement fullscreenchange du navigateur
  // (ex : l'utilisateur presse Échap → le navigateur quitte le plein écran natif)
  useEffect(() => {
    const handleChange = () => {
      const active = !!getFullscreenElement();
      setIsFullscreen(active);
      onChange?.(active);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('mozfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('mozfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, [onChange]);

  // Touche Échap : quitter le plein écran CSS (fallback iOS / sans API native)
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        onChange?.(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onChange]);

  const enterFullscreen = useCallback(() => {
    const target = targetRef?.current ?? document.documentElement;
    if (nativeSupported) {
      requestNativeFullscreen(target as FullscreenElement).catch(() => {
        // Fallback CSS si l'API est bloquée (ex : iframe sans permission)
        setIsFullscreen(true);
        onChange?.(true);
      });
    } else {
      // iOS Safari : CSS uniquement
      setIsFullscreen(true);
      onChange?.(true);
    }
  }, [nativeSupported, targetRef, onChange]);

  const exitFullscreen = useCallback(() => {
    if (nativeSupported && getFullscreenElement()) {
      exitNativeFullscreen().catch(() => {
        setIsFullscreen(false);
        onChange?.(false);
      });
    } else {
      setIsFullscreen(false);
      onChange?.(false);
    }
  }, [nativeSupported, onChange]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen, nativeSupported };
}
