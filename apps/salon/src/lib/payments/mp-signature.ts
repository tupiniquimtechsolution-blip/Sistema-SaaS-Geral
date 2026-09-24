export interface MercadoPagoSignature {
  ts: string;
  v1: string;
}

export interface MercadoPagoNotificationPayload {
  data?: {
    id?: string | number | null;
  } | null;
}

export function parseMercadoPagoSignature(header: string | undefined | null): MercadoPagoSignature | null {
  if (!header) return null;
  const parts = Object.fromEntries(
    header
      .split(',')
      .map((chunk) => chunk.trim().split('='))
      .filter((pair) => pair.length === 2)
      .map(([key, value]) => [key, value]),
  );
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

function normalizeNotificationDataId(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || null;
  }
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return String(value);
  }
  return null;
}

/**
 * Mercado Pago signs the notification URL's `data.id`. When a body also
 * carries `data.id`, accepting different identifiers would verify one payment
 * and apply another, so the values must agree before signature verification.
 */
export function resolveMercadoPagoNotificationDataId(
  payload: MercadoPagoNotificationPayload,
  notificationUrl?: string,
): string {
  const bodyDataId = normalizeNotificationDataId(payload.data?.id);
  const queryDataId = notificationUrl
    ? normalizeNotificationDataId(
      new URL(notificationUrl, 'https://mercadopago-webhook.invalid').searchParams.get('data.id'),
    )
    : null;

  if (bodyDataId && queryDataId && bodyDataId !== queryDataId) {
    throw new Error('webhook_payment_id_mismatch');
  }

  const dataId = queryDataId ?? bodyDataId;
  if (!dataId) {
    throw new Error('webhook_missing_payment_id');
  }
  return dataId;
}

export function mercadoPagoManifest(dataId: string, requestId: string, ts: string): string {
  return `id:${dataId};request-id:${requestId};ts:${ts};`;
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyMercadoPagoSignature(args: {
  secret: string;
  signatureHeader?: string | null;
  requestId?: string | null;
  dataId: string;
}): Promise<boolean> {
  const parsed = parseMercadoPagoSignature(args.signatureHeader);
  if (!parsed || !args.secret || !args.requestId) return false;
  const expected = await hmacSha256Hex(
    args.secret,
    mercadoPagoManifest(args.dataId, args.requestId, parsed.ts),
  );
  return timingSafeEqual(expected, parsed.v1);
}
