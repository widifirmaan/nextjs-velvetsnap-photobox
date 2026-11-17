# VelvetSnap

> Editorial photobooth kiosk platform and automated photo strip compositing engine.

VelvetSnap is a photobooth web application and photo strip generator built with Next.js 16 (App Router), React 19, and Konva canvas. It provides dual kiosk themes (`v1` modern card UI and `v2` newspaper editorial), live camera countdowns, photo adjustments, client-side background removal via WebAssembly, QR-based mobile strip downloads, and an administrative management portal backed by a local SQLite database.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Showcase

| Desktop | Mobile |
| :---: | :---: |
| **Hero Landing Stage Desktop**<br>![VelvetSnap Hero Landing Desktop](screenshots/VelvetSnap%20Hero%20Landing%20Desktop.png) | **Hero Landing Stage Mobile**<br>![VelvetSnap Hero Landing Mobile](screenshots/VelvetSnap%20Hero%20Landing%20Mobile.png) |
| **Editorial Newspaper Showcase Desktop**<br>![VelvetSnap Newspaper Showcase Desktop](screenshots/VelvetSnap%20Newspaper%20Showcase%20Desktop.png) | **Editorial Newspaper Showcase Mobile**<br>![VelvetSnap Newspaper Showcase Mobile](screenshots/VelvetSnap%20Newspaper%20Showcase%20Mobile.png) |
| **Interactive Template Catalog Desktop**<br>![VelvetSnap Template Catalog Desktop](screenshots/VelvetSnap%20Template%20Catalog%20Desktop.png) | **Interactive Template Catalog Mobile**<br>![VelvetSnap Template Catalog Mobile](screenshots/VelvetSnap%20Template%20Catalog%20Mobile.png) |
| **Admin Operations Gate Desktop**<br>![VelvetSnap Admin Portal Desktop](screenshots/VelvetSnap%20Admin%20Portal%20Desktop.png) | **Admin Operations Gate Mobile**<br>![VelvetSnap Admin Portal Mobile](screenshots/VelvetSnap%20Admin%20Portal%20Mobile.png) |

---

## Features

- **Dual Kiosk Themes**: Modern clean layout (`/v1`) and vintage editorial newspaper aesthetic (`/v2`) powered by `V2ThemeProvider`, custom mastheads, paper textures, and responsive layout scaling.
- **Guided Customer Kiosk Workflow**: Step-by-step state flow guiding guests through Template Selection, Simulated QRIS Payment, Viewfinder Capture, Photo Adjustment, and Print/Download.
- **Webcam Hardware Bridge**: Camera stream integration via `react-webcam` with configurable countdown timers (3s, 5s), automated burst sequences, flash effect transitions, and slot indicators.
- **Live Video Clip Recorder (`useClipRecorder`)**: Automated in-browser video capture recording short behind-the-scenes video clips during photo capture sessions.
- **Multi-Layer Canvas Compositor (`react-konva`)**: 2D canvas engine handling photo frame bounding masks, aspect-ratio scaling, drag-and-drop sticker overlays, and high-resolution composite rendering.
- **Client-Side Background Removal**: In-browser neural background removal powered by `@imgly/background-removal` WebAssembly runtime without transmitting images to external servers.
- **Visual Template Studio (`/admin/template-studio`)**: Interactive layout designer for kiosk administrators with draggable canvas layers, sticker asset catalog, and coordinate geometry inspector.
- **Batch Template Reprocessor (`/admin/reprocess-templates`)**: Automated template analysis utility detecting chroma-key placeholders and frame slot coordinates across graphic assets.
- **Kiosk Device Health Monitor (`/admin/devices`)**: Hardware diagnostic panel verifying camera feed availability, resolution profiles, and peripheral status.
- **Admin Operations & Analytics (`/admin`)**: Dashboard tracking revenue metrics (daily, weekly, monthly), transaction history, account roles, and kiosk settings backed by SQLite.
- **Mobile QR Photo Strip Delivery**: Dynamic QR code generation via `qrcode` allowing guests to scan on-screen tickets and download photo strips to mobile devices.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js `16.2.6`, React `19.2.4` | App Router architecture, server components, and concurrent UI rendering |
| **Canvas & Compositing** | Konva `10.3.0`, React-Konva `19.2.4` | 2D canvas drawing engine for photo strip layout composition and layer manipulation |
| **Camera & Video** | React-Webcam `7.2.0` | Browser MediaDevices API abstraction for webcam and camera hardware tethering |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Client-side neural network running via WebAssembly to remove image backgrounds |
| **Database & Persistence** | SQLite 3 | Relational database for settings, templates, device status, and transaction history |
| **API & Edge Server** | Local Router (`worker.js`) | Local API router serving endpoints and handling `/api/*` data operations |
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React `1.17.0` | QR ticket generation, transaction session identification, and SVG iconography |

---

## Database Architecture

VelvetSnap organizes kiosk configuration, admin accounts, frame templates, and transaction audit trails in a relational SQLite database. The schema (`schema.sql`) organizes data across 5 normalized tables:

```sql
-- 1. Kiosk system configuration & branding
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT 'root',
    appName TEXT NOT NULL DEFAULT 'VelvetSnap',
    appTagline TEXT NOT NULL DEFAULT 'AI-Powered Photobooth Experience',
    heroSubtitle TEXT NOT NULL,
    uiTheme TEXT NOT NULL DEFAULT 'v1',      -- 'v1' (modern) or 'v2' (newspaper)
    system TEXT NOT NULL DEFAULT '{}',       -- JSON pricing & timer config
    header TEXT NOT NULL DEFAULT '{}',
    footer TEXT NOT NULL DEFAULT '{}',
    password TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Admin & kiosk operator accounts
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '',
    passwordSalt TEXT NOT NULL DEFAULT '',
    session TEXT NOT NULL DEFAULT '',
    settings TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_accounts_session ON accounts(session);

-- 3. Photo strip templates & dimensions
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL UNIQUE,
    templateName TEXT NOT NULL,
    templatePrice REAL NOT NULL DEFAULT 35000,
    templateFull TEXT NOT NULL,
    templateThumb TEXT NOT NULL,
    templateData TEXT NOT NULL DEFAULT '{}',
    isActive INTEGER NOT NULL DEFAULT 1
);

-- 4. Customer photobooth transactions & captures
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    templateId TEXT NOT NULL DEFAULT 't1',
    price REAL NOT NULL DEFAULT 35000,
    status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, PAID, COMPLETED
    captures TEXT NOT NULL DEFAULT '[]',     -- JSON array of photo captures
    videos TEXT NOT NULL DEFAULT '[]',       -- JSON array of video clips
    finalImage TEXT NOT NULL DEFAULT '',     -- Rendered composite strip URL
    orderId TEXT UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_transactions_sessionId ON transactions(sessionId);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 5. Kiosk hardware peripheral status
CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OFFLINE',  -- ONLINE, OFFLINE
    lastPing TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## Project Structure

```bash
/
├── src/
│   ├── app/
│   │   ├── (themes)/
│   │   │   ├── v1/                  # Modern card-based photobooth kiosk flow
│   │   │   └── v2/                  # Vintage editorial newspaper kiosk flow
│   │   ├── admin/
│   │   │   ├── template-studio/     # Visual strip template editor
│   │   │   ├── templates/           # Template catalog & status management
│   │   │   ├── history/             # Transaction history & ledger
│   │   │   ├── devices/             # Kiosk hardware diagnostics
│   │   │   ├── settings/            # System & theme configuration
│   │   │   ├── login/               # Admin authentication gate
│   │   │   └── page.tsx             # Admin KPI dashboard
│   │   ├── layout.tsx               # Root app layout
│   │   └── page.tsx                 # Public landing page (theme router)
│   ├── components/                  # Reusable UI primitives, modals, viewfinders
│   └── lib/                         # Canvas math, image utilities, and custom hooks
├── public/                          # Frame overlays, stickers, and static assets
├── screenshots/                     # Desktop and mobile showcase mockups
├── scripts/
│   ├── capture-all.mjs              # Screenshot capture automation
│   └── seed.sql                     # Turnkey database seeder with 26 templates
├── schema.sql                       # SQLite database schema definition
├── worker.js                        # Local API router and endpoint bridge
├── wrangler.jsonc                   # Local SQLite database & asset bindings
└── package.json
```

---

## Local Setup & Deployment

### 1. Prerequisites

- **Node.js**: Version `18.18.0` or higher (`20.x` recommended)
- **npm** or **pnpm**
- **SQLite 3**: Native CLI (`sqlite3`) or local runner via `npx wrangler`

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# Install dependencies
npm install
```

### 3. Setup Database & Seeder Lokal

Inisialisasi skema tabel dan isi data awal (seeder) ke database SQLite lokal:

```bash
# Opsi A: Menggunakan SQLite3 CLI langsung
sqlite3 local.db < schema.sql
sqlite3 local.db < scripts/seed.sql

# Atau via npm script
npm run db:setup

# Opsi B: Menggunakan local runtime runner
npx wrangler d1 execute photobox-db --local --file=schema.sql
npm run seed
```

#### Isi Data Seeder:
* **Settings**: Konfigurasi kios default VelvetSnap (tema modern `v1`, pricing Rp 35.000).
* **26 Templates Strip Foto**:
  * 3 Frame Strip Klasik (White Minimalist, Dark Editorial, Pastel Romance)
  * 4 Grid Collage & Retro 90s Frames
  * Newspaper Vintage Mastheads (Times Edition, Gazette Style)
  * Cute & Aesthetic Stickers & Overlays
* **Devices Status**: Device booth `BOOTH-01` dengan status aktif.

### 4. Menjalankan Server Lokal

```bash
# Jalankan frontend Next.js development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

Atau jalankan runtime API lokal terintegrasi:

```bash
npm run build
npx wrangler dev
```

Buka [http://localhost:8787](http://localhost:8787) di browser.

### 5. Panduan Uji Manual (Testing Checklist)

Lakukan verifikasi manual berikut di browser:

| No | Fitur yang Diuji | Langkah Pengujian | Hasil yang Diharapkan |
| :---: | :--- | :--- | :--- |
| 1 | **Theme Gateway** | Buka `/`, pilih tema `v1` atau `v2` | Halaman kiosk tampil sesuai tema (Modern Card UI atau Newspaper Vintage) |
| 2 | **Katalog Template** | Buka `/v1/templates` atau `/v2/templates` | Menampilkan 26 template hasil seeder siap dipilih |
| 3 | **Webcam & Capture** | Izinkan akses kamera, jalankan countdown sesi foto | Viewfinder aktif, countdown 3s/5s berjalan, foto tertangkap di frame slot |
| 4 | **Canvas Editor** | Tambahkan sticker, adjust brightness/filter | Canvas Konva merender layer foto dan elemen grafis tanpa lag |
| 5 | **Simulasi Checkout & QR** | Selesaikan sesi foto, klik Cetak/Download | Tampil QR code untuk download strip foto di mobile |
| 6 | **Admin Portal** | Akses `/admin/login`, masuk ke dashboard `/admin` | Tampil ringkasan revenue, template management, dan device monitor |

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
