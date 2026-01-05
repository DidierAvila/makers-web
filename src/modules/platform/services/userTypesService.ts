/**
 * User Types Service - Servicio para gestión de tipos de usuario
 * Platform Web Frontend - Next.js TypeScript
 */

import { api } from '@/modules/shared/services/api';

// Interface para el dropdown de tipos de usuario
export interface UserTypeDropdown {
  value: string; // ID del tipo de usuario
  label: string; // Nombre del tipo de usuario
}

/**
 * Servicio para operaciones relacionadas con tipos de usuario
 */
export const userTypesService = {
  /**
   * Obtener lista de tipos de usuario para dropdown
   * @returns Promise con array de tipos de usuario para dropdown
   */
  getUserTypesDropdown: async (): Promise<UserTypeDropdown[]> => {
    try {
      console.log('🔍 Cargando tipos de usuario...');

      const response = await api.get<UserTypeDropdown[]>('/Api/Auth/UserTypes/dropdown');

      // Validar estructura de respuesta
      if (!Array.isArray(response)) {
        console.error('❌ Respuesta inválida del servicio de tipos de usuario:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      // Validar que cada elemento tenga la estructura esperada
      const validUserTypes = response.filter((userType: any) => {
        const isValid =
          userType &&
          typeof userType.value === 'string' &&
          typeof userType.label === 'string' &&
          userType.value.trim() !== '' &&
          userType.label.trim() !== '';

        if (!isValid) {
          console.warn('⚠️ Tipo de usuario con formato inválido filtrado:', userType);
        }

        return isValid;
      });

      console.log(`✅ ${validUserTypes.length} tipos de usuario cargados exitosamente`);
      return validUserTypes;
    } catch (error) {
      console.error('❌ Error al cargar tipos de usuario:', error);

      // Re-lanzar con mensaje más descriptivo
      if (error instanceof Error) {
        throw new Error(`Error al cargar tipos de usuario: ${error.message}`);
      }

      throw new Error('Error desconocido al cargar tipos de usuario');
    }
  },

  /**
   * Buscar tipo de usuario por nombre (case-insensitive)
   * @param userTypes - Lista completa de tipos de usuario
   * @param typeName - Nombre del tipo a buscar (ej: "Proveedor")
   * @returns Tipo de usuario encontrado o null
   */
  findUserTypeByName: (
    userTypes: UserTypeDropdown[],
    typeName: string
  ): UserTypeDropdown | null => {
    const searchTerm = typeName.toLowerCase().trim();

    return userTypes.find((userType) => userType.label.toLowerCase().includes(searchTerm)) || null;
  },

  /**
   * Obtener tipo de usuario por ID
   * @param userTypes - Lista de tipos de usuario
   * @param userTypeId - ID del tipo de usuario a buscar
   * @returns Tipo de usuario encontrado o null
   */
  getUserTypeById: (userTypes: UserTypeDropdown[], userTypeId: string): UserTypeDropdown | null => {
    return userTypes.find((userType) => userType.value === userTypeId) || null;
  },
};

export default userTypesService;
