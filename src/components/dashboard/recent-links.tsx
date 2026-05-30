'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getShortUrl, formatDate, truncateUrl } from '@/utils/helpers'

interface LinkData {
  id: string
  url: string
  shortCode: string
  title: string | null
  clicks: number
  createdAt: string
}

export function RecentLinks({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-links', userId],
    queryFn: async () => {
      const res = await fetch('/api/links?page=1&limit=5')
      if (!res.ok) throw new Error('Failed to fetch links')
      const json = await res.json()
      return json.data as { links: LinkData[] }
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Links</CardTitle>
        <Link href="/dashboard/links">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {data?.links && data.links.length > 0 ? (
          <div className="space-y-4">
            {data.links.map((link) => (
              <div key={link.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {link.title || truncateUrl(link.url)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getShortUrl(link.shortCode)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{link.clicks} clicks</p>
                  <p className="text-xs text-muted-foreground">{formatDate(link.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No links yet. Create your first link!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
