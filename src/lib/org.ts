import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, Json } from '@/lib/supabase/database.types'
import type { OrgRole } from '@/lib/roles'

export type Organization = Database['public']['Tables']['organizations']['Row']

export interface UserOrg {
  id: string
  name: string
  logo_url: string | null
  role: OrgRole
}

export async function getUserOrgs(userId: string): Promise<UserOrg[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('org_members')
    .select('role, organizations(id, name, logo_url)')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!data) return []

  return data
    .filter((m) => m.organizations)
    .map((m) => {
      const org = m.organizations as unknown as { id: string; name: string; logo_url: string | null }
      return {
        id: org.id,
        name: org.name,
        logo_url: org.logo_url,
        role: m.role,
      }
    })
}

export async function getOrgWithFeatures(orgId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  return data
}

export function getOrgIdFromCookie(cookieStore: { get: (name: string) => { value: string } | undefined }): string | null {
  return cookieStore.get('clinic-org-id')?.value ?? null
}

export function parseFeatures(features: Json): Record<string, boolean> {
  if (typeof features === 'object' && features !== null && !Array.isArray(features)) {
    const result: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(features)) {
      result[key] = Boolean(value)
    }
    return result
  }
  return {}
}
