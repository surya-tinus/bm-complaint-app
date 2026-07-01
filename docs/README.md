# BM Complaint App — Dokumentasi

Aplikasi mobile cross-platform untuk sistem pelaporan dan penanganan masalah fasilitas gedung kampus UMN. Dibangun dengan React Native (Expo) untuk menggantikan alur komunikasi manual via WhatsApp antara civitas akademika dan tim Building Management.

---

## Daftar Dokumen

| File | Isi |
|------|-----|
| [01-setup.md](./01-setup.md) | Prerequisites dan first-time setup dari nol |
| [02-development.md](./02-development.md) | Daily dev workflow — IP sync, mock toggle, expo start |
| [03-project-structure.md](./03-project-structure.md) | Arsitektur folder dan penjelasan file-file kunci |
| [04-api-contracts.md](./04-api-contracts.md) | Endpoint list, auth flow, status values, dan transisi status |
| [05-known-issues.md](./05-known-issues.md) | Bug yang belum terselesaikan dan workaround-nya |
| [06-deployment.md](./06-deployment.md) | Panduan build APK/IPA dengan EAS Build |

---

## Gambaran Singkat Proyek

**Platform:** iOS & Android (React Native + Expo SDK 54, managed workflow)

**Role pengguna:**
- **User** — civitas akademika yang membuat laporan fasilitas
- **Staff** — teknisi lapangan yang menerima dan menangani tiket
- **Admin** — mengelola dan menugaskan tiket via web dashboard terpisah (tidak termasuk dalam aplikasi ini)

**Tim pengembang:**
- Frontend Mobile: [nama frontend dev]
- Backend API: [nama backend dev] — Node.js / Express / PostgreSQL / Docker
- Admin Web Dashboard: dikerjakan oleh pihak terpisah

**Backend repository:** [link repo backend]  
**Frontend repository:** [link repo frontend]  
**Figma prototype:** [link figma]

---

## Quick Start (TL;DR)

Untuk yang sudah familiar dan hanya butuh reminder urutan perintah:

```bash
# 1. Clone & install
git clone <repo-url>
cd complaint-bm-app
npx expo install

# 2. Setup environment
cp .env.example .env
# Edit .env — isi EXPO_PUBLIC_API_URL dengan IP backend

# Atau gunakan command otomatis (Windows, pastikan backend sudah running):
npm run sync-ip

# 3. Jalankan backend (di folder backend)
docker compose up

# 4. Jalankan frontend
npx expo start -c
```

Detail lengkap ada di [01-setup.md](./01-setup.md).
