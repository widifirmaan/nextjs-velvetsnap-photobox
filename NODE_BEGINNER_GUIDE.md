<!-- File: NODE_BEGINNER_GUIDE.md -->
<!-- Description: Auto-added top comment for easier file identification. -->

# Node + VelvetSnap Photobooth: Guide untuk Pemula

Dokumen ini dibuat khusus untuk orang yang baru pertama kali mengerjakan proyek Node.js dan Next.js. Jika kamu belum pernah menggunakan Node sebelumnya, panduan ini akan menjelaskan konsep dasar, struktur proyek, cara menjalankan aplikasi, dan cara melakukan perubahan.

---

## 1. Apa itu Node.js dan npm?

- **Node.js** adalah runtime JavaScript yang memungkinkan kamu menjalankan JavaScript di luar browser.
- **npm** adalah package manager yang digunakan untuk menginstal paket dan menjalankan perintah di dalam proyek.
- Di proyek ini, Node.js digunakan untuk menjalankan server Next.js dan menjalankan script build / lint.

> Catatan: Proyek ini menggunakan Node.js versi **20+**.

---

## 2. Struktur Dasar Proyek

```
nextjs-velvetsnap-photobox/
├── node_modules/            # Paket npm yang terinstal
├── public/                  # Gambar & aset statis
├── src/
│   ├── app/                 # Semua route App Router Next.js
│   │   ├── (themes)/        # dua varian tema app: v1 dan v2
│   │   │   ├── v1/
│   │   │   └── v2/
│   │   ├── admin/           # halaman admin
│   │   ├── api/             # API route Next.js
│   │   ├── download/        # route download hasil cetak
│   │   ├── globals.css      # styling global
│   │   └── layout.tsx       # layout root aplikasi
│   ├── components/          # komponen React reusable
│   ├── lib/                 # utilitas, hook, koneksi DB
│   ├── models/              # skema Mongoose
│   └── types/               # deklarasi tipe khusus
├── .env.local?              # konfigurasi lingkungan (tidak dibagikan)
├── next.config.ts           # konfigurasi Next.js
├── package.json             # daftar dependensi dan script
├── package-lock.json        # versi eksak paket
└── README.md                # dokumentasi utama
```

---

## 3. File dan Folder Penting

### `package.json`

File ini berisi:
- nama proyek
- versi
- dependensi (`dependencies` dan `devDependencies`)
- `scripts` yang bisa dijalankan dengan `npm run ...`

### `src/app/`

- `src/app/(themes)/v1/` — salah satu varian user-facing aplikasi
- `src/app/(themes)/v2/` — varian kedua aplikasi
- `src/app/admin/` — halaman admin dan template editor
- `src/app/api/` — API endpoint untuk membuat dan membaca data
- `src/app/download/[id]/page.tsx` — route dinamis untuk download strip

### `src/lib/`

Berisi utilitas umum:
- koneksi MongoDB
- helper API
- helper gambar
- hook custom React

### `src/models/`

Mongoose schema untuk data yang disimpan di MongoDB.

### `src/components/`

Komponen UI reusable yang dapat dipakai di banyak halaman.

---

## 4. Persiapan Awal (Pertama Kali)

### 4.1 Install Node.js

Jika belum punya Node.js:
- di Linux: pakai `nvm`, `asdf`, atau package manager distro
- di Windows: pakai installer dari nodejs.org

Contoh dengan `nvm`:
```bash
nvm install 20
nvm use 20
```

### 4.2 Install Paket Proyek

Jalankan dari folder proyek:
```bash
npm install
```

Perintah ini akan membuat folder `node_modules/` dan mengunduh semua paket yang dibutuhkan.

### 4.3 Konfigurasi MongoDB

Proyek ini membutuhkan MongoDB.

Buat file `.env.local` di root proyek dengan konten:
```text
MONGODB_URI=mongodb://localhost:27017/velvetsnap
```

Lalu jalankan MongoDB terlebih dahulu.

> Jika kamu belum pernah menggunakan MongoDB, silakan instal dan jalankan server MongoDB lokal sebelum menjalankan aplikasi.

---

## 5. Cara Menjalankan Proyek

### 5.1 Mode Pengembangan

```bash
npm run dev
```

Lalu buka browser di:

```
http://localhost:3000
```

### 5.2 Build untuk Produksi

```bash
npm run build
```

Perintah ini memeriksa kode dan membangun aplikasi Next.js.

Jika ingin menjalankan hasil build:
```bash
npm start
```

---

## 6. Script yang Sering Digunakan

### `npm run dev`
Menjalankan server pengembangan Next.js.

### `npm run build`
Menghasilkan build produksi.

### `npm start`
Menjalankan aplikasi hasil build.

### `npm run lint`
Memeriksa kode dengan ESLint.

> Jika perintah `npm run lint` gagal karena masalah lingkungan, kamu bisa menjalankan ESLint langsung dengan Node:
> ```bash
> node ./node_modules/.bin/eslint .
> ```

---

## 7. Beserta Konsep Dasar Node untuk Pemula

### 7.1 Apa itu `npm install`?

`npm install` membaca `package.json` dan mengunduh paket yang diperlukan ke folder `node_modules`.

### 7.2 Apa itu `npm run ...`?

Di `package.json`, ada bagian `scripts`. Contohnya:

```json
"scripts": {
  "dev": "node node_modules/.bin/next dev --webpack",
  "build": "node node_modules/.bin/next build",
  "start": "node node_modules/.bin/next start",
  "lint": "eslint"
}
```

- `npm run dev` berarti menjalankan `node node_modules/.bin/next dev --webpack`
- `npm run build` berarti menjalankan `node node_modules/.bin/next build`

### 7.3 Kenapa ada `node_modules/.bin`?

Paket npm sering menyediakan alat baris perintah.
`node_modules/.bin` adalah tempat alat tersebut disimpan untuk setiap proyek.

### 7.4 Apa itu `package-lock.json`?

File ini mencatat versi pasti paket yang diinstal agar semua orang menggunakan dependensi yang sama.

---

## 8. Mengenal Struktur Next.js di Proyek Ini

### 8.1 App Router

Semua route utama berada di `src/app/`.

- `src/app/page.tsx` — route utama root
- `src/app/(themes)/v1/page.tsx` — halaman utama versi 1
- `src/app/(themes)/v2/page.tsx` — halaman utama versi 2
- `src/app/admin/page.tsx` — halaman admin
- `src/app/api/` — API backend

### 8.2 Route Group `(themes)`

Folder `src/app/(themes)` menampung dua varian aplikasi:
- `v1`
- `v2`

Ini adalah fitur Next.js App Router untuk mengelompokkan route dengan lebih bersih.

### 8.3 `src/app/api/`

Folder ini berisi endpoint API, misalnya:
- `src/app/api/camera/capture/route.ts`
- `src/app/api/templates/route.ts`
- `src/app/api/transactions/route.ts`

Kode di folder ini dijalankan di server.

### 8.4 `src/app/admin/`

Halaman admin menyimpan template, melihat transaksi, dan mengonfigurasi perangkat.

---

## 9. Bagian Utama Kode untuk Dipelajari

### 9.1 `src/lib/utils/db.ts`

Koneksi MongoDB dan pembacaan `MONGODB_URI`.

### 9.2 `src/lib/hooks/`

Hook React reusable untuk logika kamera, countdown, pengambilan foto dan lain-lain.

### 9.3 `src/components/`

Komponen UI generik yang dipakai di lebih dari satu halaman.

### 9.4 `src/app/(themes)/v1/` dan `src/app/(themes)/v2/`

Halaman versi `v1` dan `v2` menggunakan alur photobooth yang mirip tapi tampilan berbeda.

### 9.5 `src/app/admin/`

Halaman admin dengan CRUD template, dashboard keuangan, dan pengelolaan perangkat.

---

## 10. Tips Belajar untuk Pemula

1. Baca `package.json` terlebih dahulu untuk memahami perintah proyek.
2. Jalankan `npm install` lalu `npm run dev`.
3. Buka `src/app/page.tsx` untuk melihat route root.
4. Cari file `src/app/(themes)/v1/page.tsx` dan `src/app/(themes)/v2/page.tsx` untuk memahami varian tampilan.
5. Pelajari `src/lib/utils/db.ts` jika ingin tahu bagaimana aplikasi terhubung ke MongoDB.
6. Ubah teks di satu komponen kecil, lalu lihat hasilnya di browser.

---

## 11. Troubleshooting Umum

### `npm run dev` tidak jalan
- Pastikan `npm install` sudah dijalankan.
- Pastikan Node versi 20 atau lebih baru.
- Pastikan MongoDB berjalan jika halaman membutuhkan data.

### `MONGODB_URI` tidak ditemukan
- Buat file `.env.local`
- Isi dengan `MONGODB_URI=mongodb://localhost:27017/velvetsnap`

### `eslint: not found`
- Jalankan `npm install` lagi.
- Jika masih error, gunakan:
  ```bash
  node ./node_modules/.bin/eslint .
  ```

---

## 12. Kesimpulan

Proyek ini adalah aplikasi Next.js + Node.js + MongoDB dengan dua varian antarmuka.
Untuk pemula, fokuslah pada:
- menjalankan `npm install`
- menjalankan `npm run dev`
- memahami struktur `src/app/`
- mempelajari `src/lib/` dan `src/components/`

Selamat belajar!
