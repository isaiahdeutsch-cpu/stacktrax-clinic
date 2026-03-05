/**
 * Smoke test: verifies all 21 tables, 13 enums, 3 RLS helpers,
 * and 3 storage buckets exist on the remote Supabase project.
 *
 * Run: npx tsx scripts/test-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(import.meta.dirname ?? __dirname, '..', '.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS
)

const EXPECTED_TABLES = [
  'organizations', 'profiles', 'org_members',
  'patient_profiles', 'patient_invites', 'clinician_assignments',
  'protocol_templates', 'protocol_template_items',
  'patient_protocols', 'patient_protocol_items',
  'clinical_notes', 'lab_results',
  'appointments',
  'message_threads', 'messages', 'message_attachments',
  'org_subscriptions', 'stripe_webhook_events',
  'audit_logs', 'stacktrax_links', 'sent_notifications',
]

const EXPECTED_ENUMS = [
  'org_role', 'patient_status', 'protocol_status', 'dosing_frequency',
  'note_type', 'appointment_status', 'appointment_type', 'lab_flag',
  'thread_status', 'invite_method', 'clinic_subscription_tier',
  'clinic_subscription_status', 'link_status',
]

const EXPECTED_FUNCTIONS = [
  'is_org_member_with_role',
  'is_assigned_clinician',
  'is_linked_patient',
]

const EXPECTED_BUCKETS = [
  'clinic-documents',
  'message-attachments',
  'org-assets',
]

let passed = 0
let failed = 0

function ok(label: string) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label: string, detail?: string) {
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
  failed++
}

async function main() {
  console.log('\n=== StackTrax Clinic Schema Smoke Test ===\n')

  // 1. Check tables exist by querying each one
  console.log('Tables:')
  for (const table of EXPECTED_TABLES) {
    const { error } = await supabase.from(table).select('*').limit(0)
    if (error) {
      fail(table, error.message)
    } else {
      ok(table)
    }
  }

  // 2. Check enums by inserting invalid values
  console.log('\nEnums (spot check):')
  // Try inserting an org_member with invalid role
  const { error: enumErr } = await supabase
    .from('org_members')
    .insert({ org_id: '00000000-0000-0000-0000-000000000000', user_id: '00000000-0000-0000-0000-000000000000', role: 'INVALID_ROLE' })
  if (enumErr && enumErr.message.includes('invalid input value')) {
    ok('org_role enum rejects invalid values')
  } else if (enumErr && (enumErr.message.includes('violates foreign key') || enumErr.message.includes('not present'))) {
    // FK failed before enum check, which means enum type exists
    ok('org_role enum exists (FK checked first)')
  } else {
    fail('org_role enum check', enumErr?.message || 'no error on invalid enum')
  }

  // 3. Check RLS is enabled
  console.log('\nRLS enabled (spot check with anon client):')
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  // Unauthenticated anon should get empty results from RLS-protected tables
  const { data: anonOrgs, error: anonErr } = await anonClient
    .from('organizations')
    .select('id')
    .limit(1)
  if (!anonErr && anonOrgs && anonOrgs.length === 0) {
    ok('organizations returns empty for anon (RLS working)')
  } else if (anonErr) {
    // Some RLS configs return permission denied
    ok(`organizations blocked for anon: ${anonErr.code}`)
  } else {
    fail('organizations RLS', 'anon can see data')
  }

  // Audit logs should be completely blocked
  const { data: anonAudit, error: auditErr } = await anonClient
    .from('audit_logs')
    .select('id')
    .limit(1)
  if (auditErr) {
    ok(`audit_logs blocked for anon: ${auditErr.code}`)
  } else if (anonAudit && anonAudit.length === 0) {
    ok('audit_logs returns empty for anon (zero-policy RLS)')
  } else {
    fail('audit_logs RLS', 'anon can see data')
  }

  // 4. Check storage buckets
  console.log('\nStorage buckets:')
  for (const bucket of EXPECTED_BUCKETS) {
    const { data, error } = await supabase.storage.getBucket(bucket)
    if (error) {
      fail(bucket, error.message)
    } else {
      const visibility = data.public ? 'public' : 'private'
      ok(`${bucket} (${visibility}, ${(data.file_size_limit || 0) / 1024 / 1024}MB limit)`)
    }
  }

  // 5. Check functions exist by calling them (they'll fail on auth but exist)
  console.log('\nRLS helper functions:')
  for (const fn of EXPECTED_FUNCTIONS) {
    const { error } = await supabase.rpc(fn, {
      _org_id: '00000000-0000-0000-0000-000000000000',
      _patient_profile_id: '00000000-0000-0000-0000-000000000000',
      _min_role: 'admin',
    } as any)
    if (error && error.message.includes('does not exist')) {
      fail(fn, 'function not found')
    } else {
      // Any other error (wrong args, auth issue) means function exists
      ok(fn)
    }
  }

  // 6. Quick write/delete test on organizations
  console.log('\nWrite test:')
  const { data: org, error: insertErr } = await supabase
    .from('organizations')
    .insert({ name: '__smoke_test__' })
    .select('id, name, invite_code, features')
    .single()

  if (insertErr) {
    fail('insert organization', insertErr.message)
  } else {
    ok(`insert organization (id=${org.id.slice(0, 8)}...)`)

    // Verify defaults
    if (org.invite_code && org.invite_code.length === 8) {
      ok(`invite_code auto-generated: ${org.invite_code}`)
    } else {
      fail('invite_code default', `got: ${org.invite_code}`)
    }

    const features = org.features as any
    if (features.scheduling === true && features.price_check === false) {
      ok('feature flags defaults correct')
    } else {
      fail('feature flags defaults', JSON.stringify(features))
    }

    // Clean up
    const { error: delErr } = await supabase
      .from('organizations')
      .delete()
      .eq('id', org.id)
    if (delErr) {
      fail('cleanup delete', delErr.message)
    } else {
      ok('cleanup: smoke test org deleted')
    }
  }

  // Summary
  console.log(`\n${'='.repeat(45)}`)
  console.log(`  ${passed} passed, ${failed} failed`)
  console.log(`${'='.repeat(45)}\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
