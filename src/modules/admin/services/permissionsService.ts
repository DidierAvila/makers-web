import { backendApiService } from '../../shared/services/api';

// Interfaces para el servicio de permisos
export interface ServicePermission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  status: boolean;
  rolesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionFilters {
  Name?: string;
  Status?: boolean;
  Page?: number;
  PageSize?: number;
  SortBy?: string;
}

export interface PermissionResponse {
  success: boolean;
  data: ServicePermission[];
  totalItems: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  message?: string;
}

export interface SinglePermissionResponse {
  success: boolean;
  data: ServicePermission;
  message?: string;
}

export interface CreatePermissionData {
  name: string;
  description: string;
  module: string;
  action: string;
  status: boolean;
  [key: string]: unknown;
}

export interface UpdatePermissionData extends CreatePermissionData {
  id: string;
}

export class PermissionsService {
  private static readonly BASE_URL = '/Api/Auth/Permissions';

  /**
   * Obtiene una lista paginada de permisos con filtros opcionales
   * Campos disponibles para SortBy: name, description, status, createdat
   */
  static async getAll(filters: PermissionFilters = {}): Promise<PermissionResponse> {
    try {
      console.log('🔍 PermissionsService.getAll - Iniciando solicitud con filtros:', filters);
      const params = new URLSearchParams();
      if (filters.Name) {
        params.append('Name', filters.Name);
      }
      if (filters.Status !== undefined) {
        params.append('Status', filters.Status.toString());
      }
      if (filters.Page) {
        params.append('Page', filters.Page.toString());
      }
      if (filters.PageSize) {
        params.append('PageSize', filters.PageSize.toString());
      }
      if (filters.SortBy) {
        params.append('SortBy', filters.SortBy);
      }

      const url = `${this.BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🌐 PermissionsService.getAll - URL construida:', url);

      const response = await backendApiService.get(url);
      console.log('✅ PermissionsService.getAll - Respuesta recibida:', response);

      return response as PermissionResponse;
    } catch (error) {
      console.error('❌ PermissionsService.getAll - Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene un permiso por su ID
   */
  static async getById(id: string) {
    try {
      console.log('🔍 PermissionsService.getById - Obteniendo permiso con ID:', id);

      const response = await backendApiService.get(`${this.BASE_URL}/${id}`);
      console.log('✅ PermissionsService.getById - Permiso obtenido:', response);

      return response;
    } catch (error) {
      console.error('❌ PermissionsService.getById - Error:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo permiso
   */
  static async create(permissionData: CreatePermissionData) {
    try {
      console.log('🆕 PermissionsService.create - Creando permiso:', permissionData);

      const response = await backendApiService.post(this.BASE_URL, permissionData);
      console.log('✅ PermissionsService.create - Permiso creado:', response);

      return response;
    } catch (error) {
      console.error('❌ PermissionsService.create - Error:', error);
      throw error;
    }
  }

  /**
   * Actualiza un permiso existente
   */
  static async update(permissionData: UpdatePermissionData) {
    try {
      console.log('📝 PermissionsService.update - Actualizando permiso:', permissionData);

      const response = await backendApiService.put(
        `${this.BASE_URL}/${permissionData.id}`,
        permissionData
      );
      console.log('✅ PermissionsService.update - Permiso actualizado:', response);

      return response;
    } catch (error) {
      console.error('❌ PermissionsService.update - Error:', error);
      throw error;
    }
  }

  /**
   * Elimina un permiso
   */
  static async delete(id: string) {
    try {
      console.log('🗑️ PermissionsService.delete - Eliminando permiso con ID:', id);

      const response = await backendApiService.delete(`${this.BASE_URL}/${id}`);
      console.log('✅ PermissionsService.delete - Permiso eliminado:', response);

      return response;
    } catch (error) {
      console.error('❌ PermissionsService.delete - Error:', error);
      throw error;
    }
  }

  /**
   * Busca permisos por término de búsqueda
   */
  static async search(searchTerm: string, filters: Omit<PermissionFilters, 'Name'> = {}) {
    try {
      console.log('🔍 PermissionsService.search - Buscando permisos con término:', searchTerm);

      return await this.getAll({ ...filters, Name: searchTerm });
    } catch (error) {
      console.error('❌ PermissionsService.search - Error:', error);
      throw error;
    }
  }
}

// Crear una instancia del servicio para usar en los componentes
export const permissionsService = PermissionsService;

export default PermissionsService;
