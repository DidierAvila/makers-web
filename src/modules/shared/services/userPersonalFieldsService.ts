import { ApiResponse, backendApiService } from '@/modules/shared/services/api';
import {
  CreateUserPersonalFieldDto,
  UpdateUserPersonalFieldDto,
  UserPersonalField,
} from '@/modules/shared/types/dynamic-fields';

/**
 * Service for managing user personal fields
 *
 * Handles CRUD operations for individual user's personal dynamic fields.
 * These fields are specific to each user and can override or complement
 * the UserType fields defined at the group level.
 */
export class UserPersonalFieldsService {
  private static readonly BASE_URL = '/UserPersonalFields';

  /**
   * Get all personal fields for a specific user
   */
  static async getUserPersonalFields(userId: string): Promise<ApiResponse<UserPersonalField[]>> {
    try {
      const response = await backendApiService.get<UserPersonalField[]>(
        `${this.BASE_URL}/user/${userId}`
      );

      return {
        success: true,
        data: response,
        message: 'Campos personales obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching user personal fields:', error);
      return {
        success: false,
        data: [],
        message: 'Error al obtener los campos personales del usuario',
      };
    }
  }

  /**
   * Get a specific personal field by ID
   */
  static async getPersonalFieldById(
    fieldId: string
  ): Promise<ApiResponse<UserPersonalField | null>> {
    try {
      const response = await backendApiService.get<UserPersonalField>(
        `${this.BASE_URL}/${fieldId}`
      );

      return {
        success: true,
        data: response,
        message: 'Campo personal obtenido exitosamente',
      };
    } catch (error) {
      console.error('Error fetching personal field:', error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener el campo personal',
      };
    }
  }

  /**
   * Create a new personal field for a user
   */
  static async createPersonalField(
    fieldData: CreateUserPersonalFieldDto
  ): Promise<ApiResponse<UserPersonalField | null>> {
    try {
      const response = await backendApiService.post<UserPersonalField>(
        this.BASE_URL,
        fieldData as unknown as Record<string, unknown>
      );

      return {
        success: true,
        data: response,
        message: 'Campo personal creado exitosamente',
      };
    } catch (error) {
      console.error('Error creating personal field:', error);
      return {
        success: false,
        data: null,
        message: 'Error al crear el campo personal',
      };
    }
  }

  /**
   * Update an existing personal field
   */
  static async updatePersonalField(
    fieldId: string,
    fieldData: UpdateUserPersonalFieldDto
  ): Promise<ApiResponse<UserPersonalField | null>> {
    try {
      await backendApiService.put<void>(
        `${this.BASE_URL}/${fieldId}/value`,
        fieldData as unknown as Record<string, unknown>
      );

      return {
        success: true,
        data: null,
        message: 'Campo personal actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error updating personal field:', error);
      return {
        success: false,
        data: null,
        message: 'Error al actualizar el campo personal',
      };
    }
  }

  /**
   * Delete a personal field
   */
  static async deletePersonalField(fieldId: string): Promise<ApiResponse<boolean>> {
    try {
      await backendApiService.delete(`${this.BASE_URL}/${fieldId}`);

      return {
        success: true,
        data: true,
        message: 'Campo personal eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error deleting personal field:', error);
      return {
        success: false,
        data: false,
        message: 'Error al eliminar el campo personal',
      };
    }
  }

  /**
   * Save or update a personal field value for a user
   */
  static async saveFieldValue(
    userId: string,
    fieldName: string,
    value: any
  ): Promise<ApiResponse<boolean>> {
    try {
      const payload = {
        userId,
        fieldName,
        value: JSON.stringify(value),
      };

      await backendApiService.post(`${this.BASE_URL}/save-value`, payload);

      return {
        success: true,
        data: true,
        message: 'Valor del campo guardado exitosamente',
      };
    } catch (error) {
      console.error('Error saving field value:', error);
      return {
        success: false,
        data: false,
        message: 'Error al guardar el valor del campo',
      };
    }
  }

  /**
   * Get personal field values for a user
   */
  static async getUserFieldValues(userId: string): Promise<ApiResponse<Record<string, any>>> {
    try {
      const response = await backendApiService.get<Record<string, any>>(
        `${this.BASE_URL}/user/${userId}/values`
      );

      return {
        success: true,
        data: response || {},
        message: 'Valores de campos obtenidos exitosamente',
      };
    } catch (error) {
      console.error('Error fetching user field values:', error);
      return {
        success: false,
        data: {},
        message: 'Error al obtener los valores de los campos',
      };
    }
  }

  /**
   * Bulk save multiple field values for a user
   */
  static async saveMultipleFieldValues(
    userId: string,
    fieldValues: Record<string, any>
  ): Promise<ApiResponse<boolean>> {
    try {
      const payload = {
        userId,
        values: fieldValues,
      };

      await backendApiService.post(`${this.BASE_URL}/save-multiple-values`, payload);

      return {
        success: true,
        data: true,
        message: 'Valores de campos guardados exitosamente',
      };
    } catch (error) {
      console.error('Error saving multiple field values:', error);
      return {
        success: false,
        data: false,
        message: 'Error al guardar los valores de los campos',
      };
    }
  }

  /**
   * Clone personal fields from one user to another
   */
  static async cloneUserPersonalFields(
    sourceUserId: string,
    targetUserId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const payload = {
        sourceUserId,
        targetUserId,
      };

      await backendApiService.post(`${this.BASE_URL}/clone`, payload);

      return {
        success: true,
        data: true,
        message: 'Campos personales clonados exitosamente',
      };
    } catch (error) {
      console.error('Error cloning personal fields:', error);
      return {
        success: false,
        data: false,
        message: 'Error al clonar los campos personales',
      };
    }
  }

  /**
   * Reset personal fields for a user (remove all personal customizations)
   */
  static async resetUserPersonalFields(userId: string): Promise<ApiResponse<boolean>> {
    try {
      await backendApiService.delete(`${this.BASE_URL}/user/${userId}/reset`);

      return {
        success: true,
        data: true,
        message: 'Campos personales reiniciados exitosamente',
      };
    } catch (error) {
      console.error('Error resetting personal fields:', error);
      return {
        success: false,
        data: false,
        message: 'Error al reiniciar los campos personales',
      };
    }
  }
}
