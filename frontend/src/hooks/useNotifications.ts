import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationCategory = 'contributions' | 'payouts' | 'members' | 'groups' | 'system'

/**
 * Raw data required to create a new notification.
 */
export interface NotificationPayload {
  id: string
  type:
    | 'contribution_due'
    | 'contribution_overdue'
    | 'contribution_received'
    | 'payout_received'
    | 'member_joined'
    | 'member_left'
    | 'cycle_completed'
    | 'group_created'
    | 'announcement'
    | 'group_invitation'
    | 'invitation_response'
  category: NotificationCategory
  title: string
  message: string
  timestamp: number
  groupId?: string
  /** URI to redirect the user to when they interact with the notification */
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export interface Notification extends NotificationPayload {
  read: boolean
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  contributionDue24h: boolean
  contributionDue1h: boolean
  contributionOverdue: boolean
  payoutReceived: boolean
  memberJoined: boolean
  cycleCompleted: boolean
  announcements: boolean
}

interface NotificationState {
  notifications: Notification[]
  preferences: NotificationPreferences
  pushSubscription: PushSubscription | null
  addNotification: (notification: NotificationPayload) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  setPushSubscription: (subscription: PushSubscription | null) => void
  getUnreadCount: () => number
  requestBrowserPermission: () => Promise<NotificationPermission>
  showBrowserNotification: (title: string, body: string, tag?: string) => void
}

const defaultPreferences: NotificationPreferences = {
  email: false,
  push: true,
  inApp: true,
  contributionDue24h: true,
  contributionDue1h: true,
  contributionOverdue: true,
  payoutReceived: true,
  memberJoined: true,
  cycleCompleted: true,
  announcements: true,
}

/**
 * Primary state management hook for in-app and browser notifications.
 * Uses Zustand with persistent storage to track unread alerts and user preferences.
 * 
 * Includes methods for:
 * - Adding/Deleting notifications
 * - Marking as read
 * - Managing push service worker subscriptions
 * - Requesting browser notification permissions
 */
const now = Date.now()
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'seed-1',
    type: 'contribution_due',
    category: 'contributions',
    title: 'Contribution Due in 24 Hours',
    message: 'Your 50 XLM contribution to "Lagos Savers Circle" is due tomorrow.',
    timestamp: now - 1000 * 60 * 30,
    groupId: 'group-1',
    actionUrl: '/groups/group-1',
    read: false,
  },
  {
    id: 'seed-2',
    type: 'payout_received',
    category: 'payouts',
    title: 'Payout Received 🎉',
    message: 'You received 500 XLM from "Abuja Wealth Club". Funds are in your wallet.',
    timestamp: now - 1000 * 60 * 60 * 2,
    groupId: 'group-2',
    actionUrl: '/groups/group-2',
    read: false,
  },
  {
    id: 'seed-3',
    type: 'member_joined',
    category: 'members',
    title: 'New Member Joined',
    message: 'Amara Okafor joined "Lagos Savers Circle". The group now has 8 members.',
    timestamp: now - 1000 * 60 * 60 * 5,
    groupId: 'group-1',
    actionUrl: '/groups/group-1',
    read: false,
  },
  {
    id: 'seed-4',
    type: 'contribution_overdue',
    category: 'contributions',
    title: 'Contribution Overdue',
    message: 'Your contribution to "Kano Traders Fund" is 2 days overdue. A penalty may apply.',
    timestamp: now - 1000 * 60 * 60 * 24,
    groupId: 'group-3',
    actionUrl: '/groups/group-3',
    read: true,
  },
  {
    id: 'seed-5',
    type: 'group_invitation',
    category: 'groups',
    title: 'Group Invitation',
    message: 'Chidi Eze invited you to join "Port Harcourt Professionals". 10 members, 100 XLM/cycle.',
    timestamp: now - 1000 * 60 * 60 * 48,
    groupId: 'group-4',
    actionUrl: '/invitations',
    read: false,
  },
  {
    id: 'seed-6',
    type: 'cycle_completed',
    category: 'groups',
    title: 'Cycle Completed',
    message: '"Abuja Wealth Club" has completed cycle 3 of 10. Next payout in 30 days.',
    timestamp: now - 1000 * 60 * 60 * 72,
    groupId: 'group-2',
    actionUrl: '/groups/group-2',
    read: true,
  },
  {
    id: 'seed-7',
    type: 'announcement',
    category: 'system',
    title: 'Platform Update',
    message: 'Ajo v2.1 is live! New features: multi-currency support and improved analytics.',
    timestamp: now - 1000 * 60 * 60 * 96,
    read: true,
  },
  {
    id: 'seed-8',
    type: 'contribution_received',
    category: 'contributions',
    title: 'Contribution Confirmed',
    message: 'Your 50 XLM contribution to "Lagos Savers Circle" for cycle 4 was confirmed on-chain.',
    timestamp: now - 1000 * 60 * 60 * 120,
    groupId: 'group-1',
    actionUrl: '/groups/group-1',
    read: true,
  },
]

export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: SEED_NOTIFICATIONS,
      preferences: defaultPreferences,
      pushSubscription: null,

      addNotification: (payload: NotificationPayload) => {
        const notification: Notification = { ...payload, read: false }

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
        }))

        // Show browser notification if permitted and preference enabled
        const { preferences, showBrowserNotification } = get()
        if (preferences.inApp) {
          showBrowserNotification(payload.title, payload.message, payload.id)
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearAll: () => set({ notifications: [] }),

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }))
      },

      setPushSubscription: (subscription) => set({ pushSubscription: subscription }),

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      requestBrowserPermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return 'denied'
        }
        if (Notification.permission === 'default') {
          return Notification.requestPermission()
        }
        return Notification.permission
      },

      showBrowserNotification: (title, body, tag) => {
        if (
          typeof window === 'undefined' ||
          !('Notification' in window) ||
          Notification.permission !== 'granted' ||
          document.visibilityState === 'visible'
        ) {
          return
        }
        try {
          new Notification(title, {
            body,
            tag,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          })
        } catch {
          // Notification API may be blocked in some contexts
        }
      },
    }),
    {
      name: 'ajo-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
      }),
    }
  )
)
