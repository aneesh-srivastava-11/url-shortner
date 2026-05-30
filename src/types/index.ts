export interface Link {
  id: string
  url: string
  shortCode: string
  title: string | null
  userId: string | null
  clicks: number
  active: boolean
  expiresAt: Date | null
  password: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Click {
  id: string
  linkId: string
  ip: string | null
  country: string | null
  city: string | null
  region: string | null
  device: string | null
  browser: string | null
  os: string | null
  referrer: string | null
  userAgent: string | null
  clickedAt: Date
}

export interface QRCode {
  id: string
  linkId: string
  data: string
  format: string
  size: number
  createdAt: Date
}

export interface ApiKey {
  id: string
  key: string
  name: string
  userId: string
  lastUsedAt: Date | null
  revoked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsData {
  totalClicks: number
  uniqueVisitors: number
  clicksByCountry: { country: string; count: number }[]
  clicksByDevice: { device: string; count: number }[]
  clicksByBrowser: { browser: string; count: number }[]
  clicksByOS: { os: string; count: number }[]
  clicksByReferrer: { referrer: string; count: number }[]
  clicksOverTime: { date: string; count: number }[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
