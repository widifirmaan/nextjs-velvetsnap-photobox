# 📸 VelvetSnap Co. — Enterprise Photobooth Platform & Strips Studio

**VelvetSnap Co.** is a next-generation, enterprise-grade digital photobooth web application and automated photo strip compositing engine. Built with **Next.js 16 (App Router)** and **React 19**, deployed as a high-performance **Cloudflare Workers** edge application with **Cloudflare D1** (Serverless SQLite) and **Cloudinary CDN**, VelvetSnap delivers an end-to-end photobooth kiosk experience — from hardware camera control and real-time canvas compositing to QRIS digital payments, instant print receipts, and an operational administration suite.

[![Live Demo](https://img.shields.io/badge/Demo-photo.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://photo.widifirmaan.web.id)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers_&_D1-F38020?style=flat-square&logo=cloudflare)](https://photo.widifirmaan.web.id)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN_Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)

---

## 🌐 Live Production

- **URL:** [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)
- **Architecture:** Cloudflare Workers Full-Stack Edge Deployment (Edge Runtime + Hybrid Static Asset Delivery)
- **Serverless Database:** Cloudflare D1 Serverless SQL (`settings`, `accounts`, `templates`, `transactions`, `devices`)
- **Media CDN & Optimization:** Cloudinary CDN with automatic WebP/AVIF format transcoding and on-the-fly resizing
- **DSLR Integration:** DigicamControl & gPhoto2 USB tethering API bridge

---

## 📸 Application Showcase

| Desktop (MacBook Pro) | Mobile (iPhone 16 Pro) |
| :---: | :---: |
| **VelvetSnap Photobooth Desktop**<br>![VelvetSnap Desktop](screenshots/VelvetSnap%20Desktop.png) | **VelvetSnap Photobooth Mobile**<br>![VelvetSnap Mobile](screenshots/VelvetSnap%20Mobile.png) |

### 1. Public Photobooth V1 Experience (Claymorphism UI)

| Landing & Template Discovery | Capture & Compositing |
| :---: | :---: |
| ![V1 Landing Page](screenshots/V1%20Landing%20Page.png)<br>**Interactive Photobooth Landing Page** | ![V1 Template Selection](screenshots/V1%20Template%20Selection.png)<br>**Template & Frame Selection Grid** |
| ![V1 Photobooth Capture](screenshots/V1%20Photobooth%20Capture.png)<br>**Live Camera Capture & Countdown** | ![V1 Photo Editor](screenshots/V1%20Photo%20Editor.png)<br>**HTML5 Canvas Photo Compositor & Adjustments** |
| ![V1 Payment Gate](screenshots/V1%20Payment%20Gate.png)<br>**QRIS Payment Gateway Simulation** | ![V1 Result Download](screenshots/V1%20Result%20Download.png)<br>**Result View & Print Ready Strip** |
| ![V1 Download Portal](screenshots/V1%20Download%20Portal.png)<br>**Customer Strip Retrieval Portal** | ![Mobile V1 Landing Page](screenshots/Mobile%20V1%20Landing%20Page.png)<br>**Mobile View: V1 Landing Experience** |

---

### 2. Public Photobooth V2 Experience (Editorial Newspaper & Vintage Brutalist)

| Masthead & Template Discovery | Capture & Processing |
| :---: | :---: |
| ![V2 Landing Page](screenshots/V2%20Landing%20Page.png)<br>**Editorial Masthead Landing Page** | ![V2 Template Selection](screenshots/V2%20Template%20Selection.png)<br>**Modern Frame Catalog Grid** |
| ![V2 Photobooth Capture](screenshots/V2%20Photobooth%20Capture.png)<br>**Minimalist Vintage Capture Booth** | ![V2 Photo Editor](screenshots/V2%20Photo%20Editor.png)<br>**High-Contrast Canvas Adjuster & Filters** |
| ![V2 Payment Gate](screenshots/V2%20Payment%20Gate.png)<br>**Editorial QRIS Checkout Portal** | ![V2 Result Download](screenshots/V2%20Result%20Download.png)<br>**Print Strip Download & QR Ticket** |
| ![V2 Download Portal](screenshots/V2%20Download%20Portal.png)<br>**Customer Download Portal (V2)** | ![Mobile V2 Landing Page](screenshots/Mobile%20V2%20Landing%20Page.png)<br>**Mobile View: Editorial Masthead** |

---

### 3. Admin & Operational Suite ("Sampai Dalam-Dalam Adminnya")

| Dashboard & Financial Analytics | Templates & Interactive Studio |
| :---: | :---: |
| ![Admin Dashboard](screenshots/Admin%20Dashboard.png)<br>**Operations Dashboard & Revenue Analytics** | ![Admin Transaction History](screenshots/Admin%20Transaction%20History.png)<br>**Transaction Ledger & Receipt Tracking** |
| ![Admin Templates Management](screenshots/Admin%20Templates%20Management.png)<br>**Template Catalog & Active Status CRUD** | ![Admin Template Studio](screenshots/Admin%20Template%20Studio.png)<br>**Interactive Strips Studio (Hole & Chroma Detector)** |
| ![Admin Device Management](screenshots/Admin%20Device%20Management.png)<br>**Hardware & DSLR/Webcam Diagnostics** | ![Admin System Settings](screenshots/Admin%20System%20Settings.png)<br>**System Settings & Dual-Theme Controls** |
| ![Admin Account Management](screenshots/Admin%20Account%20Management.png)<br>**Staff & Multi-Tenant Account Management** | ![Admin Reprocess Utility](screenshots/Admin%20Reprocess%20Utility.png)<br>**Batch Template Reprocessor Pipeline** |
| ![Admin Login Page](screenshots/Admin%20Login%20Page.png)<br>**Secure Staff Gatekeeper Login** | ![Mobile Admin Dashboard](screenshots/Mobile%20Admin%20Dashboard.png)<br>**Mobile View: Responsive Admin Dashboard** |

---

### 4. Mobile Responsive Showcase

| Mobile Client Flow | Mobile Admin Flow |
| :---: | :---: |
| ![Mobile V1 Template Selection](screenshots/Mobile%20V1%20Template%20Selection.png)<br>**Mobile: V1 Template Selection** | ![Mobile Admin Templates](screenshots/Mobile%20Admin%20Templates.png)<br>**Mobile Admin: Template Catalog** |
| ![Mobile V1 Photo Editor](screenshots/Mobile%20V1%20Photo%20Editor.png)<br>**Mobile: V1 Touch Canvas Editor** | ![Mobile Admin History](screenshots/Mobile%20Admin%20History.png)<br>**Mobile Admin: Transaction History** |
| ![Mobile V1 Payment Gate](screenshots/Mobile%20V1%20Payment%20Gate.png)<br>**Mobile: V1 QRIS Payment** | ![Mobile Admin Settings](screenshots/Mobile%20Admin%20Settings.png)<br>**Mobile Admin: System Configuration** |
| ![Mobile V2 Template Selection](screenshots/Mobile%20V2%20Template%20Selection.png)<br>**Mobile: V2 Template Selection** | ![Mobile V2 Photo Editor](screenshots/Mobile%20V2%20Photo%20Editor.png)<br>**Mobile: V2 Canvas Editor** |

---

## 🚀 Key Features

### 🎨 Dual Dynamic Themes
- **V1 Soft Claymorphism UI**: High-contrast, tactile neomorphic interface with fluid hover animations, dynamic hero showcase carousel, and intuitive stepper progression.
- **V2 Editorial Newspaper & Brutalism**: Bold typographic masthead layout, retro halftone accents, monochrome contrast, and editorial framing designed for high-concept photobooth activations.
- **Zero-Downtime Theme Switching**: Instant real-time theme swapping via Admin panel without requiring redeployment.

### 📸 Capture & Camera Engine
- **Multi-Device Input**: Automatic detection and live switching between Webcams (USB/Built-in) and professional DSLRs (via `gphoto2` on Linux/macOS or `DigiCamControl` on Windows).
- **Interactive Countdown & Guidance**: Visual countdown timer, live viewfinder overlay, and audio cues to guide guests before every shot.
- **Dynamic Slot Assignment**: Automatically sequences captured frames into template slots with retake individual shot capabilities.

### 🖼️ Advanced Canvas Compositor & Strips Studio
- **Client-Side Canvas Pipeline**: Powered by Konva and HTML5 Canvas API for zero-latency frame compositing.
- **Touch & Mouse Slot Manipulation**: Drag-to-pan, pinch-to-zoom, rotate, and scale photos within their respective frame boundaries.
- **Chroma-Key & Hole Detection**: Intelligent green-screen removal and automatic transparency detection for imported PNG/JPEG frames.
- **Visual Filters & Tonality**: One-click vintage filters including Warm Retro, Grayscale Noir, Vibrant Boost, and Neutral Sepia.

### 💳 QRIS Digital Payment Simulation
- **Session-Bound Transactions**: Real-time order ID generation (`#ORD-XXXX`) tied to selected templates and capture assets.
- **Dynamic QR Code**: Generates standard QRIS-compliant payment payloads on screen with simulated webhook settlement verification.

### 🛠️ Comprehensive Admin & Operational Suite
- **Revenue Analytics & Reporting**: Real-time sales telemetry, all-time and daily revenue breakdown, transaction volume counters, and interactive 7-day revenue charts.
- **Template Manager**: Full CRUD operations for photobooth frame assets, pricing customization, and active/inactive status toggling.
- **Strips Studio**: In-browser visual frame designer — upload master graphics, configure photo coordinates, define bounding boxes, and adjust layer hierarchy.
- **Hardware & Device Configuration**: Diagnostic monitor for camera status, shutter responsiveness, printer spooler, and thermal print profiles.
- **Multi-Tenant Staff Accounts**: Role-based access control (Root Admin vs. Booth Operator) with secure salt-hashed password authentication.
- **Batch Asset Reprocessor**: One-click regeneration of template thumbnails and high-res printable composite strips.

---

## 🏗️ Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VelvetSnap Photobooth Architecture              │
└────────────────────────────────────────────────────────────────────────┘

    Client Layer (Next.js 16 + React 19)
    ├── V1 Claymorphism Theme Router  (/v1)
    ├── V2 Editorial Brutalist Router (/v2)
    ├── HTML5 Canvas & Konva Compositor
    └── Admin Operations Portal       (/admin)
                       │
                       │ HTTPS / JSON REST API
                       ▼
    Edge Worker Layer (Cloudflare Workers Runtime)
    ├── Authentication Guard & Session Validator (Bearer / Cookie)
    ├── Template & Layout Serving Engine
    ├── Transaction Ledger & QRIS Payment Gateway
    └── Hardware Control Proxy (/api/camera/capture)
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
    Data Layer                 Media Delivery Layer
    Cloudflare D1 (Serverless) Cloudinary CDN & R2 Storage
    ├── settings               ├── Master Frame Graphic Overlays
    ├── accounts               ├── Guest High-Res Photo Strips
    ├── templates              └── Thumbnail Previews
    └── transactions
```

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Next.js 16.2.6 | Webpack App Router architecture with server & client components |
| **Language** | TypeScript 5 | Strict typing across API contracts, flow states, and models |
| **UI Library** | React 19.2.4 | Modern concurrent React features, hooks, and transitions |
| **Compositing Engine** | HTML5 Canvas + Konva | Browser-side high-DPI photo compositing & transformation |
| **Webcam & Camera** | react-webcam + gPhoto2 | Seamless camera streaming with hardware DSLR tethering |
| **Icons & Styling** | Lucide React + CSS Modules | Custom Claymorphism & Editorial Neo-Brutalist design systems |
| **Edge Server** | Cloudflare Workers | Ultra-low latency edge serverless execution |
| **Database** | Cloudflare D1 (SQL) | Serverless relational SQLite database at the edge |
| **Media CDN** | Cloudinary | Global asset distribution, automated WebP/AVIF format optimization |
| **QR Code Engine** | node-qrcode | Dynamic client & receipt QR generation |

---

## 🔌 REST API Reference

### System & Settings
- `GET /api/settings` — Public system configuration (branding, active theme, countdown timer).
- `PUT /api/settings` — Update global settings, active theme (`v1` / `v2`), and kiosk options *(Admin only)*.

### Templates & Strips Studio
- `GET /api/templates` — List all active photobooth templates with slots and dimensions.
- `GET /api/templates/thumbnails` — Lightweight thumbnail catalog for kiosk landing carousels.
- `GET /api/templates/list` — Comprehensive template catalog with status & pricing *(Admin only)*.
- `POST /api/templates` — Register new photobooth frame and element configuration *(Admin only)*.
- `PUT /api/templates/:id` — Update template metadata, price, or layout dimensions *(Admin only)*.
- `DELETE /api/templates/:id` — Soft-delete or remove template *(Admin only)*.

### Transactions & Ordering
- `GET /api/transactions` — Paginated transaction ledger with customer sessions *(Admin only)*.
- `GET /api/transactions/count` — Total session count and throughput metrics *(Admin only)*.
- `POST /api/transactions` — Create new photobooth transaction record with captures and final strip.
- `GET /api/transactions/:id` — Retrieve transaction details and downloadable photo assets.

### Hardware & Devices
- `GET /api/devices` — Enumerate connected cameras, printers, and peripheral devices.
- `POST /api/devices` — Update device profiles or configure active capture source.
- `POST /api/camera/capture` — Trigger DSLR capture via local hardware bridge.

### Finance & Analytics
- `GET /api/finance` — Retrieve real-time financial metrics, daily totals, 7-day revenue array, and breakdown by template *(Admin only)*.

### Staff & Security
- `POST /api/admin/login` — Authenticate admin account, returns session token and HttpOnly cookie.
- `GET /api/admin/session` — Validate active admin session and user permissions.
- `DELETE /api/admin/login` — Invalidate session and logout.
- `GET /api/accounts` — List all operator and admin accounts *(Root only)*.
- `POST /api/accounts` — Create new staff account *(Root only)*.

---

## 📂 Project Structure

```bash
/
├── public/                     # Static media & manifest assets
├── screenshots/                # Comprehensive desktop & mobile screenshot catalog
├── scripts/
│   ├── capture_all_screenshots.js # Automated Puppeteer screenshot suite
│   └── sample_templates.json   # Template fixture definitions
├── src/
│   ├── app/
│   │   ├── (themes)/
│   │   │   ├── v1/             # Soft Claymorphism UI theme & photobooth flow
│   │   │   │   ├── booth/      # Camera capture stage
│   │   │   │   ├── download/   # Strip download page
│   │   │   │   ├── editor/     # Canvas photo adjustments
│   │   │   │   ├── homepage/   # Hero showcase & strips carousel
│   │   │   │   ├── payment/    # QRIS payment modal & checkout
│   │   │   │   ├── result/     # Strip preview & printing
│   │   │   │   └── template/   # Frame selection grid
│   │   │   └── v2/             # Editorial Brutalist UI theme & flow
│   │   │       ├── booth/
│   │   │       ├── download/
│   │   │       ├── editor/
│   │   │       ├── homepage/   # Editorial newspaper masthead
│   │   │       ├── payment/
│   │   │       ├── result/
│   │   │       └── template/
│   │   ├── admin/              # Complete Admin Portal
│   │   │   ├── accounts/       # Staff & user account management
│   │   │   ├── components/     # Reusable admin UI elements
│   │   │   ├── devices/        # Hardware diagnostics & camera selector
│   │   │   ├── history/        # Transaction ledger & session receipts
│   │   │   ├── login/          # Staff gatekeeper login screen
│   │   │   ├── reprocess-templates/ # Batch asset reprocessor
│   │   │   ├── settings/       # Branding, theme switcher, & QRIS
│   │   │   ├── template-studio/# Interactive Canvas Strips Studio
│   │   │   ├── templates/      # Template catalog & CRUD
│   │   │   └── page.tsx        # Dashboard with revenue chart
│   │   ├── download/           # Direct customer strip lookup
│   │   ├── globals.css         # Claymorphic CSS system & design tokens
│   │   ├── layout.tsx          # Root application layout
│   │   └── page.tsx            # Dynamic theme resolver
│   ├── components/             # Shared UI & photobooth components
│   ├── lib/                    # Utilities, API client, & custom hooks
│   └── models/                 # Database schema contracts
├── schema.sql                  # Cloudflare D1 SQL schema definition
├── worker.js                   # Cloudflare Workers serverless backend API
├── wrangler.jsonc              # Cloudflare configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json
└── package.json
```

---

## 🧪 Automated Screenshot Suite

The repository includes a headless Chromium automation script that captures all desktop and mobile views directly against the live production deployment:

```bash
node scripts/capture_all_screenshots.js
```

Features built-in render delays (`5000ms+`) to ensure web components, preloader transitions, Cloudinary image assets, and live analytics charts are 100% rendered before capturing.

---

## 📦 Getting Started & Local Development

### Prerequisites
- **Node.js 20+** or **Node.js 22+**
- **npm**, **pnpm**, or **yarn**
- **Wrangler CLI** (for Cloudflare Workers local emulation)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# 2. Install dependencies
npm install

# 3. Start local Next.js development server
npm run dev
```
*Access local web server via `http://localhost:3000`*

### Cloudflare Edge Deployment
```bash
# Build the production Next.js static and edge bundle
npm run build

# Deploy to Cloudflare Pages & Workers
npm run deploy
```

---

## 👥 Authors & License

Developed with ❤️ by **Widi Firmansyah**.  
Open-source under the MIT License.
