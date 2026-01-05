/**
 * Página de reportes - /report/reports
 * Platform Web Frontend - Next.js TypeScript
 */

import { UsersByTypeReport } from '@/modules/reports';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes - Usuarios por Tipo | Platform',
  description:
    'Reporte de distribución de usuarios por tipo con gráficos y estadísticas detalladas',
};

export default function ReportsPage() {
  return <UsersByTypeReport />;
}
