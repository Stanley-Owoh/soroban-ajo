import type { Metadata } from 'next';
import NotificationCenter from '@/components/NotificationCenter';

export const metadata: Metadata = {
  title: 'Notifications | Ajo',
  description: 'View and manage your notifications',
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
