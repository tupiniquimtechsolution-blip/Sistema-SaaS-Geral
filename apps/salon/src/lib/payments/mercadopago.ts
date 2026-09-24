import {
  resolveMercadoPagoNotificationDataId,
  verifyMercadoPagoSignature,
  type MercadoPagoNotificationPayload,
} from './mp-signature';
import type { CreatePaymentInput, PaymentIntent, PaymentProvider, WebhookEvent } from './provider';

export const MERCADO_PAGO_API = 'https://api.mercadopago.com';

const STATUS_MAP: Record<string, WebhookEvent['status']> = {
  pending: 'pending',
  in_process: 'pending',
  authorized: 'authorized',
  approved: 'paid',
  rejected: 'failed',
  cancelled: 'cancelled',
  refunded: 'refunded',
  charged_back: 'refunded',
};

export class MercadoPagoProvider implements PaymentProvider {
  readonly name = 'mercadopago';

  constructor(
    private readonly accessToken: string,
    private readonly webhookSecret: string,
  ) {
    if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');
    if (!webhookSecret) throw new Error('MERCADOPAGO_WEBHOOK_SECRET is required');
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentIntent> {
    const response = await fetch(`${MERCADO_PAGO_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_reference: input.appointmentId,
        notification_url: input.notificationUrl,
        items: [
          {
            title: input.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: input.amountCents / 100,
          },
        ],
        payer: { email: input.payerEmail },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Mercado Pago preference failed: ${response.status} ${body}`);
    }

    const data = (await response.json()) as {
      id: string;
      init_point?: string;
      sandbox_init_point?: string;
    };

    return {
      provider: this.name,
      providerRef: data.id,
      status: 'pending',
      checkoutUrl: data.sandbox_init_point ?? data.init_point,
      amountCents: input.amountCents,
    };
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string | undefined>,
    notificationUrl?: string,
  ): Promise<WebhookEvent> {
    const payload = JSON.parse(rawBody) as MercadoPagoNotificationPayload & {
      id?: string | number;
      type?: string;
      action?: string;
    };
    const paymentId = resolveMercadoPagoNotificationDataId(payload, notificationUrl);

    const valid = await verifyMercadoPagoSignature({
      secret: this.webhookSecret,
      signatureHeader: headers['x-signature'] ?? headers['X-Signature'],
      requestId: headers['x-request-id'] ?? headers['X-Request-Id'],
      dataId: paymentId,
    });
    if (!valid) throw new Error('invalid_webhook_signature');

    // Notification fields only identify the payment. The provider lookup is
    // authoritative for status, amount, and appointment reference.
    const paymentRes = await fetch(`${MERCADO_PAGO_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!paymentRes.ok) throw new Error('webhook_payment_lookup_failed');

    const payment = (await paymentRes.json()) as {
      id: number;
      status: string;
      transaction_amount: number;
      external_reference?: string;
    };
    if (String(payment.id) !== paymentId) throw new Error('webhook_payment_lookup_mismatch');

    return {
      eventId: String(payload.id ?? `mp:${payment.id}:${payload.action ?? payload.type ?? 'payment'}`),
      provider: this.name,
      type: payload.action ?? payload.type ?? 'payment',
      providerRef: String(payment.id),
      status: STATUS_MAP[payment.status] ?? 'pending',
      amountCents: Math.round(Number(payment.transaction_amount) * 100),
      payload: { ...payload, payment, appointmentId: payment.external_reference },
    };
  }
}

export function createMercadoPagoFromEnv(
  env: Record<string, string | undefined> = {},
): MercadoPagoProvider {
  return new MercadoPagoProvider(env.MERCADOPAGO_ACCESS_TOKEN ?? '', env.MERCADOPAGO_WEBHOOK_SECRET ?? '');
}
