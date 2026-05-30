'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, MousePointerClick, Users, Activity } from 'lucide-react'
import { formatNumber } from '@/utils/helpers'

interface Stats {
  totalLinks: number
  totalClicks: number
  activeLinks: number
}

export function DashboardStats({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const json = await res.json()
      return json.data as Stats
    },
  })

  const stats = [
    {
      title: 'Total Links',
      value: data?.totalLinks || 0,
      icon: Link,
      description: 'Created links',
    },
    {
      title: 'Total Clicks',
      value: data?.totalClicks || 0,
      icon: MousePointerClick,
      description: 'All time clicks',
    },
    {
      title: 'Active Links',
      value: data?.activeLinks || 0,
      icon: Activity,
      description: 'Currently active',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
