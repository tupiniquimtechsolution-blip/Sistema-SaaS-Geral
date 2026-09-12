/**
 * Integration contracts — outbound webhooks with URL validation (anti-SSRF),
 * HMAC signing contract and connection registry.
 */

export type IntegrationKind = "whatsapp" | "email" | "analytics" | "maps" | "payments" | "marketplace" | "webhook";

export interface IntegrationConnection {
  id: string;
  tenantId: string;
  kind: IntegrationKind;
  provider: string;
  /** Non-secret config only. Secrets stay server-side, never in this contract. */
  config: Record<string, string>;
  enabled: boolean;
  createdAt: string;
}

/** Blocks localhost, private ranges and non-http(s) schemes for outbound webhooks. */
export function isSafeOutboundUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    // Strip brackets from IPv6 literals ([::1] -> ::1) so loopback cannot evade the check.
    const host = url.hostname.replace(/^\[/, "").replace(/\]$/, "");
    if (host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" || host === "::1") return false;
    // IPv4 private/link ranges
    const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (a === 10 || a === 127 || a === 0) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 169 && b === 254) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export interface OutboundWebhook {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secretRef: string; // reference to server-side secret, never the secret itself
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  attempt: number;
  status: "queued" | "success" | "failed";
  error?: string;
  at: string;
}

export interface WebhookSigner {
  /** HMAC-style signature of the payload with the server-side secret. */
  sign(payload: string, secret: string): string;
}
