/**
 * Sign In Page - Página de inicio de sesión OAuth Multi-Provider
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { useCookieManager } from '@/components/shared/CookieManager';
import { Email, Lock, Login, Security, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Componente de icono personalizado Platform (escudo con 4 cuadrantes alternados)
const PlatformIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Definir la forma del escudo como clip */}
    <defs>
      <clipPath id="shield">
        <path d="M50 5L15 18V40C15 60 25 75 50 85C75 75 85 60 85 40V18L50 5Z" />
      </clipPath>
    </defs>

    {/* Fondo base azul del escudo */}
    <path d="M50 5L15 18V40C15 60 25 75 50 85C75 75 85 60 85 40V18L50 5Z" fill="#2196F3" />

    {/* Cuadrante superior derecho - blanco */}
    <rect x="50" y="5" width="35" height="40" fill="#ffffff" clipPath="url(#shield)" />

    {/* Cuadrante inferior izquierdo - blanco */}
    <rect x="15" y="45" width="35" height="40" fill="#ffffff" clipPath="url(#shield)" />

    {/* Líneas divisorias */}
    <line
      x1="50"
      y1="5"
      x2="50"
      y2="85"
      stroke="rgba(0,0,0,0.15)"
      strokeWidth="1.2"
      clipPath="url(#shield)"
    />
    <line
      x1="15"
      y1="45"
      x2="85"
      y2="45"
      stroke="rgba(0,0,0,0.15)"
      strokeWidth="1.2"
      clipPath="url(#shield)"
    />

    {/* Contorno del escudo */}
    <path
      d="M50 5L15 18V40C15 60 25 75 50 85C75 75 85 60 85 40V18L50 5Z"
      fill="none"
      stroke="rgba(0,0,0,0.3)"
      strokeWidth="10"
    />
  </svg>
);

// Componente de loading para Suspense
function SignInLoading() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Cargando...
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

// Componente principal de Sign In OAuth Multi-Provider
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  // Hook para gestión de cookies
  useCookieManager({
    cleanOnMount: false,
    cleanOnLogin: true,
    cleanOnLogout: true,
  });

  // const [userType, setUserType] = useState(''); // Eliminado: selector de rol
  const [email, setEmail] = useState<string>('admin@platform.com');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentialsLoading, setCredentialsLoading] = useState<boolean>(false);

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  // Obtener error de la URL si existe
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  /**
   * Convierte códigos de error en mensajes legibles
   */
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error al iniciar sesión. Inténtelo nuevamente.';
      case 'OAuthCallback':
        return 'Error en la respuesta del proveedor. Verifique su conexión.';
      case 'OAuthCreateAccount':
        return 'Error al crear cuenta. Contacte al administrador.';
      case 'EmailCreateAccount':
        return 'Error con el email. Use otro email corporativo.';
      case 'Callback':
        return 'Error en el proceso de autenticación. Inténtelo nuevamente.';
      case 'OAuthAccountNotLinked':
        return 'Esta cuenta no está vinculada. Contacte al administrador.';
      case 'Configuration':
        return 'Error de configuración del servidor.';
      case 'AccessDenied':
        return 'Acceso denegado. No tiene permisos para acceder al sistema.';
      default:
        return 'Error de autenticación. Inténtelo nuevamente.';
    }
  };

  /**
   * Maneja el login con credenciales
   */
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña.');
      return;
    }

    // Validación de userType eliminada

    setCredentialsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión. Inténtelo nuevamente.');
    } finally {
      setCredentialsLoading(false);
    }
  };

  /**
   * Maneja el login con el proveedor especificado
   */
  const handleProviderSignIn = async (providerId: string) => {
    // Solo permitir Google por ahora
    if (providerId !== 'google') {
      return;
    }

    // Validación de userType eliminada

    setLoading(providerId);
    setError('');

    try {
      const result = await signIn(providerId, {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError(`Error inesperado con ${providerId}. Inténtelo nuevamente.`);
    } finally {
      setLoading('');
    }
  };

  /**
   * Obtiene el icono para cada proveedor
   */
  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return (
          <Box
            component="img"
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            sx={{ width: 20, height: 20 }}
          />
        );
      case 'facebook':
        return (
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            alt="Facebook"
            sx={{ width: 20, height: 20 }}
          />
        );
      case 'microsoft':
        return (
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            sx={{ width: 20, height: 20 }}
          />
        );
      case 'linkedin':
        return (
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
            alt="LinkedIn"
            sx={{ width: 20, height: 20 }}
          />
        );
      default:
        return <Security />;
    }
  };

  /**
   * Obtiene el estilo del botón para cada proveedor
   */
  const getProviderButtonStyle = (providerId: string, isActive: boolean) => {
    const baseStyle = {
      py: 1.5,
      px: 3,
      fontSize: '0.95rem',
      fontWeight: '500',
      borderRadius: 2,
      textTransform: 'none' as const,
      border: '1px solid #e0e0e0',
      minHeight: '48px',
      justifyContent: 'flex-start',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      },
    };

    if (!isActive) {
      return {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        color: '#9e9e9e',
        cursor: 'default',
        '&:hover': {
          backgroundColor: '#f5f5f5',
          boxShadow: 'none',
        },
      };
    }

    switch (providerId) {
      case 'google':
        return {
          ...baseStyle,
          backgroundColor: '#fff',
          color: '#3c4043',
          '&:hover': {
            backgroundColor: '#f8f9fa',
            ...baseStyle['&:hover'],
          },
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#fff',
          color: '#333',
        };
    }
  };

  // Lista de proveedores a mostrar
  const providersToShow = [
    { id: 'google', name: 'Google', active: true },
    { id: 'facebook', name: 'Facebook', active: false },
    { id: 'microsoft', name: 'Microsoft', active: false },
    { id: 'linkedin', name: 'LinkedIn', active: false },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 450,
            margin: '0 auto',
            borderRadius: 3,
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Header con Logo estilo simple */}
          <Box
            sx={{
              textAlign: 'center',
              pt: 6,
              pb: 4,
              px: 4,
              backgroundColor: '#fff',
            }}
          >
            {/* Logo Platform estilo oficial */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                mb: 4,
                gap: 2,
              }}
            >
              {/* Icono del escudo */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transform: 'translateY(8px)',
                }}
              >
                <PlatformIcon size={56} />
              </Box>

              {/* Texto Makers */}
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: '#2196F3',
                  fontSize: '3.2rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                Makers
              </Typography>
            </Box>

            <Typography
              variant="h5"
              component="h2"
              fontWeight="600"
              sx={{
                mb: 2,
                color: '#333',
                fontSize: '1.5rem',
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontSize: '1rem',
                maxWidth: '350px',
                mx: 'auto',
                lineHeight: 1.5,
                mb: 1,
              }}
            >
              Plataforma diseñada con un enfoque en la escalabilidad, mantenibilidad y la separación
              de repsonsabilidades siguiendo los principios de Domain-Driven Design (DDD) y la
              Arquitectura Limpia (Clean Architecture)
            </Typography>
          </Box>

          {/* Contenido Principal */}
          <CardContent sx={{ px: 4, py: 0, pb: 4 }}>
            {/* Mostrar error si existe */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Selector de Tu Rol eliminado */}

            {/* Formulario de Credenciales */}
            <Box component="form" onSubmit={handleCredentialsSignIn} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={credentialsLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={credentialsLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={credentialsLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={credentialsLoading || !email || !password}
                startIcon={
                  credentialsLoading ? <CircularProgress size={20} color="inherit" /> : <Login />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  backgroundColor: '#2196F3',
                  '&:hover': {
                    backgroundColor: '#1976D2',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                }}
              >
                {credentialsLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                O continúa con
              </Typography>
            </Divider>

            {/* Botones de Proveedores OAuth */}
            <Stack spacing={2}>
              {providersToShow.map((provider) => (
                <Button
                  key={provider.id}
                  fullWidth
                  variant="outlined"
                  size="large"
                  disabled={loading === provider.id || !provider.active}
                  onClick={() => handleProviderSignIn(provider.id)}
                  startIcon={
                    loading === provider.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      getProviderIcon(provider.id)
                    )
                  }
                  sx={getProviderButtonStyle(provider.id, provider.active)}
                >
                  <Box sx={{ flex: 1, textAlign: 'left', ml: 1 }}>
                    {loading === provider.id
                      ? 'Iniciando sesión...'
                      : `Continuar con ${provider.name}`}
                    {!provider.active && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: '#9e9e9e',
                          fontSize: '0.7rem',
                          fontStyle: 'italic',
                        }}
                      >
                        Próximamente
                      </Typography>
                    )}
                    {/* Mensaje de selección de rol eliminado */}
                  </Box>
                </Button>
              ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Información adicional */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                🔒 Acceso seguro con OAuth 2.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ¿Problemas para acceder? Contacte al administrador
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Componente principal exportado con Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
