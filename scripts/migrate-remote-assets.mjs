/**
 * Migration script: re-save all templates via template-studio UI
 * to upload any remaining base64 stickerUrl to Cloudinary.
 *
 * Usage:
 *   BASE_URL=https://velvetsnap.vercel.app ADMIN_PASSWORD=xxx node scripts/migrate-remote-assets.mjs
 *
 * Defaults:
 *   BASE_URL=http://localhost:3000
 *   ADMIN_PASSWORD=root
 *   CHROMIUM_PATH=/usr/bin/chromium-browser  (or set env)
 *
 * It mimics the exact manual flow:
 *   1. Login → navigate to /admin/templates
 *   2. Collect all template edit links
 *   3. Open each in template-studio
 *   4. Wait for canvas to fully load
 *   5. Click "Save Template" → confirm → wait for redirect
 *   6. Repeat
 */

import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'root';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function gotoPage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    if (!e.message.includes('frame was detached') && !e.message.includes('LifecycleWatcher')) throw e;
  }
  await sleep(1500);
  return page.url();
}

async function main() {
  console.log(`Starting remote asset migration at ${BASE}`);
  console.log(`Chromium: ${CHROMIUM_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // ── Login ──
    console.log('\nLogging in...');
    await gotoPage(page, `${BASE}/admin/login`);
    const loginRes = await page.evaluate(async (pw) => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.token) sessionStorage.setItem('admin_session_token', data.token);
      return data.token;
    }, ADMIN_PASSWORD);

    if (!loginRes) {
      console.error('Login failed — wrong password?');
      await browser.close();
      return;
    }
    console.log('Logged in');

    // ── Collect template IDs ──
    console.log('\nFetching template list...');
    await gotoPage(page, `${BASE}/admin/templates`);

    const ids = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/admin/template-studio?edit="]'));
      return links.map((a) => new URL(a.href).searchParams.get('edit')).filter(Boolean);
    });

    console.log(`Found ${ids.length} templates`);
    if (ids.length === 0) {
      console.log('Nothing to migrate.');
      await browser.close();
      return;
    }

    // ── Process each template ──
    let success = 0;
    let fail = 0;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      console.log(`\n[${i + 1}/${ids.length}] ${id}`);

      try {
        await gotoPage(page, `${BASE}/admin/template-studio?edit=${id}`);
        console.log('  Loading canvas...');
        await sleep(5000);

        // Click "Save Template" button
        const saveClicked = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(
            (b) => b.textContent.trim().includes('Save Template')
          );
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (!saveClicked) {
          console.error('  Save Template button not found');
          fail++;
          continue;
        }
        console.log('  Save modal opened');
        await sleep(1000);

        // Click confirm (Update / Save)
        const confirmClicked = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(
            (b) => (b.textContent.trim() === 'Update' || b.textContent.trim() === 'Save') && !b.disabled
          );
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (!confirmClicked) {
          console.error('  Confirm button not found');
          fail++;
          continue;
        }
        console.log('  Save submitted, waiting for redirect...');

        await page.waitForFunction(
          () => window.location.pathname.includes('/admin/templates'),
          { timeout: 30000 }
        );
        console.log('  Done ✓');
        success++;
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        fail++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total: ${ids.length}, Success: ${success}, Failed: ${fail}`);
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();
  }
}

main();
