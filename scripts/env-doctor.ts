// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * ENV DOCTOR — non-secret diagnostics for the Supabase QA env.
 *
 * Prints NO key material. For each candidate publishable key it reports:
 *   - sha256 fingerprint (first 12 hex) — equality checks only
 *   - JWT PUBLIC claims only (role, project ref from iss) — the anon key is
 *     public by design; signature bytes are never decoded or printed
 *   - whether server pair and browser pair match
 *   - a live auth probe per pair reporting only the Supabase error class
 *
 * Run: bun scripts/env-doctor.ts
 */

type CreateClientFn = (
  url: string,
  key: string,
) => Promise<import("@supabase/supabase-js").SupabaseClient> | import("@supabase/supabase-js").SupabaseClient;

async function fingerprint(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

/** Decode ONLY the public header/payload of a JWT. Never the signature. */
function jwtPublicClaims(value: string): { role?: string; ref?: string; isJwt: boolean } {
  const parts = value.split(".");
  if (parts.length !== 2 && parts.length !== 3) return { isJwt: false };
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
    const iss = typeof payload.iss === "string" ? payload.iss : "";
    const ref = iss.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const role = typeof payload.role === "string" ? payload.role : undefined;
    return { isJwt: true, role, ref };
  } catch {
    return { isJwt: false };
  }
}

function urlRef(url: string): string | undefined {
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
}

async function probe(
  createClientFn: CreateClientFn,
  url: string,
  key: string,
  email: string,
  password: string,
): Promise<string> {
  try {
    const client = (await createClientFn(url, key)) as import("@supabase/supabase-js").SupabaseClient;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      if (/invalid api key/i.test(error.message)) return "REJECTED: Invalid API key";
      if (/invalid login credentials/i.test(error.message)) return "KEY ACCEPTED — credentials failed (identity problem, not key)";
      return `KEY ACCEPTED — other: ${error.message}`;
    }
    return "KEY ACCEPTED — sign-in succeeded";
  } catch (e) {
    return `network/error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function runEnvDoctor(
  createClientFn: CreateClientFn,
  env: Record<string, string | undefined> = process.env,
): Promise<{ verdict: string }> {
  const url = env["SUPABASE_URL"] ?? "";
  const key = env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const viteUrl = env["VITE_SUPABASE_URL"] ?? "";
  const viteKey = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const email = env["TEST_A_EMAIL"] ?? "";
  const password = env["TEST_A_PASSWORD"] ?? "";

  if (!url || !key) {
    console.log("[env-doctor] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY missing → nothing to diagnose");
    return { verdict: "MISSING_ENV" };
  }

  console.log(`[env-doctor] SUPABASE_URL ref: ${urlRef(url) ?? "???"} (domain: ${new URL(url).host})`);
  console.log(`[env-doctor] VITE_SUPABASE_URL ref: ${urlRef(viteUrl) ?? "(not set or non-standard)"} (domain: ${viteUrl ? new URL(viteUrl).host : "-"})`);

  for (const [name, value] of [
    ["SUPABASE_PUBLISHABLE_KEY", key],
    ["VITE_SUPABASE_PUBLISHABLE_KEY", viteKey],
  ] as const) {
    if (!value) continue;
    // Paste-contamination checks — metadata only, never the value itself.
    const contamination: string[] = [];
    if (/^[\s"']/.test(value) || /[\s"']$/.test(value)) contamination.push("leading/trailing quote-or-space");
    if (value.includes("\r")) contamination.push("contains CR (CRLF paste?)");
    if (/\s/.test(value.trim())) contamination.push("internal whitespace");
    const sbPrefix = value.startsWith("sb_") ? value.slice(0, value.indexOf("_", 3) + 1) : "(not sb_*)";
    console.log(
      `[env-doctor] ${name}: type-prefix=${sbPrefix} length=${value.length}${contamination.length ? ` ⚠️ ${contamination.join(", ")}` : " (clean paste)"}`,
    );
  }

  console.log(`[env-doctor] SUPABASE_PUBLISHABLE_KEY fingerprint: sha256:${await fingerprint(key)}`);
  if (viteKey) console.log(`[env-doctor] VITE_SUPABASE_PUBLISHABLE_KEY fingerprint: sha256:${await fingerprint(viteKey)}`);
  else console.log("[env-doctor] VITE_SUPABASE_PUBLISHABLE_KEY: (empty)");

  console.log(`[env-doctor] server/browser URL identical: ${url === viteUrl}`);
  console.log(`[env-doctor] server/browser KEY identical: ${key === viteKey}`);

  const claims = jwtPublicClaims(key);
  console.log(
    `[env-doctor] SUPABASE_PUBLISHABLE_KEY public claims: isJwt=${claims.isJwt} role=${claims.role ?? "(none)"} ref=${claims.ref ?? "(none)"}`,
  );
  if (claims.role && claims.role !== "anon" && claims.role !== "authenticated") {
    console.log(`[env-doctor] ⚠️  role='${claims.role}' is NOT a publishable role — this looks like the WRONG key type for the browser/server anon pair`);
  }
  if (claims.ref && urlRef(url) && claims.ref !== urlRef(url)) {
    console.log(`[env-doctor] ⚠️  key belongs to project '${claims.ref}' but URL points to '${urlRef(url)}' — PROJECT MISMATCH`);
  }
  if (!claims.isJwt) {
    const newStyle = key.startsWith("sb_");
    console.log(`[env-doctor] key is not a legacy JWT (new-style token, prefix sb_*) : ${newStyle}`);
    if (newStyle && /secret|service/.test(key.slice(3, 12))) {
      console.log("[env-doctor] ⚠️  key prefix suggests a SECRET/SERVICE token — NEVER valid for publishable use");
    }
  }

  const vClaims = viteKey ? jwtPublicClaims(viteKey) : null;
  if (vClaims) {
    console.log(
      `[env-doctor] VITE key public claims: isJwt=${vClaims.isJwt} role=${vClaims.role ?? "(none)"} ref=${vClaims.ref ?? "(none)"}`,
    );
  }

  if (email && password && !/^<.*>$/.test(email)) {
    console.log("[env-doctor] live probe with identity A (masked results):");
    console.log(`[env-doctor]   server pair  → ${await probe(createClientFn, url, key, email, password)}`);
    if (viteUrl && viteKey && (viteUrl !== url || viteKey !== key)) {
      console.log(`[env-doctor]   browser pair → ${await probe(createClientFn, viteUrl, viteKey, email, password)}`);
    }
    console.log("[env-doctor]   cross key→server URL:", await probe(createClientFn, url, viteKey || key, email, password));
  } else {
    console.log("[env-doctor] identity A missing/placeholder → live auth probe skipped");
  }

  return { verdict: "DIAGNOSED" };
}

const isDirectRun =
  typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]?.includes("env-doctor");
if (isDirectRun) {
  runEnvDoctor(
    (...args: unknown[]) =>
      import("@supabase/supabase-js").then((m) => m.createClient(...(args as Parameters<typeof m.createClient>))) as never,
  ).then((r) => {
    console.log(`[env-doctor] verdict: ${r.verdict}`);
    if (r.verdict === "MISSING_ENV") process.exitCode = 1;
  });
}
