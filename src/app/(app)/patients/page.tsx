import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { requireAuth } from '@/lib/auth'
import { hasMinRole } from '@/lib/roles'
import { PatientList } from '@/components/patients/patient-list'

export default async function PatientsPage() {
  const user = await requireAuth()
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  let query = supabase
    .from('patient_profiles')
    .select('*, primary_clinician:profiles!patient_profiles_primary_clinician_id_fkey(display_name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  // Clinicians only see their assigned patients
  if (role === 'clinician') {
    const { data: assignments } = await supabase
      .from('clinician_assignments')
      .select('patient_profile_id')
      .eq('org_id', orgId)
      .eq('clinician_id', user.id)
      .eq('is_active', true)

    const patientIds = assignments?.map((a) => a.patient_profile_id) ?? []
    if (patientIds.length > 0) {
      query = query.in('id', patientIds)
    } else {
      query = query.eq('id', 'none')
    }
  }

  const { data: patients } = await query

  // Get clinician options for invite dialog
  let clinicians: Array<{ id: string; display_name: string | null }> = []
  if (hasMinRole(role, 'staff')) {
    const { data } = await supabase
      .from('org_members')
      .select('user_id, profiles!org_members_user_id_fkey(id, display_name)')
      .eq('org_id', orgId)
      .in('role', ['owner', 'admin', 'clinician'])
      .eq('is_active', true)

    clinicians = (data ?? [])
      .map((m) => m.profiles as unknown as { id: string; display_name: string | null })
      .filter(Boolean)
  }

  return (
    <div className="p-6 space-y-6">
      <PatientList
        patients={patients ?? []}
        clinicians={clinicians}
        orgId={orgId}
        role={role}
      />
    </div>
  )
}
