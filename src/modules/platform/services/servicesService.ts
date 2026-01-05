/**
 * Services Service - Servicio para gestión de servicios
 * Platform Web Frontend - Next.js TypeScript
 */

import { PaginatedResponse } from '@/modules/shared/services/api';
import { getSession } from 'next-auth/react';
import { CreateServiceData, Service, ServiceFilters, UpdateServiceData } from '../types/service';

export class ServicesService {
  private readonly baseEndpoint = '/api/Services';
  private readonly backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5180';

  /**
   * Obtener headers con autenticación
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const session = await getSession();

      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error('Error obteniendo token de autenticación:', error);
    }

    return headers;
  }

  /**
   * Manejar errores de respuesta HTTP
   */
  private async handleResponseError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    // Intentar obtener mensaje de error del backend
    try {
      const errorData = await response.text();
      if (errorData) {
        errorMessage = errorData;
      }
    } catch {
      // Si no se puede parsear, usar el mensaje por defecto
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  /**
   * Obtener todos los servicios con paginación
   */
  async getAll(
    page = 1,
    pageSize = 10,
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<Service>> {
    const params = new URLSearchParams({
      Page: page.toString(),
      PageSize: pageSize.toString(),
    });

    // Agregar filtros si existen (usando los nombres correctos de la API)
    if (filters?.search) {
      params.append('Name', filters.search);
    }
    if (filters?.status !== undefined) {
      params.append('Status', filters.status.toString());
    }
    // Nota: supplierId, minHourlyValue, maxHourlyValue no están soportados en esta API
    // Se pueden agregar cuando el backend los implemente

    // Realizar la petición directamente al backend
    const url = `${this.backendUrl}${this.baseEndpoint}?${params.toString()}`;

    try {
      const headers = await this.getHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const data = await response.json();
      return data; // La respuesta ya viene en el formato PaginatedResponse correcto
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Obtener un servicio por ID
   */
  async getById(id: string): Promise<Service> {
    const url = `${this.backendUrl}${this.baseEndpoint}/${id}`;

    try {
      const headers = await this.getHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const service = await response.json();
      return service;
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo servicio
   */
  async create(serviceData: CreateServiceData): Promise<Service> {
    const url = `${this.backendUrl}${this.baseEndpoint}`;

    try {
      const headers = await this.getHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio existente
   */
  async update(id: string, serviceData: UpdateServiceData): Promise<Service> {
    const url = `${this.backendUrl}${this.baseEndpoint}/${id}`;

    try {
      const headers = await this.getHeaders();

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const updatedService = await response.json();
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio
   */
  async delete(id: string): Promise<void> {
    const url = `${this.backendUrl}${this.baseEndpoint}/${id}`;

    try {
      const headers = await this.getHeaders();
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // DELETE normalmente no retorna contenido
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  /**
   * Cambiar el estado de un servicio (activar/desactivar)
   * Nota: Este método puede necesitar ajuste según la implementación del backend
   */
  async toggleStatus(id: string, status: boolean): Promise<Service> {
    const url = `${this.backendUrl}${this.baseEndpoint}/${id}/status`;

    try {
      const headers = await this.getHeaders();
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios por proveedor
   * Nota: Limitado por la API actual, usar filtros generales
   */
  async getBySupplier(
    supplierId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Service>> {
    // Como la API no soporta filtro por supplierId, usar el método general
    return this.getAll(page, pageSize, { supplierId });
  }

  /**
   * Buscar servicios por nombre
   */
  async search(query: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Service>> {
    return this.getAll(page, pageSize, { search: query });
  }
}

// Instancia singleton del servicio
export const servicesService = new ServicesService();
