'use client'

import { motion } from 'framer-motion'
import type { AchievementBadge as AchievementBadgeType } from '@/hooks/useLeaderboard'

interface AchievementBadgeProps {
  badge: AchievementBadgeType
}

const toneStyles = {
  gold: 'bg-amber-100 text-amber-700 border-amber-200',
  blue: 'bg-sky-100 text-sky-700 border-sky-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purple: 'bg-violet-100 text-violet-700 border-violet-200',
}

export function AchievementBadge({ badge }: AchievementBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[badge.tone]}`}
      title={badge.label}
    >
      <span aria-hidden>{badge.emoji}</span>
      <span>{badge.label}</span>
    </motion.span>
  )
}
