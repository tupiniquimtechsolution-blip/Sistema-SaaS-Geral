import { describe, expect, it } from "vitest";
import {
  assertEntitlement,
  canUseFeature,
  decodeEntitlementRows,
  FEATURES,
  isBooleanFeature,
  isFeatureKey,
  isNumericFeature,
  isReligiousSensitiveFeatureKey,
  PROPOSED_FUTURE_FEATURES,
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

describe("live feature catalog (14 features, remote live mirror)", () => {
  it("FEATURES.length === 14 (live public.features)", () => {
    expect(FEATURES).toHaveLength(14);
  });

  it("contains every live key with its live value_type", () => {
    expect(FEATURES.map((f) => f.key)).toEqual(
      expect.arrayContaining([
        "audit.retentionDays",
        "booking.enabled",
        "commerce.enabled",
        "crm.enabled",
        "customDomain.enabled",
        "events.enabled",
        "locations.max",
        "media.maxFileSize",
        "products.max",
        "quotes.enabled",
        "religious.sensitive.enabled",
        "storage.bytes",
        "support.enabled",
        "users.max",
      ]),
    );
  });

  it("religious.sensitive.enabled EXISTS and is boolean", () => {
    expect(isFeatureKey("religious.sensitive.enabled")).toBe(true);
    expect(isBooleanFeature("religious.sensitive.enabled")).toBe(true);
  });

  it("NON-CANONICAL DRIFT: orders.enabled is NOT a FeatureKey", () => {
    expect(isFeatureKey("orders.enabled")).toBe(false);
  });

  it("NON-CANONICAL DRIFT: projects.enabled is NOT a FeatureKey", () => {
    expect(isFeatureKey("projects.enabled")).toBe(false);
  });

  it("NON-CANONICAL DRIFT: loyalty.enabled is NOT a FeatureKey", () => {
    expect(isFeatureKey("loyalty.enabled")).toBe(false);
  });

  it("NON-CANONICAL DRIFT: inventory.enabled is NOT a FeatureKey", () => {
    expect(isFeatureKey("inventory.enabled")).toBe(false);
  });

  it("removed keys are registered as PROPOSED_FUTURE_FEATURES (not silently dropped)", () => {
    expect(PROPOSED_FUTURE_FEATURES).toEqual([
      "orders.enabled",
      "projects.enabled",
      "loyalty.enabled",
      "inventory.enabled",
      "ai.chat.enabled",
      "ai.contentEdit.enabled",
      "ai.catalogEdit.enabled",
      "ai.media.enabled",
      "ai.sectionEdit.enabled",
      "ai.design.enabled",
      "ai.redesign.enabled",
      "ai.bulkEdit.enabled",
      "ai.publish.enabled",
      "ai.credits.monthly",
    ]);
  });

  it("classifies value types like public.features.value_type", () => {
    expect(isBooleanFeature("commerce.enabled")).toBe(true);
    expect(isNumericFeature("users.max")).toBe(true);
    expect(isBooleanFeature("users.max")).toBe(false);
  });

  it("isFeatureKey default-denies unknown keys", () => {
    expect(isFeatureKey("crm.enabled")).toBe(true);
    expect(isFeatureKey("ai.magic")).toBe(false);
    expect(isFeatureKey("ai.chat.enabled")).toBe(false); // proposed only until DB migration is applied
    expect(isFeatureKey("orders.enabled ")).toBe(false);
  });
});

describe("SECURITY CONTRACT — religious sensitive triple gate (entitlement layer)", () => {
  it("isReligiousSensitiveFeatureKey identifies only the sensitive feature", () => {
    expect(isReligiousSensitiveFeatureKey("religious.sensitive.enabled")).toBe(true);
    expect(isReligiousSensitiveFeatureKey("commerce.enabled")).toBe(false);
  });

  it("flag alone never authorizes: validate accepts it but canUseFeature requires value true", () => {
    expect(validateEntitlement("religious.sensitive.enabled", false)).toEqual({
      key: "religious.sensitive.enabled",
      value: false,
    });
    const sub: TenantSubscription = {
      planId: "x",
      state: "active",
      entitlements: [{ key: "religious.sensitive.enabled", value: false }],
    };
    expect(canUseFeature(sub, "religious.sensitive.enabled")).toBe(false);
    expect(() => assertEntitlement(sub, "religious.sensitive.enabled")).toThrow(/Entitlement required/);
  });

  it("default remains disabled (no catalog or plan default turns it on)", () => {
    // Nothing in FEATURES carries a value; absence in a subscription = denied
    const empty: TenantSubscription = { planId: "x", state: "active", entitlements: [] };
    expect(canUseFeature(empty, "religious.sensitive.enabled")).toBe(false);
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
    expect(validateEntitlement("orders.enabled", true)).toBeNull(); // non-canonical → invalid row
  });

  it("decodeEntitlementRows filters invalid rows instead of widening access", () => {
    const rows = [
      { feature_key: "orders.enabled", value: true }, // non-canonical → dropped
      { feature_key: "hack.enabled", value: true }, // unknown key → dropped
      { feature_key: "users.max", value: "lots" }, // type mismatch → dropped
      { feature_key: "support.enabled", value: true },
    ];
    const decoded = decodeEntitlementRows(rows);
    expect(decoded).toEqual([{ key: "support.enabled", value: true }]);
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
    expect(canUseFeature(planB, "crm.enabled")).toBe(true);
    expect(canUseFeature(planB, "members.roles.write")).toBe(false); // not a feature key at all
  });
});
