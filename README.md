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

---

## Fitur

- **Dual Kiosk Themes**: Modern clean interface (`/v1`) and vintage editorial newspaper aesthetic (`/v2`) powered by paper textures, custom typography mastheads, and responsive scaling.
- **Guided Customer Workflow**: Step-by-step state machine guiding guests through Template Selection, DOKU SNAP QRIS Payment (with testing/operator bypass support), Viewfinder Capture, Photo Adjustment & Stickers, and Print/Download.
- **Webcam Hardware Bridge (`react-webcam`)**: Camera stream integration with configurable countdown timers (3s, 5s), automated burst capture sequences, flash animation transitions, and slot indicators.
- **Automated Video Clip Recorder (`useClipRecorder`)**: In-browser background video recording capturing behind-the-scenes video memories during photo shoots.
- **Multi-Layer Canvas Compositor (`react-konva`)**: High-resolution 2D canvas engine handling photo frame masking, aspect-ratio scaling, drag-and-drop sticker overlays, and composite strip rendering.
- **Client-Side Background Removal (WASM)**: Neural network background removal powered by `@imgly/background-removal` WebAssembly runtime executing directly in the browser without third-party servers.
- **Interactive Template Studio (`/admin/template-studio`)**: Visual strip designer for kiosk operators featuring draggable canvas layers, sticker catalogs, and geometric coordinate controls.
- **Kiosk Hardware Health Monitor (`/admin/devices`)**: Hardware diagnostic panel verifying webcam feed availability, resolution profiles, and kiosk connection states.
- **Admin Analytics Dashboard (`/admin`)**: Operations portal tracking session volume, daily/weekly revenue graphs, customer transaction history, and pricing rules.
- **Mobile Digital Delivery & Download Portal (`/download`)**: On-screen QR ticket generation via `qrcode` allowing users to scan and download full-resolution digital strips and behind-the-scenes video clips directly to mobile devices via `/download?session=<id>`.

---

## Tech Stack

| Category | Technology | Description / Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js `16.2.6` (App Router), React `19.2.4` | App Router architecture, server components, and concurrent UI rendering |
| **Canvas & Compositing** | Konva `10.3.0`, React-Konva `19.2.4` | 2D canvas drawing engine for photo strip layout composition and sticker layers |
| **Camera & Video** | React-Webcam `7.2.0` | MediaDevices API abstraction for webcam streaming and camera capture |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Client-side neural network running via WebAssembly to remove backgrounds |
| **Database** | Cloudflare D1 (SQLite 3) | Relational database for settings, templates, device status, and transaction history |
| **Media Storage** | Cloudinary API | Cloud storage for rendered photo strips, template graphics, and recorded video clips |
| **API Server** | Serverless Edge Worker (`worker.js`) | Endpoint router handling `/api/*` data operations and DOKU SNAP QRIS payment workflows |
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React | QR ticket generation, transaction session identification, and SVG iconography |

## Tutorial Run Local & Setup

### 1. Prerequisites

- **Node.js**: Version `20.x` or `22.x`
- **npm** or **pnpm**
- Database: **No native database installation needed** (handled by Cloudflare D1 local simulation via Wrangler).

### 2. Environment Variables Setup

Jika ingin mengaktifkan upload cloud storage atau integrasi pembayaran production, buat file `.env.local` (opsional):

```env
# Cloud Media Storage (Opsional: upload strip foto dan aset template)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Payment Gateway (Opsional: biarkan kosong untuk menggunakan tombol operator bypass saat testing)
DOKU_CLIENT_ID=
DOKU_SECRET_KEY=
DOKU_MERCHANT_ID=
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

VelvetSnap mengorganisir pengaturan kios, akun operator, template frame, dan riwayat transaksi dalam database SQLite (`schema.sql`):

| Tabel | Keterangan / Entitas Data |
| :--- | :--- |
| `settings` | Konfigurasi branding kios, tema (`v1`/`v2`), warna primer/aksen, dan slideshow |
| `accounts` | Akun operator dan autentikasi administrator (`root`) |
| `templates` | Desain frame foto strip, harga, layer kanvas, dan thumbnail |
| `transactions` | Log sesi foto, status pembayaran (PENDING/PAID), URL strip final, dan referensi QRIS |
| `devices` | Status koneksi dan heartbeat perangkat kiosk (`ONLINE`/`OFFLINE`) |

Inisialisasi skema Cloudflare D1 lokal dan seeder data awal:

```bash
# Inisialisasi skema ke Cloudflare D1 lokal via Wrangler
npx wrangler d1 execute photobox-db --local --file=schema.sql

# Seed akun root default dan template frame bawaan
npm run seed
```

#### Pre-seeded Demo Credentials & Auth:
- **Username**: `root`
- **Password**: `root`
- **Access Route**: Login via `/admin/login` to access the operations dashboard, template studio, and transaction ledger.

### 5. Running the Local Server

VelvetSnap is packaged as a static export SPA (`output: 'export'`) with API persistence provided by `worker.js`:

```bash
# Option A: Start Next.js development server on port 3000 (Kiosk UI testing)
npm run dev

# Option B: Run fullstack locally with Cloudflare Worker & D1 simulation on port 8787
npx wrangler dev
```

Open [http://localhost:3000/v1](http://localhost:3000/v1) (or `http://localhost:8787/v1` under Wrangler) for the customer kiosk interface, or `/admin` for the management portal.

---

## Author

Made with ❤️ by **Widi Firmansyah** / [widifirmaan.web.id](https://widifirmaan.web.id)
