import { describe, expect, it } from "vitest";
import type { Page, PageSection } from "./cms";
import { publishedSections } from "./cms";

function section(partial: Partial<PageSection>): PageSection {
  return { id: "s", type: "richText", position: 0, enabled: true, ...partial };
}

const page: Page = {
  id: "p1",
  tenantId: "t-1",
  slug: "home",
  title: "Home",
  status: "published",
  sections: [
    section({ id: "s2", type: "cta", position: 2 }),
    section({ id: "s1", type: "hero", position: 1 }),
    section({ id: "s3", type: "gallery", position: 3, enabled: false }),
  ],
  createdAt: "2026-09-12T00:00:00.000Z",
  updatedAt: "2026-09-12T00:00:00.000Z",
};

describe("cms published sections", () => {
  it("returns only enabled sections of published pages, ordered", () => {
    const out = publishedSections(page);
    expect(out.map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("returns nothing for draft pages", () => {
    expect(publishedSections({ ...page, status: "draft" })).toEqual([]);
  });
});
