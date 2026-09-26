import type { SupabaseClient } from "@supabase/supabase-js";
import type { PageRow, PageSectionRow } from "./rows";

const PAGE_COLUMNS = "id, tenant_id, slug, title, status, seo, published_at, created_by, updated_by, created_at, updated_at";
const SECTION_COLUMNS = "id, page_id, tenant_id, section_type, position, is_enabled, content, created_at, updated_at";
const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BUILDER_PAGE_STATUSES = new Set(["draft", "published"]);

export interface PageBundle {
  page: PageRow;
  sections: PageSectionRow[];
}

export type DraftPageBundle = PageBundle;

export interface CreateDraftPageInput {
  tenantId: string;
  userId: string;
  slug: string;
  title: string;
  seo?: Record<string, unknown>;
}

export interface UpdateDraftPageInput {
  tenantId: string;
  pageId: string;
  userId: string;
  title: string;
  seo?: Record<string, unknown>;
}

export interface AddDraftTextSectionInput {
  tenantId: string;
  pageId: string;
  text: string;
}

export function normalizeDraftSlug(value: string): string {
  const slug = value.trim().toLowerCase();
  if (!CANONICAL_SLUG.test(slug)) {
    throw new Error("Draft slug must be a canonical lowercase slug");
  }
  return slug;
}

export function assertTenantBuilderPageScope(page: PageRow, tenantId: string): PageRow {
  if (!tenantId || page.tenant_id !== tenantId) {
    throw new Error("Cross-tenant builder page access denied");
  }
  if (!BUILDER_PAGE_STATUSES.has(page.status)) {
    throw new Error("Builder page must be draft or published");
  }
  return page;
}

export function assertPrivateDraftScope(page: PageRow, tenantId: string): PageRow {
  assertTenantBuilderPageScope(page, tenantId);
  if (page.status !== "draft") {
    throw new Error("Private preview requires a draft page");
  }
  return page;
}

function requireTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new Error("Draft title is required");
  return title;
}

export async function fetchTenantBuilderPages(
  client: SupabaseClient,
  tenantId: string,
): Promise<PageRow[]> {
  if (!tenantId) return [];
  const { data, error } = await client
    .from("pages")
    .select(PAGE_COLUMNS)
    .eq("tenant_id", tenantId)
    .in("status", ["draft", "published"])
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`builder pages read failed: ${error.message}`);
  return ((data ?? []) as PageRow[]).map((page) => assertTenantBuilderPageScope(page, tenantId));
}

export async function fetchTenantDraftPages(
  client: SupabaseClient,
  tenantId: string,
): Promise<PageRow[]> {
  if (!tenantId) return [];
  const { data, error } = await client
    .from("pages")
    .select(PAGE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`draft pages read failed: ${error.message}`);
  return ((data ?? []) as PageRow[]).map((page) => assertPrivateDraftScope(page, tenantId));
}

export async function fetchTenantPageBundle(
  client: SupabaseClient,
  tenantId: string,
  pageId: string,
): Promise<PageBundle | null> {
  if (!tenantId || !pageId) return null;
  const { data: pageData, error: pageError } = await client
    .from("pages")
    .select(PAGE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", pageId)
    .in("status", ["draft", "published"])
    .maybeSingle();
  if (pageError) throw new Error(`builder page read failed: ${pageError.message}`);
  if (!pageData) return null;

  const page = assertTenantBuilderPageScope(pageData as PageRow, tenantId);
  const { data: sectionData, error: sectionError } = await client
    .from("page_sections")
    .select(SECTION_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("page_id", pageId)
    .order("position", { ascending: true });
  if (sectionError) throw new Error(`builder page sections read failed: ${sectionError.message}`);

  const sections = ((sectionData ?? []) as PageSectionRow[]).filter(
    (section) => section.tenant_id === tenantId && section.page_id === pageId,
  );
  return { page, sections };
}

export async function fetchPrivateDraftPage(
  client: SupabaseClient,
  tenantId: string,
  pageId: string,
): Promise<DraftPageBundle | null> {
  const bundle = await fetchTenantPageBundle(client, tenantId, pageId);
  if (!bundle) return null;
  assertPrivateDraftScope(bundle.page, tenantId);
  return bundle;
}

export async function createTenantDraftPage(
  client: SupabaseClient,
  input: CreateDraftPageInput,
): Promise<PageRow> {
  if (!input.tenantId || !input.userId) throw new Error("Authenticated tenant context is required");
  const slug = normalizeDraftSlug(input.slug);
  const title = requireTitle(input.title);
  const { data, error } = await client
    .from("pages")
    .insert({
      tenant_id: input.tenantId,
      slug,
      title,
      status: "draft",
      seo: input.seo ?? {},
      created_by: input.userId,
      updated_by: input.userId,
    })
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(`draft page create failed: ${error.message}`);
  return assertPrivateDraftScope(data as PageRow, input.tenantId);
}

export async function updateTenantDraftPage(
  client: SupabaseClient,
  input: UpdateDraftPageInput,
): Promise<PageRow> {
  if (!input.tenantId || !input.pageId || !input.userId) {
    throw new Error("Authenticated tenant draft context is required");
  }
  const { data, error } = await client
    .from("pages")
    .update({
      title: requireTitle(input.title),
      seo: input.seo ?? {},
      updated_by: input.userId,
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.pageId)
    .eq("status", "draft")
    .select(PAGE_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(`draft page update failed: ${error.message}`);
  if (!data) throw new Error("Draft page not found or not writable");
  return assertPrivateDraftScope(data as PageRow, input.tenantId);
}

export async function addDraftTextSection(
  client: SupabaseClient,
  input: AddDraftTextSectionInput,
): Promise<PageSectionRow> {
  const text = input.text.trim();
  if (!text) throw new Error("Section text is required");
  const bundle = await fetchPrivateDraftPage(client, input.tenantId, input.pageId);
  if (!bundle) throw new Error("Draft page not found or not previewable");
  const position = bundle.sections.reduce((max, section) => Math.max(max, section.position), -1) + 1;
  const { data, error } = await client
    .from("page_sections")
    .insert({
      tenant_id: input.tenantId,
      page_id: input.pageId,
      section_type: "richText",
      position,
      is_enabled: true,
      content: { text },
    })
    .select(SECTION_COLUMNS)
    .single();
  if (error) throw new Error(`draft section create failed: ${error.message}`);
  const section = data as PageSectionRow;
  if (section.tenant_id !== input.tenantId || section.page_id !== input.pageId) {
    throw new Error("Cross-tenant draft section access denied");
  }
  return section;
}
