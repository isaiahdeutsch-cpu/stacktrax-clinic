'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getOrCreateThread, sendMessage } from '@/app/actions/messages'

interface NewThreadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>
  orgId: string
}

export function NewThreadDialog({ open, onOpenChange, patients, orgId }: NewThreadDialogProps) {
  const router = useRouter()
  const [patientId, setPatientId] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId || !message.trim()) return
    setLoading(true)
    setError(null)

    const threadResult = await getOrCreateThread({
      orgId,
      patientProfileId: patientId,
      subject: subject.trim() || null,
    })

    if (threadResult.error || !threadResult.threadId) {
      setError(threadResult.error ?? 'Failed to create thread')
      setLoading(false)
      return
    }

    const msgResult = await sendMessage({
      orgId,
      threadId: threadResult.threadId,
      body: message.trim(),
    })

    if (msgResult.error) {
      setError(msgResult.error)
      setLoading(false)
      return
    }

    onOpenChange(false)
    setPatientId('')
    setSubject('')
    setMessage('')
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message Thread</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.first_name || p.last_name
                      ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
                      : p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !patientId || !message.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
