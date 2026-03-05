import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { requireAuth } from '@/lib/auth'
import { NotesList } from '@/components/notes/notes-list'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientNotesPage({ params }: Props) {
  const { patientId } = await params
  const user = await requireAuth()
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: notes } = await supabase
    .from('clinical_notes')
    .select('*, author:profiles!clinical_notes_author_id_fkey(display_name), signer:profiles!clinical_notes_signed_by_fkey(display_name)')
    .eq('patient_profile_id', patientId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  return (
    <NotesList
      notes={notes ?? []}
      patientId={patientId}
      orgId={orgId}
      userId={user.id}
      role={role}
    />
  )
}
