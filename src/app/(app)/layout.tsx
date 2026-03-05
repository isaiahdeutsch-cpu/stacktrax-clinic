import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getUserOrgs, getOrgWithFeatures, getOrgIdFromCookie } from '@/lib/org'
import { getCurrentMembership } from '@/lib/auth-utils'
import { parseFeatures } from '@/lib/features'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/app-shell'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAuth()

  // Get user's orgs
  const orgs = await getUserOrgs(authUser.id)
  if (orgs.length === 0) redirect('/onboarding')

  // Determine current org from cookie or default to first
  const cookieStore = await cookies()
  let currentOrgId = getOrgIdFromCookie(cookieStore)

  if (!currentOrgId || !orgs.find((o) => o.id === currentOrgId)) {
    currentOrgId = orgs[0].id
  }

  // Fetch org details + membership in parallel
  const [org, membership, profile] = await Promise.all([
    getOrgWithFeatures(currentOrgId),
    getCurrentMembership(currentOrgId),
    (async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', authUser.id)
        .single()
      return data
    })(),
  ])

  if (!org || !membership) redirect('/onboarding')

  const features = parseFeatures(org.features)

  return (
    <ThemeProvider>
      <AppShell
        orgs={orgs}
        currentOrgId={currentOrgId}
        features={features}
        role={membership.role}
        user={{
          email: authUser.email ?? '',
          displayName: profile?.display_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        }}
      >
        {children}
      </AppShell>
      <Toaster />
    </ThemeProvider>
  )
}
