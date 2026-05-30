import { LinksList } from '@/components/dashboard/links-list'
import { CreateLinkForm } from '@/components/forms/create-link-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LinksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Links</h1>
        <CreateLinkForm userId={session.user.id} />
      </div>
      <LinksList userId={session.user.id} />
    </div>
  )
}
