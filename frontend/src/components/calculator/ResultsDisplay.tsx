'use client'

import React from 'react'
import { formatCurrency, formatTimeframe, Frequency } from '@/utils/calculatorHelpers'

interface ResultsDisplayProps {
  contributionNeeded: number
  timelineMonths: number
  targetAmount: number
  currentSavings: number
  frequency: Frequency
}

const StatBox: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`rounded-xl p-4 ${accent ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
    <p className={`text-xs font-medium mb-1 ${accent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
    <p className={`text-xl font-bold ${accent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
  </div>
)

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  contributionNeeded,
  timelineMonths,
  targetAmount,
  currentSavings,
  frequency,
}) => {
  const remaining = targetAmount - currentSavings
  const progressPercent = Math.min(Math.round((currentSavings / targetAmount) * 100), 100)
  const totalContributions = contributionNeeded * timelineMonths * (frequency === 'daily' ? 30 : frequency === 'weekly' ? 4.33 : 1)

  const freqLabel = frequency.charAt(0).toUpperCase() + frequency.slice(1)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Results</h2>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label={`${freqLabel} Contribution`} value={formatCurrency(contributionNeeded)} accent />
        <StatBox label="Time to Goal" value={formatTimeframe(timelineMonths)} />
        <StatBox label="Amount Remaining" value={formatCurrency(remaining)} />
        <StatBox label="Total Contributions" value={formatCurrency(totalContributions)} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">Current progress</span>
          <span className="font-semibold text-gray-800 dark:text-white">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatCurrency(currentSavings)} saved</span>
          <span>{formatCurrency(targetAmount)} goal</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Breakdown</p>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { label: 'Starting savings', value: formatCurrency(currentSavings), color: 'bg-green-500' },
            { label: 'Total contributions', value: formatCurrency(totalContributions), color: 'bg-blue-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-gray-600 dark:text-gray-300">{label}</span>
              </div>
              <span className="font-medium text-gray-800 dark:text-white">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-2 mt-1">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Total at goal</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(targetAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
