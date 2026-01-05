'use client';

import {
  DynamicFieldDefinition,
  DynamicFieldsRenderConfig,
  FieldSection,
} from '@/modules/shared/types/dynamic-fields';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface DynamicFormProps {
  fields: DynamicFieldDefinition[];
  values: Record<string, any>;
  validationErrors?: Record<string, string[]>;
  onChange?: (fieldName: string, value: any) => void;
  onSave?: () => Promise<void>;
  onRefresh?: () => void;
  config?: Partial<DynamicFieldsRenderConfig>;
  title?: string;
  subtitle?: string;
  showSaveButton?: boolean;
  showRefreshButton?: boolean;
  isLoading?: boolean;
  isUpdating?: boolean;
  isDirty?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  showFieldMetadata?: boolean;
  className?: string;
}

/**
 * Componente para renderizar un formulario dinámico completo
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  values,
  validationErrors = {},
  onChange,
  onSave,
  onRefresh,
  config,
  title,
  subtitle,
  showSaveButton = true,
  showRefreshButton = false,
  isLoading = false,
  isUpdating = false,
  isDirty = false,
  disabled = false,
  readOnly = false,
  showFieldMetadata = false,
  className,
}) => {
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [showInactiveFields, setShowInactiveFields] = useState(false);

  const renderConfig = {
    showDescription: true,
    showRequired: true,
    compactMode: false,
    readOnly: false,
    showFieldOrder: false,
    groupBySection: false,
    ...config?.renderConfig,
  };

  const theme = config?.theme || 'default';

  // Filtrar campos según configuración
  const visibleFields = fields.filter((field) => {
    // Mostrar solo campos activos por defecto
    if (!showInactiveFields && !field.isActive) return false;
    return true;
  });

  // Agrupar campos por secciones si está configurado
  const fieldSections = React.useMemo(() => {
    if (!renderConfig.groupBySection || !config?.sections) {
      return [
        {
          id: 'main',
          title: 'Campos',
          description: '',
          order: 0,
          isCollapsible: false,
          isExpanded: true,
          fields: visibleFields.map((f) => f.id),
        },
      ];
    }

    return config.sections.sort((a, b) => a.order - b.order);
  }, [renderConfig.groupBySection, config?.sections, visibleFields]);

  // Manejar expansión de secciones
  const handleSectionToggle = (sectionId: string) => {
    if (!renderConfig.groupBySection) return;

    setVisibleSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Inicializar estados de sección
  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    fieldSections.forEach((section) => {
      initialStates[section.id] = section.isExpanded;
    });
    setVisibleSections(initialStates);
  }, [fieldSections]);

  const renderFieldMetadata = (field: DynamicFieldDefinition) => {
    if (!showFieldMetadata) return null;

    const metadata = [];

    if (field.metadata?.isInherited) {
      metadata.push(
        <Chip key="inherited" label="Heredado" size="small" color="info" variant="outlined" />
      );
    }

    if (field.metadata?.isPersonalOverride) {
      metadata.push(
        <Chip
          key="override"
          label="Personalizado"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }

    if (field.metadata?.isPersonalField) {
      metadata.push(
        <Chip key="personal" label="Personal" size="small" color="success" variant="outlined" />
      );
    }

    if (metadata.length === 0) return null;

    return <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{metadata}</Box>;
  };

  const renderField = (field: DynamicFieldDefinition) => {
    const fieldValue = values[field.name];
    const fieldErrors = validationErrors[field.name];

    return (
      <Box key={field.id} sx={{ position: 'relative' }}>
        <DynamicFieldRenderer
          field={field}
          value={fieldValue}
          onChange={(value) => onChange?.(field.name, value)}
          error={fieldErrors}
          disabled={disabled || isUpdating}
          readOnly={readOnly || renderConfig.readOnly}
          showRequired={renderConfig.showRequired}
          showDescription={renderConfig.showDescription}
          variant="outlined"
          size={renderConfig.compactMode ? 'small' : 'medium'}
          compact={renderConfig.compactMode}
        />
        {renderFieldMetadata(field)}

        {renderConfig.showFieldOrder && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ position: 'absolute', top: -8, right: 8 }}
          >
            #{field.order}
          </Typography>
        )}
      </Box>
    );
  };

  const renderSection = (section: FieldSection) => {
    const sectionFields = visibleFields.filter((field) => section.fields.includes(field.id));

    if (sectionFields.length === 0) return null;

    const isExpanded = visibleSections[section.id] ?? section.isExpanded;

    if (!section.isCollapsible) {
      return (
        <Box key={section.id} sx={{ mb: 3 }}>
          {section.title !== 'Campos' && (
            <>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              {section.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {section.description}
                </Typography>
              )}
            </>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: renderConfig.compactMode ? 1 : 2,
            }}
          >
            {sectionFields.map((field) => renderField(field))}
          </Box>
        </Box>
      );
    }

    return (
      <Accordion
        key={section.id}
        expanded={isExpanded}
        onChange={() => handleSectionToggle(section.id)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{section.title}</Typography>
            <Chip label={sectionFields.length} size="small" color="primary" variant="outlined" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {section.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {section.description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: renderConfig.compactMode ? 1 : 2,
            }}
          >
            {sectionFields.map((field) => renderField(field))}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const hasErrors = Object.keys(validationErrors).some((key) => validationErrors[key]?.length > 0);

  const inactiveFieldsCount = fields.filter((f) => !f.isActive).length;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Cargando campos...</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={theme === 'cards' ? 2 : 0}
      sx={{ p: theme === 'compact' ? 2 : 3 }}
      className={className}
    >
      {/* Header */}
      {(title || subtitle) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {visibleFields.length} campos visibles
          </Typography>

          {inactiveFieldsCount > 0 && (
            <Tooltip
              title={showInactiveFields ? 'Ocultar campos inactivos' : 'Mostrar campos inactivos'}
            >
              <IconButton size="small" onClick={() => setShowInactiveFields(!showInactiveFields)}>
                {showInactiveFields ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>
          )}

          {inactiveFieldsCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({inactiveFieldsCount} inactivos)
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          {showRefreshButton && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={isUpdating}
            >
              Actualizar
            </Button>
          )}
        </Stack>
      </Box>

      {/* Validation Errors */}
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Se encontraron errores de validación:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(validationErrors).map(([fieldName, errors]) => {
              if (!errors?.length) return null;
              const field = fields.find((f) => f.name === fieldName);
              return (
                <li key={fieldName}>
                  <strong>{field?.label || fieldName}:</strong> {errors.join(', ')}
                </li>
              );
            })}
          </ul>
        </Alert>
      )}

      {/* Fields */}
      {visibleFields.length === 0 ? (
        <Alert severity="info">No hay campos configurados para mostrar.</Alert>
      ) : (
        fieldSections.map((section) => renderSection(section))
      )}

      {/* Actions */}
      {showSaveButton && onSave && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={!isDirty || isUpdating || hasErrors || readOnly}
              sx={{ minWidth: 120 }}
            >
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};
