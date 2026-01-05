'use client';

/**
 * Página principal de reportes - Usuarios por Tipo
 * Platform Web Frontend - Next.js TypeScript
 */

import {
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

import { ReportsService } from '@/modules/reports/services/reportsService';
import { ReportUser, UsersByTypeFilters, UsersByTypeReportDto } from '@/modules/reports/types';
import { PieChart } from './charts';
import ReportFilters from './ReportFilters';

const UsersByTypeReport: React.FC = () => {
  const [reportData, setReportData] = useState<UsersByTypeReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UsersByTypeFilters>({});

  // Cargar datos iniciales
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async (appliedFilters: UsersByTypeFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await ReportsService.getUsersByTypeReport(appliedFilters);
      setReportData(data);
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Error al cargar el reporte. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: UsersByTypeFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadReportData(filters);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusColor = (user: ReportUser) => {
    // Si lastLoginAt existe y es reciente (menos de 30 días), mostrar como activo
    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastLogin > thirtyDaysAgo ? 'success' : 'warning';
    }
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <AssessmentIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Reporte de Usuarios por Tipo
        </Typography>
      </Box>

      {/* Filtros */}
      <Box mb={3}>
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && !reportData && (
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={1} minWidth={300}>
            <Skeleton variant="rectangular" height={400} />
          </Box>
          <Box flex={1} minWidth={300}>
            <Skeleton variant="rectangular" height={400} />
          </Box>
        </Box>
      )}

      {/* Contenido del reporte */}
      {reportData && (
        <>
          {/* Resumen y gráfico */}
          <Box display="flex" gap={3} mb={3} flexWrap="wrap">
            {/* Gráfico circular */}
            <Box flex={2} minWidth={400}>
              <PieChart
                data={reportData.pieChartData}
                title="Distribución de Usuarios por Tipo"
                showLegend={true}
              />
            </Box>

            {/* Resumen estadístico */}
            <Box flex={1} minWidth={300}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen Estadístico
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="h3" color="primary.main" fontWeight="bold">
                      {reportData.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de usuarios
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="h5" color="secondary.main">
                      {reportData.details.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de usuario
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Generado el:
                    </Typography>
                    <Typography variant="body2">{formatDate(reportData.generatedAt)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Detalles por tipo de usuario */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Detalle por Tipo de Usuario
          </Typography>

          {reportData.details.map((detail) => (
            <Accordion key={detail.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {detail.name}
                  </Typography>
                  <Chip
                    label={`${detail.userCount} usuarios (${detail.percentage}%)`}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Fecha Registro</TableCell>
                        <TableCell>Último Inicio</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {user.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2">{user.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={user.lastLoginAt ? 'Activo' : 'Inactivo'}
                              color={getStatusColor(user)}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      {/* Loading overlay */}
      {loading && reportData && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255, 255, 255, 0.7)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Container>
  );
};

export default UsersByTypeReport;
