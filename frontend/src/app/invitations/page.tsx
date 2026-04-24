'use client';

import { useEffect, useMemo, useState } from 'react';
import InviteForm from '@/components/invitations/InviteForm';
import InvitationList from '@/components/invitations/InvitationList';
import { useAuth } from '@/hooks/useAuth';
import {
  type Invitation,
  type InvitationDraft,
  type InvitationStatus,
  useInvitations,
} from '@/hooks/useInvitations';
import { useNotifications } from '@/hooks/useNotifications';

const statCards = [
  {
    key: 'pending',
    label: 'Pending invites',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    key: 'accepted',
    label: 'Accepted',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'declined',
    label: 'Declined',
    accent: 'from-rose-500 to-pink-500',
  },
  {
    key: 'unread',
    label: 'Unread alerts',
    accent: 'from-cyan-500 to-blue-500',
  },
] as const;

const createNotificationMessage = (
  invitation: Invitation,
  status: Extract<InvitationStatus, 'accepted' | 'declined'>
) => {
  if (status === 'accepted') {
    return `${invitation.groupName} invitation accepted.`;
  }

  return `${invitation.groupName} invitation declined.`;
};

export default function InvitationsPage() {
  const { address, isAuthenticated } = useAuth();
  const {
    invitations,
    createInvitation,
    updateInvitationStatus,
    markInvitationRead,
    markAllAsRead,
    revokeInvitation,
    getReceivedInvitations,
    getSentInvitations,
    getStats,
    seedDemoData,
  } = useInvitations();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');

  useEffect(() => {
    seedDemoData();
  }, [seedDemoData]);

  const stats = getStats();
  const receivedInvitations = getReceivedInvitations();
  const sentInvitations = getSentInvitations();

  const visibleInvitations = useMemo(() => {
    if (activeTab === 'received') return receivedInvitations;
    if (activeTab === 'sent') return sentInvitations;
    return invitations;
  }, [activeTab, invitations, receivedInvitations, sentInvitations]);

  const handleSendInvite = (draft: InvitationDraft) => {
    const invitation = createInvitation(draft);

    addNotification({
      id: `notification-${invitation.id}`,
      type: 'group_invitation',
      category: 'groups',
      title: 'Invitation sent',
      message: `Invitation sent to ${draft.recipientName || draft.recipientAddress} for ${draft.groupName}.`,
      timestamp: Date.now(),
      groupId: invitation.groupId,
      actionUrl: '/invitations',
      metadata: { invitationId: invitation.id, direction: invitation.direction },
    });
  };

  const handleRespond = (
    id: string,
    status: Extract<InvitationStatus, 'accepted' | 'declined'>
  ) => {
    updateInvitationStatus(id, status);
    const invitation = invitations.find((item) => item.id === id);

    if (!invitation) {
      return;
    }

    addNotification({
      id: `notification-${id}-${status}`,
      type: 'invitation_response',
      category: 'members',
      title: status === 'accepted' ? 'Invitation accepted' : 'Invitation declined',
      message: createNotificationMessage(invitation, status),
      timestamp: Date.now(),
      groupId: invitation.groupId,
      actionUrl: '/invitations',
      metadata: { invitationId: id, status },
    });
  };

  const handleRevoke = (id: string) => {
    revokeInvitation(id);
    const invitation = invitations.find((item) => item.id === id);

    if (!invitation) {
      return;
    }

    addNotification({
      id: `notification-${id}-revoked`,
      type: 'group_invitation',
      category: 'groups',
      title: 'Invitation revoked',
      message: `Invitation for ${invitation.groupName} was revoked before the recipient responded.`,
      timestamp: Date.now(),
      groupId: invitation.groupId,
      actionUrl: '/invitations',
      metadata: { invitationId: id, status: 'revoked' },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.25),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#ecfeff_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#082f49_45%,_#020617_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-cyan-950/10 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Group Invitation Hub
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                Send, track, and respond to group invitations from one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                This workspace gives members a clear queue for incoming invites, a delivery tool for new invites,
                and notification coverage for every key invitation event.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/15 px-4 py-2">In-app notifications</span>
                <span className="rounded-full border border-white/15 px-4 py-2">Pending response tracking</span>
                <span className="rounded-full border border-white/15 px-4 py-2">Sent and received views</span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-cyan-200">Session</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Wallet</p>
                  <p className="mt-1 font-medium text-white">
                    {address || 'No wallet connected'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Authentication</p>
                  <p className="mt-1 font-medium text-white">
                    {isAuthenticated ? 'Authenticated session' : 'Demo mode with local invitation data'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
              <div className="p-5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  {stats[card.key]}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <InviteForm
            inviterName={address ? 'Connected member' : 'Demo organizer'}
            inviterAddress={address}
            onSendInvite={handleSendInvite}
          />

          <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                  Notification Workflow
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  Invitation activity feed
                </h2>
              </div>
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Mark invitation alerts as read
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800/90">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">What gets notified</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>New invitation sent to a wallet, email, or link target.</li>
                  <li>Incoming invitation awaiting a member response.</li>
                  <li>Accepted, declined, or revoked invitation outcomes.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/70 p-4 text-sm text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/20 dark:text-cyan-200">
                Actions on this page also create entries in the app&apos;s existing notifications store, so the
                invitation system feeds the wider notification center instead of living on its own island.
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 flex flex-wrap gap-3">
          {(['all', 'received', 'sent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-cyan-500 dark:text-slate-950'
                  : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        <div className="mt-8 space-y-8">
          {(activeTab === 'all' || activeTab === 'received') && (
            <InvitationList
              title={activeTab === 'all' ? 'Received Invitations' : 'Inbox'}
              description="Respond to pending group invitations and keep your join decisions visible."
              invitations={activeTab === 'all' ? receivedInvitations : visibleInvitations}
              emptyTitle="No incoming invitations"
              emptyDescription="When someone invites you to a savings group, it will show up here with the sender, timing, and response actions."
              onRespond={handleRespond}
              onMarkRead={markInvitationRead}
            />
          )}

          {(activeTab === 'all' || activeTab === 'sent') && (
            <InvitationList
              title={activeTab === 'all' ? 'Sent Invitations' : 'Outbox'}
              description="Track delivery status and revoke invites that should no longer be active."
              invitations={activeTab === 'all' ? sentInvitations : visibleInvitations}
              emptyTitle="No sent invitations"
              emptyDescription="Use the invite form above to send your first group invitation. Sent invitations will appear here with status and expiry information."
              onRevoke={handleRevoke}
              onMarkRead={markInvitationRead}
            />
          )}
        </div>
      </div>
    </div>
  );
}
