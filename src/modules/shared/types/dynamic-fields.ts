/**
 * Sistema de campos dinámicos de dos niveles
 * - Nivel 1: Campos definidos en UserType (aplicables a todos los usuarios de ese tipo)
 * - Nivel 2: Campos personales por usuario (individuales)
 */

// Tipos de campo soportados
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'url'
  | 'file';

// Configuración de validación para campos
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex pattern
  customMessage?: string;
}

// Opciones para campos de selección
export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Definición base de un campo dinámico
export interface DynamicFieldDefinition {
  id: string;
  name: string; // nombre técnico del campo
  label: string; // etiqueta visible al usuario
  description?: string;
  type: FieldType;
  validation?: FieldValidation;
  options?: FieldOption[]; // para select, multiselect, radio
  defaultValue?: any;
  placeholder?: string;
  isActive: boolean;
  order: number; // orden de visualización
  metadata?: Record<string, any>; // datos adicionales específicos del campo
}

// Campo a nivel de UserType (grupal)
export interface UserTypeField extends DynamicFieldDefinition {
  userTypeId: string;
  isInheritable: boolean; // si se puede heredar/sobrescribir a nivel individual
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Campo personal de usuario (individual)
export interface UserPersonalField extends DynamicFieldDefinition {
  userId: string;
  parentFieldId?: string; // referencia al campo de UserType si es una sobrescritura
  isOverride: boolean; // true si sobrescribe un campo de UserType
  createdAt: Date;
  updatedAt: Date;
}

// Valor de un campo dinámico
export interface DynamicFieldValue {
  fieldId: string;
  fieldName: string;
  value: any;
  fieldType: FieldType;
  lastUpdated: Date;
}

// Estructura completa de datos adicionales de un usuario
export interface UserAdditionalData {
  // Valores de campos heredados del UserType
  userTypeFields: Record<string, DynamicFieldValue>;
  // Valores de campos personales del usuario
  personalFields: Record<string, DynamicFieldValue>;
  // Metadatos
  lastSyncAt?: Date;
  version: number;
}

// Configuración completa de campos para un UserType
export interface UserTypeFieldsConfig {
  userTypeId: string;
  userTypeName: string;
  fields: UserTypeField[];
  isActive: boolean;
  totalFields: number;
  lastUpdated: Date;
}

// Configuración completa de campos personales para un usuario
export interface UserPersonalFieldsConfig {
  userId: string;
  personalFields: UserPersonalField[];
  inheritedFields: UserTypeField[]; // campos del UserType
  totalPersonalFields: number;
  totalInheritedFields: number;
  lastUpdated: Date;
}

// DTOs para operaciones CRUD
export interface CreateUserTypeFieldDto {
  userTypeId: string;
  name: string;
  label: string;
  description?: string;
  type: FieldType;
  validation?: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
  placeholder?: string;
  isInheritable?: boolean;
  isActive?: boolean;
  order?: number;
  metadata?: Record<string, any>;
}

export interface UpdateUserTypeFieldDto extends Partial<CreateUserTypeFieldDto> {
  id: string;
  isActive?: boolean;
}

export interface CreateUserPersonalFieldDto {
  userId: string;
  name: string;
  label: string;
  description?: string;
  type: FieldType;
  validation?: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
  placeholder?: string;
  order?: number;
  metadata?: Record<string, any>;
  parentFieldId?: string; // si es sobrescritura de campo de UserType
}

export interface UpdateUserPersonalFieldDto extends Partial<CreateUserPersonalFieldDto> {
  id: string;
  isActive?: boolean;
}

// DTO para actualizar valores de campos
export interface UpdateFieldValuesDto {
  userId: string;
  values: {
    fieldId: string;
    value: any;
  }[];
}

// Respuesta de la API
export interface DynamicFieldsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Estados de carga para hooks
export interface DynamicFieldsState {
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Configuración de renderizado para componentes
export interface FieldRenderConfig {
  showDescription: boolean;
  showRequired: boolean;
  compactMode: boolean;
  readOnly: boolean;
  showFieldOrder: boolean;
  groupBySection: boolean;
}

// Sección/agrupación de campos
export interface FieldSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  isCollapsible: boolean;
  isExpanded: boolean;
  fields: string[]; // IDs de campos en esta sección
}

// Configuración completa de renderizado
export interface DynamicFieldsRenderConfig {
  sections: FieldSection[];
  renderConfig: FieldRenderConfig;
  theme?: 'default' | 'compact' | 'cards';
}

// === TIPOS ESPECÍFICOS PARA CAMPOS DE USUARIOS ===

// Campo dinámico específico para usuarios (almacenado en additionalData)
export interface UserField extends DynamicFieldDefinition {
  userId: string;
  isInheritable: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Configuración completa de campos para un Usuario
export interface UserFieldsConfig {
  userId: string;
  userName: string;
  userEmail: string;
  userTypeId: string;
  userTypeName: string;
  fields: UserField[];
  isActive?: boolean;
  totalFields: number;
  lastUpdated: Date;
}

// DTO para crear un nuevo campo de usuario
export interface CreateUserFieldDto {
  userId: string;
  name: string;
  label: string;
  description?: string;
  type: FieldType;
  validation?: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
  placeholder?: string;
  order?: number;
  isActive?: boolean;
  isInheritable?: boolean;
  metadata?: Record<string, any>;
}

// DTO para actualizar un campo de usuario existente
export interface UpdateUserFieldDto {
  id: string;
  name?: string;
  label?: string;
  description?: string;
  type?: FieldType;
  validation?: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
  placeholder?: string;
  order?: number;
  isActive?: boolean;
  isInheritable?: boolean;
  metadata?: Record<string, any>;
}
