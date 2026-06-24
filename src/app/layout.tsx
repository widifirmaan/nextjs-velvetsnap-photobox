import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ModelProvider } from '@/lib/ModelContext';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
      <body className={inter.className}>
        <ModelProvider>
          {children}
        </ModelProvider>
        <Script id="sw-cleanup" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(r) { r.unregister(); });
            });
            caches.keys().then(function(keys) {
              keys.forEach(function(k) { caches.delete(k); });
            });
          }`}
        </Script>
      </body>
    </html>
  );
}
