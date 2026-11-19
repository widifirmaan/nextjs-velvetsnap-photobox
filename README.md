# VelvetSnap

> Self-service photobooth kiosk platform and automated photo strip generator featuring dual UI themes, Konva canvas compositor, and an administrative management portal.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Live URL

- **Production URL**: [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)

---

## Screenshots

| Desktop (MacBook Pro M4) | Mobile (iPhone 16 Pro) |
| :---: | :---: |
| **Kiosk Home (Modern v1 Theme)**<br>![Kiosk Home](screenshots/Kiosk%20Home%20Desktop.png) | **Kiosk Home (Modern v1 Theme)**<br>![Kiosk Home](screenshots/Kiosk%20Home%20Mobile.png) |
| **Photo Strip Template Catalog**<br>![Template Catalog](screenshots/Template%20Catalog%20Desktop.png) | **Photo Strip Template Catalog**<br>![Template Catalog](screenshots/Template%20Catalog%20Mobile.png) |
| **Camera Viewfinder & Countdown**<br>![Camera Viewfinder](screenshots/Camera%20Viewfinder%20Desktop.png) | **Camera Viewfinder & Countdown**<br>![Camera Viewfinder](screenshots/Camera%20Viewfinder%20Mobile.png) |
| **Canvas Strip Compositor (Konva)**<br>![Canvas Editor](screenshots/Canvas%20Editor%20Desktop.png) | **Canvas Strip Compositor (Konva)**<br>![Canvas Editor](screenshots/Canvas%20Editor%20Mobile.png) |
| **Simulated QRIS Payment Gate**<br>![Payment QRIS](screenshots/Payment%20QRIS%20Desktop.png) | **Simulated QRIS Payment Gate**<br>![Payment QRIS](screenshots/Payment%20QRIS%20Mobile.png) |
| **Mobile QR Download Ticket & Print Output**<br>![Result & QR](screenshots/Result%20&%20QR%20Desktop.png) | **Mobile QR Download Ticket & Print Output**<br>![Result & QR](screenshots/Result%20&%20QR%20Mobile.png) |
| **Vintage Newspaper Kiosk Theme (v2)**<br>![Newspaper Theme](screenshots/Newspaper%20Theme%20Desktop.png) | **Vintage Newspaper Kiosk Theme (v2)**<br>![Newspaper Theme](screenshots/Newspaper%20Theme%20Mobile.png) |
| **Newspaper Theme Frame Catalog**<br>![Newspaper Template Catalog](screenshots/Newspaper%20Template%20Catalog%20Desktop.png) | **Newspaper Theme Frame Catalog**<br>![Newspaper Template Catalog](screenshots/Newspaper%20Template%20Catalog%20Mobile.png) |
| **Admin Operations Login Gateway**<br>![Admin Login](screenshots/Admin%20Login%20Desktop.png) | **Admin Operations Login Gateway**<br>![Admin Login](screenshots/Admin%20Login%20Mobile.png) |
| **Operations Dashboard & KPI Metrics**<br>![Admin Dashboard](screenshots/Admin%20Dashboard%20Desktop.png) | **Operations Dashboard & KPI Metrics**<br>![Admin Dashboard](screenshots/Admin%20Dashboard%20Mobile.png) |
| **Strip Layout Template Studio**<br>![Admin Studio](screenshots/Admin%20Studio%20Desktop.png) | **Strip Layout Template Studio**<br>![Admin Studio](screenshots/Admin%20Studio%20Mobile.png) |
| **Frame Templates Catalog Management**<br>![Admin Templates](screenshots/Admin%20Templates%20Desktop.png) | **Frame Templates Catalog Management**<br>![Admin Templates](screenshots/Admin%20Templates%20Mobile.png) |
| **Customer Photo Sessions Ledger**<br>![Admin History](screenshots/Admin%20History%20Desktop.png) | **Customer Photo Sessions Ledger**<br>![Admin History](screenshots/Admin%20History%20Mobile.png) |
| **Kiosk Camera Hardware Diagnostics**<br>![Admin Devices](screenshots/Admin%20Devices%20Desktop.png) | **Kiosk Camera Hardware Diagnostics**<br>![Admin Devices](screenshots/Admin%20Devices%20Mobile.png) |
| **System Settings & Branding Configuration**<br>![Admin Settings](screenshots/Admin%20Settings%20Desktop.png) | **System Settings & Branding Configuration**<br>![Admin Settings](screenshots/Admin%20Settings%20Mobile.png) |
| **Bulk Frame Reprocessing Utility**<br>![Admin Reprocess Templates](screenshots/Admin%20Reprocess%20Templates%20Desktop.png) | **Bulk Frame Reprocessing Utility**<br>![Admin Reprocess Templates](screenshots/Admin%20Reprocess%20Templates%20Mobile.png) |

---

## Fitur

- **Dual Kiosk Themes**: Modern clean interface (`/v1`) and vintage editorial newspaper aesthetic (`/v2`) powered by paper textures, custom typography mastheads, and responsive scaling.
- **Guided Customer Workflow**: Step-by-step state machine guiding guests through Template Selection, Simulated QRIS Payment, Viewfinder Capture, Photo Adjustment & Stickers, and Print/Download.
- **Webcam Hardware Bridge (`react-webcam`)**: Camera stream integration with configurable countdown timers (3s, 5s), automated burst capture sequences, flash animation transitions, and slot indicators.
- **Automated Video Clip Recorder (`useClipRecorder`)**: In-browser background video recording capturing behind-the-scenes video memories during photo shoots.
- **Multi-Layer Canvas Compositor (`react-konva`)**: High-resolution 2D canvas engine handling photo frame masking, aspect-ratio scaling, drag-and-drop sticker overlays, and composite strip rendering.
- **Client-Side Background Removal (WASM)**: Neural network background removal powered by `@imgly/background-removal` WebAssembly runtime executing directly in the browser without third-party servers.
- **Interactive Template Studio (`/admin/template-studio`)**: Visual strip designer for kiosk operators featuring draggable canvas layers, sticker catalogs, and geometric coordinate controls.
- **Kiosk Hardware Health Monitor (`/admin/devices`)**: Hardware diagnostic panel verifying webcam feed availability, resolution profiles, and kiosk connection states.
- **Admin Analytics Dashboard (`/admin`)**: Operations portal tracking session volume, daily/weekly revenue graphs, customer transaction history, and pricing rules.
- **Dynamic Mobile QR Delivery**: On-screen QR ticket generation via `qrcode` allowing users to scan and download full-resolution digital strips to mobile devices.

---

## Tech Stack

| Category | Technology | Description / Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js `16.2.6` (App Router), React `19.2.4` | App Router architecture, server components, and concurrent UI rendering |
| **Canvas & Compositing** | Konva `10.3.0`, React-Konva `19.2.4` | 2D canvas drawing engine for photo strip layout composition and sticker layers |
| **Camera & Video** | React-Webcam `7.2.0` | MediaDevices API abstraction for webcam streaming and camera capture |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Client-side neural network running via WebAssembly to remove backgrounds |
| **Database** | SQLite 3 | Relational database for settings, templates, device status, and transaction history |
| **API Server** | Local Router (`worker.js`) | Local endpoint router handling `/api/*` data operations |
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React | QR ticket generation, transaction session identification, and SVG iconography |

## Tutorial Run Local & Setup

### 1. Prerequisites

- **Node.js**: Version `20.x` or `22.x`
- **npm** or **pnpm**
- **SQLite 3**: Native CLI (`sqlite3`)

### 2. Environment Variables Setup

Create a `.env.local` file in the project root:

```env
ADMIN_ROOT_PASSWORD=root
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation

```bash
# Clone the repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# Install dependencies
npm install
```

### 4. Database Schema & Seeder Setup

VelvetSnap organizes kiosk settings, operator accounts, frame templates, and transaction history in a relational SQLite database (`schema.sql`):

```sql
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT 'root',
    appName TEXT NOT NULL DEFAULT 'VelvetSnap',
    appTagline TEXT NOT NULL DEFAULT 'AI-Powered Photobooth Experience',
    heroSubtitle TEXT NOT NULL,
    uiTheme TEXT NOT NULL DEFAULT 'v1',
    system TEXT NOT NULL DEFAULT '{}',
    header TEXT NOT NULL DEFAULT '{}',
    footer TEXT NOT NULL DEFAULT '{}',
    password TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '',
    passwordSalt TEXT NOT NULL DEFAULT '',
    session TEXT NOT NULL DEFAULT '',
    settings TEXT NOT NULL DEFAULT '{}'
);

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

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    templateId TEXT NOT NULL DEFAULT 't1',
    price REAL NOT NULL DEFAULT 35000,
    status TEXT NOT NULL DEFAULT 'PENDING',
    captures TEXT NOT NULL DEFAULT '[]',
    videos TEXT NOT NULL DEFAULT '[]',
    finalImage TEXT NOT NULL DEFAULT '',
    orderId TEXT UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OFFLINE',
    lastPing TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Initialize the SQLite database schema and root administrator credentials:

```bash
# Initialize local SQLite schema
sqlite3 local.db < schema.sql
```

#### Pre-seeded Demo Credentials & Auth:
- **Username**: `root`
- **Password**: `root`
- **Access Route**: Login via `/admin/login` to access the operations dashboard, template studio, and transaction ledger.

### 5. Running the Local Server

```bash
# Start Next.js development server
npm run dev
```

Open [http://localhost:3000/v1](http://localhost:3000/v1) for the customer kiosk interface, or [http://localhost:3000/admin](http://localhost:3000/admin) for the management portal.

---

## Author

Made with ❤️ by **Widi Firmansyah** / [widifirmaan.web.id](https://widifirmaan.web.id)
