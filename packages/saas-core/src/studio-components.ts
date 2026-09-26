/**
 * Controlled component registry for AI Tenant Studio.
 * AI and visual-editor adapters may only compose registered section types.
 */
export type StudioComponentKey =
  | "hero" | "cta" | "gallery" | "product-grid" | "service-grid"
  | "testimonials" | "faq" | "contact" | "booking";

export interface StudioComponentDefinition {
  key: StudioComponentKey;
  label: string;
  allowedFields: readonly string[];
  aiMutable: boolean;
}

export const STUDIO_COMPONENTS: readonly StudioComponentDefinition[] = [
  { key: "hero", label: "Hero", allowedFields: ["headline","subheadline","media","cta"], aiMutable: true },
  { key: "cta", label: "Call to action", allowedFields: ["title","text","label","href"], aiMutable: true },
  { key: "gallery", label: "Gallery", allowedFields: ["title","mediaIds"], aiMutable: true },
  { key: "product-grid", label: "Products", allowedFields: ["title","category","limit","variant"], aiMutable: true },
  { key: "service-grid", label: "Services", allowedFields: ["title","serviceIds","variant"], aiMutable: true },
  { key: "testimonials", label: "Testimonials", allowedFields: ["title","items"], aiMutable: true },
  { key: "faq", label: "FAQ", allowedFields: ["title","items"], aiMutable: true },
  { key: "contact", label: "Contact", allowedFields: ["title","showMap","showHours"], aiMutable: true },
  { key: "booking", label: "Booking", allowedFields: ["title","serviceIds"], aiMutable: true },
];

const BY_KEY = new Map(STUDIO_COMPONENTS.map((item) => [item.key, item]));

export function getStudioComponent(key: string): StudioComponentDefinition | null {
  return BY_KEY.get(key as StudioComponentKey) ?? null;
}

export function assertStudioComponentPatch(
  key: string,
  patch: Record<string, unknown>,
  protectedFields: readonly string[] = [],
): StudioComponentDefinition {
  const component = getStudioComponent(key);
  if (!component || !component.aiMutable) throw new Error("Unregistered or immutable Studio component");
  for (const field of Object.keys(patch)) {
    if (!component.allowedFields.includes(field)) throw new Error(`Field not allowed for ${key}: ${field}`);
    if (protectedFields.includes(field)) throw new Error(`Protected field cannot be changed: ${field}`);
  }
  return component;
}
