/**
 * Countries Service - Servicio para gestión de países
 * Platform Web Frontend - Next.js TypeScript
 */

import { getSession } from 'next-auth/react';

// Interface para país en dropdown
export interface CountryDropdown {
  value: string; // Código del país
  label: string; // Nombre del país
}

class CountriesService {
  private readonly backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5180';
  private readonly baseEndpoint = '/api/Countries';

  /**
   * Obtener headers de autenticación
   */
  private async getHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  /**
   * Manejar errores de respuesta HTTP
   */
  private async handleResponseError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    // Logs específicos para errores de autenticación
    if (response.status === 401) {
      console.error('🚫 Error 401 - No autorizado. Verificando autenticación...');
      const session = await getSession();
      console.error('📋 Estado de la sesión:', {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        sessionKeys: session ? Object.keys(session) : 'No session',
      });
    }

    // Intentar obtener mensaje de error del backend
    try {
      const errorData = await response.text();
      if (errorData) {
        errorMessage = errorData;
        console.error('📄 Mensaje de error del backend:', errorData);
      }
    } catch {
      // Si no se puede parsear, usar el mensaje por defecto
    }

    console.error('❌ Error en petición:', {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
    });

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  /**
   * Obtener países para dropdown
   */
  async getCountriesDropdown(): Promise<CountryDropdown[]> {
    const url = `${this.backendUrl}${this.baseEndpoint}/dropdown`;

    try {
      const headers = await this.getHeaders();

      console.log('🌍 Cargando países desde:', {
        method: 'GET',
        url,
        hasAuthHeader: !!(headers as Record<string, string>).Authorization,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📬 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        await this.handleResponseError(response);
      }

      const countries = await response.json();
      console.log('✅ Países cargados exitosamente:', countries.length);
      console.log('📋 Estructura de países recibida:', countries.slice(0, 3)); // Mostrar primeros 3 para debug

      // Filtrar países válidos para evitar errores de keys
      const validCountries = countries.filter(
        (country: any) =>
          country &&
          typeof country.value === 'string' &&
          country.value.trim() !== '' &&
          typeof country.label === 'string' &&
          country.label.trim() !== ''
      );

      console.log('✅ Países válidos después del filtro:', validCountries.length);

      return validCountries;
    } catch (error) {
      console.error('Error fetching countries dropdown:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const countriesService = new CountriesService();
