import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageBundle } from "./cms";
import type { PageRevisionRow } from "./rows";
import {
  appendPageRevisionSection,
  assertPageRevisionScope,
  assertPageRevisionSnapshot,
  buildPageRevisionSnapshot,
  movePageRevisionSection,
  setPageRevisionSectionEnabled,
  updateDraftPageRevision,
  updatePageRevisionSection,
  updatePageRevisionSectionContentValue,
} from "./revisions";

const bundle: PageBundle = {
  page: {
    id: "page-1",
    tenant_id: "tenant-a",
    slug: "home",
    title: " Home ",
    status: "published",
    seo: { description: "demo" },
    published_at: "2026-09-22T00:00:00.000Z",
    created_by: "user-1",
    updated_by: "user-1",
    created_at: "2026-09-22T00:00:00.000Z",
    updated_at: "2026-09-22T00:00:00.000Z",
  },
  sections: [
    {
      id: "section-2",
      page_id: "page-1",
      tenant_id: "tenant-a",
      section_type: "richText",
      position: 1,
      is_enabled: true,
      content: { text: "B", nested: { label: "keep" } },
      created_at: "2026-09-22T00:00:00.000Z",
      updated_at: "2026-09-22T00:00:00.000Z",
    },
    {
      id: "section-1",
      page_id: "page-1",
      tenant_id: "tenant-a",
      section_type: "hero",
      position: 0,
      is_enabled: true,
      content: { headline: "A" },
      created_at: "2026-09-22T00:00:00.000Z",
      updated_at: "2026-09-22T00:00:00.000Z",
    },
  ],
};

function revisionRow(snapshot = buildPageRevisionSnapshot(bundle)): PageRevisionRow {
  return {
    id: "revision-1",
    tenant_id: "tenant-a",
    page_id: "page-1",
    revision: 1,
    status: "draft",
    snapshot,
    source_revision_id: null,
    created_by: "user-1",
    updated_by: "user-1",
    submitted_by: null,
    approved_by: null,
    published_by: null,
    published_at: null,
    created_at: "2026-09-22T00:00:00.000Z",
    updated_at: "2026-09-22T00:00:00.000Z",
  };
}

describe("page revision snapshots", () => {
  it("builds an immutable-shaped snapshot without database ids", () => {
    const snapshot = buildPageRevisionSnapshot(bundle);
    expect(snapshot.page.title).toBe("Home");
    expect(snapshot.sections.map((section) => section.position)).toEqual([0, 1]);
    expect(snapshot.sections[0]).not.toHaveProperty("id");
    expect(snapshot.sections[0]).not.toHaveProperty("tenant_id");

    const nested = snapshot.sections[1].content.nested as { label: string };
    nested.label = "changed";
    expect((bundle.sections[0].content.nested as { label: string }).label).toBe("keep");
  });

  it("rejects duplicate section positions", () => {
    const snapshot = buildPageRevisionSnapshot(bundle);
    snapshot.sections[1] = { ...snapshot.sections[1], position: 0 };
    expect(() => assertPageRevisionSnapshot(snapshot)).toThrow("positions must be unique");
  });

  it("rejects non canonical slugs", () => {
    const snapshot = buildPageRevisionSnapshot(bundle);
    snapshot.page.slug = "Página Inicial";
    expect(() => assertPageRevisionSnapshot(snapshot)).toThrow("canonical lowercase slug");
  });

  it("edits arbitrary section content without mutating the source snapshot", () => {
    const source = buildPageRevisionSnapshot(bundle);
    const edited = updatePageRevisionSectionContentValue(source, 0, "headline", "Novo título");
    expect(edited.sections[0].content.headline).toBe("Novo título");
    expect(source.sections[0].content.headline).toBe("A");
  });

  it("updates type and visibility while preserving section content", () => {
    const source = buildPageRevisionSnapshot(bundle);
    const edited = updatePageRevisionSection(source, 1, {
      sectionType: "featureGrid",
      isEnabled: false,
    });
    expect(edited.sections[1].section_type).toBe("featureGrid");
    expect(edited.sections[1].is_enabled).toBe(false);
    expect(edited.sections[1].content.text).toBe("B");
  });

  it("moves sections and reindexes positions deterministically", () => {
    const source = buildPageRevisionSnapshot(bundle);
    const moved = movePageRevisionSection(source, 1, "up");
    expect(moved.sections.map((section) => section.section_type)).toEqual(["richText", "hero"]);
    expect(moved.sections.map((section) => section.position)).toEqual([0, 1]);
    expect(source.sections.map((section) => section.section_type)).toEqual(["hero", "richText"]);
  });

  it("toggles section visibility and appends an enabled rich text section", () => {
    const source = buildPageRevisionSnapshot(bundle);
    const hidden = setPageRevisionSectionEnabled(source, 0, false);
    const appended = appendPageRevisionSection(hidden, { content: { text: "Nova seção" } });
    expect(appended.sections[0].is_enabled).toBe(false);
    expect(appended.sections[2]).toMatchObject({
      section_type: "richText",
      position: 2,
      is_enabled: true,
      content: { text: "Nova seção" },
    });
  });
});

describe("page revision isolation and persistence", () => {
  it("denies a revision returned for another tenant or page", () => {
    const revision = revisionRow();
    expect(() => assertPageRevisionScope(revision, "tenant-b", "page-1")).toThrow("Cross-tenant");
    expect(() => assertPageRevisionScope(revision, "tenant-a", "page-2")).toThrow("Cross-page");
  });

  it("persists a draft only through tenant + page + revision + draft filters", async () => {
    const filters: Array<[string, unknown]> = [];
    const updates: unknown[] = [];
    const row = revisionRow();

    const chain = {
      update(value: unknown) {
        updates.push(value);
        return this;
      },
      eq(column: string, value: unknown) {
        filters.push([column, value]);
        return this;
      },
      select() {
        return this;
      },
      async maybeSingle() {
        return { data: row, error: null };
      },
    };
    const client = {
      from(table: string) {
        expect(table).toBe("page_revisions");
        return chain;
      },
    } as unknown as SupabaseClient;

    const snapshot = setPageRevisionSectionEnabled(buildPageRevisionSnapshot(bundle), 0, false);
    const saved = await updateDraftPageRevision(client, {
      tenantId: "tenant-a",
      pageId: "page-1",
      revisionId: "revision-1",
      snapshot,
    });

    expect(filters).toEqual([
      ["tenant_id", "tenant-a"],
      ["page_id", "page-1"],
      ["id", "revision-1"],
      ["status", "draft"],
    ]);
    expect(updates).toHaveLength(1);
    expect(saved.tenant_id).toBe("tenant-a");
  });

  it("fails closed if persistence returns a row from another tenant", async () => {
    const row = { ...revisionRow(), tenant_id: "tenant-b" };
    const chain = {
      update() { return this; },
      eq() { return this; },
      select() { return this; },
      async maybeSingle() { return { data: row, error: null }; },
    };
    const client = { from: () => chain } as unknown as SupabaseClient;

    await expect(updateDraftPageRevision(client, {
      tenantId: "tenant-a",
      pageId: "page-1",
      revisionId: "revision-1",
      snapshot: buildPageRevisionSnapshot(bundle),
    })).rejects.toThrow("Cross-tenant");
  });
});
