import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

export type { OrgRole }
export { hasMinRole }

export interface OrgMembership {
  id: string
  org_id: string
  user_id: string
  role: OrgRole
  is_active: boolean
}

export async function getCurrentMembership(orgId: string): Promise<OrgMembership | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('org_members')
    .select('id, org_id, user_id, role, is_active')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return data
}

export async function requireOrgRole(orgId: string, minRole: OrgRole): Promise<OrgMembership> {
  const membership = await getCurrentMembership(orgId)
  if (!membership) throw new Error('Not a member of this organization')
  if (!hasMinRole(membership.role, minRole)) throw new Error('Insufficient permissions')
  return membership
}
