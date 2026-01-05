/**
 * API Request Configuration
 * Handles API requests with appropriate headers
 */

import { RequestInit } from 'next/dist/server/web/spec-extension/request';

/**
 * Función para realizar peticiones a la API
 * Esta función configura las cabeceras adecuadas para comunicarse con la API
 */
export function fetchWithSSL(url: string, options: RequestInit = {}): Promise<Response> {
  // Asegurar que las cabeceras existan
  if (!options.headers) {
    options.headers = {};
  }

  // Convertir las cabeceras a un objeto manipulable
  const headers = options.headers as Record<string, string>;

  // Configurar cabeceras estándar para API REST
  if (!headers['Accept']) headers['Accept'] = 'application/json';
  if (!headers['Content-Type'] && options.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  // Realizar la petición con manejo de errores mejorado
  return fetch(url, options as RequestInit).catch((error) => {
    throw new Error(`Error de conexión con la API (${url}): ${error.message}`);
  });
}
