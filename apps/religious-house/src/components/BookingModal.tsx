import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { templeConfig, MARIA_MULAMBO_HOURS } from "../data/templeConfig";
import {
  addDays,
  formatLong,
  formatShort,
  generateWhatsAppMessage,
  getAvailableSlots,
  isBookingAllowed,
  parseISO,
  toISO,
  waLink,
  weekdayShort,
} from "../lib/calendar";
import { serviceLabelFor } from "../types";
import type { ServiceId } from "../types";
import { GoldArrow, GoldStar } from "./Ornaments";

/* ---------------- contexto ---------------- */

interface BookingState {
  open: boolean;
  serviceId?: ServiceId;
  date?: string;
  time?: string;
}

interface BookingCtxValue {
  openBooking: (
    serviceId?: ServiceId,
    opts?: { date?: string; time?: string }
  ) => void;
}

const BookingCtx = createContext<BookingCtxValue | null>(null);

export function useBooking(): BookingCtxValue {
  const ctx = useContext(BookingCtx);
  if (!ctx)
    throw new Error("useBooking precisa estar dentro de <BookingProvider>.");
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>({ open: false });

  const openBooking = useCallback(
    (serviceId?: ServiceId, opts?: { date?: string; time?: string }) => {
      setState({
        open: true,
        serviceId,
        date: opts?.date,
        time: opts?.time,
      });
    },
    []
  );

  const close = useCallback(
    () => setState((s) => ({ ...s, open: false })),
    []
  );

  const value = useMemo(() => ({ openBooking }), [openBooking]);

  return (
    <BookingCtx.Provider value={value}>
      {children}
      {state.open && <BookingModal initial={state} onClose={close} />}
    </BookingCtx.Provider>
  );
}

/* ---------------- assistente (5 passos) ---------------- */

const STEP_LABELS = ["Atendimento", "Data", "Horário", "Seus dados", "Revisão"];

function StepDots({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progresso do agendamento">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`grid size-7 place-items-center rounded-full border font-body text-[11px] font-bold transition-colors ${
              i < step
                ? "border-forest-600 bg-forest-600 text-cream"
                : i === step
                  ? "border-gold-500 bg-gold-500 text-forest-950"
                  : "border-forest-950/20 text-sage"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden font-body text-[10px] font-semibold uppercase tracking-[0.14em] md:block ${
              i === step ? "text-gold-700" : "text-sage/70"
            }`}
          >
            {label}
          </span>
          {i < STEP_LABELS.length - 1 && (
            <span className="h-px w-4 bg-gold-500/40" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  );
}

const inputCls =
  "w-full rounded-xl border border-forest-950/20 bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500";

function BookingModal({
  initial,
  onClose,
}: {
  initial: BookingState;
  onClose: () => void;
}) {
  const [step, setStep] = useState(initial.serviceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<ServiceId | undefined>(
    initial.serviceId
  );
  const [date, setDate] = useState<string | undefined>(initial.date);
  const [time, setTime] = useState(initial.time ?? "");
  const [prefTime, setPrefTime] = useState(initial.time ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const days = useMemo(
    () => Array.from({ length: 21 }, (_, i) => toISO(addDays(new Date(), i))),
    []
  );

  const slots = useMemo(
    () =>
      serviceId && date ? getAvailableSlots(date, serviceId) : [],
    [serviceId, date]
  );

  const service = templeConfig.services.find((s) => s.id === serviceId);
  const finalTime = time || prefTime;
  // §6 — tipo genérico "Consulta"; o nome da entidade acompanha apenas quando
  // a data escolhida é realmente uma quarta-feira (consulta com Maria Mulambo)
  const serviceLabel = serviceId
    ? serviceLabelFor(serviceId, date || undefined)
    : service?.title;

  const next = () => {
    setError("");
    if (step === 0 && !serviceId) return setError("Escolha o atendimento desejado.");
    if (step === 1 && !date) return setError("Escolha uma data para continuar.");
    if (step === 3) {
      if (!name.trim()) return setError("Informe seu nome para continuar.");
      if (!date) return setError("Escolha uma data para continuar.");
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => {
    setError("");
    if (step === 1 && initial.serviceId) return onClose();
    setStep((s) => Math.max(0, s - 1));
  };

  const waHref =
    serviceId && date && name.trim()
      ? waLink(
          generateWhatsAppMessage({
            serviceId,
            service: serviceLabel ?? "Atendimento",
            date,
            time: finalTime || undefined,
            name: name.trim(),
            phone: phone.trim() || undefined,
            note: note.trim() || undefined,
          })
        )
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Agendamento de atendimento"
    >
      <button
        className="fixed inset-0 cursor-default bg-forest-950/60 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label="Fechar agendamento"
        tabIndex={-1}
      />
      <div className="anim-rise relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold-500/35 bg-ivory shadow-[0_40px_90px_-30px_rgba(23,79,50,0.65)]">
        <header className="flex items-center justify-between gap-4 border-b border-gold-500/25 bg-cream px-6 py-4">
          <div>
            <p className="eyebrow">Agendamento</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-forest-950">
              Solicitar atendimento
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-forest-950/20 text-forest-950 transition-colors hover:border-gold-500 hover:text-gold-700"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="px-6 pt-5">
          <StepDots step={step} />
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
          {error && (
            <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 font-body text-[13px] font-semibold text-destructive">
              {error}
            </p>
          )}

          {/* passo 0 — atendimento */}
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {templeConfig.services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setDate(undefined);
                    setTime("");
                    setStep(1);
                  }}
                  className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-[0_16px_36px_-22px_rgba(23,79,50,0.4)] ${
                    serviceId === s.id
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-forest-950/15 bg-cream"
                  }`}
                >
                  <p className="font-display text-lg font-semibold leading-snug text-forest-950">
                    {s.title}
                  </p>
                  <p className="mt-1 font-body text-[12px] font-semibold text-gold-700">
                    {s.schedule}
                  </p>
                  <p className="mt-2 font-body text-[12.5px] leading-relaxed text-sage">
                    {s.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* passo 1 — data */}
          {step === 1 && (
            <div>
              <p className="mb-1 font-body text-sm font-semibold text-forest-950">
                {service?.title}
              </p>
              <p className="mb-4 font-body text-[12.5px] text-sage">
                {serviceId === "mariaMulambo"
                  ? "Consultas acontecem às quartas-feiras. Sextas são reservadas ao desenvolvimento da corrente (atividade interna)."
                  : "Sextas-feiras são reservadas ao desenvolvimento da corrente (atividade interna) e não recebem agendamento."}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((iso) => {
                  const d = parseISO(iso);
                  const allowed = isBookingAllowed(iso, serviceId);
                  const isSel = date === iso;
                  return (
                    <button
                      key={iso}
                      disabled={!allowed}
                      onClick={() => {
                        setDate(iso);
                        setTime("");
                      }}
                      aria-pressed={isSel}
                      aria-label={`${formatLong(iso)}${allowed ? "" : " — indisponível"}`}
                      className={`flex flex-col items-center rounded-xl border px-1 py-2 transition-all ${
                        isSel
                          ? "border-gold-500 bg-forest-950 text-cream shadow-[0_10px_24px_-12px_rgba(23,79,50,0.6)]"
                          : allowed
                            ? "border-forest-950/15 bg-cream text-forest-950 hover:-translate-y-0.5 hover:border-gold-500"
                            : "cursor-not-allowed border-transparent bg-cream/50 text-sage/40"
                      }`}
                    >
                      <span className="font-body text-[9px] font-bold uppercase tracking-wider opacity-70">
                        {weekdayShort(iso)}
                      </span>
                      <span className="font-display text-lg font-semibold leading-tight">
                        {d.getDate()}
                      </span>
                      <span className="font-body text-[9px] opacity-70">
                        {formatShort(iso).split(" ")[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {date && (
                <p className="mt-4 flex items-center gap-2 font-body text-[13px] font-semibold text-forest-950">
                  <GoldStar size={12} className="text-gold-500" />
                  {formatLong(date)}
                </p>
              )}
            </div>
          )}

          {/* passo 2 — horário */}
          {step === 2 && date && (
            <div>
              <p className="mb-4 font-body text-[13px] text-sage">
                <strong className="text-forest-950">{formatLong(date)}</strong>
                {" · "}
                {serviceLabel}
              </p>

              {slots.length > 0 ? (
                <>
                  <p className="eyebrow mb-2">Horários disponíveis</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setTime(s);
                          setPrefTime(s);
                        }}
                        aria-pressed={time === s}
                        className={`rounded-xl border px-3 py-2.5 font-body text-sm font-bold transition-all ${
                          time === s
                            ? "border-gold-500 bg-gold-500/15 text-forest-950"
                            : "border-forest-950/15 bg-cream text-forest-950 hover:border-gold-500"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gold-500/50 bg-cream p-4">
                  <p className="font-body text-[13px] leading-relaxed text-sage">
                    {serviceId === "mariaMulambo"
                      ? `As consultas acontecem na janela das ${MARIA_MULAMBO_HOURS}. Os horários específicos ainda não foram cadastrados pela casa — indique sua preferência e o templo confirma pelo WhatsApp.`
                      : "Os horários deste atendimento ainda não foram cadastrados pela casa. Indique sua preferência e o templo confirma pelo WhatsApp."}
                  </p>
                </div>
              )}

              <label className="mt-5 block">
                <span className="eyebrow mb-1.5 block">
                  Horário preferencial {slots.length > 0 ? "(opcional)" : ""}
                </span>
                <input
                  value={prefTime}
                  onChange={(e) => {
                    setPrefTime(e.target.value);
                    setTime("");
                  }}
                  placeholder="ex.: 19h30"
                  className={inputCls}
                />
              </label>
            </div>
          )}

          {/* passo 3 — dados */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block">
                <span className="eyebrow mb-1.5 block">Seu nome *</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="eyebrow mb-1.5 block">Telefone (opcional)</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 9…"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="eyebrow mb-1.5 block">Observação (opcional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Alguma informação que o templo deva saber…"
                  className={`${inputCls} resize-none`}
                />
              </label>
            </div>
          )}

          {/* passo 4 — revisão */}
          {step === 4 && date && (
            <div>
              <dl className="space-y-3 rounded-2xl border border-gold-500/30 bg-cream p-5">
                {(
                  [
                    ["Atendimento", serviceLabel],
                    ["Data", formatLong(date)],
                    ["Horário", finalTime || "A combinar com o templo"],
                    ["Nome", name.trim()],
                    ["Telefone", phone.trim() || "—"],
                    ["Observação", note.trim() || "—"],
                  ] as const
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-4 border-b border-gold-500/15 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="eyebrow shrink-0">{k}</dt>
                    <dd className="text-right font-body text-sm font-semibold capitalize text-forest-950">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 rounded-xl bg-mint-100 px-4 py-3 font-body text-[12.5px] leading-relaxed text-forest-800">
                Sua solicitação será confirmada diretamente pelo templo através
                do WhatsApp — este pedido não reserva o horário automaticamente.
              </p>
              {sent && (
                <p className="mt-3 flex items-center gap-2 font-body text-[13px] font-bold text-forest-800">
                  <GoldStar size={13} className="text-gold-500" />
                  Pedido aberto no WhatsApp. Axé!
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-gold-500/25 bg-cream px-6 py-4">
          {step > 0 ? (
            <button
              onClick={back}
              className="rounded-full border border-forest-950/25 px-5 py-3 font-body text-[12px] font-bold uppercase tracking-[0.1em] text-forest-950 transition-colors hover:border-gold-500"
            >
              Voltar
            </button>
          ) : (
            <span className="font-body text-[11px] uppercase tracking-[0.2em] text-sage">
              Passo 1 de 5
            </span>
          )}
          <div className="ml-auto">
            {step < 4 ? (
              <button
                onClick={next}
                className="group inline-flex items-center gap-2 rounded-full bg-forest-950 px-7 py-3 font-body text-[12px] font-bold uppercase tracking-[0.1em] text-cream transition-all hover:-translate-y-0.5 hover:bg-forest-800"
              >
                Continuar
                <GoldArrow size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => setSent(true)}
                aria-disabled={!waHref}
                className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 font-body text-[12px] font-bold uppercase tracking-[0.1em] text-forest-950 transition-all hover:-translate-y-0.5 hover:bg-gold-300"
              >
                Solicitar pelo WhatsApp
                <GoldArrow size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
