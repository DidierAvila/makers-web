'use client';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  GridLegacy as Grid,
} from '@mui/material';
import {
  People,
  Business,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  MoreVert,
  Notifications,
  Security,
  School,
} from '@mui/icons-material';

// Datos de ejemplo para el dashboard
const dashboardStats = [
  {
    title: 'Total Usuarios',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: People,
    color: '#1976d2',
  },
  {
    title: 'Empresas Activas',
    value: '89',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Business,
    color: '#388e3c',
  },
  {
    title: 'Evaluaciones',
    value: '456',
    change: '+18%',
    changeType: 'positive' as const,
    icon: Assessment,
    color: '#f57c00',
  },
  {
    title: 'Alertas Pendientes',
    value: '23',
    change: '-8%',
    changeType: 'negative' as const,
    icon: Warning,
    color: '#d32f2f',
  },
];

const recentActivities = [
  {
    id: 1,
    user: 'María González',
    action: 'Creó nueva evaluación',
    time: 'Hace 2 horas',
    avatar: 'MG',
    type: 'evaluation',
  },
  {
    id: 2,
    user: 'Carlos Rodríguez',
    action: 'Actualizó perfil de empresa',
    time: 'Hace 4 horas',
    avatar: 'CR',
    type: 'company',
  },
  {
    id: 3,
    user: 'Ana Martínez',
    action: 'Completó capacitación SST',
    time: 'Hace 6 horas',
    avatar: 'AM',
    type: 'training',
  },
  {
    id: 4,
    user: 'Luis Pérez',
    action: 'Generó reporte mensual',
    time: 'Hace 1 día',
    avatar: 'LP',
    type: 'report',
  },
];

const systemAlerts = [
  {
    id: 1,
    title: 'Actualización de seguridad disponible',
    description: 'Nueva versión del sistema con mejoras de seguridad',
    severity: 'info' as const,
    time: 'Hace 1 hora',
  },
  {
    id: 2,
    title: 'Evaluación vencida',
    description: 'La empresa ABC tiene una evaluación vencida',
    severity: 'warning' as const,
    time: 'Hace 3 horas',
  },
  {
    id: 3,
    title: 'Respaldo completado',
    description: 'Respaldo automático de datos completado exitosamente',
    severity: 'success' as const,
    time: 'Hace 12 horas',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'evaluation':
      return <Assessment sx={{ color: '#f57c00' }} />;
    case 'company':
      return <Business sx={{ color: '#388e3c' }} />;
    case 'training':
      return <School sx={{ color: '#1976d2' }} />;
    case 'report':
      return <TrendingUp sx={{ color: '#7b1fa2' }} />;
    default:
      return <Notifications sx={{ color: '#616161' }} />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
};

export default function AdminDashboard() {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general del sistema y actividades recientes
        </Typography>
      </Box>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      <IconComponent />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.changeType === 'positive' ? 'success' : 'error'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      vs mes anterior
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Actividad reciente */}
        <Grid item xs={12} md={8} component="div">
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="h6" component="h2">
                Actividad Reciente
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {activity.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.user}
                          </Typography>
                          {getActivityIcon(activity.type)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary">
                            {activity.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Alertas del sistema */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="h6" component="h2">
                Alertas del Sistema
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <List>
              {systemAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getSeverityColor(alert.severity)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {alert.severity === 'success' ? (
                          <CheckCircle sx={{ fontSize: 18 }} />
                        ) : alert.severity === 'warning' ? (
                          <Warning sx={{ fontSize: 18 }} />
                        ) : (
                          <Security sx={{ fontSize: 18 }} />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          {alert.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {alert.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < systemAlerts.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Progreso del sistema */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} component="div">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Estado del Sistema
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} component="div">
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Uso de almacenamiento</Typography>
                    <Typography variant="body2" color="text.secondary">
                      68%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={68}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4} component="div">
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Usuarios activos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      85%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{ height: 8, borderRadius: 4 }}
                    color="success"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4} component="div">
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Rendimiento</Typography>
                    <Typography variant="body2" color="text.secondary">
                      92%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    sx={{ height: 8, borderRadius: 4 }}
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
