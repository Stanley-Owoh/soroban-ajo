import { Router, Response } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { notificationService } from '../services/notificationService'
import { getReminderPreferences, upsertReminderPreferences } from '../services/reminderService'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'
import webpush from 'web-push'

export const notificationsRouter = Router()

// Configure VAPID keys if provided
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_FROM || 'noreply@ajo.app'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// All routes require authentication
notificationsRouter.use(authMiddleware)

/**
 * GET /api/notifications
 * Returns recent activity-feed entries as notification history.
 */
notificationsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.walletAddress!
    const limit = Math.min(Number(req.query.limit) || 50, 100)
    const offset = Number(req.query.offset) || 0

    const activities = await prisma.activityFeed.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    res.json({
      success: true,
      data: activities.map((a: any) => ({
        id: a.id,
        type: a.type.toLowerCase(),
        title: a.title,
        message: a.description,
        timestamp: a.createdAt.getTime(),
        read: false, // read state is managed client-side
        metadata: a.metadata ? JSON.parse(a.metadata as string) : null,
      })),
    })
  } catch (err) {
    logger.error('Error fetching notifications:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' })
  }
})

/**
 * POST /api/notifications/test
 * Sends a test notification to the authenticated user (dev/debug only).
 */
notificationsRouter.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.walletAddress!
    const notification = notificationService.sendToUser(userId, {
      type: 'announcement',
      title: 'Test Notification',
      message: 'Real-time notifications are working correctly.',
    })

    res.json({ success: true, data: notification })
  } catch (err) {
    logger.error('Error sending test notification:', err)
    res.status(500).json({ success: false, error: 'Failed to send notification' })
  }
})

/**
 * GET /api/notifications/status
 * Returns whether the authenticated user is currently connected via WebSocket.
 */
notificationsRouter.get('/status', (req: AuthRequest, res: Response) => {
  const userId = req.user!.walletAddress!
  res.json({
    success: true,
    data: { online: notificationService.isUserOnline(userId) },
  })
})

// ── Reminder preferences ──────────────────────────────────────────────────

const prefsSchema = z.object({
  channels: z.array(z.enum(['email', 'push', 'sms'])).optional(),
  contributionReminderHours: z.number().int().min(1).max(168).optional(),
  payoutReminderHours: z.number().int().min(1).max(48).optional(),
  enabled: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
})

/**
 * GET /api/notifications/reminders/preferences
 * Returns the authenticated user's reminder preferences.
 */
notificationsRouter.get('/reminders/preferences', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.walletAddress!
    const prefs = await getReminderPreferences(userId)
    res.json({ success: true, data: prefs })
  } catch (err) {
    logger.error('Error fetching reminder preferences:', err)
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' })
  }
})

/**
 * PUT /api/notifications/reminders/preferences
 * Creates or updates the authenticated user's reminder preferences.
 */
notificationsRouter.put('/reminders/preferences', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.walletAddress!
    const parsed = prefsSchema.parse(req.body)
    const prefs = await upsertReminderPreferences(userId, parsed)
    res.json({ success: true, data: prefs })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid preferences', details: err.errors })
    }
    logger.error('Error updating reminder preferences:', err)
    res.status(500).json({ success: false, error: 'Failed to update preferences' })
  }
})
