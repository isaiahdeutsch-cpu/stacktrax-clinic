'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'
import type { Database } from '@/lib/supabase/database.types'

type DosingFrequency = Database['public']['Enums']['dosing_frequency']

interface TemplateItemInput {
  compound_name: string
  dose_amount: number
  dose_unit: string
  frequency: DosingFrequency
  frequency_custom: string | null
  route: string | null
  instructions: string | null
  sort_order: number
}

export async function createTemplate(input: {
  orgId: string
  name: string
  description: string | null
  category: string | null
  isActive: boolean
  items: TemplateItemInput[]
}) {
  const membership = await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { data: template, error } = await admin
    .from('protocol_templates')
    .insert({
      org_id: input.orgId,
      created_by: membership.user_id,
      name: input.name,
      description: input.description,
      category: input.category,
      is_active: input.isActive,
    })
    .select('id')
    .single()

  if (error || !template) return { error: 'Failed to create template' }

  if (input.items.length > 0) {
    const { error: itemsError } = await admin
      .from('protocol_template_items')
      .insert(
        input.items.map((item) => ({
          template_id: template.id,
          ...item,
        }))
      )

    if (itemsError) return { error: 'Template created but failed to add items' }
  }

  revalidatePath('/protocols')
  return { error: null }
}

export async function updateTemplate(input: {
  orgId: string
  templateId: string
  name: string
  description: string | null
  category: string | null
  isActive: boolean
  items: TemplateItemInput[]
}) {
  await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('protocol_templates')
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      is_active: input.isActive,
    })
    .eq('id', input.templateId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to update template' }

  // Replace all items
  await admin
    .from('protocol_template_items')
    .delete()
    .eq('template_id', input.templateId)

  if (input.items.length > 0) {
    await admin
      .from('protocol_template_items')
      .insert(
        input.items.map((item) => ({
          template_id: input.templateId,
          ...item,
        }))
      )
  }

  revalidatePath('/protocols')
  revalidatePath(`/protocols/${input.templateId}`)
  return { error: null }
}

export async function assignProtocol(input: {
  orgId: string
  patientId: string
  templateId: string
}) {
  const membership = await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  // Fetch template + items
  const [{ data: template }, { data: templateItems }] = await Promise.all([
    admin.from('protocol_templates').select('*').eq('id', input.templateId).single(),
    admin
      .from('protocol_template_items')
      .select('*')
      .eq('template_id', input.templateId)
      .order('sort_order', { ascending: true }),
  ])

  if (!template) return { error: 'Template not found' }

  // Create patient protocol (deep copy)
  const { data: protocol, error: protocolError } = await admin
    .from('patient_protocols')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientId,
      template_id: input.templateId,
      assigned_by: membership.user_id,
      name: template.name,
      description: template.description,
      status: 'active' as const,
      start_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (protocolError || !protocol) return { error: 'Failed to assign protocol' }

  // Deep copy items
  if (templateItems && templateItems.length > 0) {
    await admin
      .from('patient_protocol_items')
      .insert(
        templateItems.map((item) => ({
          protocol_id: protocol.id,
          compound_name: item.compound_name,
          dose_amount: item.dose_amount,
          dose_unit: item.dose_unit,
          frequency: item.frequency,
          frequency_custom: item.frequency_custom,
          route: item.route,
          instructions: item.instructions,
          sort_order: item.sort_order,
        }))
      )
  }

  revalidatePath(`/patients/${input.patientId}/protocols`)
  return { error: null }
}

export async function updateProtocolStatus(input: {
  orgId: string
  protocolId: string
  status: Database['public']['Enums']['protocol_status']
}) {
  await requireOrgRole(input.orgId, 'clinician')
  const admin = createAdminClient()

  const { error } = await admin
    .from('patient_protocols')
    .update({ status: input.status })
    .eq('id', input.protocolId)
    .eq('org_id', input.orgId)

  if (error) return { error: 'Failed to update protocol status' }

  revalidatePath('/patients')
  return { error: null }
}
