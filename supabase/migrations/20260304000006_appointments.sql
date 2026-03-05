-- ============================================================================
-- Migration 006: Appointments / Scheduling
-- ============================================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Scheduling
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  -- Type and status
  type appointment_type NOT NULL DEFAULT 'follow_up',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  -- Details
  title TEXT,
  notes TEXT,                       -- internal clinician notes
  patient_notes TEXT,               -- visible to patient
  location TEXT,                    -- room, telehealth URL, etc.
  -- Recurrence (NULL = one-off)
  recurrence_rule TEXT,             -- iCal RRULE string, e.g. 'FREQ=WEEKLY;INTERVAL=2'
  recurrence_parent_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointment_time_valid CHECK (ends_at > starts_at)
);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_appointments_org ON appointments(org_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_profile_id);
CREATE INDEX idx_appointments_clinician ON appointments(clinician_id);
CREATE INDEX idx_appointments_starts_at ON appointments(org_id, starts_at);
CREATE INDEX idx_appointments_clinician_schedule ON appointments(clinician_id, starts_at, ends_at) WHERE status NOT IN ('cancelled');
CREATE INDEX idx_appointments_status ON appointments(org_id, status);
CREATE INDEX idx_appointments_recurrence ON appointments(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;

-- Add FK from clinical_notes.appointment_id to appointments.id
ALTER TABLE clinical_notes
  ADD CONSTRAINT fk_clinical_notes_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
