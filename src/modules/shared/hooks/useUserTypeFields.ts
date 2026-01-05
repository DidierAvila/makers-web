import { UserTypeFieldsService } from '@/modules/admin/services';
import {
  CreateUserTypeFieldDto,
  DynamicFieldsState,
  UpdateUserTypeFieldDto,
  UserTypeField,
  UserTypeFieldsConfig,
} from '@/modules/shared/types/dynamic-fields';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para gestionar campos dinámicos de UserType
 */
export function useUserTypeFields(userTypeId: string) {
  const [state, setState] = useState<DynamicFieldsState>({
    isLoading: true,
    isUpdating: false,
    error: null,
    lastSync: null,
  });

  const [fields, setFields] = useState<UserTypeField[]>([]);
  const [config, setConfig] = useState<UserTypeFieldsConfig | null>(null);

  /**
   * Carga los campos del UserType
   */
  const loadFields = useCallback(async () => {
    if (!userTypeId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const fieldsData = await UserTypeFieldsService.getUserTypeFields(userTypeId);
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
  }, [userTypeId]);

  /**
   * Carga la configuración completa del UserType
   */
  const loadConfig = useCallback(async () => {
    if (!userTypeId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const configData = await UserTypeFieldsService.getUserTypeFieldsConfig(userTypeId);
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
  }, [userTypeId]);

  /**
   * Crea un nuevo campo
   */
  const createField = useCallback(async (fieldData: CreateUserTypeFieldDto) => {
    setState((prev) => ({ ...prev, isUpdating: true, error: null }));

    try {
      const response = await UserTypeFieldsService.createUserTypeField(fieldData);

      if (response.success && response.data) {
        setFields((prev) => [...prev, response.data]);
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
    async (fieldData: UpdateUserTypeFieldDto) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserTypeFieldsService.updateUserTypeField(userTypeId, fieldData);

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
    [userTypeId]
  );

  /**
   * Elimina un campo
   */
  const deleteField = useCallback(
    async (fieldId: string) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserTypeFieldsService.deleteUserTypeField(userTypeId, fieldId);

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
    [userTypeId]
  );

  /**
   * Reordena los campos
   */
  const reorderFields = useCallback(
    async (fieldOrders: { fieldId: string; order: number }[]) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserTypeFieldsService.reorderUserTypeFields(userTypeId, fieldOrders);

        if (response.success) {
          // Actualizar orden local
          setFields((prev) => {
            const fieldsMap = new Map(prev.map((field) => [field.id, field]));
            return fieldOrders
              .map(({ fieldId, order }) => {
                const field = fieldsMap.get(fieldId);
                return field ? { ...field, order } : null;
              })
              .filter(Boolean) as UserTypeField[];
          });

          setState((prev) => ({
            ...prev,
            isUpdating: false,
            lastSync: new Date(),
          }));
          return true;
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
    [userTypeId]
  );

  /**
   * Cambia el estado activo/inactivo de un campo
   */
  const toggleFieldStatus = useCallback(
    async (fieldId: string, isActive: boolean) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserTypeFieldsService.toggleUserTypeFieldStatus(
          userTypeId,
          fieldId,
          isActive
        );

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
    [userTypeId]
  );

  /**
   * Duplica un campo existente
   */
  const duplicateField = useCallback(
    async (fieldId: string) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        const response = await UserTypeFieldsService.duplicateUserTypeField(userTypeId, fieldId);

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
    [userTypeId]
  );

  /**
   * Reinicia el estado de error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Recarga los datos
   */
  const refresh = useCallback(() => {
    loadConfig(); // Cambio: usar loadConfig en lugar de loadFields
  }, [loadConfig]);

  // Efecto para carga inicial
  useEffect(() => {
    if (userTypeId) {
      loadConfig(); // Cambio: usar loadConfig en lugar de loadFields
    }
  }, [userTypeId, loadConfig]);

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
