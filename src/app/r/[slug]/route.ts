import { NextResponse, after } from 'next/server'
import type { NextRequest } from 'next/server'
import { LinkService } from '@/services/link-service'
import { AnalyticsService } from '@/services/analytics-service'
import { parseUserAgent, getCountryFromIP } from '@/utils/analytics'
import { redis, REDIS_KEYS } from '@/lib/redis'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Pre-extract client request details to avoid reading headers after request resolves
  const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const ip = rawIp.split(',')[0].trim() || undefined
  const userAgent = request.headers.get('user-agent') || undefined
  const referrer = request.headers.get('referer') || undefined
  const countryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || undefined

  const cached = await redis.get<string>(REDIS_KEYS.link(slug))

  if (cached) {
    const link = JSON.parse(cached)

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    if (!link.active) {
      return NextResponse.json({ error: 'Link deactivated' }, { status: 404 })
    }

    after(() => {
      trackClick(link.id, slug, { ip, userAgent, referrer, countryHeader }).catch(console.error)
    })

    return NextResponse.redirect(link.url)
  }

  const link = await LinkService.findByShortCode(slug)

  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  if (LinkService.isExpired(link)) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  }

  if (!link.active) {
    return NextResponse.json({ error: 'Link deactivated' }, { status: 404 })
  }

  after(() => {
    trackClick(link.id, slug, { ip, userAgent, referrer, countryHeader }).catch(console.error)
  })

  return NextResponse.redirect(link.url)
}

async function trackClick(
  linkId: string,
  shortCode: string,
  data: { ip?: string; userAgent?: string; referrer?: string; countryHeader?: string }
) {
  const { device, browser, os } = parseUserAgent(data.userAgent)
  const country = data.countryHeader || (await getCountryFromIP(data.ip)) || undefined

  await AnalyticsService.trackClick(linkId, {
    ip: data.ip,
    country,
    device,
    browser,
    os,
    referrer: data.referrer,
    userAgent: data.userAgent,
  })

  await LinkService.incrementClicks(shortCode)
}
