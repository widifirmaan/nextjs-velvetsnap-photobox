import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

function resolveDbConfig() {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
      isRemote: true,
    };
  }
  if (process.env.VERCEL) {
    return { url: 'file:/tmp/velvetsnap.db', isRemote: false };
  }
  return { url: `file:${path.resolve(process.cwd(), 'local.db')}`, isRemote: false };
}

function createD1Wrapper(client) {
  const wrapStmt = (sql, boundArgs = []) => ({
    bind(...args) {
      return wrapStmt(sql, args.map((v) => (v === undefined ? null : v)));
    },
    async first(colName) {
      const res = await client.execute({ sql, args: boundArgs });
      const row = res.rows?.[0];
      if (!row) return null;
      const obj = { ...row };
      return colName ? obj[colName] : obj;
    },
    async all() {
      const res = await client.execute({ sql, args: boundArgs });
      return { results: (res.rows || []).map((r) => ({ ...r })) };
    },
    async run() {
      const res = await client.execute({ sql, args: boundArgs });
      return {
        success: true,
        meta: {
          changes: res.rowsAffected ?? 0,
          changed: res.rowsAffected ?? 0,
          last_row_id: res.lastInsertRowid ? Number(res.lastInsertRowid) : 0,
        },
      };
    },
  });

  return {
    prepare(sql) {
      return wrapStmt(sql);
    },
    async executeMultiple(sql) {
      await client.executeMultiple(sql);
    },
  };
}

function resolveUploadPath(uploadDir, key) {
  const cleaned = key.replace(/^\/+/, '');
  const resolved = path.resolve(uploadDir, cleaned);
  if (!resolved.startsWith(uploadDir + path.sep) && resolved !== uploadDir) {
    throw new Error('Invalid storage key path');
  }
  return resolved;
}

function createLocalUploadStore(uploadDir) {
  fs.mkdirSync(uploadDir, { recursive: true });
  return {
    async put(key, buffer, contentType) {
      const filePath = resolveUploadPath(uploadDir, key);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(buffer));
      fs.writeFileSync(`${filePath}.meta`, contentType || 'application/octet-stream');
    },
    async get(key) {
      const filePath = resolveUploadPath(uploadDir, key);
      if (!fs.existsSync(filePath)) return null;
      const buf = fs.readFileSync(filePath);
      const metaPath = `${filePath}.meta`;
      const contentType = fs.existsSync(metaPath)
        ? fs.readFileSync(metaPath, 'utf8')
        : 'application/octet-stream';
      return { buf, contentType };
    },
  };
}

let cachedLocalEnv = null;
let initPromise = null;

export async function initializeDatabase(client, { forceSeed = false } = {}) {
  const check = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'"
  );
  if (check.rows.length === 0) {
    const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'schema.sql'), 'utf8');
    await client.executeMultiple(schemaSql);
    const seedSql = fs.readFileSync(path.resolve(process.cwd(), 'scripts/seed.sql'), 'utf8');
    await client.executeMultiple(seedSql);
    return { initialized: true, seeded: true };
  }
  if (forceSeed) {
    const seedSql = fs.readFileSync(path.resolve(process.cwd(), 'scripts/seed.sql'), 'utf8');
    await client.executeMultiple(seedSql);
    return { initialized: false, seeded: true };
  }
  return { initialized: false, seeded: false };
}

export async function getLocalEnv() {
  if (!initPromise) {
    initPromise = (async () => {
      const cfg = resolveDbConfig();
      const client = createClient({ url: cfg.url, authToken: cfg.authToken });
      await initializeDatabase(client);
      const isVercel = Boolean(process.env.VERCEL);
      cachedLocalEnv = {
        PHOTOBOX_DB: createD1Wrapper(client),
        LOCAL_UPLOADS: isVercel ? null : createLocalUploadStore(path.resolve(process.cwd(), '.local-uploads')),
        CLOUDINARY_URL: process.env.CLOUDINARY_URL,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
        MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
        DOKU_CLIENT_ID: process.env.DOKU_CLIENT_ID,
        DOKU_B2B_SECRET_KEY: process.env.DOKU_B2B_SECRET_KEY,
        DOKU_SECRET_KEY: process.env.DOKU_SECRET_KEY,
        DOKU_MERCHANT_ID: process.env.DOKU_MERCHANT_ID,
        DOKU_IS_PRODUCTION: process.env.DOKU_IS_PRODUCTION,
        PIXABAY_API_KEY: process.env.PIXABAY_API_KEY,
      };
      return cachedLocalEnv;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
