/**
 * Conditional Layout - Decide qué layout usar según la ruta
 * Platform Web Frontend - Next.js TypeScript
 */
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import UserConfigLoader from '../auth/UserConfigLoader';
import MainLayout from './MainLayout';

interface ConditionalLayoutProps {
  children: ReactNode;
}

// Rutas que no deben tener el layout principal (menú, sidebar, etc.)
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/error',
];

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Si la ruta actual es de autenticación, renderizar sin layout
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Para todas las demás rutas, usar el MainLayout con carga de configuración
  return (
    <UserConfigLoader>
      <MainLayout>{children}</MainLayout>
    </UserConfigLoader>
  );
}
