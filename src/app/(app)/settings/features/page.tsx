import { getActiveOrg } from '@/lib/get-org'
import { redirect } from 'next/navigation'
import { FeaturesSettings } from '@/components/settings/features-settings'

export default async function FeaturesSettingsPage() {
  const { org, orgId, role } = await getActiveOrg()

  if (role !== 'owner') redirect('/settings/general')

  return <FeaturesSettings orgId={orgId} features={org.features} />
}
