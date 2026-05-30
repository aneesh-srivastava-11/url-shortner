import { AnalyticsOverview } from '@/components/analytics/analytics-overview'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>
      <AnalyticsOverview userId={session.user.id} />
    </div>
  )
}
