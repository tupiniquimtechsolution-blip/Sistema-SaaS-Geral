import { z } from 'zod';
import { addMinutes, hasDoubleBooking, type TimeRange } from './overlap';

export const createAppointmentInputSchema = z.object({
  serviceId: z.string().uuid(),
  professionalId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional().default(''),
  operationalConsent: z.literal(true),
  marketingConsent: z.boolean().default(false),
  imageConsent: z.boolean().default(false),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;

export interface CatalogService {
  id: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
}

export interface BookingContext {
  now: Date;
  actorId: string | null;
  actorRole: 'customer' | 'professional' | 'admin' | null;
  service: CatalogService | null;
  professionalActive: boolean;
  professionalOffersService: boolean;
  open: string | null;
  close: string | null;
  occupied: Array<TimeRange & { professionalId: string; status: string }>;
  blocked: TimeRange[];
}

export type BookingDecision =
  | { ok: true; endsAt: Date; priceCents: number }
  | { ok: false; code: string };

export function decideCreateAppointment(
  input: CreateAppointmentInput,
  ctx: BookingContext,
): BookingDecision {
  if (!ctx.actorId) return { ok: false, code: 'not_authenticated' };
  if (!input.operationalConsent) return { ok: false, code: 'operational_consent_required' };
  if (!ctx.service || !ctx.service.active) return { ok: false, code: 'service_not_found' };
  if (!ctx.professionalActive || !ctx.professionalOffersService) {
    return { ok: false, code: 'professional_not_available' };
  }

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime()) || startsAt <= ctx.now) {
    return { ok: false, code: 'starts_in_past' };
  }

  const endsAt = addMinutes(startsAt, ctx.service.durationMinutes);
  const candidate = { start: startsAt, end: endsAt };

  if (!ctx.open || !ctx.close) return { ok: false, code: 'outside_business_hours' };

  if (hasDoubleBooking(input.professionalId, candidate, ctx.occupied)) {
    return { ok: false, code: 'double_booking' };
  }

  if (ctx.blocked.some((item) => item.start < endsAt && item.end > startsAt)) {
    return { ok: false, code: 'period_blocked' };
  }

  return { ok: true, endsAt, priceCents: ctx.service.priceCents };
}

export function canReadAppointment(args: {
  actorId: string | null;
  actorRole: string | null;
  customerId: string;
}): boolean {
  if (!args.actorId) return false;
  if (args.actorRole === 'admin') return true;
  return args.customerId === args.actorId;
}

export function canWriteAdminResource(actorRole: string | null): boolean {
  return actorRole === 'admin';
}

export function centsToReais(cents: number): number {
  return cents / 100;
}

export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}
