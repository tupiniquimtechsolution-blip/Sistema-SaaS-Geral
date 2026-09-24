import { describe, expect, it } from "vitest";
import { assertPrivateDraftScope, normalizeDraftSlug } from "./cms";
import type { PageRow } from "./rows";

const draft: PageRow = {
  id: "page-1",
  tenant_id: "tenant-a",
  slug: "home",
  title: "Home",
  status: "draft",
  seo: {},
  published_at: null,
  created_by: "user-1",
  updated_by: "user-1",
  created_at: "2026-09-22T00:00:00.000Z",
  updated_at: "2026-09-22T00:00:00.000Z",
};

describe("CMS draft guardrails", () => {
  it("normalizes canonical draft slugs", () => {
    expect(normalizeDraftSlug("  Minha-Pagina ")).toBe("minha-pagina");
  });

  it("rejects unsafe draft slugs", () => {
    expect(() => normalizeDraftSlug("Minha Página")).toThrow("canonical lowercase slug");
  });

  it("accepts a draft inside the selected tenant", () => {
    expect(assertPrivateDraftScope(draft, "tenant-a")).toBe(draft);
  });

  it("rejects cross-tenant draft access", () => {
    expect(() => assertPrivateDraftScope(draft, "tenant-b")).toThrow("Cross-tenant");
  });

  it("rejects published pages from the private-draft path", () => {
    expect(() => assertPrivateDraftScope({ ...draft, status: "published" }, "tenant-a")).toThrow(
      "requires a draft page",
    );
  });
});
