import {
  bucketForVisibility,
  canUseFeature,
  isUploadAllowed,
  resolveEffectiveEntitlements,
  tenantMediaPath,
  validateEntitlement,
  type EffectiveEntitlement,
  type Entitlement,
  type MediaVisibility,
  type PlanEntitlement,
  type TenantEntitlement,
  type TenantFeatureOverride,
} from "tupiniquim-saas-core";
import type { Tenant, TenantSettings } from "tupiniquim-saas-core";

export interface BakeryConfig {
  tenant: Tenant;
  settings: TenantSettings;
}

const DEMO_TENANT: Tenant = {
  id: "demo-fornalha",
  slug: "fornalha",
  vertical: "bakery",
  status: "demo",
  brand: {
    name: "Fornalha Premium",
    tagline: "Pão, bolos e doces frescos todos os dias",
    logo: "/logo.svg",
    logoAlt: "Fornalha Premium",
    favicon: "/favicon.svg",
  },
  theme: {
    headingFont: "var(--font-heading)",
    bodyFont: "var(--font-body)",
  },
  palette: {
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    accent: "var(--accent)",
    background: "var(--bg)",
    surface: "var(--surface)",
    foreground: "var(--fg)",
    paper: "var(--paper)",
    line: "var(--line)",
    espresso: "var(--espresso)",
    caramel: "var(--caramel)",
    dim: "var(--dim)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  },
  settings: {
    whatsapp: "5511999999999",
    delivery: true,
    pickup: true,
    address: "Rua Exemplo, 999 - São Paulo, SP",
    schedule: "Seg-Sex 7h-18h | Sáb 8h-14h",
    social: { instagram: "@fornalha" },
    integrations: {
      whatsapp: { enabled: true, number: "5511999999999" },
      ifood: { enabled: false, url: "" },
      keeta: { enabled: false },
      food99: { enabled: false },
    },
  },
  createdAt: new Date().toISOString(),
};

export function getDemoTenant(): Tenant {
  return DEMO_TENANT;
}

export function asBakeryConfig(tenant: Tenant): BakeryConfig {
  return {
    tenant,
    settings: tenant.settings,
  };
}

export const currentTenant = DEMO_TENANT;

/* =============================================================================
 * READ CONTRACT (canonical remote Supabase → Bakery legacy shape)
 * =============================================================================
 * This adapter is READ-ONLY by design (Wave 01 alignment phase):
 * - it maps canonical remote rows (public.tenants, tenant_entitlements,
 *   tenant_features, plan_entitlements) into the legacy Bakery `Tenant` shape;
 * - it NEVER performs remote writes; writes stay DB/RLS-enforced later;
 * - the legacy demo fallback (DEMO_TENANT) is preserved untouched.
 */

/** Canonical remote tenant row subset needed for the read mapping. */
export interface RemoteTenantRow {
  id: string; // canonical UUID
  slug: string;
  status: string; // remote text status
  name?: string;
  brand?: Record<string, unknown> | null;
  theme?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
  created_at?: string;
}

/** Raw jsonb-decoded entitlement row as read from the remote tables. */
export interface RemoteEntitlementRow {
  feature_key: string;
  value: unknown;
}

export interface RemoteEntitlementSources {
  planDefaults: ReadonlyArray<{ planId: string } & RemoteEntitlementRow>;
  tenantEntitlements: ReadonlyArray<{ tenantId: string } & RemoteEntitlementRow>;
  tenantFeatures: ReadonlyArray<{ tenantId: string } & RemoteEntitlementRow>;
}

/**
 * Applies the canonical override precedence (plan < tenant_entitlements <
 * tenant_features) to remote rows, dropping invalid/unknown rows (default deny).
 */
export function resolveBakeryEntitlements(sources: RemoteEntitlementSources): EffectiveEntitlement[] {
  const planDefaults: PlanEntitlement[] = sources.planDefaults.flatMap((r) => {
    const e = validateEntitlement(r.feature_key, r.value);
    return e ? [{ planId: r.planId, featureKey: e.key, value: e.value }] : [];
  });
  const tenantEntitlements: TenantEntitlement[] = sources.tenantEntitlements.flatMap((r) => {
    const e = validateEntitlement(r.feature_key, r.value);
    return e ? [{ tenantId: r.tenantId, featureKey: e.key, value: e.value }] : [];
  });
  const tenantFeatures: TenantFeatureOverride[] = sources.tenantFeatures.flatMap((r) => {
    const e = validateEntitlement(r.feature_key, r.value);
    return e ? [{ tenantId: r.tenantId, featureKey: e.key, value: e.value }] : [];
  });
  return resolveEffectiveEntitlements(planDefaults, tenantEntitlements, tenantFeatures);
}

/** Maps a remote status string to the legacy Tenant.status union (fail-closed). */
function mapStatus(remoteStatus: string | undefined): Tenant["status"] {
  if (remoteStatus === "active") return "active";
  if (remoteStatus === "demo") return "demo";
  return "disabled"; // fail-closed: unknown/pending remote states disable the site
}

/**
 * Maps a canonical remote tenant row + effective entitlements onto the legacy
 * Bakery Tenant shape. Brand/theme/settings JSONB pass through as-is (shape is
 * owned by the tenant_brands/themes/settings read path); missing data keeps the
 * demo defaults so a half-provisioned tenant never renders an empty shell.
 */
export function mapRemoteTenantToBakery(
  row: RemoteTenantRow,
  entitlements: EffectiveEntitlement[] = [],
): Tenant {
  const base = DEMO_TENANT; // legacy visual fallback
  return {
    ...base,
    id: row.id,
    slug: row.slug,
    vertical: "bakery",
    status: mapStatus(row.status),
    brand: { ...base.brand, ...(row.brand as Tenant["brand"] | undefined) },
    theme: { ...base.theme, ...(row.theme as Tenant["theme"] | undefined) },
    settings: { ...base.settings, ...(row.settings as TenantSettings | undefined) },
    createdAt: row.created_at ?? base.createdAt,
    // entitlements are consumed via canReadFeature(); not stored on the legacy shape
    ...({ effectiveEntitlements: entitlements } as object),
  };
}

/** Entitlement read helper (presentation only — authorization stays server-side). */
export function canReadFeature(tenant: Tenant, key: string): boolean {
  const eff = (tenant as Tenant & { effectiveEntitlements?: Entitlement[] }).effectiveEntitlements;
  if (!eff) return false; // no remote data → no feature claims (fail-closed)
  return canUseFeature({ planId: "", state: "active", entitlements: eff }, key);
}

/** Canonical media object key for bakery uploads: <tenant-uuid>/bakery/<file>. */
export function bakeryMediaPath(tenantId: string, filename: string): string {
  return tenantMediaPath(tenantId, "bakery", filename);
}

export function bakeryBucketFor(visibility: MediaVisibility): "tenant-public" | "tenant-private" {
  return bucketForVisibility(visibility);
}

/** Upload guard bound to the plan's media.maxFileSize entitlement (0 → deny). */
export function canUploadBakeryMedia(mimeType: string, size: number, tenant: Tenant): boolean {
  const eff = (tenant as Tenant & { effectiveEntitlements?: Entitlement[] }).effectiveEntitlements;
  const max = eff?.find((e) => e.key === "media.maxFileSize");
  if (!max || typeof max.value !== "number" || max.value <= 0) return false;
  return isUploadAllowed(mimeType, size, max.value);
}
