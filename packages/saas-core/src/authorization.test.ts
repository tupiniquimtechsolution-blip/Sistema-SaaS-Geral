import { describe, expect, it } from "vitest";
import type { Membership } from "./member";
import { DEFAULT_ROLE_PERMISSIONS } from "./member";
import { assertTenantPermission, hasPermission, permissionsForRole, resolveMembership } from "./authorization";

function mkMembership(userId: string, tenantId: string, role: Membership["role"]): Membership {
  return { userId, tenantId, role, createdAt: "2026-09-12T00:00:00.000Z" };
}

describe("role matrix", () => {
  it("gives owner full administrative permissions", () => {
    const perms = permissionsForRole("owner");
    expect(perms).toContain("tenant.settings.write");
    expect(perms).toContain("members.roles.write");
    expect(perms).toContain("billing.write");
    expect(perms).toContain("audit.read");
  });

  it("denies viewer write permissions (default deny)", () => {
    const perms = permissionsForRole("viewer");
    expect(perms).toEqual(["tenant.read"]);
    expect(perms).not.toContain("catalog.write");
    expect(perms).not.toContain("brand.write");
  });

  it("keeps orders_manager scoped to orders", () => {
    const perms = permissionsForRole("orders_manager");
    expect(perms).toContain("orders.read");
    expect(perms).toContain("orders.status.write");
    expect(perms).not.toContain("brand.write");
    expect(perms).not.toContain("members.roles.write");
  });

  it("never grants tenant.settings.write to editor", () => {
    expect(permissionsForRole("editor")).not.toContain("tenant.settings.write");
  });

  it("covers every role with a non-empty matrix", () => {
    for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as Array<keyof typeof DEFAULT_ROLE_PERMISSIONS>) {
      expect(DEFAULT_ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });
});

describe("membership resolution", () => {
  const memberships: Membership[] = [
    mkMembership("user-a", "tenant-a", "owner"),
    mkMembership("user-b", "tenant-b", "admin"),
  ];

  it("resolves membership only for the exact tenant", () => {
    expect(resolveMembership(memberships, "user-a", "tenant-a")?.role).toBe("owner");
    expect(resolveMembership(memberships, "user-a", "tenant-b")).toBeUndefined();
    expect(resolveMembership(memberships, "user-b", "tenant-a")).toBeUndefined();
  });

  it("hasPermission respects the role of the membership", () => {
    expect(hasPermission(mkMembership("u", "t", "admin"), "cms.write")).toBe(true);
    expect(hasPermission(mkMembership("u", "t", "viewer"), "cms.write")).toBe(false);
  });
});

describe("SECURITY CONTRACT — cross-tenant denial (in-memory)", () => {
  const userA = mkMembership("user-a", "tenant-a", "owner");
  const userB = mkMembership("user-b", "tenant-b", "admin");

  it("TENANT A cannot act on TENANT B (no membership resolves)", () => {
    expect(() => assertTenantPermission(resolveMembership([userA], "user-a", "tenant-b"), "tenant-b", "tenant.read")).toThrow(
      /no membership in this tenant/,
    );
  });

  it("TENANT B cannot act on TENANT A", () => {
    expect(() => assertTenantPermission(resolveMembership([userB], "user-b", "tenant-a"), "tenant-a", "tenant.read")).toThrow(
      /no membership in this tenant/,
    );
  });

  it("a forged membership object from A does not pass tenant check for B", () => {
    // A holds owner of tenant-a; attempting to assert on tenant-b even with the membership in hand must fail.
    expect(() => assertTenantPermission(userA, "tenant-b", "tenant.read")).toThrow(/cross-tenant attempt/);
    expect(() => assertTenantPermission(userB, "tenant-a", "catalog.write")).toThrow(/cross-tenant attempt/);
  });

  it("permission of A does not apply inside B even for same-named roles", () => {
    const adminA = mkMembership("user-a2", "tenant-a", "admin");
    expect(() => assertTenantPermission(adminA, "tenant-b", "cms.write")).toThrow(/cross-tenant attempt/);
  });

  it("valid in-tenant flows still pass (positive control)", () => {
    expect(() => assertTenantPermission(userA, "tenant-a", "brand.write")).not.toThrow();
    expect(() => assertTenantPermission(userB, "tenant-b", "catalog.write")).not.toThrow();
  });

  it("insufficient permission inside own tenant is denied (least privilege)", () => {
    const viewerA = mkMembership("user-a3", "tenant-a", "viewer");
    expect(() => assertTenantPermission(viewerA, "tenant-a", "orders.create")).toThrow(/missing permission/);
  });
});
