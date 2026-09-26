// Stripe webhook boundary for Supabase Edge Functions.
// Required secrets: STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY.
// Never expose either value to browser code.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verify(raw: string, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) return false;
  const expected = await hmac(secret, `${timestamp}.${raw}`);
  return signatures.some((sig) => constantTimeEqual(sig, expected));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || !url || !serviceKey) return new Response("Server not configured", { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  if (!(await verify(raw, signature, secret))) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(raw);
  const object = event?.data?.object ?? {};
  const tenantId = object?.metadata?.tenant_id;
  if (!event?.id || !event?.type || !tenantId) return new Response("Missing canonical metadata", { status: 400 });

  const digest = hex(await crypto.subtle.digest("SHA-256", encoder.encode(raw)));
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: ledgerError } = await supabase.from("billing_webhook_events").insert({
    provider: "stripe", provider_event_id: event.id, tenant_id: tenantId,
    event_type: event.type, payload_sha256: digest,
  });
  if (ledgerError?.code === "23505") return new Response("Already processed", { status: 200 });
  if (ledgerError) return new Response("Ledger failure", { status: 500 });

  const planId = object?.metadata?.plan_id;
  let state: string | null = null;
  if (event.type === "customer.subscription.deleted") state = "canceled";
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    state = ["trialing","active","past_due","canceled","incomplete"].includes(object.status) ? object.status : object.status === "unpaid" ? "past_due" : "incomplete";
  }
  if (state) {
    const patch: Record<string, unknown> = { provider: "stripe", provider_id: object.id, state, updated_at: new Date().toISOString() };
    if (planId) patch.plan_id = planId;
    const { error } = await supabase.from("subscriptions").update(patch).eq("tenant_id", tenantId);
    if (error) return new Response("Subscription update failure", { status: 500 });
  }
  await supabase.from("billing_webhook_events").update({ processed_at: new Date().toISOString() }).eq("provider", "stripe").eq("provider_event_id", event.id);
  return new Response("ok", { status: 200 });
});
