import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { AppointmentListView } from '@/components/schedule/appointment-list-view'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientSchedulePage({ params }: Props) {
  const { patientId } = await params
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patient:patient_profiles!appointments_patient_profile_id_fkey(first_name, last_name, email), clinician:profiles!appointments_clinician_id_fkey(display_name)')
    .eq('patient_profile_id', patientId)
    .eq('org_id', orgId)
    .order('starts_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Appointments</h2>
      <AppointmentListView appointments={appointments ?? []} orgId={orgId} role={role} />
    </div>
  )
}
