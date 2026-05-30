'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getShortUrl } from '@/utils/helpers'
import { Loader2, Calendar, Link as LinkIcon, BarChart2 } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

interface LinkItem {
  id: string
  shortCode: string
  title: string | null
  url: string
}

export function AnalyticsOverview({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryLinkId = searchParams.get('linkId') || ''

  const [selectedLinkId, setSelectedLinkId] = useState<string>(queryLinkId)
  const [datePreset, setDatePreset] = useState<string>('all')

  // Keep state synced with URL changes
  useEffect(() => {
    if (queryLinkId !== selectedLinkId) {
      setSelectedLinkId(queryLinkId)
    }
  }, [queryLinkId])

  // Get date range parameters
  const getDateRange = () => {
    if (datePreset === 'all') return { startDate: undefined, endDate: undefined }
    
    const endDate = new Date()
    const startDate = new Date()
    
    if (datePreset === '7d') {
      startDate.setDate(endDate.getDate() - 7)
    } else if (datePreset === '30d') {
      startDate.setDate(endDate.getDate() - 30)
    }
    
    return { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    }
  }

  const { startDate, endDate } = getDateRange()

  // Fetch list of user's links for the dropdown selector
  const { data: linksData } = useQuery({
    queryKey: ['filter-links', userId],
    queryFn: async () => {
      const res = await fetch('/api/links?page=1&limit=100')
      if (!res.ok) throw new Error('Failed to fetch filter links')
      const json = await res.json()
      return json.data.links as LinkItem[]
    }
  })

  // Fetch analytics filtered by selected link and date ranges
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', userId, selectedLinkId, datePreset],
    queryFn: async () => {
      let url = `/api/analytics?`
      const params = new URLSearchParams()
      if (selectedLinkId) params.set('linkId', selectedLinkId)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      
      const res = await fetch(url + params.toString())
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const json = await res.json()
      return json.data
    },
  })

  const handleLinkChange = (id: string) => {
    setSelectedLinkId(id)
    const newParams = new URLSearchParams(searchParams.toString())
    if (id) {
      newParams.set('linkId', id)
    } else {
      newParams.delete('linkId')
    }
    router.push(`/analytics?${newParams.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Premium Dynamic Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card/65 backdrop-blur-md p-4 shadow-sm">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" /> Filter by Link
          </label>
          <select
            value={selectedLinkId}
            onChange={(e) => handleLinkChange(e.target.value)}
            className="w-full sm:max-w-xs rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            <option value="">All Links</option>
            {linksData?.map((link) => (
              <option key={link.id} value={link.id}>
                {link.title || link.shortCode} ({link.shortCode})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Time Range
          </label>
          <div className="flex rounded-lg border border-input p-0.5 bg-background">
            {[
              { id: 'all', name: 'All Time' },
              { id: '7d', name: '7 Days' },
              { id: '30d', name: '30 Days' },
            ].map((preset) => (
              <Button
                key={preset.id}
                variant={datePreset === preset.id ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setDatePreset(preset.id)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalClicks ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.uniqueVisitors ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Clicks by Country</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.clicksByCountry && data.clicksByCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.clicksByCountry.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="country" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Clicks by Device</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.clicksByDevice && data.clicksByDevice.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.clicksByDevice}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="device"
                  >
                    {data.clicksByDevice.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Clicks by Browser</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.clicksByBrowser && data.clicksByBrowser.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.clicksByBrowser.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="browser" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.clicksByReferrer && data.clicksByReferrer.length > 0 ? (
              <div className="space-y-4 py-2">
                {data.clicksByReferrer.slice(0, 10).map((ref: { referrer: string; count: number }) => (
                  <div key={ref.referrer} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{ref.referrer || 'Direct / Email'}</span>
                    <span className="text-sm text-muted-foreground">{ref.count} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
