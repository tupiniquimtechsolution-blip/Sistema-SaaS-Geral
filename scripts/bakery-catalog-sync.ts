// Minimal ambient Node globals — keeps the harness aligned with the existing scripts.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};

/**
 * BAKERY CATALOG SYNC HARNESS
 *
 * Purpose:
 * - migrate the existing Bakery demo catalog into the canonical remote commerce
 *   tables through the NORMAL publishable-key + authenticated RLS path;
 * - never use service_role;
 * - default to DRY RUN;
 * - refuse an active tenant unless explicitly allowed.
 *
 * Required env for a remote run:
 *   SUPABASE_URL
 *   SUPABASE_PUBLISHABLE_KEY
 *   TEST_A_EMAIL
 *   TEST_A_PASSWORD
 *
 * Target one tenant with either:
 *   BAKERY_TENANT_ID=<uuid>
 *   BAKERY_TENANT_SLUG=qa-tenant-a
 *
 * Write gate:
 *   BAKERY_CATALOG_APPLY=true
 *
 * Active-tenant override (normally forbidden during QA):
 *   BAKERY_ALLOW_ACTIVE_TENANT=true
 *
 * Run (project convention):
 *   bun scripts/bakery-catalog-sync.ts
 */

type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  vertical_id: string;
};

type SyncResult = {
  status: "NOT_RUN" | "DRY_RUN" | "APPLIED" | "FAIL";
  tenant?: Pick<TenantRow, "id" | "slug" | "status">;
  categories: number;
  products: number;
  optionGroups: number;
  optionValues: number;
};

function required(env: Record<string, string | undefined>, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`missing_env:${key}`);
  return value;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveTargetTenant(client: SupabaseClient, env: Record<string, string | undefined>): Promise<TenantRow> {
  const requestedId = env["BAKERY_TENANT_ID"]?.trim();
  const requestedSlug = env["BAKERY_TENANT_SLUG"]?.trim() || "qa-tenant-a";

  if (requestedId && !isUuid(requestedId)) throw new Error("invalid_env:BAKERY_TENANT_ID");

  const { data: membershipRows, error: membershipError } = await client
    .from("memberships")
    .select("tenant_id")
    .eq("status", "active");
  if (membershipError) throw new Error(`membership_read_failed:${membershipError.code ?? "unknown"}`);

  const membershipIds = (membershipRows ?? [])
    .map((row) => String((row as { tenant_id?: unknown }).tenant_id ?? ""))
    .filter(isUuid);
  if (!membershipIds.length) throw new Error("no_active_tenant_memberships");

  let query = client
    .from("tenants")
    .select("id,slug,name,status,vertical_id")
    .in("id", membershipIds);
  if (requestedId) query = query.eq("id", requestedId);
  else query = query.eq("slug", requestedSlug);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`tenant_read_failed:${error.code ?? "unknown"}`);
  if (!data) throw new Error("target_tenant_not_in_authenticated_memberships");

  const tenant = data as TenantRow;
  if (tenant.vertical_id !== "bakery") throw new Error(`target_vertical_mismatch:${tenant.vertical_id}`);
  return tenant;
}

function compactProductMetadata(product: import("../apps/bakery/src/business/types").Product): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    legacy_id: product.id,
    images: product.images,
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    is_new: Boolean(product.isNew),
    ingredients: product.ingredients ?? [],
    allergens: product.allergens ?? [],
    variations: product.variations ?? [],
    extras: product.extras ?? [],
    preparation_time: product.preparationTime ?? null,
    tags: product.tags ?? [],
    unit: product.unit ?? null,
    combo_items: product.comboItems ?? [],
    pairs_with: product.pairsWith ?? [],
    migrated_from: "apps/bakery/src/business/products.ts",
  };
  if (product.promotionalPrice !== undefined && product.promotionalPrice < product.price) {
    metadata.list_price = product.price;
  }
  return metadata;
}

export async function runBakeryCatalogSync(
  env: Record<string, string | undefined> = process.env,
): Promise<SyncResult> {
  const base: SyncResult = { status: "NOT_RUN", categories: 0, products: 0, optionGroups: 0, optionValues: 0 };

  const url = env["SUPABASE_URL"]?.trim();
  const key = env["SUPABASE_PUBLISHABLE_KEY"]?.trim();
  const email = env["TEST_A_EMAIL"]?.trim();
  const password = env["TEST_A_PASSWORD"];
  if (!url || !key || !email || !password || /^<.*>$/.test(email)) {
    console.log("[bakery-catalog] env missing/placeholders → NOT RUN");
    return base;
  }
  if (key.includes("service_role") || key.startsWith("sb_secret_")) {
    throw new Error("forbidden_server_secret_key");
  }

  const apply = env["BAKERY_CATALOG_APPLY"]?.toLowerCase() === "true";
  const allowActive = env["BAKERY_ALLOW_ACTIVE_TENANT"]?.toLowerCase() === "true";

  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`auth_failed:${signInError.message}`);

  try {
    const tenant = await resolveTargetTenant(client, env);
    if (tenant.status === "active" && !allowActive) {
      throw new Error("refusing_active_tenant_without_BAKERY_ALLOW_ACTIVE_TENANT=true");
    }
    if (!(["demo", "trialing", "active"] as string[]).includes(tenant.status)) {
      throw new Error(`tenant_status_not_writable_for_catalog_sync:${tenant.status}`);
    }

    const [{ categories, products }] = await Promise.all([
      import("../apps/bakery/src/business/products"),
    ]);

    const optionGroups = products.reduce(
      (sum, product) => sum + (product.variations?.length ?? 0) + (product.extras?.length ? 1 : 0),
      0,
    );
    const optionValues = products.reduce(
      (sum, product) =>
        sum +
        (product.variations?.reduce((inner, variation) => inner + variation.options.length, 0) ?? 0) +
        (product.extras?.length ?? 0),
      0,
    );

    const summary: SyncResult = {
      status: apply ? "APPLIED" : "DRY_RUN",
      tenant: { id: tenant.id, slug: tenant.slug, status: tenant.status },
      categories: categories.length,
      products: products.length,
      optionGroups,
      optionValues,
    };

    console.log(`[bakery-catalog] target=${tenant.slug} (${tenant.status})`);
    console.log(`[bakery-catalog] categories=${categories.length} products=${products.length} optionGroups=${optionGroups} optionValues=${optionValues}`);

    if (!apply) {
      console.log("[bakery-catalog] DRY RUN — set BAKERY_CATALOG_APPLY=true to write through authenticated RLS");
      return summary;
    }

    const categoryPayload = categories.map((category, position) => ({
      tenant_id: tenant.id,
      name: category.name,
      slug: category.slug,
      description: category.tagline || null,
      position,
      is_active: true,
    }));
    const { data: categoryRows, error: categoryError } = await client
      .from("product_categories")
      .upsert(categoryPayload, { onConflict: "tenant_id,slug" })
      .select("id,slug");
    if (categoryError) throw new Error(`category_upsert_failed:${categoryError.code ?? "unknown"}`);
    const categoryIdBySlug = new Map(
      (categoryRows ?? []).map((row) => [String((row as { slug: unknown }).slug), String((row as { id: unknown }).id)]),
    );
    if (categoryIdBySlug.size !== categories.length) throw new Error("category_upsert_count_mismatch");

    const productPayload = products.map((product) => {
      const categoryId = categoryIdBySlug.get(product.category);
      if (!categoryId) throw new Error(`category_not_resolved:${product.category}`);
      const effectiveSellPrice =
        product.promotionalPrice !== undefined && product.promotionalPrice < product.price
          ? product.promotionalPrice
          : product.price;
      return {
        tenant_id: tenant.id,
        category_id: categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.shortDescription,
        sku: `bakery:${product.id}`,
        base_price: effectiveSellPrice,
        currency: "BRL",
        status: product.available ? "active" : "inactive",
        availability: { available: product.available },
        metadata: compactProductMetadata(product),
      };
    });
    const { data: productRows, error: productError } = await client
      .from("products")
      .upsert(productPayload, { onConflict: "tenant_id,slug" })
      .select("id,slug");
    if (productError) throw new Error(`product_upsert_failed:${productError.code ?? "unknown"}`);
    const productIdBySlug = new Map(
      (productRows ?? []).map((row) => [String((row as { slug: unknown }).slug), String((row as { id: unknown }).id)]),
    );
    if (productIdBySlug.size !== products.length) throw new Error("product_upsert_count_mismatch");

    // Options have no natural unique key in the current remote schema.
    // To keep the QA/demo sync idempotent, replace options ONLY for the exact
    // products synchronized above. RLS catalog.write remains authoritative.
    const productIds = [...productIdBySlug.values()];
    if (productIds.length) {
      const { error: deleteOptionsError } = await client.from("product_options").delete().in("product_id", productIds);
      if (deleteOptionsError) throw new Error(`option_replace_delete_failed:${deleteOptionsError.code ?? "unknown"}`);
    }

    for (const product of products) {
      const productId = productIdBySlug.get(product.slug);
      if (!productId) throw new Error(`product_not_resolved:${product.slug}`);

      for (let position = 0; position < (product.variations?.length ?? 0); position += 1) {
        const variation = product.variations![position];
        const { data: optionRow, error: optionError } = await client
          .from("product_options")
          .insert({
            tenant_id: tenant.id,
            product_id: productId,
            name: variation.name,
            selection_type: "single",
            is_required: true,
            min_selected: 1,
            max_selected: 1,
            position,
          })
          .select("id")
          .single();
        if (optionError) throw new Error(`variation_insert_failed:${product.slug}:${optionError.code ?? "unknown"}`);
        const optionId = String((optionRow as { id: unknown }).id);
        const values = variation.options.map((value, valuePosition) => ({
          tenant_id: tenant.id,
          option_id: optionId,
          name: value.label,
          price_delta: value.delta,
          is_active: true,
          position: valuePosition,
          metadata: { legacy_id: value.id, legacy_group_id: variation.id, kind: "variation" },
        }));
        if (values.length) {
          const { error: valuesError } = await client.from("product_option_values").insert(values);
          if (valuesError) throw new Error(`variation_values_insert_failed:${product.slug}:${valuesError.code ?? "unknown"}`);
        }
      }

      if (product.extras?.length) {
        const { data: extrasRow, error: extrasError } = await client
          .from("product_options")
          .insert({
            tenant_id: tenant.id,
            product_id: productId,
            name: "Extras",
            selection_type: "multiple",
            is_required: false,
            min_selected: 0,
            max_selected: product.extras.length,
            position: product.variations?.length ?? 0,
          })
          .select("id")
          .single();
        if (extrasError) throw new Error(`extras_insert_failed:${product.slug}:${extrasError.code ?? "unknown"}`);
        const extrasOptionId = String((extrasRow as { id: unknown }).id);
        const extrasValues = product.extras.map((extra, position) => ({
          tenant_id: tenant.id,
          option_id: extrasOptionId,
          name: extra.name,
          price_delta: extra.price,
          is_active: true,
          position,
          metadata: { legacy_id: extra.id, kind: "extra" },
        }));
        const { error: extrasValuesError } = await client.from("product_option_values").insert(extrasValues);
        if (extrasValuesError) throw new Error(`extras_values_insert_failed:${product.slug}:${extrasValuesError.code ?? "unknown"}`);
      }
    }

    const { count: remoteProductCount, error: countError } = await client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id);
    if (countError) throw new Error(`post_sync_count_failed:${countError.code ?? "unknown"}`);
    if ((remoteProductCount ?? 0) < products.length) throw new Error("post_sync_product_count_below_source_count");

    console.log(`[bakery-catalog] APPLIED through RLS — remote products=${remoteProductCount}`);
    return summary;
  } finally {
    await client.auth.signOut();
  }
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("bakery-catalog-sync");

if (isDirectRun) {
  runBakeryCatalogSync()
    .then((result) => console.log(`[bakery-catalog] status=${result.status}`))
    .catch((error: unknown) => {
      console.error(`[bakery-catalog] FAIL — ${error instanceof Error ? error.message : "unknown_error"}`);
      process.exitCode = 1;
    });
}
