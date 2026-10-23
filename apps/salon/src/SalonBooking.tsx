import { useMemo, useState } from "react";
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
  ["estetica", "Estética e autocuidado"],
  ["outro", "Outro serviço"],
] as const;

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

      <label className="salon-booking-label" htmlFor="salon-service">Tipo de serviço</label>
      <select id="salon-service" className="salon-booking-control" value={interest} onChange={(e) => setInterest(e.target.value)}>
        <option value="">Selecione a área de interesse</option>
        {interests.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
      </select>
      {interest === "outro" && (
        <>
          <label className="salon-booking-label" htmlFor="salon-custom-service">Qual serviço deseja?</label>
          <input id="salon-custom-service" className="salon-booking-control" maxLength={120}
            value={customService} onChange={(e) => setCustomService(e.target.value)}
            placeholder="Descreva o serviço" />
        </>
      )}
      <p className="salon-booking-hint">Áreas para consulta, não um catálogo de serviços ou preços confirmados.</p>

      <fieldset className="salon-booking-calendar">
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
