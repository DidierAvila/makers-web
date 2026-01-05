import { DynamicFieldDefinition } from '@/modules/shared/types/dynamic-fields';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserPersonalFields } from './useUserPersonalFields';
import { useUserTypeFields } from './useUserTypeFields';

/**
 * Hook maestro para gestionar campos dinámicos de dos niveles
 * Versión simplificada para la integración inicial
 */
export function useDynamicFields(userTypeId?: string, userId?: string) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar que tenemos parámetros válidos
  const hasValidParams = Boolean(userTypeId && userTypeId.trim() && userId && userId.trim());

  // Hooks para ambos niveles de campos - solo si tenemos parámetros válidos
  const userTypeFields = useUserTypeFields(hasValidParams ? userTypeId! : '');
  const personalFields = useUserPersonalFields(hasValidParams ? userId! : '');

  /**
   * Campos combinados con precedencia de personales sobre heredados
   */
  const combinedFields = useMemo<DynamicFieldDefinition[]>(() => {
    // Si no tenemos parámetros válidos, retornar array vacío
    if (!hasValidParams) {
      return [];
    }

    const inherited = userTypeFields.fields || [];
    const personal = personalFields.personalFields || [];

    // Crear mapa de campos personales para quick lookup
    const personalMap = new Map(
      personal.map((field) => [field.parentFieldId || field.name, field])
    );

    // Combinar campos con precedencia de personales
    const combined: DynamicFieldDefinition[] = [];

    // Agregar campos de UserType, reemplazando con personales si existen
    inherited.forEach((inheritedField) => {
      const personalOverride =
        personalMap.get(inheritedField.id) || personalMap.get(inheritedField.name);
      if (personalOverride) {
        combined.push(personalOverride);
        personalMap.delete(personalOverride.parentFieldId || personalOverride.name);
      } else {
        combined.push(inheritedField);
      }
    });

    // Agregar campos personales restantes (que no sobrescriben campos heredados)
    personalMap.forEach((personalField) => {
      if (!personalField.parentFieldId) {
        combined.push(personalField);
      }
    });

    // Ordenar por orden definido
    return combined.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [hasValidParams, userTypeFields.fields, personalFields.personalFields]);

  /**
   * Cargar valores de campos
   */
  const loadFieldValues = useCallback(async () => {
    if (!hasValidParams) return;

    setIsLoading(true);
    setError(null);

    try {
      const values = await personalFields.loadFieldValues();
      setFieldValues(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar valores');
    } finally {
      setIsLoading(false);
    }
  }, [hasValidParams, personalFields]);

  /**
   * Guardar valores de campos
   */
  const saveValues = useCallback(
    async (values: Record<string, any>) => {
      if (!hasValidParams) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Guardar valores individuales
        const promises = Object.entries(values).map(([fieldName, value]) =>
          personalFields.saveFieldValue(fieldName, value)
        );

        await Promise.all(promises);
        setFieldValues((prev) => ({ ...prev, ...values }));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar valores');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [hasValidParams, personalFields]
  );

  /**
   * Guardar valor de un campo individual
   */
  const saveFieldValue = useCallback(
    async (fieldName: string, value: any) => {
      return saveValues({ [fieldName]: value });
    },
    [saveValues]
  );

  /**
   * Validar un campo individual
   */
  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const field = combinedFields.find((f) => f.name === fieldName);
      if (!field) return null;

      // Validación requerida
      if (field.validation?.required && (value === null || value === undefined || value === '')) {
        return `${field.label} es requerido`;
      }

      // Validaciones por tipo
      if (field.validation) {
        const validation = field.validation;

        // Validación de longitud mínima
        if (
          validation.minLength !== undefined &&
          typeof value === 'string' &&
          value.length < validation.minLength
        ) {
          return `${field.label} debe tener al menos ${validation.minLength} caracteres`;
        }

        // Validación de longitud máxima
        if (
          validation.maxLength !== undefined &&
          typeof value === 'string' &&
          value.length > validation.maxLength
        ) {
          return `${field.label} no puede tener más de ${validation.maxLength} caracteres`;
        }

        // Validación de valor mínimo
        if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
          return `${field.label} debe ser mayor o igual a ${validation.min}`;
        }

        // Validación de valor máximo
        if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
          return `${field.label} debe ser menor o igual a ${validation.max}`;
        }

        // Validación de patrón
        if (validation.pattern && typeof value === 'string') {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return validation.customMessage || `${field.label} no tiene el formato correcto`;
          }
        }
      }

      return null;
    },
    [combinedFields]
  );

  /**
   * Validar todos los campos
   */
  const validateAll = useCallback(
    (values: Record<string, any>): Record<string, string> => {
      const errors: Record<string, string> = {};

      combinedFields.forEach((field) => {
        const error = validateField(field.name, values[field.name]);
        if (error) {
          errors[field.name] = error;
        }
      });

      return errors;
    },
    [combinedFields, validateField]
  );

  // Cargar valores iniciales
  useEffect(() => {
    loadFieldValues();
  }, [loadFieldValues]);

  return {
    // Campos
    combinedFields,
    userTypeFields: userTypeFields.fields || [],
    personalFields: personalFields.personalFields || [],

    // Valores
    fieldValues,
    setFieldValues,

    // Estados
    isLoading: isLoading || userTypeFields.isLoading || personalFields.isLoading,
    error: error || userTypeFields.error || personalFields.error,

    // Acciones
    saveValues,
    saveFieldValue,
    loadFieldValues,

    // Validación
    validateField,
    validateAll,

    // Funciones de gestión de campos
    createPersonalField: personalFields.createPersonalField,
    updatePersonalField: personalFields.updatePersonalField,
    deletePersonalField: personalFields.deletePersonalField,

    // Refresh
    refresh: () => {
      loadFieldValues();
      userTypeFields.refresh();
      personalFields.refresh();
    },
  };
}
