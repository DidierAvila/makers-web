'use client';

import { UserFieldsService } from '@/modules/admin/services/UserFieldsService';
import { UserField } from '@/modules/shared/types/dynamic-fields';
import {
  Cancel as CancelIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

interface UserDynamicFieldsProps {
  userId: string;
}

interface FieldValue {
  fieldId: string;
  value: any;
}

export const UserDynamicFields: React.FC<UserDynamicFieldsProps> = ({ userId }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [fields, setFields] = useState<UserField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar campos dinámicos del usuario
  const loadFields = async () => {
    try {
      setLoading(true);
      setError(null);

      const userFields = await UserFieldsService.getUserFields(userId);
      const activeFields = userFields.filter((field) => field.isActive);

      setFields(activeFields);

      // Inicializar valores de campos con valores por defecto
      const initialValues: Record<string, any> = {};
      activeFields.forEach((field) => {
        initialValues[field.id] = field.defaultValue || '';
      });
      setFieldValues(initialValues);
    } catch (err) {
      console.error('Error loading dynamic fields:', err);
      setError('Error al cargar los campos dinámicos');
    } finally {
      setLoading(false);
    }
  };

  // Guardar valores de campos dinámicos
  const handleSave = async () => {
    try {
      setSaving(true);

      // Aquí se implementaría la lógica para guardar los valores
      // Por ahora simulamos un guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEditMode(false);
      enqueueSnackbar('Campos dinámicos actualizados exitosamente', { variant: 'success' });
    } catch (err) {
      console.error('Error saving dynamic fields:', err);
      enqueueSnackbar('Error al guardar los campos dinámicos', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    // Restaurar valores originales
    const initialValues: Record<string, any> = {};
    fields.forEach((field) => {
      initialValues[field.id] = field.defaultValue || '';
    });
    setFieldValues(initialValues);
    setEditMode(false);
  };

  // Actualizar valor de un campo
  const updateFieldValue = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Renderizar campo según su tipo
  const renderField = (field: UserField) => {
    const value = fieldValues[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            placeholder={field.placeholder}
            helperText={field.description}
            required={field.validation?.required}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            placeholder={field.placeholder}
            helperText={field.description}
            required={field.validation?.required}
            multiline
            rows={3}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            placeholder={field.placeholder}
            helperText={field.description}
            required={field.validation?.required}
            type="number"
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            helperText={field.description}
            required={field.validation?.required}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'datetime':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            helperText={field.description}
            required={field.validation?.required}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'select':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.label} {field.validation?.required && '*'}
            </Typography>
            <Select
              fullWidth
              value={value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              disabled={!editMode}
              displayEmpty
            >
              <MenuItem value="">
                <em>{field.placeholder || 'Seleccionar...'}</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                disabled={!editMode}
              />
            }
            label={field.label}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={!editMode}
            placeholder={field.placeholder}
            helperText={field.description}
          />
        );
    }
  };

  useEffect(() => {
    if (userId) {
      loadFields();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Campos Dinámicos</Typography>
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
              <IconButton onClick={() => setEditMode(true)} disabled={fields.length === 0}>
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        }
      />
      <CardContent>
        {fields.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay campos dinámicos configurados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los campos dinámicos te permiten personalizar tu perfil con información adicional
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {fields.map((field) => (
              <Box key={field.id}>{renderField(field)}</Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
