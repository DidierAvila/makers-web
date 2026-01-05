import ConditionalLayout from '@/modules/shared/components/layout/ConditionalLayout';
import { AuthProvider } from '@/modules/shared/components/providers/AuthProvider';
import { NotificationProvider } from '@/modules/shared/components/providers/NotificationProvider';
import { UserProvider } from '@/modules/shared/contexts/UserContext';
import NetworkStatus from '@/modules/shared/components/ui/NetworkStatus';
import PWAInstallPrompt from '@/modules/shared/components/ui/PWAInstallPrompt';
import { CookieManager } from '@/components/shared/CookieManager';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata } from 'next';
import theme from './theme';

export const metadata: Metadata = {
  title: {
    default: 'Platform - Sistema de Gestión Platform',
    template: '%s | Platform',
  },
  description:
    'Sistema integral de gestión en Seguridad y Salud en el Trabajo. Protegemos el bienestar de los trabajadores colombianos con tecnología avanzada.',
  keywords: [
    'Platform',
    'Seguridad',
    'Salud',
    'Trabajo',
    'Colombia',
    'Gestión',
    'Prevención',
    'Riesgos',
  ],
  authors: [{ name: 'Platform Team' }],
  creator: 'Platform',
  publisher: 'Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    title: 'Platform - Sistema de Gestión Platform',
    description: 'Sistema integral de gestión en Seguridad y Salud en el Trabajo',
    siteName: 'Platform',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Platform - Sistema de Gestión Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platform - Sistema de Gestión Platform',
    description: 'Sistema integral de gestión en Seguridad y Salud en el Trabajo',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: false, // No indexar durante desarrollo
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Agregar cuando tengas el código
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <NotificationProvider>
                <UserProvider>
                  <CookieManager cleanOnMount={false} cleanOnSessionChange={true} />
                  <ConditionalLayout>
                    {children}
                    <PWAInstallPrompt />
                    <NetworkStatus />
                  </ConditionalLayout>
                </UserProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
