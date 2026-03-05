import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { redirect } from 'next/navigation'
import { BillingSettings } from '@/components/settings/billing-settings'

export default async function BillingSettingsPage() {
  const { orgId, role } = await getActiveOrg()

  if (role !== 'owner') redirect('/settings/general')

  const supabase = await createClient()
  const { data: subscription } = await supabase
    .from('org_subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .single()

  return <BillingSettings subscription={subscription} />
}
