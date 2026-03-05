import { getActiveOrg } from '@/lib/get-org'
import { GeneralSettingsForm } from '@/components/settings/general-settings-form'

export default async function GeneralSettingsPage() {
  const { org, orgId } = await getActiveOrg()

  return (
    <GeneralSettingsForm
      orgId={orgId}
      name={org.name}
      timezone={org.timezone}
      inviteCode={org.invite_code}
      inviteCodeEnabled={org.invite_code_enabled}
    />
  )
}
