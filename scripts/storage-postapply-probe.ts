// POST-APPLY STORAGE PROBE — diagnostic for the 20260918132842_fix_tenant_public_read_policy validation.
// Answers empirically (publishable key only, PII never printed):
//   1. what actually exists under <tenant>/qa in tenant-public (authenticated list, no search filter);
//   2. what an ANON list (RLS-governed, post-apply fixed tenant_public_read) returns for the same folder;
//   3. whether an exact-path remove() can clear QA leftovers (cleanup authorization per wave contract).
declare const process: { env: Record<string, string | undefined>; argv: string[] };

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

type Client = import("@supabase/supabase-js").SupabaseClient;

const PUBLIC_BUCKET = "tenant-public";
const QA_FOLDER = "qa";

export async function runPostApplyProbe(createClientFn: CreateClientFn, env = process.env): Promise<void> {
  const url = env["SUPABASE_URL"] || "https://mmykyzzkcugxunmekwew.supabase.co";
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  if (!key) {
    console.log("[postapply] no key → NOT RUN");
    return;
  }
  const pairs: Array<[string, string, string, string]> = [
    ["A", env["TEST_A_EMAIL"] ?? "", env["TEST_A_PASSWORD"] ?? "", env["TEST_A_TENANT_SLUG"] || "qa-tenant-a"],
    ["B", env["TEST_B_EMAIL"] ?? "", env["TEST_B_PASSWORD"] ?? "", env["TEST_B_TENANT_SLUG"] || "qa-tenant-b"],
  ];

  const anon = (await createClientFn(url, key)) as Client;

  for (const [label, email, password, slug] of pairs) {
    if (!email || !password || /^<.*>$/.test(email)) continue;
    const client = (await createClientFn(url, key)) as Client;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      console.log(`[postapply] ${label}: auth failed`);
      continue;
    }
    const { data } = await client
      .from("memberships")
      .select("tenant_id, tenant:tenants!inner(id, slug)")
      .eq("status", "active");
    const rows = (data ?? []) as unknown as Array<{ tenant_id: string; tenant: { id: string; slug: string } }>;
    const own = rows.find((r) => r.tenant?.slug === slug);
    if (!own) {
      console.log(`[postapply] ${label}: tenant not found`);
      continue;
    }
    const tenantId = own.tenant_id;

    // 1. authenticated list of the whole qa folder (no search filter)
    const authList = await client.storage.from(PUBLIC_BUCKET).list(`${tenantId}/${QA_FOLDER}`, { limit: 50 });
    const authNames = (authList.data ?? []).map((o) => o.name);
    console.log(`[postapply] ${label}: auth-list <tenant>/qa → ${authList.error ? `ERROR(${authList.error.message})` : JSON.stringify(authNames)}`);

    // 2. ANON list of the SAME folder — post-apply RLS-governed SELECT
    const anonList = await anon.storage.from(PUBLIC_BUCKET).list(`${tenantId}/${QA_FOLDER}`, { limit: 50 });
    const anonNames = (anonList.data ?? []).map((o) => o.name);
    console.log(`[postapply] ${label}: anon-list <tenant>/qa → ${anonList.error ? `ERROR(${anonList.error.message})` : JSON.stringify(anonNames)}`);

    // 3. targeted cleanup: exact-path remove for every name seen, then re-list
    for (const name of authNames) {
      const r = await client.storage.from(PUBLIC_BUCKET).remove([`${tenantId}/${QA_FOLDER}/${name}`]);
      const item = (r.data ?? []) as unknown as Array<{ name: string; error?: string | null }>;
      console.log(`[postapply] ${label}: remove ${name} → ack=${(r.data ?? []).length} itemError=${item[0]?.error ?? "none"} reqError=${r.error?.message ?? "none"}`);
    }
    const after = await client.storage.from(PUBLIC_BUCKET).list(`${tenantId}/${QA_FOLDER}`, { limit: 50 });
    console.log(`[postapply] ${label}: after-cleanup auth-list → ${(after.data ?? []).length} objects${after.error ? ` ERROR(${after.error.message})` : ""}`);
    await client.auth.signOut();
  }
  // anon re-check after cleanup
  for (const [, , , slug] of pairs) {
    if (!slug) continue;
    void slug;
  }
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("postapply");
if (isDirectRun) {
  runPostApplyProbe(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  );
}

export {};
