import { Job } from 'bullmq'
import { logger } from '../utils/logger'

export interface ReminderJobData {
  type:
    | 'daily_contribution'
    | 'payout_upcoming'
    | 'overdue'
    | 'weekly_summary'
    | 'monthly_report'
}

export async function processReminderJob(job: Job<ReminderJobData>): Promise<void> {
  logger.info('Processing reminder job', { jobId: job.id, type: job.data.type })

  try {
    switch (job.data.type) {
      case 'daily_contribution': {
        const { sendContributionReminders } = await import('../services/reminderService')
        const result = await sendContributionReminders()
        logger.info('Contribution reminders done', { jobId: job.id, ...result })
        break
      }

      case 'payout_upcoming': {
        const { sendPayoutReminders } = await import('../services/reminderService')
        const result = await sendPayoutReminders()
        logger.info('Payout reminders done', { jobId: job.id, ...result })
        break
      }

      case 'overdue': {
        const { sendOverdueReminders } = await import('../services/reminderService')
        const result = await sendOverdueReminders()
        logger.info('Overdue reminders done', { jobId: job.id, ...result })
        break
      }

      case 'weekly_summary': {
        const { sendWeeklyReports } = await import('../services/reportService')
        const result = await sendWeeklyReports()
        logger.info('Weekly summary reports dispatched', { jobId: job.id, ...result })
        break
      }

      case 'monthly_report': {
        const { sendMonthlyReports } = await import('../services/reportService')
        const result = await sendMonthlyReports()
        logger.info('Monthly reports dispatched', { jobId: job.id, ...result })
        break
      }

      default:
        logger.warn('Unknown reminder type', { jobId: job.id, type: (job.data as any).type })
    }
  } catch (error) {
    logger.error('Reminder job failed', {
      jobId: job.id,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
