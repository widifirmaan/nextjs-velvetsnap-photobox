# VelvetSnap

> Platform photobox mandiri dan generator cetak photo strip dengan tema ganda, editor canvas Konva, dan portal manajemen admin.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Konva](https://img.shields.io/badge/Canvas-Konva_10.3-0D9488?style=flat-square)](https://konvajs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/Demo-photo.widifirmaan.web.id-10B981?style=flat-square)](https://photo.widifirmaan.web.id)

---

## Live URL

- **Production URL**: [https://photo.widifirmaan.web.id](https://photo.widifirmaan.web.id)

---

## Screenshot

| Desktop | Mobile |
| :---: | :---: |
| **Kiosk Home (Tema Modern v1)**<br>![Kiosk Home](screenshots/Kiosk%20Home%20Desktop.png) | **Kiosk Home (Tema Modern v1)**<br>![Kiosk Home](screenshots/Kiosk%20Home%20Mobile.png) |
| **Katalog Template Frame Foto**<br>![Template Catalog](screenshots/Template%20Catalog%20Desktop.png) | **Katalog Template Frame Foto**<br>![Template Catalog](screenshots/Template%20Catalog%20Mobile.png) |
| **Jendela Kamera & Hitung Mundur**<br>![Camera Viewfinder](screenshots/Camera%20Viewfinder%20Desktop.png) | **Jendela Kamera & Hitung Mundur**<br>![Camera Viewfinder](screenshots/Camera%20Viewfinder%20Mobile.png) |
| **Editor Canvas Komposisi Strip (Konva)**<br>![Canvas Editor](screenshots/Canvas%20Editor%20Desktop.png) | **Editor Canvas Komposisi Strip (Konva)**<br>![Canvas Editor](screenshots/Canvas%20Editor%20Mobile.png) |
| **Simulasi Gerbang Pembayaran QRIS**<br>![Payment QRIS](screenshots/Payment%20QRIS%20Desktop.png) | **Simulasi Gerbang Pembayaran QRIS**<br>![Payment QRIS](screenshots/Payment%20QRIS%20Mobile.png) |
| **Tiket QR Download Mobile & Hasil Cetak**<br>![Result & QR](screenshots/Result%20&%20QR%20Desktop.png) | **Tiket QR Download Mobile & Hasil Cetak**<br>![Result & QR](screenshots/Result%20&%20QR%20Mobile.png) |
| **Kiosk Tema Koran Vintage (v2)**<br>![Newspaper Theme](screenshots/Newspaper%20Theme%20Desktop.png) | **Kiosk Tema Koran Vintage (v2)**<br>![Newspaper Theme](screenshots/Newspaper%20Theme%20Mobile.png) |
| **Autentikasi Login Admin Portal**<br>![Admin Login](screenshots/Admin%20Login%20Desktop.png) | **Autentikasi Login Admin Portal**<br>![Admin Login](screenshots/Admin%20Login%20Mobile.png) |
| **Dashboard Operasional & Metrik Omset**<br>![Admin Dashboard](screenshots/Admin%20Dashboard%20Desktop.png) | **Dashboard Operasional & Metrik Omset**<br>![Admin Dashboard](screenshots/Admin%20Dashboard%20Mobile.png) |
| **Studio Desain Layout Template Strip**<br>![Admin Studio](screenshots/Admin%20Studio%20Desktop.png) | **Studio Desain Layout Template Strip**<br>![Admin Studio](screenshots/Admin%20Studio%20Mobile.png) |
| **Katalog Manajemen Template Frame**<br>![Admin Templates](screenshots/Admin%20Templates%20Desktop.png) | **Katalog Manajemen Template Frame**<br>![Admin Templates](screenshots/Admin%20Templates%20Mobile.png) |
| **Buku Riwayat Sesi Pemotretan**<br>![Admin History](screenshots/Admin%20History%20Desktop.png) | **Buku Riwayat Sesi Pemotretan**<br>![Admin History](screenshots/Admin%20History%20Mobile.png) |
| **Diagnostik Perangkat Keras Kamera Kiosk**<br>![Admin Devices](screenshots/Admin%20Devices%20Desktop.png) | **Diagnostik Perangkat Keras Kamera Kiosk**<br>![Admin Devices](screenshots/Admin%20Devices%20Mobile.png) |
| **Konfigurasi Pengaturan & Branding Kiosk**<br>![Admin Settings](screenshots/Admin%20Settings%20Desktop.png) | **Konfigurasi Pengaturan & Branding Kiosk**<br>![Admin Settings](screenshots/Admin%20Settings%20Mobile.png) |

---

## Fitur

- **Dua Tema Kiosk Lengkap**: Tampilan modern minimalis (`/v1`) dan estetika koran editorial klasik (`/v2`) dengan tekstur kertas, masthead koran, dan tata letak responsif.
- **Alur Pelanggan Terpandu**: Alur tahapan otomatis mulai dari Pemilihan Template, Pembayaran Simulasi QRIS, Hitung Mundur Pengambilan Foto Kamera, Penyesuaian Canvas & Stiker, hingga Tiket QR Hasil Cetak.
- **Integrasi Kamera Langsung (`react-webcam`)**: Penghubung aliran video webcam perangkat dengan timer hitung mundur (3 dan 5 detik), sequence burst foto otomatis, efek flash visual, dan slot indikator tangkapan.
- **Perekaman Klip Singkat Otomatis (`useClipRecorder`)**: Perekam video latar belakang otomatis di browser saat pemotretan berlangsung untuk menghasilkan klip kenangan *behind-the-scenes*.
- **Kompositor Canvas 2D Beresolusi Tinggi (`react-konva`)**: Engine canvas Konva untuk pemosisian foto dalam frame, masking aspek rasio, penambahan stiker dekorasi, dan render komposit akhir.
- **Penghapusan Background Mandiri (WASM)**: Penghapus background foto berbasis machine learning `@imgly/background-removal` yang berjalan langsung via WebAssembly di browser tanpa server pihak ketiga.
- **Studio Template Interaktif (`/admin/template-studio`)**: Desainer visual layout strip untuk admin kios dengan fitur drag-and-drop layer, pengaturan slot foto, dan koordinat geometri.
- **Pemantau Kesehatan Perangkat Keras (`/admin/devices`)**: Panel diagnostik status koneksi webcam, profil resolusi kamera, dan status online kiosk.
- **Dashboard Analisis Admin (`/admin`)**: Pelacak total sesi pemotretan, grafik omset transaksi harian/mingguan, buku besar pembayaran, dan pengaturan harga.
- **Pengiriman Unduhan Mobile via Tiket QR**: Pembuatan kode QR instan pada layar hasil akhir sehingga pengguna dapat langsung memindai dari ponsel untuk mengunduh foto strip resolusi penuh.

---

## Tech Stack

| Kategori | Teknologi | Deskripsi / Peran |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js `16.2.6` (App Router), React `19.2.4` | Arsitektur modern dengan rendering server dan UI cepat |
| **Canvas & Komposisi** | Konva `10.3.0`, React-Konva `19.2.4` | Engine rendering canvas 2D untuk tata letak photo strip dan layer stiker |
| **Kamera & Video** | React-Webcam `7.2.0` | Abstraksi MediaDevices API untuk streaming webcam dan jepretan kamera |
| **AI / Machine Learning** | `@imgly/background-removal` `1.7.0` | Runtime WebAssembly penghapus background gambar langsung di browser |
| **Basis Data** | SQLite 3 | Database relasional lokal untuk template, perangkat, akun admin, dan transaksi |
| **API Server** | Local Router (`worker.js`) | Router endpoint lokal untuk melayani persistensi data `/api/*` |
| **Utilitas & QR** | QRCode `1.5.4`, UUID `9.0.0`, Lucide React | Generator kode QR tiket unduhan dan ikon antarmuka |

---

## Database Architecture

VelvetSnap menyimpan pengaturan sistem, akun operator, katalog template strip, dan log transaksi dalam database SQLite relasional (`schema.sql`):

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

---

## Panduan Setup & Menjalankan Lokal

### 1. Prasyarat Sistem

- **Node.js**: Versi `20.x` atau `22.x`
- **npm** atau **pnpm**
- **SQLite 3**: Native CLI (`sqlite3`)

### 2. Environment Variables

Buat file `.env.local` pada direktori root:

```env
ADMIN_ROOT_PASSWORD=root
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Instalasi Dependensi

```bash
# Clone repository
git clone https://github.com/widifirmaan/nextjs-velvetsnap-photobox.git
cd nextjs-velvetsnap-photobox

# Install dependensi
npm install
```

### 4. Setup Database & Seeder Lokal

Inisialisasi tabel SQLite lokal dan akun administrator default:

```bash
# Inisialisasi skema tabel lokal
sqlite3 local.db < schema.sql
```

#### Kredensial Administrator Bawaan:
- **Username**: `root`
- **Password**: `root`
- **Akses**: Masuk melalui `/admin/login` untuk mengakses dashboard, template studio, dan riwayat transaksi.

### 5. Menjalankan Server Lokal

```bash
# Jalankan mode development
npm run dev
```

Buka [http://localhost:3000/v1](http://localhost:3000/v1) di browser Anda untuk alur pemotretan pelanggan, atau [http://localhost:3000/admin](http://localhost:3000/admin) untuk panel kontrol admin.

### 6. Panduan Uji Manual (Testing Checklist)

| No | Fitur | Langkah Pengujian | Hasil yang Diharapkan |
| :---: | :--- | :--- | :--- |
| 1 | **Kiosk Beranda** | Buka `/v1`, klik tombol *Mulai Sesi* | Masuk ke katalog pemilihan frame template |
| 2 | **Pilih Template** | Pilih salah satu template frame | Masuk ke halaman simulasi pembayaran QRIS |
| 3 | **Kamera Photobox** | Izinkan akses kamera browser pada jendela `/v1/booth` | Aliran video webcam muncul dengan timer hitung mundur |
| 4 | **Canvas Editor** | Selesaikan pemotretan dan masuk ke editor `/v1/editor` | Hasil foto tertata otomatis pada slot frame strip Konva |
| 5 | **Tiket Unduhan QR** | Masuk ke halaman `/v1/result` | Kode QR tiket unduhan tampil dan tombol simpan photo strip aktif |
| 6 | **Portal Admin** | Buka `/admin/login`, masukkan password `root` | Berhasil login dan masuk ke Dashboard KPI Omset (`/admin`) |

---

## Author

Developed by **[Widi Firmansyah](https://widifirmaan.web.id)**.
