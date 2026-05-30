import { prisma } from '@/lib/prisma'
import { redis, REDIS_KEYS, REDIS_TTL } from '@/lib/redis'
import type { AnalyticsData } from '@/types'

export class AnalyticsService {
  static async trackClick(linkId: string, data: {
    ip?: string
    country?: string
    city?: string
    region?: string
    device?: string
    browser?: string
    os?: string
    referrer?: string
    userAgent?: string
  }): Promise<void> {
    await prisma.click.create({
      data: {
        linkId,
        ...data,
      },
    })

    // Invalidate all cached analytics variations for this link
    const keys = await redis.keys(`${REDIS_KEYS.analytics(linkId)}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  static async getLinkAnalytics(linkId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    const startStr = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const endStr = endDate ? endDate.toISOString().split('T')[0] : 'all'
    const cacheKey = `${REDIS_KEYS.analytics(linkId)}:${startStr}:${endStr}`
    const cached = await redis.get<AnalyticsData>(cacheKey)

    if (cached) return cached

    const where = {
      linkId,
      ...(startDate && { clickedAt: { gte: startDate } }),
      ...(endDate && { clickedAt: { lte: endDate } }),
    }

    const [totalClicks, clicksByCountry, clicksByDevice, clicksByBrowser, clicksByOS, clicksByReferrer, clicksOverTime] = await Promise.all([
      prisma.click.count({ where }),

      prisma.click.groupBy({
        by: ['country'],
        where,
        _count: true,
        orderBy: { _count: { country: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['device'],
        where,
        _count: true,
        orderBy: { _count: { device: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['browser'],
        where,
        _count: true,
        orderBy: { _count: { browser: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['os'],
        where,
        _count: true,
        orderBy: { _count: { os: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['referrer'],
        where,
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),

      prisma.click.groupBy({
        by: ['clickedAt'],
        where,
        _count: true,
        orderBy: { clickedAt: 'asc' },
      }),
    ])

    const uniqueVisitors = await prisma.click.groupBy({
      by: ['ip'],
      where: {
        ...where,
        ip: { not: null },
      },
      _count: true,
    }).then((results) => results.length)

    const analytics: AnalyticsData = {
      totalClicks,
      uniqueVisitors,
      clicksByCountry: clicksByCountry.map((c) => ({ country: c.country || 'Unknown', count: c._count })),
      clicksByDevice: clicksByDevice.map((c) => ({ device: c.device || 'Unknown', count: c._count })),
      clicksByBrowser: clicksByBrowser.map((c) => ({ browser: c.browser || 'Unknown', count: c._count })),
      clicksByOS: clicksByOS.map((c) => ({ os: c.os || 'Unknown', count: c._count })),
      clicksByReferrer: clicksByReferrer.map((c) => ({ referrer: c.referrer || 'Direct', count: c._count })),
      clicksOverTime: clicksOverTime.map((c) => ({
        date: c.clickedAt.toISOString().split('T')[0],
        count: c._count,
      })),
    }

    await redis.set(cacheKey, JSON.stringify(analytics), { ex: REDIS_TTL.analytics })

    return analytics
  }

  static async getUserStats(userId: string): Promise<{
    totalLinks: number
    totalClicks: number
    activeLinks: number
    topLinks: { shortCode: string; clicks: number; title: string | null }[]
  }> {
    const [totalLinks, totalClicks, activeLinks, topLinks] = await Promise.all([
      prisma.link.count({ where: { userId } }),
      prisma.link.aggregate({
        where: { userId },
        _sum: { clicks: true },
      }),
      prisma.link.count({ where: { userId, active: true } }),
      prisma.link.findMany({
        where: { userId },
        orderBy: { clicks: 'desc' },
        take: 5,
        select: { shortCode: true, clicks: true, title: true },
      }),
    ])

    return {
      totalLinks,
      totalClicks: totalClicks._sum.clicks || 0,
      activeLinks,
      topLinks,
    }
  }

  static async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    const startStr = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const endStr = endDate ? endDate.toISOString().split('T')[0] : 'all'
    const cacheKey = `analytics:user:${userId}:${startStr}:${endStr}`
    const cached = await redis.get<AnalyticsData>(cacheKey)

    if (cached) return cached

    const where = {
      link: {
        userId,
      },
      ...(startDate && { clickedAt: { gte: startDate } }),
      ...(endDate && { clickedAt: { lte: endDate } }),
    }

    const [totalClicks, clicksByCountry, clicksByDevice, clicksByBrowser, clicksByOS, clicksByReferrer, clicksOverTime] = await Promise.all([
      prisma.click.count({ where }),

      prisma.click.groupBy({
        by: ['country'],
        where,
        _count: true,
        orderBy: { _count: { country: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['device'],
        where,
        _count: true,
        orderBy: { _count: { device: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['browser'],
        where,
        _count: true,
        orderBy: { _count: { browser: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['os'],
        where,
        _count: true,
        orderBy: { _count: { os: 'desc' } },
      }),

      prisma.click.groupBy({
        by: ['referrer'],
        where,
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),

      prisma.click.groupBy({
        by: ['clickedAt'],
        where,
        _count: true,
        orderBy: { clickedAt: 'asc' },
      }),
    ])

    const uniqueVisitors = await prisma.click.groupBy({
      by: ['ip'],
      where: {
        ...where,
        ip: { not: null },
      },
      _count: true,
    }).then((results) => results.length)

    const analytics: AnalyticsData = {
      totalClicks,
      uniqueVisitors,
      clicksByCountry: clicksByCountry.map((c) => ({ country: c.country || 'Unknown', count: c._count })),
      clicksByDevice: clicksByDevice.map((c) => ({ device: c.device || 'Unknown', count: c._count })),
      clicksByBrowser: clicksByBrowser.map((c) => ({ browser: c.browser || 'Unknown', count: c._count })),
      clicksByOS: clicksByOS.map((c) => ({ os: c.os || 'Unknown', count: c._count })),
      clicksByReferrer: clicksByReferrer.map((c) => ({ referrer: c.referrer || 'Direct', count: c._count })),
      clicksOverTime: clicksOverTime.map((c) => ({
        date: c.clickedAt.toISOString().split('T')[0],
        count: c._count,
      })),
    }

    await redis.set(cacheKey, JSON.stringify(analytics), { ex: REDIS_TTL.analytics })

    return analytics
  }
}
