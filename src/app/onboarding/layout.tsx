import { requireAuth } from '@/lib/auth'
import { getUserOrgs } from '@/lib/org'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const orgs = await getUserOrgs(user.id)

  if (orgs.length > 0) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
