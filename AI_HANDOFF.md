<!-- File: AI_HANDOFF.md -->
<!-- Description: Auto-added top comment for easier file identification. -->

# VelvetSnap Photobooth — AI Handoff Document

## Tujuan

Dokumen ini dibuat sebagai petunjuk lengkap untuk AI berikutnya agar dapat meneruskan refaktorisasi proyek dengan fokus:

- memisahkan komponen yang dapat digunakan ulang
- menyatukan tipe dan utilitas bersama
- merapikan struktur folder sesuai praktik Next.js App Router
- memperbaiki nama variabel untuk keterbacaan
- melengkapi dokumentasi agar pengerjaan lebih mudah

## Ringkasan Proyek

VelvetSnap Photobooth adalah aplikasi web Next.js 16 + React 19 yang menyediakan alur:

- pemilihan template fotostrip
- pengambilan foto webcam/DSLR
- editor foto / komposit strip
- pembayaran digital
- hasil cetak/download

Arsitektur saat ini memiliki dua varian aplikasi utama di `src/app/(themes)/v1` dan `src/app/(themes)/v2`, plus panel admin di `src/app/admin`.

## Struktur Utama

- `src/app/` — titik masuk App Router
- `src/app/(themes)/v1/` — versi 1 alur photobooth
- `src/app/(themes)/v2/` — versi 2 alur photobooth
- `src/app/admin/` — panel admin
- `src/lib/` — utilitas umum dan hook
- `src/models/` — Mongoose models
- `src/components/` — komponen UI reusable baru

## Perubahan yang Sudah Dilakukan

1. `src/lib/types.ts`
   - Dibuat file tipe terpusat untuk shared interface/const:
     - `ISlot`, `IStripElement`, `ITemplateData`, `TemplateData`, `StripResult`, `PhotoAdjust`
     - `DEFAULT_ADJUST`, `STEP_LABELS`, `TEMPLATE_CONFIGS`, `SAMPLE_IMAGES`

2. `src/app/v1/types.ts` dan `src/app/v2/types.ts`
   - Dikonversi menjadi export ulang (`export * from '@/lib/types'`) untuk memusatkan tipe.

3. Komponen UI reusable baru:
   - `src/components/ui/LoadingSpinner.tsx`
   - `src/components/ui/LoadableImage.tsx`
   - `src/components/ui/SlotDots.tsx`

4. Komponen template reusable baru:
   - `src/components/template/TemplateCard.tsx`
   - `src/components/template/TemplateList.tsx`

5. Penggunaan ulang `LoadableImage` dan shared template card/list:
   - `src/app/v2/template/TemplateCard.tsx`
   - `src/app/v1/template/TemplateCard.tsx`
   - `src/app/v2/template/TemplateStep.tsx`
   - `src/app/v1/template/TemplateStep.tsx`

6. Komponen flow, hasil, dan payment reusable baru:
   - `src/components/flow/SharedStepperFlow.tsx`
   - `src/components/result/ResultActions.tsx`
   - `src/components/payment/PaymentPending.tsx`
   - `src/app/v1/StepperFlow.tsx`
   - `src/app/v2/StepperFlow.tsx`
   - `src/app/v1/result/component/ResultStep.tsx`
   - `src/app/v2/result/component/ResultStep.tsx`
   - `src/app/v1/payment/component/PaymentStep.tsx`
   - `src/app/v2/payment/component/PaymentStep.tsx`

7. Penggantian import tipe di utilitas:
   - `src/lib/adjust-utils.ts`
   - `src/lib/canvas-utils.ts`
   - `src/lib/useAppData.ts`
   - `src/lib/usePhotoboothFlow.ts`

6. Nama variabel diperbaiki:
   - `StepperFlow` sekarang menggunakan `flow` bukan `f` untuk hasil hook.
   - `usePhotoboothFlow` menggunakan nama klarifikasi `seconds`, `minutes`, `remainingSeconds`, `canvasWidth`, `canvasHeight`, `matchedTemplate`, dan lain-lain.

## Temuan Kode Penting

### Reuse dan Duplikasi

- `src/app/v1/` dan `src/app/v2/` memiliki banyak file paralel dengan logika dan komponen yang sama.
- `usePhotoboothFlow` saat ini shared antara kedua versi tetapi masih mengimpor `@/app/v1/types` di beberapa tempat.
- Ada potensi pemakaian ulang komponen `TemplateStep`, `TemplateCard`, `StepperBar`, `BoothStep`, `EditorStep`, `PaymentStep`, dan `ResultStep`.

### Struktur Next.js

- Root route `src/app/page.tsx` hanya redirect ke versi `v1` atau `v2` berdasarkan setting.
- `src/app/v1` dan `src/app/v2` masing-masing punya `layout.tsx` dan `page.tsx` sendiri.
- Komponen dan utilitas dapat disatukan ke `src/components` dan `src/lib` untuk mencegah duplikasi.

### Area Dokumen dan Lanjutan

Dokumen ini harus ditindaklanjuti dengan:

- memindahkan komponen yang sama ke folder `src/components/` dan menggunakan parameter props
- membuat komponen UI dasar seperti `Button`, `Card`, `CardGrid`, `PageShell`, `SectionHeader`
- membuat utilitas helper `src/lib/api-utils.ts` untuk error API
- membuat `src/lib/ui-utils.ts` atau `src/lib/dom-utils.ts` untuk helper aria/focus/format
- membersihkan import `@/app/v1/types` / `@/app/v2/types` yang tersisa
- menyederhanakan `src/app/v1/types.ts` dan `src/app/v2/types.ts` menjadi file ekspor ulang saja

## Saran Langkah Lanjutan untuk AI Berikutnya

1. Cari semua referensi `@/app/v1/types` dan `@/app/v2/types` di semua file.
2. Cari semua komponen `TemplateCard`, `TemplateStep`, `StepperBar`, `HomePage`, `BoothStep`, `EditorStep`, `PaymentStep`, `ResultStep`.
3. Identifikasi kode identik antara `src/app/v1` dan `src/app/v2`.
4. Ekstrak komponen umum ke `src/components/shared/` dan gunakan dari kedua versi.
5. Ekstrak props interface dan gunakan `type` sentral di `src/lib/types.ts`.
6. Perbaiki import path dan hapus duplikasi tipe.
7. Tambahkan dokumentasi `README.md` kecil yang menjelaskan cara kerja folder `components/ui` dan `lib/types.ts`.

## Prioritas Refaktorisasi

1. Memusatkan tipe di `src/lib/types.ts`.
2. Memindahkan komponen UI umum ke `src/components/ui` atau `src/components/shared`.
3. Menyederhanakan alur `StepperFlow` agar props dan handler jelas.
4. Menghilangkan impor relatif panjang `../../` ke path alias `@/components` / `@/lib`.
5. Menambahkan komentar dan dokumentasi internal pada hook kompleks seperti `usePhotoboothFlow`.

## Catatan Khusus

- Belum dilakukan pengecekan kompilasi atau pengujian otomatis.
- Beberapa file masih mungkin mengimpor `@/app/v1/types` atau `@/app/v2/types` meskipun perubahan sebagian sudah dilakukan.
- Fokus selanjutnya adalah stabilisasi struktur dan pengurangan duplikasi tanpa mengubah alur aplikasi.

---

## Direktif untuk AI Berikutnya

Gunakan dokumen ini sebagai panduan tugas, dan jalankan di bawah ini:

- lihat `src/lib/types.ts` sebagai sumber kebenaran tipe.
- buat komponen reusable sebelum memigrasi versi `v1` / `v2` ke shared.
- terapkan `use client` hanya pada file yang membutuhkan state atau browser API.
- perjelas nama variabel hooks, callback, dan state.

Jika perlu, buat file dokumentasi tambahan seperti `COMPONENT_GUIDE.md` dan `ARCHITECTURE.md` setelah refactor dasar selesai.
