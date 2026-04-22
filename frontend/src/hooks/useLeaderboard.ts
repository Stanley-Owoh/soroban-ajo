'use client'

import { useMemo, useState } from 'react'

export type LeaderboardTimePeriod = '7d' | '30d' | 'all'

export interface AchievementBadge {
  id: string
  label: string
  emoji: string
  tone: 'gold' | 'blue' | 'green' | 'purple'
}

export interface LeaderboardMember {
  id: string
  name: string
  avatar: string
  reliabilityScore: number
  contributionStreak: number
  contributionPoints: number
  badges: AchievementBadge[]
}

interface LeaderboardDataset {
  topContributors: LeaderboardMember[]
  mostReliable: LeaderboardMember[]
  groupAchievements: {
    id: string
    title: string
    description: string
    progress: number
    completed: boolean
  }[]
}

const leaderboardData: Record<LeaderboardTimePeriod, LeaderboardDataset> = {
  '7d': {
    topContributors: [
      {
        id: 'aya',
        name: 'Aya Mensah',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aya',
        reliabilityScore: 98,
        contributionStreak: 14,
        contributionPoints: 920,
        badges: [
          { id: 'streak-14', label: '14-day streak', emoji: '🔥', tone: 'gold' },
          { id: 'trust-anchor', label: 'Trust Anchor', emoji: '🛡️', tone: 'blue' },
        ],
      },
      {
        id: 'kai',
        name: 'Kai Obinna',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Kai',
        reliabilityScore: 95,
        contributionStreak: 11,
        contributionPoints: 870,
        badges: [
          { id: 'momentum', label: 'Momentum', emoji: '⚡', tone: 'purple' },
          { id: 'perfect-payout', label: 'Perfect Payout', emoji: '🏆', tone: 'gold' },
        ],
      },
      {
        id: 'lina',
        name: 'Lina Okafor',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Lina',
        reliabilityScore: 93,
        contributionStreak: 10,
        contributionPoints: 830,
        badges: [{ id: 'steady', label: 'Steady Saver', emoji: '💎', tone: 'green' }],
      },
      {
        id: 'tobi',
        name: 'Tobi Adebayo',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Tobi',
        reliabilityScore: 92,
        contributionStreak: 8,
        contributionPoints: 780,
        badges: [{ id: 'team-player', label: 'Team Player', emoji: '🤝', tone: 'blue' }],
      },
    ],
    mostReliable: [],
    groupAchievements: [
      {
        id: 'on-time-week',
        title: 'On-time Week',
        description: 'All members contributed before payout day.',
        progress: 100,
        completed: true,
      },
      {
        id: 'streak-club',
        title: 'Streak Club',
        description: '4 members reached a 7+ day contribution streak.',
        progress: 80,
        completed: false,
      },
      {
        id: 'reliability-avg',
        title: 'Reliability Rising',
        description: 'Group reliability average crossed 90%.',
        progress: 92,
        completed: true,
      },
    ],
  },
  '30d': {
    topContributors: [
      {
        id: 'aya',
        name: 'Aya Mensah',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aya',
        reliabilityScore: 97,
        contributionStreak: 29,
        contributionPoints: 3540,
        badges: [
          { id: 'marathon', label: 'Marathon Streak', emoji: '🔥', tone: 'gold' },
          { id: 'finisher', label: 'Cycle Finisher', emoji: '🏅', tone: 'green' },
        ],
      },
      {
        id: 'lina',
        name: 'Lina Okafor',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Lina',
        reliabilityScore: 96,
        contributionStreak: 24,
        contributionPoints: 3270,
        badges: [{ id: 'all-star', label: 'All Star', emoji: '🌟', tone: 'purple' }],
      },
      {
        id: 'kai',
        name: 'Kai Obinna',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Kai',
        reliabilityScore: 94,
        contributionStreak: 20,
        contributionPoints: 3150,
        badges: [{ id: 'consistent', label: 'Consistent', emoji: '🎯', tone: 'blue' }],
      },
      {
        id: 'nora',
        name: 'Nora Afolabi',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Nora',
        reliabilityScore: 93,
        contributionStreak: 19,
        contributionPoints: 3020,
        badges: [{ id: 'cohort-heart', label: 'Cohort Heart', emoji: '💖', tone: 'green' }],
      },
    ],
    mostReliable: [],
    groupAchievements: [
      {
        id: 'perfect-month',
        title: 'Perfect Month',
        description: 'No missed contributions over 30 days.',
        progress: 100,
        completed: true,
      },
      {
        id: 'collector',
        title: 'Badge Collector',
        description: 'Earn 20 combined member badges this month.',
        progress: 70,
        completed: false,
      },
      {
        id: 'cash-flow',
        title: 'Cash Flow Champion',
        description: 'Contributions exceeded monthly target by 15%.',
        progress: 88,
        completed: false,
      },
    ],
  },
  all: {
    topContributors: [
      {
        id: 'aya',
        name: 'Aya Mensah',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aya',
        reliabilityScore: 99,
        contributionStreak: 46,
        contributionPoints: 12400,
        badges: [
          { id: 'legend', label: 'Ajo Legend', emoji: '👑', tone: 'gold' },
          { id: 'unbroken', label: 'Unbroken', emoji: '🧱', tone: 'purple' },
        ],
      },
      {
        id: 'kai',
        name: 'Kai Obinna',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Kai',
        reliabilityScore: 97,
        contributionStreak: 38,
        contributionPoints: 11840,
        badges: [{ id: 'pillar', label: 'Pillar', emoji: '🏛️', tone: 'blue' }],
      },
      {
        id: 'lina',
        name: 'Lina Okafor',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Lina',
        reliabilityScore: 96,
        contributionStreak: 35,
        contributionPoints: 11010,
        badges: [{ id: 'veteran', label: 'Veteran', emoji: '🫶', tone: 'green' }],
      },
      {
        id: 'nora',
        name: 'Nora Afolabi',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Nora',
        reliabilityScore: 95,
        contributionStreak: 29,
        contributionPoints: 10480,
        badges: [{ id: 'finisher', label: 'Finisher', emoji: '🏁', tone: 'gold' }],
      },
    ],
    mostReliable: [],
    groupAchievements: [
      {
        id: 'century',
        title: 'Century Club',
        description: 'Reached 100 successful payout cycles as a group.',
        progress: 94,
        completed: false,
      },
      {
        id: 'trust-ladder',
        title: 'Trust Ladder',
        description: 'Maintain 95%+ reliability average all season.',
        progress: 100,
        completed: true,
      },
      {
        id: 'streak-culture',
        title: 'Streak Culture',
        description: 'At least half of members maintain 14+ day streaks.',
        progress: 78,
        completed: false,
      },
    ],
  },
}

for (const dataset of Object.values(leaderboardData)) {
  dataset.mostReliable = [...dataset.topContributors].sort(
    (left, right) => right.reliabilityScore - left.reliabilityScore || right.contributionStreak - left.contributionStreak
  )
}

export function useLeaderboard() {
  const [period, setPeriod] = useState<LeaderboardTimePeriod>('30d')

  const dataset = useMemo(() => leaderboardData[period], [period])

  return {
    period,
    setPeriod,
    topContributors: dataset.topContributors,
    mostReliable: dataset.mostReliable,
    groupAchievements: dataset.groupAchievements,
  }
}
