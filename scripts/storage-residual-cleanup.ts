// Residual cleanup for the private-bucket QA objects left by the last storage
// smoke run (the harness itself failed only on PUBLIC uploads; private objects
// were created and the cleanup failed on the public step ordering). This script
// removes tenant QA objects for both identities and re-verifies residual=0.
declare const process: { env: Record<string, string | undefined>; argv: string[] };

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

export async function cleanupPrivateResidual(
  createClientFn: CreateClientFn,
  env: Record<string, string | undefined> = process.env,
): Promise<void> {
  const url = env["SUPABASE_URL"] || "https://mmykyzzkcugxunmekwew.supabase.co";
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  if (!key) {
    console.log("[residual-cleanup] no key → NOT RUN");
    return;
  }
  const pairs: Array<[string, string, string, string]> = [
    ["A", env["TEST_A_EMAIL"] ?? "", env["TEST_A_PASSWORD"] ?? "", env["TEST_A_TENANT_SLUG"] || "qa-tenant-a"],
    ["B", env["TEST_B_EMAIL"] ?? "", env["TEST_B_PASSWORD"] ?? "", env["TEST_B_TENANT_SLUG"] || "qa-tenant-b"],
  ];
  for (const [label, email, password, slug] of pairs) {
    if (!email || !password || /^<.*>$/.test(email)) continue;
    const client = (await createClientFn(url, key)) as import("@supabase/supabase-js").SupabaseClient;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      console.log(`[residual-cleanup] ${label}: auth failed`);
      continue;
    }
    const { data } = await client.from("memberships").select("tenant_id, tenant:tenants!inner(id, slug)").eq("status", "active");
    const rows = (data ?? []) as unknown as Array<{ tenant_id: string; tenant: { id: string; slug: string } }>;
    const own = rows.find((r) => r.tenant?.slug === slug);
    if (!own) {
      console.log(`[residual-cleanup] ${label}: tenant not found`);
      continue;
    }
    const { data: del } = await client.storage.from("tenant-private").remove([`${own.tenant_id}/qa/storage-a.png`.replace("storage-a", label === "A" ? "storage-a" : "storage-b")]);
    // correct object per actor
    const object = label === "A" ? `${own.tenant_id}/qa/storage-a.png` : `${own.tenant_id}/qa/storage-b.png`;
    const r2 = await client.storage.from("tenant-private").remove([object]);
    void del;
    const check = await client.storage.from("tenant-private").download(object);
    console.log(`[residual-cleanup] ${label}: ${object.slice(0, 8)}… removed=${(r2.data ?? []).length} residual=${check.error ? "gone" : "PRESENT"}`);
    await client.auth.signOut();
  }
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("residual-cleanup");
if (isDirectRun) {
  cleanupPrivateResidual(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  );
}

export {};
