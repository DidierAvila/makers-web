/**
 * Loan Types - Tipos para el sistema de préstamos bancarios
 * Platform Web Frontend - Next.js TypeScript
 */

// Estados posibles de un préstamo
export enum LoanStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

// Interfaz principal del préstamo
export interface Loan {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  term: number; // Plazo en meses
  status: LoanStatus;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// DTO para crear un nuevo préstamo
export interface CreateLoanDto {
  amount: number;
  term: number;
}

// DTO para actualizar el estado de un préstamo (Admin)
export interface UpdateLoanStatusDto {
  status: LoanStatus;
  reviewNotes?: string;
}

// DTO para filtrar préstamos (Admin)
export interface LoanFilterDto {
  userId?: string;
  status?: LoanStatus;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

// Constantes para validación
export const LOAN_CONSTANTS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000000,
  MIN_TERM: 1,
  MAX_TERM: 360, // 30 años
} as const;

// Helper para formatear montos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper para obtener el color del estado
export const getStatusColor = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.Pending:
      return 'warning';
    case LoanStatus.Approved:
      return 'success';
    case LoanStatus.Rejected:
      return 'error';
    default:
      return 'default';
  }
};

// Helper para obtener el texto del estado en español
export const getStatusText = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.Pending:
      return 'Pendiente';
    case LoanStatus.Approved:
      return 'Aprobado';
    case LoanStatus.Rejected:
      return 'Rechazado';
    default:
      return status;
  }
};
