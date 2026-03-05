import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { requireAuth } from '@/lib/auth'
import { ScheduleView } from '@/components/schedule/schedule-view'

export default async function SchedulePage() {
  const user = await requireAuth()
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  // Get appointments for current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patient:patient_profiles!appointments_patient_profile_id_fkey(first_name, last_name, email), clinician:profiles!appointments_clinician_id_fkey(display_name)')
    .eq('org_id', orgId)
    .gte('starts_at', startOfMonth)
    .lte('starts_at', endOfMonth)
    .order('starts_at', { ascending: true })

  // Get patient list for creating appointments
  const { data: patients } = await supabase
    .from('patient_profiles')
    .select('id, first_name, last_name, email')
    .eq('org_id', orgId)
    .in('status', ['active', 'invited'])
    .order('last_name', { ascending: true })

  // Get clinicians
  const { data: clinicianMembers } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey(id, display_name)')
    .eq('org_id', orgId)
    .in('role', ['owner', 'admin', 'clinician'])
    .eq('is_active', true)

  const clinicians = (clinicianMembers ?? [])
    .map((m) => m.profiles as unknown as { id: string; display_name: string | null })
    .filter(Boolean)

  return (
    <div className="p-6 space-y-6">
      <ScheduleView
        appointments={appointments ?? []}
        patients={patients ?? []}
        clinicians={clinicians}
        orgId={orgId}
        role={role}
      />
    </div>
  )
}
