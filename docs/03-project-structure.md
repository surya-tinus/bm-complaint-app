# 03 — Struktur Proyek

Penjelasan arsitektur folder dan file-file kunci yang perlu dipahami sebelum mengembangkan atau melakukan maintenance.

---

## Struktur Direktori

```
complaint-bm-app/
├── app/                                  ← Expo Router — layar & navigasi
│   ├── (auth)/
│   │   └── login.tsx                     ← Halaman login
│   ├── (dashboard)/
│   │   ├── index.tsx                     ← Dashboard User / Home Staff
│   │   ├── [id].tsx                      ← Ticket Detail + action bar
│   │   ├── create.tsx                    ← Create Ticket (multi-step form)
│   │   ├── history.tsx                   ← History tiket Staff (read-only)
│   │   └── notifications.tsx             ← Halaman notifikasi
│   ├── _layout.tsx                       ← Root layout: font loading, auth gate, redirect by role
│   └── index.tsx                         ← Entry point / splash redirect
│
└── src/
    ├── components/
    │   └── ui/                           ← Atom components (building blocks)
    │       ├── InlineError.tsx           ← Error state dengan tombol retry
    │       ├── SearchBar.tsx
    │       ├── Skeleton.tsx              ← Loading placeholder
    │       ├── StatusBadge.tsx           ← Badge status berwarna semantik
    │       ├── ThumbsReview.tsx          ← Komponen rating/review
    │       ├── TicketTypeIcon.tsx        ← Ikon per tipe/kategori tiket
    │       └── Toast.tsx                 ← Non-blocking notification (~3 detik)
    │
    ├── features/
    │   ├── auth/
    │   │   └── hooks/
    │   │       └── useLogin.ts
    │   ├── dashboard/
    │   │   ├── components/
    │   │   │   ├── BuildingFilterChips.tsx  ← Filter chip berdasarkan gedung (Staff)
    │   │   │   ├── FilterChips.tsx          ← Filter chip berdasarkan status (User)
    │   │   │   ├── LocationPickerSheet.tsx  ← Picker lokasi (tanpa library eksternal)
    │   │   │   ├── ScheduleSheet.tsx        ← Sheet untuk tiket tipe Request (Scheduled)
    │   │   │   └── TicketCard.tsx           ← Card tiket multi-varian (user/staff/history)
    │   │   ├── hooks/
    │   │   │   ├── useCreateTicket.ts       ← Logic submit form create ticket
    │   │   │   ├── useCreateTicketData.ts   ← Fetch data lookup (kategori, gedung)
    │   │   │   ├── useDashboard.ts          ← Filter & search logic dashboard
    │   │   │   ├── useNotifications.ts      ← Logic halaman notifikasi
    │   │   │   └── useTicketDetail.ts       ← Logic detail tiket + permission per role
    │   │   └── types.ts
    │   └── notifications/                  ← Fitur notifikasi (folder terpisah)
    │
    ├── hooks/
    │   └── useToast.ts                   ← Hook untuk trigger Toast dari mana saja
    │
    ├── mocks/                            ← Data dummy (aktif saat USE_MOCK=true)
    │   ├── auth.mock.ts
    │   ├── createTicket.mock.ts
    │   ├── dashboard.mock.ts
    │   ├── notification.mock.ts
    │   └── ticketDetail.mock.ts
    │
    ├── services/                         ← Semua pemanggilan API
    │   ├── api.ts                        ← Axios instance + single interceptor
    │   ├── auth.service.ts               ← login(), getUserMe()
    │   ├── dashboard.service.ts          ← Fetch data dashboard (summary, tiket list)
    │   ├── lookup.service.ts             ← Kategori, issue type, daftar gedung
    │   ├── notification.service.ts       ← Fetch & aksi notifikasi
    │   └── ticket.service.ts             ← Semua operasi tiket (claim, hold, resolve, dll.)
    │
    ├── store/
    │   ├── auth.store.ts                 ← Zustand: token, user info, role, dept, sessionExpired
    │   └── notification.store.ts         ← Zustand: state notifikasi
    │
    ├── types/
    │   ├── api.types.ts                  ← TypeScript interfaces lintas fitur
    │   └── notification.types.ts
    │
    ├── utils/
    │   ├── imageCache.ts                 ← Caching untuk gambar lampiran
    │   ├── normalizeStatus.ts            ← Mapping nilai status API → label + warna
    │   └── resolveCategoryKey.ts         ← Mapping kategori API → key yang konsisten
    │
    └── constants/                        ← Design tokens + konfigurasi
        ├── categoryTypeMap.ts            ← Mapping kategori → tipe tiket
        ├── colors.ts                     ← Semua token warna
        ├── config.ts                     ← Base URL, USE_MOCK flag
        ├── icons.ts                      ← Mapping ikon per kategori/tipe
        ├── index.ts                      ← Barrel export
        ├── radius.ts                     ← Border radius per konteks
        ├── spacing.ts                    ← Skala spacing (xs–2xl)
        └── typography.ts                 ← Font size & weight
```

---

## File-File Kunci yang Perlu Diketahui

### `app/_layout.tsx`
Entry point seluruh aplikasi. Mengurus:
- Loading font Rubik (via `useFonts` + `SplashScreen.preventAutoHideAsync()`)
- Auth gate — redirect ke login jika belum ada token
- Role-based redirect — User ke Dashboard, Staff ke Home, setelah login

**Jika ada masalah font atau redirect saat startup, cek file ini pertama.**

### `src/services/api.ts`
Axios instance dengan **satu interceptor tunggal**. Interceptor ini secara otomatis menyertakan:
- Header `Authorization: Bearer <token>` untuk semua request
- Header `x-internal-token` untuk flow deep link

**Penting:** Jangan tambahkan interceptor kedua. Dua interceptor yang berjalan bersamaan pernah menyebabkan objek error kehilangan properti `.response`, sehingga error handling tidak berfungsi.

### `src/utils/normalizeStatus.ts`
Mengubah nilai status dari API (yang terkadang tidak konsisten dalam casing) menjadi label dan warna yang seragam di seluruh aplikasi.

**Setiap kali ada status baru dari backend, tambahkan mapping di sini.** Jika tidak ada, status badge akan fallback ke tampilan yang salah tanpa error eksplisit.

### `src/utils/resolveCategoryKey.ts`
Mengonversi nilai `categoryName` dari API menjadi key yang konsisten untuk digunakan di mapping ikon dan warna. Mirip dengan `normalizeStatus`, file ini adalah satu titik yang perlu diupdate jika nama kategori dari backend berubah.

### `src/constants/categoryTypeMap.ts`
Mapping statis dari kategori tiket ke tipe tiketnya. Digunakan sebagai workaround ketika API tidak mengembalikan field `type` secara langsung. Jika backend sudah menyertakan `type` di semua response tiket, file ini bisa dihapus secara bertahap.

### `src/constants/icons.ts`
Mapping dari kategori/tipe tiket ke komponen ikon yang ditampilkan. Jika ada kategori baru dari backend, tambahkan mapping-nya di sini agar ikon yang tepat muncul di `TicketTypeIcon` dan `TicketCard`.

### `src/store/auth.store.ts`
Zustand store untuk global auth state. Menyimpan: token, user info, role, department, dan flag `sessionExpired`.

**Saat logout, pastikan `queryClient.clear()` dipanggil** untuk membersihkan cache React Query sebelum token dihapus — mencegah data akun lama muncul di akun berikutnya.

### `src/constants/config.ts`
Konfigurasi environment. Membaca nilai dari `.env`:
```typescript
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true'; // perhatikan: === 'true'
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## Alur Navigasi

### Role User
```
Login → Dashboard (index.tsx)
             ├── Ticket Detail ([id].tsx)
             │        └── (tombol Cancel jika status Open)
             ├── Create Ticket (create.tsx)
             │        └── (redirect ke Dashboard setelah submit)
             └── Notifications (notifications.tsx)
```

### Role Staff
```
Login → Home (index.tsx)
           ├── Ticket Detail ([id].tsx)
           │        └── Update Status (modal overlay)
           ├── History (history.tsx) — read-only
           └── Notifications (notifications.tsx)
```

Expo Router mendeteksi route secara otomatis dari nama file di folder `app/`. Tidak ada konfigurasi manual yang diperlukan untuk menambah halaman baru — cukup buat file baru di folder yang sesuai.

---

## Design Tokens

Semua nilai visual (warna, spacing, font, radius) diambil dari `src/constants/`. **Jangan hardcode nilai visual langsung di komponen.** Selalu import dari constants:

```typescript
import { colors, spacing, typography, radius } from '@/constants';

// Contoh penggunaan
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.card,
  }
});
```

Ini memastikan konsistensi visual di seluruh aplikasi dan memudahkan perubahan tema ke depannya.
