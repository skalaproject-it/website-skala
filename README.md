# SKALA — Website Yayasan

Website resmi Yayasan SKALA, yayasan konservasi yang bekerja bersama Kelompok Tani Hutan (KTH) untuk mereboisasi lahan kritis, memulihkan ekosistem, dan memberdayakan komunitas.

Dibangun dengan **Astro 7** + **Tailwind CSS v4**, dikembangkan di **Vercel** (adapter `@astrojs/vercel`, mode serverless untuk endpoint API). Sistem desain dark theme: ink/olive/cream, serif *Fraunces* + sans *Manrope*.

## Development Lokal

```bash
npm install
npm run dev          # mulai dev server di http://localhost:4321
npm run build        # build + optimasi produksi (Vercel output)
npm run preview      # preview hasil build
```

AGENTS.md menyarankan menjalankan dev server di background: `astro dev --background` (dengan manajemen `astro dev stop/status/logs`).

> **Endpoint API & env vars** — form Kemitraan dan Kontak memanggil endpoint serverless yang mengirim email via Resend. Salin `.env.example` ke `.env` dan isi `RESEND_API_KEY` agar pengiriman berfungsi (di dev, endpoint mengembalikan status "server belum dikonfigurasi" jika key kosong — perilaku ini wajar).

## Struktur Project

```
public/            # favicon, robots.txt, og-image.png, (nanti: file PDF & aset statis)
src/
  content/         # content collections (lihat di bawah)
  data/
    navigation.ts  # menu global (ubah di sini, dipakai Header & Footer)
  layouts/
    BaseLayout.astro   # head HTML + semua meta SEO (title, OG, Twitter, canonical)
    Layout.astro       # wrapper yang meneruskan props per halaman
  components/      # komponen UI reusable (TeamCard, StatCard, CTAButton, dll.)
  styles/global.css    # design tokens + komponen CSS (Tailwind v4 @theme)
  utils/           # motion.ts (scroll-reveal/count-up), project.ts (format helper)
  pages/           # route: index, tentang, metodologi, tata-kelola, program/,
                     #   program/[slug], kemitraan, komunitas, dampak, publikasi,
                     #   berita/index, berita/[slug], kontak + api/kemitraan.ts, api/kontak.ts
```

## Content Collections

Semua konten dikelola lewat file Markdown di `src/content/*/` — tambah file baru, route otomatis muncul saat `npm run build`.

### `projects` — `src/content/projects/*.md`

Field:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `title` | string | Judul program |
| `slug` | string | Harus sama dengan nama file |
| `location` | string | Lokasi kawasan |
| `category` | enum | `reboisasi` \| `konservasi` \| `restorasi-habitat` \| `kemitraan` |
| `status` | enum | `planned` \| `active` \| `completed` \| `fundraising` |
| `description` | string | Narasi panjang untuk halaman detail (tanpa batas panjang) |
| `excerpt` | string | **Wajib**, maks 120 karakter — khusus kartu di listing/homepage |
| `community_partners` | string[] | Nama KTH mitra |
| `area_hectares` | number \| `'[ISI DATA]'` | Luas lahan (opsional) |
| `funding_needed` | number \| `'[ISI DATA]'` | Kebutuhan pendanaan (opsional) |
| `progress` | int 0–100 | % progres (opsional) |
| `land_status` / `land_condition` / `impact_target` | string | Opsional; ditampilkan pada detail jika terisi, bukan marker `[ISI DATA]` |
| `period` | string | Opsional, periode pelaksanaan sesuai data resmi; ditampilkan jika tersedia |

Body Markdown menjadi isi utama halaman detail. Gunakan heading `##` untuk Latar belakang, Tujuan program, Peran SKALA, Lingkup kegiatan, Perkembangan program, dan Peluang kerja sama; tautan daftar isi dibuat otomatis. Bedakan tujuan dari capaian dan jangan isi progres, periode, atau angka dampak jika datanya belum tersedia. Informasi luas/pendanaan ditampilkan hanya jika berupa angka; progres yang tidak diisi tidak dianggap 0%.

Tombol detail program menuju `/kemitraan?program=<id>#form-kemitraan`. Formulir mencocokkan ID dengan katalog lalu mengisi referensi program dan bidang kerja sama; isian tetap dapat diubah. ID yang tidak dikenal diabaikan.

### `partners` — `src/content/partners/*.md`

Profil KTH/kelompok tani. Field: `name`, `location`, `description`, `established_year`. Ditampilkan di halaman `/komunitas`.

### `news` — `src/content/news/*.md`

Update kegiatan (berita). Field: `title`, `date` (YYYY-MM-DD), `excerpt`, plus body Markdown untuk halaman detail (kolom `content` di frontmatter juga didukung). Listing di `/berita`, detail di `/berita/<id-file>`.

## Menambah Konten Baru

**Program baru**
1. Salin contoh `src/content/projects/garut.md`.
2. Ubah field sesuai kebutuhan; **nama file = `slug`**. Wajib isi `excerpt` (maks 120 karakter).
3. Build — program otomatis muncul di `/program`, kartu utama belum otomatis.
4. Tambah ID-nya ke `showcaseOrder` di `src/pages/index.astro` agar tampil di homepage.

**Berita baru**
1. Buat `src/content/news/<slug>.md`.
2. Isi `title`, `date` (format `YYYY-MM-DD`, urutkan otomatis per tanggal), `excerpt`.
3. Tulis body (Markdown) untuk halaman detail.
4. Build — muncul di `/berita`.

**Kemitraan/legacy legal** (belum diisi): seluruh placeholder berisi `[ISI DATA]` atau komentar `TODO ...` — lengkapi lalu hapus komen.

## Standar

- **Tone**: Bahasa Indonesia formal-institusional; hindari bahasa donasi; fokus dampak terukur.
- **Placeholder**: konten kosong memakai literal `[ISI DATA]`; integrasi tertunda memakai `/* TODO ... */` (peta interaktif, Google Maps, PDF laporan, SK Kemenkumham).
- **Motion**: `data-reveal`/`data-reveal-group`/`data-image-reveal` + `data-count-up` (diurus `initMotion` di BaseLayout). Otomatis nonaktif saat `prefers-reduced-motion` / print.
- **Aksesibilitas**: setiap halaman punya satu `<h1>`, label form terhubung, skip-link (BaseLayout), fokus terlihat, kontras warna mengikuti token design (AA ≥ 4.5:1 untuk teks normal).
- **Gambar**: gunakan komponen `Image` dari `astro:assets` (sudah dipakai di `TeamCard`, `FloatingImageCard`, `PartnerLogoStrip`). Untuk optimasi build-time, letakkan gambar di `src/assets/` dan import sebagai `ImageMetadata`; versi yang lebih terang (`#76865a`) untuk `--color-olive` dipertahankan agar legible pada teks ukuran normal.
- **SEO**: title/description diset per halaman via `Layout`; Open Graph & Twitter card lebih lanjut di `BaseLayout`; sitemap otomatis via `@astrojs/sitemap` (`/sitemap-index.xml`), referensi di `public/robots.txt`.

## Deployment

Vercel mendeteksi framework Astro secara otomatis. Sitel URL & base `https://skalapro.or.id`. Domain custom dikonfigurasi di dashboard Vercel (project settings → Domains); `vercel.json` berisi redirect `/mitra → /komunitas` dan security headers.
