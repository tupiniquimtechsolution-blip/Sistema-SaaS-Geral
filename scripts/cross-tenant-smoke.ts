// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * CROSS-TENANT SMOKE HARNESS (foundation).
 *
 * Read-only harness prepared to prove tenant isolation against the LIVE
 * canonical Supabase project once two controlled identities (A and B) exist.
 *
 * REQUIRED ENV (never commit real values):
 *   SUPABASE_URL               project URL (https://<ref>.supabase.co)
 *   SUPABASE_PUBLISHABLE_KEY   publishable/anon key (NEVER service_role)
 *   TEST_A_EMAIL / TEST_A_PASSWORD   controlled identity A
 *   TEST_B_EMAIL / TEST_B_PASSWORD   controlled identity B
 *   (optional) TEST_A_TENANT_ID / TEST_B_TENANT_ID to pin tenant selection
 *
 * EXECUTION POLICY
 * - Identities A/B are created in a SEPARATE controlled step (never by this
 *   harness, never by hand in auth.users). Until they exist: TEST = NOT RUN.
 * - This script performs READS ONLY. No insert/update/delete, no storage
 *   writes, no auth mutations. RLS must be the enforcement authority.
 * - Expected result matrix: A reads A → allow; A reads B → deny/empty;
 *   B reads B → allow; B reads A → deny/empty.
 *
 * Run with:  bun scripts/cross-tenant-smoke.ts   (or tsx)
 */

interface SmokeEnv {
  url: string;
  publishableKey: string;
  a: { email: string; password: string; tenantId?: string };
  b: { email: string; password: string; tenantId?: string };
}

function readEnv(): SmokeEnv | null {
  const env = typeof process !== "undefined" ? process.env : {};
  const url = env["SUPABASE_URL"] ?? "";
  const publishableKey = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const aEmail = env["TEST_A_EMAIL"] ?? "";
  const aPassword = env["TEST_A_PASSWORD"] ?? "";
  const bEmail = env["TEST_B_EMAIL"] ?? "";
  const bPassword = env["TEST_B_PASSWORD"] ?? "";
  if (!url || !publishableKey || !aEmail || !aPassword || !bEmail || !bPassword) {
    return null;
  }
  return {
    url,
    publishableKey,
    a: { email: aEmail, password: aPassword, tenantId: env["TEST_A_TENANT_ID"] },
    b: { email: bEmail, password: bPassword, tenantId: env["TEST_B_TENANT_ID"] },
  };
}

type Check = { name: string; pass: boolean; detail?: string };

async function signInReads(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  env: { url: string; publishableKey: string },
  who: { email: string; password: string; tenantId?: string },
): Promise<{ checks: Check[]; tenantIds: string[] }> {
  const checks: Check[] = [];
  const client = createClientFn(env.url, env.publishableKey);
  const { error } = await client.auth.signInWithPassword({
    email: who.email,
    password: who.password,
  });
  if (error) {
    checks.push({ name: `auth:${who.email}`, pass: false, detail: error.message });
    return { checks, tenantIds: [] };
  }
  checks.push({ name: `auth:${who.email}`, pass: true });

  const { data: memberships, error: mErr } = await client
    .from("memberships")
    .select("tenant_id, status, tenant:tenants!inner(id, slug, status)")
    .eq("status", "active");
  if (mErr) {
    checks.push({ name: `memberships:${who.email}`, pass: false, detail: mErr.message });
    return { checks, tenantIds: [] };
  }
  const tenantIds = ((memberships ?? []) as Array<{ tenant_id: string }>).map((m) => m.tenant_id);
  checks.push({ name: `memberships:${who.email}`, pass: tenantIds.length > 0, detail: `${tenantIds.length} active` });

  // Brand/theme/settings reads for each own tenant (RLS-allowed)
  for (const tenantId of tenantIds) {
    const { error: brandErr } = await client
      .from("tenant_brands")
      .select("tenant_id")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    checks.push({ name: `own-brand:${tenantId.slice(0, 8)}`, pass: !brandErr, detail: brandErr?.message });
  }
  return { checks, tenantIds };
}

/** A reader must see ZERO rows of a tenant it has no membership in. */
async function crossTenantProbe(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  env: { url: string; publishableKey: string },
  who: { email: string; password: string },
  foreignTenantId: string,
): Promise<Check> {
  const client = createClientFn(env.url, env.publishableKey);
  const { error } = await client.auth.signInWithPassword({
    email: who.email,
    password: who.password,
  });
  if (error) {
    return { name: `cross:${who.email}→${foreignTenantId.slice(0, 8)}`, pass: false, detail: `auth: ${error.message}` };
  }
  const tables = ["tenants", "tenant_brands", "tenant_settings", "tenant_entitlements"] as const;
  for (const table of tables) {
    const { data, error: rErr } = await client
      .from(table)
      .select("*")
      .eq(table === "tenants" ? "id" : "tenant_id", foreignTenantId);
    if (rErr) {
      // A policy error is also a valid denial signal for this probe.
      continue;
    }
    if ((data ?? []).length > 0) {
      return {
        name: `cross:${who.email}→${foreignTenantId.slice(0, 8)}`,
        pass: false,
        detail: `LEAK: ${data?.length} row(s) visible in ${table}`,
      };
    }
  }
  return { name: `cross:${who.email}→${foreignTenantId.slice(0, 8)}`, pass: true };
}

export async function runCrossTenantSmoke(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  injected?: SmokeEnv,
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const env = injected ?? readEnv();
  if (!env) {
    console.log("[cross-tenant-smoke] required env missing → TEST = NOT RUN");
    return { status: "NOT_RUN", checks: [] };
  }

  const checks: Check[] = [];
  const a = await signInReads(createClientFn, env, env.a);
  const b = await signInReads(createClientFn, env, env.b);
  checks.push(...a.checks, ...b.checks);

  const [aTenant, bTenant] = [env.a.tenantId ?? a.tenantIds[0], env.b.tenantId ?? b.tenantIds[0]];
  if (aTenant && aTenant !== bTenant) {
    checks.push(await crossTenantProbe(createClientFn, env, env.a, bTenant));
    checks.push(await crossTenantProbe(createClientFn, env, env.b, aTenant));
  } else {
    checks.push({
      name: "cross-probes",
      pass: false,
      detail: "A/B tenants unavailable or identical — provision distinct controlled identities",
    });
  }

  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) {
    console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  return { status: failed.length === 0 ? "PASS" : "FAIL", checks };
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("cross-tenant-smoke");
if (isDirectRun) {
  runCrossTenantSmoke(
    // lazy import keeps the module loadable without credentials
    (...args) => import("@supabase/supabase-js").then((m) => m.createClient(...args)) as never,
  ).then((r) => {
    console.log(`[cross-tenant-smoke] status: ${r.status}`);
    if (r.status === "FAIL") process.exitCode = 1;
  });
}
