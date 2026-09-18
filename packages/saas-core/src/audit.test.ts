import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "./audit";

describe("audit metadata sanitization", () => {
  it("keeps safe keys", () => {
    const out = sanitizeAuditMetadata({ productId: "p1", total: 10 });
    expect(out).toEqual({ productId: "p1", total: 10 });
  });

  it("strips secret-like keys regardless of casing", () => {
    const out = sanitizeAuditMetadata({ Token: "abc", API_KEY: "k", myPassword: "x", Authorization: "Bearer z" });
    expect(out).toEqual({});
  });

  it("strips nested forbidden key at any key name containing the term", () => {
    const out = sanitizeAuditMetadata({ creditCardNumber: "4111", note: "ok" });
    expect(out).toEqual({ note: "ok" });
  });

  it("returns undefined for absent metadata", () => {
    expect(sanitizeAuditMetadata(undefined)).toBeUndefined();
  });
});
