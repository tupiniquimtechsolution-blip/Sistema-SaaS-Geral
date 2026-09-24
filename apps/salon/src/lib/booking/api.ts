import { tryGetSupabaseClient } from '../supabase/client';
import type { AppointmentRow, AppointmentStatus } from '../supabase/types';
import type { GeneratedSlot } from './overlap';
import { createAppointmentInputSchema } from './engine';

export interface AppointmentView {
  id: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName?: string;
  date: string;
  time: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  price: number;
  priceCents: number;
  clientName?: string;
  clientPhone?: string;
  customerId: string;
  createdAt: string;
}

function mapAppointment(
  row: AppointmentRow & {
    services?: { name?: string } | { name?: string }[] | null;
    professionals?: { display_name?: string } | { display_name?: string }[] | null;
    profiles?: { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[] | null;
  },
): AppointmentView {
  const rel = <T,>(value: T | T[] | null | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : value ?? undefined;
  const start = new Date(row.starts_at);
  const date = start.toISOString().slice(0, 10);
  const time = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const service = rel(row.services);
  const professional = rel(row.professionals);
  const profile = rel(row.profiles);
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: service?.name ?? 'Serviço',
    professionalId: row.professional_id,
    professionalName: professional?.display_name,
    date,
    time,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    price: row.price_cents / 100,
    priceCents: row.price_cents,
    clientName: profile?.full_name,
    clientPhone: profile?.phone,
    customerId: row.customer_id,
    createdAt: row.created_at,
  };
}

export async function listMyAppointments(): Promise<AppointmentView[]> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name), professionals(display_name)')
    .order('starts_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapAppointment(row as AppointmentRow));
}

export async function listAdminAppointments(): Promise<AppointmentView[]> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name), professionals(display_name), profiles(full_name, phone)')
    .order('starts_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapAppointment(row as AppointmentRow));
}

export async function listSlots(args: {
  professionalId: string;
  serviceId: string;
  date: string;
  durationMinutes: number;
}): Promise<GeneratedSlot[]> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.rpc('list_available_slots', {
    p_professional_id: args.professionalId,
    p_service_id: args.serviceId,
    p_date: args.date,
  });
  if (error) throw error;
  return (data ?? []).map((slot: { slot_start: string; available: boolean }) => ({
    time: new Date(slot.slot_start).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    start: new Date(slot.slot_start),
    available: slot.available,
  }));
}

export async function createAppointment(input: {
  serviceId: string;
  professionalId: string;
  startsAt: string;
  notes?: string;
  operationalConsent: boolean;
  marketingConsent: boolean;
  imageConsent: boolean;
}): Promise<AppointmentRow> {
  const parsed = createAppointmentInputSchema.parse({
    serviceId: input.serviceId,
    professionalId: input.professionalId,
    startsAt: input.startsAt,
    notes: input.notes ?? '',
    operationalConsent: input.operationalConsent,
    marketingConsent: input.marketingConsent,
    imageConsent: input.imageConsent,
  });
  const supabase = tryGetSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase não configurado. O agendamento não pode ser persistido em localStorage.');
  }
  const { data, error } = await supabase.rpc('create_appointment', {
    p_service_id: parsed.serviceId,
    p_professional_id: parsed.professionalId,
    p_starts_at: parsed.startsAt,
    p_notes: parsed.notes,
    p_operational_consent: parsed.operationalConsent,
    p_marketing_consent: parsed.marketingConsent,
    p_image_consent: parsed.imageConsent,
  });
  if (error) throw error;
  return data as AppointmentRow;
}

export async function cancelAppointment(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.rpc('cancel_appointment', { p_appointment_id: id });
  if (error) throw error;
}

export async function adminSetAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.rpc('admin_set_appointment_status', {
    p_appointment_id: id,
    p_status: status,
  });
  if (error) throw error;
}
