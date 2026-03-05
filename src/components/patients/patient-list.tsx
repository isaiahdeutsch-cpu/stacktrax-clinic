'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserPlus, Search } from 'lucide-react'
import { InvitePatientDialog } from '@/components/patients/invite-patient-dialog'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

type PatientStatus = 'invited' | 'active' | 'inactive' | 'discharged'

interface Patient {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  status: PatientStatus
  created_at: string
  primary_clinician: { display_name: string | null } | null
}

interface PatientListProps {
  patients: Patient[]
  clinicians: Array<{ id: string; display_name: string | null }>
  orgId: string
  role: OrgRole
}

const STATUS_COLORS: Record<PatientStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  invited: 'secondary',
  inactive: 'outline',
  discharged: 'destructive',
}

export function PatientList({ patients, clinicians, orgId, role }: PatientListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const canInvite = hasMinRole(role, 'staff')

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search ||
      `${p.first_name ?? ''} ${p.last_name ?? ''} ${p.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Patient
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="invited">Invited</TabsTrigger>
            <TabsTrigger value="discharged">Discharged</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clinician</TableHead>
              <TableHead className="text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/patients/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.first_name || p.last_name
                        ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
                        : 'Unnamed'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.primary_clinician?.display_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvitePatientDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        clinicians={clinicians}
        orgId={orgId}
      />
    </>
  )
}
