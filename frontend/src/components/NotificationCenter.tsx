'use client'

import React, { useState, useMemo } from 'react'
import {
  Bell, Trash2, CheckCheck, Wifi, WifiOff, RefreshCw, Filter, Search,
} from 'lucide-react'
import { useNotifications, type NotificationCategory } from '@/hooks/useNotifications'
import { useWebSocket } from '@/hooks/useWebSocket'
import { NoNotifications } from './empty/NoNotifications'
import NotificationItem from './NotificationItem'

type ReadFilter = 'all' | 'unread' | 'read'

const CATEGORIES: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'contributions', label: 'Contributions' },
  { value: 'payouts', label: 'Payouts' },
  { value: 'members', label: 'Members' },
  { value: 'groups', label: 'Groups' },
  { value: 'system', label: 'System' },
]

export default function NotificationCenter() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
    addNotification,
    requestBrowserPermission,
  } = useNotifications()

  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [search, setSearch] = useState('')
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) return Notification.permission
    return 'default'
  })

  const { status: wsStatus, isConnected, markRead } = useWebSocket({
    onNotification: (payload) => addNotification(payload),
  })

  const handleRequestPermission = async () => {
    const result = await requestBrowserPermission()
    setPermissionStatus(result)
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
    markRead(id)
  }

  const filtered = useMemo(() => {
    let list = notifications

    if (activeCategory !== 'all') {
      list = list.filter((n) => n.category === activeCategory)
    }
    if (readFilter === 'unread') list = list.filter((n) => !n.read)
    if (readFilter === 'read') list = list.filter((n) => n.read)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      )
    }

    return list
  }, [notifications, activeCategory, readFilter, search])

  const unreadCount = getUnreadCount()

  const categoryUnread = (cat: NotificationCategory | 'all') =>
    cat === 'all'
      ? unreadCount
      : notifications.filter((n) => n.category === cat && !n.read).length

  const wsLabel: Record<typeof wsStatus, string> = {
    connected: 'Live',
    connecting: 'Connecting…',
    disconnected: 'Offline',
    error: 'Error',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Stay updated with your savings groups
            </p>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : wsStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3 h-3" />
            ) : wsStatus === 'connecting' ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {wsLabel[wsStatus]}
          </div>
        </div>

        {/* ── Browser permission banner ── */}
        {permissionStatus === 'default' && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Bell className="w-4 h-4 shrink-0" />
              Enable browser notifications to get alerts in the background.
            </div>
            <button
              onClick={handleRequestPermission}
              className="ml-4 shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
          </div>
        )}

        {/* ── Category tabs ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
          <div className="flex min-w-max">
            {CATEGORIES.map(({ value, label }) => {
              const count = categoryUnread(value)
              const active = activeCategory === value
              return (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                      active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Filters + search + actions ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search notifications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Read filter */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['all', 'unread', 'read'] as ReadFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setReadFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    readFilter === f
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2 ml-auto">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            {readFilter !== 'all' || activeCategory !== 'all' || search ? ' (filtered)' : ''}
          </p>
        </div>

        {/* ── Notification list ── */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          role="list"
          aria-label="Notifications"
        >
          {filtered.length === 0 ? (
            <NoNotifications />
          ) : (
            filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
