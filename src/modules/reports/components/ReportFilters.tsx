'use client';

/**
 * Componente de filtros para reportes
 * Platform Web Frontend - Next.js TypeScript
 */

import { ReportFiltersProps, UsersByTypeFilters } from '@/modules/reports/types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  loading = false,
}) => {
  const [userTypes, setUserTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  // Cargar tipos de usuario para el filtro
  useEffect(() => {
    const loadUserTypes = async () => {
      try {
        setLoadingUserTypes(true);
        // Placeholder - reemplazar con llamada real al backend
        setUserTypes([
          { id: '11111111-1111-1111-1111-111111111111', name: 'Administrador' },
          { id: '51bbeb89-b07f-4293-b185-dd96fcb9de1e', name: 'Proveedor' },
          { id: '9e43e57b-31f4-4fd4-8d97-16007b923c74', name: 'Usuario' },
        ]);
      } catch (error) {
        console.error('Error loading user types:', error);
      } finally {
        setLoadingUserTypes(false);
      }
    };

    loadUserTypes();
  }, []);

  const handleFilterChange = (key: keyof UsersByTypeFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    const value = date ? date.toISOString() : undefined;
    handleFilterChange(field, value);
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filtros del Reporte
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Fila 1: Fechas y tipo de usuario */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box minWidth={200} flex={1}>
                <DatePicker
                  label="Fecha inicio"
                  value={filters.startDate ? new Date(filters.startDate) : null}
                  onChange={handleDateChange('startDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Box>

              <Box minWidth={200} flex={1}>
                <DatePicker
                  label="Fecha fin"
                  value={filters.endDate ? new Date(filters.endDate) : null}
                  onChange={handleDateChange('endDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Box>

              <Box minWidth={200} flex={1}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de Usuario"
                  value={filters.userTypeId || ''}
                  onChange={(e) => handleFilterChange('userTypeId', e.target.value || undefined)}
                  disabled={loadingUserTypes}
                >
                  <MenuItem value="">
                    <em>Todos los tipos</em>
                  </MenuItem>
                  {userTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Fila 2: Checkbox y botones */}
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeInactive || false}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                  />
                }
                label="Incluir usuarios inactivos"
              />

              <Box display="flex" gap={2} ml="auto">
                <Button
                  variant="contained"
                  onClick={onApplyFilters}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                  {loading ? 'Cargando...' : 'Aplicar Filtros'}
                </Button>

                <Button variant="outlined" onClick={handleClearFilters} disabled={loading}>
                  Limpiar Filtros
                </Button>
              </Box>
            </Box>
          </Box>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
