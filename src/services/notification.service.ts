// src/services/notification.service.ts
import * as ExpoNotifications from 'expo-notifications'
import { Platform } from 'react-native'
import { NotificationTrigger, AppNotification, PushNotificationPayload } from '@/types/notification.types'
import { useNotificationStore } from '@/store/notification.store'

// ─── Config ────────────────────────────────────────────────

// Cara notifikasi ditampilkan saat app di foreground
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// ─── Permission ────────────────────────────────────────────

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync()

  if (existingStatus === 'granted') return true

  const { status } = await ExpoNotifications.requestPermissionsAsync()
  return status === 'granted'
}

// ─── Expo Push Token ───────────────────────────────────────
// TODO: Kirim token ini ke backend saat user login
// Backend akan pakai token ini untuk kirim push notification

export const registerForPushNotifications = async (): Promise<string | null> => {
  const granted = await requestNotificationPermission()
  if (!granted) return null

  if (Platform.OS === 'android') {
    await ExpoNotifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A56C4',
    })
  }

  try {
    const token = await ExpoNotifications.getExpoPushTokenAsync()
    console.log('[Push Token]', token.data)
    return token.data
  } catch (e) {
    console.warn('[Push Token] Gagal mendapatkan token:', e)
    return null
  }
}

// ─── Local Notification (untuk development / mock) ─────────
// Ini yang dipakai sekarang. Nanti saat backend siap,
// backend yang trigger — frontend tinggal listen via listener.

export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  await ExpoNotifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: null, // null = tampilkan sekarang
  })
}

// ─── Trigger helpers ───────────────────────────────────────
// Panggil fungsi ini saat status ticket berubah (dari polling/websocket nanti)

const TRIGGER_MESSAGES: Record<NotificationTrigger, (ticketId: string) => { title: string; body: string }> = {
  ticket_assigned: (id) => ({
    title: 'Staff Ditugaskan 👷',
    body: `Staff telah ditugaskan untuk menangani tiket #${id}.`,
  }),
  ticket_in_progress: (id) => ({
    title: 'Tiket Sedang Diproses 🔧',
    body: `Tiket #${id} sedang ditangani oleh teknisi.`,
  }),
  ticket_resolved: (id) => ({
    title: 'Tiket Selesai ✅',
    body: `Tiket #${id} telah diselesaikan.`,
  }),
  ticket_on_hold: (id) => ({
    title: 'Tiket Ditahan ⏸',
    body: `Tiket #${id} sedang ditahan sementara.`,
  }),
  ticket_rejected: (id) => ({
    title: 'Tiket Ditolak ❌',
    body: `Tiket #${id} telah ditolak oleh admin.`,
  }),
  ticket_cancelled: (id) => ({
    title: 'Tiket Dibatalkan',
    body: `Tiket #${id} telah dibatalkan.`,
  }),
  staff_notes_added: (id) => ({
    title: 'Catatan Staff Baru 📝',
    body: `Staff menambahkan catatan baru pada tiket #${id}.`,
  }),
}

export const notifyTicketUpdate = async (
  ticketId: string,
  trigger: NotificationTrigger
): Promise<void> => {
  const { title, body } = TRIGGER_MESSAGES[trigger](ticketId)

  // 1. Tampilkan local notification (system tray)
  await sendLocalNotification(title, body, { ticketId, trigger })

  // 2. Simpan ke in-app notification store
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    ticketId,
    trigger,
    title,
    body,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  useNotificationStore.getState().addNotification(newNotif)
}

// ─── Swap point: listener untuk push dari backend ──────────
// Saat backend sudah siap kirim push notification,
// listener ini yang akan menerima dan menyimpan ke store.
//
// Setup di _layout.tsx:
//   const sub = ExpoNotifications.addNotificationReceivedListener((notif) => {
//     const payload = notif.request.content.data as PushNotificationPayload
//     useNotificationStore.getState().addNotification({
//       id: `notif-${Date.now()}`,
//       ticketId: payload.ticketId,
//       trigger: payload.trigger,
//       title: notif.request.content.title ?? '',
//       body: notif.request.content.body ?? '',
//       isRead: false,
//       createdAt: new Date().toISOString(),
//     })
//   })
//   return () => sub.remove()
