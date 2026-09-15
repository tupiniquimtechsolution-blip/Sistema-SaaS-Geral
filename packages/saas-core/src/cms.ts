/**
 * CMS contracts — structured pages/sections with safe render contracts.
 * Rich text is always stored as sanitized HTML produced server-side;
 * the contract only carries already-sanitized content.
 */

export type SectionType =
  | "hero"
  | "richText"
  | "image"
  | "video"
  | "gallery"
  | "products"
  | "services"
  | "cta"
  | "faq"
  | "reviews"
  | "map"
  | "team"
  | "events"
  | "booking"
  | "contact"
  | "social";

export type PageStatus = "draft" | "published";

export interface PageSection {
  id: string;
  type: SectionType;
  /** Already-sanitized rich text (server-side sanitizer responsibility). */
  content?: string;
  /** Tenant-scoped media asset ids. */
  mediaIds?: string[];
  /** Structured payload validated per section type at the boundary. */
  props?: Record<string, unknown>;
  position: number;
  enabled: boolean;
}

export interface Page {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  status: PageStatus;
  sections: PageSection[];
  createdAt: string;
  updatedAt: string;
}

export function publishedSections(page: Page): PageSection[] {
  if (page.status !== "published") return [];
  return page.sections.filter((s) => s.enabled).sort((a, b) => a.position - b.position);
}
