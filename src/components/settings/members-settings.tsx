'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateMemberRole } from '@/app/actions/settings'
import type { OrgRole } from '@/lib/roles'

interface Member {
  id: string
  user_id: string
  role: OrgRole
  is_active: boolean
  joined_at: string | null
  profile: { email: string; display_name: string | null; avatar_url: string | null } | null
}

interface MembersSettingsProps {
  members: Member[]
  orgId: string
  currentRole: OrgRole
}

const ROLES: OrgRole[] = ['owner', 'admin', 'clinician', 'staff', 'patient']

export function MembersSettings({ members, orgId, currentRole }: MembersSettingsProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleRoleChange(memberId: string, newRole: OrgRole) {
    setUpdating(memberId)
    await updateMemberRole({ orgId, memberId, role: newRole })
    setUpdating(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Members</CardTitle>
        <CardDescription>Manage your clinic team and their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.profile?.display_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.profile?.email ?? '—'}
                  </TableCell>
                  <TableCell>
                    {currentRole === 'owner' && m.role !== 'owner' ? (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleRoleChange(m.id, v as OrgRole)}
                        disabled={updating === m.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.filter((r) => r !== 'owner').map((r) => (
                            <SelectItem key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{m.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.is_active ? 'default' : 'secondary'}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
