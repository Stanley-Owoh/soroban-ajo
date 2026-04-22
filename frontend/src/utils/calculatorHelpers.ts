export type Frequency = 'daily' | 'weekly' | 'monthly'

const PERIODS_PER_MONTH: Record<Frequency, number> = {
  daily: 30,
  weekly: 4.33,
  monthly: 1,
}

/** Returns contribution amount per period needed to reach goal, or null if invalid */
export function calculateContributionAmount(
  targetAmount: number,
  currentSavings: number,
  timelineMonths: number,
  frequency: Frequency
): number | null {
  if (!validateInputs(targetAmount, currentSavings, timelineMonths)) return null
  const remaining = targetAmount - currentSavings
  if (remaining <= 0) return 0
  const totalPeriods = timelineMonths * PERIODS_PER_MONTH[frequency]
  return remaining / totalPeriods
}

/** Returns months to reach goal given a fixed contribution per period, or null if invalid */
export function calculateTimeToGoal(
  targetAmount: number,
  currentSavings: number,
  contributionAmount: number,
  frequency: Frequency
): number | null {
  if (!validateInputs(targetAmount, currentSavings, 1) || contributionAmount <= 0) return null
  const remaining = targetAmount - currentSavings
  if (remaining <= 0) return 0
  const periodsNeeded = remaining / contributionAmount
  return periodsNeeded / PERIODS_PER_MONTH[frequency]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTimeframe(months: number): string {
  if (months < 1) {
    const weeks = Math.ceil(months * 4.33)
    return `${weeks} week${weeks !== 1 ? 's' : ''}`
  }
  const years = Math.floor(months / 12)
  const remainingMonths = Math.round(months % 12)
  if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
}

export function validateInputs(
  targetAmount: number,
  currentSavings: number,
  timelineMonths: number
): boolean {
  return (
    targetAmount > 0 &&
    currentSavings >= 0 &&
    timelineMonths > 0 &&
    currentSavings < targetAmount
  )
}

export function getValidationError(
  targetAmount: number,
  currentSavings: number,
  timelineMonths: number
): string | null {
  if (targetAmount <= 0) return 'Target amount must be greater than 0'
  if (currentSavings < 0) return 'Current savings cannot be negative'
  if (currentSavings >= targetAmount) return 'Current savings already meet or exceed the target'
  if (timelineMonths <= 0) return 'Timeline must be greater than 0'
  return null
}
