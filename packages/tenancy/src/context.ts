import type { SupabaseClient, Session } from "@supabase/supabase-js";
import {
  fetchActiveSubscription,
  fetchMemberships,
  fetchPlanEntitlements,
  fetchTenantBrand,
  fetchTenantEntitlements,
  fetchTenantFeatures,
  fetchTenantSettings,
  fetchTenantTheme,
  type MembershipWithContext,
  type PlanEntitlementRow,
  type SubscriptionRow,
  type TenantBrandRow,
  type TenantEntitlementRow,
  type TenantFeatureRow,
  type TenantRow,
  type TenantSettingsRow,
  type TenantThemeRow,
} from "tupiniquim-database";
import { projectSession } from "tupiniquim-auth";
import {
  assembleEffectiveEntitlements,
  filterActiveMemberships,
  planEntitlementRowsToDefaults,
  selectTenant,
  subscriptionGrantsPlan,
  tenantEntitlementRowsToEntitlements,
  tenantFeatureRowsToOverrides,
  type TenantSelection,
} from "./resolve";

/**
 * LIVE TENANT CONTEXT orchestration (read-only).
 *
 * Authenticated User → Memberships (RLS) → Tenant → Brand/Theme/Settings →
 * Subscription/Plan → Effective Entitlements.
 *
 * The database is the enforcement authority: if RLS hides a row, the context
 * simply will not include it. Unknown effective-entitlement results are
 * treated as DENY/default-off by consumers (see canUse in this package and
 * the bakery adapter).
 */

export interface TenantContext {
  selection: TenantSelection;
  tenant: TenantRow | null;
  brand: TenantBrandRow | null;
  theme: TenantThemeRow | null;
  settings: TenantSettingsRow | null;
  subscription: SubscriptionRow | null;
  effectiveEntitlements: import("tupiniquim-saas-core").EffectiveEntitlement[];
}

export interface ResolveTenantContextInput {
  session: Session;
  /** UX-selected tenant id; validated against the user's own active memberships. */
  requestedTenantId?: string;
  /** Explicit read bag — pass "all" (default) or a subset to limit round-trips. */
  reads?: ReadonlyArray<"brand" | "theme" | "settings" | "entitlements">;
}

export interface TenantContextResult {
  memberships: MembershipWithContext[];
  context: TenantContext;
}

export async function resolveTenantContext(
  client: SupabaseClient,
  input: ResolveTenantContextInput,
): Promise<TenantContextResult> {
  const user = projectSession(input.session);
  if (!user) throw new Error("tenant resolution requires an authenticated session");

  const memberships = filterActiveMemberships(
    await fetchMemberships(client, user.id),
    user.id,
  );

  const requested = input.requestedTenantId ?? memberships[0]?.tenant.id ?? "";
  const selection = selectTenant(memberships, requested);

  const context: TenantContext = {
    selection,
    tenant: selection.ok ? (selection.context?.tenant ?? null) : null,
    brand: null,
    theme: null,
    settings: null,
    subscription: null,
    effectiveEntitlements: [],
  };

  if (!selection.ok || !context.tenant) {
    return { memberships, context }; // deny: no tenant-owned data is read
  }

  const tenantId = context.tenant.id;
  const reads = input.reads ?? ["brand", "theme", "settings", "entitlements"];

  const wants = (k: "brand" | "theme" | "settings" | "entitlements") => reads.includes(k);

  const brandTask = wants("brand") ? fetchTenantBrand(client, tenantId) : Promise.resolve(null);
  const themeTask = wants("theme") ? fetchTenantTheme(client, tenantId) : Promise.resolve(null);
  const settingsTask = wants("settings")
    ? fetchTenantSettings(client, tenantId)
    : Promise.resolve(null);

  let subscription: SubscriptionRow | null = null;
  let planDefaults: ReturnType<typeof planEntitlementRowsToDefaults> = [];
  if (wants("entitlements")) {
    subscription = await fetchActiveSubscription(client, tenantId);
    if (subscription && subscriptionGrantsPlan(subscription)) {
      const planRows: PlanEntitlementRow[] = await fetchPlanEntitlements(
        client,
        subscription.plan_id,
      );
      planDefaults = planEntitlementRowsToDefaults(planRows);
    }
    const [tenantEntRows, tenantFeatRows] = await Promise.all([
      fetchTenantEntitlements(client, tenantId) as Promise<TenantEntitlementRow[]>,
      fetchTenantFeatures(client, tenantId) as Promise<TenantFeatureRow[]>,
    ]);
    context.effectiveEntitlements = assembleEffectiveEntitlements({
      planDefaults,
      tenantEntitlements: tenantEntitlementRowsToEntitlements(tenantEntRows),
      tenantFeatures: tenantFeatureRowsToOverrides(tenantFeatRows),
    });
  }

  const [brand, theme, settings] = await Promise.all([brandTask, themeTask, settingsTask]);
  context.brand = brand;
  context.theme = theme;
  context.settings = settings;
  context.subscription = subscription;

  return { memberships, context };
}

/** Fail-closed entitlement check for presentation layer. */
export function canUseEntitlement(
  context: TenantContext,
  key: string,
  predicate?: (value: boolean | number) => boolean,
): boolean {
  const e = context.effectiveEntitlements.find((x) => x.key === key);
  if (!e) return false;
  const v = e.value;
  if (predicate) return typeof v === "boolean" || typeof v === "number" ? predicate(v) : false;
  return v === true;
}
