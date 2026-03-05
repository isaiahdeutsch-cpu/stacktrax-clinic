'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, List, Calendar } from 'lucide-react'
import { AppointmentListView } from '@/components/schedule/appointment-list-view'
import { AppointmentCalendarView } from '@/components/schedule/appointment-calendar-view'
import { CreateAppointmentDialog } from '@/components/schedule/create-appointment-dialog'
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
  notes: string | null
  location: string | null
  patient: { first_name: string | null; last_name: string | null; email: string } | null
  clinician: { display_name: string | null } | null
}

interface ScheduleViewProps {
  appointments: Appointment[]
  patients: Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>
  clinicians: Array<{ id: string; display_name: string | null }>
  orgId: string
  role: OrgRole
}

export function ScheduleView({ appointments, patients, clinicians, orgId, role }: ScheduleViewProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [createOpen, setCreateOpen] = useState(false)
  const canCreate = hasMinRole(role, 'staff')

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <AppointmentListView appointments={appointments} orgId={orgId} role={role} />
      ) : (
        <AppointmentCalendarView appointments={appointments} />
      )}

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patients={patients}
        clinicians={clinicians}
        orgId={orgId}
      />
    </>
  )
}
