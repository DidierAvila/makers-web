'use client';
import { ConnectionError } from '@/modules/shared/components/ui/ConnectionError';
import { useUser } from '@/modules/shared/contexts/UserContext';
import { useAuth } from '@/modules/shared/hooks/useAuth';
import { useEnhancedUser } from '@/modules/shared/hooks/useEnhancedUser';
import { useNetworkStatus } from '@/modules/shared/hooks/useNetworkStatus';
import { NavigationItem } from '@/modules/shared/types/auth';
import {
  AccountCircle,
  AccountTree,
  AddBusiness,
  Analytics,
  Article,
  Assessment,
  AssignmentInd,
  BarChart,
  Build,
  Business,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Description,
  DeveloperBoard,
  Drafts,
  Engineering,
  EventAvailable,
  ExpandLess,
  ExpandMore,
  GroupAdd,
  Hub,
  Info,
  LibraryBooks,
  Logout,
  Menu as MenuIcon,
  NavigateNext,
  Notifications,
  People,
  School,
  Security,
  Settings,
  Store,
  VerifiedUser,
  Work,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useState } from 'react';

// Mapa de iconos disponibles (expandido para soportar más iconos)
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Dashboard,
  BarChart,
  Analytics,
  People,
  Business,
  AddBusiness,
  CalendarMonth,
  School,
  Assessment,
  AssignmentInd,
  AccountTree,
  Description,
  DeveloperBoard,
  Engineering,
  EventAvailable,
  Hub,
  Drafts,
  LibraryBooks,
  Settings,
  Info,
  Security,
  Store,
  VerifiedUser,
  GroupAdd,
  Work,
  Build,
  // Iconos adicionales para la navegación dinámica
  'fas fa-tachometer-alt': Dashboard,
  shield: Security,
  people: People,
  security: Security,
  key: Security,
  // Iconos para los nuevos módulos
  service: Store,
  services: Store,
  schedule: CalendarMonth,
  schedules: CalendarMonth,
  calendar: CalendarMonth,
  client: Business,
  clients: Business,
  report: Assessment,
  reports: Assessment,
  analytics: Analytics,
  dashboard: Dashboard,
  // Iconos alternativos comunes
  'calendar-month': CalendarMonth,
  'event-available': EventAvailable,
  assessment: Assessment,
  business: Business,
  store: Store,
  description: Description,
  // Nuevos iconos agregados
  engineering: Engineering,
  hub: Hub,
  drafts: Drafts,
  // Variaciones adicionales para proyectos
  project: Engineering,
  projects: Hub,
  'project-management': Engineering,
  'gestión de proyectos': Engineering,
  'gestión-de-proyectos': Engineering,
  'gestion-de-proyectos': Engineering,
  'gestion de proyectos': Engineering,
  proyectos: Hub,
  propuestas: Drafts,
  proyecto: Engineering,
  // Iconos para documentos
  word: Article,
  document: Description,
  article: Article,
};

const drawerWidth = 280;
const drawerWidthCollapsed = 64;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  // Hook centralizado de usuario (reemplaza useAuth + datos dispersos)
  const {
    user: enhancedUser,
    isLoading,
    isAuthenticated,
    meData,
    meLoading,
    meError,
    connectionFailed,
    retryCount,
    refreshUserData,
    resetConnectionState,
    getDisplayName,
    getDisplayEmail,
  } = useEnhancedUser();

  // Hook de estado de red
  const { isOnline, justReconnected } = useNetworkStatus();

  // Hook de autenticación (mantenido para logout y funciones específicas)
  const { logout } = useAuth();

  // Hook del contexto de usuario para obtener la navegación dinámica
  const { portalConfiguration, getFilteredNavigation } = useUser();

  // Compatibilidad: usar los datos centralizados pero mantener la variable 'user' para el resto del código
  const user = enhancedUser;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuToggle = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  // Función para navegar a una página
  const handleNavigation = (path: string) => {
    router.push(path);
    // Cerrar drawer móvil después de navegar
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Obtener la navegación dinámica del usuario
  const getNavigationItems = (): NavigationItem[] => {
    // Solo mostrar navegación si hay configuración válida del backend
    if (
      portalConfiguration?.additionalConfig?.navigation &&
      portalConfiguration.additionalConfig.navigation.length > 0
    ) {
      return getFilteredNavigation(portalConfiguration.additionalConfig.navigation);
    }
    // Si no hay navegación del backend, retornar array vacío
    return [];
  };

  // Función para renderizar iconos dinámicos
  const renderDynamicIcon = (iconName: string) => {
    // Primero intentar con el mapa de iconos existente
    if (iconMap[iconName]) {
      const IconComponent = iconMap[iconName];
      return <IconComponent />;
    }

    // Si no se encuentra, usar Dashboard como fallback
    return <Dashboard />;
  };

  // Verificar si una ruta está activa
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/') {
      return true; // Dashboard también está activo en la página principal
    }
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  // Función para renderizar iconos con tamaño personalizable
  const renderIconWithSize = (iconName: string, size = 24) => {
    const IconComponent = iconMap[iconName] || Dashboard;
    return <IconComponent sx={{ fontSize: size }} />;
  };

  // Función para generar breadcrumbs basados en la ruta actual
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard sx={{ fontSize: 16 }} /> },
    ];

    // Buscar la página actual en la navegación dinámica
    const navigationItems = getNavigationItems();
    const flatNavigation = navigationItems.flatMap((item) =>
      item.children && item.children.length > 0 ? [item, ...item.children] : [item]
    );
    const currentPage = flatNavigation.find((item) => isActive(item.route));

    if (currentPage && currentPage.route !== '/dashboard') {
      breadcrumbs.push({
        label: currentPage.label,
        path: currentPage.route,
        icon: renderIconWithSize(currentPage.icon, 16),
      });
    }

    return breadcrumbs;
  };

  // Función para obtener el título de la página actual
  const getCurrentPageTitle = () => {
    const navigationItems = getNavigationItems();
    const flatNavigation = navigationItems.flatMap((item) =>
      item.children && item.children.length > 0 ? [item, ...item.children] : [item]
    );
    const currentPage = flatNavigation.find((item) => isActive(item.route));
    return currentPage?.label || 'Dashboard';
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header del sidebar */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Platform
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleCollapseToggle}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      {/* Navegación */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List sx={{ px: collapsed ? 0.5 : 1 }}>
          {getNavigationItems().map((item, index) => (
            <Box key={item.menuId || index}>
              {/* Elemento principal del menú */}
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      if (item.children && item.children.length > 0) {
                        handleMenuToggle(item.menuId || index.toString());
                      } else {
                        handleNavigation(item.route);
                      }
                    }}
                    selected={isActive(item.route)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1 : 2,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover:not(.Mui-selected)': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: 'center',
                      }}
                    >
                      {renderDynamicIcon(item.icon)}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.label} />
                        {item.children && item.children.length > 0 && (
                          <Box sx={{ ml: 1 }}>
                            {expandedMenus[item.menuId || index.toString()] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>

              {/* Elementos hijos del menú */}
              {!collapsed &&
                item.children &&
                item.children.length > 0 &&
                expandedMenus[item.menuId || index.toString()] && (
                  <Box
                    sx={{
                      ml: 2,
                      overflow: 'hidden',
                      transition: theme.transitions.create(['max-height', 'opacity'], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.standard,
                      }),
                    }}
                  >
                    {item.children.map((child) => (
                      <ListItem key={child.menuId} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(child.route)}
                          selected={isActive(child.route)}
                          sx={{
                            minHeight: 40,
                            px: 2,
                            borderRadius: 2,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                              },
                            },
                            '&:hover:not(.Mui-selected)': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              justifyContent: 'center',
                            }}
                          >
                            {renderDynamicIcon(child.icon)}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </Box>
                )}

              {/* Divider entre elementos principales */}
              {!collapsed && index < getNavigationItems().length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </List>
      </Box>

      {/* Usuario info en el footer del sidebar */}
      {user && (
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {collapsed ? (
            <Tooltip title={user.name || user.email} placement="right" arrow>
              <IconButton onClick={handleUserMenuOpen} sx={{ width: '100%', height: 40 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {user.name || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar superior permanente */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidth}px)`,
          },
          ml: {
            md: `${collapsed ? drawerWidthCollapsed : drawerWidth}px`,
          },
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Botón de menú para móviles */}
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Breadcrumbs y título de página */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator={<NavigateNext fontSize="small" />}
              sx={{
                color: 'inherit',
                '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              {getBreadcrumbs().map((breadcrumb, index, array) =>
                index === array.length - 1 ? (
                  <Box
                    key={breadcrumb.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {breadcrumb.icon}
                    <Typography
                      variant="body2"
                      sx={{ ml: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                    >
                      {breadcrumb.label}
                    </Typography>
                  </Box>
                ) : (
                  <Link
                    key={breadcrumb.path}
                    underline="hover"
                    color="inherit"
                    onClick={() => handleNavigation(breadcrumb.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.8)',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {breadcrumb.icon}
                    <Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.875rem' }}>
                      {breadcrumb.label}
                    </Typography>
                  </Link>
                )
              )}
            </Breadcrumbs>

            {/* Título de la página actual */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                mt: 0.5,
              }}
            >
              {getCurrentPageTitle()}
            </Typography>
          </Box>

          {/* Iconos de la barra superior */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" size="medium">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Separador visual */}
            <Box
              sx={{
                width: 1,
                height: 24,
                bgcolor: 'rgba(255,255,255,0.3)',
                mx: 0.5,
              }}
            />

            {/* Perfil de Usuario - Datos centralizados con diseño original */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Información del usuario (solo en pantallas grandes) */}
                {/* OPCIÓN 1: Layout horizontal más espaciado */}
                <Box
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    alignItems: 'center',
                    gap: 2,
                    minWidth: 160,
                  }}
                >
                  {/* Información personal */}
                  <Box sx={{ textAlign: 'right', flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        color: 'white',
                        mb: 0.25,
                      }}
                    >
                      {getDisplayName()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.75)',
                        display: 'block',
                      }}
                    >
                      {user.displayUserType ? `Tipo Usuario: ${user.displayUserType}` : 'Usuario'}
                    </Typography>
                  </Box>
                </Box>

                {/* OPCIÓN 2: Layout compacto para pantallas medianas */}
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex', lg: 'none' },
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    minWidth: 150,
                    gap: 0.5,
                  }}
                >
                  {/* Nombre y tipo de usuario */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        color: 'white',
                        lineHeight: 1.1,
                      }}
                    >
                      {getDisplayName()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1,
                      }}
                    >
                      {user.displayUserType ? `Tipo Usuario: ${user.displayUserType}` : 'Usuario'}
                    </Typography>
                  </Box>
                </Box>

                {/* Avatar con foto de perfil */}
                <Tooltip
                  title={`${getDisplayName()}${user.displayUserType ? ` (${user.displayUserType})` : ''} - Ver perfil`}
                >
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      p: 0,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar || undefined}
                      alt={getDisplayName()}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: user.avatar ? 'transparent' : 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: user.avatar ? 'inherit' : 'white',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: 'rgba(255,255,255,0.6)',
                        },
                      }}
                    >
                      {!user.avatar && user.initials}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* Indicador de estado online (opcional) */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    bgcolor: '#4caf50',
                    borderRadius: '50%',
                    border: '2px solid white',
                    ml: 2.5,
                    mt: -2.5,
                    zIndex: 1,
                  }}
                />

                {/* OPCIÓN C: Badge elegante del tipo de usuario */}
                {user.displayUserType && (
                  <Tooltip title={`Tipo: ${user.displayUserType}`}>
                    <Box
                      sx={{
                        display: { xs: 'flex', lg: 'none' },
                        position: 'absolute',
                        width: 20,
                        height: 20,
                        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        border: '2px solid white',
                        ml: 2,
                        mt: 2,
                        zIndex: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          color: 'white',
                          lineHeight: 1,
                        }}
                      >
                        {user.displayUserType.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Indicador de carga de datos adicionales */}
                {meLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      bgcolor: '#ff9800',
                      borderRadius: '50%',
                      border: '1px solid white',
                      ml: 3.5,
                      mt: -3.5,
                      zIndex: 2,
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                      animation: 'pulse 2s infinite',
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? drawerWidthCollapsed : drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? drawerWidthCollapsed : drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidth}px)`,
          },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: 8, // Margen superior para el AppBar permanente
          pt: 2, // Padding superior adicional
        }}
      >
        {/* Componente para manejar errores de conexión */}
        <ConnectionError
          isConnected={isOnline}
          error={meError}
          retryCount={retryCount}
          maxRetries={3}
          onRetry={refreshUserData}
          onReset={resetConnectionState}
        />

        {children}
      </Box>

      {/* Menu del usuario */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
      >
        {/* Header del menú con información del usuario */}
        {user && (
          <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user.avatar || undefined}
                alt={user.name || user.email}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                }}
              >
                {!user.avatar &&
                  (user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email?.charAt(0).toUpperCase())}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name || 'Usuario'}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </Typography>
                <Chip
                  label="En línea"
                  size="small"
                  color="success"
                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Opciones del menú */}
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            window.location.href = '/profile';
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mi Perfil"
            secondary="Configurar información personal"
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>

        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Configuración"
            secondary="Preferencias y ajustes"
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>

        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Notifications fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Notificaciones"
            secondary="Gestionar alertas"
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar Sesión"
            secondary="Salir del sistema"
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
