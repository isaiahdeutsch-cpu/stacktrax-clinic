'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Calendar,
  MessageSquare,
  Settings,
  FileText,
  TestTube,
} from 'lucide-react'
import type { OrgFeatures } from '@/lib/features'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  feature?: keyof OrgFeatures
  minRole?: OrgRole
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users, minRole: 'staff' },
  { label: 'Protocols', href: '/protocols', icon: FlaskConical, feature: 'protocols', minRole: 'staff' },
  { label: 'Notes', href: '/patients', icon: FileText, feature: 'notes', minRole: 'staff' },
  { label: 'Labs', href: '/patients', icon: TestTube, feature: 'labs', minRole: 'staff' },
  { label: 'Schedule', href: '/schedule', icon: Calendar, feature: 'scheduling' },
  { label: 'Messages', href: '/messages', icon: MessageSquare, feature: 'messaging' },
  { label: 'Settings', href: '/settings/general', icon: Settings, minRole: 'admin' },
]

interface SidebarNavProps {
  features: OrgFeatures
  role: OrgRole
}

export function SidebarNav({ features, role }: SidebarNavProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.feature && !features[item.feature]) return false
    if (item.minRole && !hasMinRole(role, item.minRole)) return false
    return true
  })

  // Deduplicate items that point to /patients (Notes/Labs are sub-sections)
  const dedupedItems = visibleItems.filter(
    (item, index, arr) =>
      item.href !== '/patients' || arr.findIndex((i) => i.href === '/patients') === index
  )

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {dedupedItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
