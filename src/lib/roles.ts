import type { Database } from '@/lib/supabase/database.types'

export type OrgRole = Database['public']['Enums']['org_role']

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 0,
  admin: 1,
  clinician: 2,
  staff: 3,
  patient: 4,
}

export function hasMinRole(userRole: OrgRole, minRole: OrgRole): boolean {
  return ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[minRole]
}
