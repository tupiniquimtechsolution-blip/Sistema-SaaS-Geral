import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeDraftSlug, type PageBundle } from "./cms";
import type {
  PageRevisionRow,
  PageRevisionSnapshot,
  PageRevisionSnapshotSection,
  PageRevisionStatus,
} from "./rows";

const REVISION_COLUMNS = "id, tenant_id, page_id, revision, status, snapshot, source_revision_id, created_by, updated_by, submitted_by, approved_by, published_by, published_at, created_at, updated_at";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneRevisionValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => cloneRevisionValue(item));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneRevisionValue(item)]),
    );
  }
  return value;
}

function cloneRevisionRecord(value: Record<string, unknown>): Record<string, unknown> {
  return cloneRevisionValue(value) as Record<string, unknown>;
}

export function buildPageRevisionSnapshot(bundle: PageBundle): PageRevisionSnapshot {
  return {
    page: {
      slug: normalizeDraftSlug(bundle.page.slug),
      title: requireRevisionTitle(bundle.page.title),
      seo: cloneRevisionRecord(bundle.page.seo),
    },
    sections: [...bundle.sections]
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        section_type: section.section_type,
        position: section.position,
        is_enabled: section.is_enabled,
        content: cloneRevisionRecord(section.content),
      })),
  };
}

export function assertPageRevisionSnapshot(value: unknown): PageRevisionSnapshot {
  if (!isRecord(value) || !isRecord(value.page) || !Array.isArray(value.sections)) {
    throw new Error("Invalid page revision snapshot");
  }

  const seo = value.page.seo;
  if (!isRecord(seo)) throw new Error("Revision SEO must be an object");

  const positions = new Set<number>();
  const sections: PageRevisionSnapshotSection[] = value.sections.map((section) => {
    if (!isRecord(section) || !isRecord(section.content)) {
      throw new Error("Invalid revision section");
    }
    const sectionType = typeof section.section_type === "string" ? section.section_type.trim() : "";
    if (!sectionType) throw new Error("Revision section type is required");
    if (!Number.isInteger(section.position) || Number(section.position) < 0) {
      throw new Error("Revision section position must be a non-negative integer");
    }
    const position = Number(section.position);
    if (positions.has(position)) throw new Error("Revision section positions must be unique");
    positions.add(position);
    if (typeof section.is_enabled !== "boolean") {
      throw new Error("Revision section enabled flag is required");
    }
    return {
      section_type: sectionType,
      position,
      is_enabled: section.is_enabled,
      content: cloneRevisionRecord(section.content),
    };
  });

  return {
    page: {
      slug: normalizeDraftSlug(String(value.page.slug ?? "")),
      title: requireRevisionTitle(String(value.page.title ?? "")),
      seo: cloneRevisionRecord(seo),
    },
    sections: sections.sort((a, b) => a.position - b.position),
  };
}

export function clonePageRevisionSnapshot(snapshot: PageRevisionSnapshot): PageRevisionSnapshot {
  return assertPageRevisionSnapshot({
    page: {
      ...snapshot.page,
      seo: cloneRevisionRecord(snapshot.page.seo),
    },
    sections: snapshot.sections.map((section) => ({
      ...section,
      content: cloneRevisionRecord(section.content),
    })),
  });
}

function reindexSections(sections: PageRevisionSnapshotSection[]): PageRevisionSnapshotSection[] {
  return sections.map((section, position) => ({
    ...section,
    position,
    content: cloneRevisionRecord(section.content),
  }));
}

export function updatePageRevisionSection(
  snapshot: PageRevisionSnapshot,
  sectionPosition: number,
  update: {
    sectionType?: string;
    isEnabled?: boolean;
    content?: Record<string, unknown>;
  },
): PageRevisionSnapshot {
  const next = clonePageRevisionSnapshot(snapshot);
  const sectionIndex = next.sections.findIndex((section) => section.position === sectionPosition);
  if (sectionIndex < 0) throw new Error("Revision section not found");

  const current = next.sections[sectionIndex];
  const sectionType = update.sectionType === undefined ? current.section_type : update.sectionType.trim();
  if (!sectionType) throw new Error("Revision section type is required");

  next.sections[sectionIndex] = {
    ...current,
    section_type: sectionType,
    is_enabled: update.isEnabled ?? current.is_enabled,
    content: update.content === undefined ? cloneRevisionRecord(current.content) : cloneRevisionRecord(update.content),
  };
  return assertPageRevisionSnapshot(next);
}

export function updatePageRevisionSectionContentValue(
  snapshot: PageRevisionSnapshot,
  sectionPosition: number,
  key: string,
  value: unknown,
): PageRevisionSnapshot {
  const field = key.trim();
  if (!field) throw new Error("Revision content field is required");
  const section = snapshot.sections.find((item) => item.position === sectionPosition);
  if (!section) throw new Error("Revision section not found");
  return updatePageRevisionSection(snapshot, sectionPosition, {
    content: {
      ...cloneRevisionRecord(section.content),
      [field]: cloneRevisionValue(value),
    },
  });
}

export function movePageRevisionSection(
  snapshot: PageRevisionSnapshot,
  sectionPosition: number,
  direction: "up" | "down",
): PageRevisionSnapshot {
  const next = clonePageRevisionSnapshot(snapshot);
  const sections = [...next.sections].sort((a, b) => a.position - b.position);
  const currentIndex = sections.findIndex((section) => section.position === sectionPosition);
  if (currentIndex < 0) throw new Error("Revision section not found");
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return next;
  [sections[currentIndex], sections[targetIndex]] = [sections[targetIndex], sections[currentIndex]];
  return assertPageRevisionSnapshot({ ...next, sections: reindexSections(sections) });
}

export function setPageRevisionSectionEnabled(
  snapshot: PageRevisionSnapshot,
  sectionPosition: number,
  isEnabled: boolean,
): PageRevisionSnapshot {
  return updatePageRevisionSection(snapshot, sectionPosition, { isEnabled });
}

export function appendPageRevisionSection(
  snapshot: PageRevisionSnapshot,
  input: {
    sectionType?: string;
    content?: Record<string, unknown>;
    isEnabled?: boolean;
  } = {},
): PageRevisionSnapshot {
  const next = clonePageRevisionSnapshot(snapshot);
  const sectionType = input.sectionType?.trim() || "richText";
  const sections = reindexSections([
    ...next.sections,
    {
      section_type: sectionType,
      position: next.sections.length,
      is_enabled: input.isEnabled ?? true,
      content: cloneRevisionRecord(input.content ?? { text: "" }),
    },
  ]);
  return assertPageRevisionSnapshot({ ...next, sections });
}

export function assertPageRevisionScope(
  revision: PageRevisionRow,
  tenantId: string,
  pageId?: string,
): PageRevisionRow {
  if (!tenantId || revision.tenant_id !== tenantId) {
    throw new Error("Cross-tenant page revision access denied");
  }
  if (pageId && revision.page_id !== pageId) {
    throw new Error("Cross-page revision access denied");
  }
  assertPageRevisionSnapshot(revision.snapshot);
  return revision;
}

function requireRevisionTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new Error("Revision title is required");
  return title;
}

export async function fetchPageRevisions(
  client: SupabaseClient,
  tenantId: string,
  pageId: string,
): Promise<PageRevisionRow[]> {
  if (!tenantId || !pageId) return [];
  const { data, error } = await client
    .from("page_revisions")
    .select(REVISION_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("page_id", pageId)
    .order("revision", { ascending: false });
  if (error) throw new Error(`page revisions read failed: ${error.message}`);
  return ((data ?? []) as PageRevisionRow[]).map((revision) =>
    assertPageRevisionScope(revision, tenantId, pageId),
  );
}

export async function createPageRevision(
  client: SupabaseClient,
  input: {
    tenantId: string;
    pageId: string;
    snapshot: PageRevisionSnapshot;
    sourceRevisionId?: string | null;
  },
): Promise<PageRevisionRow> {
  const snapshot = assertPageRevisionSnapshot(input.snapshot);
  const { data, error } = await client
    .from("page_revisions")
    .insert({
      tenant_id: input.tenantId,
      page_id: input.pageId,
      snapshot,
      source_revision_id: input.sourceRevisionId ?? null,
    })
    .select(REVISION_COLUMNS)
    .single();
  if (error) throw new Error(`page revision create failed: ${error.message}`);
  return assertPageRevisionScope(data as PageRevisionRow, input.tenantId, input.pageId);
}

export async function updateDraftPageRevision(
  client: SupabaseClient,
  input: {
    tenantId: string;
    pageId: string;
    revisionId: string;
    snapshot: PageRevisionSnapshot;
  },
): Promise<PageRevisionRow> {
  const snapshot = assertPageRevisionSnapshot(input.snapshot);
  const { data, error } = await client
    .from("page_revisions")
    .update({ snapshot })
    .eq("tenant_id", input.tenantId)
    .eq("page_id", input.pageId)
    .eq("id", input.revisionId)
    .eq("status", "draft")
    .select(REVISION_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(`draft revision update failed: ${error.message}`);
  if (!data) throw new Error("Draft revision not found or not writable");
  return assertPageRevisionScope(data as PageRevisionRow, input.tenantId, input.pageId);
}

export async function transitionPageRevision(
  client: SupabaseClient,
  input: {
    tenantId: string;
    pageId: string;
    revisionId: string;
    from: PageRevisionStatus;
    to: PageRevisionStatus;
  },
): Promise<PageRevisionRow> {
  const { data, error } = await client
    .from("page_revisions")
    .update({ status: input.to })
    .eq("tenant_id", input.tenantId)
    .eq("page_id", input.pageId)
    .eq("id", input.revisionId)
    .eq("status", input.from)
    .select(REVISION_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(`revision transition failed: ${error.message}`);
  if (!data) throw new Error("Revision state changed or is not writable");
  return assertPageRevisionScope(data as PageRevisionRow, input.tenantId, input.pageId);
}

export async function restorePageRevisionAsDraft(
  client: SupabaseClient,
  input: { tenantId: string; pageId: string; source: PageRevisionRow },
): Promise<PageRevisionRow> {
  assertPageRevisionScope(input.source, input.tenantId, input.pageId);
  if (!(["published", "rolled_back"] as PageRevisionStatus[]).includes(input.source.status)) {
    throw new Error("Only published history can be restored");
  }
  return createPageRevision(client, {
    tenantId: input.tenantId,
    pageId: input.pageId,
    snapshot: input.source.snapshot,
    sourceRevisionId: input.source.id,
  });
}
