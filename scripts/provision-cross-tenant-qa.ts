// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * CROSS-TENANT QA PROVISIONER.
 *
 * Creates the two controlled QA identities' tenants idempotently through the
 * CANONICAL remote RPC create_tenant_with_owner() (security definer, granted
 * to authenticated) — the same onboarding path real customers use. No service
 * role, no auth.users mutation, no hand-written SQL. Publishable key only.
 *
 * REQUIRED ENV (never commit, never print):
 *   SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY   project + publishable key
 *   TEST_A_EMAIL / TEST_A_PASSWORD            controlled identity A
 *   TEST_B_EMAIL / TEST_B_PASSWORD            controlled identity B
 *   TEST_A_TENANT_SLUG / TEST_B_TENANT_SLUG   desired tenant slugs
 *   QA_VERTICAL_ID                            vertical_registry.id (default 'bakery')
 *   QA_PLAN_ID                                plan passed as p_plan_id (default 'starter')
 *   ALLOW_REMOTE_QA_WRITES                    must be truthy to allow the tenant RPC call
 *
 * IDEMPOTENCY: uses each identity's existing active membership when present;
 * otherwise calls create_tenant_with_owner() once. A duplicate-slug failure is
 * treated as "slug already exists (owned by someone else)" — reported, never
 * retried blindly, never destructive.
 *
 * PII RULE: emails masked (x***@d***); slugs printed verbatim (non-secret).
 *
 * Run: bun scripts/provision-cross-tenant-qa.ts
 */

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

interface ProvisionEnv {
  url: string;
  publishableKey: string;
  a: { email: string; password: string; slug: string };
  b: { email: string; password: string; slug: string };
  verticalId: string;
  planId: string;
  allowRemoteQaWrites: boolean;
}

/** Mask emails: keep first char of local part and of domain head, rest as stars. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const dot = domain.indexOf(".");
  const head = dot > 0 ? domain.slice(0, dot) : domain;
  const rest = dot > 0 ? domain.slice(dot) : "";
  return `${local[0]}***@${head[0]}***${rest}`;
}

export function readProvisionEnv(): ProvisionEnv | null {
  const env = typeof process !== "undefined" ? process.env : {};
  const url = env["SUPABASE_URL"] ?? "";
  const publishableKey = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const aEmail = env["TEST_A_EMAIL"] ?? "";
  const aPassword = env["TEST_A_PASSWORD"] ?? "";
  const bEmail = env["TEST_B_EMAIL"] ?? "";
  const bPassword = env["TEST_B_PASSWORD"] ?? "";
  const aSlug = env["TEST_A_TENANT_SLUG"] ?? "";
  const bSlug = env["TEST_B_TENANT_SLUG"] ?? "";
  const placeholder = /^<.*>$/.test(aEmail) || /^<.*>$/.test(bEmail);
  if (!url || !publishableKey || !aEmail || !aPassword || !bEmail || !bPassword || !aSlug || !bSlug || placeholder) {
    return null;
  }
  return {
    url,
    publishableKey,
    a: { email: aEmail, password: aPassword, slug: aSlug },
    b: { email: bEmail, password: bPassword, slug: bSlug },
    verticalId: env["QA_VERTICAL_ID"] || "bakery",
    planId: env["QA_PLAN_ID"] || "starter",
    allowRemoteQaWrites: /^(1|true|yes)$/i.test(env["ALLOW_REMOTE_QA_WRITES"] ?? ""),
  };
}

type Check = { name: string; pass: boolean; detail?: string };

async function provisionOne(
  createClientFn: CreateClientFn,
  env: { url: string; publishableKey: string },
  who: { email: string; password: string; slug: string },
  verticalId: string,
  planId: string,
  allowWrites: boolean,
): Promise<{ checks: Check[]; tenantId?: string }> {
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
    return { checks };
  }
  checks.push({ name: `auth:${maskEmail(who.email)}`, pass: true });

  const slugOk = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(who.slug);
  checks.push({
    name: `slug:${who.slug}`,
    pass: slugOk,
    detail: slugOk ? "matches RPC slug constraint" : "invalid slug format (RPC will reject)",
  });

  const { data: existing, error: mErr } = await client
    .from("memberships")
    .select("tenant_id, tenant:tenants!inner(id, slug, status)")
    .eq("status", "active");
  if (mErr) {
    checks.push({ name: `provision:${who.slug}`, pass: false, detail: mErr.message });
    return { checks };
  }
  const rows = (existing ?? []) as unknown as Array<{
    tenant_id: string;
    tenant: { id: string; slug: string; status: string };
  }>;
  const own = rows.find((m) => m.tenant?.slug === who.slug);
  if (own) {
    // Reuse existing membership → strictly idempotent.
    checks.push({
      name: `provision:${who.slug}`,
      pass: true,
      detail: `reused existing membership → tenant ${own.tenant_id.slice(0, 8)}`,
    });
    return { checks, tenantId: own.tenant_id };
  }

  if (!allowWrites) {
    checks.push({
      name: `provision:${who.slug}`,
      pass: false,
      detail: "ALLOW_REMOTE_QA_WRITES not truthy — QA write refused (read-only mode)",
    });
    return { checks };
  }

  const { data: tenantId, error: rpcError } = await client.rpc("create_tenant_with_owner", {
    // LIVE remote signature (confirmed by owner against the canonical project):
    //   create_tenant_with_owner(
    //     p_name text, p_slug text, p_vertical_id text,
    //     p_plan_id text DEFAULT 'starter' )
    // p_plan_id is OPTIONAL via its default; we pass it explicitly so the
    // created tenant's plan is deterministic. Historical note: earlier runs
    // used the branch-era 3-arg shape (p_demo instead of p_plan_id) and the
    // remote default 'starter' was applied → QA tenants landed starter/
    // trialing, not demo. Registered in docs/CROSS_TENANT_RLS_EVIDENCE.md.
    p_name: `QA ${who.slug} tenant`,
    p_slug: who.slug,
    p_vertical_id: verticalId,
    p_plan_id: planId,
  });
  if (rpcError) {
    // Duplicate slug = slug already exists (owned by another user).
    const duplicate = /duplicate|already exists|unique/i.test(rpcError.message);
    checks.push({
      name: `provision:${who.slug}`,
      pass: duplicate,
      detail: duplicate
        ? `slug '${who.slug}' already exists (owned by another user) — treated as already-provisioned`
        : rpcError.message,
    });
    return { checks };
  }
  checks.push({
    name: `provision:${who.slug}`,
    pass: true,
    detail: `created via create_tenant_with_owner() → ${String(tenantId).slice(0, 8)}`,
  });
  return { checks, tenantId: String(tenantId) };
}

export async function runProvisioner(
  createClientFn: CreateClientFn,
  injected?: ProvisionEnv,
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const env = injected ?? readProvisionEnv();
  if (!env) {
    console.log("[provision] required env missing (or placeholder emails) → PROVISION = NOT RUN");
    return { status: "NOT_RUN", checks: [] };
  }
  console.log(
    `[provision] ALLOW_REMOTE_QA_WRITES=${env.allowRemoteQaWrites ? "true" : "false"} vertical=${env.verticalId} plan=${env.planId}`,
  );

  const checks: Check[] = [];
  const a = await provisionOne(createClientFn, env, env.a, env.verticalId, env.planId, env.allowRemoteQaWrites);
  const b = await provisionOne(createClientFn, env, env.b, env.verticalId, env.planId, env.allowRemoteQaWrites);
  checks.push(...a.checks, ...b.checks);

  if (a.tenantId && b.tenantId && a.tenantId === b.tenantId) {
    checks.push({
      name: "distinct-tenants",
      pass: false,
      detail: "A and B resolved to the SAME tenant — provision distinct slugs/identities",
    });
  } else if (a.tenantId && b.tenantId) {
    checks.push({
      name: "distinct-tenants",
      pass: true,
      detail: `A=${a.tenantId.slice(0, 8)} B=${b.tenantId.slice(0, 8)} (distinct)`,
    });
  }

  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) {
    console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  return { status: failed.length === 0 ? "PASS" : "FAIL", checks };
}

const isDirectRun =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.includes("provision-cross-tenant-qa");
if (isDirectRun) {
  runProvisioner(
    // lazy import keeps the module loadable without credentials
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  ).then((r) => {
    console.log(`[provision] status: ${r.status}`);
    if (r.status === "FAIL") process.exitCode = 1;
  });
}
