'use client';

import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
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
  Fab,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useUserTypeFields } from '@/modules/shared/hooks';
import {
  CreateUserTypeFieldDto,
  UpdateUserTypeFieldDto,
  UserTypeField,
} from '@/modules/shared/types/dynamic-fields';
import { UserTypeFieldForm } from './UserTypeFieldForm';

interface UserTypeFieldsManagerProps {
  userTypeId?: string;
}

export const UserTypeFieldsManager: React.FC<UserTypeFieldsManagerProps> = ({ userTypeId }) => {
  // Estados del componente
  const [showInactive, setShowInactive] = useState(false);
  const [selectedField, setSelectedField] = useState<UserTypeField | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<UserTypeField | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    field: UserTypeField;
  } | null>(null);

  // Si no hay userTypeId, mostrar mensaje informativo
  if (!userTypeId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            Selecciona un tipo de usuario para gestionar sus campos dinámicos
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
  } = useUserTypeFields(userTypeId);

  // Campos a mostrar (activos o todos)
  const displayFields = showInactive ? fields : activeFields;

  // Manejo de formulario
  const handleOpenCreateForm = () => {
    setSelectedField(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (field: UserTypeField) => {
    setSelectedField(field);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedField(null);
  };

  const handleSaveField = async (fieldData: CreateUserTypeFieldDto | UpdateUserTypeFieldDto) => {
    try {
      if (formMode === 'create') {
        await createField(fieldData as CreateUserTypeFieldDto);
      } else {
        await updateField(fieldData as UpdateUserTypeFieldDto);
      }
      // Cerrar el formulario después del éxito
      handleCloseForm();
    } catch (error) {
      console.error('Error saving field:', error);
      throw error;
    }
  };

  // Manejo de eliminación
  const handleDeleteClick = (field: UserTypeField) => {
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

  // Manejo de menú contextual
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, field: UserTypeField) => {
    setMenuAnchor({ element: event.currentTarget, field });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Manejo de reordenamiento
  const handleMoveField = async (field: UserTypeField, direction: 'up' | 'down') => {
    const currentIndex = displayFields.findIndex((f) => f.id === field.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= displayFields.length) return;

    const fieldOrders = displayFields.map((f, index) => {
      let order = index + 1;
      if (index === currentIndex) {
        order = newIndex + 1;
      } else if (index === newIndex) {
        order = currentIndex + 1;
      }
      return { fieldId: f.id, order };
    });

    try {
      await reorderFields(fieldOrders);
    } catch (error) {
      console.error('Error reordering fields:', error);
    }
  };

  // Acciones de menú
  const handleDuplicate = async (field: UserTypeField) => {
    try {
      await duplicateField(field.id);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error duplicating field:', error);
    }
  };

  const handleToggleStatus = async (field: UserTypeField) => {
    try {
      await toggleFieldStatus(field.id, !field.isActive);
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error toggling field status:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              clearError();
              refresh();
            }}
          >
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
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
                Campos Dinámicos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona los campos personalizados para el tipo de usuario:{' '}
                <strong>{config?.userTypeName || userTypeId}</strong>
              </Typography>

              {/* Estadísticas */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label={`${stats.total} campos`} size="small" color="default" />
                <Chip
                  label={`${stats.active} activos`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${stats.inactive} inactivos`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
                <Chip
                  label={`${stats.required} requeridos`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateForm}
                size="small"
              >
                Agregar Campo
              </Button>

              <Tooltip title="Actualizar">
                <IconButton onClick={refresh} disabled={isUpdating}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    size="small"
                  />
                }
                label="Mostrar inactivos"
                sx={{ ml: 1 }}
              />
            </Stack>
          </Box>

          {/* Tabla de campos */}
          {displayFields.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No hay campos configurados
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {showInactive
                  ? 'No se encontraron campos (activos o inactivos)'
                  : 'No hay campos activos. Crea el primer campo o activa campos existentes.'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateForm}
                sx={{ mt: 2 }}
              >
                Crear Primer Campo
              </Button>
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>Orden</TableCell>
                    <TableCell>Campo</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Validación</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell width={120}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayFields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      sx={{
                        opacity: field.isActive ? 1 : 0.6,
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 20 }}>
                            {field.order}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveField(field, 'up')}
                              disabled={index === 0}
                            >
                              <DragIcon sx={{ transform: 'rotate(-90deg)', fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveField(field, 'down')}
                              disabled={index === displayFields.length - 1}
                            >
                              <DragIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{field.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.name}
                          </Typography>
                          {field.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {field.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={field.type}
                          size="small"
                          variant="outlined"
                          color={field.type === 'text' ? 'default' : 'primary'}
                        />
                        {field.options && field.options.length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {field.options.length} opciones
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          {field.validation?.required && (
                            <Chip label="Requerido" size="small" color="error" />
                          )}
                          {field.validation?.minLength && (
                            <Typography variant="caption" color="text.secondary">
                              Min: {field.validation.minLength}
                            </Typography>
                          )}
                          {field.validation?.maxLength && (
                            <Typography variant="caption" color="text.secondary">
                              Max: {field.validation.maxLength}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Chip
                            label={field.isActive ? 'Activo' : 'Inactivo'}
                            size="small"
                            color={field.isActive ? 'success' : 'default'}
                            variant={field.isActive ? 'filled' : 'outlined'}
                          />
                          {field.isInheritable && (
                            <Chip
                              label="Personalizable"
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <IconButton size="small" onClick={() => handleOpenEditForm(field)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => handleMenuClick(e, field)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* FAB para crear campo */}
      <Fab
        color="primary"
        aria-label="add field"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={handleOpenCreateForm}
      >
        <AddIcon />
      </Fab>

      {/* Menú contextual */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleOpenEditForm(menuAnchor!.field);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>

        <MenuItem onClick={() => handleDuplicate(menuAnchor!.field)}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>

        <MenuItem onClick={() => handleToggleStatus(menuAnchor!.field)}>
          {menuAnchor?.field.isActive ? (
            <VisibilityOffIcon sx={{ mr: 1 }} />
          ) : (
            <VisibilityIcon sx={{ mr: 1 }} />
          )}
          {menuAnchor?.field.isActive ? 'Desactivar' : 'Activar'}
        </MenuItem>

        <MenuItem onClick={() => handleDeleteClick(menuAnchor!.field)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Formulario de campo */}
      <UserTypeFieldForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveField}
        userTypeId={userTypeId!}
        userTypeName={userTypeId}
        initialData={
          selectedField
            ? {
                id: selectedField.id,
                userTypeId: selectedField.userTypeId,
                name: selectedField.name,
                label: selectedField.label,
                description: selectedField.description,
                type: selectedField.type,
                validation: selectedField.validation,
                options: selectedField.options,
                defaultValue: selectedField.defaultValue,
                placeholder: selectedField.placeholder,
                isInheritable: selectedField.isInheritable,
                order: selectedField.order,
                metadata: selectedField.metadata,
                isActive: selectedField.isActive,
              }
            : undefined
        }
        mode={formMode}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar el campo "{fieldToDelete?.label}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. Todos los datos asociados a este campo se perderán.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
