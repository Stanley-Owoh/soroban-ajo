/**
 * Central barrel for all backend type definitions.
 */

export type { AuthRequest, AuthContext, KYCData } from './auth'
export type { WebhookEvent, WebhookConfig, WebhookDelivery, WebhookLog } from './webhook'
export type {
  PaginationStrategy,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  OffsetPaginationParams,
  OffsetPaginationMeta,
  CursorPaginationParams,
  CursorPaginationMeta,
} from './pagination'
export type { ActivityEventType, ActivityActor, ActivityMetadata, ActivityRecord, ActivityFeedQuery } from './activity.types'
export {
  UserLevel,
  AchievementCategory,
  ChallengeType,
  ActivityType,
  RewardType,
  ReferenceType,
  LEVEL_THRESHOLDS,
  POINTS_CONFIG,
} from './gamification'
export type { AchievementRequirement, ChallengeRequirement } from './gamification'

// ---------------------------------------------------------------------------
// Shared domain types (not tied to a specific service)
// ---------------------------------------------------------------------------

export type StellarNetwork = 'testnet' | 'mainnet'

export type GroupStatus = 'active' | 'completed' | 'paused'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'completed'

export type TransactionType = 'contribution' | 'payout' | 'refund'

/** Standard API success/error envelope used by all Express route handlers */
export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
