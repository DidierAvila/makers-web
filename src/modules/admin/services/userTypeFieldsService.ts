import { ApiResponse, backendApiService } from '@/modules/shared/services/api';
import {
  CreateUserTypeFieldDto,
  UpdateUserTypeFieldDto,
  UserTypeField,
  UserTypeFieldsConfig,
} from '../../shared/types/dynamic-fields';
import { userTypesService } from './userTypesService';

/**
 * Servicio para gestión de campos dinámicos a nivel de UserType
 * Estos campos se almacenan en el additionalConfig del UserType
 */

export class UserTypeFieldsService {
  /**
   * Helper para actualizar un UserType con todos los campos requeridos
   */
  private static async updateUserTypeWithRequiredFields(
    userTypeId: string,
    updatedFields: UserTypeField[]
  ): Promise<void> {
    const userType = await userTypesService.getById(userTypeId);

    const updatedConfig = {
      ...userType.additionalConfig,
      dynamicFields: updatedFields,
    };

    // Incluir todos los campos requeridos por el backend
    await userTypesService.update(userTypeId, {
      name: userType.name,
      description: userType.description,
      status: userType.status,
      theme: userType.theme,
      defaultLandingPage: userType.defaultLandingPage,
      logoUrl: userType.logoUrl,
      language: userType.language,
      additionalConfig: updatedConfig,
    });
  }

  /**
   * Obtiene todos los campos definidos para un UserType desde su additionalConfig
   */
  static async getUserTypeFields(userTypeId: string): Promise<UserTypeField[]> {
    try {
      const userType = await userTypesService.getById(userTypeId);
      return userType.additionalConfig?.dynamicFields || [];
    } catch (error) {
      console.error('Error loading UserType fields:', error);
      return [];
    }
  }

  /**
   * Obtiene la configuración completa de campos para un UserType
   */
  static async getUserTypeFieldsConfig(userTypeId: string): Promise<UserTypeFieldsConfig> {
    try {
      const userType = await userTypesService.getById(userTypeId);
      const fields = userType.additionalConfig?.dynamicFields || [];

      return {
        userTypeId: userType.id,
        userTypeName: userType.name,
        fields: fields,
        isActive: userType.status,
        totalFields: fields.length,
        lastUpdated: new Date(userType.updatedAt || userType.createdAt),
      };
    } catch (error) {
      console.error('Error loading UserType fields config:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los UserTypes con sus campos configurados
   */
  static async getAllUserTypesFieldsConfig(): Promise<UserTypeFieldsConfig[]> {
    return backendApiService.get<UserTypeFieldsConfig[]>('/Api/Admin/UserTypes/fields-config');
  }

  /**
   * Crea un nuevo campo para un UserType
   */
  static async createUserTypeField(
    fieldData: CreateUserTypeFieldDto
  ): Promise<ApiResponse<UserTypeField>> {
    try {
      // Obtener el UserType actual
      const userType = await userTypesService.getById(fieldData.userTypeId);

      // Crear el nuevo campo
      const newField: UserTypeField = {
        id: crypto.randomUUID(),
        userTypeId: fieldData.userTypeId,
        name: fieldData.name,
        label: fieldData.label,
        description: fieldData.description,
        type: fieldData.type,
        validation: fieldData.validation,
        options: fieldData.options,
        order: fieldData.order || 0,
        isActive: fieldData.isActive ?? true,
        isInheritable: fieldData.isInheritable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: obtener del usuario logueado
      };

      // Obtener campos existentes y agregar el nuevo
      const existingFields = userType.additionalConfig?.dynamicFields || [];
      const updatedFields = [...existingFields, newField];

      // Actualizar el UserType con los nuevos campos
      await this.updateUserTypeWithRequiredFields(fieldData.userTypeId, updatedFields);

      return {
        success: true,
        data: newField,
        message: 'Campo creado exitosamente',
      };
    } catch (error) {
      console.error('Error creating UserType field:', error);
      return {
        success: false,
        data: {} as UserTypeField,
        message: error instanceof Error ? error.message : 'Error al crear campo',
      };
    }
  }

  /**
   * Actualiza un campo existente de un UserType
   */
  static async updateUserTypeField(
    userTypeId: string,
    fieldData: UpdateUserTypeFieldDto
  ): Promise<ApiResponse<UserTypeField>> {
    try {
      const userType = await userTypesService.getById(userTypeId);
      const existingFields = userType.additionalConfig?.dynamicFields || [];

      // Encontrar y actualizar el campo
      const updatedFields = existingFields.map((field) =>
        field.id === fieldData.id ? { ...field, ...fieldData, updatedAt: new Date() } : field
      );

      // Verificar que el campo existe
      const updatedField = updatedFields.find((field) => field.id === fieldData.id);
      if (!updatedField) {
        throw new Error(`Campo con ID ${fieldData.id} no encontrado`);
      }

      // Actualizar el UserType
      await this.updateUserTypeWithRequiredFields(userTypeId, updatedFields);

      return {
        success: true,
        data: updatedField,
        message: 'Campo actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error updating UserType field:', error);
      return {
        success: false,
        data: {} as UserTypeField,
        message: error instanceof Error ? error.message : 'Error al actualizar campo',
      };
    }
  }

  /**
   * Elimina un campo de un UserType
   */
  static async deleteUserTypeField(
    userTypeId: string,
    fieldId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const userType = await userTypesService.getById(userTypeId);
      const existingFields = userType.additionalConfig?.dynamicFields || [];

      // Filtrar el campo a eliminar
      const updatedFields = existingFields.filter((field) => field.id !== fieldId);

      // Actualizar el UserType
      await this.updateUserTypeWithRequiredFields(userTypeId, updatedFields);

      return {
        success: true,
        data: true,
        message: 'Campo eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error deleting UserType field:', error);
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Error al eliminar campo',
      };
    }
  }

  /**
   * Reordena los campos de un UserType
   */
  static async reorderUserTypeFields(
    userTypeId: string,
    fieldOrders: { fieldId: string; order: number }[]
  ): Promise<ApiResponse<boolean>> {
    try {
      const userType = await userTypesService.getById(userTypeId);
      const existingFields = userType.additionalConfig?.dynamicFields || [];

      // Actualizar el orden de los campos
      const updatedFields = existingFields.map((field) => {
        const newOrder = fieldOrders.find((order) => order.fieldId === field.id);
        return newOrder ? { ...field, order: newOrder.order, updatedAt: new Date() } : field;
      });

      // Ordenar por el nuevo orden
      updatedFields.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Actualizar el UserType
      await this.updateUserTypeWithRequiredFields(userTypeId, updatedFields);

      return {
        success: true,
        data: true,
        message: 'Campos reordenados exitosamente',
      };
    } catch (error) {
      console.error('Error reordering UserType fields:', error);
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Error al reordenar campos',
      };
    }
  }

  /**
   * Activa o desactiva un campo de UserType
   */
  static async toggleUserTypeFieldStatus(
    userTypeId: string,
    fieldId: string,
    isActive: boolean
  ): Promise<ApiResponse<UserTypeField>> {
    return backendApiService.patch<ApiResponse<UserTypeField>>(
      `/Api/Admin/UserTypes/${userTypeId}/fields/${fieldId}/toggle-status`,
      { isActive } as unknown as Record<string, unknown>
    );
  }

  /**
   * Duplica un campo existente en el mismo UserType
   */
  static async duplicateUserTypeField(
    userTypeId: string,
    fieldId: string
  ): Promise<ApiResponse<UserTypeField>> {
    return backendApiService.post<ApiResponse<UserTypeField>>(
      `/Api/Admin/UserTypes/${userTypeId}/fields/${fieldId}/duplicate`,
      {} as unknown as Record<string, unknown>
    );
  }
}

// Helper functions para construcción de DTOs

/**
 * Crea un DTO básico para un campo de texto
 */
export function createTextFieldDto(
  userTypeId: string,
  name: string,
  label: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    description?: string;
  } = {}
): CreateUserTypeFieldDto {
  return {
    userTypeId,
    name,
    label,
    type: 'text',
    description: options.description,
    placeholder: options.placeholder,
    validation: {
      required: options.required ?? false,
      minLength: options.minLength,
      maxLength: options.maxLength,
    },
    isInheritable: true,
  };
}

/**
 * Crea un DTO básico para un campo de selección
 */
export function createSelectFieldDto(
  userTypeId: string,
  name: string,
  label: string,
  options: { value: string | number; label: string }[],
  config: {
    required?: boolean;
    defaultValue?: any;
    description?: string;
  } = {}
): CreateUserTypeFieldDto {
  return {
    userTypeId,
    name,
    label,
    type: 'select',
    description: config.description,
    options,
    defaultValue: config.defaultValue,
    validation: {
      required: config.required ?? false,
    },
    isInheritable: true,
  };
}

/**
 * Crea un DTO básico para un campo numérico
 */
export function createNumberFieldDto(
  userTypeId: string,
  name: string,
  label: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    defaultValue?: number;
    description?: string;
  } = {}
): CreateUserTypeFieldDto {
  return {
    userTypeId,
    name,
    label,
    type: 'number',
    description: options.description,
    defaultValue: options.defaultValue,
    validation: {
      required: options.required ?? false,
      min: options.min,
      max: options.max,
    },
    isInheritable: true,
  };
}
