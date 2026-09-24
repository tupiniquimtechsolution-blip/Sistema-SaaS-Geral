import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { TenantBrandRow, TenantRow, TenantSettingsRow, TenantThemeRow } from "tupiniquim-database";
import { salonTemplateDefaults, vanessaPreviewConfig, type SalonPublicConfig } from "../config/template";

export type SalonConfigSource = "preview" | "live" | "error";

export interface SalonRuntimeConfig {
  config: SalonPublicConfig;
  source: SalonConfigSource;
  errorCode?: string;
  themeTokens?: Record<string, unknown>;
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
    bookingEnabled: publicSettings.bookingEnabled !== false,
    mediaPublicationAuthorized: publicSettings.mediaPublicationAuthorized === true,
  };

  return {
    config,
    source: "live",
    themeTokens: isRecord(input.theme?.tokens) ? input.theme?.tokens : undefined,
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
      : { config: { ...salonTemplateDefaults, bookingEnabled: false }, source: "error", errorCode: "session_required_for_preview_resolution" };
  }

  try {
    const { resolveTenantContext } = await import("tupiniquim-tenancy");
    const { context } = await resolveTenantContext(options.client, {
      session: options.session,
      requestedTenantId: options.requestedTenantId,
      reads: ["brand", "theme", "settings", "entitlements"],
    });

    if (!context.selection.ok || !context.tenant) {
      return isSalonDemoMode()
        ? getSalonPreviewConfig()
        : { config: { ...salonTemplateDefaults, bookingEnabled: false }, source: "error", errorCode: "tenant_not_resolved" };
    }

    return mapCanonicalSalonRows({
      tenant: context.tenant,
      brand: context.brand,
      theme: context.theme,
      settings: context.settings,
    });
  } catch {
    return isSalonDemoMode()
      ? getSalonPreviewConfig()
      : { config: { ...salonTemplateDefaults, bookingEnabled: false }, source: "error", errorCode: "tenant_resolution_failed" };
  }
}

export function salonMediaObjectKey(tenantId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${tenantId}/salon/${safe}`;
}
