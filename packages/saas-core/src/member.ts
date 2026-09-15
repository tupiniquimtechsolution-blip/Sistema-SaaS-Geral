/**
 * Identity & RBAC contracts — ALIGNED with the LIVE remote Supabase state
 * (project mmykyzzkcugxunmekwew; live catalog queried directly 2026-09-15).
 *
 * LIVE = 42 permissions. The earlier 28-key mirror reflected the historical
 * branch snapshot (chatgpt/supabase-vercel-foundation @ a3b2b1f), not the live
 * database; live database state prevails (ratified rule).
 *
 * Source of truth: public.permissions / public.roles / public.role_permissions
 * on the remote database. This file MIRRORS that catalog for TypeScript use;
 * the database remains the enforcement authority (RLS + has_tenant_permission()).
 *
 * Drift history: docs/PERMISSION_ALIGNMENT.md
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
 * Exact mirror of the 42 LIVE permission keys (remote public.permissions).
 * DO NOT invent keys here. New permissions must be added to the remote catalog
 * first, then mirrored into this union and docs/PERMISSION_ALIGNMENT.md.
 */
export type Permission =
  | "audit.read"
  | "billing.read"
  | "billing.write"
  | "booking.read"
  | "booking.write"
  | "brand.read"
  | "brand.write"
  | "catalog.read"
  | "catalog.write"
  | "cms.read"
  | "cms.write"
  | "crm.read"
  | "crm.write"
  | "documents.read"
  | "documents.write"
  | "events.read"
  | "events.write"
  | "integrations.read"
  | "integrations.write"
  | "loyalty.read"
  | "loyalty.write"
  | "media.read"
  | "media.write"
  | "members.invite"
  | "members.read"
  | "members.roles.write"
  | "orders.create"
  | "orders.read"
  | "orders.status.write"
  | "pets.read"
  | "pets.write"
  | "projects.read"
  | "projects.write"
  | "quotes.read"
  | "quotes.write"
  | "religious.sensitive.read"
  | "religious.sensitive.write"
  | "support.read"
  | "support.write"
  | "tenant.read"
  | "tenant.settings.read"
  | "tenant.settings.write";

/** All 42 canonical permission keys (live mirror of public.permissions). */
export const PERMISSIONS: readonly Permission[] = [
  "audit.read",
  "billing.read",
  "billing.write",
  "booking.read",
  "booking.write",
  "brand.read",
  "brand.write",
  "catalog.read",
  "catalog.write",
  "cms.read",
  "cms.write",
  "crm.read",
  "crm.write",
  "documents.read",
  "documents.write",
  "events.read",
  "events.write",
  "integrations.read",
  "integrations.write",
  "loyalty.read",
  "loyalty.write",
  "media.read",
  "media.write",
  "members.invite",
  "members.read",
  "members.roles.write",
  "orders.create",
  "orders.read",
  "orders.status.write",
  "pets.read",
  "pets.write",
  "projects.read",
  "projects.write",
  "quotes.read",
  "quotes.write",
  "religious.sensitive.read",
  "religious.sensitive.write",
  "support.read",
  "support.write",
  "tenant.read",
  "tenant.settings.read",
  "tenant.settings.write",
] as const;

/** Permission keys that gate sensitive religious operations (triple-gated). */
export const RELIGIOUS_SENSITIVE_PERMISSIONS: readonly Permission[] = [
  "religious.sensitive.read",
  "religious.sensitive.write",
] as const;

export interface Membership {
  userId: string;
  tenantId: string;
  role: Role;
  createdAt: string;
}

/**
 * Default role → permission matrix, mirroring the LIVE public.role_permissions
 * for the system roles (remote counts: owner 42, admin 40, manager 32, editor 9,
 * catalog_manager 5, orders_manager 5, support 7, viewer 19).
 *
 * INTENTIONAL: admin does NOT hold religious.sensitive.* — sensitive religious
 * operations require the entitlement gate + religious.sensitive.* RBAC + correct
 * tenant membership (triple gate). Do not "fix" this asymmetry locally.
 *
 * Used only as a local default; server-side authorization is database-enforced
 * via has_tenant_permission().
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [...PERMISSIONS], // 42
  admin: [
    "audit.read",
    "billing.read",
    "billing.write",
    "booking.read",
    "booking.write",
    "brand.read",
    "brand.write",
    "catalog.read",
    "catalog.write",
    "cms.read",
    "cms.write",
    "crm.read",
    "crm.write",
    "documents.read",
    "documents.write",
    "events.read",
    "events.write",
    "integrations.read",
    "integrations.write",
    "loyalty.read",
    "loyalty.write",
    "media.read",
    "media.write",
    "members.invite",
    "members.read",
    "members.roles.write",
    "orders.create",
    "orders.read",
    "orders.status.write",
    "pets.read",
    "pets.write",
    "projects.read",
    "projects.write",
    "quotes.read",
    "quotes.write",
    "support.read",
    "support.write",
    "tenant.read",
    "tenant.settings.read",
    "tenant.settings.write",
  ], // 40 — deliberately excludes religious.sensitive.*
  manager: [
    "audit.read",
    "booking.read",
    "booking.write",
    "brand.read",
    "brand.write",
    "catalog.read",
    "catalog.write",
    "cms.read",
    "cms.write",
    "crm.read",
    "crm.write",
    "documents.read",
    "documents.write",
    "events.read",
    "events.write",
    "integrations.read",
    "loyalty.read",
    "loyalty.write",
    "media.read",
    "media.write",
    "orders.read",
    "orders.status.write",
    "pets.read",
    "pets.write",
    "projects.read",
    "projects.write",
    "quotes.read",
    "quotes.write",
    "support.read",
    "support.write",
    "tenant.read",
    "tenant.settings.read",
  ], // 32
  editor: [
    "brand.read",
    "brand.write",
    "catalog.read",
    "catalog.write",
    "cms.read",
    "cms.write",
    "media.read",
    "media.write",
    "tenant.read",
  ], // 9
  catalog_manager: [
    "catalog.read",
    "catalog.write",
    "media.read",
    "media.write",
    "tenant.read",
  ], // 5
  orders_manager: [
    "booking.read",
    "booking.write",
    "orders.read",
    "orders.status.write",
    "tenant.read",
  ], // 5
  support: [
    "booking.read",
    "crm.read",
    "crm.write",
    "orders.read",
    "support.read",
    "support.write",
    "tenant.read",
  ], // 7
  viewer: [
    "audit.read",
    "billing.read",
    "booking.read",
    "brand.read",
    "catalog.read",
    "cms.read",
    "crm.read",
    "documents.read",
    "events.read",
    "integrations.read",
    "loyalty.read",
    "media.read",
    "orders.read",
    "pets.read",
    "projects.read",
    "quotes.read",
    "support.read",
    "tenant.read",
    "tenant.settings.read",
  ], // 19
};
