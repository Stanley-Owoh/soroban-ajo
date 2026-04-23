import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

export interface DateRange {
  start: Date
  end: Date
}

export interface GroupPerformance {
  groupId: string
  name: string
  memberCount: number
  currentRound: number
  totalRounds: number
  contributionRate: number   // % of expected contributions received
  defaultRate: number
  totalVolume: number
  avgContributionAmount: number
  isActive: boolean
  completionPct: number
}

export interface MemberBehavior {
  userId: string
  walletAddress: string
  groupsJoined: number
  totalContributions: number
  onTimeRate: number         // contributions made before deadline / total
  totalVolume: number
  avgContributionAmount: number
  lastActiveAt: Date | null
  reliabilityScore: number   // 0–100
}

export interface TrendPoint {
  date: string               // ISO date (YYYY-MM-DD)
  contributions: number
  volume: number
  newMembers: number
  payouts: number
}

export interface GroupTrend {
  groupId: string
  period: string
  data: TrendPoint[]
}

export interface PlatformTrend {
  period: string
  granularity: 'day' | 'week' | 'month'
  data: TrendPoint[]
}

class AdvancedAnalyticsService {
  // ── Group performance ────────────────────────────────────────────────────

  async getGroupPerformance(groupId: string): Promise<GroupPerformance | null> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        contributions: true,
        _count: { select: { members: true } },
      },
    })

    if (!group) return null

    const memberCount = group._count.members
    const expectedContributions = memberCount * (group as any).currentRound
    const actualContributions = group.contributions.length
    const contributionRate = expectedContributions > 0
      ? actualContributions / expectedContributions
      : 0

    const missed = Math.max(0, expectedContributions - actualContributions)
    const defaultRate = expectedContributions > 0 ? missed / expectedContributions : 0

    const totalVolume = group.contributions.reduce(
      (sum: number, c: any) => sum + Number(c.amount), 0
    )
    const avgContributionAmount = actualContributions > 0
      ? totalVolume / actualContributions
      : 0

    const totalRounds = (group as any).maxMembers || memberCount
    const completionPct = totalRounds > 0
      ? ((group as any).currentRound / totalRounds) * 100
      : 0

    return {
      groupId: group.id,
      name: (group as any).name || groupId,
      memberCount,
      currentRound: (group as any).currentRound || 0,
      totalRounds,
      contributionRate,
      defaultRate,
      totalVolume,
      avgContributionAmount,
      isActive: (group as any).isActive,
      completionPct,
    }
  }

  async getAllGroupsPerformance(
    opts: { limit?: number; offset?: number; activeOnly?: boolean } = {}
  ): Promise<{ data: GroupPerformance[]; total: number }> {
    const { limit = 20, offset = 0, activeOnly = false } = opts

    const where = activeOnly ? { isActive: true } : {}
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        include: {
          members: true,
          contributions: true,
          _count: { select: { members: true } },
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.group.count({ where }),
    ])

    const data = groups.map((group: any) => {
      const memberCount = group._count.members
      const expectedContributions = memberCount * (group.currentRound || 0)
      const actualContributions = group.contributions.length
      const contributionRate = expectedContributions > 0
        ? actualContributions / expectedContributions
        : 0
      const missed = Math.max(0, expectedContributions - actualContributions)
      const defaultRate = expectedContributions > 0 ? missed / expectedContributions : 0
      const totalVolume = group.contributions.reduce(
        (sum: number, c: any) => sum + Number(c.amount), 0
      )
      const totalRounds = group.maxMembers || memberCount
      return {
        groupId: group.id,
        name: group.name || group.id,
        memberCount,
        currentRound: group.currentRound || 0,
        totalRounds,
        contributionRate,
        defaultRate,
        totalVolume,
        avgContributionAmount: actualContributions > 0 ? totalVolume / actualContributions : 0,
        isActive: group.isActive,
        completionPct: totalRounds > 0 ? ((group.currentRound || 0) / totalRounds) * 100 : 0,
      }
    })

    return { data, total }
  }

  // ── Member behavior ──────────────────────────────────────────────────────

  async getMemberBehavior(walletAddress: string): Promise<MemberBehavior | null> {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        contributions: true,
        groups: true,
      },
    })

    if (!user) return null

    const contributions = user.contributions as any[]
    const totalVolume = contributions.reduce((s: number, c: any) => s + Number(c.amount), 0)
    const onTimeCount = contributions.filter((c: any) => !c.isLate).length
    const onTimeRate = contributions.length > 0 ? onTimeCount / contributions.length : 1

    const lastActiveAt = contributions.length > 0
      ? contributions.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0].createdAt
      : null

    // Reliability: weighted blend of on-time rate and activity recency
    const daysSinceActive = lastActiveAt
      ? (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999
    const recencyScore = Math.max(0, 1 - daysSinceActive / 90) // decays over 90 days
    const reliabilityScore = Math.round((onTimeRate * 0.7 + recencyScore * 0.3) * 100)

    return {
      userId: user.id,
      walletAddress: user.walletAddress,
      groupsJoined: user.groups.length,
      totalContributions: contributions.length,
      onTimeRate,
      totalVolume,
      avgContributionAmount: contributions.length > 0 ? totalVolume / contributions.length : 0,
      lastActiveAt,
      reliabilityScore,
    }
  }

  async getTopMembers(
    opts: { limit?: number; sortBy?: 'volume' | 'reliability' | 'contributions' } = {}
  ): Promise<MemberBehavior[]> {
    const { limit = 10, sortBy = 'volume' } = opts

    const users = await prisma.user.findMany({
      include: { contributions: true, groups: true },
      take: 200, // fetch a pool then sort in-memory
    })

    const behaviors: MemberBehavior[] = users.map((user: any) => {
      const contributions = user.contributions as any[]
      const totalVolume = contributions.reduce((s: number, c: any) => s + Number(c.amount), 0)
      const onTimeCount = contributions.filter((c: any) => !c.isLate).length
      const onTimeRate = contributions.length > 0 ? onTimeCount / contributions.length : 1
      const lastActiveAt = contributions.length > 0
        ? contributions.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : null
      const daysSinceActive = lastActiveAt
        ? (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
        : 999
      const recencyScore = Math.max(0, 1 - daysSinceActive / 90)
      const reliabilityScore = Math.round((onTimeRate * 0.7 + recencyScore * 0.3) * 100)
      return {
        userId: user.id,
        walletAddress: user.walletAddress,
        groupsJoined: user.groups.length,
        totalContributions: contributions.length,
        onTimeRate,
        totalVolume,
        avgContributionAmount: contributions.length > 0 ? totalVolume / contributions.length : 0,
        lastActiveAt,
        reliabilityScore,
      }
    })

    const sorted = behaviors.sort((a, b) => {
      if (sortBy === 'reliability') return b.reliabilityScore - a.reliabilityScore
      if (sortBy === 'contributions') return b.totalContributions - a.totalContributions
      return b.totalVolume - a.totalVolume
    })

    return sorted.slice(0, limit)
  }

  // ── Trend analysis ───────────────────────────────────────────────────────

  async getPlatformTrends(
    range: DateRange,
    granularity: 'day' | 'week' | 'month' = 'day'
  ): Promise<PlatformTrend> {
    const contributions = await prisma.contribution.findMany({
      where: { createdAt: { gte: range.start, lte: range.end } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const newMembers = await prisma.user.findMany({
      where: { createdAt: { gte: range.start, lte: range.end } },
      select: { createdAt: true },
    })

    const payoutEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventType: 'payout_executed',
        timestamp: { gte: range.start, lte: range.end },
      },
      select: { timestamp: true, eventData: true },
    })

    const buckets = this.buildBuckets(range, granularity)

    for (const c of contributions as any[]) {
      const key = this.bucketKey(new Date(c.createdAt), granularity)
      if (buckets[key]) {
        buckets[key].contributions++
        buckets[key].volume += Number(c.amount)
      }
    }

    for (const u of newMembers as any[]) {
      const key = this.bucketKey(new Date(u.createdAt), granularity)
      if (buckets[key]) buckets[key].newMembers++
    }

    for (const p of payoutEvents as any[]) {
      const key = this.bucketKey(new Date(p.timestamp), granularity)
      if (buckets[key]) buckets[key].payouts++
    }

    return {
      period: `${range.start.toISOString().slice(0, 10)} to ${range.end.toISOString().slice(0, 10)}`,
      granularity,
      data: Object.entries(buckets).map(([date, v]) => ({ date, ...v })),
    }
  }

  async getGroupTrends(groupId: string, range: DateRange): Promise<GroupTrend> {
    const contributions = await prisma.contribution.findMany({
      where: { groupId, createdAt: { gte: range.start, lte: range.end } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const buckets = this.buildBuckets(range, 'day')

    for (const c of contributions as any[]) {
      const key = this.bucketKey(new Date(c.createdAt), 'day')
      if (buckets[key]) {
        buckets[key].contributions++
        buckets[key].volume += Number(c.amount)
      }
    }

    return {
      groupId,
      period: `${range.start.toISOString().slice(0, 10)} to ${range.end.toISOString().slice(0, 10)}`,
      data: Object.entries(buckets).map(([date, v]) => ({ date, ...v })),
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────

  async exportGroupsPerformance(format: 'json' | 'csv'): Promise<string> {
    const { data } = await this.getAllGroupsPerformance({ limit: 1000 })
    if (format === 'json') return JSON.stringify(data, null, 2)
    return this.toCsv(data)
  }

  async exportMemberBehaviors(format: 'json' | 'csv'): Promise<string> {
    const members = await this.getTopMembers({ limit: 1000, sortBy: 'volume' })
    if (format === 'json') return JSON.stringify(members, null, 2)
    return this.toCsv(members)
  }

  async exportTrends(range: DateRange, granularity: 'day' | 'week' | 'month', format: 'json' | 'csv'): Promise<string> {
    const trends = await this.getPlatformTrends(range, granularity)
    if (format === 'json') return JSON.stringify(trends, null, 2)
    return this.toCsv(trends.data)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private buildBuckets(
    range: DateRange,
    granularity: 'day' | 'week' | 'month'
  ): Record<string, { contributions: number; volume: number; newMembers: number; payouts: number }> {
    const buckets: Record<string, { contributions: number; volume: number; newMembers: number; payouts: number }> = {}
    const cursor = new Date(range.start)
    cursor.setHours(0, 0, 0, 0)

    while (cursor <= range.end) {
      buckets[this.bucketKey(cursor, granularity)] = {
        contributions: 0, volume: 0, newMembers: 0, payouts: 0,
      }
      if (granularity === 'day') cursor.setDate(cursor.getDate() + 1)
      else if (granularity === 'week') cursor.setDate(cursor.getDate() + 7)
      else cursor.setMonth(cursor.getMonth() + 1)
    }

    return buckets
  }

  private bucketKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    if (granularity === 'month') return date.toISOString().slice(0, 7)
    if (granularity === 'week') {
      const d = new Date(date)
      d.setDate(d.getDate() - d.getDay()) // start of week (Sunday)
      return d.toISOString().slice(0, 10)
    }
    return date.toISOString().slice(0, 10)
  }

  private toCsv(rows: Record<string, any>[]): string {
    if (rows.length === 0) return ''
    const headers = Object.keys(rows[0])
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')
      ),
    ]
    return lines.join('\n')
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService()
