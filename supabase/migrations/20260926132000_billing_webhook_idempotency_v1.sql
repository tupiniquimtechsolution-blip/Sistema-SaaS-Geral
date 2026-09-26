-- Billing event ledger: durable provider idempotency and tenant-scoped subscription state.
-- Secrets and webhook signatures are never stored here.

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

-- Webhook processing is service-side only. No anon/authenticated policies are
-- created intentionally; service_role bypass is restricted to the trusted
-- server/edge boundary.

CREATE INDEX IF NOT EXISTS billing_webhook_events_tenant_received_idx
  ON billing_webhook_events (tenant_id, received_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_identity_uidx
  ON subscriptions (provider, provider_id)
  WHERE provider_id IS NOT NULL;
