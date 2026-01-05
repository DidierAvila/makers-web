'use client';

import {
  CreateUserFieldDto,
  FieldOption,
  FieldType,
  UpdateUserFieldDto,
  UserField,
} from '@/modules/shared/types/dynamic-fields';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface UserFieldFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (fieldData: CreateUserFieldDto | UpdateUserFieldDto) => Promise<void>;
  field?: UserField | null;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

const FIELD_TYPES: {
  value: FieldType;
  label: string;
  description: string;
  needsOptions: boolean;
}[] = [
  { value: 'text', label: 'Texto', description: 'Campo de texto simple', needsOptions: false },
  {
    value: 'textarea',
    label: 'Área de texto',
    description: 'Campo de texto multilínea',
    needsOptions: false,
  },
  { value: 'number', label: 'Número', description: 'Campo numérico', needsOptions: false },
  {
    value: 'email',
    label: 'Email',
    description: 'Dirección de correo electrónico',
    needsOptions: false,
  },
  { value: 'phone', label: 'Teléfono', description: 'Número telefónico', needsOptions: false },
  { value: 'url', label: 'URL', description: 'Dirección web', needsOptions: false },
  { value: 'date', label: 'Fecha', description: 'Selector de fecha', needsOptions: false },
  {
    value: 'datetime',
    label: 'Fecha y Hora',
    description: 'Selector de fecha y hora',
    needsOptions: false,
  },
  {
    value: 'select',
    label: 'Selección única',
    description: 'Lista desplegable',
    needsOptions: true,
  },
  {
    value: 'multiselect',
    label: 'Selección múltiple',
    description: 'Lista de opciones múltiples',
    needsOptions: true,
  },
  {
    value: 'radio',
    label: 'Botones de opción',
    description: 'Selección única con botones',
    needsOptions: true,
  },
  {
    value: 'checkbox',
    label: 'Casilla de verificación',
    description: 'Verdadero/Falso',
    needsOptions: false,
  },
  { value: 'file', label: 'Archivo', description: 'Carga de archivos', needsOptions: false },
];

export const UserFieldForm: React.FC<UserFieldFormProps> = ({
  open,
  onClose,
  onSave,
  field,
  mode,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateUserFieldDto | UpdateUserFieldDto>(() => ({
    ...(mode === 'edit' && field ? { id: field.id } : {}),
    userId: field?.userId || '',
    name: field?.name || '',
    label: field?.label || '',
    description: field?.description || '',
    type: field?.type || 'text',
    validation: {
      required: false,
      ...field?.validation,
    },
    options: field?.options || [],
    defaultValue: field?.defaultValue || '',
    placeholder: field?.placeholder || '',
    isInheritable: field?.isInheritable ?? true,
    order: field?.order || 0,
    metadata: field?.metadata || {},
    isActive: field?.isActive ?? true,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formulario cuando cambie el campo
  useEffect(() => {
    if (open) {
      setFormData({
        ...(mode === 'edit' && field ? { id: field.id } : {}),
        userId: field?.userId || '',
        name: field?.name || '',
        label: field?.label || '',
        description: field?.description || '',
        type: field?.type || 'text',
        validation: {
          required: false,
          ...field?.validation,
        },
        options: field?.options || [],
        defaultValue: field?.defaultValue || '',
        placeholder: field?.placeholder || '',
        isInheritable: field?.isInheritable ?? true,
        order: field?.order || 0,
        metadata: field?.metadata || {},
        isActive: field?.isActive ?? true,
      });
      setErrors({});
    }
  }, [field, mode, open]);

  const selectedFieldType = FIELD_TYPES.find((ft) => ft.value === formData.type);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del campo es requerido';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name)) {
      newErrors.name =
        'El nombre debe comenzar con una letra y contener solo letras, números y guiones bajos';
    }

    if (!formData.label?.trim()) {
      newErrors.label = 'La etiqueta del campo es requerida';
    }

    if (selectedFieldType?.needsOptions && (!formData.options || formData.options.length === 0)) {
      newErrors.options = 'Este tipo de campo requiere al menos una opción';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar formulario
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  // Actualizar campo del formulario
  const updateField = <K extends keyof (CreateUserFieldDto | UpdateUserFieldDto)>(
    field: K,
    value: (CreateUserFieldDto | UpdateUserFieldDto)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  // Manejar cambio de tipo de campo
  const handleTypeChange = (newType: FieldType) => {
    const newFormData = { ...formData, type: newType };

    // Limpiar opciones si el nuevo tipo no las necesita
    const newFieldType = FIELD_TYPES.find((ft) => ft.value === newType);
    if (!newFieldType?.needsOptions) {
      newFormData.options = [];
    }

    setFormData(newFormData);
  };

  // Manejar opciones para campos de selección
  const handleOptionsChange = (options: FieldOption[]) => {
    updateField('options', options);
  };

  const addOption = () => {
    const newOptions = [...(formData.options || []), { value: '', label: '' }];
    handleOptionsChange(newOptions);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleOptionsChange(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_, i) => i !== index);
    handleOptionsChange(newOptions);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {mode === 'create' ? 'Crear Nuevo Campo' : 'Editar Campo'}
          </Typography>
          {field && <Chip label={field.type} size="small" variant="outlined" />}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pb: 2 }}>
        <Stack spacing={3}>
          {/* Información básica */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                Información Básica
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Nombre del Campo"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || 'Nombre técnico del campo (ej: telefono_contacto)'}
                  placeholder="telefono_contacto"
                  fullWidth
                  required
                />

                <TextField
                  label="Etiqueta"
                  value={formData.label || ''}
                  onChange={(e) => updateField('label', e.target.value)}
                  error={!!errors.label}
                  helperText={errors.label || 'Texto que verán los usuarios'}
                  placeholder="Teléfono de Contacto"
                  fullWidth
                  required
                />

                <TextField
                  label="Descripción"
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  helperText="Descripción opcional del campo"
                  placeholder="Número telefónico para contacto directo"
                  multiline
                  rows={2}
                  fullWidth
                />

                <FormControl fullWidth>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Tipo de Campo
                  </Typography>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as FieldType)}
                  >
                    {FIELD_TYPES.map((fieldType) => (
                      <MenuItem key={fieldType.value} value={fieldType.value}>
                        <Box>
                          <Typography variant="body1">{fieldType.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fieldType.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.validation?.required || false}
                      onChange={(e) =>
                        updateField('validation', {
                          ...formData.validation,
                          required: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Campo requerido"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Opciones para campos de selección */}
          {selectedFieldType?.needsOptions && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Opciones de Selección
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {formData.options?.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <TextField
                        label="Valor"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Etiqueta"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton onClick={() => removeOption(index)} color="error" size="small">
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={addOption}
                    variant="outlined"
                    size="small"
                  >
                    Agregar Opción
                  </Button>

                  {errors.options && <Alert severity="error">{errors.options}</Alert>}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Configuración adicional */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                Configuración Adicional
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Valor por Defecto"
                  value={formData.defaultValue || ''}
                  onChange={(e) => updateField('defaultValue', e.target.value)}
                  helperText="Valor inicial del campo"
                  fullWidth
                />

                <TextField
                  label="Placeholder"
                  value={formData.placeholder || ''}
                  onChange={(e) => updateField('placeholder', e.target.value)}
                  helperText="Texto de ayuda mostrado en el campo vacío"
                  fullWidth
                />

                <TextField
                  label="Orden"
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => updateField('order', parseInt(e.target.value) || 0)}
                  helperText="Orden de visualización del campo"
                  fullWidth
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive ?? true}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                    />
                  }
                  label="Campo activo"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isInheritable ?? true}
                      onChange={(e) => updateField('isInheritable', e.target.checked)}
                    />
                  }
                  label="Campo heredable"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isSaving || isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving || isLoading}>
          {isSaving ? 'Guardando...' : mode === 'create' ? 'Crear Campo' : 'Actualizar Campo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
