/**
 * Hook para manejo de autenticación en las llamadas a la API
 * Platform Web Frontend - Next.js TypeScript
 */

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { apiService, backendApiService } from '../services/api';

export interface UseApiAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  setApiToken: (token: string) => void;
  clearApiToken: () => void;
}

/**
 * Hook que sincroniza la sesión de NextAuth con el servicio de API
 */
export function useApiAuth(): UseApiAuthReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const token = (session as any)?.accessToken || null;

  // Sincronizar token con ambos servicios de API
  useEffect(() => {
    console.log('🔐 [AUTH] Token actualizado:', token ? 'Token presente' : 'Sin token');
    if (token) {
      console.log('✅ [AUTH] Configurando token en ambos servicios');
      apiService.setAuthToken(token);
      backendApiService.setAuthToken(token);
    } else {
      console.log('🧹 [AUTH] Limpiando tokens de ambos servicios');
      apiService.clearAuthToken();
      backendApiService.clearAuthToken();
    }
  }, [token]);

  const setApiToken = (newToken: string) => {
    apiService.setAuthToken(newToken);
    backendApiService.setAuthToken(newToken);
  };

  const clearApiToken = () => {
    apiService.clearAuthToken();
    backendApiService.clearAuthToken();
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    setApiToken,
    clearApiToken,
  };
}

export default useApiAuth;
