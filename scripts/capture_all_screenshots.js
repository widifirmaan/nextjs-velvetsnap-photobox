const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/data/data/com.termux/files/home/bin/chromium';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');
const BASE_URL = 'https://photo.widifirmaan.web.id';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load sample template for steps 2..5
  let sampleTemplate = null;
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, 'sample_templates.json'), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.data && parsed.data.length) sampleTemplate = parsed.data[0];
  } catch (err) {
    console.error('Failed to load sample templates JSON:', err.message);
  }

  const samplePhotoSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2d3748"/><stop offset="100%" stop-color="#1a202c"/></linearGradient></defs>' +
    '<rect width="100%" height="100%" fill="url(#g)"/>' +
    '<circle cx="300" cy="320" r="130" fill="#e2e8f0"/>' +
    '<path d="M 160 620 C 160 480, 440 480, 440 620 Z" fill="#cbd5e0"/>' +
    '<text x="300" y="720" font-family="sans-serif" font-weight="bold" font-size="28" fill="#a0aec0" text-anchor="middle">VelvetSnap Photobooth</text>' +
    '</svg>'
  );

  console.log('Launching headless Chromium...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  // Helper to setup mock state on a page
  async function setupMockFlow(page, template, capturesCount = 3) {
    if (!template) return;
    await page.evaluate((t, photo, count) => {
      try {
        localStorage.setItem('velvetsnap_selected_template', JSON.stringify({ id: t._id, data: t }));
        const caps = Array(count).fill(photo);
        localStorage.setItem('velvetsnap_captures', JSON.stringify(caps));
      } catch (e) {}
    }, template, samplePhotoSvg, capturesCount);
  }

  // ==========================================
  // 1. DESKTOP CAPTURES (1440 x 900)
  // ==========================================
  console.log('\n--- Starting Desktop Captures (1440x900) ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // 1.1 V1 Landing Page
  console.log('[Desktop] Capturing V1 Landing Page...');
  await desktopPage.goto(`${BASE_URL}/v1`, { waitUntil: 'domcontentloaded' });
  await sleep(7000); // Allow full preloader fade & carousel start
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Landing Page.png') });

  // 1.2 V1 Template Selection
  console.log('[Desktop] Capturing V1 Template Selection...');
  await desktopPage.goto(`${BASE_URL}/v1?step=1`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Template Selection.png') });

  // 1.3 V1 Photobooth Capture
  console.log('[Desktop] Capturing V1 Photobooth Capture...');
  await setupMockFlow(desktopPage, sampleTemplate, 0);
  await desktopPage.goto(`${BASE_URL}/v1?step=2`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Photobooth Capture.png') });

  // 1.4 V1 Photo Editor
  console.log('[Desktop] Capturing V1 Photo Editor...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v1?step=3`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Photo Editor.png') });

  // 1.5 V1 Payment Gate
  console.log('[Desktop] Capturing V1 Payment Gate...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v1?step=4`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Payment Gate.png') });

  // 1.6 V1 Result Download
  console.log('[Desktop] Capturing V1 Result Download...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v1?step=5`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Result Download.png') });

  // 1.7 V1 Download Portal
  console.log('[Desktop] Capturing V1 Download Portal...');
  await desktopPage.goto(`${BASE_URL}/v1/download`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V1 Download Portal.png') });

  // ------------------------------------------
  // 1.8 V2 Landing Page
  // ------------------------------------------
  console.log('[Desktop] Capturing V2 Landing Page...');
  await desktopPage.goto(`${BASE_URL}/v2`, { waitUntil: 'domcontentloaded' });
  await sleep(7000); // Allow full layout & typography render
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Landing Page.png') });

  // 1.9 V2 Template Selection
  console.log('[Desktop] Capturing V2 Template Selection...');
  await desktopPage.goto(`${BASE_URL}/v2?step=1`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Template Selection.png') });

  // 1.10 V2 Photobooth Capture
  console.log('[Desktop] Capturing V2 Photobooth Capture...');
  await setupMockFlow(desktopPage, sampleTemplate, 0);
  await desktopPage.goto(`${BASE_URL}/v2?step=2`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Photobooth Capture.png') });

  // 1.11 V2 Photo Editor
  console.log('[Desktop] Capturing V2 Photo Editor...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v2?step=3`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Photo Editor.png') });

  // 1.12 V2 Payment Gate
  console.log('[Desktop] Capturing V2 Payment Gate...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v2?step=4`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Payment Gate.png') });

  // 1.13 V2 Result Download
  console.log('[Desktop] Capturing V2 Result Download...');
  await setupMockFlow(desktopPage, sampleTemplate, 3);
  await desktopPage.goto(`${BASE_URL}/v2?step=5`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Result Download.png') });

  // 1.14 V2 Download Portal
  console.log('[Desktop] Capturing V2 Download Portal...');
  await desktopPage.goto(`${BASE_URL}/v2/download`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'V2 Download Portal.png') });

  // ==========================================
  // 2. ADMIN SUITE (DESKTOP)
  // ==========================================
  console.log('\n--- Starting Admin Captures (Desktop) ---');
  // 2.1 Admin Login Page
  console.log('[Admin] Capturing Admin Login Page...');
  await desktopPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Login Page.png') });

  // Perform login
  console.log('[Admin] Logging into Admin Portal...');
  await desktopPage.type('input[placeholder*="user" i], input:not([type="password"])', 'root');
  await desktopPage.type('input[type="password"]', 'root');
  await desktopPage.click('button[type="submit"]');
  await sleep(6000); // Allow login API + dashboard state fetch

  // 2.2 Admin Dashboard
  console.log('[Admin] Capturing Admin Dashboard...');
  await desktopPage.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Dashboard.png') });

  // 2.3 Admin Templates Management
  console.log('[Admin] Capturing Admin Templates Management...');
  await desktopPage.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Templates Management.png') });

  // 2.4 Admin Template Studio
  console.log('[Admin] Capturing Admin Template Studio...');
  await desktopPage.goto(`${BASE_URL}/admin/template-studio`, { waitUntil: 'domcontentloaded' });
  await sleep(6000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Template Studio.png') });

  // 2.5 Admin Transaction History
  console.log('[Admin] Capturing Admin Transaction History...');
  await desktopPage.goto(`${BASE_URL}/admin/history`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Transaction History.png') });

  // 2.6 Admin Device Management
  console.log('[Admin] Capturing Admin Device Management...');
  await desktopPage.goto(`${BASE_URL}/admin/devices`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Device Management.png') });

  // 2.7 Admin System Settings
  console.log('[Admin] Capturing Admin System Settings...');
  await desktopPage.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin System Settings.png') });

  // 2.8 Admin Account Management
  console.log('[Admin] Capturing Admin Account Management...');
  await desktopPage.goto(`${BASE_URL}/admin/accounts`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Account Management.png') });

  // 2.9 Admin Reprocess Utility
  console.log('[Admin] Capturing Admin Reprocess Utility...');
  await desktopPage.goto(`${BASE_URL}/admin/reprocess-templates`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'Admin Reprocess Utility.png') });

  await desktopPage.close();

  // ==========================================
  // 3. MOBILE CAPTURES (390 x 844)
  // ==========================================
  console.log('\n--- Starting Mobile Captures (390x844) ---');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await mobilePage.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  );

  // 3.1 Mobile V1 Landing Page
  console.log('[Mobile] Capturing Mobile V1 Landing Page...');
  await mobilePage.goto(`${BASE_URL}/v1`, { waitUntil: 'domcontentloaded' });
  await sleep(7000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V1 Landing Page.png') });

  // 3.2 Mobile V1 Template Selection
  console.log('[Mobile] Capturing Mobile V1 Template Selection...');
  await mobilePage.goto(`${BASE_URL}/v1?step=1`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V1 Template Selection.png') });

  // 3.3 Mobile V1 Photo Editor
  console.log('[Mobile] Capturing Mobile V1 Photo Editor...');
  await setupMockFlow(mobilePage, sampleTemplate, 3);
  await mobilePage.goto(`${BASE_URL}/v1?step=3`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V1 Photo Editor.png') });

  // 3.4 Mobile V1 Payment Gate
  console.log('[Mobile] Capturing Mobile V1 Payment Gate...');
  await setupMockFlow(mobilePage, sampleTemplate, 3);
  await mobilePage.goto(`${BASE_URL}/v1?step=4`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V1 Payment Gate.png') });

  // 3.5 Mobile V2 Landing Page
  console.log('[Mobile] Capturing Mobile V2 Landing Page...');
  await mobilePage.goto(`${BASE_URL}/v2`, { waitUntil: 'domcontentloaded' });
  await sleep(7000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V2 Landing Page.png') });

  // 3.6 Mobile V2 Template Selection
  console.log('[Mobile] Capturing Mobile V2 Template Selection...');
  await mobilePage.goto(`${BASE_URL}/v2?step=1`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V2 Template Selection.png') });

  // 3.7 Mobile V2 Photo Editor
  console.log('[Mobile] Capturing Mobile V2 Photo Editor...');
  await setupMockFlow(mobilePage, sampleTemplate, 3);
  await mobilePage.goto(`${BASE_URL}/v2?step=3`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V2 Photo Editor.png') });

  // 3.8 Mobile V2 Payment Gate
  console.log('[Mobile] Capturing Mobile V2 Payment Gate...');
  await setupMockFlow(mobilePage, sampleTemplate, 3);
  await mobilePage.goto(`${BASE_URL}/v2?step=4`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile V2 Payment Gate.png') });

  // 3.9 Mobile Admin Login & Dashboard
  console.log('[Mobile] Logging in for Mobile Admin...');
  await mobilePage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await mobilePage.type('input[placeholder*="user" i], input:not([type="password"])', 'root');
  await mobilePage.type('input[type="password"]', 'root');
  await mobilePage.click('button[type="submit"]');
  await sleep(6000);

  console.log('[Mobile] Capturing Mobile Admin Dashboard...');
  await mobilePage.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile Admin Dashboard.png') });

  // 3.10 Mobile Admin Templates
  console.log('[Mobile] Capturing Mobile Admin Templates...');
  await mobilePage.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile Admin Templates.png') });

  // 3.11 Mobile Admin History
  console.log('[Mobile] Capturing Mobile Admin History...');
  await mobilePage.goto(`${BASE_URL}/admin/history`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile Admin History.png') });

  // 3.12 Mobile Admin Settings
  console.log('[Mobile] Capturing Mobile Admin Settings...');
  await mobilePage.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'Mobile Admin Settings.png') });

  await mobilePage.close();
  await browser.close();

  console.log('\n All 35 screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
