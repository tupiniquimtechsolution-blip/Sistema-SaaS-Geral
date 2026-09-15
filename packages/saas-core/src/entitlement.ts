/**
 * Entitlement contracts — ALIGNED with the canonical remote Supabase schema
 * (project mmykyzzkcugxunmekwew, platform_core_v1 + entitlement_security_gate_v1).
 *
 * SOURCE OF TRUTH
 * - public.features          → feature catalog (17 canonical keys)
 * - public.plans             → plan definitions
 * - public.plan_entitlements → plan defaults (jsonb value per feature)
 * - public.tenant_entitlements → per-tenant plan defaults (diff/override)
 * - public.tenant_features   → per-tenant final overrides (highest precedence)
 * - entitlement_security_gate_v1 (remote) → DB-enforced authority for privileged ops
 *
 * SEPARATION OF DOMAINS (never conflate):
 * - RBAC Permission (member.ts)  → WHAT an actor may do (human action gate)
 * - Entitlement (this file)      → WHAT the tenant's plan enables (product gate)
 *
 * AUTHORITY MODEL: the browser/UI may only READ and present entitlements.
 * saas-core types/validates/derives effective entitlements. The database
 * (RLS + RPC gate) remains the only enforcement authority for privileged ops.
 */

/** Feature value types, mirroring public.features.value_type. */
export type FeatureValueType = "boolean" | "integer";

/** One canonical feature definition (mirror of public.features). */
export interface Feature {
  key: FeatureKey;
  description: string;
  valueType: FeatureValueType;
}

/** Exact mirror of the 17 canonical feature keys. DO NOT invent keys. */
export type FeatureKey =
  | "commerce.enabled"
  | "orders.enabled"
  | "booking.enabled"
  | "crm.enabled"
  | "quotes.enabled"
  | "projects.enabled"
  | "events.enabled"
  | "loyalty.enabled"
  | "inventory.enabled"
  | "support.enabled"
  | "customDomain.enabled"
  | "locations.max"
  | "users.max"
  | "products.max"
  | "storage.bytes"
  | "media.maxFileSize"
  | "audit.retentionDays";

const FEATURE_CATALOG: readonly Feature[] = [
  { key: "commerce.enabled", description: "Commerce module availability", valueType: "boolean" },
  { key: "orders.enabled", description: "Orders module availability", valueType: "boolean" },
  { key: "booking.enabled", description: "Booking module availability", valueType: "boolean" },
  { key: "crm.enabled", description: "CRM module availability", valueType: "boolean" },
  { key: "quotes.enabled", description: "Quotes/proposals module availability", valueType: "boolean" },
  { key: "projects.enabled", description: "Projects/installations module availability", valueType: "boolean" },
  { key: "events.enabled", description: "Events module availability", valueType: "boolean" },
  { key: "loyalty.enabled", description: "Loyalty module availability", valueType: "boolean" },
  { key: "inventory.enabled", description: "Inventory module availability", valueType: "boolean" },
  { key: "support.enabled", description: "Support/warranty module availability", valueType: "boolean" },
  { key: "customDomain.enabled", description: "Custom domain support", valueType: "boolean" },
  { key: "locations.max", description: "Maximum number of business locations", valueType: "integer" },
  { key: "users.max", description: "Maximum tenant members", valueType: "integer" },
  { key: "products.max", description: "Maximum catalog products/equipment entries", valueType: "integer" },
  { key: "storage.bytes", description: "Tenant storage quota in bytes", valueType: "integer" },
  { key: "media.maxFileSize", description: "Maximum upload size in bytes", valueType: "integer" },
  { key: "audit.retentionDays", description: "Audit retention target in days", valueType: "integer" },
];

/** Canonical catalog, exposed read-only for validation/UI presentation. */
export const FEATURES: readonly Feature[] = FEATURE_CATALOG;

const FEATURE_KEYS = new Set<string>(FEATURE_CATALOG.map((f) => f.key));

const BOOLEAN_FEATURES = new Set<string>(
  FEATURE_CATALOG.filter((f) => f.valueType === "boolean").map((f) => f.key),
);

const NUMERIC_FEATURES = new Set<string>(
  FEATURE_CATALOG.filter((f) => f.valueType === "integer").map((f) => f.key),
);

export function isFeatureKey(key: string): key is FeatureKey {
  return FEATURE_KEYS.has(key);
}

export function isBooleanFeature(key: string): boolean {
  return BOOLEAN_FEATURES.has(key);
}

export function isNumericFeature(key: string): boolean {
  return NUMERIC_FEATURES.has(key);
}

/**
 * A single entitlement row (mirror of plan_entitlements / tenant_entitlements /
 * tenant_features rows): feature key + jsonb-decoded value.
 */
export type EntitlementValue = boolean | number;

export interface Entitlement {
  key: FeatureKey;
  value: EntitlementValue;
}

/** A plan definition (mirror of public.plans + its plan_entitlements rows). */
export interface Plan {
  id: string;
  name: string;
  entitlements: Entitlement[];
}

/** A plan default row (mirror of public.plan_entitlements). */
export interface PlanEntitlement {
  planId: string;
  featureKey: FeatureKey;
  value: EntitlementValue;
}

/**
 * A per-tenant plan-default row (mirror of public.tenant_entitlements):
 * overrides the plan default for that feature when the row exists.
 */
export interface TenantEntitlement {
  tenantId: string;
  featureKey: FeatureKey;
  value: EntitlementValue;
}

/**
 * A per-tenant final override row (mirror of public.tenant_features).
 * Highest precedence — wins over tenant_entitlements AND plan defaults.
 */
export interface TenantFeatureOverride {
  tenantId: string;
  featureKey: FeatureKey;
  value: EntitlementValue;
}

/**
 * The effective entitlement set of a tenant after applying precedence:
 * plan default < tenant_entitlements < tenant_features.
 */
export type EffectiveEntitlement = Entitlement;

export type SubscriptionState = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface TenantSubscription {
  planId: string;
  state: SubscriptionState;
  entitlements: EffectiveEntitlement[];
}

/**
 * Validation: a value must match the feature's declared value_type.
 * Unknown keys are rejected (default deny) — catalog drift is surfaced, not masked.
 */
export function validateEntitlement(key: string, value: unknown): Entitlement | null {
  if (!isFeatureKey(key)) return null;
  if (isBooleanFeature(key)) return typeof value === "boolean" ? { key, value } : null;
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)
    ? { key, value: value as number }
    : null;
}

/** Validating decoder for jsonb entitlement rows coming from the database. */
export function decodeEntitlementRows(
  rows: ReadonlyArray<{ feature_key: string; value: unknown }>,
): Entitlement[] {
  const out: Entitlement[] = [];
  for (const row of rows) {
    const decoded = validateEntitlement(row.feature_key, row.value);
    if (decoded) out.push(decoded);
  }
  return out;
}

/**
 * Effective entitlement resolution — precedence:
 *   plan default  <  tenant_entitlements  <  tenant_features
 *
 * Mirrors how the remote schema layers tenant-owned diff tables on top of the
 * plan defaults. Invalid/unknown rows are ignored (they cannot widen access
 * beyond valid catalog entries — default deny).
 */
export function resolveEffectiveEntitlements(
  planDefaults: readonly PlanEntitlement[],
  tenantEntitlements: readonly TenantEntitlement[],
  tenantFeatures: readonly TenantFeatureOverride[],
): EffectiveEntitlement[] {
  const byKey = new Map<FeatureKey, EntitlementValue>();
  for (const p of planDefaults) {
    if (p.planId && validateEntitlement(p.featureKey, p.value)) byKey.set(p.featureKey, p.value);
  }
  for (const t of tenantEntitlements) {
    if (validateEntitlement(t.featureKey, t.value)) byKey.set(t.featureKey, t.value);
  }
  for (const f of tenantFeatures) {
    if (validateEntitlement(f.featureKey, f.value)) byKey.set(f.featureKey, f.value);
  }
  return [...byKey.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function canUseFeature(sub: TenantSubscription, key: string): boolean {
  const e = sub.entitlements.find((x) => x.key === key);
  if (!e) {
    return false;
  }
  if (isNumericFeature(key)) {
    return typeof e.value === "number" && Number.isInteger(e.value) && e.value > 0;
  }
  return e.value === true;
}

export function assertEntitlement(sub: TenantSubscription, key: string): void {
  if (!canUseFeature(sub, key)) {
    throw new Error(`Entitlement required: ${key}`);
  }
}
