import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'root';
const CHROMIUM_PATH = '/data/data/com.termux/files/usr/bin/chromium-browser';

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
  console.log(`Starting batch re-save at ${BASE}`);

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Login via API directly
    console.log('Logging in...');
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
    console.log('Logged in (via API)');

    // Navigate to templates list
    console.log('Fetching template list...');
    await gotoPage(page, `${BASE}/admin/templates`);

    const ids = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/admin/template-studio?edit="]'));
      return links.map((a) => new URL(a.href).searchParams.get('edit')).filter(Boolean);
    });

    console.log(`Found ${ids.length} templates`);

    if (ids.length === 0) {
      console.log('No templates to process.');
      await browser.close();
      return;
    }

    let success = 0;
    let fail = 0;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      console.log(`\n[${i + 1}/${ids.length}] Template: ${id}`);

      try {
        await gotoPage(page, `${BASE}/admin/template-studio?edit=${id}`);
        console.log(`  Loaded, waiting 5s for canvas...`);
        await sleep(5000);

        // Override fetch to change black #000000 to white #ffffff on save
        await page.evaluate(() => {
          const origFetch = window.fetch;
          window.fetch = function(...args) {
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
            if (args[1]?.body && (url.includes('/api/templates/'))) {
              try {
                const body = JSON.parse(args[1].body);
                const color = body.templateData?.color || body.color;
                if (color === '#000000') {
                  if (body.templateData) body.templateData.color = '#ffffff';
                  body.color = '#ffffff';
                  args[1].body = JSON.stringify(body);
                  console.log('[BatchFix] Changed #000000 to #ffffff');
                }
              } catch {}
            }
            return origFetch.apply(this, args);
          };
        });

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
        console.log('  Save submitted');

        await page.waitForFunction(
          () => window.location.pathname.includes('/admin/templates'),
          { timeout: 20000 }
        );
        console.log('  Done');
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
