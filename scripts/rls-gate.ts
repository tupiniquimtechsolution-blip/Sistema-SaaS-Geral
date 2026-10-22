// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};

/**
 * QA RLS GATE — isolated Supabase QA only.
 *
 * Project: ynqbnimlpxlokrxlucdm
 *
 * Test identities:
 * - QA-A: Viewer of Tenant A.
 * - QA-B: Viewer of Tenant B.
 *
 * READ MATRIX:
 * - A can read A.
 * - A cannot read B.
 * - B can read B.
 * - B cannot read A.
 *
 * NEGATIVE WRITE MATRIX:
 * - Viewer cannot edit own tenant.
 * - Viewer cannot edit foreign tenant.
 * - User cannot create a foreign membership.
 * - Viewer cannot assign themselves Owner.
 * - Original Viewer role must remain unchanged.
 *
 * Safety:
 * - No service_role credentials.
 * - No production fallback.
 * - Explicit isolated-QA write authorization required.
 * - Unexpected writes or permissions fail the gate.
 * - No automatic cleanup of unauthorized changes.
 */


type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

type Check = { name: string; pass: boolean; detail?: string };

interface Identity {
  email: string;
  password: string;
  slug: string;
  tenantId?: string;
}

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

const READ_TABLES = [
  "tenants",
  "tenant_brands",
  "tenant_themes",
  "tenant_settings",
  "memberships",
  "subscriptions",
  "tenant_entitlements",
  "tenant_features",
] as const;

const CONDITIONAL_TABLES = ["contacts", "products", "bookings"] as const;

const QA_PROJECT_REF = "ynqbnimlpxlokrxlucdm";
const QA_URL = `https://${QA_PROJECT_REF}.supabase.co`;

function readEnv(): { url: string; key: string; a: Identity; b: Identity } | null {
  const env = typeof process !== "undefined" ? process.env : {};
  const url = (env["SUPABASE_URL"] ?? "").trim();

if (url !== QA_URL) {
  throw new Error(
    "RLS gate bloqueado: o projeto Supabase não é o QA autorizado"
  );
}
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const a: Identity = {
    email: env["TEST_A_EMAIL"] ?? "",
    password: env["TEST_A_PASSWORD"] ?? "",
    slug: env["TEST_A_TENANT_SLUG"] || "qa-isolation-tenant-a",
  };
  const b: Identity = {
    email: env["TEST_B_EMAIL"] ?? "",
    password: env["TEST_B_PASSWORD"] ?? "",
    slug: env["TEST_B_TENANT_SLUG"] || "qa-isolation-tenant-b",
  };
  if (!key || !a.email || !a.password || !b.email || !b.password) return null;
  if (/^<.*>$/.test(a.email) || /^<.*>$/.test(b.email)) return null;
  if (
  a.slug !== "qa-isolation-tenant-a" ||
  b.slug !== "qa-isolation-tenant-b"
) {
  throw new Error(
    "RLS gate bloqueado: identificadores QA dos tenants inválidos"
  );
}
  return { url, key, a, b };
}

async function signIn(
  createClientFn: CreateClientFn,
  url: string,
  key: string,
  who: Identity,
): Promise<import("@supabase/supabase-js").SupabaseClient | null> {
  const client = (await createClientFn(url, key)) as import("@supabase/supabase-js").SupabaseClient;
  const { error } = await client.auth.signInWithPassword({ email: who.email, password: who.password });
  if (error) {
    console.log(`[gate] auth FAILED for ${maskEmail(who.email)}: ${error.message}`);
    return null;
  }
  return client;
}

/** tenantId column name differs for the tenants table itself. */
function tenantColumn(table: string): string {
  return table === "tenants" ? "id" : "tenant_id";
}


async function countRows(
  client: import("@supabase/supabase-js").SupabaseClient,
  table: string,
  tenantId: string,
): Promise<{
  n: number;
  err?: string;
  code?: string;
}> {
  const { data, error } = await client
    .from(table)
    .select("*", { count: "exact", head: false })
    .eq(tenantColumn(table), tenantId)
    .limit(50);

  if (error) {
    return {
      n: -1,
      err: error.message,
      code: error.code,
    };
  }

  if (!Array.isArray(data)) {
    return {
      n: -1,
      err: "Resposta inesperada: dados ausentes",
      code: "UNEXPECTED_RESPONSE",
    };
  }

  return {
    n: data.length,
  };
}


export async function runRlsGate(
  createClientFn: CreateClientFn,
  injected?: { url: string; key: string; a: Identity; b: Identity },
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const env = injected ?? readEnv();
  if (!env) {
    console.log("[gate] required env missing/placeholders → RLS GATE = NOT RUN");
    return { status: "NOT_RUN", checks: [] };
  }
  const checks: Check[] = [];
  const add = (name: string, pass: boolean, detail?: string) => checks.push({ name, pass, detail });

  const clientA = await signIn(createClientFn, env.url, env.key, env.a);
  const clientB = await signIn(createClientFn, env.url, env.key, env.b);
  if (!clientA || !clientB) {
    console.log("[gate] auth failed → RLS GATE = FAIL (no silent skip)");
    return { status: "FAIL", checks };
  }
  add("auth:A", true);
  add("auth:B", true);

  // Resolve each identity's own tenant from its ACTIVE memberships (live RLS).
  for (const [who, client] of [
    [env.a, clientA],
    [env.b, clientB],
  ] as const) {
    const { data, error } = await client
      .from("memberships")
      .select("tenant_id, tenant:tenants!inner(id, slug)")
      .eq("status", "active");
    if (error) {
      add(`membership-lookup:${who.slug}`, false, error.message);
    } else {
      const rows = (data ?? []) as unknown as Array<{ tenant_id: string; tenant: { id: string; slug: string } }>;
      const own = rows.find((r) => r.tenant?.slug === who.slug);
      who.tenantId = own?.tenant_id;
      add(
        `membership-lookup:${who.slug}`,
        Boolean(own),
        own ? `tenant ${own.tenant_id.slice(0, 8)} via slug ${who.slug}` : "no active membership matching expected slug",
      );
    }
  }
  if (!env.a.tenantId || !env.b.tenantId) {
    console.log("[gate] tenant resolution failed → run scripts/provision-cross-tenant-qa.ts first");
    return { status: "FAIL", checks };
  }

  // ---- READ MATRIX ----
  for (const table of READ_TABLES) {
    const cases: Array<{ label: string; client: typeof clientA; target: Identity; cross: boolean }> = [
      { label: "A→A", client: clientA, target: env.a, cross: false },
      { label: "A→B", client: clientA, target: env.b, cross: true },
      { label: "B→B", client: clientB, target: env.b, cross: false },
      { label: "B→A", client: clientB, target: env.a, cross: true },
    ];
    for (const { label, client, target, cross } of cases) {
      
      const { n, err, code } =
        await countRows(
          client,
          table,
          target.tenantId!
        );

      if (!cross) {
        // Own tenant: query must succeed.
        add(
          `read:${table}:${label}`,
          err === undefined && n >= 0,
          err
            ? `Erro ${code ?? "desconhecido"}: ${err}`
            : `${n} rows`,
        );

      } else {
        // Foreign tenant: only empty result or RLS denial.
        const deniedByRls =
          err !== undefined && code === "42501";

        const emptyWithoutError =
          err === undefined && n === 0;

        add(
          `read:${table}:${label}`,
          deniedByRls || emptyWithoutError,
          err
            ? `Erro ${code ?? "desconhecido"}: ${err}`
            : `${n} rows (must be 0)`,
        );
      }

    }
  }

  // ---- CONDITIONAL TABLES (contacts, products, bookings) ----
  for (const table of CONDITIONAL_TABLES) {
    // own read: allow (0 rows is fine for an empty vertical; only RLS error fails)
    for (const [label, client, own] of [
      ["A→A", clientA, env.a],
      ["B→B", clientB, env.b],
    ] as const) {
      const { err } = await countRows(client, table, own.tenantId!);
      add(`read:${table}:${label}`, !err, err ? `unexpected error: ${err}` : "readable (own)");
    }
    for (const [label, client, foreign] of [
      ["A→B", clientA, env.b],
      ["B→A", clientB, env.a],
    ] as const) {
     
      const { n, err, code } =
        await countRows(
          client,
          table,
          foreign.tenantId!
        );

      const deniedByRls =
        err !== undefined && code === "42501";

      const emptyWithoutError =
        err === undefined && n === 0;

      add(
        `read:${table}:${label}`,
        deniedByRls || emptyWithoutError,
        err
          ? `Erro ${code ?? "desconhecido"}: ${err}`
          : `${n} rows (must be 0)`,
      );

    }
  }

  // ---- MEMBERSHIP ISOLATION ----
  {
    const { count: countA, error: errA } = await clientA
      .from("memberships")
      .select("*", { count: "exact", head: true });
    const { count: countB, error: errB } = await clientB
      .from("memberships")
      .select("*", { count: "exact", head: true });
    // Each identity must see exactly the memberships of tenants it belongs to.
    // We don't know global totals here (that's the point of RLS), but each must
    // see >= 1 and, critically, querying the OTHER's tenant must return 0 —
    // covered by the read matrix above. Here we assert visibility works.
    add("membership:A-visible", !errA && (countA ?? 0) >= 1, errA ? errA.message : `${countA} memberships visible`);
    add("membership:B-visible", !errB && (countB ?? 0) >= 1, errB ? errB.message : `${countB} memberships visible`);
  }

  // ---- ENTITLEMENT ISOLATION ----
  {
    // Explicit tenant filter from the OTHER tenant must yield empty (or RLS error).
    const aOnB = await clientA.from("tenant_entitlements").select("*").eq("tenant_id", env.b.tenantId!);
    const bOnA = await clientB.from("tenant_entitlements").select("*").eq("tenant_id", env.a.tenantId!);
    
    add(
      "entitlement:A→B",
      aOnB.error
        ? aOnB.error.code === "42501"
        : Array.isArray(aOnB.data) &&
          aOnB.data.length === 0,
      aOnB.error
        ? `Erro ${aOnB.error.code}: ${aOnB.error.message}`
        : `${aOnB.data?.length ?? "desconhecido"} rows (must be 0)`,
    );

    add(
      "entitlement:B→A",
      bOnA.error
        ? bOnA.error.code === "42501"
        : Array.isArray(bOnA.data) &&
          bOnA.data.length === 0,
      bOnA.error
        ? `Erro ${bOnA.error.code}: ${bOnA.error.message}`
        : `${bOnA.data?.length ?? "desconhecido"} rows (must be 0)`,
    );

  }

  
  // ---- VIEWER NEGATIVE WRITE MATRIX (QA ONLY) ----

  // Fail closed if any previous read or identity test failed.
  if (checks.some((check) => !check.pass)) {
    throw new Error(
      "QA RLS gate bloqueado: verificacoes de leitura falharam"
    );
  }

  // Explicit QA project, tenant and write authorization checks.
  if (
    env.url !== QA_URL ||
    env.a.slug !== "qa-isolation-tenant-a" ||
    env.b.slug !== "qa-isolation-tenant-b" ||
    env.a.tenantId !==
      "f92215f9-da30-4453-9190-aece00984284" ||
    env.b.tenantId !==
      "a8494bfa-ac05-478c-b06f-3031e0d2cb8c" ||
    process.env.QA_TEST_MODE !== "write" ||
    process.env.QA_WRITES_CONFIRM !==
      "AUTHORIZE_ISOLATED_QA_WRITES"
  ) {
    throw new Error(
      "Matriz de escrita bloqueada: QA ou autorizacao invalida"
    );
  }

  const viewerRoleId =
    "2d48dba2-746e-45ab-ba0b-5748d7f3cf92";

  const ownerRoleId =
    "781dd7cf-17ae-4e24-9721-285ff029a620";

  const actors = [
    {
      label: "A",
      client: clientA,
      userId:
        "90be8f98-2002-493d-8bb4-bf0b35b7f48e",
      membershipId:
        "a863adec-508e-4c14-9553-59f1ed4790d1",
      ownTenantId: env.a.tenantId!,
      foreignTenantId: env.b.tenantId!,
      ownName: "QA Isolation Tenant A",
      foreignName: "QA Isolation Tenant B",
    },
    {
      label: "B",
      client: clientB,
      userId:
        "7560c592-331f-4992-a925-f095c76858f4",
      membershipId:
        "705c127e-851d-4e0d-990a-272039ae5a03",
      ownTenantId: env.b.tenantId!,
      foreignTenantId: env.a.tenantId!,
      ownName: "QA Isolation Tenant B",
      foreignName: "QA Isolation Tenant A",
    },
  ] as const;

  // A denied operation must be explicitly verified.
  const checkBlocked = (
    name: string,
    blocked: boolean,
    detail: string,
  ) => {
    add(name, blocked, detail);

    if (!blocked) {
      throw new Error(
        `${name}: negacao de acesso nao comprovada`
      );
    }
  };

  // --------------------------------------------------
  // STEP 1: Verify real identities and memberships.
  // --------------------------------------------------

  for (const actor of actors) {
    const { data: auth, error: authError } =
      await actor.client.auth.getUser();

    if (
      authError ||
      auth.user?.id !== actor.userId
    ) {
      throw new Error(
        `${actor.label}: identidade QA invalida`
      );
    }

    // Confirm the own tenant exists and is unchanged.
    const { data: ownTenant, error: tenantError } =
      await actor.client
        .from("tenants")
        .select("id,name")
        .eq("id", actor.ownTenantId)
        .single();

    if (
      tenantError ||
      ownTenant?.id !== actor.ownTenantId ||
      ownTenant?.name !== actor.ownName
    ) {
      throw new Error(
        `${actor.label}: tenant QA nao confirmado`
      );
    }

    // Confirm exactly the expected active membership.
    const { data: membership, error: memberError } =
      await actor.client
        .from("memberships")
        .select("id,user_id,tenant_id,status")
        .eq("id", actor.membershipId)
        .single();

    if (
      memberError ||
      membership?.user_id !== actor.userId ||
      membership?.tenant_id !== actor.ownTenantId ||
      membership?.status !== "active"
    ) {
      throw new Error(
        `${actor.label}: membership QA inesperada`
      );
    }

    // Confirm the user holds only the Viewer role.
    const { data: roles, error: rolesError } =
      await actor.client
        .from("membership_roles")
        .select("role_id")
        .eq("membership_id", actor.membershipId);

    if (
      rolesError ||
      roles?.length !== 1 ||
      roles[0]?.role_id !== viewerRoleId
    ) {
      throw new Error(
        `${actor.label}: usuario nao e exclusivamente Viewer`
      );
    }
  }

  // --------------------------------------------------
  // STEP 2: Execute negative authorization tests.
  // --------------------------------------------------

  for (const actor of actors) {

    // TEST 1: Viewer cannot update own tenant.
    const ownUpdate = await actor.client
      .from("tenants")
      .update({ name: actor.ownName })
      .eq("id", actor.ownTenantId)
      .select("id");

    checkBlocked(
      `write:${actor.label}:update-own`,
      ownUpdate.error?.code === "42501" ||
        (
          !ownUpdate.error &&
          Array.isArray(ownUpdate.data) &&
          ownUpdate.data.length === 0
        ),
      ownUpdate.error?.code ?? "0 linhas esperadas",
    );

    // TEST 2: Viewer cannot update another tenant.
    const foreignUpdate = await actor.client
      .from("tenants")
      .update({ name: actor.foreignName })
      .eq("id", actor.foreignTenantId)
      .select("id");

    checkBlocked(
      `write:${actor.label}:update-foreign`,
      foreignUpdate.error?.code === "42501" ||
        (
          !foreignUpdate.error &&
          Array.isArray(foreignUpdate.data) &&
          foreignUpdate.data.length === 0
        ),
      foreignUpdate.error?.code ?? "0 linhas esperadas",
    );

    // TEST 3: User cannot join a foreign tenant.
    const crossMembership = await actor.client
      .from("memberships")
      .insert({
        tenant_id: actor.foreignTenantId,
        user_id: actor.userId,
        status: "active",
      })
      .select("id");

    checkBlocked(
      `write:${actor.label}:cross-membership`,
      crossMembership.error?.code === "42501",
      crossMembership.error?.code ??
        "INSERCAO INESPERADA",
    );

    // TEST 4: Viewer cannot assign themselves Owner.
    const ownerAttempt = await actor.client
      .from("membership_roles")
      .insert({
        membership_id: actor.membershipId,
        role_id: ownerRoleId,
      })
      .select("role_id");

    checkBlocked(
      `write:${actor.label}:owner-escalation`,
      ownerAttempt.error?.code === "42501",
      ownerAttempt.error?.code ??
        "INSERCAO INESPERADA",
    );

    // TEST 5: Viewer must remain the only role.
    const { data: finalRoles, error: finalError } =
      await actor.client
        .from("membership_roles")
        .select("role_id")
        .eq("membership_id", actor.membershipId);

    checkBlocked(
      `write:${actor.label}:viewer-preserved`,
      !finalError &&
        finalRoles?.length === 1 &&
        finalRoles[0]?.role_id === viewerRoleId,
      finalError?.code ??
        "Verificacao final do papel Viewer",
    );
  }


  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  console.log(`[gate] RLS GATE = ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length - failed.length}/${checks.length})`);
  return { status: failed.length === 0 ? "PASS" : "FAIL", checks };
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("rls-gate");
if (isDirectRun) {
  runRlsGate(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  ).then((r) => {
    if (r.status !== "PASS") {
      process.exitCode = 1;
    }
  }).catch((error) => {
    console.error(
      `[gate] Execução bloqueada: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exitCode = 1;
  });
}
