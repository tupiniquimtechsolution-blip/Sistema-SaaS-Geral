import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadPublicSalonPage,
  projectPublicSalonSections,
} from "../apps/salon/src/business/public-cms.ts";

const TENANT = "f92215f9-da30-4453-9190-aece00984284";
const FOREIGN = "a8494bfa-ac05-478c-b06f-3031e0d2cb8c";
const PAGE = "12345678-1234-4234-8234-123456789abc";

function section(overrides = {}) {
  return {
    id: "section-a",
    page_id: PAGE,
    tenant_id: TENANT,
    section_type: "text",
    position: 1,
    is_enabled: true,
    content: { title: "<script>alert('x')</script>", text: "Public editorial content" },
    ...overrides,
  };
}

function mockClient({ page, pageError = null, sections = [], sectionError = null }) {
  const requests = [];
  const client = {
    from(table) {
      assert.ok(["pages", "page_sections"].includes(table));
      const request = { table, filters: [], selected: "" };
      requests.push(request);
      const query = {
        select(fields) { request.selected = fields; return query; },
        eq(field, value) { request.filters.push([field, value]); return query; },
        limit(n) { assert.equal(n, 1); return query; },
        maybeSingle: async () => ({ data: page, error: pageError }),
        order: async (field, opts) => {
          assert.equal(field, "position");
          assert.deepEqual(opts, { ascending: true });
          return { data: sections, error: sectionError };
        },
      };
      return query;
    },
  };
  return { client, requests };
}

test("public CMS exposes only enabled, same-page same-tenant plain text", () => {
  const sections = projectPublicSalonSections(
    [section({ position: 2 }), section({ id: "section-b", position: 1 })],
    TENANT,
    PAGE,
  );
  assert.equal(sections.length, 2);
  assert.equal(sections[0].id, "section-b");
  assert.equal(sections[0].title, "<script>alert('x')</script>");
  assert.equal(sections[0].text, "Public editorial content");
  assert.equal(Object.hasOwn(sections[0], "content"), false);
});

test("public CMS rejects foreign, disabled or malformed returned sections", () => {
  for (const row of [
    section({ tenant_id: FOREIGN }),
    section({ page_id: "foreign-page" }),
    section({ is_enabled: false }),
    section({ content: "untrusted" }),
    section({ position: "1" }),
  ]) {
    assert.throws(() => projectPublicSalonSections([row], TENANT, PAGE), /Untrusted/);
  }
  assert.throws(() => projectPublicSalonSections(null, TENANT, PAGE), /Invalid/);
});

test("unpublished or absent homepage is not displayed publicly", async () => {
  const a = mockClient({ page: null });
  assert.deepEqual(await loadPublicSalonPage(a.client, TENANT), { status: "empty" });
  assert.equal(a.requests.length, 1);
  assert.deepEqual(a.requests[0].filters, [
    ["tenant_id", TENANT],
    ["slug", "inicio"],
    ["status", "published"],
  ]);

  const b = mockClient({ page: { id: PAGE, tenant_id: TENANT, slug: "inicio", title: "Draft", status: "draft" } });
  await assert.rejects(loadPublicSalonPage(b.client, TENANT), /Untrusted/);
});

test("published homepage selects only its own enabled sections", async () => {
  const { client, requests } = mockClient({
    page: { id: PAGE, tenant_id: TENANT, slug: "inicio", title: "Sobre o salão", status: "published" },
    sections: [section()],
  });
  const result = await loadPublicSalonPage(client, TENANT);
  assert.deepEqual(result, {
    status: "published",
    title: "Sobre o salão",
    sections: [{
      id: "section-a",
      sectionType: "text",
      title: "<script>alert('x')</script>",
      text: "Public editorial content",
      position: 1,
    }],
  });
  assert.deepEqual(requests[1].filters, [
    ["tenant_id", TENANT],
    ["page_id", PAGE],
    ["is_enabled", true],
  ]);
  assert.equal(requests[1].selected.includes("snapshot"), false);
});

test("queries fail closed on database errors, foreign payload and malformed UUID", async () => {
  await assert.rejects(loadPublicSalonPage(mockClient({ page: null, pageError: { code: "401" } }).client, TENANT), /Unable/);
  await assert.rejects(loadPublicSalonPage(mockClient({ page: { id: PAGE, tenant_id: FOREIGN, slug: "inicio", title: "Leak", status: "published" } }).client, TENANT), /Untrusted/);
  await assert.rejects(loadPublicSalonPage(mockClient({
    page: { id: PAGE, tenant_id: TENANT, slug: "inicio", title: "Published", status: "published" },
    sections: [section({ tenant_id: FOREIGN })],
  }).client, TENANT), /Untrusted/);
  await assert.rejects(loadPublicSalonPage(mockClient({ page: null }).client, "not-a-uuid"), /Invalid/);
});
