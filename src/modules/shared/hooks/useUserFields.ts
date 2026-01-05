import { UserFieldsService } from '@/modules/admin/services';
import {
  CreateUserFieldDto,
  DynamicFieldsState,
  UpdateUserFieldDto,
  UserField,
  UserFieldsConfig,
} from '@/modules/shared/types/dynamic-fields';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para gestionar campos dinámicos de Usuario
 */
export function useUserFields(userId: string) {
  const [state, setState] = useState<DynamicFieldsState>({
    isLoading: true,
    isUpdating: false,
    error: null,
    lastSync: null,
  });

  const [fields, setFields] = useState<UserField[]>([]);
  const [config, setConfig] = useState<UserFieldsConfig | null>(null);

  /**
   * Carga los campos del Usuario
   */
  const loadFields = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const fieldsData = await UserFieldsService.getUserFields(userId);
      setFields(fieldsData);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar campos',
      }));
    }
  }, [userId]);

  /**
   * Carga la configuración completa del Usuario
   */
  const loadConfig = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const configData = await UserFieldsService.getUserFieldsConfig(userId);
      setConfig(configData);
      setFields(configData.fields);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar configuración',
      }));
    }
  }, [userId]);

  /**
   * Crea un nuevo campo
   */
  const createField = useCallback(async (fieldData: CreateUserFieldDto) => {
    setState((prev) => ({ ...prev, isUpdating: true, error: null }));

    try {
      const response = await UserFieldsService.createUserField(fieldData);

      if (response.success) {
        if (response.data) {
          setFields((prev) => [...prev, response.data]);
        }
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          lastSync: new Date(),
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear campo');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Error al crear campo',
      }));
      throw error;
    }
  }, []);

  /**
   * Actualiza un campo existente
   */
  const updateField = useCallback(
    async (fieldData: UpdateUserFieldDto) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserFieldsService.updateUserField(userId, fieldData);

        if (response.success) {
          if (response.data) {
            setFields((prev) =>
              prev.map((field) => (field.id === fieldData.id ? response.data : field))
            );
          }
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return response.data;
        } else {
          throw new Error(response.message || 'Error al actualizar campo');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error al actualizar campo',
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Elimina un campo
   */
  const deleteField = useCallback(
    async (fieldId: string) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserFieldsService.deleteUserField(userId, fieldId);

        if (response.success) {
          setFields((prev) => prev.filter((field) => field.id !== fieldId));
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return true;
        } else {
          throw new Error(response.message || 'Error al eliminar campo');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error al eliminar campo',
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Reordena campos
   */
  const reorderFields = useCallback(
    async (fieldIds: string[]) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserFieldsService.reorderUserFields(userId, fieldIds);

        if (response.success && response.data) {
          setFields(response.data);
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return response.data;
        } else {
          throw new Error(response.message || 'Error al reordenar campos');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error al reordenar campos',
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Activa/desactiva un campo
   */
  const toggleFieldStatus = useCallback(
    async (fieldId: string, isActive: boolean) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserFieldsService.toggleUserFieldStatus(userId, fieldId, isActive);

        if (response.success && response.data) {
          setFields((prev) => prev.map((field) => (field.id === fieldId ? response.data : field)));
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return response.data;
        } else {
          throw new Error(response.message || 'Error al cambiar estado del campo');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error al cambiar estado del campo',
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Duplica un campo existente
   */
  const duplicateField = useCallback(
    async (fieldId: string, newName?: string) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserFieldsService.duplicateUserField(userId, fieldId, newName);

        if (response.success && response.data) {
          setFields((prev) => [...prev, response.data]);
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return response.data;
        } else {
          throw new Error(response.message || 'Error al duplicar campo');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isUpdating: false,
          error: error instanceof Error ? error.message : 'Error al duplicar campo',
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Limpia errores
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Actualiza datos
   */
  const refresh = useCallback(() => {
    loadConfig(); // Usar loadConfig en lugar de loadFields
  }, [loadConfig]);

  // Efecto para carga inicial
  useEffect(() => {
    if (userId) {
      loadConfig(); // Usar loadConfig en lugar de loadFields
    }
  }, [userId, loadConfig]);

  // Campos ordenados por orden
  const sortedFields = fields.sort((a, b) => a.order - b.order);

  // Campos activos
  const activeFields = sortedFields.filter((field) => field.isActive);

  // Estadísticas
  const stats = {
    total: fields.length,
    active: activeFields.length,
    inactive: fields.length - activeFields.length,
    required: fields.filter((field) => field.validation?.required).length,
    optional: fields.filter((field) => !field.validation?.required).length,
  };

  return {
    // Estado
    ...state,

    // Datos
    fields: sortedFields,
    activeFields,
    config,
    stats,

    // Acciones
    loadFields,
    loadConfig,
    createField,
    updateField,
    deleteField,
    reorderFields,
    toggleFieldStatus,
    duplicateField,
    clearError,
    refresh,
  };
}
