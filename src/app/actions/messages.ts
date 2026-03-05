'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOrgRole } from '@/lib/auth-utils'

export async function getOrCreateThread(input: {
  orgId: string
  patientProfileId: string
  subject: string | null
}) {
  await requireOrgRole(input.orgId, 'patient') // Any member can message
  const admin = createAdminClient()

  // Check for existing open thread with this patient
  const { data: existing } = await admin
    .from('message_threads')
    .select('id')
    .eq('org_id', input.orgId)
    .eq('patient_profile_id', input.patientProfileId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return { threadId: existing.id, error: null }

  // Create new thread
  const { data: thread, error } = await admin
    .from('message_threads')
    .insert({
      org_id: input.orgId,
      patient_profile_id: input.patientProfileId,
      subject: input.subject,
    })
    .select('id')
    .single()

  if (error || !thread) return { threadId: null, error: 'Failed to create thread' }

  return { threadId: thread.id, error: null }
}

export async function sendMessage(input: {
  orgId: string
  threadId: string
  body: string
}) {
  const membership = await requireOrgRole(input.orgId, 'patient')
  const admin = createAdminClient()

  const { data: message, error } = await admin
    .from('messages')
    .insert({
      org_id: input.orgId,
      thread_id: input.threadId,
      sender_id: membership.user_id,
      body: input.body,
    })
    .select('id, body, sender_id, is_read, created_at')
    .single()

  if (error || !message) return { error: 'Failed to send message', message: null }

  // Update thread last message
  await admin
    .from('message_threads')
    .update({
      last_message_at: message.created_at,
      last_message_preview: input.body.slice(0, 100),
    })
    .eq('id', input.threadId)

  revalidatePath('/messages')
  return { error: null, message }
}

export async function getThreadMessages(input: {
  orgId: string
  threadId: string
}) {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
    .eq('thread_id', input.threadId)
    .eq('org_id', input.orgId)
    .order('created_at', { ascending: true })

  return { messages: messages ?? [] }
}

export async function markMessagesRead(input: {
  orgId: string
  threadId: string
}) {
  const membership = await requireOrgRole(input.orgId, 'patient')
  const admin = createAdminClient()

  await admin
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('thread_id', input.threadId)
    .eq('org_id', input.orgId)
    .neq('sender_id', membership.user_id)
    .eq('is_read', false)

  return { error: null }
}
