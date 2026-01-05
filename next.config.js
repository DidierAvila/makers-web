/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Habilitar verificación de ESLint durante builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Habilitar verificación de TypeScript durante builds
    ignoreBuildErrors: false,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  // Configuración para desarrollo con HTTPS auto-firmado
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { dev }) => {
      if (dev) {
        // Ignorar verificación SSL en desarrollo
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        net: false,
        fs: false,
      };
      return config;
    },
  }),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7122',
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7122',
    NEXT_PUBLIC_APP_NAME: 'Platform',
    NEXT_PUBLIC_VERSION: '1.0.0',
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      // Proxy para el backend de Platform - Comentado para usar ruta API personalizada
      // {
      //   source: '/api/backend/:path*',
      //   destination: 'https://localhost:7283/api/:path*',
      // },
      // Mantener proxies existentes para compatibilidad (actualizados a puerto 7122)
      {
        source: '/api/users/:path*',
        destination: 'https://localhost:7122/api/users/:path*',
      },
      {
        source: '/api/employees/:path*',
        destination: 'https://localhost:7122/api/employees/:path*',
      },
      {
        source: '/api/customers/:path*',
        destination: 'https://localhost:7122/api/customers/:path*',
      },
      {
        source: '/api/advisors/:path*',
        destination: 'https://localhost:7122/api/advisors/:path*',
      },
      {
        source: '/api/diagnoses/:path*',
        destination: 'https://localhost:7122/api/diagnoses/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
