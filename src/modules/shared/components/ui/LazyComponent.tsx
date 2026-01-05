/**
 * LazyComponent - Higher Order Component para lazy loading
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { CircularProgress, Paper, Typography } from '@mui/material';
import React, { ComponentType, lazy, ReactNode, Suspense } from 'react';

interface LazyLoaderProps {
  title?: string;
  height?: number | string;
  showProgress?: boolean;
}

// Componente de loading personalizado
function LazyLoader({ title = 'Cargando...', height = 200, showProgress = true }: LazyLoaderProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        p: 3,
        borderRadius: 2,
      }}
    >
      {showProgress && <CircularProgress size={40} sx={{ mb: 2 }} color="primary" />}
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
}

// HOC para crear componentes lazy
export function withLazyLoading<P extends object>(
  componentImport: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(componentImport);

  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LazyLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Componente genérico para lazy loading con configuración
interface LazyComponentWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

export function LazyComponentWrapper({
  children,
  fallback,
  errorBoundary = true,
}: LazyComponentWrapperProps) {
  const content = <Suspense fallback={fallback || <LazyLoader />}>{children}</Suspense>;

  if (errorBoundary) {
    return <ErrorBoundary>{content}</ErrorBoundary>;
  }

  return content;
}

// Error Boundary simple
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error capturado por el boundary de lazy loading
    // En producción, aquí se podría enviar el error a un servicio de logging
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Error al cargar el componente
          </Typography>
          <Typography variant="body2">
            {this.state.error?.message || 'Error desconocido'}
          </Typography>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default LazyLoader;
