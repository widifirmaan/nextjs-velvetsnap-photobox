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

console.log('Encoding VelvetSnap Photobox screenshots...');

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

console.log('Assembling English VelvetSnap Clay & Matcha Presentation Deck HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
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
      --font-main: 'Inter', sans-serif;
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
      padding: 15mm 18mm;
      overflow: hidden;
    }

    /* Velvet Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5.5mm;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-primary);
      padding: 7px 18px;
      border-radius: 50px;
      box-shadow: var(--clay-shadow);
      border: 1px solid var(--border-subtle);
    }

    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-matcha);
    }

    .brand-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
      border-left: 1px solid rgba(0, 0, 0, 0.1);
      padding-left: 10px;
      margin-left: 2px;
    }

    .badge-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-deep);
      background: rgba(197, 216, 157, 0.25);
      padding: 6px 14px;
      border-radius: 50px;
    }

    /* Content Area */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .title-banner {
      margin-bottom: 5mm;
    }

    .slide-category {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-deep);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }

    .slide-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      line-height: 1.18;
    }

    .slide-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-top: 4px;
      max-width: 900px;
      font-weight: 500;
    }

    /* Clay Cards */
    .clay-card {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      box-shadow: var(--clay-shadow);
      padding: 18px 22px;
      border: 1px solid var(--border-subtle);
    }

    .clay-card-matcha {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      box-shadow: var(--clay-shadow);
      padding: 18px 22px;
      border-left: 6px solid var(--accent-matcha);
    }

    /* Split Layouts */
    .layout-split {
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 18px;
      align-items: stretch;
      flex: 1;
    }

    .layout-split-reversed {
      display: grid;
      grid-template-columns: 0.92fr 1.08fr;
      gap: 18px;
      align-items: stretch;
      flex: 1;
    }

    .layout-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
    }

    .layout-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      flex: 1;
    }

    /* Visual Stage */
    .visual-stage {
      background: var(--bg-primary);
      border-radius: var(--clay-radius);
      box-shadow: var(--clay-shadow);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 100%;
      min-height: 290px;
      padding: 12px;
      border: 1px solid var(--border-subtle);
    }

    .visual-stage img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.06));
    }

    /* Feature Items */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
    }

    .feature-box {
      background: var(--bg-primary);
      border-radius: 18px;
      box-shadow: var(--clay-shadow);
      padding: 14px 18px;
      border: 1px solid var(--border-subtle);
    }

    .feature-box-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .feature-box-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.45;
      font-weight: 500;
    }

    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5mm;
      padding-top: 3.5mm;
      border-top: 1px solid var(--border-subtle);
      font-size: 11px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-weight: 600;
    }

    .tech-pill {
      display: inline-block;
      padding: 3px 10px;
      background: var(--card-bg);
      border-radius: 50px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary);
      margin-right: 6px;
      margin-top: 4px;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">VelvetSnap Photobox</div>
        <div class="brand-subtitle">Automated Kiosk &amp; HTML5 Canvas Architecture</div>
      </div>
      <div class="badge-pill">DECK-VELVET-01 / 10</div>
    </div>

    <div class="slide-content">
      <div class="layout-split">
        <div style="display: flex; flex-direction: column; justify-content: center; padding-right: 15px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span class="tech-pill">Next.js 14</span>
            <span class="tech-pill">WebRTC MediaStream</span>
            <span class="tech-pill">HTML5 Canvas</span>
            <span class="tech-pill">QRIS Gateway</span>
          </div>
          <h1 style="font-size: 40px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px;">
            Self-Service Photobooth Kiosk &amp; Canvas Architecture
          </h1>
          <p style="font-size: 14.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 24px; font-weight: 500;">
            An automated commercial photo kiosk platform engineered with minimal warm claymorphism aesthetics (Matcha Green #C5D89D, 24px-32px rounded cards), WebRTC camera synchronization, real-time strip compositing, and instant thermal printing.
          </p>

          <div class="clay-card" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 14px 18px;">
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">CAPTURE PIPELINE</div>
              <div style="font-size: 19px; font-weight: 800; color: var(--accent-deep); margin-top: 2px;">WebRTC 1080p</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Low-Latency Stream</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">DESIGN SYSTEM</div>
              <div style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Warm Clay</div>
              <div style="font-size: 11px; color: var(--text-secondary);">24px/32px Radius</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">OUTPUT RENDER</div>
              <div style="font-size: 19px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">300 DPI Strip</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Thermal Photo Print</div>
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.kioskHomeDesktop}" alt="VelvetSnap Kiosk Home Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; PHOTOBOX KIOSK PLATFORM</div>
      <div>WIDI FIRMANSYAH &bull; LEAD ENGINEER</div>
      <div>01 / 10</div>
    </div>
  </div>

  <!-- SLIDE 2: HARDWARE & SOFTWARE INTEGRATION GOALS -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">System Architecture</div>
        <div class="brand-subtitle">Hardware &amp; Software Co-Design</div>
      </div>
      <div class="badge-pill">DECK-VELVET-02 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Core Engineering Rationale</div>
        <h2 class="slide-title">Reliable Unattended Operations &amp; Studio Automation</h2>
        <p class="slide-subtitle">Bridging physical camera peripherals, lighting relays, and thermal dye-sub printers with web standards.</p>
      </div>

      <div class="layout-grid-3">
        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">01 &bull; KIOSK RELIABILITY</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Zero-Staff Autonomy</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            Commercial mall photobooths operate continuously without attendant supervision, requiring automatic error recovery and state resets between sessions.
          </p>
        </div>

        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">02 &bull; WEBRTC CAPTURE</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Sub-16ms Viewfinder</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            Direct navigator.mediaDevices hardware binding delivers 60 FPS uncompressed mirror previews with zero noticeable lag during countdown poses.
          </p>
        </div>

        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">03 &bull; CLAY ERGONOMICS</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Soothing Studio Aesthetics</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            Gentle Matcha Green accents and soft clay elevation create a welcoming, photogenic studio booth atmosphere that enhances customer comfort.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; HARDWARE INTEGRATION</div>
      <div>STANDARDIZED KIOSK ARCHITECTURE</div>
      <div>02 / 10</div>
    </div>
  </div>

  <!-- SLIDE 3: KIOSK HOME STAGE & ONBOARDING -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Guest Onboarding</div>
        <div class="brand-subtitle">Kiosk Home &amp; Package Selector</div>
      </div>
      <div class="badge-pill">DECK-VELVET-03 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Self-Service Workflow</div>
        <h2 class="slide-title">Intuitive Start Screen &amp; Photo Frame Selection</h2>
        <p class="slide-subtitle">Engaging welcome interface introducing photo layout options (Classic Strip 2x3, Wide Card, Collage) with zero friction.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.kioskHomeMobile}" alt="VelvetSnap Kiosk Home Mobile View">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Touch-Anywhere Session Ignition</div>
            <div class="feature-box-desc">
              High-visibility CTA button and whole-screen touch detection awaken the kiosk from sleep mode and prime camera lighting relays instantly.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Visual Frame Format Comparison</div>
            <div class="feature-box-desc">
              Curated showcase of 2-strip bookmark layouts versus single 4R cards with transparent pricing and print duration estimates.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Multi-Language Accessibility (ID / EN)</div>
            <div class="feature-box-desc">
              Instant bilingual toggle ensuring seamless guidance for local mall visitors and international tourists alike.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; GUEST ONBOARDING</div>
      <div>TOUCH-FIRST INTERACTION</div>
      <div>03 / 10</div>
    </div>
  </div>

  <!-- SLIDE 4: CAMERA VIEWFINDER & COUNTDOWN -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Capture Engine</div>
        <div class="brand-subtitle">WebRTC Viewfinder &amp; Timed Shutter</div>
      </div>
      <div class="badge-pill">DECK-VELVET-04 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Camera Pipeline</div>
        <h2 class="slide-title">Real-Time Camera Viewfinder &amp; Burst Capture Loop</h2>
        <p class="slide-subtitle">High-framerate video preview with countdown animations, flash strobe synchronization, and automated snapshot buffering.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Animated 5-Second Circular Shutter Timer</div>
            <div class="feature-box-desc">
              Prominent visual and audio countdown cues guide guests into position, ending with a screen-strobe flash animation on exposure.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Multi-Shot Buffer Queue (4 to 8 Frames)</div>
            <div class="feature-box-desc">
              Automated sequence capturing consecutive candidate photos stored as high-resolution ImageBitmap objects directly in memory.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Mirror Mode Flip &amp; Grid Guide Overlays</div>
            <div class="feature-box-desc">
              Natural horizontal mirror flip and subtle rule-of-thirds alignment lines assist guests in centering group compositions.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.viewfinderDesktop}" alt="VelvetSnap Camera Viewfinder Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; CAPTURE PIPELINE</div>
      <div>WEBRTC SHUTTER ENGINE</div>
      <div>04 / 10</div>
    </div>
  </div>

  <!-- SLIDE 5: CANVAS EDITOR & STRIP COMPOSITING -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Creative Studio</div>
        <div class="brand-subtitle">HTML5 Canvas Editor &amp; Strip Compositor</div>
      </div>
      <div class="badge-pill">DECK-VELVET-05 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Canvas Manipulation</div>
        <h2 class="slide-title">Creative Customization Studio with Instant Compositing</h2>
        <p class="slide-subtitle">Interactive drag-and-drop editor allowing guests to apply frames, decorative stickers, date stamps, and color filters.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.canvasDesktop}" alt="VelvetSnap Canvas Editor Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Layer-Based HTML5 Canvas Compositor</div>
            <div class="feature-box-desc">
              Multi-layer rendering engine cleanly stacks background frames, photo bitmaps, custom stickers, and typographic watermarks in real time.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Filter Presets (B&amp;W, Vintage Warm, Matcha Glow)</div>
            <div class="feature-box-desc">
              GPU-accelerated CSS and Canvas pixel shaders instantly transform color grading across all strip cells with zero delay.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Interactive Sticker Manipulation</div>
            <div class="feature-box-desc">
              Touch-friendly gesture controls for scaling, rotating, and positioning decorative elements with intuitive undo/redo history.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; CREATIVE CANVAS</div>
      <div>HTML5 STRIP COMPOSITING</div>
      <div>05 / 10</div>
    </div>
  </div>

  <!-- SLIDE 6: QRIS PAYMENT GATEWAY WORKFLOW -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Payment Architecture</div>
        <div class="brand-subtitle">Dynamic QRIS Gateway &amp; Webhook Polling</div>
      </div>
      <div class="badge-pill">DECK-VELVET-06 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Transaction Processing</div>
        <h2 class="slide-title">Cashless QRIS Payment &amp; Real-Time Settlement</h2>
        <p class="slide-subtitle">Seamless integration with Indonesian standard QRIS payment networks for instant verification and automatic print dispatch.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Dynamic Dynamic-QR Generation</div>
            <div class="feature-box-desc">
              Generates unique transaction QR codes encoding exact order totals to prevent under/over-payment errors from customers.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">High-Frequency Webhook &amp; Polling Loop</div>
            <div class="feature-box-desc">
              2-second polling interval and server-sent event verification confirm incoming payments from GoPay, OVO, Dana, and BCA in seconds.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Automated Session Timeout &amp; Refund Safety</div>
            <div class="feature-box-desc">
              5-minute idle countdown automatically voids uncompleted invoices, releasing camera resources and returning the kiosk to Home.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.paymentDesktop}" alt="VelvetSnap Payment QRIS Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; PAYMENT PIPELINE</div>
      <div>QRIS SETTLEMENT ENGINE</div>
      <div>06 / 10</div>
    </div>
  </div>

  <!-- SLIDE 7: DUAL OUTPUT: THERMAL PRINT & CLOUD QR -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Output Delivery</div>
        <div class="brand-subtitle">300 DPI Thermal Print &amp; Cloud Asset QR</div>
      </div>
      <div class="badge-pill">DECK-VELVET-07 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Media Fulfillment</div>
        <h2 class="slide-title">Physical Dye-Sub Print &amp; Instant Cloud QR Retrieval</h2>
        <p class="slide-subtitle">Dual-delivery architecture producing high-gloss keepsake photo strips and instant mobile digital downloads via Cloudflare R2.</p>
      </div>

      <div class="layout-split">
        <div class="visual-stage">
          <img src="${images.resultDesktop}" alt="VelvetSnap Result &amp; QR Download Desktop">
        </div>

        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">300 DPI Print Pipeline Spooler</div>
            <div class="feature-box-desc">
              High-resolution canvas buffer sent to native ESC/POS dye-sublimation print spoolers, executing 15-second physical strip cuts.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Cloud Download QR with Auto-Expiry</div>
            <div class="feature-box-desc">
              Printed and on-screen QR codes lead guests to a secure cloud page hosting digital PNGs and behind-the-scenes animated GIFs.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Privacy-Centric 7-Day Asset Retention</div>
            <div class="feature-box-desc">
              Automated lifecycle bucket policies purge guest photographs after 7 days, maintaining customer privacy and cloud storage hygiene.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; MEDIA FULFILLMENT</div>
      <div>DYE-SUB &amp; CLOUD STORAGE</div>
      <div>07 / 10</div>
    </div>
  </div>

  <!-- SLIDE 8: ADMIN STUDIO TELEMETRY & DEVICE HEALTH -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Operations Console</div>
        <div class="brand-subtitle">Admin Studio &amp; Hardware Telemetry</div>
      </div>
      <div class="badge-pill">DECK-VELVET-08 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Remote Device Monitoring</div>
        <h2 class="slide-title">Centralized Studio Administration &amp; Hardware Health</h2>
        <p class="slide-subtitle">Real-time status monitoring for printer ribbon capacity, paper rolls, camera connectivity, and daily revenue metrics.</p>
      </div>

      <div class="layout-split-reversed">
        <div class="feature-list">
          <div class="feature-box">
            <div class="feature-box-title">Consumables Telemetry (Ribbon &amp; Paper Rolls)</div>
            <div class="feature-box-desc">
              Exact paper count tracker alerts operators before rolls run out, preventing customer dissatisfaction and aborted printing cycles.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Camera &amp; Lighting Peripheral Health Heartbeat</div>
            <div class="feature-box-desc">
              Continuous ping verification monitoring USB camera disconnects and studio LED driver failures with automated alert dispatch.
            </div>
          </div>
          <div class="feature-box">
            <div class="feature-box-title">Remote Maintenance &amp; Kiosk Reboot Controls</div>
            <div class="feature-box-desc">
              Password-protected admin interface allowing managers to clear queues, recalibrate camera exposure, or reboot the kiosk safely.
            </div>
          </div>
        </div>

        <div class="visual-stage">
          <img src="${images.adminDevicesDesktop}" alt="VelvetSnap Admin Devices Telemetry Desktop">
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; ADMIN TELEMETRY</div>
      <div>DEVICE HEALTH MONITORING</div>
      <div>08 / 10</div>
    </div>
  </div>

  <!-- SLIDE 9: WEB PERFORMANCE & MEMORY ISOLATION -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Performance Engineering</div>
        <div class="brand-subtitle">OffscreenCanvas &amp; Memory Hygiene</div>
      </div>
      <div class="badge-pill">DECK-VELVET-09 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Kiosk Stability</div>
        <h2 class="slide-title">24/7 Memory Hygiene &amp; Offscreen Compositing</h2>
        <p class="slide-subtitle">Preventing browser tab crashes and memory leaks across thousands of daily image capture and export cycles.</p>
      </div>

      <div class="layout-grid-3">
        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">GARBAGE COLLECTION</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Bitmap Memory Cleanup</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            Explicit imageBitmap.close() calls and canvas context resets after print export prevent V8 heap bloat during marathon 24-hour mall operation.
          </p>
        </div>

        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">RENDER EFFICIENCY</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">OffscreenCanvas Worker</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            High-resolution 300 DPI image rendering executed inside dedicated Web Workers keeps the primary UI thread silky smooth and responsive.
          </p>
        </div>

        <div class="clay-card">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-deep); font-weight: 700; margin-bottom: 8px;">CORE WEB VITALS</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Zero Layout Shift (CLS)</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            Absolute container bounding boxes across camera viewports and canvas toolbars maintain rock-solid visual stability (CLS 0.000).
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; PERFORMANCE AUDIT</div>
      <div>CORE WEB VITALS BENCHMARKS</div>
      <div>09 / 10</div>
    </div>
  </div>

  <!-- SLIDE 10: ARCHITECTURAL SUMMARY & DEPLOYMENT -->
  <div class="slide">
    <div class="slide-header">
      <div class="brand-pill">
        <div class="brand-dot"></div>
        <div class="brand-title">Milestone Summary</div>
        <div class="brand-subtitle">Production Specifications &amp; Quality Audit</div>
      </div>
      <div class="badge-pill">DECK-VELVET-10 / 10</div>
    </div>

    <div class="slide-content">
      <div class="title-banner">
        <div class="slide-category">Production Readiness</div>
        <h2 class="slide-title">Comprehensive Project Implementation Summary</h2>
        <p class="slide-subtitle">A state-of-the-art commercial photobox platform combining warm minimal aesthetics with industrial hardware reliability.</p>
      </div>

      <div class="layout-grid-4">
        <div class="clay-card">
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">FRAMEWORK</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--accent-deep); margin-top: 4px; margin-bottom: 4px;">Next.js 14</div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.45;">App Router architecture running in full kiosk Electron wrapper.</p>
        </div>

        <div class="clay-card">
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">DESIGN SYSTEM</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-top: 4px; margin-bottom: 4px;">Warm Clay</div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.45;">Matcha Green accents, 24px-32px radius, and soothing elevation.</p>
        </div>

        <div class="clay-card">
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">PRINTING</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--accent-deep); margin-top: 4px; margin-bottom: 4px;">Dye-Sub 300DPI</div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.45;">Hardware print spooler integration with cloud QR mirrors.</p>
        </div>

        <div class="clay-card">
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">STATUS</div>
          <div style="font-size: 18px; font-weight: 800; color: #16A34A; margin-top: 4px; margin-bottom: 4px;">Production</div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.45;">Operating reliably in commercial retail mall installations.</p>
        </div>
      </div>

      <div class="visual-stage" style="min-height: 160px; max-height: 180px; margin-top: 15px;">
        <img src="${images.adminStudioDesktop}" alt="VelvetSnap Admin Studio Desktop">
      </div>
    </div>

    <div class="slide-footer">
      <div>VELVETSNAP &bull; PROJECT COMPLETION</div>
      <div>WIDI FIRMANSYAH &bull; LEAD ENGINEER</div>
      <div>10 / 10</div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(projectRoot, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Presentation HTML written to: ${htmlFilePath}`);

console.log('Launching Chromium with Playwright to render English VelvetSnap PDFs...');

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
  console.log('Rendering Multi-Page A4 Landscape (Slide Mode)...');
  await page.pdf({
    path: slidePdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  // 2. Continuous Poster Mode (Single tall scroll)
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

  console.log('\nVelvetSnap English PDFs successfully generated:');
  console.log(`- Multi-Page Deck: ${(slideStat.size / 1024 / 1024).toFixed(2)} MB (${slidePdfPath})`);
  console.log(`- Continuous Poster: ${(contStat.size / 1024 / 1024).toFixed(2)} MB (${continuousPdfPath})\n`);
}

renderPDF().catch((err) => {
  console.error('Error rendering PDF:', err);
  process.exit(1);
});
