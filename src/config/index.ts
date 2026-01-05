import { NavigationItem } from '@/modules/shared/types/auth';

export interface NavigationConfig {
  navigation: NavigationItem[];
}

// Función para obtener la configuración de navegación por defecto
// Retorna array vacío ya que la navegación debe venir del backend
export const getDefaultNavigation = (): NavigationItem[] => {
  return [];
};
