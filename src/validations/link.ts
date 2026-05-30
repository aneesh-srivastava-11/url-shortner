import { z } from 'zod'

export const createLinkSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  customAlias: z
    .string()
    .min(3, 'Alias must be at least 3 characters')
    .max(20, 'Alias must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
  title: z.string().max(100).optional().or(z.literal('')),
  expiresAt: z.string().datetime().optional().or(z.literal('')),
  password: z.string().max(50).optional().or(z.literal('')),
  utmSource: z.string().max(50).optional().or(z.literal('')),
  utmMedium: z.string().max(50).optional().or(z.literal('')),
  utmCampaign: z.string().max(50).optional().or(z.literal('')),
})

export const updateLinkSchema = createLinkSchema.partial()

export const apiKeySchema = z.object({
  name: z.string().min(3).max(50),
})

export const analyticsQuerySchema = z.object({
  linkId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type ApiKeyInput = z.infer<typeof apiKeySchema>
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>
