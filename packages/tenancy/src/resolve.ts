import {
  resolveEffectiveEntitlements,
  validateEntitlement,
  type EffectiveEntitlement,
  type PlanEntitlement,
  type TenantEntitlement,
  type TenantFeatureOverride,
} from "tupiniquim-saas-core";
import type {
  MembershipRow,
  MembershipWithContext,
  PlanEntitlementRow,
  SubscriptionRow,
  TenantEntitlementRow,
  TenantFeatureRow,
  TenantRow,
} from "tupiniquim-database";

/**
 * TENANT CONTEXT RESOLUTION — pure logic.
 *
 * SECURITY MODEL (non-negotiable):
 * - The browser-selected tenantId is UX only. Authorization is RLS.
 * - A tenantId is selectable ONLY when it appears in the active memberships
 *   fetched for the signed-in user. Any other id → DISALLOWED (deny).
 * - Missing membership, revoked/suspended membership or unknown tenant → deny.
 * - Unknown/invalid entitlement rows are dropped (default deny): a malformed
 *   row can never widen access beyond the canonical 14-feature catalog.
 */

export interface TenantSelection {
  ok: boolean;
  /** Present when ok === true. */
  context?: { membership: MembershipRow; tenant: TenantRow };
  reason?: "MISSING_MEMBERSHIP" | "TENANT_NOT_IN_MEMBERSHIPS" | "MEMBERSHIP_NOT_ACTIVE";
}

/** Keeps only memberships whose status is exactly "active" for the given user. */
export function filterActiveMemberships(
  rows: ReadonlyArray<MembershipWithContext>,
  userId: string,
): MembershipWithContext[] {
  return rows.filter((r) => r.membership.user_id === userId && r.membership.status === "active");
}

/** Selects a tenant strictly from the user's own active memberships. */
export function selectTenant(
  activeMemberships: ReadonlyArray<MembershipWithContext>,
  requestedTenantId: string,
): TenantSelection {
  if (!requestedTenantId) {
    return { ok: false, reason: "TENANT_NOT_IN_MEMBERSHIPS" };
  }
  const found = activeMemberships.find((m) => m.tenant.id === requestedTenantId);
  if (!found) {
    return { ok: false, reason: "TENANT_NOT_IN_MEMBERSHIPS" };
  }
  if (found.membership.status !== "active") {
    return { ok: false, reason: "MEMBERSHIP_NOT_ACTIVE" };
  }
  return { ok: true, context: { membership: found.membership, tenant: found.tenant } };
}

/** Decodes plan_entitlements rows into validated plan defaults (invalid rows dropped). */
export function planEntitlementRowsToDefaults(rows: ReadonlyArray<PlanEntitlementRow>): PlanEntitlement[] {
  const out: PlanEntitlement[] = [];
  for (const r of rows) {
    const e = validateEntitlement(r.feature_key, r.value);
    if (e) out.push({ planId: r.plan_id, featureKey: e.key, value: e.value });
  }
  return out;
}

/** Decodes tenant_entitlements rows into validated tenant entitlements. */
export function tenantEntitlementRowsToEntitlements(
  rows: ReadonlyArray<TenantEntitlementRow>,
): TenantEntitlement[] {
  const out: TenantEntitlement[] = [];
  for (const r of rows) {
    const e = validateEntitlement(r.feature_key, r.value);
    if (e) out.push({ tenantId: r.tenant_id, featureKey: e.key, value: e.value });
  }
  return out;
}

/**
 * Decodes tenant_features rows (canonical shape: enabled + configuration) into
 * validated override rows. A disabled row maps to value=false for boolean
 * features; for numeric features a disabled row does NOT set a value (it is
 * simply dropped — absence means the lower-precedence default stands, while
 * the row being absent entirely also means default; enabled=false on a
 * boolean feature is an explicit OFF override).
 */
export function tenantFeatureRowsToOverrides(rows: ReadonlyArray<TenantFeatureRow>): TenantFeatureOverride[] {
  const out: TenantFeatureOverride[] = [];
  for (const r of rows) {
    const value = r.enabled === true ? extractConfiguredValue(r.configuration) : false;
    const e = validateEntitlement(r.feature_key, value);
    if (e) out.push({ tenantId: r.tenant_id, featureKey: e.key, value: e.value });
  }
  return out;
}

function extractConfiguredValue(configuration: Record<string, unknown> | null | undefined): unknown {
  if (configuration == null) return true;
  const v = (configuration as Record<string, unknown>)["value"];
  return v === undefined ? true : v;
}

/** Canonical precedence assembly: plan defaults < tenant_entitlements < tenant_features. */
export function assembleEffectiveEntitlements(input: {
  planDefaults: ReadonlyArray<PlanEntitlement>;
  tenantEntitlements: ReadonlyArray<TenantEntitlement>;
  tenantFeatures: ReadonlyArray<TenantFeatureOverride>;
}): EffectiveEntitlement[] {
  return resolveEffectiveEntitlements(input.planDefaults, input.tenantEntitlements, input.tenantFeatures);
}

/** True when a subscription row grants an active-ish plan (drives plan defaults). */
export function subscriptionGrantsPlan(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  return ["trialing", "active", "past_due", "unpaid", "paused"].includes(sub.status);
}
