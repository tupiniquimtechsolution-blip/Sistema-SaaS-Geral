import { useMemo, useState, type ReactNode } from "react";
import type { SalonPublicConfig } from "./config/template";
import {
  buildSalonWhatsAppRequestUrl,
  normalizeSalonWhatsAppNumber,
  salonDateAtMost90DaysAhead,
  salonTodayKey,
  salonNowTime,
} from "./booking/whatsapp-request";
import "./salon-booking.css";

export function WhatsAppMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.48 0 .13 5.34.12 11.9a11.8 11.8 0 0 0 1.6 5.93L0 24l6.34-1.66a11.94 11.94 0 0 0 5.7 1.45h.01c6.58 0 11.94-5.35 11.95-11.92a11.85 11.85 0 0 0-3.48-8.39ZM12.05 21.77h-.01a9.87 9.87 0 0 1-5.02-1.37l-.36-.21-3.75.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.45 4.44-9.89 9.91-9.89a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.46-4.45 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>
    </svg>
  );
}

export function FloatingWhatsApp({ config }: { config: SalonPublicConfig }) {
  const number = normalizeSalonWhatsAppNumber(config.whatsapp);
  if (!number) return null;
  const url = "https://wa.me/" + number + "?text=" + encodeURIComponent("Olá! Gostaria de informações sobre agendamento na " + config.brandName + ".");
  return (
    <a className="salon-whatsapp-float" href={url} target="_blank" rel="noopener noreferrer"
       aria-label="Conversar pelo WhatsApp com o salão" title="WhatsApp">
      <WhatsAppMark size={30} />
    </a>
  );
}

const interests = [
  ["cabelo", "Cabelos e tratamentos"],
  ["unhas", "Unhas"],
  ["sobrancelhas", "Sobrancelhas"],
  ["maquiagem", "Maquiagem"],
  ["estetica", "Estética"],
  ["autocuidado", "Autocuidado"],
  ["outro", "Outro serviço"],
] as const;

type InterestId = typeof interests[number][0];
function ServiceIllustration({ id }: { id: InterestId }) {
  // Distinct purpose-drawn SVG line illustrations: no synthetic client photos.
  const art: Record<InterestId, ReactNode> = {
    cabelo: <>
      <path d="M15 53c-5-8-8-17-8-26C7 13 17 6 32 6s25 7 25 21c0 9-4 18-9 26"/>
      <path d="M14 27C18 13 26 11 32 11c12 0 19 7 20 19M16 32c7-4 11-11 13-18m2 18c5-4 8-10 9-16"/>
      <path d="M20 35c-1 8 0 13 4 20m8-21c-3 10-2 17 0 22m10-24c4 9 4 17-1 24"/>
      <path d="M18 45c3 3 5 5 8 5M35 52c4 1 7 0 10-3"/>
    </>,
    unhas: <>
      <path d="M16 54c-5-6-8-14-7-21 0-3 2-5 5-5 3 0 5 3 7 6L19 17c-.4-5 6-6 7-1l4 18-1-22c0-5 7-5 7 0l2 21 1-17c0-5 7-4 7 0l1 22 1-10c1-5 8-4 8 1l-1 15c-1 12-8 17-20 17-8 0-15-3-19-7Z"/>
      <path d="M19 17h7m3-5h7m3 4h7m3 12h7"/>
      <path d="M15 35c4-1 8 2 10 6m-7 3 6 4"/>
      <path d="m50 9 1.5 4.5L56 15l-4.5 1.5L50 21l-1.5-4.5L44 15l4.5-1.5Z"/>
    </>,
    sobrancelhas: <>
      <path d="M5 28c8-12 17-15 27-10M32 18c10-5 19-2 27 10" strokeWidth="2.6"/>
      <path d="M7 33c7-7 17-7 24 0-7 8-17 8-24 0Zm26 0c8-7 18-7 24 0-7 8-18 8-24 0Z"/>
      <circle cx="19" cy="33" r="4"/><circle cx="45" cy="33" r="4"/>
      <path d="M14 23c5-3 10-4 14-3m8 0c6-2 11-1 15 2M31 37l-2 8 6 2m-10 6c5 2 10 2 14 0"/>
      <path d="m9 14 3-4m6 5 2-5m26 4 2-5m7 6 3-4"/>
    </>,
    maquiagem: <>
      <path d="m11 51 26-34 8 6-27 33c-3 4-9-1-7-5Z"/>
      <path d="m37 17 6-9 12 9-10 6Z"/><path d="m40 12 11 8M13 49l7 5"/>
      <path d="M34 50 48 32l8 7-13 15c-4 5-13 1-9-4Z"/>
      <path d="M48 32c0-5 3-11 6-13 2 3 3 8 2 13"/>
      <path d="M8 25c5-7 13-7 18 0-5 6-13 6-18 0Zm1 0c5 4 11 4 16 0"/>
      <path d="m18 14 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/>
    </>,
    estetica: <><path d="M31 8c-15 0-22 13-22 25 0 12 9 22 22 22 14 0 24-9 24-23C55 19 47 8 31 8Z"/><path d="M17 30c4-3 9-3 13 0m5 0c4-3 9-3 13 0M24 42c5 4 12 4 17 0M32 23v16"/><path d="m8 9 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></>,
    autocuidado: <><path d="M32 56c-11-9-23-16-23-28 0-7 5-12 12-12 5 0 9 3 11 7 2-4 6-7 11-7 7 0 12 5 12 12 0 12-12 19-23 28Z"/><path d="m32 13 2-5 2 5 5 2-5 2-2 5-2-5-5-2z"/></>,
    outro: <><circle cx="32" cy="32" r="21"/><path d="M32 20v24M20 32h24"/><path d="m13 13 3-4 3 4M47 51l3 4 3-4"/></>,
  };
  return <svg className="salon-service-art" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.65"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{art[id]}</svg>;
}

const preferredTimes = Array.from({ length: 25 }, (_, n) => {
  const minutes = 8 * 60 + n * 30;
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" +
    String(minutes % 60).padStart(2, "0");
});

export default function SalonBooking({ config }: { config: SalonPublicConfig }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [interest, setInterest] = useState("");
  const [customService, setCustomService] = useState("");
  const [note, setNote] = useState("");

  const now = new Date();
  const today = salonTodayKey(now);
  const nowTime = salonNowTime(now);
  const [year, month] = today.split("-").map(Number);
  const visibleMonth = useMemo(() => new Date(Date.UTC(year, month - 1 + monthOffset, 1, 12)), [year, month, monthOffset]);
  const displayMonth = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(visibleMonth);
  const firstDay = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth(), 1, 12));
  const daysInMonth = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const empty = (firstDay.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array.from({ length: empty }, () => null),
    ...Array.from({ length: daysInMonth }, (_, n) =>
      String(visibleMonth.getUTCFullYear()) + "-" +
      String(visibleMonth.getUTCMonth() + 1).padStart(2, "0") + "-" +
      String(n + 1).padStart(2, "0")),
  ];

  const service = interest === "outro"
    ? customService.trim()
    : interests.find(([id]) => id === interest)?.[1] ?? "";
  const number = normalizeSalonWhatsAppNumber(config.whatsapp);
  const url = buildSalonWhatsAppRequestUrl(config.whatsapp, { service, date, time, note }, now);
  const canRequest = config.bookingEnabled && Boolean(number);
  const canSend = canRequest && Boolean(url);

  return (
    <div className="salon-booking-widget" aria-label="Solicitação de agendamento pelo WhatsApp">
      <p className="salon-booking-kicker">AGENDAMENTO PERSONALIZADO</p>
      <h3>Escolha sua preferência</h3>
      <p className="salon-booking-intro">Escolha o atendimento, o dia e o horário que deseja. A equipe confirmará a disponibilidade diretamente pelo WhatsApp.</p>

      <div className="salon-booking-label" id="salon-service-label">Tipo de serviço</div>
      <div className="salon-service-options" role="group" aria-labelledby="salon-service-label">
        {interests.map(([id, label]) => (
          <button type="button" key={id} className={interest === id ? "salon-service-option is-selected" : "salon-service-option"}
            aria-pressed={interest === id} onClick={() => setInterest(id)}>
            <ServiceIllustration id={id} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {interest === "outro" && (
        <>
          <label className="salon-booking-label" htmlFor="salon-custom-service">Qual serviço deseja?</label>
          <input id="salon-custom-service" className="salon-booking-control" maxLength={120}
            value={customService} onChange={(e) => setCustomService(e.target.value)}
            placeholder="Descreva o serviço" />
        </>
      )}
      <p className="salon-booking-hint">Conte aos nossos profissionais qual cuidado você procura. A disponibilidade será confirmada pelo WhatsApp.</p>

      <fieldset className="salon-booking-calendar" id="salon-calendar">
        <legend className="salon-booking-label">Dia de preferência</legend>
        <div className="salon-booking-month">
          <button type="button" aria-label="Mês anterior" onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
            disabled={monthOffset === 0}>‹</button>
          <strong aria-live="polite">{displayMonth}</strong>
          <button type="button" aria-label="Próximo mês" onClick={() => setMonthOffset((v) => Math.min(3, v + 1))}
            disabled={monthOffset === 3}>›</button>
        </div>
        <div className="salon-booking-days-header" aria-hidden="true">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="salon-booking-day-grid">
          {cells.map((value, index) => value ? (
            <button type="button" key={value}
              aria-label={"Dia " + value.slice(8) + "/" + value.slice(5, 7) + "/" + value.slice(0, 4)}
              aria-pressed={date === value}
              className={date === value ? "selected" : ""}
              disabled={!salonDateAtMost90DaysAhead(value, now)}
              onClick={() => { setDate(value); setTime(""); }}>
              {Number(value.slice(-2))}
            </button>
          ) : <span aria-hidden="true" key={"blank-" + index} />)}
        </div>
      </fieldset>

      <fieldset className="salon-booking-times">
        <legend className="salon-booking-label">Horário de preferência (horário de Brasília)</legend>
        <div className="salon-booking-time-grid">
          {preferredTimes.map((slot) => (
            <button type="button" key={slot} aria-pressed={time === slot}
              className={time === slot ? "selected" : ""}
              disabled={!date || (date === today && slot <= nowTime)}
              onClick={() => setTime(slot)}>{slot}</button>
          ))}
        </div>
        <p className="salon-booking-hint">Os horários são sugestões para consulta, não vagas livres confirmadas.</p>
      </fieldset>

      <label className="salon-booking-label" htmlFor="salon-message">Personalize sua mensagem (opcional)</label>
      <textarea id="salon-message" className="salon-booking-control" rows={3} maxLength={500}
        placeholder="Conte o que você gostaria de fazer, dúvidas ou observações..."
        value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="salon-booking-hint">{note.length}/500 caracteres</p>

      {canSend ? (
        <a className="salon-booking-send" href={url!} target="_blank" rel="noopener noreferrer">
          <WhatsAppMark size={22} />
          Solicitar pelo WhatsApp
        </a>
      ) : (
        <button type="button" className="salon-booking-send" disabled>
          <WhatsAppMark size={22} />
          {canRequest ? "Escolha serviço, dia e horário" : "WhatsApp indisponível"}
        </button>
      )}
      <p className="salon-booking-disclaimer" role="status">
        O pedido abre o WhatsApp com uma mensagem pronta para revisar e enviar.
        Nenhum horário é reservado automaticamente. A confirmação é feita pelo salão.
      </p>
    </div>
  );
}
