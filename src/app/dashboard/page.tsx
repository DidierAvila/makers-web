'use client';
import { useUser } from '@/modules/shared/contexts/UserContext';
import { useAuth } from '@/modules/shared/hooks/useAuth';
import { Assessment, Business, People, Warning } from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';
import React, { useEffect } from 'react';

// Componente para tarjetas de estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>
        {trend && (
          <Chip
            label={trend}
            size="small"
            color={trend.includes('+') ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { user, isLoading, error } = useUser();

  useEffect(() => {}, []);

  const stats = [
    {
      title: 'Empresas Activas',
      value: 24,
      icon: <Business sx={{ fontSize: 32 }} />,
      color: 'primary' as const,
      trend: '+12%',
    },
    {
      title: 'Usuarios Registrados',
      value: 156,
      icon: <People sx={{ fontSize: 32 }} />,
      color: 'secondary' as const,
      trend: '+5%',
    },
    {
      title: 'Evaluaciones Completadas',
      value: 89,
      icon: <Assessment sx={{ fontSize: 32 }} />,
      color: 'success' as const,
      trend: '+18%',
    },
    {
      title: 'Alertas Pendientes',
      value: 7,
      icon: <Warning sx={{ fontSize: 32 }} />,
      color: 'warning' as const,
      trend: '-3%',
    },
  ];

  // Mostrar loading si está cargando la configuración del usuario
  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando configuración del usuario...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Error al cargar configuración: {error}
        </Alert>
      )}

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard Principal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido de nuevo, {user?.name || 'Usuario'}. Aquí tienes un resumen de la actividad del
          sistema.
        </Typography>
      </Box>

      {/* Estadísticas principales */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}
        gap={3}
        mb={4}
      >
        {stats.map((stat, index) => (
          <Box key={index}>
            <StatCard {...stat} />
          </Box>
        ))}
      </Box>

      {/* Contenido adicional */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
        <Paper elevation={2} sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Actividad Reciente
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="85%"
            bgcolor="grey.50"
            borderRadius={1}
          >
            <Typography variant="body2" color="text.secondary">
              Gráfico de actividad reciente (próximamente)
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Acciones Rápidas
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              • Nueva empresa
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Generar reporte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Crear evaluación
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Gestionar usuarios
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
