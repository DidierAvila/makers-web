/**
 * Página de Usuario No Autorizado - Platform Web Frontend
 */
'use client';

import { Home, Lock, Login } from '@mui/icons-material';
import { Alert, Box, Button, CardContent, Container, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Lock sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Acceso No Autorizado
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            No tienes permisos para acceder a esta página
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Acceso Denegado:</strong> No cuentas con los permisos necesarios para ver este
              contenido.
            </Typography>
          </Alert>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Si crees que esto es un error, contacta al administrador del sistema o verifica que
            tengas el rol apropiado asignado.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => router.push('/dashboard')}
            >
              Ir al Dashboard
            </Button>

            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={() => router.push('/auth/signin')}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
}
