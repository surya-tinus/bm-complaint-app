// src/features/notifications/hooks/useNotifications.ts
import { useEffect, useRef } from 'react'
import * as ExpoNotifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useNotificationStore } from '@/store/notification.store'
import {
  registerForPushNotifications,
  notifyTicketUpdate,
} from '@/services/notification.service'
import { PushNotificationPayload } from '@/types/notification.types'

export const useNotificationSetup = () => {
  const responseListenerRef = useRef<ExpoNotifications.EventSubscription | null>(null)
  const receivedListenerRef = useRef<ExpoNotifications.EventSubscription | null>(null)
  const router = useRouter()
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    // Register push token (kirim ke backend nanti)
    registerForPushNotifications()

    // Listener: notifikasi masuk saat app di foreground
    // Aktifkan ini kalau backend sudah siap kirim push
    // receivedListenerRef.current = ExpoNotifications.addNotificationReceivedListener((notif) => {
    //   const payload = notif.request.content.data as PushNotificationPayload
    //   addNotification({
    //     id: `notif-${Date.now()}`,
    //     ticketId: payload.ticketId,
    //     trigger: payload.trigger,
    //     title: notif.request.content.title ?? '',
    //     body: notif.request.content.body ?? '',
    //     isRead: false,
    //     createdAt: new Date().toISOString(),
    //   })
    // })

    // Listener: user tap notifikasi → navigate ke ticket detail
    responseListenerRef.current = ExpoNotifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as { ticketId?: string }
        if (data?.ticketId) {
          router.push(`/(dashboard)/${data.ticketId}`)
        }
      }
    )

    return () => {
      receivedListenerRef.current?.remove()
      responseListenerRef.current?.remove()
    }
  }, [])
}

// Hook untuk komponen yang butuh data notifikasi
export const useNotifications = () => {
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const clearAll = useNotificationStore((s) => s.clearAll)

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
}

// Dev helper: simulasi notifikasi masuk tanpa backend
export const useTestNotification = () => {
  const testNotification = async (ticketId = 'TKT-0001-1113') => {
    await notifyTicketUpdate(ticketId, 'ticket_in_progress')
  }
  return { testNotification }
}
