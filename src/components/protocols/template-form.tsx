'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'
import { TemplateItemRow, type TemplateItem } from '@/components/protocols/template-item-row'
import { createTemplate, updateTemplate } from '@/app/actions/protocols'

interface TemplateFormProps {
  orgId: string
  template?: {
    id: string
    name: string
    description: string | null
    category: string | null
    is_active: boolean
  }
  items?: TemplateItem[]
}

export function TemplateForm({ orgId, template, items: existingItems }: TemplateFormProps) {
  const router = useRouter()
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [category, setCategory] = useState(template?.category ?? '')
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [items, setItems] = useState<TemplateItem[]>(
    existingItems ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addItem() {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        compound_name: '',
        dose_amount: 0,
        dose_unit: 'mg',
        frequency: 'daily' as const,
        frequency_custom: null,
        route: null,
        instructions: null,
        sort_order: items.length,
      },
    ])
  }

  function updateItem(index: number, updated: TemplateItem) {
    const next = [...items]
    next[index] = updated
    setItems(next)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    )
      return
    const next = [...items]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
    setItems(next.map((item, i) => ({ ...item, sort_order: i })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      orgId,
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      isActive,
      items: items.map((item, i) => ({
        compound_name: item.compound_name,
        dose_amount: item.dose_amount,
        dose_unit: item.dose_unit,
        frequency: item.frequency,
        frequency_custom: item.frequency_custom,
        route: item.route,
        instructions: item.instructions,
        sort_order: i,
      })),
    }

    const result = template
      ? await updateTemplate({ ...payload, templateId: template.id })
      : await createTemplate(payload)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/protocols')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-name">Name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-category">Category</Label>
          <Input
            id="template-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. TRT, Peptides"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-desc">Description</Label>
        <Textarea
          id="template-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch id="template-active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="template-active">Active</Label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Protocol Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-3 w-3" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No items yet. Add compounds to this protocol template.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <TemplateItemRow
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                onChange={(updated) => updateItem(index, updated)}
                onRemove={() => removeItem(index)}
                onMove={(dir) => moveItem(index, dir)}
              />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
