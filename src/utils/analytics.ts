import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  device: string
  browser: string
  os: string
}

export const parseUserAgent = (userAgent: string | undefined): DeviceInfo => {
  if (!userAgent) {
    return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }
  }

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const device = result.device.type || (result.os.name === 'iOS' || result.os.name === 'Android' ? 'Mobile' : 'Desktop')
  const browser = result.browser.name || 'Unknown'
  const os = result.os.name || 'Unknown'

  return { device, browser, os }
}

export const getCountryFromIP = async (ip: string | undefined): Promise<string | null> => {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country`)
    const data = await response.json()
    return data.country || null
  } catch {
    return null
  }
}
