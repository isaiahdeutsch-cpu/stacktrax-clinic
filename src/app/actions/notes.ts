'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'
import type { Database } from '@/lib/supabase/database.types'

type NoteType = Database['public']['Enums']['note_type']

export async function createNote(input: {
  orgId: string
  patientId: string
  title: string | null
  type: NoteType
  body: string
}) {
  const membership = await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('clinical_notes')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientId,
      author_id: membership.user_id,
      title: input.title,
      type: input.type,
      body: input.body,
    })

  if (error) return { error: 'Failed to create note' }

  revalidatePath(`/patients/${input.patientId}/notes`)
  return { error: null }
}

export async function updateNote(input: {
  orgId: string
  noteId: string
  title?: string | null
  body?: string
}) {
  await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('clinical_notes')
    .update({
      title: input.title,
      body: input.body,
    })
    .eq('id', input.noteId)
    .eq('org_id', input.orgId)
    .eq('is_signed', false) // Can't update signed notes

  if (error) return { error: 'Failed to update note' }

  return { error: null }
}

export async function signNote(input: {
  orgId: string
  noteId: string
}) {
  const membership = await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('clinical_notes')
    .update({
      is_signed: true,
      signed_at: new Date().toISOString(),
      signed_by: membership.user_id,
    })
    .eq('id', input.noteId)
    .eq('org_id', input.orgId)
    .eq('is_signed', false)

  if (error) return { error: 'Failed to sign note' }

  return { error: null }
}
