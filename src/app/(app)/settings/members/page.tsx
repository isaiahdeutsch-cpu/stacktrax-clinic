import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { MembersSettings } from '@/components/settings/members-settings'

export default async function MembersSettingsPage() {
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('org_members')
    .select('*, profile:profiles!org_members_user_id_fkey(email, display_name, avatar_url)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  return <MembersSettings members={members ?? []} orgId={orgId} currentRole={role} />
}
