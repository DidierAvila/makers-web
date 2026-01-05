'use client';

/**
 * LoansManagement - Componente para gestionar préstamos (Admin)
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { loansService } from '../../services/loansService';
import type { Loan } from '../../types/loan';
import {
  formatCurrency,
  getStatusColor,
  getStatusText,
  LoanStatus,
} from '../../types/loan';

export function LoansManagement() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loansService.getAllLoans();
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (loan: Loan, type: 'approve' | 'reject') => {
    setSelectedLoan(loan);
    setActionType(type);
    setReviewNotes('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLoan(null);
    setReviewNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedLoan) return;

    setActionLoading(selectedLoan.id);

    try {
      if (actionType === 'approve') {
        await loansService.approveLoan(selectedLoan.id, reviewNotes);
      } else {
        await loansService.rejectLoan(selectedLoan.id, reviewNotes);
      }

      await loadLoans();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || `Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} el préstamo`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingLoans = loans.filter((l) => l.status === LoanStatus.Pending);
  const approvedLoans = loans.filter((l) => l.status === LoanStatus.Approved);
  const rejectedLoans = loans.filter((l) => l.status === LoanStatus.Rejected);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Gestionar Solicitudes de Préstamos
          </Typography>
          <Tooltip title="Recargar">
            <IconButton onClick={loadLoans} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Chip label={`Pendientes: ${pendingLoans.length}`} color="warning" />
          <Chip label={`Aprobados: ${approvedLoans.length}`} color="success" />
          <Chip label={`Rechazados: ${rejectedLoans.length}`} color="error" />
        </Box>

        {loans.length === 0 ? (
          <Alert severity="info">
            No hay solicitudes de préstamos en el sistema.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Plazo</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Fecha Solicitud</TableCell>
                  <TableCell>Fecha Revisión</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      <Typography variant="body2">{loan.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loan.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(loan.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{loan.term} meses</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusText(loan.status as LoanStatus)}
                        color={getStatusColor(loan.status as LoanStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(loan.requestedAt || loan.createdAt)}</TableCell>
                    <TableCell>{formatDate(loan.reviewedAt)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {loan.reviewNotes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {loan.status === LoanStatus.Pending ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Aprobar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenDialog(loan, 'approve')}
                              disabled={actionLoading === loan.id}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDialog(loan, 'reject')}
                              disabled={actionLoading === loan.id}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {loan.reviewerName || 'Revisado'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Dialog de confirmación */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Aprobar' : 'Rechazar'} Préstamo
        </DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Usuario:</strong> {selectedLoan.userName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Monto:</strong> {formatCurrency(selectedLoan.amount)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Plazo:</strong> {selectedLoan.term} meses
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label={actionType === 'approve' ? 'Notas (opcional)' : 'Motivo del rechazo'}
            multiline
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={
              actionType === 'approve'
                ? 'Ingrese notas adicionales sobre la aprobación'
                : 'Ingrese el motivo del rechazo'
            }
            required={actionType === 'reject'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={!!actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={!!actionLoading || (actionType === 'reject' && !reviewNotes.trim())}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
