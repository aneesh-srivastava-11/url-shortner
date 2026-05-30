import { redis, REDIS_KEYS, REDIS_TTL } from '@/lib/redis'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
}

export async function rateLimit(identifier: string, config = defaultConfig): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const key = REDIS_KEYS.rateLimit(identifier)

  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, REDIS_TTL.rateLimit)
  }

  const remaining = Math.max(0, config.maxRequests - current)
  const reset = Math.floor(Date.now() / 1000) + config.windowMs / 1000

  if (current > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset,
  }
}

export function getRateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}
