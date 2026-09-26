import { describe, expect, it } from "vitest";
import { assertPublishableKey, createSupabaseBrowserClient } from "./client";

describe("supabase client factory (security contract)", () => {
  it("rejects service_role keys outright", () => {
    expect(() => assertPublishableKey("eyJhbGciOi.service_role.secret")).toThrow(/service_role/);
    expect(() => assertPublishableKey("sb_secret_abc123")).toThrow(/service_role/);
  });

  it("accepts a publishable (anon) key and builds a client", () => {
    const client = createSupabaseBrowserClient({
      url: "https://mmykyzzkcugxunmekwew.supabase.co",
      publishableKey: "sb_publishable_anonkeyexample",
    });
    expect(client).toBeTruthy();
  });

  it("requires a valid https URL and a non-empty key", () => {
    expect(() =>
      createSupabaseBrowserClient({ url: "not-a-url", publishableKey: "k" }),
    ).toThrow(/URL/);
    expect(() =>
      createSupabaseBrowserClient({ url: "https://example.supabase.co", publishableKey: "" }),
    ).toThrow(/publishable/);
  });
});
