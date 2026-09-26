/**
 * Billing contracts — provider-neutral interfaces.
 * No real provider is implemented without credentials (mock/dev only).
 */

import type { SubscriptionState } from "./entitlement";

export interface BillingCustomer {
  id: string;
  tenantId: string;
  provider: string;
  providerCustomerId: string;
}

export interface BillingCheckoutSession {
  id: string;
  url: string;
  tenantId: string;
  planId: string;
}

export interface BillingSubscriptionSnapshot {
  provider: string;
  providerSubscriptionId: string;
  tenantId: string;
  planId: string;
  state: SubscriptionState;
  currentPeriodEnd?: string;
}

export type BillingWebhookEvent =
  | { type: "checkout.completed"; tenantId: string; planId: string; eventId: string }
  | { type: "subscription.activated"; tenantId: string; planId: string; eventId: string }
  | { type: "subscription.past_due"; tenantId: string; eventId: string }
  | { type: "subscription.canceled"; tenantId: string; eventId: string };

export interface BillingProvider {
  readonly name: string;
  createCustomer(tenantId: string, email: string): Promise<BillingCustomer>;
  createCheckoutSession(tenantId: string, planId: string): Promise<BillingCheckoutSession>;
  createPortalSession(tenantId: string): Promise<{ url: string }>;
  getSubscription(tenantId: string): Promise<BillingSubscriptionSnapshot | null>;
  cancelSubscription(tenantId: string): Promise<BillingSubscriptionSnapshot>;
  /** Verify signature and parse; must be idempotent per eventId. */
  verifyAndParseWebhook(rawBody: string, signature: string): BillingWebhookEvent;
}

/** Idempotency guard helper: tracks processed event ids. */
export class InMemoryWebhookIdempotency {
  private processed = new Set<string>();

  /** Returns true if this eventId was NOT seen before (and marks it processed). */
  acceptOnce(eventId: string): boolean {
    if (this.processed.has(eventId)) return false;
    this.processed.add(eventId);
    return true;
  }
}
