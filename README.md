# VelvetSnap - Web Photobooth Kiosk

Fullstack web photobooth platform and operator dashboard built with Next.js App Router, React, TypeScript, Konva, and SQLite/LibSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Konva](https://img.shields.io/badge/Konva-10-0D9488?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-LibSQL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

VelvetSnap provides a self-service photobooth kiosk workflow alongside a multi-account admin panel for managing photo strip templates, pricing, device status, branding, and QRIS payment transactions. It runs locally out of the box with SQLite (`local.db`) and local media uploads, with optional integrations for LibSQL/Turso, Cloudinary, Midtrans, DOKU SNAP QRIS, and Pixabay.

## Live URL

- **URL:** [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)

## Features

- **Dual Kiosk Themes (`/v1`, `/v2`):** Switch dynamically via admin settings between the Modern Kiosk interface (`/v1`) and the Vintage Newspaper editorial theme (`/v2`).
- **Guided Kiosk Stepper (`/?step=1..5`):** Walks guests through template selection, QRIS checkout (Midtrans / DOKU SNAP with operator bypass for offline or test events), camera capture, photo adjustment, and result download/print.
- **Webcam Capture & Clip Recording (`react-webcam`):** Live viewfinder with countdown timers, multi-slot capture progress, flash animation, and behind-the-scenes clip recording.
- **Photo Strip Compositing:** Real-time preview adjustments (zoom, pan, brightness, contrast, saturation, warm tone via CSS filters) rendered onto a high-resolution HTML5 Canvas 2D strip composite.
- **QR Ticket & Mobile Download (`/download`):** Generates scannable QR codes (`qrcode`) linking directly to digital strip downloads and printable photo layouts.
- **Admin Template Studio (`/admin/template-studio`):** Drag-and-drop canvas editor powered by `react-konva` with photo slot detection, green-screen chroma key removal, Pixabay asset search, and in-browser WebAssembly background removal (`@imgly/background-removal`).
- **Admin Dashboard, History, & Multi-Account RBAC (`/admin`):** Tracks total sessions, 7-day revenue (`status = 'PAID'`), active templates, filtered transaction history (`status`, `from`, `to`), carousel curation, kiosk device records, branding settings, and sub-account management (`root` and operator accounts).

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Canvas and Media:** Konva 10, `react-konva`, HTML5 Canvas 2D, `react-webcam`, `qrcode`, Lucide React
- **AI Background Removal:** `@imgly/background-removal` (WebAssembly in-browser runtime)
- **Database and Storage:** SQLite / LibSQL (`@libsql/client`), local upload storage (`.local-uploads/`) with optional Cloudinary upload support
- **Payments and Integrations (Optional):** Midtrans Snap, DOKU SNAP QRIS, Pixabay API
- **Security:** Web Crypto API (`PBKDF2` password hashing and session token verification)

## Screenshots

| Desktop | Mobile |
| :---: | :---: |
| ![Kiosk Home Desktop](screenshots/Kiosk%20Home%20Desktop.png) | ![Kiosk Home Mobile](screenshots/Kiosk%20Home%20Mobile.png) |
| ![Template Catalog Desktop](screenshots/Template%20Catalog%20Desktop.png) | ![Template Catalog Mobile](screenshots/Template%20Catalog%20Mobile.png) |
| ![Camera Viewfinder Desktop](screenshots/Camera%20Viewfinder%20Desktop.png) | ![Camera Viewfinder Mobile](screenshots/Camera%20Viewfinder%20Mobile.png) |
| ![Canvas Editor Desktop](screenshots/Canvas%20Editor%20Desktop.png) | ![Canvas Editor Mobile](screenshots/Canvas%20Editor%20Mobile.png) |
| ![Payment QRIS Desktop](screenshots/Payment%20QRIS%20Desktop.png) | ![Payment QRIS Mobile](screenshots/Payment%20QRIS%20Mobile.png) |
| ![Result & QR Desktop](screenshots/Result%20%26%20QR%20Desktop.png) | ![Result & QR Mobile](screenshots/Result%20%26%20QR%20Mobile.png) |
| ![Newspaper Theme Desktop](screenshots/Newspaper%20Theme%20Desktop.png) | ![Newspaper Theme Mobile](screenshots/Newspaper%20Theme%20Mobile.png) |
| ![Newspaper Template Catalog Desktop](screenshots/Newspaper%20Template%20Catalog%20Desktop.png) | ![Newspaper Template Catalog Mobile](screenshots/Newspaper%20Template%20Catalog%20Mobile.png) |
| ![Admin Login Desktop](screenshots/Admin%20Login%20Desktop.png) | ![Admin Login Mobile](screenshots/Admin%20Login%20Mobile.png) |
| ![Admin Dashboard Desktop](screenshots/Admin%20Dashboard%20Desktop.png) | ![Admin Dashboard Mobile](screenshots/Admin%20Dashboard%20Mobile.png) |
| ![Admin Studio Desktop](screenshots/Admin%20Studio%20Desktop.png) | ![Admin Studio Mobile](screenshots/Admin%20Studio%20Mobile.png) |
| ![Admin Templates Desktop](screenshots/Admin%20Templates%20Desktop.png) | ![Admin Templates Mobile](screenshots/Admin%20Templates%20Mobile.png) |
| ![Admin History Desktop](screenshots/Admin%20History%20Desktop.png) | ![Admin History Mobile](screenshots/Admin%20History%20Mobile.png) |
| ![Admin Devices Desktop](screenshots/Admin%20Devices%20Desktop.png) | ![Admin Devices Mobile](screenshots/Admin%20Devices%20Mobile.png) |
| ![Admin Settings Desktop](screenshots/Admin%20Settings%20Desktop.png) | ![Admin Settings Mobile](screenshots/Admin%20Settings%20Mobile.png) |

## Local Setup

### Prerequisites

- Node.js 18+ (tested with Node.js 26)
- npm

### Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables (optional)**

   By default, the app uses `local.db` and `.local-uploads/`. To enable remote LibSQL/Turso, Cloudinary, Midtrans, DOKU QRIS, or Pixabay search, copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

3. **Initialize and seed the local SQLite database**

   ```bash
   npm run db:setup
   ```

   To wipe and recreate `local.db` from `schema.sql` and `scripts/seed.sql`:

   ```bash
   npm run db:reset
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   - **Customer Kiosk:** `http://localhost:3000` (redirects automatically to `/v1` or `/v2`)
   - **Admin Portal:** `http://localhost:3000/admin/login`

### Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| Root Admin | `root` | `root` |

## Author

**Widi Firmansyah** · [widifirmaan.web.id](https://widifirmaan.web.id)
