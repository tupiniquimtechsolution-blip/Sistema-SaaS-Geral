import { describe, expect, it, vi } from "vitest";
import { StripeBillingProvider } from "./stripe-billing";

function response(data: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => data } as Response;
}

describe("StripeBillingProvider", () => {
  it("creates subscription checkout with canonical server-side price mapping", async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = init?.body as URLSearchParams;
      expect(body.get("mode")).toBe("subscription");
      expect(body.get("line_items[0][price]")).toBe("price_pro");
      expect(body.get("metadata[tenant_id]")).toBe("tenant-a");
      expect(body.get("metadata[plan_id]")).toBe("pro");
      return response({ id: "cs_test_1", url: "https://checkout.stripe.test/session" });
    });
    const provider = new StripeBillingProvider({
      secretKey: "sk_test_fake",
      webhookSecret: "whsec_fake",
      successUrl: "https://example.test/success",
      cancelUrl: "https://example.test/cancel",
      portalReturnUrl: "https://example.test/account",
      priceIds: { pro: "price_pro" },
      fetchImpl: fetchImpl as typeof fetch,
    });
    await expect(provider.createCheckoutSession("tenant-a", "pro")).resolves.toEqual({
      id: "cs_test_1", url: "https://checkout.stripe.test/session", tenantId: "tenant-a", planId: "pro",
    });
  });

  it("fails closed when a plan has no configured Stripe price", async () => {
    const provider = new StripeBillingProvider({
      secretKey: "sk_test_fake", webhookSecret: "whsec_fake",
      successUrl: "https://example.test/s", cancelUrl: "https://example.test/c",
      portalReturnUrl: "https://example.test/a", priceIds: {}, fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    await expect(provider.createCheckoutSession("tenant-a", "unknown")).rejects.toThrow("No Stripe Price configured");
  });

  it("rejects forged webhook signatures", () => {
    const provider = new StripeBillingProvider({
      secretKey: "sk_test_fake", webhookSecret: "whsec_fake",
      successUrl: "https://example.test/s", cancelUrl: "https://example.test/c",
      portalReturnUrl: "https://example.test/a", priceIds: {},
    });
    expect(() => provider.verifyAndParseWebhook("{}", "t=1,v1=deadbeef")).toThrow("server webhook boundary");
  });

});
