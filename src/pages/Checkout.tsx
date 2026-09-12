import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Order } from "../business/types";
import { useApp, useCartTotals } from "../core/store";
import { buildScheduleOptions, buildCartWhatsAppMessage, formatBRL, isOpenNow, track, useSEO, waLink } from "../core/utils";
import { IBag, IBike, ICard, ICash, ICheck, IChevron, IPix, IWhatsApp } from "../components/icons";

const STEPS = ["Entrega", "Dados", "Pagamento", "Confirmação"];

export default function Checkout() {
  const { business, cart, clearCart, subtotal, coupon, createOrder } = useApp();
  const { discount, fee, total } = useCartTotals();
  const navigate = useNavigate();
  useSEO(`Finalizar pedido | ${business.name}`);

  const [step, setStep] = useState(0);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">(business.delivery.enabled ? "delivery" : "pickup");
  const [schedMode, setSchedMode] = useState<"now" | "later">("now");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [data, setData] = useState({ name: "", phone: "", cep: "", street: "", number: "", complement: "", reference: "", unit: business.pickup.units[0]?.id ?? "", note: "" });
  const [payment, setPayment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const days = useMemo(() => buildScheduleOptions(business.openingHours), [business.openingHours]);
  const open = isOpenNow(business.openingHours);
  const deliveryFee = fulfillment === "delivery" ? (subtotal - discount >= business.delivery.freeAbove ? 0 : fee) : 0;
  const grandTotal = subtotal - discount + deliveryFee;

  const scheduleLabel = schedMode === "now"
    ? `Para agora (${business.delivery.enabled && fulfillment === "delivery" ? business.delivery.time : "pronto em ~20 min"})`
    : `${days[dayIdx]?.label ?? ""} às ${slot}`;

  const set = (k: string, v: string) => { setData((d) => ({ ...d, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && schedMode === "later" && !slot) e.slot = "Escolha um horário.";
    if (s === 1) {
      if (data.name.trim().length < 2) e.name = "Informe seu nome.";
      if (data.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone com DDD.";
      if (fulfillment === "delivery") {
        if (data.cep.replace(/\D/g, "").length < 8) e.cep = "CEP incompleto.";
        if (!data.street.trim()) e.street = "Informe a rua.";
        if (!data.number.trim()) e.number = "Nº";
      }
    }
    if (s === 2 && !payment) e.payment = "Escolha uma forma de pagamento.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    track("checkout_step", { step: step + 1 });
    setStep((v) => v + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = () => {
    if (!validateStep(2)) return;
    const payLabel =
      payment === "pix" ? "Pix (na confirmação)" :
      payment === "card" ? "Cartão (link seguro)" :
      payment === "cash" ? "Dinheiro" :
      payment === "onpick" ? "Na retirada" : "Na entrega";
    const order = createOrder({
      items: cart,
      subtotal, discount,
      deliveryFee,
      total: grandTotal,
      fulfillment,
      schedule: scheduleLabel,
      payment: payLabel,
      customer: {
        name: data.name, phone: data.phone,
        address: fulfillment === "delivery"
          ? `${data.street}, ${data.number}${data.complement ? ` — ${data.complement}` : ""} · CEP ${data.cep}${data.reference ? ` · Ref: ${data.reference}` : ""}`
          : undefined,
        unit: fulfillment === "pickup" ? business.pickup.units.find((u) => u.id === data.unit)?.name : undefined,
        note: data.note || undefined,
      },
      coupon: coupon?.code,
    });
    clearCart();
    setConfirmed(order);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- vazio ---------- */
  if (cart.length === 0 && !confirmed) {
    return (
      <main className="light-section flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="font-display text-4xl">Seu carrinho está vazio.</p>
        <p className="mt-2 text-inksoft">Escolha algo que acabou de sair do forno.</p>
        <Link to="/produtos" className="btn btn-dark mt-7">Ver cardápio</Link>
      </main>
    );
  }

  /* ---------- confirmação ---------- */
  if (confirmed) {
    const pixPayload = `00020126360014BR.GOV.BCB.PIX01${String(business.payment.pix.key.length).padStart(2, "0")}${business.payment.pix.key}520400005303986540${confirmed.total.toFixed(2)}5802BR59${confirmed.customer.name.slice(0, 10).padEnd(10, " ")}6009SAO PAULO62110507${confirmed.code.replace("-", "")}6304F0RN`;
    const sendOrder = () => {
      const msg = buildCartWhatsAppMessage(business, confirmed.items, confirmed.total, confirmed.fulfillment, `Pedido ${confirmed.code} · ${confirmed.schedule}`);
      track("click_whatsapp", { from: "checkout_confirm" });
      window.open(waLink(business.integrations.whatsapp.number || business.contact.whatsapp, msg), "_blank");
    };
    return (
      <main className="light-section min-h-screen px-4 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="anim-rise mx-auto grid h-20 w-20 place-items-center rounded-full bg-terra text-flour shadow-[0_20px_44px_-16px_rgba(142,79,44,0.7)]">
            <ICheck size={36} />
          </span>
          <h1 className="font-display mt-6 text-4xl font-medium md:text-6xl">Pedido no forno.</h1>
          <p className="mt-3 text-[15.5px] text-inksoft">
            <strong className="text-ink">{confirmed.code}</strong> · {confirmed.schedule}. A casa confirma pelo WhatsApp em instantes.
          </p>

          <div className="anim-rise mt-9 rounded-[var(--radius)] border border-ink/10 bg-flour p-6 text-left" style={{ animationDelay: "120ms" }}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-terra">Resumo</p>
            <ul className="mt-3 space-y-1.5 text-[14px] text-ink">
              {confirmed.items.map((i) => (
                <li key={i.key} className="flex justify-between gap-4">
                  <span>{i.qty}x {i.name}</span>
                  <span className="font-bold">{formatBRL((i.unitBase + i.variations.reduce((s, v) => s + v.delta, 0) + i.extras.reduce((s, e) => s + e.price, 0)) * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-[15px] font-extrabold">
              <span>Total · {confirmed.payment}</span><span className="text-terra">{formatBRL(confirmed.total)}</span>
            </div>
          </div>

          {confirmed.payment.startsWith("Pix") && business.payment.pix.enabled && (
            <div className="anim-rise mt-6 rounded-[var(--radius)] border border-ink/10 bg-flour p-6" style={{ animationDelay: "200ms" }}>
              <p className="flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-terra"><IPix size={16} /> Pague com Pix</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=FBF6EA&color=241712&data=${encodeURIComponent(pixPayload)}`}
                alt={`QR Code Pix do pedido ${confirmed.code}`}
                className="mx-auto mt-4 h-44 w-44 rounded-lg ring-1 ring-ink/10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <p className="mt-3 break-all rounded-lg bg-ink/5 p-3 text-[11px] leading-relaxed text-inksoft">{pixPayload}</p>
              <button
                onClick={() => { navigator.clipboard?.writeText(pixPayload).then(() => { setPixCopied(true); window.setTimeout(() => setPixCopied(false), 2200); }).catch(() => {}); }}
                className="btn btn-dark mt-4 w-full !py-3 text-[13.5px]"
              >
                {pixCopied ? "Código copiado!" : "Copiar código Pix"}
              </button>
              <p className="mt-2.5 text-[11.5px] text-inksoft">Chave: {business.payment.pix.key} · o status chega pelo WhatsApp</p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {business.integrations.whatsapp.enabled && (
              <button onClick={sendOrder} className="btn btn-dark !px-7 !py-3.5 text-[14px]"><IWhatsApp size={18} /> Enviar pedido no WhatsApp</button>
            )}
            <Link to="/meus-pedidos" className="btn !border !border-ink/20 !text-ink hover:!bg-ink hover:!text-flour">Acompanhar pedido</Link>
          </div>
          <p className="mt-6 text-[12.5px] text-inksoft">Demo de template: o Pix acima é ilustrativo — conecte seu gateway (Mercado Pago, PagSeguro…) antes de publicar.</p>
        </div>
      </main>
    );
  }

  /* ---------- fluxo ---------- */
  return (
    <main className="light-section min-h-screen px-4 pb-28 pt-32 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-4xl font-medium md:text-5xl">Quase lá.</h1>

        {/* steps */}
        <ol className="mt-7 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-wider transition-all ${
                  i === step ? "bg-ink text-flour" : i < step ? "bg-terra/15 text-terra" : "bg-ink/6 text-inksoft/60"
                }`}
                disabled={i > step}
              >
                {i < step ? <ICheck size={13} /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-terra/50" : "bg-ink/10"}`} />}
            </li>
          ))}
        </ol>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {/* STEP 0 — entrega/retirada */}
            {step === 0 && (
              <div className="anim-fade space-y-6">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {business.delivery.enabled && (
                    <button onClick={() => setFulfillment("delivery")} aria-pressed={fulfillment === "delivery"} className={`rounded-[var(--radius)] border-2 p-5 text-left transition-all ${fulfillment === "delivery" ? "border-terra bg-terra/8" : "border-ink/12 hover:border-terra/50"}`}>
                      <IBike size={24} className="text-terra" />
                      <p className="mt-2.5 text-[16px] font-extrabold">Entrega</p>
                      <p className="mt-1 text-[13px] text-inksoft">{business.delivery.time} · {formatBRL(business.delivery.fee)} — grátis acima de {formatBRL(business.delivery.freeAbove)}</p>
                    </button>
                  )}
                  {business.pickup.enabled && (
                    <button onClick={() => setFulfillment("pickup")} aria-pressed={fulfillment === "pickup"} className={`rounded-[var(--radius)] border-2 p-5 text-left transition-all ${fulfillment === "pickup" ? "border-terra bg-terra/8" : "border-ink/12 hover:border-terra/50"}`}>
                      <IBag size={24} className="text-terra" />
                      <p className="mt-2.5 text-[16px] font-extrabold">Retirada</p>
                      <p className="mt-1 text-[13px] text-inksoft">Sem frete · sai quentinho do forno</p>
                    </button>
                  )}
                </div>

                {fulfillment === "pickup" && (
                  <div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">Unidade</p>
                    <div className="mt-2.5 grid gap-2.5">
                      {business.pickup.units.map((u) => (
                        <button key={u.id} onClick={() => set("unit", u.id)} className={`rounded-[var(--radius)] border-2 px-4.5 px-5 py-3.5 text-left transition-all ${data.unit === u.id ? "border-terra bg-terra/8" : "border-ink/12 hover:border-terra/50"}`}>
                          <p className="text-[14.5px] font-extrabold">{u.name}</p>
                          <p className="text-[12.5px] text-inksoft">{u.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {business.features.scheduledOrders && (
                  <div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">Quando?</p>
                    <div className="mt-2.5 flex gap-2.5">
                      <button onClick={() => setSchedMode("now")} className={`chip ${schedMode === "now" ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft"}`}>Para agora</button>
                      <button onClick={() => setSchedMode("later")} className={`chip ${schedMode === "later" ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft"}`}>Agendar</button>
                    </div>
                    {schedMode === "later" && (
                      <div className="anim-fade mt-3.5 rounded-[var(--radius)] border border-ink/12 bg-flour p-4">
                        <div className="flex gap-2">
                          {days.map((d, i) => (
                            <button key={d.label} onClick={() => { setDayIdx(i); setSlot(""); }} className={`chip ${dayIdx === i ? "on !border-terra !bg-terra !text-flour" : "!border-ink/15 !text-inksoft"}`}>{d.label}</button>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {(days[dayIdx]?.slots ?? []).map((s) => (
                            <button key={s} onClick={() => { setSlot(s); setErrors((e) => ({ ...e, slot: "" })); }} className={`rounded-lg border py-2 text-[13px] font-bold transition-all ${slot === s ? "border-terra bg-terra text-flour" : "border-ink/12 text-inksoft hover:border-terra/60"}`}>{s}</button>
                          ))}
                        </div>
                        {errors.slot && <p className="mt-2.5 text-[12.5px] font-bold text-terra">{errors.slot}</p>}
                        {!open.open && <p className="mt-2.5 text-[12.5px] font-semibold text-inksoft">{open.label} — agende para o próximo horário aberto.</p>}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={next} className="btn btn-dark w-full !py-4 sm:w-auto sm:!px-10">Continuar <IChevron size={17} /></button>
              </div>
            )}

            {/* STEP 1 — dados */}
            {step === 1 && (
              <div className="anim-fade space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <input value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Seu nome" className="field field-light" aria-label="Nome" />
                    {errors.name && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.name}</p>}
                  </div>
                  <div>
                    <input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="WhatsApp com DDD" inputMode="tel" className="field field-light" aria-label="Telefone" />
                    {errors.phone && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.phone}</p>}
                  </div>
                </div>

                {fulfillment === "delivery" ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                      <div>
                        <input value={data.cep} onChange={(e) => set("cep", e.target.value)} placeholder="CEP" inputMode="numeric" className="field field-light" aria-label="CEP" />
                        {errors.cep && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.cep}</p>}
                      </div>
                      <div>
                        <input value={data.street} onChange={(e) => set("street", e.target.value)} placeholder="Rua / avenida" className="field field-light" aria-label="Rua" />
                        {errors.street && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.street}</p>}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <input value={data.number} onChange={(e) => set("number", e.target.value)} placeholder="Número" className="field field-light" aria-label="Número" />
                        {errors.number && <p className="mt-1.5 text-[12.5px] font-bold text-terra">{errors.number}</p>}
                      </div>
                      <input value={data.complement} onChange={(e) => set("complement", e.target.value)} placeholder="Complemento" className="field field-light" aria-label="Complemento" />
                      <input value={data.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Referência" className="field field-light" aria-label="Referência" />
                    </div>
                  </>
                ) : (
                  <p className="rounded-[var(--radius)] border border-ink/10 bg-flour px-4 py-3.5 text-[13.5px] text-inksoft">
                    Retirada em <strong className="text-ink">{business.pickup.units.find((u) => u.id === data.unit)?.name}</strong> — {business.pickup.units.find((u) => u.id === data.unit)?.address}
                  </p>
                )}

                <textarea value={data.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Observações do pedido (campainha, troco…)" className="field field-light resize-none" aria-label="Observações" />

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn !border !border-ink/20 !text-ink">Voltar</button>
                  <button onClick={next} className="btn btn-dark flex-1 !py-4 sm:flex-none sm:!px-10">Continuar <IChevron size={17} /></button>
                </div>
              </div>
            )}

            {/* STEP 2 — pagamento */}
            {step === 2 && (
              <div className="anim-fade space-y-3">
                {business.payment.pix.enabled && (
                  <PayOption on={payment === "pix"} onClick={() => setPayment("pix")} icon={<IPix size={21} />} title="Pix" desc="QR Code na confirmação · aprovação imediata" />
                )}
                {business.payment.card && (
                  <PayOption on={payment === "card"} onClick={() => setPayment("card")} icon={<ICard size={21} />} title="Cartão de crédito" desc="Link de pagamento seguro do gateway" />
                )}
                {fulfillment === "delivery" && business.payment.onDelivery && business.payment.cash && (
                  <PayOption on={payment === "cash"} onClick={() => setPayment("cash")} icon={<ICash size={21} />} title="Dinheiro na entrega" desc="Leve o troco certo, se puder :)" />
                )}
                {fulfillment === "pickup" && business.payment.onPickup && (
                  <PayOption on={payment === "onpick"} onClick={() => setPayment("onpick")} icon={<ICash size={21} />} title="Pagar na retirada" desc="Pix, cartão ou dinheiro no balcão" />
                )}
                {errors.payment && <p className="text-[12.5px] font-bold text-terra">{errors.payment}</p>}
                <p className="text-[12px] leading-relaxed text-inksoft">Nenhum dado de cartão é armazenado neste site — o processamento acontece no gateway.</p>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn !border !border-ink/20 !text-ink">Voltar</button>
                  <button onClick={finish} className="btn btn-primary flex-1 !py-4 text-[15px] sm:flex-none sm:!px-10">
                    {business.cta.checkout} · {formatBRL(grandTotal)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* resumo */}
          <aside className="h-fit rounded-[var(--radius)] border border-ink/10 bg-flour p-5 lg:sticky lg:top-32">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-terra">Seu pedido</p>
            <ul className="mt-3.5 max-h-56 space-y-2.5 overflow-y-auto pr-1">
              {cart.map((i) => (
                <li key={i.key} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{i.qty}x {i.name}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-3.5 text-[13.5px]">
              <div className="flex justify-between text-inksoft"><dt>Subtotal</dt><dd className="font-bold text-ink">{formatBRL(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-terra"><dt>Desconto ({coupon?.code})</dt><dd className="font-bold">−{formatBRL(discount)}</dd></div>}
              <div className="flex justify-between text-inksoft">
                <dt>{fulfillment === "delivery" ? "Entrega" : "Retirada"}</dt>
                <dd className="font-bold text-ink">{fulfillment === "pickup" ? "grátis" : deliveryFee === 0 ? "grátis" : formatBRL(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2.5 text-[16.5px] font-extrabold"><dt>Total</dt><dd className="text-terra">{formatBRL(grandTotal)}</dd></div>
            </dl>
            <p className="mt-3.5 flex items-center gap-2 rounded-lg bg-ink/5 px-3 py-2.5 text-[12px] font-semibold text-inksoft">
              <span className={`h-2 w-2 shrink-0 rounded-full ${open.open ? "bg-emerald-500" : "bg-terra"}`} /> {scheduleLabel}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PayOption({ on, onClick, icon, title, desc }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`flex w-full items-center gap-4 rounded-[var(--radius)] border-2 px-5 py-4 text-left transition-all ${on ? "border-terra bg-terra/8" : "border-ink/12 hover:border-terra/50"}`}>
      <span className={`grid h-11 w-11 place-items-center rounded-full ${on ? "bg-terra text-flour" : "bg-ink/6 text-inksoft"}`}>{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-extrabold">{title}</span>
        <span className="block text-[12.5px] text-inksoft">{desc}</span>
      </span>
      <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? "border-terra bg-terra" : "border-ink/25"}`}>
        {on && <ICheck size={11} className="text-flour" />}
      </span>
    </button>
  );
}
