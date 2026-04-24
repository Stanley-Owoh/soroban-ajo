import { useNotifications } from '@/hooks/useNotifications';

/**
 * Helper hook to generate standardized notification payloads for common group events.
 * Automatically checks user preferences before adding notifications to the store.
 */
export function useNotificationGenerator() {
  const { addNotification, preferences } = useNotifications();

  const generateContributionDueNotification = (groupName: string, hours: number, groupId: string) => {
    if (!preferences.inApp || !preferences.contributionDue24h) return;
    addNotification({
      id: `contrib-due-${groupId}-${Date.now()}`,
      type: 'contribution_due',
      category: 'contributions',
      title: 'Contribution Due Soon',
      message: `Your contribution to "${groupName}" is due in ${hours} hour${hours > 1 ? 's' : ''}`,
      timestamp: Date.now(),
      groupId,
      actionUrl: `/groups/${groupId}`,
    });
  };

  const generateContributionOverdueNotification = (groupName: string, groupId: string) => {
    if (!preferences.inApp || !preferences.contributionOverdue) return;
    addNotification({
      id: `contrib-overdue-${groupId}-${Date.now()}`,
      type: 'contribution_overdue',
      category: 'contributions',
      title: 'Contribution Overdue',
      message: `Your contribution to "${groupName}" is overdue. Please contribute as soon as possible.`,
      timestamp: Date.now(),
      groupId,
      actionUrl: `/groups/${groupId}`,
    });
  };

  const generatePayoutReceivedNotification = (amount: number, groupName: string, groupId: string) => {
    if (!preferences.inApp || !preferences.payoutReceived) return;
    addNotification({
      id: `payout-${groupId}-${Date.now()}`,
      type: 'payout_received',
      category: 'payouts',
      title: 'Payout Received',
      message: `You received ${amount} XLM from "${groupName}"`,
      timestamp: Date.now(),
      groupId,
      actionUrl: `/groups/${groupId}`,
    });
  };

  const generateMemberJoinedNotification = (memberName: string, groupName: string, groupId: string) => {
    if (!preferences.inApp || !preferences.memberJoined) return;
    addNotification({
      id: `member-joined-${groupId}-${Date.now()}`,
      type: 'member_joined',
      category: 'members',
      title: 'New Member Joined',
      message: `${memberName} joined "${groupName}"`,
      timestamp: Date.now(),
      groupId,
      actionUrl: `/groups/${groupId}`,
    });
  };

  const generateCycleCompletedNotification = (groupName: string, groupId: string) => {
    if (!preferences.inApp || !preferences.cycleCompleted) return;
    addNotification({
      id: `cycle-${groupId}-${Date.now()}`,
      type: 'cycle_completed',
      category: 'groups',
      title: 'Cycle Completed',
      message: `"${groupName}" has completed a savings cycle`,
      timestamp: Date.now(),
      groupId,
      actionUrl: `/groups/${groupId}`,
    });
  };

  const generateAnnouncementNotification = (title: string, message: string, groupId?: string) => {
    if (!preferences.inApp || !preferences.announcements) return;
    addNotification({
      id: `announcement-${Date.now()}`,
      type: 'announcement',
      category: groupId ? 'groups' : 'system',
      title,
      message,
      timestamp: Date.now(),
      groupId,
      actionUrl: groupId ? `/groups/${groupId}` : undefined,
    });
  };

  return {
    generateContributionDueNotification,
    generateContributionOverdueNotification,
    generatePayoutReceivedNotification,
    generateMemberJoinedNotification,
    generateCycleCompletedNotification,
    generateAnnouncementNotification,
  };
}
