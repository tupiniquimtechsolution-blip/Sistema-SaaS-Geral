import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { business } from "../config/business";
import type { Order } from "../lib/core";
import { brl, buildOrderWhatsApp, Reveal, track, usePageMeta, useStore, whatsLink } from "../lib/core";
import { Btn, EmptyState, ProductArt, Stepper, inputCls, labelCls } from "../components/ui";
import { BackLink } from "../components/chrome";
import { IBag, ICheck, IChevron, IPix, ICard, IStore, ITruck, IWhatsApp, IArrow, IShield, ITag } from "../components/icons";

/* =============== CARRINHO =============== */
export function CartPage() {
  usePageMeta(`Carrinho | ${business.name}`);
  const { totals, setQty, removeLine, coupon, applyCoupon, removeCoupon, customer, saveCustomer, toast } = useStore();
  const [code, setCode] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [cep, setCep] = useState(customer.cep);
  const [address, setAddress] = useState(customer.address);
  const [complement, setComplement] = useState(customer.complement);
  const [reference, setReference] = useState(customer.reference);
  const [pickupId, setPickupId] = useState(business.locations[0].id);
  const navigate = useNavigate();

  if (totals.lines.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-28 md:pt-36">
        <EmptyState
          icon={<IBag size={28} />}
          title="Seu carrinho está vazio"
          desc="Que tal começar pelos mais vendidos? Seu pet vai agradecer com lambidas."
          action={<Btn to="/produtos">Ver produtos</Btn>}
        />
      </main>
    );
  }

  const saveAddr = () => {
    saveCustomer({ cep, address, complement, reference });
    if (fulfillment === "delivery" && (cep.replace(/\D/g, "").length !== 8 || !address.trim())) {
      toast({ title: "Complete o endereço", desc: "CEP e rua são necessários para a entrega." });
      return false;
    }
    return true;
  };

  const waMsg = buildOrderWhatsApp(
    totals.lines.map((l) => ({ name: l.product.name, variation: l.variation, qty: l.line.qty, total: l.total })),
    totals.total,
    fulfillment === "pickup" ? "Retirada na loja" : `Entrega: ${address || "endereço a informar"}${complement ? `, ${complement}` : ""}`,
    customer.name, ""
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <BackLink to="/produtos" label="Continuar comprando" />
      <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4vw,2.6rem)] text-ink mt-3">
        Seu carrinho <span className="font-accent italic font-normal text-brand-deep">({totals.count} {totals.count === 1 ? "item" : "itens"})</span>
      </h1>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="grid gap-3.5">
          {totals.lines.map(({ line, product, variation, unit, total }) => (
            <Reveal key={`${line.productId}-${line.variationId ?? "b"}`} className="bg-white border border-line rounded-[20px] rounded-bl-[6px] p-4 flex gap-4 items-center">
              <Link to={`/produtos/${product.slug}`} className="w-20 h-20 shrink-0 rounded-[14px] bg-sand/70 grid place-items-center hover:scale-105 transition-transform">
                <ProductArt kind={product.art} className="w-16" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/produtos/${product.slug}`} className="font-display font-bold text-ink text-[15px] hover:text-brand-deep transition-colors leading-snug block truncate">{product.name}</Link>
                <p className="text-[12.5px] text-fog mt-0.5">{variation ? `Tamanho ${variation} · ` : ""}{brl(unit)} cada</p>
                {product.subscriptionEligible && (
                  <p className="text-[11.5px] text-leaf-deep font-display font-bold mt-1 flex items-center gap-1"><ITag size={11} /> Disponível para entrega recorrente</p>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-2.5">
                <span className="font-display font-extrabold text-ink">{brl(total)}</span>
                <Stepper small value={line.qty} onChange={(v) => setQty(line.productId, line.variationId, v)} />
                <button type="button" onClick={() => removeLine(line.productId, line.variationId)} className="text-[12px] font-display font-bold text-coral hover:underline">Remover</button>
              </div>
            </Reveal>
          ))}

          {/* cupom */}
          <Reveal className="bg-white border border-line rounded-[20px] rounded-bl-[6px] p-4">
            {coupon ? (
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-leaf-deep text-sm flex items-center gap-2"><ICheck size={16} /> Cupom {coupon.code} aplicado — {coupon.label}</p>
                <button type="button" onClick={removeCoupon} className="text-[12px] font-display font-bold text-coral hover:underline">Remover</button>
              </div>
            ) : (
              <div>
                <label htmlFor="coupon" className={labelCls}>Cupom de desconto</label>
                <div className="flex gap-2">
                  <input id="coupon" className={inputCls + " uppercase"} placeholder="Ex.: BEMVINDO10" value={code} onChange={(e) => setCode(e.target.value)} />
                  <Btn
                    variant="bark" size="sm" className="shrink-0"
                    onClick={() => {
                      if (!code.trim()) return;
                      if (applyCoupon(code)) { toast({ title: "Cupom aplicado!", desc: business.coupons.find((c) => c.code === code.trim().toUpperCase())?.label }); setCode(""); }
                      else toast({ title: "Cupom inválido", desc: "Confira o código e tente de novo." });
                    }}
                  >
                    Aplicar
                  </Btn>
                </div>
                <p className="mt-2 text-[11.5px] text-fog">Dica de boas-vindas: experimente <button type="button" className="font-display font-bold text-brand-deep" onClick={() => setCode("BEMVINDO10")}>BEMVINDO10</button>.</p>
              </div>
            )}
          </Reveal>

          {/* entrega / retirada */}
          <Reveal className="bg-white border border-line rounded-[20px] rounded-bl-[6px] p-5">
            <p className={labelCls}>Como você quer receber?</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" aria-pressed={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")} className={`p-4 rounded-[16px] rounded-bl-[5px] border-2 text-left transition-all ${fulfillment === "delivery" ? "border-brand bg-brand/8" : "border-line hover:border-bark/35"}`}>
                <ITruck size={20} className={fulfillment === "delivery" ? "text-brand" : "text-fog"} />
                <p className="font-display font-bold text-ink text-sm mt-2">Delivery</p>
                <p className="text-[12px] text-fog">{totals.subtotal - totals.discount >= business.delivery.freeAbove ? "Grátis para este pedido" : `${brl(business.delivery.fee)} · mesmo dia`}</p>
              </button>
              <button type="button" aria-pressed={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")} className={`p-4 rounded-[16px] rounded-bl-[5px] border-2 text-left transition-all ${fulfillment === "pickup" ? "border-brand bg-brand/8" : "border-line hover:border-bark/35"}`}>
                <IStore size={20} className={fulfillment === "pickup" ? "text-brand" : "text-fog"} />
                <p className="font-display font-bold text-ink text-sm mt-2">Retirar na loja</p>
                <p className="text-[12px] text-fog">Grátis · pronto em ~2h</p>
              </button>
            </div>

            {fulfillment === "delivery" ? (
              <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="cep" className={labelCls}>CEP *</label>
                  <input id="cep" inputMode="numeric" className={inputCls} value={cep} onChange={(e) => setCep(e.target.value)} placeholder="05435-000" />
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="addr" className={labelCls}>Endereço *</label>
                  <input id="addr" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número" />
                </div>
                <div>
                  <label htmlFor="comp" className={labelCls}>Complemento</label>
                  <input id="comp" className={inputCls} value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco…" />
                </div>
                <div>
                  <label htmlFor="ref" className={labelCls}>Referência</label>
                  <input id="ref" className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Portão verde…" />
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-2.5">
                {business.locations.filter((l) => l.pickup).map((l) => (
                  <label key={l.id} className={`flex items-center gap-3 p-4 rounded-[16px] rounded-bl-[5px] border-2 cursor-pointer transition-all ${pickupId === l.id ? "border-brand bg-brand/8" : "border-line hover:border-bark/35"}`}>
                    <input type="radio" name="pickup" className="sr-only" checked={pickupId === l.id} onChange={() => setPickupId(l.id)} />
                    <IStore size={19} className="text-brand shrink-0" />
                    <div>
                      <p className="font-display font-bold text-ink text-sm">{l.name}</p>
                      <p className="text-[12.5px] text-fog">{l.address} · {l.district}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* resumo */}
        <aside className="lg:sticky lg:top-24 bg-bark text-cream rounded-[24px] rounded-bl-[6px] p-6">
          <h2 className="font-display font-extrabold text-lg">Resumo</h2>
          <div className="mt-4 grid gap-2.5 text-[14.5px]">
            <div className="flex justify-between text-cream/75"><span>Subtotal</span><span className="font-display font-bold text-cream">{brl(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-mint"><span>Desconto</span><span className="font-display font-bold">−{brl(totals.discount)}</span></div>}
            <div className="flex justify-between text-cream/75">
              <span>{fulfillment === "pickup" ? "Retirada" : "Entrega"}</span>
              <span className="font-display font-bold text-cream">{fulfillment === "pickup" || totals.shipping === 0 ? "Grátis" : brl(totals.shipping)}</span>
            </div>
            {fulfillment === "delivery" && totals.shipping > 0 && (
              <p className="text-[12px] text-cream/60">Faltam {brl(business.delivery.freeAbove - (totals.subtotal - totals.discount))} para frete grátis.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-cream/15 flex justify-between items-baseline">
            <span className="font-display font-bold">Total</span>
            <span className="font-display font-extrabold text-[26px]">{brl(totals.total)}</span>
          </div>
          <Btn
            className="w-full mt-5" size="lg"
            onClick={() => {
              if (!saveAddr()) return;
              track("begin_checkout", { total: totals.total, fulfillment });
              navigate(`/checkout?fulfillment=${fulfillment}${fulfillment === "pickup" ? `&loc=${pickupId}` : ""}`);
            }}
          >
            Continuar para pagamento <IChevron size={16} />
          </Btn>
          <a
            href={whatsLink(business.locations[0].whatsapp, waMsg)} target="_blank" rel="noreferrer"
            onClick={() => track("click_whatsapp", { from: "cart" })}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-2 font-display font-semibold text-sm px-6 py-3 rounded-full text-mint border-[1.5px] border-cream/25 hover:bg-cream/10 transition-colors"
          >
            <IWhatsApp size={16} /> Finalizar pelo WhatsApp
          </a>
          <p className="mt-4 text-[11.5px] text-cream/60 flex items-center gap-1.5 justify-center"><IShield size={13} /> Checkout como visitante — sem cadastro obrigatório.</p>
        </aside>
      </div>
    </main>
  );
}

/* =============== CHECKOUT =============== */
export function CheckoutPage() {
  usePageMeta(`Checkout | ${business.name}`);
  const { totals, customer, saveCustomer, placeOrder, clearCart } = useStore();
  const [params] = [new URLSearchParams(window.location.hash.split("?")[1] ?? "")];
  const fulfillment = (params.get("fulfillment") === "pickup" ? "pickup" : "delivery") as Order["fulfillment"];
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [payment, setPayment] = useState<Order["payment"]>("pix");
  const [err, setErr] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const finalTotal = fulfillment === "pickup" ? totals.total - totals.shipping : totals.total;

  if (placed) {
    const loc = business.locations[0];
    return (
      <main className="max-w-2xl mx-auto px-4 pt-28 md:pt-36 pb-12 text-center">
        <span className="mx-auto w-24 h-24 grid place-items-center rounded-full bg-leaf text-white shadow-[0_20px_50px_-15px_rgba(86,140,118,0.7)]">
          <ICheck size={42} className="check-pop" />
        </span>
        <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4vw,2.8rem)] text-ink mt-7">
          Pedido recebido! <span className="font-accent italic font-normal text-brand-deep">Já estamos separando.</span>
        </h1>
        <p className="mt-4 text-fog text-[15.5px]">
          Protocolo <strong className="font-display text-ink">{placed.id}</strong> · {placed.fulfillment === "pickup" ? "retirada na loja" : "entrega no mesmo dia"} · {brl(placed.total)}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] font-display font-bold flex-wrap">
          {(["novo", "confirmado", "separando"] as const).map((s, i) => (
            <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${i === 0 ? "bg-brand text-white" : "bg-sand text-bark"}`}>
              {i === 0 && <ICheck size={12} />} {s}
            </span>
          ))}
          <IArrow size={13} className="text-fog" />
          <span className="text-fog">pronto → entregue</span>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsLink(loc.whatsapp, `Olá! Acabei de fazer o pedido ${placed.id} pelo site (total ${brl(placed.total)}). Podem confirmar?`)}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 font-display font-bold text-[14.5px] px-7 py-3.5 rounded-full bg-leaf text-white hover:bg-leaf-deep transition-colors"
          >
            <IWhatsApp size={18} /> Acompanhar pelo WhatsApp
          </a>
          <Btn to="/meus-pedidos" variant="outline">Meus pedidos</Btn>
        </div>
      </main>
    );
  }

  if (totals.lines.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-32">
        <EmptyState icon={<IBag size={28} />} title="Carrinho vazio" desc="Adicione produtos antes de finalizar a compra." action={<Btn to="/produtos">Ver produtos</Btn>} />
      </main>
    );
  }

  const submit = () => {
    if (name.trim().length < 2) { setErr("Informe seu nome para continuar."); return; }
    if (phone.replace(/\D/g, "").length < 10) { setErr("Informe um WhatsApp/telefone válido (DDD + número)."); return; }
    saveCustomer({ name: name.trim(), phone: phone.trim() });
    const order = placeOrder({
      lines: totals.lines.map((l) => ({ ...l.line })),
      subtotal: totals.subtotal, discount: totals.discount, shipping: fulfillment === "pickup" ? 0 : totals.shipping,
      total: totals.total - (fulfillment === "pickup" ? totals.shipping : 0),
      coupon: undefined, fulfillment, address: customer.address ? `${customer.address}${customer.complement ? `, ${customer.complement}` : ""}` : undefined,
      locationId: business.locations[0].id, customer: { name: name.trim(), phone: phone.trim() }, payment,
    });
    clearCart();
    setPlaced(order);
    window.scrollTo({ top: 0 });
  };

  const payOptions: { id: Order["payment"]; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "pix", label: "Pix", desc: "Aprovação imediata · 5% de desconto na loja", icon: <IPix size={20} /> },
    { id: "cartao", label: "Cartão", desc: "Crédito em até 3x · processado por gateway seguro", icon: <ICard size={20} /> },
    { id: "loja", label: "Na retirada / entrega", desc: "Pague na hora, como preferir", icon: <IStore size={20} /> },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <BackLink to="/carrinho" label="Voltar ao carrinho" />
      <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4vw,2.6rem)] text-ink mt-3">Quase lá.</h1>
      <p className="text-fog mt-1 text-[15px]">{fulfillment === "pickup" ? "Retirada na loja" : "Entrega"} · {totals.count} itens · <strong className="text-ink">{brl(finalTotal)}</strong></p>

      <div className="mt-8 grid md:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="grid gap-6">
          <Reveal className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
            <h2 className="font-display font-bold text-ink flex items-center gap-2.5"><span className="w-7 h-7 grid place-items-center rounded-full bg-brand text-white text-[13px]">1</span> Seus dados</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="co-name" className={labelCls}>Nome *</label>
                <input id="co-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" />
              </div>
              <div>
                <label htmlFor="co-phone" className={labelCls}>WhatsApp *</label>
                <input id="co-phone" inputMode="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
              </div>
            </div>
            <p className="mt-3 text-[12px] text-fog">Sem criação de conta obrigatória — usamos só para avisar sobre o pedido. Seus dados seguem a LGPD.</p>
          </Reveal>

          <Reveal className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
            <h2 className="font-display font-bold text-ink flex items-center gap-2.5"><span className="w-7 h-7 grid place-items-center rounded-full bg-brand text-white text-[13px]">2</span> Pagamento</h2>
            <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Forma de pagamento">
              {payOptions.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={payment === o.id} onClick={() => setPayment(o.id)} className={`flex items-center gap-4 p-4 rounded-[16px] rounded-bl-[5px] border-2 text-left transition-all ${payment === o.id ? "border-brand bg-brand/8" : "border-line hover:border-bark/35"}`}>
                  <span className={`w-11 h-11 grid place-items-center rounded-full shrink-0 ${payment === o.id ? "bg-brand text-white" : "bg-sand text-bark"}`}>{o.icon}</span>
                  <div>
                    <p className="font-display font-bold text-ink text-[15px]">{o.label}</p>
                    <p className="text-[12.5px] text-fog">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {payment === "pix" && (
              <p className="mt-4 bg-mint/40 border border-leaf/25 rounded-[14px] px-4 py-3 text-[13px] text-leaf-deep">
                O código Pix será gerado na confirmação e enviado no seu WhatsApp. Não armazenamos dados de pagamento.
              </p>
            )}
            {err && <p className="mt-4 text-[13.5px] font-display font-bold text-coral bg-coral/10 rounded-[12px] px-4 py-2.5" role="alert">{err}</p>}
          </Reveal>
        </div>

        <aside className="bg-bark text-cream rounded-[24px] rounded-bl-[6px] p-6 md:sticky md:top-24">
          <h2 className="font-display font-extrabold text-lg">Seu pedido</h2>
          <div className="mt-4 grid gap-2 max-h-56 overflow-y-auto no-bar pr-1">
            {totals.lines.map((l) => (
              <div key={`${l.line.productId}-${l.line.variationId ?? "b"}`} className="flex justify-between gap-3 text-[13.5px]">
                <span className="text-cream/75">{l.line.qty}x {l.product.name}{l.variation ? ` (${l.variation})` : ""}</span>
                <span className="font-display font-bold shrink-0">{brl(l.total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-cream/15 grid gap-1.5 text-[14px]">
            {totals.discount > 0 && <div className="flex justify-between text-mint"><span>Desconto</span><span className="font-display font-bold">−{brl(totals.discount)}</span></div>}
            <div className="flex justify-between text-cream/75"><span>{fulfillment === "pickup" ? "Retirada" : "Entrega"}</span><span className="font-display font-bold text-cream">{fulfillment === "pickup" || totals.shipping === 0 ? "Grátis" : brl(totals.shipping)}</span></div>
            <div className="flex justify-between items-baseline mt-2"><span className="font-display font-bold">Total</span><span className="font-display font-extrabold text-2xl">{brl(finalTotal)}</span></div>
          </div>
          <Btn className="w-full mt-5" size="lg" onClick={submit}><ICheck size={18} /> Confirmar pedido</Btn>
          <p className="mt-3 text-[11.5px] text-cream/60 text-center flex items-center gap-1.5 justify-center"><IShield size={13} /> Ambiente seguro · dados criptografados</p>
        </aside>
      </div>
    </main>
  );
}
