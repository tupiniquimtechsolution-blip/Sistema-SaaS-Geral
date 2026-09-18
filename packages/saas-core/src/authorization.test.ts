import { describe, expect, it } from "vitest";
import type { Membership } from "./member";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, RELIGIOUS_SENSITIVE_PERMISSIONS } from "./member";
import { assertTenantPermission, hasPermission, permissionsForRole, resolveMembership } from "./authorization";

function mkMembership(userId: string, tenantId: string, role: Membership["role"]): Membership {
  return { userId, tenantId, role, createdAt: "2026-09-12T00:00:00.000Z" };
}

describe("live permission catalog (42 permissions, remote live mirror)", () => {
  it("PERMISSIONS.length === 42 (live public.permissions)", () => {
    expect(PERMISSIONS).toHaveLength(42);
  });

  it("mirrors the 14 keys added in the live catalog beyond the historical snapshot", () => {
    for (const key of [
      "documents.read",
      "documents.write",
      "events.read",
      "events.write",
      "loyalty.read",
      "loyalty.write",
      "pets.read",
      "pets.write",
      "projects.read",
      "projects.write",
      "religious.sensitive.read",
      "religious.sensitive.write",
      "support.read",
      "support.write",
    ] as const) {
      expect(PERMISSIONS).toContain(key);
    }
  });

  it("keeps every catalog entry unique", () => {
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length);
  });
});

describe("live role matrix (remote live role_permissions counts)", () => {
  it("owner permissions === 42", () => {
    expect(permissionsForRole("owner")).toHaveLength(42);
  });

  it("admin permissions === 40", () => {
    expect(permissionsForRole("admin")).toHaveLength(40);
  });

  it("manager permissions === 32", () => {
    expect(permissionsForRole("manager")).toHaveLength(32);
  });

  it("editor permissions === 9", () => {
    expect(permissionsForRole("editor")).toHaveLength(9);
  });

  it("catalog_manager permissions === 5", () => {
    expect(permissionsForRole("catalog_manager")).toHaveLength(5);
  });

  it("orders_manager permissions === 5", () => {
    expect(permissionsForRole("orders_manager")).toHaveLength(5);
  });

  it("support permissions === 7", () => {
    expect(permissionsForRole("support")).toHaveLength(7);
  });

  it("viewer permissions === 19", () => {
    expect(permissionsForRole("viewer")).toHaveLength(19);
  });

  it("covers every role with a non-empty matrix", () => {
    for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as Array<keyof typeof DEFAULT_ROLE_PERMISSIONS>) {
      expect(DEFAULT_ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });
});

describe("SECURITY CONTRACT — religious sensitive triple gate (RBAC layer)", () => {
  it("owner HOLDS both religious.sensitive permissions", () => {
    expect(permissionsForRole("owner")).toContain("religious.sensitive.read");
    expect(permissionsForRole("owner")).toContain("religious.sensitive.write");
  });

  it("admin does NOT hold religious.sensitive permissions (intentional live asymmetry)", () => {
    expect(permissionsForRole("admin")).not.toContain("religious.sensitive.read");
    expect(permissionsForRole("admin")).not.toContain("religious.sensitive.write");
  });

  it("no other role holds religious.sensitive permissions", () => {
    for (const role of ["manager", "editor", "catalog_manager", "orders_manager", "support", "viewer"] as const) {
      expect(permissionsForRole(role)).not.toContain("religious.sensitive.read");
      expect(permissionsForRole(role)).not.toContain("religious.sensitive.write");
    }
  });

  it("RELIGIOUS_SENSITIVE_PERMISSIONS lists exactly the two gated keys", () => {
    expect(RELIGIOUS_SENSITIVE_PERMISSIONS).toEqual(["religious.sensitive.read", "religious.sensitive.write"]);
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
    expect(hasPermission(mkMembership("u", "t", "viewer"), "pets.read")).toBe(true);
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

  it("SECURITY: owner-only religious permission still requires correct tenant", () => {
    const ownerA = mkMembership("owner-a", "tenant-a", "owner");
    expect(() => assertTenantPermission(ownerA, "tenant-b", "religious.sensitive.read")).toThrow(/cross-tenant attempt/);
    expect(() => assertTenantPermission(ownerA, "tenant-a", "religious.sensitive.read")).not.toThrow();
  });

  it("SECURITY: admin cannot assert religious sensitive operation even in own tenant", () => {
    const adminB = mkMembership("admin-b", "tenant-b", "admin");
    expect(() => assertTenantPermission(adminB, "tenant-b", "religious.sensitive.write")).toThrow(/missing permission/);
  });
});
