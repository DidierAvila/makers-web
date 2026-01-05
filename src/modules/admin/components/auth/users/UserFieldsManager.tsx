'use client';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Alert,
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
  Divider,
  Fab,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { useUserFields } from '@/modules/shared/hooks/useUserFields';
import { UserField } from '@/modules/shared/types/dynamic-fields';
import { UserFieldForm } from './UserFieldForm';

interface UserFieldsManagerProps {
  userId: string;
}

export function UserFieldsManager({ userId }: UserFieldsManagerProps) {
  // Estados locales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<UserField | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<UserField | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; field: UserField } | null>(
    null
  );

  // Si no hay userId, mostrar mensaje informativo
  if (!userId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            Selecciona un usuario para gestionar sus campos dinámicos
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Hook para gestión de campos
  const {
    fields,
    activeFields,
    stats,
    config,
    isLoading,
    isUpdating,
    error,
    createField,
    updateField,
    deleteField,
    toggleFieldStatus,
    duplicateField,
    reorderFields,
    refresh,
    clearError,
  } = useUserFields(userId);

  // Campos a mostrar (activos o todos)
  const displayFields = showInactive ? fields : activeFields;

  // Manejo de formulario
  const handleOpenCreateForm = () => {
    setSelectedField(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (field: UserField) => {
    setSelectedField(field);
    setFormMode('edit');
    setIsFormOpen(true);
    setMenuAnchor(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedField(null);
  };

  const handleSaveField = async (fieldData: any) => {
    try {
      if (formMode === 'create') {
        await createField({ ...fieldData, userId });
      } else if (selectedField) {
        await updateField({ ...fieldData, id: selectedField.id });
      }
      handleCloseForm(); // Cerrar formulario después de guardar exitosamente
    } catch (error) {
      console.error('Error saving field:', error);
      // El error se maneja en el hook
    }
  };

  // Manejo de menú contextual
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, field: UserField) => {
    setMenuAnchor({ element: event.currentTarget, field });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Manejo de eliminación
  const handleDeleteClick = (field: UserField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!fieldToDelete) return;

    try {
      await deleteField(fieldToDelete.id);
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  // Manejo de duplicación
  const handleDuplicate = async (field: UserField) => {
    try {
      await duplicateField(field.id);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error duplicating field:', error);
    }
  };

  // Manejo de cambio de estado
  const handleToggleStatus = async (field: UserField) => {
    try {
      await toggleFieldStatus(field.id, !field.isActive);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error toggling field status:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                Campos Dinámicos del Usuario
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona los campos personalizados para el usuario:{' '}
                <strong>{config?.userName || userId}</strong>
              </Typography>
              {config?.userEmail && (
                <Typography variant="body2" color="text.secondary">
                  Email: <strong>{config.userEmail}</strong>
                </Typography>
              )}

              {/* Estadísticas */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label={`${stats.total} campos`} size="small" color="default" />
                <Chip label={`${stats.active} activos`} size="small" color="success" />
                {stats.inactive > 0 && (
                  <Chip label={`${stats.inactive} inactivos`} size="small" color="warning" />
                )}
                <Chip label={`${stats.required} requeridos`} size="small" color="primary" />
              </Stack>
            </Box>

            {/* Botón de crear campo en header */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateForm}
              disabled={isUpdating}
            >
              Agregar Campo
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Controles */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
              }
              label="Mostrar campos inactivos"
            />

            <Button variant="outlined" onClick={refresh} disabled={isUpdating}>
              Actualizar
            </Button>
          </Box>

          {/* Lista de campos */}
          {displayFields.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay campos configurados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {showInactive
                  ? 'Este usuario no tiene campos dinámicos configurados.'
                  : 'No hay campos activos. Activa "Mostrar campos inactivos" para ver todos los campos.'}
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                Crear Primer Campo
              </Button>
            </Paper>
          ) : (
            <List>
              {displayFields.map((field, index) => (
                <React.Fragment key={field.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box
                          component="span"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant="subtitle1" component="span">
                            {field.label}
                          </Typography>
                          <Chip label={field.type} size="small" variant="outlined" />
                          {field.validation?.required && (
                            <Chip label="Requerido" size="small" color="primary" />
                          )}
                          {!field.isActive && (
                            <Chip label="Inactivo" size="small" color="warning" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          <Typography variant="body2" color="text.secondary" component="span">
                            Nombre técnico: {field.name}
                          </Typography>
                          {field.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {field.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Más opciones">
                        <IconButton edge="end" onClick={(e) => handleMenuClick(e, field)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < displayFields.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* FAB flotante */}
      <Fab
        color="primary"
        aria-label="agregar campo"
        onClick={handleOpenCreateForm}
        disabled={isUpdating}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Menú contextual */}
      <Menu anchorEl={menuAnchor?.element} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuAnchor && handleOpenEditForm(menuAnchor.field)}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && handleDuplicate(menuAnchor.field)}>
          <DuplicateIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && handleToggleStatus(menuAnchor.field)}>
          {menuAnchor?.field.isActive ? (
            <>
              <VisibilityOffIcon sx={{ mr: 1 }} />
              Desactivar
            </>
          ) : (
            <>
              <VisibilityIcon sx={{ mr: 1 }} />
              Activar
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => menuAnchor && handleDeleteClick(menuAnchor.field)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el campo "{fieldToDelete?.label}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isUpdating}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de campo */}
      <UserFieldForm
        open={isFormOpen}
        mode={formMode}
        field={selectedField}
        onClose={handleCloseForm}
        onSave={handleSaveField}
        isLoading={isUpdating}
      />
    </>
  );
}
