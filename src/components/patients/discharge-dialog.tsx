'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { dischargePatient } from '@/app/actions/patients'

interface DischargeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  orgId: string
}

export function DischargeDialog({ open, onOpenChange, patientId, patientName, orgId }: DischargeDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDischarge() {
    setLoading(true)
    const result = await dischargePatient({ orgId, patientId, reason })
    setLoading(false)
    if (!result.error) {
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
          <DialogDescription>
            Discharge {patientName} from the clinic. This can be reversed later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="discharge-reason">Reason</Label>
          <Textarea
            id="discharge-reason"
            placeholder="Enter discharge reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDischarge} disabled={loading || !reason.trim()}>
            {loading ? 'Discharging...' : 'Discharge Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
