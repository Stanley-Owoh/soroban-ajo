import * as crypto from 'crypto'
import { prisma } from '../config/database'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('WebhookService')

/**
 * Webhook Event Types
 */
export enum WebhookEventType {
  GROUP_CREATED = 'group.created',
  GROUP_UPDATED = 'group.updated',
  GROUP_COMPLETED = 'group.completed',
  MEMBER_JOINED = 'member.joined',
  MEMBER_LEFT = 'member.left',
  CONTRIBUTION_MADE = 'contribution.made',
  CONTRIBUTION_FAILED = 'contribution.failed',
  PAYOUT_COMPLETED = 'payout.completed',
  PAYOUT_EXECUTED = 'payout.executed',
  PAYOUT_FAILED = 'payout.failed',
  CYCLE_STARTED = 'cycle.started',
  CYCLE_ENDED = 'cycle.ended',
}

/**
 * Webhook Payload Structure
 */
export interface WebhookPayload {
  id: string
  event: WebhookEventType
  timestamp: string
  data: Record<string, any>
  metadata?: {
    groupId?: string
    userId?: string
    transactionHash?: string
    network?: string
  }
}

/**
 * Webhook Endpoint Configuration
 */
export interface WebhookEndpoint {
  id: string
  url: string
  secret: string
  events: WebhookEventType[]
  enabled: boolean
  retryConfig?: {
    maxRetries: number
    retryDelay: number
  }
  headers?: Record<string, string>
}

/**
 * Webhook Delivery Result
 */
export interface WebhookDeliveryResult {
  success: boolean
  statusCode?: number
  error?: string
  timestamp: string
  attempts: number
}

/**
 * WebhookService
 * Handles webhook registration (persisted to DB), event dispatching, and delivery.
 */
export class WebhookService {
  // In-memory cache of endpoints loaded from DB
  private endpoints: Map<string, WebhookEndpoint> = new Map()
  private deliveryQueue: WebhookPayload[] = []
  private isProcessing = false

  constructor() {
    // Load persisted endpoints asynchronously; errors are non-fatal
    this.loadEndpoints().catch((err) =>
      logger.warn('Failed to load webhook endpoints from DB on startup', { err })
    )
  }

  /**
   * Registers a new external webhook endpoint to receive platform events.
   * 
   * @param endpoint - Configuration and target URL for the webhook
   * @returns The newly generated unique ID for the endpoint
   */
  registerEndpoint(endpoint: Omit<WebhookEndpoint, 'id'>): string {
    const id = crypto.randomUUID()
    const webhookEndpoint: WebhookEndpoint = {
      id,
      ...endpoint,
      retryConfig: endpoint.retryConfig || { maxRetries: 3, retryDelay: 1000 },
    }
    this.endpoints.set(id, webhookEndpoint)
    logger.info('Webhook endpoint registered (in-memory)', { endpointId: id, url: endpoint.url })
    return id
  }

  /**
   * Unregister a webhook endpoint (removes from DB and cache)
   */
  async unregisterEndpointAsync(id: string): Promise<boolean> {
    try {
      await prisma.webhookSubscription.delete({ where: { id } })
    } catch {
      // Record may not exist in DB (e.g. env-loaded endpoint)
    }
    return this.endpoints.delete(id)
  }

  /**
   * Unregister a webhook endpoint (in-memory only)
   */
  unregisterEndpoint(id: string): boolean {
    return this.endpoints.delete(id)
  }

  /**
   * Update webhook endpoint configuration (persisted to DB)
   */
  async updateEndpointAsync(id: string, updates: Partial<WebhookEndpoint>): Promise<boolean> {
    const endpoint = this.endpoints.get(id)
    if (!endpoint) return false

    const merged = { ...endpoint, ...updates }
    this.endpoints.set(id, merged)

    try {
      await prisma.webhookSubscription.update({
        where: { id },
        data: {
          ...(updates.url !== undefined && { url: updates.url }),
          ...(updates.secret !== undefined && { secret: updates.secret }),
          ...(updates.events !== undefined && { events: JSON.stringify(updates.events) }),
          ...(updates.enabled !== undefined && { enabled: updates.enabled }),
          ...(updates.retryConfig !== undefined && {
            retryConfig: JSON.stringify(updates.retryConfig),
          }),
          ...(updates.headers !== undefined && { headers: JSON.stringify(updates.headers) }),
        },
      })
    } catch {
      // Record may not exist in DB (e.g. env-loaded endpoint)
    }

    logger.info('Webhook endpoint updated', { endpointId: id })
    return true
  }

  /**
   * Update webhook endpoint (in-memory only)
   */
  updateEndpoint(id: string, updates: Partial<WebhookEndpoint>): boolean {
    const endpoint = this.endpoints.get(id)
    if (!endpoint) return false
    this.endpoints.set(id, { ...endpoint, ...updates })
    logger.info('Webhook endpoint updated (in-memory)', { endpointId: id })
    return true
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  /**
   * Get endpoint by ID
   */
  getEndpoint(id: string): WebhookEndpoint | undefined {
    return this.endpoints.get(id)
  }

  /**
   * Triggers a specific platform event, queuing it for delivery to all subscribed webhooks.
   * 
   * @param event - The type of event (e.g., 'group.created')
   * @param data - The event-specific payload
   * @param metadata - Optional context like groupId or transactionHash
   */
  async triggerEvent(
    event: WebhookEventType,
    data: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata?: WebhookPayload['metadata']
  ): Promise<void> {
    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    }

    logger.info('Webhook event queued', { event, webhookId: payload.id, metadata })

    this.deliveryQueue.push(payload)

    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  /**
   * Process webhook delivery queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) return

    this.isProcessing = true

    while (this.deliveryQueue.length > 0) {
      const payload = this.deliveryQueue.shift()
      if (!payload) continue
      await this.deliverPayload(payload)
    }

    this.isProcessing = false
  }

  /**
   * Deliver webhook payload to all subscribed endpoints
   */
  private async deliverPayload(payload: WebhookPayload): Promise<void> {
    const subscribedEndpoints = Array.from(this.endpoints.values()).filter(
      (endpoint) => endpoint.enabled && endpoint.events.includes(payload.event)
    )

    if (subscribedEndpoints.length === 0) {
      logger.debug('No webhook subscribers for event', { event: payload.event })
      return
    }

    await Promise.allSettled(
      subscribedEndpoints.map((endpoint) => this.deliverToEndpoint(endpoint, payload))
    )
  }

  /**
   * Deliver payload to a specific endpoint with retry logic.
   * Exposed as public so callers (e.g. test endpoint) can target a single endpoint directly.
   */
  async deliverToEndpoint(
    endpoint: WebhookEndpoint,
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<WebhookDeliveryResult> {
    const maxRetries = endpoint.retryConfig?.maxRetries ?? 3
    const retryDelay = endpoint.retryConfig?.retryDelay ?? 1000
    const startTime = Date.now()

    try {
      const signature = this.generateSignature(payload, endpoint.secret)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Id': payload.id,
        'X-Webhook-Timestamp': payload.timestamp,
        'User-Agent': 'Soroban-Ajo-Webhook/1.0',
        ...endpoint.headers,
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      })

      const duration = Date.now() - startTime

      if (response.ok) {
        logger.info('Webhook delivered successfully', {
          endpointId: endpoint.id,
          event: payload.event,
          statusCode: response.status,
          attempt,
        })

        await this.logDelivery(endpoint.id, payload, {
          success: true,
          statusCode: response.status,
          attempts: attempt,
          duration,
        })

        return {
          success: true,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
          attempts: attempt,
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const duration = Date.now() - startTime

      logger.error('Webhook delivery failed', {
        endpointId: endpoint.id,
        event: payload.event,
        attempt,
        maxRetries,
        errorMessage,
      })

      if (attempt < maxRetries) {
        await this.sleep(retryDelay * attempt)
        return this.deliverToEndpoint(endpoint, payload, attempt + 1)
      }

      await this.logDelivery(endpoint.id, payload, {
        success: false,
        error: errorMessage,
        attempts: attempt,
        duration,
      })

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        attempts: attempt,
      }
    }
  }

  /**
   * Persist a delivery log entry to the database
   */
  private async logDelivery(
    subscriptionId: string,
    payload: WebhookPayload,
    result: { success: boolean; statusCode?: number; error?: string; attempts: number; duration?: number }
  ): Promise<void> {
    try {
      await prisma.webhookDeliveryLog.create({
        data: {
          subscriptionId,
          eventType: payload.event,
          eventId: payload.id,
          payload: JSON.stringify(payload),
          statusCode: result.statusCode ?? null,
          success: result.success,
          attempts: result.attempts,
          error: result.error ?? null,
          duration: result.duration ?? null,
        },
      })
    } catch (err) {
      // Non-fatal — don't let logging failures break delivery
      logger.warn('Failed to persist webhook delivery log', { err })
    }
  }

  /**
   * Generate HMAC-SHA256 signature for a webhook payload
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
  }

  /**
   * Verify webhook signature (timing-safe)
   */
  verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSignature)
    // timingSafeEqual requires equal-length buffers
    if (sigBuf.length !== expectedBuf.length) return false
    return crypto.timingSafeEqual(sigBuf, expectedBuf)
  }

  /**
   * Load persisted webhook endpoints from the database into the in-memory cache,
   * then supplement with any endpoints configured via environment variables.
   */
  private async loadEndpoints(): Promise<void> {
    const records = await prisma.webhookSubscription.findMany({ where: { enabled: true } })

    for (const record of records) {
      const endpoint: WebhookEndpoint = {
        id: record.id,
        url: record.url,
        secret: record.secret,
        events: JSON.parse(record.events) as WebhookEventType[],
        enabled: record.enabled,
        retryConfig: record.retryConfig
          ? JSON.parse(record.retryConfig)
          : { maxRetries: 3, retryDelay: 1000 },
        headers: record.headers ? JSON.parse(record.headers) : undefined,
      }
      this.endpoints.set(record.id, endpoint)
    }

    logger.info('Webhook endpoints loaded from database', { count: records.length })

    // Also load from environment variables (in-memory only, not persisted)
    const webhookUrls = process.env.WEBHOOK_URLS?.split(',') ?? []
    const webhookSecrets = process.env.WEBHOOK_SECRETS?.split(',') ?? []

    for (let i = 0; i < webhookUrls.length; i++) {
      const url = webhookUrls[i]?.trim()
      if (url) {
        this.registerEndpoint({
          url,
          secret: webhookSecrets[i]?.trim() || this.generateSecret(),
          events: Object.values(WebhookEventType),
          enabled: true,
        })
      }
    }
  }

  /**
   * Generate a cryptographically secure webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get webhook statistics
   */
  getStats(): { totalEndpoints: number; activeEndpoints: number; queuedEvents: number } {
    return {
      totalEndpoints: this.endpoints.size,
      activeEndpoints: Array.from(this.endpoints.values()).filter((e) => e.enabled).length,
      queuedEvents: this.deliveryQueue.length,
    }
  }
}

// Singleton instance
export const webhookService = new WebhookService()
