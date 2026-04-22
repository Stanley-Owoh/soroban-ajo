'use client'

import React, { useState, useMemo } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { SavingsCalculator, CalculatorInputs } from '@/components/calculator/SavingsCalculator'
import { ResultsDisplay } from '@/components/calculator/ResultsDisplay'
import {
  calculateContributionAmount,
  getValidationError,
} from '@/utils/calculatorHelpers'

const DEFAULT_INPUTS: CalculatorInputs = {
  targetAmount: 10000,
  currentSavings: 0,
  frequency: 'monthly',
  timelineMonths: 12,
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS)

  const validationError = useMemo(
    () => getValidationError(inputs.targetAmount, inputs.currentSavings, inputs.timelineMonths),
    [inputs]
  )

  const contributionNeeded = useMemo(() => {
    const result = calculateContributionAmount(
      inputs.targetAmount,
      inputs.currentSavings,
      inputs.timelineMonths,
      inputs.frequency
    )
    return result ?? 0
  }, [inputs])

  return (
    <AppLayout title="Savings Calculator">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Savings Calculator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Plan your savings goals and find the right Ajo group for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SavingsCalculator
            inputs={inputs}
            onChange={setInputs}
            onReset={() => setInputs(DEFAULT_INPUTS)}
            validationError={validationError}
          />

          {!validationError ? (
            <ResultsDisplay
              contributionNeeded={contributionNeeded}
              timelineMonths={inputs.timelineMonths}
              targetAmount={inputs.targetAmount}
              currentSavings={inputs.currentSavings}
              frequency={inputs.frequency}
            />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Enter valid inputs to see your results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
