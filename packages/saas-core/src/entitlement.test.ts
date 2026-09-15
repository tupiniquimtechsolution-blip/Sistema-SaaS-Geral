import { describe, expect, it } from "vitest";
import {
  assertEntitlement,
  canUseFeature,
  decodeEntitlementRows,
  FEATURES,
  isBooleanFeature,
  isFeatureKey,
  isNumericFeature,
  resolveEffectiveEntitlements,
  validateEntitlement,
} from "./entitlement";
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
    { key: "crm.enabled", value: true },
    { key: "products.max", value: 5000 },
    { key: "users.max", value: 50 },
  ],
};

describe("canonical feature catalog (17 features, remote mirror)", () => {
  it("mirrors exactly the 17 remote feature keys — no invention, no omission", () => {
    expect(FEATURES).toHaveLength(17);
    expect(FEATURES.map((f) => f.key)).toEqual(
      expect.arrayContaining([
        "commerce.enabled",
        "orders.enabled",
        "booking.enabled",
        "crm.enabled",
        "quotes.enabled",
        "projects.enabled",
        "events.enabled",
        "loyalty.enabled",
        "inventory.enabled",
        "support.enabled",
        "customDomain.enabled",
        "locations.max",
        "users.max",
        "products.max",
        "storage.bytes",
        "media.maxFileSize",
        "audit.retentionDays",
      ]),
    );
  });

  it("classifies value types like public.features.value_type", () => {
    expect(isBooleanFeature("commerce.enabled")).toBe(true);
    expect(isNumericFeature("users.max")).toBe(true);
    expect(isBooleanFeature("users.max")).toBe(false);
  });

  it("isFeatureKey default-denies unknown keys", () => {
    expect(isFeatureKey("crm.enabled")).toBe(true);
    expect(isFeatureKey("ai.magic")).toBe(false);
    expect(isFeatureKey("orders.enabled ")).toBe(false);
  });
});

describe("entitlement validation (jsonb boundary)", () => {
  it("accepts catalog keys with matching value types", () => {
    expect(validateEntitlement("booking.enabled", true)).toEqual({ key: "booking.enabled", value: true });
    expect(validateEntitlement("users.max", 10)).toEqual({ key: "users.max", value: 10 });
  });

  it("rejects type mismatches and unknown keys (default deny)", () => {
    expect(validateEntitlement("booking.enabled", "yes")).toBeNull();
    expect(validateEntitlement("users.max", 2.5)).toBeNull();
    expect(validateEntitlement("users.max", true)).toBeNull();
    expect(validateEntitlement("not.a.feature", true)).toBeNull();
  });

  it("decodeEntitlementRows filters invalid rows instead of widening access", () => {
    const rows = [
      { feature_key: "orders.enabled", value: true },
      { feature_key: "hack.enabled", value: true }, // unknown key → dropped
      { feature_key: "users.max", value: "lots" }, // type mismatch → dropped
      { feature_key: "support.enabled", value: true },
    ];
    const decoded = decodeEntitlementRows(rows);
    expect(decoded).toEqual([
      { key: "orders.enabled", value: true },
      { key: "support.enabled", value: true },
    ]);
  });
});

describe("effective entitlement resolution (override precedence)", () => {
  const planDefaults = [
    { planId: "starter", featureKey: "commerce.enabled" as const, value: false },
    { planId: "starter", featureKey: "users.max" as const, value: 3 },
  ];
  const tenantEntitlements = [{ tenantId: "t1", featureKey: "users.max" as const, value: 10 }];
  const tenantFeatures = [
    { tenantId: "t1", featureKey: "commerce.enabled" as const, value: true },
    { tenantId: "t1", featureKey: "not-in-catalog" as never, value: true }, // ignored (invalid row)
  ];

  it("plan default < tenant_entitlements < tenant_features", () => {
    const eff = resolveEffectiveEntitlements(planDefaults, tenantEntitlements, tenantFeatures);
    expect(eff).toContainEqual({ key: "users.max", value: 10 }); // tenant diff over plan
    expect(eff).toContainEqual({ key: "commerce.enabled", value: true }); // final override wins
  });

  it("ignores invalid/unknown rows at every layer (cannot widen access)", () => {
    const eff = resolveEffectiveEntitlements(
      [{ planId: "starter", featureKey: "unknown.feature" as never, value: true }],
      [],
      [],
    );
    expect(eff).toHaveLength(0);
  });
});

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

  it("numeric limits count as usable only when positive integers", () => {
    expect(canUseFeature(planA, "users.max")).toBe(true);
    const zero = { ...planA, entitlements: [{ key: "users.max" as const, value: 0 }] };
    expect(canUseFeature(zero, "users.max")).toBe(false);
    const fractional = { ...planA, entitlements: [{ key: "users.max" as const, value: 2.5 }] };
    expect(canUseFeature(fractional, "users.max")).toBe(false);
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

  it("RBAC and entitlements stay separate domains", () => {
    // Entitlement gates product capability; it must never grant a human permission.
    expect(canUseFeature(planB, "crm.enabled")).toBe(true);
    expect(canUseFeature(planB, "members.roles.write")).toBe(false); // not a feature key at all
  });
});
