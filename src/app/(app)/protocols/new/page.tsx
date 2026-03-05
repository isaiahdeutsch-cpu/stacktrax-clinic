import { getActiveOrg } from '@/lib/get-org'
import { TemplateForm } from '@/components/protocols/template-form'

export default async function NewProtocolTemplatePage() {
  const { orgId } = await getActiveOrg()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Protocol Template</h1>
      <TemplateForm orgId={orgId} />
    </div>
  )
}
