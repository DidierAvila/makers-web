/**
 * Lazy Components - Componentes con carga diferida
 * Platform Web Frontend - Next.js TypeScript
 */

import { withLazyLoading } from './LazyComponent';

// Lazy loading para componentes de usuarios
export const LazyUsersList = withLazyLoading(
  () => import('@/modules/admin/components/auth/users/UsersList'),
  undefined // Usará el fallback por defecto
);

// Lazy loading para componentes de clientes - Removido LazyCustomersList

// Lazy loading para componentes de asesores
export const LazyAdvisorsList = withLazyLoading(() => {
  // Componente no existe aún, usar fallback
  return Promise.resolve({ default: () => <div>Componente AdvisorsList en desarrollo</div> });
}, undefined);

// Lazy loading para diagnósticos
export const LazyDiagnosesList = withLazyLoading(() => {
  // Componente no existe aún, usar fallback
  return Promise.resolve({ default: () => <div>Componente DiagnosesList en desarrollo</div> });
}, undefined);

// Lazy loading para dashboard
export const LazyDashboard = withLazyLoading(() => {
  // Usar el dashboard existente de platform
  return import('@/modules/platform/components/dashboard/PlatformDashboard');
}, undefined);

// Lazy loading para PageContainer
export const LazyPageContainer = withLazyLoading(
  () =>
    import('@/modules/shared/components/layout/PageContainer').catch(() => {
      // Fallback si el componente no existe aún
      return { default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> };
    }),
  undefined
);

// Re-exportar el componente base
export { LazyComponentWrapper, default as LazyLoader } from './LazyComponent';
