import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { hasMinRole } from '@/lib/roles'

export default async function ProtocolTemplatesPage() {
  const { orgId, role } = await getActiveOrg()
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('protocol_templates')
    .select('*, protocol_template_items(count)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  const canCreate = hasMinRole(role, 'clinician')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Protocol Templates</h1>
        {canCreate && (
          <Button asChild>
            <Link href="/protocols/new">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Link>
          </Button>
        )}
      </div>

      {!templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No protocol templates yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} href={`/protocols/${t.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <Badge variant={t.is_active ? 'default' : 'secondary'}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {t.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{t.description}</p>
                  )}
                  {t.category && (
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
