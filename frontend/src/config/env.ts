import { z } from 'zod'

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Ajo'),

  // Soroban / Stellar
  NEXT_PUBLIC_SOROBAN_RPC_URL: z.string().url(),
  NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE: z.string().min(1),
  NEXT_PUBLIC_SOROBAN_CONTRACT_ID: z.string().min(1),

  // Backend API
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),

  // Push notifications (optional)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DEBUG: z.string().optional(),
})

type FrontendEnv = z.infer<typeof envSchema>

function loadEnv(): FrontendEnv {
  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_SOROBAN_CONTRACT_ID: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DEBUG: process.env.NEXT_PUBLIC_SENTRY_DEBUG,
  })

  if (!result.success) {
    const missing = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')
    throw new Error(`Invalid frontend environment configuration:\n${missing}`)
  }

  return result.data
}

export const env = loadEnv()

export const sorobanEnv = {
  rpcUrl: env.NEXT_PUBLIC_SOROBAN_RPC_URL,
  networkPassphrase: env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE,
  contractId: env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID,
} as const

export const appEnv = {
  url: env.NEXT_PUBLIC_APP_URL,
  name: env.NEXT_PUBLIC_APP_NAME,
  apiUrl: env.NEXT_PUBLIC_API_URL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
} as const
