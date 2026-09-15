/**
 * Identity & RBAC contracts — ALIGNED with the canonical remote Supabase schema
 * (project mmykyzzkcugxunmekwew, platform_core_v1 permission/role seed).
 *
 * Source of truth: public.permissions / public.roles / public.role_permissions
 * on the remote database. This file MIRRORS that catalog for TypeScript use;
 * the database remains the enforcement authority (RLS + has_tenant_permission()).
 *
 * ALIGNED 2026-09-15 — see docs/PERMISSION_ALIGNMENT.md.
 */

export type Role =
  | "owner"
  | "admin"
  | "manager"
  | "editor"
  | "catalog_manager"
  | "orders_manager"
  | "support"
  | "viewer";

/**
 * Exact mirror of the 28 seeded permission keys (platform_core_v1, seed invariant).
 * DO NOT invent keys here. New permissions must be added to the remote catalog
 * first, then mirrored into this union and docs/PERMISSION_ALIGNMENT.md.
 */
export type Permission =
  | "tenant.read"
  | "tenant.settings.read"
  | "tenant.settings.write"
  | "brand.read"
  | "brand.write"
  | "cms.read"
  | "cms.write"
  | "media.read"
  | "media.write"
  | "catalog.read"
  | "catalog.write"
  | "orders.read"
  | "orders.create"
  | "orders.status.write"
  | "members.read"
  | "members.invite"
  | "members.roles.write"
  | "integrations.read"
  | "integrations.write"
  | "billing.read"
  | "billing.write"
  | "audit.read"
  | "crm.read"
  | "crm.write"
  | "booking.read"
  | "booking.write"
  | "quotes.read"
  | "quotes.write";

/** All 28 canonical permission keys (mirror of public.permissions). */
export const PERMISSIONS: readonly Permission[] = [
  "tenant.read",
  "tenant.settings.read",
  "tenant.settings.write",
  "brand.read",
  "brand.write",
  "cms.read",
  "cms.write",
  "media.read",
  "media.write",
  "catalog.read",
  "catalog.write",
  "orders.read",
  "orders.create",
  "orders.status.write",
  "members.read",
  "members.invite",
  "members.roles.write",
  "integrations.read",
  "integrations.write",
  "billing.read",
  "billing.write",
  "audit.read",
  "crm.read",
  "crm.write",
  "booking.read",
  "booking.write",
  "quotes.read",
  "quotes.write",
] as const;

export interface Membership {
  userId: string;
  tenantId: string;
  role: Role;
  createdAt: string;
}

/**
 * Default role → permission matrix, mirroring public.role_permissions for the
 * system roles (tenant_id is null on the remote). Used only as a local default;
 * server-side authorization is database-enforced via has_tenant_permission().
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // owner / admin: all permissions (cross join)
  owner: [...PERMISSIONS],
  admin: [...PERMISSIONS],
  manager: [
    "tenant.read",
    "tenant.settings.read",
    "brand.read",
    "cms.read",
    "cms.write",
    "media.read",
    "media.write",
    "catalog.read",
    "catalog.write",
    "orders.read",
    "orders.status.write",
    "members.read",
    "integrations.read",
    "audit.read",
    "crm.read",
    "crm.write",
    "booking.read",
    "booking.write",
    "quotes.read",
    "quotes.write",
  ],
  editor: [
    "tenant.read",
    "brand.read",
    "brand.write",
    "cms.read",
    "cms.write",
    "media.read",
    "media.write",
    "catalog.read",
  ],
  catalog_manager: ["tenant.read", "media.read", "media.write", "catalog.read", "catalog.write"],
  orders_manager: [
    "tenant.read",
    "catalog.read",
    "orders.read",
    "orders.create",
    "orders.status.write",
    "crm.read",
    "crm.write",
  ],
  support: [
    "tenant.read",
    "orders.read",
    "crm.read",
    "crm.write",
    "booking.read",
    "booking.write",
    "quotes.read",
  ],
  viewer: [
    "tenant.read",
    "tenant.settings.read",
    "brand.read",
    "cms.read",
    "media.read",
    "catalog.read",
    "orders.read",
    "members.read",
    "integrations.read",
    "billing.read",
    "audit.read",
    "crm.read",
    "booking.read",
    "quotes.read",
  ],
};
