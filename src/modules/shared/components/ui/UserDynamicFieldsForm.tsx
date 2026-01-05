'use client';

import { useDynamicFields } from '@/modules/shared/hooks';
import { DynamicFieldsRenderConfig } from '@/modules/shared/types/dynamic-fields';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { DynamicForm } from './DynamicForm';

interface UserDynamicFieldsFormProps {
  userId: string;
  userTypeId?: string;
  title?: string;
  subtitle?: string;
  config?: Partial<DynamicFieldsRenderConfig>;
  showSaveButton?: boolean;
  showRefreshButton?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onSave?: () => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  showFieldMetadata?: boolean;
  className?: string;
}

/**
 * Componente integrado para mostrar y editar campos dinámicos de un usuario
 * Versión simplificada para la integración inicial
 */
export const UserDynamicFieldsForm: React.FC<UserDynamicFieldsFormProps> = ({
  userId,
  userTypeId,
  title = 'Información Adicional',
  subtitle,
  config,
  showSaveButton = true,
  showRefreshButton = true,
  autoSave = false,
  autoSaveDelay = 2000,
  onSave,
  onError,
  readOnly = false,
  showFieldMetadata = false,
  className,
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Verificar que tenemos los IDs necesarios
  const shouldLoadData = Boolean(userTypeId && userId);

  const {
    combinedFields,
    fieldValues,
    isLoading,
    error,
    saveValues,
    validateField,
    validateAll,
    refresh,
  } = useDynamicFields(
    shouldLoadData ? userTypeId : undefined,
    shouldLoadData ? userId : undefined
  );

  // Sincronizar valores locales con los cargados
  useEffect(() => {
    if (fieldValues && Object.keys(fieldValues).length > 0) {
      setLocalValues(fieldValues);
    }
  }, [fieldValues]);

  // Manejar cambios en campos
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setLocalValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setHasChanges(true);

      // Auto-save
      if (autoSave && !readOnly) {
        // Implementar debounce aquí si es necesario
        setTimeout(() => {
          saveValues({ [fieldName]: value });
        }, autoSaveDelay);
      }
    },
    [autoSave, autoSaveDelay, readOnly, saveValues]
  );

  // Guardar todos los valores
  const handleSave = useCallback(async () => {
    if (readOnly) return;

    try {
      // Validar antes de guardar
      const errors = validateAll(localValues);
      if (Object.keys(errors).length > 0) {
        onError?.('Por favor corrige los errores antes de guardar');
        return;
      }

      const success = await saveValues(localValues);
      if (success) {
        setHasChanges(false);
        onSave?.();
      } else {
        onError?.('Error al guardar los campos');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error al guardar');
    }
  }, [localValues, validateAll, saveValues, onSave, onError, readOnly]);

  // Refrescar datos
  const handleRefresh = useCallback(() => {
    refresh();
    setHasChanges(false);
  }, [refresh]);

  // Verificar parámetros requeridos
  if (!userTypeId || !userId) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Se requiere tanto un tipo de usuario como un usuario para mostrar los campos dinámicos.
      </Alert>
    );
  }

  if (isLoading && Object.keys(localValues).length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        {showRefreshButton && (
          <Button onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
            Reintentar
          </Button>
        )}
      </Alert>
    );
  }

  if (!combinedFields || combinedFields.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          No hay campos dinámicos configurados
        </Typography>
        <Typography variant="body2">
          No se encontraron campos dinámicos para el tipo de usuario <strong>{userTypeId}</strong>.
          <br />
          • Verifica que el tipo de usuario exista en el sistema
          <br />• Configura campos dinámicos para este tipo desde la gestión de tipos de usuario
        </Typography>
        {showRefreshButton && (
          <Button onClick={handleRefresh} size="small" sx={{ mt: 1 }}>
            <RefreshIcon sx={{ mr: 1 }} />
            Actualizar
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <Box className={className}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
      )}

      <DynamicForm
        fields={combinedFields}
        values={localValues}
        onChange={handleFieldChange}
        readOnly={readOnly}
        config={config}
        showFieldMetadata={showFieldMetadata}
      />

      {!readOnly && (showSaveButton || showRefreshButton) && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {showRefreshButton && (
            <Button onClick={handleRefresh} disabled={isLoading}>
              Actualizar
            </Button>
          )}
          {showSaveButton && (
            <Button onClick={handleSave} variant="contained" disabled={isLoading || !hasChanges}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </Box>
      )}

      {hasChanges && !autoSave && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Tienes cambios sin guardar
        </Alert>
      )}
    </Box>
  );
};
