# my-app — React Native Boilerplate

Stack: Expo + TypeScript + Expo Router + Zustand + TanStack Query + Axios

---

## Setup

```bash
npm install
npx expo start
```

---

## Struktur Folder

```
my-app/
├── app/                        ← Screens (Expo Router, file-based)
│   ├── _layout.tsx             ← Root layout + QueryClientProvider
│   ├── index.tsx               ← Entry point (redirect ke login/dashboard)
│   ├── (auth)/
│   │   └── login.tsx
│   └── (dashboard)/
│       └── index.tsx
│
├── src/
│   ├── constants/
│   │   └── config.ts           ← USE_MOCK flag + API_BASE_URL
│   │
│   ├── types/
│   │   └── api.types.ts        ← Semua TypeScript interface
│   │
│   ├── mocks/                  ← Dummy data (aktif saat USE_MOCK=true)
│   │   ├── auth.mock.ts
│   │   └── dashboard.mock.ts
│   │
│   ├── services/               ← Semua fungsi call API (swap point)
│   │   ├── api.ts              ← Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── store/
│   │   └── auth.store.ts       ← Zustand store untuk auth state
│   │
│   └── features/               ← Per-feature modules
│       ├── auth/
│       │   └── hooks/
│       │       └── useLogin.ts
│       └── dashboard/
│           └── hooks/
│               └── useDashboard.ts
```

---

## Cara Pakai Mock Data

Saat ini app berjalan dengan dummy data. Untuk swap ke real API:

1. Buka `.env`
2. Ubah `EXPO_PUBLIC_USE_MOCK=true` → `EXPO_PUBLIC_USE_MOCK=false`
3. Pastikan `EXPO_PUBLIC_API_URL` sudah mengarah ke backend

Tidak perlu ubah komponen sama sekali.

---

## Akun Mock (untuk development)

- **Email:** surya@example.com
- **Password:** password123

---

## Menambah Fitur Baru

Contoh: menambah fitur "Users"

1. Tambah types di `src/types/api.types.ts`
2. Tambah dummy data di `src/mocks/users.mock.ts`
3. Buat service di `src/services/users.service.ts`
4. Buat hook di `src/features/users/hooks/useUsers.ts`
5. Buat screen di `app/(dashboard)/users.tsx`

---

## Menambah Fitur ke Existing App (nanti)

Karena struktur sudah modular, opsi integrasi:
- **Navigation-based**: export navigator dari folder `app/` dan mount ke existing app
- **Monorepo**: pindah ke Turborepo, jadikan `packages/shared` untuk share components/types
- **NPM package**: publish `src/features/*` sebagai internal package
