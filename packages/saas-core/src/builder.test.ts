import { describe, expect, it } from "vitest";
import type { Membership } from "./member";
import {
  assertBuilderPermission,
  assertBuilderScope,
  canTransitionBuilderRevision,
  createNextBuilderRevision,
  transitionBuilderRevision,
  type BuilderRevision,
} from "./builder";

const editor: Membership = {
  userId: "user-1",
  tenantId: "tenant-a",
  role: "editor",
  createdAt: "2026-09-22T00:00:00.000Z",
};

const published: BuilderRevision = {
  id: "revision-3",
  tenantId: "tenant-a",
  verticalKey: "bakery",
  revision: 3,
  status: "published",
  createdAt: "2026-09-22T10:00:00.000Z",
  updatedAt: "2026-09-22T11:00:00.000Z",
  publishedAt: "2026-09-22T11:00:00.000Z",
};

describe("builder tenant boundary", () => {
  it("accepts canonical tenant + vertical scope", () => {
    expect(() =>
      assertBuilderScope({ tenantId: "tenant-a", verticalKey: "religious-house" }),
    ).not.toThrow();
  });

  it("rejects invalid or tenant-specific vertical keys", () => {
    expect(() =>
      assertBuilderScope({ tenantId: "tenant-a", verticalKey: "Cliente X" }),
    ).toThrow("canonical verticalKey");
  });

  it("allows an existing permission inside the same tenant", () => {
    expect(() =>
      assertBuilderPermission(editor, "tenant-a", "cms.write"),
    ).not.toThrow();
  });

  it("denies cross-tenant access even when the role has the permission", () => {
    expect(() =>
      assertBuilderPermission(editor, "tenant-b", "cms.write"),
    ).toThrow("cross-tenant");
  });

  it("denies a missing permission", () => {
    expect(() =>
      assertBuilderPermission(editor, "tenant-a", "billing.write"),
    ).toThrow("missing permission");
  });
});

describe("builder revision lifecycle", () => {
  it("requires review and approval before publish", () => {
    expect(canTransitionBuilderRevision("draft", "published")).toBe(false);
    expect(canTransitionBuilderRevision("draft", "in_review")).toBe(true);
    expect(canTransitionBuilderRevision("in_review", "approved")).toBe(true);
    expect(canTransitionBuilderRevision("approved", "published")).toBe(true);
  });

  it("rejects an invalid transition", () => {
    expect(() =>
      transitionBuilderRevision(
        { ...published, status: "draft" },
        "published",
        "2026-09-22T12:00:00.000Z",
      ),
    ).toThrow("Invalid builder revision transition");
  });

  it("marks publication time only on the approved -> published transition", () => {
    const approved = { ...published, status: "approved" as const, publishedAt: undefined };
    const next = transitionBuilderRevision(
      approved,
      "published",
      "2026-09-22T12:00:00.000Z",
    );

    expect(next.status).toBe("published");
    expect(next.publishedAt).toBe("2026-09-22T12:00:00.000Z");
  });

  it("creates an immutable next draft and keeps the published revision as rollback anchor", () => {
    const next = createNextBuilderRevision(published, {
      id: "revision-4",
      now: "2026-09-22T12:30:00.000Z",
    });

    expect(next).toEqual({
      id: "revision-4",
      tenantId: "tenant-a",
      verticalKey: "bakery",
      revision: 4,
      status: "draft",
      createdAt: "2026-09-22T12:30:00.000Z",
      updatedAt: "2026-09-22T12:30:00.000Z",
      previousPublishedRevisionId: "revision-3",
    });
    expect(published.status).toBe("published");
  });

  it("allows rollback only from a published revision", () => {
    expect(canTransitionBuilderRevision("published", "rolled_back")).toBe(true);
    expect(canTransitionBuilderRevision("approved", "rolled_back")).toBe(false);
  });
});
