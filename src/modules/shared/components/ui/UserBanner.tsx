/**
 * UserBanner Component - Componente centralizado para mostrar información del usuario
 * Utiliza el hook useEnhancedUser para datos unificados
 * Platform Web Frontend - Next.js TypeScript
 */

'use client';

import {
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEnhancedUser } from '../../hooks/useEnhancedUser';

interface UserBannerProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showUserType?: boolean;
  showEmail?: boolean;
  showActions?: boolean;
  showRefresh?: boolean;
  className?: string;
}

/**
 * Componente para mostrar información del usuario de forma centralizada
 */
export function UserBanner({
  variant = 'horizontal',
  showUserType = true,
  showEmail = true,
  showActions = true,
  showRefresh = false,
  className,
}: UserBannerProps) {
  const router = useRouter();
  const {
    user,
    isLoading,
    isAuthenticated,
    meLoading,
    meError,
    refreshUserData,
    getDisplayName,
    getDisplayEmail,
    getUserInitials,
  } = useEnhancedUser();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/profile');
  }; // Helper para validar URLs de avatar
  const getValidAvatarSrc = (avatarUrl: string | undefined) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.includes('default.jpg')) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return undefined;
  };

  const handleRefresh = async () => {
    handleMenuClose();
    await refreshUserData();
  };

  // Estados de carga
  if (isLoading) {
    return <UserBannerSkeleton variant={variant} />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = getDisplayName();
  const displayEmail = getDisplayEmail();
  const initials = getUserInitials();

  // Variante compacta - solo avatar
  if (variant === 'compact') {
    return (
      <Box className={className}>
        <Tooltip title={`${displayName} (${displayEmail})`}>
          <IconButton onClick={showActions ? handleMenuClick : undefined} size="small">
            <Avatar
              src={getValidAvatarSrc(user.avatar)}
              sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        {showActions && (
          <UserBannerMenu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onLogout={handleLogout}
            onProfile={handleProfile}
            onRefresh={showRefresh ? handleRefresh : undefined}
            user={user}
            meLoading={meLoading}
          />
        )}
      </Box>
    );
  }

  // Variante vertical
  if (variant === 'vertical') {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          p: 2,
        }}
      >
        <Avatar
          src={getValidAvatarSrc(user.avatar)}
          onClick={showActions ? handleMenuClick : undefined}
          sx={{
            width: 64,
            height: 64,
            cursor: showActions ? 'pointer' : 'default',
            fontSize: '1.5rem',
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" fontWeight="medium" noWrap>
            {displayName}
          </Typography>

          {showEmail && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {displayEmail}
            </Typography>
          )}

          {showUserType && user.displayUserType && (
            <Chip label={user.displayUserType} size="small" variant="outlined" sx={{ mt: 0.5 }} />
          )}
        </Box>

        {meLoading && (
          <Tooltip title="Cargando configuración...">
            <RefreshIcon
              sx={{
                fontSize: 16,
                color: 'text.secondary',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
                animation: 'spin 1s linear infinite',
              }}
            />
          </Tooltip>
        )}

        {showActions && (
          <UserBannerMenu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onLogout={handleLogout}
            onProfile={handleProfile}
            onRefresh={showRefresh ? handleRefresh : undefined}
            user={user}
            meLoading={meLoading}
          />
        )}
      </Box>
    );
  }

  // Variante horizontal (por defecto)
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Avatar
        src={getValidAvatarSrc(user.avatar)}
        onClick={showActions ? handleMenuClick : undefined}
        sx={{
          width: 40,
          height: 40,
          cursor: showActions ? 'pointer' : 'default',
        }}
      >
        {initials}
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight="medium" noWrap>
          {displayName}
          {meLoading && (
            <RefreshIcon
              sx={{
                fontSize: 16,
                ml: 1,
                color: 'text.secondary',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
        </Typography>

        {showEmail && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {displayEmail}
          </Typography>
        )}
      </Box>

      {showUserType && user.displayUserType && (
        <Chip label={user.displayUserType} size="small" variant="outlined" />
      )}

      {meError && (
        <Tooltip title={`Error: ${meError}`}>
          <IconButton size="small" color="error" onClick={handleRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {showActions && (
        <UserBannerMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onLogout={handleLogout}
          onProfile={handleProfile}
          onRefresh={showRefresh ? handleRefresh : undefined}
          user={user}
          meLoading={meLoading}
        />
      )}
    </Box>
  );
}

/**
 * Componente de skeleton para estados de carga
 */
function UserBannerSkeleton({ variant }: { variant: 'horizontal' | 'vertical' | 'compact' }) {
  if (variant === 'compact') {
    return <Skeleton variant="circular" width={32} height={32} />;
  }

  if (variant === 'vertical') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 2 }}>
        <Skeleton variant="circular" width={64} height={64} />
        <Skeleton variant="text" width={120} height={24} />
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width={150} height={24} />
        <Skeleton variant="text" width={120} height={20} />
      </Box>
      <Skeleton variant="rounded" width={80} height={24} />
    </Box>
  );
}

/**
 * Menú contextual del usuario
 */
interface UserBannerMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onRefresh?: () => void;
  user: any;
  meLoading: boolean;
}

function UserBannerMenu({
  anchorEl,
  open,
  onClose,
  onLogout,
  onProfile,
  onRefresh,
  user,
  meLoading,
}: UserBannerMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem disabled sx={{ opacity: 1 }}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={user.displayName} secondary={user.displayUserType} />
      </MenuItem>

      <MenuItem disabled sx={{ opacity: 1 }}>
        <ListItemIcon>
          <EmailIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={user.displayEmail} />
      </MenuItem>

      <Divider />

      <MenuItem onClick={onProfile}>
        <ListItemIcon>
          <AccountCircleIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Mi perfil" />
      </MenuItem>

      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Configuración" />
      </MenuItem>

      {onRefresh && (
        <MenuItem onClick={onRefresh} disabled={meLoading}>
          <ListItemIcon>
            <RefreshIcon
              fontSize="small"
              sx={{
                animation: meLoading ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Actualizar datos" />
        </MenuItem>
      )}

      <Divider />

      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Cerrar sesión" />
      </MenuItem>
    </Menu>
  );
}

export default UserBanner;
