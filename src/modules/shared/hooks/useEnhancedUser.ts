/**
 * Enhanced User Hook - Hook centralizado para gestión de datos de usuario
 * Combina datos del token JWT y del endpoint /me para una fuente única de verdad
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { AuthPermissionService } from '../services/authService';
import { UserConfigurationData } from '../types/auth';

// Interface para datos completos del usuario (combinando token + endpoint /me)
export interface EnhancedUser {
  // Datos básicos del token
  id: string;
  email: string;
  name: string;

  // Datos específicos del token JWT
  userId: string;
  userName: string;
  userEmail: string;
  userTypeId: string;
  userTypeName: string;

  // Datos adicionales del endpoint /me
  avatar?: string;
  portalConfiguration?: any;
  roles?: any[];
  navigation?: any[];

  // Datos derivados/computados
  displayName: string; // Nombre preferido para mostrar
  displayEmail: string; // Email preferido para mostrar
  displayUserType: string; // Tipo de usuario para mostrar
  initials: string; // Iniciales para avatar
}

export interface UseEnhancedUserReturn {
  user: EnhancedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;

  // Datos del token (inmediatos)
  tokenData: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userTypeId?: string;
    userTypeName?: string;
  } | null;

  // Datos del endpoint /me (pueden tardar en cargar)
  meData: UserConfigurationData | null;
  meLoading: boolean;
  meError: string | null;

  // Estados de conexión
  connectionFailed: boolean;
  retryCount: number;
  circuitBreakerOpen: boolean;

  // Funciones utilitarias
  refreshUserData: () => Promise<void>;
  resetConnectionState: () => void;
  getDisplayName: () => string;
  getDisplayEmail: () => string;
  getUserInitials: () => string;
}

/**
 * Hook centralizado para gestión de datos de usuario
 * Combina datos del token JWT con datos del endpoint /me
 */
export function useEnhancedUser(): UseEnhancedUserReturn {
  const { data: session, status } = useSession();
  const [meData, setMeData] = useState<UserConfigurationData | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState<string | null>(null);
  const [meAttempted, setMeAttempted] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const accessToken = session?.accessToken || null;

  // Extraer datos del token JWT
  const tokenData = session?.accessToken ? extractTokenData(session.accessToken) : null;

  // Constantes para circuit breaker
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 5000; // 5 segundos

  /**
   * Detectar si un error es de conexión de red (NO de permisos/autorización)
   */
  function isNetworkError(error: any): boolean {
    // Verificar diferentes tipos de errores de red
    if (!error) return false;

    // ❌ NO es error de red si tiene status HTTP válido (incluyendo 401, 403, etc.)
    if (error.status && error.status >= 400 && error.status < 600) {
      console.log(
        `🔍 Error HTTP ${error.status} - NO es error de red, es error del servidor/permisos`
      );
      return false;
    }

    // ✅ SÍ es error de red: problemas de conectividad
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    if (error.message?.includes('Failed to fetch')) return true;
    if (error.message?.includes('Network request failed')) return true;
    if (error.message?.includes('internet')) return true;
    if (error.message?.includes('conexión')) return true;

    // Errores de timeout o falta total de respuesta
    if (error.code === 'NETWORK_ERROR') return true;
    if (error.status === 0) return true; // Sin respuesta del servidor

    return false;
  }

  /**
   * Función para extraer datos del token JWT
   */
  function extractTokenData(token: string) {
    try {
      // Verificar que no sea un token temporal de OAuth
      if (token.startsWith('oauth-temp-')) {
        return null;
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);

      return {
        userId: payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        userTypeId: payload.userTypeId,
        userTypeName: payload.userTypeName,
      };
    } catch (error) {
      console.error('Error extracting token data:', error);
      return null;
    }
  }

  /**
   * Cargar datos del endpoint /me
   */
  const loadMeData = useCallback(async () => {
    if (!session?.accessToken || session.accessToken.startsWith('oauth-temp-')) {
      console.log('⚠️ No se puede cargar datos /me: token no disponible o temporal');
      return;
    }

    // Validar que el token tenga datos básicos
    if (!tokenData) {
      console.log('⚠️ No se puede cargar datos /me: datos del token no disponibles');
      return;
    }

    setMeLoading(true);
    setMeError(null);
    setMeAttempted(true);

    try {
      console.log('🔄 Cargando configuración del usuario desde /me...');
      const data = await AuthPermissionService.getCurrentUserConfiguration();
      setMeData(data);
      setConnectionFailed(false); // Reset en caso de éxito
      setRetryCount(0); // Reset contador
      setCircuitBreakerOpen(false); // Cerrar circuit breaker en caso de éxito
      console.log('✅ Configuración del usuario cargada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al cargar configuración del usuario:', error);

      // 🔐 ERRORES DE AUTORIZACIÓN/PERMISOS (401, 403) - No reintentar
      if (error?.status === 401) {
        console.info('🔒 Sin permisos para endpoint /me (401) - continuando con datos del token');
        setMeError(null); // No mostrar como error, es comportamiento esperado
        setConnectionFailed(false);
        setMeAttempted(true); // ✅ Marcar como intentado para evitar bucles
        // NO incrementar retryCount, NO activar circuit breaker
      } else if (error?.status === 403) {
        console.info('🚫 Acceso denegado al endpoint /me (403) - continuando con datos del token');
        setMeError(null); // No mostrar como error, es comportamiento esperado
        setConnectionFailed(false);
        setMeAttempted(true); // ✅ Marcar como intentado para evitar bucles
        // NO incrementar retryCount, NO activar circuit breaker
      }
      // 🌐 ERRORES DE RED - Sí reintentar con circuit breaker
      else if (isNetworkError(error)) {
        console.warn('🌐 Error de conexión de red detectado (sin respuesta del servidor)');
        setConnectionFailed(true);

        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
          console.warn(
            `🚨 Máximo de reintentos alcanzado (${MAX_RETRY_ATTEMPTS}). Activando circuit breaker.`
          );
          setCircuitBreakerOpen(true);
          setMeError('Sin conexión a internet. La aplicación funcionará con datos básicos.');
        } else {
          setMeError('Error de conexión. Verifica tu conexión a internet.');
        }
      }
      // 🔧 OTROS ERRORES DEL SERVIDOR (4xx, 5xx) - No reintentar
      else {
        console.warn(
          `⚠️ Error del servidor (${error?.status || 'desconocido'}) - no se reintentará`
        );
        setMeError('Error del servidor al cargar configuración adicional');
        setConnectionFailed(false);
        // NO incrementar retryCount, NO activar circuit breaker
      }

      // Asegurar que setMeData se llame con null para indicar que no hay datos adicionales
      setMeData(null);
    } finally {
      setMeLoading(false);
    }
  }, [session?.accessToken, tokenData, retryCount]);

  /**
   * Cargar datos al montar o cambiar sesión
   */
  useEffect(() => {
    // No hacer nada si el circuit breaker está abierto
    if (circuitBreakerOpen) {
      console.warn('🔌 Circuit breaker abierto: no se intentará cargar /me');
      return;
    }

    // Condiciones para intentar cargar datos /me
    const shouldLoadMeData = isAuthenticated && tokenData && !meData && !meLoading && !meAttempted;

    if (shouldLoadMeData) {
      console.log('🚀 Iniciando carga de datos adicionales del usuario...');

      // Llamar directamente a loadMeData sin depender del callback
      const loadData = async () => {
        if (!session?.accessToken || session.accessToken.startsWith('oauth-temp-')) {
          console.log('⚠️ No se puede cargar datos /me: token no disponible o temporal');
          return;
        }

        if (!tokenData) {
          console.log('⚠️ No se puede cargar datos /me: datos del token no disponibles');
          return;
        }

        setMeLoading(true);
        setMeError(null);
        setMeAttempted(true);

        try {
          console.log('🔄 Cargando configuración del usuario desde /me...');
          const data = await AuthPermissionService.getCurrentUserConfiguration(
            session?.accessToken
          );
          setMeData(data);
          setConnectionFailed(false);
          setRetryCount(0);
          setCircuitBreakerOpen(false);
          console.log('✅ Configuración del usuario cargada exitosamente');
        } catch (error: any) {
          console.error('❌ Error al cargar configuración del usuario:', error);

          // 🔐 ERRORES DE AUTORIZACIÓN/PERMISOS (401, 403) - No reintentar
          if (error?.status === 401) {
            console.info(
              '🔒 Sin permisos para endpoint /me (401) - continuando con datos del token'
            );
            setMeError(null); // No mostrar como error, es comportamiento esperado
            setConnectionFailed(false);
            setMeAttempted(true); // ✅ Marcar como intentado para evitar bucles
            // NO incrementar retryCount, NO activar circuit breaker
          } else if (error?.status === 403) {
            console.info(
              '🚫 Acceso denegado al endpoint /me (403) - continuando con datos del token'
            );
            setMeError(null); // No mostrar como error, es comportamiento esperado
            setConnectionFailed(false);
            setMeAttempted(true); // ✅ Marcar como intentado para evitar bucles
            // NO incrementar retryCount, NO activar circuit breaker
          }
          // 🌐 ERRORES DE RED - Sí reintentar con circuit breaker
          else if (isNetworkError(error)) {
            console.warn('🌐 Error de conexión de red detectado (sin respuesta del servidor)');
            setConnectionFailed(true);

            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);

            if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
              console.warn(
                `🚨 Máximo de reintentos alcanzado (${MAX_RETRY_ATTEMPTS}). Activando circuit breaker.`
              );
              setCircuitBreakerOpen(true);
              setMeError('Sin conexión a internet. La aplicación funcionará con datos básicos.');
            } else {
              setMeError('Error de conexión. Verifica tu conexión a internet.');
            }
          }
          // 🔧 OTROS ERRORES DEL SERVIDOR (4xx, 5xx) - No reintentar
          else {
            console.warn(
              `⚠️ Error del servidor (${error?.status || 'desconocido'}) - no se reintentará`
            );
            setMeError('Error del servidor al cargar configuración adicional');
            setConnectionFailed(false);
            // NO incrementar retryCount, NO activar circuit breaker
          }

          setMeData(null);
        } finally {
          setMeLoading(false);
        }
      };

      loadData();
    }
  }, [
    isAuthenticated,
    tokenData,
    meData,
    meLoading,
    meAttempted,
    circuitBreakerOpen,
    session?.accessToken,
    retryCount,
  ]);

  /**
   * Función para refrescar datos del usuario
   */
  const refreshUserData = useCallback(async () => {
    console.log('🔄 Reintentando carga de datos del usuario...');
    setMeAttempted(false); // Reset para permitir nuevo intento
    setConnectionFailed(false); // Reset estado de conexión
    setRetryCount(0); // Reset contador de reintentos
    setCircuitBreakerOpen(false); // Abrir circuit breaker
    setMeError(null); // Limpiar error anterior
    await loadMeData();
  }, [loadMeData]);

  /**
   * Función para resetear el circuit breaker manualmente
   */
  const resetConnectionState = useCallback(() => {
    console.log('🔌 Reseteando estado de conexión...');
    setConnectionFailed(false);
    setRetryCount(0);
    setMeAttempted(false);
    setCircuitBreakerOpen(false);
    setMeError(null);
  }, []);

  /**
   * Crear objeto usuario combinado
   */
  const user: EnhancedUser | null = session?.user
    ? {
        // Datos básicos de NextAuth
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,

        // Datos del token (prioritarios)
        userId: tokenData?.userId || session.user.id,
        userName: tokenData?.userName || session.user.name,
        userEmail: tokenData?.userEmail || session.user.email,
        userTypeId: tokenData?.userTypeId || '',
        userTypeName: tokenData?.userTypeName || session.user.role || '',

        // Datos del endpoint /me
        avatar: meData?.user?.avatar || session.user.avatar,
        portalConfiguration: meData?.portalConfiguration,
        roles: meData?.roles,
        navigation: meData?.portalConfiguration?.additionalConfig?.navigation,

        // Datos computados (priorizando token > /me > session)
        displayName: tokenData?.userName || meData?.user?.name || session.user.name || 'Usuario',
        displayEmail: tokenData?.userEmail || meData?.user?.email || session.user.email || '',
        displayUserType: tokenData?.userTypeName || session.user.role || 'Usuario',
        initials: getInitials(
          tokenData?.userName || meData?.user?.name || session.user.name || 'U'
        ),
      }
    : null;

  /**
   * Funciones utilitarias
   */
  const getDisplayName = useCallback(() => {
    return user?.displayName || 'Usuario';
  }, [user]);

  const getDisplayEmail = useCallback(() => {
    return user?.displayEmail || '';
  }, [user]);

  const getUserInitials = useCallback(() => {
    return user?.initials || 'U';
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    tokenData,
    meData,
    meLoading,
    meError,
    connectionFailed,
    retryCount,
    circuitBreakerOpen,
    refreshUserData,
    resetConnectionState,
    getDisplayName,
    getDisplayEmail,
    getUserInitials,
  };
}

/**
 * Función utilitaria para generar iniciales
 */
function getInitials(name: string): string {
  if (!name) return 'U';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default useEnhancedUser;
