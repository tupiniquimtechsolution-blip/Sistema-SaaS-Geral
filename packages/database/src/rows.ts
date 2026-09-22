/**
 * Row contracts of the LIVE canonical Supabase schema (project mmykyzzkcugxunmekwew).
 *
 * Source of truth: the remote database. These interfaces mirror the columns the
 * application reads and explicitly supported Builder/CMS writes under RLS.
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

/** public.pages */
export interface PageRow {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived" | string;
  seo: Record<string, unknown>;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** public.page_sections */
export interface PageSectionRow {
  id: string;
  page_id: string;
  tenant_id: string;
  section_type: string;
  position: number;
  is_enabled: boolean;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type PageRevisionStatus = "draft" | "in_review" | "approved" | "published" | "rolled_back";

export interface PageRevisionSnapshotSection {
  section_type: string;
  position: number;
  is_enabled: boolean;
  content: Record<string, unknown>;
}

export interface PageRevisionSnapshot {
  page: {
    slug: string;
    title: string;
    seo: Record<string, unknown>;
  };
  sections: PageRevisionSnapshotSection[];
}

/** public.page_revisions */
export interface PageRevisionRow {
  id: string;
  tenant_id: string;
  page_id: string;
  revision: number;
  status: PageRevisionStatus;
  snapshot: PageRevisionSnapshot;
  source_revision_id: string | null;
  created_by: string;
  updated_by: string;
  submitted_by: string | null;
  approved_by: string | null;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
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

/** public.tenant_features — per-tenant final override. */
export interface TenantFeatureRow {
  tenant_id: string;
  feature_key: string;
  enabled: boolean;
  configuration?: Record<string, unknown> | null;
}
