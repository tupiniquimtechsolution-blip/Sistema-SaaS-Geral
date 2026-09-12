export type Role = "owner" | "admin" | "manager" | "editor" | "catalog_manager" | "orders_manager" | "support" | "viewer";

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
  | "audit.read";

export interface Membership {
  userId: string;
  tenantId: string;
  role: Role;
  createdAt: string;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
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
  ],
  admin: [
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
    "members.roles.write",
    "integrations.read",
    "integrations.write",
    "billing.read",
    "audit.read",
  ],
  manager: ["tenant.read", "brand.read", "cms.read", "catalog.read", "orders.read", "members.read", "audit.read"],
  editor: ["tenant.read", "brand.read", "cms.read", "cms.write", "catalog.read", "catalog.write"],
  catalog_manager: ["tenant.read", "brand.read", "catalog.read", "catalog.write", "media.read"],
  orders_manager: ["tenant.read", "orders.read", "orders.create", "orders.status.write"],
  support: ["tenant.read", "orders.read", "members.read"],
  viewer: ["tenant.read"],
};
