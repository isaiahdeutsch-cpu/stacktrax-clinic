-- ============================================================================
-- Migration 001: Extensions, Enums, Utility Functions
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid and crypto functions

-- Utility: auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Org member roles: hierarchical from most to least privilege
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'clinician', 'staff', 'patient');

-- Patient lifecycle status
CREATE TYPE patient_status AS ENUM ('invited', 'active', 'inactive', 'discharged');

-- Protocol status
CREATE TYPE protocol_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- Protocol item frequency
CREATE TYPE dosing_frequency AS ENUM (
  'daily', 'twice_daily', 'three_times_daily',
  'every_other_day', 'weekly', 'biweekly', 'monthly',
  'as_needed', 'custom'
);

-- Clinical note type
CREATE TYPE note_type AS ENUM ('intake', 'progress', 'follow_up', 'discharge', 'general');

-- Appointment status
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Appointment type
CREATE TYPE appointment_type AS ENUM ('initial_consult', 'follow_up', 'lab_review', 'check_in', 'telehealth', 'other');

-- Lab result flag
CREATE TYPE lab_flag AS ENUM ('normal', 'low', 'high', 'critical_low', 'critical_high');

-- Message thread status
CREATE TYPE thread_status AS ENUM ('open', 'closed', 'archived');

-- Invite method
CREATE TYPE invite_method AS ENUM ('email', 'clinic_code');

-- Org subscription tier
CREATE TYPE clinic_subscription_tier AS ENUM ('starter', 'professional', 'enterprise');

-- Org subscription status
CREATE TYPE clinic_subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'paused');

-- StackTrax link/consent status
CREATE TYPE link_status AS ENUM ('pending', 'active', 'revoked');
