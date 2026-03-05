import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { PatientHeader } from '@/components/patients/patient-header'

interface Props {
  params: Promise<{ patientId: string }>
  children: React.ReactNode
}

export default async function PatientLayout({ params, children }: Props) {
  const { patientId } = await params
  const { orgId, role, features } = await getActiveOrg()
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patient_profiles')
    .select('*, primary_clinician:profiles!patient_profiles_primary_clinician_id_fkey(display_name)')
    .eq('id', patientId)
    .eq('org_id', orgId)
    .single()

  if (!patient) notFound()

  return (
    <div className="flex flex-col">
      <PatientHeader patient={patient} role={role} features={features} orgId={orgId} />
      <div className="flex-1">{children}</div>
    </div>
  )
}
