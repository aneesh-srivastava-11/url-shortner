import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ApiKeyService } from '@/services/api-key-service'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { errorResponse } from '@/lib/api-response'

export async function apiMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  const rateLimitResult = await rateLimit(ip)
  const headers = getRateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.success) {
    return errorResponse('Rate limit exceeded', 429)
  }

  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (apiKey) {
    const validated = await ApiKeyService.validate(apiKey)
    if (!validated) {
      return errorResponse('Invalid or revoked API key', 401)
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', validated.userId)
    requestHeaders.set('x-auth-type', 'api-key')

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  const session = await auth()

  if (!session?.user?.id) {
    return errorResponse('Authentication required', 401)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user.id)
  requestHeaders.set('x-auth-type', 'session')

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
