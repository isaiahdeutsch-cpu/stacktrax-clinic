'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { CreateLabResultDialog } from '@/components/labs/create-lab-result-dialog'
import { LabFlagBadge } from '@/components/labs/lab-flag-badge'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

interface LabResult {
  id: string
  test_name: string
  test_category: string | null
  value: number | null
  value_text: string | null
  unit: string | null
  reference_range_low: number | null
  reference_range_high: number | null
  reference_range_text: string | null
  flag: string | null
  lab_date: string
  lab_name: string | null
  notes: string | null
  entered_by_profile: { display_name: string | null } | null
}

interface LabResultsListProps {
  labs: LabResult[]
  patientId: string
  orgId: string
  role: OrgRole
}

export function LabResultsList({ labs, patientId, orgId, role }: LabResultsListProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const canCreate = hasMinRole(role, 'staff')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lab Results</h2>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Add Result
          </Button>
        )}
      </div>

      {labs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No lab results yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lab</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((lab) => (
                <TableRow key={lab.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{lab.test_name}</span>
                      {lab.test_category && (
                        <span className="text-xs text-muted-foreground ml-2">({lab.test_category})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lab.value !== null
                      ? `${lab.value} ${lab.unit ?? ''}`
                      : lab.value_text ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lab.reference_range_text ??
                      (lab.reference_range_low != null && lab.reference_range_high != null
                        ? `${lab.reference_range_low}–${lab.reference_range_high}`
                        : '—')}
                  </TableCell>
                  <TableCell>
                    <LabFlagBadge flag={lab.flag} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(lab.lab_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lab.lab_name ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateLabResultDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patientId={patientId}
        orgId={orgId}
      />
    </div>
  )
}
