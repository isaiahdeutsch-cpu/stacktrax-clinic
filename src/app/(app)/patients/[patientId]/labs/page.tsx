import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { LabResultsList } from '@/components/labs/lab-results-list'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientLabsPage({ params }: Props) {
  const { patientId } = await params
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: labs } = await supabase
    .from('lab_results')
    .select('*, entered_by_profile:profiles!lab_results_entered_by_fkey(display_name)')
    .eq('patient_profile_id', patientId)
    .eq('org_id', orgId)
    .order('lab_date', { ascending: false })

  return (
    <LabResultsList
      labs={labs ?? []}
      patientId={patientId}
      orgId={orgId}
      role={role}
    />
  )
}
