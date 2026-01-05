'use client';

import {
  UserType as ServiceUserType,
  UserTypeFilters,
  userTypesService,
} from '@/modules/admin/services/userTypesService';
import { useApiAuth } from '@/modules/shared/hooks/useApiAuth';
import { useSnackbar } from 'notistack';
import { UserTypeFieldsManager } from './UserTypeFieldsManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-type-tabpanel-${index}`}
      aria-labelledby={`user-type-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

import {
  AdminPanelSettings,
  Assignment,
  Business,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  FilterList,
  Group,
  MoreVert,
  People,
  PersonAdd,
  Search,
  Security,
  Shield,
  SupervisorAccount,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  GridLegacy as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface PortalConfig {
  theme: string;
  defaultLandingPage: string;
  logoUrl?: string;
  language: string;
  customLabel?: string;
  customIcon?: string;
  customRoute?: string;
}

// Mapear el tipo del servicio al tipo del componente
type UserType = Omit<ServiceUserType, 'status'> & {
  status: 'Activo' | 'Inactivo';
  portalConfig?: PortalConfig;
  userCount?: number;
  isDefault?: boolean;
  additionalConfig?: Record<string, any>;
};

interface UserTypeFormData {
  name: string;
  description: string;
  portalConfig: PortalConfig;
  status: 'Activo' | 'Inactivo';
  isDefault: boolean;
  additionalConfig?: Record<string, any>;
}

const UserTypesManagement: React.FC = () => {
  console.log('UserTypesManagement component rendering');

  // Configurar autenticación
  const authData = useApiAuth();
  console.log('UserTypes - Auth data:', authData);
  const { enqueueSnackbar } = useSnackbar();

  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estados para el diálogo con pestañas
  const [dialogTab, setDialogTab] = useState(0);
  const [selectedUserTypeForFields, setSelectedUserTypeForFields] = useState<UserType | null>(null);

  // Función para cargar tipos de usuario
  const loadUserTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: UserTypeFilters = {
        Page: page,
        PageSize: rowsPerPage,
      };

      // Agregar filtros si están definidos
      if (searchTerm.trim()) {
        filters.Name = searchTerm.trim();
      }

      if (statusFilter !== 'Todos') {
        filters.Status = statusFilter === 'Activo';
      }

      console.log('UserTypes - Loading with filters:', filters);

      const response = await userTypesService.getAll(filters);
      console.log('UserTypes - Backend response:', response);
      console.log('UserTypes - Number of user types received:', response.data?.length || 0);

      // Mapear los datos del backend al formato del componente
      const mappedUserTypes: UserType[] = (response.data || []).map(
        (backendUserType: ServiceUserType) => ({
          ...backendUserType,
          status: backendUserType.status ? 'Activo' : ('Inactivo' as 'Activo' | 'Inactivo'),
          portalConfig: {
            theme: 'default',
            defaultLandingPage: '/dashboard',
            language: 'es',
          },
          userCount: 0,
          isDefault: false,
        })
      );

      console.log('UserTypes - Mapped user types:', mappedUserTypes);

      setUserTypes(mappedUserTypes);

      // Configurar paginación
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalRecords || 0);
    } catch (error) {
      console.error('Error al cargar tipos de usuario:', error);
      setError('Error al cargar los tipos de usuario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    console.log('UserTypes - useEffect triggered, loading user types');
    loadUserTypes();
  }, [page, searchTerm, statusFilter]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState<UserTypeFormData>({
    name: '',
    description: '',
    portalConfig: {
      theme: 'default',
      defaultLandingPage: '/dashboard',
      language: 'es',
    },
    status: 'Activo',
    isDefault: false,
    additionalConfig: {},
  });

  const themes = ['default', 'admin', 'supervisor', 'consultant', 'client', 'auditor', 'guest'];
  const languages = ['es', 'en', 'pt'];
  const landingPages = [
    '/dashboard',
    '/evaluations',
    '/reports',
    '/clients',
    '/audit-dashboard',
    '/guest-dashboard',
  ];
  const statuses = ['Activo', 'Inactivo'];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userType: UserType) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserType(userType);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserType(null);
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', userType?: UserType) => {
    setDialogMode(mode);
    setDialogTab(0); // Reset to first tab
    if (userType) {
      setFormData({
        name: userType.name,
        description: userType.description,
        portalConfig: userType.portalConfig || {
          theme: 'light',
          defaultLandingPage: '/dashboard',
          language: 'es',
        },
        status: userType.status,
        isDefault: userType.isDefault || false,
        additionalConfig: userType.additionalConfig || {},
      });
      setSelectedUserType(userType);
      setSelectedUserTypeForFields(userType);
    } else {
      setFormData({
        name: '',
        description: '',
        portalConfig: {
          theme: 'default',
          defaultLandingPage: '/dashboard',
          language: 'es',
        },
        status: 'Activo',
        isDefault: false,
        additionalConfig: {},
      });
      setSelectedUserType(null);
      setSelectedUserTypeForFields(null);
    }
    setOpenDialog(true);
    // Solo cerrar el menú, no limpiar selectedUserType
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserType(null);
    setSelectedUserTypeForFields(null);
    setDialogTab(0);
    setError(null); // Limpiar errores al cerrar
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDialogTab(newValue);
  };

  const handleDynamicFieldsUpdate = (updatedFields: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      additionalConfig: {
        ...prev.additionalConfig,
        dynamicFields: updatedFields,
      },
    }));
  };

  const handleSaveUserType = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar datos para el backend según el formato esperado
      const userTypeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status === 'Activo', // Convertir string a boolean
        additionalConfig: formData.additionalConfig || {},
      };

      if (dialogMode === 'create') {
        await userTypesService.create(userTypeData);
        enqueueSnackbar('Tipo de usuario creado exitosamente', { variant: 'success' });
      } else if (dialogMode === 'edit' && selectedUserType) {
        await userTypesService.update(selectedUserType.id, userTypeData);
        enqueueSnackbar('Tipo de usuario actualizado exitosamente', { variant: 'success' });
      } else {
        console.error('Edit mode but no selectedUserType:', { dialogMode, selectedUserType });
        setError('Error: No se pudo identificar el tipo de usuario a editar');
        return;
      }

      // Recargar la lista de tipos de usuario después de cualquier operación exitosa
      await loadUserTypes();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving user type:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al guardar el tipo de usuario';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUserType = async () => {
    try {
      if (selectedUserType && !selectedUserType.isDefault) {
        setError(null);
        setLoading(true);

        await userTypesService.delete(selectedUserType.id);
        enqueueSnackbar('Tipo de usuario eliminado exitosamente', { variant: 'success' });

        // Recargar la lista de tipos de usuario
        await loadUserTypes();
      }
    } catch (err: any) {
      console.error('Error deleting user type:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al eliminar el tipo de usuario';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    handleMenuClose();
  };

  const handleSetDefault = () => {
    if (selectedUserType) {
      setUserTypes(
        userTypes.map((userType) => ({
          ...userType,
          isDefault: userType.id === selectedUserType.id,
        }))
      );
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    return status === 'Activo' ? 'success' : 'default';
  };

  const getUserTypeIcon = (userTypeName: string) => {
    switch (userTypeName) {
      case 'Administrador':
        return <AdminPanelSettings />;
      case 'Supervisor SST':
        return <SupervisorAccount />;
      case 'Consultor':
        return <Shield />;
      case 'Cliente':
        return <Business />;
      case 'Auditor Externo':
        return <Assignment />;
      case 'Invitado':
        return <People />;
      default:
        return <Group />;
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'admin':
        return '#1976d2';
      case 'supervisor':
        return '#388e3c';
      case 'consultant':
        return '#f57c00';
      case 'client':
        return '#7b1fa2';
      case 'auditor':
        return '#d32f2f';
      case 'guest':
        return '#616161';
      default:
        return '#424242';
    }
  };

  // Los datos ya vienen filtrados y paginados del servidor

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Tipos de Usuario</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog('create')}
        >
          Nuevo Tipo de Usuario
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los tipos de usuario definen diferentes configuraciones de portal y niveles de acceso para
        distintos perfiles de usuarios.
      </Alert>

      {/* Mostrar errores si existen */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} component="div">
              <TextField
                fullWidth
                placeholder="Buscar tipos de usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3} component="div">
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} component="div">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('Todos');
                }}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de tipos de usuario */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo de Usuario</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Configuración Portal</TableCell>
                <TableCell>Usuarios</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Por Defecto</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userTypes.map((userType) => (
                <TableRow key={userType.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        {getUserTypeIcon(userType.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {userType.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {userType.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{userType.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={userType.portalConfig?.theme || 'light'}
                        size="small"
                        sx={{
                          bgcolor: getThemeColor(userType.portalConfig?.theme || 'light'),
                          color: 'white',
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="caption" display="block" color="textSecondary">
                        {userType.portalConfig?.defaultLandingPage || '/dashboard'}
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {(userType.portalConfig?.language || 'es').toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${userType.userCount} usuarios`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userType.status}
                      size="small"
                      color={getStatusColor(userType.status) as any}
                      icon={userType.status === 'Activo' ? <CheckCircle /> : <Cancel />}
                    />
                  </TableCell>
                  <TableCell>
                    {userType.isDefault && (
                      <Chip label="Por Defecto" size="small" color="primary" icon={<Security />} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{userType.createdAt}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Más opciones">
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, userType)}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog('view', selectedUserType!)}>
          <Visibility sx={{ mr: 1 }} /> Ver Detalles
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('edit', selectedUserType!)}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>
        {!selectedUserType?.isDefault && (
          <MenuItem onClick={handleSetDefault}>
            <Security sx={{ mr: 1 }} /> Establecer por Defecto
          </MenuItem>
        )}
        {!selectedUserType?.isDefault && selectedUserType?.userCount === 0 && (
          <MenuItem onClick={handleDeleteUserType} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        )}
      </Menu>

      {/* Dialog para crear/editar/ver tipo de usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Nuevo Tipo de Usuario'}
          {dialogMode === 'edit' && 'Editar Tipo de Usuario'}
          {dialogMode === 'view' && 'Detalles del Tipo de Usuario'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={dialogTab}
              onChange={handleTabChange}
              aria-label="user type configuration tabs"
            >
              <Tab label="Información General" />
              <Tab label="Campos Dinámicos" disabled={dialogMode === 'create'} />
            </Tabs>
          </Box>

          <TabPanel value={dialogTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} component="div">
                <Typography variant="h6" gutterBottom>
                  Información General
                </Typography>
                <TextField
                  fullWidth
                  label="Nombre del tipo de usuario"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={dialogMode === 'view'}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={dialogMode === 'view'}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }} disabled={dialogMode === 'view'}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.status}
                    label="Estado"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      disabled={dialogMode === 'view'}
                    />
                  }
                  label="Tipo de usuario por defecto"
                />
              </Grid>
              <Grid item xs={12} md={6} component="div">
                <Typography variant="h6" gutterBottom>
                  Configuración del Portal
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }} disabled={dialogMode === 'view'}>
                  <InputLabel>Tema</InputLabel>
                  <Select
                    value={formData.portalConfig.theme}
                    label="Tema"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        portalConfig: { ...formData.portalConfig, theme: e.target.value },
                      })
                    }
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme} value={theme}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              bgcolor: getThemeColor(theme),
                              borderRadius: '50%',
                              mr: 1,
                            }}
                          />
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }} disabled={dialogMode === 'view'}>
                  <InputLabel>Página de inicio</InputLabel>
                  <Select
                    value={formData.portalConfig.defaultLandingPage}
                    label="Página de inicio"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        portalConfig: {
                          ...formData.portalConfig,
                          defaultLandingPage: e.target.value,
                        },
                      })
                    }
                  >
                    {landingPages.map((page) => (
                      <MenuItem key={page} value={page}>
                        {page}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }} disabled={dialogMode === 'view'}>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={formData.portalConfig.language}
                    label="Idioma"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        portalConfig: { ...formData.portalConfig, language: e.target.value },
                      })
                    }
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Etiqueta personalizada (opcional)"
                  value={formData.portalConfig.customLabel || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portalConfig: { ...formData.portalConfig, customLabel: e.target.value },
                    })
                  }
                  disabled={dialogMode === 'view'}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Icono personalizado (opcional)"
                  value={formData.portalConfig.customIcon || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portalConfig: { ...formData.portalConfig, customIcon: e.target.value },
                    })
                  }
                  disabled={dialogMode === 'view'}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="URL del logo (opcional)"
                  value={formData.portalConfig.logoUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portalConfig: { ...formData.portalConfig, logoUrl: e.target.value },
                    })
                  }
                  disabled={dialogMode === 'view'}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={dialogTab} index={1}>
            {selectedUserTypeForFields && (
              <UserTypeFieldsManager userTypeId={selectedUserTypeForFields.id} />
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSaveUserType}
              variant="contained"
              disabled={loading || !formData.name || !formData.description}
            >
              {loading
                ? 'Guardando...'
                : dialogMode === 'create'
                  ? 'Crear Tipo de Usuario'
                  : 'Guardar Cambios'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTypesManagement;
