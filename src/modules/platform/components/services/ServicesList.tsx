/**
 * ServicesList Component - Lista de servicios con DataGrid
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import {
  ToggleOn as ActiveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ToggleOff as InactiveIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useCallback, useEffect, useState } from 'react';

import { useNotificationContext } from '@/modules/shared/components/providers/NotificationProvider';
import DeleteConfirmDialog from '@/modules/shared/components/ui/DeleteConfirmDialog';
import { useApiError } from '@/modules/shared/hooks/useApiError';
import { servicesService } from '../../services/servicesService';
import { Service, ServiceGridRow } from '../../types/service';

interface ServicesListProps {
  onEdit?: (service: Service) => void;
  onView?: (service: Service) => void;
  refreshTrigger?: number;
  filters?: {
    search?: string;
    status?: boolean;
    supplierId?: string;
  };
}

export function ServicesList({ onEdit, onView, refreshTrigger, filters }: ServicesListProps) {
  const [services, setServices] = useState<ServiceGridRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  // Estados para el diálogo de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { handleError } = useApiError();
  const { showNotification } = useNotificationContext();

  // Cargar servicios
  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await servicesService.getAll(
        paginationModel.page + 1,
        paginationModel.pageSize,
        filters
      );

      setServices(response.data || []);
      setRowCount(response.totalRecords || 0);
    } catch (error) {
      handleError(error);
      setServices([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters, handleError]);

  // Efecto para cargar datos
  useEffect(() => {
    loadServices();
  }, [loadServices, refreshTrigger]);

  // Manejar cambio de estado
  const handleToggleStatus = async (service: Service) => {
    try {
      await servicesService.toggleStatus(service.id, !service.status);
      showNotification(
        `Servicio ${!service.status ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );
      loadServices();
    } catch (error) {
      handleError(error);
    }
  };

  // Manejar eliminación
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await servicesService.delete(serviceToDelete.id);
      showNotification('Servicio eliminado exitosamente', 'success');
      loadServices();
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      handleError(error);
    }
  };

  // Formatear valor monetario
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Definición de columnas
  const columns: GridColDef<ServiceGridRow>[] = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value || 'Sin descripción'}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value || 'Sin descripción'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'hourlyValue',
      headerName: 'Valor Hora',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Creado',
      width: 120,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <Typography variant="body2">{date.toLocaleDateString('es-CO')}</Typography>;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 150,
      getActions: (params) => {
        const service = params.row;
        return [
          <GridActionsCellItem
            key="view"
            icon={
              <Tooltip title="Ver detalles">
                <ViewIcon />
              </Tooltip>
            }
            label="Ver"
            onClick={() => onView?.(service)}
          />,
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Editar">
                <EditIcon />
              </Tooltip>
            }
            label="Editar"
            onClick={() => onEdit?.(service)}
          />,
          <GridActionsCellItem
            key="toggle"
            icon={
              <Tooltip title={service.status ? 'Desactivar' : 'Activar'}>
                {service.status ? <ActiveIcon color="success" /> : <InactiveIcon />}
              </Tooltip>
            }
            label={service.status ? 'Desactivar' : 'Activar'}
            onClick={() => handleToggleStatus(service)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Eliminar">
                <DeleteIcon />
              </Tooltip>
            }
            label="Eliminar"
            onClick={() => handleDeleteClick(service)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={services}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1,
          },
        }}
      />

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </Box>
  );
}

export default ServicesList;
