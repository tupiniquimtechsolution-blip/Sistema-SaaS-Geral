/** WhatsApp booking requests are customer-initiated. Never claim a reserved slot. */
export interface SalonWhatsAppRequest {
  service: string;
  date: string;
  time: string;
  note?: string;
}
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function normalizeSalonWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return /^55[1-9]\d{9,10}$/.test(digits) ? digits : "";
}

function validCalendarDate(date: string): boolean {
  if (!datePattern.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const created = new Date(Date.UTC(y, m - 1, d, 12));
  return created.getUTCFullYear() === y && created.getUTCMonth() === m - 1 && created.getUTCDate() === d;
}

export function salonTodayKey(now: Date = new Date()): string {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "";
  return get("year") + "-" + get("month") + "-" + get("day");
}

export function salonNowTime(now: Date = new Date()): string {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", hourCycle: "h23", hour: "2-digit", minute: "2-digit"
  }).formatToParts(now);
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "";
  return get("hour") + ":" + get("minute");
}

export function salonDateAtMost90DaysAhead(date: string, now: Date = new Date()): boolean {
  if (!validCalendarDate(date)) return false;
  const today = salonTodayKey(now);
  const [year, month, day] = today.split("-").map(Number);
  const max = new Date(Date.UTC(year, month - 1, day + 90, 12)).toISOString().slice(0, 10);
  return date >= today && date <= max;
}

export function buildSalonWhatsAppRequestUrl(
  number: string, details: SalonWhatsAppRequest, now: Date = new Date()
): string | null {
  const digits = normalizeSalonWhatsAppNumber(number);
  const service = details.service.trim().replace(/\s+/g, " ");
  const note = (details.note || "").trim();
  if (!digits || !service || service.length > 120 || note.length > 500 ||
      !salonDateAtMost90DaysAhead(details.date, now) || !timePattern.test(details.time)) return null;
  if (details.date === salonTodayKey(now) && details.time <= salonNowTime(now)) return null;
  const [year, month, day] = details.date.split("-");
  const lines = [
    "Olá! Gostaria de solicitar um agendamento na Vanessa Braz.",
    "Serviço de interesse: " + service,
    "Data de preferência: " + day + "/" + month + "/" + year,
    "Horário de preferência: " + details.time + " (Brasília)",
    note ? "Mensagem: " + note : "",
    "Este é um pedido de horário; aguardo a confirmação da disponibilidade pelo salão."
  ].filter(Boolean);
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(lines.join("\n"));
}
