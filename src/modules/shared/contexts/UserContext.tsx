/**
 * Contexto de Usuario
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useApiAuth } from '../hooks/useApiAuth';
import { useApiError } from '../hooks/useApiError';
import { apiService } from '../services/api';
import { AuthService } from '../services/authService';
import {
  NavigationItem,
  UserConfigurationData,
  UserContextState,
  UserContextValue,
} from '../types/auth';

// Estado inicial
const initialState: UserContextState = {
  user: null,
  roles: [],
  portalConfiguration: null,
  navigation: [],
  isLoading: false,
  error: null,
};

// Tipos para las acciones del reducer
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_CONFIGURATION'; payload: UserConfigurationData }
  | { type: 'CLEAR_USER_CONFIGURATION' };

// Reducer
function userReducer(state: typeof initialState, action: UserAction) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USER_CONFIGURATION':
      return {
        ...state,
        user: action.payload.user,
        roles: action.payload.roles,
        portalConfiguration: action.payload.portalConfiguration,
        navigation: action.payload.portalConfiguration?.additionalConfig?.navigation || [],
        isLoading: false,
        error: null,
      };
    case 'CLEAR_USER_CONFIGURATION':
      return initialState;
    default:
      return state;
  }
}

// Contexto
const UserContext = createContext<UserContextValue | undefined>(undefined);

// Props del provider
interface UserProviderProps {
  children: React.ReactNode;
}

// Provider
export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { data: session, status } = useSession();
  useApiError();
  const { isAuthenticated, isLoading: authLoading } = useApiAuth();

  // Acciones
  const setUserConfiguration = useCallback((data: UserConfigurationData) => {
    dispatch({ type: 'SET_USER_CONFIGURATION', payload: data });
  }, []);

  const clearUserConfiguration = useCallback(() => {
    dispatch({ type: 'CLEAR_USER_CONFIGURATION' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Función para cargar la configuración del usuario
  const loadUserConfiguration = useCallback(async () => {
    if (!session?.user) return;

    // Evitar llamadas duplicadas si ya se está cargando o ya se cargó
    if (state.isLoading || state.user) return;

    try {
      setLoading(true);
      setError(null);

      // Solo intentar cargar configuración si tenemos un token válido
      const accessToken = (session as any)?.accessToken;
      if (!accessToken || accessToken.startsWith('oauth-temp-')) {
        // Usar datos básicos de la sesión sin llamar al backend
        // Establecer configuración básica usando el reducer directamente
        dispatch({
          type: 'SET_USER_CONFIGURATION',
          payload: {
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              avatar: session.user.avatar,
            },
            roles: [
              {
                id: session.user.role,
                name: session.user.role,
                description: `${session.user.role} role`,
                status: true,
              },
            ],
            portalConfiguration: {
              id: 'default',
              userTypeId: session.user.role,
              customLabel: null,
              customIcon: null,
              customRoute: null,
              theme: 'default',
              defaultLandingPage: '/dashboard',
              logoUrl: null,
              language: 'es',
              additionalConfig: {
                navigation: [],
              },
              createdAt: new Date().toISOString(),
              updatedAt: null,
            },
          },
        });

        return;
      }

      // Configurar el token en el ApiService antes de hacer la llamada

      apiService.setAuthToken(accessToken);

      const response = await AuthService.getCurrentUserConfiguration();
      setUserConfiguration(response);
    } catch (error) {
      // No llamar handleError para evitar el bucle de sesión expirada
      // Solo establecer el error local
      console.log('⚠️ [USER] Error al cargar la configuración del usuario:', error);
      setError('Error al cargar la configuración del usuario');

      // Usar configuración básica como fallback
      dispatch({
        type: 'SET_USER_CONFIGURATION',
        payload: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            avatar: session.user.avatar,
          },
          roles: [
            {
              id: session.user.role,
              name: session.user.role,
              description: `${session.user.role} role`,
              status: true,
            },
          ],
          portalConfiguration: {
            id: 'default',
            userTypeId: session.user.role,
            customLabel: null,
            customIcon: null,
            customRoute: null,
            theme: 'default',
            defaultLandingPage: '/dashboard',
            logoUrl: null,
            language: 'es',
            additionalConfig: {
              navigation: [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: null,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user, state.isLoading, state.user, setUserConfiguration, setLoading, setError]);

  // Efecto para cargar la configuración cuando el usuario se autentica
  useEffect(() => {
    console.log('🔄 UserContext useEffect: Evaluando condiciones:', {
      status,
      hasSessionUser: !!session?.user,
      hasStateUser: !!state.user,
      isAuthenticated,
      authLoading,
      sessionUserEmail: session?.user?.email,
    });

    if (status === 'authenticated' && session?.user && !state.user) {
      loadUserConfiguration();
    } else if (status === 'unauthenticated') {
      clearUserConfiguration();
    }
  }, [status, session?.user, state.user, loadUserConfiguration, clearUserConfiguration]);

  // Funciones de utilidad
  const hasPermission = useCallback((permissions: string, requiredPermission: string): boolean => {
    return AuthService.hasPermission(permissions, requiredPermission);
  }, []);

  const getFilteredNavigation = useCallback(
    (navigation: NavigationItem[], requiredPermission = 'read'): NavigationItem[] => {
      // Usamos el tipo correcto para la función del servicio
      return AuthService.filterNavigationByPermissions(
        navigation as any,
        requiredPermission
      ) as any;
    },
    []
  );

  const contextValue: UserContextValue = {
    ...state,
    setUserConfiguration,
    clearUserConfiguration,
    setLoading,
    setError,
    hasPermission,
    getFilteredNavigation,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

// Hook para usar el contexto
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
}

// Hook para verificar permisos
export function usePermissions() {
  const { hasPermission, getFilteredNavigation } = useUser();
  return { hasPermission, getFilteredNavigation };
}

// Hook para obtener información del usuario
export function useUserInfo() {
  const { user, roles, portalConfiguration, isLoading } = useUser();
  return { user, roles, portalConfiguration, isLoading };
}
