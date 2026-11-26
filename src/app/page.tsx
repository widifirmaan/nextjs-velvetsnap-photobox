import type { Metadata } from 'next';
import HomeRedirect from './HomeRedirect';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <main style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap' }}>
        <h1>VelvetSnap - Web Photobooth Kiosk &amp; Strip Studio</h1>
        <p>Self-service web photobooth kiosk with customizable photo strip frames, webcam capture, photo filters, and QR ticket downloads.</p>
      </main>
      <HomeRedirect />
    </>
  );
}
