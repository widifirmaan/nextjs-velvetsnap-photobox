import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modern Photobooth Studio',
  description: 'Create custom photo strips with filters, webcam capture, QR payments, and instant print downloads on VelvetSnap v1.',
  alternates: {
    canonical: '/v1',
  },
  openGraph: {
    url: 'https://photo.widifirmaan.web.id/v1',
    title: 'VelvetSnap Modern Photobooth Studio',
    description: 'Create custom photo strips with filters, webcam capture, QR payments, and instant print downloads.',
    images: [{ url: '/og-image.png', alt: 'VelvetSnap Photobooth Kiosk' }],
  },
};

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return children;
}
