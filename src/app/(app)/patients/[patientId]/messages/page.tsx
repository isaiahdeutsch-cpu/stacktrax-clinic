import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { requireAuth } from '@/lib/auth'
import { MessagesView } from '@/components/messages/messages-view'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientMessagesPage({ params }: Props) {
  const { patientId } = await params
  const user = await requireAuth()
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: threads } = await supabase
    .from('message_threads')
    .select('*, patient:patient_profiles!message_threads_patient_profile_id_fkey(first_name, last_name, email)')
    .eq('org_id', orgId)
    .eq('patient_profile_id', patientId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  // This patient only for the new thread dialog
  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('id, first_name, last_name, email')
    .eq('id', patientId)
    .eq('org_id', orgId)
    .single()

  return (
    <MessagesView
      threads={threads ?? []}
      patients={patient ? [patient] : []}
      orgId={orgId}
      userId={user.id}
      role={role}
    />
  )
}
