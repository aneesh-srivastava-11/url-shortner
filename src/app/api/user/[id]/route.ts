import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiKeyService } from '@/services/api-key-service'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-id')!
  const { id } = await params

  try {
    await ApiKeyService.revoke(id, userId)
    return successResponse(null, 'API key revoked')
  } catch (error) {
    return errorResponse('Failed to revoke API key', 500)
  }
}
