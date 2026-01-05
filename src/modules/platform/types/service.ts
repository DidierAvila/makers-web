/**
 * Service Types - Tipos para gestión de servicios
 * Platform Web Frontend - Next.js TypeScript
 */

// Interface para país asociado al servicio (respuesta del backend)
export interface ServiceCountry {
  serviceId: string;
  countryCode: string;
  countryName: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  hourlyValue: number;
  supplierId: string;
  supplierName?: string; // Nombre del proveedor que viene del endpoint
  countryCodes?: string[]; // Códigos de países donde está disponible el servicio (para compatibilidad)
  countries?: ServiceCountry[]; // Países completos que vienen del backend
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  status: boolean;
  hourlyValue: number;
  supplierId: string;
  countryCodes: string[]; // Códigos de países requeridos para crear servicio
}

export interface UpdateServiceData {
  name: string;
  description?: string;
  status: boolean;
  hourlyValue: number;
  supplierId: string;
  countryCodes: string[]; // Códigos de países requeridos para actualizar servicio
}

export interface ServiceFilters {
  search?: string;
  status?: boolean;
  supplierId?: string;
  minHourlyValue?: number;
  maxHourlyValue?: number;
}

export interface ServiceGridRow extends Service {
  supplierName?: string; // Para mostrar el nombre del proveedor en lugar del ID
}

// Legacy interfaces - mantener por compatibilidad si se usan en otros lugares
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ServiceDetail {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  methodology: string;
  isActive: boolean;
}
