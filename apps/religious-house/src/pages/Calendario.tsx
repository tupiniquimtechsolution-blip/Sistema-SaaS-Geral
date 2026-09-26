import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarMonth, DayPanel } from "../components/CalendarBits";
import { EntityArtCard, UpcomingActivities } from "../components/EntityCard";
import { GoldArrow } from "../components/Ornaments";
import { Reveal, TempleButton } from "../components/ui";
import { waLink } from "../lib/calendar";
import {
  getEventsForDate,
  parseISO,
  shiftMonth,
  todayISO,
} from "../lib/calendar";
import { PageHeader } from "./InnerPages";

export default function Calendario() {
  const [params] = useSearchParams();
  const paramDate = params.get("date");
  const today = todayISO();
  const initial =
    paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : today;

  const [cursor, setCursor] = useState(() => {
    const d = parseISO(initial);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(initial);

  const events = useMemo(() => getEventsForDate(selected), [selected]);
  const giraItem = events.find((e) => e.type === "gira" || e.type === "festa");

  const pick = (iso: string) => {
    setSelected(iso);
    const d = parseISO(iso);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Calendário"
        title={
          <>
            Próximos <em className="text-gold-700">trabalhos</em>
          </>
        }
        subtitle="Giras aos sábados, desenvolvimento da corrente às sextas (atividade interna) e consultas com Maria Mulambo às quartas. Toque em um dia para ver os detalhes."
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <UpcomingActivities onPickDate={pick} />

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <CalendarMonth
            year={cursor.y}
            month={cursor.m}
            selected={selected}
            onSelect={pick}
            onShift={(delta) => {
              const next = shiftMonth(cursor.y, cursor.m, delta);
              setCursor(next);
            }}
          />
          <Reveal delay={120}>
            <DayPanel
              key={selected}
              date={selected}
              onClose={() => setSelected(today)}
            />
          </Reveal>
        </div>

        {/* gira do dia selecionado — arte da entidade */}
        {giraItem && (
          <Reveal className="mt-10">
            <EntityArtCard
              item={giraItem}
              action={
                <>
                  <a
                    href={waLink(
                      `Axé. Gostaria de confirmar a gira de ${giraItem.date.split("-").reverse().join("/")}.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-forest-950 px-6 py-3 font-body text-[12.5px] font-bold text-cream transition-all hover:-translate-y-0.5 hover:bg-forest-800"
                  >
                    Confirmar pelo WhatsApp
                    <GoldArrow size={15} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </>
              }
            />
          </Reveal>
        )}
      </div>
    </div>
  );
}
