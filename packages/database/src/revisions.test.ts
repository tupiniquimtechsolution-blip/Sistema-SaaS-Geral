import { describe, expect, it } from "vitest";
import type { PageBundle } from "./cms";
import { assertPageRevisionSnapshot, buildPageRevisionSnapshot } from "./revisions";

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
      content: { text: "B" },
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

describe("page revision snapshots", () => {
  it("builds an immutable-shaped snapshot without database ids", () => {
    const snapshot = buildPageRevisionSnapshot(bundle);
    expect(snapshot.page.title).toBe("Home");
    expect(snapshot.sections.map((section) => section.position)).toEqual([0, 1]);
    expect(snapshot.sections[0]).not.toHaveProperty("id");
    expect(snapshot.sections[0]).not.toHaveProperty("tenant_id");
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
});
