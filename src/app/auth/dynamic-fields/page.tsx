'use client';

import { UserTypeFieldsManager } from '@/modules/admin/components/auth/user-types';
import {
  Alert,
  AlertTitle,
  Box,
  Container,
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
 * Dynamic Fields Management Page
 *
 * Provides administration interface for managing UserType dynamic fields.
 * This page allows administrators to:
 * - View all UserType fields across all user types
 * - Create new dynamic fields
 * - Edit existing fields
 * - Reorder fields
 * - Activate/deactivate fields
 * - Delete fields
 */
export default function DynamicFieldsPage() {
  const [selectedUserType, setSelectedUserType] = useState<string>('');

  const handleUserTypeChange = (event: SelectChangeEvent) => {
    setSelectedUserType(event.target.value);
  };

  // Real user types - usando IDs reales del backend
  const mockUserTypes = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Administrador' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Usuario Regular' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Moderador' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Cliente Premium' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Proveedor' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Campos Dinámicos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los campos dinámicos para los tipos de usuario del sistema.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Información sobre Campos Dinámicos</AlertTitle>
          Los campos dinámicos permiten personalizar la información recopilada para cada tipo de
          usuario. Los campos definidos aquí se aplicarán automáticamente a todos los usuarios del
          tipo correspondiente.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Seleccionar Tipo de Usuario</InputLabel>
            <Select
              value={selectedUserType}
              label="Seleccionar Tipo de Usuario"
              onChange={handleUserTypeChange}
            >
              {mockUserTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <UserTypeFieldsManager userTypeId={selectedUserType || undefined} />
      </Paper>
    </Container>
  );
}
