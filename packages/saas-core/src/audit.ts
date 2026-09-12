/**
 * Audit contracts — append-oriented trail for privileged actions.
 * Never log secrets, tokens or sensitive payment data.
 */

export type AuditAction =
  | "tenant.created"
  | "tenant.status_changed"
  | "brand.updated"
  | "theme.updated"
  | "cms.published"
  | "media.uploaded"
  | "media.replaced"
  | "media.deleted"
  | "member.invited"
  | "member.role_changed"
  | "catalog.mutated"
  | "order.status_changed"
  | "integration.mutated"
  | "billing.mutated"
  | "superadmin.action";

export interface AuditEntry {
  id: string;
  tenantId: string;
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  /** Minimal diff metadata only — never raw secrets/PII payloads. */
  metadata?: Record<string, unknown>;
  requestId?: string;
  createdAt: string;
}

const FORBIDDEN_METADATA_KEYS = ["password", "token", "secret", "authorization", "apiKey", "creditCard"];

/** Defensive filter: strips forbidden keys from audit metadata before persisting. */
export function sanitizeAuditMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    // Normalize separators (api_key -> apikey) so snake_case secrets cannot evade the filter.
    const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (FORBIDDEN_METADATA_KEYS.some((f) => normalized.includes(f.toLowerCase()))) continue;
    out[k] = v;
  }
  return out;
}
