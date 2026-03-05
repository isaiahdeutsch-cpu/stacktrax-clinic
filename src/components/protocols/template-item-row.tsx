'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type DosingFrequency = Database['public']['Enums']['dosing_frequency']

export interface TemplateItem {
  id: string
  compound_name: string
  dose_amount: number
  dose_unit: string
  frequency: DosingFrequency
  frequency_custom: string | null
  route: string | null
  instructions: string | null
  sort_order: number
}

const FREQUENCIES: { value: DosingFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: '3x Daily' },
  { value: 'every_other_day', label: 'Every Other Day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'custom', label: 'Custom' },
]

const ROUTES = ['Oral', 'Sublingual', 'Subcutaneous', 'Intramuscular', 'Topical', 'Transdermal', 'Nasal', 'Other']

interface TemplateItemRowProps {
  item: TemplateItem
  index: number
  total: number
  onChange: (item: TemplateItem) => void
  onRemove: () => void
  onMove: (direction: 'up' | 'down') => void
}

export function TemplateItemRow({ item, index, total, onChange, onRemove, onMove }: TemplateItemRowProps) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove('up')} disabled={index === 0}>
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove('down')} disabled={index === total - 1}>
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Compound name"
            value={item.compound_name}
            onChange={(e) => onChange({ ...item, compound_name: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Dose"
              value={item.dose_amount || ''}
              onChange={(e) => onChange({ ...item, dose_amount: parseFloat(e.target.value) || 0 })}
              className="w-24"
              min={0}
              step="any"
              required
            />
            <Input
              placeholder="Unit"
              value={item.dose_unit}
              onChange={(e) => onChange({ ...item, dose_unit: e.target.value })}
              className="w-20"
              required
            />
          </div>
          <Select
            value={item.frequency}
            onValueChange={(v) => onChange({ ...item, frequency: v as DosingFrequency })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={item.route ?? ''}
            onValueChange={(v) => onChange({ ...item, route: v || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Route" />
            </SelectTrigger>
            <SelectContent>
              {ROUTES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {item.frequency === 'custom' && (
          <Input
            placeholder="Custom frequency (e.g. Mon/Wed/Fri)"
            value={item.frequency_custom ?? ''}
            onChange={(e) => onChange({ ...item, frequency_custom: e.target.value || null })}
          />
        )}

        <Input
          placeholder="Instructions (optional)"
          value={item.instructions ?? ''}
          onChange={(e) => onChange({ ...item, instructions: e.target.value || null })}
        />
      </CardContent>
    </Card>
  )
}
