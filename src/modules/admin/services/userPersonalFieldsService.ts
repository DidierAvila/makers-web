import { ApiResponse, backendApiService } from '@/modules/shared/services/api';
import {
  CreateUserPersonalFieldDto,
  UpdateFieldValuesDto,
  UpdateUserPersonalFieldDto,
  UserAdditionalData,
  UserPersonalField,
  UserPersonalFieldsConfig,
} from '../../shared/types/dynamic-fields';

/**
 * Servicio para gestión de campos dinámicos personales por usuario
 * Estos campos son específicos para cada usuario individual
 */

export class UserPersonalFieldsService {
  /**
   * Obtiene todos los campos personales de un usuario
   */
  static async getUserPersonalFields(userId: string): Promise<UserPersonalField[]> {
    return backendApiService.get<UserPersonalField[]>(`/Api/Auth/Users/${userId}/personal-fields`);
  }

  /**
   * Obtiene la configuración completa de campos para un usuario
   * Incluye campos heredados de UserType + campos personales
   */
  static async getUserPersonalFieldsConfig(userId: string): Promise<UserPersonalFieldsConfig> {
    return backendApiService.get<UserPersonalFieldsConfig>(
      `/Api/Auth/Users/${userId}/fields-config`
    );
  }

  /**
   * Obtiene los datos adicionales completos de un usuario
   * Incluye valores de campos heredados y personales
   */
  static async getUserAdditionalData(userId: string): Promise<UserAdditionalData> {
    return backendApiService.get<UserAdditionalData>(`/Api/Auth/Users/${userId}/additional-data`);
  }

  /**
   * Crea un nuevo campo personal para un usuario
   */
  static async createUserPersonalField(
    fieldData: CreateUserPersonalFieldDto
  ): Promise<ApiResponse<UserPersonalField>> {
    return backendApiService.post<ApiResponse<UserPersonalField>>(
      `/Api/Auth/Users/${fieldData.userId}/personal-fields`,
      fieldData as unknown as Record<string, unknown>
    );
  }

  /**
   * Actualiza un campo personal existente de un usuario
   */
  static async updateUserPersonalField(
    userId: string,
    fieldData: UpdateUserPersonalFieldDto
  ): Promise<ApiResponse<UserPersonalField>> {
    return backendApiService.put<ApiResponse<UserPersonalField>>(
      `/Api/Auth/Users/${userId}/personal-fields/${fieldData.id}`,
      fieldData as unknown as Record<string, unknown>
    );
  }

  /**
   * Elimina un campo personal de un usuario
   */
  static async deleteUserPersonalField(
    userId: string,
    fieldId: string
  ): Promise<ApiResponse<boolean>> {
    return backendApiService.delete<ApiResponse<boolean>>(
      `/Api/Auth/Users/${userId}/personal-fields/${fieldId}`
    );
  }

  /**
   * Actualiza los valores de múltiples campos de un usuario
   */
  static async updateUserFieldValues(
    updateData: UpdateFieldValuesDto
  ): Promise<ApiResponse<UserAdditionalData>> {
    return backendApiService.put<ApiResponse<UserAdditionalData>>(
      `/Api/Auth/Users/${updateData.userId}/field-values`,
      updateData as unknown as Record<string, unknown>
    );
  }

  /**
   * Actualiza el valor de un campo específico
   */
  static async updateSingleFieldValue(
    userId: string,
    fieldId: string,
    value: any
  ): Promise<ApiResponse<boolean>> {
    return backendApiService.patch<ApiResponse<boolean>>(
      `/Api/Auth/Users/${userId}/field-values/${fieldId}`,
      { value } as unknown as Record<string, unknown>
    );
  }

  /**
   * Reordena los campos personales de un usuario
   */
  static async reorderUserPersonalFields(
    userId: string,
    fieldOrders: { fieldId: string; order: number }[]
  ): Promise<ApiResponse<boolean>> {
    return backendApiService.put<ApiResponse<boolean>>(
      `/Api/Auth/Users/${userId}/personal-fields/reorder`,
      { fieldOrders } as unknown as Record<string, unknown>
    );
  }

  /**
   * Activa o desactiva un campo personal
   */
  static async toggleUserPersonalFieldStatus(
    userId: string,
    fieldId: string,
    isActive: boolean
  ): Promise<ApiResponse<UserPersonalField>> {
    return backendApiService.patch<ApiResponse<UserPersonalField>>(
      `/Api/Auth/Users/${userId}/personal-fields/${fieldId}/toggle-status`,
      { isActive } as unknown as Record<string, unknown>
    );
  }

  /**
   * Sobrescribe un campo de UserType con configuración personal
   */
  static async overrideUserTypeField(
    userId: string,
    userTypeFieldId: string,
    overrideData: Partial<CreateUserPersonalFieldDto>
  ): Promise<ApiResponse<UserPersonalField>> {
    return backendApiService.post<ApiResponse<UserPersonalField>>(
      `/Api/Auth/Users/${userId}/override-field/${userTypeFieldId}`,
      overrideData as unknown as Record<string, unknown>
    );
  }

  /**
   * Restablece un campo sobrescrito a su configuración de UserType original
   */
  static async resetFieldToUserTypeDefault(
    userId: string,
    fieldId: string
  ): Promise<ApiResponse<boolean>> {
    return backendApiService.delete<ApiResponse<boolean>>(
      `/Api/Auth/Users/${userId}/personal-fields/${fieldId}/reset-to-default`
    );
  }

  /**
   * Duplica un campo personal existente
   */
  static async duplicateUserPersonalField(
    userId: string,
    fieldId: string
  ): Promise<ApiResponse<UserPersonalField>> {
    return backendApiService.post<ApiResponse<UserPersonalField>>(
      `/Api/Auth/Users/${userId}/personal-fields/${fieldId}/duplicate`,
      {} as unknown as Record<string, unknown>
    );
  }

  /**
   * Exporta los datos adicionales de un usuario
   */
  static async exportUserAdditionalData(
    userId: string,
    format: 'json' | 'csv' = 'json',
    includeInheritedFields = true
  ): Promise<Blob> {
    return backendApiService.get<Blob>(
      `/Api/Auth/Users/${userId}/additional-data/export?format=${format}&includeInherited=${includeInheritedFields}`,
      {
        headers: {
          Accept: format === 'csv' ? 'text/csv' : 'application/json',
        },
      }
    );
  }

  /**
   * Importa datos adicionales para un usuario desde un archivo
   */
  static async importUserAdditionalData(
    userId: string,
    file: File,
    options: {
      overwriteExisting?: boolean;
      validateOnly?: boolean;
    } = {}
  ): Promise<
    ApiResponse<{
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
      warnings: string[];
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('overwriteExisting', String(options.overwriteExisting ?? false));
    formData.append('validateOnly', String(options.validateOnly ?? false));

    return backendApiService.post<ApiResponse<any>>(
      `/Api/Auth/Users/${userId}/additional-data/import`,
      formData
    );
  }

  /**
   * Obtiene el historial de cambios de campos de un usuario
   */
  static async getUserFieldsHistory(
    userId: string,
    options: {
      fieldId?: string;
      fromDate?: string;
      toDate?: string;
      limit?: number;
    } = {}
  ): Promise<
    {
      fieldId: string;
      fieldName: string;
      oldValue: any;
      newValue: any;
      changedAt: string;
      changedBy: string;
      changeType: 'create' | 'update' | 'delete';
    }[]
  > {
    const params = {
      fieldId: options.fieldId,
      fromDate: options.fromDate,
      toDate: options.toDate,
      limit: options.limit,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    return backendApiService.getWithParams<any[]>(
      `/Api/Auth/Users/${userId}/fields-history`,
      cleanParams
    );
  }

  /**
   * Valida los valores de campos antes de guardarlos
   */
  static async validateFieldValues(
    userId: string,
    values: Record<string, any>
  ): Promise<{
    isValid: boolean;
    fieldErrors: Record<string, string[]>;
    globalErrors: string[];
    warnings: string[];
  }> {
    return backendApiService.post<any>(`/Api/Auth/Users/${userId}/validate-field-values`, {
      values,
    } as unknown as Record<string, unknown>);
  }

  /**
   * Obtiene sugerencias de valores para un campo basado en datos históricos
   */
  static async getFieldValueSuggestions(
    userId: string,
    fieldId: string,
    partialValue?: string
  ): Promise<
    {
      value: any;
      label: string;
      frequency: number;
      lastUsed: string;
    }[]
  > {
    const params = partialValue ? { q: partialValue } : {};

    return backendApiService.getWithParams<any[]>(
      `/Api/Auth/Users/${userId}/field-suggestions/${fieldId}`,
      params
    );
  }

  /**
   * Sincroniza campos personales con cambios en UserType
   */
  static async syncWithUserTypeFields(
    userId: string,
    options: {
      addNewFields?: boolean;
      updateModifiedFields?: boolean;
      removeDeletedFields?: boolean;
    } = {}
  ): Promise<
    ApiResponse<{
      added: number;
      updated: number;
      removed: number;
      conflicts: {
        fieldId: string;
        fieldName: string;
        conflictType: string;
        userValue: any;
        userTypeValue: any;
      }[];
    }>
  > {
    return backendApiService.post<ApiResponse<any>>(
      `/Api/Auth/Users/${userId}/sync-usertype-fields`,
      options as unknown as Record<string, unknown>
    );
  }
}

// Helper functions para construcción de DTOs

/**
 * Crea un DTO para sobrescribir un campo de UserType
 */
export function createFieldOverrideDto(
  userId: string,
  parentFieldId: string,
  overrides: {
    label?: string;
    description?: string;
    defaultValue?: any;
    placeholder?: string;
    validation?: any;
  }
): CreateUserPersonalFieldDto {
  return {
    userId,
    name: `override_${parentFieldId}`,
    label: overrides.label || '',
    type: 'text', // Se determinará del campo padre
    parentFieldId,
    ...overrides,
  };
}

/**
 * Crea un DTO para campo personal completamente nuevo
 */
export function createPersonalFieldDto(
  userId: string,
  name: string,
  label: string,
  type: any,
  options: {
    description?: string;
    validation?: any;
    defaultValue?: any;
    placeholder?: string;
    order?: number;
  } = {}
): CreateUserPersonalFieldDto {
  return {
    userId,
    name,
    label,
    type,
    description: options.description,
    validation: options.validation,
    defaultValue: options.defaultValue,
    placeholder: options.placeholder,
    order: options.order,
    // parentFieldId se omite para campos completamente nuevos
  };
}

/**
 * Crea un DTO para actualización masiva de valores
 */
export function createFieldValuesUpdateDto(
  userId: string,
  fieldValues: Record<string, any>
): UpdateFieldValuesDto {
  return {
    userId,
    values: Object.entries(fieldValues).map(([fieldId, value]) => ({
      fieldId,
      value,
    })),
  };
}
