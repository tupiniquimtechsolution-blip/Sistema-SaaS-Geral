// Minimal ambient Node globals — keeps the harness dependency-free (same
// convention as scripts/env-doctor.ts; no @types/node in the workspace).
declare const process: {
  argv: string[];
  exit(code: number): void;
};

/**
 * PREVIEW HTTP VALIDATION GATE — user-facing proof, not "Vercel READY".
 *
 * Rule (BIG MASTER WAVE §29/§36): a deployment being READY means nothing.
 * USER-FACING PREVIEW PASS requires real HTTP:
 *   1. GET /                → HTTP 200 + app HTML markers (no default Vercel page, no 404)
 *   2. GET <each script>    → HTTP 200 (assets)
 *   3. GET <each stylesheet>→ HTTP 200
 *   4. GET /#/rota-interna  → HTTP 200 from server (HashRouter: fragment never sent;
 *                              the / document itself must be 200 — server-side proof)
 *
 * Usage (no secrets needed — public URLs only):
 *   bun scripts/preview-http-gate.ts <url> [url2 ...]
 *   bun scripts/preview-http-gate.ts            # defaults to the known project aliases
 *
 * Exit code 0 only if EVERY url passes. Missing app/dist must be built first
 * (npm run build:bakery) — assets are read from apps/<app>/dist/index.html.
 */

type Check = {
  name: string;
  pass: boolean;
  detail: string;
};

const checks: Check[] = [];

function add(name: string, pass: boolean, detail: string): void {
  checks.push({ name, pass, detail });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${name} — ${detail}`);
}

/** Forbidden markers: anything of these in a served document means it is NOT our app. */
const FORBIDDEN_DOC_MARKERS = [
  "DEPLOYMENT_NOT_FOUND",
  "NOT_FOUND",
  "The page could not be found",
  "404",
] as const;

/** The served document must look like a real built Vite app of ours. */
const REQUIRED_DOC_MARKERS = ["<div id=\"root\">", "<script"] as const;

async function get(
  url: string,
): Promise<{ status: number; body: string; contentType: string; finalUrl: string }> {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
  const body = await res.text();
  return {
    status: res.status,
    body,
    contentType: res.headers.get("content-type") ?? "(none)",
    finalUrl: res.url,
  };
}

function extractAssetUrls(doc: string, docUrl: string): string[] {
  const urls: string[] = [];
  const re = /(?:src|href)="(\/[^"]+\.(?:js|css))"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc)) !== null) {
    urls.push(new URL(m[1], docUrl).toString());
  }
  return urls;
}

async function validatePreview(rawUrl: string): Promise<void> {
  const url = rawUrl.replace(/\/+$/, "") + "/";
  console.log(`\n=== PREVIEW HTTP GATE: ${url} ===`);

  // 1. GET / — must be 200 and contain the app document
  let doc: string;
  let docUrl = url;
  try {
    const res = await get(url);
    add("GET / status", res.status === 200, `HTTP ${res.status}`);
    const bodyNoWhitespace = res.body.replace(/\s+/g, " ");
    const forbidden = FORBIDDEN_DOC_MARKERS.filter((k) => bodyNoWhitespace.includes(k));
    add(
      "GET / is app document (no 404/default-Vercel markers)",
      forbidden.length === 0,
      forbidden.length === 0 ? "no forbidden markers" : `found: ${forbidden.join(", ")}`,
    );
    const required = REQUIRED_DOC_MARKERS.filter((k) => res.body.includes(k));
    add(
      "GET / contains app mount + script",
      required.length === REQUIRED_DOC_MARKERS.length,
      required.length === REQUIRED_DOC_MARKERS.length
        ? "root mount + script present"
        : `missing: ${REQUIRED_DOC_MARKERS.filter((k) => !res.body.includes(k)).join(", ")}`,
    );
    doc = res.body;
    docUrl = res.finalUrl;
  } catch (err) {
    add("GET / status", false, `request error: ${(err as Error).message}`);
    return;
  }

  // 2+3. assets referenced by the document must all be 200
  const assets = extractAssetUrls(doc, docUrl);
  if (assets.length === 0) {
    add("assets referenced", false, "no /assets/*.js|css found in document");
  } else {
    let ok = 0;
    for (const asset of assets) {
      try {
        const res = await get(asset);
        if (res.status === 200) ok += 1;
        else add(`asset ${asset}`, false, `HTTP ${res.status}`);
      } catch (err) {
        add(`asset ${asset}`, false, `request error: ${(err as Error).message}`);
      }
    }
    add("assets HTTP 200", ok === assets.length, `${ok}/${assets.length}`);
  }

  // 4. HashRouter: routes live after /#/ — the server only ever serves "/".
  //    Prove the route document itself (a server-side 200 on / is the proof;
  //    client-side rendering is additionally verifiable by marker content).
  const hashRouteProbe = new URL("/#/produtos", url).toString().split("#")[0];
  try {
    const res = await get(hashRouteProbe);
    add("route document (server-side / for HashRouter)", res.status === 200, `HTTP ${res.status}`);
  } catch (err) {
    add("route document (server-side / for HashRouter)", false, `request error: ${(err as Error).message}`);
  }

  // 5. content sanity: which app is being served? (informational, honest labeling)
  const lower = doc.toLowerCase();
  const guesses = ["bakery", "padaria", "tupiniquim saas", "sistema saas geral", "pet", "restaurant", "metalart", "heavy"];
  const found = guesses.filter((g) => lower.includes(g));
  console.log(`[INFO] content markers found: ${found.length ? found.join(", ") : "(none of the known markers)"}`);
}

const DEFAULT_TARGETS = [
  "https://sistema-saa-s-geral.vercel.app", // central project (currently still bakery preview or 404)
  "https://sistema-saas-geral.vercel.app", // alt spelling
];

const targets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_TARGETS;

for (const t of targets) {
  await validatePreview(t);
}

const failed = checks.filter((c) => !c.pass).length;
console.log(`\n=== SUMMARY: ${checks.length - failed}/${checks.length} checks PASS ===`);
process.exit(failed === 0 ? 0 : 1);

export {}; // module marker (top-level await requires a module)
