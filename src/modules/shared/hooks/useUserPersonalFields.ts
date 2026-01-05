import { UserPersonalFieldsService } from '@/modules/shared/services';
import {
  CreateUserPersonalFieldDto,
  UpdateUserPersonalFieldDto,
  UserPersonalField,
} from '@/modules/shared/types/dynamic-fields';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para gestionar campos dinámicos personales de usuario
 * Versión simplificada para completar el build
 */
export function useUserPersonalFields(userId: string) {
  const [personalFields, setPersonalFields] = useState<UserPersonalField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar campos personales
  const loadPersonalFields = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await UserPersonalFieldsService.getUserPersonalFields(userId);
      if (response.success) {
        setPersonalFields(response.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar campos');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Crear campo personal
  const createPersonalField = useCallback(async (fieldData: CreateUserPersonalFieldDto) => {
    try {
      const response = await UserPersonalFieldsService.createPersonalField(fieldData);
      if (response.success && response.data) {
        setPersonalFields((prev) => [...prev, response.data!]);
        return response.data;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  }, []);

  // Actualizar campo personal
  const updatePersonalField = useCallback(
    async (fieldId: string, fieldData: UpdateUserPersonalFieldDto) => {
      try {
        const response = await UserPersonalFieldsService.updatePersonalField(fieldId, fieldData);
        if (response.success && response.data) {
          setPersonalFields((prev) =>
            prev.map((field) => (field.id === fieldId ? response.data! : field))
          );
          return response.data;
        }
        throw new Error(response.message);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  // Eliminar campo personal
  const deletePersonalField = useCallback(async (fieldId: string) => {
    try {
      const response = await UserPersonalFieldsService.deletePersonalField(fieldId);
      if (response.success) {
        setPersonalFields((prev) => prev.filter((field) => field.id !== fieldId));
      }
      return response.success;
    } catch (error) {
      throw error;
    }
  }, []);

  // Guardar valor de campo
  const saveFieldValue = useCallback(
    async (fieldName: string, value: any) => {
      try {
        const response = await UserPersonalFieldsService.saveFieldValue(userId, fieldName, value);
        return response.success;
      } catch (error) {
        throw error;
      }
    },
    [userId]
  );

  // Cargar valores de campos
  const loadFieldValues = useCallback(async () => {
    try {
      const response = await UserPersonalFieldsService.getUserFieldValues(userId);
      if (response.success) {
        return response.data;
      }
      return {};
    } catch (error) {
      return {};
    }
  }, [userId]);

  // Cargar datos iniciales
  useEffect(() => {
    loadPersonalFields();
  }, [loadPersonalFields]);

  return {
    personalFields,
    isLoading,
    error,
    createPersonalField,
    updatePersonalField,
    deletePersonalField,
    saveFieldValue,
    loadFieldValues,
    refresh: loadPersonalFields,
  };
}
