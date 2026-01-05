# Guía de Desarrollo - Platform Web

## Herramientas de Calidad de Código

Este proyecto utiliza las siguientes herramientas para mantener la calidad del código:

### ESLint

- **Propósito**: Análisis estático de código para identificar problemas y errores
- **Configuración**: `eslint.config.mjs`
- **Comando**: `npm run lint`
- **Corrección automática**: `npm run lint:fix`

### Prettier

- **Propósito**: Formateo automático de código
- **Configuración**: `.prettierrc`
- **Comando**: `npm run format`
- **Verificación**: `npm run format:check`

### TypeScript

- **Propósito**: Verificación de tipos
- **Comando**: `npm run type-check`

## Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Inicia el servidor de desarrollo

# Construcción
npm run build              # Construye la aplicación para producción
npm start                  # Inicia la aplicación en modo producción

# Calidad de código
npm run lint               # Ejecuta ESLint
npm run lint:fix           # Ejecuta ESLint y corrige automáticamente
npm run format             # Formatea el código con Prettier
npm run format:check       # Verifica el formato sin modificar
npm run type-check         # Verifica tipos de TypeScript
npm run check-all          # Ejecuta todas las verificaciones
```

## Configuración del Editor

### VS Code

Se incluyen configuraciones recomendadas en `.vscode/`:

- **settings.json**: Configuración automática de formateo y linting
- **extensions.json**: Extensiones recomendadas

### Extensiones Recomendadas

- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense

## Flujo de Trabajo Recomendado

1. **Antes de hacer commit**:

   ```bash
   npm run check-all
   ```

2. **Para corregir problemas automáticamente**:

   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Verificar tipos antes de push**:
   ```bash
   npm run type-check
   ```

## Reglas de ESLint Configuradas

- `no-console`: Advertencia para console.log
- `@typescript-eslint/no-unused-vars`: Error para variables no utilizadas
- `@typescript-eslint/no-explicit-any`: Advertencia para uso de 'any'
- `@typescript-eslint/no-inferrable-types`: Error para tipos inferibles
- `no-var`: Error para uso de 'var'

## Configuración de Prettier

- Punto y coma: Sí
- Comillas simples: Sí
- Coma final: ES5
- Ancho de línea: 80
- Tamaño de tab: 2
- Espacios en lugar de tabs: Sí
