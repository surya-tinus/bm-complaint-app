# 05 — Known Issues & Workarounds

Daftar bug dan hal yang belum terselesaikan per akhir periode magang. Dokumen ini penting untuk developer berikutnya agar tidak membuang waktu mendiagnosis masalah yang sudah diketahui.

---

## Issues yang Belum Diselesaikan

### 1. Konflik Action Bar di Ticket Detail (Staff) — `[id].tsx`

**Severity:** Medium — mempengaruhi UX tapi tidak crash

**Deskripsi:**
Staff yang sudah di-assign ke tiket memiliki `canComment: true`. Kondisi ini secara tidak sengaja menimpa (override) logika kemunculan tombol aksi status (Hold, Continue, Resolve) di bagian bawah layar `[id].tsx`. Akibatnya, tombol-tombol tersebut kadang tidak muncul.

**Root cause:**
Logika kondisional di `[id].tsx` untuk menampilkan tombol aksi menggunakan struktur `if/else` yang tidak memisahkan kondisi `canComment`, `canCancel`, `canApprove`, dan aksi status staff dengan bersih. Ketika `canComment: true`, blok lain tidak dievaluasi.

**Workaround sementara:** Belum ada. Perlu refactor bottom action bar di `[id].tsx`.

**Langkah fix yang disarankan:**
Pisahkan rendering tombol menjadi beberapa section independen alih-alih satu blok kondisional besar:
```typescript
// Daripada if/else bertingkat:
{canComment && <AddNoteButton />}
{isStaffAssigned && ticketStatus === 'In Progress' && (
  <>
    <HoldButton />
    <ResolveButton />
  </>
)}
{isStaffAssigned && ticketStatus === 'On Hold' && (
  <>
    <ContinueButton />
    <ResolveButton />
  </>
)}
```

---

### 2. Rename Status `Approved` → `Open` Belum Diterapkan

**Severity:** Low — visual inconsistency

**Deskripsi:**
Ada rencana untuk mengganti label `Approved` menjadi `Open` di seluruh frontend agar lebih sesuai dengan terminologi yang digunakan stakeholder. Perubahan ini belum diimplementasikan karena ada konflik pada color token:
- `colors.status.open` saat ini mapping ke neutral/gray
- `colors.status.approved` mapping ke indigo

Jika rename dilakukan tanpa menyelesaikan konflik ini, warna badge akan berubah dari indigo ke gray — yang secara visual salah.

**Langkah fix:**
1. Update `colors.ts` — ubah `colors.status.open` ke warna indigo (sesuai `approved`)
2. Update `normalizeStatus.ts` — tambahkan/update mapping untuk `'Open'`
3. Update semua label string yang menampilkan `'Approved'` ke `'Open'`
4. Hapus `colors.status.approved` jika sudah tidak digunakan

---

### 3. Endpoint `unassign` Belum Diimplementasikan

**Severity:** Medium — flow penolakan tiket oleh Staff belum final

**Deskripsi:**
Ketika Staff menolak tiket, idealnya tiket dikembalikan ke status `pending` agar Admin bisa reassign ke Staff lain. Endpoint `PATCH /api/tickets/:id/unassign` yang dibutuhkan untuk ini belum diimplementasikan di backend.

Saat ini, alur penolakan menggunakan mekanisme sementara. Perlu koordinasi dengan tim backend untuk finalisasi endpoint ini.

---

### 4. Deep Link Integration Belum Diverifikasi di Production

**Severity:** Medium — fitur internal token belum bisa digunakan end-to-end

**Deskripsi:**
Mekanisme `?t=` query param untuk internal token sudah diimplementasikan di frontend dan backend, namun integrasi dengan deep linking via WhatsApp belum diverifikasi karena memerlukan diskusi lebih lanjut dengan IT UMN terkait konfigurasi URL scheme dan App Links/Universal Links.

---

### 5. Push Notification Belum Production-Ready

**Severity:** Low — fitur opsional

**Deskripsi:**
`expo-notifications` sudah diintegrasikan di frontend (swap point sudah siap), namun backend belum mengirimkan push notification. Notifikasi yang ada saat ini bersifat lokal (triggered dari frontend sendiri).

**Yang perlu dilakukan:**
- Backend perlu mengintegrasikan Firebase Cloud Messaging (FCM) atau layanan serupa
- Frontend perlu mengirimkan Expo Push Token ke backend saat login
- Backend menyimpan token dan mengirim notifikasi saat status tiket berubah

---

## Issues yang Sudah Diselesaikan (Referensi)

Dicatat di sini agar tidak diimplementasikan ulang dengan cara yang salah.

| Issue | Solusi yang Diterapkan |
|-------|----------------------|
| Font tidak terdaftar / fallback ke system font | `useFonts` + `SplashScreen.preventAutoHideAsync()` di `_layout.tsx`. Guard `if (!loaded) return null` untuk blokir render sebelum font siap. |
| Dua Axios interceptor — `error.response` hilang | Konsolidasi ke satu interceptor tunggal di `api.ts`. |
| `USE_MOCK` selalu `true` meski di-set `false` | Bug kondisi `!== 'false'` diperbaiki ke `=== 'true'` di `config.ts`. |
| Role detection dari prefix `emplid` tidak reliable | Diganti dengan fetch `GET /api/users/me` setelah login. |
| Status `Approved` tidak muncul di badge | Ditambahkan mapping di `normalizeStatus.ts`. |
| Data akun lama muncul setelah login akun baru | `queryClient.clear()` dipanggil saat logout. `userId` disertakan dalam query key. |
| Docker volume cache — migrasi tidak jalan | Gunakan `docker compose down -v && docker compose up --build`. |
