import { describe, expect, it } from "vitest";
import { parseProposal } from "./AiCopilot";

describe("AI Tenant Studio proposal contract", () => {
  it("accepts a valid non-executable proposal", () => {
    expect(parseProposal({
      operation: "updateContentField",
      summary: "Revise o texto do destaque.",
      protectedFields: ["brand.logo_url"],
      arguments: { field: "hero.title", value: "Bem-vindo" },
      confirmationRequired: false,
      executable: false,
    })).toMatchObject({ operation: "updateContentField", executable: false });
  });

  it("rejects executable proposals and unknown operations", () => {
    const base = {
      summary: "Proposta",
      protectedFields: [],
      arguments: {},
      confirmationRequired: true,
      executable: false,
    };
    expect(parseProposal({ ...base, operation: "publishTenantNow" })).toBeNull();
    expect(parseProposal({ ...base, operation: "publishApprovedRevision", executable: true })).toBeNull();
  });

  it("fails closed on malformed protected fields or arguments", () => {
    expect(parseProposal({ operation: "previewRevision", summary: "Proposta", protectedFields: [null], arguments: {}, confirmationRequired: false, executable: false })).toBeNull();
    expect(parseProposal({ operation: "previewRevision", summary: "Proposta", protectedFields: [], arguments: [], confirmationRequired: false, executable: false })).toBeNull();
  });
});
