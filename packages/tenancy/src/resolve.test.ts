import { describe, expect, it } from "vitest";
import {
  assembleEffectiveEntitlements,
  filterActiveMemberships,
  planEntitlementRowsToDefaults,
  selectTenant,
  subscriptionGrantsPlan,
  tenantEntitlementRowsToEntitlements,
  tenantFeatureRowsToOverrides,
} from "./resolve";
import { resolveDemoFallback } from "./demo-fallback";
import type { MembershipWithContext } from "tupiniquim-database";

const USER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const TENANT_A = "11111111-1111-1111-1111-111111111111";
const TENANT_B = "22222222-2222-2222-2222-222222222222";

function membership(tenantId: string, userId: string, status = "active"): MembershipWithContext {
  return {
    membership: {
      id: `m-${tenantId}-${userId}`,
      tenant_id: tenantId,
      user_id: userId,
      status,
      joined_at: null,
    },
    tenant: {
      id: tenantId,
      slug: `tenant-${tenantId.slice(0, 4)}`,
      name: `Tenant ${tenantId.slice(0, 4)}`,
      vertical_id: "bakery",
      status: "active",
      created_by: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  };
}

describe("membership filtering", () => {
  it("keeps only active memberships of the given user", () => {
    const rows = [
      membership(TENANT_A, USER_A),
      membership(TENANT_B, USER_A, "revoked"),
      membership(TENANT_B, USER_B),
      membership(TENANT_A, USER_A, "invited"),
    ];
    const active = filterActiveMemberships(rows, USER_A);
    expect(active).toHaveLength(1);
    expect(active[0].tenant.id).toBe(TENANT_A);
  });

  it("handles multiple active memberships (multi-tenant user)", () => {
    const rows = [membership(TENANT_A, USER_A), membership(TENANT_B, USER_A)];
    const active = filterActiveMemberships(rows, USER_A);
    expect(active).toHaveLength(2);
  });
});

describe("tenant selection (membership-scoped)", () => {
  it("allows a tenant the user is an active member of", () => {
    const sel = selectTenant([membership(TENANT_A, USER_A)], TENANT_A);
    expect(sel.ok).toBe(true);
    expect(sel.context?.tenant.id).toBe(TENANT_A);
  });

  it("denies an unknown tenant NOT in memberships (cross-tenant selection blocked)", () => {
    const sel = selectTenant([membership(TENANT_A, USER_A)], TENANT_B);
    expect(sel.ok).toBe(false);
    expect(sel.reason).toBe("TENANT_NOT_IN_MEMBERSHIPS");
    expect(sel.context).toBeUndefined();
  });

  it("denies when membership exists but is not active (missing membership deny)", () => {
    const sel = selectTenant([membership(TENANT_A, USER_A, "revoked")], TENANT_A);
    expect(sel.ok).toBe(false);
    expect(["TENANT_NOT_IN_MEMBERSHIPS", "MEMBERSHIP_NOT_ACTIVE"]).toContain(sel.reason);
  });

  it("denies an empty requested tenant id", () => {
    const sel = selectTenant([membership(TENANT_A, USER_A)], "");
    expect(sel.ok).toBe(false);
  });
});

describe("entitlement assembly (default deny)", () => {
  it("drops unknown feature keys and malformed values", () => {
    const planDefaults = planEntitlementRowsToDefaults([
      { plan_id: "pro", feature_key: "commerce.enabled", value: true },
      { plan_id: "pro", feature_key: "orders.enabled", value: true }, // non-canonical
      { plan_id: "pro", feature_key: "users.max", value: 3.5 }, // non-integer
    ]);
    expect(planDefaults).toHaveLength(1);
    expect(planDefaults[0].featureKey).toBe("commerce.enabled");

    const tenantEntitlements = tenantEntitlementRowsToEntitlements([
      { tenant_id: TENANT_A, feature_key: "religious.sensitive.enabled", value: true },
      { tenant_id: TENANT_A, feature_key: "not.a.feature", value: true },
    ]);
    expect(tenantEntitlements).toHaveLength(1);
  });

  it("maps tenant_features rows with canonical precedence (override wins)", () => {
    const overrides = tenantFeatureRowsToOverrides([
      { tenant_id: TENANT_A, feature_key: "commerce.enabled", enabled: false, configuration: null },
      { tenant_id: TENANT_A, feature_key: "users.max", enabled: true, configuration: { value: 25 } },
      { tenant_id: TENANT_A, feature_key: "legacy.key", enabled: true, configuration: null },
    ]);
    expect(overrides.find((o) => o.featureKey === "commerce.enabled")?.value).toBe(false);
    expect(overrides.find((o) => o.featureKey === "users.max")?.value).toBe(25);
    expect(overrides.find((o) => (o.featureKey as string) === "legacy.key")).toBeUndefined();

    const effective = assembleEffectiveEntitlements({
      planDefaults: [{ planId: "pro", featureKey: "commerce.enabled", value: true }],
      tenantEntitlements: [],
      tenantFeatures: overrides,
    });
    expect(effective.find((e) => e.key === "commerce.enabled")?.value).toBe(false);
  });

  it("treats missing entitlements as default deny (empty set denies everything)", () => {
    const effective = assembleEffectiveEntitlements({
      planDefaults: [],
      tenantEntitlements: [],
      tenantFeatures: [],
    });
    expect(effective).toHaveLength(0);
  });
});

describe("subscription gating", () => {
  it("grants plan only for active-ish statuses", () => {
    const base = {
      id: "s1",
      tenant_id: TENANT_A,
      plan_id: "pro",
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
    };
    expect(subscriptionGrantsPlan({ ...base, status: "active" })).toBe(true);
    expect(subscriptionGrantsPlan({ ...base, status: "trialing" })).toBe(true);
    expect(subscriptionGrantsPlan({ ...base, status: "canceled" })).toBe(false);
    expect(subscriptionGrantsPlan(null)).toBe(false);
  });
});

describe("demo fallback policy (platform rule)", () => {
  it("demo mode: explicit fallback on failure — never presented as live", () => {
    expect(resolveDemoFallback({ demoMode: true, outcome: "failure" }).mode).toBe("demo-fallback");
    expect(resolveDemoFallback({ demoMode: true, outcome: "tenant-not-resolved" }).mode).toBe("demo-fallback");
  });

  it("production mode (demo off): failures yield ERROR states, never demo data", () => {
    const failure = resolveDemoFallback({ demoMode: false, outcome: "failure" });
    expect(failure.mode).toBe("error");
    expect(failure.reason).toBe("failure");
    const unres = resolveDemoFallback({ demoMode: false, outcome: "tenant-not-resolved" });
    expect(unres.mode).toBe("error");
    expect(unres.reason).toBe("tenant_not_resolved");
  });

  it("ok outcome is live in both modes", () => {
    expect(resolveDemoFallback({ demoMode: true, outcome: "ok" }).mode).toBe("live");
    expect(resolveDemoFallback({ demoMode: false, outcome: "ok" }).mode).toBe("live");
  });
});
