/**
 * Página de Prueba de Autenticación - Platform Web Frontend
 */
'use client';

import {
  AdminPanelSettings,
  Business,
  Email,
  ExitToApp,
  Group,
  Person,
  Refresh,
  SupervisorAccount,
  Support,
  Work,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signin',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings color="error" />;
      case 'supervisor':
        return <SupervisorAccount color="warning" />;
      case 'advisor':
        return <Support color="info" />;
      default:
        return <Group color="action" />;
    }
  };

  const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'supervisor':
        return 'warning';
      case 'advisor':
        return 'info';
      default:
        return 'default';
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Verificando autenticación...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No hay una sesión activa. Por favor, inicie sesión.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push('/auth/signin')}
          startIcon={<Person />}
        >
          Ir a Iniciar Sesión
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🧪 Prueba de Autenticación
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            NextAuth.js + Backend User Service
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Estado de la sesión */}
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Autenticación exitosa! Estado: <strong>{status}</strong>
          </Alert>

          {session?.user && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Información del usuario */}
              <Box sx={{ flex: 1 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={session.user.avatar}
                        alt={session.user.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      >
                        {session.user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {session.user.name}
                        </Typography>
                        <Chip
                          label={session.user.role?.toUpperCase()}
                          color={getRoleColor(session.user.role)}
                          size="small"
                          icon={getRoleIcon(session.user.role)}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Email:</strong> {session.user.email}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Departamento:</strong>{' '}
                          {session.user.department || 'No especificado'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Posición:</strong> {session.user.position || 'No especificada'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Estado:</strong>
                          <Chip
                            label={session.user.status}
                            color={session.user.status === 'active' ? 'success' : 'default'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>ID:</strong> {session.user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Información técnica de la sesión */}
              <Box sx={{ flex: 1 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🔧 Información Técnica
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Provider:</strong> credentials
                      </Typography>

                      <Typography variant="body2">
                        <strong>Backend:</strong> /api/users (Mock)
                      </Typography>

                      <Typography variant="body2">
                        <strong>Token Type:</strong> JWT
                      </Typography>

                      <Typography variant="body2">
                        <strong>Session ID:</strong>
                        <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                          {session.user.id}
                        </Box>
                      </Typography>

                      {session.user.avatar && (
                        <Typography variant="body2">
                          <strong>Avatar URL:</strong>
                          <Box component="span" sx={{ fontSize: '0.85em', wordBreak: 'break-all' }}>
                            {session.user.avatar}
                          </Box>
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Esta información se obtuvo del backend de usuarios mock
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Acciones */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => router.push('/dashboard')}
              startIcon={<Business />}
            >
              Ir al Dashboard
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              startIcon={<Refresh />}
            >
              Refrescar Sesión
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleSignOut}
              startIcon={<ExitToApp />}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
}
