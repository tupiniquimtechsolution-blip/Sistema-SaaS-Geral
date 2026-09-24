import { describe, expect, it } from 'vitest';
import { generateSlots, hasDoubleBooking, rangesOverlap } from '../../src/lib/booking/overlap';

describe('rangesOverlap', () => {
  it('detects overlapping intervals using half-open semantics', () => {
    expect(
      rangesOverlap(
        { start: new Date('2026-09-20T12:00:00Z'), end: new Date('2026-09-20T13:00:00Z') },
        { start: new Date('2026-09-20T12:30:00Z'), end: new Date('2026-09-20T13:30:00Z') },
      ),
    ).toBe(true);
  });

  it('allows back-to-back appointments', () => {
    expect(
      rangesOverlap(
        { start: new Date('2026-09-20T12:00:00Z'), end: new Date('2026-09-20T13:00:00Z') },
        { start: new Date('2026-09-20T13:00:00Z'), end: new Date('2026-09-20T14:00:00Z') },
      ),
    ).toBe(false);
  });
});

describe('hasDoubleBooking', () => {
  it('ignores cancelled appointments', () => {
    expect(
      hasDoubleBooking(
        'pro-1',
        { start: new Date('2026-09-20T12:00:00Z'), end: new Date('2026-09-20T13:00:00Z') },
        [
          {
            professionalId: 'pro-1',
            status: 'cancelled',
            start: new Date('2026-09-20T12:00:00Z'),
            end: new Date('2026-09-20T13:00:00Z'),
          },
        ],
      ),
    ).toBe(false);
  });
});

describe('generateSlots', () => {
  it('marks occupied windows unavailable', () => {
    const slots = generateSlots({
      date: '2026-09-21',
      durationMinutes: 60,
      slotMinutes: 30,
      open: '09:00',
      close: '11:00',
      occupied: [
        { start: new Date('2026-09-21T09:00:00.000Z'), end: new Date('2026-09-21T10:00:00.000Z') },
      ],
      blocked: [],
      timeZone: 'UTC',
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((slot) => !slot.available)).toBe(true);
  });

  it('returns no slots on closed days', () => {
    expect(
      generateSlots({
        date: '2026-09-20',
        durationMinutes: 60,
        slotMinutes: 30,
        open: null,
        close: null,
        occupied: [],
        blocked: [],
      }),
    ).toEqual([]);
  });
});
