/**
 * Session Provider - Proveedor de contexto de sesión
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
