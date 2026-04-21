// app/(dashboard)/notifications.tsx
import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { AppNotification, NotificationTrigger } from '@/types/notification.types'

// ─── Config per trigger ────────────────────────────────────

const TRIGGER_CONFIG: Record<NotificationTrigger, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  ticket_assigned:    { icon: 'person-add-outline',       color: '#1A56C4', bg: '#EFF6FF' },
  ticket_in_progress: { icon: 'construct-outline',         color: '#F59E0B', bg: '#FEF3C7' },
  ticket_resolved:    { icon: 'checkmark-circle-outline',  color: '#10B981', bg: '#D1FAE5' },
  ticket_on_hold:     { icon: 'pause-circle-outline',      color: '#6B7280', bg: '#F3F4F6' },
  ticket_rejected:    { icon: 'close-circle-outline',      color: '#EF4444', bg: '#FEE2E2' },
  ticket_cancelled:   { icon: 'ban-outline',               color: '#EF4444', bg: '#FEE2E2' },
  staff_notes_added:  { icon: 'chatbubble-ellipses-outline', color: '#8B5CF6', bg: '#EDE9FE' },
}

// ─── Time formatter ────────────────────────────────────────

const formatTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

// ─── Screen ────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const handleNotifPress = (notif: AppNotification) => {
    markAsRead(notif.id)
    router.push(`/(dashboard)/${notif.ticketId}`)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A56C4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <NotificationItem notif={item} onPress={handleNotifPress} />
        )}
      />
    </SafeAreaView>
  )
}

// ─── Notification Item ─────────────────────────────────────

function NotificationItem({
  notif,
  onPress,
}: {
  notif: AppNotification
  onPress: (n: AppNotification) => void
}) {
  const config = TRIGGER_CONFIG[notif.trigger]

  return (
    <TouchableOpacity
      style={[styles.notifItem, !notif.isRead && styles.notifItemUnread]}
      onPress={() => onPress(notif)}
      activeOpacity={0.85}
    >
      {/* Icon */}
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}>
          {notif.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
        <View style={styles.notifMeta}>
          <Ionicons name="time-outline" size={11} color="#9CA3AF" />
          <Text style={styles.notifTime}>{formatTime(notif.createdAt)}</Text>
          <Text style={styles.notifTicketId}>• {notif.ticketId}</Text>
        </View>
      </View>

      {/* Unread dot */}
      {!notif.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )
}

// ─── Empty State ───────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={52} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
      <Text style={styles.emptySubtitle}>
        Kamu akan menerima notifikasi saat status tiket berubah.
      </Text>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A56C4' },

  header: {
    backgroundColor: '#1A56C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  markAllText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  list: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { paddingVertical: 8 },
  emptyContainer: { flex: 1 },

  separator: { height: 1, backgroundColor: '#F3F4F6' },

  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  notifItemUnread: { backgroundColor: '#F0F7FF' },

  notifIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 3 },
  notifTitleUnread: { color: '#111827', fontWeight: '700' },
  notifBody: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 6 },
  notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifTime: { fontSize: 11, color: '#9CA3AF' },
  notifTicketId: { fontSize: 11, color: '#9CA3AF' },

  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1A56C4',
    marginTop: 4, flexShrink: 0,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: 13, color: '#9CA3AF',
    textAlign: 'center', lineHeight: 20,
  },
})
