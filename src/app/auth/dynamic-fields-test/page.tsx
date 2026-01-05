'use client';

import { userTypesService } from '@/modules/admin/services';
import { UserDynamicFieldsForm } from '@/modules/shared/components/ui';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useState } from 'react';

/**
 * Dynamic Fields Test Page
 *
 * Development page for testing the complete dynamic fields system.
 * This page allows developers to:
 * - Test field rendering for different user types
 * - Verify form validation
 * - Test data persistence
 * - Debug field interactions
 */
export default function DynamicFieldsTestPage() {
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleUserTypeChange = (event: SelectChangeEvent) => {
    setSelectedUserType(event.target.value);
    setSelectedUserId(''); // Reset user selection when changing type
  };

  const handleUserChange = (event: SelectChangeEvent) => {
    setSelectedUserId(event.target.value);
  };

  const handleFormSave = () => {
    console.log('Form saved successfully');
  };

  const testBackendConnection = async () => {
    try {
      setDebugInfo('Probando conexión con el backend...');
      const userType = await userTypesService.getById('11111111-1111-1111-1111-111111111111');
      setDebugInfo(
        `✅ Conexión exitosa! UserType: ${userType.name}\nAdditionalConfig: ${JSON.stringify(userType.additionalConfig, null, 2)}`
      );
    } catch (error) {
      setDebugInfo(
        `❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  };

  // Real user types for testing (using the actual backend)
  const mockUserTypes = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Administrador' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Usuario Regular' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Moderador' },
  ];

  // Mock users for testing (these would come from the real user service)
  const mockUsers = [
    { id: 'user-1', name: 'Juan Pérez', userTypeId: '11111111-1111-1111-1111-111111111111' },
    { id: 'user-2', name: 'María García', userTypeId: '22222222-2222-2222-2222-222222222222' },
    { id: 'user-3', name: 'Carlos López', userTypeId: '33333333-3333-3333-3333-333333333333' },
  ];

  const filteredUsers = mockUsers.filter((user) => user.userTypeId === selectedUserType);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prueba de Campos Dinámicos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Página de desarrollo para probar el sistema completo de campos dinámicos.
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6" component="div" gutterBottom>
          Página de Desarrollo
        </Typography>
        Esta página está destinada únicamente para desarrollo y pruebas. No debe ser accesible en
        producción.
      </Alert>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" component="div" gutterBottom>
          Instrucciones de Uso
        </Typography>
        <Typography component="div">
          Para que aparezcan campos dinámicos:
          <br />• Primero debes configurar campos dinámicos para el tipo de usuario en la página de
          gestión
          <br />• Los IDs usados aquí son mock, necesitas usar IDs reales del backend
          <br />• Si ves "No hay campos dinámicos configurados", significa que el tipo de usuario no
          tiene campos configurados
        </Typography>
      </Alert>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Prueba
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={testBackendConnection} sx={{ mb: 2 }}>
            🔌 Probar Conexión Backend
          </Button>

          {debugInfo && (
            <Alert severity={debugInfo.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{debugInfo}</pre>
            </Alert>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Usuario</InputLabel>
            <Select
              value={selectedUserType}
              label="Tipo de Usuario"
              onChange={handleUserTypeChange}
            >
              {mockUserTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedUserType}>
            <InputLabel>Usuario</InputLabel>
            <Select value={selectedUserId} label="Usuario" onChange={handleUserChange}>
              {filteredUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {selectedUserType && selectedUserId && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Formulario de Campos Dinámicos
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Información de Debug:</strong>
            <br />
            UserType ID: {selectedUserType}
            <br />
            User ID: {selectedUserId}
          </Alert>
          <Divider sx={{ mb: 3 }} />

          <UserDynamicFieldsForm
            userTypeId={selectedUserType}
            userId={selectedUserId}
            onSave={handleFormSave}
          />
        </Paper>
      )}

      {selectedUserType && !selectedUserId && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Selecciona un usuario para ver el formulario de campos dinámicos.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!selectedUserType && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Selecciona un tipo de usuario para comenzar la prueba.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
