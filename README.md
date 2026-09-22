# Bombon Marketplace — Fase 1

Fase 1 mencakup: struktur project, schema database Supabase lengkap (RLS aktif),
sistem daftar/login/logout, dan halaman Beranda yang mengambil data produk
sungguhan dari database (bukan dummy).

## 1. Setup Database

1. Buka Supabase Dashboard project kamu → **SQL Editor**.
2. Copy seluruh isi `supabase/migrations/001_init_schema.sql`, jalankan (Run).
   Ini akan membuat semua tabel, RLS policy, trigger, storage bucket, dan seed kategori.
3. Cek di **Table Editor** apakah tabel seperti `profiles`, `products`, `orders`, dst muncul.

## 2. Setup Project Lokal

```bash
npm install
npm run dev
```

File `.env` sudah berisi URL dan anon key project Supabase kamu.

## 3. PENTING — Catatan Keamanan

Kamu sempat membagikan **secret key** (`sb_secret_...`). Key itu TIDAK dipakai
di project ini sama sekali (hanya anon/publishable key). Tetap disarankan
rotate secret key itu dari **Settings → API** di dashboard Supabase, karena
secret key sebaiknya tidak pernah beredar di luar server backend kamu.

## 4. Catatan Teknis: Login via Nomor WhatsApp

Supabase Auth secara native berbasis email+password (atau OTP telp berbayar
lewat provider SMS). Karena permintaan asli adalah "login pakai nomor
WhatsApp", solusi yang dipakai di Fase 1:

- Saat daftar, jika user tidak isi email, sistem membuat "email sintetis"
  (`username@wa.bombon.local`) di belakang layar agar Supabase Auth tetap bisa
  dipakai standar.
- Saat login, sistem mencari nomor WhatsApp di tabel `profiles` untuk
  menemukan email yang terhubung, lalu login pakai email itu ke Supabase Auth.

Ini **bekerja**, tapi bukan solusi paling elegan untuk skala besar. Untuk
production sungguhan, opsi yang lebih baik (perlu effort tambahan, bisa kita
kerjakan di fase lanjutan):
- Supabase Phone Auth + OTP WhatsApp (perlu provider SMS/WhatsApp Business API berbayar), atau
- Edge Function custom yang memetakan nomor WhatsApp → email secara aman di server (bukan di client).

## 5. Status Fitur (Fase 1)

✅ Selesai & nyata (bukan simulasi):
- Schema database + RLS lengkap untuk semua 30 poin permintaan
- Daftar akun (tersimpan di `auth.users` + trigger otomatis isi `profiles`)
- Login (WhatsApp atau email) + logout
- Halaman Beranda: kategori & produk dari database asli, dengan loading/empty/error state

🔜 Placeholder (halaman "Coming Soon", akan diisi Fase 2–5):
- Detail produk, form Jual Barang + upload foto
- Sistem order end-to-end + dashboard penjual/pembeli
- Chat realtime, notifikasi, favorit, rating
- Search & filter lanjutan, admin panel, sistem laporan

## 6. Struktur Folder

```
src/
  components/   → komponen reusable (Header, ProductCard, ProtectedRoute, dst)
  context/      → AuthContext (state login global)
  lib/          → supabase client
  pages/        → satu file per halaman/route
  types/        → tipe TypeScript + state machine status order
supabase/
  migrations/   → SQL schema, jalankan manual di SQL Editor
```

## 7. Langkah Selanjutnya

Fase 2 akan menambahkan: detail produk, form Jual Barang dengan upload foto ke
Supabase Storage, dan halaman "Produk Saya". Beri tahu saya kapan siap lanjut.
