import { z } from 'zod'

/**
 * Validate a subset of environment variables against a Zod schema.
 * Exits the process with a clear error message on failure.
 *
 * @example
 * const workerEnv = validateEnv(z.object({ REDIS_URL: z.string().url() }))
 */
export function validateEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n')
    console.error(`Missing or invalid environment variables:\n${issues}`)
    process.exit(1)
  }
  return result.data as z.infer<T>
}
