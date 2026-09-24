import type { Session, SupabaseClient } from "@supabase/supabase-js";
import {
  createSupabaseBrowserClient,
  type TenantBrandRow,
  type TenantRow,
  type TenantSettingsRow,
  type TenantThemeRow,
} from "tupiniquim-database";
import { salonTemplateDefaults, vanessaPreviewConfig, type SalonPublicConfig } from "../config/template";

export type SalonConfigSource = "preview" | "live" | "error";

export interface SalonRuntimeConfig {
  config: SalonPublicConfig;
  source: SalonConfigSource;
  errorCode?: string;
  themeTokens?: Record<string, unknown>;
}

interface StorefrontBootstrapRow {
  tenant_id: string;
  tenant_slug: string;
  tenant_status: string;
  vertical_id: string;
  brand: Record<string, unknown> | null;
  theme: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringFrom(record: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function errorRuntime(errorCode: string): SalonRuntimeConfig {
  return {
    config: { ...salonTemplateDefaults, bookingEnabled: false },
    source: "error",
    errorCode,
  };
}

/**
 * Pure mapping from canonical SaaS Core rows to the public Salon contract.
 * Unknown fields remain absent; no tenant-specific conditional is allowed.
 */
export function mapCanonicalSalonRows(input: {
  tenant: TenantRow;
  brand: TenantBrandRow | null;
  theme: TenantThemeRow | null;
  settings: TenantSettingsRow | null;
}): SalonRuntimeConfig {
  const publicSettings = isRecord(input.settings?.public_settings) ? input.settings?.public_settings : {};
  const integrations = isRecord(publicSettings.integrations) ? publicSettings.integrations : {};
  const social = isRecord(publicSettings.social) ? publicSettings.social : {};
  const whatsapp = isRecord(integrations.whatsapp) ? integrations.whatsapp : {};

  const config: SalonPublicConfig = {
    ...salonTemplateDefaults,
    tenantId: input.tenant.id,
    slug: input.tenant.slug,
    brandName: input.brand?.display_name || input.tenant.name || salonTemplateDefaults.brandName,
    tagline: input.brand?.tagline || salonTemplateDefaults.tagline,
    instagramHandle: stringFrom(social, "instagram") ?? "",
    instagramUrl: stringFrom(social, "instagramUrl", "instagram_url") ?? "",
    whatsapp: stringFrom(whatsapp, "number") ?? stringFrom(publicSettings, "whatsapp") ?? "",
    phoneDisplay: stringFrom(publicSettings, "phoneDisplay", "phone_display", "phone") ?? "",
    address: stringFrom(publicSettings, "address") ?? "",
    city: stringFrom(publicSettings, "city"),
    state: stringFrom(publicSettings, "state"),
    postalCode: stringFrom(publicSettings, "postalCode", "postal_code"),
    schedule: stringFrom(publicSettings, "schedule"),
    email: stringFrom(publicSettings, "email"),
    bookingEnabled: publicSettings.bookingEnabled === true,
    mediaPublicationAuthorized: publicSettings.mediaPublicationAuthorized === true,
  };

  return {
    config,
    source: "live",
    themeTokens: isRecord(input.theme?.tokens) ? input.theme?.tokens : undefined,
  };
}

function mapStorefrontBootstrap(row: StorefrontBootstrapRow): SalonRuntimeConfig {
  const brand = isRecord(row.brand) ? row.brand : {};
  const theme = isRecord(row.theme) ? row.theme : {};
  const settings = isRecord(row.settings) ? row.settings : {};
  const publicSettings = isRecord(settings.public_settings) ? settings.public_settings : {};
  const integrations = isRecord(publicSettings.integrations) ? publicSettings.integrations : {};
  const social = isRecord(publicSettings.social) ? publicSettings.social : {};
  const whatsapp = isRecord(integrations.whatsapp) ? integrations.whatsapp : {};

  return {
    source: "live",
    themeTokens: isRecord(theme.tokens) ? theme.tokens : undefined,
    config: {
      ...salonTemplateDefaults,
      tenantId: row.tenant_id,
      slug: row.tenant_slug,
      brandName: stringFrom(brand, "display_name") ?? salonTemplateDefaults.brandName,
      tagline: stringFrom(brand, "tagline") ?? salonTemplateDefaults.tagline,
      instagramHandle: stringFrom(social, "instagram") ?? stringFrom(publicSettings, "instagram") ?? "",
      instagramUrl:
        stringFrom(social, "instagramUrl", "instagram_url") ??
        stringFrom(publicSettings, "instagramUrl", "instagram_url") ??
        stringFrom(brand, "instagram_url") ??
        "",
      whatsapp: stringFrom(whatsapp, "number") ?? stringFrom(publicSettings, "whatsapp") ?? stringFrom(brand, "whatsapp") ?? "",
      phoneDisplay: stringFrom(publicSettings, "phoneDisplay", "phone_display", "phone") ?? stringFrom(brand, "phone") ?? "",
      address: stringFrom(publicSettings, "address") ?? "",
      city: stringFrom(publicSettings, "city"),
      state: stringFrom(publicSettings, "state"),
      postalCode: stringFrom(publicSettings, "postalCode", "postal_code"),
      schedule: stringFrom(publicSettings, "schedule"),
      email: stringFrom(publicSettings, "email") ?? stringFrom(brand, "email"),
      bookingEnabled: publicSettings.bookingEnabled === true,
      mediaPublicationAuthorized: publicSettings.mediaPublicationAuthorized === true,
    },
  };
}

export function getSalonPreviewConfig(): SalonRuntimeConfig {
  return { config: vanessaPreviewConfig, source: "preview" };
}

export function isSalonDemoMode(): boolean {
  const raw = import.meta.env.VITE_DEMO_MODE;
  if (raw == null || raw === "") return true;
  return raw.toLowerCase() !== "false";
}

/**
 * Public storefront resolution uses the canonical browser-safe bootstrap RPC.
 * Production fails closed: tenant slug is deploy configuration, never a query
 * string or arbitrary tenant id supplied by the visitor.
 */
export async function loadPublicSalonConfig(): Promise<SalonRuntimeConfig> {
  if (isSalonDemoMode()) return getSalonPreviewConfig();

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  const tenantSlug = import.meta.env.VITE_TENANT_SLUG?.trim();

  if (!url || !publishableKey || !tenantSlug) return errorRuntime("live_runtime_env_missing");

  try {
    const client = createSupabaseBrowserClient({
      url,
      publishableKey,
      authStorageKey: `tupiniquim-salon-${tenantSlug}`,
    });
    const { data, error } = await client.rpc("get_storefront_bootstrap", { p_tenant_slug: tenantSlug });
    if (error) return errorRuntime("storefront_bootstrap_failed");

    const row = Array.isArray(data) ? data[0] : data;
    if (!isRecord(row)) return errorRuntime("tenant_not_resolved");

    const typed = row as unknown as StorefrontBootstrapRow;
    if (typed.vertical_id !== "salon") return errorRuntime("vertical_mismatch");
    if (!typed.tenant_id || !typed.tenant_slug) return errorRuntime("tenant_contract_invalid");

    return mapStorefrontBootstrap(typed);
  } catch {
    return errorRuntime("public_runtime_failed");
  }
}

/**
 * Authenticated Preview/Admin resolution. Public hostname resolution remains a
 * separate server-side contract: production must not trust a tenant id chosen
 * only by the browser.
 */
export async function loadAuthenticatedSalonConfig(options: {
  client: SupabaseClient;
  session: Session | null;
  requestedTenantId?: string;
}): Promise<SalonRuntimeConfig> {
  if (!options.session) {
    return isSalonDemoMode()
      ? getSalonPreviewConfig()
      : errorRuntime("session_required_for_preview_resolution");
  }

  try {
    const { resolveTenantContext } = await import("tupiniquim-tenancy");
    const { context } = await resolveTenantContext(options.client, {
      session: options.session,
      requestedTenantId: options.requestedTenantId,
      reads: ["brand", "theme", "settings", "entitlements"],
    });

    if (!context.selection.ok || !context.tenant) {
      return isSalonDemoMode() ? getSalonPreviewConfig() : errorRuntime("tenant_not_resolved");
    }

    if (context.tenant.vertical_id !== "salon") return errorRuntime("vertical_mismatch");

    return mapCanonicalSalonRows({
      tenant: context.tenant,
      brand: context.brand,
      theme: context.theme,
      settings: context.settings,
    });
  } catch {
    return isSalonDemoMode() ? getSalonPreviewConfig() : errorRuntime("tenant_resolution_failed");
  }
}

export function salonMediaObjectKey(tenantId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${tenantId}/salon/${safe}`;
}
