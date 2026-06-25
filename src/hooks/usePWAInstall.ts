// Hook partagé — gère le prompt d'installation PWA + état "déjà installé"
import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua))           return 'android';
  if (/windows|macintosh|linux/i.test(ua)) return 'desktop';
  return 'unknown';
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,   setIsInstalled]   = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );
  const [platform] = useState<Platform>(detectPlatform);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const mq = window.matchMedia('(display-mode: standalone)');
    const onMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) { setIsInstalled(true); setInstallPrompt(null); }
    };
    mq.addEventListener('change', onMqChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!installPrompt) return 'unavailable';
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
    return outcome;
  }, [installPrompt]);

  return {
    installPrompt,
    isInstalled,
    platform,
    canInstall: !!installPrompt && !isInstalled,
    triggerInstall,
  };
}
