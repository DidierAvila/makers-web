'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  GridLegacy as Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Assignment,
  Notifications,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Typography variant="body2" color={color}>
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const PlatformDashboard: React.FC = () => {
  const recentActivities = [
    {
      id: 1,
      title: 'Nuevo cliente registrado',
      description: 'Empresa ABC S.A.S se ha registrado en la plataforma',
      time: 'Hace 2 horas',
      type: 'success',
    },
    {
      id: 2,
      title: 'Evaluación completada',
      description: 'Evaluación de riesgos para XYZ Corp finalizada',
      time: 'Hace 4 horas',
      type: 'info',
    },
    {
      id: 3,
      title: 'Documento pendiente',
      description: 'Revisión de matriz de riesgos pendiente',
      time: 'Hace 6 horas',
      type: 'warning',
    },
    {
      id: 4,
      title: 'Capacitación programada',
      description: 'Sesión de Platform programada para mañana',
      time: 'Hace 1 día',
      type: 'info',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Notifications color="info" />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard - Plataforma
      </Typography>

      <Grid container spacing={3}>
        {/* Métricas principales */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Clientes Activos"
            value={156}
            icon={<Business />}
            color="primary"
            trend="+12% este mes"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Empleados Registrados"
            value={2847}
            icon={<People />}
            color="success"
            trend="+8% este mes"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Evaluaciones Activas"
            value={89}
            icon={<Assignment />}
            color="warning"
            trend="+15% esta semana"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tasa de Cumplimiento"
            value="94.2%"
            icon={<TrendingUp />}
            color="success"
            trend="+2.1% este mes"
          />
        </Grid>

        {/* Progreso de evaluaciones */}
        <Grid item xs={12} md={8} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progreso de Evaluaciones por Cliente
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Empresa ABC S.A.S</Typography>
                  <Typography variant="body2" color="textSecondary">
                    85%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">XYZ Corporation</Typography>
                  <Typography variant="body2" color="textSecondary">
                    72%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={72} sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Industrias DEF Ltda</Typography>
                  <Typography variant="body2" color="textSecondary">
                    91%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={91} sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Servicios GHI S.A</Typography>
                  <Typography variant="body2" color="textSecondary">
                    58%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={58} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad reciente */}
        <Grid item xs={12} md={4} component="div">
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Actividad Reciente</Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <List dense>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Box sx={{ mr: 2, mt: 0.5 }}>{getActivityIcon(activity.type)}</Box>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {activity.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de la plataforma */}
        <Grid item xs={12} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de la Plataforma
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Chip
                      label="Servicios Operativos"
                      color="success"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Todos los servicios funcionando correctamente
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Chip label="Base de Datos" color="success" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Conexión estable - 99.9% uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Chip label="API Externa" color="warning" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Latencia elevada - Monitoreando
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Chip label="Respaldos" color="success" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Último respaldo: Hace 2 horas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformDashboard;
