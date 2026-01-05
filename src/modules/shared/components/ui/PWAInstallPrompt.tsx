/**
 * PWAInstallPrompt Component - Prompt de instalación PWA
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';
import { usePWA } from '@/modules/shared/hooks/usePWA';
import {
  Close as CloseIcon,
  GetApp as InstallIcon,
  PhoneAndroid as MobileIcon,
} from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Snackbar, Typography } from '@mui/material';

export default function PWAInstallPrompt() {
  const { showInstallPrompt, isInstalled, installPWA, dismissInstallPrompt } = usePWA();

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      // PWA instalada exitosamente
    }
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 2 }}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          maxWidth: 400,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <IconButton
            size="small"
            aria-label="cerrar"
            color="inherit"
            onClick={dismissInstallPrompt}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MobileIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            Instalar Platform
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Instala la aplicación en tu dispositivo para un acceso más rápido y funcionalidad offline.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<InstallIcon />}
            onClick={handleInstall}
            sx={{ flex: 1 }}
          >
            Instalar
          </Button>

          <Button size="small" variant="outlined" onClick={dismissInstallPrompt} sx={{ flex: 1 }}>
            Ahora no
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
}
