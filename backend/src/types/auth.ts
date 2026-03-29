import { Request } from 'express'

/**
 * Extended Express Request with authentication context
 */
export interface AuthRequest extends Request {
  user?: {
    publicKey?: string
    walletAddress?: string
    userId?: string
    email?: string
    kycLevel?: number
    isAdmin?: boolean
  }
  body: Record<string, unknown>
}

/**
 * Authentication context extracted from request
 */
export interface AuthContext {
  userId: string
  publicKey: string
  walletAddress: string
  email?: string
  kycLevel?: number
  isAdmin: boolean
}

/**
 * KYC verification data
 */
export interface KYCData {
  level: number
  verified: boolean
  expiresAt?: Date
  metadata?: Record<string, unknown>
}
