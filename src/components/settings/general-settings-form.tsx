'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrganization } from '@/app/actions/settings'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

interface GeneralSettingsFormProps {
  orgId: string
  name: string
  timezone: string
  inviteCode: string | null
  inviteCodeEnabled: boolean
}

export function GeneralSettingsForm({ orgId, name, timezone, inviteCode, inviteCodeEnabled }: GeneralSettingsFormProps) {
  const router = useRouter()
  const [formName, setFormName] = useState(name)
  const [formTimezone, setFormTimezone] = useState(timezone)
  const [formInviteCode, setFormInviteCode] = useState(inviteCode ?? '')
  const [formInviteEnabled, setFormInviteEnabled] = useState(inviteCodeEnabled)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    await updateOrganization({
      orgId,
      name: formName.trim(),
      timezone: formTimezone,
      inviteCode: formInviteCode.trim() || null,
      inviteCodeEnabled: formInviteEnabled,
    })

    setLoading(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization Details</CardTitle>
          <CardDescription>Update your clinic information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={formTimezone} onValueChange={setFormTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Invite Code</CardTitle>
          <CardDescription>Patients can join your clinic with this code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="invite-enabled"
              checked={formInviteEnabled}
              onCheckedChange={setFormInviteEnabled}
            />
            <Label htmlFor="invite-enabled">Enable invite code</Label>
          </div>
          {formInviteEnabled && (
            <div className="space-y-2">
              <Label htmlFor="invite-code">Code</Label>
              <Input
                id="invite-code"
                value={formInviteCode}
                onChange={(e) => setFormInviteCode(e.target.value)}
                placeholder="e.g. my-clinic-2024"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  )
}
