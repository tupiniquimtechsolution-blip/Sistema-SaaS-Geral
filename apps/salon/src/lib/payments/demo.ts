import type { CreatePaymentInput, PaymentIntent, PaymentProvider, WebhookEvent } from './provider';

export class DemoProvider implements PaymentProvider {
  readonly name = 'demo';

  async createPayment(input: CreatePaymentInput): Promise<PaymentIntent> {
    const providerRef = `demo_${input.appointmentId}_${input.amountCents}`;
    return {
      provider: this.name,
      providerRef,
      status: 'pending',
      checkoutUrl: `/agendar?payment=demo&ref=${encodeURIComponent(providerRef)}`,
      amountCents: input.amountCents,
    };
  }

  async parseWebhook(rawBody: string, headers: Record<string, string | undefined>): Promise<WebhookEvent> {
    const payload = JSON.parse(rawBody) as {
      id?: string;
      type?: string;
      data?: { id?: string; status?: string; amount_cents?: number };
    };
    const eventId = payload.id || headers['x-demo-event-id'] || `demo_evt_${Date.now()}`;
    const status = (payload.data?.status ?? 'paid') as WebhookEvent['status'];
    return {
      eventId,
      provider: this.name,
      type: payload.type ?? 'payment.updated',
      providerRef: payload.data?.id ?? eventId,
      status,
      amountCents: payload.data?.amount_cents,
      payload: payload as Record<string, unknown>,
    };
  }
}
