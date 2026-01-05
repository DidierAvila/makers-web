/**
 * API para configuración del usuario - /Auth/me
 * Platform Web Frontend - Next.js TypeScript
 * Redirige las peticiones al backend real
 */

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { Agent } from 'https';

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de NextAuth para identificar al usuario
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No autorizado - Token inválido o faltante',
        },
        { status: 401 }
      );
    }

    // Para usuarios OAuth (Google, Facebook, etc.), devolver información del token
    if (
      !token.accessToken ||
      (typeof token.accessToken === 'string' && token.accessToken.startsWith('oauth-temp-'))
    ) {
      return NextResponse.json({
        success: true,
        data: {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          status: token.status,
          department: token.department,
          position: token.position,
          avatar: token.avatar,
          provider: 'oauth',
        },
        message: 'Configuración de usuario OAuth obtenida exitosamente',
      });
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5062';
    const response = await fetch(`${backendUrl}/api/Auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      // Ignorar errores de certificado SSL en desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        agent: new Agent({
          rejectUnauthorized: false,
        }),
      }),
    });

    if (!response.ok) {
      // const errorData = await response.text();
      // console.error('Backend response error:', response.status, errorData);

      return NextResponse.json(
        {
          success: false,
          message: 'Error al obtener configuración del usuario',
          error: `Backend returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Configuración de usuario obtenida exitosamente',
    });
  } catch (error) {
    // console.error('Error en GET /Auth/me:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
