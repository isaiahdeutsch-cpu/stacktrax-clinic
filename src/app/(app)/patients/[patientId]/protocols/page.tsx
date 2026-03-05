import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { hasMinRole } from '@/lib/roles'
import { PatientProtocolsList } from '@/components/protocols/patient-protocols-list'

interface Props {
  params: Promise<{ patientId: string }>
}

export default async function PatientProtocolsPage({ params }: Props) {
  const { patientId } = await params
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const [{ data: protocols }, { data: templates }] = await Promise.all([
    supabase
      .from('patient_protocols')
      .select('*, patient_protocol_items(*)')
      .eq('patient_profile_id', patientId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
    hasMinRole(role, 'clinician')
      ? supabase
          .from('protocol_templates')
          .select('id, name, category')
          .eq('org_id', orgId)
          .eq('is_active', true)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <PatientProtocolsList
      protocols={protocols ?? []}
      templates={templates ?? []}
      patientId={patientId}
      orgId={orgId}
      role={role}
    />
  )
}
