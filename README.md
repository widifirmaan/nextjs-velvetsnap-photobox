# VelvetSnap

> Editorial photobooth kiosk platform and automated photo strip compositing engine.

VelvetSnap is a photobooth web application and photo strip generator built with Next.js 16 (App Router), React 19, and Konva canvas. Deployed on Cloudflare Pages with a custom Edge Worker bridge (`worker.js`) and Cloudflare D1 database, it provides dual photobooth kiosk themes (`v1` modern and `v2` newspaper editorial), camera capture with live countdowns, photo adjustments, client-side background removal via WebAssembly, QR-based mobile strip downloads, and an admin management portal.

[![Live Demo](https://img.shields.io/badge/Demo-photo.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://photo.widifirmaan.web.id)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![WebAssembly AI](https://img.shields.io/badge/AI-Wasm_Background_Removal-654FF0?style=flat-square&logo=webassembly&logoColor=white)](https://img.ly/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Live Production

- **URL:** [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)
- **Deployment:** Cloudflare Pages with Edge Worker runtime (`worker.js`)
- **Storage & Database:** Cloudflare D1 Serverless SQL & Cloudinary CDN asset pipelines

---

## Showcase

| Desktop (MacBook Pro M4) | Mobile (iPhone 16 Pro) |
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
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React `1.17.0` | QR ticket generation, transaction session identification, and SVG iconography |
| **Edge Deployment** | Cloudflare Pages, Cloudflare D1, Worker | Global static edge delivery with serverless SQLite persistence |

---

## Project Structure

```bash
/
├── src/
│   ├── app/
│   │   ├── (themes)/
│   │   │   └── v2/                  # Vintage editorial photobooth kiosk flow
│   │   │       ├── editor/          # Canvas photo strip adjuster & filter controls
│   │   │       ├── download/        # Customer strip download portal
│   │   │       └── page.tsx         # Kiosk stepper root (Template -> Booth -> Editor -> Result)
│   │   ├── admin/
│   │   │   ├── template-studio/     # Visual strip template editor
│   │   │   ├── templates/           # Template catalog & status management
│   │   │   ├── history/             # Transaction history & ledger
│   │   │   ├── devices/             # Kiosk hardware diagnostics
│   │   │   ├── settings/            # System & theme configuration
│   │   │   ├── login/               # Admin authentication gate
│   │   │   └── page.tsx             # Admin KPI dashboard
│   │   ├── layout.tsx               # Root app layout
│   │   └── page.tsx                 # Public landing page
│   ├── components/                  # Reusable UI primitives, modals, viewfinders
│   └── lib/                         # Canvas math, image utilities, and custom hooks
├── public/                          # Frame overlays, stickers, and static assets
├── worker.js                        # Cloudflare Worker edge bridge
├── screenshots/                     # MacBook Pro M4 & iPhone 16 Pro showcase mockups
└── README.md
```

---

## Getting Started & Local Development

### Prerequisites

- **Node.js**: Version 18.18.0 or higher
- **npm** or **pnpm**

### Installation & Setup

> **Environment Variables:** No external API keys or cloud accounts are mandatory for local development. Core photobooth camera capture, canvas compositing, and template editing function 100% locally in the browser.

```bash
# 1. Clone the repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# 2. Install project dependencies
npm install

# 3. Start local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build & Deployment

```bash
# Build production bundle and copy Cloudflare worker bridge
npm run build

# Deploy static export to Cloudflare Pages via Wrangler CLI
npm run deploy
```

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
