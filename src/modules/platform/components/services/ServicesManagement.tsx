/**
 * ServicesManagement Component - Gestión principal de servicios
 * Platform Web Frontend - Next.js TypeScript
 * Basado en el diseño del módulo admin para mantener consistencia
 */

'use client';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { useNotificationContext } from '@/modules/shared/components/providers/NotificationProvider';
import DeleteConfirmDialog from '@/modules/shared/components/ui/DeleteConfirmDialog';
import { useApiError } from '@/modules/shared/hooks/useApiError';
import { useAuth } from '@/modules/shared/hooks/useAuth';
import { servicesService } from '../../services/servicesService';
import { Service } from '../../types/service';
import { ServiceForm } from './ServiceForm';

export function ServicesManagement() {
  // Estados principales
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalServices, setTotalServices] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [supplierFilter, setSupplierFilter] = useState<string>('');

  // Estados del formulario
  const [formOpen, setFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Estados de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Estados del menú contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedServiceForMenu, setSelectedServiceForMenu] = useState<Service | null>(null);

  // Estados del dialog de detalles
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Hooks
  const { user, accessToken, isAuthenticated } = useAuth();
  const { handleError } = useApiError();
  const { showNotification } = useNotificationContext();

  // Cargar servicios
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'Activo' ? true : statusFilter === 'Inactivo' ? false : undefined,
        supplierId: supplierFilter.trim() || undefined,
      };

      const response = await servicesService.getAll(page, rowsPerPage, filters);
      const servicesData = response.data || [];

      setServices(servicesData);
      setTotalServices(response.totalRecords || servicesData.length || 0);
      setTotalPages(
        response.totalPages ||
          Math.ceil((response.totalRecords || servicesData.length) / rowsPerPage) ||
          1
      );
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setError('Error al cargar los servicios');
      handleError(error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, supplierFilter, handleError]);

  // Efecto para cargar datos
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Manejar éxito en formulario
  const handleFormSuccess = useCallback(() => {
    loadServices();
  }, [loadServices]);

  // Abrir formulario para crear
  const handleCreate = () => {
    setSelectedService(null);
    setFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = async (service: Service) => {
    try {
      // Obtener la información más actualizada del servicio
      const updatedService = await servicesService.getById(service.id);
      setSelectedService(updatedService);
      setFormOpen(true);
    } catch (error) {
      handleError(error);
      showNotification('Error al cargar los datos del servicio', 'error');
    }
  };

  // Ver detalles del servicio
  const handleView = async (service: Service) => {
    setLoadingDetails(true);
    setViewDialogOpen(true);

    try {
      // Obtener detalles completos del servicio desde la API
      const details = await servicesService.getById(service.id);
      setServiceDetails(details);
    } catch (error) {
      console.error('Error cargando detalles del servicio:', error);
      handleError(error);
      // Si hay error, mostrar los datos que ya tenemos
      setServiceDetails(service);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Cerrar dialog de detalles
  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setServiceDetails(null);
  };

  // Cerrar formulario
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedService(null);
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
      setSelectedServiceForMenu(null); // Limpiar también el servicio seleccionado del menú
    } catch (error) {
      handleError(error);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setSupplierFilter('');
    setPage(1);
  };

  // Manejar menú contextual
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, service: Service) => {
    setAnchorEl(event.currentTarget);
    setSelectedServiceForMenu(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedServiceForMenu(null);
  };

  // Manejar acciones desde el menú
  const handleMenuView = () => {
    if (selectedServiceForMenu) {
      handleView(selectedServiceForMenu);
    }
    handleMenuClose();
  };

  const handleMenuEdit = () => {
    if (selectedServiceForMenu) {
      handleEdit(selectedServiceForMenu);
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedServiceForMenu) {
      handleDeleteClick(selectedServiceForMenu);
    }
    setAnchorEl(null); // Solo cerrar el menú, mantener selectedServiceForMenu para el diálogo
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

  // Filtrar servicios localmente para la paginación
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.supplierName &&
        service.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activo' && service.status) ||
      (statusFilter === 'Inactivo' && !service.status);

    const matchesSupplier =
      supplierFilter === '' ||
      (service.supplierName &&
        service.supplierName.toLowerCase().includes(supplierFilter.toLowerCase())) ||
      service.supplierId.toLowerCase().includes(supplierFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Título principal */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Servicios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Servicio
        </Button>
      </Box>

      {/* Alert informativo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Administra los servicios de la plataforma, sus precios y disponibilidad.
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: { md: 'center' },
            }}
          >
            <TextField
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', md: 140 } }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Activo">Activos</MenuItem>
                <MenuItem value="Inactivo">Inactivos</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder="Filtrar por proveedor..."
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 200 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
              sx={{ minWidth: 140 }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de servicios */}
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
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Servicio</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Proveedor</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Valor/Hora</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Fecha Creación</TableCell>
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
                      Cargando servicios...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron servicios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                          {service.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {service.id.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, maxWidth: 300 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {service.description || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                          {service.supplierName || 'Sin proveedor'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {service.supplierId.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(service.hourlyValue)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={service.status ? 'Activo' : 'Inactivo'}
                        color={service.status ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2">
                        {new Date(service.createdAt).toLocaleDateString('es-CO')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Tooltip title="Más opciones">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, service)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                            },
                          }}
                        >
                          <MoreVertIcon />
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
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Formulario de servicio */}
      <ServiceForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        service={selectedService}
      />

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuView}>
          <ViewIcon sx={{ mr: 1 }} /> Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleMenuEdit}>
          <EditIcon sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleMenuDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog de detalles del servicio */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="div">
              Detalles del Servicio
            </Typography>
            <Chip
              label={serviceDetails?.status ? 'Activo' : 'Inactivo'}
              color={serviceDetails?.status ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Cargando detalles...
              </Typography>
            </Box>
          ) : serviceDetails ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Información básica */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Información General
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nombre del Servicio
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {serviceDetails.name}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      ID del Servicio
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {serviceDetails.id}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Descripción
                  </Typography>
                  <Typography variant="body1">
                    {serviceDetails.description || 'Sin descripción proporcionada'}
                  </Typography>
                </Box>
              </Box>

              {/* Información del proveedor */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Información del Proveedor
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Nombre del Proveedor
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {serviceDetails.supplierName || 'Sin proveedor asignado'}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      ID del Proveedor
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {serviceDetails.supplierId}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Información comercial */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Información Comercial
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Valor por Hora
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatCurrency(serviceDetails.hourlyValue)}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Estado del Servicio
                    </Typography>
                    <Box>
                      <Chip
                        label={serviceDetails.status ? 'Activo' : 'Inactivo'}
                        color={serviceDetails.status ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Países disponibles */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Países Disponibles
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box>
                  {serviceDetails.countries && serviceDetails.countries.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {serviceDetails.countries.map((country) => (
                        <Chip
                          key={country.countryCode}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" fontWeight="medium">
                                {country.countryName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({country.countryCode})
                              </Typography>
                            </Box>
                          }
                          variant="outlined"
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se han especificado países para este servicio
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Información de fechas */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Información de Fechas
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body1">
                      {new Date(serviceDetails.createdAt).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  {serviceDetails.updatedAt && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Última Actualización
                      </Typography>
                      <Typography variant="body1">
                        {new Date(serviceDetails.updatedAt).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography color="error">Error al cargar los detalles del servicio</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleViewDialogClose} variant="outlined">
            Cerrar
          </Button>
          {serviceDetails && (
            <Button
              onClick={() => {
                handleViewDialogClose();
                handleEdit(serviceDetails);
              }}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Editar Servicio
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
          setSelectedServiceForMenu(null); // Limpiar también el servicio seleccionado del menú
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </Box>
  );
}

export default ServicesManagement;
