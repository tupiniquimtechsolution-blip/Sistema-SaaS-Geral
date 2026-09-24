import { describe, expect, it } from 'vitest';
import { DemoProvider } from '../../src/lib/payments/demo';
import { assertServerPrice, PriceMismatchError, processWebhookIdempotent } from '../../src/lib/payments/provider';

describe('DemoProvider', () => {
  it('creates a pending intent and parses webhook payloads', async () => {
    const provider = new DemoProvider();
    const intent = await provider.createPayment({
      appointmentId: 'appt-1',
      amountCents: 6000,
      description: 'Design de Sobrancelhas',
      payerEmail: 'cliente@example.com',
    });
    expect(intent.provider).toBe('demo');
    expect(intent.amountCents).toBe(6000);

    const event = await provider.parseWebhook(
      JSON.stringify({ id: 'evt-1', data: { id: intent.providerRef, status: 'paid', amount_cents: 6000 } }),
      {},
    );
    expect(event.status).toBe('paid');
    expect(event.eventId).toBe('evt-1');
  });
});

describe('webhook authority', () => {
  it('rejects price mismatches', () => {
    expect(() => assertServerPrice(6000, 1)).toThrow(PriceMismatchError);
    expect(() => assertServerPrice(6000, 6000)).not.toThrow();
  });

  it('is idempotent on provider event id', async () => {
    const seen = new Set<string>();
    const store = {
      async has(provider: string, eventId: string) {
        return seen.has(`${provider}:${eventId}`);
      },
      async save(event: { provider: string; eventId: string }) {
        seen.add(`${event.provider}:${event.eventId}`);
      },
    };
    const event = {
      eventId: 'evt-1',
      provider: 'demo',
      type: 'payment.updated',
      providerRef: 'pay-1',
      status: 'paid' as const,
      payload: {},
    };
    await expect(processWebhookIdempotent(store, event, 'pay-1')).resolves.toEqual({ duplicate: false });
    await expect(processWebhookIdempotent(store, event, 'pay-1')).resolves.toEqual({ duplicate: true });
    expect(seen.size).toBe(1);
  });
});
