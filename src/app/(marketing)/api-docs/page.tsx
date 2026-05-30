import { MarketingLayout } from '@/components/layouts/marketing-layout'

export default function ApiDocsPage() {
  return (
    <MarketingLayout>
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold">API Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Integrate LinkForge into your applications with our REST API.
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold">Authentication</h2>
              <p className="mt-2 text-muted-foreground">
                All API endpoints require authentication. You can authenticate using:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Session cookie (for web applications)</li>
                <li>API key via <code className="rounded bg-muted px-1">Authorization: Bearer &lt;key&gt;</code> header</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Create Short Link</h2>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`POST /api/links
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://example.com/long/url",
  "customAlias": "my-link",
  "title": "My Link"
}`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Get Links</h2>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`GET /api/links?page=1&limit=20
Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Get Analytics</h2>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`GET /api/analytics?linkId=LINK_ID
Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Generate QR Code</h2>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`POST /api/qr
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "linkId": "LINK_ID",
  "size": 256
}`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Rate Limits</h2>
              <p className="mt-2 text-muted-foreground">
                API requests are rate limited to 100 requests per minute per IP address.
                Rate limit headers are included in all responses:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li><code className="rounded bg-muted px-1">X-RateLimit-Limit</code></li>
                <li><code className="rounded bg-muted px-1">X-RateLimit-Remaining</code></li>
                <li><code className="rounded bg-muted px-1">X-RateLimit-Reset</code></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
