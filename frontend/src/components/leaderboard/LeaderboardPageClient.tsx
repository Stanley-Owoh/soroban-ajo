'use client'

import { motion } from 'framer-motion'
import { Leaderboard } from '@/components/leaderboard/Leaderboard'
import { useLeaderboard } from '@/hooks/useLeaderboard'

export function LeaderboardPageClient() {
  const { period, setPeriod, topContributors, mostReliable, groupAchievements } = useLeaderboard()

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-slate-950 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Member Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track top contributors, reliability rankings, streak performance, and group achievements.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <Leaderboard
            title="Top Contributors"
            subtitle="Ranked by reliability score and contribution points"
            period={period}
            onPeriodChange={setPeriod}
            members={topContributors}
          />

          <Leaderboard
            title="Most Reliable Members"
            subtitle="Members with the highest consistency over the selected period"
            period={period}
            onPeriodChange={setPeriod}
            members={mostReliable}
          />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Group Achievement Rankings</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Badges and milestones unlocked by the circle as a whole.
          </p>

          <div className="mt-4 space-y-4">
            {groupAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{achievement.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      achievement.completed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {achievement.completed ? 'Completed' : 'In progress'}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 0.45, delay: 0.1 + index * 0.06 }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{achievement.progress}% complete</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
