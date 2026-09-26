import { describe, expect, it } from "vitest";
import { authorizeAiOperation } from "./ai-operations";

const base = {
  actorUserId: "user-a",
  tenantId: "tenant-a",
  requestedTenantId: "tenant-a",
  grantedPermissions: ["cms.write", "cms.read", "catalog.write", "brand.write"] as const,
  grantedCapabilities: ["ai.chat.enabled", "ai.contentEdit.enabled", "ai.catalogEdit.enabled", "ai.redesign.enabled"] as const,
  confirmed: true,
};

describe("AI Tenant Studio operation policy", () => {
  it("authorizes a scoped, entitled and confirmed operation", () => {
    expect(authorizeAiOperation("updateProductPrice", base).risk).toBe("medium");
  });

  it("default-denies cross-tenant prompt/tool attempts", () => {
    expect(() => authorizeAiOperation("updateProductPrice", { ...base, requestedTenantId: "tenant-b" }))
      .toThrow(/cross-tenant/);
  });

  it("requires the commercial capability independently of RBAC", () => {
    expect(() => authorizeAiOperation("updateProductPrice", { ...base, grantedCapabilities: [] }))
      .toThrow(/Entitlement required/);
  });

  it("requires explicit confirmation for price mutations", () => {
    expect(() => authorizeAiOperation("updateProductPrice", { ...base, confirmed: false }))
      .toThrow(/confirmation/);
  });

  it("does not let chat capability imply redesign capability", () => {
    expect(() => authorizeAiOperation("proposePageRedesign", {
      ...base,
      grantedCapabilities: ["ai.chat.enabled"],
    })).toThrow(/ai.redesign.enabled/);
  });

  it("preview is low risk but still needs cms.read and ai.chat", () => {
    expect(authorizeAiOperation("previewRevision", {
      ...base,
      grantedPermissions: ["cms.read"],
      grantedCapabilities: ["ai.chat.enabled"],
      confirmed: false,
    }).confirmationRequired).toBe(false);
  });
});
