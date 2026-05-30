import { Redis } from '@upstash/redis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export const REDIS_KEYS = {
  link: (code: string) => `link:${code}`,
  linkExists: (code: string) => `link:exists:${code}`,
  analytics: (linkId: string) => `analytics:${linkId}`,
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  userLinks: (userId: string) => `user:${userId}:links`,
}

export const REDIS_TTL = {
  link: 60 * 60 * 24, // 24 hours
  rateLimit: 60, // 1 minute
  analytics: 60 * 5, // 5 minutes
}
