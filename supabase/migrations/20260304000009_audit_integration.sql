-- ============================================================================
-- Migration 009: Audit Logs, StackTrax Integration, Sent Notifications
-- ============================================================================

-- AUDIT LOGS (HIPAA compliance -- append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,       -- the user who performed the action (not FK to allow cross-system actors)
  patient_profile_id UUID REFERENCES patient_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,          -- e.g. 'view_patient_profile', 'assign_protocol'
  resource TEXT,                 -- table name or resource type
  resource_id TEXT,              -- UUID of the affected resource
  metadata JSONB,                -- additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No updated_at -- audit logs are append-only, never updated
-- RLS enabled with zero policies = no user access via API
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_patient ON audit_logs(patient_profile_id) WHERE patient_profile_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(org_id, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id) WHERE resource_id IS NOT NULL;

-- ============================================================================
-- STACKTRAX INTEGRATION
-- ============================================================================

-- Links between clinic patients and their consumer StackTrax accounts
CREATE TABLE stacktrax_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  -- Consumer StackTrax identifiers (not FKs -- different database)
  stacktrax_user_id UUID,        -- auth.users.id in the consumer project
  stacktrax_email TEXT NOT NULL,  -- email used on the consumer side
  -- Consent
  status link_status NOT NULL DEFAULT 'pending',
  consent_given_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  -- Data sharing scope
  share_dose_logs BOOLEAN NOT NULL DEFAULT true,
  share_checkins BOOLEAN NOT NULL DEFAULT true,
  share_body_metrics BOOLEAN NOT NULL DEFAULT true,
  share_protocols BOOLEAN NOT NULL DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, patient_profile_id)
);

CREATE TRIGGER update_stacktrax_links_updated_at
  BEFORE UPDATE ON stacktrax_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_stacktrax_links_patient ON stacktrax_links(patient_profile_id);
CREATE INDEX idx_stacktrax_links_stacktrax_user ON stacktrax_links(stacktrax_user_id) WHERE stacktrax_user_id IS NOT NULL;
CREATE INDEX idx_stacktrax_links_status ON stacktrax_links(status) WHERE status = 'active';

-- ============================================================================
-- SENT NOTIFICATIONS (dedup for cron-sent emails)
-- ============================================================================

CREATE TABLE sent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  reference_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_sent_notifications_dedup
  ON sent_notifications (user_id, notification_type, reference_key, ((sent_at AT TIME ZONE 'UTC')::date));

CREATE INDEX idx_sent_notifications_sent_at
  ON sent_notifications (sent_at);
