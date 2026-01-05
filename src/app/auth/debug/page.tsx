'use client';

import { useState } from 'react';
import { Button, TextField, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { authService } from '@/modules/shared/services/api';

export default function AuthDebugPage() {
  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [parsedToken, setParsedToken] = useState<any>(null);

  // Función para decodificar un token JWT
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setResponse(null);
    setParsedToken(null);

    try {
      console.log('🔍 Iniciando prueba de autenticación con:', { email, password });

      // Llamar directamente al servicio de autenticación
      const loginResponse = await authService.login({ email, password });
      console.log('🔍 Respuesta completa:', loginResponse);

      setResponse(loginResponse);

      // Si hay un token en la respuesta, intentar decodificarlo
      if (loginResponse.success && loginResponse.data) {
        // El token ahora viene directamente en data
        const token = loginResponse.data;

        if (typeof token === 'string' && token.startsWith('eyJ')) {
          const decoded = decodeJWT(token);
          setParsedToken(decoded);
          console.log('🔍 Token decodificado:', decoded);
        }
      }
    } catch (err: any) {
      console.error('🔍 Error en prueba:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Depuración de Autenticación
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Credenciales de Prueba
        </Typography>

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Button variant="contained" onClick={handleTest} disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Probar Autenticación'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Respuesta del Servidor
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Box>
        </Paper>
      )}

      {parsedToken && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Token JWT Decodificado
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <pre>{JSON.stringify(parsedToken, null, 2)}</pre>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
