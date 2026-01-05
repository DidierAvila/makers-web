import { api } from '@/modules/shared/services/api';

// Interfaces para el servicio de roles
export interface ServiceRole {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[]; // Cambiar a array de objetos con permisos completos
  userCount?: number; // Opcional ya que no viene en el detalle del rol
  status: boolean; // Backend usa boolean
  createdAt: string;
  updatedAt?: string;
}

// Interface para permisos dentro de un rol
export interface RolePermission {
  id: string;
  name: string;
}

export interface RoleFilters {
  Name?: string;
  SearchTerm?: string;
  Status?: boolean | string;
  Page?: number;
  PageSize?: number;
  SortBy?: 'name' | 'description' | 'status' | 'createdat';
  SortOrder?: 'asc' | 'desc';
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissionIds: string[]; // Cambiar a permissionIds para coincidir con la API
  status: boolean;
  [key: string]: unknown;
}

export interface UpdateRoleData extends CreateRoleData {
  id: string;
}

export interface RoleResponse {
  success: boolean;
  data: ServiceRole[];
  totalItems: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  message?: string;
}

export interface SingleRoleResponse {
  success: boolean;
  data: ServiceRole;
  message?: string;
}

// Interface para permisos dropdown
export interface PermissionDropdown {
  id: string;
  name: string;
}

class RolesService {
  /**
   * Obtiene permisos para dropdown
   */
  async getPermissionsDropdown(): Promise<PermissionDropdown[]> {
    try {
      const data = await api.get<PermissionDropdown[]>('/Api/Auth/Permissions/dropdown');
      return data;
    } catch (error) {
      console.error('Error fetching permissions dropdown:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los roles con filtros opcionales
   */
  async getAll(filters: RoleFilters = {}): Promise<RoleResponse> {
    try {
      // Construir parámetros de consulta
      const params: Record<string, string | number | boolean | undefined> = {};

      if (filters.Name) params.Name = filters.Name;
      if (filters.Status !== undefined) params.Status = filters.Status;
      if (filters.Page) params.Page = filters.Page;
      if (filters.PageSize) params.PageSize = filters.PageSize;
      if (filters.SortBy) params.SortBy = filters.SortBy;
      if (filters.SortOrder) params.SortOrder = filters.SortOrder;

      const data = await api.getWithParams<any>('/Api/Auth/Roles', params);
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Obtiene un rol por ID
   */
  async getById(id: string): Promise<ServiceRole> {
    try {
      const data = await api.get<ServiceRole>(`/Api/Auth/Roles/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo rol
   */
  async create(roleData: CreateRoleData): Promise<ServiceRole> {
    try {
      const data = await api.post<ServiceRole>('/Api/Auth/Roles', roleData);
      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Actualiza un rol existente
   */
  async update(roleData: UpdateRoleData): Promise<ServiceRole> {
    try {
      const data = await api.put<ServiceRole>(`/Api/Auth/Roles/${roleData.id}`, roleData);
      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Elimina un rol
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.delete(`/Api/Auth/Roles/${id}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting role:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Busca roles por término
   */
  async search(searchTerm: string, filters: Omit<RoleFilters, 'Name'> = {}): Promise<RoleResponse> {
    return this.getAll({ ...filters, Name: searchTerm });
  }
}

// Crear una instancia del servicio para usar en los componentes
export const rolesService = new RolesService();

export default RolesService;
