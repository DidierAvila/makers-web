/**
 * Network Status Hook - Hook para detectar el estado de la conexión a internet
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import { useEffect, useState } from 'react';

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  justReconnected: boolean;
}

/**
 * Hook para detectar el estado de la conexión a internet
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      if (wasOffline) {
        setJustReconnected(true);
        // Reset flag después de un tiempo
        setTimeout(() => setJustReconnected(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setJustReconnected(false);
    };

    // Verificar estado inicial
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      // Agregar listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    justReconnected,
  };
}

export default useNetworkStatus;
