'use client';

import {
  Add,
  AdminPanelSettings,
  Assessment,
  Assignment,
  Business,
  Cancel,
  CheckCircle,
  Dashboard,
  Delete,
  Edit,
  ExpandMore,
  FilterList,
  Key,
  MoreVert,
  People,
  Search,
  Settings,
  Shield,
  Visibility,
  VpnKey,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Badge,
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
  GridLegacy as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
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
import { useApiAuth } from '../../../../shared/hooks/useApiAuth';
import { useSnackbar } from 'notistack';
import {
  PermissionFilters,
  ServicePermission,
  permissionsService,
} from '../../../services/permissionsService';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'read' | 'create' | 'edit' | 'delete' | 'config';
  status: 'Activo' | 'Inactivo';
  rolesCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface PermissionFormData {
  name: string;
  description: string;
  module: string;
  action: 'read' | 'create' | 'edit' | 'delete' | 'config';
  status: 'Activo' | 'Inactivo';
}

const PermissionsManagement: React.FC = () => {
  const { isAuthenticated } = useApiAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('Todos');
  const [actionFilter, setActionFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    description: '',
    module: '',
    action: 'read',
    status: 'Activo',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const modules = [
    'Usuarios',
    'Roles',
    'Evaluaciones',
    'Reportes',
    'Dashboard',
    'Sistema',
    'Clientes',
    'Auditoría',
  ];
  const actions = ['read', 'create', 'edit', 'delete', 'config'];
  const statuses = ['Activo', 'Inactivo'];

  // Función para cargar permisos desde el backend
  const loadPermissions = async () => {
    if (!isAuthenticated) {
      // No cargar permisos si el usuario no está autenticado
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando permisos desde el backend...');

      const filters: PermissionFilters = {
        Page: page,
        PageSize: rowsPerPage,
      };

      // Aplicar filtros
      if (searchTerm.trim()) {
        filters.Name = searchTerm.trim();
      }

      if (statusFilter !== 'Todos') {
        filters.Status = statusFilter === 'Activo';
      }

      // Aplicar ordenamiento
      if (sortBy) {
        filters.SortBy = sortBy;
      }

      const response = await permissionsService.getAll(filters);
      console.log('✅ Permisos cargados:', response);

      if (response && response.data) {
        // Mapear los datos del backend al formato del componente
        const mappedPermissions: Permission[] = response.data.map(
          (servicePermission: ServicePermission) => ({
            id: servicePermission.id,
            name: servicePermission.name,
            description: servicePermission.description,
            module: servicePermission.module,
            action: servicePermission.action as 'read' | 'create' | 'edit' | 'delete' | 'config',
            status: servicePermission.status ? 'Activo' : 'Inactivo',
            rolesCount: servicePermission.rolesCount || 0,
            createdAt: servicePermission.createdAt,
            updatedAt: servicePermission.updatedAt || servicePermission.createdAt,
          })
        );

        setPermissions(mappedPermissions);

        // Configurar paginación
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalRecords || 0);
      }
    } catch (error) {
      console.error('❌ Error al cargar permisos:', error);
      setError('Error al cargar los permisos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar permisos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadPermissions();
  }, [isAuthenticated, page, searchTerm, statusFilter, sortBy]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, permission: Permission) => {
    setAnchorEl(event.currentTarget);
    setSelectedPermission(permission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPermission(null);
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', permission?: Permission) => {
    setDialogMode(mode);
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        module: permission.module,
        action: permission.action,
        status: permission.status,
      });
      setSelectedPermission(permission);
    } else {
      setFormData({
        name: '',
        description: '',
        module: '',
        action: 'read',
        status: 'Activo',
      });
      setSelectedPermission(null); // Limpiar selectedPermission en modo crear
    }
    setOpenDialog(true);
    setAnchorEl(null); // Solo cerrar el menú sin limpiar selectedPermission
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPermission(null);
    setError(null); // Limpiar errores al cerrar el diálogo
  };

  const handleSavePermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar datos para el backend según el formato esperado
      const permissionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        module: formData.module,
        action: formData.action,
        status: formData.status === 'Activo', // Convertir string a boolean
      };

      if (dialogMode === 'create') {
        await permissionsService.create(permissionData);
        enqueueSnackbar('Permiso creado exitosamente', { variant: 'success' });
      } else if (dialogMode === 'edit' && selectedPermission) {
        const updateData = {
          id: selectedPermission.id,
          ...permissionData,
        };

        await permissionsService.update(updateData);
        enqueueSnackbar('Permiso actualizado exitosamente', { variant: 'success' });
      } else {
        console.error('Edit mode but no selectedPermission:', { dialogMode, selectedPermission });
        setError('Error: No se pudo identificar el permiso a editar');
        return;
      }

      // Recargar la lista de permisos después de crear/actualizar
      await loadPermissions();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Error al guardar permiso:', error);
      setError('Error al guardar el permiso. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async () => {
    if (selectedPermission) {
      try {
        setLoading(true);
        setError(null);

        await permissionsService.delete(selectedPermission.id);
        enqueueSnackbar('Permiso eliminado exitosamente', { variant: 'success' });

        // Recargar la lista de permisos después de eliminar
        await loadPermissions();
      } catch (error) {
        console.error('❌ Error al eliminar permiso:', error);
        setError('Error al eliminar el permiso. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    handleMenuClose();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'info';
      case 'create':
        return 'success';
      case 'edit':
        return 'warning';
      case 'delete':
        return 'error';
      case 'config':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string): React.ReactElement => {
    switch (action) {
      case 'read':
        return <Visibility />;
      case 'create':
        return <Add />;
      case 'edit':
        return <Edit />;
      case 'delete':
        return <Delete />;
      case 'config':
        return <Settings />;
      default:
        return <Key />;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Usuarios':
        return <People />;
      case 'Roles':
        return <AdminPanelSettings />;
      case 'Evaluaciones':
        return <Assessment />;
      case 'Reportes':
        return <Assignment />;
      case 'Dashboard':
        return <Dashboard />;
      case 'Sistema':
        return <Settings />;
      case 'Clientes':
        return <Business />;
      case 'Auditoría':
        return <Shield />;
      default:
        return <Key />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Activo' ? 'success' : 'default';
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'Todos' || permission.module === moduleFilter;
    const matchesAction = actionFilter === 'Todas' || permission.action === actionFilter;
    const matchesStatus = statusFilter === 'Todos' || permission.status === statusFilter;
    return matchesSearch && matchesModule && matchesAction && matchesStatus;
  });

  // Los permisos ya vienen paginados del backend
  const paginatedPermissions = permissions;

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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Permisos</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
          >
            Vista Tabla
          </Button>
          <Button
            variant={viewMode === 'grouped' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grouped')}
          >
            Vista Agrupada
          </Button>
          <Button
            variant="contained"
            startIcon={<VpnKey />}
            onClick={() => handleOpenDialog('create')}
          >
            Nuevo Permiso
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los permisos definen las acciones específicas que pueden realizar los usuarios según sus
        roles asignados.
      </Alert>

      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar permisos..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Módulo</InputLabel>
                <Select
                  value={moduleFilter}
                  label="Módulo"
                  onChange={(e) => setModuleFilter(e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {modules.map((module) => (
                    <MenuItem key={module} value={module}>
                      {module}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Acción</InputLabel>
                <Select
                  value={actionFilter}
                  label="Acción"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="Todas">Todas</MenuItem>
                  {actions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setModuleFilter('Todos');
                  setActionFilter('Todas');
                  setStatusFilter('Todos');
                }}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Vista de tabla */}
      {viewMode === 'table' && (
        <Card>
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Cargando permisos...</Typography>
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('name')}
                  >
                    Permiso {getSortIcon('name')}
                  </TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('description')}
                  >
                    Descripción {getSortIcon('description')}
                  </TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('status')}
                  >
                    Estado {getSortIcon('status')}
                  </TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('createdat')}
                  >
                    Fecha Creación {getSortIcon('createdat')}
                  </TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPermissions.map((permission) => (
                  <TableRow key={permission.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Key />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {permission.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getModuleIcon(permission.module)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {permission.module}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.action}
                        size="small"
                        color={getActionColor(permission.action) as any}
                        icon={getActionIcon(permission.action)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{permission.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${permission.rolesCount} roles`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.status}
                        size="small"
                        color={getStatusColor(permission.status) as any}
                        icon={permission.status === 'Activo' ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{permission.createdAt}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Más opciones">
                        <IconButton size="small" onClick={(e) => handleMenuClick(e, permission)}>
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
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <Typography variant="body2" color="textSecondary">
              {loading
                ? 'Cargando...'
                : `Mostrando ${permissions.length} de ${totalItems} permisos`}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              disabled={loading}
            />
          </Box>
        </Card>
      )}

      {/* Vista agrupada */}
      {viewMode === 'grouped' && (
        <Box>
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <Accordion key={module} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" width="100%">
                  {getModuleIcon(module)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {module}
                  </Typography>
                  <Badge badgeContent={modulePermissions.length} color="primary" sx={{ mr: 2 }}>
                    <Chip label="permisos" size="small" />
                  </Badge>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {modulePermissions.map((permission) => (
                    <Grid item xs={12} md={6} lg={4} key={permission.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="between"
                            alignItems="flex-start"
                            mb={2}
                          >
                            <Box display="flex" alignItems="center" flexGrow={1}>
                              <Avatar
                                sx={{ mr: 2, bgcolor: getActionColor(permission.action) + '.main' }}
                              >
                                {getActionIcon(permission.action)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="medium">
                                  {permission.name}
                                </Typography>
                                <Chip
                                  label={permission.action}
                                  size="small"
                                  color={getActionColor(permission.action) as any}
                                />
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, permission)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="textSecondary" mb={2}>
                            {permission.description}
                          </Typography>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Chip
                              label={`${permission.rolesCount} roles`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={permission.status}
                              size="small"
                              color={getStatusColor(permission.status) as any}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog('view', selectedPermission!)}>
          <Visibility sx={{ mr: 1 }} /> Ver Detalles
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('edit', selectedPermission!)}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDeletePermission} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar/ver permiso */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Nuevo Permiso'}
          {dialogMode === 'edit' && 'Editar Permiso'}
          {dialogMode === 'view' && 'Detalles del Permiso'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del permiso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }} disabled={dialogMode === 'view'}>
                <InputLabel>Módulo</InputLabel>
                <Select
                  value={formData.module}
                  label="Módulo"
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                >
                  {modules.map((module) => (
                    <MenuItem key={module} value={module}>
                      {module}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Acción</InputLabel>
                <Select
                  value={formData.action}
                  label="Acción"
                  onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                >
                  {actions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth disabled={dialogMode === 'view'}>
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSavePermission} variant="contained">
              {dialogMode === 'create' ? 'Crear Permiso' : 'Guardar Cambios'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionsManagement;
