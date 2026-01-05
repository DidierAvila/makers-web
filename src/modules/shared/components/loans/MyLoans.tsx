'use client';

/**
 * MyLoans - Componente para ver mis préstamos
 * Platform Web Frontend - Next.js TypeScript
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { loansService } from '../../services/loansService';
import type { Loan } from '../../types/loan';
import {
  formatCurrency,
  getStatusColor,
  getStatusText,
  LoanStatus,
} from '../../types/loan';

export function MyLoans() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loansService.getMyLoans();
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Mis Préstamos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/loans/request')}
          >
            Solicitar Nuevo Préstamo
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loans.length === 0 ? (
          <Alert severity="info">
            No tienes préstamos solicitados. ¡Solicita tu primer préstamo ahora!
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha de Solicitud</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Plazo</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Fecha de Revisión</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      {formatDate(loan.requestedAt || loan.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(loan.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {loan.term} meses
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusText(loan.status as LoanStatus)}
                        color={getStatusColor(loan.status as LoanStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(loan.reviewedAt)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {loan.reviewNotes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            label={`Pendientes: ${loans.filter((l) => l.status === LoanStatus.Pending).length}`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Aprobados: ${loans.filter((l) => l.status === LoanStatus.Approved).length}`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Rechazados: ${loans.filter((l) => l.status === LoanStatus.Rejected).length}`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
