export interface TimeRange {
  start: Date;
  end: Date;
}

export const ACTIVE_APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed'] as const;

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function parseHm(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number);
  return { hours, minutes };
}

export function formatHm(date: Date, timeZone = 'America/Sao_Paulo'): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}

export function weekdayInTimeZone(date: Date, timeZone = 'America/Sao_Paulo'): number {
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(date);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
}

export function hasDoubleBooking(
  professionalId: string,
  candidate: TimeRange,
  existing: Array<TimeRange & { professionalId: string; status: string }>,
): boolean {
  return existing.some(
    (item) =>
      item.professionalId === professionalId &&
      !['cancelled', 'no_show'].includes(item.status) &&
      rangesOverlap(candidate, item),
  );
}

export interface SlotInput {
  date: string;
  durationMinutes: number;
  slotMinutes: number;
  open: string | null;
  close: string | null;
  occupied: TimeRange[];
  blocked: TimeRange[];
  timeZone?: string;
}

export interface GeneratedSlot {
  time: string;
  start: Date;
  available: boolean;
}

export function generateSlots(input: SlotInput): GeneratedSlot[] {
  if (!input.open || !input.close) return [];

  const timeZone = input.timeZone ?? 'America/Sao_Paulo';
  const open = parseHm(input.open);
  const close = parseHm(input.close);
  const slots: GeneratedSlot[] = [];

  const base = new Date(`${input.date}T00:00:00`);
  const utcOpen = zonedLocalToUtc(input.date, open.hours, open.minutes, timeZone);
  const utcClose = zonedLocalToUtc(input.date, close.hours, close.minutes, timeZone);
  if (!utcOpen || !utcClose || Number.isNaN(base.getTime())) return [];

  let cursor = utcOpen;
  while (addMinutes(cursor, input.durationMinutes) <= utcClose) {
    const end = addMinutes(cursor, input.durationMinutes);
    const range = { start: cursor, end };
    const blocked =
      input.occupied.some((item) => rangesOverlap(range, item)) ||
      input.blocked.some((item) => rangesOverlap(range, item));
    slots.push({
      time: formatHm(cursor, timeZone),
      start: cursor,
      available: !blocked,
    });
    cursor = addMinutes(cursor, input.slotMinutes);
  }

  return slots;
}

export function zonedLocalToUtc(
  date: string,
  hours: number,
  minutes: number,
  timeZone: string,
): Date | null {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return null;

  let guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  const offset = tzOffsetMinutes(guess, timeZone);
  guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0) - offset * 60_000);

  const probe = tzParts(guess, timeZone);
  if (probe.hours !== hours || probe.minutes !== minutes || probe.day !== day) {
    const deltaHours = hours - probe.hours;
    const deltaMinutes = minutes - probe.minutes;
    guess = new Date(guess.getTime() + (deltaHours * 60 + deltaMinutes) * 60_000);
  }
  return guess;
}

function tzOffsetMinutes(date: Date, timeZone: string): number {
  const parts = tzParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes, parts.seconds);
  return (asUtc - date.getTime()) / 60_000;
}

function tzParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hours: read('hour'),
    minutes: read('minute'),
    seconds: read('second'),
  };
}
