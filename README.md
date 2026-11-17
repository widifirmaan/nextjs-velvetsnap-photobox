# VelvetSnap

> Editorial photobooth kiosk platform and automated photo strip compositing engine.

VelvetSnap is a photobooth web application and photo strip generator built with Next.js 16 (App Router), React 19, and Konva canvas. Deployed on Cloudflare Workers with static assets and a custom Edge Worker API (`worker.js`), it provides dual kiosk themes (`v1` modern card UI and `v2` newspaper editorial), live camera countdowns, photo adjustments, client-side background removal via WebAssembly, QR-based mobile strip downloads, and an administrative management portal backed by Cloudflare D1 (SQLite).

[![Live Demo](https://img.shields.io/badge/Demo-photo.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://photo.widifirmaan.web.id)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![Cloudflare Worker](https://img.shields.io/badge/Deployment-Cloudflare_Worker-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Live Production

- **URL:** [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)
- **Deployment:** Cloudflare Worker with static assets (`wrangler.jsonc`)
- **Database:** Cloudflare D1 Relational SQLite (`photobox-db`)

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
- **Admin Operations & Analytics (`/admin`)**: Dashboard tracking revenue metrics (daily, weekly, monthly), transaction history, account roles, and kiosk settings backed by Cloudflare D1.
- **Mobile QR Photo Strip Delivery**: Dynamic QR code generation via `qrcode` allowing guests to scan on-screen tickets and download photo strips to mobile devices.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js `16.2.6`, React `19.2.4` | App Router architecture, server components, and concurrent UI rendering |
| **Canvas & Compositing** | Konva `10.3.0`, React-Konva `19.2.4` | 2D canvas drawing engine for photo strip layout composition and layer manipulation |
| **Camera & Video** | React-Webcam `7.2.0` | Browser MediaDevices API abstraction for webcam and camera hardware tethering |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Client-side neural network running via WebAssembly to remove image backgrounds |
| **Database & Runtime** | Cloudflare D1 (SQLite), Cloudflare Worker | Relational edge persistence and custom Worker router (`worker.js`) |
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React `1.17.0` | QR ticket generation, transaction session identification, and SVG iconography |

---

## Database Architecture

VelvetSnap utilizes Cloudflare D1 (serverless relational SQLite) for kiosk configuration, admin accounts, frame templates, and transaction audit trails. The schema (`schema.sql`) organizes data across 5 tables:

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
├── scripts/                         # Capture automation and batch migration scripts
├── schema.sql                       # Cloudflare D1 SQLite database schema
├── worker.js                        # Cloudflare Worker edge API and router
├── wrangler.jsonc                   # Cloudflare Worker, D1 database, and route configuration
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: Version 18.18.0 or higher
- **Cloudflare Wrangler CLI**: Installed locally or run via `npx wrangler`

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# Install project dependencies
npm install
```

### 2. Database Setup (Cloudflare D1)

Initialize the SQLite database locally with the provided schema:

```bash
# Local SQLite emulation (.wrangler/state)
npx wrangler d1 execute photobox-db --local --file=schema.sql

# Or apply to remote Cloudflare D1
npx wrangler d1 execute photobox-db --remote --file=schema.sql
```

### 3. Local Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

To run the complete Cloudflare Worker environment locally (Next.js static assets + Worker API + D1 emulation):

```bash
npm run build
npx wrangler dev
```

### 4. Admin Portal Access

Navigate to `/admin/login`. On the first setup, the system registers the primary admin credentials configured in the settings table.

---

## Production Build & Deployment

To build and deploy to Cloudflare Workers:

```bash
# Compile Next.js static export
npm run build

# Deploy assets and Worker script via Wrangler
npm run deploy
```

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
