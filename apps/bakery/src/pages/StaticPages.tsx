import { Link, useParams } from "react-router-dom";
import { useApp } from "../core/store";
import { formatBRL, isOpenNow, track, useSEO, waLink } from "../core/utils";
import ChannelHub from "../components/ChannelHub";
import { OpeningHours } from "../components/Footer";
import { IArrow, IBike, ICheck, IChevron, IPin, IRoute, IWhatsApp, IClock, INote, IAlert, IFlame } from "../components/icons";

/* ================= SOBRE ================= */
export function Sobre() {
  const { business } = useApp();
  useSEO(`Nossa casa | ${business.name}`);
  return (
    <main className="min-h-screen bg-bg pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-accent">
          <span className="h-px w-8 bg-accent" /> nossa casa
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl font-medium leading-[1.02] text-paper md:text-7xl">
          Um forno, um levain<br />e a teimosia de <em className="text-accent">não ter pressa.</em>
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="space-y-5 text-[15.5px] leading-relaxed text-dim">
            <p>
              A {business.name} abriu em {business.founded} com uma certeza: pão bom não aceita atalho.
              O levain — a Dona Clara — veio de uma padaria de bairro que fechava as portas, e segue
              sendo alimentado duas vezes ao dia, desde então.
            </p>
            <p>
              A farinha chega orgânica e é moída em pedra. A manteiga é francesa, os ovos são caipiras
              e o café vem de microlotes que a gente visita na colheita. Nada entra na vitrine sem ter
              sido feito aqui dentro.
            </p>
            <p>
              O balcão é de peroba de demolição, o forno é de lastro e o cheiro às seis da manhã é o
              nosso letreiro. O resto é conversa boa com quem chega.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {business.stats.map((s) => (
                <div key={s.label} className="rounded-[var(--radius)] border border-line bg-surface/60 p-4 text-center">
                  <p className="font-display text-3xl font-semibold text-accent">{s.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[calc(var(--radius)*1.2)]">
              <img src={business.media.story} alt="Padeiro preparando massa" className="aspect-[4/5] w-full object-cover" loading="lazy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-[var(--radius)]"><img src={business.media.counter} alt="Balcão da padaria" className="aspect-[4/3] w-full object-cover" loading="lazy" /></div>
              <div className="overflow-hidden rounded-[var(--radius)]"><img src={business.media.hero} alt="Forno da padaria" className="aspect-[4/3] w-full object-cover" loading="lazy" /></div>
            </div>
          </div>
        </div>

        {/* LGPD */}
        <section id="lgpd" className="mt-20 rounded-[calc(var(--radius)*1.2)] border border-line bg-surface/50 p-7 md:p-10">
          <h2 className="font-display text-3xl font-medium text-paper">Privacidade, do jeito simples.</h2>
          <div className="mt-5 grid gap-6 text-[14px] leading-relaxed text-dim md:grid-cols-3">
            <p><strong className="text-paper">Coleta mínima.</strong> Guardamos apenas o que o pedido precisa: nome, contato e endereço de entrega. Nada de perfil escondido.</p>
            <p><strong className="text-paper">Finalidade clara.</strong> Os dados servem para preparar, entregar e avisar sobre o seu pedido — e só. Sem repasse a terceiros.</p>
            <p><strong className="text-paper">Você no comando.</strong> Quer ver, corrigir ou apagar seus dados? Fale com {business.contact.email} e resolvemos em até 15 dias, como manda a LGPD.</p>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-3.5">
          <Link to="/produtos" className="btn btn-primary">{business.cta.primary} <IArrow size={17} /></Link>
          <Link to="/contato" className="btn btn-ghost">Como chegar</Link>
        </div>
      </div>
    </main>
  );
}

/* ================= CONTATO / LOCALIZAÇÃO ================= */
export function Contato() {
  const { business } = useApp();
  useSEO(`Contato e localização | ${business.name}`);
  const open = isOpenNow(business.openingHours);
  const a = business.address;

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const msg = `Olá, ${business.name}!\n\nNome: ${fd.get("nome")}\nContato: ${fd.get("contato")}\n\n${fd.get("mensagem")}`;
    track("contact_send");
    window.open(waLink(business.integrations.whatsapp.number || business.contact.whatsapp, msg), "_blank");
    e.currentTarget.reset();
  };

  return (
    <main className="min-h-screen bg-bg pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-accent">
          <span className="h-px w-8 bg-accent" /> contato & rota
        </p>
        <h1 className="font-display mt-4 max-w-2xl text-5xl font-medium leading-[1.02] text-paper md:text-7xl">
          A porta está <em className="text-accent">aberta.</em>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-[calc(var(--radius)*1.2)] border border-line">
            <iframe
              title={`Mapa — ${business.name}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${a.lng - 0.014},${a.lat - 0.01},${a.lng + 0.014},${a.lat + 0.01}&layer=mapnik&marker=${a.lat},${a.lng}`}
              className="h-[420px] w-full lg:h-full lg:min-h-[540px]"
              loading="lazy"
            />
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <p className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent"><IPin size={15} /> endereço</p>
              <p className="mt-2.5 text-[15px] leading-relaxed text-paper">{a.street}, {a.number} — {a.district}<br />{a.city}/{a.state} · CEP {a.zip}</p>
              <a href={a.mapsUrl} target="_blank" rel="noreferrer" onClick={() => track("view_location", { from: "contato" })} className="btn btn-primary mt-4 !py-3 text-[13.5px]">
                <IRoute size={17} /> {business.cta.location}
              </a>
            </div>

            <div className="rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <p className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent"><IClock size={15} /> horários</p>
              <p className="mt-2 flex items-center gap-2 text-[13px] font-bold">
                <span className={`h-2 w-2 rounded-full ${open.open ? "bg-emerald-400 pulse-dot" : "bg-terra"}`} />
                <span className={open.open ? "text-accent" : "text-terra"}>{open.label}</span>
              </p>
              <div className="mt-3"><OpeningHours /></div>
            </div>

            <div className="rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <p className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent"><IBike size={15} /> entrega & retirada</p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-dim">
                Delivery {business.delivery.time} · {formatBRL(business.delivery.fee)} (grátis acima de {formatBRL(business.delivery.freeAbove)}).<br />
                Retirada: {business.pickup.units.map((u) => u.name).join(" · ")}.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-medium text-paper md:text-4xl">Fale com a casa.</h2>
            <form onSubmit={send} className="mt-6 space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <input name="nome" required placeholder="Seu nome" className="field" aria-label="Nome" />
                <input name="contato" required placeholder="WhatsApp ou e-mail" className="field" aria-label="Contato" />
              </div>
              <textarea name="mensagem" required rows={4} placeholder="Como podemos ajudar?" className="field resize-none" aria-label="Mensagem" />
              <button type="submit" className="btn btn-primary !py-3.5 text-[14px]"><IWhatsApp size={18} /> Enviar pelo WhatsApp</button>
              <p className="text-[12px] text-dim">Ou direto: {business.contact.email} · {business.contact.phone}</p>
            </form>
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium text-paper md:text-4xl">Ou peça por aqui.</h2>
            <div className="mt-6"><ChannelHub /></div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================= MEUS PEDIDOS ================= */
export function MeusPedidos() {
  const { orders, business } = useApp();
  useSEO(`Meus pedidos | ${business.name}`);

  return (
    <main className="light-section min-h-screen px-4 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-terra">
          <span className="h-px w-8 bg-terra" /> seus pedidos
        </p>
        <h1 className="font-display mt-4 text-5xl font-medium md:text-6xl">Do forno<br />para o seu histórico.</h1>

        {orders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-[var(--radius)] border border-dashed border-ink/20 py-16 text-center">
            <INote size={40} className="text-terra/60" />
            <p className="font-display mt-4 text-2xl">Nenhum pedido ainda.</p>
            <p className="mt-1.5 text-[14px] text-inksoft">O primeiro a gente nunca esquece — nem a padaria.</p>
            <Link to="/produtos" className="btn btn-dark mt-6">{business.cta.primary}</Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-3.5">
            {orders.map((o) => (
              <li key={o.code}>
                <Link to={`/pedido/${o.code}`} className="group flex items-center gap-4 rounded-[var(--radius)] border border-ink/10 bg-flour p-4.5 p-5 transition-all hover:-translate-y-0.5 hover:border-terra/50 hover:shadow-[0_18px_36px_-22px_rgba(60,35,15,0.45)]">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[15.5px] font-extrabold">{o.code}</span>
                      <StatusBadge status={o.status} />
                    </p>
                    <p className="mt-1 text-[12.5px] text-inksoft">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {o.items.reduce((s, i) => s + i.qty, 0)} itens · {o.fulfillment === "delivery" ? "entrega" : "retirada"}
                    </p>
                  </div>
                  <span className="text-[16px] font-extrabold text-terra">{formatBRL(o.total)}</span>
                  <IChevron size={17} className="text-inksoft transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    "Novo": "bg-wheat/25 text-ink",
    "Confirmado": "bg-wheat/40 text-ink",
    "Preparando": "bg-caramel/30 text-ink",
    "Pronto": "bg-terra/20 text-terra",
    "Saiu para entrega": "bg-terra/30 text-terra",
    "Entregue": "bg-emerald-700/15 text-emerald-800",
    "Cancelado": "bg-ink/10 text-inksoft",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider ${tones[status] ?? "bg-ink/10"}`}>{status}</span>;
}

/* ================= DETALHE DO PEDIDO ================= */
const TIMELINE = ["Novo", "Confirmado", "Preparando", "Pronto", "Saiu para entrega", "Entregue"];

export function PedidoDetalhe() {
  const { code } = useParams<{ code: string }>();
  const { orders, business } = useApp();
  const order = orders.find((o) => o.code === code);
  useSEO(order ? `Pedido ${order.code} | ${business.name}` : `Pedido | ${business.name}`);

  if (!order) {
    return (
      <main className="light-section flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <IAlert size={40} className="text-terra" />
        <h1 className="font-display mt-5 text-4xl">Pedido não encontrado.</h1>
        <p className="mt-2 text-inksoft">Confira o código ou veja seu histórico.</p>
        <Link to="/meus-pedidos" className="btn btn-dark mt-7">Meus pedidos</Link>
      </main>
    );
  }

  const steps = order.fulfillment === "pickup" ? TIMELINE.slice(0, 4) : TIMELINE;
  const idx = order.status === "Cancelado" ? -1 : steps.indexOf(order.status);
  const waMsg = `Olá, ${business.name}! Gostaria de acompanhar meu pedido *${order.code}*.`;

  return (
    <main className="light-section min-h-screen px-4 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/meus-pedidos" className="u-link text-[13px] font-bold text-inksoft">← meus pedidos</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-5xl font-medium">{order.code}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-2 text-[14px] text-inksoft">
          {new Date(order.createdAt).toLocaleString("pt-BR")} · {order.schedule} · {order.payment}
        </p>

        {order.status === "Cancelado" ? (
          <p className="mt-8 rounded-[var(--radius)] border border-terra/30 bg-terra/10 p-5 text-[14px] font-semibold text-terra">
            Este pedido foi cancelado. Fale com a casa se precisar de ajuda.
          </p>
        ) : (
          <ol className="mt-9 space-y-0">
            {steps.map((s, i) => {
              const done = i <= idx;
              const current = i === idx;
              return (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all ${done ? "border-terra bg-terra text-flour" : "border-ink/20 text-inksoft"}`}>
                      {done ? <ICheck size={14} /> : <IFlame size={13} className={current ? "text-terra" : ""} />}
                    </span>
                    {i < steps.length - 1 && <span className={`w-0.5 flex-1 ${i < idx ? "bg-terra" : "bg-ink/12"}`} style={{ minHeight: 28 }} />}
                  </div>
                  <p className={`pb-7 pt-1.5 text-[14.5px] font-extrabold ${done ? "text-ink" : "text-inksoft/60"}`}>
                    {s} {current && <span className="ml-1 text-[11px] font-bold uppercase tracking-wider text-terra">· agora</span>}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 rounded-[var(--radius)] border border-ink/10 bg-flour p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-terra">Itens</p>
          <ul className="mt-3 space-y-2">
            {order.items.map((i) => (
              <li key={i.key} className="flex items-center justify-between gap-4 text-[14px]">
                <span className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span><strong>{i.qty}x</strong> {i.name}{i.note && <em className="block text-[12px] text-inksoft">obs: {i.note}</em>}</span>
                </span>
                <span className="font-bold">{formatBRL((i.unitBase + i.variations.reduce((s, v) => s + v.delta, 0) + i.extras.reduce((s, e) => s + e.price, 0)) * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-3.5 text-[13.5px]">
            {order.discount > 0 && <div className="flex justify-between text-terra"><dt>Desconto{order.coupon ? ` (${order.coupon})` : ""}</dt><dd>−{formatBRL(order.discount)}</dd></div>}
            <div className="flex justify-between text-inksoft"><dt>Entrega</dt><dd>{order.deliveryFee === 0 ? "grátis" : formatBRL(order.deliveryFee)}</dd></div>
            <div className="flex justify-between text-[16px] font-extrabold"><dt>Total</dt><dd className="text-terra">{formatBRL(order.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {business.integrations.whatsapp.enabled && (
            <a href={waLink(business.integrations.whatsapp.number || business.contact.whatsapp, waMsg)} target="_blank" rel="noreferrer" className="btn btn-dark !py-3.5 text-[14px]">
              <IWhatsApp size={18} /> Falar sobre este pedido
            </a>
          )}
          <Link to="/produtos" className="btn !border !border-ink/20 !text-ink hover:!bg-ink hover:!text-flour">Pedir de novo</Link>
        </div>
      </div>
    </main>
  );
}
