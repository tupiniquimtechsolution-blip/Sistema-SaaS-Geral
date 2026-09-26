import { templeConfig } from "../data/templeConfig";
import type { AgendaItem, BookingPayload, GiraEvent, ServiceId } from "../types";

/* =========================================================
 * Toda a lógica de agenda, disponibilidade e WhatsApp.
 * As datas são sempre LOCAIS (sem UTC) para evitar
 * deslocamento de dia.
 * ========================================================= */

export const waLink = (msg: string) =>
  `https://wa.me/${templeConfig.phone}?text=${encodeURIComponent(msg)}`;

export const WHATSAPP_URL = waLink(
  "Axé. Vim pelo site e gostaria de mais informações."
);

/* ---------------- utilitários de data ---------------- */

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const toDateStr = toISO;

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export const parseDate = parseISO;

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function isPast(iso: string): boolean {
  return iso < todayISO();
}

export function weekdayOf(iso: string): number {
  return parseISO(iso).getDay();
}

export const WEEK_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const WEEK_LONG = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
export const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function weekdayAbbr(d: Date): string {
  return WEEK_SHORT[d.getDay()];
}
export function weekdayShort(iso: string): string {
  return WEEK_SHORT[weekdayOf(iso)];
}
export function weekdayLong(iso: string): string {
  return WEEK_LONG[weekdayOf(iso)];
}
export function monthName(m: number): string {
  return MONTHS[m];
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${WEEK_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 42 células (6 semanas) começando no domingo */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => toISO(addDays(start, i)));
}
export const monthMatrix = monthGrid;

export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { y: number; m: number } {
  const d = new Date(year, month + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

/* ---------------- agregação de eventos ---------------- */

const mmRule = templeConfig.mariaMulamboWeeklyRule;

function overrideFor(iso: string, serviceId?: ServiceId) {
  return templeConfig.bookingDateOverrides.find(
    (o) => o.date === iso && (!o.serviceId || o.serviceId === serviceId)
  );
}

/** Regra recorrente: toda quarta-feira futura = consulta com Maria Mulambo. */
function mmItemFor(iso: string): AgendaItem | null {
  if (weekdayOf(iso) !== mmRule.weekday) return null;
  if (isPast(iso)) return null;
  if (templeConfig.blockedDates.includes(iso)) return null;
  const ov = overrideFor(iso, "mariaMulambo");
  if (ov && !ov.enabled) return null;
  return {
    date: iso,
    weekdayLabel: "quarta-feira",
    title: "Consulta com Maria Mulambo",
    time: mmRule.window,
    description:
      "Atendimento individual de orientação e acolhimento, mediante agendamento pelo WhatsApp.",
    type: "consulta",
    entity: mmRule.entity,
    confirmed: true,
  };
}

function giraToItem(g: GiraEvent): AgendaItem {
  return {
    date: g.date,
    weekdayLabel: WEEK_LONG[weekdayOf(g.date)],
    title: g.title,
    time: g.startTime
      ? g.endTime
        ? `${g.startTime} – ${g.endTime}`
        : g.startTime
      : undefined,
    description: g.description,
    type: g.type,
    entity: g.entity,
    confirmed: g.confirmed,
  };
}

export function getEventsForDate(iso: string): AgendaItem[] {
  const items: AgendaItem[] = [];

  const mm = mmItemFor(iso);
  if (mm) items.push(mm);

  for (const g of templeConfig.giras) {
    if (g.date === iso) items.push(giraToItem(g));
  }

  const wd = weekdayOf(iso);

  // sexta-feira — desenvolvimento da corrente (atividade interna, sempre)
  if (wd === 5) {
    items.push({
      date: iso,
      weekdayLabel: "sexta-feira",
      title: "Desenvolvimento da corrente",
      description:
        "Desenvolvimento das entidades que participarão da gira de sábado.",
      type: "desenvolvimento",
      // a identidade pertence ao EVENTO: quando a arte oficial de
      // Desenvolvimento for plugada em entityVisuals, todos os componentes
      // (Home, calendário, detalhes) passam a exibi-la automaticamente.
      entity: "desenvolvimento",
      confirmed: true,
      internal: true,
    });
  }

  // sábado sem gira cadastrada — programação a confirmar
  if (wd === 6 && !templeConfig.giras.some((g) => g.date === iso)) {
    items.push({
      date: iso,
      weekdayLabel: "sábado",
      title: "Gira de sábado",
      description: isPast(iso) ? undefined : "Programação a confirmar",
      type: "gira",
      confirmed: false,
    });
  }

  return items;
}
export const eventsOn = getEventsForDate;

export function getEventsThisWeek(): AgendaItem[] {
  const start = startOfWeek(new Date());
  const out: AgendaItem[] = [];
  for (let i = 0; i < 7; i++) {
    const iso = toISO(addDays(start, i));
    if (isPast(iso)) continue;
    out.push(...getEventsForDate(iso));
  }
  return out;
}

export function getNextEvent(from = new Date()): AgendaItem | null {
  for (let i = 0; i < 90; i++) {
    const iso = toISO(addDays(from, i));
    const found = getEventsForDate(iso).find((e) => !e.internal);
    if (found) return found;
  }
  return null;
}

export function getNextSaturdayGira(from = new Date()): AgendaItem {
  for (let i = 0; i < 120; i++) {
    const iso = toISO(addDays(from, i));
    if (weekdayOf(iso) !== 6) continue;
    const confirmed = templeConfig.giras.find(
      (g) => g.date === iso && g.confirmed
    );
    if (confirmed) return giraToItem(confirmed);
    return {
      date: iso,
      weekdayLabel: "sábado",
      title: "Gira de sábado",
      description: "Programação a confirmar",
      type: "gira",
      confirmed: false,
    };
  }
  return {
    date: toISO(addDays(from, 2)),
    weekdayLabel: "sábado",
    title: "Gira de sábado",
    description: "Programação a confirmar",
    type: "gira",
    confirmed: false,
  };
}

export function getNextMariaMulamboConsultation(
  from = new Date()
): AgendaItem | null {
  for (let i = 0; i < 90; i++) {
    const iso = toISO(addDays(from, i));
    const item = mmItemFor(iso);
    if (item) return item;
  }
  return null;
}

export function getUpcomingEvents(from = new Date(), days = 120): AgendaItem[] {
  const out: AgendaItem[] = [];
  for (let i = 0; i < days; i++) {
    out.push(...getEventsForDate(toISO(addDays(from, i))));
  }
  return out;
}

export interface UpcomingActivities {
  giras: AgendaItem[];
  desenvolvimento: AgendaItem | null;
  consultas: AgendaItem[];
}

export function getUpcomingActivities(
  from = new Date(),
  limit = 3
): UpcomingActivities {
  const all = getUpcomingEvents(from, 120);
  return {
    giras: all
      .filter((e) => (e.type === "gira" || e.type === "festa") && e.confirmed)
      .slice(0, limit),
    desenvolvimento: all.find((e) => e.type === "desenvolvimento") ?? null,
    consultas: all.filter((e) => e.type === "consulta").slice(0, limit),
  };
}

/* ---------------- disponibilidade / agendamento ---------------- */

/**
 * Retorna somente os horários REALMENTE configurados para aquele
 * serviço/data. Nunca inventa horários.
 */
export function getAvailableSlots(iso: string, serviceId: ServiceId): string[] {
  if (isPast(iso)) return [];

  const ovs = templeConfig.bookingDateOverrides.filter(
    (o) => o.date === iso && (!o.serviceId || o.serviceId === serviceId)
  );
  if (ovs.some((o) => !o.enabled)) return [];
  const slotOv = ovs.find((o) => o.enabled && o.slots && o.slots.length > 0);
  if (slotOv?.slots?.length) return slotOv.slots;

  const wd = weekdayOf(iso);

  if (serviceId === "mariaMulambo") {
    if (wd !== mmRule.weekday) return [];
    return mmRule.slots;
  }

  const rule = templeConfig.bookingAvailability.find(
    (r) => r.serviceId === serviceId && r.weekdays.includes(wd)
  );
  return rule?.slots ?? [];
}

export function isBookingAllowed(iso: string, serviceId?: ServiceId): boolean {
  if (isPast(iso)) return false;
  if (templeConfig.blockedDates.includes(iso)) return false;

  const wd = weekdayOf(iso);
  // sexta-feira é desenvolvimento interno — bloqueada para agendamento
  if (wd === 5) return false;

  // Maria Mulambo: somente quartas, salvo override explícito
  if (serviceId === "mariaMulambo" && wd !== mmRule.weekday) {
    const ov = templeConfig.bookingDateOverrides.find(
      (o) => o.date === iso && o.serviceId === "mariaMulambo" && o.enabled
    );
    if (!ov) return false;
  }

  return true;
}

/* ---------------- WhatsApp ---------------- */

export function generateWhatsAppMessage(p: BookingPayload): string {
  const lines = [
    "Axé. Gostaria de solicitar um agendamento.",
    `Nome: ${p.name}`,
    `Atendimento: ${p.service}`,
    `Data: ${formatLong(p.date)}`,
  ];
  if (p.time) lines.push(`Horário: ${p.time}`);
  if (p.phone) lines.push(`Telefone: ${p.phone}`);
  if (p.note) lines.push("Observação:", p.note);
  return lines.join("\n");
}
