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
 *   (optional) TEST_A_TENANT_ID / TEST_B_TENANT_ID     pin tenant by UUID
 *   (optional) TEST_A_TENANT_SLUG / TEST_B_TENANT_SLUG pin tenant by slug
 *
 *   A pinned tenant (ID or slug) MUST be among that identity's ACTIVE
 *   memberships (membership-scoped selection, same rule as
 *   packages/tenancy). A pin that matches nothing FAILS the run — it is
 *   never silently dropped nor treated as a foreign tenant.
 *
 *   QA_VERTICAL_ID / QA_PLAN_ID / ALLOW_REMOTE_QA_WRITES are reserved for a
 *   separate controlled QA-write phase. This harness performs READS ONLY and
 *   ignores ALLOW_REMOTE_QA_WRITES entirely.
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
  a: { email: string; password: string; tenantId?: string; tenantSlug?: string };
  b: { email: string; password: string; tenantId?: string; tenantSlug?: string };
}

function readEnv(): SmokeEnv | null {
  const env = typeof process !== "undefined" ? process.env : {};
  const url = env["SUPABASE_URL"] ?? "";
  const publishableKey = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const aEmail = env["TEST_A_EMAIL"] ?? "";
  const aPassword = env["TEST_A_PASSWORD"] ?? "";
  const bEmail = env["TEST_B_EMAIL"] ?? "";
  const bPassword = env["TEST_B_PASSWORD"] ?? "";
  // Literal "<...>" placeholders mean identities were never provisioned —
  // fail closed as NOT RUN instead of attempting auth with junk values.
  const placeholder = /^<.*>$/.test(aEmail) || /^<.*>$/.test(bEmail);
  if (!url || !publishableKey || !aEmail || !aPassword || !bEmail || !bPassword || placeholder) {
    return null;
  }
  return {
    url,
    publishableKey,
    a: {
      email: aEmail,
      password: aPassword,
      tenantId: env["TEST_A_TENANT_ID"],
      tenantSlug: env["TEST_A_TENANT_SLUG"],
    },
    b: {
      email: bEmail,
      password: bPassword,
      tenantId: env["TEST_B_TENANT_ID"],
      tenantSlug: env["TEST_B_TENANT_SLUG"],
    },
  };
}

type Check = { name: string; pass: boolean; detail?: string };

/** PII rule: emails are masked in every printed check name/detail. */
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

async function signInReads(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  env: { url: string; publishableKey: string },
  who: { email: string; password: string },
): Promise<{ checks: Check[]; memberships: Array<{ tenantId: string; slug: string }> }> {
  const checks: Check[] = [];
  // createClientFn may be sync (real createClient) or async (lazy-import
  // wrapper in the direct-run block) — normalize with await.
  const client = (await createClientFn(env.url, env.publishableKey)) as import("@supabase/supabase-js").SupabaseClient;
  const { error } = await client.auth.signInWithPassword({
    email: who.email,
    password: who.password,
  });
  if (error) {
    checks.push({ name: `auth:${maskEmail(who.email)}`, pass: false, detail: error.message });
    return { checks, memberships: [] };
  }
  checks.push({ name: `auth:${maskEmail(who.email)}`, pass: true });

  const { data: memberships, error: mErr } = await client
    .from("memberships")
    .select("tenant_id, status, tenant:tenants!inner(id, slug, status)")
    .eq("status", "active");
  if (mErr) {
    checks.push({ name: `memberships:${maskEmail(who.email)}`, pass: false, detail: mErr.message });
    return { checks, memberships: [] };
  }
  const rows = (memberships ?? []) as unknown as Array<{
    tenant_id: string;
    tenant: { id: string; slug: string; status: string };
  }>;
  const membershipsOut = rows
    .filter((m) => m.tenant && typeof m.tenant.slug === "string")
    .map((m) => ({ tenantId: m.tenant_id, slug: m.tenant.slug }));
  checks.push({
    name: `memberships:${maskEmail(who.email)}`,
    pass: membershipsOut.length > 0,
    detail: `${membershipsOut.length} active`,
  });

  // Brand/theme/settings reads for each own tenant (RLS-allowed)
  for (const { tenantId } of membershipsOut) {
    const { error: brandErr } = await client
      .from("tenant_brands")
      .select("tenant_id")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    checks.push({ name: `own-brand:${tenantId.slice(0, 8)}`, pass: !brandErr, detail: brandErr?.message });
  }
  return { checks, memberships: membershipsOut };
}

/**
 * Membership-scoped tenant selection (same platform rule as packages/tenancy):
 * a pinned tenant (UUID or slug) must be among the identity's active
 * memberships. An unmatched pin returns undefined so the run FAILS instead of
 * silently selecting (or leaking against) the wrong tenant.
 */
function resolvePinnedTenant(
  memberships: Array<{ tenantId: string; slug: string }>,
  pin: { tenantId?: string; tenantSlug?: string },
): string | undefined {
  if (pin.tenantId) {
    return memberships.some((m) => m.tenantId === pin.tenantId) ? pin.tenantId : undefined;
  }
  if (pin.tenantSlug) {
    return memberships.find((m) => m.slug === pin.tenantSlug)?.tenantId;
  }
  return memberships[0]?.tenantId;
}

/** A reader must see ZERO rows of a tenant it has no membership in. */
async function crossTenantProbe(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  env: { url: string; publishableKey: string },
  who: { email: string; password: string },
  foreignTenantId: string,
): Promise<Check> {
  const client = (await createClientFn(env.url, env.publishableKey)) as import("@supabase/supabase-js").SupabaseClient;
  const { error } = await client.auth.signInWithPassword({
    email: who.email,
    password: who.password,
  });
  if (error) {
    return { name: `cross:${maskEmail(who.email)}→${foreignTenantId.slice(0, 8)}`, pass: false, detail: `auth: ${error.message}` };
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
        name: `cross:${maskEmail(who.email)}→${foreignTenantId.slice(0, 8)}`,
        pass: false,
        detail: `LEAK: ${data?.length} row(s) visible in ${table}`,
      };
    }
  }
  return { name: `cross:${maskEmail(who.email)}→${foreignTenantId.slice(0, 8)}`, pass: true };
}

export async function runCrossTenantSmoke(
  createClientFn: typeof import("@supabase/supabase-js").createClient,
  injected?: SmokeEnv,
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const env = injected ?? readEnv();
  if (!env) {
    console.log(
      "[cross-tenant-smoke] required env missing or identity placeholders (<EMAIL_*> not provisioned) → TEST = NOT RUN",
    );
    return { status: "NOT_RUN", checks: [] };
  }

  if (typeof process !== "undefined" && process.env["ALLOW_REMOTE_QA_WRITES"]) {
    console.log("[cross-tenant-smoke] ALLOW_REMOTE_QA_WRITES is set but IGNORED: this harness performs READS ONLY.");
  }

  const checks: Check[] = [];
  const a = await signInReads(createClientFn, env, env.a);
  const b = await signInReads(createClientFn, env, env.b);
  checks.push(...a.checks, ...b.checks);

  const aTenant = resolvePinnedTenant(a.memberships, env.a);
  const bTenant = resolvePinnedTenant(b.memberships, env.b);
  if ((env.a.tenantId || env.a.tenantSlug) && !aTenant) {
    checks.push({
      name: "pin:A",
      pass: false,
      detail: "pinned tenant (ID/slug) not among identity A's active memberships — selection is membership-scoped",
    });
  }
  if ((env.b.tenantId || env.b.tenantSlug) && !bTenant) {
    checks.push({
      name: "pin:B",
      pass: false,
      detail: "pinned tenant (ID/slug) not among identity B's active memberships — selection is membership-scoped",
    });
  }
  if (aTenant && bTenant && aTenant !== bTenant) {
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
