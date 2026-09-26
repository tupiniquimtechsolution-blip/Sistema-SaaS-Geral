import { describe, expect, it } from "vitest";
import { normalizeHostname, resolveTenantByHostname } from "./domain";

const domains = [
  { tenantId: "tenant-a", hostname: "a.example.com", status: "active", verifiedAt: "2026-09-26T00:00:00Z" },
  { tenantId: "tenant-b", hostname: "b.example.com", status: "active", verifiedAt: "2026-09-26T00:00:00Z" },
  { tenantId: "tenant-x", hostname: "pending.example.com", status: "pending", verifiedAt: null },
];

describe("tenant domain resolution", () => {
  it("normalizes DNS hostname safely", () => expect(normalizeHostname("A.Example.com.")).toBe("a.example.com"));
  it("resolves only the exact verified active tenant", () => {
    expect(resolveTenantByHostname("a.example.com", domains)).toBe("tenant-a");
    expect(resolveTenantByHostname("b.example.com", domains)).toBe("tenant-b");
  });
  it("fails closed for unknown or unverified hosts", () => {
    expect(resolveTenantByHostname("unknown.example.com", domains)).toBeNull();
    expect(resolveTenantByHostname("pending.example.com", domains)).toBeNull();
  });
  it("does not allow a hostname to select another tenant", () => {
    expect(resolveTenantByHostname("a.example.com", domains)).not.toBe("tenant-b");
  });
});
