-- ============================================================================
-- Migration 003: Patient Tables (patient_profiles, patient_invites, clinician_assignments)
-- ============================================================================

-- Patient profiles: clinical demographics (separate from auth profiles)
-- A patient record can exist BEFORE the patient signs up (created by clinician invite)
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Links to auth.users once patient signs up; NULL while still invited-only
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Demographics
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,         -- required for invite; unique per org
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,                 -- free-text: 'male', 'female', 'non-binary', etc.
  -- Clinical info
  allergies TEXT[],            -- e.g. ARRAY['penicillin', 'sulfa']
  medical_history TEXT,        -- free-text clinical notes on history
  current_medications TEXT,    -- free-text list of non-protocol medications
  -- Status
  status patient_status NOT NULL DEFAULT 'invited',
  -- Assignment
  primary_clinician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Discharge / StackTrax transition
  discharged_at TIMESTAMPTZ,
  discharged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transition_ends_at TIMESTAMPTZ, -- discharged_at + 14 days
  discharge_reason TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_patient_profiles_org ON patient_profiles(org_id);
CREATE INDEX idx_patient_profiles_user ON patient_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_patient_profiles_status ON patient_profiles(org_id, status);
CREATE INDEX idx_patient_profiles_clinician ON patient_profiles(primary_clinician_id) WHERE primary_clinician_id IS NOT NULL;
CREATE INDEX idx_patient_profiles_email ON patient_profiles(org_id, email);
CREATE INDEX idx_patient_profiles_transition ON patient_profiles(transition_ends_at) WHERE transition_ends_at IS NOT NULL AND status = 'discharged';

-- Patient invites: tracks pending invitations
CREATE TABLE patient_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invite_not_expired CHECK (expires_at > created_at)
);

CREATE INDEX idx_patient_invites_token ON patient_invites(invite_token) WHERE accepted_at IS NULL;
CREATE INDEX idx_patient_invites_email ON patient_invites(email) WHERE accepted_at IS NULL;
CREATE INDEX idx_patient_invites_org ON patient_invites(org_id);

-- Clinician-patient assignments (many-to-many beyond the primary)
-- primary_clinician_id on patient_profiles handles the main assignment;
-- this table tracks ALL clinicians who have access to a patient
CREATE TABLE clinician_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, clinician_id, patient_profile_id)
);

CREATE INDEX idx_clinician_assignments_clinician ON clinician_assignments(clinician_id, org_id) WHERE is_active = true;
CREATE INDEX idx_clinician_assignments_patient ON clinician_assignments(patient_profile_id) WHERE is_active = true;
