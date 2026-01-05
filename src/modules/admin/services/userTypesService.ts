/**
 * UserTypes Service - Servicio para gestión de tipos de usuario
 * Platform Web Frontend - Next.js TypeScript
 */

import { backendApiService, PaginatedResponse } from '@/modules/shared/services/api';

// Tipos para UserType basados en la respuesta del backend
export interface UserType {
  id: string;
  name: string;
  description: string;
  status: boolean;
  theme?: string;
  defaultLandingPage?: string;
  logoUrl?: string;
  language?: string;
  additionalConfig?: {
    navigation?: any[];
    dynamicFields?: any[]; // Aquí almacenaremos los campos dinámicos
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
}

// Parámetros de filtrado según la API
export interface UserTypeFilters {
  Name?: string;
  Status?: boolean;
  Page?: number;
  PageSize?: number;
  SortBy?: string;
}

/**
 * Servicio para gestión de tipos de usuario del sistema
 */
export class UserTypesService {
  /**
   * Obtener lista de tipos de usuario con paginación y filtros
   */
  async getAll(filters: UserTypeFilters = {}): Promise<PaginatedResponse<UserType>> {
    const params = {
      Name: filters.Name,
      Status: filters.Status,
      Page: filters.Page || 1,
      PageSize: filters.PageSize || 10,
      SortBy: filters.SortBy,
    };

    // Filtrar parámetros undefined
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    console.log('UserTypes Service - Calling API with params:', cleanParams);

    return backendApiService.getWithParams<PaginatedResponse<UserType>>(
      '/Api/Auth/UserTypes',
      cleanParams
    );
  }

  /**
   * Obtener un tipo de usuario por ID
   */
  async getById(id: string | number): Promise<UserType> {
    const response = await backendApiService.get<UserType>(`/Api/Auth/UserTypes/${id}`);
    return response;
  }

  /**
   * Crear un nuevo tipo de usuario
   */
  async create(userTypeData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserType> {
    const response = await backendApiService.post<{ data: UserType }>(
      '/Api/Auth/UserTypes',
      userTypeData as unknown as Record<string, unknown>
    );
    return response.data;
  }

  /**
   * Actualizar un tipo de usuario existente
   */
  async update(
    id: string | number,
    userTypeData: Partial<Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserType> {
    const response = await backendApiService.put<{ data: UserType }>(
      `/Api/Auth/UserTypes/${id}`,
      userTypeData as unknown as Record<string, unknown>
    );
    return response.data;
  }

  /**
   * Eliminar un tipo de usuario
   */
  async delete(id: string | number): Promise<void> {
    await backendApiService.delete(`/Api/Auth/UserTypes/${id}`);
  }

  /**
   * Buscar tipos de usuario por término
   */
  async search(term: string, limit = 10): Promise<UserType[]> {
    const response = await backendApiService.getWithParams<{ data: UserType[] }>(
      '/Api/Auth/UserTypes/search',
      { q: term, limit }
    );
    return response.data;
  }
}

// Instancia por defecto del servicio
export const userTypesService = new UserTypesService();

export default userTypesService;
