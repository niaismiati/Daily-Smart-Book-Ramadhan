# 🚀 Panduan Setup Database & Login

## Langkah 1: Buat Database di PlanetScale (GRATIS, pakai GitHub)

1. Buka https://planetscale.com
2. Klik **Sign In** → **Continue with GitHub** → Authorize
3. Setelah masuk, klik **Create database**
4. Isi:
   - **Name:** `smartbook_ramadan`
   - **Region:** pilih yang terdekat (contoh: `us-east` atau `ap-southeast`)
   - **Plan:** pilih **Free**
5. Klik **Create Database** → tunggu beberapa detik
6. Setelah jadi, klik **Branches** → **main**
7. Klik **Connect**
8. Pilih **Connect with: MySQL** → copy connection string yang muncul:

   ```
   mysql://YOUR_USER:YOUR_PASSWORD@aws.connect.psdb.cloud/smartbook_ramadan?ssl={"rejectUnauthorized":true}
   ```

   Dari sini ambil informasi:
   - **Host:** `aws.connect.psdb.cloud`
   - **Username:** (dari connection string, setelah `mysql://` sebelum `:`)
   - **Password:** (dari connection string, setelah `:` sebelum `@`)
   - **Port:** `3306`

---

## Langkah 2: Set Environment Variables di Vercel

1. Buka https://vercel.com → dashboard
2. Pilih project `daily-smart-book-ramadhan`
3. **Settings** → **Environment Variables**
4. Tambahkan variabel ini SATU PER SATU:

| Name | Value |
|---|---|
| `DB_HOST` | `aws.connect.psdb.cloud` |
| `DB_PORT` | `3306` |
| `DB_USER` | (username dari PlanetScale - lihat connection string) |
| `DB_PASSWORD` | (password dari PlanetScale - lihat connection string) |
| `DB_NAME` | `smartbook_ramadan` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `smartbook_ramadan_secret_key_2024` |
| `ALLOWED_ORIGINS` | `https://daily-smart-book-ramadhan-b8l5.vercel.app` |

5. Klik **Save**
6. Buka **Deployments** → klik ⋮ (menu tiga titik) → **Redeploy**
7. Tunggu sampai status berubah jadi **Ready** ✅

---

## Langkah 3: Setup Database Otomatis

Setelah redeploy selesai, buka URL ini di browser:

**https://daily-smart-book-ramadhan-b8l5.vercel.app/api/seed**

Jika berhasil, akan muncul JSON:
```json
{
  "success": true,
  "message": "Database berhasil disetup!",
  "accounts": {
    "admin": { "credential": "admin@smartbook.com", "password": "admin123", "role": "guru" },
    "santri": { "credential": "1234567890", "password": "santri123", "role": "siswa" }
  }
}
```

> ⚠️ Jika muncul error, **scroll ke URL seed** dan kirim screenshot errornya ke saya.

---

## Langkah 4: Login ke Aplikasi

Buka https://daily-smart-book-ramadhan-b8l5.vercel.app

### Login sebagai Guru:
- **Identifier:** `admin@smartbook.com`
- **Password:** `admin123`
- **Role:** Guru

### Login sebagai Santri/Siswa:
- **Identifier:** `1234567890`
- **Password:** `santri123`
- **Role:** Siswa

---

## Troubleshooting

### ❌ Error 500 setelah seed
Buka URL **https://daily-smart-book-ramadhan-b8l5.vercel.app/api/health**
- Jika muncul `{ "status": "ok" }` → API hidup, error dari DB
- Jika error → API belum jalan, cek Vercel deployment

### ❌ "connect ECONNREFUSED"
Pastikan di Vercel **Settings → Environment Variables** sudah ada:
- `DB_HOST` = `aws.connect.psdb.cloud`
- `DB_USER` = (dari PlanetScale)
- `DB_PASSWORD` = (dari PlanetScale)
- `DB_SSL` = `true` (PENTING! PlanetScale butuh SSL)

### ❌ "Access denied for user"
Cek username dan password dari PlanetScale. Buka PlanetScale → database → **Connect** → lihat connection string.