export type Entitlement =
  | { key: "commerce.enabled"; value: boolean }
  | { key: "booking.enabled"; value: boolean }
  | { key: "crm.enabled"; value: boolean }
  | { key: "quotes.enabled"; value: boolean }
  | { key: "events.enabled"; value: boolean }
  | { key: "customDomain.enabled"; value: boolean }
  | { key: "locations.max"; value: number }
  | { key: "users.max"; value: number }
  | { key: "storage.bytes"; value: number }
  | { key: "products.max"; value: number }
  | { key: "media.maxFileSize"; value: number }
  | { key: "audit.retentionDays"; value: number };



export interface Plan {
  id: string;
  name: string;
  entitlements: Entitlement[];
}

export type SubscriptionState = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface TenantSubscription {
  planId: string;
  state: SubscriptionState;
  entitlements: Entitlement[];
}export function canUseFeature(sub: TenantSubscription, key: string): boolean {
  const e = sub.entitlements.find((x) => x.key === key);
  if (!e) {
    return false;
  }
  if (key === "locations.max" || key === "users.max" || key === "storage.bytes" || key === "products.max" || key === "media.maxFileSize" || key === "audit.retentionDays") {
    return typeof e.value === "number" && e.value > 0;
  }
  return e.value === true;
}


export function assertEntitlement(sub: TenantSubscription, key: string): void {
  if (!canUseFeature(sub, key)) {
    throw new Error(`Entitlement required: ${key}`);
  }
}

