/**
 * Reports Service
 * Platform Web Frontend - Next.js TypeScript
 */

import { UsersByTypeFilters, UsersByTypeReportDto } from '@/modules/reports/types';
import { backendApiService } from '@/modules/shared/services/api';

export class ReportsService {
  /**
   * Obtiene el reporte de usuarios por tipo
   * @param filters - Filtros para el reporte
   * @returns Promise con los datos del reporte
   */
  static async getUsersByTypeReport(
    filters: UsersByTypeFilters = {}
  ): Promise<UsersByTypeReportDto> {
    const params = new URLSearchParams();

    if (filters.startDate) {
      params.append('StartDate', filters.startDate);
    }

    if (filters.endDate) {
      params.append('EndDate', filters.endDate);
    }

    if (filters.userTypeId) {
      params.append('UserTypeId', filters.userTypeId);
    }

    if (filters.includeInactive !== undefined) {
      params.append('IncludeInactive', filters.includeInactive.toString());
    }

    const queryString = params.toString();
    const url = `/api/Reports/users-by-type${queryString ? `?${queryString}` : ''}`;

    const response = await backendApiService.get<UsersByTypeReportDto>(url);

    // El backend devuelve los datos directamente para este endpoint
    return response as UsersByTypeReportDto;
  }

  /**
   * Exportar reporte en formato CSV (futuro)
   * @param filters - Filtros para el reporte
   * @returns Promise con el archivo CSV
   */
  static async exportUsersByTypeReport(filters: UsersByTypeFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters.startDate) {
      params.append('StartDate', filters.startDate);
    }

    if (filters.endDate) {
      params.append('EndDate', filters.endDate);
    }

    if (filters.userTypeId) {
      params.append('UserTypeId', filters.userTypeId);
    }

    if (filters.includeInactive !== undefined) {
      params.append('IncludeInactive', filters.includeInactive.toString());
    }

    const queryString = params.toString();
    const url = `/api/Reports/users-by-type/export${queryString ? `?${queryString}` : ''}`;

    const response = await backendApiService.get(url, {
      headers: {
        Accept: 'text/csv',
      },
    });

    return response as Blob;
  }
}

// Exportar instancia por defecto
export const reportsService = ReportsService;
