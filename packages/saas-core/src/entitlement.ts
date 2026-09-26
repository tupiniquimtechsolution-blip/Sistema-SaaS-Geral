/**
 * Entitlement contracts — ALIGNED with the LIVE remote Supabase state
 * (project mmykyzzkcugxunmekwew; public.features re-verified after AI entitlement migration 2026-09-26).
 *
 * LIVE = 24 features (14 platform/vertical + 10 AI Tenant Studio capabilities). The earlier 17-key catalog reflected the historical
 * branch snapshot; live database state prevails (ratified rule).
 *
 * SOURCE OF TRUTH
 * - public.features          → feature catalog (24 canonical keys)
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

/**
 * Exact mirror of the 24 LIVE canonical feature keys. DO NOT invent keys.
 *
 * DRIFT NOTE: orders.enabled / projects.enabled / loyalty.enabled /
 * inventory.enabled were previously mirrored from the historical branch
 * snapshot but DO NOT exist in the live public.features — they are NOT
 * canonical (see PROPOSED_FUTURE_FEATURES below). Removing them from this
 * union is the ratified decision of this wave.
 */
export type FeatureKey =
  | "booking.enabled"
  | "commerce.enabled"
  | "crm.enabled"
  | "customDomain.enabled"
  | "events.enabled"
  | "locations.max"
  | "media.maxFileSize"
  | "products.max"
  | "quotes.enabled"
  | "religious.sensitive.enabled"
  | "storage.bytes"
  | "support.enabled"
  | "audit.retentionDays"
  | "users.max"
  | "ai.chat.enabled"
  | "ai.contentEdit.enabled"
  | "ai.catalogEdit.enabled"
  | "ai.media.enabled"
  | "ai.sectionEdit.enabled"
  | "ai.design.enabled"
  | "ai.redesign.enabled"
  | "ai.bulkEdit.enabled"
  | "ai.publish.enabled"
  | "ai.credits.monthly";

const FEATURE_CATALOG: readonly Feature[] = [
  { key: "audit.retentionDays", description: "Audit retention target in days", valueType: "integer" },
  { key: "booking.enabled", description: "Booking module availability", valueType: "boolean" },
  { key: "commerce.enabled", description: "Commerce module availability", valueType: "boolean" },
  { key: "crm.enabled", description: "CRM module availability", valueType: "boolean" },
  { key: "customDomain.enabled", description: "Custom domain support", valueType: "boolean" },
  { key: "events.enabled", description: "Events module availability", valueType: "boolean" },
  { key: "locations.max", description: "Maximum number of business locations", valueType: "integer" },
  { key: "media.maxFileSize", description: "Maximum upload size in bytes", valueType: "integer" },
  { key: "products.max", description: "Maximum catalog products/equipment entries", valueType: "integer" },
  { key: "quotes.enabled", description: "Quotes/proposals module availability", valueType: "boolean" },
  { key: "religious.sensitive.enabled", description: "Sensitive religious operations module availability", valueType: "boolean" },
  { key: "storage.bytes", description: "Tenant storage quota in bytes", valueType: "integer" },
  { key: "support.enabled", description: "Support/warranty module availability", valueType: "boolean" },
  { key: "users.max", description: "Maximum tenant members", valueType: "integer" },
  { key: "ai.chat.enabled", description: "AI Tenant Studio conversational editing", valueType: "boolean" },
  { key: "ai.contentEdit.enabled", description: "AI-assisted tenant content/contact editing", valueType: "boolean" },
  { key: "ai.catalogEdit.enabled", description: "AI-assisted catalog/service editing", valueType: "boolean" },
  { key: "ai.media.enabled", description: "AI-assisted media operations", valueType: "boolean" },
  { key: "ai.sectionEdit.enabled", description: "AI-assisted registered section editing", valueType: "boolean" },
  { key: "ai.design.enabled", description: "AI-assisted design token and component variant editing", valueType: "boolean" },
  { key: "ai.redesign.enabled", description: "AI-assisted page redesign proposals", valueType: "boolean" },
  { key: "ai.bulkEdit.enabled", description: "AI-assisted bulk tenant edits", valueType: "boolean" },
  { key: "ai.publish.enabled", description: "AI-assisted approved revision publication", valueType: "boolean" },
  { key: "ai.credits.monthly", description: "Monthly AI operation credit allowance", valueType: "integer" },
];

/**
 * Features proposed for the future but NOT canonical in the live
 * public.features (re-verified 2026-09-26). Never treat these as granted; they are
 * registered for the feature-request pipeline only. Keep out of FeatureKey.
 */
export const PROPOSED_FUTURE_FEATURES: readonly string[] = [
  "orders.enabled",
  "projects.enabled",
  "loyalty.enabled",
  "inventory.enabled",
] as const;

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

/**
 * RELIGIOUS SENSITIVE — TRIPLE GATE (contract reminder + runtime helper).
 * A sensitive religious operation is allowed ONLY when ALL of the following hold:
 *   1. ENTITLEMENT: religious.sensitive.enabled === true for the tenant, AND
 *   2. RBAC: the actor holds religious.sensitive.read or religious.sensitive.write
 *      (matching the operation) — only owner holds these by default, AND
 *   3. TENANT/RLS: the actor's membership resolves in the correct tenant and
 *      the database RLS/gate re-validates server-side.
 * The feature flag alone NEVER authorizes anything. Default remains false.
 */
export function isReligiousSensitiveFeatureKey(key: string): boolean {
  return key === "religious.sensitive.enabled";
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
