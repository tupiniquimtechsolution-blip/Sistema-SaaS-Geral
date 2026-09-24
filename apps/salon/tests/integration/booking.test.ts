import { describe, expect, it } from 'vitest';
import { MemoryBookingStore } from '../helpers/memory-booking';
import type { BookingContext, CreateAppointmentInput } from '../../src/lib/booking/engine';

const serviceId = '33333333-0000-4000-8000-000000000001';
const professionalId = '11111111-1111-4111-8111-111111111111';

const input = (startsAt: string): CreateAppointmentInput => ({
  serviceId,
  professionalId,
  startsAt,
  notes: '',
  operationalConsent: true,
  marketingConsent: false,
  imageConsent: false,
});

const ctx = (actorId: string): BookingContext => ({
  now: new Date('2026-09-15T12:00:00.000Z'),
  actorId,
  actorRole: 'customer',
  service: { id: serviceId, durationMinutes: 60, priceCents: 18000, active: true },
  professionalActive: true,
  professionalOffersService: true,
  open: '09:00',
  close: '19:00',
  occupied: [],
  blocked: [],
});

describe('booking persistence (memory replica of backend rules)', () => {
  it('persists a booking with server-side price', () => {
    const store = new MemoryBookingStore();
    const created = store.create(input('2026-09-21T13:00:00.000Z'), ctx('user-a'));
    expect(created.priceCents).toBe(18000);
    expect(created.customerId).toBe('user-a');
    expect(store.appointments).toHaveLength(1);
  });

  it('blocks concurrent double booking for the same professional', () => {
    const store = new MemoryBookingStore();
    store.create(input('2026-09-21T13:00:00.000Z'), ctx('user-a'));
    expect(() => store.create(input('2026-09-21T13:30:00.000Z'), ctx('user-b'))).toThrow('double_booking');
    expect(store.appointments).toHaveLength(1);
  });

  it('allows two customers at the same time only if the engine would — it must not', () => {
    const store = new MemoryBookingStore();
    store.create(input('2026-09-21T15:00:00.000Z'), ctx('user-a'));
    expect(() => store.create(input('2026-09-21T15:00:00.000Z'), ctx('user-c'))).toThrow('double_booking');
  });
});
