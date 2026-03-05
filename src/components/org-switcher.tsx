'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, Building2 } from 'lucide-react'
import type { UserOrg } from '@/lib/org'

interface OrgSwitcherProps {
  orgs: UserOrg[]
  currentOrgId: string
}

export function OrgSwitcher({ orgs, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter()
  const currentOrg = orgs.find((o) => o.id === currentOrgId)

  function switchOrg(orgId: string) {
    document.cookie = `clinic-org-id=${orgId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
    router.refresh()
  }

  if (orgs.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-sidebar-foreground/60" />
        <span className="truncate text-sm font-semibold text-sidebar-foreground">
          {currentOrg?.name ?? 'Organization'}
        </span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-semibold">
              {currentOrg?.name ?? 'Organization'}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrg(org.id)}
            className={org.id === currentOrgId ? 'bg-accent' : ''}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
