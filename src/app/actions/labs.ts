'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'
import type { Database } from '@/lib/supabase/database.types'

type LabFlag = Database['public']['Enums']['lab_flag']

export async function createLabResult(input: {
  orgId: string
  patientId: string
  testName: string
  testCategory: string | null
  value: number | null
  unit: string | null
  referenceRangeLow: number | null
  referenceRangeHigh: number | null
  flag: LabFlag
  labDate: string
  labName: string | null
  notes: string | null
}) {
  const membership = await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  const { error } = await admin
    .from('lab_results')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientId,
      entered_by: membership.user_id,
      test_name: input.testName,
      test_category: input.testCategory,
      value: input.value,
      unit: input.unit,
      reference_range_low: input.referenceRangeLow,
      reference_range_high: input.referenceRangeHigh,
      flag: input.flag,
      lab_date: input.labDate,
      lab_name: input.labName,
      notes: input.notes,
    })

  if (error) return { error: 'Failed to create lab result' }

  revalidatePath(`/patients/${input.patientId}/labs`)
  return { error: null }
}

export async function updateLabResult(input: {
  orgId: string
  labId: string
  testName?: string
  value?: number | null
  unit?: string | null
  flag?: LabFlag
  notes?: string | null
}) {
  await requireOrgRole(input.orgId, 'staff')
  const admin = createAdminClient()

  const { labId, orgId, ...updates } = input
  const { error } = await admin
    .from('lab_results')
    .update({
      test_name: updates.testName,
      value: updates.value,
      unit: updates.unit,
      flag: updates.flag,
      notes: updates.notes,
    })
    .eq('id', labId)
    .eq('org_id', orgId)

  if (error) return { error: 'Failed to update lab result' }

  return { error: null }
}
