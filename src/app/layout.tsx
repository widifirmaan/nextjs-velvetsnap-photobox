import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ModelProvider } from '@/lib/context/ModelContext';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://photo.widifirmaan.web.id'),
  title: {
    default: 'VelvetSnap - Web Photobooth Kiosk & Strip Studio',
    template: '%s | VelvetSnap',
  },
  description: 'Self-service web photobooth kiosk with customizable photo strip frames, webcam capture, photo filters, and QR ticket downloads.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://photo.widifirmaan.web.id/',
    siteName: 'VelvetSnap',
    title: 'VelvetSnap - Web Photobooth Kiosk & Strip Studio',
    description: 'Self-service web photobooth kiosk with customizable photo strip frames, webcam capture, photo filters, and QR ticket downloads.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VelvetSnap - Web Photobooth Kiosk & Strip Studio',
    description: 'Self-service web photobooth kiosk with customizable photo strip frames, webcam capture, photo filters, and QR ticket downloads.',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
