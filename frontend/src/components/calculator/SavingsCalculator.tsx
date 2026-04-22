'use client'

import React from 'react'
import { Frequency } from '@/utils/calculatorHelpers'

export interface CalculatorInputs {
  targetAmount: number
  currentSavings: number
  frequency: Frequency
  timelineMonths: number
}

interface SavingsCalculatorProps {
  inputs: CalculatorInputs
  onChange: (inputs: CalculatorInputs) => void
  onReset: () => void
  validationError: string | null
}

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500'

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  inputs,
  onChange,
  onReset,
  validationError,
}) => {
  const set = (field: keyof CalculatorInputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === 'frequency' ? e.target.value : Number(e.target.value)
    onChange({ ...inputs, [field]: value })
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Savings Goal</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Target Amount ($)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={inputs.targetAmount || ''}
            onChange={set('targetAmount')}
            placeholder="e.g. 10000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Current Savings ($)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={inputs.currentSavings || ''}
            onChange={set('currentSavings')}
            placeholder="e.g. 1000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Contribution Frequency</label>
          <select value={inputs.frequency} onChange={set('frequency')} className={inputClass}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Timeline: <span className="text-blue-600 dark:text-blue-400 font-semibold">{inputs.timelineMonths} months</span>
          </label>
          <input
            type="range"
            min={1}
            max={120}
            value={inputs.timelineMonths}
            onChange={set('timelineMonths')}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 month</span>
            <span>10 years</span>
          </div>
        </div>

        {validationError && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            {validationError}
          </p>
        )}
      </div>
    </div>
  )
}
