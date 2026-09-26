import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPERATION_POLICY: Record<string, { capability: string; permission: string; confirmationRequired: boolean }> = {
  updateContentField: { capability: "ai.contentEdit.enabled", permission: "cms.write", confirmationRequired: false },
  updateProductPrice: { capability: "ai.catalogEdit.enabled", permission: "catalog.write", confirmationRequired: true },
  replaceMedia: { capability: "ai.media.enabled", permission: "media.write", confirmationRequired: true },
  updateBusinessHours: { capability: "ai.contentEdit.enabled", permission: "tenant.settings.write", confirmationRequired: true },
  updateThemeTokens: { capability: "ai.design.enabled", permission: "brand.write", confirmationRequired: true },
  addRegisteredSection: { capability: "ai.sectionEdit.enabled", permission: "cms.write", confirmationRequired: true },
  reorderSections: { capability: "ai.sectionEdit.enabled", permission: "cms.write", confirmationRequired: true },
  proposePageRedesign: { capability: "ai.redesign.enabled", permission: "cms.write", confirmationRequired: true },
  previewRevision: { capability: "ai.chat.enabled", permission: "cms.read", confirmationRequired: false },
  submitRevision: { capability: "ai.sectionEdit.enabled", permission: "cms.write", confirmationRequired: true },
  publishApprovedRevision: { capability: "ai.publish.enabled", permission: "cms.write", confirmationRequired: true },
};

const ALLOWED_OPERATIONS = new Set([
  "updateContentField","updateProductPrice","replaceMedia","updateBusinessHours",
  "updateThemeTokens","addRegisteredSection","reorderSections","proposePageRedesign",
  "previewRevision","submitRevision","publishApprovedRevision",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = req.headers.get("authorization")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  if (!auth?.toLowerCase().startsWith("bearer ") || !supabaseUrl || !anonKey) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("AI_CHAT_COMPLETIONS_URL")?.trim();
  const key = Deno.env.get("AI_API_KEY")?.trim();
  const model = Deno.env.get("AI_MODEL")?.trim();
  if (!url || !key || !model) return json({ error: "ai_provider_not_configured" }, 503);

  let input: { tenantId?: string; pageId?: string; prompt?: string };
  try { input = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  if (!input.tenantId?.trim() || !input.prompt?.trim()) return json({ error: "tenant_and_prompt_required" }, 400);
  if (input.prompt.length > 4000) return json({ error: "prompt_too_large" }, 413);

  const rpcHeaders = { "content-type": "application/json", "authorization": auth, "apikey": anonKey };
  const featureGate = await fetch(`${supabaseUrl}/rest/v1/rpc/tenant_feature_enabled`, {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ p_tenant_id: input.tenantId, p_feature_key: "ai.chat.enabled" }),
  });
  if (!featureGate.ok) return json({ error: "tenant_scope_denied" }, 403);
  const featureEnabled = await featureGate.json();
  if (featureEnabled !== true) return json({ error: "ai_chat_not_entitled" }, 403);

  const system = [
    "You are the intent planner for Tupiniquim AI Tenant Studio.",
    "Return JSON only. Never emit SQL, shell, code, URLs, credentials or instructions to bypass authorization.",
    "You can only propose one of these operations: " + [...ALLOWED_OPERATIONS].join(", ") + ".",
    "Shape: {operation:string,summary:string,protectedFields:string[],arguments:object}.",
    "Respect explicit protected constraints such as do not change logo/products.",
    "You only propose. Authorization, entitlements, confirmation, execution and publishing are performed elsewhere."
  ].join("\n");

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify({ tenantId: input.tenantId, pageId: input.pageId ?? null, request: input.prompt }) },
      ],
    }),
  });
  if (!upstream.ok) return json({ error: "ai_provider_error", status: upstream.status }, 502);

  const payload = await upstream.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return json({ error: "invalid_provider_response" }, 502);

  let proposal: { operation?: string; summary?: string; protectedFields?: unknown; arguments?: unknown };
  try { proposal = JSON.parse(raw); } catch { return json({ error: "invalid_ai_json" }, 502); }
  if (!proposal.operation || !ALLOWED_OPERATIONS.has(proposal.operation)) return json({ error: "operation_not_allowed" }, 422);
  if (typeof proposal.summary !== "string" || proposal.summary.length > 1000) return json({ error: "invalid_summary" }, 422);
  if (!Array.isArray(proposal.protectedFields) || typeof proposal.arguments !== "object" || proposal.arguments === null) return json({ error: "invalid_proposal" }, 422);

  const policy = OPERATION_POLICY[proposal.operation];
  const [capabilityResponse, permissionResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/rpc/tenant_feature_enabled`, {
      method: "POST", headers: rpcHeaders,
      body: JSON.stringify({ p_tenant_id: input.tenantId, p_feature_key: policy.capability }),
    }),
    fetch(`${supabaseUrl}/rest/v1/rpc/has_tenant_permission`, {
      method: "POST", headers: rpcHeaders,
      body: JSON.stringify({ p_tenant_id: input.tenantId, p_permission: policy.permission }),
    }),
  ]);
  if (!capabilityResponse.ok || await capabilityResponse.json() !== true) return json({ error: "operation_not_entitled", capability: policy.capability }, 403);
  if (!permissionResponse.ok || await permissionResponse.json() !== true) return json({ error: "operation_permission_denied", permission: policy.permission }, 403);

  const usage = payload?.usage ?? {};
  const credit = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_ai_credit`, {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({
      p_tenant_id: input.tenantId, p_provider: "configured-provider", p_model: model,
      p_operation: proposal.operation, p_credits: 1,
      p_input_units: Number.isFinite(usage.prompt_tokens) ? usage.prompt_tokens : null,
      p_output_units: Number.isFinite(usage.completion_tokens) ? usage.completion_tokens : null,
    }),
  });
  if (!credit.ok) return json({ error: "ai_credit_limit_reached" }, 402);
  const creditState = await credit.json();

  return json({ proposal: { ...proposal, tenantId: input.tenantId, pageId: input.pageId ?? null, confirmationRequired: policy.confirmationRequired, executable: false }, credits: creditState });
});
