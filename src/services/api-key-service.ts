import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/utils/helpers'
import { createHash } from 'crypto'

export class ApiKeyService {
  static async create(userId: string, name: string): Promise<{ key: string; id: string; name: string }> {
    const rawKey = generateApiKey()
    const hashedKey = createHash('sha256').update(rawKey).digest('hex')

    const apiKey = await prisma.apiKey.create({
      data: {
        key: hashedKey,
        name,
        userId,
      },
    })

    return {
      key: rawKey, // Return raw key once to the caller
      id: apiKey.id,
      name: apiKey.name,
    }
  }

  static async validate(key: string): Promise<{ id: string; userId: string } | null> {
    const hashedKey = createHash('sha256').update(key).digest('hex')
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
    })

    if (!apiKey || apiKey.revoked) {
      return null
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      id: apiKey.id,
      userId: apiKey.userId,
    }
  }

  static async getUserApiKeys(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        lastUsedAt: true,
        revoked: true,
        createdAt: true,
      },
    })
  }

  static async revoke(id: string, userId: string): Promise<void> {
    await prisma.apiKey.updateMany({
      where: { id, userId },
      data: { revoked: true },
    })
  }

  static async delete(id: string, userId: string): Promise<void> {
    await prisma.apiKey.deleteMany({
      where: { id, userId },
    })
  }
}
