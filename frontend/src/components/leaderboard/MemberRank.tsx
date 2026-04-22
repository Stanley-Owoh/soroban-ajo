'use client'

import { motion } from 'framer-motion'
import { AchievementBadge } from '@/components/leaderboard/AchievementBadge'
import type { LeaderboardMember } from '@/hooks/useLeaderboard'

interface MemberRankProps {
  member: LeaderboardMember
  index: number
}

export function MemberRank({ member, index }: MemberRankProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex items-center gap-4 rounded-xl bg-white p-4 transition-all hover:shadow-lg dark:bg-gray-800"
    >
      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
      <img className="h-12 w-12 rounded-full" src={member.avatar} alt={member.name} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reliability {member.reliabilityScore}% · {member.contributionPoints.toLocaleString()} pts
        </p>
        <p className="text-xs text-orange-600 dark:text-orange-400">
          🔥 {member.contributionStreak} day streak
        </p>
      </div>
      <div className="flex max-w-[13rem] flex-wrap justify-end gap-1">
        {member.badges.map((badge) => (
          <AchievementBadge key={badge.id} badge={badge} />
        ))}
      </div>
    </motion.div>
  )
}
