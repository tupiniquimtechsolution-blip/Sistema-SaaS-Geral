import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Canonical Supabase browser client factory (shared database package).
 *
 * SECURITY CONTRACT
 * - Only the publishable (anon) key is accepted. There is no parameter,
 *   overload or escape hatch that accepts a service_role key. `service_role`
 *   is NEVER allowed in a Vite bundle / browser — the factory rejects it by
 *   convention marker so a mis-wired env var fails loudly here, not in prod.
 * - Auth sessions are persisted to localStorage by default (browser).
 * - The package NEVER reads `import.meta.env` — configuration is passed
 *   explicitly by the app (env contract documented in
 *   docs/LIVE_SUPABASE_INTEGRATION.md).
 * - All reads go through RLS; the publishable key grants nothing beyond the
 *   policies the remote database enforces.
 */

export interface SupabaseClientConfig {
  /** Project URL, e.g. https://mmykyzzkcugxunmekwew.supabase.co */
  url: string;
  /** Publishable (anon) key — the ONLY key type accepted here. */
  publishableKey: string;
  /** localStorage key for the auth session (optional). */
  authStorageKey?: string;
}

const SERVICE_ROLE_MARKERS = ["service_role", "sb_secret_"];

export function assertPublishableKey(key: string): void {
  for (const marker of SERVICE_ROLE_MARKERS) {
    if (key.includes(marker)) {
      throw new Error(
        "tupiniquim-database: service_role keys are forbidden in browser clients. " +
          "Provide the publishable (anon) key only.",
      );
    }
  }
}

export function createSupabaseBrowserClient(config: SupabaseClientConfig): SupabaseClient {
  if (!config.url || !/^https?:\/\//.test(config.url)) {
    throw new Error("tupiniquim-database: a valid Supabase URL is required");
  }
  if (!config.publishableKey) {
    throw new Error("tupiniquim-database: a publishable (anon) key is required");
  }
  assertPublishableKey(config.publishableKey);
  return createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      ...(config.authStorageKey ? { storageKey: config.authStorageKey } : {}),
    },
  });
}
