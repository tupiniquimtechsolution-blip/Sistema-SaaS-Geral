import { useMemo } from "react";
import { MARIA_MULAMBO_HOURS, templeConfig } from "../data/templeConfig";
import {
  MONTHS,
  WEEK_SHORT,
  formatLong,
  getAvailableSlots,
  getEventsForDate,
  isBookingAllowed,
  isPast,
  monthGrid,
  parseISO,
  shiftMonth,
  todayISO,
} from "../lib/calendar";
import { useBooking } from "./BookingModal";
import { GoldArrow } from "./Ornaments";
import { EventBadge } from "./ui";

const MULAMBO = "var(--color-mulambo)";

/* ---------------- grade mensal ---------------- */

export function CalendarMonth({
  year,
  month,
  selected,
  onSelect,
  onShift,
}: {
  year: number;
  month: number;
  selected: string;
  onSelect: (iso: string) => void;
  onShift: (delta: number) => void;
}) {
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayISO();
  const canPrev = year * 12 + month > new Date().getFullYear() * 12 + new Date().getMonth();

  return (
    <div className="card-temple overflow-hidden rounded-3xl bg-ivory">
      <header className="flex items-center justify-between gap-3 border-b border-gold-500/25 bg-cream px-5 py-4">
        <h3 className="font-display text-2xl font-semibold capitalize text-forest-950">
          {MONTHS[month]}{" "}
          <span className="text-gold-700">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onShift(-1)}
            disabled={!canPrev}
            aria-label="Mês anterior"
            className="grid size-10 place-items-center rounded-full border border-forest-950/20 text-forest-950 transition-colors hover:border-gold-500 hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <GoldArrow size={15} className="rotate-180" />
          </button>
          <button
            onClick={() => onShift(1)}
            aria-label="Próximo mês"
            className="grid size-10 place-items-center rounded-full border border-forest-950/20 text-forest-950 transition-colors hover:border-gold-500 hover:text-gold-700"
          >
            <GoldArrow size={15} />
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label="Calendário mensal">
          {WEEK_SHORT.map((w) => (
            <div
              key={w}
              className="pb-2 text-center font-body text-[10px] font-bold uppercase tracking-[0.18em] text-sage"
            >
              {w}
            </div>
          ))}
          {cells.map((iso) => {
            const inMonth = parseISO(iso).getMonth() === month;
            const past = isPast(iso);
            const isToday = iso === today;
            const isSel = iso === selected;
            const events = inMonth ? getEventsForDate(iso) : [];
            const mmDot = events.some((e) => e.type === "consulta");
            const giraDot = events.some((e) => e.type === "gira" || e.type === "festa");
            const devDot = events.some((e) => e.type === "desenvolvimento");
            const labels: string[] = [];
            if (giraDot) labels.push("gira");
            if (mmDot) labels.push("Consulta com Maria Mulambo disponível");
            if (devDot) labels.push("desenvolvimento da corrente");

            return (
              <button
                key={iso}
                onClick={() => onSelect(iso)}
                aria-pressed={isSel}
                aria-label={`${formatLong(iso)}${labels.length ? ` — ${labels.join(", ")}` : ""}`}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition-all duration-200 sm:aspect-[7/6] ${
                  isSel
                    ? "border-forest-950 bg-forest-950 text-cream shadow-[0_12px_26px_-14px_rgba(23,79,50,0.7)]"
                    : isToday
                      ? "border-gold-500 bg-gold-500/10 text-forest-950 ring-1 ring-gold-500"
                      : inMonth
                        ? past
                          ? "border-transparent text-sage/45 hover:border-forest-950/15"
                          : "border-transparent text-forest-950 hover:-translate-y-0.5 hover:border-gold-500/70 hover:bg-gold-500/10"
                        : "border-transparent text-sage/30"
                }`}
              >
                <span className="font-display text-base font-semibold leading-none sm:text-lg">
                  {parseISO(iso).getDate()}
                </span>
                <span className="mt-1.5 flex items-center gap-[3px]" aria-hidden>
                  {giraDot && (
                    <span
                      className={`size-1.5 rounded-full ${isSel ? "bg-gold-300" : "bg-gold-500"}`}
                    />
                  )}
                  {mmDot && (
                    <span
                      className={`size-1.5 rounded-full ${isSel ? "opacity-75" : ""}`}
                      style={{ background: MULAMBO }}
                      title="Consulta com Maria Mulambo disponível"
                    />
                  )}
                  {devDot && (
                    <span
                      className={`size-1.5 rounded-full ${isSel ? "bg-forest-300" : "bg-forest-300"}`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* legenda */}
        <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gold-500/20 pt-4 font-body text-[11px] font-semibold text-sage">
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-gold-500" aria-hidden /> Gira
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: MULAMBO }} aria-hidden />
            Consulta com Maria Mulambo (quartas)
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-forest-300" aria-hidden /> Atividade interna
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-md border border-gold-500 bg-gold-500/10" aria-hidden /> Hoje
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ---------------- grade de horários ---------------- */

export function TimeSlotGrid({
  slots,
  onPick,
}: {
  slots: string[];
  onPick: (slot: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="rounded-xl border border-forest-950/15 bg-cream px-3 py-2.5 font-body text-sm font-bold text-forest-950 transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/* ---------------- painel do dia ---------------- */

export function DayPanel({ date, onClose }: { date: string; onClose: () => void }) {
  const events = useMemo(() => getEventsForDate(date), [date]);
  const { openBooking } = useBooking();
  const blocked = !isBookingAllowed(date);
  const bookable = templeConfig.services.filter((s) => isBookingAllowed(date, s.id));

  return (
    <aside
      className="card-temple flex h-fit flex-col overflow-hidden rounded-3xl bg-ivory lg:sticky lg:top-28"
      aria-label={`Detalhes de ${formatLong(date)}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-gold-500/25 bg-cream px-5 py-4">
        <div>
          <p className="eyebrow">Dia selecionado</p>
          <h3 className="mt-1 font-display text-xl font-semibold capitalize leading-snug text-forest-950">
            {formatLong(date)}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar painel do dia"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-forest-950/20 text-forest-950 transition-colors hover:border-gold-500 hover:text-gold-700"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="space-y-3 px-5 py-4">
        {events.length === 0 && (
          <p className="font-body text-sm leading-relaxed text-sage">
            Sem trabalhos marcados para esta data.
          </p>
        )}
        {events.map((ev, i) => (
          <div
            key={`${ev.date}-${ev.type}-${i}`}
            className="rounded-2xl border border-forest-950/10 bg-cream p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <EventBadge type={ev.type} />
              {!ev.confirmed && (
                <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-body text-[9.5px] font-bold uppercase tracking-[0.12em] text-gold-700">
                  A confirmar
                </span>
              )}
            </div>
            <p className="mt-2 font-display text-lg font-semibold leading-snug text-forest-950">
              {ev.title}
            </p>
            {ev.time && (
              <p className="font-body text-[12px] font-bold text-gold-700">{ev.time}</p>
            )}
            {ev.description && (
              <p className="mt-1 font-body text-[12.5px] leading-relaxed text-sage">
                {ev.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gold-500/25 px-5 py-4">
        <p className="eyebrow mb-3">Agendar neste dia</p>

        {blocked && (
          <p className="rounded-2xl bg-mint-100 px-4 py-3 font-body text-[12.5px] leading-relaxed text-forest-800">
            {isPast(date)
              ? "Esta data já passou e não recebe agendamento."
              : templeConfig.blockedDates.includes(date)
                ? "Esta data está indisponível para agendamento."
                : "Sexta-feira é dia de desenvolvimento da corrente — atividade interna, sem agendamento."}
          </p>
        )}

        {!blocked &&
          bookable.map((s) => {
            const slots = getAvailableSlots(date, s.id);
            return (
              <div key={s.id} className="mb-4 last:mb-0">
                <p className="mb-2 flex items-baseline justify-between gap-3 font-body text-[13px] font-bold text-forest-950">
                  {s.title}
                  {s.id === "mariaMulambo" && (
                    <span className="font-body text-[11px] font-semibold text-sage">
                      janela {MARIA_MULAMBO_HOURS}
                    </span>
                  )}
                </p>
                {slots.length > 0 ? (
                  <TimeSlotGrid
                    slots={slots}
                    onPick={(slot) => openBooking(s.id, { date, time: slot })}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-gold-500/50 bg-cream px-4 py-3">
                    <p className="min-w-0 flex-1 font-body text-[12px] leading-relaxed text-sage">
                      Horários a confirmar pelo templo.
                    </p>
                    <button
                      onClick={() => openBooking(s.id, { date })}
                      className="shrink-0 rounded-full bg-forest-950 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-cream transition-all hover:-translate-y-0.5 hover:bg-forest-800"
                    >
                      Solicitar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        {!blocked && bookable.length === 0 && (
          <p className="font-body text-[12.5px] text-sage">
            Nenhum atendimento disponível nesta data.
          </p>
        )}
      </div>
    </aside>
  );
}

export { shiftMonth };
