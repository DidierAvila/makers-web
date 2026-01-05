/**
 * useAuth Hook - Hook personalizado para manejo de autenticación
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'employee' | 'advisor';
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  position?: string;
  avatar?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isEmployee: boolean;
  isAdvisor: boolean;
}

/**
 * Hook personalizado para manejo de autenticación
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const user = session?.user || null;
  const accessToken = session?.accessToken || null;

  /**
   * Función para iniciar sesión
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Error inesperado durante el login',
      };
    }
  }, []);

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signin',
    });
  }, []);

  /**
   * Verificar si el usuario tiene uno de los roles especificados
   */
  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  // Verificaciones de rol específicas
  const isAdmin = hasRole('admin');
  const isSupervisor = hasRole(['admin', 'supervisor']);
  const isEmployee = hasRole('employee');
  const isAdvisor = hasRole('advisor');

  return {
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    login,
    logout,
    hasRole,
    isAdmin,
    isSupervisor,
    isEmployee,
    isAdvisor,
  };
}

export default useAuth;
