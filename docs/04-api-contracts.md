# 04 — API Contracts

Dokumentasi ini mencakup auth flow, nilai status tiket, transisi yang diizinkan, dan endpoint utama yang digunakan frontend. Untuk dokumentasi backend yang lebih lengkap, refer ke repository backend.

---

## Auth Flow

### Login Standar

```
POST /api/auth/login
Body: { emplid, password }

Response: { token: "..." }
```

Setelah login berhasil, frontend langsung memanggil:

```
GET /api/users/me
Headers: Authorization: Bearer <token>

Response: { id, name, emplid, role, dept, ... }
```

Data dari `/users/me` digunakan untuk mendeteksi role (User/Staff) dan department, yang menentukan tampilan halaman mana yang ditampilkan setelah login.

> **Mengapa tidak dari JWT?** Sebelumnya role dideteksi dari prefix `emplid` di JWT payload. Pendekatan ini diganti karena terlalu bergantung pada konvensi format `emplid` yang bisa berubah. Fetch `/users/me` lebih robust.

### Internal Token (Deep Link)

Untuk staf eksternal (keamanan, kebersihan) yang mengakses tiket via link WhatsApp:

```
URL: <app-url>/dashboard/<ticket-id>?t=<internal-token>
Header yang dikirim: x-internal-token: <token>
```

Token dikirim sebagai header tambahan melalui Axios interceptor (bukan sebagai Bearer token). Jika sesi berakhir, flag `sessionExpired` di auth store akan aktif dan layar error ditampilkan di `[id].tsx`.

---

## Nilai Status Tiket

Status yang digunakan backend menggunakan **Title Case dengan spasi**. Ini penting untuk mapping di `normalizeStatus.ts`.

| Nilai dari API | Label Tampilan | Warna Badge |
|---------------|----------------|-------------|
| `Pending` | Pending | Gray |
| `Open` / `Approved` | Open / Approved | Indigo |
| `In Progress` | In Progress | Biru (brand) |
| `On Hold` | On Hold | Amber |
| `Resolved` | Resolved | Hijau |
| `Unresolved` | Unresolved | Merah/oranye |
| `Cancelled` | Cancelled | Merah |
| `Rejected` | Rejected | Merah |

> **Catatan:** Ada rencana rename `Approved` → `Open` di frontend yang belum diimplementasikan. Saat ini keduanya masih ada di codebase. Lihat [05-known-issues.md](./05-known-issues.md).

---

## Transisi Status yang Diizinkan

```
Pending ──► Open/Approved   (via Admin: assign ke staff)
Open    ──► Cancelled       (via User: hanya saat status Open)
Open    ──► In Progress     (via Staff: claim/accept tiket)
In Progress ──► On Hold     (via Staff: jeda penanganan)
In Progress ──► Resolved    (via Staff: wajib sertakan work report)
In Progress ──► Unresolved  (via Staff: wajib sertakan alasan)
On Hold ──► In Progress     (via Staff: lanjutkan penanganan)
On Hold ──► Resolved        (via Staff: bisa resolve langsung dari On Hold)
```

Frontend tidak menampilkan aksi yang tidak sesuai dengan status tiket saat ini. Validasi ini ada di kedua sisi (frontend dan backend).

---

## Endpoint Utama (Frontend)

Semua endpoint dipanggil melalui fungsi di `src/services/ticket.service.ts` dan `src/services/lookup.service.ts`. Berikut ringkasan endpoint yang digunakan:

### Tiket

| Method | Endpoint | Fungsi | Dipanggil oleh |
|--------|----------|--------|----------------|
| `GET` | `/api/tickets` | Ambil daftar tiket (User: milik sendiri; Staff: yang di-assign) | Dashboard, Home Staff |
| `GET` | `/api/tickets/:id` | Detail satu tiket | Ticket Detail |
| `POST` | `/api/tickets` | Buat tiket baru | Create Ticket |
| `PATCH` | `/api/tickets/:id/cancel` | Batalkan tiket | Ticket Detail (User) |
| `PATCH` | `/api/tickets/:id/claim` | Staff klaim tiket | Home Staff, Ticket Detail |
| `PATCH` | `/api/tickets/:id/reject` | Staff tolak tiket (unassign) | Home Staff |
| `PATCH` | `/api/tickets/:id/hold` | Staff jeda tiket | Update Status |
| `PATCH` | `/api/tickets/:id/continue` | Staff lanjutkan dari On Hold | Update Status |
| `PATCH` | `/api/tickets/:id/resolve` | Staff selesaikan tiket | Update Status |
| `POST` | `/api/tickets/:id/comment` | Tambah catatan ke timeline | Ticket Detail (Staff) |

### Lookup (data referensi)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `/api/categories` | Daftar kategori tiket |
| `GET` | `/api/issue-types` | Daftar jenis masalah (dinamis per kategori) |
| `GET` | `/api/places` | Daftar gedung dan ruangan |

### Auth & User

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/users/me` | Data user yang sedang login |

---

## Penanganan Error

Error dari backend diakses melalui:

```typescript
error?.response?.data?.message
```

Pastikan Axios interceptor tidak mengubah struktur objek error. Jika `error.response` bernilai `undefined` padahal request gagal, kemungkinan ada dua interceptor yang berjalan bersamaan (lihat [05-known-issues.md](./05-known-issues.md)).

---

## Catatan Endpoint yang Belum Final

| Endpoint | Status | Keterangan |
|----------|--------|------------|
| `PATCH /api/tickets/:id/unassign` | Belum diimplementasikan | Rencana endpoint untuk Staff menolak tiket dan mengembalikannya ke admin tanpa mengubah status menjadi `rejected`. Saat ini penolakan oleh Staff menggunakan endpoint sementara. |
| Push notification webhook | Belum production | Backend belum mendukung. Frontend sudah memiliki swap point di `expo-notifications`. |
