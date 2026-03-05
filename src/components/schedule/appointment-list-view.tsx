'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

interface Appointment {
  id: string
  starts_at: string
  ends_at: string
  duration_minutes: number
  type: string
  status: string
  title: string | null
  location: string | null
  patient: { first_name: string | null; last_name: string | null; email: string } | null
  clinician: { display_name: string | null } | null
}

interface AppointmentListViewProps {
  appointments: Appointment[]
  orgId: string
  role: OrgRole
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'secondary',
  confirmed: 'default',
  checked_in: 'default',
  in_progress: 'default',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

export function AppointmentListView({ appointments, orgId, role }: AppointmentListViewProps) {
  const router = useRouter()
  const canManage = hasMinRole(role, 'staff')

  async function handleCancel(id: string) {
    await updateAppointmentStatus({ orgId, appointmentId: id, status: 'cancelled' })
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No appointments found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date/Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Clinician</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const patientName = apt.patient
              ? `${apt.patient.first_name ?? ''} ${apt.patient.last_name ?? ''}`.trim() || apt.patient.email
              : '—'
            return (
              <TableRow key={apt.id}>
                <TableCell>
                  <div className="text-sm">
                    {new Date(apt.starts_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(apt.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(apt.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{patientName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {apt.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {apt.clinician?.display_name ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[apt.status] ?? 'secondary'}>
                    {apt.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleCancel(apt.id)}>
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
