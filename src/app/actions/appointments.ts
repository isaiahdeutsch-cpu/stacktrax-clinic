'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'
import type { Database } from '@/lib/supabase/database.types'

type AppointmentType = Database['public']['Enums']['appointment_type']
type AppointmentStatus = Database['public']['Enums']['appointment_status']

export async function createAppointment(input: {
  orgId: string
  patientProfileId: string
  clinicianId: string
  type: AppointmentType
  title: string | null
  startsAt: string
  endsAt: string
  durationMinutes: number
  location: string | null
  notes: string | null
}) {
  await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  const { error } = await admin
    .from('appointments')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientProfileId,
      clinician_id: input.clinicianId,
      type: input.type,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      duration_minutes: input.durationMinutes,
      location: input.location,
      notes: input.notes,
    })

  if (error) return { error: 'Failed to create appointment' }

  revalidatePath('/schedule')
  return { error: null }
}

export async function updateAppointmentStatus(input: {
  orgId: string
  appointmentId: string
  status: AppointmentStatus
}) {
  const membership = await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  const updates: Record<string, unknown> = { status: input.status }

  if (input.status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString()
    updates.cancelled_by = membership.user_id
  }

  const { error } = await admin
    .from('appointments')
    .update(updates)
    .eq('id', input.appointmentId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to update appointment' }

  revalidatePath('/schedule')
  return { error: null }
}
