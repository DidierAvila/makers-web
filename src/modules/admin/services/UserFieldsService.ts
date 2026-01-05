import { ApiResponse } from '@/modules/shared/services/api';
import {
  CreateUserFieldDto,
  UpdateUserFieldDto,
  UserField,
  UserFieldsConfig,
} from '../../shared/types/dynamic-fields';
import { usersService } from './usersService';

/**
 * Servicio para gestión de campos dinámicos a nivel de Usuario
 * Estos campos se almacenan en el additionalData del Usuario
 */

export class UserFieldsService {
  /**
   * Helper para actualizar un Usuario con todos los campos requeridos
   */
  private static async updateUserWithRequiredFields(
    userId: string,
    updatedFields: UserField[]
  ): Promise<void> {
    const response = await usersService.getById(userId);
    // El backend puede devolver los datos directamente o con wrapper data
    const user = response?.data || response;

    if (!user || typeof user !== 'object' || !user.id) {
      throw new Error('Usuario no encontrado o datos inválidos');
    }

    const updatedAdditionalData = {
      ...user.additionalData,
      dynamicFields: updatedFields,
    };

    // Incluir todos los campos requeridos por el backend
    await usersService.update(userId, {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      image: user.image,
      userTypeId: user.userTypeId,
      roleIds: user.roles?.map((role) => role.id) || [],
      additionalData: updatedAdditionalData,
    });
  }

  /**
   * Obtiene todos los campos definidos para un Usuario desde su additionalData
   */
  static async getUserFields(userId: string): Promise<UserField[]> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object') {
        return [];
      }

      return user.additionalData?.dynamicFields || [];
    } catch (error) {
      console.error('Error loading User fields:', error);
      return [];
    }
  }

  /**
   * Obtiene la configuración completa de campos para un Usuario
   */
  static async getUserFieldsConfig(userId: string): Promise<UserFieldsConfig> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const fields = user.additionalData?.dynamicFields || [];

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userTypeId: user.userTypeId,
        userTypeName: user.userTypeName,
        fields: fields,
        isActive: user.status,
        totalFields: fields.length,
        lastUpdated: new Date(user.updatedAt || user.createdAt),
      };
    } catch (error) {
      console.error('Error loading User fields config:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los Usuarios con sus campos configurados
   */
  static async getAllUsersWithFields(): Promise<UserFieldsConfig[]> {
    try {
      const response = await usersService.getAll();
      const users = Array.isArray(response) ? response : response.data || [];

      return users.map((user) => ({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userTypeId: user.userTypeId,
        userTypeName: user.userTypeName,
        fields: user.additionalData?.dynamicFields || [],
        isActive: user.status,
        totalFields: user.additionalData?.dynamicFields?.length || 0,
        lastUpdated: new Date(user.updatedAt || user.createdAt),
      }));
    } catch (error) {
      console.error('Error loading all users with fields:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo campo dinámico para un Usuario
   */
  static async createUserField(fieldData: CreateUserFieldDto): Promise<ApiResponse<UserField>> {
    try {
      const response = await usersService.getById(fieldData.userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      // Generar ID único para el campo
      const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear el nuevo campo
      const newField: UserField = {
        id: fieldId,
        userId: fieldData.userId,
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
      const existingFields = user.additionalData?.dynamicFields || [];
      const updatedFields = [...existingFields, newField];

      // Actualizar el Usuario con los nuevos campos
      await this.updateUserWithRequiredFields(fieldData.userId, updatedFields);

      return {
        success: true,
        data: newField,
        message: 'Campo creado exitosamente',
      };
    } catch (error) {
      console.error('Error creating User field:', error);
      return {
        success: false,
        data: {} as UserField,
        message: error instanceof Error ? error.message : 'Error al crear campo',
      };
    }
  }

  /**
   * Actualiza un campo existente de un Usuario
   */
  static async updateUserField(
    userId: string,
    fieldData: UpdateUserFieldDto
  ): Promise<ApiResponse<UserField>> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const existingFields: UserField[] = user.additionalData?.dynamicFields || [];

      // Encontrar y actualizar el campo
      const updatedFields = existingFields.map((field: UserField) =>
        field.id === fieldData.id ? { ...field, ...fieldData, updatedAt: new Date() } : field
      );

      // Verificar que el campo existe
      const updatedField = updatedFields.find((field: UserField) => field.id === fieldData.id);
      if (!updatedField) {
        throw new Error(`Campo con ID ${fieldData.id} no encontrado`);
      }

      // Actualizar el Usuario
      await this.updateUserWithRequiredFields(userId, updatedFields);

      return {
        success: true,
        data: updatedField,
        message: 'Campo actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error updating User field:', error);
      return {
        success: false,
        data: {} as UserField,
        message: error instanceof Error ? error.message : 'Error al actualizar campo',
      };
    }
  }

  /**
   * Elimina un campo de un Usuario
   */
  static async deleteUserField(userId: string, fieldId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const existingFields: UserField[] = user.additionalData?.dynamicFields || [];

      // Filtrar el campo a eliminar
      const updatedFields = existingFields.filter((field: UserField) => field.id !== fieldId);

      // Actualizar el Usuario
      await this.updateUserWithRequiredFields(userId, updatedFields);

      return {
        success: true,
        data: true,
        message: 'Campo eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error deleting User field:', error);
      return {
        success: false,
        data: false,
        message: error instanceof Error ? error.message : 'Error al eliminar campo',
      };
    }
  }

  /**
   * Reordena los campos de un Usuario
   */
  static async reorderUserFields(
    userId: string,
    fieldIds: string[]
  ): Promise<ApiResponse<UserField[]>> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const existingFields: UserField[] = user.additionalData?.dynamicFields || [];

      // Reordenar campos según el nuevo orden
      const reorderedFields = fieldIds
        .map((fieldId, index) => {
          const field = existingFields.find((f: UserField) => f.id === fieldId);
          if (field) {
            return { ...field, order: index, updatedAt: new Date() };
          }
          return null;
        })
        .filter(Boolean) as UserField[];

      // Actualizar el Usuario
      await this.updateUserWithRequiredFields(userId, reorderedFields);

      return {
        success: true,
        data: reorderedFields,
        message: 'Campos reordenados exitosamente',
      };
    } catch (error) {
      console.error('Error reordering User fields:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error al reordenar campos',
      };
    }
  }

  /**
   * Activa/desactiva un campo de un Usuario
   */
  static async toggleUserFieldStatus(
    userId: string,
    fieldId: string,
    isActive: boolean
  ): Promise<ApiResponse<UserField>> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const existingFields: UserField[] = user.additionalData?.dynamicFields || [];

      // Actualizar el estado del campo
      const updatedFields = existingFields.map((field: UserField) =>
        field.id === fieldId ? { ...field, isActive, updatedAt: new Date() } : field
      );

      const updatedField = updatedFields.find((field: UserField) => field.id === fieldId);
      if (!updatedField) {
        throw new Error(`Campo con ID ${fieldId} no encontrado`);
      }

      // Actualizar el Usuario
      await this.updateUserWithRequiredFields(userId, updatedFields);

      return {
        success: true,
        data: updatedField,
        message: `Campo ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      };
    } catch (error) {
      console.error('Error toggling User field status:', error);
      return {
        success: false,
        data: {} as UserField,
        message: error instanceof Error ? error.message : 'Error al cambiar estado del campo',
      };
    }
  }

  /**
   * Duplica un campo existente de un Usuario
   */
  static async duplicateUserField(
    userId: string,
    fieldId: string,
    newName?: string
  ): Promise<ApiResponse<UserField>> {
    try {
      const response = await usersService.getById(userId);
      // El backend puede devolver los datos directamente o con wrapper data
      const user = response?.data || response;

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Usuario no encontrado o datos inválidos');
      }

      const existingFields: UserField[] = user.additionalData?.dynamicFields || [];

      // Encontrar el campo a duplicar
      const fieldToDuplicate = existingFields.find((field: UserField) => field.id === fieldId);
      if (!fieldToDuplicate) {
        throw new Error(`Campo con ID ${fieldId} no encontrado`);
      }

      // Crear nuevo ID y nombre
      const newFieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const duplicatedName = newName || `${fieldToDuplicate.name}_copy`;

      // Crear el campo duplicado
      const duplicatedField: UserField = {
        ...fieldToDuplicate,
        id: newFieldId,
        name: duplicatedName,
        label: `${fieldToDuplicate.label} (Copia)`,
        order: existingFields.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: obtener del usuario logueado
      };

      // Agregar el campo duplicado
      const updatedFields = [...existingFields, duplicatedField];

      // Actualizar el Usuario
      await this.updateUserWithRequiredFields(userId, updatedFields);

      return {
        success: true,
        data: duplicatedField,
        message: 'Campo duplicado exitosamente',
      };
    } catch (error) {
      console.error('Error duplicating User field:', error);
      return {
        success: false,
        data: {} as UserField,
        message: error instanceof Error ? error.message : 'Error al duplicar campo',
      };
    }
  }
}

/**
 * Helpers para crear DTOs comunes
 */

/**
 * Crea un DTO básico para un campo de texto
 */
export function createTextFieldDto(
  userId: string,
  name: string,
  label: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    defaultValue?: string;
    description?: string;
  } = {}
): CreateUserFieldDto {
  return {
    userId,
    name,
    label,
    type: 'text',
    description: options.description,
    defaultValue: options.defaultValue,
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
  userId: string,
  name: string,
  label: string,
  config: {
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    defaultValue?: string;
    description?: string;
  }
): CreateUserFieldDto {
  const { options, ...rest } = config;

  return {
    userId,
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
  userId: string,
  name: string,
  label: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    defaultValue?: number;
    description?: string;
  } = {}
): CreateUserFieldDto {
  return {
    userId,
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
