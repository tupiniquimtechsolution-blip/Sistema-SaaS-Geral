import {
  decideCreateAppointment,
  type BookingContext,
  type CreateAppointmentInput,
} from '../../src/lib/booking/engine';
import { addMinutes, hasDoubleBooking } from '../../src/lib/booking/overlap';

export interface StoredAppointment {
  id: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: string;
  priceCents: number;
}

export class MemoryBookingStore {
  appointments: StoredAppointment[] = [];

  create(input: CreateAppointmentInput, ctx: BookingContext): StoredAppointment {
    const decision = decideCreateAppointment(input, {
      ...ctx,
      occupied: this.appointments.map((item) => ({
        start: item.start,
        end: item.end,
        professionalId: item.professionalId,
        status: item.status,
      })),
    });
    if (!decision.ok) {
      throw new Error(decision.code);
    }
    const start = new Date(input.startsAt);
    const row: StoredAppointment = {
      id: `appt_${this.appointments.length + 1}`,
      customerId: ctx.actorId!,
      professionalId: input.professionalId,
      serviceId: input.serviceId,
      start,
      end: decision.endsAt,
      status: 'pending',
      priceCents: decision.priceCents,
    };
    if (
      hasDoubleBooking(
        row.professionalId,
        { start: row.start, end: row.end },
        this.appointments.map((item) => ({
          start: item.start,
          end: item.end,
          professionalId: item.professionalId,
          status: item.status,
        })),
      )
    ) {
      throw new Error('double_booking');
    }
    this.appointments.push(row);
    return row;
  }
}

export function futureIso(hoursFromNow = 48): string {
  return addMinutes(new Date('2026-09-20T12:00:00.000Z'), hoursFromNow * 60).toISOString();
}
