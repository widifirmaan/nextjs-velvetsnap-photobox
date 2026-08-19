<!-- File: AGENTS.md -->
<!-- Description: Auto-added top comment for easier file identification. -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context — VelvetSnap Photobox

## Architecture
- **StepperFlow** (step 0–4): Template → Photo → Edit → Pay → Cetak
- **Standalone pages deleted**: all traffic through StepperFlow only
- **Admin** at `/admin/login`, template-studio at `/strips-studio`
- **DB**: MongoDB via Mongoose, cached on `globalThis`
- **Payments**: Doku SNAP QRIS Direct API (server-side `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate`)

## Key Decisions
- Chroma key runs in background after template selection
- `removeGreenScreen` threshold = 5000 (canonical file: `canvas-utils.ts`)
- Frame slots: transparent holes via `renderStripFrame` + `removeGreenScreen`
- Template list cached in `sessionStorage`, preloaded from homepage
- `react-konva` lazy-loaded via `next/dynamic({ ssr: false })`
- `qrcode` lazy-loaded via dynamic `import()`
- `@imgly/background-removal` dynamically imported (WASM ~30MB)
- **No standalone routes** (`/booth`, `/result`, `/payment`, `/template` deleted)
- **Payment Gateway**: Doku SNAP QRIS Direct API (returns `qrContent` directly, not hosted page URL)
- **Doku API**: Uses OAuth B2B token + HMAC-SHA512 signature for SNAP QRIS (`/snap-adapter/b2b/v1.0/qr/qr-mpm-generate`)
- **Doku env vars**: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_B2B_SECRET_KEY`, `DOKU_MERCHANT_ID`, `DOKU_TERMINAL_ID`, `DOKU_POSTAL_CODE`, `DOKU_IS_PRODUCTION`

## Types
- `ISlot`, `IStripElement`, `ElementProps` defined in `src/app/main/types.ts`
- `canvas-utils.ts` imports them from `types.ts` (no longer duplicates)
- `models/Template.ts` has its own `ISlot`/`IStripElement` (server-side, different props type)
- `midtrans-client.d.ts` — declaration file, uses `Record<string, any>` (external API)
- Remaining `as any` casts: EditorCanvas (Konva), settings/route.ts (cleanDoc)

## Dependencies
- Dead deps removed: `jimp`, `html-to-image`, `playwright`, `puppeteer-core` (~95 packages)
- All remaining deps used (verified): mongoose, next, react, lucide-react, uuid, konva,
  react-konva, react-webcam, cloudinary, midtrans-client, qrcode, @imgly/background-removal

## CSS
- Main stylesheet: `src/app/main/page.module.css` (~1866 lines after pruning 15 unused classes)
- Each admin page has its own CSS module
- All `<img>` tags in public + admin pages migrated to `next/image` (13 total)
  Remaining `<img>` tags are all data-URLs / blob URLs / template literals (not convertible)

## Optimization History (completed phases)
1. Constants extraction (magic numbers → `constants.ts`, 23 raw strings → `STORAGE_KEYS`)
2. API caching (3 routes: templates/list 300s, count 300s, strips 60s)
3. ISR admin dashboard (`revalidate = 0` → `60`)
4. Dead code: standalone pages (-1.5K), UI components, useCompositing hook, admin components
5. Image migration: 13 `<img>` → `next/image` (7 public + 6 admin)
6. Type cleanup: 80% of `any` types removed (catch blocks, Transaction casts, filter types, db.ts)
7. Bundle size: lazy-loaded konva + qrcode, removed 95 dead packages
8. CSS pruning: 15 unused classes removed (-103 lines)
9. Type dedup: `ISlot`/`IStripElement` now single source in `types.ts`

## Remaining Any Types (~5 files)
- `normalize-template.ts`: `doc: any` (intentional — normalization function)
- `EditorCanvas.tsx`: Konva `stage as any`, `elCommon as any` (library limitation)
- `settings/route.ts`: `cleanDoc(doc as any)` (MongoDB collection type mismatch)
- `midtrans-client.d.ts`: `Record<string, any>` (declaration file, external API)
- `settings/page.tsx`: `(prev[section] as any)` (dynamic key access)
