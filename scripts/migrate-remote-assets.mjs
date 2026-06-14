/**
 * Migration script: upload all base64 element stickerUrls to Cloudinary
 * by re-saving each template via the API.
 *
 * This replicates the core logic of template-studio's save flow:
 *   1. Fetch template data
 *   2. Upload any base64 element stickerUrl to Cloudinary via /api/upload
 *   3. Update element with Cloudinary URL
 *   4. PUT updated template back
 *
 * Usage:
 *   ADMIN_PASSWORD=root node scripts/migrate-remote-assets.mjs
 *
 * Or for remote:
 *   BASE_URL=https://velvetsnap.vercel.app ADMIN_PASSWORD=xxx node scripts/migrate-remote-assets.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'root';

async function api(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(`${options.method || 'GET'} ${path}: ${data.error}`);
  return data;
}

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

async function main() {
  console.log(`Starting remote asset migration at ${BASE}\n`);

  // ── Login to get session token ──
  console.log('Logging in...');
  const login = await api('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  const token = login.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log('Logged in\n');

  // ── Fetch all templates ──
  console.log('Fetching templates...');
  const list = await api('/api/templates/list', { headers: authHeaders });
  const templates = list.data;
  console.log(`Found ${templates.length} templates\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const id = t._id || t.templateId;
    process.stdout.write(`[${i + 1}/${templates.length}] ${t.templateName || id} ... `);

    try {
      // ── Load full template data (including elements) ──
      const detail = await api(`/api/templates/thumbnails?id=${id}`, { headers: authHeaders });
      const template = detail.data?.[0];
      if (!template) { console.log('SKIP (no data)'); skipped++; continue; }

      const elements = template.templateData?.elements || template.elements || [];
      if (elements.length === 0) { console.log('SKIP (no elements)'); skipped++; continue; }

      // ── Check for base64 stickerUrls ──
      const base64Els = elements.filter((el) => isBase64(el.props?.stickerUrl));
      if (base64Els.length === 0) { console.log('OK (no base64)'); skipped++; continue; }

      process.stdout.write(`${base64Els.length} base64 sticker(s) ... `);

      // ── Upload each base64 to Cloudinary via /api/upload ──
      const folderId = template.templateId || id;
      const baseFolder = `velvetsnap/templates/${folderId}`;

      const uploads = await Promise.all(base64Els.map(async (el) => {
        const key = 'el_' + el.id;
        const up = await api('/api/upload', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ dataUri: el.props.stickerUrl, folder: baseFolder, publicId: key }),
        });
        return { id: el.id, url: up.url };
      }));

      // ── Apply uploaded URLs ──
      for (const u of uploads) {
        const el = elements.find((e) => e.id === u.id);
        if (el) el.props.stickerUrl = u.url;
      }

      // ── PUT updated template ──
      await api(`/api/templates/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          templateName: template.templateName,
          templateDesc: template.templateDesc,
          templatePrice: template.templatePrice,
          templateFull: template.templateFull || '',
          templateThumb: template.templateThumb || '',
          templateData: {
            elements,
            slotsLayout: template.templateData?.slotsLayout || [],
            canvasWidth: template.templateData?.canvasWidth || 1000,
            canvasHeight: template.templateData?.canvasHeight || 3000,
            color: template.templateData?.color || '#ffffff',
            type: template.templateData?.type || 'strip',
            slots: template.templateData?.slots || elements.filter((e) => e.type === 'photo-slot').length,
          },
          isActive: template.isActive,
        }),
      });

      console.log(`MIGRATED (${uploadUrls(uploads)})`);
      migrated++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${templates.length}, Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`);
}

function uploadUrls(uploads) {
  return uploads.map((u) => u.id).join(', ');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
