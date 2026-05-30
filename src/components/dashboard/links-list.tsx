'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { getShortUrl, formatDate, truncateUrl } from '@/utils/helpers'
import { Copy, Trash2, QrCode, BarChart3, ChevronLeft, ChevronRight, Download, Loader2, Pencil, Calendar, Shield, Share2, ChevronDown } from 'lucide-react'

interface LinkData {
  id: string
  url: string
  shortCode: string
  title: string | null
  clicks: number
  active: boolean
  expiresAt?: string | null
  password?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  createdAt: string
}

export function LinksList({ userId }: { userId: string }) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  // QR Code Modal State
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null)
  const [qrSize, setQrSize] = useState<number>(256)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState<boolean>(false)

  // Edit Modal State
  const [editingLink, setEditingLink] = useState<LinkData | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editExpiresAt, setEditExpiresAt] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editUtmSource, setEditUtmSource] = useState('')
  const [editUtmMedium, setEditUtmMedium] = useState('')
  const [editUtmCampaign, setEditUtmCampaign] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [showEditAdvanced, setShowEditAdvanced] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['links', userId, page],
    queryFn: async () => {
      const res = await fetch(`/api/links?page=${page}&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch links')
      const json = await res.json()
      return json.data as { links: LinkData[]; total: number; page: number; totalPages: number }
    },
  })

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    const res = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      refetch()
    }
  }

  const handleOpenQr = async (link: LinkData) => {
    setSelectedLink(link)
    setLoadingQr(true)
    setQrCodeData(null)
    try {
      let res = await fetch(`/api/qr?linkId=${link.id}`)
      if (!res.ok) {
        // Fallback: POST to generate it
        res = await fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId: link.id, size: qrSize }),
        })
      }
      const json = await res.json()
      if (res.ok) {
        setQrCodeData(json.data.data)
      }
    } catch (err) {
      console.error('Error fetching/generating QR code', err)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleRegenerateQr = async (size: number) => {
    if (!selectedLink) return
    setQrSize(size)
    setLoadingQr(true)
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: selectedLink.id, size }),
      })
      const json = await res.json()
      if (res.ok) {
        setQrCodeData(json.data.data)
      }
    } catch (err) {
      console.error('Error regenerating QR code', err)
    } finally {
      setLoadingQr(false)
    }
  }

  const downloadQr = () => {
    if (!qrCodeData || !selectedLink) return
    const link = document.createElement('a')
    link.href = qrCodeData
    link.download = `qrcode-${selectedLink.shortCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Edit Dialog Handler
  const handleOpenEdit = (link: LinkData) => {
    setEditingLink(link)
    setEditUrl(link.url)
    setEditTitle(link.title || '')
    setEditActive(link.active)
    setEditExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : '')
    setEditPassword(link.password || '')
    setEditUtmSource(link.utmSource || '')
    setEditUtmMedium(link.utmMedium || '')
    setEditUtmCampaign(link.utmCampaign || '')
    setShowEditAdvanced(!!(link.expiresAt || link.password || link.utmSource || link.utmMedium || link.utmCampaign))
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLink) return
    setLoadingEdit(true)

    try {
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: editUrl,
          title: editTitle || undefined,
          active: editActive,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
          password: editPassword || null,
          utmSource: editUtmSource || null,
          utmMedium: editUtmMedium || null,
          utmCampaign: editUtmCampaign || null,
        }),
      })

      if (res.ok) {
        setEditingLink(null)
        refetch()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to update link')
      }
    } catch (err) {
      console.error('Error saving link edit', err)
    } finally {
      setLoadingEdit(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="h-20 animate-pulse" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data?.links && data.links.length > 0 ? (
        <>
          {data.links.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{link.title || truncateUrl(link.url)}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-primary">{getShortUrl(link.shortCode)}</span>
                    <span>→</span>
                    <span className="truncate max-w-[300px]">{truncateUrl(link.url, 50)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(link.createdAt)}</span>
                    <span>·</span>
                    <span>{link.clicks} clicks</span>
                    {!link.active && (
                      <>
                        <span>·</span>
                        <span className="text-red-500 font-medium">Inactive</span>
                      </>
                    )}
                    {link.expiresAt && new Date() > new Date(link.expiresAt) && (
                      <>
                        <span>·</span>
                        <span className="text-red-500 font-medium">Expired</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(getShortUrl(link.shortCode))}
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenQr(link)}
                    title="QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/analytics?linkId=${link.id}`)}
                    title="View Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(link)}
                    title="Edit Link"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLink(link.id)}
                    title="Delete Link"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No links yet</p>
            <p className="text-sm">Create your first shortened link to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={selectedLink !== null} onOpenChange={(open) => !open && setSelectedLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code: {selectedLink?.shortCode}</DialogTitle>
            <DialogDescription>
              Scan to visit or download for print and digital marketing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative flex items-center justify-center border p-4 rounded-xl bg-white shadow-inner min-h-[200px] min-w-[200px]">
              {loadingQr ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt={`QR Code for ${selectedLink?.shortCode}`}
                  className="h-48 w-48 transition-all hover:scale-105"
                />
              ) : (
                <p className="text-sm text-destructive">Failed to load QR code</p>
              )}
            </div>
            {qrCodeData && (
              <div className="flex gap-2 w-full max-w-xs justify-center items-center">
                <span className="text-xs font-medium text-muted-foreground mr-2">Size:</span>
                {[128, 256, 512].map((size) => (
                  <Button
                    key={size}
                    variant={qrSize === size ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => handleRegenerateQr(size)}
                    disabled={loadingQr}
                  >
                    {size}px
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={downloadQr}
              disabled={loadingQr || !qrCodeData}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setSelectedLink(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={editingLink !== null} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Link: {editingLink?.shortCode}</DialogTitle>
            <DialogDescription>
              Update your link destination, status, protection settings, or UTM tracking metrics.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pr-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination URL</label>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link Title (optional)</label>
              <Input
                placeholder="e.g. Marketing Dashboard"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Link Status</p>
                <p className="text-xs text-muted-foreground">Enable or temporarily disable link redirects</p>
              </div>
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </div>

            {/* Advanced Edit Settings Accordion */}
            <div className="border-t pt-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground font-normal px-0 hover:bg-transparent"
                onClick={() => setShowEditAdvanced(!showEditAdvanced)}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advanced Settings</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${showEditAdvanced ? 'rotate-180' : ''}`} />
              </Button>

              {showEditAdvanced && (
                <div className="space-y-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Expiration Date
                      </label>
                      <Input
                        type="datetime-local"
                        value={editExpiresAt}
                        onChange={(e) => setEditExpiresAt(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Password
                      </label>
                      <Input
                        type="password"
                        placeholder="New Access Password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border bg-accent/15 p-3">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5" /> UTM Campaign Builder
                    </span>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">Source</label>
                        <Input
                          placeholder="twitter"
                          value={editUtmSource}
                          onChange={(e) => setEditUtmSource(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">Medium</label>
                        <Input
                          placeholder="social"
                          value={editUtmMedium}
                          onChange={(e) => setEditUtmMedium(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">Campaign</label>
                        <Input
                          placeholder="launch-2026"
                          value={editUtmCampaign}
                          onChange={(e) => setEditUtmCampaign(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setEditingLink(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loadingEdit}>
                {loadingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loadingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
