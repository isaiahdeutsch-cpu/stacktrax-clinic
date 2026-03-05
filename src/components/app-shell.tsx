'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { OrgSwitcher } from '@/components/org-switcher'
import { SidebarNav } from '@/components/sidebar-nav'
import { UserMenu } from '@/components/user-menu'
import type { OrgFeatures } from '@/lib/features'
import type { OrgRole } from '@/lib/roles'
import type { UserOrg } from '@/lib/org'

interface AppShellProps {
  children: React.ReactNode
  orgs: UserOrg[]
  currentOrgId: string
  features: OrgFeatures
  role: OrgRole
  user: {
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
}

function SidebarContent({ orgs, currentOrgId, features, role, user }: Omit<AppShellProps, 'children'>) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <OrgSwitcher orgs={orgs} currentOrgId={currentOrgId} />
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-auto py-2">
        <SidebarNav features={features} role={role} />
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="p-3">
        <UserMenu
          email={user.email}
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
        />
      </div>
    </div>
  )
}

export function AppShell({ children, ...sidebarProps }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r border-sidebar-border bg-sidebar">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <span className="text-sm font-semibold truncate">
              {sidebarProps.orgs.find((o) => o.id === sidebarProps.currentOrgId)?.name}
            </span>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
