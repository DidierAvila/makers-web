# 🚀 Makers Web Frontend

Aplicación web frontend moderna para el sistema de gestión Makers, construida con Next.js 15 y Material-UI v7. Presenta una arquitectura modular escalable que soporta múltiples portales administrativos y de negocio.

## ⚡ Tecnologías Core

- **Framework**: Next.js 15.5.2 con App Router
- **React**: 19.1.1 con Server Components
- **TypeScript**: 5.9.2 con strict mode
- **UI Framework**: Material-UI (MUI) v7.3.2
- **Autenticación**: NextAuth.js v4.24.11
- **Data Management**: MUI X Data Grid v8.11.0
- **Fechas**: MUI X Date Pickers v8.12.0 + date-fns v4.1.0
- **Estilos**: Emotion (CSS-in-JS) v11.14.0
- **Notificaciones**: Notistack v3.0.2
- **Testing**: Jest v29.7.0
- **Code Quality**: ESLint v9.36.0 + Prettier v3.6.2

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Backend API de Makers ejecutándose

## 🛠️ Instalación

1. Clona el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
cd makers-web
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno en `.env.local`:

- URL del API backend
- Credenciales de OAuth (Google, etc.)
- Clave JWT para autenticación con el backend
- Secretos de NextAuth

## 🔑 Credenciales de Prueba

Para acceder al sistema de Makers, utiliza las siguientes credenciales de prueba:

### 👤 Usuario Administrador
```
Email: admin@test.com
Password: admin123
```

### 👤 Usuario Regular
```
Email: usuario@test.com
Password: admin123
```

**Nota**: Estas credenciales están configuradas para el entorno de desarrollo y pruebas. Asegúrate de que el backend esté ejecutándose en `http://localhost:7070` (o la URL configurada en tu `.env.local`).

## 🚀 Scripts Disponibles

### Desarrollo
- **`npm run dev`** - Inicia el servidor de desarrollo en [http://localhost:3001](http://localhost:3001)
- **`npm run build`** - Construye la aplicación para producción
- **`npm start`** - Inicia el servidor de producción en puerto 3001

### Testing
- **`npm test`** - Ejecuta las pruebas con Jest
- **`npm run test:watch`** - Ejecuta las pruebas en modo watch
- **`npm run test:auth`** - Ejecuta específicamente las pruebas de autenticación
- **`npm run test:coverage`** - Ejecuta las pruebas con reporte de cobertura

### Calidad de Código
- **`npm run lint`** - Ejecuta ESLint para revisar el código
- **`npm run lint:fix`** - Ejecuta ESLint y corrige automáticamente los errores
- **`npm run format`** - Formatea el código con Prettier
- **`npm run format:check`** - Verifica si el código está formateado correctamente
- **`npm run type-check`** - Verifica los tipos de TypeScript sin compilar
- **`npm run check-all`** - Ejecuta todas las verificaciones (tipos, lint, formato)

## 📁 Arquitectura del Proyecto

El proyecto implementa una **arquitectura modular DDD (Domain-Driven Design)** que permite escalabilidad y mantenimiento:

```
src/
├── app/                    # Next.js App Router (v15)
│   ├── api/               # API Routes + Proxy Backend
│   │   ├── auth/          # NextAuth endpoints + user profile
│   │   └── backend/       # Proxy para API principal
│   ├── auth/              # Gestión completa de usuarios
│   │   ├── users/         # CRUD usuarios con campos dinámicos
│   │   ├── roles/         # Gestión de roles del sistema
│   │   ├── permissions/   # Control granular de permisos
│   │   └── user-types/    # Tipos de usuario dinámicos
│   ├── dashboard/         # Dashboards especializados
│   │   ├── admin/         # Panel administrativo completo
│   │   └── platform/      # Dashboard de plataforma
│   └── unauthorized/      # Control de acceso

├── modules/               # Arquitectura Modular DDD
│   ├── admin/             # Dominio Administrativo
│   │   ├── components/    # UI específica admin
│   │   ├── services/      # API admin (users, roles, permissions)
│   │   ├── hooks/         # Lógica de negocio admin
│   │   └── types/         # Interfaces TypeScript
│   │
│   ├── platform/          # Dominio de Plataforma
│   │   ├── components/    # UI específica platform
│   │   ├── services/      # Servicios de plataforma
│   │   └── types/         # Tipos de plataforma
│   │
│   ├── reports/           # Módulo de Reportes
│   │   ├── components/    # UsersByTypeReport, ReportFilters
│   │   ├── services/      # reportsService API
│   │   └── types/         # Interfaces de reportes
│   │
│   └── shared/            # Dominio Compartido
│       ├── components/    # Componentes reutilizables
│       │   ├── auth/      # Login, Profile, UserProfile
│       │   ├── ui/        # DynamicForm, DynamicFieldRenderer
│       │   └── layout/    # Headers, Sidebars, Navigation
│       ├── hooks/         # useDynamicFields, useAuth, useApiData
│       ├── services/      # authService, api.ts
│       ├── contexts/      # UserContext global
│       └── types/         # Interfaces compartidas

└── lib/                   # Configuración Core
    ├── auth.ts            # NextAuth configuration
    ├── ssl-config.ts      # SSL para desarrollo
    └── cookieUtils.ts     # Gestión de cookies
```

## 🏗️ Módulos Implementados

### 📱 Módulo Admin
- **Gestión de Usuarios**: CRUD completo con campos dinámicos integrados
- **Roles y Permisos**: Sistema granular de autorización
- **Tipos de Usuario**: Clasificación dinámica con campos personalizables
- **Dashboard Administrativo**: Panel de control centralizado

### 🏢 Módulo Makers
- **Dashboard de Plataforma**: Vista específica para usuarios de plataforma
- **Servicios Especializados**: API endpoints para funcionalidades de negocio

### 📊 Módulo Reports
- **Reportes Interactivos**: Visualizaciones con Material-UI Charts
- **Filtros Dinámicos**: Por fecha, tipo usuario, estado
- **Exportación**: Datos en múltiples formatos

### 🔗 Módulo Shared
- **Dynamic Fields System**: Sistema completo de campos dinámicos
- **Componentes UI**: DynamicForm, UserProfile, FieldRenderer
- **Hooks Personalizados**: useDynamicFields, useAuth, useApiData
- **Servicios API**: Capa de abstracción para backend

## 🔐 Sistema de Autenticación

**NextAuth.js v4** con arquitectura de sesiones JWT:

### Proveedores Configurados
- **Google OAuth 2.0** ✅ Completamente integrado
- **Credenciales Custom** ✅ Login directo con backend
- **Otros proveedores** (Facebook, Microsoft, LinkedIn) - Listos para configurar

### Seguridad Implementada
- **JWT Tokens**: Manejo seguro de sesiones
- **Middleware Protection**: Rutas protegidas automáticamente
- **Role-based Access**: Control granular por roles
- **SSL Certificate**: Configuración para desarrollo HTTPS

## 🌐 Integración con Backend

**API Proxy integrado** que conecta con el backend Makers:

```javascript
// Configuración automática
NEXT_PUBLIC_API_URL=http://localhost:8000/api  // Desarrollo
NEXT_PUBLIC_API_URL=https://api.platform.com  // Producción
```

### Características de la Integración
- **Proxy Transparente**: `/api/backend/*` → Backend API
- **Autenticación Automática**: Headers JWT incluidos
- **Error Handling**: Manejo centralizado de errores
- **Type Safety**: Interfaces TypeScript completas

## 🎯 Funcionalidades Implementadas

### ✅ Portal Administrativo (`/dashboard/admin`)
- **Gestión de usuarios** - CRUD completo de usuarios del sistema
- **Gestión de roles** - Administración de roles y permisos
#### 👥 Gestión de Usuarios
- **CRUD Completo**: Crear, editar, eliminar usuarios
- **Campos Dinámicos**: Sistema de campos personalizables por tipo de usuario
- **Integración Perfecta**: Profile con campos dinámicos completamente integrados
- **Validación Avanzada**: Sistema de validación en tiempo real
- **Auto-guardado**: Persistencia automática de cambios

#### 🔐 Control de Acceso
- **Gestión de Roles**: Admin, Makers con permisos granulares
- **Gestión de Permisos**: Control específico por funcionalidad
- **Tipos de Usuario**: Sistema dinámico de clasificación
- **Middleware Protection**: Rutas protegidas automáticamente

#### 📊 Panel de Control
- **Métricas del Sistema**: Estadísticas de usuarios activos
- **Reportes Visuales**: Gráficos interactivos con Material-UI Charts
- **Dashboard Responsivo**: Optimizado para todos los dispositivos

### ✅ Portal de Plataforma (`/dashboard/platform`)
- **Dashboard Especializado**: Vista optimizada para usuarios de negocio
- **Funcionalidades Core**: Módulos operativos de la plataforma
- **UI Contextual**: Interfaz adaptada al rol de plataforma

### ✅ Sistema de Campos Dinámicos
#### 🏗️ Arquitectura de Dos Niveles
- **User Type Fields**: Campos a nivel de tipo de usuario (compartidos)
- **Personal Fields**: Campos específicos por usuario individual
- **Combinación Inteligente**: Fusión automática en una sola interfaz

#### 📝 Funcionalidades CRUD
- **Gestión Completa**: Crear, editar, eliminar campos dinámicos
- **Tipos Soportados**: text, email, number, date, select, textarea
- **Validación**: Sistema robusto con reglas personalizables
- **Secciones**: Organización en grupos lógicos

#### 🎨 UI/UX Avanzado
- **DynamicForm**: Formulario universal con layout responsivo
- **DynamicFieldRenderer**: Renderizado inteligente por tipo de campo
- **Auto-save**: Guardado automático en background
- **Loading States**: Indicadores de carga por campo

### ✅ Módulo de Reportes Completo
#### 📈 Visualizaciones Interactivas
- **PieChart**: Gráficos de torta con Material-UI Charts
- **UsersByTypeReport**: Reporte detallado con acordeones expandibles
- **Responsive Charts**: Visualizaciones adaptativas a dispositivo

#### 🔍 Filtros Avanzados
- **ReportFilters**: Componente de filtrado unificado
- **Filtros por Fecha**: Selección de rangos temporales
- **Filtros por Tipo**: Clasificación por tipo de usuario
- **Filtros Dinámicos**: Sistema extensible para nuevos criterios

#### 💾 Exportación
- **Múltiples Formatos**: Preparado para PDF, Excel, CSV
- **Data Export**: Funcionalidades de exportación de datos

### 🔄 En Desarrollo
- Gestión de asesores Makers
- Gestión de diagnósticos Makers
## 🚀 Estado de Producción

### ✅ Build Status
- **Next.js Build**: ✅ Exitoso - Bundle optimizado
- **TypeScript**: ✅ Type checking completo sin errores
- **ESLint**: ✅ Linting configurado con reglas de producción
- **Bundle Size**: ✅ Optimizado para performance

### 🔧 Optimizaciones Implementadas
- **Material-UI v7**: Compatibilidad completa con latest version
- **Console Logging**: Removido de producción via ESLint rules
- **Code Splitting**: Lazy loading por módulos
- **SSR Ready**: Server-Side Rendering habilitado

## 🧪 Testing

Sistema de pruebas **Jest + React Testing Library** configurado:

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch para desarrollo
npm run test:watch

# Pruebas específicas de autenticación
npm run test:auth

# Reporte de cobertura completo
npm run test:coverage
```

### 📋 Suite de Pruebas
- **Autenticación**: NextAuth.js + JWT validation
- **Componentes**: Dynamic Fields + UI components
- **Services**: API integration + error handling
- **Hooks**: Custom hooks + state management
- **E2E**: User flows + navigation

## 🛠️ Guía de Desarrollo

### ⚙️ Variables de Entorno
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key

# Backend API Integration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# JWT & Security
JWT_SECRET=your-jwt-secret-key
SSL_CERT_PATH=./certificates/cert.pem    # Desarrollo HTTPS
SSL_KEY_PATH=./certificates/key.pem      # Desarrollo HTTPS
```

### 🔄 Flujo de Desarrollo
```bash
# Verificaciones pre-commit
npm run check-all         # Tipos + Lint + Formato

# Desarrollo con hot-reload
npm run dev               # Puerto 3001 con SSL

# Testing continuo
npm run test:watch        # Pruebas en modo watch

# Build de producción
npm run build && npm start
```

### 🏗️ Arquitectura DDD Modular

**Beneficios del diseño modular implementado:**

#### 🎯 Domain-Driven Design
- **Admin Domain**: Gestión administrativa completa
- **Makers Domain**: Funcionalidades de negocio
- **Shared Domain**: Componentes y servicios reutilizables
- **Reports Domain**: Análisis y visualizaciones

#### 🔧 Ventajas Técnicas
- **Independencia**: Desarrollo paralelo por módulos
- **Reutilización**: Shared module con componentes comunes
- **Escalabilidad**: Agregar módulos sin afectar existentes
- **Mantenibilidad**: Lógica organizada por dominio
- **Type Safety**: TypeScript interfaces por módulo

#### 📦 Hooks Especializados
```typescript
// Dynamic Fields System
useDynamicFields()        // Master hook - dos niveles
useUserTypeFields()       // Campos por tipo de usuario
useUserPersonalFields()   // Campos personales específicos

// Authentication & API
useAuth()                 // Estado de autenticación
useApiData()             // Fetching con error handling
useApiError()            # Manejo centralizado de errores
```

## 🚀 Comandos de Producción

```bash
# Build optimizado
npm run build

# Servidor de producción
npm start

# Verificación completa
npm run type-check && npm run lint && npm run test

# Deploy ready check
npm run build && npm run type-check
```

## 🚀 Deploy & Producción

### 📦 Build de Producción
```bash
# Build optimizado con todas las verificaciones
npm run build

# Verificar build exitoso
npm run type-check

# Iniciar servidor de producción (Puerto 3001)
npm start
```

### 🌐 Consideraciones de Deploy
- **SSL Certificate**: Configurado para desarrollo HTTPS
- **Environment Variables**: Configurar variables de producción
- **Backend API**: Asegurar conectividad con API backend
- **OAuth Providers**: Configurar dominios autorizados

### 📊 Métricas de Performance
- **Bundle Size**: Optimizado con code splitting
- **SSR**: Server-Side Rendering habilitado
- **Core Web Vitals**: Optimizado para performance
- **Lighthouse Score**: Preparado para alta puntuación

## 🔗 Enlaces Importantes

### � Documentación Técnica
- **Next.js 15**: [App Router Documentation](https://nextjs.org/docs)
- **Material-UI v7**: [Components & API](https://mui.com/x/react-data-grid/)
- **NextAuth.js**: [Authentication Guide](https://next-auth.js.org/getting-started/introduction)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)

### 🏗️ Arquitectura del Sistema
- **Dynamic Fields**: Sistema de campos dinámicos de dos niveles
- **Modular DDD**: Domain-Driven Design implementation
- **Material-UI v7**: Latest version compatibility
- **Production Ready**: Optimizado para producción

---

## 👥 Equipo de Desarrollo

**Frontend Team** - Next.js + React + TypeScript
- Arquitectura modular DDD implementada
- Sistema completo de campos dinámicos
- Módulo de reportes con visualizaciones
- Integración completa con backend Makers

**Estado Actual**: ✅ **PRODUCTION READY**
- All features implemented and working
- Build successful without errors
- Code optimized for production
- Comprehensive testing suite configured

Para contribuir al proyecto, sigue las guías de desarrollo establecidas y asegúrate de que todas las pruebas pasen antes de hacer commit.
