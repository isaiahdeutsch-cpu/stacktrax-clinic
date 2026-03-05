-- ============================================================================
-- Migration 010: RLS Helper Functions and All Policies
-- ============================================================================

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Check if the current user has a given role (or higher) in an org
-- Role hierarchy: owner > admin > clinician > staff > patient
CREATE OR REPLACE FUNCTION is_org_member_with_role(
  _org_id UUID,
  _min_role org_role
) RETURNS BOOLEAN AS $$
DECLARE
  _user_role org_role;
BEGIN
  SELECT role INTO _user_role
  FROM org_members
  WHERE org_id = _org_id
    AND user_id = auth.uid()
    AND is_active = true;

  IF _user_role IS NULL THEN RETURN false; END IF;

  -- Hierarchy check via enum ordering
  -- owner=0, admin=1, clinician=2, staff=3, patient=4
  RETURN _user_role <= _min_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if the current user is an assigned clinician for a patient
CREATE OR REPLACE FUNCTION is_assigned_clinician(
  _org_id UUID,
  _patient_profile_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clinician_assignments
    WHERE org_id = _org_id
      AND clinician_id = auth.uid()
      AND patient_profile_id = _patient_profile_id
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE id = _patient_profile_id
      AND org_id = _org_id
      AND primary_clinician_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if the current user is the patient linked to this patient_profile
CREATE OR REPLACE FUNCTION is_linked_patient(
  _patient_profile_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE id = _patient_profile_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacktrax_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;
-- audit_logs RLS already enabled in migration 009 (with no policies = no access via anon/auth)

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ---- profiles ----

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Org members read co-member profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members om1
      JOIN org_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid()
        AND om2.user_id = profiles.id
        AND om1.is_active = true
        AND om2.is_active = true
    )
  );

-- ---- organizations ----

CREATE POLICY "Members view own orgs"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = organizations.id
        AND org_members.user_id = auth.uid()
        AND org_members.is_active = true
    )
  );

CREATE POLICY "Owner/admin update org"
  ON organizations FOR UPDATE
  USING (is_org_member_with_role(organizations.id, 'admin'));

CREATE POLICY "Public lookup org by invite code"
  ON organizations FOR SELECT
  USING (invite_code_enabled = true AND invite_code IS NOT NULL);

-- ---- org_members ----

CREATE POLICY "Members view org members"
  ON org_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.org_id = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.is_active = true
    )
  );

CREATE POLICY "Owner/admin insert members"
  ON org_members FOR INSERT
  WITH CHECK (is_org_member_with_role(org_members.org_id, 'admin'));

CREATE POLICY "Owner/admin update members"
  ON org_members FOR UPDATE
  USING (is_org_member_with_role(org_members.org_id, 'admin'));

CREATE POLICY "Patient self-signup via invite code"
  ON org_members FOR INSERT
  WITH CHECK (
    org_members.user_id = auth.uid()
    AND org_members.role = 'patient'
    AND EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = org_members.org_id
        AND organizations.invite_code_enabled = true
    )
  );

CREATE POLICY "Owner/admin delete members"
  ON org_members FOR DELETE
  USING (is_org_member_with_role(org_members.org_id, 'admin'));

-- ---- patient_profiles ----

CREATE POLICY "Owner/admin manage patient profiles"
  ON patient_profiles FOR ALL
  USING (is_org_member_with_role(patient_profiles.org_id, 'admin'))
  WITH CHECK (is_org_member_with_role(patient_profiles.org_id, 'admin'));

CREATE POLICY "Clinicians view assigned patients"
  ON patient_profiles FOR SELECT
  USING (is_assigned_clinician(patient_profiles.org_id, patient_profiles.id));

CREATE POLICY "Clinicians update assigned patients"
  ON patient_profiles FOR UPDATE
  USING (is_assigned_clinician(patient_profiles.org_id, patient_profiles.id));

CREATE POLICY "Patients view own profile"
  ON patient_profiles FOR SELECT
  USING (is_linked_patient(patient_profiles.id));

-- ---- patient_invites ----

CREATE POLICY "Staff manage invites"
  ON patient_invites FOR ALL
  USING (is_org_member_with_role(patient_invites.org_id, 'clinician'))
  WITH CHECK (is_org_member_with_role(patient_invites.org_id, 'clinician'));

-- ---- clinician_assignments ----

CREATE POLICY "Owner/admin manage assignments"
  ON clinician_assignments FOR ALL
  USING (is_org_member_with_role(clinician_assignments.org_id, 'admin'))
  WITH CHECK (is_org_member_with_role(clinician_assignments.org_id, 'admin'));

CREATE POLICY "Clinicians view own assignments"
  ON clinician_assignments FOR SELECT
  USING (clinician_assignments.clinician_id = auth.uid());

-- ---- protocol_templates ----

CREATE POLICY "Clinician+ view templates"
  ON protocol_templates FOR SELECT
  USING (is_org_member_with_role(protocol_templates.org_id, 'clinician'));

CREATE POLICY "Clinician+ create templates"
  ON protocol_templates FOR INSERT
  WITH CHECK (is_org_member_with_role(protocol_templates.org_id, 'clinician'));

CREATE POLICY "Clinician+ update templates"
  ON protocol_templates FOR UPDATE
  USING (
    is_org_member_with_role(protocol_templates.org_id, 'admin')
    OR (
      is_org_member_with_role(protocol_templates.org_id, 'clinician')
      AND protocol_templates.created_by = auth.uid()
    )
  );

CREATE POLICY "Owner/admin delete templates"
  ON protocol_templates FOR DELETE
  USING (is_org_member_with_role(protocol_templates.org_id, 'admin'));

-- ---- protocol_template_items ----

CREATE POLICY "View template items via template"
  ON protocol_template_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protocol_templates pt
      WHERE pt.id = protocol_template_items.template_id
        AND is_org_member_with_role(pt.org_id, 'clinician')
    )
  );

CREATE POLICY "Manage template items"
  ON protocol_template_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM protocol_templates pt
      WHERE pt.id = protocol_template_items.template_id
        AND (
          is_org_member_with_role(pt.org_id, 'admin')
          OR (is_org_member_with_role(pt.org_id, 'clinician') AND pt.created_by = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM protocol_templates pt
      WHERE pt.id = protocol_template_items.template_id
        AND (
          is_org_member_with_role(pt.org_id, 'admin')
          OR (is_org_member_with_role(pt.org_id, 'clinician') AND pt.created_by = auth.uid())
        )
    )
  );

-- ---- patient_protocols ----

CREATE POLICY "Owner/admin manage protocols"
  ON patient_protocols FOR ALL
  USING (is_org_member_with_role(patient_protocols.org_id, 'admin'))
  WITH CHECK (is_org_member_with_role(patient_protocols.org_id, 'admin'));

CREATE POLICY "Clinicians manage assigned patient protocols"
  ON patient_protocols FOR ALL
  USING (
    is_org_member_with_role(patient_protocols.org_id, 'clinician')
    AND is_assigned_clinician(patient_protocols.org_id, patient_protocols.patient_profile_id)
  )
  WITH CHECK (
    is_org_member_with_role(patient_protocols.org_id, 'clinician')
    AND is_assigned_clinician(patient_protocols.org_id, patient_protocols.patient_profile_id)
  );

CREATE POLICY "Patients view own protocols"
  ON patient_protocols FOR SELECT
  USING (is_linked_patient(patient_protocols.patient_profile_id));

-- ---- patient_protocol_items ----

CREATE POLICY "View protocol items via protocol"
  ON patient_protocol_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_protocols pp
      WHERE pp.id = patient_protocol_items.protocol_id
        AND (
          is_org_member_with_role(pp.org_id, 'clinician')
          OR is_linked_patient(pp.patient_profile_id)
        )
    )
  );

CREATE POLICY "Staff manage protocol items"
  ON patient_protocol_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_protocols pp
      WHERE pp.id = patient_protocol_items.protocol_id
        AND (
          is_org_member_with_role(pp.org_id, 'admin')
          OR (
            is_org_member_with_role(pp.org_id, 'clinician')
            AND is_assigned_clinician(pp.org_id, pp.patient_profile_id)
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_protocols pp
      WHERE pp.id = patient_protocol_items.protocol_id
        AND (
          is_org_member_with_role(pp.org_id, 'admin')
          OR (
            is_org_member_with_role(pp.org_id, 'clinician')
            AND is_assigned_clinician(pp.org_id, pp.patient_profile_id)
          )
        )
    )
  );

-- ---- clinical_notes ----

CREATE POLICY "Owner/admin view all notes"
  ON clinical_notes FOR SELECT
  USING (is_org_member_with_role(clinical_notes.org_id, 'admin'));

CREATE POLICY "Clinicians view assigned patient notes"
  ON clinical_notes FOR SELECT
  USING (
    is_org_member_with_role(clinical_notes.org_id, 'clinician')
    AND is_assigned_clinician(clinical_notes.org_id, clinical_notes.patient_profile_id)
  );

CREATE POLICY "Clinician+ create notes"
  ON clinical_notes FOR INSERT
  WITH CHECK (
    clinical_notes.author_id = auth.uid()
    AND (
      is_org_member_with_role(clinical_notes.org_id, 'admin')
      OR is_assigned_clinician(clinical_notes.org_id, clinical_notes.patient_profile_id)
    )
  );

CREATE POLICY "Update notes"
  ON clinical_notes FOR UPDATE
  USING (
    (clinical_notes.author_id = auth.uid() AND clinical_notes.is_signed = false)
    OR is_org_member_with_role(clinical_notes.org_id, 'admin')
  );

CREATE POLICY "Admin delete notes"
  ON clinical_notes FOR DELETE
  USING (is_org_member_with_role(clinical_notes.org_id, 'admin'));

-- ---- lab_results ----

CREATE POLICY "Owner/admin view all labs"
  ON lab_results FOR SELECT
  USING (is_org_member_with_role(lab_results.org_id, 'admin'));

CREATE POLICY "Clinicians view assigned patient labs"
  ON lab_results FOR SELECT
  USING (
    is_org_member_with_role(lab_results.org_id, 'clinician')
    AND is_assigned_clinician(lab_results.org_id, lab_results.patient_profile_id)
  );

CREATE POLICY "Patients view own labs"
  ON lab_results FOR SELECT
  USING (is_linked_patient(lab_results.patient_profile_id));

CREATE POLICY "Clinician+ create labs"
  ON lab_results FOR INSERT
  WITH CHECK (
    is_org_member_with_role(lab_results.org_id, 'admin')
    OR is_assigned_clinician(lab_results.org_id, lab_results.patient_profile_id)
  );

CREATE POLICY "Clinician+ update labs"
  ON lab_results FOR UPDATE
  USING (
    is_org_member_with_role(lab_results.org_id, 'admin')
    OR is_assigned_clinician(lab_results.org_id, lab_results.patient_profile_id)
  );

CREATE POLICY "Admin delete labs"
  ON lab_results FOR DELETE
  USING (is_org_member_with_role(lab_results.org_id, 'admin'));

-- ---- appointments ----

CREATE POLICY "Owner/admin view all appointments"
  ON appointments FOR SELECT
  USING (is_org_member_with_role(appointments.org_id, 'admin'));

CREATE POLICY "Clinicians view own appointments"
  ON appointments FOR SELECT
  USING (appointments.clinician_id = auth.uid());

CREATE POLICY "Staff view appointments"
  ON appointments FOR SELECT
  USING (is_org_member_with_role(appointments.org_id, 'staff'));

CREATE POLICY "Patients view own appointments"
  ON appointments FOR SELECT
  USING (is_linked_patient(appointments.patient_profile_id));

CREATE POLICY "Clinician+ create appointments"
  ON appointments FOR INSERT
  WITH CHECK (is_org_member_with_role(appointments.org_id, 'clinician'));

CREATE POLICY "Clinician+ update appointments"
  ON appointments FOR UPDATE
  USING (is_org_member_with_role(appointments.org_id, 'clinician'));

CREATE POLICY "Owner/admin delete appointments"
  ON appointments FOR DELETE
  USING (is_org_member_with_role(appointments.org_id, 'admin'));

-- ---- message_threads ----

CREATE POLICY "Staff+ view threads"
  ON message_threads FOR SELECT
  USING (is_org_member_with_role(message_threads.org_id, 'staff'));

CREATE POLICY "Patients view own thread"
  ON message_threads FOR SELECT
  USING (is_linked_patient(message_threads.patient_profile_id));

CREATE POLICY "Clinician+ create threads"
  ON message_threads FOR INSERT
  WITH CHECK (is_org_member_with_role(message_threads.org_id, 'clinician'));

CREATE POLICY "Update threads"
  ON message_threads FOR UPDATE
  USING (
    is_org_member_with_role(message_threads.org_id, 'clinician')
    OR is_linked_patient(message_threads.patient_profile_id)
  );

-- ---- messages ----

CREATE POLICY "Staff+ view messages"
  ON messages FOR SELECT
  USING (is_org_member_with_role(messages.org_id, 'staff'));

CREATE POLICY "Patients view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
        AND is_linked_patient(mt.patient_profile_id)
    )
  );

CREATE POLICY "Send messages"
  ON messages FOR INSERT
  WITH CHECK (
    messages.sender_id = auth.uid()
    AND (
      is_org_member_with_role(messages.org_id, 'clinician')
      OR EXISTS (
        SELECT 1 FROM message_threads mt
        WHERE mt.id = messages.thread_id
          AND is_linked_patient(mt.patient_profile_id)
      )
    )
  );

CREATE POLICY "Update messages read status"
  ON messages FOR UPDATE
  USING (
    is_org_member_with_role(messages.org_id, 'clinician')
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
        AND is_linked_patient(mt.patient_profile_id)
    )
  );

-- ---- message_attachments ----

CREATE POLICY "View attachments via message"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
        AND (
          is_org_member_with_role(m.org_id, 'staff')
          OR EXISTS (
            SELECT 1 FROM message_threads mt
            WHERE mt.id = m.thread_id
              AND is_linked_patient(mt.patient_profile_id)
          )
        )
    )
  );

CREATE POLICY "Attach files to own messages"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
  );

-- ---- org_subscriptions ----

CREATE POLICY "Owner/admin view subscription"
  ON org_subscriptions FOR SELECT
  USING (is_org_member_with_role(org_subscriptions.org_id, 'admin'));

-- No direct user writes -- managed by Stripe webhooks via service role

-- ---- stacktrax_links ----

CREATE POLICY "Owner/admin view links"
  ON stacktrax_links FOR SELECT
  USING (is_org_member_with_role(stacktrax_links.org_id, 'admin'));

CREATE POLICY "Clinicians view assigned patient links"
  ON stacktrax_links FOR SELECT
  USING (is_assigned_clinician(stacktrax_links.org_id, stacktrax_links.patient_profile_id));

CREATE POLICY "Patients view own link"
  ON stacktrax_links FOR SELECT
  USING (is_linked_patient(stacktrax_links.patient_profile_id));

CREATE POLICY "Patients update own link"
  ON stacktrax_links FOR UPDATE
  USING (is_linked_patient(stacktrax_links.patient_profile_id));

CREATE POLICY "Owner/admin create links"
  ON stacktrax_links FOR INSERT
  WITH CHECK (is_org_member_with_role(stacktrax_links.org_id, 'admin'));

-- ---- sent_notifications ----

CREATE POLICY "Users manage own notifications"
  ON sent_notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
