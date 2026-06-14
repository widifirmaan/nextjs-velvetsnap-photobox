import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ModelProvider } from '@/lib/ModelContext';

export const metadata: Metadata = {
  title: 'VelvetSnap Co.',
  description: 'Aesthetic photobooth web application',
  manifest: '/manifest.json', // for PWA later
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>
        <ModelProvider>
          {children}
        </ModelProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(r) { r.unregister(); });
                });
                caches.keys().then(function(keys) {
                  keys.forEach(function(k) { caches.delete(k); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
