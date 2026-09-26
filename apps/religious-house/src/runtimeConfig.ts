import { createClient } from "@supabase/supabase-js";
import { templeConfig } from "./data/templeConfig";

type Bootstrap = {
  tenant_slug: string;
  vertical_id: string;
  brand: Record<string, unknown>;
  settings: { public_settings?: Record<string, unknown> };
};

const asText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function loadTempleTenantConfig(): Promise<"remote" | "fallback"> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key) return "fallback";

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tenantSlug = (import.meta.env.VITE_TENANT_SLUG as string | undefined) ?? "caboclo-tupinamba-flecha-dourada";
  const { data, error } = await client.rpc("get_storefront_bootstrap", { p_tenant_slug: tenantSlug }).maybeSingle();
  if (error || !data) return "fallback";

  const row = data as Bootstrap;
  if (row.vertical_id !== "religious-house") return "fallback";

  const brand = asObject(row.brand);
  const settings = asObject(row.settings);
  const publicSettings = asObject(settings.public_settings);

  templeConfig.name = asText(brand.display_name) ?? templeConfig.name;
  templeConfig.shortName = asText(brand.display_name) ?? templeConfig.shortName;
  templeConfig.phoneDisplay = asText(brand.phone) ?? templeConfig.phoneDisplay;
  templeConfig.phone = asText(brand.whatsapp) ?? templeConfig.phone;
  templeConfig.instagram = asText(brand.instagram_url) ?? templeConfig.instagram;

  const address = asObject(brand.address);
  templeConfig.address.street = asText(address.street) ?? templeConfig.address.street;
  templeConfig.address.district = asText(address.district) ?? templeConfig.address.district;
  templeConfig.address.city = asText(address.city) ?? templeConfig.address.city;
  templeConfig.address.state = asText(address.state) ?? templeConfig.address.state;
  templeConfig.address.zip = asText(address.zip) ?? templeConfig.address.zip;

  if (typeof publicSettings.showLineage === "boolean") templeConfig.showLineage = publicSettings.showLineage;
  if (typeof publicSettings.foundedYear === "number") templeConfig.fundadaEm = publicSettings.foundedYear;

  return "remote";
}
