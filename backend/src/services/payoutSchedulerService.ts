/**
 * Payout Scheduler Service — Issue #577
 *
 * Scans active groups for due payouts, determines the next recipient using
 * the group's configured rotation algorithm, and enqueues payout jobs.
 * Also provides emergency override (skip/force) controls.
 */
import { prisma } from '../config/database'
import { addPayoutJob } from '../queues/payoutQueue'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('PayoutScheduler')

// ── Types ─────────────────────────────────────────────────────────────────

export type RotationAlgorithm = 'sequential' | 'random' | 'contribution_based' | 'voting_based'

export interface PayoutScheduleConfig {
  groupId: string
  algorithm: RotationAlgorithm
  /** Delay in ms after cycle end before payout fires (default: 0) */
  delayMs: number
  /** Whether automated scheduling is enabled for this group */
  enabled: boolean
}

export interface ScheduledPayoutResult {
  groupId: string
  jobId: string
  recipientAddress: string
  amount: number
  cycleNumber: number
  scheduledAt: Date
}

export interface ProcessResult {
  scheduled: number
  skipped: number
  failed: number
  details: Array<{ groupId: string; status: 'scheduled' | 'skipped' | 'failed'; reason?: string }>
}

// In-memory config store (falls back when DB table not available)
const configStore = new Map<string, PayoutScheduleConfig>()

function defaultConfig(groupId: string): PayoutScheduleConfig {
  return { groupId, algorithm: 'sequential', delayMs: 0, enabled: true }
}

async function getConfig(groupId: string): Promise<PayoutScheduleConfig> {
  if (configStore.has(groupId)) return configStore.get(groupId)!
  try {
    const row = await (prisma as any).payoutScheduleConfig.findUnique({ where: { groupId } })
    if (row) return { groupId, algorithm: row.algorithm, delayMs: row.delayMs, enabled: row.enabled }
  } catch { /* table not yet migrated */ }
  return defaultConfig(groupId)
}

// ── Rotation algorithms ───────────────────────────────────────────────────

function selectSequential(members: any[], payoutIndex: number): any {
  return members[payoutIndex % members.length]
}

function selectRandom(members: any[], excludeReceived: Set<string>): any {
  const eligible = members.filter((m: any) => !excludeReceived.has(m.userId))
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

async function selectByContribution(groupId: string, members: any[]): Promise<any> {
  // Pick the member with the highest on-time contribution count who hasn't received payout
  const received = await prisma.transaction.findMany({
    where: { groupId, type: 'payout', status: 'completed' },
    select: { recipientId: true },
  })
  const receivedIds = new Set(received.map((r: any) => r.recipientId))
  const eligible = members.filter((m: any) => !receivedIds.has(m.userId))
  if (eligible.length === 0) return null

  const counts = await prisma.contribution.groupBy({
    by: ['userId'],
    where: { groupId, userId: { in: eligible.map((m: any) => m.userId) } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  const topUserId = (counts[0] as any)?.userId
  return eligible.find((m: any) => m.userId === topUserId) ?? eligible[0]
}

async function determineRecipient(
  group: any,
  algorithm: RotationAlgorithm
): Promise<{ userId: string; walletAddress: string } | null> {
  const members: any[] = group.members ?? []
  if (members.length === 0) return null

  const received = await prisma.transaction.findMany({
    where: { groupId: group.id, type: 'payout', status: 'completed' },
    select: { recipientId: true },
  })
  const receivedIds = new Set(received.map((r: any) => r.recipientId))

  let member: any = null

  switch (algorithm) {
    case 'sequential':
      member = selectSequential(members, group.payoutIndex ?? received.size)
      break
    case 'random':
      member = selectRandom(members, receivedIds)
      break
    case 'contribution_based':
      member = await selectByContribution(group.id, members)
      break
    case 'voting_based': {
      // Use the member with the most payout votes this cycle; fall back to sequential
      const votes = await prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { groupId: group.id, eventType: 'payout_vote', eventData: { path: ['cycle'], equals: group.currentRound } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }).catch(() => [])
      const topVotedId = (votes[0] as any)?.userId
      member = members.find((m: any) => m.userId === topVotedId && !receivedIds.has(m.userId))
        ?? selectSequential(members, group.payoutIndex ?? received.size)
      break
    }
  }

  if (!member) return null
  return { userId: member.userId, walletAddress: member.user?.walletAddress ?? member.userId }
}

// ── Core scheduler ────────────────────────────────────────────────────────

/**
 * Scan all active groups and enqueue payout jobs for those whose cycle has ended.
 */
export async function processDuePayouts(): Promise<ProcessResult> {
  const result: ProcessResult = { scheduled: 0, skipped: 0, failed: 0, details: [] }
  const now = new Date()

  const groups = await prisma.group.findMany({
    where: { isActive: true },
    include: { members: { include: { user: true } } },
  })

  for (const group of groups as any[]) {
    const cycleEnd: Date | undefined = group.cycleDeadline ?? group.nextPayoutAt
    if (!cycleEnd || cycleEnd > now) {
      result.skipped++
      result.details.push({ groupId: group.id, status: 'skipped', reason: 'cycle not ended' })
      continue
    }

    // Skip if a payout job already exists for this cycle
    const alreadyPaid = await prisma.transaction.findFirst({
      where: { groupId: group.id, type: 'payout', status: { in: ['completed', 'pending'] } },
    })
    if (alreadyPaid) {
      result.skipped++
      result.details.push({ groupId: group.id, status: 'skipped', reason: 'payout already exists' })
      continue
    }

    const config = await getConfig(group.id)
    if (!config.enabled) {
      result.skipped++
      result.details.push({ groupId: group.id, status: 'skipped', reason: 'scheduling disabled' })
      continue
    }

    try {
      const recipient = await determineRecipient(group, config.algorithm)
      if (!recipient) {
        result.skipped++
        result.details.push({ groupId: group.id, status: 'skipped', reason: 'no eligible recipient' })
        continue
      }

      const amount = Number(group.contributionAmount) * group.members.length
      const jobId = await addPayoutJob(
        {
          groupId: group.id,
          recipientId: recipient.userId,
          recipientAddress: recipient.walletAddress,
          amount,
          currency: 'XLM',
          cycleNumber: group.currentRound ?? 1,
        },
        { delay: config.delayMs, priority: 1 }
      )

      logger.info('Payout scheduled', { groupId: group.id, recipientId: recipient.userId, jobId })
      result.scheduled++
      result.details.push({ groupId: group.id, status: 'scheduled' })
    } catch (err) {
      logger.error('Failed to schedule payout', { groupId: group.id, err })
      result.failed++
      result.details.push({ groupId: group.id, status: 'failed', reason: String(err) })
    }
  }

  logger.info('processDuePayouts complete', { scheduled: result.scheduled, skipped: result.skipped, failed: result.failed })
  return result
}

// ── Emergency controls ────────────────────────────────────────────────────

/**
 * Force an immediate payout to a specific recipient, bypassing cycle timing.
 */
export async function forcePayoutNow(
  groupId: string,
  recipientAddress: string,
  recipientId: string,
  amount: number,
  cycleNumber: number
): Promise<string> {
  const jobId = await addPayoutJob(
    { groupId, recipientId, recipientAddress, amount, currency: 'XLM', cycleNumber, priority: 10 },
    { priority: 10 }
  )
  logger.warn('Emergency force payout scheduled', { groupId, recipientAddress, jobId })
  return jobId
}

/**
 * Skip the current cycle's payout for a group (advance payoutIndex without paying).
 */
export async function skipCurrentPayout(groupId: string, reason: string): Promise<void> {
  await prisma.group.update({
    where: { id: groupId },
    data: { payoutIndex: { increment: 1 } } as any,
  })
  await prisma.analyticsEvent.create({
    data: { eventType: 'payout_skipped', groupId, eventData: { reason } },
  }).catch(() => {})
  logger.warn('Payout skipped', { groupId, reason })
}

// ── Schedule config CRUD ──────────────────────────────────────────────────

export async function upsertScheduleConfig(config: PayoutScheduleConfig): Promise<PayoutScheduleConfig> {
  try {
    await (prisma as any).payoutScheduleConfig.upsert({
      where: { groupId: config.groupId },
      update: { algorithm: config.algorithm, delayMs: config.delayMs, enabled: config.enabled },
      create: config,
    })
  } catch {
    configStore.set(config.groupId, config)
  }
  return config
}

export async function getScheduleConfig(groupId: string): Promise<PayoutScheduleConfig> {
  return getConfig(groupId)
}
