'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DischargeDialog } from '@/components/patients/discharge-dialog'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'
import type { OrgFeatures } from '@/lib/features'

interface Patient {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  status: string
  primary_clinician: { display_name: string | null } | null
}

interface PatientHeaderProps {
  patient: Patient
  role: OrgRole
  features: OrgFeatures
  orgId: string
}

interface TabDef {
  label: string
  href: string
  feature?: keyof OrgFeatures
  minRole?: OrgRole
}

export function PatientHeader({ patient, role, features, orgId }: PatientHeaderProps) {
  const pathname = usePathname()
  const [dischargeOpen, setDischargeOpen] = useState(false)
  const basePath = `/patients/${patient.id}`

  const name =
    patient.first_name || patient.last_name
      ? `${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim()
      : patient.email

  const tabs: TabDef[] = [
    { label: 'Overview', href: basePath },
    { label: 'Protocols', href: `${basePath}/protocols`, feature: 'protocols', minRole: 'staff' },
    { label: 'Notes', href: `${basePath}/notes`, feature: 'notes', minRole: 'staff' },
    { label: 'Labs', href: `${basePath}/labs`, feature: 'labs', minRole: 'staff' },
    { label: 'Schedule', href: `${basePath}/schedule`, feature: 'scheduling' },
    { label: 'Messages', href: `${basePath}/messages`, feature: 'messaging' },
  ]

  const visibleTabs = tabs.filter((t) => {
    if (t.feature && !features[t.feature]) return false
    if (t.minRole && !hasMinRole(role, t.minRole)) return false
    return true
  })

  const activeTab = visibleTabs.find((t) => pathname === t.href) ?? visibleTabs[0]

  return (
    <div className="border-b bg-card">
      <div className="p-6 pb-0 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/patients">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-muted-foreground">{patient.email}</p>
            </div>
            <Badge
              variant={patient.status === 'active' ? 'default' : patient.status === 'discharged' ? 'destructive' : 'secondary'}
            >
              {patient.status}
            </Badge>
          </div>
          {hasMinRole(role, 'clinician') && patient.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => setDischargeOpen(true)}>
              Discharge
            </Button>
          )}
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex gap-1 min-w-max">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                  pathname === tab.href
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <DischargeDialog
        open={dischargeOpen}
        onOpenChange={setDischargeOpen}
        patientId={patient.id}
        patientName={name}
        orgId={orgId}
      />
    </div>
  )
}
