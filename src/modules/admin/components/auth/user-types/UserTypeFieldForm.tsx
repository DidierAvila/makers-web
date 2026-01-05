'use client';

import {
  CreateUserTypeFieldDto,
  FieldOption,
  FieldType,
  FieldValidation,
  UpdateUserTypeFieldDto,
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
  Divider,
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

interface UserTypeFieldFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (fieldData: CreateUserTypeFieldDto | UpdateUserTypeFieldDto) => Promise<void>;
  userTypeId: string;
  userTypeName?: string;
  initialData?: UpdateUserTypeFieldDto;
  mode: 'create' | 'edit';
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

export const UserTypeFieldForm: React.FC<UserTypeFieldFormProps> = ({
  open,
  onClose,
  onSave,
  userTypeId,
  userTypeName,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateUserTypeFieldDto | UpdateUserTypeFieldDto>(() => ({
    ...(mode === 'edit' && initialData ? initialData : {}),
    userTypeId,
    name: initialData?.name || '',
    label: initialData?.label || '',
    description: initialData?.description || '',
    type: initialData?.type || 'text',
    validation: {
      required: false,
      ...initialData?.validation,
    },
    options: initialData?.options || [],
    defaultValue: initialData?.defaultValue || '',
    placeholder: initialData?.placeholder || '',
    isInheritable: initialData?.isInheritable ?? true,
    order: initialData?.order || 0,
    metadata: initialData?.metadata || {},
    isActive: initialData?.isActive ?? true,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formulario cuando cambien los datos iniciales
  useEffect(() => {
    if (open) {
      setFormData({
        ...(mode === 'edit' && initialData ? initialData : {}),
        userTypeId,
        name: initialData?.name || '',
        label: initialData?.label || '',
        description: initialData?.description || '',
        type: initialData?.type || 'text',
        validation: {
          required: false,
          ...initialData?.validation,
        },
        options: initialData?.options || [],
        defaultValue: initialData?.defaultValue || '',
        placeholder: initialData?.placeholder || '',
        isInheritable: initialData?.isInheritable ?? true,
        order: initialData?.order || 0,
        metadata: initialData?.metadata || {},
        isActive: initialData?.isActive ?? true,
      });
      setErrors({});
    }
  }, [initialData, mode, open, userTypeId]);

  const selectedFieldType = FIELD_TYPES.find((ft) => ft.value === formData.type);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
      newErrors.name =
        'El nombre debe ser un identificador válido (solo letras, números y guiones bajos)';
    }

    if (!formData.label?.trim()) {
      newErrors.label = 'La etiqueta es requerida';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de campo es requerido';
    }

    // Validar opciones para campos que las necesitan
    if (selectedFieldType?.needsOptions && (!formData.options || formData.options.length === 0)) {
      newErrors.options = 'Este tipo de campo requiere al menos una opción';
    }

    // Validar rangos numéricos
    if (formData.validation?.min !== undefined && formData.validation?.max !== undefined) {
      if (formData.validation.min >= formData.validation.max) {
        newErrors.validation = 'El valor mínimo debe ser menor que el máximo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleValidationChange = (field: keyof FieldValidation, value: any) => {
    setFormData((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: value,
      },
    }));
  };

  const handleAddOption = () => {
    const newOption: FieldOption = {
      value: '',
      label: '',
      disabled: false,
    };

    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleOptionChange = (index: number, field: keyof FieldOption, value: any) => {
    setFormData((prev) => ({
      ...prev,
      options:
        prev.options?.map((option, i) => (i === index ? { ...option, [field]: value } : option)) ||
        [],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{mode === 'create' ? 'Crear Campo' : 'Editar Campo'}</Typography>
          <Chip
            label={userTypeName || userTypeId}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {mode === 'create'
            ? 'Configure un nuevo campo dinámico para este tipo de usuario'
            : 'Modifique la configuración del campo dinámico'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Información básica */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Información Básica
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Nombre técnico *"
                value={formData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={
                  errors.name || 'Identificador único del campo (no se puede cambiar después)'
                }
                disabled={mode === 'edit'} // No permitir cambiar nombre en edición
                placeholder="ej: numero_identificacion"
              />

              <TextField
                fullWidth
                label="Etiqueta visible *"
                value={formData.label || ''}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                error={!!errors.label}
                helperText={errors.label || 'Texto que verán los usuarios'}
                placeholder="ej: Número de Identificación"
              />

              <TextField
                fullWidth
                label="Descripción"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                multiline
                rows={2}
                helperText="Información adicional para ayudar al usuario"
                placeholder="ej: Ingrese su número de cédula o NIT"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.validation?.required || false}
                    onChange={(e) => handleValidationChange('required', e.target.checked)}
                  />
                }
                label="Campo requerido"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Tipo de campo */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tipo de Campo
            </Typography>

            <FormControl fullWidth error={!!errors.type}>
              <Select
                value={formData.type || ''}
                onChange={(e) => handleFieldChange('type', e.target.value as FieldType)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Seleccionar tipo...</em>
                </MenuItem>
                {FIELD_TYPES.map((fieldType) => (
                  <MenuItem key={fieldType.value} value={fieldType.value}>
                    <Box>
                      <Typography>{fieldType.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fieldType.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error">
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            {selectedFieldType && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>{selectedFieldType.label}:</strong> {selectedFieldType.description}
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Opciones para campos de selección */}
          {selectedFieldType?.needsOptions && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Opciones de Selección
                  <Chip label={formData.options?.length || 0} size="small" sx={{ ml: 1 }} />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {formData.options?.map((option, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Valor"
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        label="Etiqueta"
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        sx={{ flex: 2 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!option.disabled}
                            onChange={(e) =>
                              handleOptionChange(index, 'disabled', !e.target.checked)
                            }
                            size="small"
                          />
                        }
                        label="Activa"
                        sx={{ flexShrink: 0 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
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

          {/* Validación para números */}
          {formData.type === 'number' && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Validación Numérica</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      type="number"
                      label="Valor mínimo"
                      value={formData.validation?.min || ''}
                      onChange={(e) =>
                        handleValidationChange('min', Number(e.target.value) || undefined)
                      }
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      type="number"
                      label="Valor máximo"
                      value={formData.validation?.max || ''}
                      onChange={(e) =>
                        handleValidationChange('max', Number(e.target.value) || undefined)
                      }
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {errors.validation && <Alert severity="error">{errors.validation}</Alert>}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Configuración adicional */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Configuración Adicional</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Valor por defecto"
                  value={formData.defaultValue || ''}
                  onChange={(e) => handleFieldChange('defaultValue', e.target.value)}
                  helperText="Valor inicial del campo"
                />

                <TextField
                  fullWidth
                  label="Texto de ayuda (placeholder)"
                  value={formData.placeholder || ''}
                  onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                  helperText="Texto que aparece cuando el campo está vacío"
                />

                <TextField
                  type="number"
                  label="Orden de visualización"
                  value={formData.order || 0}
                  onChange={(e) => handleFieldChange('order', Number(e.target.value))}
                  helperText="Los campos se ordenan de menor a mayor"
                />

                {mode === 'edit' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive ?? true}
                        onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                      />
                    }
                    label="Campo activo"
                  />
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : mode === 'create' ? 'Crear Campo' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
