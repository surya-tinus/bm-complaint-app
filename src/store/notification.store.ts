// src/store/notification.store.ts
import { create } from 'zustand'
import { AppNotification } from '@/types/notification.types'
import { MOCK_NOTIFICATIONS } from '@/mocks/notification.mock'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number

  // Actions
  addNotification: (notif: AppNotification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,

  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.isRead ? 0 : 1),
    }))
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
