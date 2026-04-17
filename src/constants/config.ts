// ============================================================
// CONFIG
// Untuk swap dari mock ke real API, cukup ubah .env:
//   EXPO_PUBLIC_USE_MOCK=false
// ============================================================

export const config = {
  USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK !== 'false',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
}
