import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AnalyticsService } from '@/services/analytics-service'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')!
  const { searchParams } = new URL(request.url)

  const linkId = searchParams.get('linkId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (linkId) {
    try {
      const analytics = await AnalyticsService.getLinkAnalytics(
        linkId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      )
      return successResponse(analytics)
    } catch (error) {
      return errorResponse('Failed to fetch analytics', 500)
    }
  }

  try {
    const stats = await AnalyticsService.getUserStats(userId)
    const analytics = await AnalyticsService.getUserAnalytics(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )
    return successResponse({
      ...stats,
      ...analytics,
    })
  } catch (error) {
    return errorResponse('Failed to fetch stats', 500)
  }
}
