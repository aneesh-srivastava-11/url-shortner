import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiKeyService } from '@/services/api-key-service'
import { apiKeySchema } from '@/validations/link'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')!
  const body = await request.json()

  const validation = apiKeySchema.safeParse(body)

  if (!validation.success) {
    return errorResponse(validation.error.issues[0].message)
  }

  try {
    const apiKey = await ApiKeyService.create(userId, validation.data.name)
    return successResponse(apiKey, 'API key created')
  } catch (error) {
    return errorResponse('Failed to create API key', 500)
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')!

  try {
    const apiKeys = await ApiKeyService.getUserApiKeys(userId)
    const maskedKeys = apiKeys.map((k) => ({
      ...k,
      key: `lf_••••••••••••••••${k.key.slice(-4)}`
    }))
    return successResponse(maskedKeys)
  } catch (error) {
    return errorResponse('Failed to fetch API keys', 500)
  }
}
