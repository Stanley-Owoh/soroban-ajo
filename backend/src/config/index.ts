import { z } from 'zod'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('Config')

// Environment variable schema with validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Soroban/Stellar Configuration
  SOROBAN_RPC_URL: z.string().url(),
  SOROBAN_NETWORK_PASSPHRASE: z.string(),
  SOROBAN_CONTRACT_ID: z.string().min(1),
  SOROBAN_NETWORK: z.enum(['testnet', 'mainnet', 'futurenet']).default('testnet'),
  SOROBAN_SIMULATION_ACCOUNT: z.string().optional(),

  // JWT Authentication
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Email (SendGrid)
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),

  // Webhook Configuration
  WEBHOOK_URLS: z.string().optional(),
  WEBHOOK_SECRETS: z.string().optional(),
})

export type Config = z.infer<typeof envSchema>

// Validate and export configuration
function loadConfig(): Config {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid environment configuration')
      error.errors.forEach((err) => {
        logger.error('Environment configuration issue', {
          path: err.path.join('.'),
          message: err.message,
        })
      })
      process.exit(1)
    }
    throw error
  }
}

export const config = loadConfig()

// Export specific config sections for easier access
export const sorobanConfig = {
  rpcUrl: config.SOROBAN_RPC_URL,
  networkPassphrase: config.SOROBAN_NETWORK_PASSPHRASE,
  contractId: config.SOROBAN_CONTRACT_ID,
  network: config.SOROBAN_NETWORK,
  simulationAccount: config.SOROBAN_SIMULATION_ACCOUNT,
} as const

export const serverConfig = {
  port: config.PORT,
  nodeEnv: config.NODE_ENV,
  frontendUrl: config.FRONTEND_URL,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
} as const

export const authConfig = {
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
} as const

export const dbConfig = {
  databaseUrl: config.DATABASE_URL,
  redisUrl: config.REDIS_URL,
} as const

export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
} as const

export const emailConfig = {
  sendgridApiKey: config.SENDGRID_API_KEY,
  from: config.EMAIL_FROM,
} as const

export const webhookConfig = {
  urls: config.WEBHOOK_URLS?.split(',').filter(Boolean) ?? [],
  secrets: config.WEBHOOK_SECRETS?.split(',').filter(Boolean) ?? [],
} as const
