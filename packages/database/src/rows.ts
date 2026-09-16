/**
 * Row contracts of the LIVE canonical Supabase schema (project mmykyzzkcugxunmekwew).
 *
 * Source of truth: the remote database. These interfaces mirror the columns the
 * application reads (see docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md and
 * docs/REMOTE_MIGRATION_LEDGER.md). They are READ-MODEL types only: the browser
 * never writes these tables in this wave (DATABASE MUTATIONS = NONE).
 */

/** public.tenants */
export interface TenantRow {
  id: string;
  slug: string;
  name: string;
  vertical_id: string;
  status: "demo" | "trialing" | "active" | "suspended" | "canceled" | string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** public.tenant_brands (one row per tenant) */
export interface TenantBrandRow {
  tenant_id: string;
  display_name: string;
  legal_name?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  logo_alt_url?: string | null;
  favicon_url?: string | null;
  hero_media_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  other_socials?: Record<string, unknown>;
  address?: Record<string, unknown>;
  opening_hours?: Record<string, unknown>;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
}

/** public.tenant_themes (one row per tenant) */
export interface TenantThemeRow {
  tenant_id: string;
  tokens?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  component_style?: Record<string, unknown>;
}

/** public.tenant_settings (one row per tenant) */
export interface TenantSettingsRow {
  tenant_id: string;
  locale: string;
  timezone: string;
  currency: string;
  public_settings?: Record<string, unknown>;
  private_settings?: Record<string, unknown>;
}

/** public.memberships */
export interface MembershipRow {
  id: string;
  tenant_id: string;
  user_id: string;
  status: "invited" | "active" | "suspended" | "revoked" | string;
  joined_at: string | null;
}

/** public.profiles */
export interface ProfileRow {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  locale?: string;
}

/** public.subscriptions */
export interface SubscriptionRow {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid" | "paused" | string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/** public.plans */
export interface PlanRow {
  id: string;
  name: string;
  is_public: boolean;
  is_active: boolean;
}

/** jsonb-decoded entitlement value as stored in public.* tables */
export type EntitlementJsonValue = boolean | number | string | null;

/** public.plan_entitlements — { plan_id, feature_key, value jsonb } */
export interface PlanEntitlementRow {
  plan_id: string;
  feature_key: string;
  value: EntitlementJsonValue;
}

/** public.tenant_entitlements — { tenant_id, feature_key, value jsonb } */
export interface TenantEntitlementRow {
  tenant_id: string;
  feature_key: string;
  value: EntitlementJsonValue;
}

/**
 * public.tenant_features — per-tenant final override.
 * Canonical shape: { enabled boolean, configuration jsonb } — value derived.
 */
export interface TenantFeatureRow {
  tenant_id: string;
  feature_key: string;
  enabled: boolean;
  configuration?: Record<string, unknown> | null;
}
