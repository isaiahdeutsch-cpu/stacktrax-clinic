import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { OrgFeatures } from '@/lib/features'

interface RecentActivityProps {
  appointments: Array<{
    id: string
    title: string | null
    starts_at: string
    type: string
    status: string
  }>
  notes: Array<{
    id: string
    title: string | null
    type: string
    created_at: string
    is_signed: boolean
  }>
  features: OrgFeatures
}

export function RecentActivity({ appointments, notes, features }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.scheduling && appointments.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Upcoming Appointments</p>
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{apt.title ?? apt.type.replace('_', ' ')}</span>
                  <span className="text-muted-foreground text-xs shrink-0 ml-2">
                    {new Date(apt.starts_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {features.notes && notes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Recent Notes</p>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{note.title ?? note.type}</span>
                  <Badge variant={note.is_signed ? 'default' : 'secondary'} className="text-xs shrink-0 ml-2">
                    {note.is_signed ? 'Signed' : 'Draft'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        {appointments.length === 0 && notes.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  )
}
