import { describe, expect, it } from 'vitest';
import { canReadAppointment, canWriteAdminResource, decideCreateAppointment } from '../../src/lib/booking/engine';

const baseInput = {
  serviceId: '33333333-0000-4000-8000-000000000001',
  professionalId: '11111111-1111-4111-8111-111111111111',
  startsAt: '2026-09-21T13:00:00.000Z',
  notes: '',
  operationalConsent: true as const,
  marketingConsent: false,
  imageConsent: false,
};

const baseCtx = {
  now: new Date('2026-09-15T12:00:00.000Z'),
  actorId: 'user-1',
  actorRole: 'customer' as const,
  service: { id: baseInput.serviceId, durationMinutes: 45, priceCents: 6000, active: true },
  professionalActive: true,
  professionalOffersService: true,
  open: '09:00',
  close: '19:00',
  occupied: [],
  blocked: [],
};

describe('decideCreateAppointment', () => {
  it('copies server price and rejects anonymous users', () => {
    const ok = decideCreateAppointment(baseInput, baseCtx);
    expect(ok).toEqual({ ok: true, endsAt: new Date('2026-09-21T13:45:00.000Z'), priceCents: 6000 });
    expect(decideCreateAppointment(baseInput, { ...baseCtx, actorId: null }).ok).toBe(false);
  });

  it('rejects client-chosen price by ignoring it (price comes from catalog)', () => {
    const decision = decideCreateAppointment(baseInput, {
      ...baseCtx,
      service: { ...baseCtx.service!, priceCents: 45000 },
    });
    expect(decision.ok && decision.priceCents).toBe(45000);
  });

  it('rejects double booking', () => {
    const decision = decideCreateAppointment(baseInput, {
      ...baseCtx,
      occupied: [
        {
          professionalId: baseInput.professionalId,
          status: 'confirmed',
          start: new Date('2026-09-21T13:00:00.000Z'),
          end: new Date('2026-09-21T14:00:00.000Z'),
        },
      ],
    });
    expect(decision).toEqual({ ok: false, code: 'double_booking' });
  });
});

describe('authorization helpers', () => {
  it('prevents customer A from reading customer B appointments', () => {
    expect(canReadAppointment({ actorId: 'a', actorRole: 'customer', customerId: 'b' })).toBe(false);
    expect(canReadAppointment({ actorId: 'a', actorRole: 'customer', customerId: 'a' })).toBe(true);
    expect(canReadAppointment({ actorId: 'admin', actorRole: 'admin', customerId: 'b' })).toBe(true);
    expect(canReadAppointment({ actorId: null, actorRole: null, customerId: 'a' })).toBe(false);
  });

  it('blocks admin writes without admin role', () => {
    expect(canWriteAdminResource('customer')).toBe(false);
    expect(canWriteAdminResource('admin')).toBe(true);
  });
});
