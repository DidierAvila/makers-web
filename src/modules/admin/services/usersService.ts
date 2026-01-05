/**
 * Users Service - Servicio para gestión de usuarios
 * Platform Web Frontend - Next.js TypeScript
 */

import { ApiResponse, PaginatedResponse, backendApiService } from '@/modules/shared/services/api';

// Tipos para Usuario basados en la respuesta real del backend
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string; // Corregido: ahora usa 'address' en lugar de 'addres'
  image?: string;
  firstRoleName?: string | null;
  userTypeId: string;
  userTypeName: string;
  roleIds?: string[];
  roles?: Role[];
  additionalData?: {
    profile?: string;
    [key: string]: any;
  };
  status?: boolean; // true = active, false = inactive
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  image?: string;
  phone?: string;
  userTypeId: string;
  address?: string; // Corregido: ahora usa 'address' en lugar de 'addres'
  additionalData?: {
    additionalProp1?: string;
    additionalProp2?: string;
    additionalProp3?: string;
  };
  roleIds: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  userTypeId?: string;
  roleIds?: string[];
  status?: User['status'];
  phone?: string;
  address?: string;
  image?: string;
  additionalData?: {
    profile?: string;
    [key: string]: any;
  };
}

// Parámetros de filtrado según la API
export interface UserFilters {
  Search?: string;
  Name?: string;
  Email?: string;
  RoleId?: string;
  UserTypeId?: string;
  Status?: string;
  CreatedAfter?: string;
  CreatedBefore?: string;
  Page?: number;
  PageSize?: number;
  SortBy?: string;
}

/**
 * Servicio para gestión de usuarios del sistema
 */
export class UsersService {
  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  async getAll(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = {
      Search: filters.Search,
      Name: filters.Name,
      Email: filters.Email,
      RoleId: filters.RoleId,
      UserTypeId: filters.UserTypeId,
      Status: filters.Status,
      CreatedAfter: filters.CreatedAfter,
      CreatedBefore: filters.CreatedBefore,
      Page: filters.Page || 1,
      PageSize: filters.PageSize || 10,
      SortBy: filters.SortBy,
    };

    // Filtrar parámetros undefined
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    return backendApiService.getWithParams<PaginatedResponse<User>>('/Api/Auth/Users', cleanParams);
  }

  /**
   * Obtener un usuario por ID
   */
  async getById(id: string | number): Promise<ApiResponse<User>> {
    return backendApiService.get<ApiResponse<User>>(`/Api/Auth/Users/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  async create(userData: CreateUserData): Promise<ApiResponse<User>> {
    return backendApiService.post<ApiResponse<User>>(
      '/Api/Auth/Users',
      userData as unknown as Record<string, unknown>
    );
  }

  /**
   * Actualizar un usuario existente
   */
  async update(id: string | number, userData: UpdateUserData): Promise<ApiResponse<User>> {
    return backendApiService.put<ApiResponse<User>>(
      `/Api/Auth/Users/${id}`,
      userData as unknown as Record<string, unknown>
    );
  }

  /**
   * Eliminar un usuario
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return backendApiService.delete<ApiResponse<void>>(`/Api/Auth/Users/${id}`);
  }

  /**
   * Cambiar estado de un usuario
   */
  async changeStatus(id: string, status: User['status']): Promise<ApiResponse<User>> {
    const payload = { status };
    console.log('🔄 [SERVICE] Payload a enviar:', payload);

    const result = await backendApiService.patch<ApiResponse<User>>(
      `/Api/Auth/Users/${id}/status`,
      payload
    );
    console.log('🔄 [SERVICE] Respuesta del backend:', result);

    return result;
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return backendApiService.patch<ApiResponse<void>>(`/Api/Auth/Users/${id}/password`, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      byUserType: Record<string, number>;
      recent: number;
    }>
  > {
    return backendApiService.get<
      ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        byUserType: Record<string, number>;
        recent: number;
      }>
    >('/Api/Auth/Users/stats');
  }

  /**
   * Buscar usuarios por término
   */
  async search(term: string, limit = 10): Promise<ApiResponse<User[]>> {
    return backendApiService.getWithParams<ApiResponse<User[]>>('/Api/Auth/Users/search', {
      q: term,
      limit,
    });
  }

  /**
   * Obtener roles disponibles
   */
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return backendApiService.get<ApiResponse<Role[]>>('/Api/Auth/Roles');
  }

  /**
   * Obtener roles para dropdown
   */
  async getRolesDropdown(): Promise<Array<{ id: string; name: string }>> {
    const response = await backendApiService.get<Array<{ id: string; name: string }>>(
      '/Api/Auth/Roles/dropdown'
    );
    return response;
  }

  /**
   * Validar email único
   */
  async validateEmail(
    email: string,
    excludeId?: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    const params: Record<string, string | undefined> = { email };
    if (excludeId) {
      params.exclude = excludeId;
    }
    return backendApiService.getWithParams<ApiResponse<{ available: boolean }>>(
      '/Api/Auth/Users/validate-email',
      params
    );
  }

  /**
   * Importar usuarios desde archivo
   */
  async importUsers(file: File): Promise<
    ApiResponse<{
      imported: number;
      errors: Array<{ row: number; error: string }>;
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);

    // Para este caso, necesitamos una petición diferente sin JSON
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/Auth/Users/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Exportar usuarios a CSV
   */
  async exportUsers(filters: UserFilters = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Api/Auth/Users/export?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/csv',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Obtener tipos de usuario para dropdown
   */
  async getUserTypesDropdown(): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
    return backendApiService.get<ApiResponse<Array<{ id: string; name: string }>>>(
      '/Api/Auth/UserTypes/dropdown'
    );
  }
}

// Instancia por defecto del servicio
export const usersService = new UsersService();

export default usersService;
