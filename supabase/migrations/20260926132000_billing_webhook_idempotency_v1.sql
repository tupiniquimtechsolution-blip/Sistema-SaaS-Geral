-- Billing webhook ledger and atomic Stripe subscription event processing.
-- Server/service boundary only. No browser access or secrets are stored here.

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  payload_sha256 TEXT NOT NULL,
  UNIQUE (provider, provider_event_id)
);

ALTER TABLE billing_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_webhook_events FORCE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS billing_webhook_events_tenant_received_idx
  ON billing_webhook_events (tenant_id, received_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_subscription_uidx
  ON subscriptions (provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

CREATE OR REPLACE FUNCTION process_stripe_subscription_event(
  p_event_id TEXT,
  p_tenant_id UUID,
  p_event_type TEXT,
  p_payload_sha256 TEXT,
  p_subscription_id TEXT DEFAULT NULL,
  p_customer_id TEXT DEFAULT NULL,
  p_plan_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_period_start TIMESTAMPTZ DEFAULT NULL,
  p_period_end TIMESTAMPTZ DEFAULT NULL,
  p_cancel_at_period_end BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted UUID;
  v_updated UUID;
  v_status TEXT;
BEGIN
  INSERT INTO billing_webhook_events (
    provider, provider_event_id, tenant_id, event_type, payload_sha256
  ) VALUES (
    'stripe', p_event_id, p_tenant_id, p_event_type, p_payload_sha256
  )
  ON CONFLICT (provider, provider_event_id) DO NOTHING
  RETURNING id INTO v_inserted;

  IF v_inserted IS NULL THEN
    RETURN jsonb_build_object('duplicate', true, 'processed', true);
  END IF;

  IF p_event_type IN (
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ) THEN
    v_status := CASE
      WHEN p_event_type = 'customer.subscription.deleted' THEN 'canceled'
      WHEN p_status IN ('trialing','active','past_due','canceled','incomplete') THEN p_status
      WHEN p_status = 'unpaid' THEN 'past_due'
      ELSE 'incomplete'
    END;

    UPDATE subscriptions
       SET provider = 'stripe',
           provider_customer_id = COALESCE(p_customer_id, provider_customer_id),
           provider_subscription_id = COALESCE(p_subscription_id, provider_subscription_id),
           plan_id = COALESCE(p_plan_id, plan_id),
           status = v_status,
           current_period_start = COALESCE(p_period_start, current_period_start),
           current_period_end = COALESCE(p_period_end, current_period_end),
           cancel_at_period_end = COALESCE(p_cancel_at_period_end, false),
           updated_at = now()
     WHERE tenant_id = p_tenant_id
     RETURNING id INTO v_updated;

    IF v_updated IS NULL THEN
      RAISE EXCEPTION 'No subscription row for tenant %', p_tenant_id
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  UPDATE billing_webhook_events
     SET processed_at = now()
   WHERE id = v_inserted;

  RETURN jsonb_build_object('duplicate', false, 'processed', true);
END;
$$;

REVOKE ALL ON FUNCTION process_stripe_subscription_event(
  TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION process_stripe_subscription_event(
  TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN
) TO service_role;
