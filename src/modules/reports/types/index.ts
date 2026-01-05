/**
 * Tipos para el módulo de reportes
 * Platform Web Frontend - Next.js TypeScript
 */

// Estructura de datos para un elemento del gráfico circular
export interface PieChartDataItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

// Datos de un usuario específico en el reporte
export interface ReportUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Detalles de un tipo de usuario
export interface UserTypeDetail {
  id: string;
  name: string;
  userCount: number;
  percentage: number;
  users: ReportUser[];
}

// Estructura completa del reporte de usuarios por tipo
export interface UsersByTypeReportDto {
  pieChartData: PieChartDataItem[];
  labels: string[];
  values: number[];
  details: UserTypeDetail[];
  totalUsers: number;
  generatedAt: string;
}

// Filtros para el reporte
export interface UsersByTypeFilters {
  startDate?: string;
  endDate?: string;
  userTypeId?: string;
  includeInactive?: boolean;
}

// Props para componentes
export interface PieChartProps {
  data: PieChartDataItem[];
  title?: string;
  showLegend?: boolean;
}

export interface ReportFiltersProps {
  filters: UsersByTypeFilters;
  onFiltersChange: (filters: UsersByTypeFilters) => void;
  onApplyFilters: () => void;
  loading?: boolean;
}

export interface UsersByTypeReportProps {
  data?: UsersByTypeReportDto;
  loading?: boolean;
  error?: string;
}
