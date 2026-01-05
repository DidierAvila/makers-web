'use client';

/**
 * LoanRequestForm - Formulario para solicitar un préstamo
 * Platform Web Frontend - Next.js TypeScript
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { loansService } from '../../services/loansService';
import type { CreateLoanDto } from '../../types/loan';
import { LOAN_CONSTANTS, formatCurrency } from '../../types/loan';

export function LoanRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateLoanDto>({
    amount: 0,
    term: 12,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateLoanDto, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateLoanDto, string>> = {};

    if (!formData.amount || formData.amount < LOAN_CONSTANTS.MIN_AMOUNT) {
      newErrors.amount = `El monto debe ser mayor a ${formatCurrency(LOAN_CONSTANTS.MIN_AMOUNT)}`;
    } else if (formData.amount > LOAN_CONSTANTS.MAX_AMOUNT) {
      newErrors.amount = `El monto no puede exceder ${formatCurrency(LOAN_CONSTANTS.MAX_AMOUNT)}`;
    }

    if (!formData.term || formData.term < LOAN_CONSTANTS.MIN_TERM) {
      newErrors.term = `El plazo debe ser mayor a ${LOAN_CONSTANTS.MIN_TERM} mes`;
    } else if (formData.term > LOAN_CONSTANTS.MAX_TERM) {
      newErrors.term = `El plazo no puede exceder ${LOAN_CONSTANTS.MAX_TERM} meses`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await loansService.createLoan(formData);
      setSuccess(true);
      setFormData({ amount: 0, term: 12 });

      // Redirigir a mis préstamos después de 2 segundos
      setTimeout(() => {
        router.push('/loans/my-loans');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (): number => {
    if (!formData.amount || !formData.term) return 0;
    // Simulación simple de cuota mensual (monto / plazo)
    // En producción deberías usar la fórmula real con tasa de interés
    return formData.amount / formData.term;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Solicitar Préstamo
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Ingrese el monto que desea solicitar y el plazo en meses
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Préstamo solicitado exitosamente! Redirigiendo...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Monto del Préstamo"
            type="number"
            value={formData.amount || ''}
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
            error={!!errors.amount}
            helperText={errors.amount || 'Monto en pesos colombianos (COP)'}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            required
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Plazo"
            type="number"
            value={formData.term || ''}
            onChange={(e) =>
              setFormData({ ...formData, term: Number(e.target.value) })
            }
            error={!!errors.term}
            helperText={errors.term || 'Plazo en meses (1-360)'}
            InputProps={{
              endAdornment: <InputAdornment position="end">meses</InputAdornment>,
            }}
            required
            disabled={loading}
            sx={{ mb: 3 }}
          />

          {formData.amount > 0 && formData.term > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Cuota mensual estimada:</strong>{' '}
                {formatCurrency(calculateMonthlyPayment())}
              </Typography>
              <Typography variant="caption" display="block">
                * Esta es una estimación. La cuota real dependerá de la tasa de interés
                aprobada.
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
              fullWidth
            >
              {loading ? 'Solicitando...' : 'Solicitar Préstamo'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => router.push('/loans/my-loans')}
              disabled={loading}
            >
              Ver Mis Préstamos
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
