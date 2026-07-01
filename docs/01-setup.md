# 01 — Setup & Prerequisites

Panduan ini ditujukan untuk siapa pun yang baru pertama kali menjalankan proyek ini dari nol.

---

## Prerequisites

Pastikan semua tools berikut sudah terinstall sebelum memulai.

### Wajib

| Tool | Versi | Keterangan |
|------|-------|------------|
| Node.js | >= 18.x | Disarankan via [nvm](https://github.com/nvm-sh/nvm) |
| npm | >= 9.x | Ikut terinstall bersama Node.js |
| Git | latest | Untuk clone repo |
| Expo Go | latest | App di iOS/Android untuk testing — download dari App Store / Play Store |

### Untuk backend (jika menjalankan secara lokal)

| Tool | Versi | Keterangan |
|------|-------|------------|
| Docker Desktop | latest | Untuk menjalankan backend + database |
| Docker Compose | v2+ | Biasanya sudah include dalam Docker Desktop |

### Opsional tapi disarankan

| Tool | Keterangan |
|------|------------|
| VS Code | Editor yang digunakan tim selama pengembangan |

---

## Langkah 1 — Clone Repository

```bash
git clone <frontend-repo-url>
cd complaint-bm-app
```

---

## Langkah 2 — Install Dependencies

**Penting:** Selalu gunakan `npx expo install`, bukan `npm install`. Ini memastikan semua package kompatibel dengan versi Expo SDK yang digunakan (SDK 54).

```bash
npx expo install
```

Jika ada package yang perlu diinstall manual setelahnya (misalnya setelah pull perubahan), tetap gunakan perintah yang sama:

```bash
npx expo install <nama-package>
```

---

## Langkah 3 — Setup Environment Variables

Buat file `.env` di root proyek dengan menyalin dari template:

```bash
cp .env.example .env
```

Kemudian buka `.env` dan isi nilai yang diperlukan:

```env
# URL backend API
# Ganti dengan IP address mesin yang menjalankan backend
# Contoh: http://192.168.1.42:3000/api
EXPO_PUBLIC_API_URL=http://<IP_BACKEND>:<PORT>/api

# Toggle mock data
# Gunakan "true" untuk development offline (tanpa backend)
# Gunakan "false" untuk koneksi ke backend nyata
EXPO_PUBLIC_USE_MOCK=false
```

> **Catatan IP:** Jika backend dijalankan di mesin yang sama dengan frontend (atau di jaringan lokal yang sama), IP-nya adalah IP lokal mesin tersebut — bukan `localhost`. `localhost` di Expo Go mengacu ke perangkat fisik (HP), bukan komputer. Lihat [02-development.md](./02-development.md) untuk cara mendapatkan IP secara otomatis.

---

## Langkah 4 — Jalankan Backend

Backend dijalankan menggunakan Docker Compose. Masuk ke folder backend terlebih dahulu:

```bash
cd <folder-backend>
docker compose up
```

Backend akan berjalan di port yang sudah dikonfigurasi (default: `3000`). Tunggu hingga log menampilkan pesan bahwa server sudah siap.

**Jika perlu reset database dari awal** (misalnya setelah ada perubahan schema):

```bash
docker compose down -v
docker compose up --build
```

> **Peringatan:** `down -v` akan menghapus seluruh data di database. Hanya gunakan ini jika memang diperlukan.

---

## Langkah 5 — Jalankan Frontend

Kembali ke folder frontend, lalu jalankan:

```bash
npx expo start -c
```

Flag `-c` (clear cache) penting digunakan, terutama setelah:
- Mengubah file `.env`
- Menginstall package baru
- Mengalami masalah tampilan yang aneh (kemungkinan cache stale)

Setelah terminal menampilkan QR code, buka **Expo Go** di HP dan scan QR tersebut. Pastikan HP dan komputer berada di **jaringan Wi-Fi yang sama**.

---

## Verifikasi Setup

Jika setup berhasil, kamu akan melihat:

1. Terminal menampilkan QR code tanpa error
2. Expo Go berhasil membuka aplikasi
3. Halaman login muncul
4. Login dengan akun test berhasil masuk ke Dashboard (User) atau Home (Staff)

Untuk kredensial akun test, tanyakan ke tim backend atau cek file seed di repository backend.
