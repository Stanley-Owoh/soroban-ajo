/**
 * Shared Types and Interfaces
 * Used across frontend, backend, and contracts
 */

// Group Types
export interface Group {
  id: string
  name: string
  description?: string
  creatorId: string
  cycleLength: number
  contributionAmount: number
  maxMembers: number
  currentMembers: number
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface GroupCreateInput {
  groupName: string
  description?: string
  cycleLength: number
  contributionAmount: number
  maxMembers: number
  frequency?: 'weekly' | 'monthly'
  duration?: number
}

// User Types
export interface User {
  id: string
  walletAddress: string
  email?: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Transaction Types
export interface Transaction {
  id: string
  groupId: string
  userId: string
  amount: number
  type: 'contribution' | 'payout' | 'penalty' | 'refund'
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  requestId?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Error Types
export interface ApiError {
  success: false
  error: string
  code: string
  statusCode: number
  details?: Record<string, any>
  requestId?: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// Gamification Types
export interface Achievement {
  id: string
  userId: string
  type: string
  title: string
  description: string
  unlockedAt: Date
}

export interface UserStats {
  userId: string
  totalContributions: number
  groupsJoined: number
  achievements: number
  reliabilityScore: number
}
