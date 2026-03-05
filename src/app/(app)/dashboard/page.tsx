import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { hasMinRole } from '@/lib/roles'

export default async function DashboardPage() {
  const { orgId, role, features } = await getActiveOrg()
  const supabase = await createClient()
  const isStaff = hasMinRole(role, 'staff')

  const [patients, appointments, unreadMessages, recentNotes] = await Promise.all([
    isStaff
      ? supabase
          .from('patient_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .in('status', ['active', 'invited'])
      : Promise.resolve({ count: null }),
    features.scheduling
      ? supabase
          .from('appointments')
          .select('id, title, starts_at, type, status, patient_profile_id')
          .eq('org_id', orgId)
          .gte('starts_at', new Date().toISOString())
          .in('status', ['scheduled', 'confirmed'])
          .order('starts_at', { ascending: true })
          .limit(5)
      : Promise.resolve({ data: [] }),
    features.messaging
      ? supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('is_read', false)
      : Promise.resolve({ count: null }),
    features.notes && isStaff
      ? supabase
          .from('clinical_notes')
          .select('id, title, type, created_at, is_signed, author_id')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards
        patientCount={patients.count ?? 0}
        upcomingAppointments={appointments.data?.length ?? 0}
        unreadMessages={unreadMessages.count ?? 0}
        isStaff={isStaff}
        features={features}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity
          appointments={appointments.data ?? []}
          notes={recentNotes.data ?? []}
          features={features}
        />
        <QuickActions role={role} features={features} />
      </div>
    </div>
  )
}
