import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The public Salon reads only the approved/published projection created by
 * Builder. Unpublished revisions and private_settings must never be queried.
 */
export interface PublicSalonSection {
  id: string;
  sectionType: string;
  title: string;
  text: string;
  position: number;
}

export type PublicSalonPage =
  | { status: "empty" }
  | { status: "published"; title: string; sections: PublicSalonSection[] };

type CmsRecord = Record<string, unknown>;

function isRecord(value: unknown): value is CmsRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function projectPublicSalonSections(
  rows: unknown,
  tenantId: string,
  pageId: string,
): PublicSalonSection[] {
  if (!Array.isArray(rows)) throw new Error("Invalid CMS section result");

  return rows.map((row: unknown) => {
    if (
      !isRecord(row) ||
      row.tenant_id !== tenantId ||
      row.page_id !== pageId ||
      row.is_enabled !== true ||
      typeof row.id !== "string" ||
      typeof row.section_type !== "string" ||
      typeof row.position !== "number" ||
      !Number.isInteger(row.position) ||
      !isRecord(row.content)
    ) {
      throw new Error("Untrusted, cross-tenant or unpublished CMS section");
    }

    const content = row.content as CmsRecord;
    // Render safe text only; never interpret HTML, Markdown, raw URLs or media.
    return {
      id: row.id,
      sectionType: row.section_type,
      title: typeof content.title === "string" ? content.title.slice(0, 160) : "",
      text: typeof content.text === "string" ? content.text.slice(0, 8000) : "",
      position: row.position as number,
    };
  }).sort((a, b) => a.position - b.position);
}

export async function loadPublicSalonPage(
  client: SupabaseClient,
  tenantId: string,
): Promise<PublicSalonPage> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new Error("Invalid resolved Salon tenant");
  }

  const { data: page, error: pageError } = await client
    .from("pages")
    .select("id,tenant_id,slug,title,status")
    .eq("tenant_id", tenantId)
    .eq("slug", "inicio")
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (pageError) throw new Error("Unable to verify published Salon page");
  if (page == null) return { status: "empty" };

  if (
    page.tenant_id !== tenantId ||
    page.slug !== "inicio" ||
    page.status !== "published" ||
    typeof page.id !== "string" ||
    typeof page.title !== "string"
  ) {
    throw new Error("Untrusted Salon page selection");
  }

  const { data: sectionRows, error: sectionError } = await client
    .from("page_sections")
    .select("id,page_id,tenant_id,section_type,position,is_enabled,content")
    .eq("tenant_id", tenantId)
    .eq("page_id", page.id)
    .eq("is_enabled", true)
    .order("position", { ascending: true });

  if (sectionError) throw new Error("Unable to verify published Salon sections");

  return {
    status: "published",
    title: page.title,
    sections: projectPublicSalonSections(sectionRows, tenantId, page.id),
  };
}
