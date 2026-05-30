import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LinkService } from '@/services/link-service'
import { createLinkSchema } from '@/validations/link'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || undefined

  const body = await request.json()
  const validation = createLinkSchema.safeParse(body)

  if (!validation.success) {
    return errorResponse(validation.error.issues[0].message)
  }

  try {
    const link = await LinkService.create(validation.data, userId)
    return successResponse(link, 'Link created successfully')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Failed to create link', 500)
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return unauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const result = await LinkService.getUserLinks(userId, page, limit)
    return successResponse(result)
  } catch (error) {
    return errorResponse('Failed to fetch links', 500)
  }
}
