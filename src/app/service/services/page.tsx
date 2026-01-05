/**
 * Loans Page - Página de gestión de préstamos
 * Platform Web Frontend - Next.js TypeScript
 * Ruta: /service/services
 *
 * Funcionalidad según rol:
 * - Usuario: Solicitar préstamos y ver mis préstamos
 * - Admin: Gestionar todos los préstamos (aprobar/rechazar)
 */

'use client';

import { LoanRequestForm, LoansManagement, MyLoans } from '@/modules/shared/components/loans';
import { useAuth } from '@/modules/shared/hooks/useAuth';
import { Box, CircularProgress, Container, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';

export default function LoansPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Cargando...
        </Typography>
      </Container>
    );
  }

  // Vista para Administradores
  if (isAdmin) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Gestión de Préstamos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Administra las solicitudes de préstamos de los usuarios
        </Typography>
        <LoansManagement />
      </Container>
    );
  }

  // Vista para Usuarios normales
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Préstamos Bancarios
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Solicita préstamos y consulta el estado de tus solicitudes
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Solicitar Préstamo" />
          <Tab label="Mis Préstamos" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <LoanRequestForm />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <MyLoans />
        </Box>
      )}
    </Container>
  );
}
