import { customAlphabet } from 'nanoid'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DEFAULT_LENGTH = 8

export const generateShortCode = (length = DEFAULT_LENGTH): string => {
  const nanoid = customAlphabet(ALPHABET, length)
  return nanoid()
}

export const generateApiKey = (): string => {
  const nanoid = customAlphabet(ALPHABET, 32)
  return `lf_${nanoid()}`
}

export const getShortUrl = (shortCode: string): string => {
  const domain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || 'localhost:3000'
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${domain}/r/${shortCode}`
}

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export const truncateUrl = (url: string, maxLength = 30): string => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}
