/**
 * Connection Error Component - Componente para mostrar errores de conexión
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import { Refresh, Wifi, WifiOff } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import React from 'react';

interface ConnectionErrorProps {
  isConnected: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
}

/**
 * Componente para mostrar errores de conexión y permitir reintentos
 */
export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  isConnected,
  error,
  retryCount,
  maxRetries,
  onRetry,
  onReset,
}) => {
  // No mostrar nada si no hay error
  if (!error) return null;

  const isNetworkError = error.includes('conexión') || error.includes('internet');
  const hasReachedMaxRetries = retryCount >= maxRetries;

  return (
    <Alert
      severity={isNetworkError ? 'warning' : 'error'}
      sx={{
        mb: 2,
        '& .MuiAlert-icon': {
          fontSize: 24,
        },
      }}
      icon={isNetworkError ? <WifiOff /> : undefined}
    >
      <AlertTitle>{isNetworkError ? 'Error de Conexión' : 'Error del Sistema'}</AlertTitle>

      <Typography variant="body2" sx={{ mb: 2 }}>
        {error}
      </Typography>

      {isNetworkError && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Intentos: {retryCount} de {maxRetries}
          </Typography>

          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!hasReachedMaxRetries && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRetry}
                disabled={!isConnected}
              >
                Reintentar
              </Button>
            )}

            {hasReachedMaxRetries && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Wifi />}
                onClick={onReset}
                color="primary"
              >
                Verificar Conexión
              </Button>
            )}
          </Box>

          {hasReachedMaxRetries && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              La aplicación continuará funcionando con datos básicos.
            </Typography>
          )}
        </Box>
      )}
    </Alert>
  );
};

export default ConnectionError;
