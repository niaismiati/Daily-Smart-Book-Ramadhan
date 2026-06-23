# Cara Testing Aplikasi Setelah Deployment

## 🚀 Langkah-langkah Setup Database

Aplikasi ini membutuhkan **MySQL database** cloud gratis. Ikuti langkah berikut:

### **Opsi 1: Aiven (MySQL gratis)**

1. Buka https://console.aiven.io/signup
2. Register (pilih free plan)
3. Create service → **MySQL** → Free plan
4. Tunggu beberapa menit sampai service ready
5. Buka tab **Overview**, catat:
   - **Host** (contoh: `mysql-xxxxx.aivencloud.com`)
   - **Port** (contoh: `12345`)
   - **User** (contoh: `avnadmin`)
   - **Password**
6. Klik **Download CA Certificate**
7. Connect ke database:
   ```
   mysql -h [HOST] -P [PORT] -u [USER] -p
   ```
   Masukkan password, lalu paste isi file `backend-node/migrations.sql`

### **Opsi 2: PlanetScale (MySQL-compatible, gratis)**

1. Buka https://planetscale.com
2. Login dengan GitHub
3. Create database → beri nama `smartbook_ramadan`
4. Di dashboard, buka **Branches** → main → **Connect**
5. Pilih **Connect with MySQL** → copy connection string
6. Buka tab Console, paste isi `backend-node/migrations.sql`

---

## ⚙️ Set Environment Variables di Vercel

1. Buka https://vercel.com → dashboard
2. Pilih project `daily-smart-book-ramadhan`
3. **Settings** → **Environment Variables**
4. Tambahkan variabel berikut:

| Name | Value |
|---|---|
| `DB_HOST` | Host dari Aiven / PlanetScale |
| `DB_PORT` | Port (Aiven: 12345, PlanetScale: 3306) |
| `DB_USER` | Username database |
| `DB_PASSWORD` | Password database |
| `DB_NAME` | `smartbook_ramadan` |
| `JWT_SECRET` | `smartbook_ramadan_secret_key_2024` |
| `ALLOWED_ORIGINS` | `https://daily-smart-book-ramadhan-b8l5.vercel.app` |

5. Klik **Save**
6. Redeploy: **Deployments** → ⋮ → **Redeploy**

---

## ✅ Verifikasi

Setelah redeploy selesai, buka https://daily-smart-book-ramadhan-b8l5.vercel.app

- Jika tidak ada "Network Error" lagi → **Berhasil** 🎉
- Jika masih error, buka **F12** → Console, screenshot errornya, kirim ke saya.

---

## 🐛 Masih Error? Coba ini dulu

Buka URL berikut di browser:
```
https://daily-smart-book-ramadhan-b8l5.vercel.app/api/health
```

- Jika muncul JSON `{ "status": "ok", ... }` → API berjalan ✅
- Jika error **404** atau **503** → ada masalah konfigurasi Vercel
- Jika timeout → ada masalah database

Kirim screenshot hasilnya ke saya jika masih error.