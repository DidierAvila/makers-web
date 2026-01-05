/**
 * Tipos para la respuesta del servicio /api/Auth/me
 * Platform Web Frontend - Next.js TypeScript
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  status: boolean;
}

export interface NavigationItem {
  menuId: string;
  label: string;
  icon: string;
  route: string;
  parentId?: string;
  permissions: string;
  children?: NavigationItem[];
}

export interface AdditionalConfig {
  navigation: NavigationItem[];
}

export interface PortalConfiguration {
  id: string;
  userTypeId: string;
  customLabel: string | null;
  customIcon: string | null;
  customRoute: string | null;
  theme: string;
  defaultLandingPage: string;
  logoUrl: string | null;
  language: string;
  additionalConfig: AdditionalConfig;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserConfigurationData {
  user: User;
  roles: Role[];
  portalConfiguration: PortalConfiguration;
}

export interface UserConfigurationResponse {
  success: boolean;
  data: UserConfigurationData;
}

// Tipos para el contexto de usuario
export interface UserContextState {
  user: User | null;
  roles: Role[];
  portalConfiguration: PortalConfiguration | null;
  navigation: NavigationItem[];
  isLoading: boolean;
  error: string | null;
}

export interface UserContextActions {
  setUserConfiguration: (data: UserConfigurationData) => void;
  clearUserConfiguration: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permissions: string, requiredPermission: string) => boolean;
  getFilteredNavigation: (
    navigation: NavigationItem[],
    requiredPermission?: string
  ) => NavigationItem[];
}

export interface UserContextValue extends UserContextState, UserContextActions {}
