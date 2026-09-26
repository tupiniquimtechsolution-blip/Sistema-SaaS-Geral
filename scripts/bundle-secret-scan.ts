// Minimal ambient globals — dependency-free (convention: scripts run under bun;
// env-doctor.ts already uses crypto.subtle; no @types/node in the workspace).
declare const process: {
  env: Record<string, string | undefined>;
  exit(code: number): void;
};
declare const Bun: {
  file(path: string): { text(): Promise<string> };
  Glob: new (pattern: string) => { scan(opts?: { cwd?: string }): AsyncIterable<string> };
};

/**
 * BUNDLE SECRET SCAN — release gate (BIG MASTER WAVE §16/§30).
 *
 * Scans every app's Vite dist for:
 *   1. forbidden secret MARKERS (service_role tokens, QA credential names, DB URLs);
 *   2. the sha256 fingerprint (first 16 hex) of known secrets present in the
 *      process env (e.g. QA passwords) — values are NEVER printed; only
 *      "HIT <file>" lines and counts.
 *
 * Exit 0 = PASS (no secret material in any bundle). Exit 1 = FAIL.
 * Run: bun scripts/bundle-secret-scan.ts
 */

const APPS = ["platform", "bakery", "pet", "restaurant", "metalart", "heavy-machinery"] as const;

const MARKERS = [
  /sb_secret_[A-Za-z0-9_-]{8,}/,
  /service_role/i,
  /SUPABASE_SERVICE_ROLE/,
  /TEST_A_PASSWORD/,
  /TEST_B_PASSWORD/,
  /postgres(?:ql)?:\/\/[^\s"']*:[^\s"']*@/,
] as const;

const ENV_CANDIDATES = [
  "TEST_A_PASSWORD",
  "TEST_B_PASSWORD",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

async function sha16(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

let hits = 0;

const fps: string[] = [];
for (const key of ENV_CANDIDATES) {
  const value = process.env[key];
  if (value && value.length >= 12) fps.push(await sha16(value), await sha16(value.trim()));
}

for (const app of APPS) {
  const glob = new Bun.Glob("assets/*.{js,css,html}");
  let found = false;
  for await (const rel of glob.scan({ cwd: `apps/${app}/dist` })) {
    found = true;
    const path = `apps/${app}/dist/${rel}`;
    const content = await Bun.file(path).text();
    for (const marker of MARKERS) {
      if (marker.test(content)) {
        console.log(`[FAIL] HIT marker em ${app}/${rel}`);
        hits += 1;
      }
    }
    for (const fp of fps) {
      if (content.includes(fp)) {
        console.log(`[FAIL] HIT fingerprint de secret de env em ${app}/${rel}`);
        hits += 1;
      }
    }
  }
  if (!found) console.log(`[SKIP] ${app}: dist/assets ausente (build necessário)`);
}

console.log(
  hits === 0
    ? "[gate] BUNDLE SECRET SCAN = PASS (0 marcadores/valores em todos os dists)"
    : `[gate] BUNDLE SECRET SCAN = FAIL (${hits} hits)`,
);
process.exit(hits === 0 ? 0 : 1);

export {}; // module marker (top-level await requires a module)
