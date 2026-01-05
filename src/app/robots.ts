/**
 * Robots.txt dinámico - Next.js TypeScript
 * Platform Web Frontend - Configuración de robots para SEO
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://platform.com' // Reemplazar con tu dominio real
      : 'http://localhost:3001';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/signin', '/public/'],
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/employees/',
        '/auth/error',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
