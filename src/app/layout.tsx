import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VelvetSnap Co.',
  description: 'Aesthetic photobooth web application',
  manifest: '/manifest.json', // for PWA later
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
