/**
 * CookieManager - Componente para gestión automática de cookies
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { clearAllAuthData, clearProblematicData } from '@/lib/cookieUtils';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface CookieManagerProps {
  /** Si debe limpiar cookies al montar el componente */
  cleanOnMount?: boolean;
  /** Si debe limpiar cookies cuando cambia el estado de sesión */
  cleanOnSessionChange?: boolean;
}

/**
 * Componente que gestiona la limpieza automática de cookies
 */
export function CookieManager({
  cleanOnMount = false,
  cleanOnSessionChange = true,
}: CookieManagerProps) {
  const { status } = useSession();

  useEffect(() => {
    // Limpiar solo cookies problemáticas al montar si está habilitado
    if (cleanOnMount) {
      console.log('🧹 [COOKIE_MANAGER] Limpieza inicial de cookies problemáticas');
      clearProblematicData(); // Preserva la sesión activa
    }
  }, [cleanOnMount]);

  useEffect(() => {
    // Limpiar TODAS las cookies cuando el usuario se desautentica
    if (cleanOnSessionChange && status === 'unauthenticated') {
      console.log('🧹 [COOKIE_MANAGER] Limpieza completa por cambio de sesión (no autenticado)');
      clearAllAuthData(); // Limpieza completa para logout
    }
  }, [status, cleanOnSessionChange]);

  // Este componente no renderiza nada
  return null;
}

/**
 * Hook personalizado para gestión de cookies
 */
export function useCookieManager(
  options: {
    cleanOnMount?: boolean;
    cleanOnLogin?: boolean;
    cleanOnLogout?: boolean;
  } = {}
) {
  const { status } = useSession();
  const { cleanOnMount = false, cleanOnLogin = false, cleanOnLogout = true } = options;

  useEffect(() => {
    if (cleanOnMount) {
      console.log('🧹 [COOKIE_HOOK] Limpieza de cookies problemáticas al montar');
      clearProblematicData(); // Preserva la sesión activa
    }
  }, [cleanOnMount]);

  useEffect(() => {
    if (status === 'authenticated' && cleanOnLogin) {
      console.log('🧹 [COOKIE_HOOK] Limpieza de cookies problemáticas al autenticarse');
      // Solo limpiar cookies problemáticas, no la sesión actual
      setTimeout(() => {
        clearProblematicData();
      }, 1000); // Esperar un segundo para que NextAuth establezca las nuevas cookies
    }

    if (status === 'unauthenticated' && cleanOnLogout) {
      console.log('🧹 [COOKIE_HOOK] Limpieza completa al desautenticarse');
      clearAllAuthData(); // Limpieza completa para logout
    }
  }, [status, cleanOnLogin, cleanOnLogout]);

  return {
    clearCookies: clearAllAuthData,
    clearProblematicCookies: clearProblematicData,
    sessionStatus: status,
    isAuthenticated: status === 'authenticated',
  };
}
