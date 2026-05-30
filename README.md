# LinkForge - Professional URL Shortener

LinkForge is a modern, premium self-hosted URL shortener platform built with Next.js, featuring real-time analytics, dynamic QR codes, API keys, password protection, link expiration, and built-in UTM campaign tracking.

---

## Key Features

* **Advanced Link Management**:
  * **Shortening Engine**: High-performance redirects with collision-protected shortcodes.
  * **Custom Aliases**: Create customized branded short paths.
  * **Advanced Parameters**: Optionally set custom expiration dates, password protection, and target titles.
  * **UTM Campaign Builder**: Attach UTM source, medium, and campaign parameters directly from the creation interface.
  * **Full CRUD Support**: Edit or delete links on-the-fly with immediate redirect updates.

* **Developer & Integration API**:
  * **Secure API Keys**: Fully secure programmatic access. Keys are generated via crypto-safe strings and stored as SHA-256 hashes (they can only be copied once upon creation).
  * **Rate Limiting & Protection**: Anti-abuse rate-limiter running on Redis (Upstash) to prevent spamming.

* **Dynamic Analytics Dashboard**:
  * **Aggregate and Link-Specific Analytics**: Toggle dashboard stats between total user stats and specific link stats.
  * **Interactive Date Ranges**: Filter metrics across "All Time", "Last 7 Days", or "Last 30 Days".
  * **Detailed Visualizations**: Interactive Recharts graphs detailing clicks by country, device category, web browser, operating system, and top referrers.

* **Interactive QR Codes**:
  * Auto-generated Vector QR Code cards.
  * Dynamic size rendering (128px, 256px, 512px) and instant high-res PNG download support.

---

## Tech Stack

* **Core Framework**: Next.js 16 (App Router), React 19, TypeScript
* **Database**: PostgreSQL with Prisma ORM
* **Cache & Rate-Limiter**: Serverless Redis (Upstash)
* **Auth Engine**: Auth.js (NextAuth v5)
* **Charts**: Recharts
* **Styling**: TailwindCSS & Lucide Icons

---

## Getting Started

### Prerequisites
* Node.js 18+
* Neon PostgreSQL Account (or local PG instance)
* Upstash Redis Account

### Installation

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd url-short
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file inside the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Populate `.env.local` with your database, authentication, and caching secrets:
   ```env
   # Neon Connection Strings (Pooled + Direct for Migrations)
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>-pooler.region.neon.tech/<dbname>?sslmode=require"
   DIRECT_URL="postgresql://<user>:<password>@<neon-host>.region.neon.tech/<dbname>?sslmode=require"

   # Authentication
   AUTH_SECRET="your-32-character-auth-secret"
   AUTH_URL="http://localhost:3000"

   # OAuth Providers (Ensure you register credentials in developer dashboards)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL="https://your-database-id.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

   # App Configs
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_SHORT_DOMAIN="localhost:3000"
   ```

3. **Deploy Database Schema**:
   Run the Prisma migration to initialize your Postgres database schema:
   ```bash
   npx prisma migrate dev
   ```

4. **Launch Local Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view your LinkForge dashboard.

---

## Next.js 16 Routing & Proxy Middleware

Next.js 16 uses `src/proxy.ts` as the standard proxy/middleware interface. In this configuration, route verification, session authentication, and API rate-limiting are automatically intercepting incoming requests under:
* `/api/:path*` (Excluding `/api/auth/:path*`)
* `/dashboard/:path*`

Ensure you **do not** add a separate `src/middleware.ts` file, as doing so will trigger Next.js compiler conflicts.

---

## API Endpoints Guide

All API calls must contain a valid session cookie or programmatic key header:
`Authorization: Bearer <your_api_key>`

### 1. Create a Short Link
* **Endpoint**: `POST /api/links`
* **Request Body**:
  ```json
  {
    "url": "https://example.com/very/long/target/page",
    "customAlias": "marketing-promo",
    "title": "Promo Campaign",
    "expiresAt": "2027-05-30T12:00:00.000Z",
    "password": "securepassword",
    "utmSource": "newsletter",
    "utmMedium": "email",
    "utmCampaign": "summer-sale"
  }
  ```

### 2. Fetch User Links (Paginated)
* **Endpoint**: `GET /api/links?page=1&limit=10`
* **Response**: Returns paginated links with metadata.

### 3. Update an Existing Link
* **Endpoint**: `PATCH /api/links/:id`
* **Request Body**: (Allows updating any subset of parameters)
  ```json
  {
    "url": "https://example.com/new/destination",
    "active": false
  }
  ```

### 4. Delete Link
* **Endpoint**: `DELETE /api/links/:id`

### 5. Fetch Analytics
* **Endpoint**: `GET /api/analytics?linkId=<link_id>&startDate=<start_date>&endDate=<end_date>`
* **Response**: Clicks breakdown aggregated by devices, countries, browsers, operating systems, and referrers.

---

## Deployment to Vercel

1. Push the codebase to your Git repository.
2. Create a new project in Vercel and connect your repository.
3. Configure the environment variables in Vercel settings matching `.env.local`.
4. Run the build. Vercel automatically maps `/r/[slug]` redirects and executes `after()` tracking functions asynchronously without suspending.

---

## Project Architecture

```
src/
├── app/                    # Next.js App Router (Dashboard, Marketing & API)
│   ├── (marketing)/        # Public marketing pages & API Docs
│   ├── (dashboard)/        # Main application layout, links list, settings
│   ├── api/                # API route handlers (links, QR codes, analytics, users)
│   └── r/[slug]/           # Dynamic cache-friendly redirect engine
├── components/
│   ├── ui/                 # Reusable UI system (Button, Dialog, Card, Input)
│   ├── forms/              # Structured Forms (Create / Edit links)
│   ├── analytics/          # Recharts dashboards & filter control inputs
│   └── dashboard/          # Links tables, API key panels, statistics cards
├── services/               # DB Queries, Cache Invalidation, & Business logic
├── lib/                    # Prisma & Upstash Redis singleton instances
├── validations/            # Zod Validation schemas
├── utils/                  # UserAgent parser & geolocation helpers
├── proxy.ts                # Next.js 16 Middleware & Router Interceptor
```

---

## Development Scripts

```bash
npm run dev                 # Starts local development environment
npm run build               # Builds the application for production
npx prisma studio           # Launches visual GUI database viewer
npx prisma generate         # Regenerates types based on schema.prisma
```

---

## License

MIT
