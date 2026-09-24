export type VerticalSourceStatus = "canonical" | "blocked-source";

export interface VerticalDefinition {
  id: string;
  displayName: string;
  sourceStatus: VerticalSourceStatus;
  modules: readonly string[];
  optionalIntegrations: readonly string[];
  privacyNotes: readonly string[];
}

const define = <T extends VerticalDefinition>(value: T): T => value;

export const VERTICAL_REGISTRY = {
  bakery: define({
    id: "bakery",
    displayName: "Bakery",
    sourceStatus: "canonical",
    modules: ["catalog", "commerce", "orders", "delivery-pickup", "scheduled-orders", "coupons", "pwa"],
    optionalIntegrations: ["whatsapp", "marketplace", "payments"],
    privacyNotes: ["customer snapshots are order-scoped and tenant-scoped"],
  }),
  pet: define({
    id: "pet",
    displayName: "Pet Shop",
    sourceStatus: "canonical",
    modules: ["customers", "pets", "services", "professionals", "booking", "commerce", "loyalty", "service-history"],
    optionalIntegrations: ["whatsapp", "payments", "maps"],
    privacyNotes: ["veterinary medical records are outside the default vertical scope"],
  }),
  restaurant: define({
    id: "restaurant",
    displayName: "Restaurant",
    sourceStatus: "canonical",
    modules: ["menus", "options", "availability", "allergens", "reservations", "waitlist-ready", "commerce", "events"],
    optionalIntegrations: ["whatsapp", "payments", "marketplace"],
    privacyNotes: ["POS/KDS/fiscal systems remain provider integrations rather than duplicated core systems"],
  }),
  "heavy-machinery": define({
    id: "heavy-machinery",
    displayName: "Heavy Machinery",
    sourceStatus: "canonical",
    modules: ["equipment", "inventory", "search", "seller-routing", "leads", "quotes", "trade-in", "financing-adapters", "documents", "support"],
    optionalIntegrations: ["whatsapp", "email", "maps", "crm"],
    privacyNotes: ["lead/contact information is tenant-scoped"],
  }),
  "religious-house": define({
    id: "religious-house",
    displayName: "Religious House",
    sourceStatus: "canonical",
    modules: ["public-cms", "services", "calendar", "recurrence", "booking-requests", "gallery", "announcements", "contact", "optional-contributions"],
    optionalIntegrations: ["whatsapp", "payments"],
    privacyNotes: [
      "religious affiliation is sensitive personal data",
      "members, mediums/volunteers, assignments and attendance are disabled by default and require a separate privacy/security gate",
    ],
  }),
  led: define({
    id: "led",
    displayName: "LED / Visual Communication",
    sourceStatus: "blocked-source",
    modules: ["solutions-catalog", "technical-specification", "configuration-request", "site-survey", "leads", "quotes", "projects", "installations", "warranty-support"],
    optionalIntegrations: ["whatsapp", "email", "crm"],
    privacyNotes: ["no business content may be invented until the canonical source repository is identified"],
  }),
  metalart: define({
    id: "metalart",
    displayName: "MetalArt",
    sourceStatus: "canonical",
    modules: ["lead-capture", "service-catalog", "quotes", "projects", "commercial-pipeline", "media-gallery", "contact-attribution"],
    optionalIntegrations: ["whatsapp", "email", "crm"],
    privacyNotes: ["do not invent prices, testimonials, results or commercial data"],
  }),
} as const;

export type VerticalId = keyof typeof VERTICAL_REGISTRY;

export function getVerticalDefinition(verticalId: string): VerticalDefinition | null {
  return (VERTICAL_REGISTRY as Record<string, VerticalDefinition>)[verticalId] ?? null;
}

export function isVerticalRunnable(verticalId: string): boolean {
  return getVerticalDefinition(verticalId)?.sourceStatus === "canonical";
}
