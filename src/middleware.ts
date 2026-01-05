/**
 * Middleware de Autenticación - Platform Web
 * Protege rutas y maneja redirecciones automáticas
 */

import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de NextAuth JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'auth.s',
  });

  // Rutas públicas que NO requieren autenticación
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/auth/verify',
    '/test-session',
  ];

  // ✅ PERMITIR: Rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Si usuario autenticado trata de ir al login → Dashboard
    if (token && pathname === '/auth/signin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 🏠 REDIRIGIR: Ruta raíz
  if (pathname === '/') {
    const destination = token ? '/dashboard' : '/auth/signin';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 🚫 BLOQUEAR: Usuarios no autenticados
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ⚠️ BLOQUEAR: Usuarios inactivos (solo si el token tiene datos válidos)
  // Si el token existe pero los datos están vacíos, permitir acceso para evitar bucles
  if (token.status && token.status !== 'active' && token.id && token.email) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('error', 'AccessDenied');
    return NextResponse.redirect(signInUrl);
  }

  // Si el token existe pero los datos están vacíos, permitir acceso
  if (token && (!token.id || !token.email)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 👑 CONTROL DE ROLES: Rutas administrativas
  const adminRoutes = ['/admin', '/settings'];
  const supervisorRoutes = ['/reports', '/analytics'];

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token.role || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (supervisorRoutes.some((route) => pathname.startsWith(route))) {
    if (!token.role || !['admin', 'supervisor'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ✅ PERMITIR: Usuario autenticado con permisos correctos
  return NextResponse.next();
}

// Configuración: Rutas que debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Incluir todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (ícono del sitio)
     * - api/auth/* (rutas de autenticación de NextAuth)
     * - @vite/* (recursos de desarrollo de Vite)
     * - *.js, *.css, *.png, *.jpg, etc. (archivos estáticos)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|@vite|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$).*)',
  ],
};
