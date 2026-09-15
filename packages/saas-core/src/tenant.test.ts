import { describe, expect, it } from "vitest";
import type { Tenant } from "./tenant";
import { isDemo } from "./tenant";

function makeTenant(partial: Partial<Tenant>): Tenant {
  return {
    id: "t-1",
    slug: "fornalha",
    vertical: "bakery",
    status: "active",
    brand: { name: "Test Tenant" },
    theme: {},
    palette: {},
    settings: {},
    createdAt: "2026-09-12T00:00:00.000Z",
    ...partial,
  };
}

describe("tenant contract", () => {
  it("flags demo tenants explicitly", () => {
    expect(isDemo(makeTenant({ status: "demo" }))).toBe(true);
    expect(isDemo(makeTenant({ status: "active" }))).toBe(false);
  });

  it("keeps brand and theme contracts intact", () => {
    const t = makeTenant({
      brand: { name: "Fornalha", logo: "/logo.svg", favicon: "/favicon.svg" },
      theme: { headingFont: "var(--font-heading)", bodyFont: "var(--font-body)" },
    });
    expect(t.brand.name).toBe("Fornalha");
    expect(t.theme.headingFont).toContain("--font-heading");
  });
});
