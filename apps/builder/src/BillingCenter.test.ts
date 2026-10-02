import { describe, expect, it } from "vitest";
import { hasBillingReadPermission } from "./BillingCenter";

describe("Billing Center read gate", () => {
  it("allows only the authoritative true permission result", () => {
    expect(hasBillingReadPermission(true)).toBe(true);
    expect(hasBillingReadPermission(false)).toBe(false);
    expect(hasBillingReadPermission(null)).toBe(false);
    expect(hasBillingReadPermission("true")).toBe(false);
  });
});
