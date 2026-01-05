'use client';

import {
  User as ServiceUser,
  UpdateUserData,
  usersService,
} from '@/modules/admin/services/usersService';
import { useApiAuth } from '@/modules/shared/hooks/useApiAuth';
import {
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  Email,
  FilterList,
  MoreVert,
  PersonAdd,
  Phone,
  Search,
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Paper,
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
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { UserFieldsManager } from './UserFieldsManager';

// Componente TabPanel para manejar contenido de tabs
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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Usar el tipo del servicio y mapear los estados
type User = ServiceUser & {
  company?: string;
  lastLogin?: string;
  role?: string; // Para mostrar el primer rol
  firstRoleName: string | null; // Nombre del primer rol del usuario
};

// Ya no necesitamos funciones de mapeo porque tanto frontend como backend usan boolean

interface UserFormData {
  name: string;
  email: string;
  password: string;
  image: string;
  phone: string;
  address: string;
  userTypeId: string;
  roleIds: string[];
  status: boolean; // true = Activo, false = Inactivo
  additionalData: {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  };
}

const UsersManagement: React.FC = () => {
  console.log('🚀 [USERS] Componente UsersManagement renderizado');

  // Hook para autenticación automática
  const authData = useApiAuth();
  const { enqueueSnackbar } = useSnackbar();
  console.log('🔐 [USERS] Estado de autenticación:', authData);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  // Estados para el diálogo con pestañas
  const [dialogTab, setDialogTab] = useState(0);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    image: '',
    phone: '',
    address: '',
    userTypeId: '',
    roleIds: [],
    status: true, // true = Activo
    additionalData: {
      additionalProp1: '',
      additionalProp2: '',
      additionalProp3: '',
    },
  });

  const [userTypes, setUserTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [userCreatedSuccessfully, setUserCreatedSuccessfully] = useState(false);
  const statuses = ['Activo', 'Inactivo'];

  // Cargar usuarios del backend
  useEffect(() => {
    loadUsers();
    loadRoles();
    loadUserTypes();
  }, []);

  // Recargar usuarios cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [searchTerm, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir filtros para la API
      const filters = {
        Search: searchTerm || undefined,
        Page: page,
        PageSize: rowsPerPage,
      };

      console.log('🔍 [USERS] Cargando usuarios con filtros:', filters);
      const response = await usersService.getAll(filters);
      console.log('📡 [USERS] Respuesta del backend:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('✅ [USERS] Datos recibidos:', response.data.length, 'usuarios');
        // Mapear usuarios del backend al formato del frontend
        const mappedUsers: User[] = response.data.map((user: ServiceUser) => ({
          ...user,
          company: user.userTypeName || '',
          role: user.firstRoleName || 'Sin rol',
          firstRoleName: user.firstRoleName || 'Sin rol',
          lastLogin: user.lastLogin || user.updatedAt,
        }));
        console.log('🔄 [USERS] Usuarios mapeados:', mappedUsers);
        setUsers(mappedUsers);
        setTotalUsers(response.totalRecords || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error('❌ [USERS] Error en respuesta:', response);
        setError('Error al cargar los usuarios');
      }
    } catch (err) {
      console.error('💥 [USERS] Error loading users:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      console.log('Cargando roles desde /Api/Auth/Roles/dropdown...');
      const response = await usersService.getRolesDropdown();

      // Verificar si la respuesta es un array directo o está envuelta en ApiResponse
      if (Array.isArray(response)) {
        console.log('Respuesta de roles (array directo):', response);
        setRoles(response);
      } else if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        (response as any).success &&
        (response as any).data
      ) {
        console.log('Respuesta de roles (ApiResponse):', (response as any).data);
        setRoles((response as any).data);
      } else {
        console.error('Formato de respuesta de roles no reconocido:', response);
        setRoles([]);
      }
    } catch (err) {
      console.error('Error en carga de roles:', err);
      setRoles([]);
    }
  };

  const loadUserTypes = async () => {
    try {
      console.log('🔍 [USERS] Cargando tipos de usuario desde dropdown endpoint');
      const response = await usersService.getUserTypesDropdown();
      console.log('📡 [USERS] Respuesta tipos de usuario:', response);

      // El endpoint /dropdown retorna directamente el array, no envuelto en ApiResponse
      if (Array.isArray(response) && response.length > 0) {
        console.log('✅ [USERS] Tipos de usuario cargados:', response.length, 'tipos');
        setUserTypes(response);
      } else if (response.success && response.data) {
        // Fallback por si viene envuelto en ApiResponse
        console.log(
          '✅ [USERS] Tipos de usuario cargados (ApiResponse):',
          response.data.length,
          'tipos'
        );
        setUserTypes(response.data);
      } else {
        console.error('❌ [USERS] Error en respuesta de tipos de usuario:', response);
        setError('Error al cargar los tipos de usuario');
      }
    } catch (err) {
      console.error('💥 [USERS] Error loading user types:', err);
      setError('Error al conectar con el servidor para tipos de usuario');
    }
  };

  const handleCreateUser = async () => {
    try {
      setError(null); // Limpiar errores previos

      // Validar campos requeridos
      if (!formData.name.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.email.trim()) {
        setError('El email es requerido');
        return;
      }
      if (!formData.userTypeId) {
        setError('El tipo de usuario es requerido');
        return;
      }
      if (!formData.roleIds || formData.roleIds.length === 0) {
        setError('Debe seleccionar al menos un rol');
        return;
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || 'temporal123', // Usar password del formulario o temporal
        image: formData.image || '',
        phone: formData.phone || '',
        userTypeId: formData.userTypeId,
        address: formData.address || '',
        additionalData: {
          additionalProp1: formData.additionalData.additionalProp1 || '',
          additionalProp2: formData.additionalData.additionalProp2 || '',
          additionalProp3: formData.additionalData.additionalProp3 || '',
        },
        roleIds: formData.roleIds,
      };

      const response = await usersService.create(userData);
      // Lógica mejorada para detectar éxito
      const isSuccess =
        response.success === true || (response.data && typeof response.data === 'object');

      console.log('🎯 [USERS] ¿Es exitoso?:', isSuccess);

      if (isSuccess) {
        console.log('✅ [USERS] Usuario creado exitosamente');
        setUserCreatedSuccessfully(true);
        setSearchTerm(formData.email.trim()); // Filtrar por el email del usuario creado
        await loadUsers(); // Recargar la lista
        setOpenDialog(false);
        // Opcional: mostrar mensaje de éxito
      } else {
        const errorMessage = response?.message || 'Error al crear el usuario';
        console.error('❌ [USERS] Error en creación:', errorMessage);
        console.error('❌ [USERS] Respuesta completa del error:', response);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('💥 [USERS] Error creating user:', err);
      console.error('💥 [USERS] Error completo:', JSON.stringify(err, null, 2));
      console.error('💥 [USERS] Error response:', err?.response);
      console.error('💥 [USERS] Error response data:', err?.response?.data);

      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error de conexión al crear el usuario';
      setError(errorMessage);
    }
  };

  const handleUpdateUser = async (): Promise<void> => {
    console.log('🔄 [UPDATE] Iniciando actualización de usuario');

    if (!selectedUser) {
      console.error('❌ [UPDATE] No hay usuario seleccionado para actualizar');
      setError('No hay usuario seleccionado para actualizar');
      return;
    }

    try {
      // Preparar datos para enviar al backend - solo incluir campos que no sean null/undefined
      const userData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        userTypeId: formData.userTypeId,
        roleIds: formData.roleIds,
        status: formData.status,
        phone: formData.phone,
        address: formData.address,
      };

      // Solo incluir image si existe y no es null/undefined - usar formData.image (valor actualizado)
      if (formData.image && formData.image.trim() !== '') {
        userData.image = formData.image;
      }

      // Solo incluir additionalData si existe
      if (selectedUser.additionalData) {
        userData.additionalData = selectedUser.additionalData;
      }

      // Llamar al servicio de actualización
      console.log('🚀 [UPDATE] Actualizando usuario:', selectedUser.id);

      try {
        const response = await usersService.update(selectedUser.id, userData);

        // Verificar si la respuesta es exitosa
        // El backend puede devolver:
        // 1. { success: true, data: {...} } - formato wrapper
        // 2. { id, email, ... } - objeto usuario directamente
        const hasData = response && response.data;
        const hasExplicitError =
          response &&
          (response.errors ||
            (response.message && response.message.toLowerCase().includes('error')));
        const isExplicitSuccess = response && response.success === true;
        const isDirectUserObject = false;

        if (
          isExplicitSuccess ||
          (hasData && !hasExplicitError) ||
          (isDirectUserObject && !hasExplicitError)
        ) {
          // Actualizar la lista de usuarios de forma segura para los tipos
          if (response.data) {
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === selectedUser.id
                  ? {
                      ...user,
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone || user.phone,
                      address: formData.address || user.address,
                      status: formData.status,
                      userTypeId: formData.userTypeId,
                      roleIds: formData.roleIds,
                      // Mantener el firstRoleName existente si no hay cambios
                      firstRoleName: user.firstRoleName,
                    }
                  : user
              )
            );
          }

          setOpenDialog(false);
          setSelectedUser(null);
          setError(null);

          // Mostrar mensaje de éxito
          enqueueSnackbar('Usuario actualizado correctamente', { variant: 'success' });
        } else {
          // Si el servidor no devolvió datos, simplemente cerramos el modal
          if (!response || (!response.data && !response.errors && !response.message)) {
            setOpenDialog(false);
            setSelectedUser(null);
            setError(null);
          } else {
            // Error en la actualización con mensaje específico
            const errorMessage = response?.errors?.[0] || response?.message || 'Error desconocido';
            console.error('❌ [UPDATE] Error en respuesta:', errorMessage);
            setError(`Error al actualizar el usuario: ${errorMessage}`);
          }
        }
      } catch (error: any) {
        console.error('❌ [UPDATE] Error durante la llamada:', error?.message);
        setError(`Error de conexión: ${error?.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('❌ [UPDATE] Error general:', error?.message);
      setError(`Error inesperado: ${error?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir diálogo de confirmación para eliminar usuario
   */
  const handleOpenDeleteDialog = () => {
    console.log('🔓 [DEBUG] Abriendo diálogo de eliminación para usuario:', selectedUser);
    setOpenDeleteDialog(true);
    // NO llamamos handleMenuClose() aquí para mantener selectedUser
    setAnchorEl(null); // Solo cerramos el menú, pero mantenemos selectedUser
  };

  /**
   * Cerrar diálogo de confirmación para eliminar usuario
   */
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null); // Limpiar selectedUser al cerrar el diálogo
  };

  /**
   * Manejar eliminación de usuario
   */
  const handleDeleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setError(null); // Limpiar errores previos
      setLoading(true); // Mostrar indicador de carga

      const response = await usersService.delete(selectedUser.id);

      // Verificar si la respuesta es exitosa o si no tiene una propiedad success (algunas APIs solo devuelven datos)
      if (response.success || !('success' in response)) {
        await loadUsers(); // Recargar la lista
        handleCloseDeleteDialog(); // Cerrar el diálogo de confirmación
        enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' });
      } else {
        const errorMessage = response.message || 'Error al eliminar el usuario';
        console.error('❌ [DELETE] Error:', errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error de conexión al eliminar el usuario';
      console.error('❌ [DELETE] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Manejador para cambio de tabs en el modal
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDialogTab(newValue);
  };

  const handleOpenDialog = async (mode: 'create' | 'edit' | 'view', user?: User) => {
    setDialogMode(mode);
    setFormErrors({}); // Limpiar errores de validación

    if (user) {
      if (mode === 'view') {
        // En modo 'view', obtener la información completa del usuario desde el backend
        try {
          console.log('🔍 [VIEW] Obteniendo información completa del usuario:', user.id);
          const response = await usersService.getById(user.id);
          console.log('📡 [VIEW] Respuesta del backend:', response);

          // Verificar si la respuesta es válida y tiene datos
          // El backend puede devolver los datos directamente o con wrapper success
          const userData = response?.data || response;
          if (
            userData &&
            typeof userData === 'object' &&
            Object.keys(userData).length > 0 &&
            userData.id
          ) {
            const fullUser = userData;
            console.log('✅ [VIEW] Usuario completo obtenido:', fullUser);

            // Extraer los IDs de los roles del usuario completo
            const userRoleIds = fullUser.roles ? fullUser.roles.map((role) => role.id) : [];
            console.log('🔍 [VIEW] Roles completos del usuario:', fullUser.roles);
            console.log('🔍 [VIEW] IDs de roles extraídos:', userRoleIds);

            setFormData({
              name: fullUser.name,
              email: fullUser.email,
              password: '', // No mostrar password en visualización
              image: fullUser.image || '',
              phone: fullUser.phone || '',
              address: fullUser.address || '',
              userTypeId: fullUser.userTypeId || '',
              roleIds: userRoleIds, // Cargar los roles reales del usuario completo
              status: typeof fullUser.status === 'boolean' ? fullUser.status : true,
              additionalData: {
                additionalProp1: '',
                additionalProp2: '',
                additionalProp3: '',
              },
            });
            setSelectedUser({
              ...fullUser,
              company: fullUser.userTypeName || '',
              role: fullUser.firstRoleName || 'Sin rol',
              firstRoleName: fullUser.firstRoleName || 'Sin rol',
              lastLogin: fullUser.lastLogin || fullUser.updatedAt,
            });
          } else {
            console.warn(
              '⚠️ [VIEW] Respuesta del servicio vacía o inválida, usando datos de la lista'
            );
            // Fallback a los datos del usuario de la lista
            const userRoleIds = user.roles ? user.roles.map((role) => role.id) : [];
            setFormData({
              name: user.name,
              email: user.email,
              password: '',
              image: user.image || '',
              phone: user.phone || '',
              address: user.address || '',
              userTypeId: user.userTypeId || '',
              roleIds: userRoleIds,
              status: user.status ?? false,
              additionalData: {
                additionalProp1: '',
                additionalProp2: '',
                additionalProp3: '',
              },
            });
            setSelectedUser(user);
          }
        } catch (error) {
          console.error('💥 [VIEW] Error al obtener usuario completo:', error);
          // Fallback a los datos del usuario de la lista
          const userRoleIds = user.roles ? user.roles.map((role) => role.id) : [];
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            image: user.image || '',
            phone: user.phone || '',
            address: user.address || '',
            userTypeId: user.userTypeId || '',
            roleIds: userRoleIds,
            status: typeof user.status === 'boolean' ? user.status : true,
            additionalData: {
              additionalProp1: '',
              additionalProp2: '',
              additionalProp3: '',
            },
          });
          setSelectedUser(user);
        }
      } else if (mode === 'edit') {
        // En modo 'edit', obtener la información completa del usuario desde el backend
        try {
          console.log('🔍 [EDIT] Obteniendo información completa del usuario:', user.id);
          const response = await usersService.getById(user.id);
          console.log('📡 [EDIT] Respuesta del backend:', response);

          // Verificar si la respuesta es válida y tiene datos
          // El backend puede devolver los datos directamente o con wrapper success
          const userData = response?.data || response;
          if (
            userData &&
            typeof userData === 'object' &&
            Object.keys(userData).length > 0 &&
            userData.id
          ) {
            const fullUser = userData;
            console.log('✅ [EDIT] Usuario completo obtenido:', fullUser);

            // Extraer los IDs de los roles del usuario completo
            const userRoleIds = fullUser.roles ? fullUser.roles.map((role) => role.id) : [];
            console.log('🔍 [EDIT] Roles completos del usuario:', fullUser.roles);
            console.log('🔍 [EDIT] IDs de roles extraídos:', userRoleIds);

            setFormData({
              name: fullUser.name,
              email: fullUser.email,
              password: '', // No mostrar password en edición
              image: fullUser.image || '',
              phone: fullUser.phone || '',
              address: fullUser.address || '',
              userTypeId: fullUser.userTypeId || '',
              roleIds: userRoleIds, // Cargar los roles reales del usuario completo
              status: typeof fullUser.status === 'boolean' ? fullUser.status : true,
              additionalData: {
                additionalProp1: '',
                additionalProp2: '',
                additionalProp3: '',
              },
            });
            setSelectedUser({
              ...fullUser,
              company: fullUser.userTypeName || '',
              role: fullUser.firstRoleName || 'Sin rol',
              firstRoleName: fullUser.firstRoleName || 'Sin rol',
              lastLogin: fullUser.lastLogin || fullUser.updatedAt,
            });
          } else {
            console.warn(
              '⚠️ [EDIT] Respuesta del servicio vacía o inválida, usando datos de la lista'
            );
            // Fallback a los datos del usuario de la lista
            const userRoleIds = user.roles ? user.roles.map((role) => role.id) : [];
            setFormData({
              name: user.name,
              email: user.email,
              password: '',
              image: user.image || '',
              phone: user.phone || '',
              address: user.address || '',
              userTypeId: user.userTypeId || '',
              roleIds: userRoleIds,
              status: user.status ?? false,
              additionalData: {
                additionalProp1: '',
                additionalProp2: '',
                additionalProp3: '',
              },
            });
            setSelectedUser(user);
          }
        } catch (error) {
          console.error('💥 [EDIT] Error al obtener usuario completo:', error);
          // Fallback a los datos del usuario de la lista
          const userRoleIds = user.roles ? user.roles.map((role) => role.id) : [];
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            image: user.image || '',
            phone: user.phone || '',
            address: user.address || '',
            userTypeId: user.userTypeId || '',
            roleIds: userRoleIds,
            status: typeof user.status === 'boolean' ? user.status : true,
            additionalData: {
              additionalProp1: '',
              additionalProp2: '',
              additionalProp3: '',
            },
          });
          setSelectedUser(user);
        }
      }
    } else {
      // Modo 'create'
      setFormData({
        name: '',
        email: '',
        password: '',
        image: '',
        phone: '',
        address: '',
        userTypeId: '',
        roleIds: [],
        status: true, // true = Activo por defecto
        additionalData: {
          additionalProp1: '',
          additionalProp2: '',
          additionalProp3: '',
        },
      });
    }
    setDialogTab(0); // Reset to first tab
    setOpenDialog(true);
    setAnchorEl(null); // Solo cerrar el menú, no limpiar selectedUser
  };

  const handleCloseDialog = () => {
    // Si no se creó un usuario exitosamente, limpiar el filtro de búsqueda
    if (!userCreatedSuccessfully) {
      setSearchTerm('');
    }

    setOpenDialog(false);
    setSelectedUser(null);
    setUserCreatedSuccessfully(false); // Resetear el estado para la próxima vez
    setDialogTab(0); // Reset to first tab
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    if (!formData.userTypeId) {
      errors.userTypeId = 'El tipo de usuario es requerido';
    }

    if (formData.roleIds.length === 0) {
      errors.roleIds = 'Debe seleccionar al menos un rol';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ [SAVE] Validación falló, no se procede con el guardado');
      return;
    }

    console.log('✅ [SAVE] Validación exitosa, procediendo con el guardado...');

    if (dialogMode === 'create') {
      console.log('🆕 [SAVE] Ejecutando creación de usuario...');
      await handleCreateUser();
    } else if (dialogMode === 'edit') {
      console.log('✏️ [SAVE] Ejecutando actualización de usuario...');
      await handleUpdateUser();
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'success' : 'error';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle /> : <Cancel />;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activo' && user.status) ||
      (statusFilter === 'Inactivo' && !user.status);
    const matchesRole = roleFilter === 'Todos' || user.firstRoleName === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog('create')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Gestiona los usuarios del sistema, sus roles y permisos de acceso.
      </Alert>

      {/* Mostrar errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios..."
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
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rol"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('Todos');
                  setRoleFilter('Todos');
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Tipo de Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Rol Principal</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Dirección</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Fechas</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Cargando usuarios...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&:nth-of-type(odd)': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={user.image && user.image.trim() !== '' ? user.image : undefined}
                          sx={{
                            mr: 2,
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                        {user.phone && (
                          <Box display="flex" alignItems="center">
                            <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{user.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={user.userTypeName}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={
                          user.firstRoleName ||
                          (user.roles && user.roles.length > 0 ? user.roles[0].name : 'Sin rol')
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        {user.address || 'No especificada'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={(user.status ?? false) ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={getStatusColor(user.status ?? false) as any}
                        icon={getStatusIcon(user.status ?? false)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Creado:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                        {user.updatedAt && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            <strong>Actualizado:</strong>{' '}
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Tooltip title="Más opciones">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, user)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                            },
                          }}
                        >
                          <MoreVert />
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
        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={Math.ceil(filteredUsers.length / rowsPerPage)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog('view', selectedUser!)}>
          <Visibility sx={{ mr: 1 }} /> Ver Detalles
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('edit', selectedUser!)}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>

        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar/ver usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Nuevo Usuario'}
          {dialogMode === 'edit' && 'Editar Usuario'}
          {dialogMode === 'view' && 'Detalles del Usuario'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={dialogTab} onChange={handleTabChange} aria-label="user configuration tabs">
              <Tab label="Información General" />
              <Tab label="Campos Dinámicos" disabled={dialogMode === 'create'} />
            </Tabs>
          </Box>

          <TabPanel value={dialogTab} index={0}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={dialogMode === 'view'}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={dialogMode === 'view'}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: 'new-password', // Truco para deshabilitar autocompletado
                  }}
                />
              </Grid>
              {dialogMode === 'create' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!formErrors.password}
                    helperText={formErrors.password || 'Mínimo 6 caracteres'}
                    autoComplete="new-password"
                    inputProps={{
                      autoComplete: 'new-password',
                    }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="URL de Imagen"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  disabled={dialogMode === 'view'}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  disabled={dialogMode === 'view'}
                  error={!!formErrors.userTypeId}
                >
                  <InputLabel>Tipo de Usuario</InputLabel>
                  <Select
                    value={formData.userTypeId}
                    label="Tipo de Usuario"
                    onChange={(e) => setFormData({ ...formData, userTypeId: e.target.value })}
                  >
                    {userTypes.map((userType) => (
                      <MenuItem key={userType.id} value={userType.id}>
                        {userType.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.userTypeId && (
                    <FormHelperText>{formErrors.userTypeId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {dialogMode === 'view' ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Roles
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.roleIds.length > 0 ? (
                        formData.roleIds.map((roleId) => {
                          const role = roles.find((r) => r.id === roleId);
                          return role ? (
                            <Chip
                              key={roleId}
                              label={role.name}
                              variant="outlined"
                              size="small"
                              color="primary"
                            />
                          ) : null;
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Sin roles asignados
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <FormControl fullWidth error={!!formErrors.roleIds}>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={formData.roleIds}
                      label="Roles"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roleIds:
                            typeof e.target.value === 'string'
                              ? e.target.value.split(',')
                              : e.target.value,
                        })
                      }
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.roleIds && <FormHelperText>{formErrors.roleIds}</FormHelperText>}
                  </FormControl>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    Estado del Usuario
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.status}
                          onChange={(e) => {
                            if (dialogMode !== 'view') {
                              setFormData({ ...formData, status: e.target.checked });
                            }
                          }}
                          disabled={dialogMode === 'view'}
                          color="success"
                        />
                      }
                      label=""
                    />
                    <Chip
                      label={formData.status ? 'Activo' : 'Inactivo'}
                      color={formData.status ? 'success' : 'error'}
                      variant="filled"
                      icon={formData.status ? <CheckCircle /> : <Cancel />}
                      sx={{
                        fontWeight: 'medium',
                        opacity: dialogMode === 'view' ? 0.7 : 1,
                      }}
                    />
                  </Box>
                  {dialogMode !== 'view' && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Usa el interruptor para cambiar entre Activo e Inactivo
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={dialogTab} index={1}>
            {selectedUser && <UserFieldsManager userId={selectedUser.id} />}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={() => {
                console.log('🖱️ [BUTTON] Botón Guardar clickeado!');
                console.log('🖱️ [BUTTON] Modo actual:', dialogMode);
                handleSaveUser();
              }}
              variant="contained"
            >
              {dialogMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Confirmar eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro que desea eliminar al usuario <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error">
            Esta acción no se puede deshacer y eliminará permanentemente todos los datos del
            usuario.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              console.log('🖱️ [DEBUG] Botón Eliminar clickeado - evento onClick ejecutado');
              handleDeleteUser();
            }}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading ? 'Eliminando...' : 'Eliminar Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;
