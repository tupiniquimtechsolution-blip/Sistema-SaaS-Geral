import { describe, expect, it } from "vitest";
import type { PageRevisionSnapshot } from "tupiniquim-database";
import { isRevisionSnapshotDirty } from "./revision-dirty";

const postgresJsonbOrder = {
  sections: [{
    content: { text: "QA editorial text", title: "Published text" },
    is_enabled: true,
    position: 0,
    section_type: "richText",
  }],
  page: {
    seo: { description: "Verified", title: "QA" },
    title: "QA salon",
    slug: "inicio",
  },
} as PageRevisionSnapshot;

const builderOrder = {
  page: {
    slug: "inicio",
    title: "QA salon",
    seo: { title: "QA", description: "Verified" },
  },
  sections: [{
    section_type: "richText",
    position: 0,
    is_enabled: true,
    content: { title: "Published text", text: "QA editorial text" },
  }],
} as PageRevisionSnapshot;

describe("Builder draft dirty state after Supabase JSONB roundtrip", () => {
  it("does not remain dirty merely because JSONB reorders keys", () => {
    expect(isRevisionSnapshotDirty(builderOrder, postgresJsonbOrder)).toBe(false);
    expect(isRevisionSnapshotDirty(postgresJsonbOrder, builderOrder)).toBe(false);
  });

  it("detects edited text, visibility changes and actual SEO changes", () => {
    expect(isRevisionSnapshotDirty({
      ...builderOrder,
      sections: [{ ...builderOrder.sections[0], content: { text: "New text" } }],
    }, postgresJsonbOrder)).toBe(true);

    expect(isRevisionSnapshotDirty({
      ...builderOrder,
      sections: [{ ...builderOrder.sections[0], is_enabled: false }],
    }, postgresJsonbOrder)).toBe(true);

    expect(isRevisionSnapshotDirty({
      ...builderOrder,
      page: { ...builderOrder.page, title: "Changed" },
    }, postgresJsonbOrder)).toBe(true);
  });

  it("never confuses missing sections with a saved section", () => {
    expect(isRevisionSnapshotDirty({ ...builderOrder, sections: [] }, postgresJsonbOrder)).toBe(true);
  });
});
