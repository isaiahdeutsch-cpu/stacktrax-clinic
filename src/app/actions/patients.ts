'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'

export async function invitePatient(input: {
  orgId: string
  firstName: string
  lastName: string
  email: string
  primaryClinicianId: string | null
}) {
  await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  // Check for existing patient with same email in this org
  const { data: existing } = await admin
    .from('patient_profiles')
    .select('id')
    .eq('org_id', input.orgId)
    .eq('email', input.email)
    .single()

  if (existing) return { error: 'A patient with this email already exists in this clinic' }

  const { error } = await admin
    .from('patient_profiles')
    .insert({
      org_id: input.orgId,
      first_name: input.firstName || null,
      last_name: input.lastName || null,
      email: input.email,
      status: 'invited' as const,
      primary_clinician_id: input.primaryClinicianId,
    })

  if (error) return { error: 'Failed to create patient' }

  revalidatePath('/patients')
  return { error: null }
}

export async function updatePatient(input: {
  orgId: string
  patientId: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  allergies?: string[]
  medicalHistory?: string
  currentMedications?: string
}) {
  await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  const { patientId, orgId, ...updates } = input
  const { error } = await admin
    .from('patient_profiles')
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      date_of_birth: updates.dateOfBirth,
      gender: updates.gender,
      allergies: updates.allergies,
      medical_history: updates.medicalHistory,
      current_medications: updates.currentMedications,
    })
    .eq('id', patientId)
    .eq('org_id', orgId)

  if (error) return { error: 'Failed to update patient' }

  revalidatePath(`/patients/${patientId}`)
  return { error: null }
}

export async function dischargePatient(input: {
  orgId: string
  patientId: string
  reason: string
}) {
  const membership = await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('patient_profiles')
    .update({
      status: 'discharged' as const,
      discharged_at: new Date().toISOString(),
      discharged_by: membership.user_id,
      discharge_reason: input.reason,
    })
    .eq('id', input.patientId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to discharge patient' }

  revalidatePath(`/patients/${input.patientId}`)
  revalidatePath('/patients')
  return { error: null }
}

export async function reactivatePatient(input: {
  orgId: string
  patientId: string
}) {
  await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('patient_profiles')
    .update({
      status: 'active' as const,
      discharged_at: null,
      discharged_by: null,
      discharge_reason: null,
    })
    .eq('id', input.patientId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to reactivate patient' }

  revalidatePath(`/patients/${input.patientId}`)
  revalidatePath('/patients')
  return { error: null }
}

export async function assignClinician(input: {
  orgId: string
  patientId: string
  clinicianId: string
}) {
  const membership = await requireOrgRole(input.orgId, 'admin')
  const admin = createAdminClient()

  const { error } = await admin
    .from('clinician_assignments')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientId,
      clinician_id: input.clinicianId,
      assigned_by: membership.user_id,
    })

  if (error) return { error: 'Failed to assign clinician' }

  revalidatePath(`/patients/${input.patientId}`)
  return { error: null }
}

export async function updatePrimaryClinician(input: {
  orgId: string
  patientId: string
  clinicianId: string
}) {
  await requireOrgRole(input.orgId, 'admin')
  const admin = createAdminClient()

  const { error } = await admin
    .from('patient_profiles')
    .update({ primary_clinician_id: input.clinicianId })
    .eq('id', input.patientId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to update primary clinician' }

  revalidatePath(`/patients/${input.patientId}`)
  return { error: null }
}
