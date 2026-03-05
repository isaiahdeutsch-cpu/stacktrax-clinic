'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AssignProtocolDialog } from '@/components/protocols/assign-protocol-dialog'
import { updateProtocolStatus } from '@/app/actions/protocols'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'
import type { Database } from '@/lib/supabase/database.types'

type ProtocolStatus = Database['public']['Enums']['protocol_status']

interface Protocol {
  id: string
  name: string
  description: string | null
  status: ProtocolStatus
  start_date: string | null
  patient_protocol_items: Array<{
    id: string
    compound_name: string
    dose_amount: number
    dose_unit: string
    frequency: string
    route: string | null
  }>
}

interface PatientProtocolsListProps {
  protocols: Protocol[]
  templates: Array<{ id: string; name: string; category: string | null }>
  patientId: string
  orgId: string
  role: OrgRole
}

const STATUS_VARIANTS: Record<ProtocolStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  completed: 'secondary',
  cancelled: 'destructive',
}

export function PatientProtocolsList({ protocols, templates, patientId, orgId, role }: PatientProtocolsListProps) {
  const router = useRouter()
  const [assignOpen, setAssignOpen] = useState(false)
  const canAssign = hasMinRole(role, 'clinician')

  async function handleStatusChange(protocolId: string, status: ProtocolStatus) {
    await updateProtocolStatus({ orgId, protocolId, status })
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Protocols</h2>
        {canAssign && templates.length > 0 && (
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Assign Protocol
          </Button>
        )}
      </div>

      {protocols.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No protocols assigned yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {protocols.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge>
                    {canAssign && p.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleStatusChange(p.id, 'paused')}
                      >
                        Pause
                      </Button>
                    )}
                    {canAssign && p.status === 'paused' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleStatusChange(p.id, 'active')}
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {p.description && (
                  <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                )}
                {p.patient_protocol_items.length > 0 && (
                  <div className="space-y-1">
                    {p.patient_protocol_items.map((item) => (
                      <div key={item.id} className="text-sm flex items-center gap-2">
                        <span className="font-medium">{item.compound_name}</span>
                        <span className="text-muted-foreground">
                          {item.dose_amount} {item.dose_unit} — {item.frequency.replace('_', ' ')}
                        </span>
                        {item.route && (
                          <Badge variant="outline" className="text-xs">{item.route}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssignProtocolDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        patientId={patientId}
        orgId={orgId}
        templates={templates}
      />
    </div>
  )
}
