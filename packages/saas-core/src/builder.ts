import { assertTenantPermission } from "./authorization";
import type { Membership, Permission } from "./member";

/**
 * Site Builder domain contracts.
 *
 * This module is intentionally infrastructure-agnostic. Database RLS remains the
 * enforcement authority; these helpers add a fail-closed application boundary
 * for tenant-scoped Builder operations and the revision lifecycle.
 */

export type BuilderRevisionStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "rolled_back";

export interface BuilderRevision {
  id: string;
  tenantId: string;
  verticalKey: string;
  revision: number;
  status: BuilderRevisionStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  previousPublishedRevisionId?: string;
}

export interface BuilderScope {
  tenantId: string;
  verticalKey: string;
}

const VERTICAL_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALLOWED_TRANSITIONS: Readonly<
  Record<BuilderRevisionStatus, readonly BuilderRevisionStatus[]>
> = {
  draft: ["in_review"],
  in_review: ["draft", "approved"],
  approved: ["draft", "published"],
  published: ["rolled_back"],
  rolled_back: [],
};

export function assertBuilderScope(scope: BuilderScope): void {
  if (!scope.tenantId.trim()) {
    throw new Error("Builder scope requires tenantId");
  }

  if (!VERTICAL_KEY_PATTERN.test(scope.verticalKey)) {
    throw new Error("Builder scope requires a canonical verticalKey");
  }
}

/**
 * Builder authorization boundary.
 *
 * The caller must request one of the existing canonical permission keys; this
 * deliberately does not invent Builder-only permissions that are absent from
 * the live permission catalog.
 */
export function assertBuilderPermission(
  membership: Membership | undefined,
  tenantId: string,
  permission: Permission,
): void {
  assertTenantPermission(membership, tenantId, permission);
}

export function canTransitionBuilderRevision(
  from: BuilderRevisionStatus,
  to: BuilderRevisionStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function transitionBuilderRevision(
  revision: BuilderRevision,
  nextStatus: BuilderRevisionStatus,
  now: string,
): BuilderRevision {
  assertBuilderScope(revision);

  if (!canTransitionBuilderRevision(revision.status, nextStatus)) {
    throw new Error(
      `Invalid builder revision transition: ${revision.status} -> ${nextStatus}`,
    );
  }

  return {
    ...revision,
    status: nextStatus,
    updatedAt: now,
    ...(nextStatus === "published" ? { publishedAt: now } : {}),
  };
}

/**
 * Creates the next draft without mutating the prior revision.
 *
 * A published revision becomes the rollback anchor. For non-published source
 * revisions, an existing rollback anchor is preserved.
 */
export function createNextBuilderRevision(
  previous: BuilderRevision,
  input: { id: string; now: string },
): BuilderRevision {
  assertBuilderScope(previous);

  if (!input.id.trim()) {
    throw new Error("Builder revision requires id");
  }

  if (!Number.isInteger(previous.revision) || previous.revision < 1) {
    throw new Error("Builder revision number must be a positive integer");
  }

  return {
    id: input.id,
    tenantId: previous.tenantId,
    verticalKey: previous.verticalKey,
    revision: previous.revision + 1,
    status: "draft",
    createdAt: input.now,
    updatedAt: input.now,
    previousPublishedRevisionId:
      previous.status === "published"
        ? previous.id
        : previous.previousPublishedRevisionId,
  };
}
