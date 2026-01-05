/**
 * Componente para cargar la configuración del usuario después del login
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useUser } from '../../contexts/UserContext';

interface UserConfigLoaderProps {
  children: React.ReactNode;
}

/**
 * Componente que carga automáticamente la configuración del usuario
 * después de que se autentica exitosamente
 */
export function UserConfigLoader({ children }: UserConfigLoaderProps) {
  const { status } = useSession();
  const { user, isLoading } = useUser();

  // La configuración del usuario se carga automáticamente en el contexto
  // cuando el usuario se autentica

  // Mostrar loading mientras se carga la configuración del usuario
  if (status === 'authenticated' && !user && isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Cargando configuración del usuario...
        </Typography>
      </Box>
    );
  }

  // Renderizar children cuando la configuración esté lista o no sea necesaria
  return <>{children}</>;
}

export default UserConfigLoader;
