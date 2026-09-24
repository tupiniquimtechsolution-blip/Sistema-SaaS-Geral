export interface CreatePaymentInput {
  appointmentId: string;
  amountCents: number;
  description: string;
  payerEmail: string;
  notificationUrl?: string;
}

export interface PaymentIntent {
  provider: string;
  providerRef: string;
  status: 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  checkoutUrl?: string;
  amountCents: number;
}

export interface WebhookEvent {
  eventId: string;
  provider: string;
  type: string;
  providerRef: string;
  status: PaymentIntent['status'];
  amountCents?: number;
  payload: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<PaymentIntent>;
  parseWebhook(
    rawBody: string,
    headers: Record<string, string | undefined>,
    notificationUrl?: string,
  ): Promise<WebhookEvent>;
}

export class PriceMismatchError extends Error {
  constructor(expected: number, received: number) {
    super(`price_mismatch: expected ${expected} cents, received ${received}`);
    this.name = 'PriceMismatchError';
  }
}

export function assertServerPrice(expectedCents: number, receivedCents: number): void {
  if (expectedCents !== receivedCents) {
    throw new PriceMismatchError(expectedCents, receivedCents);
  }
}

export interface PaymentEventStore {
  has(provider: string, eventId: string): Promise<boolean>;
  save(event: WebhookEvent, paymentId: string | null): Promise<void>;
}

export async function processWebhookIdempotent(
  store: PaymentEventStore,
  event: WebhookEvent,
  paymentId: string | null,
): Promise<{ duplicate: boolean }> {
  if (await store.has(event.provider, event.eventId)) {
    return { duplicate: true };
  }
  await store.save(event, paymentId);
  return { duplicate: false };
}
