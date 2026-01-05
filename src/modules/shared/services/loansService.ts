/**
 * Loans Service - Servicio para gestión de préstamos bancarios
 * Platform Web Frontend - Next.js TypeScript
 */

import { backendApiService } from './api';
import type {
  Loan,
  CreateLoanDto,
  UpdateLoanStatusDto,
  LoanFilterDto,
} from '../types/loan';

/**
 * Servicio para operaciones CRUD de préstamos
 */
export const loansService = {
  /**
   * Crear una nueva solicitud de préstamo
   * @param data Datos del préstamo (monto y plazo)
   * @returns Préstamo creado
   */
  async createLoan(data: CreateLoanDto): Promise<Loan> {
    return backendApiService.post<Loan>('/Api/Loans', data as unknown as Record<string, unknown>);
  },

  /**
   * Obtener todos los préstamos (solo Admin)
   * @returns Lista de todos los préstamos
   */
  async getAllLoans(): Promise<Loan[]> {
    return backendApiService.get<Loan[]>('/Api/Loans');
  },

  /**
   * Obtener un préstamo por ID
   * @param id ID del préstamo
   * @returns Préstamo encontrado
   */
  async getLoanById(id: string): Promise<Loan> {
    return backendApiService.get<Loan>(`/Api/Loans/${id}`);
  },

  /**
   * Obtener los préstamos del usuario actual
   * @returns Lista de préstamos del usuario
   */
  async getMyLoans(): Promise<Loan[]> {
    return backendApiService.get<Loan[]>('/Api/Loans/my-loans');
  },

  /**
   * Actualizar el estado de un préstamo (Aprobar/Rechazar) - Solo Admin
   * @param id ID del préstamo
   * @param data Nuevo estado y notas
   * @returns Préstamo actualizado
   */
  async updateLoanStatus(
    id: string,
    data: UpdateLoanStatusDto
  ): Promise<Loan> {
    return backendApiService.put<Loan>(`/Api/Loans/${id}/status`, data as unknown as Record<string, unknown>);
  },

  /**
   * Aprobar un préstamo (Solo Admin)
   * @param id ID del préstamo
   * @param reviewNotes Notas de revisión opcionales
   * @returns Préstamo aprobado
   */
  async approveLoan(id: string, reviewNotes?: string): Promise<Loan> {
    return this.updateLoanStatus(id, {
      status: 'Approved' as any,
      reviewNotes,
    });
  },

  /**
   * Rechazar un préstamo (Solo Admin)
   * @param id ID del préstamo
   * @param reviewNotes Motivo del rechazo
   * @returns Préstamo rechazado
   */
  async rejectLoan(id: string, reviewNotes: string): Promise<Loan> {
    return this.updateLoanStatus(id, {
      status: 'Rejected' as any,
      reviewNotes,
    });
  },

  /**
   * Obtener préstamos filtrados (Solo Admin)
   * @param filters Filtros a aplicar
   * @returns Lista de préstamos filtrados
   */
  async getFilteredLoans(filters: LoanFilterDto): Promise<Loan[]> {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `/Api/Loans/filtered?${queryString}` : '/Api/Loans/filtered';

    return backendApiService.get<Loan[]>(url);
  },
};

export default loansService;
