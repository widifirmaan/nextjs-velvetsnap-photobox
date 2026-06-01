# 📸 VelvetSnap Co. — Aesthetic Photobooth Web App

**VelvetSnap Co.** is a full-stack photobooth web application built with **Next.js 16** and **MongoDB**. It features a complete photobooth workflow — from webcam/DSLR capture and template-based frame compositing to digital payment and print-ready result download.

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=nextdotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)

---

Explore the comprehensive features of **VelvetSnap Co.** through our gallery.

| | |
|:---:|:---:|
| ![Templates](screenshots/templates.png)<br>**Template Selection** | ![Booth](screenshots/booth.png)<br>**Photobooth Capture** |
| ![Editor](screenshots/editor.png)<br>**Photo Editor & Compositing** | ![Payment](screenshots/payment.png)<br>**Digital Payment** |
| ![Admin](screenshots/admin.png)<br>**Admin Dashboard** | ![Admin Template](screenshots/admin-template.png)<br>**Template Canvas Editor** |

---

## 🏗️ Technical Architecture

### Frontend: Next.js 16 + React 19
- **App Router**: Server/client component architecture with dynamic routing for templates, booth, payment, and admin panels.
- **Real-time Capture**: Webcam integration via `react-webcam` with live preview strip and countdown timer.
- **Canvas Compositing**: Browser-side HTML5 Canvas API for chroma-key (green screen) removal, frame overlay compositing, and photo slot positioning with drag-to-reposition and scale controls.
- **Claymorphism UI**: Neumorphic/claymorphic design system with CSS custom properties, glass-panel components, and smooth micro-interactions.

### Backend: Next.js API Routes
- **MongoDB with Mongoose 9**: NoSQL data layer for templates (frame images, slot layouts), transactions (captures, final images), and device settings.
- **Image Processing**: Server-side thumbnail generation using Jimp for template frame images and transaction photo strips, drastically reducing payload size.
- **DSLR Support**: Server-side camera control via `gphoto2` (Linux/macOS) or DigiCamControl (Windows) USB capture API.

### Key Functional Systems
- **Template Manager**: Full CRUD admin interface with interactive canvas — draw, resize, and auto-detect transparent/chroma-key photo slots on uploaded frame images.
- **Capture Flow**: Webcam or DSLR capture with real-time frame overlay, green screen removal, per-slot drag/scale editing, and filter presets (grayscale, sepia).
- **Compositing Engine**: Client-side canvas pipeline that composites captured photos into template slots with user adjustments, then outputs a printable JPEG.
- **Payment Gateway**: QRIS digital payment simulation with session-based transaction tracking.
- **Admin Panel**: Dashboard with revenue charts, transaction history with detail modal, template management, device configuration (camera, capture quality, print settings), and financial breakdown by template.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.6 (Webpack) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19.2.4 |
| **Database** | MongoDB + Mongoose 9 |
| **Icons** | Lucide React |
| **Image Processing** | Jimp (server-side), Canvas API (client-side) |
| **Webcam** | react-webcam |
| **Camera Control** | gphoto2 / DigiCamControl |
| **Styling** | CSS Modules + Claymorphism Design System |

---

## 📂 Project Structure

```bash
/
├── src/
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   │   ├── camera/       # Webcam/DSLR capture endpoints
│   │   │   ├── devices/      # Device configuration
│   │   │   ├── finance/      # Revenue aggregation
│   │   │   ├── templates/    # Template CRUD + thumbnail generation
│   │   │   └── transactions/ # Transaction CRUD + strip thumbnails
│   │   ├── admin/            # Admin dashboard, templates, history, finance, devices
│   │   ├── booth/            # Photobooth capture & editor
│   │   ├── payment/          # Payment page
│   │   ├── result/           # Result & print page
│   │   ├── templates/        # Public template selector
│   │   ├── globals.css       # Global styles & CSS custom properties
│   │   └── layout.tsx        # Root layout
│   ├── lib/                  # Database connection
│   └── models/               # Mongoose models (Template, Transaction, Device)
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
├── package.json
└── README.md
```

---

## 📦 Getting Started

### Prerequisites
- **Node.js 20+**
- **MongoDB** (running on port `27017`)
- **npm** or **yarn**

### Setup & Run
```bash
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# Install dependencies
npm install

# Start development server (Webpack)
npm run dev
```
*Access via `http://localhost:3000`*

### Build for Production
```bash
npm run build
npm start
```

---

## 👥 Authors
Developed with ❤️ by **Widi Firmansyah**.

---

**Capturing moments, one frame at a time** 🚀
