# 06 — Deployment

Panduan untuk build dan distribusi aplikasi ke production.

> **Status:** Panduan ini belum diverifikasi secara end-to-end karena build production belum dilakukan selama periode pengembangan. Gunakan sebagai referensi awal dan sesuaikan dengan kebutuhan tim IT UMN.

---

## Pilihan Distribusi

Ada dua pendekatan utama untuk mendistribusikan aplikasi React Native/Expo:

| Pendekatan | Keterangan | Cocok untuk |
|------------|------------|-------------|
| **EAS Build** (disarankan) | Build APK/IPA di cloud, tidak perlu setup Android Studio / Xcode lokal | Tim yang tidak punya environment native setup |
| **Local Build** | Build dilakukan di mesin lokal | Tim dengan environment native lengkap |

Dokumen ini fokus pada **EAS Build** karena lebih mudah untuk setup awal.

---

## EAS Build — Android (APK)

### Prasyarat

1. Akun Expo — daftar di [expo.dev](https://expo.dev)
2. EAS CLI terinstall:
   ```bash
   npm install -g eas-cli
   ```
3. Login ke akun Expo:
   ```bash
   eas login
   ```

### Konfigurasi

Buat atau periksa file `eas.json` di root proyek:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Environment Variables untuk Production

Sebelum build, pastikan environment variable production sudah dikonfigurasi. Untuk EAS Build, variabel tidak dibaca dari `.env` lokal — harus dikonfigurasi melalui EAS secrets atau `eas.json`:

```bash
# Set secret di EAS (lebih aman untuk nilai sensitif)
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-production-api.com/api"
eas secret:create --scope project --name EXPO_PUBLIC_USE_MOCK --value "false"
```

### Menjalankan Build

```bash
# Build APK untuk distribusi internal (preview)
eas build --platform android --profile preview

# Build AAB untuk Google Play Store (production)
eas build --platform android --profile production
```

Setelah build selesai, link download akan tersedia di dashboard EAS ([expo.dev](https://expo.dev)) dan dikirim via email.

---

## EAS Build — iOS (IPA)

Build iOS memerlukan **Apple Developer Account** (berbayar, $99/tahun). Tanpa ini, build iOS tidak bisa dilakukan.

Jika Apple Developer Account sudah tersedia:

```bash
eas build --platform ios --profile preview
```

EAS akan memandu proses setup provisioning profile dan signing certificate secara interaktif.

---

## Persiapan Sebelum Build Production

Checklist yang perlu diverifikasi sebelum build production:

- [ ] `EXPO_PUBLIC_API_URL` sudah mengarah ke server production (bukan IP lokal)
- [ ] `EXPO_PUBLIC_USE_MOCK` sudah di-set `false`
- [ ] `app.json` — periksa `name`, `slug`, `version`, `bundleIdentifier` (iOS), dan `package` (Android)
- [ ] Icon dan splash screen sudah final (file di `assets/`)
- [ ] Tidak ada `console.log` yang mencetak data sensitif (token, password)
- [ ] Semua hardcoded URL / IP lokal sudah dihapus dari kode

---

## Catatan untuk Tim IT UMN

Beberapa hal yang perlu diputuskan sebelum deployment ke production:

1. **Hosting backend:** Backend saat ini hanya berjalan secara lokal via Docker. Perlu dideploy ke server (VPS, cloud, atau server on-premise UMN) agar bisa diakses dari luar jaringan lokal.

2. **Domain / URL backend:** Setelah backend dideploy, URL production perlu dikonfigurasi sebagai `EXPO_PUBLIC_API_URL`.

3. **Distribusi APK:** Putuskan apakah aplikasi akan didistribusikan via:
   - Google Play Store / App Store (butuh developer account)
   - Distribusi internal (APK dikirim langsung / MDM)
   - Expo Go dengan OTA update (hanya untuk development/testing)

4. **Integrasi UNION:** Ada rencana untuk mengintegrasikan aplikasi ini ke ekosistem UNION (UMN Companion). Koordinasi dengan tim IT diperlukan untuk menentukan mekanisme SSO dan integrasi yang tepat.

---

## Update Over-the-Air (OTA) dengan EAS Update

Untuk perubahan yang tidak menyentuh native code (perubahan UI, logic, dll.), bisa menggunakan EAS Update tanpa perlu build ulang:

```bash
# Install EAS Update
npx expo install expo-updates

# Kirim update
eas update --branch production --message "Deskripsi perubahan"
```

Pengguna akan mendapat update otomatis saat membuka aplikasi berikutnya.

> **Catatan:** OTA update hanya bisa digunakan jika aplikasi sudah didistribusikan via build EAS (bukan Expo Go).
