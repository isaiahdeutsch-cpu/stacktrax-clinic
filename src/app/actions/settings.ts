'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'
import type { OrgRole } from '@/lib/roles'
import type { OrgFeatures } from '@/lib/features'

export async function updateOrganization(input: {
  orgId: string
  name: string
  timezone: string
  inviteCode: string | null
  inviteCodeEnabled: boolean
}) {
  await requireOrgRole(input.orgId, 'admin')
  const admin = createAdminClient()

  const { error } = await admin
    .from('organizations')
    .update({
      name: input.name,
      timezone: input.timezone,
      invite_code: input.inviteCode,
      invite_code_enabled: input.inviteCodeEnabled,
    })
    .eq('id', input.orgId)

  if (error) return { error: 'Failed to update organization' }

  revalidatePath('/settings/general')
  return { error: null }
}

export async function updateFeatureFlags(input: {
  orgId: string
  features: OrgFeatures
}) {
  await requireOrgRole(input.orgId, 'owner')
  const admin = createAdminClient()

  const { error } = await admin
    .from('organizations')
    .update({ features: input.features as unknown as import('@/lib/supabase/database.types').Json })
    .eq('id', input.orgId)

  if (error) return { error: 'Failed to update features' }

  revalidatePath('/')
  return { error: null }
}

export async function updateMemberRole(input: {
  orgId: string
  memberId: string
  role: OrgRole
}) {
  await requireOrgRole(input.orgId, 'owner')
  const admin = createAdminClient()

  const { error } = await admin
    .from('org_members')
    .update({ role: input.role })
    .eq('id', input.memberId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to update role' }

  revalidatePath('/settings/members')
  return { error: null }
}

export async function inviteMember(input: {
  orgId: string
  email: string
  role: OrgRole
}) {
  await requireOrgRole(input.orgId, 'admin')
  const admin = createAdminClient()

  // Check if user exists by email
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', input.email)
    .single()

  if (!profile) return { error: 'No account found with this email. User must sign up first.' }

  // Check if already a member
  const { data: existing } = await admin
    .from('org_members')
    .select('id')
    .eq('org_id', input.orgId)
    .eq('user_id', profile.id)
    .single()

  if (existing) return { error: 'This user is already a member' }

  const { error } = await admin
    .from('org_members')
    .insert({
      org_id: input.orgId,
      user_id: profile.id,
      role: input.role,
      joined_at: new Date().toISOString(),
    })

  if (error) return { error: 'Failed to add member' }

  revalidatePath('/settings/members')
  return { error: null }
}

export async function updateProfile(input: {
  displayName: string | null
  phone: string | null
}) {
  // Uses RLS — user can only update their own profile
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      display_name: input.displayName,
      phone: input.phone,
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile' }

  return { error: null }
}
