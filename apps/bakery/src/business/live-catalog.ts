import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, ExtraOption, Product, Variation } from "./types";

/**
 * Public Bakery catalog read contract.
 *
 * Security boundary:
 * - the caller supplies a canonical tenant UUID (for white-label deployments,
 *   VITE_TENANT_ID is the intended source);
 * - reads use the publishable browser client and therefore remain RLS-backed;
 * - prices come from public.products.base_price, never from browser-local data;
 * - presentation-only legacy fields may be carried in products.metadata while
 *   the storefront is migrated to the canonical commerce model.
 */

export interface RemoteBakeryCategoryRow {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  is_active: boolean;
}

export interface RemoteBakeryProductRow {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  base_price: number | string;
  currency: string;
  status: string;
  availability: unknown;
  metadata: unknown;
}

export interface BakeryRemoteCatalog {
  categories: Category[];
  products: Product[];
  source: "live";
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return result.length ? result : undefined;
}

function asVariations(value: unknown): Variation[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: Variation[] = [];
  for (const rawVariation of value) {
    if (!isRecord(rawVariation)) continue;
    const id = asString(rawVariation.id);
    const name = asString(rawVariation.name);
    if (!id || !name || !Array.isArray(rawVariation.options)) continue;
    const options = rawVariation.options.flatMap((rawOption) => {
      if (!isRecord(rawOption)) return [];
      const optionId = asString(rawOption.id);
      const label = asString(rawOption.label);
      const delta = asNumber(rawOption.delta);
      return optionId && label && delta !== undefined ? [{ id: optionId, label, delta }] : [];
    });
    if (options.length) result.push({ id, name, options });
  }
  return result.length ? result : undefined;
}

function asExtras(value: unknown): ExtraOption[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const id = asString(raw.id);
    const name = asString(raw.name);
    const price = asNumber(raw.price);
    return id && name && price !== undefined ? [{ id, name, price }] : [];
  });
  return result.length ? result : undefined;
}

function availabilityFlag(value: unknown, key: string): boolean | undefined {
  return isRecord(value) ? asBoolean(value[key]) : undefined;
}

export function mapRemoteBakeryCatalog(input: {
  categories: RemoteBakeryCategoryRow[];
  products: RemoteBakeryProductRow[];
}): BakeryRemoteCatalog {
  const categoryById = new Map(input.categories.map((row) => [row.id, row]));

  const categories: Category[] = input.categories
    .filter((row) => row.is_active)
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      // Current remote category schema has no media column. Keep this empty
      // rather than falling back to tenant-local/demo media in live mode.
      image: "",
      tagline: row.description ?? "",
    }));

  const products: Product[] = input.products
    .filter((row) => row.status === "active")
    .map((row) => {
      const meta = isRecord(row.metadata) ? row.metadata : {};
      const currentPrice = asNumber(row.base_price);
      if (currentPrice === undefined || currentPrice < 0) {
        throw new Error(`invalid_remote_price:${row.id}`);
      }
      const listPrice = asNumber(meta.list_price);
      const hasPromotion = listPrice !== undefined && listPrice > currentPrice;
      const category = row.category_id ? categoryById.get(row.category_id)?.slug : undefined;
      const images = asStringArray(meta.images) ?? [];

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description ?? "",
        shortDescription: row.short_description ?? row.description ?? "",
        category: category ?? "sem-categoria",
        images,
        // Canonical remote base_price is the CURRENT sell price.
        // When list_price is present, expose the legacy shape as
        // list price + promotional current price without changing checkout truth.
        price: hasPromotion ? listPrice : currentPrice,
        promotionalPrice: hasPromotion ? currentPrice : undefined,
        available: availabilityFlag(row.availability, "available") ?? true,
        featured: asBoolean(meta.featured),
        bestseller: asBoolean(meta.bestseller),
        isNew: asBoolean(meta.is_new),
        ingredients: asStringArray(meta.ingredients),
        allergens: asStringArray(meta.allergens),
        variations: asVariations(meta.variations),
        extras: asExtras(meta.extras),
        preparationTime: asString(meta.preparation_time),
        tags: asStringArray(meta.tags),
        unit: asString(meta.unit),
        comboItems: asStringArray(meta.combo_items),
        pairsWith: asStringArray(meta.pairs_with),
      } satisfies Product;
    });

  return { categories, products, source: "live" };
}

export async function loadRemoteBakeryCatalog(
  client: SupabaseClient,
  tenantId: string,
): Promise<BakeryRemoteCatalog> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new Error("invalid_tenant_id");
  }

  const [categoriesResult, productsResult] = await Promise.all([
    client
      .from("product_categories")
      .select("id,tenant_id,name,slug,description,position,is_active")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("position", { ascending: true }),
    client
      .from("products")
      .select("id,tenant_id,category_id,name,slug,description,short_description,sku,base_price,currency,status,availability,metadata")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("name", { ascending: true }),
  ]);

  if (categoriesResult.error) throw new Error(`remote_categories_read_failed:${categoriesResult.error.code ?? "unknown"}`);
  if (productsResult.error) throw new Error(`remote_products_read_failed:${productsResult.error.code ?? "unknown"}`);

  return mapRemoteBakeryCatalog({
    categories: (categoriesResult.data ?? []) as RemoteBakeryCategoryRow[],
    products: (productsResult.data ?? []) as RemoteBakeryProductRow[],
  });
}
