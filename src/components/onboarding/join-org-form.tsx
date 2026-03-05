'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { joinOrganizationByCode } from '@/app/actions/onboarding'

export function JoinOrgForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await joinOrganizationByCode({ code: code.trim() })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      document.cookie = `clinic-org-id=${result.orgId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-code">Invite Code</Label>
        <Input
          id="invite-code"
          placeholder="Enter your clinic's invite code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Ask your clinic administrator for the invite code.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Joining...' : 'Join Clinic'}
      </Button>
    </form>
  )
}
