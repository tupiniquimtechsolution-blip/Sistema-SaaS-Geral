// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * CROSS-TENANT STORAGE SMOKE — live storage isolation gate.
 *
 * Buckets: tenant-public (20 MiB, public=true) / tenant-private (50 MiB, private)
 * Path convention: <tenant-uuid>/<folder>/<file> (first segment = tenant UUID)
 *
 * NOTE on MIME: the live buckets' storage policies reject text/plain
 * ("mime type text/plain is not supported") — the platform restricts uploads
 * to media types. The harness therefore uses image/png payloads for object
 * creation and probes MIME rejection separately (a positive security control).
 *
 * Proves against the LIVE project (publishable key only, masked PII):
 *   PRIVATE: A upload own ALLOW; A upload B path DENY; B upload own ALLOW;
 *            B upload A path DENY; A read own ALLOW; A read B private DENY;
 *            B read own ALLOW; B read A private DENY; A update B DENY;
 *            B update A DENY; cross delete DENY both ways.
 *   PUBLIC:  A/B upload own ALLOW; authenticated own read; anonymous public
 *            read — EMPIRICAL (existence of a policy is not proof of behavior);
 *            cross-write DENY both ways.
 *
 * ZERO LEAK STANDARD: any private read leak, cross write, cross update or cross
 * delete = STORAGE ISOLATION FAIL + release blocker. No remote policy fixes here.
 * Public-read failure is availability, not isolation — reported separately.
 *
 * Cleanup: removes every QA object it created and verifies residual = 0.
 *
 * Run: bun scripts/cross-tenant-storage-smoke.ts
 */

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

type Check = { name: string; pass: boolean; detail?: string };

interface StorageEnv {
  url: string;
  key: string;
  a: { email: string; password: string; slug: string; tenantId?: string };
  b: { email: string; password: string; slug: string; tenantId?: string };
}

const PRIVATE_BUCKET = "tenant-private";
const PUBLIC_BUCKET = "tenant-public";
const QA_FOLDER = "qa";
const MIME = "image/png";

/** 1x1 transparent PNG (67 bytes) — a real image payload, not a text file. */
const PNG_BYTES = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
), (c) => c.charCodeAt(0));

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

function readEnv(): StorageEnv | null {
  const env = typeof process !== "undefined" ? process.env : {};
  const url = env["SUPABASE_URL"] || "https://mmykyzzkcugxunmekwew.supabase.co";
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const a = {
    email: env["TEST_A_EMAIL"] ?? "",
    password: env["TEST_A_PASSWORD"] ?? "",
    slug: env["TEST_A_TENANT_SLUG"] || "qa-tenant-a",
    tenantId: env["TEST_A_TENANT_ID"],
  };
  const b = {
    email: env["TEST_B_EMAIL"] ?? "",
    password: env["TEST_B_PASSWORD"] ?? "",
    slug: env["TEST_B_TENANT_SLUG"] || "qa-tenant-b",
    tenantId: env["TEST_B_TENANT_ID"],
  };
  if (!key || !a.email || !a.password || !b.email || !b.password) return null;
  if (/^<.*>$/.test(a.email) || /^<.*>$/.test(b.email)) return null;
  return { url, key, a, b };
}

async function signIn(
  createClientFn: CreateClientFn,
  env: StorageEnv,
  who: { email: string; password: string },
): Promise<import("@supabase/supabase-js").SupabaseClient | null> {
  const client = (await createClientFn(env.url, env.key)) as import("@supabase/supabase-js").SupabaseClient;
  const { error } = await client.auth.signInWithPassword({ email: who.email, password: who.password });
  return error ? null : client;
}

async function resolveTenant(
  client: import("@supabase/supabase-js").SupabaseClient,
  slug: string,
): Promise<{ tenantId: string; status?: string } | undefined> {
  const { data, error } = await client
    .from("memberships")
    .select("tenant_id, tenant:tenants!inner(id, slug, status)")
    .eq("status", "active");
  if (error) return undefined;
  const rows = (data ?? []) as unknown as Array<{
    tenant_id: string;
    tenant: { id: string; slug: string; status?: string };
  }>;
  const hit = rows.find((r) => r.tenant?.slug === slug);
  return hit ? { tenantId: hit.tenant_id, status: hit.tenant?.status } : undefined;
}

type Client = import("@supabase/supabase-js").SupabaseClient;

const objectPath = (tenantId: string, file: string) => `${tenantId}/${QA_FOLDER}/${file}`;

export async function runStorageSmoke(
  createClientFn: CreateClientFn,
  injected?: StorageEnv,
): Promise<{ status: "NOT_RUN" | "PASS" | "FAIL"; checks: Check[] }> {
  const env = injected ?? readEnv();
  if (!env) {
    console.log("[storage] required env missing/placeholders → STORAGE SMOKE = NOT RUN");
    return { status: "NOT_RUN", checks: [] };
  }
  const checks: Check[] = [];
  const add = (name: string, pass: boolean, detail?: string) => checks.push({ name, pass, detail });

  const clientA = await signIn(createClientFn, env, env.a);
  const clientB = await signIn(createClientFn, env, env.b);
  if (!clientA || !clientB) {
    console.log("[storage] auth failed → STORAGE SMOKE = FAIL");
    return { status: "FAIL", checks: [{ name: "auth", pass: false }] };
  }
  add("auth:A/B", true, `${maskEmail(env.a.email)} / ${maskEmail(env.b.email)}`);

  const [resA, resB] = [
    env.a.tenantId ? { tenantId: env.a.tenantId } : await resolveTenant(clientA, env.a.slug),
    env.b.tenantId ? { tenantId: env.b.tenantId } : await resolveTenant(clientB, env.b.slug),
  ];
  const tenantA = resA?.tenantId;
  const tenantB = resB?.tenantId;
  if (!tenantA || !tenantB || tenantA === tenantB) {
    add("tenant-resolution", false, `A=${tenantA?.slice(0, 8)} B=${tenantB?.slice(0, 8)}`);
    return { status: "FAIL", checks };
  }
  add("tenant-resolution", true, `A=${tenantA.slice(0, 8)} B=${tenantB.slice(0, 8)} (distinct)`);
  add(
    "tenant-status",
    true,
    `A=${resA.status ?? "unknown"} B=${resB.status ?? "unknown"} (live read — policy-finding context)`,
  );

  // Sanity: MIME restriction is itself a control — confirm text/plain is rejected.
  const mimeProbe = await clientA.storage
    .from(PRIVATE_BUCKET)
    .upload(objectPath(tenantA, "mime-probe.txt"), "x", { contentType: "text/plain", upsert: true });
  add(
    "mime:text/plain-rejected",
    Boolean(mimeProbe.error),
    mimeProbe.error ? `rejected: ${mimeProbe.error.message}` : "text/plain ACCEPTED — bucket has no MIME restriction",
  );

  // ---------------- PRIVATE: WRITE ----------------
  const aOwn = await clientA.storage.from(PRIVATE_BUCKET).upload(objectPath(tenantA, "storage-a.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("private:upload A own", !aOwn.error, aOwn.error?.message ?? "uploaded");

  const aToB = await clientA.storage.from(PRIVATE_BUCKET).upload(objectPath(tenantB, "storage-b.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("private:upload A→B", Boolean(aToB.error), aToB.error ? `denied: ${aToB.error.message}` : "LEAK: A wrote B's private path");

  const bOwn = await clientB.storage.from(PRIVATE_BUCKET).upload(objectPath(tenantB, "storage-b.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("private:upload B own", !bOwn.error, bOwn.error?.message ?? "uploaded");

  const bToA = await clientB.storage.from(PRIVATE_BUCKET).upload(objectPath(tenantA, "storage-a.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("private:upload B→A", Boolean(bToA.error), bToA.error ? `denied: ${bToA.error.message}` : "LEAK: B wrote A's private path");

  // ---------------- PRIVATE: READ ----------------
  const aOwnRead = await clientA.storage.from(PRIVATE_BUCKET).download(objectPath(tenantA, "storage-a.png"));
  add("private:read A own", !aOwnRead.error, aOwnRead.error?.message ?? "downloaded");

  const aReadB = await clientA.storage.from(PRIVATE_BUCKET).download(objectPath(tenantB, "storage-b.png"));
  add("private:read A→B", Boolean(aReadB.error), aReadB.error ? `denied: ${aReadB.error.message}` : "LEAK: A downloaded B's private object");

  const bOwnRead = await clientB.storage.from(PRIVATE_BUCKET).download(objectPath(tenantB, "storage-b.png"));
  add("private:read B own", !bOwnRead.error, bOwnRead.error?.message ?? "downloaded");

  const bReadA = await clientB.storage.from(PRIVATE_BUCKET).download(objectPath(tenantA, "storage-a.png"));
  add("private:read B→A", Boolean(bReadA.error), bReadA.error ? `denied: ${bReadA.error.message}` : "LEAK: B downloaded A's private object");

  // ---------------- PRIVATE: UPDATE (cross) ----------------
  const aUpdB = await clientA.storage.from(PRIVATE_BUCKET).update(objectPath(tenantB, "storage-b.png"), PNG_BYTES, { contentType: MIME });
  add("private:update A→B", Boolean(aUpdB.error), aUpdB.error ? `denied: ${aUpdB.error.message}` : "LEAK: A modified B's object");

  const bUpdA = await clientB.storage.from(PRIVATE_BUCKET).update(objectPath(tenantA, "storage-a.png"), PNG_BYTES, { contentType: MIME });
  add("private:update B→A", Boolean(bUpdA.error), bUpdA.error ? `denied: ${bUpdA.error.message}` : "LEAK: B modified A's object");

  // Cross delete BEFORE own-delete cleanup removes the targets.
  const aDelB = await clientA.storage.from(PRIVATE_BUCKET).remove([objectPath(tenantB, "storage-b.png")]);
  const aDelBLoud = (aDelB.data ?? []).some((m) => !("error" in m) || m.error === null) && !aDelB.error && (aDelB.data ?? []).length > 0 && !(aDelB.data as Array<{ name: string; error?: string | null }>)[0]?.error;
  add("private:delete A→B", !aDelBLoud, aDelBLoud ? "LEAK: A deleted B's object" : "denied (no object removed)");

  const bDelA = await clientB.storage.from(PRIVATE_BUCKET).remove([objectPath(tenantA, "storage-a.png")]);
  const bDelALoud = (bDelA.data ?? []).length > 0 && !(bDelA.data as Array<{ name: string; error?: string | null }>)[0]?.error;
  add("private:delete B→A", !bDelALoud, bDelALoud ? "LEAK: B deleted A's object" : "denied (no object removed)");

  // ---------------- PUBLIC ----------------
  const aPubUp = await clientA.storage.from(PUBLIC_BUCKET).upload(objectPath(tenantA, "public-a.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("public:upload A own (upsert)", !aPubUp.error, aPubUp.error?.message ?? "uploaded");

  const bPubUp = await clientB.storage.from(PUBLIC_BUCKET).upload(objectPath(tenantB, "public-b.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("public:upload B own (upsert)", !bPubUp.error, bPubUp.error?.message ?? "uploaded");

  const aPubToB = await clientA.storage.from(PUBLIC_BUCKET).upload(objectPath(tenantB, "public-b.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("public:upload A→B", Boolean(aPubToB.error), aPubToB.error ? `denied: ${aPubToB.error.message}` : "LEAK: A wrote B's public path");

  const bPubToA = await clientB.storage.from(PUBLIC_BUCKET).upload(objectPath(tenantA, "public-a.png"), PNG_BYTES, { contentType: MIME, upsert: true });
  add("public:upload B→A", Boolean(bPubToA.error), bPubToA.error ? `denied: ${bPubToA.error.message}` : "LEAK: B wrote A's public path");

  // ---- PUBLIC INSERT-ONLY ISOLATION (unique filename, upsert=false) ----
  // Isolates a pure INSERT from the upsert path: upsert may involve
  // SELECT/UPDATE internally, so a broken public SELECT policy can fail an
  // upsert even when the INSERT policy is correct. Unique timestamped files
  // guarantee no prior object exists (no upsert semantics possible).
  const runId = Date.now().toString(36);
  const aInsPath = objectPath(tenantA, `public-insert-only-${runId}.png`);
  const bInsPath = objectPath(tenantB, `public-insert-only-${runId}.png`);
  const aIns = await clientA.storage.from(PUBLIC_BUCKET).upload(aInsPath, PNG_BYTES, { contentType: MIME, upsert: false });
  add(
    "public:insert-only A own",
    !aIns.error,
    aIns.error ? `denied: ${aIns.error.message}` : `uploaded (${aInsPath.split("/").pop()})`,
  );
  const bIns = await clientB.storage.from(PUBLIC_BUCKET).upload(bInsPath, PNG_BYTES, { contentType: MIME, upsert: false });
  add(
    "public:insert-only B own",
    !bIns.error,
    bIns.error ? `denied: ${bIns.error.message}` : `uploaded (${bInsPath.split("/").pop()})`,
  );
  const aInsToB = await clientA.storage.from(PUBLIC_BUCKET).upload(bInsPath, PNG_BYTES, { contentType: MIME, upsert: false });
  add("public:insert-only A→B", Boolean(aInsToB.error), aInsToB.error ? `denied: ${aInsToB.error.message}` : "LEAK: A inserted B's public path");
  const bInsToA = await clientB.storage.from(PUBLIC_BUCKET).upload(aInsPath, PNG_BYTES, { contentType: MIME, upsert: false });
  add("public:insert-only B→A", Boolean(bInsToA.error), bInsToA.error ? `denied: ${bInsToA.error.message}` : "LEAK: B inserted A's public path");

  // Read-own for the INSERT-ONLY objects (guaranteed to exist iff insert
  // succeeded) — this directly probes the SELECT path on a freshly inserted
  // public object, no upsert interference.
  if (!aIns.error) {
    const aInsRead = await clientA.storage.from(PUBLIC_BUCKET).download(aInsPath);
    add("public:read A own (authenticated, insert-only object)", !aInsRead.error, aInsRead.error ? `denied: ${aInsRead.error.message}` : "downloaded");
  } else {
    add("public:read A own (authenticated, insert-only object)", true, "NOT RUN — insert was denied");
  }
  if (!bIns.error) {
    const bInsRead = await clientB.storage.from(PUBLIC_BUCKET).download(bInsPath);
    add("public:read B own (authenticated, insert-only object)", !bInsRead.error, bInsRead.error ? `denied: ${bInsRead.error.message}` : "downloaded");
  } else {
    add("public:read B own (authenticated, insert-only object)", true, "NOT RUN — insert was denied");
  }
  // Upsert-path objects only exist if upsert succeeded; record NOT RUN instead
  // of cascading failure when denied by policy.
  if (!aPubUp.error) {
    const aPubReadOwn = await clientA.storage.from(PUBLIC_BUCKET).download(objectPath(tenantA, "public-a.png"));
    add("public:read A own (upsert object)", !aPubReadOwn.error, aPubReadOwn.error?.message ?? "downloaded");
  } else {
    add("public:read A own (upsert object)", true, "NOT RUN — no object (upsert denied); availability failure recorded at public:upload A own (upsert)");
  }
  if (!bPubUp.error) {
    const bPubReadOwn = await clientB.storage.from(PUBLIC_BUCKET).download(objectPath(tenantB, "public-b.png"));
    add("public:read B own (upsert object)", !bPubReadOwn.error, bPubReadOwn.error?.message ?? "downloaded");
  } else {
    add("public:read B own (upsert object)", true, "NOT RUN — no object (upsert denied); availability failure recorded at public:upload B own (upsert)");
  }

  // ANONYMOUS public read — EMPIRICAL plain HTTPS GET (no sign-in).
  const publicUrl = (path: string) =>
    `${env.url.replace(/\/$/, "")}/storage/v1/object/public/${PUBLIC_BUCKET}/${path}`;
  const anonProbe = async (path: string): Promise<"ALLOW" | "DENY" | "ERROR"> => {
    try {
      const r = await fetch(publicUrl(path));
      if (r.ok) return "ALLOW";
      if ([400, 401, 403, 404].includes(r.status)) return "DENY";
      return "ERROR";
    } catch {
      return "ERROR";
    }
  };
  // Anonymous probes target the INSERT-ONLY objects first (they exist iff the
  // insert policy allowed), falling back to upsert objects when those exist.
  const anonAPath = !aIns.error ? aInsPath : objectPath(tenantA, "public-a.png");
  const anonBPath = !bIns.error ? bInsPath : objectPath(tenantB, "public-b.png");
  const anonA = await anonProbe(anonAPath);
  const anonB = await anonProbe(anonBPath);
  add("public:anonymous read A", true, `ACTUAL=${anonA} (object: ${anonAPath.split("/").pop()}) (empirical — availability, not isolation)`);
  add("public:anonymous read B", true, `ACTUAL=${anonB} (object: ${anonBPath.split("/").pop()}) (empirical — availability, not isolation)`);

  // RLS-GOVERNED SELECT probes (post-apply 20260918132842): storage list() is a
  // direct storage.objects DB query — it evaluates tenant_public_read (no
  // public-URL bypass like download() on public buckets, which the storage
  // server may serve from the /object/public/ route).
  //   - AUTHENTICATED own list: object's own folder must show the object
  //     (this is what makes upsert's internal SELECT work — proven PASS).
  //   - ANON list: recorded as an honest OBSERVATION either way — public
  //     delivery for end users is the /object/public/ route (RLS-independent,
  //     empirically ALLOW), and an anon directory listing is not a product
  //     requirement. Neither outcome is a leak (empty = more restrictive).
  if (!aIns.error) {
    const authList = await clientA.storage.from(PUBLIC_BUCKET).list(`${tenantA}/${QA_FOLDER}`, { search: `public-insert-only-${runId}`, limit: 10 });
    const authVis = !authList.error && (authList.data ?? []).length > 0;
    add(
      "public:auth-list governed (RLS SELECT)",
      authVis,
      `ACTUAL=${authList.error ? `ERROR (${authList.error.message})` : authVis ? "OBJECT VISIBLE" : "EMPTY"} — authenticated own folder lists the object`,
    );

    const anonClient = await createClientFn(env.url, env.key);
    const anonList = await anonClient.storage.from(PUBLIC_BUCKET).list(`${tenantA}/${QA_FOLDER}`, { search: `public-insert-only-${runId}`, limit: 10 });
    const anonVis = !anonList.error && (anonList.data ?? []).length > 0;
    add(
      "public:anon-list governed (RLS SELECT)",
      true,
      `ACTUAL=${anonList.error ? `ERROR (${anonList.error.message})` : anonVis ? "OBJECT VISIBLE" : "EMPTY (restricted)"} — post-apply observation; public delivery is via /object/public/ route (RLS-independent). Neither outcome is a leak.`,
    );

    const crossList = await clientA.storage.from(PUBLIC_BUCKET).list(`${tenantB}/${QA_FOLDER}`, { search: `public-insert-only-${runId}`, limit: 10 });
    const crossVis = !crossList.error && (crossList.data ?? []).length > 0;
    add(
      "public:cross-list A→B (RLS SELECT)",
      true,
      `ACTUAL=${crossList.error ? `ERROR (${crossList.error.message})` : crossVis ? "OBJECT VISIBLE" : "EMPTY"} — informational: public model means objects of allowed-status tenants are readable by anyone; listing ≠ write`,
    );
  } else {
    add("public:auth-list governed (RLS SELECT)", true, "NOT RUN — insert-only object does not exist");
    add("public:anon-list governed (RLS SELECT)", true, "NOT RUN — insert-only object does not exist");
    add("public:cross-list A→B (RLS SELECT)", true, "NOT RUN — insert-only object does not exist");
  }

  // ---------------- CLEANUP ----------------
  // list() reads storage.objects metadata directly (deterministic) — unlike
  // download(), which can hit a cached CDN response for a just-deleted object.
  const listGone = async (client: Client, bucket: string, tenantId: string, file: string) => {
    const r = await client.storage.from(bucket).list(`${tenantId}/${QA_FOLDER}`, { search: file, limit: 1 });
    if (r.error) return "LIST_ERROR";
    return (r.data ?? []).length === 0 ? "gone" : "PRESENT";
  };
  const cleanups: Array<{ label: string; client: Client; bucket: string; tenantId: string; file: string; exists: boolean }> = [
    { label: "A private", client: clientA, bucket: PRIVATE_BUCKET, tenantId: tenantA, file: "storage-a.png", exists: true },
    { label: "B private", client: clientB, bucket: PRIVATE_BUCKET, tenantId: tenantB, file: "storage-b.png", exists: true },
    { label: "A public (upsert)", client: clientA, bucket: PUBLIC_BUCKET, tenantId: tenantA, file: "public-a.png", exists: !aPubUp.error },
    { label: "B public (upsert)", client: clientB, bucket: PUBLIC_BUCKET, tenantId: tenantB, file: "public-b.png", exists: !bPubUp.error },
    { label: "A public (insert-only)", client: clientA, bucket: PUBLIC_BUCKET, tenantId: tenantA, file: `public-insert-only-${runId}.png`, exists: !aIns.error },
    { label: "B public (insert-only)", client: clientB, bucket: PUBLIC_BUCKET, tenantId: tenantB, file: `public-insert-only-${runId}.png`, exists: !bIns.error },
  ];
  for (const c of cleanups) {
    // Public objects may legitimately not exist (upload denied by policy) —
    // then "nothing removed" is the CORRECT outcome (residual=0), not a failure.
    if (c.bucket === PUBLIC_BUCKET && !c.exists) {
      add(`cleanup:${c.label}`, true, "nothing to remove — upload was denied by policy (residual verified via list below)");
      continue;
    }
    const r = await c.client.storage.from(c.bucket).remove([objectPath(c.tenantId, c.file)]);
    const item = (r.data ?? []) as unknown as Array<{ name: string; error?: string | null }>;
    // remove() may return an EMPTY ack even when the deletion succeeded
    // (observed live on public-bucket objects) — the truthful pass criterion
    // is the object being GONE (list() = storage.objects metadata), not the ack.
    const gone = await listGone(c.client, c.bucket, c.tenantId, c.file);
    const removed = gone === "gone";
    add(
      `cleanup:${c.label}`,
      removed,
      item[0]?.error ?? r.error?.message ?? (removed ? "removed (verified gone via list)" : `STILL PRESENT (list=${gone})`),
    );
  }
  // residual verification — sweep the WHOLE dedicated qa/ folder per
  // bucket/tenant (limit 100) instead of searching only this run's filename:
  // earlier runs used unique runIds, and per-run cleanup left their objects
  // behind (observed live). qa/ is QA-dedicated under the tenant UUID, so the
  // sweep can never touch real tenant media.
  const sweepAndVerify = async (client: Client, bucket: string, tenantId: string) => {
    const l = await client.storage.from(bucket).list(`${tenantId}/${QA_FOLDER}`, { limit: 100 });
    if (l.error) return `LIST_ERROR(${l.error.message})`;
    const names = (l.data ?? []).map((o) => o.name);
    for (const n of names) {
      await client.storage.from(bucket).remove([`${tenantId}/${QA_FOLDER}/${n}`]);
    }
    const after = await client.storage.from(bucket).list(`${tenantId}/${QA_FOLDER}`, { limit: 100 });
    if (after.error) return `LIST_ERROR(${after.error.message})`;
    return (after.data ?? []).length === 0 ? "gone" : "PRESENT";
  };
  const resPrivA = await sweepAndVerify(clientA, PRIVATE_BUCKET, tenantA);
  const resPrivB = await sweepAndVerify(clientB, PRIVATE_BUCKET, tenantB);
  const resPubA = await sweepAndVerify(clientA, PUBLIC_BUCKET, tenantA);
  const resPubB = await sweepAndVerify(clientB, PUBLIC_BUCKET, tenantB);
  add(
    "QA_STORAGE_RESIDUAL",
    resPrivA === "gone" && resPrivB === "gone" && resPubA === "gone" && resPubB === "gone",
    `private A=${resPrivA} private B=${resPrivB} public A=${resPubA} public B=${resPubB} (whole dedicated qa/ folder swept per tenant — idempotent across runs with unique runIds)`,
  );

  // ---- CLASSIFIED SUMMARY (per wave rules: isolation ≠ availability) ----
  const isolationNames = [
    "private:upload A→B", "private:upload B→A", "private:read A→B", "private:read B→A",
    "private:update A→B", "private:update B→A", "private:delete A→B", "private:delete B→A",
    "public:upload A→B", "public:upload B→A",
  ];
  const isolationChecks = checks.filter((c) => isolationNames.includes(c.name));
  const isolationPass = isolationChecks.every((c) => c.pass);
  const publicFunctional =
    !aPubUp.error && !bPubUp.error && anonA === "ALLOW" && anonB === "ALLOW";
  add(
    "CLASSIFICATION:storage-isolation",
    isolationPass,
    isolationPass ? "zero leaks: all private/cross reads, writes, updates, deletes denied" : "LEAK DETECTED — RELEASE BLOCKER",
  );
  add(
    "CLASSIFICATION:public-functionality",
    publicFunctional,
    publicFunctional
      ? "own uploads allowed; anonymous public read ALLOW"
      : `uploads own-path tenant-public denied for authenticated owners (RLS); anonymous read A=${anonA} B=${anonB} — functional blocker, isolation unaffected`,
  );

  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  const status = failed.length === 0 ? "PASS" : "FAIL";
  console.log(
    `[storage] STORAGE ISOLATION=${isolationPass ? "PASS" : "FAIL (LEAK)"} · PUBLIC FUNCTIONALITY=${publicFunctional ? "PASS" : "FAIL"} · overall=${status} (${checks.length - failed.length}/${checks.length})`,
  );
  return { status, checks };
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("cross-tenant-storage-smoke");
if (isDirectRun) {
  runStorageSmoke(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  ).then((r) => {
    if (r.status === "FAIL") process.exitCode = 1;
  });
}
