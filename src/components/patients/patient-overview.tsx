import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { OrgFeatures } from '@/lib/features'
import type { OrgRole } from '@/lib/roles'

interface PatientOverviewProps {
  patient: {
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
    date_of_birth: string | null
    gender: string | null
    allergies: string[] | null
    medical_history: string | null
    current_medications: string | null
  }
  protocols: Array<{ id: string; name: string; status: string; start_date: string | null }>
  recentNotes: Array<{ id: string; title: string | null; type: string; created_at: string; is_signed: boolean }>
  recentLabs: Array<{ id: string; test_name: string; value: number | null; unit: string | null; flag: string | null; lab_date: string }>
  assignments: Array<{ id: string; clinician_id: string; profiles: unknown }>
  features: OrgFeatures
  role: OrgRole
  orgId: string
}

export function PatientOverview({ patient, protocols, recentNotes, recentLabs, assignments, features }: PatientOverviewProps) {
  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demographics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Email" value={patient.email} />
          <Row label="Phone" value={patient.phone ?? '—'} />
          <Row label="DOB" value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '—'} />
          <Row label="Gender" value={patient.gender ?? '—'} />
          {patient.allergies && patient.allergies.length > 0 && (
            <div>
              <span className="font-medium text-muted-foreground">Allergies:</span>{' '}
              <span>{patient.allergies.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Care Team</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clinicians assigned.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => {
                const profile = a.profiles as { display_name: string | null } | null
                return (
                  <div key={a.id} className="text-sm">
                    {profile?.display_name ?? 'Unknown clinician'}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {features.protocols && protocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Protocols</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {protocols.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <Badge variant="default">{p.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {features.notes && recentNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotes.map((n) => (
              <div key={n.id} className="flex items-center justify-between text-sm">
                <span>{n.title ?? n.type}</span>
                <Badge variant={n.is_signed ? 'default' : 'secondary'}>
                  {n.is_signed ? 'Signed' : 'Draft'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {features.labs && recentLabs.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Lab Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLabs.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span>{l.test_name}</span>
                  <span className="text-muted-foreground">
                    {l.value !== null ? `${l.value} ${l.unit ?? ''}` : '—'}
                    {l.flag && l.flag !== 'normal' && (
                      <Badge variant="destructive" className="ml-2 text-xs">{l.flag}</Badge>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
