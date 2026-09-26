import { describe, expect, it } from "vitest";
import { normalizeHostname, resolveTenantByHostname } from "./domain";

const domains = [
  { tenantId: "tenant-a", hostname: "a.example.com", verified: true, active: true },
  { tenantId: "tenant-b", hostname: "b.example.com", verified: true, active: true },
  { tenantId: "tenant-x", hostname: "pending.example.com", verified: false, active: true },
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
