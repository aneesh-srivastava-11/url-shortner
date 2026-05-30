import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SHORT_DOMAIN: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  QR_CODE_SIZE: z.string().default('256'),
})

export type Env = z.infer<typeof envSchema>

let env: Env | null = null

export function getEnv() {
  if (env) return env

  try {
    env = envSchema.parse(process.env)
    return env
  } catch (error) {
    console.error('Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}
