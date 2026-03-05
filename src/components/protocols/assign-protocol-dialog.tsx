'use client'

import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { assignProtocol } from '@/app/actions/protocols'

interface Template {
  id: string
  name: string
  category: string | null
}

interface AssignProtocolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  orgId: string
  templates: Template[]
}

export function AssignProtocolDialog({ open, onOpenChange, patientId, orgId, templates }: AssignProtocolDialogProps) {
  const router = useRouter()
  const [templateId, setTemplateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAssign() {
    if (!templateId) return
    setLoading(true)
    setError(null)

    const result = await assignProtocol({ orgId, patientId, templateId })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onOpenChange(false)
      setTemplateId('')
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Protocol</DialogTitle>
          <DialogDescription>
            Select a template to assign to this patient. Items will be copied and can be customized.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Protocol Template</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} {t.category && `(${t.category})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={loading || !templateId}>
            {loading ? 'Assigning...' : 'Assign Protocol'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
