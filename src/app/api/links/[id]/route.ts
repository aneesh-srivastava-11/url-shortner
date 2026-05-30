import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LinkService } from '@/services/link-service'
import { updateLinkSchema } from '@/validations/link'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-id')!
  const { id } = await params

  const body = await request.json()
  const validation = updateLinkSchema.safeParse(body)

  if (!validation.success) {
    return errorResponse(validation.error.issues[0].message)
  }

  try {
    const link = await LinkService.update(id, validation.data, userId)
    return successResponse(link, 'Link updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Link not found') {
      return notFoundResponse()
    }
    return errorResponse('Failed to update link', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-id')!
  const { id } = await params

  try {
    await LinkService.delete(id, userId)
    return successResponse(null, 'Link deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Link not found') {
      return notFoundResponse()
    }
    return errorResponse('Failed to delete link', 500)
  }
}
