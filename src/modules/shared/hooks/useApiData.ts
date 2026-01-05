/**
 * useApiData Hook - Hook personalizado para manejo de estado y datos de API
 * Platform Web Frontend - Next.js TypeScript
 */

import { useNotificationContext } from '@/modules/shared/components/providers/NotificationProvider';
import { useCallback, useEffect, useState } from 'react';
import { ApiError, ApiResponse, PaginatedResponse } from '../services/api';
import { useApiAuth } from './useApiAuth';
import { useApiError } from './useApiError';

// Tipos para el hook
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseApiDataOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  autoLoad?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export interface ApiDataState<T = any> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  pagination: PaginationState;
  filters: Record<string, any>;
}

export interface ApiDataActions<T = any> {
  loadData: (params?: Record<string, any>) => Promise<void>;
  refreshData: () => Promise<void>;
  createItem: (itemData: Partial<T>) => Promise<T | null>;
  updateItem: (id: string | number, itemData: Partial<T>) => Promise<T | null>;
  deleteItem: (id: string | number) => Promise<boolean>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearError: () => void;
}

// Interface del servicio que debe implementar
export interface ApiService {
  getAll: (params?: Record<string, any>) => Promise<PaginatedResponse<any>>;
  getById: (id: string | number) => Promise<ApiResponse<any>>;
  create: (data: any) => Promise<ApiResponse<any>>;
  update: (id: string | number, data: any) => Promise<ApiResponse<any>>;
  delete: (id: string | number) => Promise<ApiResponse<any>>;
}

/**
 * Hook personalizado para manejar operaciones CRUD y estado de datos de API
 */
export function useApiData<T = any>(
  service: ApiService,
  initialOptions: UseApiDataOptions = {}
): [ApiDataState<T>, ApiDataActions<T>] {
  const { showNotification } = useNotificationContext();
  const { isAuthenticated, isLoading: authLoading } = useApiAuth();
  const { error: apiError, handleError, clearError: clearApiError } = useApiError();

  // Opciones por defecto
  const options = {
    page: 1,
    limit: 10,
    filters: {},
    autoLoad: true,
    ...initialOptions,
  };

  // Estado principal
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado de paginación
  const [pagination, setPagination] = useState<PaginationState>({
    page: options.page,
    limit: options.limit,
    total: 0,
    totalPages: 0,
  });

  // Estado de filtros
  const [filters, setFilters] = useState<Record<string, any>>(options.filters);

  // Usar handleError del hook useApiError

  /**
   * Construye parámetros para la petición
   */
  const buildRequestParams = useCallback(
    (extraParams: Record<string, any> = {}) => {
      return {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...extraParams,
      };
    },
    [pagination, filters]
  );

  /**
   * Carga datos desde la API
   */
  const loadData = useCallback(
    async (params: Record<string, any> = {}) => {
      if (!isAuthenticated && !authLoading) {
        return;
      }

      if (!service?.getAll) {
        handleError(new ApiError('Servicio no implementado'));
        return;
      }

      setLoading(true);
      clearApiError();

      try {
        const requestParams = buildRequestParams(params);
        const response = await service.getAll(requestParams);

        if (response.data && Array.isArray(response.data)) {
          setData(response.data || []);

          setPagination((prev) => ({
            ...prev,
            total: response.totalRecords || 0,
            totalPages: response.totalPages || 1,
          }));

          if (options.onSuccess) {
            options.onSuccess(response.data);
          }
        } else {
          throw new ApiError('Error al cargar datos');
        }
      } catch (err) {
        handleError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [service, isAuthenticated, authLoading, buildRequestParams, handleError, clearApiError, options]
  );

  /**
   * Recarga los datos manteniendo filtros y paginación actual
   */
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  /**
   * Crea un nuevo elemento
   */
  const createItem = useCallback(
    async (itemData: Partial<T>): Promise<T | null> => {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      if (!service?.create) {
        handleError(new ApiError('Servicio no implementado'));
        return null;
      }

      setLoading(true);
      clearApiError();

      try {
        const response = await service.create(itemData);

        if (response.success) {
          showNotification('Elemento creado exitosamente', 'success');
          await refreshData(); // Recarga los datos
          return response.data;
        } else {
          throw new ApiError(response.message || 'Error al crear elemento');
        }
      } catch (err) {
        handleError(err as ApiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, isAuthenticated, handleError, clearApiError, showNotification, refreshData]
  );

  /**
   * Actualiza un elemento existente
   */
  const updateItem = useCallback(
    async (id: string | number, itemData: Partial<T>): Promise<T | null> => {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      if (!service?.update) {
        handleError(new ApiError('Servicio no implementado'));
        return null;
      }

      setLoading(true);
      clearApiError();

      try {
        const response = await service.update(id, itemData);

        if (response.success) {
          showNotification('Elemento actualizado exitosamente', 'success');
          await refreshData(); // Recarga los datos
          return response.data;
        } else {
          throw new ApiError(response.message || 'Error al actualizar elemento');
        }
      } catch (err) {
        handleError(err as ApiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, isAuthenticated, handleError, clearApiError, showNotification, refreshData]
  );

  /**
   * Elimina un elemento
   */
  const deleteItem = useCallback(
    async (id: string | number): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      if (!service?.delete) {
        handleError(new ApiError('Servicio no implementado'));
        return false;
      }

      setLoading(true);
      clearApiError();

      try {
        const response = await service.delete(id);

        if (response.success) {
          showNotification('Elemento eliminado exitosamente', 'success');
          await refreshData(); // Recarga los datos
          return true;
        } else {
          throw new ApiError(response.message || 'Error al eliminar elemento');
        }
      } catch (err) {
        handleError(err as ApiError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, isAuthenticated, handleError, clearApiError, showNotification, refreshData]
  );

  /**
   * Cambia la página actual
   */
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Cambia el límite de elementos por página
   */
  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 })); // Reset a página 1
  }, []);

  /**
   * Actualiza los filtros
   */
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset a página 1
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    clearApiError();
  }, [clearApiError]);

  // Efecto para cargar datos automáticamente cuando el usuario esté autenticado
  useEffect(() => {
    if (options.autoLoad && isAuthenticated && !authLoading) {
      loadData();
    }
  }, [
    pagination.page,
    pagination.limit,
    filters,
    isAuthenticated,
    authLoading,
    options.autoLoad,
    loadData,
  ]); // Re-ejecuta cuando cambian pagination, filters o auth

  // Estado y acciones del hook
  const state: ApiDataState<T> = {
    data,
    loading: loading || authLoading,
    error: apiError,
    pagination,
    filters,
  };

  const actions: ApiDataActions<T> = {
    loadData,
    refreshData,
    createItem,
    updateItem,
    deleteItem,
    setPage,
    setLimit,
    setFilters: updateFilters,
    clearError,
  };

  return [state, actions];
}

export default useApiData;
