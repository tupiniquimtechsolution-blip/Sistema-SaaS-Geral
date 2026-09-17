// Cleanup verification: confirms no residual QA_RLS_ contact rows remain
// visible to either QA identity (validates rls-gate cleanup). Metadata only.
declare const process: { env: Record<string, string | undefined>; argv: string[] };

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

export async function verifyCleanup(
  createClientFn: CreateClientFn,
  env: Record<string, string | undefined> = process.env,
): Promise<void> {
  const url = env["SUPABASE_URL"] || "https://mmykyzzkcugxunmekwew.supabase.co";
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const pairs: Array<[string, string, string]> = [
    ["A", env["TEST_A_EMAIL"] ?? "", env["TEST_A_PASSWORD"] ?? ""],
    ["B", env["TEST_B_EMAIL"] ?? "", env["TEST_B_PASSWORD"] ?? ""],
  ];
  if (!key) {
    console.log("[cleanup-check] no key → NOT RUN");
    return;
  }
  for (const [label, email, password] of pairs) {
    if (!email || !password || /^<.*>$/.test(email)) continue;
    const client = (await createClientFn(url, key)) as import("@supabase/supabase-js").SupabaseClient;
    const { error: authErr } = await client.auth.signInWithPassword({ email, password });
    if (authErr) {
      console.log(`[cleanup-check] ${label}: auth failed — ${authErr.message}`);
      continue;
    }
    const { data } = await client.from("contacts").select("id").eq("name", "QA_RLS_contact");
    console.log(`[cleanup-check] ${label}: residual QA_RLS_ contacts = ${(data ?? []).length}`);
    await client.auth.signOut();
  }
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("rls-cleanup-check");
if (isDirectRun) {
  verifyCleanup(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  );
}

export {};
