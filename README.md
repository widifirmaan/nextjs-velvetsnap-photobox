# VelvetSnap

> Editorial photobooth kiosk platform and automated photo strip compositing engine.

VelvetSnap is a modern digital photobooth web application and automated photo strip compositor built with Next.js 16 (App Router), React 19, and HTML5 Canvas / Konva. Deployed on Cloudflare Pages with edge worker storage and Cloudinary media optimization, VelvetSnap provides an end-to-end photobooth kiosk workflow—from real-time webcam/DSLR capture and countdowns to interactive canvas adjustments, vintage film filters, QRIS payment simulations, strip downloads, and an administrative management portal.

[![Live Demo](https://img.shields.io/badge/Demo-photo.widifirmaan.web.id-10B981?style=flat-square&logo=cloudflare&logoColor=white)](https://photo.widifirmaan.web.id)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![WebAssembly AI](https://img.shields.io/badge/AI-Wasm_Background_Removal-654FF0?style=flat-square&logo=webassembly&logoColor=white)](https://img.ly/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

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

- **End-to-End Photobooth Kiosk Flow (`/v2`)**: Automated multi-step capture experience—template selection, simulated payment gate, live webcam viewfinder countdown, photo review, and print-ready strip generation.
- **HTML5 Canvas & Konva Compositor**: Real-time layer blending, image positioning, border styling, sticker overlays, and dynamic aspect-ratio slotting powered by `react-konva`.
- **Client-Side Background Removal**: Edge AI background subtraction executed locally in the browser via `@imgly/background-removal` WebAssembly runtime.
- **Editorial Newspaper UI Design**: High-contrast brutalist and vintage editorial aesthetic with typographic hierarchy, textured paper backgrounds, and smooth responsive transitions.
- **Interactive Template Studio (`/admin/template-studio`)**: In-browser visual layout creator for administrators to define photo strip slot coordinates, aspect ratios, overlays, and color palettes.
- **Admin Management Portal (`/admin`)**: Operations suite for kiosk device status monitoring, transaction ledger tracking, template activation toggles, and kiosk system settings.
- **QR Code Retrieval Portal**: Dynamic QR code generation powered by `qrcode` enabling customers to instantly scan and download their processed digital photo strips directly to their mobile devices.

---

## Tech Stack

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js `16.2.6`, React `19.2.4` | Modern App Router architecture, server components, and concurrent UI rendering |
| **Canvas & Compositing** | Konva `10.3.0`, React-Konva `19.2.4` | 2D canvas drawing engine for photo strip layout composition and layer manipulation |
| **Camera & Video** | React-Webcam `7.2.0` | Browser MediaDevices API abstraction for webcam and camera hardware tethering |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Client-side neural network running via WebAssembly to remove image backgrounds |
| **Utilities & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React `1.17.0` | QR ticket generation, transaction session identification, and SVG iconography |
| **Edge Deployment** | Cloudflare Pages, Cloudflare D1, Worker | Global static edge delivery with serverless SQLite persistence |

---

## Project Structure

```text
nextjs-velvetsnap-photobox/
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

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
   cd nextjs-velvetsnap-photobox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).
