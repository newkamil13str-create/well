# 🛍️ KamilShop — Full-Stack E-Commerce

**Domain:** kamilshop.my.id  
**Stack:** Next.js 14 · PostgreSQL · Prisma · NextAuth v5 · Baileys · Telegraf · Cloudinary · Pakasir

---

## ✅ Fitur Lengkap

### 🌐 Website (Next.js 14 App Router)
- Beranda dengan katalog produk & filter kategori
- Search produk real-time
- Detail produk (multi-gambar, galeri, qty selector)
- Keranjang belanja persisten (Zustand)
- Checkout dengan form lengkap
- Pembayaran QRIS & Transfer via **Pakasir**
- QR Code display + countdown timer expired
- Auto konfirmasi bayar (polling 5 detik + webhook callback)
- Riwayat & detail pesanan per user
- Auth: login, register, lupa sandi — semua via **OTP WhatsApp**
- Login juga bisa via email + password
- Admin: CRUD produk + upload gambar (URL / file → Cloudinary)
- Admin: stok unlimited jika dikosongkan
- Admin: kelola & update status pesanan
- Admin: dashboard statistik (pendapatan, order, user)
- Admin: kelola pengguna
- Protected routes via middleware

### 💚 WhatsApp Bot (Baileys Multi-device)
- Kirim OTP login, register, lupa sandi
- Notifikasi pembayaran berhasil ke pembeli
- Kirim link produk via API
- Auto-reply pesan lain → arahkan ke website
- Auto-reconnect jika terputus

### 📱 Telegram Bot (Telegraf.js)
- `/start` — sambutan + link website
- `/katalog` — tampilkan 8 produk terbaru dengan foto & tombol beli
- `/cari [nama]` — cari produk
- `/pesanan [invoice]` — cek status order
- `/admin` — dashboard statistik (admin only)
- `/produk` — list produk (admin only)
- **Inline Query** — `@bot [keyword]` cari produk dari chat manapun
- Auto notifikasi order dibayar ke admin group

---

## ⚡ Cara Setup

### 1. Clone & Install
```bash
git clone <repo-url> kamilshop
cd kamilshop
npm install
```

### 2. Setup Environment
```bash
cp .env.local .env.local
# Edit semua variabel di .env.local
```

### 3. Setup Database
```bash
npx prisma migrate dev --name init
npx prisma generate
npx ts-node apps/web/prisma/seed.ts  # data awal
```

### 4. Jalankan Semua Service

**Terminal 1 — Website:**
```bash
cd apps/web
npx next dev
# → http://localhost:3000
```

**Terminal 2 — WhatsApp Bot:**
```bash
cd apps/bot-wa
npx ts-node index.ts
# Scan QR di terminal saat pertama kali
```

**Terminal 3 — Telegram Bot:**
```bash
cd apps/bot-tg
npx ts-node index.ts
```

---

## 🔐 Akun Default (setelah seed)

| Role  | Email                       | Password  |
|-------|-----------------------------|-----------|
| Admin | admin@kamilshop.my.id       | admin123  |
| User  | user@example.com            | user123   |

---

## 🌐 Halaman Website

| URL                          | Keterangan              |
|------------------------------|-------------------------|
| `/`                          | Beranda / katalog       |
| `/produk/[slug]`             | Detail produk           |
| `/keranjang`                 | Keranjang belanja       |
| `/checkout`                  | Checkout                |
| `/pesanan`                   | Riwayat pesanan         |
| `/pesanan/[invoiceId]`       | Detail pesanan          |
| `/login`                     | Login                   |
| `/register`                  | Daftar akun             |
| `/forgot-password`           | Lupa password           |
| `/admin`                     | Dashboard admin         |
| `/admin/produk`              | Kelola produk           |
| `/admin/produk/tambah`       | Tambah produk           |
| `/admin/produk/edit/[id]`    | Edit produk             |
| `/admin/pesanan`             | Kelola pesanan          |
| `/admin/pengguna`            | Kelola pengguna         |

---

## 📡 API Endpoints

| Method   | Endpoint                    | Keterangan              |
|----------|-----------------------------|-------------------------|
| POST     | `/api/auth/register`        | Daftar user baru        |
| POST     | `/api/auth/reset-password`  | Reset password          |
| POST     | `/api/otp/send`             | Kirim OTP via WA        |
| POST     | `/api/otp/verify`           | Verifikasi OTP          |
| GET      | `/api/produk`               | List produk (publik)    |
| POST     | `/api/produk`               | Tambah produk (admin)   |
| GET      | `/api/produk/[id]`          | Detail produk           |
| PUT      | `/api/produk/[id]`          | Update produk (admin)   |
| DELETE   | `/api/produk/[id]`          | Hapus produk (admin)    |
| POST     | `/api/upload`               | Upload gambar Cloudinary|
| POST     | `/api/order`                | Buat order baru         |
| GET      | `/api/order`                | List order user/admin   |
| GET      | `/api/order/[id]`           | Detail order (polling)  |
| PATCH    | `/api/order/[id]`           | Update status (admin)   |
| POST     | `/api/payment/create`       | Buat pembayaran Pakasir |
| POST     | `/api/payment/callback`     | Webhook Pakasir         |

---

## 🚀 Deployment

### Vercel (Website)
1. Push ke GitHub
2. Import di vercel.com
3. Set env vars di Vercel dashboard
4. Deploy otomatis

### Railway (Bot WA + TG)
1. Buat project baru di railway.app
2. Tambah service Node.js untuk masing-masing bot
3. Set env vars
4. Deploy

### VPS dengan PM2
```bash
npm install -g pm2

# Jalankan semua
pm2 start ecosystem.config.js

# Monitor
pm2 status
pm2 logs
```

---

## 🔄 Alur Sistem

```
ORDER:
User → Pilih produk → Keranjang → Checkout → Pakasir
→ QR/Transfer + countdown → User bayar
→ Pakasir webhook → Status PAID → Stok berkurang
→ Notif WA pembeli + Notif Telegram admin

OTP:
User input WA → /api/otp/send → WA Bot kirim kode
→ User input kode → /api/otp/verify → Session/reset

UPLOAD GAMBAR:
Admin → form → /api/upload → Cloudinary
→ URL dikembalikan → disimpan di produk.gambar[]
```

---

## 📦 Tech Stack Detail

| Teknologi     | Versi    | Kegunaan                        |
|---------------|----------|---------------------------------|
| Next.js       | 14.2.0   | Frontend + Backend (App Router) |
| TypeScript    | 5.4.0    | Type safety                     |
| Tailwind CSS  | 3.4.4    | Styling                         |
| Prisma        | 5.14.0   | ORM PostgreSQL                  |
| NextAuth.js   | v5 beta  | Authentication                  |
| Baileys       | 6.7.5    | WhatsApp Bot multi-device       |
| Telegraf      | 4.16.3   | Telegram Bot                    |
| Cloudinary    | 2.3.1    | Image storage & CDN             |
| Zustand       | 4.5.2    | State management (cart)         |
| react-qr-code | 2.0.15   | Generate QR QRIS                |
| bcryptjs      | 2.4.3    | Password hashing                |
| slugify       | 1.6.6    | Generate URL slug produk        |
