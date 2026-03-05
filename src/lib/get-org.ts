import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentMembership } from '@/lib/auth-utils'
import { getOrgWithFeatures } from '@/lib/org'
import { parseFeatures } from '@/lib/features'
import type { OrgRole } from '@/lib/roles'

export async function getActiveOrg() {
  const cookieStore = await cookies()
  const orgId = cookieStore.get('clinic-org-id')?.value
  if (!orgId) redirect('/onboarding')

  const [org, membership] = await Promise.all([
    getOrgWithFeatures(orgId),
    getCurrentMembership(orgId),
  ])

  if (!org || !membership) redirect('/onboarding')

  return {
    org,
    membership,
    orgId: org.id,
    role: membership.role as OrgRole,
    features: parseFeatures(org.features),
  }
}
