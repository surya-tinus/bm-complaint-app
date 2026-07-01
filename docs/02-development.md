# 02 — Development Workflow

Panduan ini menjelaskan hal-hal yang perlu diperhatikan dalam workflow pengembangan sehari-hari.

---

## Sinkronisasi IP Backend (Penting!)

Saat menggunakan Wi-Fi, IP lokal komputer bisa berubah setiap kali terhubung ulang ke jaringan. Karena Expo Go di HP berkomunikasi dengan backend melalui IP lokal (bukan `localhost`), nilai `EXPO_PUBLIC_API_URL` di `.env` harus selalu mencerminkan IP terkini.

### Cara otomatis (Windows)

Proyek ini memiliki custom script di `package.json` yang mengambil IP dari `ipconfig` secara otomatis dan langsung mengupdate file `.env`:

```bash
npm run sync-ip
```

Jalankan perintah ini **setiap kali** kamu berpindah jaringan atau restart komputer, sebelum menjalankan `expo start`.

> **Catatan:** Script ini hanya berjalan di Windows karena bergantung pada `ipconfig`. Di macOS/Linux, gunakan cara manual di bawah.

### Cara manual (semua OS)

1. Cari IP lokal komputer:
   - **Windows:** buka Command Prompt, ketik `ipconfig`, cari baris `IPv4 Address` di adapter Wi-Fi yang aktif
   - **macOS:** `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Linux:** `ip addr show | grep "inet " | grep -v 127`

2. Update file `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
   ```

3. Restart Expo dengan clear cache:
   ```bash
   npx expo start -c
   ```

---

## Toggle Mock Data

Proyek ini memiliki mekanisme toggle antara data mock (dummy) dan API backend nyata melalui environment variable:

```env
# Gunakan mock data (tanpa perlu backend running)
EXPO_PUBLIC_USE_MOCK=true

# Gunakan backend nyata
EXPO_PUBLIC_USE_MOCK=false
```

Mock data berguna untuk:
- Development UI tanpa perlu backend running
- Testing tampilan edge case (empty state, loading state, dll.)
- Pengembangan saat backend belum selesai diimplementasikan

**Setelah mengubah nilai ini, wajib restart dengan clear cache:**

```bash
npx expo start -c
```

> **Bug yang sudah diperbaiki:** Sebelumnya ada bug di mana kondisi `USE_MOCK` menggunakan `!== 'false'` (yang selalu `true`). Sudah diperbaiki menjadi `=== 'true'`. Jika mock selalu aktif meski sudah di-set `false`, cek kembali kondisi ini di `src/constants/config.ts`.

---

## Perintah yang Sering Digunakan

```bash
# Jalankan dev server (dengan clear cache — SELALU gunakan ini)
npx expo start -c

# Install package baru (SELALU gunakan ini, bukan npm install)
npx expo install <nama-package>

# Sinkronisasi IP backend (Windows)
npm run sync-ip

# Reset backend + database dari awal
cd <folder-backend>
docker compose down -v && docker compose up --build
```

---

## Inspeksi Data API

Selama pengembangan, cara termudah untuk memeriksa struktur data yang dikembalikan API adalah dengan menambahkan log langsung di dalam callback TanStack Query:

```typescript
const { data } = useQuery({
  queryKey: ['tickets'],
  queryFn: async () => {
    const res = await getTickets();
    console.log(JSON.stringify(res, null, 2)); // tambahkan ini sementara
    return res;
  }
});
```

Output akan muncul di terminal tempat `expo start` dijalankan. Ini lebih cepat dari setup Postman/Thunder Client untuk keperluan debugging cepat.

---

## Alur Kerja yang Disarankan Saat Ada Perubahan Backend

Ketika rekan tim backend melakukan perubahan (endpoint baru, perubahan struktur response, perubahan nama field), urutan yang disarankan:

1. Pull perubahan backend terbaru
2. Jika ada perubahan schema database: `docker compose down -v && docker compose up --build`
3. Jika tidak ada perubahan schema: `docker compose up` sudah cukup
4. Log response API untuk verifikasi struktur data terbaru
5. Update mapping di frontend jika ada field yang berubah nama atau struktur
6. Cek `normalizeStatus.ts` jika ada perubahan pada nilai status tiket

---

## Tips: Menghindari Masalah Umum

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Aplikasi masih pakai data lama | Cache Expo belum dibersihkan | `npx expo start -c` |
| Network request gagal semua | IP backend berubah | Jalankan `npm run sync-ip` lalu restart |
| Mock data tidak berubah ke real | `USE_MOCK` masih `true` atau cache | Ubah `.env`, lalu `npx expo start -c` |
| Font tidak muncul / system font | Font belum ready saat render awal | Sudah ditangani di `_layout.tsx` — jika masih terjadi, pastikan `useFonts` dipanggil sebelum render |
| Status badge warna salah | Nilai status tidak ada di `normalizeStatus.ts` | Tambahkan mapping di `src/utils/normalizeStatus.ts` |
| Data akun lama muncul setelah login akun baru | Cache React Query tidak dibersihkan saat logout | Pastikan `queryClient.clear()` dipanggil di fungsi logout |
