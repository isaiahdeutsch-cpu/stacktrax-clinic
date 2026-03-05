'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  starts_at: string
  type: string
  status: string
  title: string | null
  patient: { first_name: string | null; last_name: string | null; email: string } | null
}

interface AppointmentCalendarViewProps {
  appointments: Appointment[]
}

export function AppointmentCalendarView({ appointments }: AppointmentCalendarViewProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const apt of appointments) {
      const date = new Date(apt.starts_at).toLocaleDateString()
      const existing = map.get(date) ?? []
      existing.push(apt)
      map.set(date, existing)
    }
    return Array.from(map.entries()).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
  }, [appointments])

  if (grouped.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No appointments this month.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, apts]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-2">
            {apts.map((apt) => {
              const name = apt.patient
                ? `${apt.patient.first_name ?? ''} ${apt.patient.last_name ?? ''}`.trim() || apt.patient.email
                : 'Unknown'
              return (
                <Card key={apt.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        {new Date(apt.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm font-medium">{name}</span>
                      {apt.title && <span className="text-sm text-muted-foreground">— {apt.title}</span>}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {apt.type.replace('_', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
