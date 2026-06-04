// ============================================================
// CONFIG
// Untuk swap dari mock ke real API, cukup ubah .env:
//   EXPO_PUBLIC_USE_MOCK=false
// ============================================================

export const config = {
  USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
}

// src/constants/config.ts
export const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsaWQiOiJVU1ItU1RELTAwMSIs...' // STD_001