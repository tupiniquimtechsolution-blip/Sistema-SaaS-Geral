import { describe, expect, it } from "vitest";
import { isValidTenantSlug, normalizeTenantSlug } from "./onboarding";

describe("tenant onboarding helpers", () => {
  it("normalizes a customer name into a safe canonical slug", () => {
    expect(normalizeTenantSlug(" Padaria São João & Filhos ")).toBe("padaria-sao-joao-filhos");
  });

  it("accepts canonical slugs and rejects unsafe shapes", () => {
    expect(isValidTenantSlug("cliente-01")).toBe(true);
    expect(isValidTenantSlug("ab")).toBe(false);
    expect(isValidTenantSlug("-cliente")).toBe(false);
    expect(isValidTenantSlug("cliente_01")).toBe(false);
  });
});
