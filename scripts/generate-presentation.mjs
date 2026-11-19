#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');
const downloadsDir = '/home/widifirmaan/Downloads';
const artifactsDir = '/home/widifirmaan/.gemini/antigravity-cli/brain/08ebf919-b450-4a62-aa6d-40dba251fefc';

// Require Playwright from qa-toolkit
const { chromium } = await import('/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs');

function loadBase64Image(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: Image not found: ${filePath}`);
    return '';
  }
  const buffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

console.log('🖼️  Encoding VelvetSnap screenshots into high-resolution base64 data URIs...');
const imgKioskHome = loadBase64Image('Kiosk Home Desktop.png');
const imgTemplateCatalog = loadBase64Image('Newspaper Template Catalog Desktop.png');
const imgCamera = loadBase64Image('Camera Viewfinder Desktop.png');
const imgCanvasEditor = loadBase64Image('Canvas Editor Desktop.png');
const imgPayment = loadBase64Image('Payment QRIS Desktop.png');
const imgResult = loadBase64Image('Result & QR Desktop.png');
const imgStudio = loadBase64Image('Admin Studio Desktop.png');
const imgDevices = loadBase64Image('Admin Devices Desktop.png');
const imgHistory = loadBase64Image('Admin History Desktop.png');
const imgNewspaperTheme = loadBase64Image('Newspaper Theme Desktop.png');

console.log('🎨 Constructing VelvetSnap Vintage Newspaper Kiosk presentation deck...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>VelvetSnap Photobox Kiosk - Presentasi Arsitektur &amp; Fitur Web</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap');

  @page {
    size: 297mm 210mm;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: #f7f4ed;
    color: #262626;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slide {
    width: 297mm;
    height: 210mm;
    padding: 14mm 16mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #f7f4ed radial-gradient(circle at 50% 0%, rgba(220, 214, 200, 0.45) 0%, rgba(247, 244, 237, 1) 75%);
    border-bottom: 2px dashed #d1c7b7;
  }

  /* Paper texture pattern */
  .paper-bg {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(#262626 0.75px, transparent 0.75px),
      radial-gradient(#262626 0.75px, #f7f4ed 0.75px);
    background-size: 30px 30px;
    background-position: 0 0, 15px 15px;
    opacity: 0.04;
    pointer-events: none;
    z-index: 1;
  }

  .slide-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Clay & Vintage Card */
  .vintage-card {
    background: #ffffff;
    border: 2px solid #262626;
    border-radius: 18px;
    padding: 16px 20px;
    box-shadow: 4px 4px 0px #262626;
    color: #262626;
  }

  /* Pill Badge */
  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 15px;
    border-radius: 9999px;
    background: #eef3e8;
    border: 1.5px solid #262626;
    color: #2a4025;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    width: fit-content;
    box-shadow: 2px 2px 0px #262626;
  }

  .pill-badge.terracotta {
    background: #faece7;
    color: #8c3b24;
  }

  .pill-badge.amber {
    background: #fef5e7;
    color: #855312;
  }

  /* Typography */
  .serif-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.3rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: #1a1a1a;
  }

  /* Vintage Mockup Frame */
  .mockup-frame {
    background: #ffffff;
    border: 2.5px solid #262626;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 6px 6px 0px #262626;
    display: flex;
    flex-direction: column;
  }

  .mockup-header {
    background: #f0ebe1;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 2px solid #262626;
  }

  .traffic-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid #262626;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .browser-url {
    margin-left: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #555555;
    font-weight: 700;
  }

  .mockup-img {
    width: 100%;
    height: auto;
    max-height: 122mm;
    display: block;
    object-fit: contain;
    background: #faf7f2;
  }

  /* Page Number Stamp */
  .page-num {
    position: absolute;
    bottom: 11mm;
    right: 14mm;
    background: #262626;
    color: #faf7f2;
    border: 2px solid #262626;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 14px;
    border-radius: 9999px;
    letter-spacing: 0.12em;
    box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
    z-index: 10;
  }

  /* Split layout */
  .split-layout {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 26px;
    align-items: center;
    height: 100%;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .split-layout.reverse {
    grid-template-columns: 1.25fr 1fr;
  }

  /* Feature Checklist Item */
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 8px;
  }

  .feature-icon {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: #262626;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .feature-text h4 {
    font-size: 12px;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .feature-text p {
    font-size: 10px;
    color: #555555;
    line-height: 1.45;
  }
</style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- SLIDE 01: COVER -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content" style="justify-content: center; align-items: center; text-align: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 860px;">
        <div class="pill-badge">
          <span>●</span> WEB APPLICATION SHOWCASE · 2026
        </div>
        <h1 class="serif-title" style="font-size: 4rem; line-height: 1; text-transform: uppercase;">
          VELVETSNAP <span style="color: #8b9d77; font-style: italic;">PHOTOBOX</span>
        </h1>
        <div class="vintage-card" style="padding: 12px 28px; margin-top: 4px;">
          <p style="font-size: 14px; font-weight: 700; color: #262626; letter-spacing: 0.02em;">
            Sistem Kiosk Photobooth Mandiri Berbasis Next.js &amp; React-Konva Canvas
          </p>
        </div>
        
        <p style="font-size: 11.5px; color: #555555; max-width: 680px; line-height: 1.6; margin-top: 4px;">
          Arsitektur aplikasi web kiosk otomatis yang mengintegrasikan alur kamera WebRTC, pemilihan layout strip foto (2x6 &amp; 4R), editor stiker canvas interaktif, pembayaran QRIS dinamis, dan portal download foto instan via QR code.
        </p>

        <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; justify-content: center;">
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">Next.js 16</span>
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">React 19</span>
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">React-Konva</span>
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">WebRTC MediaStream</span>
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">Cloudflare D1 / SQLite</span>
          <span style="font-size: 10px; font-weight: 800; color: #262626; background: #ffffff; border: 1.5px solid #262626; padding: 4px 12px; border-radius: 9999px; box-shadow: 2px 2px 0px #262626;">Tailwind CSS</span>
        </div>

        <div style="margin-top: 26px; border-top: 2px dashed #d1c7b7; padding-top: 14px; width: 100%;">
          <p style="font-size: 11px; font-weight: 800; color: #1a1a1a; letter-spacing: 0.1em; text-transform: uppercase;">
            WIDI FIRMAAN <span style="color: #888888; font-weight: 400;">|</span> LEAD FULLSTACK DEVELOPER
          </p>
          <p style="font-size: 9.5px; color: #666666; margin-top: 2px;">Dokumentasi &amp; Presentasi Arsitektur Web Kiosk</p>
        </div>
      </div>
    </div>
    <div class="page-num">01</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 02: FITUR WEB - DUAL THEME ENGINE -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout">
        <!-- Left: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge">
            <span>01</span> FITUR WEB: DUAL-THEME ENGINE
          </div>
          <h2 class="serif-title">
            Dual-Theme Kiosk Landing Page
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Halaman utama kiosk mandiri yang mendukung dua tema visual berbeda secara dinamis: V1 Minimal Modern dan V2 Newspaper Vintage, dilengkapi efek transisi lembaran koran 3D (<code style="font-family:monospace; background:#eee; padding:1px 4px; border-radius:4px">pageFlipOut</code> &amp; <code style="font-family:monospace; background:#eee; padding:1px 4px; border-radius:4px">pageFlipBack</code>).
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">
                <h4>CSS Variable Theme Scoping</h4>
                <p>Isolasi variabel warna global (<code style="color:#111">--mn-bg</code>, <code style="color:#111">--np-bg</code>) yang berganti instan saat rute tema berpindah.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">
                <h4>3D Perspective Card Flip (1600px)</h4>
                <p>Simulasi animasi membalik lembaran koran dengan origin transform kiri/kanan saat sesi dimulai.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">
                <h4>Status Kiosk Standby</h4>
                <p>Tombol interaktif beranimasi mengambang untuk menarik pengguna melakukan sentuhan pertama.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/</span>
          </div>
          <img class="mockup-img" src="${imgKioskHome}" alt="Kiosk Home Stage" />
        </div>
      </div>
    </div>
    <div class="page-num">02</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 03: FITUR WEB - TEMPLATE STRIP SELECTOR -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout reverse">
        <!-- Left: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/v2?step=1</span>
          </div>
          <img class="mockup-img" src="${imgTemplateCatalog}" alt="Template Catalog Selector" />
        </div>

        <!-- Right: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge terracotta">
            <span>02</span> FITUR WEB: TEMPLATE CATALOG
          </div>
          <h2 class="serif-title">
            Dynamic Frame Strip Selector
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Katalog pemilihan bingkai foto dengan dukungan multi-layout: Strip Foto vertikal (2x6) dan bingkai kartu cetak lebar (4R). Setiap kartu template menampilkan indikator jumlah slot foto dan visualisasi batas cetak.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">✦</div>
              <div class="feature-text">
                <h4>Komponen Caching SharedTemplateStep</h4>
                <p>Memuat dan menyimpan cache template di client-side untuk respons navigasi instan tanpa re-fetch.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">✦</div>
              <div class="feature-text">
                <h4>Indikator Titik Slot Foto (SlotDots.tsx)</h4>
                <p>Visualisasi visual jumlah foto yang harus diambil (3 slot, 4 slot, atau 6 slot) per bingkai.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">✦</div>
              <div class="feature-text">
                <h4>Kalkulasi Rasio frameRatio Dinamis</h4>
                <p>Menghitung proporsi kanvas sebelum melangkah ke viewfinder kamera agar crop foto presisi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-num">03</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 04: FITUR WEB - WEBRTC CAMERA & COUNTDOWN -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout">
        <!-- Left: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge amber">
            <span>03</span> FITUR WEB: WEBRTC CAMERA
          </div>
          <h2 class="serif-title">
            Real-time Viewfinder &amp; Capture Loop
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Antarmuka kamera langsung memanfaatkan WebRTC MediaStream API dengan overlay bingkai tembus pandang, hitung mundur otomatis (<code style="font-family:monospace; background:#eee; padding:1px 4px; border-radius:4px">useCountdown</code> 3..2..1), dan sistem antrean multi-slot foto.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">⚡</div>
              <div class="feature-text">
                <h4>Integrasi React-Webcam Kompatibel</h4>
                <p>Akses streaming video perangkat keras dengan kontrol resolusi tinggi dan aspect-ratio mirror.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">⚡</div>
              <div class="feature-text">
                <h4>Siklus Countdown &amp; Flash Effect</h4>
                <p>Animasi hitung mundur visual dengan efek blitz layar putih saat jepretan kamera dieksekusi.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">⚡</div>
              <div class="feature-text">
                <h4>Buffer Array Captures Multi-Slot</h4>
                <p>Menyimpan hasil jepretan dalam state array dengan fitur pratinjau thumbnail dan opsi retake foto.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/v2?step=2</span>
          </div>
          <img class="mockup-img" src="${imgCamera}" alt="Camera Viewfinder Web Session" />
        </div>
      </div>
    </div>
    <div class="page-num">04</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 05: FITUR WEB - REACT-KONVA CANVAS EDITOR -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout reverse">
        <!-- Left: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/v2?step=3</span>
          </div>
          <img class="mockup-img" src="${imgCanvasEditor}" alt="React-Konva Canvas Editor" />
        </div>

        <!-- Right: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge">
            <span>04</span> FITUR WEB: CANVAS EDITOR
          </div>
          <h2 class="serif-title">
            Client-Side Canvas Photo Editor
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Editor visual client-side berbasis <strong style="color:#111">React-Konva</strong> untuk merakit strip foto komposit. Pengguna dapat menyematkan stiker, mengatur kecerahan/kontras, memutar sudut foto, dan memilih filter monokrom koran vintage.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">
                <h4>Multi-Layer Canvas Compositing</h4>
                <p>Pemisahan layer Frame Background, layer Foto Pengguna, dan layer Stiker Interaktif secara independen.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">
                <h4>Transformasi Stiker Drag &amp; Rotate</h4>
                <p>Dukungan interaksi sentuh dan mouse untuk rotasi, pembesaran skala, dan translasi posisi stiker grafis.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">
                <h4>Ekspor Canvas Berkualitas Tinggi</h4>
                <p>Fungsi render komposit toDataURL pada resolusi cetak tinggi tanpa perlu proses upload berat ke server.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-num">05</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 06: FITUR WEB - QRIS PAYMENT GATEWAY -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout">
        <!-- Left: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge terracotta">
            <span>05</span> FITUR WEB: PAYMENT FLOW
          </div>
          <h2 class="serif-title">
            Dynamic QRIS Payment Modal
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Alur pembayaran mandiri non-tunai yang terintegrasi secara otomatis. Sistem menghasilkan kode QR QRIS dinamis sesuai tarif sesi, dengan interval polling status transaksi secara real-time.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">💳</div>
              <div class="feature-text">
                <h4>Hook Kustom usePaymentFlow</h4>
                <p>Mengelola state inisialisasi invoice, timer kedaluwarsa pembayaran, dan auto-cancel sesi kiosk.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">💳</div>
              <div class="feature-text">
                <h4>Polling Real-time Status Transaksi</h4>
                <p>Interval query setiap 2 detik ke endpoint verifikasi status pembayaran untuk mendeteksi transaksi lunas.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">💳</div>
              <div class="feature-text">
                <h4>Transisi Otomatis Cetak Struk / Foto</h4>
                <p>Secara otomatis melangkah ke tahap pencetakan hasil foto segera setelah konfirmasi webhook valid diterima.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/v2?step=4</span>
          </div>
          <img class="mockup-img" src="${imgPayment}" alt="Payment QRIS Integration" />
        </div>
      </div>
    </div>
    <div class="page-num">06</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 07: FITUR WEB - RESULT & MOBILE QR DOWNLOAD -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout reverse">
        <!-- Left: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/v2?step=5</span>
          </div>
          <img class="mockup-img" src="${imgResult}" alt="Result and QR Download Portal" />
        </div>

        <!-- Right: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge amber">
            <span>06</span> FITUR WEB: INSTANT DOWNLOAD
          </div>
          <h2 class="serif-title">
            High-Res Print &amp; Mobile QR Portal
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Seksi finalisasi yang menampilkan pratinjau strip foto selesai dicetak, sekaligus men-generate kode QR unik di layar agar pelanggan dapat langsung mengunduh file foto digital beresolusi penuh ke smartphone masing-masing.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">📱</div>
              <div class="feature-text">
                <h4>Generator Kode QR Client-Side</h4>
                <p>Membuat tautan instan ke rute portal download publik (<code style="color:#111">/v1/download</code> atau <code style="color:#111">/v2/download</code>).</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">📱</div>
              <div class="feature-text">
                <h4>Enkripsi Token Sesi &amp; Batas Waktu</h4>
                <p>Melindungi privasi foto dengan URL ber-token unik dan mekanisme kedaluwarsa otomatis (auto-expiry).</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#855312;">📱</div>
              <div class="feature-text">
                <h4>Dukungan Download Ganda</h4>
                <p>Menyediakan unduhan strip foto utuh (PNG 300 DPI) dan animasi rekaman sesi GIF singkat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-num">07</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 08: FITUR WEB - ADMIN TEMPLATE STUDIO -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout">
        <!-- Left: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge">
            <span>07</span> FITUR WEB: ADMIN STUDIO
          </div>
          <h2 class="serif-title">
            Visual Slot Calibration Studio
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Panel studio visual di area administrasi (<code style="font-family:monospace; background:#eee; padding:1px 4px; border-radius:4px">/admin/template-studio</code>) untuk mendesain dan mengalibrasi koordinat slot foto pada bingkai kustom secara drag-and-drop.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon">📐</div>
              <div class="feature-text">
                <h4>Bounding Box Manipulator Visual</h4>
                <p>Menentukan nilai X, Y, Width, Height, dan rotasi setiap kotak foto secara real-time pada kanvas.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📐</div>
              <div class="feature-text">
                <h4>Live Preview dengan Gambar Mockup</h4>
                <p>Memvalidasi keselarasan bingkai sebelum template dirilis ke katalog aktif pengguna kiosk.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📐</div>
              <div class="feature-text">
                <h4>Ekspor Skema JSON ke Database</h4>
                <p>Menyimpan data konfigurasi slot secara terstruktur ke Cloudflare D1 / SQLite database.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/admin/template-studio</span>
          </div>
          <img class="mockup-img" src="${imgStudio}" alt="Admin Template Studio" />
        </div>
      </div>
    </div>
    <div class="page-num">08</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 09: FITUR WEB - ADMIN DEVICE MONITORING -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content">
      <div class="split-layout reverse">
        <!-- Left: Mockup -->
        <div class="mockup-frame">
          <div class="mockup-header">
            <div class="traffic-dot dot-red"></div>
            <div class="traffic-dot dot-yellow"></div>
            <div class="traffic-dot dot-green"></div>
            <span class="browser-url">https://photo.widifirmaan.web.id/admin/devices</span>
          </div>
          <img class="mockup-img" src="${imgDevices}" alt="Admin Hardware Device Monitor" />
        </div>

        <!-- Right: Text -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="pill-badge terracotta">
            <span>08</span> FITUR WEB: ADMIN MONITORING
          </div>
          <h2 class="serif-title">
            Hardware Terminal &amp; Settings
          </h2>
          <div class="vintage-card">
            <p style="font-size: 11.5px; line-height: 1.6; color: #333333;">
              Dashboard kontrol admin (<code style="font-family:monospace; background:#eee; padding:1px 4px; border-radius:4px">/admin/devices</code>) untuk memantau status perangkat fisik kiosk: konektivitas kamera USB, printer termal/foto, riwayat sesi, dan pengaturan harga.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">⚙</div>
              <div class="feature-text">
                <h4>Enumerate Devices API</h4>
                <p>Mendeteksi seluruh periferal webcam yang tersedia dan mengizinkan pemilihan kamera utama secara dinamis.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">⚙</div>
              <div class="feature-text">
                <h4>Proteksi Autentikasi /admin/login</h4>
                <p>Gerbang login aman dengan verifikasi password hash dan proteksi rute halaman sensitif.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon" style="background:#8c3b24;">⚙</div>
              <div class="feature-text">
                <h4>Tabel Riwayat Transaksi &amp; Filter Sesi</h4>
                <p>Pelaporan statistik operasional kiosk harian dengan opsi ekspor data transaksi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-num">09</div>
  </section>

  <!-- ========================================================================= -->
  <!-- SLIDE 10: ARSITEKTUR TEKNOLOGI & RINGKASAN -->
  <!-- ========================================================================= -->
  <section class="slide">
    <div class="paper-bg"></div>
    <div class="slide-content" style="align-items: center; text-align: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div class="pill-badge">
          <span>09</span> ARSITEKTUR &amp; STACK TEKNOLOGI
        </div>
        <h2 class="serif-title" style="font-size: 2.2rem;">
          The Architecture Behind VelvetSnap
        </h2>
      </div>

      <!-- 3 Stack Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; max-width: 900px; margin: 12px 0;">
        <div class="vintage-card" style="text-align: left; padding: 14px 18px;">
          <h3 style="font-size: 12px; font-weight: 800; color: #2a4025; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
            FRONTEND &amp; ROUTING
          </h3>
          <ul style="font-size: 10.5px; color: #444444; list-style: none; line-height: 1.8;">
            <li>✦ <strong>Next.js 16:</strong> Modern App Router</li>
            <li>✦ <strong>React 19:</strong> Fast concurrent UI state</li>
            <li>✦ <strong>TypeScript:</strong> Type-safe interfaces</li>
            <li>✦ <strong>Tailwind CSS:</strong> Vintage clay styling</li>
          </ul>
        </div>

        <div class="vintage-card" style="text-align: left; padding: 14px 18px;">
          <h3 style="font-size: 12px; font-weight: 800; color: #8c3b24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
            CANVAS &amp; MEDIA
          </h3>
          <ul style="font-size: 10.5px; color: #444444; list-style: none; line-height: 1.8;">
            <li>✦ <strong>React-Konva:</strong> High-performance 2D canvas</li>
            <li>✦ <strong>React-Webcam:</strong> WebRTC MediaStream API</li>
            <li>✦ <strong>QRCode:</strong> Dynamic QR generation</li>
            <li>✦ <strong>@imgly:</strong> Client-side background removal</li>
          </ul>
        </div>

        <div class="vintage-card" style="text-align: left; padding: 14px 18px;">
          <h3 style="font-size: 12px; font-weight: 800; color: #855312; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
            DATABASE &amp; EDGE
          </h3>
          <ul style="font-size: 10.5px; color: #444444; list-style: none; line-height: 1.8;">
            <li>✦ <strong>Cloudflare D1:</strong> Edge SQLite database</li>
            <li>✦ <strong>REST API:</strong> Modular Next.js route handlers</li>
            <li>✦ <strong>UUID v9:</strong> Session tracking &amp; tokens</li>
            <li>✦ <strong>Midtrans QRIS:</strong> Webhook payment sync</li>
          </ul>
        </div>
      </div>

      <!-- Grand Footer -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 6px;">
        <h1 class="serif-title" style="font-size: 2.8rem; letter-spacing: 0.02em; line-height: 1; text-transform: uppercase;">
          VELVETSNAP PHOTOBOX
        </h1>
        <div class="pill-badge" style="font-size: 10.5px; padding: 5px 20px;">
          WIDI FIRMAAN <span style="opacity: 0.6;">·</span> LEAD FULLSTACK DEVELOPER
        </div>
        <p style="font-size: 9.5px; color: #777777; margin-top: 3px; font-family: 'JetBrains Mono', monospace;">
          Interactive Photobox Kiosk Application · 2026 Production Edition · photo.widifirmaan.web.id
        </p>
      </div>
    </div>
    <div class="page-num">10</div>
  </section>

</body>
</html>`;

// Write the generated HTML to a temporary file
const htmlPath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log(`📄 Presentation HTML written to: ${htmlPath}`);

console.log('🚀 Launching Chromium with Playwright to render VelvetSnap PDF...');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});

await page.setContent(htmlContent, { waitUntil: 'load' });
await page.waitForTimeout(1000); // Allow any fonts and layout to settle

// 1. Generate Multi-Page Landscape PDF Presentation (A4 297x210mm)
const pdfPathProject = path.join(projectRoot, 'VelvetSnap.pdf');
const pdfPathDownloads = path.join(downloadsDir, 'VelvetSnap.pdf');
const pdfPathArtifacts = path.join(artifactsDir, 'VelvetSnap.pdf');

console.log('🖨️  Rendering Multi-Page A4 Landscape Presentation PDF (Slide Mode)...');
const pdfBuffer = await page.pdf({
  format: 'A4',
  landscape: true,
  printBackground: true,
  preferCSSPageSize: true,
});

fs.writeFileSync(pdfPathProject, pdfBuffer);
fs.writeFileSync(pdfPathDownloads, pdfBuffer);
fs.writeFileSync(pdfPathArtifacts, pdfBuffer);

const pdfSizeMB = (pdfBuffer.length / (1024 * 1024)).toFixed(2);

// 2. Generate Continuous Showcase PDF (Matching Book Games single long scroll format)
const pdfContinuousProject = path.join(projectRoot, 'VelvetSnap-Continuous.pdf');
const pdfContinuousDownloads = path.join(downloadsDir, 'VelvetSnap-Continuous.pdf');
const pdfContinuousArtifacts = path.join(artifactsDir, 'VelvetSnap-Continuous.pdf');

console.log('📜 Rendering Continuous Single-Scroll Showcase PDF (Poster Mode)...');
await page.addStyleTag({
  content: `
    @page { size: auto; margin: 0; }
    body { padding: 40px 0; background: #f0ebe1; display: flex; flex-direction: column; align-items: center; gap: 40px; }
    .slide { page-break-after: unset !important; border: 2.5px solid #262626 !important; border-radius: 24px !important; box-shadow: 6px 6px 0px #262626 !important; }
  `
});
await page.waitForTimeout(500);

const bodyHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const continuousBuffer = await page.pdf({
  width: '1428px',
  height: `${bodyHeight}px`,
  printBackground: true,
});

fs.writeFileSync(pdfContinuousProject, continuousBuffer);
fs.writeFileSync(pdfContinuousDownloads, continuousBuffer);
fs.writeFileSync(pdfContinuousArtifacts, continuousBuffer);

const contSizeMB = (continuousBuffer.length / (1024 * 1024)).toFixed(2);

console.log(`\n================================================================================`);
console.log(`🎉 VELVETSNAP WEB ARCHITECTURE PDFS SUCCESSFULLY GENERATED!`);
console.log(`📦 Multi-Page Deck (Slides)   : ${pdfSizeMB} MB (10 Pages A4 Landscape)`);
console.log(`   -> Saved: ${pdfPathDownloads}`);
console.log(`📦 Continuous Poster (Scroll) : ${contSizeMB} MB (1 Long Showcase Page)`);
console.log(`   -> Saved: ${pdfContinuousDownloads}`);
console.log(`================================================================================\n`);

await browser.close();
process.exit(0);
