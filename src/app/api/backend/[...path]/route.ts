import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    const path = params.path.join('/');
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7122';
    const backendUrl = `${backendBaseUrl}/api/${path}`;

    // console.log(`🔄 Proxy request: ${method} ${backendUrl}`);

    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Copiar headers relevantes del request original
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Preparar opciones del fetch
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Agregar body para métodos que lo requieren
    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Hacer la petición al backend usando fetch
    const response = await fetch(backendUrl, fetchOptions);

    // console.log(`📡 Backend response: ${response.status}`);

    // Obtener el contenido de la respuesta
    const responseText = await response.text();

    // Crear la respuesta con los headers apropiados
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copiar headers importantes de la respuesta del backend
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== 'content-encoding' &&
        key.toLowerCase() !== 'content-length' &&
        key.toLowerCase() !== 'transfer-encoding'
      ) {
        nextResponse.headers.set(key, value);
      }
    });

    // Agregar headers CORS si es necesario
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return nextResponse;
  } catch (error) {
    // console.error('❌ Error en proxy:', error);

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7122';

    return NextResponse.json(
      {
        error: 'Error de conexión con el backend',
        message: error instanceof Error ? error.message : 'Error desconocido',
        details: {
          backend: backendBaseUrl,
          path: params.path.join('/'),
          method,
        },
      },
      { status: 500 }
    );
  }
}

// Manejar OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
