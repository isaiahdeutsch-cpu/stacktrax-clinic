import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrg } from '@/lib/get-org'
import { TemplateForm } from '@/components/protocols/template-form'

interface Props {
  params: Promise<{ templateId: string }>
}

export default async function EditProtocolTemplatePage({ params }: Props) {
  const { templateId } = await params
  const { orgId } = await getActiveOrg()
  const supabase = await createClient()

  const [{ data: template }, { data: items }] = await Promise.all([
    supabase
      .from('protocol_templates')
      .select('*')
      .eq('id', templateId)
      .eq('org_id', orgId)
      .single(),
    supabase
      .from('protocol_template_items')
      .select('*')
      .eq('template_id', templateId)
      .order('sort_order', { ascending: true }),
  ])

  if (!template) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Template: {template.name}</h1>
      <TemplateForm orgId={orgId} template={template} items={items ?? []} />
    </div>
  )
}
