import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://photo.widifirmaan.web.id';
const repoDir = path.resolve(__dirname, '..');
const rawDir = path.resolve(repoDir, 'raw_screenshots');
const screenshotsDir = path.resolve(repoDir, 'screenshots');

if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const desktopViewport = { width: 1440, height: 900, deviceScaleFactor: 1.5 };
const mobileViewport = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scenes = [
  {
    name: 'VelvetSnap Hero Landing',
    url: `${BASE_URL}/v1`,
    delay: 4000,
  },
  {
    name: 'VelvetSnap Newspaper Showcase',
    url: `${BASE_URL}/v2`,
    delay: 4000,
  },
  {
    name: 'VelvetSnap Template Catalog',
    url: `${BASE_URL}/v2?step=1`,
    delay: 4500,
  },
  {
    name: 'VelvetSnap Admin Portal',
    url: `${BASE_URL}/admin/login`,
    delay: 3500,
  },
];

async function capture() {
  console.log(`Starting capture from ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  for (const scene of scenes) {
    console.log(`\nCapturing scene: [${scene.name}]`);

    // Desktop
    const dPage = await browser.newPage();
    await dPage.setViewport(desktopViewport);
    await dPage.goto(scene.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(scene.delay);
    const dDest = path.join(rawDir, `${scene.name} Desktop.png`);
    await dPage.screenshot({ path: dDest });
    console.log(`  ✓ Desktop -> ${path.basename(dDest)}`);
    await dPage.close();

    // Mobile
    const mPage = await browser.newPage();
    await mPage.setViewport(mobileViewport);
    await mPage.goto(scene.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(scene.delay);
    const mDest = path.join(rawDir, `${scene.name} Mobile.png`);
    await mPage.screenshot({ path: mDest });
    console.log(`  ✓ Mobile  -> ${path.basename(mDest)}`);
    await mPage.close();
  }

  await browser.close();
  console.log('\nAll raw screenshots captured!');

  console.log('\nGenerating MacBook Pro & iPhone 16 Pro mockups...');
  const mockupScript = '/home/widifirmaan/Projects/readme-project/scripts/generate-mockups.mjs';
  execSync(`node "${mockupScript}" --input "${rawDir}" --output "${screenshotsDir}"`, {
    stdio: 'inherit',
  });

  console.log('\nMockup generation finished successfully!');
}

capture().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
