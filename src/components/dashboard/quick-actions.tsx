import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, FlaskConical, Calendar, MessageSquare } from 'lucide-react'
import type { OrgFeatures } from '@/lib/features'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

interface QuickActionsProps {
  role: OrgRole
  features: OrgFeatures
}

export function QuickActions({ role, features }: QuickActionsProps) {
  const isStaff = hasMinRole(role, 'staff')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {isStaff && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/patients">
              <UserPlus className="mr-2 h-4 w-4" />
              View Patients
            </Link>
          </Button>
        )}
        {isStaff && features.protocols && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/protocols">
              <FlaskConical className="mr-2 h-4 w-4" />
              Protocol Templates
            </Link>
          </Button>
        )}
        {features.scheduling && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Link>
          </Button>
        )}
        {features.messaging && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
