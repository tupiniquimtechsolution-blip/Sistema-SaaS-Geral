/**
 * Stripe billing adapter.
 *
 * Uses the Stripe HTTPS API directly so the SaaS does not depend on a ChatGPT
 * connector or browser OAuth. Secret keys and webhook secrets are server-only.
 */
import type {
  BillingCheckoutSession,
  BillingCustomer,
  BillingProvider,
  BillingSubscriptionSnapshot,
  BillingWebhookEvent,
} from "./billing";
import type { SubscriptionState } from "./entitlement";

export interface StripeBillingConfig {
  secretKey: string;
  webhookSecret: string;
  successUrl: string;
  cancelUrl: string;
  portalReturnUrl: string;
  /** Canonical SaaS plan id -> Stripe Price id. */
  priceIds: Readonly<Record<string, string>>;
  fetchImpl?: typeof fetch;
}

type StripeObject = Record<string, unknown>;

function required(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`Stripe response missing ${field}`);
  return value;
}

function mapStatus(status: string): SubscriptionState {
  switch (status) {
    case "trialing": return "trialing";
    case "active": return "active";
    case "past_due":
    case "unpaid": return "past_due";
    case "canceled": return "canceled";
    default: return "incomplete";
  }
}

export class StripeBillingProvider implements BillingProvider {
  readonly name = "stripe";
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: StripeBillingConfig) {
    if (!config.secretKey.startsWith("sk_")) throw new Error("Stripe secret key is required server-side");
    if (!config.webhookSecret.startsWith("whsec_")) throw new Error("Stripe webhook secret is required");
    this.fetcher = config.fetchImpl ?? fetch;
  }

  private async request(path: string, body?: URLSearchParams): Promise<StripeObject> {
    const response = await this.fetcher(`https://api.stripe.com/v1/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      body,
    });
    const payload = await response.json() as StripeObject;
    if (!response.ok) throw new Error(`Stripe API request failed (${response.status})`);
    return payload;
  }

  async createCustomer(tenantId: string, email: string): Promise<BillingCustomer> {
    const body = new URLSearchParams({ email, "metadata[tenant_id]": tenantId });
    const data = await this.request("customers", body);
    return { id: required(data.id, "customer.id"), tenantId, provider: this.name, providerCustomerId: required(data.id, "customer.id") };
  }

  async createCheckoutSession(tenantId: string, planId: string): Promise<BillingCheckoutSession> {
    const price = this.config.priceIds[planId];
    if (!price) throw new Error(`No Stripe Price configured for plan: ${planId}`);
    const body = new URLSearchParams({
      mode: "subscription",
      success_url: this.config.successUrl,
      cancel_url: this.config.cancelUrl,
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      "metadata[tenant_id]": tenantId,
      "metadata[plan_id]": planId,
      "subscription_data[metadata][tenant_id]": tenantId,
      "subscription_data[metadata][plan_id]": planId,
    });
    const data = await this.request("checkout/sessions", body);
    return { id: required(data.id, "checkout.id"), url: required(data.url, "checkout.url"), tenantId, planId };
  }

  async createPortalSession(tenantId: string): Promise<{ url: string }> {
    const customers = await this.request(`customers/search?query=${encodeURIComponent(`metadata['tenant_id']:'${tenantId}'`)}`);
    const list = Array.isArray(customers.data) ? customers.data as StripeObject[] : [];
    const customer = list[0];
    if (!customer) throw new Error("Stripe customer not found for tenant");
    const body = new URLSearchParams({ customer: required(customer.id, "customer.id"), return_url: this.config.portalReturnUrl });
    const data = await this.request("billing_portal/sessions", body);
    return { url: required(data.url, "portal.url") };
  }

  async getSubscription(tenantId: string): Promise<BillingSubscriptionSnapshot | null> {
    const data = await this.request(`subscriptions/search?query=${encodeURIComponent(`metadata['tenant_id']:'${tenantId}'`)}`);
    const list = Array.isArray(data.data) ? data.data as StripeObject[] : [];
    const sub = list[0]; if (!sub) return null;
    const metadata = (sub.metadata ?? {}) as StripeObject;
    return { provider: this.name, providerSubscriptionId: required(sub.id, "subscription.id"), tenantId, planId: required(metadata.plan_id, "metadata.plan_id"), state: mapStatus(required(sub.status, "subscription.status")) };
  }

  async cancelSubscription(tenantId: string): Promise<BillingSubscriptionSnapshot> {
    const current = await this.getSubscription(tenantId);
    if (!current) throw new Error("Stripe subscription not found for tenant");
    const data = await this.request(`subscriptions/${encodeURIComponent(current.providerSubscriptionId)}`, new URLSearchParams({ cancel_at_period_end: "true" }));
    return { ...current, state: mapStatus(required(data.status, "subscription.status")) };
  }

  verifyAndParseWebhook(): BillingWebhookEvent {
    // Cryptographic verification belongs in the server/edge adapter where the
    // raw request bytes and Stripe-Signature header are available. Fail closed
    // here rather than accepting an unverified browser/event payload.
    throw new Error("Use verifyStripeWebhook at the server boundary before parsing billing events");
  }
}
