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
import { createLabResult } from '@/app/actions/labs'

interface CreateLabResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  orgId: string
}

export function CreateLabResultDialog({ open, onOpenChange, patientId, orgId }: CreateLabResultDialogProps) {
  const router = useRouter()
  const [testName, setTestName] = useState('')
  const [testCategory, setTestCategory] = useState('')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [refLow, setRefLow] = useState('')
  const [refHigh, setRefHigh] = useState('')
  const [flag, setFlag] = useState('normal')
  const [labDate, setLabDate] = useState(new Date().toISOString().split('T')[0])
  const [labName, setLabName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createLabResult({
      orgId,
      patientId,
      testName: testName.trim(),
      testCategory: testCategory.trim() || null,
      value: value ? parseFloat(value) : null,
      unit: unit.trim() || null,
      referenceRangeLow: refLow ? parseFloat(refLow) : null,
      referenceRangeHigh: refHigh ? parseFloat(refHigh) : null,
      flag: flag as 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high',
      labDate,
      labName: labName.trim() || null,
      notes: notes.trim() || null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onOpenChange(false)
      setTestName('')
      setTestCategory('')
      setValue('')
      setUnit('')
      setRefLow('')
      setRefHigh('')
      setFlag('normal')
      setNotes('')
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Lab Result</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input value={testName} onChange={(e) => setTestName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={testCategory} onChange={(e) => setTestCategory(e.target.value)} placeholder="e.g. Hormones" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Value</Label>
              <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="ng/dL" />
            </div>
            <div className="space-y-2">
              <Label>Flag</Label>
              <Select value={flag} onValueChange={setFlag}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical_low">Critical Low</SelectItem>
                  <SelectItem value="critical_high">Critical High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ref Range Low</Label>
              <Input type="number" step="any" value={refLow} onChange={(e) => setRefLow(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ref Range High</Label>
              <Input type="number" step="any" value={refHigh} onChange={(e) => setRefHigh(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Lab Date</Label>
              <Input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Lab Name</Label>
              <Input value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="e.g. Quest" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
