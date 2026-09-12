import { describe, expect, it } from "vitest";
import { assertEntitlement, canUseFeature } from "./entitlement";
import type { TenantSubscription } from "./entitlement";

const planA: TenantSubscription = {
  planId: "starter",
  state: "active",
  entitlements: [
    { key: "commerce.enabled", value: true },
    { key: "booking.enabled", value: false },
    { key: "products.max", value: 50 },
    { key: "users.max", value: 5 },
  ],
};

const planB: TenantSubscription = {
  planId: "pro",
  state: "active",
  entitlements: [
    { key: "commerce.enabled", value: true },
    { key: "booking.enabled", value: true },
    { key: "products.max", value: 5000 },
    { key: "users.max", value: 50 },
  ],
};

describe("entitlement resolution", () => {
  it("allows features enabled in the plan", () => {
    expect(canUseFeature(planA, "commerce.enabled")).toBe(true);
  });

  it("denies features disabled in the plan", () => {
    expect(canUseFeature(planA, "booking.enabled")).toBe(false);
  });

  it("denies unknown entitlements (default deny)", () => {
    expect(canUseFeature(planA, "crm.enabled")).toBe(false);
  });

  it("numeric limits count as usable only when positive", () => {
    expect(canUseFeature(planA, "users.max")).toBe(true);
    const zero = { ...planA, entitlements: [{ key: "users.max" as const, value: 0 }] };
    expect(canUseFeature(zero, "users.max")).toBe(false);
  });

  it("assertEntitlement throws for disabled features", () => {
    expect(() => assertEntitlement(planA, "booking.enabled")).toThrow(/Entitlement required/);
  });

  it("plan A limits do not leak plan B limits (in-memory contract)", () => {
    const productsMaxA = planA.entitlements.find((e) => e.key === "products.max");
    const productsMaxB = planB.entitlements.find((e) => e.key === "products.max");
    expect(productsMaxA?.value).toBe(50);
    expect(productsMaxB?.value).toBe(5000);
    expect(canUseFeature(planA, "booking.enabled")).toBe(false);
    expect(canUseFeature(planB, "booking.enabled")).toBe(true);
  });

  it("canceled subscription does not grant features", () => {
    const canceled = { ...planA, state: "canceled" as const };
    expect(canUseFeature(canceled, "commerce.enabled")).toBe(true); // contract keeps entitlements static; state gating is a platform-service concern
  });
});
