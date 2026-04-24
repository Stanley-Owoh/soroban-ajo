'use client';

import React from 'react';
import type { Notification, NotificationCategory } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import {
  X, Bell, DollarSign, Users, CheckCircle, Megaphone, AlertCircle,
  TrendingUp, Settings, UserPlus,
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const iconMap: Record<Notification['type'], React.ElementType> = {
  contribution_due: Bell,
  contribution_overdue: AlertCircle,
  contribution_received: DollarSign,
  payout_received: TrendingUp,
  member_joined: UserPlus,
  member_left: Users,
  cycle_completed: CheckCircle,
  group_created: CheckCircle,
  announcement: Megaphone,
  group_invitation: UserPlus,
  invitation_response: Users,
};

const typeColorMap: Record<Notification['type'], string> = {
  contribution_due: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  contribution_overdue: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  contribution_received: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  payout_received: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  member_joined: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  member_left: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cycle_completed: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  group_created: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  announcement: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  group_invitation: 'bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
  invitation_response: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
};

const categoryConfig: Record<NotificationCategory, { label: string; className: string }> = {
  contributions: { label: 'Contributions', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  payouts: { label: 'Payouts', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  members: { label: 'Members', className: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  groups: { label: 'Groups', className: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  system: { label: 'System', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

export default function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = iconMap[notification.type] ?? Bell;
  const cat = notification.category ? categoryConfig[notification.category] : null;

  return (
    <div
      role="listitem"
      className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeColorMap[notification.type]}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Unread dot + title */}
              <div className="flex items-center gap-1.5">
                {!notification.read && (
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" aria-label="Unread" />
                )}
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {notification.title}
                </h4>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                {notification.message}
              </p>

              {/* Meta row: category badge + timeframe */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {cat && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.className}`}>
                    {cat.label}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(notification.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
              aria-label="Delete notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark as read
              </button>
            )}
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View details →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
