import type { Metadata } from 'next';
import { UnifrakturMaguntia, EB_Garamond } from 'next/font/google';
import V2ThemeProvider from './V2ThemeProvider';

const unifraktur = UnifrakturMaguntia({ subsets: ['latin'], display: 'swap', variable: '--font-unifraktur', weight: '400' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-ebgaramond' });

export const metadata: Metadata = {
  title: 'VelvetSnap — Vintage Photobooth',
  description: 'Step into our vintage photobooth — pick a frame, snap your photos, and walk away with a timeless keepsake.',
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${unifraktur.variable} ${ebGaramond.variable}`} style={{ height: '100%' }}>
      <V2ThemeProvider>
        {children}
      </V2ThemeProvider>
    </div>
  );
}
