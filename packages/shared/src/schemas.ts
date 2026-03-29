/**
 * Shared Validation Schemas
 * Used for consistent validation across frontend and backend
 */

import { z } from 'zod'

// Group Schemas
export const GroupCreateSchema = z.object({
  groupName: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  cycleLength: z.number().min(1).max(365),
  contributionAmount: z.number().positive().max(1000000),
  maxMembers: z.number().min(2).max(50),
  frequency: z.enum(['weekly', 'monthly']).optional(),
  duration: z.number().min(1).optional(),
})

export type GroupCreateInput = z.infer<typeof GroupCreateSchema>

// User Schemas
export const UserCreateSchema = z.object({
  walletAddress: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
})

export type UserCreateInput = z.infer<typeof UserCreateSchema>

// Transaction Schemas
export const TransactionCreateSchema = z.object({
  groupId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['contribution', 'payout', 'penalty', 'refund']),
})

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>

// Pagination Schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof PaginationSchema>
