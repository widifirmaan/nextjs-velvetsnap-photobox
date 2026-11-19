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
    console.warn(`Warning: Screenshot not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${fileBuffer.toString('base64')}`;
}

console.log('Encoding VelvetSnap screenshots...');

const images = {
  heroDesktop: encodeImage('Kiosk Home Desktop.png'),
  heroMobile: encodeImage('Kiosk Home Mobile.png'),
  captureDesktop: encodeImage('Camera Viewfinder Desktop.png'),
  captureMobile: encodeImage('Camera Viewfinder Mobile.png'),
  editorDesktop: encodeImage('Canvas Editor Desktop.png'),
  editorMobile: encodeImage('Canvas Editor Mobile.png'),
  paymentDesktop: encodeImage('Payment QRIS Desktop.png'),
  paymentMobile: encodeImage('Payment QRIS Mobile.png'),
  successDesktop: encodeImage('Result & QR Desktop.png'),
  successMobile: encodeImage('Result & QR Mobile.png'),
  adminDesktop: encodeImage('Admin Studio Desktop.png'),
  adminMobile: encodeImage('Admin Studio Mobile.png'),
  terminalDesktop: encodeImage('Admin Devices Desktop.png'),
  terminalMobile: encodeImage('Admin Devices Mobile.png'),
};

console.log('Constructing clean VelvetSnap Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>VelvetSnap - Photobooth Web Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cream: #F8F6F0;
      --bg-card: #FFFFFF;
      --border-clay: #E3DDD1;
      --terracotta: #C85A32;
      --terracotta-dark: #A2421E;
      --charcoal: #232220;
      --text-muted: #6E6B65;
      --shadow-soft: 0 4px 16px rgba(35, 34, 32, 0.06);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: var(--bg-cream);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--charcoal);
      line-height: 1.45;
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
      background: var(--bg-cream);
      display: flex;
      flex-direction: column;
      padding: 16mm 18mm;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 10% 10%, rgba(200, 90, 50, 0.04) 0%, transparent 50%),
        linear-gradient(to right, rgba(227, 221, 209, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(227, 221, 209, 0.4) 1px, transparent 1px);
      background-size: 100% 100%, 36px 36px, 36px 36px;
    }

    .slide::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--terracotta), #D97706);
      z-index: 50;
    }

    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
      border-bottom: 1.5px solid var(--border-clay);
      padding-bottom: 3.5mm;
    }

    .header-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: var(--terracotta-dark);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(200, 90, 50, 0.08);
      border: 1px solid rgba(200, 90, 50, 0.25);
      padding: 3px 10px;
      border-radius: 4px;
    }

    .slide-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }

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
      gap: 8px;
    }

    .slide-title {
      font-family: 'Playfair Display', serif;
      font-size: 25px;
      font-weight: 800;
      line-height: 1.2;
      color: var(--charcoal);
    }

    .slide-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0;
    }

    .feature-card {
      background: #FFFFFF;
      border: 1px solid var(--border-clay);
      box-shadow: var(--shadow-soft);
      border-radius: 6px;
      padding: 12px 14px;
      border-left: 3.5px solid var(--terracotta);
    }

    .feature-card-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--charcoal);
      margin-bottom: 4px;
    }

    .feature-card-text {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-box {
      background: #FFFFFF;
      border: 1px solid var(--border-clay);
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }

    .metric-val {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 800;
      color: var(--terracotta-dark);
    }

    .metric-lbl {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Clean Direct Screenshot Display */
    .visual-stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 0;
    }

    .screenshot-desktop {
      max-width: 95%;
      max-height: 380px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 14px 28px rgba(35, 34, 32, 0.15));
    }

    .screenshot-mobile {
      position: absolute;
      right: 0px;
      bottom: -8px;
      max-height: 280px;
      max-width: 28%;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 16px 30px rgba(35, 34, 32, 0.2));
    }

    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid var(--border-clay);
      padding-top: 3.5mm;
      margin-top: 4mm;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Cover Slide */
    .cover-slide {
      background: linear-gradient(135deg, #F8F6F0 0%, #EDE6D8 100%);
      justify-content: space-between;
      padding: 18mm 20mm;
    }

    .cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 46px;
      font-weight: 900;
      line-height: 1.05;
      color: var(--charcoal);
      margin-bottom: 12px;
    }

    .cover-title span {
      color: var(--terracotta-dark);
    }

    .cover-desc {
      font-size: 15px;
      line-height: 1.5;
      color: var(--text-muted);
      max-width: 680px;
    }

    .cover-split {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 28px;
      align-items: center;
      margin: 10px 0;
    }

    .cover-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .spec-card {
      background: #FFFFFF;
      border: 1px solid var(--border-clay);
      box-shadow: var(--shadow-soft);
      border-radius: 6px;
      padding: 12px 14px;
    }

    .spec-k {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      color: var(--terracotta-dark);
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .spec-v {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--charcoal);
    }

    /* Tech Stack Grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 10px;
      flex: 1;
    }

    .tech-col {
      background: #FFFFFF;
      border: 1px solid var(--border-clay);
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-soft);
    }

    .tech-col-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-bottom: 6px;
      border-bottom: 1.5px solid var(--border-clay);
      color: var(--terracotta-dark);
    }

    .tech-item {
      background: #F8F6F0;
      border: 1px solid var(--border-clay);
      border-radius: 5px;
      padding: 8px 10px;
      font-size: 11px;
    }

    .tech-item-name {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--charcoal);
      margin-bottom: 2px;
    }

    .tech-item-desc {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Closing Slide */
    .closing-slide {
      background: linear-gradient(135deg, #FFFFFF 0%, #F5EFEB 100%);
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20mm;
      gap: 18px;
    }

    .closing-title {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: var(--charcoal);
    }

    .closing-card {
      background: #FFFFFF;
      border: 1.5px solid var(--terracotta);
      border-radius: 8px;
      padding: 16px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      box-shadow: 0 10px 24px rgba(200, 90, 50, 0.1);
    }

    .closing-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 800;
      color: var(--terracotta-dark);
    }
  </style>
</head>
<body>

  <!-- SLIDE 01: COVER -->
  <div class="slide cover-slide">
    <div>
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="header-tag">PHOTOBOOTH KIOSK PLATFORM</div>
        <div class="header-tag" style="border-color:#10B981; color:#059669; background:#D1FAE5;">PRODUCTION READY</div>
      </div>
      <div style="margin-top: 20px; max-width: 80%;">
        <div class="cover-title">
          <span>VELVETSNAP</span> PHOTOBOOTH
        </div>
        <p class="cover-desc">
          Aplikasi web photobooth mandiri dengan integrasi WebRTC kamera, editor kanvas foto React-Konva, pembayaran QRIS terotomasi, cetak struk termal, dan dashboard admin terminal.
        </p>
      </div>
    </div>

    <div class="cover-split">
      <div class="cover-specs">
        <div class="spec-card">
          <div class="spec-k">FRAMEWORK</div>
          <div class="spec-v">Next.js 14 + React 18</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">CAMERA CORE</div>
          <div class="spec-v">WebRTC MediaStream</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">CANVAS ENGINE</div>
          <div class="spec-v">React-Konva 2D</div>
        </div>
        <div class="spec-card">
          <div class="spec-k">PAYMENT</div>
          <div class="spec-v">QRIS Dynamic Polling</div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.heroDesktop}" class="screenshot-desktop" alt="VelvetSnap Cover">
      </div>
    </div>

    <div class="slide-footer">
      <div>WIDI FIRMANSYAH</div>
      <div>NEXTJS VELVETSNAP PHOTOBOX</div>
      <div>01 / 10</div>
    </div>
  </div>

  <!-- SLIDE 02: CAPTURE VIEWFINDER -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">PENGAMBILAN FOTO</div>
      <div class="slide-num">02 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Kamera & Jendela Bidik WebRTC</h2>
          <p class="slide-desc">
            Antarmuka pemotretan langsung dari peramban menggunakan WebRTC MediaDevices API, dilengkapi hitung mundur otomatis dan panduan bingkai wajah.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Hitung Mundur Otomatis</div>
            <div class="feature-card-text">
              Timer visual 3 detik sebelum setiap jepretan foto, memberi waktu pengguna untuk bersiap di depan kamera kiosk.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Multi-Shot Capture Sequence</div>
            <div class="feature-card-text">
              Mengambil serangkaian 4 sampai 6 foto secara berurutan dan menyimpannya di memori lokal sesi pemotretan.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">WebRTC</div>
            <div class="metric-lbl">Stream</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">3 Detik</div>
            <div class="metric-lbl">Timer</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">FHD</div>
            <div class="metric-lbl">Resolusi</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.captureDesktop}" class="screenshot-desktop" alt="Capture Viewfinder Desktop">
        <img src="${images.captureMobile}" class="screenshot-mobile" alt="Capture Viewfinder Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>MODUL PENGAMBILAN FOTO</div>
      <div>WEBRTC MEDIA STREAM</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 03: PHOTO EDITOR -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">EDITOR KANVAS</div>
      <div class="slide-num">03 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Editor Tata Letak & Kanvas React-Konva</h2>
          <p class="slide-desc">
            Studio penataan foto interaktif untuk memilih tata letak strip, warna bingkai, penyesuaian filter foto, dan penambahan stiker dekorasi.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Pilihan Template Strip</div>
            <div class="feature-card-text">
              Mendukung tata letak strip 2x1, 3-strip klasik, dan format kartu pos dengan pengaturan warna latar belakang bebas.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Filter Warna Foto</div>
            <div class="feature-card-text">
              Penerapan filter monokrom, vintage sepia, dan saturasi natural yang diproses langsung pada kanvas HTML5.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Konva 2D</div>
            <div class="metric-lbl">Kanvas</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Realtime</div>
            <div class="metric-lbl">Pratinjau</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Export</div>
            <div class="metric-lbl">300 DPI</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.editorDesktop}" class="screenshot-desktop" alt="Photo Editor Desktop">
        <img src="${images.editorMobile}" class="screenshot-mobile" alt="Photo Editor Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>EDITOR KANVAS FOTO</div>
      <div>REACT-KONVA COMPOSITING</div>
      <div>03 / 10</div>
    </div>
  </div>

  <!-- SLIDE 04: PAYMENT QRIS -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">PEMBAYARAN</div>
      <div class="slide-num">04 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Pembayaran QRIS & Verifikasi Otomatis</h2>
          <p class="slide-desc">
            Modal pembayaran digital terintegrasi yang menampilkan kode QR dinamis dengan sistem polling status pembayaran secara berkala.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Polling Status Pembayaran</div>
            <div class="feature-card-text">
              Pemeriksaan status transaksi ke server gateway per 3 detik untuk mendeteksi konfirmasi pembayaran pengguna tanpa refresh halaman.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Batas Waktu Transaksi</div>
            <div class="feature-card-text">
              Penghitung waktu kedaluwarsa sesi QRIS untuk menjaga keamanan dan mencegah antrean kiosk macet.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">QRIS</div>
            <div class="metric-lbl">Standar</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">3 Detik</div>
            <div class="metric-lbl">Interval Polling</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Auto</div>
            <div class="metric-lbl">Validasi</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.paymentDesktop}" class="screenshot-desktop" alt="Payment QRIS Desktop">
        <img src="${images.paymentMobile}" class="screenshot-mobile" alt="Payment QRIS Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>GATEWAY PEMBAYARAN</div>
      <div>VERIFIKASI TRANSAKSI QRIS</div>
      <div>04 / 10</div>
    </div>
  </div>

  <!-- SLIDE 05: SUCCESS & DOWNLOAD -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">HASIL SESI</div>
      <div class="slide-num">05 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Unduh Foto & Kode QR Hasil</h2>
          <p class="slide-desc">
            Layar konfirmasi akhir yang menampilkan hasil cetak foto dan kode QR instan untuk mengunduh softcopy foto ke smartphone pengunjung.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Kode QR Pengunduhan Langsung</div>
            <div class="feature-card-text">
              Pengunjung cukup memindai kode QR di layar untuk membuka dan menyimpan berkas foto berkualitas tinggi ke galeri ponsel mereka.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Trigger Cetak Otomatis</div>
            <div class="feature-card-text">
              Perintah pengiriman berkas cetak langsung ke printer foto fisik terhubung tanpa perlu intervensi manual staf.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">QR Link</div>
            <div class="metric-lbl">Softcopy</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">300 DPI</div>
            <div class="metric-lbl">Hasil Cetak</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Instant</div>
            <div class="metric-lbl">Download</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.successDesktop}" class="screenshot-desktop" alt="Success Print Desktop">
        <img src="${images.successMobile}" class="screenshot-mobile" alt="Success Print Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>SELESAI SESI FOTO</div>
      <div>DISTRIBUSI BERKAS CETAK & DIGITAL</div>
      <div>05 / 10</div>
    </div>
  </div>

  <!-- SLIDE 06: ADMIN TEMPLATE STUDIO -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">ADMIN STUDIO</div>
      <div class="slide-num">06 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Panel Admin Pengelola Bingkai Foto</h2>
          <p class="slide-desc">
            Dasbor manajemen bagi pemilik studio untuk mengunggah desain bingkai baru, mengatur slot foto, dan mengaktifkan tema musiman.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Unggah Aset Bingkai Kustom</div>
            <div class="feature-card-text">
              Dukungan pengunggahan berkas PNG transparan dengan penetapan koordinat koordinat kotak foto secara fleksibel.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Katalog Tema Berkelompok</div>
            <div class="feature-card-text">
              Pengelompokan bingkai berdasarkan tema (Pernikahan, Ulang Tahun, Graduasi, Event Perusahaan).
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Admin</div>
            <div class="metric-lbl">Dashboard</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Custom</div>
            <div class="metric-lbl">Slot Foto</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">CRUD</div>
            <div class="metric-lbl">Template</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.adminDesktop}" class="screenshot-desktop" alt="Admin Studio Desktop">
        <img src="${images.adminMobile}" class="screenshot-mobile" alt="Admin Studio Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>ADMIN STUDIO BINGKAI</div>
      <div>PENGELOLAAN TEMPLATE FOTO</div>
      <div>06 / 10</div>
    </div>
  </div>

  <!-- SLIDE 07: HARDWARE MONITOR -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">STATUS PERANGKAT</div>
      <div class="slide-num">07 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Pemantauan Hardware & Terminal Kiosk</h2>
          <p class="slide-desc">
            Panel diagnostik kesehatan kiosk untuk memeriksa ketersediaan kertas printer, status koneksi kamera, dan stabilitas jaringan lokal.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Indikator Kertas & Tinta Printer</div>
            <div class="feature-card-text">
              Peringatan dini saat stok kertas cetak foto mendekati batas minimum agar operator dapat melakukan pengisian ulang.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Pencatatan Log Transaksi Terminal</div>
            <div class="feature-card-text">
              Histori transaksi harian dan status keberhasilan pencetakan tersimpan rapi untuk kebutuhan rekapitulasi operasional.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">Live</div>
            <div class="metric-lbl">Status Monitor</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Printer</div>
            <div class="metric-lbl">Telemetri</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Audit</div>
            <div class="metric-lbl">Log Sesi</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.terminalDesktop}" class="screenshot-desktop" alt="Terminal Monitor Desktop">
        <img src="${images.terminalMobile}" class="screenshot-mobile" alt="Terminal Monitor Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>MONITOR HARDWARE KIOSK</div>
      <div>DIAGNOSTIK OPERASIONAL</div>
      <div>07 / 10</div>
    </div>
  </div>

  <!-- SLIDE 08: MOBILE TOUCH -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">PENGALAMAN PENGGUNA</div>
      <div class="slide-num">08 / 10</div>
    </div>

    <div class="slide-body">
      <div class="slide-info">
        <div class="headline-group">
          <h2 class="slide-title">Antarmuka Layar Sentuh & Responsif</h2>
          <p class="slide-desc">
            Desain tombol besar dan kontrol intuitif yang dioptimasi untuk interaksi layar sentuh kiosk maupun perangkat tablet operator.
          </p>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <div class="feature-card-title">Ukuran Tombol Layar Sentuh Ramah Jari</div>
            <div class="feature-card-text">
              Semua tombol memiliki area sentuh minimal 48px untuk meminimalisir kesalahan ketuk oleh pengguna dari berbagai kalangan usia.
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-card-title">Instruksi Langkah demi Langkah</div>
            <div class="feature-card-text">
              Alur aplikasi dipandu bertahap mulai dari pemilihan bingkai, pemotretan, hingga pembayaran tanpa membingungkan pengguna baru.
            </div>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-val">48px+</div>
            <div class="metric-lbl">Target Sentuh</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Alur</div>
            <div class="metric-lbl">Terstruktur</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">100%</div>
            <div class="metric-lbl">Mudah Dipahami</div>
          </div>
        </div>
      </div>

      <div class="visual-stage">
        <img src="${images.heroDesktop}" class="screenshot-desktop" alt="Mobile Touch Desktop">
        <img src="${images.heroMobile}" class="screenshot-mobile" alt="Mobile Touch Mobile">
      </div>
    </div>

    <div class="slide-footer">
      <div>PENGALAMAN LAYAR SENTUH</div>
      <div>ERGONOMI TAMPILAN KIOSK</div>
      <div>08 / 10</div>
    </div>
  </div>

  <!-- SLIDE 09: TECH STACK -->
  <div class="slide">
    <div class="slide-header">
      <div class="header-tag">TEKNOLOGI</div>
      <div class="slide-num">09 / 10</div>
    </div>

    <div style="margin-bottom: 8px;">
      <h2 class="slide-title">Susunan Teknologi & Dependensi</h2>
      <p class="slide-desc">
        Arsitektur web dibangun menggunakan Next.js 14 App Router dengan eksekusi kamera dan kanvas berbasis client-side untuk latensi minimal.
      </p>
    </div>

    <div class="tech-grid">
      <div class="tech-col">
        <div class="tech-col-title">01. FRONTEND CORE</div>
        <div class="tech-item">
          <div class="tech-item-name">Next.js 14 App Router</div>
          <div class="tech-item-desc">Framework React untuk routing halaman dan penyajian aset statis teroptimasi.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">React 18</div>
          <div class="tech-item-desc">Manajemen state UI untuk alur pemotretan bertahap dan transisi modal.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Tailwind CSS</div>
          <div class="tech-item-desc">Styling berbasis utility untuk antarmuka bertema vintage modern.</div>
        </div>
      </div>

      <div class="tech-col">
        <div class="tech-col-title">02. KAMERA & KANVAS</div>
        <div class="tech-item">
          <div class="tech-item-name">WebRTC MediaStream</div>
          <div class="tech-item-desc">Akses langsung ke hardware webcam peramban tanpa instalasi plugin luar.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">React-Konva</div>
          <div class="tech-item-desc">Pustaka manipulasi kanvas 2D untuk penggabungan foto dan template bingkai.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">HTML5 Canvas API</div>
          <div class="tech-item-desc">Perenderan hasil komposit akhir beresolusi tinggi siap cetak.</div>
        </div>
      </div>

      <div class="tech-col">
        <div class="tech-col-title">03. INTEGRASI & OPS</div>
        <div class="tech-item">
          <div class="tech-item-name">QRIS Gateway API</div>
          <div class="tech-item-desc">Pembangkitan kode bayar dinamis dan polling status transaksi.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">ESC/POS Thermal Driver</div>
          <div class="tech-item-desc">Protokol cetak struk dan foto terintegrasi dengan hardware kiosk.</div>
        </div>
        <div class="tech-item">
          <div class="tech-item-name">Playwright E2E</div>
          <div class="tech-item-desc">Pengujian otomatis alur pemotretan untuk memastikan keandalan sistem.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>SUSUNAN TEKNOLOGI</div>
      <div>ARSITEKTUR & DEPENDENSI</div>
      <div>09 / 10</div>
    </div>
  </div>

  <!-- SLIDE 10: CLOSING -->
  <div class="slide closing-slide">
    <div class="header-tag" style="padding: 5px 16px; font-size: 11px;">VELVETSNAP PHOTOBOX PLATFORM</div>
    <h1 class="closing-title">INTERACTIVE SELF-SERVICE PHOTOBOOTH</h1>
    
    <p style="font-size: 14.5px; color: var(--text-muted); max-width: 650px; line-height: 1.5;">
      Solusi sistem photobooth mandiri modern yang menggabungkan kemudahan pengambilan foto via browser, penataan bingkai kreatif, dan pembayaran instan dalam satu platform terpadu.
    </p>

    <div class="closing-card">
      <div style="font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em;">
        DEMO PRODUKSI
      </div>
      <div class="closing-url">https://velvetsnap.widifirmaan.web.id</div>
      <div style="font-size:11px; color:var(--text-muted);">
        Next.js 14 • React 18 • WebRTC • React-Konva • QRIS Gateway
      </div>
    </div>

    <div class="slide-footer" style="width: 100%; margin-top: 15px;">
      <div>WIDI FIRMANSYAH</div>
      <div>PENGEMBANG UTAMA</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Presentation HTML written to: ${htmlFilePath}`);

console.log('Launching Chromium with Playwright to render VelvetSnap PDF...');

async function renderPDF() {
  const playwrightPath = '/home/widifirmaan/Projects/qa-toolkit/node_modules/playwright/index.mjs';
  const { chromium } = await import(playwrightPath);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const slidePdfPath = path.join(downloadsDir, 'VelvetSnap.pdf');
  const continuousPdfPath = path.join(downloadsDir, 'VelvetSnap-Continuous.pdf');

  // 1. Multi-Page Deck Mode (10 Slides A4 Landscape)
  console.log('Rendering Multi-Page A4 Landscape Presentation PDF (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
  console.log('Rendering Continuous Single-Scroll Showcase PDF (Poster Mode)...');
  await page.addStyleTag({
    content: `
      @page {
        size: auto;
        margin: 0;
      }
      body {
        background: #F8F6F0 !important;
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
  await page.pdf({
    path: continuousPdfPath,
    width: '1428px',
    height: `${scrollHeight}px`,
    printBackground: true,
    pageRanges: '1',
  });

  await browser.close();

  const slideStat = fs.statSync(slidePdfPath);
  const contStat = fs.statSync(continuousPdfPath);

  console.log('\nVelvetSnap PDFs successfully generated:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error during PDF generation:', err);
  process.exit(1);
});
