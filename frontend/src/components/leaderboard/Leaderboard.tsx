'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MemberRank } from '@/components/leaderboard/MemberRank'
import type { LeaderboardMember, LeaderboardTimePeriod } from '@/hooks/useLeaderboard'

interface LeaderboardProps {
  title: string
  subtitle: string
  period: LeaderboardTimePeriod
  onPeriodChange: (period: LeaderboardTimePeriod) => void
  members: LeaderboardMember[]
}

const periodOptions: Array<{ value: LeaderboardTimePeriod; label: string }> = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
]

export function Leaderboard({ title, subtitle, period, onPeriodChange, members }: LeaderboardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-700 dark:bg-slate-900/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>

        <div className="inline-flex rounded-xl bg-white p-1 dark:bg-gray-800">
          {periodOptions.map((option) => {
            const active = option.value === period
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPeriodChange(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={period + title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {members.map((member, index) => (
            <MemberRank key={member.id} member={member} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
