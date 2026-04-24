/**
 * Reminder Service — Issue #587
 *
 * Finds members with upcoming contribution deadlines, payout events, and
 * group events, then dispatches reminders across email, push, and SMS channels
 * according to each member's stored preferences.
 */
import { prisma } from '../config/database'
import { emailService } from './emailService'
import { notificationService } from './notificationService'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('ReminderService')

// ── Types ─────────────────────────────────────────────────────────────────

export type ReminderChannel = 'email' | 'push' | 'sms'
export type ReminderEvent = 'contribution_due' | 'payout_upcoming' | 'group_event' | 'overdue'

export interface ReminderPreferences {
  userId: string
  channels: ReminderChannel[]
  /** Hours before deadline to send contribution_due reminder (default: 24) */
  contributionReminderHours: number
  /** Hours before payout to send payout_upcoming reminder (default: 2) */
  payoutReminderHours: number
  enabled: boolean
  phoneNumber?: string
  email?: string
}

export interface ReminderResult {
  sent: number
  failed: number
  skipped: number
}

// ── In-memory prefs fallback (used when DB table not yet migrated) ─────────
const inMemoryPrefs = new Map<string, ReminderPreferences>()

function defaultPrefs(userId: string): ReminderPreferences {
  return {
    userId,
    channels: ['push'],
    contributionReminderHours: 24,
    payoutReminderHours: 2,
    enabled: true,
  }
}

async function getPrefs(userId: string): Promise<ReminderPreferences> {
  if (inMemoryPrefs.has(userId)) return inMemoryPrefs.get(userId)!
  try {
    const row = await (prisma as any).reminderPreferences.findUnique({ where: { userId } })
    if (!row) return defaultPrefs(userId)
    return {
      userId,
      channels: row.channels ?? ['push'],
      contributionReminderHours: row.contributionReminderHours ?? 24,
      payoutReminderHours: row.payoutReminderHours ?? 2,
      enabled: row.enabled ?? true,
      phoneNumber: row.phoneNumber ?? undefined,
      email: row.email ?? undefined,
    }
  } catch {
    return defaultPrefs(userId)
  }
}

// ── SMS stub (Twilio-ready) ───────────────────────────────────────────────

async function sendSms(to: string, body: string): Promise<boolean> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    logger.debug('SMS disabled — TWILIO_* env vars not set', { to })
    return false
  }
  try {
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    await client.messages.create({ body, from: process.env.TWILIO_FROM_NUMBER!, to })
    logger.info('SMS sent', { to })
    return true
  } catch (err) {
    logger.error('SMS send failed', { err, to })
    return false
  }
}

// ── Core dispatch ─────────────────────────────────────────────────────────

interface DispatchPayload {
  title: string
  message: string
  groupId?: string
  groupName?: string
  amount?: string
  dueDate?: string
  cycleNumber?: number
}

async function dispatch(
  prefs: ReminderPreferences,
  event: ReminderEvent,
  payload: DispatchPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const channel of prefs.channels) {
    try {
      if (channel === 'push') {
        notificationService.sendToUser(prefs.userId, {
          type: 'contribution_due',
          title: payload.title,
          message: payload.message,
          groupId: payload.groupId,
        })
        sent++
      } else if (channel === 'email' && prefs.email) {
        let ok = false
        if ((event === 'contribution_due' || event === 'overdue') && payload.groupId) {
          ok = await emailService.sendContributionReminder(
            prefs.email,
            payload.groupName ?? 'Your Group',
            payload.amount ?? '—',
            payload.dueDate ?? '—',
            payload.cycleNumber ?? 0,
            payload.groupId
          )
        } else {
          ok = await emailService.sendEmail({
            to: prefs.email,
            subject: payload.title,
            html: `<p>${payload.message}</p>`,
          })
        }
        ok ? sent++ : failed++
      } else if (channel === 'sms' && prefs.phoneNumber) {
        const ok = await sendSms(prefs.phoneNumber, `${payload.title}: ${payload.message}`)
        ok ? sent++ : failed++
      }
    } catch (err) {
      logger.error('Reminder dispatch error', { channel, event, userId: prefs.userId, err })
      failed++
    }
  }

  return { sent, failed }
}

// ── Scheduled jobs ────────────────────────────────────────────────────────

export async function sendContributionReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 }
  const now = new Date()

  const groups = await prisma.group.findMany({
    where: { isActive: true },
    include: { members: { include: { user: true } } },
  })

  for (const group of groups as any[]) {
    const deadline: Date | undefined = group.cycleDeadline ?? group.nextPayoutAt
    if (!deadline) continue

    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    for (const member of group.members) {
      const user = member.user
      if (!user) continue

      const prefs = await getPrefs(user.id)
      if (!prefs.enabled) { result.skipped++; continue }
      if (hoursUntil < 0 || hoursUntil > prefs.contributionReminderHours) {
        result.skipped++; continue
      }

      const contributed = await prisma.contribution.findFirst({
        where: { groupId: group.id, userId: user.id, round: group.currentRound },
      })
      if (contributed) { result.skipped++; continue }

      const amount = `${Number(group.contributionAmount) / 1e7} XLM`
      const dueDate = deadline.toLocaleDateString('en-US', { dateStyle: 'medium' })
      const { sent, failed } = await dispatch(
        { ...prefs, email: prefs.email ?? user.email },
        'contribution_due',
        { title: `Contribution Due — ${group.name}`, message: `Your contribution of ${amount} is due by ${dueDate}.`, groupId: group.id, groupName: group.name, amount, dueDate, cycleNumber: group.currentRound }
      )
      result.sent += sent; result.failed += failed
    }
  }

  logger.info('Contribution reminders processed', result)
  return result
}

export async function sendPayoutReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 }
  const now = new Date()

  const groups = await prisma.group.findMany({
    where: { isActive: true },
    include: { members: { include: { user: true } } },
  })

  for (const group of groups as any[]) {
    const payoutAt: Date | undefined = group.nextPayoutAt
    if (!payoutAt) continue

    const hoursUntil = (payoutAt.getTime() - now.getTime()) / (1000 * 60 * 60)
    const recipient = (group.members as any[])[group.payoutIndex ?? 0]
    if (!recipient?.user) continue

    const prefs = await getPrefs(recipient.user.id)
    if (!prefs.enabled) { result.skipped++; continue }
    if (hoursUntil < 0 || hoursUntil > prefs.payoutReminderHours) { result.skipped++; continue }

    const amount = `${Number(group.contributionAmount) * group.members.length / 1e7} XLM`
    const { sent, failed } = await dispatch(
      { ...prefs, email: prefs.email ?? recipient.user.email },
      'payout_upcoming',
      { title: `Payout Incoming — ${group.name}`, message: `You will receive ${amount} from ${group.name} soon.`, groupId: group.id, groupName: group.name, amount }
    )
    result.sent += sent; result.failed += failed
  }

  logger.info('Payout reminders processed', result)
  return result
}

export async function sendOverdueReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 }
  const now = new Date()

  const groups = await prisma.group.findMany({
    where: { isActive: true },
    include: { members: { include: { user: true } } },
  })

  for (const group of groups as any[]) {
    const deadline: Date | undefined = group.cycleDeadline ?? group.nextPayoutAt
    if (!deadline || deadline > now) continue

    for (const member of (group.members as any[])) {
      const user = member.user
      if (!user) continue

      const contributed = await prisma.contribution.findFirst({
        where: { groupId: group.id, userId: user.id, round: group.currentRound },
      })
      if (contributed) { result.skipped++; continue }

      const prefs = await getPrefs(user.id)
      if (!prefs.enabled) { result.skipped++; continue }

      const amount = `${Number(group.contributionAmount) / 1e7} XLM`
      const { sent, failed } = await dispatch(
        { ...prefs, email: prefs.email ?? user.email },
        'overdue',
        { title: `Overdue Contribution — ${group.name}`, message: `Your contribution of ${amount} to ${group.name} is overdue. Contribute now to avoid penalties.`, groupId: group.id, groupName: group.name, amount, cycleNumber: group.currentRound }
      )
      result.sent += sent; result.failed += failed
    }
  }

  logger.info('Overdue reminders processed', result)
  return result
}

// ── Preferences CRUD ──────────────────────────────────────────────────────

export async function upsertReminderPreferences(
  userId: string,
  prefs: Partial<Omit<ReminderPreferences, 'userId'>>
): Promise<ReminderPreferences> {
  const data = {
    channels: prefs.channels,
    contributionReminderHours: prefs.contributionReminderHours,
    payoutReminderHours: prefs.payoutReminderHours,
    enabled: prefs.enabled,
    phoneNumber: prefs.phoneNumber,
    email: prefs.email,
  }
  try {
    await (prisma as any).reminderPreferences.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
  } catch {
    // DB table not yet migrated — use in-memory store
    inMemoryPrefs.set(userId, { ...defaultPrefs(userId), ...prefs, userId })
  }
  return getPrefs(userId)
}

export async function getReminderPreferences(userId: string): Promise<ReminderPreferences> {
  return getPrefs(userId)
}
