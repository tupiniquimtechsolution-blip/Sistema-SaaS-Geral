import { describe, expect, it } from "vitest";
import type { Membership } from "./member";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "./member";
import { assertTenantPermission, hasPermission, permissionsForRole, resolveMembership } from "./authorization";

function mkMembership(userId: string, tenantId: string, role: Membership["role"]): Membership {
  return { userId, tenantId, role, createdAt: "2026-09-12T00:00:00.000Z" };
}

describe("canonical permission catalog (28 permissions, remote mirror)", () => {
  it("mirrors exactly the 28 remote permission keys — no invention, no omission", () => {
    expect(PERMISSIONS).toHaveLength(28);
    // remote catalog additions confirmed in platform_core_v1
    expect(PERMISSIONS).toContain("crm.read");
    expect(PERMISSIONS).toContain("crm.write");
    expect(PERMISSIONS).toContain("booking.read");
    expect(PERMISSIONS).toContain("booking.write");
    expect(PERMISSIONS).toContain("quotes.read");
    expect(PERMISSIONS).toContain("quotes.write");
    // spot-check pre-existing keys still present
    expect(PERMISSIONS).toContain("tenant.read");
    expect(PERMISSIONS).toContain("audit.read");
  });

  it("keeps every catalog entry unique", () => {
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length);
  });
});

describe("remote role matrix (platform_core_v1 role_permissions)", () => {
  it("owner and admin hold all 28 permissions", () => {
    expect(permissionsForRole("owner")).toHaveLength(28);
    expect(permissionsForRole("admin")).toHaveLength(28);
  });

  it("manager holds exactly the 20 remote-granted permissions", () => {
    const perms = permissionsForRole("manager");
    expect(perms).toHaveLength(20);
    expect(perms).toContain("cms.write");
    expect(perms).toContain("booking.write");
    expect(perms).toContain("quotes.write");
    expect(perms).not.toContain("members.invite");
    expect(perms).not.toContain("members.roles.write");
    expect(perms).not.toContain("tenant.settings.write");
    expect(perms).not.toContain("billing.write");
  });

  it("editor holds exactly the 8 remote-granted permissions", () => {
    const perms = permissionsForRole("editor");
    expect(perms).toHaveLength(8);
    expect(perms).toContain("cms.write");
    expect(perms).toContain("brand.write");
    expect(perms).toContain("media.write");
    expect(perms).not.toContain("catalog.write");
    expect(perms).not.toContain("tenant.settings.write");
  });

  it("catalog_manager holds exactly the 5 remote-granted permissions", () => {
    const perms = permissionsForRole("catalog_manager");
    expect(perms).toEqual([
      "tenant.read",
      "media.read",
      "media.write",
      "catalog.read",
      "catalog.write",
    ]);
  });

  it("orders_manager holds exactly the 7 remote-granted permissions (incl. crm)", () => {
    const perms = permissionsForRole("orders_manager");
    expect(perms).toEqual([
      "tenant.read",
      "catalog.read",
      "orders.read",
      "orders.create",
      "orders.status.write",
      "crm.read",
      "crm.write",
    ]);
  });

  it("support holds exactly the 7 remote-granted permissions (read/write split)", () => {
    const perms = permissionsForRole("support");
    expect(perms).toEqual([
      "tenant.read",
      "orders.read",
      "crm.read",
      "crm.write",
      "booking.read",
      "booking.write",
      "quotes.read",
    ]);
  });

  it("viewer holds exactly the 14 remote-granted read permissions", () => {
    const perms = permissionsForRole("viewer");
    expect(perms).toHaveLength(14);
    expect(perms).toContain("billing.read");
    expect(perms).toContain("audit.read");
    expect(perms.every((p) => p.endsWith(".read"))).toBe(true);
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
    expect(hasPermission(mkMembership("u", "t", "viewer"), "booking.read")).toBe(true);
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
