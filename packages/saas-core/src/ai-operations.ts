/**
 * AI Tenant Studio operation contracts.
 *
 * Pure policy layer: no provider SDK and no database authority here.
 * Server/RLS enforcement remains mandatory at execution time.
 */
import type { Permission } from "./member";

export type AiOperationRisk = "low" | "medium" | "high" | "critical";

export type ProposedAiCapability =
  | "ai.chat.enabled"
  | "ai.contentEdit.enabled"
  | "ai.catalogEdit.enabled"
  | "ai.media.enabled"
  | "ai.sectionEdit.enabled"
  | "ai.design.enabled"
  | "ai.redesign.enabled"
  | "ai.bulkEdit.enabled"
  | "ai.publish.enabled";

export type AiOperationKey =
  | "updateContentField"
  | "updateProductPrice"
  | "replaceMedia"
  | "updateBusinessHours"
  | "updateThemeTokens"
  | "addRegisteredSection"
  | "reorderSections"
  | "proposePageRedesign"
  | "previewRevision"
  | "submitRevision"
  | "publishApprovedRevision";

export interface AiOperationPolicy {
  key: AiOperationKey;
  permission: Permission;
  capability: ProposedAiCapability;
  risk: AiOperationRisk;
  confirmationRequired: boolean;
}

export const AI_OPERATION_POLICIES: Readonly<Record<AiOperationKey, AiOperationPolicy>> = {
  updateContentField: { key: "updateContentField", permission: "cms.write", capability: "ai.contentEdit.enabled", risk: "low", confirmationRequired: false },
  updateProductPrice: { key: "updateProductPrice", permission: "catalog.write", capability: "ai.catalogEdit.enabled", risk: "medium", confirmationRequired: true },
  replaceMedia: { key: "replaceMedia", permission: "media.write", capability: "ai.media.enabled", risk: "medium", confirmationRequired: true },
  updateBusinessHours: { key: "updateBusinessHours", permission: "tenant.settings.write", capability: "ai.contentEdit.enabled", risk: "medium", confirmationRequired: true },
  updateThemeTokens: { key: "updateThemeTokens", permission: "brand.write", capability: "ai.design.enabled", risk: "high", confirmationRequired: true },
  addRegisteredSection: { key: "addRegisteredSection", permission: "cms.write", capability: "ai.sectionEdit.enabled", risk: "medium", confirmationRequired: true },
  reorderSections: { key: "reorderSections", permission: "cms.write", capability: "ai.sectionEdit.enabled", risk: "medium", confirmationRequired: true },
  proposePageRedesign: { key: "proposePageRedesign", permission: "cms.write", capability: "ai.redesign.enabled", risk: "high", confirmationRequired: true },
  previewRevision: { key: "previewRevision", permission: "cms.read", capability: "ai.chat.enabled", risk: "low", confirmationRequired: false },
  submitRevision: { key: "submitRevision", permission: "cms.write", capability: "ai.sectionEdit.enabled", risk: "medium", confirmationRequired: true },
  publishApprovedRevision: { key: "publishApprovedRevision", permission: "cms.write", capability: "ai.publish.enabled", risk: "high", confirmationRequired: true },
};

export interface AiOperationContext {
  actorUserId: string;
  tenantId: string;
  requestedTenantId: string;
  grantedPermissions: readonly Permission[];
  grantedCapabilities: readonly string[];
  confirmed: boolean;
}

/**
 * Application-level fail-closed gate. The execution boundary MUST re-check
 * membership/RBAC/entitlement against server state and RLS.
 */
export function authorizeAiOperation(key: AiOperationKey, context: AiOperationContext): AiOperationPolicy {
  const policy = AI_OPERATION_POLICIES[key];
  if (!context.actorUserId.trim() || !context.tenantId.trim()) throw new Error("AI operation requires authenticated tenant context");
  if (context.tenantId !== context.requestedTenantId) throw new Error("Access denied: cross-tenant AI operation");
  if (!context.grantedPermissions.includes(policy.permission)) throw new Error(`Access denied: missing permission ${policy.permission}`);
  if (!context.grantedCapabilities.includes(policy.capability)) throw new Error(`Entitlement required: ${policy.capability}`);
  if (policy.confirmationRequired && !context.confirmed) throw new Error("Explicit confirmation required");
  return policy;
}
