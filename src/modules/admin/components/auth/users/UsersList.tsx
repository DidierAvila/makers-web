/**
 * UsersList Component - Lista de usuarios del sistema
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import {
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useState } from 'react';

import { User, UserFilters, usersService } from '@/modules/admin/services/usersService';
import { PageContainer } from '@/modules/shared/components/layout/PageContainer';
import { useApiData } from '@/modules/shared/hooks/useApiData';

// Tipos para el componente
interface UsersListProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserCreate?: () => void;
  selectable?: boolean;
}

interface TableRowMenuProps {
  user: User;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

// Configuración de columnas
const columns = [
  { id: 'avatar', label: '', minWidth: 60, align: 'center' as const },
  { id: 'name', label: 'Nombre', minWidth: 200 },
  { id: 'email', label: 'Email', minWidth: 250 },
  { id: 'role', label: 'Rol', minWidth: 120, align: 'center' as const },
  { id: 'status', label: 'Estado', minWidth: 100, align: 'center' as const },
  { id: 'department', label: 'Departamento', minWidth: 150 },
  { id: 'actions', label: 'Acciones', minWidth: 100, align: 'center' as const },
];

// Mapeo de colores para roles
const roleColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
  admin: 'primary',
  supervisor: 'secondary',
  employee: 'success',
  advisor: 'warning',
  default: 'primary',
};

// Mapeo de colores para estados (usando claves string)
const statusColors: Record<'active' | 'inactive' | 'suspended', 'success' | 'warning' | 'error'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'error',
};

// Conversión de estado boolean del backend a clave string
const toStatusKey = (status?: boolean): 'active' | 'inactive' | 'suspended' => {
  return status === true ? 'active' : 'inactive';
};

// Componente para el menú de acciones de fila
const TableRowMenu: React.FC<TableRowMenuProps> = ({
  user,
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: { minWidth: 180 },
      }}
    >
      <MenuItem
        onClick={() => {
          onView(user);
          onClose();
        }}
      >
        <ListItemIcon>
          <ViewIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Ver detalles</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onEdit(user);
          onClose();
        }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Editar</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onToggleStatus(user);
          onClose();
        }}
      >
        <ListItemIcon>
          {toStatusKey(user.status) === 'active' ? (
            <BlockIcon fontSize="small" />
          ) : (
            <CheckCircleIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText>
          {toStatusKey(user.status) === 'active' ? 'Desactivar' : 'Activar'}
        </ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onDelete(user);
          onClose();
        }}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Eliminar</ListItemText>
      </MenuItem>
    </Menu>
  );
};

// Componente para skeleton de carga
const TableSkeleton: React.FC = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton variant="circular" width={40} height={40} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="80%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="90%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="rectangular" width={80} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="rectangular" width={70} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="70%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="circular" width={32} height={32} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

/**
 * Componente principal de lista de usuarios
 */
const UsersList: React.FC<UsersListProps> = ({
  onUserSelect,
  onUserEdit,
  onUserCreate,
  selectable = false,
}) => {
  // Estado del hook de datos
  const [state, actions] = useApiData<User>(usersService, {
    page: 1,
    limit: 10,
    autoLoad: true,
  });

  // Estado local del componente
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive' | 'suspended'>('');

  // Estado para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estado para diálogo de confirmación
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  /**
   * Maneja la búsqueda con debounce
   */
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      const filters: UserFilters = {
        Search: term || undefined,
        RoleId: roleFilter || undefined,
        Status: statusFilter || undefined,
      };
      actions.setFilters(filters);
    },
    [roleFilter, statusFilter, actions]
  );

  /**
   * Maneja el filtro por rol
   */
  const handleRoleFilter = useCallback(
    (event: SelectChangeEvent<string>) => {
      const role = event.target.value as string;
      setRoleFilter(role);
      const filters: UserFilters = {
        Search: searchTerm || undefined,
        RoleId: role || undefined,
        Status: statusFilter || undefined,
      };
      actions.setFilters(filters);
    },
    [searchTerm, statusFilter, actions]
  );

  /**
   * Maneja el filtro por estado
   */
  const handleStatusFilter = useCallback(
    (event: SelectChangeEvent<string>) => {
      const status = event.target.value as '' | 'active' | 'inactive' | 'suspended';
      setStatusFilter(status);
      const filters: UserFilters = {
        Search: searchTerm || undefined,
        RoleId: roleFilter || undefined,
        Status: status || undefined,
      };
      actions.setFilters(filters);
    },
    [searchTerm, roleFilter, actions]
  );

  /**
   * Maneja el cambio de página
   */
  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      actions.setPage(newPage + 1); // MUI usa base 0, API usa base 1
    },
    [actions]
  );

  /**
   * Maneja el cambio de filas por página
   */
  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      actions.setLimit(parseInt(event.target.value, 10));
    },
    [actions]
  );

  /**
   * Abre el menú de acciones
   */
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  /**
   * Cierra el menú de acciones
   */
  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedUser(null);
  }, []);

  /**
   * Maneja la visualización de un usuario
   */
  const handleView = useCallback(
    (user: User) => {
      if (onUserSelect) {
        onUserSelect(user);
      }
      // Aquí podrías abrir un modal de detalles
      console.log('Ver usuario:', user);
    },
    [onUserSelect]
  );

  /**
   * Maneja la edición de un usuario
   */
  const handleEdit = useCallback(
    (user: User) => {
      if (onUserEdit) {
        onUserEdit(user);
      }
      // Aquí podrías abrir un modal de edición
      console.log('Editar usuario:', user);
    },
    [onUserEdit]
  );

  /**
   * Maneja el cambio de estado de un usuario
   */
  const handleToggleStatus = useCallback(
    async (user: User) => {
      const newStatus: User['status'] = !(user.status ?? false);
      await actions.updateItem(user.id, { status: newStatus });
    },
    [actions]
  );

  /**
   * Abre el diálogo de confirmación de eliminación
   */
  const handleDeleteClick = useCallback((user: User) => {
    setDeleteDialog({ open: true, user });
  }, []);

  /**
   * Confirma la eliminación
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.user) {
      await actions.deleteItem(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
    }
  }, [deleteDialog.user, actions]);

  /**
   * Cancela la eliminación
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, user: null });
  }, []);

  /**
   * Maneja la creación de un nuevo usuario
   */
  const handleCreate = useCallback(() => {
    if (onUserCreate) {
      onUserCreate();
    }
    // Aquí podrías abrir un modal de creación
    console.log('Crear nuevo usuario');
  }, [onUserCreate]);

  /**
   * Maneja el refrescado de datos
   */
  const handleRefresh = useCallback(() => {
    actions.refreshData();
  }, [actions]);

  /**
   * Genera el avatar del usuario
   */
  const getUserAvatar = useCallback((user: User) => {
    if (user.image) {
      return <Avatar src={user.image} alt={user.name} />;
    }
    const initials = user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return <Avatar>{initials}</Avatar>;
  }, []);

  return (
    <PageContainer
      title="Gestión de Usuarios"
      subtitle="Administra los usuarios del sistema Platform"
    >
      {/* Barra de herramientas */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Búsqueda */}
        <TextField
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        {/* Filtro por rol */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Rol</InputLabel>
          <Select value={roleFilter} label="Rol" onChange={handleRoleFilter}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
            <MenuItem value="employee">Empleado</MenuItem>
            <MenuItem value="advisor">Asesor</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro por estado */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={statusFilter} label="Estado" onChange={handleStatusFilter}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
            <MenuItem value="suspended">Suspendido</MenuItem>
          </Select>
        </FormControl>

        {/* Botón refrescar */}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={state.loading}
          sx={{ ml: 'auto' }}
        >
          Refrescar
        </Button>

        {/* Botón crear */}
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </Box>

      {/* Mensaje de error */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={actions.clearError}>
          {state.error.message}
        </Alert>
      )}

      {/* Tabla de usuarios */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {state.loading ? (
                <TableSkeleton />
              ) : state.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                state.data.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                    onClick={selectable ? () => onUserSelect?.(user) : undefined}
                  >
                    <TableCell align="center">{getUserAvatar(user)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {user.name}
                      </Typography>
                      {user.userTypeName && (
                        <Typography variant="caption" color="text.secondary">
                          {user.userTypeName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.firstRoleName || 'Sin rol'}
                        color={roleColors[user.firstRoleName || 'default']}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={toStatusKey(user.status)}
                        color={statusColors[toStatusKey(user.status)]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.userTypeName || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Más acciones">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, user);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={state.pagination.total}
          rowsPerPage={state.pagination.limit}
          page={state.pagination.page - 1} // MUI usa base 0
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Menú de acciones */}
      {selectedUser && (
        <TableRowMenu
          user={selectedUser}
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{deleteDialog.user?.name}</strong>?
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={state.loading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default UsersList;
