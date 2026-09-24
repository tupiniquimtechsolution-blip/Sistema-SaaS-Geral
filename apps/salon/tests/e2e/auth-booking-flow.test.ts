import { describe, expect, it } from 'vitest';
import { MemoryBookingStore } from '../helpers/memory-booking';
import { canAccessAdmin, canSelect } from '../helpers/rls';
import { splitConsents, requireOperationalConsent } from '../../src/lib/lgpd/consents';
import { DemoProvider, assertServerPrice, processWebhookIdempotent } from '../../src/lib/payments';

describe('E2E: signup → book → own data → admin deny → payment webhook', () => {
  it('walks the production rules without trusting the UI', async () => {
    const customer = { id: 'user-a', role: 'customer' as const };
    const other = { id: 'user-b', role: 'customer' as const };

    const consents = splitConsents({
      operational: true,
      marketing: false,
      image: false,
      source: 'signup',
      at: '2026-09-15T10:00:00.000Z',
    });
    expect(requireOperationalConsent(consents)).toBe(true);

    const store = new MemoryBookingStore();
    const appointment = store.create(
      {
        serviceId: '33333333-0000-4000-8000-000000000003',
        professionalId: '11111111-1111-4111-8111-111111111111',
        startsAt: '2026-09-22T14:00:00.000Z',
        notes: '',
        operationalConsent: true,
        marketingConsent: false,
        imageConsent: false,
      },
      {
        now: new Date('2026-09-15T12:00:00.000Z'),
        actorId: customer.id,
        actorRole: 'customer',
        service: { id: '33333333-0000-4000-8000-000000000003', durationMinutes: 90, priceCents: 18000, active: true },
        professionalActive: true,
        professionalOffersService: true,
        open: '09:00',
        close: '19:00',
        occupied: [],
        blocked: [],
      },
    );

    expect(canSelect('appointments', { customer_id: appointment.customerId }, customer)).toBe(true);
    expect(canSelect('appointments', { customer_id: appointment.customerId }, other)).toBe(false);
    expect(canAccessAdmin(customer)).toBe(false);

    expect(() =>
      store.create(
        {
          serviceId: '33333333-0000-4000-8000-000000000003',
          professionalId: '11111111-1111-4111-8111-111111111111',
          startsAt: '2026-09-22T14:30:00.000Z',
          notes: '',
          operationalConsent: true,
          marketingConsent: false,
          imageConsent: false,
        },
        {
          now: new Date('2026-09-15T12:00:00.000Z'),
          actorId: other.id,
          actorRole: 'customer',
          service: { id: '33333333-0000-4000-8000-000000000003', durationMinutes: 90, priceCents: 18000, active: true },
          professionalActive: true,
          professionalOffersService: true,
          open: '09:00',
          close: '19:00',
          occupied: [],
          blocked: [],
        },
      ),
    ).toThrow('double_booking');

    const provider = new DemoProvider();
    const intent = await provider.createPayment({
      appointmentId: appointment.id,
      amountCents: appointment.priceCents,
      description: 'Extensão de Cílios',
      payerEmail: 'a@example.com',
    });
    const event = await provider.parseWebhook(
      JSON.stringify({
        id: 'evt-e2e',
        data: { id: intent.providerRef, status: 'paid', amount_cents: 1 },
      }),
      {},
    );
    expect(() => assertServerPrice(appointment.priceCents, event.amountCents ?? 0)).toThrow();

    const paid = await provider.parseWebhook(
      JSON.stringify({
        id: 'evt-e2e-paid',
        data: { id: intent.providerRef, status: 'paid', amount_cents: appointment.priceCents },
      }),
      {},
    );
    assertServerPrice(appointment.priceCents, paid.amountCents ?? 0);
    const seen = new Set<string>();
    const eventStore = {
      async has(providerName: string, eventId: string) {
        return seen.has(`${providerName}:${eventId}`);
      },
      async save(item: { provider: string; eventId: string }) {
        seen.add(`${item.provider}:${item.eventId}`);
      },
    };
    await expect(processWebhookIdempotent(eventStore, paid, 'pay-1')).resolves.toEqual({ duplicate: false });
    await expect(processWebhookIdempotent(eventStore, paid, 'pay-1')).resolves.toEqual({ duplicate: true });
  });
});
