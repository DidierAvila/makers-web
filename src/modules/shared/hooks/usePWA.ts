/**
 * usePWA Hook - Progressive Web App functionality
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    showInstallPrompt: false,
    installPromptEvent: null,
  });

  useEffect(() => {
    // Detectar si la app está instalada
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://');

    setPwaState((prev) => ({ ...prev, isInstalled }));

    // Manejar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;

      setPwaState((prev) => ({
        ...prev,
        isInstallable: true,
        showInstallPrompt: true,
        installPromptEvent: installEvent,
      }));
    };

    // Manejar cuando la app se instala
    const handleAppInstalled = () => {
      setPwaState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        showInstallPrompt: false,
        installPromptEvent: null,
      }));
    };

    // Manejar cambios de conectividad
    const handleOnline = () => {
      setPwaState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaState((prev) => ({ ...prev, isOnline: false }));
    };

    // Agregar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!pwaState.installPromptEvent) return false;

    try {
      await pwaState.installPromptEvent.prompt();
      const choiceResult = await pwaState.installPromptEvent.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setPwaState((prev) => ({
          ...prev,
          showInstallPrompt: false,
          installPromptEvent: null,
        }));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setPwaState((prev) => ({
      ...prev,
      showInstallPrompt: false,
    }));
  };

  const checkForUpdates = async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
      } catch {
        // Error checking for updates
      }
    }
    return false;
  };

  return {
    ...pwaState,
    installPWA,
    dismissInstallPrompt,
    checkForUpdates,
  };
}
