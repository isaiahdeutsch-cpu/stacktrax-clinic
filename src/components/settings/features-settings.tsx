'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateFeatureFlags } from '@/app/actions/settings'
import { parseFeatures, type OrgFeatures } from '@/lib/features'
import type { Json } from '@/lib/supabase/database.types'

const FEATURE_LABELS: Record<keyof OrgFeatures, { label: string; description: string }> = {
  protocols: { label: 'Protocols', description: 'Treatment protocol templates and assignment' },
  scheduling: { label: 'Scheduling', description: 'Appointment scheduling and calendar' },
  messaging: { label: 'Messaging', description: 'Thread-based messaging with patients' },
  labs: { label: 'Lab Results', description: 'Lab result entry and tracking' },
  notes: { label: 'Clinical Notes', description: 'Clinical note creation and signing' },
  stacktrax_link: { label: 'StackTrax Link', description: 'Integration with StackTrax consumer app' },
}

export function FeaturesSettings({ orgId, features: rawFeatures }: { orgId: string; features: Json }) {
  const router = useRouter()
  const [features, setFeatures] = useState<OrgFeatures>(parseFeatures(rawFeatures))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(key: keyof OrgFeatures) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    await updateFeatureFlags({ orgId, features })
    setLoading(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feature Flags</CardTitle>
        <CardDescription>Enable or disable features for your clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.keys(FEATURE_LABELS) as (keyof OrgFeatures)[]).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">{FEATURE_LABELS[key].label}</Label>
              <p className="text-xs text-muted-foreground">{FEATURE_LABELS[key].description}</p>
            </div>
            <Switch checked={features[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Features'}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </CardContent>
    </Card>
  )
}
