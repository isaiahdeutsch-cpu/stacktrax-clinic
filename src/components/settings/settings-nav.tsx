'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { OrgRole } from '@/lib/roles'

const TABS = [
  { label: 'General', href: '/settings/general' },
  { label: 'Members', href: '/settings/members' },
  { label: 'Features', href: '/settings/features', ownerOnly: true },
  { label: 'Billing', href: '/settings/billing', ownerOnly: true },
]

export function SettingsNav({ role }: { role: OrgRole }) {
  const pathname = usePathname()

  const visibleTabs = TABS.filter((t) => !t.ownerOnly || role === 'owner')

  return (
    <nav className="flex md:flex-col gap-1 md:w-48 shrink-0">
      {visibleTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === tab.href
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
