/**
 * Typed API response envelopes and discriminated unions for all backend endpoints.
 * Import domain types from ./index rather than duplicating them here.
 */

import type { Group, Member, Transaction, GroupStatus } from './index'
import type { UserProfile } from './profile'

// ---------------------------------------------------------------------------
// Generic envelope
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ---------------------------------------------------------------------------
// Discriminated result — use instead of try/catch at call sites
// ---------------------------------------------------------------------------

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// ---------------------------------------------------------------------------
// Shared pagination
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Endpoint-specific response shapes
// ---------------------------------------------------------------------------

export interface GroupListResponse {
  groups: Group[]
  total: number
  page: number
  limit: number
}

export interface GroupDetailResponse {
  group: Group
  status: GroupStatus
  members: Member[]
}

export interface TransactionListResponse extends PaginatedResponse<Transaction> {}

export interface ProfileResponse {
  profile: UserProfile
}

export interface AuthTokenResponse {
  token: string
  expiresAt: string
  twoFactorEnabled: boolean
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down'
  version: string
  uptime: number
}
