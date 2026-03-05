-- ============================================================================
-- Migration 004: Protocol Tables (4 tables)
-- ============================================================================

-- Protocol templates: reusable protocol blueprints at the org level
CREATE TABLE protocol_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- e.g. 'TRT', 'Peptide Therapy', 'Weight Loss'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT template_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

CREATE TRIGGER update_protocol_templates_updated_at
  BEFORE UPDATE ON protocol_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_protocol_templates_org ON protocol_templates(org_id);
CREATE INDEX idx_protocol_templates_active ON protocol_templates(org_id) WHERE is_active = true;

-- Protocol template items: compounds/dosages in a template
CREATE TABLE protocol_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES protocol_templates(id) ON DELETE CASCADE,
  compound_name TEXT NOT NULL,  -- stored as text, not FK -- templates are portable
  dose_amount NUMERIC(10, 4) NOT NULL CHECK (dose_amount > 0),
  dose_unit TEXT NOT NULL,      -- 'mg', 'mcg', 'iu', 'ml', etc.
  frequency dosing_frequency NOT NULL DEFAULT 'daily',
  frequency_custom TEXT,        -- when frequency = 'custom', describe here
  route TEXT,                   -- 'subcutaneous', 'intramuscular', 'oral', 'nasal', 'topical'
  instructions TEXT,            -- free-text special instructions
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT template_item_compound_length CHECK (char_length(compound_name) >= 1 AND char_length(compound_name) <= 200)
);

CREATE INDEX idx_protocol_template_items_template ON protocol_template_items(template_id);

-- Patient protocols: assigned to a specific patient (deep copy from template)
CREATE TABLE patient_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES protocol_templates(id) ON DELETE SET NULL, -- source template, NULL if ad-hoc
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status protocol_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  notes TEXT,                   -- clinician notes on this patient's protocol
  -- Link to consumer StackTrax stack (populated when data sharing is active)
  stacktrax_stack_id UUID,      -- references consumer DB stack; not an FK (cross-DB)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT patient_protocol_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

CREATE TRIGGER update_patient_protocols_updated_at
  BEFORE UPDATE ON patient_protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_patient_protocols_org ON patient_protocols(org_id);
CREATE INDEX idx_patient_protocols_patient ON patient_protocols(patient_profile_id);
CREATE INDEX idx_patient_protocols_status ON patient_protocols(patient_profile_id, status);
CREATE INDEX idx_patient_protocols_assigned_by ON patient_protocols(assigned_by);

-- Patient protocol items: individual compounds in an assigned protocol
CREATE TABLE patient_protocol_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES patient_protocols(id) ON DELETE CASCADE,
  compound_name TEXT NOT NULL,
  dose_amount NUMERIC(10, 4) NOT NULL CHECK (dose_amount > 0),
  dose_unit TEXT NOT NULL,
  frequency dosing_frequency NOT NULL DEFAULT 'daily',
  frequency_custom TEXT,
  route TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Titration support
  titration_phases JSONB,       -- [{dose: 100, unit: "mg", duration_weeks: 2}, ...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT patient_protocol_item_compound_length CHECK (char_length(compound_name) >= 1 AND char_length(compound_name) <= 200)
);

CREATE TRIGGER update_patient_protocol_items_updated_at
  BEFORE UPDATE ON patient_protocol_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_patient_protocol_items_protocol ON patient_protocol_items(protocol_id);
CREATE INDEX idx_patient_protocol_items_active ON patient_protocol_items(protocol_id) WHERE is_active = true;
