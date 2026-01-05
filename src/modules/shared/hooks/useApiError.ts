/**
 * Hook para manejo centralizado de errores de API
 * Platform Web Frontend - Next.js TypeScript
 */

import { useNotificationContext } from '@/modules/shared/components/providers/NotificationProvider';
import { signOut } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { ApiError } from '../services/api';

export interface UseApiErrorReturn {
  error: ApiError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown) => void;
  handleApiError: (error: ApiError) => void;
}

/**
 * Hook que proporciona manejo centralizado de errores de API
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiError | null>(null);
  const { showNotification } = useNotificationContext();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback(
    (apiError: ApiError) => {
      setError(apiError);

      // Manejo específico según el tipo de error
      if (apiError.isUnauthorized) {
        showNotification('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
        // Redirigir al login después de un breve delay
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/signin' });
        }, 2000);
      } else if (apiError.isForbidden) {
        // Error 403 - Sin permisos para realizar la acción
        const permissionMessage =
          apiError.message || 'No tienes permisos para realizar esta acción.';
        showNotification(permissionMessage, 'warning');
        // No redirigir al login, solo mostrar el mensaje de permisos
      } else if (apiError.isServerError) {
        showNotification('Error del servidor. Por favor, intenta nuevamente más tarde.', 'error');
      } else if (apiError.isNetworkError) {
        showNotification('Error de conexión. Verifica tu conexión a internet.', 'error');
      } else if (apiError.isClientError) {
        // Errores 4xx - mostrar mensaje específico del servidor
        showNotification(apiError.message || 'Error en la solicitud.', 'error');
      } else {
        // Error genérico
        showNotification(apiError.message || 'Ha ocurrido un error inesperado.', 'error');
      }

      // Log del error para debugging
      // API Error logged
    },
    [showNotification]
  );

  const handleError = useCallback(
    (unknownError: unknown) => {
      if (unknownError instanceof ApiError) {
        handleApiError(unknownError);
      } else if (unknownError instanceof Error) {
        const genericError = new ApiError(
          unknownError.message || 'Error desconocido',
          0,
          [],
          'unknown'
        );
        handleApiError(genericError);
      } else {
        const genericError = new ApiError('Ha ocurrido un error inesperado', 0, [], 'unknown');
        handleApiError(genericError);
      }
    },
    [handleApiError]
  );

  return {
    error,
    isError: !!error,
    clearError,
    handleError,
    handleApiError,
  };
}

export default useApiError;
