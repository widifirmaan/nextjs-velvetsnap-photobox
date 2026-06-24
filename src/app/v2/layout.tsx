import type { Metadata } from 'next';
import { Playfair_Display, Courier_Prime } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair' });
const courier = Courier_Prime({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', variable: '--font-courier' });

export const metadata: Metadata = {
  title: 'VelvetSnap — Vintage Photobooth',
  description: 'Step into our vintage photobooth — pick a frame, snap your photos, and walk away with a timeless keepsake.',
};

const cssVars = {
  '--np-bg': '#f5f0e8',
  '--np-card': '#faf6ef',
  '--np-text': '#1a1a1a',
  '--np-text-secondary': '#4a4a4a',
  '--np-text-muted': '#8a8a8a',
  '--np-border': '#1a1a1a',
  '--np-accent': '#c73e3e',
  '--np-accent-hover': '#a83232',
  '--np-gold': '#d4a017',
  '--np-shadow': '6px 6px 0px #1a1a1a',
  '--np-shadow-sm': '3px 3px 0px #1a1a1a',
  '--np-radius': '0px',
  '--np-radius-sm': '0px',
  '--font-heading': 'var(--font-playfair, Playfair Display, Times New Roman, serif)',
  '--font-body': 'var(--font-courier, Courier Prime, Courier New, monospace)',
  '--font-sans': 'Inter, -apple-system, sans-serif',
} as React.CSSProperties;

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${courier.variable}`} style={{ height: '100%', ...cssVars }}>
      {children}
    </div>
  );
}
