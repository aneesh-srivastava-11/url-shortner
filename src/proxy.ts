import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiMiddleware } from './middleware/api'

export async function proxy(request: NextRequest) {
  const isApiPage = request.nextUrl.pathname.startsWith('/api') &&
                    !request.nextUrl.pathname.startsWith('/api/auth')

  if (isApiPage) {
    return apiMiddleware(request)
  }

  const session = await auth()
  const isAuthenticated = !!session?.user

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/links') ||
                           request.nextUrl.pathname.startsWith('/analytics') ||
                           request.nextUrl.pathname.startsWith('/settings')

  if (isDashboardPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/links/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/api/:path*',
  ],
}
