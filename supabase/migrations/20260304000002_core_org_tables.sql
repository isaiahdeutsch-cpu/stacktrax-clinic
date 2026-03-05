-- ============================================================================
-- Migration 002: Core Org Tables (organizations, profiles, org_members)
-- ============================================================================

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  -- Feature flags: each can be toggled on/off per org
  features JSONB NOT NULL DEFAULT '{
    "scheduling": true,
    "messaging": true,
    "protocols": true,
    "labs": true,
    "notes": true,
    "price_check": false
  }'::jsonb,
  -- Org settings
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  business_hours JSONB DEFAULT '{
    "monday":    {"open": "08:00", "close": "17:00", "closed": false},
    "tuesday":   {"open": "08:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
    "thursday":  {"open": "08:00", "close": "17:00", "closed": false},
    "friday":    {"open": "08:00", "close": "17:00", "closed": false},
    "saturday":  {"open": "09:00", "close": "13:00", "closed": true},
    "sunday":    {"open": "09:00", "close": "13:00", "closed": true}
  }'::jsonb,
  -- Branding
  primary_color TEXT DEFAULT '#4F46E5',  -- indigo-600
  -- Invite code for patient self-signup
  invite_code TEXT UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8),
  invite_code_enabled BOOLEAN NOT NULL DEFAULT true,
  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT org_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT org_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' OR char_length(slug) = 1)
);

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_invite_code ON organizations(invite_code) WHERE invite_code_enabled = true;
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Profiles (extends auth.users in the CLINIC Supabase project)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Org members (clinicians, staff, patients -- all in one table)
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'patient',
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_method invite_method,
  joined_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_role ON org_members(org_id, role);
CREATE INDEX idx_org_members_active ON org_members(org_id) WHERE is_active = true;
