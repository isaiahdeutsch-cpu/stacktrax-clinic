-- ============================================================================
-- Migration 005: Clinical Notes and Lab Results
-- ============================================================================

CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  type note_type NOT NULL DEFAULT 'progress',
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  -- Optional links
  protocol_id UUID REFERENCES patient_protocols(id) ON DELETE SET NULL,
  appointment_id UUID,  -- FK added after appointments table is created (migration 006)
  is_signed BOOLEAN NOT NULL DEFAULT false,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT note_body_not_empty CHECK (char_length(body) >= 1)
);

CREATE TRIGGER update_clinical_notes_updated_at
  BEFORE UPDATE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_clinical_notes_org ON clinical_notes(org_id);
CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_profile_id);
CREATE INDEX idx_clinical_notes_author ON clinical_notes(author_id);
CREATE INDEX idx_clinical_notes_type ON clinical_notes(patient_profile_id, type);
CREATE INDEX idx_clinical_notes_appointment ON clinical_notes(appointment_id) WHERE appointment_id IS NOT NULL;

-- ============================================================================
-- LAB RESULTS
-- ============================================================================

CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  entered_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Lab details
  test_name TEXT NOT NULL,
  test_category TEXT,           -- 'hormone', 'metabolic', 'lipid', 'cbc', 'other'
  value NUMERIC(12, 4),         -- NULL if qualitative result
  value_text TEXT,              -- for qualitative results: 'positive', 'reactive', etc.
  unit TEXT,                    -- 'ng/dL', 'mg/dL', 'mIU/L', etc.
  reference_range_low NUMERIC(12, 4),
  reference_range_high NUMERIC(12, 4),
  reference_range_text TEXT,    -- display string, e.g. '250-1100 ng/dL'
  flag lab_flag DEFAULT 'normal',
  -- Metadata
  lab_date DATE NOT NULL,
  lab_name TEXT,                -- ordering lab: 'Quest', 'LabCorp', etc.
  specimen_type TEXT,           -- 'blood', 'urine', 'saliva'
  notes TEXT,
  -- File attachment (lab report PDF)
  file_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lab_test_name_length CHECK (char_length(test_name) >= 1 AND char_length(test_name) <= 200)
);

CREATE TRIGGER update_lab_results_updated_at
  BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_lab_results_org ON lab_results(org_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_profile_id);
CREATE INDEX idx_lab_results_patient_date ON lab_results(patient_profile_id, lab_date DESC);
CREATE INDEX idx_lab_results_test ON lab_results(patient_profile_id, test_name);
CREATE INDEX idx_lab_results_flag ON lab_results(patient_profile_id, flag) WHERE flag != 'normal';
