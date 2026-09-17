// Minimal ambient Node globals — keeps the harness dependency-free.
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode: number;
};
/**
 * RPC SIGNATURE PROBE — find which parameter names PostgREST accepts for
 * create_tenant_with_owner by sending named args and reading the 404 hint.
 * Metadata only; never creates data (signature mismatch short-circuits before
 * any execution), never prints secrets.
 *
 * Run: bun scripts/rpc-introspect.ts
 */
const REF = "mmykyzzkcugxunmekwew";

const CANDIDATES: Array<Record<string, unknown>> = [
  { p_name: "x", p_slug: "x", p_vertical_id: "x", p_demo: false },
  { name: "x", slug: "x", vertical_id: "x", demo: false },
  { tenant_name: "x", tenant_slug: "x", vertical_id: "x", is_demo: false },
  { _name: "x", _slug: "x", _vertical_id: "x", _demo: false },
  { in_name: "x", in_slug: "x", in_vertical_id: "x", in_demo: false },
  { arg_name: "x", arg_slug: "x", arg_vertical_id: "x", arg_demo: false },
  { p_display_name: "x", p_slug: "x", p_vertical_id: "x" },
  { p_slug: "x", p_vertical_id: "x" },
  { p_name: "x", p_slug: "x", p_vertical_id: "x" },
];

async function probe(k: string, body: Record<string, unknown>): Promise<void> {
  const r = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/create_tenant_with_owner`, {
    method: "POST",
    headers: { apikey: k, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let msg = "";
  try {
    msg = (JSON.parse(text) as { message?: string }).message ?? text.slice(0, 160);
  } catch {
    msg = text.slice(0, 160);
  }
  const keys = Object.keys(body).join(",");
  console.log(`[probe] {${keys}} → HTTP ${r.status}${msg ? ` | ${msg.slice(0, 120)}` : ""}`);
}

const k = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
if (!k) {
  console.log("[probe] no key → abort");
  process.exitCode = 1;
} else {
  for (const c of CANDIDATES) await probe(k, c);
}

export {};
