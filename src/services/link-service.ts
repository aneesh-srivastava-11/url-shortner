import { prisma } from '@/lib/prisma'
import { redis, REDIS_KEYS, REDIS_TTL } from '@/lib/redis'
import { generateShortCode } from '@/utils/helpers'
import type { Link } from '@/types'
import type { CreateLinkInput, UpdateLinkInput } from '@/validations/link'

export class LinkService {
  static async create(input: CreateLinkInput, userId?: string): Promise<Link> {
    let shortCode = input.customAlias || generateShortCode()

    if (input.customAlias) {
      const exists = await this.findByShortCode(shortCode)
      if (exists) {
        throw new Error('Custom alias already taken')
      }
    } else {
      let attempts = 0
      let exists = await this.findByShortCode(shortCode)
      while (exists && attempts < 5) {
        shortCode = generateShortCode()
        exists = await this.findByShortCode(shortCode)
        attempts++
      }
      if (exists) {
        throw new Error('Failed to generate a unique short link. Please try again.')
      }
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null

    const link = await prisma.link.create({
      data: {
        url: input.url,
        shortCode,
        title: input.title || null,
        userId: userId || null,
        expiresAt,
        password: input.password || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
      },
    })

    await redis.set(REDIS_KEYS.link(shortCode), JSON.stringify(link), { ex: REDIS_TTL.link })

    if (userId) {
      const keys = await redis.keys(`${REDIS_KEYS.userLinks(userId)}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    }

    return link
  }

  static async findByShortCode(shortCode: string): Promise<Link | null> {
    const cached = await redis.get<string>(REDIS_KEYS.link(shortCode))
    if (cached) {
      return JSON.parse(cached)
    }

    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (link) {
      await redis.set(REDIS_KEYS.link(shortCode), JSON.stringify(link), { ex: REDIS_TTL.link })
    }

    return link
  }

  static async findById(id: string): Promise<Link | null> {
    return prisma.link.findUnique({
      where: { id },
    })
  }

  static async update(id: string, input: UpdateLinkInput, userId: string): Promise<Link> {
    const link = await prisma.link.findFirst({
      where: { id, userId },
    })

    if (!link) {
      throw new Error('Link not found')
    }

    if (input.customAlias && input.customAlias !== link.shortCode) {
      const exists = await this.findByShortCode(input.customAlias)
      if (exists) {
        throw new Error('Custom alias already taken')
      }
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined

    const updated = await prisma.link.update({
      where: { id },
      data: {
        ...(input.url && { url: input.url }),
        ...(input.customAlias && { shortCode: input.customAlias }),
        ...(input.title !== undefined && { title: input.title || null }),
        ...(expiresAt !== undefined && { expiresAt }),
        ...(input.password !== undefined && { password: input.password || null }),
        ...(input.utmSource !== undefined && { utmSource: input.utmSource || null }),
        ...(input.utmMedium !== undefined && { utmMedium: input.utmMedium || null }),
        ...(input.utmCampaign !== undefined && { utmCampaign: input.utmCampaign || null }),
      },
    })

    await redis.del(REDIS_KEYS.link(link.shortCode))
    if (updated.shortCode !== link.shortCode) {
      await redis.set(REDIS_KEYS.link(updated.shortCode), JSON.stringify(updated), { ex: REDIS_TTL.link })
    }

    const keys = await redis.keys(`${REDIS_KEYS.userLinks(userId)}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    return updated
  }

  static async delete(id: string, userId: string): Promise<void> {
    const link = await prisma.link.findFirst({
      where: { id, userId },
    })

    if (!link) {
      throw new Error('Link not found')
    }

    await prisma.link.delete({
      where: { id },
    })

    await redis.del(REDIS_KEYS.link(link.shortCode))
    const keys = await redis.keys(`${REDIS_KEYS.userLinks(userId)}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  static async getUserLinks(userId: string, page = 1, limit = 20) {
    const cacheKey = `${REDIS_KEYS.userLinks(userId)}:p${page}:l${limit}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return JSON.parse(cached as string)
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.link.count({
        where: { userId },
      }),
    ])

    const result = { links, total, page, totalPages: Math.ceil(total / limit) }

    await redis.set(cacheKey, JSON.stringify(result), { ex: REDIS_TTL.analytics })

    return result
  }

  static async incrementClicks(shortCode: string): Promise<void> {
    await prisma.link.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    })

    await redis.del(REDIS_KEYS.link(shortCode))
  }

  static isExpired(link: Link): boolean {
    if (!link.expiresAt) return false
    return new Date() > link.expiresAt
  }
}
