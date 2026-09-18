// Minimal ambient Node globals — dependency-free (same convention as env-doctor.ts).
declare const process: {
  argv: string[];
  exit(code: number): void;
};

/**
 * CLOUDFLARE DEPLOYMENT GATE — HTTP + identity proof for Workers static assets.
 *
 * Per app:
 *   1. GET /                          → HTTP 200 + app HTML (no default/404 page)
 *   2. GET <script> + <stylesheet>    → HTTP 200 (assets)
 *   3. identity: served <title> MUST match the expected app title
 *      (catches wrong-app deployments and default Cloudflare pages)
 *   4. GET /rota-inexistente-gate     → HTTP 200 + app HTML (SPA fallback proof)
 *
 * Usage (public URLs only — no secrets):
 *   bun scripts/cloudflare-gate.ts bakery https://tupiniquim-bakery.<subdomain>.workers.dev
 *   bun scripts/cloudflare-gate.ts                        # runs with no target → usage listing
 *
 * Expected titles are read from the LOCAL dist (source of truth of this build):
 * scripts/cloudflare-gate.ts <app> <url> [expectedTitle]
 *
 * Exit 0 only if EVERY check passes.
 */

const APP_HTML_REQUIRED = ["<div id=\"root\">", "<script"] as const;
const FORBIDDEN_MARKERS = [
  "The page could not be found",
  "404 - Not Found",
  "Error 1101",
  "no worker",
  "Directory listing",
] as const;

const DEFAULT_TITLES: Record<string, string> = {
  platform: "Tupiniquim SaaS — Plataforma",
  bakery: "Fornalha",
  pet: "Amora Pet",
  restaurant: "Chez Amis",
  metalart: "Metal & Art",
  "heavy-machinery": "Lusomaq",
};

async function get(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
  return { status: res.status, body: await res.text() };
}

function assetUrls(doc: string, docUrl: string): string[] {
  const urls: string[] = [];
  const re = /(?:src|href)="(\/[^"]+\.(?:js|css))"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc)) !== null) urls.push(new URL(m[1], docUrl).toString());
  return urls;
}

function check(name: string, pass: boolean, detail: string): boolean {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  return pass;
}

async function gate(app: string, rawUrl: string, expectedTitle?: string): Promise<boolean> {
  const url = rawUrl.replace(/\/+$/, "") + "/";
  const expected = expectedTitle ?? DEFAULT_TITLES[app] ?? "";
  console.log(`\n=== CLOUDFLARE GATE [${app}]: ${url} ===`);
  let ok = true;
  let doc = "";
  let docUrl = url;

  try {
    const res = await get(url);
    ok = check("GET / status", res.status === 200, `HTTP ${res.status}`) && ok;
    const flat = res.body.replace(/\s+/g, " ");
    const forbidden = FORBIDDEN_MARKERS.filter((k) => flat.includes(k));
    ok =
      check(
        "no default/404/error markers",
        forbidden.length === 0,
        forbidden.length === 0 ? "clean" : `found: ${forbidden.join(", ")}`,
      ) && ok;
    const required = APP_HTML_REQUIRED.filter((k) => res.body.includes(k));
    ok =
      check(
        "app mount + script present",
        required.length === APP_HTML_REQUIRED.length,
        required.length === APP_HTML_REQUIRED.length ? "present" : `missing: ${required.filter((k) => !res.body.includes(k)).join(", ")}`,
      ) && ok;
    doc = res.body;
  } catch (err) {
    check("GET / status", false, `request error: ${(err as Error).message}`);
    return false;
  }

  // Identity gate: the served <title> must match this app's expected title.
  const servedTitle = /<title>([^<]*)<\/title>/i.exec(doc)?.[1]?.trim() ?? "(no title)";
  ok =
    check(
      "content identity (title)",
      expected !== "" && servedTitle.includes(expected),
      `expected~="${expected}" · served="${servedTitle}"`,
    ) && ok;

  const assets = assetUrls(doc, docUrl);
  if (assets.length === 0) {
    ok = check("assets referenced", false, "no /assets/*.js|css in document") && ok;
  } else {
    let good = 0;
    for (const a of assets) {
      try {
        const r = await get(a);
        if (r.status === 200) good += 1;
        else ok = check(`asset ${a}`, false, `HTTP ${r.status}`) && ok;
      } catch (err) {
        ok = check(`asset ${a}`, false, `request error: ${(err as Error).message}`) && ok;
      }
    }
    ok = check("assets HTTP 200", good === assets.length, `${good}/${assets.length}`) && ok;
  }

  // SPA fallback proof: a non-existent path must still serve the app shell.
  try {
    const r = await get(new URL("/rota-inexistente-gate-probe", url).toString());
    const isAppShell = r.status === 200 && r.body.includes("<div id=\"root\">");
    ok = check("SPA fallback (static assets)", isAppShell, `HTTP ${r.status}${isAppShell ? " + app shell" : ""}`) && ok;
  } catch (err) {
    ok = check("SPA fallback (static assets)", false, `request error: ${(err as Error).message}`) && ok;
  }

  return ok;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("uso: bun scripts/cloudflare-gate.ts <app> <url> [expectedTitle]");
  console.log(`apps conhecidos: ${Object.keys(DEFAULT_TITLES).join(", ")}`);
  process.exit(2);
}

const [app, url, title] = args;
const passed = await gate(app, url, title);
console.log(`\n=== ${app.toUpperCase()} CLOUDFLARE GATE: ${passed ? "PASS" : "FAIL"} ===`);
process.exit(passed ? 0 : 1);

export {};
