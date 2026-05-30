import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { QRService } from '@/services/qr-service'
import { LinkService } from '@/services/link-service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getShortUrl } from '@/utils/helpers'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')!
  const body = await request.json()

  const { linkId, size } = body

  if (!linkId) {
    return errorResponse('Link ID is required')
  }

  try {
    const link = await LinkService.findById(linkId)

    if (!link) {
      return errorResponse('Link not found', 404)
    }

    if (link.userId && link.userId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    const shortUrl = getShortUrl(link.shortCode)
    const qrCode = await QRService.generate(linkId, shortUrl, size || 256)

    return successResponse(qrCode, 'QR code generated')
  } catch (error) {
    return errorResponse('Failed to generate QR code', 500)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get('linkId')

  if (!linkId) {
    return errorResponse('Link ID is required')
  }

  try {
    const qrCode = await QRService.getByLinkId(linkId)

    if (!qrCode) {
      return errorResponse('QR code not found', 404)
    }

    return successResponse(qrCode)
  } catch (error) {
    return errorResponse('Failed to fetch QR code', 500)
  }
}
