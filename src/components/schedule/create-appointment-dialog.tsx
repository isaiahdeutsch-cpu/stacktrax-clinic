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
import { createAppointment } from '@/app/actions/appointments'

const APPOINTMENT_TYPES = [
  { value: 'initial_consult', label: 'Initial Consult' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'lab_review', label: 'Lab Review' },
  { value: 'check_in', label: 'Check In' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'other', label: 'Other' },
]

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>
  clinicians: Array<{ id: string; display_name: string | null }>
  orgId: string
}

export function CreateAppointmentDialog({ open, onOpenChange, patients, clinicians, orgId }: CreateAppointmentDialogProps) {
  const router = useRouter()
  const [patientId, setPatientId] = useState('')
  const [clinicianId, setClinicianId] = useState('')
  const [type, setType] = useState('follow_up')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState('30')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const startsAt = new Date(`${date}T${time}`).toISOString()
    const endsAt = new Date(new Date(`${date}T${time}`).getTime() + parseInt(duration) * 60000).toISOString()

    const result = await createAppointment({
      orgId,
      patientProfileId: patientId,
      clinicianId,
      type: type as 'initial_consult' | 'follow_up' | 'lab_review' | 'check_in' | 'telehealth' | 'other',
      title: title.trim() || null,
      startsAt,
      endsAt,
      durationMinutes: parseInt(duration),
      location: location.trim() || null,
      notes: notes.trim() || null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onOpenChange(false)
      setPatientId('')
      setClinicianId('')
      setTitle('')
      setDate('')
      setNotes('')
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId} required>
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
              <Label>Clinician</Label>
              <Select value={clinicianId} onValueChange={setClinicianId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.display_name ?? c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['15', '30', '45', '60', '90'].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office, telehealth link, etc." />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !patientId || !clinicianId || !date}>
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
