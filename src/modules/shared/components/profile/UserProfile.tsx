'use client';

import { UserFieldsService } from '@/modules/admin/services/UserFieldsService';
import { usersService } from '@/modules/admin/services/usersService';
import { useEnhancedUser } from '@/modules/shared/hooks/useEnhancedUser';
import { AuthPermissionService } from '@/modules/shared/services/authService';
import { UserField } from '@/modules/shared/types/dynamic-fields';
import {
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  userTypeId: string;
  userTypeName?: string;
  roles?: Array<{ id: string; name: string }>;
  status?: boolean;
  createdAt?: string;
  additionalData?: any;
}

export const UserProfile: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useEnhancedUser();
  const { enqueueSnackbar } = useSnackbar();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para campos dinámicos
  const [dynamicFields, setDynamicFields] = useState<UserField[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    image: '',
  });

  // Cargar datos del usuario
  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await usersService.getById(user.id);
      const userDataResponse = response?.data || response;

      if (userDataResponse && userDataResponse.id) {
        const userData: UserData = {
          ...userDataResponse,
          status: userDataResponse.status ?? true,
        };
        setUserData(userData);
        setFormData({
          name: userDataResponse.name || '',
          phone: userDataResponse.phone || '',
          address: userDataResponse.address || '',
          image: userDataResponse.image || '',
        });

        // Cargar campos dinámicos pasando los additionalData
        await loadDynamicFields(userDataResponse.id, userDataResponse.additionalData);
      } else {
        throw new Error('No se pudieron cargar los datos del usuario');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar campos dinámicos
  const loadDynamicFields = async (userId: string, userAdditionalData?: Record<string, any>) => {
    try {
      const fields = await UserFieldsService.getUserFields(userId);
      setDynamicFields(fields);

      // Inicializar valores de los campos dinámicos usando los valores reales del usuario
      const initialValues: Record<string, any> = {};
      fields.forEach((field: UserField) => {
        // Buscar el valor real en additionalData usando el field.name
        const fieldValue = userAdditionalData?.[field.name];
        initialValues[field.id] = fieldValue !== undefined ? fieldValue : field.defaultValue || '';
      });
      setDynamicFieldValues(initialValues);
    } catch (err) {
      console.error('Error loading dynamic fields:', err);
      // No mostramos error ya que los campos dinámicos son opcionales
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!userData?.id) return;

    try {
      setSaving(true);

      // Preparar campos dinámicos para additionalData
      const dynamicFieldsData: Record<string, any> = {};
      dynamicFields.forEach((field) => {
        const fieldValue = dynamicFieldValues[field.id];
        if (fieldValue !== undefined) {
          dynamicFieldsData[field.name] = fieldValue;
        }
      });

      // Preparar datos para el nuevo endpoint /Api/Auth/me/update
      const updateData = {
        email: userData.email || '', // Mantener email existente
        name: formData.name || '',
        image: formData.image || '',
        phone: formData.phone || '',
        userTypeId: userData.userTypeId || '',
        address: formData.address || '',
        additionalData: {
          ...userData.additionalData,
          ...dynamicFieldsData,
        },
      };

      await AuthPermissionService.updateUserProfile(updateData);

      // Si llegamos aquí, la actualización fue exitosa
      await loadUserData(); // Recargar datos
      setEditMode(false);
      enqueueSnackbar('Perfil actualizado exitosamente', { variant: 'success' });
    } catch (err) {
      console.error('Error saving user data:', err);
      enqueueSnackbar('Error al guardar los cambios', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        image: userData.image || '',
      });

      // Resetear campos dinámicos a sus valores originales
      const resetValues: Record<string, any> = {};
      dynamicFields.forEach((field: UserField) => {
        resetValues[field.id] = field.defaultValue || '';
      });
      setDynamicFieldValues(resetValues);
    }
    setEditMode(false);
  };

  // Renderizar un campo dinámico como si fuera nativo
  const renderDynamicField = (field: UserField) => {
    const value = dynamicFieldValues[field.id] || '';
    const isDisabled = !editMode;

    const handleChange = (newValue: any) => {
      setDynamicFieldValues((prev) => ({
        ...prev,
        [field.id]: newValue,
      }));
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            multiline
            rows={3}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );

      case 'date':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        );

      case 'select':
        return (
          <TextField
            key={field.id}
            fullWidth
            select
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={field.label}
            sx={{ mb: 2, display: 'block' }}
          />
        );

      default:
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isDisabled}
            required={field.validation?.required}
            helperText={field.description}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!userData) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        No se pudieron cargar los datos del usuario
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>

      <Stack spacing={3}>
        {/* Información Personal */}
        <Card>
          <CardHeader
            avatar={
              <Avatar src={userData.image} sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            }
            title={<Typography variant="h5">{userData.name}</Typography>}
            subheader={
              <Box display="flex" gap={1} alignItems="center" mt={1}>
                <Chip
                  label={userData.status ? 'Activo' : 'Inactivo'}
                  color={userData.status ? 'success' : 'error'}
                  size="small"
                />
                {userData.userTypeName && (
                  <Chip label={userData.userTypeName} variant="outlined" size="small" />
                )}
              </Box>
            }
            action={
              <Stack direction="row" spacing={1}>
                {editMode ? (
                  <>
                    <IconButton onClick={handleCancel} disabled={saving}>
                      <CancelIcon />
                    </IconButton>
                    <IconButton onClick={handleSave} disabled={saving} color="primary">
                      {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={() => setEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                )}
              </Stack>
            }
          />
          <CardContent>
            <Stack spacing={3}>
              {/* Información Personal */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AccountCircleIcon color="primary" />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={saving}
                    />
                  ) : (
                    <TextField fullWidth label="Nombre completo" value={userData.name} disabled />
                  )}

                  <TextField
                    fullWidth
                    label="Email"
                    value={userData.email}
                    disabled
                    helperText="El email no se puede modificar"
                    InputProps={{
                      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Stack>
              </Box>

              {/* Información de Contacto */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PhoneIcon color="primary" />
                  Contacto y Ubicación
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={saving}
                      type="tel"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={userData.phone || 'No especificado'}
                      disabled
                    />
                  )}

                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={saving}
                      multiline
                      rows={2}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={userData.address || 'No especificada'}
                      disabled
                      multiline
                      rows={2}
                    />
                  )}

                  {/* Campos dinámicos integrados */}
                  {dynamicFields.map((field) => renderDynamicField(field))}
                </Stack>
              </Box>

              {/* Información del Sistema */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <BusinessIcon color="primary" />
                  Información del Sistema
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {userData.createdAt && (
                    <TextField
                      fullWidth
                      label="Fecha de registro"
                      value={new Date(userData.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      disabled
                    />
                  )}

                  {userData.roles && userData.roles.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Roles asignados:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {userData.roles.map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            variant="outlined"
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
