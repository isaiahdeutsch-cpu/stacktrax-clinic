import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { requireAuth } from '@/lib/auth'
import { MessagesView } from '@/components/messages/messages-view'

export default async function MessagesPage() {
  const user = await requireAuth()
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: threads } = await supabase
    .from('message_threads')
    .select('*, patient:patient_profiles!message_threads_patient_profile_id_fkey(first_name, last_name, email)')
    .eq('org_id', orgId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  // Get patients for creating new threads
  const { data: patients } = await supabase
    .from('patient_profiles')
    .select('id, first_name, last_name, email')
    .eq('org_id', orgId)
    .in('status', ['active', 'invited'])

  return (
    <MessagesView
      threads={threads ?? []}
      patients={patients ?? []}
      orgId={orgId}
      userId={user.id}
      role={role}
    />
  )
}
