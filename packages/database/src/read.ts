import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MembershipRow,
  PlanEntitlementRow,
  PlanRow,
  ProfileRow,
  SubscriptionRow,
  TenantBrandRow,
  TenantFeatureRow,
  TenantRow,
  TenantSettingsRow,
  TenantThemeRow,
  TenantEntitlementRow,
} from "./rows";

/**
 * Tenant-scoped READ helpers over the canonical remote schema.
 *
 * Contract:
 * - RLS is the enforcement authority. These helpers only shape reads; a row
 *   the policy excludes simply does not come back (invisible = denied).
 * - Browser selection of a tenant is UX; authorization stays server-side.
 * - READ-ONLY wave: no insert/update/delete/upsert here.
 */

export interface MembershipWithContext {
  membership: MembershipRow;
  tenant: TenantRow;
}

/** Every active membership of the signed-in user with its tenant row (RLS-filtered). */
export async function fetchMemberships(
  client: SupabaseClient,
  userId: string,
): Promise<MembershipWithContext[]> {
  const { data, error } = await client
    .from("memberships")
    .select(
      "id, tenant_id, user_id, status, joined_at, tenant:tenants!inner(id, slug, name, vertical_id, status, created_by, created_at, updated_at)",
    )
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new Error(`memberships read failed: ${error.message}`);
  const rows = (data ?? []) as unknown as Array<MembershipRow & { tenant: TenantRow }>;
  return rows
    .filter((r) => r.tenant != null)
    .map((r) => ({ membership: r, tenant: r.tenant }));
}

export async function fetchTenantBrand(
  client: SupabaseClient,
  tenantId: string,
): Promise<TenantBrandRow | null> {
  const { data, error } = await client
    .from("tenant_brands")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw new Error(`tenant_brands read failed: ${error.message}`);
  return (data as TenantBrandRow | null) ?? null;
}

export async function fetchTenantTheme(
  client: SupabaseClient,
  tenantId: string,
): Promise<TenantThemeRow | null> {
  const { data, error } = await client
    .from("tenant_themes")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw new Error(`tenant_themes read failed: ${error.message}`);
  return (data as TenantThemeRow | null) ?? null;
}

export async function fetchTenantSettings(
  client: SupabaseClient,
  tenantId: string,
): Promise<TenantSettingsRow | null> {
  const { data, error } = await client
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw new Error(`tenant_settings read failed: ${error.message}`);
  return (data as TenantSettingsRow | null) ?? null;
}

export async function fetchProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(`profiles read failed: ${error.message}`);
  return (data as ProfileRow | null) ?? null;
}

export async function fetchActiveSubscription(
  client: SupabaseClient,
  tenantId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await client
    .from("subscriptions")
    .select("id, tenant_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end")
    .eq("tenant_id", tenantId)
    .in("status", ["trialing", "active", "past_due", "unpaid", "paused"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`subscriptions read failed: ${error.message}`);
  return (data as SubscriptionRow | null) ?? null;
}

export async function fetchPlan(
  client: SupabaseClient,
  planId: string,
): Promise<PlanRow | null> {
  const { data, error } = await client
    .from("plans")
    .select("id, name, is_public, is_active")
    .eq("id", planId)
    .maybeSingle();
  if (error) throw new Error(`plans read failed: ${error.message}`);
  return (data as PlanRow | null) ?? null;
}

export async function fetchPlanEntitlements(
  client: SupabaseClient,
  planId: string,
): Promise<PlanEntitlementRow[]> {
  const { data, error } = await client
    .from("plan_entitlements")
    .select("plan_id, feature_key, value")
    .eq("plan_id", planId);
  if (error) throw new Error(`plan_entitlements read failed: ${error.message}`);
  return (data ?? []) as PlanEntitlementRow[];
}

export async function fetchTenantEntitlements(
  client: SupabaseClient,
  tenantId: string,
): Promise<TenantEntitlementRow[]> {
  const { data, error } = await client
    .from("tenant_entitlements")
    .select("tenant_id, feature_key, value")
    .eq("tenant_id", tenantId);
  if (error) throw new Error(`tenant_entitlements read failed: ${error.message}`);
  return (data ?? []) as TenantEntitlementRow[];
}

export async function fetchTenantFeatures(
  client: SupabaseClient,
  tenantId: string,
): Promise<TenantFeatureRow[]> {
  const { data, error } = await client
    .from("tenant_features")
    .select("tenant_id, feature_key, enabled, configuration")
    .eq("tenant_id", tenantId);
  if (error) throw new Error(`tenant_features read failed: ${error.message}`);
  return (data ?? []) as TenantFeatureRow[];
}
