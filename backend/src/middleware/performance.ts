import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import os from 'os'

// Performance budgets
const BUDGETS = {
  apiResponseTime: 500,    // ms
  slowQueryTime: 1000,     // ms
  criticalResponseTime: 2000, // ms
}

// In-memory metrics store (replace with Redis/Prometheus in production)
interface RequestMetric {
  method: string
  route: string
  statusCode: number
  duration: number
  timestamp: number
  memoryUsage: number
}

const metricsStore: RequestMetric[] = []
const MAX_METRICS = 5000

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint()
  const startMemory = process.memoryUsage().heapUsed

  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - start
    const durationMs = Number(durationNs) / 1_000_000
    const memoryDelta = process.memoryUsage().heapUsed - startMemory

    const route = (req.route?.path as string) || req.path
    const metric: RequestMetric = {
      method: req.method,
      route,
      statusCode: res.statusCode,
      duration: durationMs,
      timestamp: Date.now(),
      memoryUsage: memoryDelta,
    }

    // Store metric (circular buffer)
    metricsStore.push(metric)
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.shift()
    }

    // Set response time header
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`)

    // Alert on budget violations
    if (durationMs > BUDGETS.criticalResponseTime) {
      logger.error('Critical response time budget exceeded', {
        route,
        method: req.method,
        duration: `${durationMs.toFixed(2)}ms`,
        budget: `${BUDGETS.criticalResponseTime}ms`,
      })
    } else if (durationMs > BUDGETS.apiResponseTime) {
      logger.warn('API response time budget exceeded', {
        route,
        method: req.method,
        duration: `${durationMs.toFixed(2)}ms`,
        budget: `${BUDGETS.apiResponseTime}ms`,
      })
    }
  })

  next()
}

export function getSystemMetrics() {
  const mem = process.memoryUsage()
  const cpus = os.cpus()
  const totalCpuTime = cpus.reduce((acc, cpu) => {
    const times = cpu.times
    return acc + times.user + times.nice + times.sys + times.idle + times.irq
  }, 0)
  const idleCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0)
  const cpuUsagePercent = ((1 - idleCpuTime / totalCpuTime) * 100).toFixed(2)

  return {
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),   // MB
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),  // MB
      rss: Math.round(mem.rss / 1024 / 1024),              // MB
      external: Math.round(mem.external / 1024 / 1024),    // MB
    },
    cpu: {
      usagePercent: parseFloat(cpuUsagePercent),
      cores: cpus.length,
      model: cpus[0]?.model || 'unknown',
    },
    uptime: Math.round(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
  }
}

export function getRequestMetrics() {
  if (metricsStore.length === 0) {
    return { count: 0, avgDuration: 0, p95: 0, p99: 0, errorRate: 0, throughput: 0 }
  }

  const durations = metricsStore.map(m => m.duration).sort((a, b) => a - b)
  const errors = metricsStore.filter(m => m.statusCode >= 500).length
  const now = Date.now()
  const oneMinuteAgo = now - 60_000
  const recentRequests = metricsStore.filter(m => m.timestamp > oneMinuteAgo).length

  const p95Index = Math.floor(durations.length * 0.95)
  const p99Index = Math.floor(durations.length * 0.99)

  return {
    count: metricsStore.length,
    avgDuration: parseFloat((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)),
    p95: parseFloat((durations[p95Index] || 0).toFixed(2)),
    p99: parseFloat((durations[p99Index] || 0).toFixed(2)),
    errorRate: parseFloat(((errors / metricsStore.length) * 100).toFixed(2)),
    throughput: recentRequests, // requests per last minute
    budgets: BUDGETS,
  }
}

export function getRouteMetrics() {
  const routeMap = new Map<string, { count: number; totalDuration: number; errors: number }>()

  for (const metric of metricsStore) {
    const key = `${metric.method} ${metric.route}`
    const existing = routeMap.get(key) || { count: 0, totalDuration: 0, errors: 0 }
    existing.count++
    existing.totalDuration += metric.duration
    if (metric.statusCode >= 500) existing.errors++
    routeMap.set(key, existing)
  }

  return Array.from(routeMap.entries()).map(([route, stats]) => ({
    route,
    count: stats.count,
    avgDuration: parseFloat((stats.totalDuration / stats.count).toFixed(2)),
    errorRate: parseFloat(((stats.errors / stats.count) * 100).toFixed(2)),
  })).sort((a, b) => b.avgDuration - a.avgDuration)
}
