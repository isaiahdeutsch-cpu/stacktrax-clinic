-- ============================================================================
-- Migration 007: Messaging (thread-based)
-- ============================================================================

-- Message threads: one thread per (org, patient) pair
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  subject TEXT,
  status thread_status NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,     -- truncated preview of last message
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, patient_profile_id)
);

CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_message_threads_org ON message_threads(org_id);
CREATE INDEX idx_message_threads_patient ON message_threads(patient_profile_id);
CREATE INDEX idx_message_threads_last_msg ON message_threads(org_id, last_message_at DESC);

-- Messages: individual messages within a thread
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,  -- denormalized for RLS
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  -- Read tracking
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_body_length CHECK (char_length(body) >= 1 AND char_length(body) <= 5000)
);

CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_org ON messages(org_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(thread_id) WHERE is_read = false;

-- Message attachments
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,       -- MIME type
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,    -- Supabase Storage path
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
