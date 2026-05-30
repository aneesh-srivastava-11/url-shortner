import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import type { QRCode as QRCodeType } from '@/types'

export class QRService {
  static async generate(linkId: string, url: string, size = 256): Promise<QRCodeType> {
    const existing = await prisma.qRCode.findUnique({
      where: { linkId },
    })

    if (existing) {
      return existing
    }

    const qrData = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    const qrCode = await prisma.qRCode.create({
      data: {
        linkId,
        data: qrData,
        size,
      },
    })

    return qrCode
  }

  static async getByLinkId(linkId: string): Promise<QRCodeType | null> {
    return prisma.qRCode.findUnique({
      where: { linkId },
    })
  }

  static async delete(linkId: string): Promise<void> {
    await prisma.qRCode.delete({
      where: { linkId },
    })
  }
}
