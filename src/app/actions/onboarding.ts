'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createOrganization(input: { name: string; timezone: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', orgId: null }

  const admin = createAdminClient()

  // Create org
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: input.name,
      timezone: input.timezone,
      features: {
        protocols: true,
        scheduling: true,
        messaging: true,
        labs: true,
        notes: true,
        stacktrax_link: false,
      },
    })
    .select('id')
    .single()

  if (orgError || !org) {
    console.error('Failed to create organization:', orgError)
    return { error: orgError?.message ?? 'Failed to create organization', orgId: null }
  }

  // Create owner membership
  const { error: memberError } = await admin
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner' as const,
      joined_at: new Date().toISOString(),
    })

  if (memberError) {
    console.error('Failed to create membership:', memberError)
    return { error: memberError.message ?? 'Failed to create membership', orgId: null }
  }

  // Create starter subscription
  await admin
    .from('org_subscriptions')
    .insert({
      org_id: org.id,
      tier: 'starter' as const,
      status: 'trialing' as const,
      seat_count: 5,
      max_patients: 25,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })

  return { error: null, orgId: org.id }
}

export async function joinOrganizationByCode(input: { code: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', orgId: null }

  const admin = createAdminClient()

  // Find org by invite code
  const { data: org } = await admin
    .from('organizations')
    .select('id, name')
    .eq('invite_code', input.code)
    .eq('invite_code_enabled', true)
    .single()

  if (!org) return { error: 'Invalid or disabled invite code', orgId: null }

  // Check if already a member
  const { data: existing } = await admin
    .from('org_members')
    .select('id')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'You are already a member of this clinic', orgId: null }

  // Create patient membership
  const { error: memberError } = await admin
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'patient' as const,
      invite_method: 'clinic_code' as const,
      joined_at: new Date().toISOString(),
    })

  if (memberError) return { error: 'Failed to join organization', orgId: null }

  // Create patient profile
  await admin
    .from('patient_profiles')
    .insert({
      org_id: org.id,
      user_id: user.id,
      email: user.email ?? '',
      status: 'active' as const,
    })

  return { error: null, orgId: org.id }
}
