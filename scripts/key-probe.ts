// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * KEY ACCEPTANCE PROBE — distinguishes "key rejected" from "endpoint shape".
 * Uses process.env only; never prints key material. Health endpoints are
 * public metadata; garbage key controls for the "no key" baseline.
 */
const REF = "mmykyzzkcugxunmekwew";
void REF;
const BASE = `https://${REF}.supabase.co`;

async function status(path: string, key?: string): Promise<string> {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: key ? { apikey: key } : {} });
    return `HTTP ${r.status}`;
  } catch (e) {
    return `network: ${e instanceof Error ? e.message : String(e)}`;
  }
}

const k = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
console.log("[probe] SUPABASE_PUBLISHABLE_KEY present:", k.length > 0, "len:", k.length);
console.log("[probe] GET /auth/v1/health + key    →", await status("/auth/v1/health", k));
console.log("[probe] GET /auth/v1/health no key   →", await status("/auth/v1/health"));
console.log("[probe] GET /auth/v1/health garbage  →", await status("/auth/v1/health", "sb_publishable_garbage_probe"));
console.log("[probe] GET /rest/v1/ + key          →", await status("/rest/v1/", k));
console.log("[probe] GET /rest/v1/tenants?limit=1 + key →", await status("/rest/v1/tenants?limit=1", k));
console.log("[probe] GET /auth/v1/settings + key  →", await status("/auth/v1/settings", k));

export {};

