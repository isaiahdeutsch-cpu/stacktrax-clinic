import { getActiveOrg } from '@/lib/get-org'
import { hasMinRole } from '@/lib/roles'
import { redirect } from 'next/navigation'
import { SettingsNav } from '@/components/settings/settings-nav'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getActiveOrg()

  if (!hasMinRole(role, 'admin')) redirect('/dashboard')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <SettingsNav role={role} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
