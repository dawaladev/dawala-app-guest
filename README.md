# DAWALA - Sistem Informasi Desa Wisata Alamendah

Aplikasi web untuk mengelola dan menampilkan informasi paket wisata dan kuliner di Desa Wisata Alamendah, Kabupaten Bandung. Dikembangkan sebagai bagian dari kegiatan pengmas (Membangun Desa/KKN) dengan fokus pada transformasi digital dalam perintisan wisata halal berbasis rantai pasok hijau.

## Teknologi yang Digunakan

Framework dan Library:
- Next.js 15.4.5 dengan App Router untuk aplikasi web modern
- React 19.1.0 untuk user interface
- TypeScript 5 untuk type safety dan developer experience
- TailwindCSS 4 untuk styling yang efisien dan responsif

Database dan ORM:
- PostgreSQL sebagai database relational
- Prisma 6.13.0 sebagai ORM untuk database operations
- pg 8.16.3 untuk koneksi PostgreSQL langsung pada API routes

State Management dan Form:
- React Hook Form 7.62.0 untuk form handling
- Zod 4.0.15 untuk schema validation
- Custom hooks untuk state management lokal

Icon dan UI:
- Lucide React 0.536.0 untuk icon set yang konsisten
- Next.js Image untuk optimasi gambar

Storage dan Media:
- Supabase Storage untuk penyimpanan foto makanan
- Remote pattern untuk Unsplash dan Supabase images

## Struktur Database

Database menggunakan PostgreSQL dengan skema sebagai berikut. Aplikasi ini adalah website publik tanpa sistem login atau autentikasi, sehingga semua pengunjung dapat langsung mengakses informasi menu dan paket kuliner.

### Tabel JenisPaket
Menyimpan kategori paket kuliner dengan dukungan multi-bahasa.

Kolom:
- id: Integer (Primary Key, Auto-increment)
- namaPaket: String (Nama dalam Bahasa Indonesia)
- namaPaketEn: String (Optional, nama dalam Bahasa Inggris)
- createdAt: DateTime
- updatedAt: DateTime

Relasi: Memiliki relasi one-to-many dengan tabel Makanan.

### Tabel Makanan
Menyimpan data menu makanan dan minuman dengan detail lengkap.

Kolom:
- id: Integer (Primary Key, Auto-increment)
- namaMakanan: String
- deskripsi: String (Deskripsi dalam Bahasa Indonesia)
- deskripsiEn: String (Optional, deskripsi dalam Bahasa Inggris)
- foto: String (JSON array berisi URL foto, backward compatible dengan string tunggal)
- harga: Integer (Dalam Rupiah)
- jenisPaketId: Integer (Foreign Key ke JenisPaket)
- createdAt: DateTime
- updatedAt: DateTime

Relasi: Memiliki relasi many-to-one dengan JenisPaket dengan cascade delete.

### Tabel Settings
Menyimpan konfigurasi kontak aplikasi.

Kolom:
- id: Integer (Primary Key, Auto-increment)
- email: String
- noTelp: String (Nomor telepon untuk WhatsApp gateway)
- createdAt: DateTime
- updatedAt: DateTime

## Arsitektur Aplikasi

### Routing dan Middleware

Aplikasi menggunakan Next.js App Router dengan struktur routing berbasis locale:

```
/[locale]
  /page.tsx          - Halaman beranda dengan hero section dan featured packages
  /menu/page.tsx     - Halaman daftar lengkap menu kuliner
  /contact/page.tsx  - Halaman informasi kontak
  /layout.tsx        - Layout wrapper untuk locale
  /not-found.tsx     - Halaman 404
```

Middleware (src/middleware.ts) menangani:
- Deteksi locale dari URL pathname
- Redirect otomatis ke locale yang dipilih (default: Bahasa Indonesia)
- Pengecekan cookie preferred-locale untuk konsistensi pengalaman pengguna
- Skip middleware untuk internal paths, API routes, dan static files

### API Routes

#### GET /api/makanan
Mengambil data makanan dari database dengan optional filter berdasarkan jenis paket.

Query Parameters:
- jenisPaketId (optional): Filter makanan berdasarkan ID jenis paket

Response: Array objek Makanan dengan kolom dalam format camelCase.

#### GET /api/jenis-paket
Mengambil semua kategori paket dengan informasi multi-bahasa.

Response: Array objek JenisPaket dengan namaPaket dan namaPaketEn.

#### GET /api/settings
Mengambil konfigurasi kontak aplikasi.

Response: Objek Settings dengan email dan noTelp. Mengembalikan nilai default jika tidak ada data atau terjadi error.

#### POST /api/translate
Menerjemahkan teks menggunakan Google Translate API (free tier).

Request Body:
- text: String (Teks yang akan diterjemahkan)
- targetLang: String (Default: "en", target bahasa terjemahan)

Response:
- originalText: String
- translatedText: String
- targetLang: String
- success: Boolean

Fitur:
- Timeout 5 detik untuk mencegah request hang
- Skip translation untuk teks kurang dari 3 karakter
- Fallback ke original text jika translation gagal
- Source language default: Bahasa Indonesia

#### GET /api/test-db
API endpoint untuk testing koneksi database.

Response: Status koneksi database dan informasi debugging.

### Komponen Utama

#### Header (src/components/Header.tsx)
Komponen navigasi utama aplikasi dengan fitur:
- Logo Desa Wisata Alamendah
- Navigation menu responsif (Home, Menu, Contact)
- Language switcher dengan dropdown
- WhatsApp contact button dengan responsive logic
- Sticky header dengan blur effect saat scroll
- Mobile hamburger menu dengan slide-in animation

Fitur WhatsApp Gateway:
- Deteksi device (mobile/desktop)
- Automatic redirect ke wa.me untuk mobile
- Automatic redirect ke web.whatsapp.com untuk desktop
- Normalisasi nomor telepon Indonesia (08xxx -> 62xxx)
- Pre-filled message template

#### Footer (src/components/Footer.tsx)
Komponen footer dengan informasi:
- Deskripsi Desa Wisata Alamendah
- Informasi kontak (email, telepon, lokasi)
- Quick links navigation
- Copyright information
- Dukungan multi-bahasa

#### MakananCard (src/components/MakananCard.tsx)
Card component untuk menampilkan item makanan dengan:
- Foto makanan dengan lazy loading
- Nama makanan
- Deskripsi dengan dukungan multi-bahasa
- Harga dalam format Rupiah
- Hover effect dengan scale animation
- Click handler untuk membuka detail modal
- Support untuk multiple foto (mengambil foto pertama yang valid)
- Fallback ke placeholder image jika foto tidak tersedia

#### MakananModal (src/components/MakananModal.tsx)
Modal dialog untuk detail makanan dengan:
- Gallery foto makanan dengan navigation
- Nama dan deskripsi lengkap
- Harga dengan format Rupiah
- Kategori paket
- Tombol WhatsApp untuk order dengan pre-filled message
- Responsive design untuk mobile dan desktop
- Close button dan backdrop click to close

#### FilterPaket (src/components/FilterPaket.tsx)
Komponen filter untuk kategori paket dengan:
- Button "Semua" untuk menampilkan semua makanan
- Dynamic buttons berdasarkan data jenis paket dari database
- Active state indicator
- Dukungan multi-bahasa untuk nama kategori
- Responsive layout dengan horizontal scroll pada mobile

#### SearchBar (src/components/SearchBar.tsx)
Komponen search dengan:
- Real-time search input
- Search icon
- Clear button saat ada input
- Debouncing untuk optimasi performa
- Placeholder text multi-bahasa
- Responsive width

#### LanguageSwitcher (src/components/LanguageSwitcher.tsx)
Toggle switcher untuk bahasa dengan:
- Dropdown menu dengan bendera negara
- Pilihan Bahasa Indonesia dan English
- Sinkronisasi dengan localStorage dan cookie
- Automatic URL update saat ganti bahasa
- Preserve current page saat switch language
- Visual indicator bahasa aktif

#### LoadingSpinner (src/components/LoadingSpinner.tsx)
Komponen loading state dengan:
- Spinner animation untuk feedback loading
- Skeleton cards untuk content loading
- Responsive grid layout

### Custom Hooks

#### useSettings (src/hooks/useSettings.ts)
Custom hook untuk mengambil data settings dari API.

Return:
- settings: Objek Settings atau null
- loading: Boolean
- error: String atau null

Fitur:
- Automatic fetch saat component mount
- Error handling dengan fallback ke default values
- Loading state management

### Library Utilities

#### texts.ts (src/lib/texts.ts)
Mengelola teks multi-bahasa untuk seluruh aplikasi.

Interface Texts: Mendefinisikan struktur lengkap untuk semua teks UI dengan TypeScript type safety.

Function getTexts(locale: Locale):
- Mengambil teks dari file JSON di folder messages
- Melakukan translation untuk teks yang belum diterjemahkan
- Caching dengan localStorage untuk optimasi
- Batch translation untuk mengurangi API calls
- Return type-safe Texts object

Sections:
- header: Teks untuk header navigation
- footer: Teks untuk footer information
- home: Teks untuk halaman beranda (hero, featured, about, activities, accommodation, CTA, search, errors)
- contact: Teks untuk halaman kontak
- menu: Teks untuk halaman menu

#### database-i18n.ts (src/lib/database-i18n.ts)
Utility functions untuk internationalization data dari database.

Functions:
- getLocalizedPackageName: Mendapatkan nama paket sesuai locale
- getLocalizedDescription: Mendapatkan deskripsi makanan sesuai locale
- getPackageName: Get package name dengan multiple field fallback
- getFoodDescription: Get food description dengan multiple field fallback

Fitur fallback untuk backward compatibility dengan naming conventions yang berbeda.

#### locale.ts (src/lib/locale.ts)
Utility untuk manajemen locale dan preferensi bahasa.

Type: Locale = 'id' | 'en'

Functions:
- getPreferredLocale(): Mendapatkan locale dari localStorage, default 'id'
- getLocaleFromPathname(pathname): Extract locale dari URL path
- setPreferredLocale(locale): Menyimpan preferensi locale ke localStorage
- getCurrentLocale(pathname): Mendapatkan locale aktif dengan prioritas URL path

#### translate.ts (src/lib/translate.ts)
Client-side wrapper untuk memanggil translation API.

Function translateText(text, targetLang):
- Memanggil POST /api/translate
- Error handling dengan fallback ke original text
- Return translated text atau original text jika gagal

#### postgres.ts (src/lib/postgres.ts)
Konfigurasi PostgreSQL connection pool.

Setup:
- Connection string dari environment variable DATABASE_URL
- SSL enabled dengan rejectUnauthorized: false
- Export pool instance untuk digunakan di API routes

Keuntungan connection pooling:
- Reuse koneksi database untuk efisiensi
- Automatic connection management
- Better performance untuk concurrent requests

#### config.ts (src/lib/config.ts)
Centralized configuration management.

Export:
- config object dengan sections: supabase, database, admin, app
- getSupabaseImageUrl function untuk generate storage URL

Fitur:
- Environment variable fallback ke default values
- Type-safe configuration access
- Image URL normalization (handle data:image, http, relative paths)

#### database.ts (src/lib/database.ts)
Database utility functions menggunakan Prisma Client (deprecated, digantikan dengan postgres.ts untuk direct connection).

#### prisma.ts (src/lib/prisma.ts)
Prisma Client singleton instance (deprecated untuk production, masih digunakan untuk development tooling).

#### supabase.ts (src/lib/supabase.ts)
Supabase client configuration untuk authentication dan storage.

Setup:
- Server-side client dengan cookie-based auth
- Client-side client untuk browser
- Storage access untuk image upload/download

### Types Definition

File src/types/index.ts mendefinisikan TypeScript interfaces:

```typescript
JenisPaket: id, namaPaket, namaPaketEn
Makanan: id, namaMakanan, deskripsi, deskripsiEn, foto, harga, jenisPaketId, jenisPaket
Settings: email, noTelp
```

## Fitur Aplikasi

### Fitur Publik

1. Multi-bahasa (Internationalization)
   - Dukungan Bahasa Indonesia dan English
   - Toggle switcher dengan visual feedback
   - Persistent preference menggunakan localStorage dan cookie
   - Automatic URL-based routing (/id dan /en)
   - Dynamic content translation untuk UI text
   - Database-driven translation untuk konten makanan dan kategori
   - Fallback mechanism jika terjemahan tidak tersedia

2. Halaman Beranda
   - Hero section dengan background image dan CTA
   - Featured packages section dengan deskripsi
   - About section mengenai Desa Wisata Alamendah
   - Activities showcase (budaya, alam, edukasi)
   - Accommodation information
   - CTA section dengan email dan WhatsApp contact
   - Responsive grid layout untuk berbagai ukuran layar

3. Halaman Menu
   - Grid display untuk semua menu makanan
   - Filter berdasarkan kategori paket
   - Search functionality dengan real-time filtering
   - Search results counter dan active filter indicator
   - Detail modal untuk setiap menu
   - WhatsApp order integration dengan pre-filled message
   - Lazy loading untuk performa optimal
   - Empty state handling

4. Halaman Contact
   - Informasi kontak lengkap (email, telepon, lokasi)
   - WhatsApp quick contact dengan responsive logic
   - Email link dengan mailto protocol
   - Responsive card layout

5. WhatsApp Gateway Integration
   - Automatic device detection (mobile/desktop)
   - Smart routing (wa.me untuk mobile, web.whatsapp.com untuk desktop)
   - Phone number normalization (format Indonesia)
   - Context-aware message templates (berbeda untuk setiap page/action)
   - Dynamic phone number dari database settings

6. Responsive Design
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
   - Touch-friendly interface untuk mobile
   - Adaptive navigation (hamburger menu pada mobile)
   - Responsive images dengan Next.js Image optimization
   - Flexible grid system dengan TailwindCSS

7. Performance Optimization
   - Server-side rendering dengan Next.js
   - Image optimization dengan lazy loading
   - Connection pooling untuk database
   - Caching strategy untuk translations
   - Debouncing untuk search input
   - Batch processing untuk translation API calls
   - Static asset optimization

8. User Experience
   - Loading states dengan skeleton screens
   - Error handling dengan user-friendly messages
   - Smooth transitions dan animations
   - Accessibility considerations
   - Toast notifications untuk user feedback
   - Clear visual hierarchy
   - Consistent design language

## Instalasi dan Setup

### Prasyarat

- Node.js versi 20 atau lebih tinggi
- npm atau yarn package manager
- PostgreSQL database (atau akses ke Supabase PostgreSQL)
- Supabase account untuk authentication dan storage (optional)

### Langkah Instalasi

1. Clone repository

```bash
git clone <repository-url>
cd dawala-app-final
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

Buat file .env di root project dengan konfigurasi berikut:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# Supabase Configuration (untuk storage foto)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="gastronomi"
NEXT_PUBLIC_SUPABASE_STORAGE_URL="https://your-project.supabase.co/storage/v1/object/public/gastronomi"

# Application Configuration
NEXT_PUBLIC_APP_NAME="Desa Wisata Alamendah"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Setup database schema

```bash
# Push schema ke database
npx prisma db push

# Atau jalankan migrations
npx prisma migrate deploy
```

5. Seed database dengan data awal

```bash
npx prisma db seed
```

Seeder akan membuat:
- Sample jenis paket (Nasi Box, Snack Box, Minuman)
- Sample data makanan untuk setiap kategori
- Default settings untuk kontak

6. Jalankan development server

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

### Scripts yang Tersedia

```bash
# Development
npm run dev          # Jalankan development server dengan Turbopack

# Production
npm run build        # Build aplikasi untuk production
npm run start        # Jalankan production server

# Linting
npm run lint         # Jalankan ESLint untuk code quality check
```

### Database Management dengan Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes tanpa migration
npx prisma db push

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI untuk database)
npx prisma studio

# Reset database (DANGER: hapus semua data)
npx prisma migrate reset
```

## Deployment

### Persiapan Production

1. Update environment variables untuk production
2. Pastikan database production sudah di-setup
3. Jalankan migrations di database production
4. Update NEXT_PUBLIC_APP_URL ke domain production
5. Configure Supabase untuk production domain

### Deployment ke Vercel (Recommended)

1. Push code ke GitHub repository
2. Import project di Vercel dashboard
3. Configure environment variables di Vercel project settings
4. Deploy akan automatic trigger saat ada push ke main branch

### Manual Deployment

1. Build aplikasi

```bash
npm run build
```

2. Start production server

```bash
npm run start
```

Server akan berjalan di port 3000 secara default.

### Environment Variables untuk Production

Pastikan semua environment variables sudah di-set:
- DATABASE_URL dan DIRECT_URL harus mengarah ke production database
- NEXT_PUBLIC_SUPABASE_URL dan storage configuration harus dari production Supabase project
- NEXT_PUBLIC_APP_URL harus menggunakan production domain

### Post-Deployment Checklist

- Test semua fitur (multi-bahasa, filter, search, WhatsApp gateway)
- Verifikasi koneksi database
- Test image upload dan display
- Check responsive design di berbagai device
- Verify SSL certificate
- Test performance dengan Lighthouse
- Monitor error logs

## Struktur Direktori

```
dawala-app-final/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   ├── seed.ts                    # Database seeder
│   └── migrations/                # Database migrations
│       └── add_language_support.sql
├── public/
│   └── images/                    # Static images
├── messages/
│   ├── en.json                    # English translations
│   └── id.json                    # Indonesian translations
├── src/
│   ├── app/
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root page redirect
│   │   ├── [locale]/              # Locale-based routes
│   │   │   ├── layout.tsx         # Locale layout wrapper
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── not-found.tsx      # 404 page
│   │   │   ├── menu/
│   │   │   │   └── page.tsx       # Menu listing page
│   │   │   └── contact/
│   │   │       └── page.tsx       # Contact page
│   │   └── api/                   # API routes
│   │       ├── jenis-paket/
│   │       │   └── route.ts       # JenisPaket API
│   │       ├── makanan/
│   │       │   └── route.ts       # Makanan API
│   │       ├── settings/
│   │       │   └── route.ts       # Settings API
│   │       ├── translate/
│   │       │   └── route.ts       # Translation API
│   │       └── test-db/
│   │           └── route.ts       # Database test API
│   ├── components/
│   │   ├── Header.tsx             # Header navigation
│   │   ├── Footer.tsx             # Footer component
│   │   ├── MakananCard.tsx        # Food card component
│   │   ├── MakananModal.tsx       # Food detail modal
│   │   ├── FilterPaket.tsx        # Category filter
│   │   ├── SearchBar.tsx          # Search component
│   │   ├── LanguageSwitcher.tsx   # Language toggle
│   │   ├── LoadingSpinner.tsx     # Loading states
│   │   └── LocaleProvider.tsx     # Locale context provider
│   ├── hooks/
│   │   └── useSettings.ts         # Settings hook
│   ├── lib/
│   │   ├── texts.ts               # Text translations manager
│   │   ├── database-i18n.ts       # Database i18n utilities
│   │   ├── locale.ts              # Locale utilities
│   │   ├── translate.ts           # Translation client
│   │   ├── postgres.ts            # PostgreSQL pool
│   │   ├── config.ts              # App configuration
│   │   ├── prisma.ts              # Prisma client
│   │   ├── supabase.ts            # Supabase client
│   │   └── database.ts            # Database utilities
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── middleware.ts              # Next.js middleware
├── .env                           # Environment variables (gitignored)
├── package.json                   # Dependencies dan scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
├── eslint.config.mjs              # ESLint configuration
└── README.md                      # Dokumentasi ini
```

## Konfigurasi

### Next.js Configuration (next.config.ts)

- Remote patterns untuk images dari Unsplash dan Supabase
- Automatic static optimization
- Image optimization dengan Next.js Image component

### TypeScript Configuration (tsconfig.json)

- Target ES2017 untuk compatibility
- Strict mode enabled untuk type safety
- Path alias @/* untuk src/*
- JSX preserve untuk Next.js

### TailwindCSS Configuration

- TailwindCSS v4 dengan PostCSS
- Custom theme extensions
- Responsive breakpoints
- JIT mode untuk optimal bundle size

### ESLint Configuration (eslint.config.mjs)

- Next.js recommended rules
- TypeScript support
- Custom rules untuk code quality

## Panduan Penggunaan

### Untuk Pengunjung Website

1. Akses website melalui browser
2. Pilih bahasa di pojok kanan atas (Indonesia/English)
3. Jelajahi menu melalui navigation bar
4. Gunakan filter kategori atau search untuk mencari menu
5. Klik card menu untuk melihat detail dan foto
6. Hubungi via WhatsApp untuk order atau informasi lebih lanjut

Website ini bersifat publik dan tidak memerlukan login atau registrasi. Semua pengunjung dapat langsung mengakses informasi menu dan paket kuliner.

### Untuk Pengelola Website

Tidak ada admin panel atau sistem autentikasi dalam web app ini. Semua pengelolaan data dilakukan langsung melalui web terpisah (khusus admin).

## Kontribusi dan Development Guidelines

### Code Style

- Gunakan TypeScript untuk semua file (except config)
- Follow ESLint rules
- Use meaningful variable dan function names
- Add comments untuk complex logic
- Keep components focused dan reusable
- Prefer functional components dengan hooks

### Git Workflow

- Main branch untuk production-ready code
- Development branch untuk active development
- Feature branches untuk new features
- Commit messages yang descriptive
- Pull request dengan review sebelum merge