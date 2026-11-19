import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');
const downloadsDir = '/home/widifirmaan/Downloads';

function encodeImage(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Screenshot tidak ditemukan: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Memproses screenshot VelvetSnap Photobox...');

const images = {
  kioskHomeDesktop: encodeImage('Kiosk Home Desktop.png'),
  kioskHomeMobile: encodeImage('Kiosk Home Mobile.png'),
  viewfinderDesktop: encodeImage('Camera Viewfinder Desktop.png'),
  viewfinderMobile: encodeImage('Camera Viewfinder Mobile.png'),
  canvasDesktop: encodeImage('Canvas Editor Desktop.png'),
  canvasMobile: encodeImage('Canvas Editor Mobile.png'),
  paymentDesktop: encodeImage('Payment QRIS Desktop.png'),
  paymentMobile: encodeImage('Payment QRIS Mobile.png'),
  resultDesktop: encodeImage('Result & QR Desktop.png'),
  resultMobile: encodeImage('Result & QR Mobile.png'),
  adminStudioDesktop: encodeImage('Admin Studio Desktop.png'),
  adminDevicesDesktop: encodeImage('Admin Devices Desktop.png'),
};

console.log('Menyusun HTML presentasi dengan style murni VelvetSnap Clay & Matcha...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>VelvetSnap - Photobox Kiosk & Canvas Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f7f7f7;
      --card-bg: #f0f0f0;
      --text-primary: #262626;
      --text-secondary: #4C4C4C;
      --text-muted: #8e8e93;
      --accent-matcha: #C5D89D;
      --accent-deep: #8CA65E;
      --border-subtle: rgba(204, 204, 204, 0.4);
      --clay-radius: 24px;
      --clay-radius-lg: 32px;
      --clay-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      --font-main: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: var(--font-main);
    }

    body {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      line-height: 1.45;
      letter-spacing: -0.015em;
    }

    @page {
      size: 297mm 210mm;
      margin: 0;
    }

    .slide {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      background-color: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      padding: 14mm 18mm;
      overflow: hidden;
      background-image: radial-gradient(circle at 100% 0%, rgba(197, 216, 157, 0.12) 0%, transparent 60%);
    }

    /* Top Matcha Accent Pill */
    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 18mm;
      right: 18mm;
      height: 4px;
      background: linear-gradient(90deg, var(--accent-matcha), var(--accent-deep));
      border-radius: 0 0 4px 4px;
      z-index: 50;
    }

    /* Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      padding-bottom: 3.5mm;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-badge {
      background: var(--accent-matcha);
      color: #1e2912;
      padding: 5px 14px;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 50px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .slide-section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .slide-number {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--bg-primary);
      padding: 4px 12px;
      border-radius: 50px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    /* Body */
    .slide-body {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 22px;
      flex: 1;
      min-height: 0;
    }

    .slide-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 0;
    }

    .headline-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .slide-title {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.2;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }

    .slide-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 8px 0;
    }

    .feature-card {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      padding: 12px 16px;
      box-shadow: var(--clay-shadow);
      border: 1px solid var(--border-subtle);
      border-left: 5px solid var(--accent-matcha);
    }

    .feature-card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }

    .feature-card-text {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 10px 12px;
      text-align: center;
      box-shadow: var(--clay-shadow);
      border: 1px solid var(--border-subtle);
    }

    .metric-val {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 800;
      color: var(--accent-deep);
    }

    .metric-lbl {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Visual Stage */
    .visual-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 0;
      background: var(--bg-primary);
      border-radius: var(--clay-radius-lg);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-subtle);
      padding: 16px;
    }

    .screenshot-desktop {
      max-width: 95%;
      max-height: 380px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.08));
    }

    .screenshot-mobile {
      position: absolute;
      right: 14px;
      bottom: 8px;
      max-height: 270px;
      max-width: 29%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.12));
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5mm;
      padding-top: 3mm;
      border-top: 1px solid var(--border-subtle);
    }

    .footer-tech {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .footer-url {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: var(--accent-deep);
    }

    /* Cover Styling */
    .cover-body {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 30px;
      align-items: center;
      flex: 1;
      min-height: 0;
    }

    .cover-tagline {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-deep);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .cover-title {
      font-size: 38px;
      font-weight: 900;
      color: var(--text-primary);
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
    }

    .cover-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .cover-specs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .spec-card {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      padding: 10px 14px;
      box-shadow: var(--clay-shadow);
      border: 1px solid var(--border-subtle);
    }

    .spec-k {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .spec-v {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 2px;
    }

    /* Architecture Grid */
    .arch-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
      min-height: 0;
      margin-top: 10px;
    }

    .arch-card {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--clay-shadow);
      border: 1px solid var(--border-subtle);
    }

    .arch-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
    }

    .arch-item {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .arch-item strong {
      color: var(--text-primary);
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">PHOTOBOX KIOSK</span>
        <span class="slide-section-title">Dokumentasi Rekayasa Perangkat Lunak</span>
      </div>
      <div class="slide-number">01 / 10</div>
    </div>

    <div class="cover-body">
      <div>
        <div class="cover-tagline">Self-Service Photobooth Kiosk Architecture</div>
        <h1 class="cover-title">VelvetSnap Photobox Kiosk & Canvas Studio</h1>
        <p class="cover-desc">
          Platform booth foto mandiri (self-service photobooth) dengan desain antarmuka Claymorphism hangat dan aksen Matcha Green (#C5D89D). Mengintegrasikan kontrol kamera WebRTC, editor kanvas stiker real-time, pembayaran QRIS dinamis, dan sistem manajemen template studio.
        </p>

        <div class="cover-specs">
          <div class="spec-card">
            <div class="spec-k">Design Language</div>
            <div class="spec-v">Warm Claymorphism (24px-32px Radius)</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Accent Palette</div>
            <div class="spec-v">Matcha / Sage Green (#C5D89D)</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Frontend Framework</div>
            <div class="spec-v">Next.js 15 & React 19</div>
          </div>
          <div class="spec-card">
            <div class="spec-k">Canvas & Camera</div>
            <div class="spec-v">HTML5 Canvas & WebRTC Stream</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.kioskHomeDesktop}" class="screenshot-desktop" alt="VelvetSnap Kiosk Cover">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Next.js 15 + React 19 + HTML5 Canvas + WebRTC + Tailwind CSS</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 2: ARSITEKTUR & CLAYMORPHISM -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">ARCHITECTURE</span>
        <span class="slide-section-title">Fondasi Sistem & Desain Kiosk Claymorphism</span>
      </div>
      <div class="slide-number">02 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 8px;">
      <h2 class="slide-title">Arsitektur Kiosk & Alur Foto Tanpa Hambatan</h2>
      <p class="slide-desc">Desain antarmuka sentuh ramah pengguna dengan transisi tahap pemotretan otomatis dan isolasi pemrosesan citra kanvas di sisi klien.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-deep);">Alur Kiosk Mandiri (Self-Service)</div>
        <div class="arch-item"><strong>Transisi Tahap Terpandu:</strong> Alur sekuensial mulai dari pemilihan bingkai, countdown pengambilan pose, hingga editor stiker.</div>
        <div class="arch-item"><strong>Interaksi Layar Sentuh Bersih:</strong> Tombol besar dengan sudut membulat 24px untuk navigasi mudah pengguna segala usia.</div>
        <div class="arch-item"><strong>Reset Sesi Otomatis:</strong> Timer reset pembersihan sesi aktif bila pengguna meninggalkan booth tanpa menyelesaikan transaksi.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: #4A6B34;">Engine Kamera & Editor Kanvas</div>
        <div class="arch-item"><strong>WebRTC Video Feed:</strong> Pengambilan gambar resolusi penuh langsung dari hardware webcam studio dengan zero buffering.</div>
        <div class="arch-item"><strong>Komposisi Kanvas 2D:</strong> Penggabungan foto, filter warna (B&W, Warm, Sepia), dan stiker dekoratif pada satu buffer gambar.</div>
        <div class="arch-item"><strong>Render Ekspor Cepat:</strong> Kompresi hasil strip foto menjadi format JPEG berkualitas tinggi untuk cetak dan unduhan QR.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: #6366F1;">Integrasi Pembayaran & Admin</div>
        <div class="arch-item"><strong>Gateway QRIS Dinamis:</strong> Pembuatan kode QR pembayaran unik per sesi foto dengan deteksi verifikasi pelunasan instan.</div>
        <div class="arch-item"><strong>Studio Editor Template:</strong> Panel admin untuk mendesain layout strip bingkai, rasio aspek, dan posisi slot foto baru.</div>
        <div class="arch-item"><strong>Monitoring Perangkat Kiosk:</strong> Dashboard pemantauan status koneksi kamera dan kertas printer kasir dari jarak jauh.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">VelvetSnap Architecture Blueprint</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 3: KIOSK HOME -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">KIOSK HOME</span>
        <span class="slide-section-title">Layar Selamat Datang & Pemilihan Paket</span>
      </div>
      <div class="slide-number">03 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Beranda Booth & Pemilihan Frame</h2>
          <p class="slide-desc">Pintu masuk booth foto dengan pilihan format strip cetak (Classic Strip, Wide Grid, Polaroid) dan panduan langkah pemotretan.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Pilihan Format Strip Visual</div>
            <div class="feature-card-text">Kartu pilihan layout foto dengan pratinjau proporsional yang memudahkan pelanggan menentukan gaya strip.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Interaksi Sentuh Satu-Ketukan</div>
            <div class="feature-card-text">Tombol mulai berukuran luas yang langsung menginisialisasi kamera dan menyiapkan sesi pemotretan.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Palet Hangat Kiosk Studio</div>
            <div class="feature-card-text">Dominasi warna putih dan aksen matcha green yang memberikan suasana ramah, santai, dan estetik.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">1-Tap</div>
            <div class="metric-lbl">Session Start</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">24px</div>
            <div class="metric-lbl">Clay Radius</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Multi-Frame</div>
            <div class="metric-lbl">Template Styles</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.kioskHomeDesktop}" class="screenshot-desktop" alt="Kiosk Home Desktop">
        <img src="${images.kioskHomeMobile}" class="screenshot-mobile" alt="Kiosk Home Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/app/page.tsx</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 4: VIEWFINDER KAMERA -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">CAMERA FEED</span>
        <span class="slide-section-title">Viewfinder Kamera & Timer Countdown</span>
      </div>
      <div class="slide-number">04 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Jendela Kamera & Pengambilan Pose</h2>
          <p class="slide-desc">Layar tangkapan kamera langsung dengan indikator hitung mundur (countdown 3-2-1), flash simulasi layar, dan thumbnail foto terambil.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Aliran Video WebRTC Latensi Nol</div>
            <div class="feature-card-text">Tampilan viewfinder tajam tanpa jeda frame sehingga pelanggan dapat menyesuaikan pose dengan percaya diri.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Hitung Mundur Otomatis</div>
            <div class="feature-card-text">Animasi angka countdown besar yang diiringi efek flash putih saat rana kamera mengambil jepretan.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Strip Pratinjau Pose Terkini</div>
            <div class="feature-card-text">Thumbnail foto yang telah diambil langsung terisi di panel samping untuk memantau sisa pose foto.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">60 FPS</div>
            <div class="metric-lbl">Viewfinder Feed</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">3s</div>
            <div class="metric-lbl">Countdown Timer</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto-Snap</div>
            <div class="metric-lbl">Multi Pose</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.viewfinderDesktop}" class="screenshot-desktop" alt="Viewfinder Desktop">
        <img src="${images.viewfinderMobile}" class="screenshot-mobile" alt="Viewfinder Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Engine: WebRTC MediaDevices & Video Stream</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 5: KANVAS EDITOR -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">CANVAS STUDIO</span>
        <span class="slide-section-title">Editor Kanvas & Kustomisasi Stiker</span>
      </div>
      <div class="slide-number">05 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Editor Kanvas & Stiker Dekoratif</h2>
          <p class="slide-desc">Panggung kustomisasi foto dengan pilihan filter warna (Retro, Warm, B&W), pemilihan palet warna bingkai, dan penempelan stiker.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Manipulasi Kanvas Interaktif</div>
            <div class="feature-card-text">Stiker dapat digeser, diputar, dan diubah skalanya langsung di atas foto menggunakan gestur sentuh.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Preset Filter Warna Foto</div>
            <div class="feature-card-text">Pengaplikasian filter estetik pada seluruh rangkaian foto dengan pemrosesan piksel kanvas berkecepatan tinggi.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Koleksi Stiker Lucu & Frame</div>
            <div class="feature-card-text">Pustaka aset dekorasi yang tersusun dalam laci bawah sentuh yang ramah navigasi jari.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Canvas 2D</div>
            <div class="metric-lbl">Pixel Engine</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Realtime</div>
            <div class="metric-lbl">Sticker Drag</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Color Tint</div>
            <div class="metric-lbl">Frame Selector</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.canvasDesktop}" class="screenshot-desktop" alt="Canvas Editor Desktop">
        <img src="${images.canvasMobile}" class="screenshot-mobile" alt="Canvas Editor Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Engine: HTML5 Canvas 2D Context & Drag Handler</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 6: PEMBAYARAN QRIS -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">PAYMENT GATEWAY</span>
        <span class="slide-section-title">Integrasi Pembayaran QRIS Dinamis</span>
      </div>
      <div class="slide-number">06 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Pembayaran QRIS & Verifikasi Cepat</h2>
          <p class="slide-desc">Penyajian kode QRIS nasional untuk transaksi non-tunai dengan batas waktu kadaluarsa (countdown) dan deteksi pelunasan otomatis.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Kode QRIS Dinamis Otomatis</div>
            <div class="feature-card-text">Nominal tarif foto terkunci langsung di dalam barcode QRIS sehingga pelanggan tidak perlu input harga manual.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Polling Status Pembayaran Instan</div>
            <div class="feature-card-text">Sistem memverifikasi status pembayaran secara real-time dan langsung membuka tahap cetak setelah lunas.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Instruksi Pembayaran Ramah</div>
            <div class="feature-card-text">Petunjuk pembayaran yang mendukung seluruh aplikasi e-wallet dan mobile banking berstandar QRIS.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">QRIS</div>
            <div class="metric-lbl">Dynamic Code</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto-Poll</div>
            <div class="metric-lbl">Payment Status</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Zero Cash</div>
            <div class="metric-lbl">Cashless Kiosk</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.paymentDesktop}" class="screenshot-desktop" alt="Payment QRIS Desktop">
        <img src="${images.paymentMobile}" class="screenshot-mobile" alt="Payment QRIS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Integration: QRIS Dynamic Payment Gateway API</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 7: HASIL FOTO & QR CODE -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">RESULT & QR</span>
        <span class="slide-section-title">Hasil Cetak Fisik & Unduhan Digital</span>
      </div>
      <div class="slide-number">07 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Hasil Akhir & Pengunduhan Digital</h2>
          <p class="slide-desc">Penyelesaian sesi foto dengan pemicuan pencetakan kertas strip dan kode QR khusus bagi pelanggan untuk mengunduh softcopy foto dan video timelapse.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Pencetakan Kertas Strip Otomatis</div>
            <div class="feature-card-text">Pengiriman data cetak resolusi tinggi langsung ke antrian printer foto tanpa intervensi operator kasir.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Unduhan Softcopy via QR Code</div>
            <div class="feature-card-text">Pelanggan cukup memindai QR code di layar menggunakan kamera smartphone untuk menyimpan berkas foto asli.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Kompilasi Video Live Photo / Boomerang</div>
            <div class="feature-card-text">Penggabungan klip video pendek saat pose diambil menjadi kenang-kenangan animasi bergerak.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Dual Output</div>
            <div class="metric-lbl">Print & Softcopy</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Cloud QR</div>
            <div class="metric-lbl">Instant Download</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto Clear</div>
            <div class="metric-lbl">Session End</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.resultDesktop}" class="screenshot-desktop" alt="Result & QR Desktop">
        <img src="${images.resultMobile}" class="screenshot-mobile" alt="Result & QR Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">Engine: Print Dispatcher & Cloud Asset Storage</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 8: TEMPLATE STUDIO ADMIN -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">STUDIO CMS</span>
        <span class="slide-section-title">Editor Template Bingkai Studio</span>
      </div>
      <div class="slide-number">08 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Studio Desain Template Bingkai</h2>
          <p class="slide-desc">Panel editor visual bagi pemilik studio untuk mengunggah bingkai kustom, mengatur posisi slot foto, dan mempublikasikan tema musiman.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Editor Drag & Drop Slot Foto</div>
            <div class="feature-card-text">Pengaturan koordinat posisi foto, rotasi bingkai, dan urutan slot cetak dengan antarmuka kanvas presisi.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Manajemen Aset Stiker & Tema</div>
            <div class="feature-card-text">Pengelompokan stiker berdasarkan tema event (Valentine, Wisuda, Ulang Tahun, Liburan Musim Panas).</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Publikasi Template ke Seluruh Kiosk</div>
            <div class="feature-card-text">Satu klik untuk menyebarkan desain bingkai baru ke seluruh mesin photobox yang tersebar di berbagai cabang.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Visual</div>
            <div class="metric-lbl">Frame Builder</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Multi-Slot</div>
            <div class="metric-lbl">Layer Manager</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Live Sync</div>
            <div class="metric-lbl">Kiosk Fleet</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.adminStudioDesktop}" class="screenshot-desktop" alt="Admin Template Studio">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/app/admin/template-studio/page.tsx</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 9: MONITORING PERANGKAT KIOSK -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">FLEET ADMIN</span>
        <span class="slide-section-title">Manajemen Status Perangkat Kiosk</span>
      </div>
      <div class="slide-number">09 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Monitoring Kesehatan Perangkat Booth</h2>
          <p class="slide-desc">Dashboard kontrol armada kiosk untuk memantau status hardware kamera, sisa kuota kertas cetak, dan riwayat transaksi harian.</p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Pemeriksaan Status Hardware Realtime</div>
            <div class="feature-card-text">Indikator konektivitas kamera studio, responsivitas printer struk, dan kestabilan jaringan internet booth.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Peringatan Kertas Cetak Menipis</div>
            <div class="feature-card-text">Notifikasi otomatis bila kapasitas kertas foto printer mendekati ambang batas isi ulang staf.</div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Statistik Penjualan & Jam Sibuk</div>
            <div class="feature-card-text">Rekapitulasi volume transaksi harian untuk mengevaluasi efektivitas penempatan lokasi photobox.</div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">24/7</div>
            <div class="metric-lbl">Device Heartbeat</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Paper Gauge</div>
            <div class="metric-lbl">Printer Monitor</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Fleet View</div>
            <div class="metric-lbl">Multi Booth</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.adminDevicesDesktop}" class="screenshot-desktop" alt="Admin Devices Fleet">
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">View: src/app/admin/devices/page.tsx</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

  <!-- SLIDE 10: SPESIFIKASI PRODUKSI -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <span class="brand-badge">SPECIFICATION</span>
        <span class="slide-section-title">Ringkasan Spesifikasi & Kesiapan Produksi</span>
      </div>
      <div class="slide-number">10 / 10</div>
    </div>

    <div class="headline-group" style="margin-bottom: 8px;">
      <h2 class="slide-title">Spesifikasi Teknis & Kesiapan Operasional</h2>
      <p class="slide-desc">Ringkasan performa Next.js 15, kepatuhan keamanan transaksi, dan kehandalan operasional mandiri photobox di pusat perbelanjaan.</p>
    </div>

    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title" style="color: var(--accent-deep);">Performa & Efisiensi Kanvas</div>
        <div class="arch-item"><strong>Lighthouse Score:</strong> 97+ pada Best Practices, Accessibility, dan Performance.</div>
        <div class="arch-item"><strong>Render Gambar 4K:</strong> Penggabungan strip kanvas beresolusi tinggi dalam waktu kurang dari 800ms.</div>
        <div class="arch-item"><strong>Pembersihan Memori Otomatis:</strong> Penghapusan URL Blob lokal setelah ekspor selesai untuk mencegah memori bocor.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: #4A6B34;">Keamanan & Integritas Kiosk</div>
        <div class="arch-item"><strong>Mode Kiosk Terkunci:</strong> Perlindungan antarmuka browser layar penuh dari penutupan jendela oleh pengunjung umum.</div>
        <div class="arch-item"><strong>Privasi Foto Pelanggan:</strong> Penghapusan berkas foto sementara secara berkala sesuai kebijakan retensi privasi pengguna.</div>
        <div class="arch-item"><strong>Verifikasi Webhook QRIS:</strong> Tanda tangan kriptografis untuk memvalidasi pembayaran sebelum pencetakan dipicu.</div>
      </div>

      <div class="arch-card">
        <div class="arch-title" style="color: #6366F1;">Infrastruktur & Deployment</div>
        <div class="arch-item"><strong>Next.js 15 App Router:</strong> Server-side rendering untuk halaman manajemen dan client-side kustomisasi kanvas.</div>
        <div class="arch-item"><strong>Kompatibilitas Hardware:</strong> Beroperasi lancar dengan webcam USB Logitech/Razer, monitor layar sentuh, dan DNP photo printer.</div>
        <div class="arch-item"><strong>Operasional Mandiri:</strong> Ketersediaan tanpa henti dengan prosedur pemulihan otomatis jika aplikasi dimulai ulang.</div>
      </div>
    </div>

    <div class="slide-footer">
      <span class="footer-tech">VelvetSnap Production Specification Document</span>
      <span class="footer-url">velvetsnap.widifirmaan.web.id</span>
    </div>
  </section>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML presentasi disimpan di: ${htmlFilePath}`);

async function renderPDF() {
  console.log('Menjalankan Playwright Chromium untuk render PDF VelvetSnap Claymorphism...');
  
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluateHandle('document.fonts.ready');

  const slidePdfPath = path.join(downloadsDir, 'VelvetSnap.pdf');
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  console.log('Rendering Continuous Single-Scroll Showcase (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background-color: #f7f7f7 !important;
      }
      .slide {
        page-break-after: unset !important;
        page-break-inside: avoid !important;
        margin-bottom: 0px !important;
        box-shadow: none !important;
      }
    `
  });

  await page.waitForTimeout(500);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const contPdfPath = path.join(downloadsDir, 'VelvetSnap-Continuous.pdf');
  await page.pdf({
    path: contPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(contPdfPath);

  console.log('\nPDF VelvetSnap Claymorphism berhasil dibuat:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${contPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Gagal membuat PDF:', err);
  process.exit(1);
});
