import { createClient } from "@supabase/supabase-js";

export const QA_PROJECT = "ynqbnimlpxlokrxlucdm";
export const QA_A = "f92215f9-da30-4453-9190-aece00984284";
export const QA_B = "a8494bfa-ac05-478c-b06f-3031e0d2cb8c";
export const QA_EDITOR = "f161ba2f-e465-4915-8df9-c38dc622966d";
export const QA_ROLE = "a1cfc9e4-ed77-4891-a91e-568b17be40de";
export const APPROVAL = "AUTHORIZE_QA_SALON_EDITORIAL_WRITES";

function assertQaScope(env, mode, requireCredentials) {
  const projectUrl = `https://${QA_PROJECT}.supabase.co`;
  if (
    env.QA_PROJECT_REF !== QA_PROJECT ||
    env.QA_APPROVED_PROJECT_REF !== QA_PROJECT ||
    env.QA_SUPABASE_URL !== projectUrl ||
    env.QA_TEST_MODE !== mode ||
    (env.GITHUB_REF && env.GITHUB_REF !== "refs/heads/qa/tenant-isolation-staging-20261010")
  ) {
    throw new Error("Refusing non-QA or unapproved editorial execution");
  }
  if (requireCredentials && (
    !env.QA_SUPABASE_PUBLISHABLE_KEY ||
    !env.QA_EDITOR_EMAIL ||
    !env.QA_EDITOR_PASSWORD
  )) {
    throw new Error("Protected QA editor credentials are missing");
  }
}

/** CMS mutations require a distinct explicit manual authorization. */
export function assertQaSalonEditorEnv(env, requireCredentials = true) {
  assertQaScope(env, "editorial-write", requireCredentials);
  if (env.QA_EDITORIAL_WRITES_CONFIRM !== APPROVAL) {
    throw new Error("Refusing editorial writes without exact manual authorization");
  }
}

/** Read-only Auth/permission verification on push; never invokes CMS DML. */
export function assertQaSalonEditorPreflightEnv(env) {
  assertQaScope(env, "editorial-preflight", true);
  if (env.QA_EDITORIAL_WRITES_CONFIRM) {
    throw new Error("Preflight must not carry write authorization");
  }
}

function assertAllowed(name, value, expected) {
  if (value !== expected) {
    throw new Error(`QA editor access denied or invalid: ${name}`);
  }
}

export async function checkQaSalonEditorSession(client) {
  const { data: userInfo, error: userError } = await client.auth.getUser();
  if (userError || userInfo?.user?.id !== QA_EDITOR) {
    throw new Error("QA editor Auth identity mismatch");
  }
  const { data: platformAdmin, error: adminError } = await client.rpc("is_platform_admin");
  if (adminError) throw new Error("QA platform-admin status cannot be verified");
  assertAllowed("platform_admin", platformAdmin, false);

  const perms = [
    [QA_A, "cms.read", true],
    [QA_A, "cms.write", true],
    [QA_B, "cms.write", false],
    [QA_A, "brand.write", false],
    [QA_A, "catalog.write", false],
    [QA_A, "media.write", false],
    [QA_A, "tenant.settings.write", false],
    [QA_A, "members.roles.write", false],
  ];
  for (const [tenantId, permission, expected] of perms) {
    const { data, error } = await client.rpc("has_tenant_permission", {
      p_tenant_id: tenantId,
      p_permission: permission,
    });
    if (error) throw new Error(`Cannot verify permission ${permission}`);
    assertAllowed(`${permission} tenant ${tenantId === QA_A ? "A" : "B"}`, data, expected);
  }

  const { data: memberships, error: membershipError } = await client
    .from("memberships")
    .select("id,tenant_id,user_id,status")
    .eq("user_id", QA_EDITOR);
  if (
    membershipError ||
    !Array.isArray(memberships) ||
    memberships.length !== 1 ||
    memberships[0].id !== "7a485aea-02f1-4d93-adc0-c8d78e7a5910" ||
    memberships[0].status !== "active" ||
    memberships[0].tenant_id !== QA_A ||
    memberships[0].user_id !== QA_EDITOR
  ) {
    throw new Error("QA editor must have exactly one active Tenant A membership");
  }
  return memberships[0].id;
}

export async function runQaSalonEditorPreflight(env = process.env) {
  assertQaSalonEditorPreflightEnv(env);
  const client = createClient(
    env.QA_SUPABASE_URL,
    env.QA_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error } = await client.auth.signInWithPassword({
    email: env.QA_EDITOR_EMAIL,
    password: env.QA_EDITOR_PASSWORD,
  });
  if (error) throw new Error("QA editor sign-in failed");
  await checkQaSalonEditorSession(client);

  const { data: pages, error: pagesError } = await client
    .from("pages")
    .select("id,slug,status")
    .eq("tenant_id", QA_A)
    .eq("slug", "inicio");
  if (pagesError || !Array.isArray(pages) || pages.length !== 0) {
    throw new Error("Refusing editorial writes: homepage already exists or its absence cannot be proven");
  }
  console.log("QA_SALON_EDITOR_PREFLIGHT=PASS: identity, narrow CMS permission and empty homepage verified");
  const { error: signOutError } = await client.auth.signOut();
  if (signOutError) throw new Error("QA editor session could not be signed out");
}

const isDirect = process.argv[1]?.split(/[\\/]/).at(-1) === "qa-salon-editor-guard.mjs";
if (isDirect) {
  runQaSalonEditorPreflight().catch((error) => {
    console.error(error instanceof Error ? error.message : "QA editor guard failed");
    process.exitCode = 1;
  });
}
