/**
 * Re-exports the validated config as `env` for consistency with the issue spec.
 * Prefer importing named section exports (sorobanConfig, serverConfig, etc.)
 * from './index' for more granular access.
 */
export { config as env, type Config } from './index'
