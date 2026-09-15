import { Link } from "react-router-dom";
import { business } from "../config/business";
import { brl, formatDateBR, Reveal, usePageMeta, useStore } from "../lib/core";
import { Btn, EmptyState } from "../components/ui";
import { IBag, IBath, ICalendar, ICheck, IGift, IPaw, IRefresh, IStar, ITruck, IX } from "../components/icons";

const ORDER_STEPS: { id: string; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "confirmado", label: "Confirmado" },
  { id: "separando", label: "Separando" },
  { id: "pronto", label: "Pronto" },
  { id: "entrega", label: "A caminho" },
  { id: "entregue", label: "Entregue" },
];

/* =============== MEUS PEDIDOS =============== */
export function OrdersPage() {
  usePageMeta(`Meus pedidos | ${business.name}`);
  const { orders, bookings, reorder, cancelBooking, toast } = useStore();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Sua conta de visitante</p>
      <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4.2vw,2.8rem)] text-ink mt-2">
        Pedidos & <span className="font-accent italic font-normal text-brand-deep">agendamentos</span>
      </h1>

      {/* pedidos */}
      <section className="mt-10">
        <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2.5"><IBag size={20} className="text-brand" /> Compras</h2>
        {orders.length === 0 ? (
          <div className="mt-4 bg-white border border-line rounded-[22px] rounded-bl-[6px]">
            <EmptyState icon={<IBag size={26} />} title="Nenhuma compra ainda" desc="Quando você fizer um pedido, ele aparece aqui com o status em tempo real." action={<Btn to="/produtos">Começar a comprar</Btn>} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {orders.map((o) => {
              const stepIdx = Math.max(0, ORDER_STEPS.findIndex((s) => s.id === o.status));
              return (
                <Reveal key={o.id} className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-extrabold text-ink text-lg">{o.id}</p>
                      <p className="text-[12.5px] text-fog">
                        {new Date(o.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} ·{" "}
                        {o.fulfillment === "pickup" ? "retirada na loja" : "delivery"} ·{" "}
                        {o.payment === "pix" ? "Pix" : o.payment === "cartao" ? "cartão" : "pagamento na loja"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-ink text-xl">{brl(o.total)}</span>
                      <button
                        type="button" onClick={() => reorder(o.id)}
                        className="inline-flex items-center gap-1.5 bg-bark text-cream font-display font-bold text-[12.5px] px-4 py-2.5 rounded-full hover:bg-brand transition-colors"
                      >
                        <IRefresh size={14} /> Comprar novamente
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-1" role="img" aria-label={`Status do pedido: ${ORDER_STEPS[stepIdx].label}`}>
                    {ORDER_STEPS.map((s, i) => (
                      <div key={s.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <span className={`w-6 h-6 grid place-items-center rounded-full text-white text-[10px] ${i <= stepIdx ? "bg-leaf" : "bg-line"}`}>
                            {i < stepIdx ? <ICheck size={11} /> : i === stepIdx ? <span className="w-2 h-2 rounded-full bg-white animate-pulse motion-reduce:animate-none" /> : null}
                          </span>
                          <span className={`mt-1.5 text-[9.5px] font-display font-bold uppercase tracking-wide ${i <= stepIdx ? "text-leaf-deep" : "text-fog/60"}`}>{s.label}</span>
                        </div>
                        {i < ORDER_STEPS.length - 1 && <span className={`h-[2.5px] flex-1 mx-1 -mt-5 rounded-full ${i < stepIdx ? "bg-leaf" : "bg-line"}`} aria-hidden />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-line flex flex-wrap gap-x-6 gap-y-1.5">
                    {o.lines.map((l) => {
                      const p = business.products.find((x) => x.id === l.productId);
                      return <span key={`${l.productId}-${l.variationId ?? "b"}`} className="text-[13px] text-fog">{l.qty}x {p?.name ?? "Item"}</span>;
                    })}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* agendamentos */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2.5"><ICalendar size={20} className="text-brand" /> Agendamentos</h2>
        {bookings.length === 0 ? (
          <div className="mt-4 bg-white border border-line rounded-[22px] rounded-bl-[6px]">
            <EmptyState icon={<IBath size={26} />} title="Nenhum banho marcado" desc="Agende o próximo dia de spa do seu pet em menos de 2 minutos." action={<Btn to="/agendamento"><ICalendar size={16} /> Agendar agora</Btn>} />
          </div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <Reveal key={b.id} className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-ink text-[16px] flex items-center gap-2"><IPaw size={16} className="text-brand" /> {b.petName}</p>
                    <p className="text-[13.5px] text-fog mt-0.5">{b.serviceName} · porte {b.size}</p>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    b.status === "requested" ? "bg-sand text-bark" :
                    b.status === "confirmed" ? "bg-mint text-leaf-deep" :
                    b.status === "completed" ? "bg-leaf text-white" :
                    b.status === "cancelled" ? "bg-coral/15 text-coral" : "bg-sea/20 text-sea"
                  }`}>
                    {b.status === "requested" ? "Aguardando loja" : b.status === "confirmed" ? "Confirmado" : b.status === "completed" ? "Concluído" : b.status === "cancelled" ? "Cancelado" : "Em andamento"}
                  </span>
                </div>
                <div className="mt-4 bg-sand/50 rounded-[14px] px-4 py-3 text-[14px] text-bark font-display font-semibold capitalize">
                  {formatDateBR(b.date)} · {b.time} · {brl(b.price)}
                </div>
                <p className="mt-2 text-[12px] text-fog">Profissional: {b.professional} · protocolo {b.id}</p>
                {(b.status === "requested" || b.status === "confirmed") && (
                  <div className="mt-4 flex gap-2.5">
                    <Link to={`/agendamento?pet=${b.petId}&service=${business.services.find((s) => s.id === b.serviceId)?.slug ?? ""}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-bark text-cream font-display font-bold text-[12.5px] py-2.5 rounded-full hover:bg-brand transition-colors">
                      <IRefresh size={13} /> Reagendar
                    </Link>
                    <button
                      type="button"
                      onClick={() => { cancelBooking(b.id); toast({ title: "Agendamento cancelado", desc: `${b.petName} · ${formatDateBR(b.date)}` }); }}
                      className="inline-flex items-center gap-1.5 border-[1.5px] border-coral/40 text-coral font-display font-bold text-[12.5px] px-4 py-2.5 rounded-full hover:bg-coral hover:text-white transition-colors"
                    >
                      <IX size={13} /> Cancelar
                    </button>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* =============== CLUBE PET (FIDELIDADE) =============== */
export function LoyaltyPage() {
  usePageMeta(`Clube Pet | ${business.name}`, "Programa de relacionamento: pontos, benefícios e mimos de aniversário para seu pet.");
  const { loyaltyPoints, bookings, pets } = useStore();
  const completedBaths = bookings.filter((b) => b.status === "completed").length;
  const tier = loyaltyPoints >= 500 ? "Família" : loyaltyPoints >= 200 ? "Parceiro" : "Amigo";
  const nextTier = loyaltyPoints >= 500 ? null : loyaltyPoints >= 200 ? { name: "Família", at: 500 } : { name: "Parceiro", at: 200 };
  const progress = nextTier ? Math.min(100, Math.round((loyaltyPoints / nextTier.at) * 100)) : 100;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Programa de relacionamento</p>
      <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4.2vw,2.8rem)] text-ink mt-2">
        Clube Pet <span className="font-accent italic font-normal text-brand-deep">Amora</span>
      </h1>
      <p className="text-fog mt-2 text-[15px] max-w-xl">Cada compra vira ponto, cada banho vira carimbo. Sem economia complicada — só vantagens que fazem sentido.</p>

      <div className="mt-9 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="grid gap-5">
          <Reveal className="relative overflow-hidden bg-bark text-cream rounded-[26px] rounded-bl-[8px] p-7 sm:p-9">
            <PawBg />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-cream/65 font-display font-bold text-[12px] uppercase tracking-[0.2em]">Nível atual</p>
                <p className="font-display font-extrabold text-4xl mt-1 flex items-center gap-3">
                  {tier} <span className="w-10 h-10 grid place-items-center rounded-full bg-brand text-white"><IPaw size={20} /></span>
                </p>
                <p className="mt-3 text-[14px] text-cream/70">{loyaltyPoints} pontos acumulados · 1 ponto a cada R$ 10 em compras</p>
              </div>
              <div className="text-right">
                <p className="text-cream/65 font-display font-bold text-[12px] uppercase tracking-[0.2em]">Próximo nível</p>
                <p className="font-display font-extrabold text-2xl mt-1 text-brand">{nextTier ? nextTier.name : "Máximo ✦"}</p>
              </div>
            </div>
            {nextTier && (
              <div className="relative mt-6">
                <div className="h-3 rounded-full bg-cream/15 overflow-hidden">
                  <div className="h-full rounded-full bg-brand transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-[12.5px] text-cream/70">Faltam <strong className="text-cream">{nextTier.at - loyaltyPoints} pontos</strong> para virar {nextTier.name}.</p>
              </div>
            )}
          </Reveal>

          {/* cartela de banhos */}
          <Reveal delay={100} className="bg-white border border-line rounded-[26px] rounded-bl-[8px] p-7">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-ink text-lg flex items-center gap-2.5"><IBath size={20} className="text-brand" /> Cartela do banho</h2>
                <p className="text-fog text-[13.5px] mt-1">A cada 5 banhos concluídos, uma hidratação por nossa conta.</p>
              </div>
              <span className="font-display font-extrabold text-ink text-2xl">{Math.min(completedBaths, 5)}/5</span>
            </div>
            <div className="mt-5 flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`flex-1 aspect-square max-w-[72px] grid place-items-center rounded-full border-2 transition-all ${i < completedBaths ? "bg-brand border-brand text-white" : "border-dashed border-bark/25 text-bark/30"}`}>
                  {i < completedBaths ? <ICheck size={22} /> : <IPaw size={20} />}
                </span>
              ))}
            </div>
            {completedBaths >= 5 && (
              <p className="mt-4 bg-leaf/10 text-leaf-deep font-display font-bold text-[13.5px] rounded-[14px] px-4 py-3 flex items-center gap-2">
                <IGift size={17} /> Hidratação grátis desbloqueada! Mostre esta tela no próximo banho.
              </p>
            )}
          </Reveal>

          {/* benefícios */}
          <Reveal delay={180} className="bg-white border border-line rounded-[26px] rounded-bl-[8px] p-7">
            <h2 className="font-display font-bold text-ink text-lg flex items-center gap-2.5"><IGift size={20} className="text-brand" /> Benefícios por nível</h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {[
                { t: "Amigo", d: "Boas-vindas com 10% off na primeira compra e lembretes de banho.", pts: "0+ pts" },
                { t: "Parceiro", d: "Brinde surpresa no aniversário do pet e prioridade na agenda de sábado.", pts: "200+ pts" },
                { t: "Família", d: "Delivery grátis em qualquer pedido e banho de cortesia no mês do aniversário.", pts: "500+ pts" },
              ].map((b, i) => (
                <div key={b.t} className={`rounded-[18px] rounded-bl-[6px] p-5 border-[1.5px] ${tier === b.t ? "border-brand bg-brand/6" : "border-line"}`}>
                  <p className="font-display font-extrabold text-ink">{b.t}</p>
                  <p className="text-[11px] font-display font-bold uppercase tracking-wider text-brand-deep mt-0.5">{b.pts}</p>
                  <p className="text-[13px] text-fog mt-2.5 leading-relaxed">{b.d}</p>
                  {tier === b.t && <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-display font-bold text-brand-deep"><IStar size={12} /> seu nível</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* lateral */}
        <div className="grid gap-4">
          <Reveal delay={80} className="bg-sand rounded-[22px] rounded-bl-[6px] p-6">
            <h3 className="font-display font-bold text-ink flex items-center gap-2"><IPaw size={18} className="text-brand-deep" /> Pets no clube</h3>
            {pets.length === 0 ? (
              <p className="text-fog text-[13.5px] mt-2">Cadastre seus pets para participar das campanhas de aniversário.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {pets.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 bg-cream/80 rounded-[14px] px-3.5 py-2.5">
                    <span className={`w-9 h-9 grid place-items-center rounded-full text-white font-display font-extrabold ${p.species === "gatos" ? "bg-sea" : "bg-brand"}`}>{p.name[0]?.toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-ink text-[14px]">{p.name}</p>
                      <p className="text-[11.5px] text-fog">{p.birthDate ? `aniversário em ${new Date(p.birthDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}` : "adicione a data de nascimento"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Btn to="/meu-pet" variant="bark" size="sm" className="mt-4 w-full">{pets.length === 0 ? "Cadastrar pet" : "Gerenciar pets"}</Btn>
          </Reveal>

          <Reveal delay={160} className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
            <h3 className="font-display font-bold text-ink text-[15px]">Como ganhar pontos</h3>
            <ul className="mt-3 grid gap-2.5 text-[13.5px] text-fog">
              <li className="flex gap-2.5"><ICheck size={15} className="text-leaf shrink-0 mt-0.5" /> R$ 10 em compras = 1 ponto</li>
              <li className="flex gap-2.5"><ICheck size={15} className="text-leaf shrink-0 mt-0.5" /> Banho concluído = 20 pontos</li>
              <li className="flex gap-2.5"><ICheck size={15} className="text-leaf shrink-0 mt-0.5" /> Avaliação com foto = 15 pontos</li>
            </ul>
            <Link to="/produtos" className="mt-4 inline-flex items-center gap-1.5 font-display font-bold text-sm text-brand-deep hover:text-brand transition-colors">
              Ganhar pontos comprando <ITruck size={15} />
            </Link>
          </Reveal>

          <Reveal delay={240} className="bg-mint/40 border border-leaf/25 rounded-[22px] rounded-bl-[6px] p-6">
            <p className="text-[12.5px] text-leaf-deep leading-relaxed">
              <strong>Combinado?</strong> Enviamos lembretes e campanhas só com seu consentimento, e você pode sair do clube quando quiser (LGPD).
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

function PawBg() {
  return (
    <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="#FFF8F0" className="absolute w-14 h-14" style={{ left: `${(i * 137) % 95}%`, top: `${(i * 61) % 85}%`, transform: `rotate(${(i * 47) % 360}deg)` }}>
          <ellipse cx="12" cy="15.6" rx="4.8" ry="3.9" /><ellipse cx="5.4" cy="10.6" rx="2" ry="2.6" transform="rotate(-16 5.4 10.6)" /><ellipse cx="18.6" cy="10.6" rx="2" ry="2.6" transform="rotate(16 18.6 10.6)" /><ellipse cx="9.3" cy="6.2" rx="2" ry="2.6" /><ellipse cx="14.7" cy="6.2" rx="2" ry="2.6" />
        </svg>
      ))}
    </div>
  );
}
