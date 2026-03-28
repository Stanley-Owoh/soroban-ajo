import { Router } from 'express'
import { getSystemMetrics, getRequestMetrics, getRouteMetrics } from '../middleware/performance'

export const metricsRouter = Router()

/**
 * GET /api/metrics
 * Returns aggregated performance metrics dashboard data
 */
metricsRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      system: getSystemMetrics(),
      requests: getRequestMetrics(),
      routes: getRouteMetrics(),
      timestamp: new Date().toISOString(),
    },
  })
})

/**
 * GET /api/metrics/system
 * Returns system-level metrics (CPU, memory, uptime)
 */
metricsRouter.get('/system', (_req, res) => {
  res.json({ success: true, data: getSystemMetrics() })
})

/**
 * GET /api/metrics/requests
 * Returns HTTP request performance metrics
 */
metricsRouter.get('/requests', (_req, res) => {
  res.json({ success: true, data: getRequestMetrics() })
})

/**
 * GET /api/metrics/routes
 * Returns per-route performance breakdown
 */
metricsRouter.get('/routes', (_req, res) => {
  res.json({ success: true, data: getRouteMetrics() })
})
