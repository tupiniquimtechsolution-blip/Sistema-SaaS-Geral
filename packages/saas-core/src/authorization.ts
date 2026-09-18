import { DEFAULT_ROLE_PERMISSIONS, type Membership, type Permission, type Role } from "./member";

/**
 * Server-side authorization helpers.
 *
 * These are pure contract functions: they prove the intended security model
 * (default deny, tenant-scoped permission evaluation) at the type/unit level.
 * They do NOT replace database RLS or real server enforcement.
 */

export function permissionsForRole(role: Role): readonly Permission[] {
  return DEFAULT_ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(membership: Membership, permission: Permission): boolean {
  return permissionsForRole(membership.role).includes(permission);
}

/**
 * Resolves the membership of a user in a SPECIFIC tenant.
 * Cross-tenant safe: a membership from tenant A never resolves for tenant B.
 */
export function resolveMembership(
  memberships: readonly Membership[],
  userId: string,
  tenantId: string,
): Membership | undefined {
  return memberships.find((m) => m.userId === userId && m.tenantId === tenantId);
}

/**
 * Asserts that the actor is a member of the given tenant AND holds the permission.
 * Throws on: no membership in this tenant (cross-tenant attempt) or missing permission.
 */
export function assertTenantPermission(
  membership: Membership | undefined,
  tenantId: string,
  permission: Permission,
): void {
  if (!membership) {
    throw new Error("Access denied: no membership in this tenant");
  }
  if (membership.tenantId !== tenantId) {
    throw new Error("Access denied: cross-tenant attempt");
  }
  if (!hasPermission(membership, permission)) {
    throw new Error(`Access denied: missing permission ${permission}`);
  }
}
