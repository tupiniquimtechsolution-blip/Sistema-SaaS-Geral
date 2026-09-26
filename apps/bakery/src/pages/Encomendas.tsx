import { useMemo, useState } from "react";
import { useApp } from "../core/store";
import { ORDER_TYPES } from "../business/products";
import { buildScheduleOptions, formatBRL, track, useSEO, waLink } from "../core/utils";
import { ICalendar, ICheck, IClock, IUser, IWhatsApp, INote, ISpark } from "../components/icons";

export default function Encomendas() {
  const { business, notify } = useApp();
  useSEO(`Encomendas | ${business.name}`, "Bolos confeitados, coffee breaks, cestas e mesas de festa sob encomenda.");

  const [type, setType] = useState<string>(ORDER_TYPES[0].id);
  const [details, setDetails] = useState("");
  const [qty, setQty] = useState("10");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const days = useMemo(() => {
    const opts = buildScheduleOptions(business.openingHours);
    return opts.length > 1 ? opts.slice(1) : opts; // encomenda: a partir de amanhã
  }, [business.openingHours]);

  const typeLabel = ORDER_TYPES.find((t) => t.id === type)?.label ?? "";

  const submit = () => {
    const e: Record<string, string> = {};
    if (details.trim().length < 5) e.details = "Descreva o que você precisa.";
    if (!qty || Number(qty) < 1) e.qty = "Quantidade?";
    if (!slot) e.slot = "Escolha o horário de retirada/entrega.";
    if (name.trim().length < 2) e.name = "Seu nome.";
    if (phone.replace(/\D/g, "").length < 10) e.phone = "WhatsApp com DDD.";
    setErrors(e);
    if (Object.keys(e).length) return;

    track("request_order", { type, qty });
    const msg = [
      `Olá, ${business.name}! Gostaria de fazer uma *encomenda*.`,
      "",
      `*Tipo:* ${typeLabel}`,
      `*Detalhes:* ${details}`,
      `*Quantidade:* ${qty}`,
      `*Data:* ${days[dayIdx]?.label}`,
      `*Horário:* ${slot}`,
      `*Nome:* ${name}`,
      `*WhatsApp:* ${phone}`,
      note ? `*Observações:* ${note}` : "",
      "",
      "Podem confirmar disponibilidade e valor?",
    ].filter(Boolean).join("\n");

    // registra a solicitação localmente (arquitetura pronta para backend)
    try {
      const key = `${business.tenantId}.leads`;
      const leads = JSON.parse(localStorage.getItem(key) ?? "[]");
      leads.unshift({ type, details, qty, date: days[dayIdx]?.label, slot, name, phone, note, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(leads));
    } catch { /* noop */ }

    notify("Encomenda registrada!", "success");
    if (business.integrations.whatsapp.enabled) {
      window.open(waLink(business.integrations.whatsapp.number || business.contact.whatsapp, msg), "_blank");
    }
    setDone(true);
  };

  if (done) {
    return (
      <main className="light-section flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <span className="anim-rise grid h-20 w-20 place-items-center rounded-full bg-terra text-flour">
          <ICheck size={36} />
        </span>
        <h1 className="font-display mt-6 text-4xl font-medium md:text-5xl">Encomenda registrada.</h1>
        <p className="mt-3 max-w-md text-[15px] text-inksoft">
          A casa responde em até <strong className="text-ink">2 horas úteis</strong> com disponibilidade e valor fechado.
          {business.integrations.whatsapp.enabled && " A conversa já abriu no seu WhatsApp."}
        </p>
        <button onClick={() => { setDone(false); setDetails(""); setNote(""); }} className="btn btn-dark mt-8">Fazer outra encomenda</button>
      </main>
    );
  }

  return (
    <main className="light-section min-h-screen px-4 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-terra">
              <span className="h-px w-8 bg-terra" /> encomendas
            </p>
            <h1 className="font-display mt-4 text-5xl font-medium leading-[1.02] md:text-6xl">
              Mesa cheia,<br /><em className="text-terra">zero trabalho.</em>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-inksoft">
              Bolos confeitados, coffee breaks, cestas de café e mesas de festa. Conte o que você precisa —
              a casa responde com valor fechado e horário combinado.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                { icon: <ICalendar size={18} />, t: "Avise com 24h", d: "Bolos e cestas precisam de forno reservado." },
                { icon: <IClock size={18} />, t: "Resposta em 2h úteis", d: "Valor fechado, sem surpresa." },
                { icon: <ISpark size={18} />, t: "Retirada ou entrega", d: business.delivery.enabled ? `Entregamos em ${business.delivery.time}.` : "Retirada nas nossas unidades." },
              ].map((x) => (
                <li key={x.t} className="flex gap-3.5">
                  <span className="mt-0.5 text-terra">{x.icon}</span>
                  <span>
                    <p className="text-[14px] font-extrabold">{x.t}</p>
                    <p className="text-[12.5px] text-inksoft">{x.d}</p>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-9 rounded-[var(--radius)] border border-ink/10 bg-flour p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-terra">Referência de valores</p>
              <ul className="mt-2.5 space-y-1.5 text-[13.5px] text-inksoft">
                <li className="flex justify-between"><span>Bolo confeitado (12 fatias)</span><span className="font-bold text-ink">a partir de {formatBRL(104)}</span></li>
                <li className="flex justify-between"><span>Coffee break / pessoa</span><span className="font-bold text-ink">a partir de {formatBRL(32)}</span></li>
                <li className="flex justify-between"><span>Cesta de café (2 pessoas)</span><span className="font-bold text-ink">{formatBRL(89)}</span></li>
                <li className="flex justify-between"><span>Salgados (cento)</span><span className="font-bold text-ink">a partir de {formatBRL(96)}</span></li>
              </ul>
              <p className="mt-2.5 text-[11px] text-inksoft">Valores do template — ajuste na configuração antes de publicar.</p>
            </div>
          </div>

          <div className="rounded-[calc(var(--radius)*1.2)] border border-ink/10 bg-flour p-6 shadow-[0_30px_60px_-34px_rgba(60,35,15,0.5)] md:p-8">
            <h2 className="font-display text-2xl font-semibold">Solicitar encomenda</h2>

            <p className="mt-5 text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">O que vamos preparar?</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ORDER_TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} className={`chip !border-ink/15 ${type === t.id ? "!border-terra !bg-terra !text-flour" : "!text-inksoft hover:!border-terra"}`}>{t.label}</button>
              ))}
            </div>

            <div className="mt-5">
              <textarea
                value={details}
                onChange={(e) => { setDetails(e.target.value); setErrors((x) => ({ ...x, details: "" })); }}
                rows={3}
                placeholder="Descreva: sabor, tema, número de convidados, restrições alimentares…"
                className={`field field-light resize-none ${errors.details ? "!border-terra" : ""}`}
                aria-label="Detalhes da encomenda"
              />
              {errors.details && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.details}</p>}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
              <div>
                <label className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft" htmlFor="enc-qty">Quantidade</label>
                <input id="enc-qty" value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" className="field field-light mt-1.5" />
              </div>
              <div>
                <label className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">Data & horário</label>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {days.map((d, i) => (
                    <button key={d.label} onClick={() => { setDayIdx(i); setSlot(""); }} className={`chip !border-ink/15 ${dayIdx === i ? "!border-ink !bg-ink !text-flour" : "!text-inksoft"}`}>{d.label}</button>
                  ))}
                  <select value={slot} onChange={(e) => { setSlot(e.target.value); setErrors((x) => ({ ...x, slot: "" })); }} className="field field-light !w-auto !py-2 text-[13.5px]" aria-label="Horário">
                    <option value="">horário…</option>
                    {(days[dayIdx]?.slots ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.slot && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.slot}</p>}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="relative">
                  <IUser size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" />
                  <input value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: "" })); }} placeholder="Seu nome" className={`field field-light !pl-10 ${errors.name ? "!border-terra" : ""}`} aria-label="Nome" />
                </div>
                {errors.name && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.name}</p>}
              </div>
              <div>
                <div className="relative">
                  <IWhatsApp size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" />
                  <input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: "" })); }} placeholder="WhatsApp com DDD" inputMode="tel" className={`field field-light !pl-10 ${errors.phone ? "!border-terra" : ""}`} aria-label="WhatsApp" />
                </div>
                {errors.phone && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.phone}</p>}
              </div>
            </div>

            <div className="relative mt-4">
              <INote size={17} className="absolute left-3.5 top-3.5 text-inksoft" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Observações (entrega, surpresa, vela…)" className="field field-light resize-none !pl-10" aria-label="Observações" />
            </div>

            <button onClick={submit} className="btn btn-primary mt-6 w-full !py-4 text-[15px]">
              {business.cta.order}
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-inksoft">Sem compromisso — o valor fecha na conversa.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
