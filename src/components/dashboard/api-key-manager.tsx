'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Copy, Trash2, Key, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

export function ApiKeyManager() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedSuccess, setCopiedSuccess] = useState(false)
  const queryClient = useQueryClient()

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) throw new Error('Failed to fetch API keys')
      const json = await res.json()
      return json.data
    },
  })

  const createKey = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        const json = await res.json()
        setNewKey(json.data.key) // Store unhashed key for modal display
        setName('')
        queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Systems using it will lose access immediately.')) return

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error)
    }
  }

  const copyNewKey = async () => {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopiedSuccess(true)
    setTimeout(() => setCopiedSuccess(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your API keys for programmatic access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="API key name (e.g. Production CLI)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={createKey} disabled={loading || !name.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Key
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-2">
            {apiKeys.map((key: { id: string; name: string; key: string; revoked: boolean; lastUsedAt: string | null; createdAt: string }) => (
              <div key={key.id} className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-accent/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">{key.key}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {key.revoked ? 'Revoked' : key.lastUsedAt ? `Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => revokeKey(key.id)} title="Revoke API Key">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4 text-sm">No API keys yet</p>
        )}
      </CardContent>

      {/* Success Modal showing API Key ONCE */}
      <Dialog open={newKey !== null} onOpenChange={(open) => !open && setNewKey(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" /> API Key Created
            </DialogTitle>
            <DialogDescription>
              Please copy your API key now. For security, you will not be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg border font-mono text-sm break-all select-all">
              <span>{newKey}</span>
              <Button size="icon" variant="ghost" className="shrink-0" onClick={copyNewKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copiedSuccess && (
              <p className="text-xs text-green-600 text-center font-medium">Copied to clipboard!</p>
            )}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Warning:</span> Keep this key safe. Do not share it or expose it in browser code.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setNewKey(null)}>
              I have saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
