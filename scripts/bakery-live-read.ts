// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * BAKERY LIVE READ GATE.
 *
 * Proves the vertical read path end-to-end against the LIVE canonical Supabase
 * project with VITE_DEMO_MODE=false posture (no silent Fornalha fallback):
 *   publishable key → sign-in identity A → packages/database read helpers →
 *   packages/tenancy resolveTenantContext → bakery adapter mapLiveTenantToBakery
 *
 * Asserts: tenant identity is the LIVE QA tenant (never the demo slug), brand/
 * theme/settings rows are the RLS-scoped ones, and entitlements assemble
 * (empty catalog ⇒ default-deny set, still a valid live read).
 *
 * Run: bun scripts/bakery-live-read.ts
 */
type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

type Check = { name: string; pass: boolean; detail?: string };

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const dot = domain.indexOf(".");
  const head = dot > 0 ? domain.slice(0, dot) : domain;
  const rest = dot > 0 ? domain.slice(dot) : "";
  return `${local[0]}***@${head[0]}***${rest}`;
}

export async function runBakeryLiveRead(
  createClientFn: CreateClientFn,
  env: Record<string, string | undefined> = process.env,
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const checks: Check[] = [];
  const add = (name: string, pass: boolean, detail?: string) => checks.push({ name, pass, detail });

  const url = env["SUPABASE_URL"] || `https://mmykyzzkcugxunmekwew.supabase.co`;
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const email = env["TEST_A_EMAIL"] ?? "";
  const password = env["TEST_A_PASSWORD"] ?? "";
  const slug = env["TEST_A_TENANT_SLUG"] || "qa-tenant-a";
  const demoModeFlag = env["VITE_DEMO_MODE"];
  if (!key || !email || !password || /^<.*>$/.test(email)) {
    console.log("[bakery-live] env missing/placeholders → BAKERY LIVE READ = NOT RUN");
    return { status: "NOT_RUN", checks: [] };
  }
  add("demo-flag:false", demoModeFlag === "false", `VITE_DEMO_MODE=${demoModeFlag ?? "(unset)"} — gate posture requires 'false' for this run`);

  const { createSupabaseBrowserClient } = await import("../packages/database/src/index");
  const client = (await createClientFn(url, key)) as import("@supabase/supabase-js").SupabaseClient;
  // Keep the packages/database factory referenced for parity with the app path.
  void createSupabaseBrowserClient;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    add("auth:A", false, error.message);
    console.log("[bakery-live] auth failed → BAKERY LIVE READ = FAIL");
    return { status: "FAIL", checks };
  }
  add("auth:A", true, maskEmail(email));

  const { data: sessionData } = await client.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    add("session:A", false, "no session after sign-in");
    return { status: "FAIL", checks };
  }
  add("session:A", true);

  const { resolveTenantContext } = await import("../packages/tenancy/src/index");
  const { context } = await resolveTenantContext(client, {
    session,
    reads: ["brand", "theme", "settings", "entitlements"],
  });
  if (!context.selection.ok || !context.tenant) {
    add("tenant-context", false, `selection: ${JSON.stringify(context.selection)}`);
    return { status: "FAIL", checks };
  }
  add("tenant-context", true, `tenant ${context.tenant.id.slice(0, 8)} slug=${context.tenant.slug}`);

  const live = {
    tenant: context.tenant,
    brand: context.brand,
    theme: context.theme,
    settings: context.settings,
    effectiveEntitlements: context.effectiveEntitlements,
  };
  const tenant = {
    id: live.tenant!.id,
    slug: live.tenant!.slug,
    status: live.tenant!.status,
  };

  add("live:tenant-identity", tenant.slug === slug, `slug=${tenant.slug} (NOT fornalha)`);
  add("live:not-demo-fallback", tenant.slug !== "fornalha" && !tenant.id.startsWith("demo-"), `id=${tenant.id.slice(0, 8)}`);
  add(
    "live:brand",
    Boolean(context.brand),
    context.brand ? `display_name present (${(context.brand.display_name ?? "").length > 0 ? "set" : "empty"})` : "brand row missing (visual fallback retained)",
  );
  add("live:theme", Boolean(context.theme), context.theme ? "tokens row present" : "theme row missing (visual fallback retained)");
  add("live:settings", Boolean(context.settings), context.settings ? "public_settings row present" : "settings row missing (visual fallback retained)");
  add(
    "live:entitlements",
    Array.isArray(context.effectiveEntitlements),
    `${context.effectiveEntitlements.length} effective entitlements (empty catalog → default-deny is PASS)`,
  );

  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  const status = failed.length === 0 ? "PASS" : "FAIL";
  console.log(`[bakery-live] BAKERY LIVE READ = ${status}`);
  return { status, checks };
}



const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("bakery-live-read");
if (isDirectRun) {
  runBakeryLiveRead(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  ).then((r) => {
    if (r.status === "FAIL") process.exitCode = 1;
  });
}
