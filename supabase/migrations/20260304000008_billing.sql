-- ============================================================================
-- Migration 008: Billing (org_subscriptions, stripe_webhook_events)
-- ============================================================================

CREATE TABLE org_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  tier clinic_subscription_tier NOT NULL DEFAULT 'starter',
  status clinic_subscription_status NOT NULL DEFAULT 'trialing',
  -- Stripe
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  -- Seat tracking
  seat_count INTEGER NOT NULL DEFAULT 1 CHECK (seat_count > 0),   -- number of clinician seats
  max_patients INTEGER,         -- NULL = unlimited
  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  -- Trial
  trial_ends_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_org_subscriptions_updated_at
  BEFORE UPDATE ON org_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_org_subscriptions_org ON org_subscriptions(org_id);
CREATE INDEX idx_org_subscriptions_stripe ON org_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_org_subscriptions_trial ON org_subscriptions(trial_ends_at) WHERE status = 'trialing';

-- Stripe webhook idempotency (same pattern as consumer app)
CREATE TABLE stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE stripe_webhook_events IS 'Idempotency table for Stripe webhook events. Safe to purge rows older than 30 days.';
