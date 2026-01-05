import { DynamicFieldDefinition, FieldType, FieldValidation } from '../types/dynamic-fields';

/**
 * Utilidades para validación de campos dinámicos
 */

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Valida un valor según la definición del campo
 */
export function validateFieldValue(
  value: any,
  fieldDefinition: DynamicFieldDefinition
): ValidationResult {
  const errors: string[] = [];
  const { validation, type, name, label } = fieldDefinition;

  if (!validation) {
    return { isValid: true, errors: [] };
  }

  // Validación de requerido
  if (validation.required && (value === null || value === undefined || value === '')) {
    errors.push(`${label || name} es requerido`);
  }

  // Si está vacío y no es requerido, es válido
  if (!validation.required && (value === null || value === undefined || value === '')) {
    return { isValid: true, errors: [] };
  }

  // Validaciones específicas por tipo
  switch (type) {
    case 'text':
    case 'textarea':
      validateTextValue(value, validation, label || name, errors);
      break;
    case 'number':
      validateNumberValue(value, validation, label || name, errors);
      break;
    case 'email':
      validateEmailValue(value, validation, label || name, errors);
      break;
    case 'phone':
      validatePhoneValue(value, validation, label || name, errors);
      break;
    case 'date':
    case 'datetime':
      validateDateValue(value, validation, label || name, errors);
      break;
    case 'url':
      validateUrlValue(value, validation, label || name, errors);
      break;
    case 'select':
    case 'radio':
      validateSelectValue(value, fieldDefinition, label || name, errors);
      break;
    case 'multiselect':
      validateMultiSelectValue(value, fieldDefinition, label || name, errors);
      break;
    case 'checkbox':
      validateCheckboxValue(value, validation, label || name, errors);
      break;
  }

  // Validación de patrón personalizado
  if (validation.pattern && typeof value === 'string') {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(
        validation.customMessage || `${label || name} no cumple con el formato requerido`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateTextValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} debe ser texto`);
    return;
  }

  if (validation.minLength && value.length < validation.minLength) {
    errors.push(`${fieldName} debe tener al menos ${validation.minLength} caracteres`);
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    errors.push(`${fieldName} no puede exceder ${validation.maxLength} caracteres`);
  }
}

function validateNumberValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  const numValue = Number(value);

  if (isNaN(numValue)) {
    errors.push(`${fieldName} debe ser un número válido`);
    return;
  }

  if (validation.min !== undefined && numValue < validation.min) {
    errors.push(`${fieldName} debe ser mayor o igual a ${validation.min}`);
  }

  if (validation.max !== undefined && numValue > validation.max) {
    errors.push(`${fieldName} debe ser menor o igual a ${validation.max}`);
  }
}

function validateEmailValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} debe ser una dirección de email válida`);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    errors.push(`${fieldName} debe ser una dirección de email válida`);
  }
}

function validatePhoneValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} debe ser un número de teléfono válido`);
    return;
  }

  // Patrón básico para teléfono (puede ser más específico por país)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
    errors.push(`${fieldName} debe ser un número de teléfono válido`);
  }
}

function validateDateValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} debe ser una fecha válida`);
  }
}

function validateUrlValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} debe ser una URL válida`);
    return;
  }

  try {
    new URL(value);
  } catch {
    errors.push(`${fieldName} debe ser una URL válida`);
  }
}

function validateSelectValue(
  value: any,
  fieldDefinition: DynamicFieldDefinition,
  fieldName: string,
  errors: string[]
): void {
  if (!fieldDefinition.options || fieldDefinition.options.length === 0) {
    return;
  }

  const validValues = fieldDefinition.options
    .filter((option) => !option.disabled)
    .map((option) => option.value);

  if (!validValues.includes(value)) {
    errors.push(`${fieldName} debe ser una opción válida`);
  }
}

function validateMultiSelectValue(
  value: any,
  fieldDefinition: DynamicFieldDefinition,
  fieldName: string,
  errors: string[]
): void {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} debe ser una lista de opciones`);
    return;
  }

  if (!fieldDefinition.options || fieldDefinition.options.length === 0) {
    return;
  }

  const validValues = fieldDefinition.options
    .filter((option) => !option.disabled)
    .map((option) => option.value);

  const invalidValues = value.filter((v) => !validValues.includes(v));
  if (invalidValues.length > 0) {
    errors.push(`${fieldName} contiene opciones inválidas: ${invalidValues.join(', ')}`);
  }
}

function validateCheckboxValue(
  value: any,
  validation: FieldValidation,
  fieldName: string,
  errors: string[]
): void {
  if (typeof value !== 'boolean') {
    errors.push(`${fieldName} debe ser verdadero o falso`);
  }
}

/**
 * Valida múltiples valores de campos
 */
export function validateFieldValues(
  values: Record<string, any>,
  fieldDefinitions: DynamicFieldDefinition[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  fieldDefinitions.forEach((fieldDef) => {
    const value = values[fieldDef.name];
    results[fieldDef.name] = validateFieldValue(value, fieldDef);
  });

  return results;
}

/**
 * Verifica si todos los valores son válidos
 */
export function areAllFieldsValid(validationResults: Record<string, ValidationResult>): boolean {
  return Object.values(validationResults).every((result) => result.isValid);
}

/**
 * Obtiene todos los errores de validación
 */
export function getAllValidationErrors(
  validationResults: Record<string, ValidationResult>
): string[] {
  return Object.values(validationResults).flatMap((result) => result.errors);
}

/**
 * Formatea un valor según el tipo de campo para mostrar
 */
export function formatFieldValueForDisplay(
  value: any,
  fieldType: FieldType,
  options?: { value: string | number; label: string }[]
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  switch (fieldType) {
    case 'select':
    case 'radio':
      const option = options?.find((opt) => opt.value === value);
      return option ? option.label : String(value);

    case 'multiselect':
      if (!Array.isArray(value)) return String(value);
      return value
        .map((v) => {
          const opt = options?.find((opt) => opt.value === v);
          return opt ? opt.label : String(v);
        })
        .join(', ');

    case 'checkbox':
      return value ? 'Sí' : 'No';

    case 'date':
      return new Date(value).toLocaleDateString('es-ES');

    case 'datetime':
      return new Date(value).toLocaleString('es-ES');

    case 'number':
      return Number(value).toLocaleString('es-ES');

    default:
      return String(value);
  }
}

/**
 * Convierte un valor de string a su tipo correspondiente
 */
export function parseFieldValue(stringValue: string, fieldType: FieldType): any {
  if (!stringValue) return null;

  switch (fieldType) {
    case 'number':
      const num = Number(stringValue);
      return isNaN(num) ? null : num;

    case 'checkbox':
      return stringValue === 'true' || stringValue === '1';

    case 'date':
    case 'datetime':
      const date = new Date(stringValue);
      return isNaN(date.getTime()) ? null : date.toISOString();

    case 'multiselect':
      try {
        return JSON.parse(stringValue);
      } catch {
        return stringValue.split(',').map((s) => s.trim());
      }

    default:
      return stringValue;
  }
}
