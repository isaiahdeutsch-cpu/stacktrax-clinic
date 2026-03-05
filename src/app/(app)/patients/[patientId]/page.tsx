import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { PatientOverview } from '@/components/patients/patient-overview'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientOverviewPage({ params }: Props) {
  const { patientId } = await params
  const { orgId, role, features } = await getActiveOrg()
  const supabase = await createClient()

  const [
    { data: patient },
    { data: protocols },
    { data: recentNotes },
    { data: recentLabs },
    { data: assignments },
  ] = await Promise.all([
    supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .eq('org_id', orgId)
      .single(),
    features.protocols
      ? supabase
          .from('patient_protocols')
          .select('id, name, status, start_date')
          .eq('patient_profile_id', patientId)
          .eq('org_id', orgId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    features.notes
      ? supabase
          .from('clinical_notes')
          .select('id, title, type, created_at, is_signed')
          .eq('patient_profile_id', patientId)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
    features.labs
      ? supabase
          .from('lab_results')
          .select('id, test_name, value, unit, flag, lab_date')
          .eq('patient_profile_id', patientId)
          .eq('org_id', orgId)
          .order('lab_date', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    supabase
      .from('clinician_assignments')
      .select('id, clinician_id, is_active, profiles!clinician_assignments_clinician_id_fkey(display_name)')
      .eq('patient_profile_id', patientId)
      .eq('org_id', orgId)
      .eq('is_active', true),
  ])

  if (!patient) notFound()

  return (
    <PatientOverview
      patient={patient}
      protocols={protocols ?? []}
      recentNotes={recentNotes ?? []}
      recentLabs={recentLabs ?? []}
      assignments={assignments ?? []}
      features={features}
      role={role}
      orgId={orgId}
    />
  )
}
