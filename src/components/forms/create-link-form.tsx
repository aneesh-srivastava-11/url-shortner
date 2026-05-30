'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2, ChevronDown, Calendar, Shield, Share2 } from 'lucide-react'
import { getShortUrl } from '@/utils/helpers'

export function CreateLinkForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Advanced settings state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [password, setPassword] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')

  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          password: password || undefined,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create link')
      }

      setResult(getShortUrl(json.data.shortCode))
      setUrl('')
      setCustomAlias('')
      setExpiresAt('')
      setPassword('')
      setUtmSource('')
      setUtmMedium('')
      setUtmCampaign('')
      setShowAdvanced(false)
      
      // Invalidate queries so links list updates instantly
      queryClient.invalidateQueries({ queryKey: ['links'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Short Link</DialogTitle>
          <DialogDescription>
            Enter a long URL to shorten. Expand advanced options to configure protection or tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pr-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination URL</label>
            <Input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Alias (optional)</label>
            <Input
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              pattern="^[a-zA-Z0-9_-]+$"
              minLength={3}
              maxLength={20}
            />
          </div>

          {/* Advanced Settings Accordion */}
          <div className="border-t pt-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between text-muted-foreground font-normal px-0 hover:bg-transparent"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advanced Settings</span>
              <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>

            {showAdvanced && (
              <div className="space-y-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Expiration Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Access Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">Medium</label>
                      <Input
                        placeholder="social"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">Campaign</label>
                      <Input
                        placeholder="launch-2026"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          {result && (
            <div className="rounded-lg bg-muted p-4 border animate-in fade-in zoom-in-95">
              <p className="text-xs font-semibold text-muted-foreground">Your short link:</p>
              <p className="font-mono text-lg text-primary mt-1 break-all select-all">{result}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-8"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                Copy Link
              </Button>
            </div>
          )}
          
          <DialogFooter className="border-t pt-3">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
