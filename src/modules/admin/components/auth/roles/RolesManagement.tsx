'use client';

import { useApiAuth } from '@/modules/shared/hooks/useApiAuth';
import { useSnackbar } from 'notistack';
import {
  Add,
  AdminPanelSettings,
  ArrowDownward,
  ArrowUpward,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  FilterList,
  MoreVert,
  People,
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
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  GridLegacy as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  RoleFilters,
  ServiceRole,
  rolesService,
  PermissionDropdown,
  RolePermission,
} from '../../../services/rolesService';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: 'Activo' | 'Inactivo';
  createdAt: string;
  updatedAt?: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  status: boolean | 'Activo' | 'Inactivo'; // Permitir tanto boolean como string para compatibilidad
}

const RolesManagement: React.FC = () => {
  const { isAuthenticated } = useApiAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Estados principales
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'description' | 'status' | 'createdat' | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados para diálogos y menús
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
    status: true, // Usar boolean por defecto para coincidir con el backend
  });

  // Estado para filtro de permisos
  const [permissionFilter, setPermissionFilter] = useState('');

  const statuses = ['Activo', 'Inactivo'];

  // Función para cargar roles desde el backend
  const loadRoles = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const filters: RoleFilters = {
        Page: page,
        PageSize: rowsPerPage,
        SearchTerm: '',
      };

      if (searchTerm.trim()) {
        filters.SearchTerm = searchTerm.trim();
      }

      if (statusFilter !== 'Todos') {
        filters.Status = statusFilter;
      }

      if (sortBy) {
        filters.SortBy = sortBy;
        filters.SortOrder = sortOrder;
      }

      const response = await rolesService.getAll(filters);

      // Mapear los roles del servicio al formato del componente
      const mappedRoles: Role[] = response.data.map((serviceRole: ServiceRole) => ({
        id: serviceRole.id,
        name: serviceRole.name,
        description: serviceRole.description || '',
        permissions: (serviceRole.permissions || []).map((p) => p.id),
        userCount: serviceRole.userCount || 0,
        status: serviceRole.status ? 'Activo' : 'Inactivo',
        createdAt: serviceRole.createdAt,
        updatedAt: serviceRole.updatedAt || serviceRole.createdAt,
      }));

      setRoles(mappedRoles);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalRecords || 0);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Error al cargar los roles. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles cuando cambian los filtros o la paginación
  useEffect(() => {
    loadRoles();
  }, [isAuthenticated, page, searchTerm, statusFilter, sortBy, sortOrder]);

  // Funciones de manejo de filtros
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setSortBy(null);
    setSortOrder('asc');
    setPage(1);
  };

  // Funciones de ordenamiento
  const handleSort = (column: 'name' | 'description' | 'status' | 'createdat') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (column: 'name' | 'description' | 'status' | 'createdat') => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <ArrowDownward fontSize="small" />
    );
  };

  // Estados para permisos
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Cargar permisos desde el backend
  const loadPermissions = async () => {
    if (!isAuthenticated) return;

    setLoadingPermissions(true);
    try {
      const permissionsData = await rolesService.getPermissionsDropdown();

      // Mapear los permisos del backend al formato del componente
      const mappedPermissions: Permission[] = permissionsData.map(
        (permission: PermissionDropdown) => ({
          id: permission.id,
          name: permission.name,
          description: permission.name, // Usar el name como descripción por ahora
          module: 'Sistema', // Módulo por defecto, se puede mejorar más adelante
        })
      );

      setPermissions(mappedPermissions);
      console.log('✅ Permisos cargados desde el backend:', mappedPermissions);
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      // Mantener permisos de ejemplo como fallback
      setPermissions([
        {
          id: 'users.read',
          name: 'Ver Usuarios',
          description: 'Consultar información de usuarios',
          module: 'Usuarios',
        },
        {
          id: 'users.create',
          name: 'Crear Usuarios',
          description: 'Crear nuevos usuarios en el sistema',
          module: 'Usuarios',
        },
        // ... otros permisos de ejemplo
      ]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Cargar permisos al montar el componente
  useEffect(() => {
    loadPermissions();
  }, [isAuthenticated]);

  // Permisos de ejemplo (mantener como fallback)
  /*
  const [fallbackPermissions] = useState<Permission[]>([
    {
      id: 'users.read',
      name: 'Ver Usuarios',
      description: 'Consultar información de usuarios',
      module: 'Usuarios',
    },
    {
      id: 'users.create',
      name: 'Crear Usuarios',
      description: 'Crear nuevos usuarios en el sistema',
      module: 'Usuarios',
    },
    {
      id: 'users.edit',
      name: 'Editar Usuarios',
      description: 'Modificar información de usuarios',
      module: 'Usuarios',
    },
    {
      id: 'users.delete',
      name: 'Eliminar Usuarios',
      description: 'Eliminar usuarios del sistema',
      module: 'Usuarios',
    },
    {
      id: 'roles.read',
      name: 'Ver Roles',
      description: 'Consultar información de roles',
      module: 'Roles',
    },
    {
      id: 'roles.create',
      name: 'Crear Roles',
      description: 'Crear nuevos roles en el sistema',
      module: 'Roles',
    },
    {
      id: 'roles.edit',
      name: 'Editar Roles',
      description: 'Modificar información de roles',
      module: 'Roles',
    },
    {
      id: 'roles.delete',
      name: 'Eliminar Roles',
      description: 'Eliminar roles del sistema',
      module: 'Roles',
    },
    {
      id: 'permissions.read',
      name: 'Ver Permisos',
      description: 'Consultar información de permisos',
      module: 'Permisos',
    },
    {
      id: 'reports.read',
      name: 'Ver Reportes',
      description: 'Acceso a reportes del sistema',
      module: 'Reportes',
    },
    {
      id: 'clients.read',
      name: 'Ver Clientes',
      description: 'Consultar información de clientes',
      module: 'Clientes',
    },
    {
      id: 'dashboard.read',
      name: 'Ver Dashboard',
      description: 'Acceso al panel principal',
      module: 'Dashboard',
    },
    {
      id: 'profile.edit',
      name: 'Editar Perfil',
      description: 'Modificar perfil propio',
      module: 'Perfil',
    },
    {
      id: 'system.config',
      name: 'Configuración Sistema',
      description: 'Configurar parámetros del sistema',
      module: 'Sistema',
    },
  ]);
  */

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleCreateRole = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      description: '',
      permissions: [],
      status: true, // Usar boolean true por defecto para crear rol activo
    });
    setOpenDialog(true);
    setAnchorEl(null); // Solo cerrar el menú, no limpiar selectedRole
  };

  const handleEditRole = async () => {
    if (!selectedRole) {
      console.error('No hay rol seleccionado para editar');
      return;
    }

    try {
      setDialogMode('edit');

      // Mostrar loading mientras se cargan los datos del rol
      setFormData({
        name: '',
        description: '',
        permissions: [],
        status: true,
      });
      setOpenDialog(true);

      console.log('🔄 Cargando datos del rol:', selectedRole.id);

      // Cargar datos completos del rol desde el backend
      const roleData = await rolesService.getById(selectedRole.id);

      console.log('✅ Datos del rol cargados:', roleData);

      // Mapear los permisos del rol a IDs para el formulario
      const rolePermissionIds = roleData.permissions.map(
        (permission: RolePermission) => permission.id
      );

      setFormData({
        name: roleData.name,
        description: roleData.description,
        permissions: rolePermissionIds,
        status: roleData.status,
      });
    } catch (error) {
      console.error('❌ Error cargando datos del rol:', error);

      // Fallback a los datos básicos del rol de la lista
      setFormData({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: Array.isArray(selectedRole.permissions)
          ? selectedRole.permissions.map((p: any) => (typeof p === 'string' ? p : p.id))
          : [],
        status: selectedRole.status,
      });
    }

    setAnchorEl(null); // Solo cerrar el menú, no limpiar selectedRole
  };

  const handleViewRole = () => {
    if (selectedRole) {
      setDialogMode('view');
      setFormData({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions,
        status: selectedRole.status,
      });
      setOpenDialog(true);
    }
    setAnchorEl(null); // Solo cerrar el menú, no limpiar selectedRole
  };

  /**
   * Abrir diálogo de confirmación para eliminar rol
   */
  const handleOpenDeleteDialog = () => {
    console.log('🔓 [DEBUG] Abriendo diálogo de eliminación para rol:', selectedRole);
    setOpenDeleteDialog(true);
    // NO llamamos handleMenuClose() aquí para mantener selectedRole
    setAnchorEl(null); // Solo cerramos el menú, pero mantenemos selectedRole
  };

  /**
   * Cerrar diálogo de confirmación para eliminar rol
   */
  const handleCloseDeleteDialog = () => {
    console.log('🔒 [DEBUG] Cerrando diálogo de eliminación');
    setOpenDeleteDialog(false);
    setSelectedRole(null); // Limpiar selectedRole al cerrar el diálogo
  };

  /**
   * Manejar eliminación de rol
   */
  const handleDeleteRole = async () => {
    if (!selectedRole) {
      return;
    }

    try {
      setError(null); // Limpiar errores previos
      setLoading(true); // Mostrar indicador de carga

      await rolesService.delete(selectedRole.id);
      enqueueSnackbar('Rol eliminado exitosamente', { variant: 'success' });

      // Recargar la lista
      await loadRoles();
      handleCloseDeleteDialog(); // Cerrar el diálogo de confirmación
    } catch (err: any) {
      console.error('Error al eliminar rol:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error de conexión al eliminar el rol';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null); // Limpiar errores al cerrar el diálogo
    setFormData({
      name: '',
      description: '',
      permissions: [],
      status: true, // Usar boolean true por defecto
    });
    // Solo limpiar selectedRole en modo create
    if (dialogMode === 'create') {
      setSelectedRole(null);
    }
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del rol es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar los datos para el backend
      const roleData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status:
          typeof formData.status === 'boolean' ? formData.status : formData.status === 'Activo', // Manejar tanto boolean como string
        permissionIds: formData.permissions, // Usar permissionIds como espera la API
      };

      if (dialogMode === 'create') {
        await rolesService.create(roleData);
        enqueueSnackbar('Rol creado exitosamente', { variant: 'success' });
      } else if (dialogMode === 'edit' && selectedRole) {
        await rolesService.update({
          ...roleData,
          id: selectedRole.id,
        });
        enqueueSnackbar('Rol actualizado exitosamente', { variant: 'success' });
      }

      // Recargar la lista de roles
      await loadRoles();
      handleCloseDialog();
    } catch (err) {
      console.error('Error al guardar rol:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((id) => id !== permissionId),
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'Activo':
        return <CheckCircle />;
      case 'Inactivo':
        return <Cancel />;
      default:
        return <CheckCircle />;
    }
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin')) return <AdminPanelSettings />;
    if (name.includes('supervisor')) return <SupervisorAccount />;
    if (name.includes('usuario')) return <People />;
    return <Shield />;
  };

  // Filtrar permisos por nombre antes de agrupar
  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
      permission.description.toLowerCase().includes(permissionFilter.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateRole}
          sx={{ borderRadius: 2 }}
        >
          Nuevo Rol
        </Button>
      </Box>

      {/* Información */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Los roles definen los permisos y accesos que tienen los usuarios en el sistema.
      </Alert>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Indicador de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Cargando roles...
          </Typography>
        </Box>
      )}

      {/* Contenido principal */}
      {!loading && (
        <Card>
          <CardContent>
            {/* Filtros */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select value={statusFilter} label="Estado" onChange={handleStatusChange}>
                    <MenuItem value="Todos">Todos</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={handleClearFilters}
                  sx={{ height: '56px' }}
                >
                  Limpiar Filtros
                </Button>
              </Grid>
            </Grid>

            {/* Tabla */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('name')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Rol
                        {getSortIcon('name')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('description')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Descripción
                        {getSortIcon('description')}
                      </Box>
                    </TableCell>
                    <TableCell>Permisos</TableCell>
                    <TableCell>Usuarios</TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('status')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Estado
                        {getSortIcon('status')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('createdat')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Fecha Creación
                        {getSortIcon('createdat')}
                      </Box>
                    </TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {getRoleIcon(role.name)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {role.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${role.permissions.length} permisos`}
                          size="small"
                          variant="outlined"
                          icon={<Security />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${role.userCount} usuarios`}
                          size="small"
                          variant="outlined"
                          icon={<People />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.status}
                          size="small"
                          color={getStatusColor(role.status) as any}
                          icon={getStatusIcon(role.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Más opciones">
                          <IconButton onClick={(e) => handleMenuClick(e, role)} size="small">
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
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                Mostrando {roles.length} de {totalItems} roles
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewRole}>
          <Visibility sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleEditRole}>
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo para crear/editar/ver rol */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Crear Nuevo Rol'}
          {dialogMode === 'edit' && 'Editar Rol'}
          {dialogMode === 'view' && 'Detalles del Rol'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Rol"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={dialogMode === 'view'}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={
                      typeof formData.status === 'boolean'
                        ? formData.status
                          ? 'Activo'
                          : 'Inactivo'
                        : formData.status
                    }
                    label="Estado"
                    onChange={(e) => {
                      const value = e.target.value as 'Activo' | 'Inactivo';
                      setFormData((prev) => ({
                        ...prev,
                        status: value === 'Activo' ? true : false, // Convertir a boolean para el backend
                      }));
                    }}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  disabled={dialogMode === 'view'}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permisos
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar permisos por nombre..."
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                {loadingPermissions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Cargando permisos...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <Box key={module} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {module}
                        </Typography>
                        <FormGroup>
                          {modulePermissions.map((permission) => (
                            <FormControlLabel
                              key={permission.id}
                              control={
                                <Checkbox
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={(e) =>
                                    handlePermissionChange(permission.id, e.target.checked)
                                  }
                                  disabled={dialogMode === 'view'}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2">{permission.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveRole} variant="contained">
              {dialogMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar rol */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Confirmar eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro que desea eliminar el rol <strong>{selectedRole?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error">
            Esta acción no se puede deshacer y eliminará permanentemente todos los datos del rol.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteRole}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading ? 'Eliminando...' : 'Eliminar Rol'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesManagement;
